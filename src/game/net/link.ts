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

const iceServers = (): RTCIceServer[] => (window as unknown as { __yuddhIce?: RTCIceServer[] }).__yuddhIce ?? [{ urls: 'stun:stun.l.google.com:19302' }];

/* ---------------- codes ---------------- */
const b64 = (u: Uint8Array): string => { let s = ''; u.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = (t: string): Uint8Array => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };

/** keep only what a data channel needs: UDP candidates on IPv4 or mDNS names, at most four */
export function slim(sdp: string): string {
  const lines = sdp.split(/\r?\n/).filter(Boolean);
  let kept = 0;
  const out = lines.filter(l => {
    if (!l.startsWith('a=candidate:')) return true;
    const f = l.split(' ');
    const addr = f[4] ?? '';
    if ((f[2] ?? '').toLowerCase() !== 'udp' || addr.includes(':')) return false;
    return kept++ < 4;
  });
  return out.join('\r\n') + '\r\n';
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
      await Promise.race([opened(dc), new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Could not connect. Check both phones are online and try again.')), 25000))]);
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
    const dc = await Promise.race([dcP, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Could not connect. Ask the host to try again.')), 60000))]);
    await opened(dc);
    return wrap('guest', pc, dc);
  })();
  return { code, link, cancel: () => { try { pc.close(); } catch { /* gone */ } } };
}
