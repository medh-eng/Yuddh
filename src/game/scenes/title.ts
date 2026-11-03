/* Title screen: a lamp-lit war tent. Phase 1 swaps the drawn
   mandala for Pon's layered title painting. */
import { Container, Graphics, Sprite, Text, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { DESIGN_H, DESIGN_W, FONT_DEVA, FONT_SERIF, INK } from '../theme';
import { lampGlow, teak, vignette } from '../textures';
import { makeButton } from '../ui/button';
import type { Scene } from '../stage';

export function titleScene(go: { battle(): void; preview(): void; prototype(): void }): Scene {
  const s: Scene = new Container();
  const cx = DESIGN_W / 2;

  const wood = new Sprite(teak()); wood.width = DESIGN_W; wood.height = DESIGN_H; wood.tint = 0x8a6a52;
  const glow = new Sprite(lampGlow()); glow.anchor.set(0.5); glow.position.set(cx, 440); glow.scale.set(3.4); glow.blendMode = 'add';
  const vig = new Sprite(vignette()); vig.width = DESIGN_W; vig.height = DESIGN_H;
  s.addChild(wood, glow);

  // chakra: 24 spokes, two rings — slowly turning behind the title
  const chakra = new Graphics();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    chakra.moveTo(Math.cos(a) * 70, Math.sin(a) * 70).lineTo(Math.cos(a) * 300, Math.sin(a) * 300);
  }
  chakra.stroke({ width: 2, color: INK.gold, alpha: 0.18 });
  chakra.circle(0, 0, 300).stroke({ width: 3, color: INK.gold, alpha: 0.28 });
  chakra.circle(0, 0, 330).stroke({ width: 1, color: INK.gold, alpha: 0.18 });
  chakra.circle(0, 0, 70).stroke({ width: 2, color: INK.gold, alpha: 0.25 });
  chakra.position.set(cx, 400);
  s.addChild(chakra);

  const deva = new Text({ text: 'युद्ध', style: { fontFamily: FONT_DEVA, fontSize: 64, fill: INK.gold } });
  deva.anchor.set(0.5); deva.position.set(cx, 270);
  const title = new Text({ text: 'YUDDH', style: { fontFamily: FONT_SERIF, fontSize: 200, fontWeight: '700', letterSpacing: 30, fill: INK.goldPale, dropShadow: { color: 0x000000, blur: 18, distance: 0, alpha: 0.9 } } });
  title.anchor.set(0.5); title.position.set(cx + 15, 400);
  const sub = new Text({ text: 'RISE OF THE RAJYAS', style: { fontFamily: FONT_SERIF, fontSize: 30, fontWeight: '600', letterSpacing: 18, fill: INK.gold } });
  sub.anchor.set(0.5); sub.position.set(cx + 9, 530);
  const rule = new Graphics().moveTo(cx - 260, 580).lineTo(cx + 260, 580).stroke({ width: 1, color: INK.gold, alpha: 0.6 })
    .poly([cx, 572, cx + 8, 580, cx, 588, cx - 8, 580]).fill(INK.gold);
  s.addChild(deva, title, sub, rule);

  const b1 = makeButton('To battle', go.battle, { primary: true, w: 400 });
  b1.position.set(cx, 680);
  const b2 = makeButton('Watch two generals', go.preview, { w: 400 });
  b2.position.set(cx, 766);
  const b3 = makeButton('Play the prototype', go.prototype, { w: 400 });
  b3.position.set(cx, 852);
  s.addChild(b1, b2, b3);

  const note = new Text({ text: 'Phase 1 build · The First Throne, Pataliputra, c. 321 BCE', style: { fontFamily: FONT_SERIF, fontSize: 20, fontStyle: 'italic', fill: INK.smoke } });
  note.anchor.set(0.5); note.position.set(cx, 1010);
  s.addChild(note);

  // embers drifting up from the lamps
  const embers = new Container();
  s.addChild(embers);
  const sparks: { g: Graphics; vy: number; vx: number }[] = [];
  for (let i = 0; i < 60; i++) {
    const g = new Graphics().circle(0, 0, 1.5 + Math.random() * 2).fill(0xffb460);
    g.blendMode = 'add';
    g.position.set(Math.random() * DESIGN_W, Math.random() * DESIGN_H);
    g.alpha = 0.2 + Math.random() * 0.6;
    embers.addChild(g);
    sparks.push({ g, vy: 0.3 + Math.random() * 0.9, vx: (Math.random() - 0.5) * 0.3 });
  }
  s.addChild(vig);

  const tick = (t: Ticker) => {
    chakra.rotation += 0.0006 * t.deltaTime;
    glow.alpha = 0.85 + Math.sin(performance.now() / 260) * 0.05 + Math.random() * 0.04;
    for (const p of sparks) {
      p.g.y -= p.vy * t.deltaTime; p.g.x += p.vx * t.deltaTime;
      if (p.g.y < -10) { p.g.y = DESIGN_H + 10; p.g.x = Math.random() * DESIGN_W; }
    }
  };
  s.enter = () => {
    Ticker.shared.add(tick);
    gsap.from([deva, title, sub], { y: '+=30', alpha: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' });
    gsap.from([b1, b2, b3], { alpha: 0, duration: 0.8, delay: 0.7, stagger: 0.12 });
  };
  s.leave = () => Ticker.shared.remove(tick);
  return s;
}
