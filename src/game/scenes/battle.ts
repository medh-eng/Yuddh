/* ============================================================
   The battle. Drag a card from your hand onto the field to play it;
   drag a ready unit up to the Yudhbhumi to advance, or onto an enemy
   to attack. Tapping works too: tap to select, tap the target.
   Long-press or right-click any card to read it at full size.

   The engine owns the rules; this file only shows them. The enemy's
   turn is recorded action by action and replayed with animation.
   ============================================================ */
import { Assets, Container, FederatedPointerEvent, Graphics, Point, Sprite, Text, Texture } from 'pixi.js';
import gsap from 'gsap';
import {
  CARDS, EMPIRES, actionObservers, aiTurn, allUnits, applyAction, canAttack, canMove, canPlay,
  drainEvents, type Action, type GameEvent, type GameState, type PlayerIndex, type Target, type Unit
} from '../../engine';
import { FIRST_THRONE, firstThroneGame } from '../../campaign/firstThrone';
import { DESIGN_H, DESIGN_W, FONT_SERIF, INK } from '../theme';
import { audio, type Sfx } from '../audio';
import { cardFace } from '../cards/paint';
import { DurgView, HAND_SCALE, HandCard, TOKEN_DH, TokenView, drawDiyas, stopTweens } from '../cards/views';
import { makeButton } from '../ui/button';
import { destroyTree, type Scene, type Stage } from '../stage';

/* ---------------- layout (design px, 1920×1080) ---------------- */
const LANE_X = 300, LANE_W = 1120, LANE_H = 236;
const LINE_Y = { enemy: 186, front: 448, mine: 710 } as const;
const SLOT_CX = LANE_X + LANE_W / 2, SLOT_GAP = 196;
const slotX = (i: number, n: number) => SLOT_CX + (i - (n - 1) / 2) * SLOT_GAP;
const DURG_X = 158;
const HAND_Y = 964, HAND_CX = 860;
const ENEMY_HAND = { x: 1690, y: 70 };
const RIGHT_X = 1690;

type Snap = GameState;
type Drag =
  | { kind: 'card'; index: number; view: HandCard; moved: boolean; sx: number; sy: number; downAt: number }
  | { kind: 'unit'; uid: number; view: TokenView; moved: boolean; sx: number; sy: number; downAt: number };
type Pick = { kind: 'card'; index: number } | { kind: 'unit'; uid: number } | null;

function snapshot(st: GameState): Snap {
  const { rng, ...rest } = st;
  const copy = JSON.parse(JSON.stringify({ ...rest, log: [], events: [] })) as Snap;
  copy.rng = rng;
  return copy;
}

