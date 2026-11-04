/* ============================================================
   The battle. Drag a card from your hand onto the field to play it;
   drag a ready unit up to the Yudhbhumi to advance, or onto an enemy
   to attack. Tapping works too: tap to select, tap the target.
   Long-press or right-click any card to read it at full size.

   The engine owns the rules; this file only shows them. The enemy's
   turn is recorded action by action and replayed with animation.

   Every position comes from a layout table (battleLayout): one for
   desktop (the original 1920×1080 board) and one for phones held
   sideways, where the board is drawn larger and text bigger. When the
   window switches between them the board is rebuilt from the state.
   ============================================================ */
import { Container, FederatedPointerEvent, Graphics, Point, Sprite, Text, Texture } from 'pixi.js';
import gsap from 'gsap';
import {
  CARDS, EMPIRES, RANK_NAMES, actionObservers, findUnit, aiTurn, allUnits, applyAction, canAttack, canCharge, canMove, canPlay, koshaCost,
  drainEvents, type Action, type GameEvent, type GameState, type PlayerIndex, type Target, type Unit
} from '../../engine';
import { FIRST_THRONE, firstThroneGame } from '../../campaign/firstThrone';
import { FONT_SERIF, INK } from '../theme';
import { view, type View } from '../view';
import { audio, type Sfx } from '../audio';
import { cardFace } from '../cards/paint';
import { DurgView, HandCard, TOKEN_DH, TokenView, drawDiyas, stopTweens } from '../cards/views';
import { makeButton } from '../ui/button';
import { inspectOverlay, type InspectExtra } from '../ui/inspect';
import { battlefieldUrl, loadArt, loadBattlefield } from '../../assets/manifest';
import { destroyTree, type Scene, type Stage } from '../stage';

/* ---------------- layout ---------------- */
interface Layout {
  W: number; H: number; phone: boolean; ui: number;
  laneX: number; laneW: number; laneH: number;
  line: { enemy: number; front: number; mine: number };
  slotGap: number; tok: number;
  durgX: number; durgS: number; durgText: number;
  handY: number; handCX: number; handScale: number; handSpan: number; handMaxGap: number; handTop: number;
  liftY: number; liftScale: number; dragScale: number;
  enemyHand: { x: number; y: number; s: number };
  rightX: number; enemyInfoY: number; enemyDiyas: { x: number; y: number; s: number };
  endY: number; endS: number;
  koshaLabelY: number; koshaY: number; myDiyas: { x: number; y: number; s: number };
  deck: { x: number; y: number; s: number };
  yantraX: number; yantraS: number; yantraGap: number;
  roundY: number; roundX: [number, number, number]; roundR: number;
  hintY: number;
  /** where a card the enemy plays is shown, and how big (HandCard scale) */
  reveal: { x: number; y: number; s: number };
  /** phones: a large copy of the card you have selected, so its text can be read */
  preview: { x: number; y: number; s: number } | null;
}

function battleLayout(v: View): Layout {
  if (!v.phone) {
    return {
      W: 1920, H: 1080, phone: false, ui: 1,
      laneX: 300, laneW: 1120, laneH: 236, line: { enemy: 186, front: 448, mine: 710 },
      slotGap: 196, tok: 1, durgX: 158, durgS: 1, durgText: 1,
      handY: 964, handCX: 860, handScale: 0.31, handSpan: 900, handMaxGap: 150, handTop: 814,
      liftY: 814, liftScale: 1, dragScale: 0.72,
      enemyHand: { x: 1690, y: 70, s: 0.24 },
      rightX: 1690, enemyInfoY: 180, enemyDiyas: { x: 1605, y: 222, s: 0.8 },
      endY: 448, endS: 1, koshaLabelY: 766, koshaY: 800, myDiyas: { x: 1584, y: 846, s: 1 },
      deck: { x: 1852, y: 905, s: 0.2 },
      yantraX: 1486, yantraS: 0.22, yantraGap: 80,
      roundY: 1040, roundX: [1720, 1780, 1840], roundR: 26, hintY: 38,
      reveal: { x: 860, y: 448, s: 1.15 }, preview: null
    };
  }
  // phones (720 high, 1280–1800 wide): narrow side columns so the lanes, units and cards get the room
  const W = v.w, H = v.h, ui = v.ui;
  const laneX = 176, laneH = 168, rightX = W - 125;
  const laneW = W - laneX - 80 - 250;
  const line = { enemy: 118, front: 292, mine: 466 };
  const tok = 0.8, handScale = 0.46;
  return {
    W, H, phone: true, ui,
    laneX, laneW, laneH, line, slotGap: Math.min(170, (laneW - 140) / 3), tok,
    durgX: 92, durgS: 0.62, durgText: 1.6,
    handY: 552 + 336 * handScale, handCX: laneX + laneW / 2, handScale, handSpan: laneW * 0.95, handMaxGap: 175, handTop: H - 200,
    liftY: H - 172, liftScale: 1, dragScale: 0.6,
    enemyHand: { x: rightX, y: 30, s: 0.15 },
    rightX, enemyInfoY: 100, enemyDiyas: { x: rightX - 76, y: 150, s: 0.75 },
    endY: line.front, endS: 0.8, koshaLabelY: 400, koshaY: 438, myDiyas: { x: rightX - 100, y: 482, s: 1 },
    deck: { x: W - 48, y: 600, s: 0.18 },
    yantraX: laneX + laneW + 40, yantraS: 0.15, yantraGap: 58,
    roundY: H - 36, roundX: [rightX - 110, rightX - 40, rightX + 30], roundR: 28, hintY: 18,
    reveal: { x: laneX + laneW / 2, y: line.front, s: 1.45 },
    preview: { x: W - 250, y: H / 2, s: (H * 0.94) / 672 }
  };
}

type Snap = GameState;
type Spawn = Map<number, { x: number; y: number; scale?: number }>;
type Drag =
  | { kind: 'card'; index: number; view: HandCard; moved: boolean; sx: number; sy: number; downAt: number }
  | { kind: 'unit'; uid: number; view: TokenView; moved: boolean; sx: number; sy: number; downAt: number };
type Pick = { kind: 'card'; index: number } | { kind: 'unit'; uid: number } | null;
type Overlay = { kind: 'briefing' | 'end' | 'confirm' | 'inspect'; view: Container; won?: boolean } | null;

function snapshot(st: GameState): Snap {
  const { rng, ...rest } = st;
  const copy = JSON.parse(JSON.stringify({ ...rest, log: [], events: [] })) as Snap;
  copy.rng = rng;
  return copy;
}

