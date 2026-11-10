/* ============================================================
   Two-phone play, step 2: the pairing screen (plain DOM over the
   canvas, so text can be pasted and the camera can scan).
   Host: shows a code (QR + text), then takes the guest's reply code.
   Guest: takes the host's code, shows a reply code, waits.
   Then a tiny handshake: the guest says hello with its faction; the
   host answers with the seed, both factions and the battlefield.
   Needs no server. window.__yuddhPair exposes the codes for tests.
   ============================================================ */
import { hostOffer, guestAnswer, type Link, type NetMsg } from './link';
import { FACTIONS, factionById, type Faction } from '../../campaign/duel';

export interface Paired { link: Link; role: 'host' | 'guest'; a: Faction; b: Faction; seed: number; ground: string }

const css = `
#yp{position:fixed;inset:0;z-index:50;background:rgba(7,4,2,.96);color:#f1e3c0;font-family:'Alegreya Sans',sans-serif;display:flex;align-items:center;justify-content:center;overflow:auto;-webkit-user-select:text;user-select:text}
#yp .box{width:min(760px,94vw);padding:18px 22px;text-align:center}
#yp h1{font-family:Cinzel,serif;font-size:clamp(22px,4.4vh,40px);margin:0 0 6px;color:#f7e7b4;letter-spacing:2px}
#yp p{margin:6px 0;font-size:clamp(15px,2.6vh,20px);line-height:1.35}
#yp .row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0}
#yp button{font-family:Cinzel,serif;font-weight:700;font-size:clamp(14px,2.4vh,19px);padding:10px 22px;border-radius:8px;border:2px solid #b8893a;background:#3a2410;color:#f7e7b4;cursor:pointer}
#yp button.pri{background:#8a5a14}
#yp button:disabled{opacity:.45}
#yp textarea{width:100%;box-sizing:border-box;height:clamp(54px,12vh,100px);background:#140b05;color:#f1e3c0;border:1px solid #b8893a;border-radius:6px;font-size:12px;word-break:break-all;padding:6px}
#yp img.qr{width:clamp(130px,30vh,250px);height:auto;background:#fff;padding:6px;border-radius:6px}
#yp video{width:min(320px,70vw);border-radius:8px;border:2px solid #b8893a}
#yp .st{min-height:1.4em;color:#e0b25a;font-style:italic}
#yp .er{color:#ff9a86}
`;

