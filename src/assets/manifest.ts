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

/** load these paintings (ids without a painting are skipped); resolves when all are ready */
export function loadArt(ids: Iterable<string>): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const id of new Set(ids)) {
    if (!HAS.has(id) || images.has(id)) continue;
    let p = pending.get(id);
    if (!p) {
      p = new Promise<void>(res => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { images.set(id, img); res(); };
        img.onerror = () => res();
        img.src = `${BASE}assets/cards/${id}.webp`;
      });
      pending.set(id, p);
    }
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
