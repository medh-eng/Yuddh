/* ============================================================
   YUDDH — rules: board state, legality, actions, events.
   Ported line-for-line from the prototype engine; the golden
   trace test proves the two produce identical games.
   ============================================================ */
import { CARDS, CARD_LIST, EMPIRES } from './cards';
import type {
  Action, CardDef, Check, EmpireId, GameEvent, GameState, Line, NewGameOptions,
  Player, PlayerIndex, SideConfig, Target, Unit, YantraTrigger
} from './types';

/* ---------------- helpers ---------------- */
export function rngFactory(seed: number): () => number {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildDeck(empire: EmpireId, ally: EmpireId): string[] {
  const deck: string[] = [];
  CARD_LIST.filter(c => c.empire === empire).forEach(c => { deck.push(c.id); deck.push(c.id); });
  CARD_LIST.filter(c => c.empire === ally).forEach(c => deck.push(c.id));
  CARD_LIST.filter(c => c.empire === 'neutral').forEach(c => deck.push(c.id));
  return deck;
}

export const other = (p: PlayerIndex): PlayerIndex => (1 - p) as PlayerIndex;

function log(st: GameState, msg: string, side?: number): void {
  st.log.push({ turn: st.turn, msg, side: side === undefined ? st.active : side });
  if (st.log.length > 240) st.log.shift();
}

export function pushEvent(st: GameState, e: GameEvent): void {
  if (!st.events) st.events = [];
  st.events.push(e);
}

export function drainEvents(st: GameState): GameEvent[] {
  const e = st.events || [];
  st.events = [];
  return e;
}

function makeUnit(st: GameState, cardId: string, owner: PlayerIndex): Unit {
  const c = CARDS[cardId];
  const u: Unit = {
    uid: st.nextUid++, cardId, name: c.name, sub: c.sub, glyph: c.glyph, empire: c.empire,
    atk: c.atk ?? 0, hp: c.hp ?? 0, maxHp: c.hp ?? 0, op: c.op ?? 0, range: c.range ?? 'melee',
    kw: (c.kw || []).slice(), owner,
    canAct: false, moved: false, attacked: false, smokeBroken: false
  };
  const lvl = (st.players[owner].upgrades && st.players[owner].upgrades[cardId]) || 0;
  if (lvl) { u.atk += lvl; u.hp += lvl; u.maxHp += lvl; u.upgraded = lvl; }
  const emp = st.players[owner].empire;
  if (emp === 'rajput' && u.kw.includes('veg')) u.atk += 1;
  if (emp === 'chola' && u.range === 'ranged') u.atk += 1;
  if (emp === 'chalukya' && u.kw.includes('raksha')) u.atk += 1;
  return u;
}

function makePlayer(st: GameState, side: 'p0' | 'p1', cfg: SideConfig): Player {
  const empire = cfg.empire, ally = cfg.ally || 'neutral';
  const emp = EMPIRES[empire];
  const baseHq = cfg.hq || (empire === 'chalukya' ? 28 : 24);
  const deckList = cfg.deck && cfg.deck.length ? cfg.deck.slice() : buildDeck(empire, ally);
  return {
    side, empire, ally,
    faction: cfg.faction || emp.name,
    hq: { name: cfg.capital || emp.capital, hp: baseHq, maxHp: baseHq },
    kosha: 1, maxKosha: cfg.startKosha || 1,
    deck: shuffle(deckList, st.rng),
    hand: [], discard: [],
    support: [], yantras: [], fatigue: 0,
    upgrades: cfg.upgrades || {},
    drawBonus: cfg.drawBonus || 0,
    counters: { ordersPlayed: 0, unitsThisTurn: 0 }
  };
}

function draw(st: GameState, pIdx: PlayerIndex, n?: number): void {
  const p = st.players[pIdx];
  for (let i = 0; i < (n || 1); i++) {
    if (p.deck.length === 0) {
      p.fatigue += 1;
      p.hq.hp -= p.fatigue;
      log(st, `Deck exhausted — ${EMPIRES[p.empire].name} takes ${p.fatigue} attrition damage.`, pIdx);
      checkDeath(st);
      continue;
    }
    if (p.hand.length >= 10) { p.discard.push(p.deck.pop()!); continue; }
    p.hand.push(p.deck.pop()!);
  }
}

function checkDeath(st: GameState): void {
  if (st.over) return;
  const a = st.players[0].hq.hp <= 0;
  const b = st.players[1].hq.hp <= 0;
  if (!a && !b) return;
  st.over = true;
  if (a && b) st.winner = null;
  else st.winner = a ? 1 : 0;
  st.winReason = a && b ? 'both' : 'destroy';
  log(st, st.winner === null ? 'Both capitals burn. A draw.' : `${EMPIRES[st.players[st.winner].empire].name} wins the war.`, st.winner === null ? 0 : st.winner);
}

export function findUnit(st: GameState, owner: PlayerIndex, uid: number): { unit: Unit; line: Line } | null {
  const p = st.players[owner];
  let u = p.support.find(x => x.uid === uid);
  if (u) return { unit: u, line: 'support' };
  if (st.front.owner === owner) {
    u = st.front.units.find(x => x.uid === uid);
    if (u) return { unit: u, line: 'front' };
  }
  return null;
}

export function allUnits(st: GameState, owner: PlayerIndex): { unit: Unit; line: Line }[] {
  const out = st.players[owner].support.map(u => ({ unit: u, line: 'support' as Line }));
  if (st.front.owner === owner) st.front.units.forEach(u => out.push({ unit: u, line: 'front' }));
  return out;
}

function destroyUnit(st: GameState, owner: PlayerIndex, uid: number): void {
  const p = st.players[owner];
  let idx = p.support.findIndex(x => x.uid === uid);
  if (idx >= 0) {
    const [u] = p.support.splice(idx, 1);
    p.discard.push(u.cardId);
    log(st, `${u.name} is destroyed.`, owner);
  } else if (st.front.owner === owner) {
    idx = st.front.units.findIndex(x => x.uid === uid);
    if (idx >= 0) {
      const [u] = st.front.units.splice(idx, 1);
      p.discard.push(u.cardId);
      log(st, `${u.name} falls on the Yudhbhumi.`, owner);
      if (st.front.units.length === 0) st.front.owner = null;
    }
  }
}

function damageUnit(st: GameState, owner: PlayerIndex, uid: number, amount: number): void {
  const f = findUnit(st, owner, uid);
  if (!f) return;
  f.unit.hp -= amount;
  if (f.unit.hp <= 0) destroyUnit(st, owner, uid);
}

function damageAll(st: GameState, owner: PlayerIndex, amount: number): void {
  allUnits(st, owner).slice().forEach(x => damageUnit(st, owner, x.unit.uid, amount));
}

function damageHQ(st: GameState, owner: PlayerIndex, amount: number): void {
  const p = st.players[owner];
  p.hq.hp -= amount;
  log(st, `${EMPIRES[p.empire].name}'s Durg takes ${amount} damage.`, owner);
  checkDeath(st);
}

export function koshaCost(st: GameState, owner: PlayerIndex, card: CardDef): number {
  let c = card.cost;
  const pl = st.players[owner];
  const lvl = (pl.upgrades && pl.upgrades[card.id]) || 0;
  if (card.type !== 'unit' && lvl) c = Math.max(1, c - lvl);
  if (card.type === 'unit' && card.cost >= 3 && pl.empire === 'maurya' && (pl.counters.unitsThisTurn || 0) === 0) c = c - 1;
  return c;
}

/* ---------------- game creation ---------------- */
export function newGame(opts: NewGameOptions): GameState {
  const st = {
    seed: opts.seed === undefined ? 1 : opts.seed,
    turn: 1, active: 0, over: false, winner: null, winReason: null,
    log: [], nextUid: 1, events: [],
    front: { owner: null, units: [] },
    players: [] as unknown as [Player, Player],
    aiLevel: opts.aiLevel || 'normal',
    objective: opts.objective || { type: 'destroy' },
    scenarioId: opts.scenarioId || null,
    scenarioName: opts.scenarioName || null,
    rules: opts.rules || 'classic',
    season: opts.rules === 'yuddh' ? opts.season || 'sharad' : undefined,
    rng: () => 0
  } as GameState;
  st.rng = rngFactory(st.seed);
  (st.players as Player[]).push(makePlayer(st, 'p0', opts.player));
  (st.players as Player[]).push(makePlayer(st, 'p1', opts.enemy));

  const preset = opts.preset || {};
  (preset.enemyFront || []).forEach(cardId => {
    const u = makeUnit(st, cardId, 1);
    u.canAct = true;
    st.front.units.push(u);
  });
  if (st.front.units.length) st.front.owner = 1;
  (preset.playerFront || []).forEach(cardId => {
    if (st.front.owner !== null) return;
    const u = makeUnit(st, cardId, 0);
    u.canAct = true;
    st.front.units.push(u);
    st.front.owner = 0;
  });
  (preset.enemySupport || []).forEach(cardId => { const u = makeUnit(st, cardId, 1); u.canAct = true; st.players[1].support.push(u); });
  (preset.playerSupport || []).forEach(cardId => { const u = makeUnit(st, cardId, 0); u.canAct = true; st.players[0].support.push(u); });

  draw(st, 0, opts.player.handSize || 4);
  draw(st, 1, opts.enemy.handSize || 4);
  if (opts.player.openingHand && opts.player.openingHand.length) {
    const p0 = st.players[0];
    const wanted = opts.player.openingHand.slice();
    // put the randomly drawn cards back, then take the scripted ones out
    p0.deck.push(...p0.hand);
    shuffle(p0.deck, st.rng);
    wanted.forEach(cid => {
      const i = p0.deck.indexOf(cid);
      if (i >= 0) p0.deck.splice(i, 1);
    });
    p0.hand = wanted;
  }
  startTurn(st, 0, true);
  log(st, 'The war begins.', 0);
  return st;
}

function startTurn(st: GameState, idx: PlayerIndex, first?: boolean): void {
  if (st.over) return;
  const p = st.players[idx];
  st.active = idx;
  p.maxKosha = Math.min(12, p.maxKosha + 1);
  p.kosha = p.maxKosha;
  // Hemanta: the harvest is in, and every treasury holds one more
  if (st.rules === 'yuddh' && st.season === 'hemanta') p.kosha += 1;
  // army surgeons tend the most wounded
  if (st.rules === 'yuddh') {
    allUnits(st, idx).filter(x => x.unit.cardId === 'm_shalya_vaidya').forEach(sv => {
      const hurt = allUnits(st, idx).map(x => x.unit).filter(u => u.hp < u.maxHp).sort((a, b) => (b.maxHp - b.hp) - (a.maxHp - a.hp))[0];
      if (!hurt) return;
      const amount = Math.min(2, hurt.maxHp - hurt.hp);
      hurt.hp += amount;
      log(st, `${sv.unit.name} tends ${hurt.name} (+${amount}).`, idx);
      pushEvent(st, { t: 'heal', owner: idx, uid: hurt.uid, amount, by: sv.unit.uid });
    });
  }
  p.counters.unitsThisTurn = 0;
  p.counters.mantraThisTurn = false;
  allUnits(st, idx).forEach(x => {
    x.unit.canAct = true;
    x.unit.moved = false;
    x.unit.attacked = false;
  });
  if (!first) draw(st, idx, 1 + (p.drawBonus || 0));
  log(st, `${EMPIRES[p.empire].name} — turn begins.`, idx);

  // clock objectives, checked when a new round begins
  const o = st.objective;
  if (idx === 0 && o.turns && st.turn > o.turns) {
    if (o.type === 'survive') {
      st.over = true; st.winner = 0; st.winReason = 'survive';
      log(st, 'The enemy host disperses. The line held.', 0);
    } else if (o.type === 'deadline') {
      st.over = true; st.winner = 1; st.winReason = 'deadline';
      log(st, 'Reinforcements arrive. The moment has passed.', 1);
    }
  }
}

/* ---------- Yantra resolution ---------- */
function fireYantra(st: GameState, owner: PlayerIndex, trigger: YantraTrigger): { card: CardDef; power: number } | null {
  const p = st.players[owner];
  if (!p || !p.yantras || !p.yantras.length) return null;
  const idx = p.yantras.findIndex(y => {
    const c = CARDS[y.cardId];
    return c && c.trigger === trigger;
  });
  if (idx < 0) return null;
  const [y] = p.yantras.splice(idx, 1);
  const c = CARDS[y.cardId];
  p.discard.push(y.cardId);
  log(st, `${EMPIRES[p.empire].name} springs a ${c.name}.`, owner);
  pushEvent(st, { t: 'yantra', owner, cardId: y.cardId });
  return { card: c, power: c.power || 0 };
}

/* ---------------- legality ---------------- */
const hasGuard = (list: Unit[]) => list.some(u => u.kw.includes('raksha'));

/** promotion: ranks a unit can earn by destroying enemies (Yuddh rules) */
export const MAX_RANK = 2;

/** the four seasons a Yuddh battle can be fought in, and what each changes */
/** the damage a unit deals when it strikes (Grishma haze blunts archers) */
export function strikeDamage(st: GameState, a: Unit): number {
  if (st.rules !== 'yuddh') return a.atk;
  let d = a.atk;
  // a standard-bearer's morale: +1 for his comrades on the Yudhbhumi
  if (a.cardId !== 'm_raja_dhwaja' && st.front.units.includes(a)
    && allUnits(st, a.owner).some(x => x.unit.cardId === 'm_raja_dhwaja')) d += 1;
  if (st.season === 'grishma' && a.range === 'ranged') d = Math.max(Math.min(1, d), d - 1);
  return d;
}

export const SEASONS: Record<import('./types').Season, { name: string; english: string; rule: string }> = {
  sharad: { name: 'Sharad', english: 'Autumn', rule: 'The campaigning season: clear skies, firm ground. No special rule.' },
  varsha: { name: 'Varsha', english: 'Monsoon', rule: 'Mud: cavalry and chariots cannot charge. Every unit advances or attacks, not both.' },
  grishma: { name: 'Grishma', english: 'Summer', rule: 'Heat haze: ranged units deal 1 less damage (never less than 1).' },
  hemanta: { name: 'Hemanta', english: 'Harvest', rule: 'Full granaries: every turn, both treasuries hold 1 extra Kosha.' }
};
export const RANK_NAMES = ['', 'Veer', 'Mahaveer'];

/** unit classes fast enough to advance and strike in the same turn (Yuddh rules) */
const CHARGE_CLASSES = new Set(['Cavalry', 'Chariot', 'Elite Chariot', 'Legendary Warrior']);
export const canCharge = (u: { cardId: string }): boolean => CHARGE_CLASSES.has(CARDS[u.cardId]?.sub ?? '');
export const isElephant = (u: { cardId: string }): boolean => /Elephant/.test(CARDS[u.cardId]?.sub ?? '');

export function canAttack(st: GameState, pIdx: PlayerIndex, attackerUid: number, target: Target): Check {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const found = findUnit(st, pIdx, attackerUid);
  if (!found) return { ok: false, reason: 'No such unit' };
  const a = found.unit;
  if (!a.canAct || a.attacked) return { ok: false, reason: 'Already acted' };
  const yuddh = st.rules === 'yuddh';
  if (yuddh && a.moved && !canCharge(a) && a.surge !== st.turn) return { ok: false, reason: 'It advanced this turn; only cavalry and chariots can charge straight in' };
  if (yuddh && a.moved && st.season === 'varsha') return { ok: false, reason: 'Monsoon mud: no unit can advance and charge in the same turn' };
  if (p.kosha < a.op) return { ok: false, reason: 'Not enough Kosha' };
  const fromSupport = found.line === 'support';

  if (target.kind === 'hq') {
    if (target.owner === pIdx) return { ok: false, reason: 'Own capital' };
    if (fromSupport) return { ok: false, reason: 'Only from the Yudhbhumi' };
    if (st.front.owner !== pIdx) return { ok: false, reason: 'You do not hold the Yudhbhumi' };
    // classic rules: Raksha guards protect units only. Yuddh rules: a Raksha on the defender's
    // Rajya line stands before the Durg and must fall first.
    if (yuddh && hasGuard(st.players[target.owner].support)) return { ok: false, reason: 'A Raksha unit guards the Durg; strike it first' };
    return { ok: true };
  }

  if (target.owner === pIdx) return { ok: false, reason: 'Friendly unit' };
  const f = findUnit(st, target.owner, target.uid);
  if (!f) return { ok: false, reason: 'No such target' };
  if (f.unit.kw.includes('dhuan') && !f.unit.smokeBroken) return { ok: false, reason: 'Hidden by Dhuan' };
  if (fromSupport && f.line !== 'front') return { ok: false, reason: 'From your Rajya line you can only strike the Yudhbhumi' };

  const sameLine = f.line === 'front' ? st.front.units : st.players[target.owner].support;
  if (hasGuard(sameLine) && !f.unit.kw.includes('raksha')) return { ok: false, reason: 'A Raksha unit shields this one' };
  return { ok: true };
}

export function canMove(st: GameState, pIdx: PlayerIndex, uid: number): Check {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const found = findUnit(st, pIdx, uid);
  if (!found || found.line !== 'support') return { ok: false, reason: 'Only from the Rajya line' };
  const u = found.unit;
  if (!u.canAct || u.moved) return { ok: false, reason: 'Already acted' };
  if (st.rules === 'yuddh' && u.attacked) return { ok: false, reason: 'It has already attacked this turn' };
  if (p.kosha < u.op) return { ok: false, reason: 'Not enough Kosha' };
  if (st.front.owner !== null && st.front.owner !== pIdx) return { ok: false, reason: 'The enemy holds the Yudhbhumi' };
  if (st.front.units.length >= 4) return { ok: false, reason: 'The Yudhbhumi is full' };
  return { ok: true };
}

export function canPlay(st: GameState, pIdx: PlayerIndex, handIdx: number, target?: Target | null): Check {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const cardId = p.hand[handIdx];
  if (!cardId) return { ok: false, reason: 'No such card' };
  const c = CARDS[cardId];
  if (p.kosha < koshaCost(st, pIdx, c)) return { ok: false, reason: 'Not enough Kosha' };
  if (c.type === 'unit' && p.support.length >= 4) return { ok: false, reason: 'Rajya line is full' };
  if (c.type === 'yantra' && p.yantras.length >= 2) return { ok: false, reason: 'You have two Yantras set' };
  if (c.target === 'enemyUnit') {
    if (!target || target.kind !== 'unit') return { ok: false, reason: 'Choose an enemy unit' };
    const f = findUnit(st, target.owner, target.uid);
    if (!f || target.owner === pIdx) return { ok: false, reason: 'Choose an enemy unit' };
    if (f.unit.kw.includes('dhuan') && !f.unit.smokeBroken) return { ok: false, reason: 'Hidden by Dhuan' };
  }
  return { ok: true };
}

/* ---------------- effects ---------------- */
function applyDeploy(st: GameState, pIdx: PlayerIndex, unit: Unit, line: Line): void {
  const c = CARDS[unit.cardId];
  const p = st.players[pIdx];
  switch (c.deploy) {
    case 'draw1': draw(st, pIdx, 1); break;
    case 'drawKosha': draw(st, pIdx, 1); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'kosha1': p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'buffLine': {
      const list = line === 'front' ? st.front.units : p.support;
      list.forEach(u => { if (u.uid !== unit.uid) u.atk += 1; });
      break;
    }
    case 'buffAll': allUnits(st, pIdx).forEach(x => { x.unit.atk += 1; }); break;
    case 'kosha2': p.kosha = Math.min(p.maxKosha + 2, p.kosha + 2); break;
    case 'setYantra':
      p.yantras.push({ cardId: 'y_pratikar', uid: st.nextUid++ });
      log(st, `${unit.name} sets a hidden Pratikar Yantra.`, pIdx);
      pushEvent(st, { t: 'yantraSet', owner: pIdx });
      break;
    case 'hillVolley':
      if (st.front.owner === other(pIdx)) [...st.front.units].forEach(u => damageUnit(st, other(pIdx), u.uid, 1));
      break;
    case 'elephantBuff':
      allUnits(st, pIdx).forEach(x => { if (isElephant(x.unit)) { x.unit.atk += 1; x.unit.hp += 1; x.unit.maxHp += 1; } });
      break;
  }
}

function applyOrder(st: GameState, pIdx: PlayerIndex, cardId: string, target?: Target | null): void {
  const p = st.players[pIdx];
  const t = target as Extract<Target, { kind: 'unit' }>;
  switch (cardId) {
    case 'n_aakraman': damageUnit(st, t.owner, t.uid, 2); break;
    case 'n_sena_bhojan': p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 4); break;
    case 'n_yudh_niti': draw(st, pIdx, 2); break;
    case 'n_visha_baan': damageAll(st, other(pIdx), 1); break;
    case 'm_arthashastra': draw(st, pIdx, 1); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 2); break;
    case 'g_swarn_yug': draw(st, pIdx, 2); p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 3); break;
    case 'c_shilpa': p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 5); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'ch_vyapari': p.kosha = Math.min(p.maxKosha + 1, p.kosha + 2); break;
    case 'r_kshatra': if (st.front.owner === pIdx) st.front.units.forEach(u => { u.atk += 2; }); break;
    case 's_agni': damageUnit(st, t.owner, t.uid, 5); break;
    case 's_chakravyuha': damageAll(st, other(pIdx), 2); break;
    case 'nd_nanda_kosha': p.kosha = Math.min(p.maxKosha + 2, p.kosha + 3); break;
    case 'm_garuda_vyuha': allUnits(st, pIdx).forEach(x => { x.unit.atk += 1; x.unit.surge = st.turn; }); break;
    case 'm_makara_vyuha':
      if (st.front.owner === pIdx && st.front.units.length) st.front.units.forEach(u => { u.hp += 2; u.maxHp += 2; });
      else p.support.forEach(u => { u.hp += 1; u.maxHp += 1; });
      break;
    case 's_ashwamedha':
      allUnits(st, pIdx).forEach(x => { x.unit.atk += 2; x.unit.hp += 2; x.unit.maxHp += 2; });
      break;
  }
  p.counters.ordersPlayed += 1;
  if (p.empire === 'gupta' && CARDS[cardId].kind !== 'shakti' && !p.counters.mantraThisTurn) {
    p.counters.mantraThisTurn = true;
    draw(st, pIdx, 1);
  }
  checkDeath(st);
}

