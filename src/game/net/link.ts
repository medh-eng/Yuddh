/* ============================================================
   Two-phone play: a peer-to-peer link (WebRTC data channel) with no
   game server. The two phones swap one short "code" each, by QR code
   or by pasting text (WhatsApp, SMS...): the host's code carries its
   WebRTC offer, the guest's reply carries the answer. After that the
   phones talk directly. A public STUN server (Google's) helps them
   find each other across NATs; on one WiFi they usually connect
   without it. Over a strict firewall or a symmetric NAT the link can
   fail; there is no relay.
   window.__yuddhIce overrides the ICE servers (tests use []).
   ============================================================ */
import type { Action } from '../../engine';

export type NetMsg =
  | { t: 'hello'; faction: string }
  | { t: 'start'; seed: number; host: string; guest: string; ground: string }
  | { t: 'act'; a: Action; h: string }
  | { t: 'bye' };

export interface Link {
  role: 'host' | 'guest';
  send(m: NetMsg): void;
  onMessage(fn: (m: NetMsg) => void): void;
  /** the game's own handler: gets everything that arrived since the link opened and has not been taken yet */
  setHandler(fn: ((m: NetMsg) => void) | null): void;
  onClose(fn: () => void): void;
  close(): void;
  readonly open: boolean;
}

/** STUN finds each phone's public address; the TURN entries are a best-effort public relay for networks where a direct link is impossible (mobile-data carrier NAT, strict firewalls). A relay is a free third-party service: if it is down, the phones simply connect directly or not at all. */
export const DEFAULT_ICE: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
  { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turns:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' }
];
const iceServers = (): RTCIceServer[] => (window as unknown as { __yuddhIce?: RTCIceServer[] }).__yuddhIce ?? DEFAULT_ICE;

/* ---------------- codes ---------------- */
const b64 = (u: Uint8Array): string => { let s = ''; u.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = (t: string): Uint8Array => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };

/** an address a phone on another network could actually reach: not link-local (fe80), not a unique-local IPv6 (fc/fd) */
const reachable = (addr: string): boolean => !/^(fe80|f[cd][0-9a-f]{2}):/i.test(addr);

/** Keep only what a data channel needs, in an order that never loses the useful ones: UDP only; at most 2 host
    candidates (an mDNS name, a private IPv4 or a global IPv6), then every server-reflexive one (the public address),
    then relays. The old filter dropped all IPv6 and kept the first four lines, so on an IPv6-first mobile network
    (Jio, Airtel) or a phone with several interfaces the public address could be cut and the link could not form. */
export function slim(sdp: string): string {
  const lines = sdp.split(/\r?\n/).filter(Boolean);
  const rank = (l: string): number => (/ typ relay/.test(l) ? 2 : / typ srflx/.test(l) ? 1 : 0);
  const cand = lines.filter(l => {
    if (!l.startsWith('a=candidate:')) return false;
    const f = l.split(' ');
    return (f[2] ?? '').toLowerCase() === 'udp' && reachable(f[4] ?? '');
  });
  const per = [0, 0, 0], cap = [2, 3, 2];
  const keep = new Set(cand.filter(l => per[rank(l)]++ < cap[rank(l)]));
  const ordered = [...keep].sort((x, y) => rank(x) - rank(y));
  const out: string[] = [];
  let placed = false;
  for (const l of lines) {
    if (!l.startsWith('a=candidate:')) { out.push(l); continue; }
    if (!placed) { out.push(...ordered); placed = true; }
  }
  return out.join('\r\n') + '\r\n';
}

/** what a code carries, for the "could not connect" message: how many candidates of each kind */
export function describeCandidates(sdp: string): string {
  const c = sdp.split(/\r?\n/).filter(l => l.startsWith('a=candidate:'));
  const n = (re: RegExp): number => c.filter(l => re.test(l)).length;
  return `${n(/ typ host/)} local, ${n(/ typ srflx/)} public, ${n(/ typ relay/)} relay, ${c.filter(l => (l.split(' ')[4] ?? '').includes(':')).length} IPv6`;
}

export async function pack(d: { type: string; sdp: string }): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify({ t: d.type === 'offer' ? 'o' : 'a', s: slim(d.sdp) }));
  if (typeof CompressionStream !== 'undefined') {
    const out = new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    return `Y1.${b64(out)}`;
  }
  return `Y0.${b64(bytes)}`;
}