export function battleScene(stage: Stage, exit: () => void): Scene {
  const s: Scene = new Container();
  let L = battleLayout(view);
  let st: GameState;
  let shown: Snap;                       // what the screen currently shows
  let busy = false, alive = true;
  let animating = false, layoutPending = false;
  let handHeld = true;                   // the opening hand waits until the briefing closes
  let intense = false;
  let dealUntil = 0;                     // cards drawn from the deck are still flying in until then
  const dealing = () => performance.now() < dealUntil;
  let drag: Drag | null = null;
  let pick: Pick = null;
  let longPress: ReturnType<typeof setTimeout> | null = null;
  let overlay: Overlay = null;
  let hoverIdx = -1;
  let pressAt: { x: number; y: number } | null = null;
  let targetTapAt = 0, longPressFired = 0;

  const tokens = new Map<number, TokenView>();
  let hand: HandCard[] = [];
  let enemyHand: HandCard[] = [];
  const slotX = (i: number, n: number) => L.laneX + L.laneW / 2 + (i - (n - 1) / 2) * L.slotGap;
  const fsz = (n: number) => Math.round(n * L.ui);

  /* ---------------- scenery ---------------- */
  stage.setBackdrop(Texture.from(battlefieldUrl(FIRST_THRONE.battlefield)), 0.62);

  const lanes = new Graphics();
  const zoneGlow = new Graphics();
  const frontGlow = new Graphics();
  s.addChild(lanes, frontGlow, zoneGlow);
  const laneLabels = ['ENEMY RAJYA', 'YUDHBHUMI', 'YOUR RAJYA'].map(t => {
    const x = new Text({ text: t, style: { fontFamily: FONT_SERIF, fontSize: 18, fontWeight: '700', letterSpacing: 7, fill: INK.goldPale } });
    x.alpha = 0.55; x.anchor.set(0, 0.5); s.addChild(x); return x;
  });

  const durg: [DurgView, DurgView] = [new DurgView(0, 'durg_maurya_camp'), new DurgView(1, 'durg_pataliputra')];
  s.addChild(durg[0], durg[1]);

  // right column: enemy info, end turn, your treasury, deck
  const enemyInfo = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 22, fill: INK.goldPale, align: 'center', stroke: { color: 0x000000, width: 3 } } });
  enemyInfo.anchor.set(0.5);
  const enemyDiyas = new Graphics();
  const myDiyas = new Graphics();
  const myKosha = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 40, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 5 } } });
  myKosha.anchor.set(0.5);
  const koshaLabel = new Text({ text: 'KOSHA', style: { fontFamily: FONT_SERIF, fontSize: 16, fontWeight: '700', letterSpacing: 6, fill: INK.gold, stroke: { color: 0x000000, width: 3 } } });
  koshaLabel.anchor.set(0.5);
  s.addChild(enemyInfo, enemyDiyas, myDiyas, myKosha, koshaLabel);

  // your deck: a short stack of card backs with the count on top
  const deckPile = new Container();
  const deckCount = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 30, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 5 } } });
  deckCount.anchor.set(0.5);
  s.addChild(deckPile);

  const yantraRow: [Container, Container] = [new Container(), new Container()];
  s.addChild(yantraRow[0], yantraRow[1]);

  const endBtn = new Container();
  const endG = new Graphics();
  const endT = new Text({ text: 'END TURN', style: { fontFamily: FONT_SERIF, fontSize: 26, fontWeight: '700', letterSpacing: 4, fill: 0x24170e, align: 'center' } });
  endT.anchor.set(0.5);
  endBtn.addChild(endG, endT);
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
    endPulse?.kill(); endBtn.scale.set(L.endS);
    if (state === 'ready') endPulse = gsap.to(endBtn.scale, { x: L.endS * 1.06, y: L.endS * 1.06, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // top hint bar
  const hint = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 24, fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 4 } } });
  hint.anchor.set(0.5);
  s.addChild(hint);

  const unitLayer = new Container();
  const handLayer = new Container();
  const fx = new Container();
  const combatFx = new Container();   // while aiming: damage shields on attacker and target
  const arrow = new Graphics();
  const previewLayer = new Container();
  s.addChild(unitLayer, handLayer, arrow, combatFx, previewLayer, fx);
  // The scene itself listens for taps, which makes everything inside it hit-testable; pure decoration
  // must opt out, or a passing spark or the turn banner swallows a press on the unit beneath it.
  for (const deco of [lanes, frontGlow, zoneGlow, arrow, previewLayer, fx, combatFx]) deco.eventMode = 'none';

  // small round buttons: menu, music, sound
  const rounds = [
    { label: '✕', fn: () => confirmLeave() },
    { label: '♪', fn: () => { roundT[1].alpha = audio.toggleMusic() ? 1 : 0.35; } },
    { label: '◈', fn: () => { roundT[2].alpha = audio.toggleSfx() ? 1 : 0.35; } }
  ].map(r => {
    const c = new Container();
    const g = new Graphics();
    const t = new Text({ text: r.label, style: { fontFamily: FONT_SERIF, fontSize: 20, fontWeight: '700', fill: INK.goldPale } }); t.anchor.set(0.5);
    c.addChild(g, t); c.eventMode = 'static'; c.cursor = 'pointer'; c.on('pointertap', r.fn);
    s.addChild(c); return { c, g, t };
  });
  const roundT = rounds.map(r => r.t);
  roundT[1].alpha = audio.music ? 1 : 0.35; roundT[2].alpha = audio.sfx ? 1 : 0.35;

  /** put every fixed part of the board where the current layout says */
  function applyLayout(): void {
    const ly = [L.line.enemy, L.line.front, L.line.mine];
    laneLabels.forEach((t, i) => { t.style.fontSize = fsz(18); t.style.letterSpacing = L.phone ? 5 : 7; t.position.set(L.laneX + 18, ly[i] - L.laneH / 2 + fsz(18)); });
    durg[0].position.set(L.durgX, L.line.mine); durg[1].position.set(L.durgX, L.line.enemy);
    durg.forEach(d => { d.scale.set(L.durgS); d.setTextScale(L.durgText); });
    enemyInfo.style.fontSize = fsz(22); enemyInfo.position.set(L.rightX, L.enemyInfoY);
    enemyDiyas.position.set(L.enemyDiyas.x, L.enemyDiyas.y); enemyDiyas.scale.set(L.enemyDiyas.s);
    myDiyas.position.set(L.myDiyas.x, L.myDiyas.y); myDiyas.scale.set(L.myDiyas.s);
    myKosha.style.fontSize = fsz(40); myKosha.position.set(L.rightX, L.koshaY);
    koshaLabel.style.fontSize = fsz(16); koshaLabel.position.set(L.rightX, L.koshaLabelY);
    deckPile.position.set(L.deck.x, L.deck.y);
    deckCount.style.fontSize = fsz(30);
    yantraRow[0].position.set(L.yantraX, L.line.mine); yantraRow[1].position.set(L.yantraX, L.line.enemy);
    endBtn.position.set(L.rightX, L.endY); endBtn.scale.set(L.endS);
    endT.style.fontSize = L.phone ? 28 : 26;
    hint.style.fontSize = fsz(24); hint.position.set(L.laneX + L.laneW / 2, L.hintY);
    rounds.forEach((r, i) => {
      r.g.clear().circle(0, 0, L.roundR).fill({ color: 0x140c07, alpha: 0.85 }).stroke({ width: 2, color: INK.gold });
      r.t.style.fontSize = Math.round(L.roundR * 0.78);
      r.c.position.set(L.roundX[i], L.roundY);
    });
  }

  /* ---------------- start ---------------- */
  function start(): void {
    st = firstThroneGame(Math.floor(Math.random() * 1e9), 'normal');
    drainEvents(st);
    shown = snapshot(st);
    intense = false;
    clearBoard();
    handHeld = true;
    applyLayout();
    reconcile(shown, true);
    briefing(true);
  }

  /** remove every unit, card and yantra view, so reconcile can rebuild them */
  function clearBoard(): void {
    tokens.forEach(t => t.destroy()); tokens.clear();
    hand.forEach(h => h.destroy()); hand = [];
    enemyHand.forEach(h => h.destroy()); enemyHand = [];
    yantraRow.forEach(r => r.removeChildren().forEach(c => destroyTree(c as Container)));
    deckPile.removeChildren().forEach(c => { if (c !== deckCount) c.destroy(); });
  }

  function briefing(animate: boolean): void {
    busy = true;
    audio.playMusic('music_briefing');
    const W = L.W, H = L.H, k = L.ui;
    const panel = new Container();
    const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.72 });
    dim.eventMode = 'static';
    const art = new Sprite(cardFace('m_chandragupta')); art.anchor.set(0.5); art.rotation = -0.05;
    const as = L.phone ? (H * 0.82) / 672 : 0.8;
    art.scale.set(as); art.position.set(L.phone ? 40 + 240 * as : 560, L.phone ? H / 2 : 520);
    const tx = L.phone ? 40 + 480 * as + 60 : 860, wrap = L.phone ? W - tx - 50 : 820;
    const t1 = new Text({ text: `${FIRST_THRONE.place.toUpperCase()} · ${FIRST_THRONE.year.toUpperCase()}`, style: { fontFamily: FONT_SERIF, fontSize: Math.round(22 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold } });
    const t2 = new Text({ text: FIRST_THRONE.title, style: { fontFamily: FONT_SERIF, fontSize: 86, fontWeight: '700', fill: INK.goldPale } });
    const t3 = new Text({ text: FIRST_THRONE.briefing, style: { fontFamily: FONT_SERIF, fontSize: Math.round(30 * k), fill: INK.cream, wordWrap: true, wordWrapWidth: wrap, lineHeight: Math.round(42 * k) } });
    const t4 = new Text({ text: 'Destroy the Nanda Durg before they destroy yours.', style: { fontFamily: FONT_SERIF, fontSize: Math.round(26 * k), fontStyle: 'italic', fill: INK.gold, wordWrap: true, wordWrapWidth: wrap } });
    if (L.phone) { t2.style.fontSize = 76; t1.position.set(tx, 40); t2.position.set(tx - 4, 72); t3.position.set(tx, 180); t4.position.set(tx, t3.y + t3.height + 20); }
    else { t1.position.set(tx, 300); t2.position.set(tx - 4, 336); t3.position.set(tx, 460); t4.position.set(tx, 680); }
    const go = makeButton('To battle', () => {
      audio.unlock(); audio.play('conch');
      audio.playMusic('music_battle_calm');
      overlay = null;
      gsap.to(panel, {
        alpha: 0, duration: 0.4, onComplete: () => {
          destroyTree(panel); busy = false;
          handHeld = false; syncHand(shown, false);
          void turnBanner(0); refreshInteractivity();
        }
      });
    }, { primary: true, w: 340 });
    go.position.set(L.phone ? tx + 215 : 1030, L.phone ? Math.min(H - 56, t4.y + t4.height + 70) : 800);
    panel.addChild(dim, art, t1, t2, t3, t4, go);
    s.addChild(panel);
    overlay = { kind: 'briefing', view: panel };
    if (animate) {
      gsap.from([t1, t2, t3, t4, go], { alpha: 0, y: '+=24', duration: 0.8, stagger: 0.1, ease: 'power2.out' });
      gsap.from(art, { alpha: 0, x: '-=60', duration: 0.9, ease: 'power2.out' });
    }
  }

  /* ============================================================
     reconcile: make the screen match a game state.
     Damage shows as floating numbers; the fallen burn away.
     ============================================================ */
  function reconcile(state: Snap, instant = false, spawn: Spawn = new Map()): void {
    shown = state;
    const d = instant ? 0 : 0.42;
    const place = (list: Unit[], y: number, defaultFrom: { x: number; y: number; scale?: number }) => {
      list.forEach((u, i) => {
        let v = tokens.get(u.uid);
        if (!v) {
          v = new TokenView(u, L.phone);
          const sp = spawn.get(u.uid) ?? defaultFrom;
          v.position.set(sp.x, sp.y); v.scale.set(sp.scale ?? 0.4 * L.tok); v.alpha = instant ? 1 : 0;
          unitLayer.addChild(v); tokens.set(u.uid, v);
          bindToken(v);
          gsap.to(v.scale, { x: L.tok, y: L.tok, duration: instant ? 0 : 0.42, ease: 'back.out(1.6)' });
          gsap.to(v, { alpha: 1, duration: instant ? 0 : 0.2 });
        } else {
          const dh = v.hp - u.hp;
          if (dh > 0 && !instant) damageShield(v.x, v.y - 10 * L.tok, dh, 1);
          if (dh < 0 && !instant) floatNumber(v.x, v.y - 40 * L.tok, `+${-dh}`, 0x9cff8a);
          if (u.atk > v.atk && !instant) floatNumber(v.x - 60 * L.tok, v.y + 70 * L.tok, `+${u.atk - v.atk}`, 0xffc04a);
        }
        v.update(u);
        v.setSpent(u.owner === state.active && (u.attacked || !u.canAct) && !state.over);
        gsap.to(v, { x: slotX(i, list.length), y, rotation: 0, duration: d, ease: 'power2.out' });
      });
    };
    place(state.players[1].support, L.line.enemy, { x: L.enemyHand.x, y: L.enemyHand.y });
    place(state.players[0].support, L.line.mine, { x: L.handCX, y: L.handY });
    place(state.front.units, L.line.front, { x: L.laneX + L.laneW / 2, y: L.line.front });

    // the fallen
    const living = new Set([...state.players[0].support, ...state.players[1].support, ...state.front.units].map(u => u.uid));
    for (const [uid, v] of tokens) {
      if (living.has(uid)) continue;
      tokens.delete(uid);
      if (!instant) { if (v.hp > 0) damageShield(v.x, v.y - 10 * L.tok, v.hp, 1); burnAway(v); } else v.destroy();
    }

    // Durgs
    for (const i of [0, 1] as PlayerIndex[]) {
      const p = state.players[i];
      const dh = durg[i].hp - p.hq.hp;
      if (!instant && durg[i].hp && dh > 0) damageShield(durg[i].x, durg[i].y - 10, dh, 1.35);
      if (!instant && durg[i].hp && dh < 0) floatNumber(durg[i].x, durg[i].y - 10, `+${-dh}`, 0x9cff8a, 64);
      durg[i].set(p.hq.name, i === 0 ? EMPIRES[p.empire].name : p.faction, p.hq.hp, p.hq.maxHp);
    }
    // the music turns urgent once either Durg is half down
    if (!instant && !intense && !state.over && state.players.some(p => p.hq.hp <= p.hq.maxHp / 2)) {
      intense = true; audio.playMusic('music_battle_intense');
    }

    // yantras face-down
    for (const i of [0, 1] as PlayerIndex[]) {
      const row = yantraRow[i];
      const want = state.players[i].yantras.length;
      while (row.children.length > want) { const ch = row.children[row.children.length - 1] as Container; stopTweens(ch); ch.destroy(); }
      while (row.children.length < want) {
        const b = new HandCard('y_kavach', 0, true);
        b.scale.set(L.yantraS); b.eventMode = 'none';
        row.addChild(b);
      }
      row.children.forEach((c, k) => { c.visible = true; c.y = yantraSlotY(k, want); });
    }

    // lanes and the front line's colour
    frontGlow.clear(); lanes.clear();
    for (const y of [L.line.enemy, L.line.mine]) {
      lanes.roundRect(L.laneX, y - L.laneH / 2, L.laneW, L.laneH, 16).fill({ color: 0x0c0704, alpha: 0.42 }).stroke({ width: 1.5, color: INK.gold, alpha: 0.35 });
    }
    const fo = state.front.owner;
    const fcol = fo === null ? INK.gold : fo === 0 ? 0xe7c46e : 0xe0674a;
    frontGlow.roundRect(L.laneX, L.line.front - L.laneH / 2, L.laneW, L.laneH, 16)
      .fill({ color: fo === null ? 0x0c0704 : fcol, alpha: fo === null ? 0.42 : 0.16 })
      .stroke({ width: fo === null ? 1.5 : 3, color: fcol, alpha: fo === null ? 0.35 : 0.9 });

    // treasury and decks
    const me = state.players[0], foe = state.players[1];
    myKosha.text = `${me.kosha} / ${me.maxKosha}`;
    drawDiyas(myDiyas, me.kosha, me.maxKosha);
    drawDiyas(enemyDiyas, foe.kosha, foe.maxKosha);
    enemyInfo.text = `${foe.faction} · Kosha ${foe.kosha}/${foe.maxKosha}\nDeck ${foe.deck.length}`;
    drawDeck(me.deck.length);

    syncHand(state, instant);
    syncEnemyHand(state, instant);
    refreshInteractivity();
  }

  const yantraSlotY = (k: number, n: number) => (n === 1 ? 0 : (k - 0.5) * L.yantraGap);

  function drawDeck(n: number): void {
    const want = Math.min(3, Math.ceil(n / 6));
    const backs = deckPile.children.filter(c => c !== deckCount);
    if (backs.length !== want) {
      backs.forEach(c => c.destroy());
      for (let i = 0; i < want; i++) {
        const b = new HandCard('y_kavach', 0, true); b.eventMode = 'none';
        b.scale.set(L.deck.s); b.position.set(-i * 3, -i * 4); deckPile.addChildAt(b, 0);
      }
    }
    deckPile.addChild(deckCount);
    deckCount.text = String(n);
    deckCount.position.set(-(want - 1) * 3, -(want - 1) * 4);
  }

  function syncHand(state: Snap, instant: boolean): void {
    if (handHeld) return;
    const ids = state.players[0].hand;
    const next: HandCard[] = [];
    const pool = [...hand];
    let fresh = 0;
    ids.forEach(id => {
      const k = pool.findIndex(h => h.cardId === id);
      if (k >= 0) { next.push(pool[k]); pool.splice(k, 1); return; }
      const h = new HandCard(id, state.players[0].upgrades[id] || 0, !instant);
      h.setCost(koshaCost(st, 0, CARDS[id]));
      h.position.set(L.deck.x, L.deck.y); h.scale.set(L.deck.s);
      if (!instant) h.drawDelay = fresh++ * 0.16;
      handLayer.addChild(h);
      bindCard(h);
      next.push(h);
    });
    pool.forEach(h => h.destroy());
    hand = next;
    layoutHand(instant);
  }

  function layoutHand(instant = false): void {
    const n = hand.length;
    const spread = Math.min(L.handMaxGap, L.handSpan / Math.max(1, n));
    const rest = L.handScale / 0.5;
    hand.forEach((h, i) => {
      const off = i - (n - 1) / 2;
      const lifted = i === hoverIdx && !drag;
      h.home = { x: L.handCX + off * spread, y: L.handY + Math.abs(off) * 6, rot: off * 0.035 };
      handLayer.setChildIndex(h, Math.min(handLayer.children.length - 1, i));
      if (drag?.kind === 'card' && drag.view === h) return;
      if (h.drawDelay !== null) {
        // fresh from the deck: fly in face-down and turn over on the way
        const delay = h.drawDelay;
        h.drawDelay = null;
        dealUntil = Math.max(dealUntil, performance.now() + (delay + 0.62) * 1000);
        gsap.to(h, { x: h.home.x, y: h.home.y, rotation: h.home.rot, duration: 0.55, delay, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(h.scale, { x: rest, y: rest, duration: 0.55, delay, ease: 'power2.out', overwrite: 'auto' });
        gsap.delayedCall(delay, () => { if (alive) audio.play('cardDraw'); });
        void h.turnUp({ delay: delay + 0.1, duration: 0.42 });
        return;
      }
      gsap.to(h, { x: h.home.x, y: lifted ? L.liftY : h.home.y, rotation: lifted ? 0 : h.home.rot, duration: instant ? 0 : 0.25, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(h.scale, { x: lifted ? L.liftScale : rest, y: lifted ? L.liftScale : rest, duration: instant ? 0 : 0.2, overwrite: 'auto' });
    });
    if (hoverIdx >= 0 && hand[hoverIdx]) handLayer.addChild(hand[hoverIdx]);
  }

  function syncEnemyHand(state: Snap, instant: boolean): void {
    const n = state.players[1].hand.length;
    while (enemyHand.length > n) enemyHand.pop()!.destroy();
    while (enemyHand.length < n) {
      const b = new HandCard('n_padati', 0, true);
      b.eventMode = 'none'; b.scale.set(L.enemyHand.s);
      b.position.set(L.enemyHand.x + 200, L.enemyHand.y - 60);
      handLayer.addChild(b); enemyHand.push(b);
    }
    const gap = 26 * (L.enemyHand.s / 0.24);
    enemyHand.forEach((b, i) => {
      const off = i - (n - 1) / 2;
      gsap.to(b, { x: L.enemyHand.x + off * gap, y: L.enemyHand.y + Math.abs(off) * 2, rotation: Math.PI + off * 0.06, duration: instant ? 0 : 0.3 });
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
    hand.forEach((h, i) => {
      h.setCost(koshaCost(st, 0, CARDS[h.cardId]));
      h.setPlayable(myTurn && (cardTargets(i).zone !== null || cardTargets(i).units.length > 0));
    });
    tokens.forEach(v => v.setRing(myTurn && v.owner === 0 && unitCanDoAnything(v.uid) ? 'ready' : 'none'));
    durg[1].setRing(false);
    const anything = myTurn && (hand.some((_, i) => cardTargets(i).zone !== null || cardTargets(i).units.length > 0) || [...tokens.values()].some(v => v.owner === 0 && unitCanDoAnything(v.uid)));
    drawEnd(overlay?.kind === 'briefing' ? 'mine' : !myTurn ? 'enemy' : anything ? 'mine' : 'ready');
    hint.text = myTurn ? hintText() : st.over || overlay || st.active === 0 ? '' : 'The Nanda generals are moving…';
    if (pick) showTargets(pick);
  }

  function hintText(): string {
    const me = st.players[0];
    const mine = allUnits(st, 0);
    const tap = L.phone ? 'Tap' : 'Drag';
    if (!mine.length && hand.some(h => CARDS[h.cardId].type === 'unit')) return L.phone ? 'Drag a unit card onto your Rajya line, or tap it and tap the line.' : 'Drag a unit card onto your Rajya line to deploy it.';
    const ready = mine.filter(x => unitCanDoAnything(x.unit.uid));
    if (ready.some(x => unitTargets(x.unit.uid).hq)) return 'Your units hold the Yudhbhumi. Drag one onto the enemy Durg to strike it.';
    const guarded = st.front.owner === 0 && st.players[1].support.some(u => u.kw.includes('raksha'));
    if (guarded && ready.length) return 'A Raksha guards the Nanda Durg. Cut it down before you strike the walls.';
    if (ready.some(x => unitTargets(x.unit.uid).front)) return L.phone ? 'Move a glowing unit up to the Yudhbhumi, or onto an enemy.' : 'Drag a glowing unit up to the Yudhbhumi to advance, or onto an enemy to attack.';
    if (ready.length) return `${tap} a glowing unit onto a red-ringed enemy to attack it.`;
    if (mine.some(x => x.unit.moved && !x.unit.attacked && !canCharge(x.unit))) return L.phone ? 'Units that advanced strike next turn. Cavalry and chariots can charge at once.' : 'Foot soldiers and elephants that advanced this turn strike next turn. Cavalry and chariots can charge at once.';
    if (mine.some(x => !x.unit.canAct)) return L.phone ? 'New units wait a turn, unless they have Vega (the double arrow).' : 'Units that just arrived must wait a turn, unless they have Vega (the double arrow).';
    if (me.kosha === 0) return 'Your treasury is spent. Press End Turn.';
    return L.phone ? 'Tap any enemy, or hold a card, to read it. Press End Turn when done.' : 'Click an enemy, or right-click any card, to read it. Press End Turn when you are done.';
  }

  function clearTargets(): void {
    tokens.forEach(v => { if (v.owner === 1) v.setRing('none'); });
    durg[1].setRing(false);
    lanes.alpha = 1; frontGlow.alpha = 1;
    zoneGlow.clear();
    syncPreview();
  }

  function showTargets(p: Exclude<Pick, null>): void {
    clearTargets();
    if (p.kind === 'card') {
      const t = cardTargets(p.index);
      if (t.zone === 'mine') glowZone(L.line.mine);
      if (t.zone === 'board') { glowZone(L.line.front); }
      t.units.forEach(uid => tokens.get(uid)?.setRing('target'));
    } else {
      const t = unitTargets(p.uid);
      if (t.front) glowZone(L.line.front);
      t.units.forEach(uid => tokens.get(uid)?.setRing('target'));
      durg[1].setRing(t.hq);
      tokens.get(p.uid)?.setRing('selected');
    }
    syncPreview();
  }
  function glowZone(y: number): void {
    zoneGlow.roundRect(L.laneX - 4, y - L.laneH / 2 - 4, L.laneW + 8, L.laneH + 8, 18).stroke({ width: 5, color: 0x7dff8a, alpha: 0.9 });
    zoneGlow.roundRect(L.laneX, y - L.laneH / 2, L.laneW, L.laneH, 16).fill({ color: 0x7dff8a, alpha: 0.08 });
  }

  /** phones: while a card or unit is selected, show it large at the side so its text can be read */
  let previewId: string | null = null;
  function syncPreview(): void {
    let id: string | null = null;
    if (L.preview && pick && !drag) {
      id = pick.kind === 'card' ? (hand[pick.index]?.cardId ?? null) : (tokens.get(pick.uid)?.cardId ?? null);
    }
    if (id === previewId) return;
    previewId = id;
    previewLayer.children.forEach(c => stopTweens(c as Container));
    previewLayer.removeChildren().forEach(c => c.destroy());
    if (!id || !L.preview) return;
    const fromHand = pick?.kind === 'card' ? hand[pick.index] : undefined;
    const sp = new Sprite(cardFace(id, st.players[0].upgrades[id] || 0, fromHand?.cost));
    sp.anchor.set(0.5); sp.position.set(L.preview.x, L.preview.y);
    const k = L.preview.s;
    sp.scale.set(k);
    const shade = new Graphics().roundRect(L.preview.x - 240 * k - 8, L.preview.y - 336 * k - 8, 480 * k + 16, 672 * k + 16, 20).fill({ color: 0x000000, alpha: 0.55 });
    previewLayer.addChild(shade, sp);
    previewLayer.eventMode = 'none';
    gsap.from(sp, { alpha: 0, x: sp.x + 40, duration: 0.2 });
  }

  /* ---------------- input ---------------- */
  const toDesign = (e: FederatedPointerEvent) => s.toLocal(e.global);

  function bindCard(h: HandCard): void {
    h.on('pointerdown', (e: FederatedPointerEvent) => {
      if (e.button === 2) { inspect(h.cardId, { cost: h.cost }); return; }
      audio.unlock();
      if (busy || st.active !== 0 || st.over || h.flipping) { (lastPointer = toDesign(e), armLongPress(h.cardId, { cost: h.cost })); return; }
      const index = hand.indexOf(h);
      const p = toDesign(e);
      drag = { kind: 'card', index, view: h, moved: false, sx: p.x, sy: p.y, downAt: performance.now() };
      (lastPointer = toDesign(e), armLongPress(h.cardId, { cost: h.cost }));
    });
    h.on('pointerover', (e: FederatedPointerEvent) => { if (e.pointerType === 'mouse' && !drag) { hoverIdx = hand.indexOf(h); layoutHand(); } });
    h.on('pointerout', (e: FederatedPointerEvent) => { if (e.pointerType === 'mouse' && !drag && hoverIdx === hand.indexOf(h)) { hoverIdx = -1; layoutHand(); } });
  }

  function bindToken(v: TokenView): void {
    // tapping an enemy reads its card (unless the tap was choosing a target for a selected card or unit)
    if (v.owner === 1) v.on('pointertap', () => {
      if (performance.now() - targetTapAt < 700 || overlay || drag) return;
      if (longPressFired && performance.now() - longPressFired < 700) return;
      inspect(v.cardId, unitExtra(v));
    });
    v.on('pointerdown', (e: FederatedPointerEvent) => {
      if (e.button === 2) { inspect(v.cardId, unitExtra(v)); return; }
      audio.unlock();
      lastPointer = toDesign(e); armLongPress(v.cardId, unitExtra(v));
      if (busy || st.active !== 0 || st.over) return;
      if (v.owner !== 0) return;
      const p = toDesign(e);
      drag = { kind: 'unit', uid: v.uid, view: v, moved: false, sx: p.x, sy: p.y, downAt: performance.now() };
    });
  }

  const unitExtra = (v: TokenView): InspectExtra => ({ unit: findUnit(st, v.owner, v.uid)?.unit });
  function armLongPress(cardId: string, extra: InspectExtra = {}): void {
    if (longPress) clearTimeout(longPress);
    pressAt = lastPointer ? { x: lastPointer.x, y: lastPointer.y } : null;
    longPress = setTimeout(() => { longPress = null; if (drag && drag.moved) return; cancelDrag(); longPressFired = performance.now(); inspect(cardId, extra); }, 480);
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
      gsap.to(v, { x: p.x, y: p.y, rotation: Math.max(-0.35, Math.min(0.35, vx * 0.01)), duration: 0.08, overwrite: 'auto' });
      gsap.to(v.scale, { x: L.dragScale, y: L.dragScale, duration: 0.15, overwrite: 'auto' });
      const t = cardTargets(drag.index);
      if (t.units.length) drawArrow(v.x, v.y - 60, p.x, p.y, hitUnit(p, 1) !== null);
      else arrow.clear();
    } else {
      const v = drag.view;
      const tgt = targetAt(p, { kind: 'unit', uid: drag.uid });
      const over = tgt !== null;
      drawArrow(v.x, v.y - (TOKEN_DH / 2 - 30) * L.tok, p.x, p.y, over);
      showCombatPreview(drag.uid, tgt && tgt.kind !== 'zone' ? tgt : null);
    }
  });
  s.on('pointerup', (e: FederatedPointerEvent) => void release(e));
  s.on('pointerupoutside', (e: FederatedPointerEvent) => void release(e));
  s.on('pointerdown', (e: FederatedPointerEvent) => {
    if (overlay?.kind === 'inspect') { closeInspect(); return; }
    // tap-to-target: a tap on the field after selecting
    if (!pick || drag || busy) return;
    const p = toDesign(e);
    const tgt = targetAt(p, pick);
    if (tgt) { targetTapAt = performance.now(); resolvePickOn(tgt); }
    else if (pick.kind === 'unit' && hitDurg(p)) { targetTapAt = performance.now(); explainDurg(pick.uid); } else if (p.y < L.handTop + 10) { pick = null; clearTargets(); refreshInteractivity(); hoverIdx = -1; layoutHand(); }
  });

  type DropTarget = Target | { kind: 'zone'; zone: 'mine' | 'front' | 'board' };

  function inLane(p: Point, y: number): boolean { return p.x > L.laneX - 20 && p.x < L.laneX + L.laneW + 20 && Math.abs(p.y - y) < L.laneH / 2 + 20; }
  function hitUnit(p: Point, owner: PlayerIndex): number | null {
    for (const v of tokens.values()) if (v.owner === owner && Math.abs(p.x - v.x) < 95 * L.tok && Math.abs(p.y - v.y) < 115 * L.tok) return v.uid;
    return null;
  }
  const hitDurg = (p: Point) => Math.abs(p.x - durg[1].x) < 130 * L.durgS && Math.abs(p.y - durg[1].y) < 130 * L.durgS;

  function targetAt(p: Point, from: Exclude<Pick, null>): DropTarget | null {
    if (from.kind === 'card') {
      const t = cardTargets(from.index);
      const u = hitUnit(p, 1);
      if (u !== null && t.units.includes(u)) return { kind: 'unit', owner: 1, uid: u };
      if (t.zone === 'mine' && (inLane(p, L.line.mine) || inLane(p, L.line.front))) return { kind: 'zone', zone: 'mine' };
      if (t.zone === 'board' && p.y < L.handTop) return { kind: 'zone', zone: 'board' };
      return null;
    }
    const t = unitTargets(from.uid);
    const u = hitUnit(p, 1);
    if (u !== null && t.units.includes(u)) return { kind: 'unit', owner: 1, uid: u };
    if (t.hq && hitDurg(p)) return { kind: 'hq', owner: 1 };
    if (t.front && inLane(p, L.line.front)) return { kind: 'zone', zone: 'front' };
    return null;
  }

  async function release(e: FederatedPointerEvent): Promise<void> {
    if (longPress) { clearTimeout(longPress); longPress = null; }
    if (!drag) return;
    const d = drag;
    drag = null;
    arrow.clear(); clearCombatPreview();
    const p = toDesign(e);
    if (!d.moved) {
      // a tap: select, so the next tap picks the target
      const p2: Pick = d.kind === 'card' ? { kind: 'card', index: d.index } : { kind: 'unit', uid: d.uid };
      const same = pick && pick.kind === p2.kind && (p2.kind === 'card' ? (pick as { index: number }).index === p2.index : (pick as { uid: number }).uid === p2.uid);
      clearTargets();
      if (same) { pick = null; hoverIdx = -1; layoutHand(); refreshInteractivity(); return; }
      // a card with nowhere to choose (an order or yantra) is played on a second tap of the board
      pick = p2; audio.play('click');
      if (d.kind === 'card') { hoverIdx = d.index; layoutHand(); }
      showTargets(p2);
      return;
    }
    const from: Exclude<Pick, null> = d.kind === 'card' ? { kind: 'card', index: d.index } : { kind: 'unit', uid: d.uid };
    const tgt = targetAt(p, from);
    clearTargets();
    if (!tgt && from.kind === 'unit' && hitDurg(p)) { cancelDrag(d); explainDurg(from.uid); return; }
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

  /** a unit dropped on the enemy Durg when it may not strike it: say why */
  function explainDurg(uid: number): void {
    const why = canAttack(st, 0, uid, { kind: 'hq', owner: 1 });
    if (!why.ok) { flashHint(why.reason); if (/Raksha/.test(why.reason)) tokens.forEach(v => { if (v.owner === 1 && st.players[1].support.some(u => u.uid === v.uid && u.kw.includes('raksha'))) v.setRing('target'); }); }
  }

  function cancelDrag(d?: Drag): void {
    const dd = d ?? drag;
    drag = null; arrow.clear(); clearCombatPreview();
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
    busy = true; animating = true;
    refreshInteractivity();
    const events = drainEvents(st);
    const spawn: Spawn = new Map();
    const handoff: Container[] = [];
    if (cardView) {
      hand = hand.filter(h => h !== cardView);
      const dep = events.find(ev => ev.t === 'deploy');
      if (dep && dep.t === 'deploy') {
        spawn.set(dep.uid, { x: cardView.x, y: cardView.y, scale: 0.9 * L.tok });
        cardView.destroy();
      } else {
        const left = await castCard(cardView, events);
        if (left) handoff.push(left);
      }
    }
    await animate(events, snapshot(st), spawn, handoff);
    busy = false; animating = false;
    refreshInteractivity();
    if (!checkOver()) settle();
  }

  /** an order card rises to the centre, glows and dissolves; a yantra turns face-down on its way to its slot */
  async function castCard(v: HandCard, events: GameEvent[]): Promise<Container | null> {
    fx.addChild(v);
    const isYantra = events.some(e => e.t === 'yantraSet');
    audio.play('cardPlay');
    if (isYantra) {
      const n = st.players[0].yantras.length;
      await Promise.all([
        gsap.to(v, { x: L.yantraX, y: L.line.mine + yantraSlotY(n - 1, n), rotation: 0, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' }),
        gsap.to(v.scale, { x: L.yantraS, y: L.yantraS, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' }),
        v.turnDown({ delay: 0.08, duration: 0.45 })
      ]);
      audio.play('yantra');
      return v;
    }
    await Promise.all([
      gsap.to(v, { x: L.reveal.x, y: L.reveal.y, rotation: 0, duration: 0.35, ease: 'power2.out', overwrite: 'auto' }),
      gsap.to(v.scale, { x: L.reveal.s, y: L.reveal.s, duration: 0.35, overwrite: 'auto' })
    ]);
    const shakti = CARDS[v.cardId].kind === 'shakti';
    if (shakti) { audio.play('conch'); flash(0xffd27a, 0.35); }
    await gsap.to(v, { alpha: 0, duration: 0.4, delay: 0.35 });
    v.destroy();
    return null;
  }

  /* ---------------- event animation ---------------- */
  async function animate(events: GameEvent[], after: Snap, spawn: Spawn = new Map(), handoff: Container[] = []): Promise<void> {
    for (const e of events) {
      if (!alive) return;
      switch (e.t) {
        case 'deploy': {
          if (e.owner === 1) {
            const target = slotOf(after, e.uid);
            const card = await enemyReveal(e.cardId, target);
            if (card) handoff.push(card);
            spawn.set(e.uid, { x: target.x, y: target.y, scale: 0.94 * L.tok });
          } else if (!spawn.has(e.uid)) spawn.set(e.uid, { x: L.handCX, y: L.handY, scale: 0.6 * L.tok });
          sfxFor(e.cardId);
          break;
        }
        case 'move': {
          audio.play('march');
          const v = tokens.get(e.uid);
          if (v) await gsap.to(v, { y: L.line.front, duration: 0.35, ease: 'power2.inOut' });
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
          if (e.owner === 1) await enemyReveal(e.cardId, null);
          if (e.cardId === 's_agni' || e.cardId === 'n_aakraman') {
            audio.play(e.cardId === 's_agni' ? 'fire' : 'clash');
          } else if (e.cardId === 's_chakravyuha' || e.cardId === 'n_visha_baan') { audio.play(e.cardId === 'n_visha_baan' ? 'bow' : 'drum'); shake(10); }
          else audio.play('coin');
          break;
        }
        case 'yantraSet':
          if (e.owner === 1) { const b = await enemySetYantra(after); if (b) handoff.push(b); }
          break;
        case 'yantra':
          await reveal(e.cardId, e.owner);
          break;
        case 'promote': {
          const v = tokens.get(e.uid);
          if (v) await promoteFx(v, e.rank);
          break;
        }
        case 'death':
          break;
      }
    }
    reconcile(after, false, spawn);
    // cards that flew to where a token or yantra now stands melt into it
    handoff.forEach(h => gsap.to(h, { alpha: 0, duration: 0.18, onComplete: () => destroyTree(h) }));
    await wait(events.some(ev => ev.t === 'death' || ev.t === 'attack' || ev.t === 'hq') ? 520 : 380);
  }

  /** where a unit will stand in a state (for cards flying to their slot) */
  function slotOf(state: Snap, uid: number): { x: number; y: number } {
    const lines: [Unit[], number][] = [[state.players[1].support, L.line.enemy], [state.players[0].support, L.line.mine], [state.front.units, L.line.front]];
    for (const [list, y] of lines) {
      const i = list.findIndex(u => u.uid === uid);
      if (i >= 0) return { x: slotX(i, list.length), y };
    }
    return { x: L.laneX + L.laneW / 2, y: L.line.enemy };
  }

  function sfxFor(cardId: string): void {
    const c = CARDS[cardId];
    audio.play('deploy');
    if (/gaja|hasti/.test(cardId)) setTimeout(() => audio.play('elephant'), 150);
    else if (c.kw?.includes('veg')) setTimeout(() => audio.play('march'), 100);
  }

  async function strike(a: TokenView, tx: number, ty: number, ranged: boolean): Promise<void> {
    unitLayer.addChild(a);
    // the attacker lights up for a moment as it commits
    a.tint = 0xffffff;
    gsap.fromTo(a, { tint: 0xfff2c0 }, { tint: 0xffffff, duration: 0.5 });
    gsap.fromTo(a.scale, { x: L.tok * 1.08, y: L.tok * 1.08 }, { x: L.tok, y: L.tok, duration: 0.35, ease: 'power2.out' });
    if (ranged) {
      audio.play('bow');
      const ar = new Graphics().moveTo(-22, 0).lineTo(22, 0).stroke({ width: 3, color: 0xf0d79a }).poly([22, -6, 34, 0, 22, 6]).fill(0xf0d79a);
      ar.position.set(a.x, a.y - 40 * L.tok); ar.rotation = Math.atan2(ty - a.y, tx - a.x);
      fx.addChild(ar);
      await gsap.to(a, { y: a.y + (ty > a.y ? -10 : 10), duration: 0.08, yoyo: true, repeat: 1 });
      await gsap.to(ar, { x: tx, y: ty, duration: 0.32, ease: 'power1.in' });
      ar.destroy();
      audio.play('arrowHit');
      sparks(tx, ty, 0xffd27a);
      hitFlash(tx, ty);
      return;
    }
    const ox = a.x, oy = a.y;
    await gsap.to(a, { x: ox + (tx - ox) * 0.72, y: oy + (ty - oy) * 0.72, rotation: (tx - ox) * 0.0004, duration: 0.2, ease: 'power3.in' });
    audio.play('clash');
    sparks(tx, ty, 0xffa040);
    dust(tx, ty);
    hitFlash(tx, ty);
    await gsap.to(a, { x: ox, y: oy, rotation: 0, duration: 0.3, ease: 'power2.out' });
  }

  /** take one card back out of the enemy's hand, returning where it was */
  function takeEnemyCard(): { x: number; y: number; r: number } {
    const b = enemyHand.pop();
    const from = b ? { x: b.x, y: b.y, r: b.rotation } : { x: L.enemyHand.x, y: L.enemyHand.y, r: Math.PI };
    b?.destroy();
    return from;
  }

  /** The enemy plays a card: it leaves their hand face-down, turns over in mid-air so you can read it,
      then either flies to its place on the board (a unit; returned for the hand-off) or fades (an order). */
  async function enemyReveal(cardId: string, target: { x: number; y: number } | null): Promise<HandCard | null> {
    const from = takeEnemyCard();
    const v = new HandCard(cardId, 0, true);
    v.eventMode = 'none'; v.position.set(from.x, from.y); v.rotation = from.r - Math.PI * 2; v.scale.set(L.enemyHand.s);
    fx.addChild(v);
    audio.play('cardPlay');
    const ry = target ? (L.line.enemy + L.line.front) / 2 : L.reveal.y;
    await Promise.all([
      gsap.to(v, { x: L.reveal.x, y: ry, rotation: 0, duration: 0.55, ease: 'power2.out' }),
      gsap.to(v.scale, { x: L.reveal.s, y: L.reveal.s, duration: 0.55, ease: 'power2.out' }),
      v.turnUp({ delay: 0.12, duration: 0.45 })
    ]);
    if (!alive) return null;
    if (!target) {
      if (CARDS[cardId].kind === 'shakti') { audio.play('conch'); flash(0xff8a5a, 0.3); }
      await gsap.to(v, { alpha: 0, duration: 0.4, delay: 0.75 });
      v.destroy();
      return null;
    }
    // to its slot, shrinking to the size of a token
    const k = (TOKEN_DH * L.tok) / 336;
    await Promise.all([
      gsap.to(v, { x: target.x, y: target.y, duration: 0.32, delay: 0.5, ease: 'power2.in' }),
      gsap.to(v.scale, { x: k, y: k, duration: 0.32, delay: 0.5, ease: 'power2.in' })
    ]);
    return v;
  }

  /** the enemy sets a yantra: a card back slides from their hand to their yantra row */
  async function enemySetYantra(after: Snap): Promise<HandCard | null> {
    const from = takeEnemyCard();
    const v = new HandCard('y_kavach', 0, true);
    v.eventMode = 'none'; v.position.set(from.x, from.y); v.rotation = from.r - Math.PI * 2; v.scale.set(L.enemyHand.s);
    fx.addChild(v);
    audio.play('cardPlay');
    const n = after.players[1].yantras.length;
    await Promise.all([
      gsap.to(v, { x: L.yantraX, y: L.line.enemy + yantraSlotY(n - 1, n), rotation: 0, duration: 0.55, ease: 'power2.inOut' }),
      gsap.to(v.scale, { x: L.yantraS, y: L.yantraS, duration: 0.55 })
    ]);
    return alive ? v : null;
  }

  /** a hidden yantra springs: its card lifts out of the row and turns over in the middle of the field */
  async function reveal(cardId: string, owner: PlayerIndex): Promise<void> {
    audio.play('yantra');
    const row = yantraRow[owner];
    const slot = row.children[row.children.length - 1] as Container | undefined;
    const from = slot ? { x: row.x + slot.x, y: row.y + slot.y } : { x: L.yantraX, y: owner === 0 ? L.line.mine : L.line.enemy };
    if (slot) slot.visible = false;
    const v = new HandCard(cardId, 0, true);
    v.eventMode = 'none'; v.position.set(from.x, from.y); v.scale.set(L.yantraS);
    fx.addChild(v);
    const label = new Text({ text: `${CARDS[cardId].name} springs!`, style: { fontFamily: FONT_SERIF, fontSize: Math.round(52 * Math.min(L.ui, 1.15)), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 7 } } });
    label.anchor.set(0.5); label.position.set(L.reveal.x, L.line.front + 336 * L.reveal.s * 0.5 + 34); label.alpha = 0;
    fx.addChild(label);
    await Promise.all([
      gsap.to(v, { x: L.reveal.x, y: L.reveal.y - 10, duration: 0.5, ease: 'back.out(1.2)' }),
      gsap.to(v.scale, { x: L.reveal.s, y: L.reveal.s, duration: 0.5, ease: 'back.out(1.3)' }),
      v.turnUp({ delay: 0.15, duration: 0.45, onHalf: () => flash(0xa0c8ff, 0.25) }),
      gsap.to(label, { alpha: 1, duration: 0.3, delay: 0.35 })
    ]);
    if (!alive) return;
    await gsap.to([v, label], { alpha: 0, duration: 0.4, delay: 0.9 });
    v.destroy(); label.destroy();
  }

  /* ---------------- effects ---------------- */
  /** KARDS-style damage: a red shield with the number, popped onto whoever was hurt */
  function shieldGraphic(n: number, k: number, color = 0xb3261e): Container {
    const c = new Container();
    const w = 54, h = 62;
    const g = new Graphics().poly([-w / 2, -h / 2, w / 2, -h / 2, w / 2, h * 0.1, 0, h / 2, -w / 2, h * 0.1])
      .fill(color).stroke({ width: 4, color: 0x1a0503 });
    g.poly([-w / 2 + 6, -h / 2 + 6, w / 2 - 6, -h / 2 + 6, w / 2 - 6, h * 0.07, 0, h / 2 - 8, -w / 2 + 6, h * 0.07]).stroke({ width: 2, color: 0xffb0a0, alpha: 0.6 });
    const t = new Text({ text: String(n), style: { fontFamily: FONT_SERIF, fontSize: 44, fontWeight: '700', fill: 0xffffff, stroke: { color: 0x3a0a04, width: 4 } } });
    t.anchor.set(0.5, 0.55);
    c.addChild(g, t);
    c.scale.set(k * (L.phone ? 1.2 : 1));
    return c;
  }
  function damageShield(x: number, y: number, n: number, k: number): void {
    const c = shieldGraphic(n, k);
    c.position.set(x, y); fx.addChild(c);
    const s0 = c.scale.x;
    gsap.fromTo(c.scale, { x: s0 * 0.3, y: s0 * 0.3 }, { x: s0, y: s0, duration: 0.25, ease: 'back.out(2.4)' });
    gsap.to(c, { y: y - 26, alpha: 0, duration: 0.45, delay: 0.85, ease: 'power1.in', onComplete: () => destroyTree(c) });
  }
  /** while aiming: the damage each side would take, as shields on both */
  function clearCombatPreview(): void { combatFx.removeChildren().forEach(c => destroyTree(c as Container)); }
  let previewKey = '';
  function showCombatPreview(uid: number, tgt: Target | null): void {
    const key = tgt ? `${uid}>${tgt.kind}:${tgt.kind === 'unit' ? tgt.uid : 'hq'}` : '';
    if (key === previewKey && combatFx.children.length) return;
    previewKey = key; clearCombatPreview();
    if (!tgt) return;
    const a = findUnit(st, 0, uid)?.unit; if (!a) return;
    const put = (x: number, y: number, n: number) => { const c = shieldGraphic(n, 0.9); c.position.set(x, y); combatFx.addChild(c); gsap.from(c.scale, { x: 0.2, y: 0.2, duration: 0.18, ease: 'back.out(2)' }); };
    if (tgt.kind === 'hq') { put(durg[1].x + 80 * L.durgS, durg[1].y - 60 * L.durgS, a.atk); return; }
    const d = findUnit(st, 1, tgt.uid)?.unit, dv = tokens.get(tgt.uid), av = tokens.get(uid);
    if (!d || !dv || !av) return;
    put(dv.x + 52 * L.tok, dv.y - 70 * L.tok, a.atk);
    if (a.range === 'melee' && d.range === 'melee' && d.atk > 0) put(av.x + 52 * L.tok, av.y - 70 * L.tok, d.atk);
  }
  /** a soft cloud of dust where two lines meet */
  function dust(x: number, y: number): void {
    for (let i = 0; i < 9; i++) {
      const p = new Graphics().circle(0, 0, 18 + Math.random() * 16).fill({ color: 0xe8dcc0, alpha: 0.5 });
      p.position.set(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 40); fx.addChild(p);
      const a = Math.random() * Math.PI * 2;
      gsap.fromTo(p.scale, { x: 0.4, y: 0.4 }, { x: 1.8, y: 1.8, duration: 0.9, ease: 'power2.out' });
      gsap.to(p, { x: p.x + Math.cos(a) * 50, y: p.y + Math.sin(a) * 30 - 20, alpha: 0, duration: 0.9, ease: 'power2.out', onComplete: () => p.destroy() });
    }
  }
  /** the struck unit flinches and flashes red */
  function hitFlash(x: number, y: number): void {
    let hit: TokenView | null = null;
    for (const v of tokens.values()) if (Math.abs(v.x - x) < 5 && Math.abs(v.y - y) < 5) hit = v;
    if (hit) {
      const v = hit;
      gsap.fromTo(v, { tint: 0xff7060 }, { tint: 0xffffff, duration: 0.45 });
      gsap.fromTo(v, { x: x + 8 }, { x, duration: 0.35, ease: 'elastic.out(1, 0.3)' });
    } else if (Math.abs(durg[1].x - x) < 5 || Math.abs(durg[0].x - x) < 5) {
      const d = Math.abs(durg[1].y - y) < 5 ? durg[1] : durg[0];
      gsap.fromTo(d, { tint: 0xff7060 }, { tint: 0xffffff, duration: 0.5 });
    }
  }
  /** a unit honoured for valour: a burst of gold and its new rank */
  async function promoteFx(v: TokenView, rank: number): Promise<void> {
    audio.play('conch');
    const ring = new Graphics().circle(0, 0, 70).stroke({ width: 8, color: 0xffd76a }); ring.blendMode = 'add';
    ring.position.set(v.x, v.y); fx.addChild(ring);
    gsap.fromTo(ring.scale, { x: 0.4, y: 0.4 }, { x: 2, y: 2, duration: 0.7, ease: 'power2.out' });
    gsap.to(ring, { alpha: 0, duration: 0.7, onComplete: () => ring.destroy() });
    sparks(v.x, v.y - 30 * L.tok, 0xffd76a);
    const t = new Text({ text: `${RANK_NAMES[rank].toUpperCase()}!`, style: { fontFamily: FONT_SERIF, fontSize: L.phone ? 50 : 44, fontWeight: '700', letterSpacing: 4, fill: 0xffe39a, stroke: { color: 0x2a1404, width: 7 } } });
    t.anchor.set(0.5); t.position.set(v.x, v.y - 110 * L.tok); fx.addChild(t);
    gsap.fromTo(t.scale, { x: 0.3, y: 0.3 }, { x: 1, y: 1, duration: 0.3, ease: 'back.out(2)' });
    await gsap.to(t, { y: t.y - 30, alpha: 0, duration: 0.5, delay: 0.7 });
    t.destroy();
  }
  function floatNumber(x: number, y: number, text: string, color: number, size = 54): void {
    const t = new Text({ text, style: { fontFamily: FONT_SERIF, fontSize: Math.round(size * (L.phone ? 1.15 : 1)), fontWeight: '700', fill: color, stroke: { color: 0x3a0a04, width: 7 } } });
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
      p.blendMode = 'add'; p.position.set(v.x + (-80 + Math.random() * 160) * L.tok, v.y + (100 - Math.random() * 200) * L.tok); fx.addChild(p);
      gsap.to(p, { y: p.y - 60 - Math.random() * 80, alpha: 0, duration: 0.8 + Math.random() * 0.6, delay: Math.random() * 0.3, onComplete: () => p.destroy() });
    }
    gsap.to(v, { alpha: 0, duration: 0.7, ease: 'power1.in', onComplete: () => v.destroy() });
    gsap.to(v.scale, { x: 0.85 * L.tok, y: 0.85 * L.tok, duration: 0.7 });
  }
  function shake(px: number): void { gsap.fromTo(s, { x: -px }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.25)' }); }
  function flash(color: number, alpha: number): void {
    const f = new Graphics().rect(0, 0, L.W, L.H).fill(color); f.alpha = alpha; f.blendMode = 'add'; fx.addChild(f);
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
    const hx = L.laneX + L.laneW / 2;
    hint.text = text; hint.style.fill = 0xffb09a;
    gsap.fromTo(hint, { x: hx - 10 }, { x: hx, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    setTimeout(() => { if (!alive) return; hint.style.fill = INK.cream; refreshInteractivity(); }, 1600);
  }
  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  /* ---------------- inspect ---------------- */
  function inspect(cardId: string, extra: InspectExtra = {}): void {
    if (overlay?.kind === 'inspect') closeInspect();
    if (overlay) return;
    hoverIdx = -1; layoutHand(); clearCombatPreview();
    const c = inspectOverlay(cardId, extra.unit ? 0 : st.players[0].upgrades[cardId] || 0, closeInspect, extra);
    s.addChild(c);
    overlay = { kind: 'inspect', view: c };
  }
  function closeInspect(): void {
    if (overlay?.kind !== 'inspect') return;
    destroyTree(overlay.view); overlay = null;
  }

  /* ---------------- turns ---------------- */
  async function turnBanner(who: PlayerIndex): Promise<void> {
    const bh = L.phone ? 120 : 140;
    const band = new Graphics().rect(0, -bh / 2, L.W, bh).fill({ color: 0x000000, alpha: 0.75 });
    band.moveTo(0, -bh / 2).lineTo(L.W, -bh / 2).moveTo(0, bh / 2).lineTo(L.W, bh / 2).stroke({ width: 2, color: who === 0 ? INK.gold : 0xe0674a });
    const t = new Text({ text: who === 0 ? 'YOUR TURN' : 'THE NANDA ARMY MOVES', style: { fontFamily: FONT_SERIF, fontSize: 72, fontWeight: '700', letterSpacing: 14, fill: who === 0 ? INK.goldPale : 0xffb09a } });
    t.anchor.set(0.5); t.x = L.W / 2;
    const c = new Container(); c.addChild(band, t); c.y = L.line.front; fx.addChild(c);
    audio.play(who === 0 ? 'conch' : 'drum');
    await gsap.fromTo(c, { alpha: 0 }, { alpha: 1, duration: 0.25 });
    await gsap.fromTo(t, { x: L.W / 2 - 40 }, { x: L.W / 2 + 10, duration: 0.8, ease: 'none' });
    await gsap.to(c, { alpha: 0, duration: 0.3 });
    destroyTree(c);
  }

  async function endTurn(): Promise<void> {
    pick = null; clearTargets(); hoverIdx = -1;
    busy = true; animating = true;
    applyAction(st, { type: 'end' });
    drainEvents(st);
    reconcile(snapshot(st));
    if (st.over) { busy = false; animating = false; checkOver(); return; }
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
    if (!alive) return;
    busy = false;
    reconcile(snapshot(st));
    if (!checkOver()) await turnBanner(0);
    animating = false;
    refreshInteractivity();
    settle();
  }

  /** after an animation: apply a layout change that arrived while it ran */
  function settle(): void {
    if (layoutPending && !animating) { layoutPending = false; relayout(); }
  }

  function checkOver(): boolean {
    if (!st.over) return false;
    busy = true;
    const won = st.winner === 0;
    setTimeout(() => { if (alive) endScreen(won, true); }, 900);
    return true;
  }

  function endScreen(won: boolean, animate: boolean): void {
    if (animate) {
      if (audio.has(won ? 'music_victory' : 'music_defeat')) audio.play(won ? 'conch' : 'drum');
      else audio.play(won ? 'victory' : 'defeat');
      audio.playMusic(won ? 'music_victory' : 'music_defeat');
    }
    const W = L.W, H = L.H, ph = L.phone;
    const c = new Container();
    const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.78 });
    dim.eventMode = 'static';
    const face = new Sprite(cardFace(won ? 'm_chandragupta' : 'n_gaja')); face.anchor.set(0.5); face.scale.set(ph ? 0.46 : 0.75); face.position.set(W / 2, ph ? H * 0.29 : 380);
    const title = new Text({ text: won ? 'VICTORY' : 'DEFEAT', style: { fontFamily: FONT_SERIF, fontSize: ph ? 104 : 120, fontWeight: '700', letterSpacing: 24, fill: won ? INK.goldPale : 0xffb09a, stroke: { color: 0x000000, width: 8 } } });
    title.anchor.set(0.5); title.position.set(W / 2, ph ? H * 0.6 : 690);
    if (ph) title.style.fontSize = 92;
    const sub = new Text({
      text: won ? `Pataliputra opens its gates in turn ${st.turn}. The Mauryan age begins.` : 'The Nanda elephants hold the field. Chanakya is already planning the next war.',
      style: { fontFamily: FONT_SERIF, fontSize: Math.round(30 * L.ui), fontStyle: 'italic', fill: INK.cream, align: 'center', wordWrap: true, wordWrapWidth: W - 200 }
    });
    sub.anchor.set(0.5); sub.position.set(W / 2, ph ? H * 0.72 : 780);
    const again = makeButton('Fight again', () => { overlay = null; destroyTree(c); busy = false; start(); }, { primary: true, w: 320 });
    const bx = ph ? 230 : 180;
    again.position.set(W / 2 - bx, ph ? H * 0.87 : 880);
    const leave = makeButton('Title screen', exit, { w: 320 });
    leave.position.set(W / 2 + bx, ph ? H * 0.87 : 880);
    c.addChild(dim, face, title, sub, again, leave);
    s.addChild(c);
    overlay = { kind: 'end', view: c, won };
    if (animate) {
      gsap.from(face.scale, { x: 0.3, y: 0.3, duration: 0.6, ease: 'back.out(1.4)' });
      gsap.from([title, sub, again, leave], { alpha: 0, y: '+=30', duration: 0.6, stagger: 0.12, delay: 0.3 });
    }
  }

  function confirmLeave(): void {
    if (overlay) return;
    const W = L.W, H = L.H;
    const c = new Container();
    const close = () => { overlay = null; destroyTree(c); };
    const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.7 }); dim.eventMode = 'static';
    const t = new Text({ text: 'Leave the battle?', style: { fontFamily: FONT_SERIF, fontSize: 56, fontWeight: '700', fill: INK.goldPale } });
    t.anchor.set(0.5); t.position.set(W / 2, H / 2 - 100);
    const bx = L.phone ? 210 : 160;
    const yes = makeButton('Leave', exit, { w: 280 }); yes.position.set(W / 2 - bx, H / 2 + 20);
    const no = makeButton('Keep fighting', close, { primary: true, w: 280 }); no.position.set(W / 2 + bx, H / 2 + 20);
    c.addChild(dim, t, yes, no); s.addChild(c);
    overlay = { kind: 'confirm', view: c };
  }

  /* ---------------- switching between desktop and phone layouts ---------------- */
  function relayout(): void {
    if (animating || drag) { layoutPending = true; return; }
    L = battleLayout(view);
    pick = null; hoverIdx = -1; previewId = null;
    previewLayer.removeChildren().forEach(c => c.destroy());
    const open = overlay;
    if (open) { destroyTree(open.view); overlay = null; }
    clearBoard();
    applyLayout();
    reconcile(shown, true);
    if (open?.kind === 'briefing') briefing(false);
    else if (open?.kind === 'end') endScreen(open.won ?? false, false);
    else if (!st.over) busy = false;
  }
  s.relayout = relayout;

  window.addEventListener('contextmenu', blockMenu);
  function blockMenu(e: Event): void { e.preventDefault(); }

  // read-only hook for automated playtests (tests/e2e); positions are in screen (CSS) pixels
  const scr = (x: number, y: number) => { const g = s.toGlobal(new Point(x, y)); return { x: g.x, y: g.y }; };
  (window as unknown as { __yuddh: unknown }).__yuddh = {
    state: () => st, busy: () => busy || dealing(), phone: () => L.phone,
    hand: () => hand.map(h => ({ id: h.cardId, ...scr(h.x, h.y) })),
    tokens: () => [...tokens.values()].map(v => ({ uid: v.uid, owner: v.owner, ...scr(v.x, v.y) })),
    durg: () => scr(durg[1].x, durg[1].y),
    endTurn: () => scr(endBtn.x, endBtn.y),
    /** every legal drag right now: from → to */
    moves: () => {
      if (busy || dealing() || st.active !== 0 || st.over) return [];
      const out: { what: string; from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
      const mid = L.laneX + L.laneW / 2;
      const gap = Math.min(L.handMaxGap, L.handSpan / Math.max(1, hand.length)), cw = 480 * L.handScale;
      hand.forEach((h, i) => {
        const t = cardTargets(i);
        // press the part of the card that is not covered by its right-hand neighbour
        const dx = i < hand.length - 1 && gap < cw ? -cw / 2 + gap / 2 : 0;
        const from = scr(h.x + dx, h.y - 30 * L.handScale / 0.31);
        if (t.zone === 'mine') out.push({ what: `deploy ${h.cardId}`, from, to: scr(mid, L.line.mine) });
        else if (t.zone === 'board') out.push({ what: `cast ${h.cardId}`, from, to: scr(mid, L.line.front) });
        t.units.forEach(uid => { const v = tokens.get(uid); if (v) out.push({ what: `cast ${h.cardId} on ${v.cardId}`, from, to: scr(v.x, v.y) }); });
      });
      tokens.forEach(v => {
        if (v.owner !== 0) return;
        const t = unitTargets(v.uid);
        const from = scr(v.x, v.y);
        if (t.hq) out.push({ what: `${v.cardId} strikes the Durg`, from, to: scr(durg[1].x, durg[1].y) });
        t.units.forEach(uid => { const e = tokens.get(uid); if (e) out.push({ what: `${v.cardId} attacks ${e.cardId}`, from, to: scr(e.x, e.y) }); });
        if (t.front) out.push({ what: `${v.cardId} advances`, from, to: scr(mid + L.laneW * 0.27, L.line.front) });
      });
      return out;
    }
  };

  s.enter = () => start();
  s.leave = () => {
    alive = false;
    fx.children.forEach(c => stopTweens(c as Container));
    window.removeEventListener('contextmenu', blockMenu);
    tokens.forEach(t => t.destroy());
    durg.forEach(d => d.destroy());
    endPulse?.kill();
  };
  return s;
}

/** the art a battle needs: both decks, the two Durgs, the battlefield */
export function battleArt(): string[] {
  return [...FIRST_THRONE.playerDeck, ...FIRST_THRONE.enemyDeck, 'durg_maurya_camp', 'durg_pataliputra'];
}

/** preload the battlefield and paintings so the board never appears without them */
export async function preloadBattle(): Promise<void> {
  await Promise.all([loadBattlefield(FIRST_THRONE.battlefield), loadArt(battleArt())]);
}

export type { Sfx };