/* ---------------- actions ---------------- */
/** Observers called after every successful action — the renderer uses
    this to replay the computer's turn one step at a time. */
export const actionObservers = new Set<(st: GameState, action: Action) => void>();

export function applyAction(st: GameState, action: Action): Check {
  const res = applyActionCore(st, action);
  if (res.ok && actionObservers.size) actionObservers.forEach(fn => fn(st, action));
  return res;
}

function applyActionCore(st: GameState, action: Action): Check {
  if (st.over) return { ok: false, reason: 'Game over' };
  const pIdx = st.active;
  const p = st.players[pIdx];

  if (action.type === 'play') {
    const chk = canPlay(st, pIdx, action.handIndex, action.target);
    if (!chk.ok) return chk;
    const cardId = p.hand[action.handIndex];
    const c = CARDS[cardId];
    p.kosha -= koshaCost(st, pIdx, c);
    p.hand.splice(action.handIndex, 1);

    if (c.type === 'unit') {
      const u = makeUnit(st, cardId, pIdx);
      p.support.push(u);
      u.canAct = u.kw.includes('veg');
      p.counters.unitsThisTurn = (p.counters.unitsThisTurn || 0) + 1;
      log(st, `${EMPIRES[p.empire].name} deploys ${u.name}.`, pIdx);
      pushEvent(st, { t: 'deploy', owner: pIdx, uid: u.uid, cardId });
      applyDeploy(st, pIdx, u, 'support');
      // an enemy Vighna Yantra may unmake the deployment
      const trap = fireYantra(st, other(pIdx), 'onEnemyDeploy');
      if (trap) destroyUnit(st, pIdx, u.uid);
    } else if (c.type === 'yantra') {
      p.yantras.push({ cardId, uid: st.nextUid++ });
      log(st, `${EMPIRES[p.empire].name} sets a Yantra, face down.`, pIdx);
      pushEvent(st, { t: 'yantraSet', owner: pIdx });
    } else {
      log(st, `${EMPIRES[p.empire].name} casts ${c.name}.`, pIdx);
      pushEvent(st, { t: 'order', owner: pIdx, cardId });
      p.discard.push(cardId);
      applyOrder(st, pIdx, cardId, action.target);
    }
    checkDeath(st);
    return { ok: true };
  }

  if (action.type === 'move') {
    const chk = canMove(st, pIdx, action.uid);
    if (!chk.ok) return chk;
    const u = findUnit(st, pIdx, action.uid)!.unit;
    p.kosha -= u.op;
    p.support.splice(p.support.findIndex(x => x.uid === u.uid), 1);
    if (st.front.owner === null) st.front.owner = pIdx;
    st.front.units.push(u);
    u.moved = true;
    log(st, `${u.name} advances to the Yudhbhumi.`, pIdx);
    pushEvent(st, { t: 'move', owner: pIdx, uid: u.uid });
    return { ok: true };
  }

  if (action.type === 'attack') {
    const chk = canAttack(st, pIdx, action.uid, action.target);
    if (!chk.ok) return chk;
    const a = findUnit(st, pIdx, action.uid)!.unit;
    p.kosha -= a.op;
    a.attacked = true;
    if (a.kw.includes('dhuan')) a.smokeBroken = true;

    if (action.target.kind === 'hq') {
      let dmg = strikeDamage(st, a);
      const ward = fireYantra(st, action.target.owner, 'onHQAttack');
      if (ward) dmg = Math.max(0, dmg - ward.power);
      // the timber walls also shoot back
      if (ward && ward.card.id === 'nd_kashtha_prakara') damageUnit(st, pIdx, a.uid, 2);
      log(st, dmg > 0
        ? `${a.name} strikes the enemy Durg for ${dmg}.`
        : `${a.name}'s blow is turned aside by the ward.`, pIdx);
      pushEvent(st, { t: 'hq', owner: action.target.owner, dmg, attacker: pIdx, uid: a.uid });
      if (dmg > 0) damageHQ(st, action.target.owner, dmg);
      return { ok: true };
    }
    const tgt = action.target;
    const d = findUnit(st, tgt.owner, tgt.uid)!.unit;
    log(st, `${a.name} attacks ${d.name}.`, pIdx);
    const hit = strikeDamage(st, a);
    pushEvent(st, { t: 'attack', owner: pIdx, uid: a.uid, target: { owner: tgt.owner, uid: d.uid }, dmg: hit });
    d.hp -= hit;
    const dmgBack = (a.range === 'melee' && d.range === 'melee') ? d.atk : 0;
    if (dmgBack > 0) a.hp -= dmgBack;
    if (d.hp <= 0) { pushEvent(st, { t: 'death', owner: tgt.owner, uid: d.uid }); destroyUnit(st, tgt.owner, d.uid); }
    // Yuddh rules: a war elephant that crushes a unit tramples on; the blow it did not need falls on the enemy Durg
    if (st.rules === 'yuddh' && d.hp < 0 && a.range === 'melee' && isElephant(a)) {
      const over = -d.hp;
      log(st, `${a.name} tramples on and strikes the Durg for ${over}.`, pIdx);
      pushEvent(st, { t: 'trample', owner: tgt.owner, uid: a.uid, dmg: over });
      damageHQ(st, tgt.owner, over);
    }
    if (a.hp <= 0) { pushEvent(st, { t: 'death', owner: pIdx, uid: a.uid }); destroyUnit(st, pIdx, a.uid); }
    // Yuddh rules: a unit that destroys an enemy and lives is promoted: Veer +1 health, Mahaveer +1 attack more
    else if (st.rules === 'yuddh' && d.hp <= 0 && (a.rank ?? 0) < MAX_RANK) {
      a.rank = (a.rank ?? 0) + 1; a.hp += 1; a.maxHp += 1; if (a.rank === 2) a.atk += 1;
      log(st, `${a.name} is honoured for valour (${RANK_NAMES[a.rank]}).`, pIdx);
      pushEvent(st, { t: 'promote', owner: pIdx, uid: a.uid, rank: a.rank });
    }
    // a Pratikar Yantra punishes the attacker
    const reprisal = fireYantra(st, tgt.owner, 'onUnitAttack');
    if (reprisal) damageUnit(st, pIdx, a.uid, reprisal.power);
    checkDeath(st);
    return { ok: true };
  }

  if (action.type === 'end') {
    log(st, `${EMPIRES[p.empire].name} ends the turn.`, pIdx);
    const next = other(pIdx);
    if (next === 0) st.turn += 1;
    startTurn(st, next);
    return { ok: true };
  }
  return { ok: false, reason: 'Unknown action' };
}

export function objectiveStatus(st: GameState):
  { type: 'destroy' } | { type: 'survive' | 'deadline'; remaining: number; total: number } {
  const o = st.objective || { type: 'destroy' };
  if (o.type === 'survive' || o.type === 'deadline') {
    return { type: o.type, remaining: Math.max(0, o.turns - st.turn + 1), total: o.turns };
  }
  return { type: 'destroy' };
}
