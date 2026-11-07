/* ============================================================
   Art manifest. Card paintings live in public/assets/cards/<id>.webp
   (made by `npm run assets` from Pon's masters). A card listed here
   shows its painting; any other card falls back to the placeholder.

   Paintings load on demand: each scene asks for the ones it needs
   (a battle loads its two decks, the gallery one empire at a time),
   so the game starts without downloading every painting first.
   ============================================================ */
import { Assets, Texture } from 'pixi.js';

import delivered from './card-art.json';

/** ids of paintings that have been delivered (written by scripts/convert-assets.mjs) */
export const CARD_ART: string[] = delivered as string[];
const HAS = new Set(CARD_ART);

const BASE = import.meta.env.BASE_URL;
const images = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<void>>();
const textures = new Map<string, Texture>();

export const hasArt = (id: string): boolean => HAS.has(id);

/** the decoded painting, once loaded */
export const artImage = (id: string): HTMLImageElement | undefined => images.get(id);

/** callbacks waiting for a painting that was not ready when a face was drawn */
const waiting = new Map<string, Array<() => void>>();
/** run `cb` once the painting for `id` has loaded (at once if it already has) */
export function whenArt(id: string, cb: () => void): void {
  if (images.has(id)) { cb(); return; }
  const l = waiting.get(id) ?? [];
  l.push(cb); waiting.set(id, l);
}

const RETRIES = 5;
/** one painting: retried with a growing pause (phones on a weak connection drop requests), decoded before use */
function fetchOne(id: string): Promise<void> {
  return new Promise<void>(res => {
    let tries = 0;
    const attempt = (): void => {
      const img = new Image();
      let over = false;
      // a request that neither succeeds nor fails would hold the whole screen: give up on it after a while
      const stall = setTimeout(() => { if (over) return; over = true; img.onload = img.onerror = null; img.src = ''; retry(); }, 15000);
      const retry = (): void => {
        if (++tries > RETRIES) { pending.delete(id); res(); return; }
        setTimeout(attempt, 400 * tries);
      };
      img.onload = () => {
        if (over) return; over = true; clearTimeout(stall);
        const done = (): void => {
          images.set(id, img);
          for (const cb of waiting.get(id) ?? []) { try { cb(); } catch { /* a stale view */ } }
          waiting.delete(id);
          res();
        };
        // decode now, so the first canvas draw never meets a half-ready image
        if (img.decode) img.decode().then(done, done); else done();
      };
      img.onerror = () => { if (over) return; over = true; clearTimeout(stall); retry(); };
      img.src = `${BASE}assets/cards/${id}.webp`;
    };
    attempt();
  });
}

/** at most this many paintings in flight at once: forty at a time overwhelmed phones */
const MAX_PARALLEL = 6;
let active = 0;
const queue: Array<() => void> = [];
function limited(id: string): Promise<void> {
  return new Promise<void>(res => {
    const run = (): void => {
      active++;
      void fetchOne(id).then(() => { active--; res(); queue.shift()?.(); });
    };
    if (active < MAX_PARALLEL) run(); else queue.push(run);
  });
}

/** wait for `p`, but never longer than `ms`: a slow painting must not keep a screen blank */
export const orTimeout = (p: Promise<unknown>, ms: number): Promise<unknown> =>
  Promise.race([p, new Promise(r => setTimeout(r, ms))]);

/** load these paintings (ids without a painting are skipped); resolves when all are ready */
export function loadArt(ids: Iterable<string>): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const id of new Set(ids)) {
    if (!HAS.has(id) || images.has(id)) continue;
    let p = pending.get(id);
    if (!p) { p = limited(id); pending.set(id, p); }
    jobs.push(p);
  }
  return Promise.all(jobs).then(() => undefined);
}

/** the painting as a Pixi texture, or null until it has loaded */
export function cardArt(id: string): Texture | null {
  const img = images.get(id);
  if (!img) return null;
  let t = textures.get(id);
  if (!t) { t = Texture.from(img); textures.set(id, t); }
  return t;
}

/** a battlefield or title painting from public/assets/battlefields */
export const battlefieldUrl = (name: string): string => `${BASE}assets/battlefields/${name}.webp`;
export async function loadBattlefield(name: string): Promise<Texture> {
  return Assets.load<Texture>(battlefieldUrl(name));
}