export function pairing(me: Faction, done: (p: Paired) => void, cancel: () => void): void {
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const root = document.createElement('div'); root.id = 'yp'; document.body.appendChild(root);
  let closer: (() => void) | null = null;
  let finished = false;
  const close = (): void => { try { closer?.(); } catch { /* ignore */ } stopScan(); root.remove(); st.remove(); delete (window as unknown as { __yuddhPair?: unknown }).__yuddhPair; };
  const leave = (): void => { if (!finished) { close(); cancel(); } };
  const el = (html: string): HTMLElement => { root.innerHTML = `<div class="box">${html}</div>`; return root.firstElementChild as HTMLElement; };
  const $ = <T extends HTMLElement>(sel: string): T => root.querySelector(sel) as T;
  const hook = (v: Record<string, unknown>): void => { (window as unknown as { __yuddhPair: unknown }).__yuddhPair = v; };

  /* ---- camera scan ---- */
  let stream: MediaStream | null = null, scanning = false;
  function stopScan(): void { scanning = false; stream?.getTracks().forEach(t => t.stop()); stream = null; root.querySelector('video')?.remove(); }
  async function scan(into: HTMLTextAreaElement, then: () => void): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) { msg('This browser cannot use the camera here. Paste the code instead.', true); return; }
    try {
      const jsQR = (await import('jsqr')).default;
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const v = document.createElement('video'); v.srcObject = stream; v.setAttribute('playsinline', ''); v.muted = true;
      $('.cam').appendChild(v); await v.play();
      const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true })!;
      scanning = true;
      const tick = (): void => {
        if (!scanning) return;
        if (v.videoWidth) {
          cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0);
          const r = jsQR(cx.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
          if (r?.data && /^Y[01]\./.test(r.data)) { into.value = r.data; stopScan(); then(); return; }
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch { msg('Could not open the camera. Paste the code instead.', true); }
  }
  function msg(t: string, err = false): void { const s = root.querySelector('.st'); if (s) { s.textContent = t; s.classList.toggle('er', err); } }

  async function qr(code: string): Promise<string> {
    const Q = await import('qrcode');
    return Q.toDataURL(code, { errorCorrectionLevel: 'L', margin: 1, width: 360 });
  }
  const share = async (code: string): Promise<void> => {
    try { if (navigator.share) { await navigator.share({ text: code }); return; } } catch { return; }
    try { await navigator.clipboard.writeText(code); msg('Code copied. Paste it into a message.'); } catch { msg('Select the code and copy it.'); }
  };

  /* ---- first screen ---- */
  function home(): void {
    el(`<h1>TWO PHONES</h1><p>You play <b>${me.name}</b>. Both phones need an internet connection (or the same WiFi). One of you hosts, the other joins. No account, no server: you trade two short codes.</p>
      <div class="row"><button class="pri" id="h">Host a game</button><button class="pri" id="j">Join a game</button></div>
      <div class="row"><button id="b">Back</button></div>`);
    $('#h').onclick = () => void host(); $('#j').onclick = () => joinStart(); $('#b').onclick = leave;
  }

  /* ---- host ---- */
  async function host(): Promise<void> {
    el(`<h1>HOST</h1><p class="st">Making your code…</p>`);
    let off;
    try { off = await hostOffer(); } catch (e) { msg(String((e as Error).message), true); return; }
    closer = off.cancel;
    const img = await qr(off.code).catch(() => '');
    el(`<h1>HOST</h1><p>1. Let your friend scan this, or send them the code.</p>
      ${img ? `<img class="qr" src="${img}">` : ''}
      <textarea id="mine" readonly>${off.code}</textarea>
      <div class="row"><button id="sh">Send / copy code</button></div>
      <p>2. Then paste or scan the reply code from their phone.</p>
      <textarea id="reply" placeholder="Reply code (starts with Y1.)"></textarea><div class="cam"></div>
      <div class="row"><button id="sc">Scan reply</button><button class="pri" id="go">Connect</button><button id="b">Back</button></div><p class="st"></p>`);
    const reply = $<HTMLTextAreaElement>('#reply');
    const connect = async (): Promise<void> => {
      $<HTMLButtonElement>('#go').disabled = true; msg('Connecting…');
      try {
        const link = await off.connect(reply.value);
        msg('Connected. Starting…');
        const hello = await waitFor(link, m => m.t === 'hello', 8000) as Extract<NetMsg, { t: 'hello' }>;
        const them = factionById(hello.faction) ?? FACTIONS[0];
        const seed = Math.floor(Math.random() * 1e9);
        const ground = Math.random() < 0.5 ? me.ground : them.ground;
        link.send({ t: 'start', seed, host: me.id, guest: them.id, ground });
        finished = true; closer = null; close(); done({ link, role: 'host', a: me, b: them, seed, ground });
      } catch (e) { msg(String((e as Error).message), true); $<HTMLButtonElement>('#go').disabled = false; }
    };
    $('#sh').onclick = () => void share(off.code);
    $('#go').onclick = () => void connect();
    $('#sc').onclick = () => void scan(reply, () => void connect());
    $('#b').onclick = leave;
    hook({ hostCode: off.code, reply: (c: string) => { reply.value = c; void connect(); } });
  }

  /* ---- guest ---- */
  function joinStart(): void {
    el(`<h1>JOIN</h1><p>Scan the host's QR code, or paste the code they sent you.</p>
      <textarea id="their" placeholder="Host code (starts with Y1.)"></textarea><div class="cam"></div>
      <div class="row"><button id="sc">Scan code</button><button class="pri" id="go">Continue</button><button id="b">Back</button></div><p class="st"></p>`);
    const their = $<HTMLTextAreaElement>('#their');
    const go = async (): Promise<void> => {
      $<HTMLButtonElement>('#go').disabled = true; msg('Making your reply…');
      try {
        const ans = await guestAnswer(their.value);
        closer = ans.cancel;
        const img = await qr(ans.code).catch(() => '');
        el(`<h1>JOIN</h1><p>Show this to the host, or send it to them. Keep this screen open.</p>
          ${img ? `<img class="qr" src="${img}">` : ''}
          <textarea readonly>${ans.code}</textarea>
          <div class="row"><button id="sh">Send / copy code</button><button id="b">Back</button></div><p class="st">Waiting for the host to connect…</p>`);
        $('#sh').onclick = () => void share(ans.code); $('#b').onclick = leave;
        hook({ guestCode: ans.code });
        const link = await ans.link;
        link.send({ t: 'hello', faction: me.id });
        msg('Connected. Waiting for the host to start…');
        const start = await waitFor(link, m => m.t === 'start', 15000) as Extract<NetMsg, { t: 'start' }>;
        const a = factionById(start.host) ?? FACTIONS[0], b = factionById(start.guest) ?? me;
        finished = true; closer = null; close(); done({ link, role: 'guest', a, b, seed: start.seed, ground: start.ground });
      } catch (e) { msg(String((e as Error).message), true); }
    };
    $('#go').onclick = () => void go();
    $('#sc').onclick = () => void scan(their, () => void go());
    $('#b').onclick = leave;
    hook({ join: (c: string) => { their.value = c; void go(); } });
  }

  home();
}

/** the next message matching `ok`, within ms */
function waitFor(link: Link, ok: (m: NetMsg) => boolean, ms: number): Promise<NetMsg> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('The other phone did not answer. Try again.')), ms);
    link.setHandler(m => { if (ok(m)) { clearTimeout(t); link.setHandler(null); res(m); } });
    link.onClose(() => { clearTimeout(t); rej(new Error('The connection closed.')); });
  });
}
