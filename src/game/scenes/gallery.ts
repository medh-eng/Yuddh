/* ============================================================
   Chitrashala, the card gallery: every card in its empire's frame,
   one empire at a time, over that empire's home battlefield. The cards
   (and the empire names below) sit in swipeable strips at one large size,
   so nothing shrinks or crowds however many there are.
   Tap a card to read it at full size. A place for Pon to judge the
   paintings in the game itself; later the seed of the collection.
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import gsap from 'gsap';
import { CARDS, EMPIRES, type CardDef, type EmpireId } from '../../engine';
import { FONT_BODY, FONT_STORY, INK, EMPIRE_STYLE, FONT_TITLE } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H, FACE_W } from '../cards/paint';
import { makeButton } from '../ui/button';
import { makePan, panHints, type Pan } from '../ui/pan';
import { inspectOverlay } from '../ui/inspect';
import { audio } from '../audio';
import { loadArt, loadBattlefield } from '../../assets/manifest';
import { destroyTree, type Scene, type Stage } from '../stage';

type TabId = EmpireId | 'nanda' | 'seleucid' | 'naga' | 'vardhana' | 'forest' | 'kanchi' | 'srivijaya' | 'pala' | 'sinhala' | 'ghurid' | 'pallava' | 'kalinga';
const TABS: { id: TabId; name: string; ground: string; place: string }[] = [
  { id: 'maurya', name: 'Maurya', ground: 'pataliputra', place: 'Pataliputra' },
  { id: 'gupta', name: 'Gupta', ground: 'ujjain', place: 'Ujjain' },
  { id: 'chalukya', name: 'Chalukya', ground: 'narmada', place: 'the Narmada' },
  { id: 'chola', name: 'Chola', ground: 'thanjavur', place: 'Thanjavur' },
  { id: 'rajput', name: 'Rajput', ground: 'tarain', place: 'Tarain' },
  { id: 'nanda', name: 'Nanda', ground: 'pataliputra', place: 'Pataliputra' },
  { id: 'seleucid', name: 'Seleucid', ground: 'indus', place: 'the Indus' },
  { id: 'naga', name: 'Naga', ground: 'padmavati', place: 'Padmavati' },
  { id: 'vardhana', name: 'Vardhana', ground: 'narmada', place: 'Kanauj and the Narmada' },
  { id: 'forest', name: 'Forest', ground: 'mahakantara', place: 'Mahakantara' },
  { id: 'kanchi', name: 'Kanchi', ground: 'kanchi', place: 'Kanchi' },
  { id: 'srivijaya', name: 'Kadaram', ground: 'kadaram', place: 'Kadaram' },
  { id: 'pala', name: 'Pala', ground: 'ganga', place: 'The Ganga' },
  { id: 'sinhala', name: 'Sinhala', ground: 'anuradhapura', place: 'Anuradhapura' },
  { id: 'ghurid', name: 'Ghurid', ground: 'tarain', place: 'Tarain' },
  { id: 'pallava', name: 'Pallava', ground: 'pullalur', place: 'Pullalur' },
  { id: 'kalinga', name: 'Kalinga', ground: 'dhauli', place: 'Dhauli' },
  { id: 'neutral', name: 'Neutral', ground: 'title', place: 'any field' }
];

const order = (c: CardDef) => (c.type === 'unit' ? 0 : c.type === 'yantra' ? 2 : 1) * 100 + c.cost;

export function galleryScene(stage: Stage, back: () => void): Scene {
  const s: Scene = new Container();
  let tab = 0, alive = true, loadToken = 0;
  let inspecting: Container | null = null;

  const head = new Container();
  const grid = new Container();
  const tabs = new Container();
  const nav = new Container();
  s.addChild(head, grid, tabs, nav);

  const kicker = new Text({ text: 'CHITRASHALA · THE CARD GALLERY', style: { fontFamily: FONT_TITLE, fontSize: 20, fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
  const name = new Text({ text: '', style: { fontFamily: FONT_TITLE, fontSize: 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
  const line = new Text({ text: '', style: { fontFamily: FONT_STORY, fontWeight: '500', fontSize: 24, fontStyle: 'italic', fill: INK.creamBright, stroke: { color: 0x000000, width: 4 }, wordWrap: true, wordWrapWidth: 1200 } });
  const shade = new Graphics();
  head.addChild(shade, kicker, name, line);

  // the Nanda court's cards are neutral in the rules but get their own page
  const cards = (id: TabId) => Object.values(CARDS).filter(c => id === 'nanda' ? c.id.startsWith('nd_') : id === 'seleucid' ? c.id.startsWith('se_') : id === 'naga' ? c.id.startsWith('na_') : id === 'vardhana' ? c.id.startsWith('vd_') : id === 'forest' ? c.id.startsWith('mk_') : id === 'kanchi' ? c.id.startsWith('pk_') : id === 'srivijaya' ? c.id.startsWith('sv_') : id === 'pala' ? c.id.startsWith('pl_') : id === 'sinhala' ? c.id.startsWith('si_') : id === 'ghurid' ? c.id.startsWith('gh_') : id === 'pallava' ? c.id.startsWith('pv_') : id === 'kalinga' ? c.id.startsWith('kl_') : c.empire === id && !/^(nd|se|na|vd|mk|pk|sv|pl|si|gh|pv|kl)_/.test(c.id)).sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));

  const slots = new Map<number, Sprite>();
  let tabOff = 0;

  /** the card strip: one row at one large size, as long as it needs to be */
  function layoutCards(list: CardDef[]): void {
    const W = view.w, H = view.h, ph = view.phone;
    const top = ph ? 172 : 210, bottom = ph ? 100 : 150;
    const box = { x: 40, y: top, w: W - 80, h: H - top - bottom };
    const k = Math.min(0.9, (box.h - 30) / FACE_H);
    const cw = FACE_W * k, gap = ph ? 30 : 40, padX = ph ? 60 : 100;
    const n = list.length;
    const contentW = padX * 2 + n * cw + (n - 1) * gap;
    const offX = contentW <= box.w ? (box.w - contentW) / 2 : 0;
    const pan: Pan = makePan(box, { keys: true });
    pan.setWidth(contentW);
    slots.clear();
    const xOf = (i: number): number => offX + padX + cw / 2 + i * (cw + gap);
    const yC = box.h / 2;
    let first = true;
    // only the cards near the window are built; the rest are made as they come into view
    const refresh = (): void => {
      const lo = pan.offset() - cw * 1.5, hi = pan.offset() + box.w + cw * 1.5;
      for (let i = 0; i < n; i++) {
        const x = xOf(i), vis = x + cw / 2 > lo && x - cw / 2 < hi;
        const have = slots.get(i);
        if (!vis && have) { destroyTree(have); slots.delete(i); }
        else if (vis && !have) {
          const c = list[i];
          const sp = new Sprite(cardFace(c.id)); sp.anchor.set(0.5); sp.scale.set(k); sp.position.set(x, yC);
          sp.eventMode = 'static'; sp.cursor = 'pointer';
          sp.on('pointerover', () => gsap.to(sp.scale, { x: k * 1.04, y: k * 1.04, duration: 0.15 }));
          sp.on('pointerout', () => gsap.to(sp.scale, { x: k, y: k, duration: 0.15 }));
          sp.on('pointertap', () => { if (pan.dragged()) return; inspect(c.id); });
          pan.content.addChild(sp); slots.set(i, sp);
          if (first) gsap.from(sp, { alpha: 0, y: yC + 20, duration: 0.35, delay: slots.size * 0.04, ease: 'power2.out' });
        }
      }
      first = false;
    };
    pan.onScroll(refresh);
    refresh();
    grid.addChild(pan.view, panHints(pan, { k: view.ui }));
    const count = new Text({ text: `${n} cards${pan.max() > 0 ? ' · swipe sideways' : ''}`, style: { fontFamily: FONT_BODY, fontSize: Math.round(24 * view.ui), fontWeight: '700', fill: INK.cream, stroke: { color: 0x000000, width: 3 } } });
    count.anchor.set(1, 1); count.position.set(W - 50, top - 6); count.eventMode = 'none';
    grid.addChild(count);
  }

  async function show(i: number): Promise<void> {
    const sameTab = i === tab;
    tab = i;
    const t = TABS[i];
    const token = ++loadToken;
    const list = cards(t.id);
    void loadBattlefield(t.ground).then(tex => { if (alive && token === loadToken) stage.setBackdrop(tex, 0.5); });
    drawTabs(sameTab); drawHead();
    grid.removeChildren().forEach(c => destroyTree(c as Container));
    slots.clear();
    const wait = new Text({ text: 'Unrolling the paintings…', style: { fontFamily: FONT_STORY, fontWeight: '500', fontSize: Math.round(26 * view.ui), fontStyle: 'italic', fill: INK.cream } });
    wait.anchor.set(0.5); wait.position.set(view.w / 2, view.h / 2); grid.addChild(wait);
    await loadArt(list.map(c => c.id));
    if (!alive || token !== loadToken) return;
    grid.removeChildren().forEach(c => destroyTree(c as Container));
    layoutCards(list);
  }

  function drawHead(): void {
    const t = TABS[tab], ph = view.phone, W = view.w;
    const eid: EmpireId = t.id === 'nanda' || t.id === 'seleucid' || t.id === 'naga' || t.id === 'vardhana' || t.id === 'forest' || t.id === 'kanchi' || t.id === 'srivijaya' || t.id === 'pala' || t.id === 'sinhala' || t.id === 'ghurid' || t.id === 'pallava' || t.id === 'kalinga' ? 'neutral' : t.id;
    const st = EMPIRE_STYLE[eid];
    const emp = EMPIRES[eid];
    kicker.style.fontSize = Math.round(20 * view.ui); kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    name.text = t.id === 'nanda' ? 'The Nanda court · Pataliputra' : t.id === 'seleucid' ? 'The Seleucid host · the Indus' : t.id === 'naga' ? 'The Naga kings · Padmavati' : t.id === 'vardhana' ? 'Harsha and the Vardhana host · Kanauj' : t.id === 'forest' ? 'Vyaghraraja and the forest kingdoms · Mahakantara' : t.id === 'kanchi' ? 'Vishnugopa and the walls of Kanchi' : t.id === 'srivijaya' ? 'The sea kings · Kadaram' : t.id === 'pala' ? 'The Pala empire · the Ganga' : t.id === 'sinhala' ? 'The kingdom of Anuradhapura · Lanka' : t.id === 'ghurid' ? 'The Ghurid sultanate · Ghur and Ghazni' : t.id === 'pallava' ? 'Mahendravarman and the Pallava host · Kanchi' : t.id === 'kalinga' ? 'The kingdom of Kalinga · Dhauli and the Daya' : t.id === 'neutral' ? 'Neutral cards' : `${emp.name} · ${emp.capital}`;
    name.style.fontSize = ph ? 54 : 72; name.position.set(ph ? 56 : 96, ph ? 38 : 70);
    line.text = t.id === 'nanda' ? 'Dhana Nanda, his minister, his elephants and his gold: the enemy of The First Throne.'
      : t.id === 'seleucid' ? 'Seleucus, his phalanx, his Companion cavalry and his catapults: the enemy of The Indus Line.'
      : t.id === 'vardhana' ? "Harsha of Kanauj, his elephants, horse and poet: the enemy of The Narmada Line."
      : t.id === 'forest' ? 'The tiger-king, his hidden archers, forest elephants and snares: the enemy of The Great Forest.'
      : t.id === 'kanchi' ? 'Vishnugopa, his gate guards, elephants, chariots and scholars: the enemy of The Walls of Kanchi.'
      : t.id === 'pala' ? 'Mahipala I, the Pala war elephants, river-boat archers and the monastery teachers: the enemy of The Ganga Road.'
      : t.id === 'ghurid' ? "Mu'izz al-Din, the guard cavalry, mounted archers, the war-drums, the foot archers who shoot elephants and the fort: the enemy of both Tarains and Chandawar."
      : t.id === 'pallava' ? "Mahendravarman, the builders' guard, the Pallava war elephants and the retreat to Kanchi: the enemy of Pullalur."
      : t.id === 'kalinga' ? 'The Kalinga elephants, foot, bowmen and the river in spate: the enemy of The Kalinga War.'
      : t.id === 'sinhala' ? 'Mahinda V, the war elephants, archers, the Maha Thera and the Great Tank: the enemy of The Crossing to Lanka.'
      : t.id === 'srivijaya' ? 'Sangrama Vijayottungavarman, his boat wall, harbour archers and fire boats: the enemy of Rajendra\'s Sea Road.'
      : t.id === 'naga' ? 'Ganapati Naga, Nagasena, Achyuta and their clan warriors: the enemy of The Digvijaya.'
      : t.id === 'neutral' ? 'Soldiers, orders and hidden Yantras that any empire may take to war.' : `${st.material} frame. ${emp.passive}`;
    line.style.fontSize = ph ? 26 : 24; line.style.wordWrapWidth = W - (ph ? 120 : 500);
    line.position.set(ph ? 60 : 100, ph ? 100 : 156);
    shade.clear().rect(0, 0, W, ph ? 168 : 205).fill({ color: 0x0a0604, alpha: 0.55 });
  }

  function drawTabs(keepScroll: boolean): void {
    tabs.removeChildren().forEach(c => destroyTree(c as Container));
    nav.removeChildren().forEach(c => destroyTree(c as Container));
    const ph = view.phone, W = view.w, H = view.h, k = view.ui;
    const gap = ph ? 14 : 18, w = ph ? 190 : 210, step = w * k + gap;
    const box = { x: 40, y: H - (ph ? 100 : 134), w: W - 80, h: ph ? 96 : 120 };
    const pan = makePan(box);
    const contentW = TABS.length * step - gap + 24;
    pan.setWidth(contentW);
    TABS.forEach((t, i) => {
      const b = makeButton(t.name, () => { if (pan.dragged()) return; audio.play('click'); void show(i); }, { w, primary: i === tab });
      b.position.set(12 + (w * k) / 2 + i * step, box.h / 2);
      pan.content.addChild(b);
    });
    const want = 12 + tab * step + (w * k) / 2 - box.w / 2;
    pan.scrollTo(keepScroll ? tabOff : want, false);
    pan.onScroll(() => { tabOff = pan.offset(); });
    tabOff = pan.offset();
    tabs.addChild(pan.view);
    nav.addChild(panHints(pan, { k, cy: box.y + box.h / 2, r: 26 * k, bar: false }));
    const bk = makeButton('Back', back, { w: ph ? 150 : 170 });
    bk.position.set(W - (ph ? 112 : 120), ph ? 60 : 70);
    if (ph) bk.position.set(W - 104, 52);
    tabs.addChild(bk);
  }

  function inspect(id: string): void {
    if (inspecting) return;
    audio.play('cardDraw');
    inspecting = inspectOverlay(id, 0, () => { if (inspecting) destroyTree(inspecting); inspecting = null; });
    s.addChild(inspecting);
  }

  s.relayout = () => { if (inspecting) { destroyTree(inspecting); inspecting = null; } void show(tab); };
  (window as unknown as { __yuddhGalleryTab: (name: string) => void }).__yuddhGalleryTab = name => { const i = TABS.findIndex(t => t.name === name); if (i >= 0) void show(i); };
  s.enter = () => { audio.playMusic('music_title'); void show(0); };
  s.leave = () => { alive = false; };
  return s;
}
