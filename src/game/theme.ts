/* ============================================================
   YUDDH — visual tokens. "Living miniature": mineral pigments,
   gold leaf, lamp-lit teak. Each empire's frame is the material
   its own art is famous for (see the master plan).
   ============================================================ */
import type { EmpireId } from '../engine';

export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

export const FONT_SERIF = "'Cormorant Garamond', Georgia, serif";
/** titles, names and every number: Cinzel's capitals and lining figures stay crisp at phone size */
export const FONT_TITLE = "'Cinzel', Georgia, serif";
/** rules text and coaching: a sturdy humanist sans */
export const FONT_BODY = "'Alegreya Sans', 'Trebuchet MS', sans-serif";
export const FONT_DEVA = "'Tiro Devanagari Hindi', 'Noto Serif Devanagari', serif";

export const INK = {
  night: 0x120c08,
  teak: 0x3a2416,
  teakDark: 0x22150d,
  gold: 0xd4a94f,
  goldPale: 0xf0d79a,
  cream: 0xf3e6c8,
  vermilion: 0xc2412d,
  lapis: 0x23407a,
  malachite: 0x2f7d5b,
  smoke: 0x8a7b66
};

export interface EmpireStyle { frame: number; frameLight: number; accent: number; material: string }

export const EMPIRE_STYLE: Record<EmpireId, EmpireStyle> = {
  maurya:   { frame: 0xcdb48c, frameLight: 0xeadcc0, accent: 0x9c3b22, material: 'Polished Chunar sandstone' },
  gupta:    { frame: 0xc9962e, frameLight: 0xf2d27a, accent: 0x1f3a7a, material: 'Gold, like Gupta coins' },
  chalukya: { frame: 0xa4532f, frameLight: 0xd08a5c, accent: 0xd9a441, material: 'Badami red sandstone' },
  chola:    { frame: 0x8c5a2b, frameLight: 0xc28a4e, accent: 0x2f7d6e, material: 'Chola bronze' },
  rajput:   { frame: 0xb8bcc4, frameLight: 0xe8eaee, accent: 0xe08a1e, material: 'Painted border, silver' },
  neutral:  { frame: 0x6f6252, frameLight: 0xa49580, accent: 0xc9a45c, material: 'Weathered teak' }
};
