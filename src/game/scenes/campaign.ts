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
import { loadArt, loadBattlefield, orTimeout } from '../../assets/manifest';
import { battlesWon, CAMPAIGNS, currentCampaign, type Campaign } from '../../campaign/campaign';
import type { Scenario } from '../../campaign/scenario';
import { destroyTree, type Scene, type Stage } from '../stage';

/** where each battle's card sits on screen, for the automated playtest */
const nodes: Container[] = [];
let ids: string[] = [];
const tabs: { id: string; c: Container }[] = [];
(window as unknown as { __yuddhCampaign: () => { id: string; x: number; y: number }[] }).__yuddhCampaign = () =>
  [...nodes.filter(c => !c.destroyed && c.parent).map((c, i) => ({ id: ids[i], c })), ...tabs.filter(t => !t.c.destroyed && t.c.parent).map(t => ({ id: 'tab:' + t.id, c: t.c }))]
    .map(({ id, c }) => { const p = c.getGlobalPosition(); return { id, x: p.x, y: p.y }; });

export function campaignScene(stage: Stage, go: (sc: Scenario) => void, back: () => void, start?: Campaign): Scene {
  const s: Scene = new Container();
  let cur = start ?? currentCampaign();
  let alive = true;
  const body = new Container();
  s.addChild(body);
  let ground: Texture | null = null;

  async function draw(): Promise<void> {
    const list = cur.nodes;
    await orTimeout(loadArt(list.map(n => n.face)), 4000); // late paintings fill in by themselves
    if (!alive) return;
    body.removeChildren().forEach(c => destroyTree(c as Container));
    nodes.length = 0; tabs.length = 0; ids = list.map(n => n.scenario.id);
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const won = battlesWon();
    const firstOpen = list.findIndex(n => !won.includes(n.scenario.id));

    const shade = new Graphics().rect(0, 0, W, ph ? 118 : 205).fill({ color: 0x0a0604, alpha: 0.6 });
    const kicker = new Text({ text: cur.kicker, style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
    kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    const title = new Text({ text: cur.title, style: { fontFamily: FONT_TITLE, fontSize: ph ? 54 : 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    title.position.set(ph ? 56 : 96, ph ? 38 : 70);
    body.addChild(shade, kicker, title);

    const n = list.length;
    const k0 = ph ? 0.42 : 0.56;
    const cw = FACE_W * k0, ch = FACE_H * k0;
    const gap = n > 1 ? Math.min(ph ? 150 : 190, (W - 200 - n * cw) / (n - 1)) : 0;
    const total = n * cw + (n - 1) * gap;
    const top = (ph ? 118 : 205) + 52;
    const cy = ph ? top + (H - top - 100) / 2 - 8 : top + (H - top - 150) / 2 - 20;
    // the road: a winding dashed route from battle to battle, nodes on a gentle wave
    const wave = (ph ? 26 : 38);
    const ny = (i: number): number => cy + (n > 1 ? Math.sin(i * 1.9 + 0.6) * wave : 0);
    const nx = (i: number): number => W / 2 - total / 2 + cw / 2 + i * (cw + gap);
    const frame = new Graphics();
    const m = ph ? 22 : 34, fy0 = (ph ? 118 : 205) + 6;
    frame.rect(m, fy0, W - 2 * m, H - fy0 - m).stroke({ width: 3, color: INK.gold, alpha: 0.55 })
      .rect(m + 9, fy0 + 9, W - 2 * m - 18, H - fy0 - m - 18).stroke({ width: 1.2, color: INK.gold, alpha: 0.4 });
    for (const [fx, fyy] of [[m, fy0], [W - m, fy0], [m, H - m], [W - m, H - m]]) frame.poly([fx, fyy - 11, fx + 11, fyy, fx, fyy + 11, fx - 11, fyy]).fill({ color: INK.gold, alpha: 0.85 });
    // a compass rose in the lower right corner
    const cx0 = W - (ph ? 110 : 150), cy0 = H - (ph ? 120 : 160), cr = ph ? 44 : 60;
    frame.circle(cx0, cy0, cr).stroke({ width: 2, color: INK.gold, alpha: 0.7 }).circle(cx0, cy0, cr * 0.78).stroke({ width: 1, color: INK.gold, alpha: 0.5 });
    frame.poly([cx0, cy0 - cr * 1.05, cx0 + cr * 0.16, cy0, cx0, cy0 + cr * 0.55, cx0 - cr * 0.16, cy0]).fill({ color: INK.gold, alpha: 0.9 });
    frame.poly([cx0 - cr * 0.55, cy0, cx0, cy0 - cr * 0.16, cx0 + cr * 0.55, cy0, cx0, cy0 + cr * 0.16]).fill({ color: INK.gold, alpha: 0.5 });
    frame.eventMode = 'none';
    body.addChild(frame);
    const nTxt = new Text({ text: 'N', style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 3 } } });
    nTxt.anchor.set(0.5, 1); nTxt.position.set(cx0, cy0 - cr * 1.08); nTxt.eventMode = 'none';
    body.addChild(nTxt);
    const road = new Graphics();
    for (let i = 0; i < n - 1; i++) {
      const xa = nx(i) + cw / 2 + 6, ya = ny(i), xb = nx(i + 1) - cw / 2 - 12, yb = ny(i + 1);
      const dx = (xb - xa) * 0.5;
      const pt = (t: number): [number, number] => {
        const u = 1 - t;
        return [u * u * u * xa + 3 * u * u * t * (xa + dx) + 3 * u * t * t * (xb - dx) + t * t * t * xb,
          u * u * u * ya + 3 * u * u * t * ya + 3 * u * t * t * yb + t * t * t * yb];
      };
      const steps = 60;
      for (let j = 0; j < steps; j += 2) { const [x0, y0] = pt(j / steps), [x1, y1] = pt((j + 1) / steps); road.moveTo(x0, y0).lineTo(x1, y1).stroke({ width: 6, color: INK.gold, alpha: 0.8 }); }
      const [ex, ey] = pt(1), [px, py] = pt(0.97), ang = Math.atan2(ey - py, ex - px);
      const tip: [number, number] = [ex + Math.cos(ang) * 14, ey + Math.sin(ang) * 14];
      road.poly([ex + Math.cos(ang + 2.5) * 16, ey + Math.sin(ang + 2.5) * 16, tip[0], tip[1], ex + Math.cos(ang - 2.5) * 16, ey + Math.sin(ang - 2.5) * 16]).fill({ color: INK.gold, alpha: 0.9 });
      const [mx, my] = pt(0.5);
      road.poly([mx, my - 9, mx + 9, my, mx, my + 9, mx - 9, my]).fill({ color: INK.goldPale, alpha: 0.95 }).stroke({ width: 2, color: 0x22150d });
    }
    road.eventMode = 'none';
    body.addChild(road);

    // campaign tabs under the heading
    // tab widths differ, so lay them out by their own widths
    const tabW: number[] = CAMPAIGNS.map(c => { const t = new Text({ text: c.title, style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 2 } }); const w = t.width + 40; t.destroy(); return w; });
    const tabTotal = tabW.reduce((a, v) => a + v, 0) + 24 * (CAMPAIGNS.length - 1);
    // more tabs than the screen is wide: shrink the whole strip to fit inside the frame
    const tabS = Math.min(1, (W - 2 * (ph ? 30 : 50)) / tabTotal);
    let tabX = W / 2 - (tabTotal * tabS) / 2;
    CAMPAIGNS.forEach((c, i) => {
      const on = c === cur;
      const lab = new Text({ text: c.title, style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 2, fill: on ? 0x22150d : INK.goldPale } });
      lab.anchor.set(0.5);
      const w = lab.width + 40, h = lab.height + 14;
      const pill = new Graphics().roundRect(-w / 2, -h / 2, w, h, 8).fill({ color: on ? INK.gold : 0x24170e, alpha: 0.95 }).stroke({ width: 2, color: INK.gold });
      const tab = new Container(); tab.addChild(pill, lab);
      tab.scale.set(tabS);
      tab.position.set(tabX + (w * tabS) / 2, (ph ? 118 : 205) + 30); tabX += (tabW[i] + 24) * tabS;
      tab.eventMode = 'static'; tab.cursor = 'pointer';
      tab.on('pointertap', () => { if (c === cur) return; audio.unlock(); audio.play('click'); cur = c; void loadBattlefield(c.map ?? c.ground).then(t => { if (alive) stage.setBackdrop(t, c.map ? 0.3 : 0.5); }); void draw(); });
      body.addChild(tab); tabs.push({ id: c.id, c: tab });
    });

    list.forEach((node, i) => {
      const sc = node.scenario;
      const x = nx(i), y = ny(i);
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
      c.position.set(x, y);
      c.eventMode = 'static'; c.cursor = 'pointer';
      c.on('pointerover', () => gsap.to(c.scale, { x: 1.05, y: 1.05, duration: 0.15 }));
      c.on('pointerout', () => gsap.to(c.scale, { x: 1, y: 1, duration: 0.15 }));
      c.on('pointertap', () => { audio.unlock(); audio.play('conch'); go(sc); });
      // the campaign's story line, only for the next battle (keeps the map quiet)
      body.addChild(c); nodes.push(c);
      gsap.from(c, { alpha: 0, y: y + 24, duration: 0.5, delay: i * 0.12, ease: 'power2.out' });
    });

    const bk = makeButton('Back', back, { w: ph ? 150 : 170 });
    bk.position.set(ph ? W - 104 : W - 120, ph ? 52 : 70);
    body.addChild(bk);
  }

  s.relayout = () => { void draw(); };
  s.enter = () => {
    audio.playMusic('music_briefing');
    void loadBattlefield(cur.map ?? cur.ground).then(t => { ground = t; if (alive) stage.setBackdrop(ground, cur.map ? 0.3 : 0.5); });
    void draw();
  };
  s.leave = () => { alive = false; };
  return s;
}
