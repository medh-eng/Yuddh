/* Reading a card at full size: a dimmed screen with the card as large
   as the screen allows. Tap anywhere to close. */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import gsap from 'gsap';
import { CARDS, EMPIRES } from '../../engine';
import { FACE_H, cardFace } from '../cards/paint';
import { FONT_SERIF, INK } from '../theme';
import { fs, view } from '../view';

export function inspectOverlay(cardId: string, upgrade: number, onClose: () => void): Container {
  const W = view.w, H = view.h;
  const c = new Container();
  const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.78 });
  const k = Math.min(1.1, (H * (view.phone ? 0.94 : 0.86)) / FACE_H);
  const face = new Sprite(cardFace(cardId, upgrade)); face.anchor.set(0.5); face.scale.set(k);
  // on wide phones the card sits left of centre with its empire and kind beside it
  const card = CARDS[cardId];
  const side = view.phone && W > 1400;
  face.position.set(side ? W / 2 - 240 : W / 2, H / 2 - (view.phone ? 0 : 20));
  c.addChild(dim, face);
  if (side && card) {
    const who = card.empire === 'neutral' ? 'Any empire' : EMPIRES[card.empire].name;
    const kind = card.type === 'unit' ? `${card.sub ?? 'unit'} · ${card.range === 'ranged' ? 'ranged' : 'melee'}` : card.kind === 'shakti' ? 'Shakti' : card.type === 'yantra' ? 'Yantra (hidden trap)' : 'Mantra';
    const t = new Text({ text: `${card.name}\n${who} · ${kind}`, style: { fontFamily: FONT_SERIF, fontSize: fs(30), fill: INK.goldPale, lineHeight: fs(44), wordWrap: true, wordWrapWidth: 520 } });
    t.position.set(W / 2 + 60 * k + 120, H / 2 - 140);
    const body = new Text({ text: card.text, style: { fontFamily: FONT_SERIF, fontSize: fs(26), fontStyle: 'italic', fill: INK.cream, wordWrap: true, wordWrapWidth: 520, lineHeight: fs(36) } });
    body.position.set(t.x, t.y + t.height + 24);
    c.addChild(t, body);
  }
  const tip = new Text({ text: 'Tap anywhere to close', style: { fontFamily: FONT_SERIF, fontSize: fs(22), fontStyle: 'italic', fill: INK.smoke } });
  tip.anchor.set(0.5); tip.position.set(side ? W - 260 : W / 2, H - (view.phone ? 30 : 40));
  c.addChild(tip);
  c.eventMode = 'static'; c.on('pointertap', onClose);
  gsap.from(face.scale, { x: k * 0.55, y: k * 0.55, duration: 0.25, ease: 'back.out(1.5)' });
  gsap.from(c, { alpha: 0, duration: 0.15 });
  return c;
}
