/* ============================================================
   The campaign map: one empire's battles as a row of large cards joined
   by a road. The row is swipeable sideways, so the cards keep one big size
   however many battles there are. Nothing is locked (any battle can be
   replayed or tried early); a laurel marks the ones already won and "NEXT"
   marks where the story goes on. Only one empire is shown; "More empires"
   opens a picker with the others.
   ============================================================ */
import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import gsap from 'gsap';
import { FONT_BODY, FONT_STORY, FONT_TITLE, INK } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H, FACE_W } from '../cards/paint';
import { makeButton } from '../ui/button';
import { makePan, panHints, type Pan } from '../ui/pan';
import { audio } from '../audio';
import { loadArt, loadBattlefield, orTimeout } from '../../assets/manifest';
import { battlesWon, CAMPAIGNS, currentCampaign, type Campaign } from '../../campaign/campaign';
import type { Scenario } from '../../campaign/scenario';
import { destroyTree, type Scene, type Stage } from '../stage';

/** where each battle's card sits on screen, for the automated playtest */
const nodes: Container[] = [];
let ids: string[] = [];
const tabs: { id: string; c: Container }[] = [];
/** scroll a battle into view (the automated playtest uses this) */
let reveal: (id: string) => void = () => {};
(window as unknown as { __yuddhCampaignReveal: (id: string) => void }).__yuddhCampaignReveal = id => reveal(id);
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
  let picker: Container | null = null;
  let keepOff = -1; // the strip's scroll position survives a re-layout (-1: start at the next battle)

  function closePicker(): void {
    if (!picker) return;
    destroyTree(picker); picker = null;
  }

  function choose(c: Campaign): void {
    closePicker();
    if (c === cur) return;
    audio.unlock(); audio.play('click'); cur = c; keepOff = -1;
    void loadBattlefield(c.map ?? c.ground).then(t => { if (alive) stage.setBackdrop(t, c.map ? 0.3 : 0.5); });
    void draw();
  }

  /** the other empires, one big button each, with how far you are in them */
  function openPicker(): void {
    if (picker) return;
    audio.unlock(); audio.play('click');
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const won = battlesWon(), next = currentCampaign();
    const p = new Container(); picker = p;
    const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.88 });
    dim.eventMode = 'static';
    const headY = ph ? 64 : 150, closeY = H - (ph ? 56 : 110);
    const head = new Text({ text: 'CHOOSE AN EMPIRE', style: { fontFamily: FONT_TITLE, fontSize: Math.round(34 * k), fontWeight: '700', letterSpacing: 8, fill: INK.goldPale, stroke: { color: 0x000000, width: 4 } } });
    head.anchor.set(0.5); head.position.set(W / 2, headY);
    p.addChild(dim, head);
    const bw = 380, bwPx = bw * k, gx = 36;
    const n = CAMPAIGNS.length;
    const cols = Math.max(1, Math.min(n, Math.floor((W - 160 + gx) / (bwPx + gx))));
    const rows = Math.ceil(n / cols), rowH = 64 * k + 62 * k;
    const headBottom = headY + 25 * k, closeTop = closeY - 32 * k;
    const y0 = headBottom + (closeTop - headBottom - rows * rowH) / 2 + 36 * k;
    CAMPAIGNS.forEach((c, i) => {
      const r = Math.floor(i / cols), col = i % cols, inRow = Math.min(cols, n - r * cols);
      const x = W / 2 + (col - (inRow - 1) / 2) * (bwPx + gx), y = y0 + r * rowH;
      const b = makeButton(c.title, () => choose(c), { w: bw, primary: c === cur });
      b.position.set(x, y);
      const wonN = c.nodes.filter(nd => won.includes(nd.scenario.id)).length;
      const sub = new Text({ text: `${wonN} of ${c.nodes.length} won${c === next && wonN < c.nodes.length ? ' · story continues here' : ''}`, style: { fontFamily: FONT_BODY, fontSize: Math.round(24 * k), fontWeight: '700', fill: INK.cream, stroke: { color: 0x000000, width: 3 } } });
      sub.anchor.set(0.5, 0); sub.position.set(x, y + 38 * k);
      p.addChild(b, sub); tabs.push({ id: c.id, c: b });
    });
    const close = makeButton('Close', closePicker, { w: 260 });
    close.position.set(W / 2, closeY);
    p.addChild(close);
    s.addChild(p);
  }

  async function draw(): Promise<void> {
    const list = cur.nodes;
    await orTimeout(loadArt(list.map(n => n.face)), 4000); // late paintings fill in by themselves
    if (!alive) return;
    closePicker();
    body.removeChildren().forEach(c => destroyTree(c as Container));
    nodes.length = 0; tabs.length = 0; ids = list.map(n => n.scenario.id);
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const won = battlesWon();
    const firstOpen = list.findIndex(n => !won.includes(n.scenario.id));
    const headH = ph ? 118 : 205;

    const shade = new Graphics().rect(0, 0, W, headH).fill({ color: 0x0a0604, alpha: 0.6 });
    const kicker = new Text({ text: cur.kicker, style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
    kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    const title = new Text({ text: cur.title, style: { fontFamily: FONT_TITLE, fontSize: ph ? 54 : 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    title.position.set(ph ? 56 : 96, ph ? 38 : 70);
    body.addChild(shade, kicker, title);

    // a frame; the battles slide past inside it
    const frame = new Graphics();
    const m = ph ? 22 : 34, fy0 = headH + 6;
    frame.rect(m, fy0, W - 2 * m, H - fy0 - m).stroke({ width: 3, color: INK.gold, alpha: 0.55 })
      .rect(m + 9, fy0 + 9, W - 2 * m - 18, H - fy0 - m - 18).stroke({ width: 1.2, color: INK.gold, alpha: 0.4 });
    for (const [fx, fyy] of [[m, fy0], [W - m, fy0], [m, H - m], [W - m, H - m]]) frame.poly([fx, fyy - 11, fx + 11, fyy, fx, fyy + 11, fx - 11, fyy]).fill({ color: INK.gold, alpha: 0.85 });
    frame.eventMode = 'none';
    body.addChild(frame);

    // the swipeable strip of battles
    const box = { x: m + 10, y: headH + 62, w: W - 2 * (m + 10), h: H - (headH + 62) - m - 10 };
    const pan: Pan = makePan(box, { keys: true });
    const n = list.length;
    const k0 = ph ? 0.52 : 0.68;
    const cw = FACE_W * k0, ch = FACE_H * k0;
    const gap = ph ? 120 : 150, padX = ph ? 130 : 170;
    const contentW = padX * 2 + n * cw + (n - 1) * gap;
    const offX = contentW <= box.w ? (box.w - contentW) / 2 : 0;
    const cy = box.h / 2 - (ph ? 30 : 40);
    const wave = ph ? 20 : 38;
    const ny = (i: number): number => cy + (n > 1 ? Math.sin(i * 1.9 + 0.6) * wave : 0);
    const nx = (i: number): number => offX + padX + cw / 2 + i * (cw + gap);
    pan.setWidth(contentW);
    reveal = id => { const i = ids.indexOf(id); if (i >= 0) pan.scrollTo(nx(i) - box.w / 2, false); };

    // the road: a winding dashed route from battle to battle
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
    pan.content.addChild(road);

    list.forEach((node, i) => {
      const sc = node.scenario;
      const x = nx(i), y = ny(i);
      const c = new Container();
      const face = new Sprite(cardFace(node.face)); face.anchor.set(0.5); face.scale.set(k0);
      const isWon = won.includes(sc.id), isNext = i === firstOpen;
      face.tint = isWon ? 0xcfcfcf : 0xffffff;
      c.addChild(face);
      const room = cw + gap - 24;
      const t1 = new Text({ text: sc.title, style: { fontFamily: FONT_TITLE, fontSize: Math.round(28 * k), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 4 }, align: 'center' } });
      t1.anchor.set(0.5, 0); t1.position.set(0, ch / 2 + (ph ? 8 : 14));
      if (t1.width > room) t1.scale.set(room / t1.width);
      const t2 = new Text({ text: `${sc.place} · ${sc.year}`, style: { fontFamily: FONT_STORY, fontWeight: '500', fontSize: Math.round(24 * k), fontStyle: 'italic', fill: INK.creamBright, stroke: { color: 0x000000, width: 3 }, align: 'center' } });
      t2.anchor.set(0.5, 0); t2.position.set(0, t1.y + t1.height * t1.scale.y + 2);
      if (t2.width > room) t2.scale.set(room / t2.width);
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
      c.on('pointertap', () => { if (pan.dragged()) return; audio.unlock(); audio.play('conch'); go(sc); });
      pan.content.addChild(c); nodes.push(c);
      gsap.from(c, { alpha: 0, y: y + 24, duration: 0.5, delay: i * 0.12, ease: 'power2.out' });
    });
    body.addChild(pan.view);
    body.addChild(panHints(pan, { k, cy: box.y + cy }));
    // start at the next unwon battle, or where the player left the strip
    pan.scrollTo(keepOff >= 0 ? keepOff : (firstOpen >= 0 ? nx(firstOpen) - box.w / 2 : 0), false);
    pan.onScroll(() => { keepOff = pan.offset(); });
    keepOff = pan.offset();

    // the empire: one shown, the rest behind "More empires"
    const mkPill = (text: string, on: boolean, chev: boolean, onTap?: () => void): Container => {
      const lab = new Text({ text: text.toUpperCase(), style: { fontFamily: FONT_TITLE, fontSize: Math.round(26 * k), fontWeight: '700', letterSpacing: 3, fill: on ? 0x22150d : INK.goldPale } });
      lab.anchor.set(0, 0.5);
      const padL = 26, extra = chev ? 34 : 0;
      const w = padL * 2 + lab.width + extra, h = lab.height + 16;
      lab.position.set(-w / 2 + padL, 0);
      const pill = new Graphics().roundRect(-w / 2, -h / 2, w, h, 8).fill({ color: on ? INK.gold : 0x24170e, alpha: 0.95 }).stroke({ width: 2, color: INK.gold });
      const c = new Container(); c.addChild(pill, lab);
      if (chev) c.addChild(new Graphics().poly([w / 2 - padL - 20, -5, w / 2 - padL - 2, -5, w / 2 - padL - 11, 7]).fill(INK.goldPale));
      if (onTap) { c.eventMode = 'static'; c.cursor = 'pointer'; c.on('pointertap', onTap); }
      return c;
    };
    const pCur = mkPill(cur.title, true, false);
    const pMore = mkPill('More empires', false, true, openPicker);
    const gapP = 24, totalP = pCur.width + gapP + pMore.width;
    pCur.position.set(W / 2 - totalP / 2 + pCur.width / 2, headH + 30);
    pMore.position.set(W / 2 + totalP / 2 - pMore.width / 2, headH + 30);
    body.addChild(pCur, pMore);
    tabs.push({ id: 'more', c: pMore });

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
