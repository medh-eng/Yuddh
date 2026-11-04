/* Reading a card at full size, KARDS-style: the card held up large on one
   side, and beside it a dark lacquer panel that explains, in bold plain
   words, every rule the card carries. Tap anywhere to close. */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import gsap from 'gsap';
import { CARDS, type Unit } from '../../engine';
import { FACE_H, FACE_W, cardFace } from '../cards/paint';
import { FONT_SERIF, INK } from '../theme';
import { view } from '../view';
import { glossFor, type GlossIcon } from './glossary';

/** small gold icons drawn with lines, so no font has to carry the symbols */
function icon(kind: GlossIcon, r: number): Graphics {
  const g = new Graphics();
  g.circle(0, 0, r).fill(0x2a1a0e).stroke({ width: 2, color: INK.gold });
  const s = r * 0.55, gold = { width: 3, color: INK.goldPale, cap: 'round' as const };
  switch (kind) {
    case 'charge': // a wheel
      g.circle(0, 0, s).stroke(gold);
      for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 4; g.moveTo(Math.cos(a) * s, Math.sin(a) * s).lineTo(-Math.cos(a) * s, -Math.sin(a) * s).stroke({ width: 2, color: INK.goldPale }); }
      break;
    case 'foot': g.poly([-s * 0.6, s * 0.4, 0, -s * 0.5, s * 0.6, s * 0.4]).stroke(gold); break;
    case 'melee': g.moveTo(-s, s).lineTo(s, -s).moveTo(s, s).lineTo(-s, -s).stroke(gold); break;
    case 'ranged': g.moveTo(-s, s).lineTo(s, -s).stroke(gold).poly([s, -s, s * 0.2, -s * 0.85, s * 0.85, -s * 0.2]).fill(INK.goldPale); break;
    case 'raksha': g.poly([0, -s, s * 0.85, -s * 0.55, s * 0.7, s * 0.4, 0, s, -s * 0.7, s * 0.4, -s * 0.85, -s * 0.55]).fill(INK.goldPale); break;
    case 'veg': g.poly([-s, -s * 0.7, 0, 0, -s, s * 0.7]).stroke(gold).poly([0, -s * 0.7, s, 0, 0, s * 0.7]).stroke(gold); break;
    case 'rank': { const p: number[] = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? s * 0.45 : s; const a = -Math.PI / 2 + (i * Math.PI) / 5; p.push(Math.cos(a) * rr, Math.sin(a) * rr); } g.poly(p).fill(INK.goldPale); break; }
    case 'deploy': g.poly([0, -s, s * 0.35, -s * 0.2, s, 0, s * 0.35, s * 0.2, 0, s, -s * 0.35, s * 0.2, -s, 0, -s * 0.35, -s * 0.2]).fill(INK.goldPale); break;
    case 'yantra': g.circle(0, 0, s).stroke(gold).circle(0, 0, s * 0.35).fill(INK.goldPale); break;
    case 'shakti': g.poly([s * 0.2, -s, -s * 0.5, s * 0.1, 0, s * 0.1, -s * 0.2, s, s * 0.5, -s * 0.1, 0, -s * 0.1]).fill(INK.goldPale); break;
    case 'mantra': g.moveTo(-s * 0.7, -s * 0.5).lineTo(s * 0.7, -s * 0.5).moveTo(-s * 0.7, 0).lineTo(s * 0.7, 0).moveTo(-s * 0.7, s * 0.5).lineTo(s * 0.3, s * 0.5).stroke({ width: 2.5, color: INK.goldPale }); break;
    case 'kosha': g.circle(0, 0, s * 0.8).fill(0xd9a440).stroke({ width: 2, color: INK.goldPale }); break;
    case 'op': g.circle(0, 0, s * 0.8).fill(0x8a5a32).stroke({ width: 2, color: INK.goldPale }); break;
    case 'empire': g.poly([-s * 0.8, s * 0.6, -s * 0.8, -s * 0.2, -s * 0.4, -s * 0.6, 0, -s * 0.2, s * 0.4, -s * 0.6, s * 0.8, -s * 0.2, s * 0.8, s * 0.6]).fill(INK.goldPale); break;
    case 'wound': g.moveTo(-s * 0.7, -s * 0.2).lineTo(s * 0.7, -s * 0.2).moveTo(0, -s * 0.8).lineTo(0, s * 0.8).stroke({ width: 4, color: 0xff8f7a }); break;
  }
  return g;
}

