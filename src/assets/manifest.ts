/* ============================================================
   Art manifest. Card paintings live in public/assets/cards/<id>.webp
   (made by `npm run assets` from Pon's masters). A card listed here
   shows its painting; any other card falls back to the placeholder.
   ============================================================ */
import { Assets, Texture } from 'pixi.js';

import delivered from './card-art.json';

/** ids of cards whose painting has been delivered (written by scripts/convert-assets.mjs) */
export const CARD_ART: string[] = delivered as string[];

const BASE = import.meta.env.BASE_URL;

export async function loadCardArt(): Promise<void> {
  if (!CARD_ART.length) return;
  await Assets.load(CARD_ART.map(id => ({ alias: `card:${id}`, src: `${BASE}assets/cards/${id}.webp` })));
}

export function cardArt(id: string): Texture | null {
  return CARD_ART.includes(id) ? Texture.from(`card:${id}`) : null;
}
