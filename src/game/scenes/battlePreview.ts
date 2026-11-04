/* ============================================================
   Battle preview — two computer generals fight on the new war
   table. Proves the engine → event stream → Pixi animation path
   that Phase 1 builds the playable battle on.
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import gsap from 'gsap';
import {
  EMPIRES, EMPIRE_ORDER, aiTurn, allUnits, drainEvents, newGame,
  type GameEvent, type GameState, type PlayerIndex
} from '../../engine';
import { DESIGN_H, DESIGN_W, EMPIRE_STYLE, FONT_SERIF, INK } from '../theme';
import { lampGlow, teak, vignette } from '../textures';
import { CardView } from '../ui/cardView';
import { makeButton } from '../ui/button';
import type { Scene } from '../stage';

const BOARD_SCALE = 0.86;
const LINE_Y = { enemy: 262, front: 500, mine: 738 };
const BAND_X = 250, BAND_W = 1300, BAND_H = 206;
const slotX = (i: number, n: number) => 900 + (i - (n - 1) / 2) * 172;

export function battlePreviewScene(back: () => void): Scene {
  const s: Scene = new Container();
  s.design = { w: DESIGN_W, h: DESIGN_H };   // the old fixed board, letterboxed on phones
  let st: GameState;
  let busy = false, auto = false, alive = true;
  const views = new Map<number, CardView>();

  const wood = new Sprite(teak()); wood.width = DESIGN_W; wood.height = DESIGN_H; wood.tint = 0x9a7a62;
  const glow = new Sprite(lampGlow()); glow.anchor.set(0.5); glow.position.set(900, 500); glow.scale.set(3.6); glow.alpha = 0.7; glow.blendMode = 'add';
  s.addChild(wood, glow);

  const bands = new Graphics();
  const frontBand = new Graphics();
  s.addChild(bands, frontBand);
  const drawBands = () => {
    bands.clear();
    for (const y of [LINE_Y.enemy, LINE_Y.mine]) {
      bands.roundRect(BAND_X, y - BAND_H / 2, BAND_W, BAND_H, 14).fill({ color: 0x000000, alpha: 0.28 }).stroke({ width: 1, color: INK.gold, alpha: 0.25 });
    }
    frontBand.clear();
    const owner = st?.front.owner;
    const col = owner === null || owner === undefined ? INK.gold : EMPIRE_STYLE[st.players[owner].empire].accent;
    frontBand.roundRect(BAND_X, LINE_Y.front - BAND_H / 2, BAND_W, BAND_H, 14)
      .fill({ color: col, alpha: owner === null ? 0.08 : 0.2 }).stroke({ width: 2, color: col, alpha: 0.8 });
  };
  const label = (t: string, y: number) => {
    const x = new Text({ text: t, style: { fontFamily: FONT_SERIF, fontSize: 18, fontWeight: '700', letterSpacing: 6, fill: INK.gold } });
    x.alpha = 0.6; x.position.set(BAND_X + 18, y - BAND_H / 2 + 10); s.addChild(x);
  };
  label('ENEMY RAJYA', LINE_Y.enemy); label('YUDHBHUMI', LINE_Y.front); label('YOUR RAJYA', LINE_Y.mine);

  const durg = [makeDurg(), makeDurg()];
  durg[1].position.set(900, 80); durg[0].position.set(900, 950);
  s.addChild(durg[0], durg[1]);

  const unitLayer = new Container();
  s.addChild(unitLayer);
  const fx = new Container();
  s.addChild(fx);

  // side panel
  const panel = new Container(); panel.position.set(1600, 0);
  panel.addChild(new Graphics().rect(0, 0, 320, DESIGN_H).fill({ color: 0x0d0805, alpha: 0.82 }).moveTo(0, 0).lineTo(0, DESIGN_H).stroke({ width: 2, color: INK.gold, alpha: 0.5 }));
  const status = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 24, fill: INK.goldPale, wordWrap: true, wordWrapWidth: 270, lineHeight: 32 } });
  status.position.set(26, 40);
  panel.addChild(status);
  const bNext = makeButton('Next turn', () => step(), { primary: true, w: 260 });
  const bAuto = makeButton('Auto play', () => { auto = !auto; if (auto) loop(); }, { w: 260 });
  const bNew = makeButton('New battle', () => reset(), { w: 260 });
  const bBack = makeButton('Back', back, { w: 260 });
  [bNext, bAuto, bNew, bBack].forEach((b, i) => { b.position.set(160, 640 + i * 90); panel.addChild(b); });
  s.addChild(panel, Object.assign(new Sprite(vignette()), { width: DESIGN_W, height: DESIGN_H, alpha: 0.6, eventMode: 'none' }));

  function reset(): void {
    auto = false;
    views.forEach(v => v.destroy()); views.clear();
    const seed = Math.floor(Math.random() * 1e6);
    const a = EMPIRE_ORDER[seed % 5], b = EMPIRE_ORDER[(seed >> 3) % 5];
    st = newGame({ seed, player: { empire: a }, enemy: { empire: b } });
    drainEvents(st);
    layout(true);
  }

  function updateText(): void {
    const p = (i: PlayerIndex) => st.players[i];
    durg[0].set(p(0).hq.name, EMPIRES[p(0).empire].name, p(0).hq.hp, p(0).hq.maxHp, p(0).empire);
    durg[1].set(p(1).hq.name, EMPIRES[p(1).empire].name, p(1).hq.hp, p(1).hq.maxHp, p(1).empire);
    const who = EMPIRES[p(st.active).empire].name;
    status.text = st.over
      ? `Turn ${st.turn}\n\n${st.winner === null ? 'A draw.' : `${EMPIRES[p(st.winner).empire].name} wins the war.`}`
      : `Turn ${st.turn}\n${who} to act\n\nKosha  ${p(0).kosha}/${p(0).maxKosha}  ·  ${p(1).kosha}/${p(1).maxKosha}\nHands  ${p(0).hand.length}  ·  ${p(1).hand.length}\n\n` +
        st.log.slice(-6).map(l => l.msg).join('\n');
    status.style.fontSize = 20;
    drawBands();
  }

  /** move every living unit to its slot; create views for new units */
  function layout(instant = false): void {
    const place = (list: { uid: number; cardId: string; atk: number; hp: number }[], y: number, fromY: number) => {
      list.forEach((u, i) => {
        let v = views.get(u.uid);
        if (!v) {
          v = new CardView(u.cardId);
          v.scale.set(BOARD_SCALE);
          v.position.set(slotX(i, list.length), fromY);
          v.alpha = 0;
          unitLayer.addChild(v); views.set(u.uid, v);
        }
        v.setStats(u.atk, u.hp);
        gsap.to(v, { x: slotX(i, list.length), y, alpha: 1, duration: instant ? 0 : 0.45, ease: 'power2.out' });
      });
    };
    place(st.players[1].support, LINE_Y.enemy, -150);
    place(st.players[0].support, LINE_Y.mine, DESIGN_H + 150);
    place(st.front.units, LINE_Y.front, LINE_Y.front);
    updateText();
  }

  async function play(events: GameEvent[]): Promise<void> {
    for (const e of events) {
      if (!alive) return;
      if (e.t === 'attack') {
        const a = views.get(e.uid), d = views.get(e.target.uid);
        if (a && d) await lunge(a, d.x, d.y, e.dmg);
      } else if (e.t === 'hq') {
        const a = views.get(e.uid);
        const target = durg[e.owner];
        if (a) await lunge(a, target.x, target.y, e.dmg); else await hit(target.x, target.y, e.dmg);
        gsap.fromTo(s, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
      } else if (e.t === 'yantra') {
        await banner(`${EMPIRES[st.players[e.owner].empire].name} springs a Yantra`);
      }
    }
    // remove the fallen
    const living = new Set<number>([...allUnits(st, 0), ...allUnits(st, 1)].map(x => x.unit.uid));
    for (const [uid, v] of views) {
      if (!living.has(uid)) {
        views.delete(uid);
        gsap.to(v, { alpha: 0, rotation: 0.3, y: v.y + 40, duration: 0.5, onComplete: () => v.destroy() });
      }
    }
  }

  async function lunge(v: CardView, tx: number, ty: number, dmg: number): Promise<void> {
    const ox = v.x, oy = v.y;
    unitLayer.addChild(v);
    await gsap.to(v, { x: ox + (tx - ox) * 0.7, y: oy + (ty - oy) * 0.7, duration: 0.22, ease: 'power2.in' });
    void hit(tx, ty, dmg);
    await gsap.to(v, { x: ox, y: oy, duration: 0.3, ease: 'power2.out' });
  }

  async function hit(x: number, y: number, dmg: number): Promise<void> {
    const burst = new Graphics().circle(0, 0, 60).fill({ color: 0xffa040, alpha: 0.6 });
    burst.blendMode = 'add'; burst.position.set(x, y);
    const n = new Text({ text: `−${dmg}`, style: { fontFamily: FONT_SERIF, fontSize: 56, fontWeight: '700', fill: 0xffe3b0, stroke: { color: 0x5a1208, width: 6 } } });
    n.anchor.set(0.5); n.position.set(x, y);
    fx.addChild(burst, n);
    gsap.fromTo(burst.scale, { x: 0.2, y: 0.2 }, { x: 1.6, y: 1.6, duration: 0.35 });
    gsap.to(burst, { alpha: 0, duration: 0.35, onComplete: () => burst.destroy() });
    await gsap.to(n, { y: y - 70, alpha: 0, duration: 0.8, ease: 'power1.out', onComplete: () => n.destroy() });
  }

  async function banner(text: string): Promise<void> {
    const t = new Text({ text, style: { fontFamily: FONT_SERIF, fontSize: 48, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    t.anchor.set(0.5); t.position.set(900, 500); fx.addChild(t);
    await gsap.fromTo(t, { alpha: 0, y: 520 }, { alpha: 1, y: 500, duration: 0.3 });
    await gsap.to(t, { alpha: 0, duration: 0.4, delay: 0.5, onComplete: () => t.destroy() });
  }

  async function step(): Promise<void> {
    if (busy || st.over) return;
    busy = true;
    aiTurn(st, st.active, 'normal');
    const events = drainEvents(st);
    // deployments slide in before the fighting starts
    layout();
    await new Promise(r => setTimeout(r, 450));
    await play(events);
    layout();
    busy = false;
  }

  async function loop(): Promise<void> {
    while (auto && alive && !st.over) { await step(); await new Promise(r => setTimeout(r, 350)); }
    auto = false;
  }

  s.enter = () => reset();
  s.leave = () => { alive = false; auto = false; gsap.killTweensOf(s); };
  return s;
}

interface Durg extends Container { set(name: string, empire: string, hp: number, max: number, id: keyof typeof EMPIRE_STYLE): void }
function makeDurg(): Durg {
  const c = new Container() as Durg;
  const g = new Graphics();
  const name = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 30, fontWeight: '700', fill: INK.goldPale } });
  const sub = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 15, letterSpacing: 4, fill: INK.gold } });
  const hp = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 44, fontWeight: '700', fill: 0xffffff } });
  name.anchor.set(0, 0.5); name.position.set(-230, -10);
  sub.anchor.set(0, 0.5); sub.position.set(-230, 20);
  hp.anchor.set(1, 0.5); hp.position.set(230, 2);
  c.addChild(g, name, sub, hp);
  c.set = (n, e, h, m, id) => {
    const st = EMPIRE_STYLE[id];
    g.clear();
    g.roundRect(-260, -46, 520, 92, 10).fill({ color: 0x140c07, alpha: 0.9 }).stroke({ width: 3, color: st.frame });
    g.roundRect(-252, 36, 504 * Math.max(0, h) / m, 4, 2).fill(h / m > 0.4 ? INK.malachite : INK.vermilion);
    name.text = n; sub.text = `${e.toUpperCase()} · DURG`; hp.text = `${Math.max(0, h)} / ${m}`;
  };
  return c;
}