export async function unpack(code: string): Promise<{ type: 'offer' | 'answer'; sdp: string }> {
  const c = code.replace(/\s+/g, '');
  const m = /^Y([01])\.([A-Za-z0-9_-]+)$/.exec(c);
  if (!m) throw new Error('That is not a YUDDH code.');
  let bytes = unb64(m[2]);
  if (m[1] === '1') {
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot read that code.');
    bytes = new Uint8Array(await new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  }
  const j = JSON.parse(new TextDecoder().decode(bytes)) as { t: string; s: string };
  return { type: j.t === 'o' ? 'offer' : 'answer', sdp: j.s };
}

/* ---------------- the link ---------------- */
function wrap(role: 'host' | 'guest', pc: RTCPeerConnection, dc: RTCDataChannel): Link {
  const listeners: ((m: NetMsg) => void)[] = [], closers: (() => void)[] = [];
  let main: ((m: NetMsg) => void) | null = null;
  const pending: NetMsg[] = [];
  let closed = false;
  const fireClose = () => { if (closed) return; closed = true; closers.forEach(f => f()); };
  dc.onmessage = e => { try { const m = JSON.parse(String(e.data)) as NetMsg; listeners.forEach(f => f(m)); if (main) main(m); else pending.push(m); } catch { /* ignore garbage */ } };
  dc.onclose = fireClose;
  pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed' || pc.connectionState === 'disconnected') fireClose(); };
  return {
    role,
    get open() { return !closed && dc.readyState === 'open'; },
    send: m => { if (dc.readyState === 'open') dc.send(JSON.stringify(m)); },
    onMessage: fn => { listeners.push(fn); },
    setHandler: fn => { main = fn; if (fn) pending.splice(0).forEach(fn); },
    onClose: fn => { closers.push(fn); },
    close: () => { try { if (dc.readyState === 'open') dc.send(JSON.stringify({ t: 'bye' })); } catch { /* gone */ } closed = true; try { dc.close(); pc.close(); } catch { /* gone */ } }
  };
}

const gathered = (pc: RTCPeerConnection, ms: number): Promise<void> => new Promise(res => {
  if (pc.iceGatheringState === 'complete') return res();
  const done = () => { pc.removeEventListener('icegatheringstatechange', ch); clearTimeout(t); res(); };
  const ch = () => { if (pc.iceGatheringState === 'complete') done(); };
  const t = setTimeout(done, ms);
  pc.addEventListener('icegatheringstatechange', ch);
});

const opened = (dc: RTCDataChannel): Promise<void> => new Promise((res, rej) => {
  if (dc.readyState === 'open') return res();
  dc.onopen = () => res();
  dc.onerror = () => rej(new Error('The connection failed.'));
});

/** host, step 1: make the offer code to show or send */
export async function hostOffer(): Promise<{ code: string; connect(answerCode: string): Promise<Link>; cancel(): void }> {
  const pc = new RTCPeerConnection({ iceServers: iceServers() });
  const dc = pc.createDataChannel('yuddh', { ordered: true });
  const link = wrap('host', pc, dc);   // listening from the start: the guest's hello can arrive the moment the channel opens
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc, 3500);
  const code = await pack(pc.localDescription as RTCSessionDescription);
  return {
    code,
    cancel: () => { try { pc.close(); } catch { /* gone */ } },
    async connect(answerCode: string) {
      const a = await unpack(answerCode);
      if (a.type !== 'answer') throw new Error('That is a host code. Paste your friend\'s reply code here.');
      await pc.setRemoteDescription({ type: 'answer', sdp: a.sdp });
      await Promise.race([opened(dc), new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`Could not connect (${pc.iceConnectionState}). On mobile data the two phones often cannot reach each other directly: try both on the same WiFi, or switch one phone on to the other's hotspot. This code carried: ${describeCandidates(pc.localDescription?.sdp ?? '')}.`)), 30000))]);
      return link;
    }
  };
}

/** guest: read the host's code, make the reply code, then wait for the link */
export async function guestAnswer(offerCode: string): Promise<{ code: string; link: Promise<Link>; cancel(): void }> {
  const o = await unpack(offerCode);
  if (o.type !== 'offer') throw new Error('That is a reply code. Paste the host\'s code here.');
  const pc = new RTCPeerConnection({ iceServers: iceServers() });
  const dcP = new Promise<RTCDataChannel>(res => { pc.ondatachannel = e => res(e.channel); });
  await pc.setRemoteDescription({ type: 'offer', sdp: o.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc, 3500);
  const code = await pack(pc.localDescription as RTCSessionDescription);
  const link = (async () => {
    const dc = await Promise.race([dcP, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`Could not connect (${pc.iceConnectionState}). Ask the host to try again, ideally on the same WiFi. This code carried: ${describeCandidates(pc.localDescription?.sdp ?? '')}.`)), 60000))]);
    await opened(dc);
    return wrap('guest', pc, dc);
  })();
  return { code, link, cancel: () => { try { pc.close(); } catch { /* gone */ } } };
}
