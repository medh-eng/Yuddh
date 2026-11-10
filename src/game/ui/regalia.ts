/* Regalia: one medallion per rank step (levels 1-6) for each empire. A painted
   piece (art id rg_<empire>_<level>, e.g. rg_maurya_1) shows when delivered;
   until then a drawn emblem stands in. Locked pieces are dim. Cosmetic only. */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { FONT_TITLE, EMPIRE_STYLE, INK } from '../theme';
import { CARD_ART, cardArt } from '../../assets/manifest';
import type { EmpireId } from '../../engine/types';

export const regaliaId = (empire: string, level: number): string => `rg_${empire}_${level}`;
export const regaliaArt = (empire: string): string[] => [1, 2, 3, 4, 5, 6].map(l => regaliaId(empire, l)).filter(id => CARD_ART.includes(id));

/** a round medallion of radius r; `owned` pieces are bright, others dim */
export function medallion(empire: string, level: number, r: number, owned: boolean): Container {
  const c = new Container();
  const st = EMPIRE_STYLE[(empire as EmpireId)] ?? EMPIRE_STYLE.neutral;
  const base = new Graphics().circle(0, 0, r).fill({ color: 0x1a0f08, alpha: 0.95 });
  c.addChild(base);
  const tex = owned ? cardArt(regaliaId(empire, level)) : null;
  if (tex) {
    const sp = new Sprite(tex); sp.anchor.set(0.5);
    sp.scale.set((1.7 * r) / Math.min(tex.width, tex.height)); // 85%: long objects (spear, goad) reach the corners of the square
    const m = new Graphics().circle(0, 0, r - 2).fill(0xffffff);
    sp.mask = m; c.addChild(m, sp);
  } else {
    // stand-in emblem: lotus-like petals around a pip count of the level
    const g = new Graphics();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.ellipse(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.2, r * 0.38).fill({ color: st.accent, alpha: 0.55 });
    }
    c.addChild(g);
    const t = new Text({ text: String(level), style: { fontFamily: FONT_TITLE, fontSize: Math.round(r * 1.1), fontWeight: '700', fill: owned ? INK.goldPale : 0x8a7a66, stroke: { color: 0x000000, width: 3 } } });
    t.anchor.set(0.5); c.addChild(t);
  }
  const ring = new Graphics().circle(0, 0, r).stroke({ width: Math.max(2, r * 0.1), color: owned ? st.frameLight : 0x4a3d30 });
  c.addChild(ring);
  if (!owned) c.alpha = 0.45;
  c.eventMode = 'none';
  return c;
}
