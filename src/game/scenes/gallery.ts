/* ============================================================
   Chitrashala, the card gallery: every card in its empire's frame,
   one empire at a time, over that empire's home battlefield.
   Tap a card to read it at full size. A place for Pon to judge the
   paintings in the game itself; later the seed of the collection.
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import gsap from 'gsap';
import { CARDS, EMPIRES, type CardDef, type EmpireId } from '../../engine';
import { FONT_SERIF, INK, EMPIRE_STYLE } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H, FACE_W } from '../cards/paint';
import { makeButton } from '../ui/button';
import { inspectOverlay } from '../ui/inspect';
import { audio } from '../audio';
import { loadArt, loadBattlefield } from '../../assets/manifest';
import { destroyTree, type Scene, type Stage } from '../stage';

const TABS: { id: EmpireId; name: string; ground: string; place: string }[] = [
  { id: 'maurya', name: 'Maurya', ground: 'pataliputra', place: 'Pataliputra' },
  { id: 'gupta', name: 'Gupta', ground: 'ujjain', place: 'Ujjain' },
  { id: 'chalukya', name: 'Chalukya', ground: 'narmada', place: 'the Narmada' },
  { id: 'chola', name: 'Chola', ground: 'thanjavur', place: 'Thanjavur' },
  { id: 'rajput', name: 'Rajput', ground: 'tarain', place: 'Tarain' },
  { id: 'neutral', name: 'Neutral', ground: 'title', place: 'any field' }
];

const order = (c: CardDef) => (c.type === 'unit' ? 0 : c.type === 'yantra' ? 2 : 1) * 100 + c.cost;

export function galleryScene(stage: Stage, back: () => void): Scene {
  const s: Scene = new Container();
  let tab = 0, page = 0, alive = true, loadToken = 0;
  let inspecting: Container | null = null;

  const head = new Container();
  const grid = new Container();
  const tabs = new Container();
  const nav = new Container();
  s.addChild(head, grid, tabs, nav);

  const kicker = new Text({ text: 'CHITRASHALA · THE CARD GALLERY', style: { fontFamily: FONT_SERIF, fontSize: 20, fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
  const name = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
  const line = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 24, fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 4 }, wordWrap: true, wordWrapWidth: 1200 } });
  const shade = new Graphics();
  head.addChild(shade, kicker, name, line);

  const cards = (id: EmpireId) => Object.values(CARDS).filter(c => c.empire === id).sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));

  /** How to lay out `n` cards: as large as possible in one or two rows when they all fit
      on one page, otherwise two rows of the standard size, page by page. */
  function geometry(n: number) {
    const W = view.w, H = view.h, ph = view.phone;
    const top = ph ? 172 : 210, bottom = ph ? 110 : 150;
    const gap = ph ? 22 : 26, room = W - 200;
    const make = (rows: number, k: number) => {
      const ch = FACE_H * k, cw = FACE_W * k;
      const cols = Math.max(3, Math.floor((room + gap) / (cw + gap) + 1e-6));
      return { W, H, ph, top, bottom, rows, cols, gap, k, cw, ch, per: rows * cols };
    };
    const kBase = (H - top - bottom - gap) / 2 / FACE_H;
    const fit = (rows: number) => Math.min((H - top - bottom - gap * (rows - 1)) / rows / FACE_H, ((room + gap) / Math.ceil(n / rows) - gap) / FACE_W, 0.62);
    const best = [1, 2].map(r => ({ r, k: fit(r) })).sort((a, b) => b.k - a.k)[0];
    if (best.k >= kBase) return make(best.r, best.k);
    return make(2, kBase);
  }

  async function show(i: number, p = 0): Promise<void> {
    tab = i; page = p;
    const t = TABS[i];
    const token = ++loadToken;
    const list = cards(t.id);
    void loadBattlefield(t.ground).then(tex => { if (alive && token === loadToken) stage.setBackdrop(tex, 0.5); });
    drawTabs(); drawHead();
    grid.removeChildren().forEach(c => destroyTree(c as Container));
    const wait = new Text({ text: 'Unrolling the paintings…', style: { fontFamily: FONT_SERIF, fontSize: Math.round(26 * view.ui), fontStyle: 'italic', fill: INK.cream } });
    wait.anchor.set(0.5); wait.position.set(view.w / 2, view.h / 2); grid.addChild(wait);
    await loadArt(list.map(c => c.id));
    if (!alive || token !== loadToken) return;
    grid.removeChildren().forEach(c => destroyTree(c as Container));
    const g = geometry(list.length);
    const pages = Math.max(1, Math.ceil(list.length / g.per));
    page = Math.min(page, pages - 1);
    const shown = list.slice(page * g.per, (page + 1) * g.per);
    // fewer rows than fit: centre them in the space between the header and the tabs
    const rowsUsed = Math.ceil(shown.length / g.cols);
    const y0 = g.top + (g.H - g.top - g.bottom - (rowsUsed * g.ch + (rowsUsed - 1) * g.gap)) / 2;
    shown.forEach((c, n) => {
      const r = Math.floor(n / g.cols), col = n % g.cols;
      const inRow = Math.min(g.cols, shown.length - r * g.cols);
      const x = g.W / 2 + (col - (inRow - 1) / 2) * (g.cw + g.gap);
      const y = y0 + g.ch / 2 + r * (g.ch + g.gap);
      const sp = new Sprite(cardFace(c.id)); sp.anchor.set(0.5); sp.scale.set(g.k); sp.position.set(x, y);
      sp.eventMode = 'static'; sp.cursor = 'pointer';
      sp.on('pointerover', () => gsap.to(sp.scale, { x: g.k * 1.05, y: g.k * 1.05, duration: 0.15 }));
      sp.on('pointerout', () => gsap.to(sp.scale, { x: g.k, y: g.k, duration: 0.15 }));
      sp.on('pointertap', () => inspect(c.id));
      grid.addChild(sp);
      gsap.from(sp, { alpha: 0, y: y + 20, duration: 0.35, delay: n * 0.03, ease: 'power2.out' });
    });
    drawNav(pages, g);
  }

  function drawHead(): void {
    const t = TABS[tab], ph = view.phone, W = view.w;
    const st = EMPIRE_STYLE[t.id];
    const emp = EMPIRES[t.id];
    kicker.style.fontSize = Math.round(20 * view.ui); kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    name.text = t.id === 'neutral' ? 'Neutral cards' : `${emp.name} · ${emp.capital}`;
    name.style.fontSize = ph ? 54 : 72; name.position.set(ph ? 56 : 96, ph ? 38 : 70);
    line.text = t.id === 'neutral' ? 'Soldiers, orders and hidden Yantras that any empire may take to war.' : `${st.material} frame. ${emp.passive}`;
    line.style.fontSize = ph ? 26 : 24; line.style.wordWrapWidth = W - (ph ? 200 : 500);
    line.position.set(ph ? 60 : 100, ph ? 100 : 156);
    shade.clear().rect(0, 0, W, ph ? 168 : 205).fill({ color: 0x0a0604, alpha: 0.55 });
  }

  function drawTabs(): void {
    tabs.removeChildren().forEach(c => destroyTree(c as Container));
    const ph = view.phone, W = view.w, H = view.h;
    const w = ph ? 170 : 210, gap = ph ? 14 : 16;
    const total = TABS.length * (w * view.ui) + (TABS.length - 1) * gap;
    TABS.forEach((t, i) => {
      const b = makeButton(t.name, () => { audio.play('click'); void show(i, 0); }, { w, primary: i === tab });
      b.position.set(W / 2 - total / 2 + (w * view.ui) / 2 + i * (w * view.ui + gap) - (ph ? 90 : 0), H - (ph ? 52 : 70));
      tabs.addChild(b);
    });
    const bk = makeButton('Back', back, { w: ph ? 150 : 170 });
    bk.position.set(W - (ph ? 112 : 120), ph ? 60 : 70);
    if (ph) bk.position.set(W - 112, H - 52);
    tabs.addChild(bk);
  }

  function drawNav(pages: number, g: ReturnType<typeof geometry>): void {
    nav.removeChildren().forEach(c => destroyTree(c as Container));
    if (pages < 2) return;
    const arrowBtn = (dir: -1 | 1) => {
      const c = new Container();
      const r = 34 * view.ui;
      const enabled = dir < 0 ? page > 0 : page < pages - 1;
      c.addChild(new Graphics().circle(0, 0, r).fill({ color: 0x140c07, alpha: 0.85 }).stroke({ width: 2, color: INK.gold, alpha: enabled ? 1 : 0.3 }));
      const t = new Text({ text: dir < 0 ? '‹' : '›', style: { fontFamily: FONT_SERIF, fontSize: Math.round(54 * view.ui), fontWeight: '700', fill: INK.goldPale } });
      t.anchor.set(0.5, 0.56); t.alpha = enabled ? 1 : 0.3; c.addChild(t);
      c.position.set(dir < 0 ? (g.ph ? 60 : 80) : g.W - (g.ph ? 60 : 80), g.top + (g.H - g.top - g.bottom) / 2);
      if (enabled) { c.eventMode = 'static'; c.cursor = 'pointer'; c.on('pointertap', () => { audio.play('cardDraw'); void show(tab, page + dir); }); }
      nav.addChild(c);
    };
    arrowBtn(-1); arrowBtn(1);
    const pg = new Text({ text: `${page + 1} / ${pages}`, style: { fontFamily: FONT_SERIF, fontSize: Math.round(22 * view.ui), fill: INK.cream, stroke: { color: 0x000000, width: 3 } } });
    pg.anchor.set(0.5); pg.position.set(g.W - (g.ph ? 60 : 80), g.top + (g.H - g.top - g.bottom) / 2 + 34 * view.ui + 26);
    nav.addChild(pg);
  }

  function inspect(id: string): void {
    if (inspecting) return;
    audio.play('cardDraw');
    inspecting = inspectOverlay(id, 0, () => { if (inspecting) destroyTree(inspecting); inspecting = null; });
    s.addChild(inspecting);
  }

  s.relayout = () => { if (inspecting) { destroyTree(inspecting); inspecting = null; } void show(tab, page); };
  s.enter = () => { audio.playMusic('music_title'); void show(0); };
  s.leave = () => { alive = false; };
  return s;
}