export function battleScene(stage: Stage, exit: () => void): Scene {
  const s: Scene = new Container();
  let st: GameState;
  let shown: Snap;                       // what the screen currently shows
  let busy = false, alive = true;
  let drag: Drag | null = null;
  let pick: Pick = null;
  let longPress: ReturnType<typeof setTimeout> | null = null;
  let inspecting: Container | null = null;
  let hoverIdx = -1;
  let pressAt: { x: number; y: number } | null = null;

  const tokens = new Map<number, TokenView>();
  let hand: HandCard[] = [];
  let enemyHand: HandCard[] = [];

  /* ---------------- scenery ---------------- */
  const tex = Texture.from(`${import.meta.env.BASE_URL}assets/battlefields/${FIRST_THRONE.battlefield}.webp`);
  stage.setBackdrop(tex, 0.62);

  const lanes = new Graphics();
  const frontGlow = new Graphics();
  s.addChild(lanes, frontGlow);
  const laneLabel = (t: string, y: number) => {
    const x = new Text({ text: t, style: { fontFamily: FONT_SERIF, fontSize: 18, fontWeight: '700', letterSpacing: 7, fill: INK.goldPale } });
    x.alpha = 0.55; x.anchor.set(0, 0.5); x.position.set(LANE_X + 18, y - LANE_H / 2 + 18); s.addChild(x);
  };
  laneLabel('ENEMY RAJYA', LINE_Y.enemy); laneLabel('YUDHBHUMI', LINE_Y.front); laneLabel('YOUR RAJYA', LINE_Y.mine);

  const durg: [DurgView, DurgView] = [new DurgView(0, 'n_sena_bhojan'), new DurgView(1, 'y_kavach')];
  durg[0].position.set(DURG_X, LINE_Y.mine); durg[1].position.set(DURG_X, LINE_Y.enemy);
  s.addChild(durg[0], durg[1]);

  // right column: enemy info, end turn, your treasury, yantras
  const enemyInfo = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 22, fill: INK.goldPale, align: 'center' } });
  enemyInfo.anchor.set(0.5); enemyInfo.position.set(RIGHT_X, 180);
  const enemyDiyas = new Graphics(); enemyDiyas.position.set(RIGHT_X - 85, 222); enemyDiyas.scale.set(0.8);
  const myDiyas = new Graphics(); myDiyas.position.set(RIGHT_X - 106, 846);
  const myKosha = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 40, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 5 } } });
  myKosha.anchor.set(0.5); myKosha.position.set(RIGHT_X, 800);
  const koshaLabel = new Text({ text: 'KOSHA', style: { fontFamily: FONT_SERIF, fontSize: 16, fontWeight: '700', letterSpacing: 6, fill: INK.gold } });
  koshaLabel.anchor.set(0.5); koshaLabel.position.set(RIGHT_X, 766);
  s.addChild(enemyInfo, enemyDiyas, myDiyas, myKosha, koshaLabel);

  const yantraRow: [Container, Container] = [new Container(), new Container()];
  yantraRow[0].position.set(LANE_X + LANE_W + 66, LINE_Y.mine); yantraRow[1].position.set(LANE_X + LANE_W + 66, LINE_Y.enemy);
  s.addChild(yantraRow[0], yantraRow[1]);

  const endBtn = new Container();
  const endG = new Graphics();
  const endT = new Text({ text: 'END TURN', style: { fontFamily: FONT_SERIF, fontSize: 26, fontWeight: '700', letterSpacing: 4, fill: 0x24170e, align: 'center' } });
  endT.anchor.set(0.5);
  endBtn.addChild(endG, endT); endBtn.position.set(RIGHT_X, LINE_Y.front);
  endBtn.eventMode = 'static'; endBtn.cursor = 'pointer';
  endBtn.on('pointertap', () => { if (!busy && shown.active === 0 && !shown.over) void endTurn(); });
  s.addChild(endBtn);
  let endPulse: gsap.core.Tween | null = null;
  function drawEnd(state: 'mine' | 'ready' | 'enemy'): void {
    endG.clear();
    const fill = state === 'enemy' ? 0x3a2a1c : INK.gold;
    endG.circle(0, 0, 92).fill({ color: 0x000000, alpha: 0.5 });
    endG.circle(0, 0, 84).fill(fill).stroke({ width: 5, color: state === 'ready' ? 0x7dff8a : 0x24170e });
    endG.circle(0, 0, 72).stroke({ width: 2, color: 0x24170e, alpha: 0.5 });
    endT.text = state === 'enemy' ? 'ENEMY\nTURN' : 'END\nTURN';
    endT.style.fill = state === 'enemy' ? INK.smoke : 0x24170e;
    endPulse?.kill(); endBtn.scale.set(1);
    if (state === 'ready') endPulse = gsap.to(endBtn.scale, { x: 1.06, y: 1.06, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // top hint bar
  const hint = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 24, fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 4 } } });
  hint.anchor.set(0.5); hint.position.set(SLOT_CX, 38);
  s.addChild(hint);

  const unitLayer = new Container();
  const handLayer = new Container();
  const fx = new Container();
  const arrow = new Graphics();
  s.addChild(unitLayer, handLayer, arrow, fx);

  // small round buttons: menu, music, sound
  const mkRound = (label: string, x: number, fn: () => void) => {
    const c = new Container();
    const g = new Graphics().circle(0, 0, 26).fill({ color: 0x140c07, alpha: 0.85 }).stroke({ width: 2, color: INK.gold });
    const t = new Text({ text: label, style: { fontFamily: FONT_SERIF, fontSize: 20, fontWeight: '700', fill: INK.goldPale } }); t.anchor.set(0.5);
    c.addChild(g, t); c.position.set(x, 1040); c.eventMode = 'static'; c.cursor = 'pointer'; c.on('pointertap', fn);
    s.addChild(c); return t;
  };
  const musicT = mkRound('♪', 1780, () => { musicT.alpha = audio.toggleMusic() ? 1 : 0.35; });
  const sfxT = mkRound('◈', 1840, () => { sfxT.alpha = audio.toggleSfx() ? 1 : 0.35; });
  mkRound('✕', 1720, () => confirmLeave());

  /* ---------------- start ---------------- */
  function start(): void {
    st = firstThroneGame(Math.floor(Math.random() * 1e9), 'normal');
    drainEvents(st);
    shown = snapshot(st);
    tokens.forEach(t => t.destroy()); tokens.clear();
    hand.forEach(h => h.destroy()); hand = [];
    enemyHand.forEach(h => h.destroy()); enemyHand = [];
    reconcile(shown, true);
    void briefing();
  }

  async function briefing(): Promise<void> {
    busy = true;
    const panel = new Container();
    const dim = new Graphics().rect(0, 0, DESIGN_W, DESIGN_H).fill({ color: 0x000000, alpha: 0.72 });
    dim.eventMode = 'static';
    const art = new Sprite(cardFace('m_chandragupta')); art.anchor.set(0.5); art.scale.set(0.8); art.position.set(560, 520); art.rotation = -0.05;
    const t1 = new Text({ text: `${FIRST_THRONE.place.toUpperCase()} · ${FIRST_THRONE.year.toUpperCase()}`, style: { fontFamily: FONT_SERIF, fontSize: 22, fontWeight: '700', letterSpacing: 8, fill: INK.gold } });
    const t2 = new Text({ text: FIRST_THRONE.title, style: { fontFamily: FONT_SERIF, fontSize: 86, fontWeight: '700', fill: INK.goldPale } });
    const t3 = new Text({ text: FIRST_THRONE.briefing, style: { fontFamily: FONT_SERIF, fontSize: 30, fill: INK.cream, wordWrap: true, wordWrapWidth: 820, lineHeight: 42 } });
    const t4 = new Text({ text: 'Destroy the Nanda Durg before they destroy yours.', style: { fontFamily: FONT_SERIF, fontSize: 26, fontStyle: 'italic', fill: INK.gold } });
    t1.position.set(860, 300); t2.position.set(856, 336); t3.position.set(860, 460); t4.position.set(860, 680);
    const go = makeButton('To battle', () => {
      audio.unlock(); audio.play('conch');
      gsap.to(panel, { alpha: 0, duration: 0.4, onComplete: () => { destroyTree(panel); busy = false; void turnBanner(0); refreshInteractivity(); } });
    }, { primary: true, w: 340 });
    go.position.set(1030, 800);
    panel.addChild(dim, art, t1, t2, t3, t4, go);
    s.addChild(panel);
    gsap.from([t1, t2, t3, t4, go], { alpha: 0, y: '+=24', duration: 0.8, stagger: 0.1, ease: 'power2.out' });
    gsap.from(art, { alpha: 0, x: '-=60', duration: 0.9, ease: 'power2.out' });
  }

  /* ============================================================
     reconcile: make the screen match a game state.
     Damage shows as floating numbers; the fallen burn away.
     ============================================================ */
  function reconcile(state: Snap, instant = false, spawn = new Map<number, { x: number; y: number; scale?: number }>()): void {
    shown = state;
    const d = instant ? 0 : 0.42;
    const place = (list: Unit[], y: number, defaultFrom: { x: number; y: number; scale?: number }) => {
      list.forEach((u, i) => {
        let v = tokens.get(u.uid);
        if (!v) {
          v = new TokenView(u);
          const sp = spawn.get(u.uid) ?? defaultFrom;
          v.position.set(sp.x, sp.y); v.scale.set(sp.scale ?? 0.4); v.alpha = instant ? 1 : 0;
          unitLayer.addChild(v); tokens.set(u.uid, v);
          bindToken(v);
          gsap.to(v.scale, { x: 1, y: 1, duration: instant ? 0 : 0.42, ease: 'back.out(1.6)' });
          gsap.to(v, { alpha: 1, duration: instant ? 0 : 0.2 });
        } else {
          const dh = v.hp - u.hp;
          if (dh > 0 && !instant) floatNumber(v.x, v.y - 40, `−${dh}`, 0xffd2b0);
          if (dh < 0 && !instant) floatNumber(v.x, v.y - 40, `+${-dh}`, 0x9cff8a);
          if (u.atk > v.atk && !instant) floatNumber(v.x - 60, v.y + 70, `+${u.atk - v.atk}`, 0xffc04a);
        }
        v.update(u);
        v.setSpent(u.owner === state.active && (u.attacked || !u.canAct) && !state.over);
        gsap.to(v, { x: slotX(i, list.length), y, rotation: 0, duration: d, ease: 'power2.out' });
      });
    };
    place(state.players[1].support, LINE_Y.enemy, ENEMY_HAND);
    place(state.players[0].support, LINE_Y.mine, { x: HAND_CX, y: HAND_Y });
    place(state.front.units, LINE_Y.front, { x: SLOT_CX, y: LINE_Y.front });

    // the fallen
    const living = new Set([...state.players[0].support, ...state.players[1].support, ...state.front.units].map(u => u.uid));
    for (const [uid, v] of tokens) {
      if (living.has(uid)) continue;
      tokens.delete(uid);
      if (!instant) { if (v.hp > 0) floatNumber(v.x, v.y - 40, '✕', 0xff8f7a); burnAway(v); } else v.destroy();
    }

    // Durgs
    for (const i of [0, 1] as PlayerIndex[]) {
      const p = state.players[i];
      const dh = durg[i].hp - p.hq.hp;
      if (!instant && durg[i].hp && dh > 0) floatNumber(durg[i].x, durg[i].y - 10, `−${dh}`, 0xffd2b0, 72);
      if (!instant && durg[i].hp && dh < 0) floatNumber(durg[i].x, durg[i].y - 10, `+${-dh}`, 0x9cff8a, 64);
      durg[i].set(p.hq.name, i === 0 ? EMPIRES[p.empire].name : p.faction, p.hq.hp, p.hq.maxHp);
    }

    // yantras face-down
    for (const i of [0, 1] as PlayerIndex[]) {
      const row = yantraRow[i];
      const want = state.players[i].yantras.length;
      while (row.children.length > want) { const ch = row.children[row.children.length - 1] as Container; stopTweens(ch); ch.destroy(); }
      while (row.children.length < want) {
        const b = new HandCard('y_kavach', 0, true);
        b.scale.set(0.22); b.eventMode = 'none';
        b.position.set(0, (row.children.length - 0.5) * 76 + (want === 1 ? 38 : 0));
        row.addChild(b);
      }
      row.children.forEach((c, k) => { c.y = want === 1 ? 0 : (k - 0.5) * 80; });
    }

    // front line colour
    frontGlow.clear(); lanes.clear();
    for (const y of [LINE_Y.enemy, LINE_Y.mine]) {
      lanes.roundRect(LANE_X, y - LANE_H / 2, LANE_W, LANE_H, 16).fill({ color: 0x0c0704, alpha: 0.42 }).stroke({ width: 1.5, color: INK.gold, alpha: 0.35 });
    }
    const fo = state.front.owner;
    const fcol = fo === null ? INK.gold : fo === 0 ? 0xe7c46e : 0xe0674a;
    frontGlow.roundRect(LANE_X, LINE_Y.front - LANE_H / 2, LANE_W, LANE_H, 16)
      .fill({ color: fo === null ? 0x0c0704 : fcol, alpha: fo === null ? 0.42 : 0.16 })
      .stroke({ width: fo === null ? 1.5 : 3, color: fcol, alpha: fo === null ? 0.35 : 0.9 });

    // treasury
    const me = state.players[0], foe = state.players[1];
    myKosha.text = `${me.kosha} / ${me.maxKosha}`;
    drawDiyas(myDiyas, me.kosha, me.maxKosha);
    drawDiyas(enemyDiyas, foe.kosha, foe.maxKosha);
    enemyInfo.text = `${foe.faction} · Kosha ${foe.kosha}/${foe.maxKosha}\nDeck ${foe.deck.length}`;

    syncHand(state, instant);
    syncEnemyHand(state, instant);
    refreshInteractivity();
  }

  function syncHand(state: Snap, instant: boolean): void {
    const ids = state.players[0].hand;
    const next: HandCard[] = [];
    const pool = [...hand];
    ids.forEach(id => {
      const k = pool.findIndex(h => h.cardId === id);
      if (k >= 0) { next.push(pool[k]); pool.splice(k, 1); return; }
      const h = new HandCard(id, state.players[0].upgrades[id] || 0);
      h.position.set(DESIGN_W - 60, HAND_Y - 40); h.rotation = 0.4;
      handLayer.addChild(h);
      bindCard(h);
      if (!instant) audio.play('cardDraw');
      next.push(h);
    });
    pool.forEach(h => h.destroy());
    hand = next;
    layoutHand(instant);
  }

  function layoutHand(instant = false): void {
    const n = hand.length;
    const spread = Math.min(150, 900 / Math.max(1, n));
    hand.forEach((h, i) => {
      const off = i - (n - 1) / 2;
      const lifted = i === hoverIdx && !drag;
      h.home = { x: HAND_CX + off * spread, y: HAND_Y + Math.abs(off) * 6, rot: off * 0.035 };
      handLayer.setChildIndex(h, Math.min(handLayer.children.length - 1, i));
      if (drag?.kind === 'card' && drag.view === h) return;
      const sc = lifted ? 0.95 / 0.5 * 0.5 : HAND_SCALE / 0.5;
      gsap.to(h, { x: h.home.x, y: lifted ? HAND_Y - 150 : h.home.y, rotation: lifted ? 0 : h.home.rot, duration: instant ? 0 : 0.25, ease: 'power2.out' });
      gsap.to(h.scale, { x: lifted ? 1.0 : sc, y: lifted ? 1.0 : sc, duration: instant ? 0 : 0.2 });
    });
    if (hoverIdx >= 0 && hand[hoverIdx]) handLayer.addChild(hand[hoverIdx]);
  }

  function syncEnemyHand(state: Snap, instant: boolean): void {
    const n = state.players[1].hand.length;
    while (enemyHand.length > n) enemyHand.pop()!.destroy();
    while (enemyHand.length < n) {
      const b = new HandCard('n_padati', 0, true);
      b.eventMode = 'none'; b.scale.set(0.24);
      b.position.set(ENEMY_HAND.x + 200, ENEMY_HAND.y - 60);
      handLayer.addChild(b); enemyHand.push(b);
    }
    enemyHand.forEach((b, i) => {
      const off = i - (n - 1) / 2;
      gsap.to(b, { x: ENEMY_HAND.x + off * 26, y: ENEMY_HAND.y + Math.abs(off) * 2, rotation: Math.PI + off * 0.06, duration: instant ? 0 : 0.3 });
    });
  }

  /* ---------------- what can the player do right now ---------------- */
  function cardTargets(index: number): { zone: 'mine' | 'board' | null; units: number[] } {
    const id = st.players[0].hand[index];
    const c = CARDS[id];
    if (c.type === 'unit') return { zone: canPlay(st, 0, index).ok ? 'mine' : null, units: [] };
    if (c.target === 'enemyUnit') {
      return { zone: null, units: allUnits(st, 1).map(x => x.unit.uid).filter(uid => canPlay(st, 0, index, { kind: 'unit', owner: 1, uid }).ok) };
    }
    return { zone: canPlay(st, 0, index).ok ? 'board' : null, units: [] };
  }
  function unitTargets(uid: number): { front: boolean; units: number[]; hq: boolean } {
    return {
      front: canMove(st, 0, uid).ok,
      units: allUnits(st, 1).map(x => x.unit.uid).filter(t => canAttack(st, 0, uid, { kind: 'unit', owner: 1, uid: t }).ok),
      hq: canAttack(st, 0, uid, { kind: 'hq', owner: 1 }).ok
    };
  }
  const unitCanDoAnything = (uid: number) => { const t = unitTargets(uid); return t.front || t.hq || t.units.length > 0; };

  function refreshInteractivity(): void {
    if (!st) return;
    const myTurn = !busy && st.active === 0 && !st.over;
    hand.forEach((h, i) => h.setPlayable(myTurn && (cardTargets(i).zone !== null || cardTargets(i).units.length > 0)));
    tokens.forEach(v => v.setRing(myTurn && v.owner === 0 && unitCanDoAnything(v.uid) ? 'ready' : 'none'));
    durg[1].setRing(false);
    const anything = myTurn && (hand.some((_, i) => cardTargets(i).zone !== null || cardTargets(i).units.length > 0) || [...tokens.values()].some(v => v.owner === 0 && unitCanDoAnything(v.uid)));
    drawEnd(!myTurn ? 'enemy' : anything ? 'mine' : 'ready');
    hint.text = myTurn ? hintText() : st.over ? '' : 'The Nanda generals are moving…';
    if (pick) showTargets(pick);
  }

  function hintText(): string {
    const me = st.players[0];
    const mine = allUnits(st, 0);
    if (!mine.length && hand.some(h => CARDS[h.cardId].type === 'unit')) return 'Drag a unit card onto your Rajya line to deploy it.';
    const ready = mine.filter(x => unitCanDoAnything(x.unit.uid));
    if (ready.some(x => unitTargets(x.unit.uid).hq)) return 'Your units hold the Yudhbhumi. Drag one onto the enemy Durg to strike it.';
    if (ready.some(x => unitTargets(x.unit.uid).front)) return 'Drag a glowing unit up to the Yudhbhumi to advance, or onto an enemy to attack.';
    if (ready.length) return 'Drag a glowing unit onto a red-ringed enemy to attack it.';
    if (mine.some(x => !x.unit.canAct)) return 'Units that just arrived must wait a turn, unless they have Vega (the double arrow).';
    if (me.kosha === 0) return 'Your treasury is spent. Press End Turn.';
    return 'Long-press or right-click any card to read it. Press End Turn when you are done.';
  }

  function clearTargets(): void {
    tokens.forEach(v => { if (v.owner === 1) v.setRing('none'); });
    durg[1].setRing(false);
    lanes.alpha = 1; frontGlow.alpha = 1;
    zoneGlow.clear();
  }
  const zoneGlow = new Graphics();
  s.addChildAt(zoneGlow, 2);

  function showTargets(p: Exclude<Pick, null>): void {
    clearTargets();
    if (p.kind === 'card') {
      const t = cardTargets(p.index);
      if (t.zone === 'mine') glowZone(LINE_Y.mine);
      if (t.zone === 'board') { glowZone(LINE_Y.front); }
      t.units.forEach(uid => tokens.get(uid)?.setRing('target'));
    } else {
      const t = unitTargets(p.uid);
      if (t.front) glowZone(LINE_Y.front);
      t.units.forEach(uid => tokens.get(uid)?.setRing('target'));
      durg[1].setRing(t.hq);
      tokens.get(p.uid)?.setRing('selected');
    }
  }
  function glowZone(y: number): void {
    zoneGlow.roundRect(LANE_X - 4, y - LANE_H / 2 - 4, LANE_W + 8, LANE_H + 8, 18).stroke({ width: 5, color: 0x7dff8a, alpha: 0.9 });
    zoneGlow.roundRect(LANE_X, y - LANE_H / 2, LANE_W, LANE_H, 16).fill({ color: 0x7dff8a, alpha: 0.08 });
  }

  /* ---------------- input ---------------- */
  const toDesign = (e: FederatedPointerEvent) => s.toLocal(e.global);

  function bindCard(h: HandCard): void {
    h.on('pointerdown', (e: FederatedPointerEvent) => {
      if (e.button === 2) { inspect(h.cardId); return; }
      audio.unlock();
      if (busy || st.active !== 0 || st.over) { (lastPointer = toDesign(e), armLongPress(h.cardId)); return; }
      const index = hand.indexOf(h);
      const p = toDesign(e);
      drag = { kind: 'card', index, view: h, moved: false, sx: p.x, sy: p.y, downAt: performance.now() };
      (lastPointer = toDesign(e), armLongPress(h.cardId));
    });
    h.on('pointerover', () => { if (!drag) { hoverIdx = hand.indexOf(h); layoutHand(); } });
    h.on('pointerout', () => { if (!drag && hoverIdx === hand.indexOf(h)) { hoverIdx = -1; layoutHand(); } });
  }

  function bindToken(v: TokenView): void {
    v.on('pointerdown', (e: FederatedPointerEvent) => {
      if (e.button === 2) { inspect(v.cardId); return; }
      audio.unlock();
      lastPointer = toDesign(e); armLongPress(v.cardId);
      if (busy || st.active !== 0 || st.over) return;
      if (v.owner !== 0) return;
      const p = toDesign(e);
      drag = { kind: 'unit', uid: v.uid, view: v, moved: false, sx: p.x, sy: p.y, downAt: performance.now() };
    });
  }

  function armLongPress(cardId: string): void {
    if (longPress) clearTimeout(longPress);
    pressAt = lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
    longPress = setTimeout(() => { longPress = null; if (drag && drag.moved) return; cancelDrag(); inspect(cardId); }, 480);
  }

  s.eventMode = 'static';
  s.hitArea = { contains: () => true };
  let lastPointer: Point | null = null;
  s.on('pointerdown', (e: FederatedPointerEvent) => { lastPointer = toDesign(e); }, undefined);
  s.on('globalpointermove', (e: FederatedPointerEvent) => {
    const p = toDesign(e);
    if (longPress && pressAt && Math.hypot(p.x - pressAt.x, p.y - pressAt.y) > 14) { clearTimeout(longPress); longPress = null; }
    if (!drag) return;
    const dist = Math.hypot(p.x - drag.sx, p.y - drag.sy);
    if (!drag.moved && dist > 14) {
      drag.moved = true;
      if (longPress) { clearTimeout(longPress); longPress = null; }
      pick = null;
      showTargets(drag.kind === 'card' ? { kind: 'card', index: drag.index } : { kind: 'unit', uid: drag.uid });
      if (drag.kind === 'card') { hoverIdx = -1; handLayer.addChild(drag.view); audio.play('cardDraw'); }
    }
    if (!drag.moved) return;
    if (drag.kind === 'card') {
      const v = drag.view;
      const vx = p.x - v.x;
      gsap.to(v, { x: p.x, y: p.y, rotation: Math.max(-0.35, Math.min(0.35, vx * 0.01)), duration: 0.08 });
      gsap.to(v.scale, { x: 0.72, y: 0.72, duration: 0.15 });
      const t = cardTargets(drag.index);
      if (t.units.length) drawArrow(v.x, v.y - 60, p.x, p.y, hitUnit(p, 1) !== null);
      else arrow.clear();
    } else {
      const v = drag.view;
      const over = hitUnit(p, 1) !== null || hitDurg(p) || (unitTargets(drag.uid).front && inLane(p, LINE_Y.front));
      drawArrow(v.x, v.y - TOKEN_DH / 2 + 30, p.x, p.y, over);
    }
  });
  s.on('pointerup', (e: FederatedPointerEvent) => void release(e));
  s.on('pointerupoutside', (e: FederatedPointerEvent) => void release(e));
  s.on('pointerdown', (e: FederatedPointerEvent) => {
    if (inspecting) { closeInspect(); return; }
    // tap-to-target: a tap on the field after selecting
    if (!pick || drag || busy) return;
    const p = toDesign(e);
    const tgt = targetAt(p, pick);
    if (tgt) resolvePickOn(tgt); else if (p.y < HAND_Y - 140) { pick = null; clearTargets(); refreshInteractivity(); }
  });

  type DropTarget = Target | { kind: 'zone'; zone: 'mine' | 'front' | 'board' };

  function inLane(p: Point, y: number): boolean { return p.x > LANE_X - 20 && p.x < LANE_X + LANE_W + 20 && Math.abs(p.y - y) < LANE_H / 2 + 20; }
  function hitUnit(p: Point, owner: PlayerIndex): number | null {
    for (const v of tokens.values()) if (v.owner === owner && Math.abs(p.x - v.x) < 95 && Math.abs(p.y - v.y) < 115) return v.uid;
    return null;
  }
  const hitDurg = (p: Point) => Math.abs(p.x - durg[1].x) < 130 && Math.abs(p.y - durg[1].y) < 130;

  function targetAt(p: Point, from: Exclude<Pick, null>): DropTarget | null {
    if (from.kind === 'card') {
      const t = cardTargets(from.index);
      const u = hitUnit(p, 1);
      if (u !== null && t.units.includes(u)) return { kind: 'unit', owner: 1, uid: u };
      if (t.zone === 'mine' && (inLane(p, LINE_Y.mine) || inLane(p, LINE_Y.front))) return { kind: 'zone', zone: 'mine' };
      if (t.zone === 'board' && p.y < HAND_Y - 150) return { kind: 'zone', zone: 'board' };
      return null;
    }
    const t = unitTargets(from.uid);
    const u = hitUnit(p, 1);
    if (u !== null && t.units.includes(u)) return { kind: 'unit', owner: 1, uid: u };
    if (t.hq && hitDurg(p)) return { kind: 'hq', owner: 1 };
    if (t.front && inLane(p, LINE_Y.front)) return { kind: 'zone', zone: 'front' };
    return null;
  }

  async function release(e: FederatedPointerEvent): Promise<void> {
    if (longPress) { clearTimeout(longPress); longPress = null; }
    if (!drag) return;
    const d = drag;
    drag = null;
    arrow.clear();
    const p = toDesign(e);
    if (!d.moved) {
      // a tap: select, so the next tap picks the target
      const p2: Pick = d.kind === 'card' ? { kind: 'card', index: d.index } : { kind: 'unit', uid: d.uid };
      const same = pick && pick.kind === p2.kind && (p2.kind === 'card' ? (pick as { index: number }).index === p2.index : (pick as { uid: number }).uid === p2.uid);
      clearTargets();
      if (same) { pick = null; refreshInteractivity(); return; }
      // a card with nowhere to choose (an order or yantra) is played on a second tap of the board
      pick = p2; audio.play('click');
      if (d.kind === 'card') { hoverIdx = d.index; layoutHand(); }
      showTargets(p2);
      return;
    }
    const from: Exclude<Pick, null> = d.kind === 'card' ? { kind: 'card', index: d.index } : { kind: 'unit', uid: d.uid };
    const tgt = targetAt(p, from);
    clearTargets();
    if (!tgt) { cancelDrag(d); refreshInteractivity(); return; }
    await commit(from, tgt, d.kind === 'card' ? d.view : null);
  }

  function resolvePickOn(tgt: DropTarget): void {
    const p = pick; if (!p) return;
    pick = null; clearTargets();
    hoverIdx = -1;
    if (p.kind === 'card') {
      const t = cardTargets(p.index);
      if (tgt.kind === 'zone' && t.zone === 'board') tgt = { kind: 'zone', zone: 'board' };
      void commit(p, tgt, hand[p.index]);
    } else void commit(p, tgt, null);
  }

  function cancelDrag(d?: Drag): void {
    const dd = d ?? drag;
    drag = null; arrow.clear();
    if (dd?.kind === 'card') layoutHand();
    clearTargets();
  }

  /* ---------------- performing an action ---------------- */
  async function commit(from: Exclude<Pick, null>, tgt: DropTarget, cardView: HandCard | null): Promise<void> {
    let action: Action;
    if (from.kind === 'card') {
      action = { type: 'play', handIndex: from.index, target: tgt.kind === 'unit' ? tgt : null };
    } else {
      action = tgt.kind === 'zone' ? { type: 'move', uid: from.uid } : { type: 'attack', uid: from.uid, target: tgt as Target };
    }
    const check = applyAction(st, action);
    if (!check.ok) { flashHint(check.reason); layoutHand(); return; }
    busy = true;
    refreshInteractivity();
    const events = drainEvents(st);
    const spawn = new Map<number, { x: number; y: number; scale?: number }>();
    if (cardView) {
      hand = hand.filter(h => h !== cardView);
      const dep = events.find(ev => ev.t === 'deploy');
      if (dep && dep.t === 'deploy') {
        spawn.set(dep.uid, { x: cardView.x, y: cardView.y, scale: 0.9 });
        cardView.destroy();
      } else {
        await castCard(cardView, events);
      }
    }
    await animate(events, snapshot(st), spawn);
    busy = false;
    refreshInteractivity();
    checkOver();
  }

  /** an order card rises to the centre, glows and dissolves; a yantra flips face-down to its slot */
  async function castCard(v: HandCard, events: GameEvent[]): Promise<void> {
    fx.addChild(v);
    const isYantra = events.some(e => e.t === 'yantraSet');
    audio.play('cardPlay');
    if (isYantra) {
      await gsap.to(v, { x: yantraRow[0].x, y: yantraRow[0].y, rotation: 0, duration: 0.45, ease: 'power2.inOut' });
      await gsap.to(v.scale, { x: 0.05, y: 0.44, duration: 0.15 });
      v.destroy();
      audio.play('yantra');
      return;
    }
    await Promise.all([gsap.to(v, { x: SLOT_CX, y: LINE_Y.front, rotation: 0, duration: 0.35, ease: 'power2.out' }), gsap.to(v.scale, { x: 1.1, y: 1.1, duration: 0.35 })]);
    const shakti = CARDS[v.cardId].kind === 'shakti';
    if (shakti) { audio.play('conch'); flash(0xffd27a, 0.35); }
    await gsap.to(v, { alpha: 0, duration: 0.4, delay: 0.35 });
    v.destroy();
  }

  /* ---------------- event animation ---------------- */
  async function animate(events: GameEvent[], after: Snap, spawn = new Map<number, { x: number; y: number; scale?: number }>()): Promise<void> {
    for (const e of events) {
      if (!alive) return;
      switch (e.t) {
        case 'deploy': {
          if (!spawn.has(e.uid)) spawn.set(e.uid, e.owner === 1 ? { x: ENEMY_HAND.x, y: ENEMY_HAND.y, scale: 0.3 } : { x: HAND_CX, y: HAND_Y, scale: 0.6 });
          sfxFor(e.cardId);
          break;
        }
        case 'move': {
          audio.play('march');
          const v = tokens.get(e.uid);
          if (v) await gsap.to(v, { y: LINE_Y.front, duration: 0.35, ease: 'power2.inOut' });
          break;
        }
        case 'attack': {
          const a = tokens.get(e.uid), d = tokens.get(e.target.uid);
          if (a && d) await strike(a, d.x, d.y, CARDS[a.cardId].range === 'ranged');
          break;
        }
        case 'hq': {
          const a = tokens.get(e.uid);
          const t = durg[e.owner];
          if (a) await strike(a, t.x, t.y, CARDS[a.cardId].range === 'ranged');
          if (e.dmg > 0) { audio.play('fortHit'); shake(14); } else { audio.play('yantra'); }
          break;
        }
        case 'order': {
          if (e.owner === 1) await enemyCast(e.cardId);
          if (e.cardId === 's_agni' || e.cardId === 'n_aakraman') {
            audio.play(e.cardId === 's_agni' ? 'fire' : 'clash');
          } else if (e.cardId === 's_chakravyuha') { audio.play('drum'); shake(10); }
          else audio.play('coin');
          break;
        }
        case 'yantraSet':
          if (e.owner === 1) audio.play('cardPlay');
          break;
        case 'yantra':
          await reveal(e.cardId, e.owner);
          break;
        case 'death':
          break;
      }
    }
    reconcile(after, false, spawn);
    await wait(events.some(ev => ev.t === 'death' || ev.t === 'attack' || ev.t === 'hq') ? 520 : 380);
  }

  function sfxFor(cardId: string): void {
    const c = CARDS[cardId];
    audio.play('deploy');
    if (/gaja|hasti/.test(cardId)) setTimeout(() => audio.play('elephant'), 150);
    else if (c.kw?.includes('veg')) setTimeout(() => audio.play('march'), 100);
  }

  async function strike(a: TokenView, tx: number, ty: number, ranged: boolean): Promise<void> {
    unitLayer.addChild(a);
    if (ranged) {
      audio.play('bow');
      const ar = new Graphics().moveTo(-22, 0).lineTo(22, 0).stroke({ width: 3, color: 0xf0d79a }).poly([22, -6, 34, 0, 22, 6]).fill(0xf0d79a);
      ar.position.set(a.x, a.y - 40); ar.rotation = Math.atan2(ty - a.y, tx - a.x);
      fx.addChild(ar);
      await gsap.to(a, { y: a.y + (ty > a.y ? -10 : 10), duration: 0.08, yoyo: true, repeat: 1 });
      await gsap.to(ar, { x: tx, y: ty, duration: 0.32, ease: 'power1.in' });
      ar.destroy();
      audio.play('arrowHit');
      sparks(tx, ty, 0xffd27a);
      return;
    }
    const ox = a.x, oy = a.y;
    await gsap.to(a, { x: ox + (tx - ox) * 0.72, y: oy + (ty - oy) * 0.72, rotation: (tx - ox) * 0.0004, duration: 0.2, ease: 'power3.in' });
    audio.play('clash');
    sparks(tx, ty, 0xffa040);
    await gsap.to(a, { x: ox, y: oy, rotation: 0, duration: 0.3, ease: 'power2.out' });
  }

  async function enemyCast(cardId: string): Promise<void> {
    const v = new Sprite(cardFace(cardId)); v.anchor.set(0.5); v.scale.set(0.15); v.position.set(ENEMY_HAND.x, ENEMY_HAND.y);
    fx.addChild(v);
    audio.play('cardPlay');
    await Promise.all([gsap.to(v, { x: SLOT_CX, y: LINE_Y.front, duration: 0.4, ease: 'power2.out' }), gsap.to(v.scale, { x: 0.55, y: 0.55, duration: 0.4 })]);
    if (CARDS[cardId].kind === 'shakti') { audio.play('conch'); flash(0xff8a5a, 0.3); }
    await gsap.to(v, { alpha: 0, duration: 0.4, delay: 0.7 });
    v.destroy();
  }

  async function reveal(cardId: string, owner: PlayerIndex): Promise<void> {
    audio.play('yantra');
    const row = yantraRow[owner];
    const v = new Sprite(cardFace(cardId)); v.anchor.set(0.5); v.scale.set(0.05, 0.11); v.position.set(row.x, row.y);
    fx.addChild(v);
    const label = new Text({ text: `${CARDS[cardId].name} springs!`, style: { fontFamily: FONT_SERIF, fontSize: 52, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 7 } } });
    label.anchor.set(0.5); label.position.set(SLOT_CX, LINE_Y.front + 230); label.alpha = 0;
    fx.addChild(label);
    await Promise.all([gsap.to(v, { x: SLOT_CX, y: LINE_Y.front - 10, duration: 0.4 }), gsap.to(v.scale, { x: 0.6, y: 0.6, duration: 0.4, ease: 'back.out(1.4)' }), gsap.to(label, { alpha: 1, duration: 0.3 })]);
    flash(0xa0c8ff, 0.25);
    await gsap.to([v, label], { alpha: 0, duration: 0.4, delay: 0.9 });
    v.destroy(); label.destroy();
  }

  /* ---------------- effects ---------------- */
  function floatNumber(x: number, y: number, text: string, color: number, size = 54): void {
    const t = new Text({ text, style: { fontFamily: FONT_SERIF, fontSize: size, fontWeight: '700', fill: color, stroke: { color: 0x3a0a04, width: 7 } } });
    t.anchor.set(0.5); t.position.set(x, y); fx.addChild(t);
    gsap.fromTo(t.scale, { x: 0.4, y: 0.4 }, { x: 1, y: 1, duration: 0.25, ease: 'back.out(2)' });
    gsap.to(t, { y: y - 80, alpha: 0, duration: 1.1, delay: 0.3, ease: 'power1.out', onComplete: () => t.destroy() });
  }
  function sparks(x: number, y: number, color: number): void {
    for (let i = 0; i < 16; i++) {
      const p = new Graphics().circle(0, 0, 2 + Math.random() * 3).fill(color);
      p.blendMode = 'add'; p.position.set(x, y); fx.addChild(p);
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 90;
      gsap.to(p, { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, alpha: 0, duration: 0.5 + Math.random() * 0.3, ease: 'power2.out', onComplete: () => p.destroy() });
    }
    const ring = new Graphics().circle(0, 0, 40).stroke({ width: 6, color }); ring.position.set(x, y); ring.blendMode = 'add'; fx.addChild(ring);
    gsap.fromTo(ring.scale, { x: 0.3, y: 0.3 }, { x: 1.8, y: 1.8, duration: 0.4 });
    gsap.to(ring, { alpha: 0, duration: 0.4, onComplete: () => ring.destroy() });
  }
  function burnAway(v: TokenView): void {
    audio.play('death');
    v.eventMode = 'none';
    for (let i = 0; i < 20; i++) {
      const p = new Graphics().circle(0, 0, 2 + Math.random() * 3).fill(Math.random() < 0.5 ? 0xff8a2a : 0xffd27a);
      p.blendMode = 'add'; p.position.set(v.x - 80 + Math.random() * 160, v.y + 100 - Math.random() * 200); fx.addChild(p);
      gsap.to(p, { y: p.y - 60 - Math.random() * 80, alpha: 0, duration: 0.8 + Math.random() * 0.6, delay: Math.random() * 0.3, onComplete: () => p.destroy() });
    }
    gsap.to(v, { alpha: 0, duration: 0.7, ease: 'power1.in', onComplete: () => v.destroy() });
    gsap.to(v.scale, { x: 0.85, y: 0.85, duration: 0.7 });
  }
  function shake(px: number): void { gsap.fromTo(s, { x: -px }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.25)' }); }
  function flash(color: number, alpha: number): void {
    const f = new Graphics().rect(0, 0, DESIGN_W, DESIGN_H).fill(color); f.alpha = alpha; f.blendMode = 'add'; fx.addChild(f);
    gsap.to(f, { alpha: 0, duration: 0.6, onComplete: () => f.destroy() });
  }
  function drawArrow(x0: number, y0: number, x1: number, y1: number, hot: boolean): void {
    arrow.clear();
    const col = hot ? 0xff5a3c : 0xf0d79a;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 80;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push([(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1]);
    }
    for (let i = 0; i < pts.length - 2; i += 2) arrow.moveTo(pts[i][0], pts[i][1]).lineTo(pts[i + 1][0], pts[i + 1][1]);
    arrow.stroke({ width: 10, color: col, alpha: 0.9, cap: 'round' });
    const [ax, ay] = pts[pts.length - 2];
    const ang = Math.atan2(y1 - ay, x1 - ax);
    arrow.poly([x1 + Math.cos(ang) * 14, y1 + Math.sin(ang) * 14, x1 + Math.cos(ang + 2.5) * 30, y1 + Math.sin(ang + 2.5) * 30, x1 + Math.cos(ang - 2.5) * 30, y1 + Math.sin(ang - 2.5) * 30]).fill(col);
  }
  function flashHint(text: string): void {
    hint.text = text; hint.style.fill = 0xffb09a;
    gsap.fromTo(hint, { x: SLOT_CX - 10 }, { x: SLOT_CX, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    setTimeout(() => { hint.style.fill = INK.cream; refreshInteractivity(); }, 1600);
  }
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  /* ---------------- inspect ---------------- */
  function inspect(cardId: string): void {
    if (inspecting) closeInspect();
    hoverIdx = -1; layoutHand();
    const c = new Container();
    const dim = new Graphics().rect(0, 0, DESIGN_W, DESIGN_H).fill({ color: 0x000000, alpha: 0.7 });
    const face = new Sprite(cardFace(cardId, st.players[0].upgrades[cardId] || 0)); face.anchor.set(0.5); face.position.set(DESIGN_W / 2, DESIGN_H / 2 - 20); face.scale.set(1.1);
    const tip = new Text({ text: 'Tap anywhere to close', style: { fontFamily: FONT_SERIF, fontSize: 22, fontStyle: 'italic', fill: INK.smoke } });
    tip.anchor.set(0.5); tip.position.set(DESIGN_W / 2, DESIGN_H - 40);
    c.addChild(dim, face, tip);
    c.eventMode = 'static'; c.on('pointertap', closeInspect);
    s.addChild(c); inspecting = c;
    gsap.from(face.scale, { x: 0.6, y: 0.6, duration: 0.25, ease: 'back.out(1.5)' });
    gsap.from(c, { alpha: 0, duration: 0.15 });
  }
  function closeInspect(): void { if (inspecting) destroyTree(inspecting); inspecting = null; }

  /* ---------------- turns ---------------- */
  async function turnBanner(who: PlayerIndex): Promise<void> {
    const band = new Graphics().rect(0, -70, DESIGN_W, 140).fill({ color: 0x000000, alpha: 0.75 });
    band.moveTo(0, -70).lineTo(DESIGN_W, -70).moveTo(0, 70).lineTo(DESIGN_W, 70).stroke({ width: 2, color: who === 0 ? INK.gold : 0xe0674a });
    const t = new Text({ text: who === 0 ? 'YOUR TURN' : 'THE NANDA ARMY MOVES', style: { fontFamily: FONT_SERIF, fontSize: 72, fontWeight: '700', letterSpacing: 14, fill: who === 0 ? INK.goldPale : 0xffb09a } });
    t.anchor.set(0.5); t.x = DESIGN_W / 2;
    const c = new Container(); c.addChild(band, t); c.y = LINE_Y.front; fx.addChild(c);
    audio.play(who === 0 ? 'conch' : 'drum');
    await gsap.fromTo(c, { alpha: 0 }, { alpha: 1, duration: 0.25 });
    await gsap.fromTo(t, { x: DESIGN_W / 2 - 40 }, { x: DESIGN_W / 2 + 10, duration: 0.8, ease: 'none' });
    await gsap.to(c, { alpha: 0, duration: 0.3 });
    destroyTree(c);
  }

  async function endTurn(): Promise<void> {
    pick = null; clearTargets();
    busy = true;
    applyAction(st, { type: 'end' });
    drainEvents(st);
    reconcile(snapshot(st));
    if (st.over) { busy = false; checkOver(); return; }
    await turnBanner(1);
    // record the computer's turn one action at a time
    const steps: { events: GameEvent[]; snap: Snap }[] = [];
    const obs = (state: GameState) => { steps.push({ events: drainEvents(state), snap: snapshot(state) }); };
    actionObservers.add(obs);
    try { aiTurn(st, 1, st.aiLevel); } finally { actionObservers.delete(obs); }
    for (const step of steps) {
      if (!alive) return;
      const endStep = step.snap.active === 0 && step === steps[steps.length - 1];
      if (endStep) { reconcile(step.snap); break; }
      await animate(step.events, step.snap);
    }
    busy = false;
    reconcile(snapshot(st));
    if (!checkOver()) await turnBanner(0);
    refreshInteractivity();
  }

  function checkOver(): boolean {
    if (!st.over) return false;
    busy = true;
    const won = st.winner === 0;
    setTimeout(() => endScreen(won), 900);
    return true;
  }

  function endScreen(won: boolean): void {
    audio.play(won ? 'victory' : 'defeat');
    const c = new Container();
    const dim = new Graphics().rect(0, 0, DESIGN_W, DESIGN_H).fill({ color: 0x000000, alpha: 0.78 });
    dim.eventMode = 'static';
    const face = new Sprite(cardFace(won ? 'm_chandragupta' : 'n_gaja')); face.anchor.set(0.5); face.scale.set(0.75); face.position.set(DESIGN_W / 2, 380);
    const title = new Text({ text: won ? 'VICTORY' : 'DEFEAT', style: { fontFamily: FONT_SERIF, fontSize: 120, fontWeight: '700', letterSpacing: 24, fill: won ? INK.goldPale : 0xffb09a, stroke: { color: 0x000000, width: 8 } } });
    title.anchor.set(0.5); title.position.set(DESIGN_W / 2, 690);
    const sub = new Text({
      text: won ? `Pataliputra opens its gates in turn ${st.turn}. The Mauryan age begins.` : 'The Nanda elephants hold the field. Chanakya is already planning the next war.',
      style: { fontFamily: FONT_SERIF, fontSize: 30, fontStyle: 'italic', fill: INK.cream }
    });
    sub.anchor.set(0.5); sub.position.set(DESIGN_W / 2, 780);
    const again = makeButton('Fight again', () => { destroyTree(c); busy = false; start(); }, { primary: true, w: 320 });
    again.position.set(DESIGN_W / 2 - 180, 880);
    const leave = makeButton('Title screen', exit, { w: 320 });
    leave.position.set(DESIGN_W / 2 + 180, 880);
    c.addChild(dim, face, title, sub, again, leave);
    s.addChild(c);
    gsap.from(face.scale, { x: 0.3, y: 0.3, duration: 0.6, ease: 'back.out(1.4)' });
    gsap.from([title, sub, again, leave], { alpha: 0, y: '+=30', duration: 0.6, stagger: 0.12, delay: 0.3 });
  }

  function confirmLeave(): void {
    const c = new Container();
    const dim = new Graphics().rect(0, 0, DESIGN_W, DESIGN_H).fill({ color: 0x000000, alpha: 0.7 }); dim.eventMode = 'static';
    const t = new Text({ text: 'Leave the battle?', style: { fontFamily: FONT_SERIF, fontSize: 56, fontWeight: '700', fill: INK.goldPale } });
    t.anchor.set(0.5); t.position.set(DESIGN_W / 2, 440);
    const yes = makeButton('Leave', exit, { w: 280 }); yes.position.set(DESIGN_W / 2 - 160, 560);
    const no = makeButton('Keep fighting', () => destroyTree(c), { primary: true, w: 280 }); no.position.set(DESIGN_W / 2 + 160, 560);
    c.addChild(dim, t, yes, no); s.addChild(c);
  }

  window.addEventListener('contextmenu', blockMenu);
  function blockMenu(e: Event): void { e.preventDefault(); }

  // read-only hook for automated playtests (tests/e2e)
  (window as unknown as { __yuddh: unknown }).__yuddh = {
    state: () => st, busy: () => busy,
    hand: () => hand.map(h => ({ id: h.cardId, x: h.x, y: h.y })),
    tokens: () => [...tokens.values()].map(v => ({ uid: v.uid, owner: v.owner, x: v.x, y: v.y })),
    durg: () => ({ x: durg[1].x, y: durg[1].y }),
    /** every legal drag right now: from → to, in design coordinates */
    moves: () => {
      if (busy || st.active !== 0 || st.over) return [];
      const out: { what: string; from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
      hand.forEach((h, i) => {
        const t = cardTargets(i);
        const from = { x: h.x, y: h.y - 30 };
        if (t.zone === 'mine') out.push({ what: `deploy ${h.cardId}`, from, to: { x: SLOT_CX, y: LINE_Y.mine } });
        else if (t.zone === 'board') out.push({ what: `cast ${h.cardId}`, from, to: { x: SLOT_CX, y: LINE_Y.front } });
        t.units.forEach(uid => { const v = tokens.get(uid); if (v) out.push({ what: `cast ${h.cardId} on ${v.cardId}`, from, to: { x: v.x, y: v.y } }); });
      });
      tokens.forEach(v => {
        if (v.owner !== 0) return;
        const t = unitTargets(v.uid);
        const from = { x: v.x, y: v.y };
        if (t.hq) out.push({ what: `${v.cardId} strikes the Durg`, from, to: { x: durg[1].x, y: durg[1].y } });
        t.units.forEach(uid => { const e = tokens.get(uid); if (e) out.push({ what: `${v.cardId} attacks ${e.cardId}`, from, to: { x: e.x, y: e.y } }); });
        if (t.front) out.push({ what: `${v.cardId} advances`, from, to: { x: SLOT_CX + 300, y: LINE_Y.front } });
      });
      return out;
    }
  };

  s.enter = () => start();
  s.leave = () => {
    alive = false;
    fx.children.forEach(c => stopTweens(c as Container));
    window.removeEventListener('contextmenu', blockMenu);
    stage.setBackdrop(null);
    tokens.forEach(t => t.destroy());
    durg.forEach(d => d.destroy());
    endPulse?.kill();
  };
  return s;
}

/** preload the battlefield so the board never appears without it */
export async function preloadBattle(): Promise<void> {
  await Assets.load(`${import.meta.env.BASE_URL}assets/battlefields/${FIRST_THRONE.battlefield}.webp`);
}

export type { Sfx };
