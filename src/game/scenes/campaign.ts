/* ============================================================
   The campaign map: the Maurya campaign as a row of battles
   joined by a road. Nothing is locked (any battle can be replayed
   or tried early); a laurel marks the ones already won and "NEXT"
   marks where the story goes on.
   ============================================================ */
import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import gsap from 'gsap';
import { FONT_SERIF, FONT_TITLE, INK } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H, FACE_W } from '../cards/paint';
import { makeButton } from '../ui/button';
import { audio } from '../audio';
import { loadArt, loadBattlefield } from '../../assets/manifest';
import { battlesWon, MAURYA_CAMPAIGN } from '../../campaign/campaign';
import type { Scenario } from '../../campaign/scenario';
import { destroyTree, type Scene, type Stage } from '../stage';

/** where each battle's card sits on screen, for the automated playtest */
const nodes: Container[] = [];
(window as unknown as { __yuddhCampaign: () => { id: string; x: number; y: number }[] }).__yuddhCampaign = () =>
  nodes.filter(c => !c.destroyed && c.parent).map((c, i) => { const p = c.getGlobalPosition(); return { id: MAURYA_CAMPAIGN[i].scenario.id, x: p.x, y: p.y }; });

export function campaignScene(stage: Stage, go: (sc: Scenario) => void, back: () => void): Scene {
  const s: Scene = new Container();
  let alive = true;
  const body = new Container();
  s.addChild(body);
  let ground: Texture | null = null;

  async function draw(): Promise<void> {
    await loadArt(MAURYA_CAMPAIGN.map(n => n.face));
    if (!alive) return;
    body.removeChildren().forEach(c => destroyTree(c as Container));
    nodes.length = 0;
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const won = battlesWon();
    const firstOpen = MAURYA_CAMPAIGN.findIndex(n => !won.includes(n.scenario.id));

    const shade = new Graphics().rect(0, 0, W, ph ? 118 : 205).fill({ color: 0x0a0604, alpha: 0.6 });
    const kicker = new Text({ text: 'THE MAURYA CAMPAIGN', style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
    kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    const title = new Text({ text: 'Rise of Magadha', style: { fontFamily: FONT_TITLE, fontSize: ph ? 54 : 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    title.position.set(ph ? 56 : 96, ph ? 38 : 70);
    body.addChild(shade, kicker, title);

    const n = MAURYA_CAMPAIGN.length;
    const k0 = ph ? 0.42 : 0.56;
    const cw = FACE_W * k0, ch = FACE_H * k0;
    const gap = Math.min(ph ? 150 : 190, (W - 200 - n * cw) / (n - 1));
    const total = n * cw + (n - 1) * gap;
    const cy = ph ? 118 + (H - 118 - 100) / 2 - 8 : 205 + (H - 205 - 150) / 2 - 20;
    // the road
    const road = new Graphics();
    for (let i = 0; i < n - 1; i++) {
      const x0 = W / 2 - total / 2 + cw + i * (cw + gap), x1 = x0 + gap;
      road.moveTo(x0 + 6, cy).lineTo(x1 - 6, cy).stroke({ width: 6, color: INK.gold, alpha: 0.75 });
      road.poly([x1 - 6, cy - 12, x1 + 8, cy, x1 - 6, cy + 12]).fill({ color: INK.gold, alpha: 0.85 });
    }
    body.addChild(road);

    MAURYA_CAMPAIGN.forEach((node, i) => {
      const sc = node.scenario;
      const x = W / 2 - total / 2 + cw / 2 + i * (cw + gap);
      const c = new Container();
      const face = new Sprite(cardFace(node.face)); face.anchor.set(0.5); face.scale.set(k0);
      const isWon = won.includes(sc.id), isNext = i === firstOpen;
      face.tint = isWon ? 0xcfcfcf : 0xffffff;
      c.addChild(face);
      const t1 = new Text({ text: sc.title, style: { fontFamily: FONT_TITLE, fontSize: Math.round(26 * k), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 4 }, align: 'center' } });
      t1.anchor.set(0.5, 0); t1.position.set(0, ch / 2 + (ph ? 8 : 14));
      if (t1.width > cw + gap - 20) t1.scale.set((cw + gap - 20) / t1.width);
      const t2 = new Text({ text: `${sc.place} · ${sc.year}`, style: { fontFamily: FONT_SERIF, fontSize: Math.round(22 * k), fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 3 }, align: 'center' } });
      t2.anchor.set(0.5, 0); t2.position.set(0, t1.y + t1.height + 2);
      if (t2.width > cw + gap - 20) t2.scale.set((cw + gap - 20) / t2.width);
      c.addChild(t1, t2);
      if (isWon || isNext) {
        const tag = new Text({ text: isWon ? '✦ WON' : 'NEXT', style: { fontFamily: FONT_TITLE, fontSize: Math.round(22 * k), fontWeight: '700', letterSpacing: 6, fill: isWon ? INK.goldPale : 0x22150d } });
        tag.anchor.set(0.5);
        const pill = new Graphics().roundRect(-tag.width / 2 - 14, -tag.height / 2 - 6, tag.width + 28, tag.height + 12, 6).fill({ color: isWon ? 0x24170e : INK.gold, alpha: 0.95 }).stroke({ width: 2, color: INK.gold });
        const tg = new Container(); tg.addChild(pill, tag); tg.position.set(0, -ch / 2 - (ph ? 4 : 6));
        c.addChild(tg);
      }
      c.position.set(x, cy);
      c.eventMode = 'static'; c.cursor = 'pointer';
      c.on('pointerover', () => gsap.to(c.scale, { x: 1.05, y: 1.05, duration: 0.15 }));
      c.on('pointerout', () => gsap.to(c.scale, { x: 1, y: 1, duration: 0.15 }));
      c.on('pointertap', () => { audio.unlock(); audio.play('conch'); go(sc); });
      // the campaign's story line, only for the next battle (keeps the map quiet)
      body.addChild(c); nodes.push(c);
      gsap.from(c, { alpha: 0, y: cy + 24, duration: 0.5, delay: i * 0.12, ease: 'power2.out' });
    });

    const bk = makeButton('Back', back, { w: ph ? 150 : 170 });
    bk.position.set(ph ? W - 104 : W - 120, ph ? 52 : 70);
    body.addChild(bk);
  }

  s.relayout = () => { void draw(); };
  s.enter = () => {
    audio.playMusic('music_briefing');
    void loadBattlefield('pataliputra').then(t => { ground = t; if (alive) stage.setBackdrop(ground, 0.5); });
    void draw();
  };
  s.leave = () => { alive = false; };
  return s;
}