export interface InspectExtra { unit?: Unit; cost?: number }

export function inspectOverlay(cardId: string, upgrade: number, onClose: () => void, extra: InspectExtra = {}): Container {
  const W = view.w, H = view.h, ph = view.phone;
  const c = new Container();
  const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.8 });
  c.addChild(dim);
  const k = Math.min(1.1, (H * (ph ? 0.94 : 0.86)) / FACE_H);
  const cw = FACE_W * k;
  const glosses = CARDS[cardId] ? glossFor(cardId, extra.unit, extra.cost) : [];

  // the panel: as wide as the room beside the card allows
  const gap = ph ? 28 : 40;
  const pw = Math.min(ph ? 720 : 640, W - cw - gap - (ph ? 40 : 160));
  const total = cw + gap + pw;
  const left = (W - total) / 2;
  const face = new Sprite(cardFace(cardId, upgrade, extra.cost)); face.anchor.set(0.5); face.scale.set(k);
  face.position.set(left + pw + gap + cw / 2, H / 2 - (ph ? 0 : 20));

  const panel = new Container();
  const ui = ph ? 1.25 : 1;
  let head = Math.round(28 * ui), body = Math.round(25 * ui);
  const build = (): number => {
    panel.removeChildren().forEach(ch => ch.destroy());
    const pad = 22, ir = Math.round(head * 0.7);
    let y = pad;
    glosses.forEach((gl, i) => {
      if (i > 0) { panel.addChild(new Graphics().moveTo(pad, y - 10).lineTo(pw - pad, y - 10).stroke({ width: 1.5, color: INK.gold, alpha: 0.45 })); }
      const ic = icon(gl.icon, ir); ic.position.set(pad + ir, y + head * 0.62);
      const t = new Text({ text: gl.title, style: { fontFamily: FONT_SERIF, fontSize: head, fontWeight: '700', letterSpacing: 2, fill: INK.goldPale, stroke: { color: 0x000000, width: 2 } } });
      t.position.set(pad + ir * 2 + 14, y);
      const b = new Text({ text: gl.body, style: { fontFamily: FONT_SERIF, fontSize: body, fontWeight: '700', fill: 0xf4ead6, wordWrap: true, wordWrapWidth: pw - pad * 2, lineHeight: Math.round(body * 1.22) } });
      b.position.set(pad, y + head + 8);
      panel.addChild(ic, t, b);
      y = b.y + b.height + 22;
    });
    return y;
  };
  let h = build();
  const maxH = H * (ph ? 0.94 : 0.86);
  // too many entries for the screen: step the type down until it fits
  while (h > maxH && body > 18) { head -= 1; body -= 1; h = build(); }
  const bg = new Graphics().roundRect(0, 0, pw, h, 10).fill({ color: 0x1b1612, alpha: 0.96 }).stroke({ width: 2, color: INK.gold, alpha: 0.8 });
  panel.addChildAt(bg, 0);
  panel.position.set(left, Math.max(8, face.y - h / 2));
  if (!glosses.length) panel.visible = false;
  c.addChild(panel, face);

  const tip = new Text({ text: 'Tap anywhere to close', style: { fontFamily: FONT_SERIF, fontSize: Math.round(20 * ui), fontStyle: 'italic', fill: INK.smoke } });
  tip.anchor.set(0.5, 1); tip.position.set(face.x, H - 4); tip.alpha = 0.8;
  c.addChild(tip);
  c.eventMode = 'static'; c.on('pointertap', onClose);
  gsap.from(face.scale, { x: k * 0.6, y: k * 0.6, duration: 0.25, ease: 'back.out(1.5)' });
  gsap.from(panel, { alpha: 0, x: panel.x - 30, duration: 0.3, delay: 0.05 });
  gsap.from(c, { alpha: 0, duration: 0.15 });
  return c;
}
