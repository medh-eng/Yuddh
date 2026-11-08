/* ============================================================
   YUDDH — the search AI (level 'search').
   Each turn it looks for the best sequence of actions on copies
   of the board:
     1. unseen cards (the enemy's hand, hidden Yantras, its own deck
        order) are re-dealt at random, so it never uses information
        a player would not have;
     2. a beam search grows sequences of plays, advances and attacks,
        keeping the most promising few at each step (positions that
        are the same board are counted once);
     3. the best finished sequences are then tested: the enemy takes
        its turn (the careful 'hard' heuristics, on several different
        re-deals of its hand) and the position it leaves is scored.
   It plays the first part of the best sequence for real and plans
   again whenever the game shows something it could not know (a card
   drawn, a hidden Yantra). All sizes are in rules.json ("ai").
   ============================================================ */
import { CARDS } from './cards';
import { RULES } from '../data';
import {
  actionObservers, allUnits, applyAction, applyActionCore, canAttack, canMove, canPlay, dharmaOf,
  DHARMA_MAX, other, rngFactory, shuffle
} from './rules';
import { aiTurn } from './ai';
import type { Action, GameState, PlayerIndex, Target, Unit } from './types';

/** a copy of the position the search can play on (no log, no pending events, its own generator).
    The generator depends only on the position and `salt`, so the same position always gives the same plan. */
export function cloneState(st: GameState, salt = 0): GameState {
  const { rng: _rng, log: _log, events: _events, ...rest } = st;
  const c = JSON.parse(JSON.stringify(rest)) as GameState;
  c.log = []; c.events = [];
  c.rng = rngFactory(((st.seed ^ Math.imul(st.turn, 7919) ^ Math.imul(st.nextUid, 104729) ^ Math.imul(salt + 1, 2654435761)) >>> 0) || 1);
  return c;
}

/** deal the cards `me` cannot see at random: the enemy's hand, its set Yantras, and my own deck order */
function redeal(st: GameState, me: PlayerIndex): void {
  const rng = st.rng;
  const op = st.players[other(me)];
  const pool = [...op.hand, ...op.deck].sort();   // sorted first: how the unseen cards really lie must not matter
  shuffle(pool, rng);
  const n = op.hand.length;
  op.hand = pool.slice(0, n);
  op.deck = pool.slice(n);
  const yantraIds = Array.from(new Set(pool.filter(id => CARDS[id]?.type === 'yantra')));
  op.yantras = op.yantras.map(y => ({ ...y, cardId: yantraIds.length ? yantraIds[Math.floor(rng() * yantraIds.length)] : 'y_pratikar' }));
  st.players[me].deck.sort();
  shuffle(st.players[me].deck, rng);
}

/* ---------------- how good is a position for `me`? ---------------- */
const unitScore = (u: Unit): number =>
  (u.atk * 1.35 + u.hp + (u.kw.includes('raksha') ? 1.5 : 0) + (u.kw.includes('veg') ? 1 : 0) + (u.rank ?? 0) * 1.2) * (u.routed ? 0.45 : 1);

export function evaluate(st: GameState, me: PlayerIndex): number {
  if (st.over) return st.winner === me ? 1e6 - st.turn : st.winner === null ? 0 : -1e6 + st.turn;
  const op = other(me);
  const P = st.players[me], O = st.players[op];
  let v = (P.hq.hp - O.hq.hp) * 1.5;
  // a Durg near death is worth far more than its health: protect ours, finish theirs
  v -= Math.max(0, 9 - P.hq.hp) * 1.6;
  v += Math.max(0, 9 - O.hq.hp) * 1.6;
  allUnits(st, me).forEach(x => { v += unitScore(x.unit); });
  allUnits(st, op).forEach(x => { v -= unitScore(x.unit); });
  v += (P.hand.length - O.hand.length) * 0.9;
  v += (P.yantras.length - O.yantras.length) * 0.8;
  if (st.front.units.length) {
    const side = st.front.owner === me ? 1 : -1;
    v += side * (2 + st.front.units.length * 0.5);
  }
  if (st.rules === 'yuddh') {
    v += (dharmaOf(P) - dharmaOf(O)) * 0.5;
    if (dharmaOf(P) >= DHARMA_MAX) v += 2;
    if (dharmaOf(O) >= DHARMA_MAX) v -= 2;
  }
  // an empty deck bleeds the Durg every draw
  if (P.deck.length === 0) v -= (P.fatigue + 1) * 2;
  if (O.deck.length === 0) v += (O.fatigue + 1) * 2;
  return v;
}

/* ---------------- legal actions and positions ---------------- */
function legalActions(st: GameState, p: PlayerIndex): Action[] {
  const out: Action[] = [];
  const pl = st.players[p], enemy = other(p);
  const seen = new Set<string>();
  pl.hand.forEach((cardId, i) => {
    const c = CARDS[cardId];
    if (c.target === 'enemyUnit') {
      allUnits(st, enemy).forEach(x => {
        const key = `${cardId}:${x.unit.uid}`;
        if (seen.has(key)) return;
        const t: Target = { kind: 'unit', owner: enemy, uid: x.unit.uid };
        if (canPlay(st, p, i, t).ok) { seen.add(key); out.push({ type: 'play', handIndex: i, target: t }); }
      });
    } else if (!seen.has(cardId) && canPlay(st, p, i).ok) {
      seen.add(cardId); out.push({ type: 'play', handIndex: i });
    }
  });
  pl.support.forEach(u => { if (canMove(st, p, u.uid).ok) out.push({ type: 'move', uid: u.uid }); });
  allUnits(st, p).forEach(x => {
    const hq: Target = { kind: 'hq', owner: enemy };
    if (canAttack(st, p, x.unit.uid, hq).ok) out.push({ type: 'attack', uid: x.unit.uid, target: hq });
    allUnits(st, enemy).forEach(t => {
      const tg: Target = { kind: 'unit', owner: enemy, uid: t.unit.uid };
      if (canAttack(st, p, x.unit.uid, tg).ok) out.push({ type: 'attack', uid: x.unit.uid, target: tg });
    });
  });
  return out;
}

const sig = (u: Unit) => `${u.cardId}.${u.atk}.${u.hp}.${u.rank ?? 0}.${u.routed ?? 0}${u.canAct ? 'a' : ''}${u.moved ? 'm' : ''}${u.attacked ? 'x' : ''}`;
/** the same board reached by a different order of moves counts once */
function hashOf(st: GameState): string {
  const side = (i: 0 | 1) => {
    const p = st.players[i];
    return `${p.hq.hp}|${p.kosha}|${p.dharma ?? 0}|${p.hand.slice().sort().join(',')}|${p.yantras.length}|${p.support.map(sig).sort().join(',')}`;
  };
  return `${side(0)}#${side(1)}#${st.front.owner}:${st.front.units.map(sig).sort().join(',')}`;
}

/* ---------------- the search ---------------- */
interface Node { st: GameState; actions: Action[]; q: number }

function replyValue(c: GameState, me: PlayerIndex): number {
  const op = other(me);
  redeal(c, me);
  if (!c.over && c.active === me) applyActionCore(c, { type: 'end' });
  if (!c.over && c.active === op) aiTurn(c, op, 'hard');
  return evaluate(c, me);
}

/** the best list of actions for this turn, not including the final 'end' */
export function planTurn(real: GameState, me: PlayerIndex): Action[] {
  const cfg = RULES.ai;
  const saved = [...actionObservers];
  actionObservers.clear();
  try {
    const root = cloneState(real, real.log.length);
    redeal(root, me);
    const rootNode: Node = { st: root, actions: [], q: evaluate(root, me) };
    const all: Node[] = [rootNode];
    const seen = new Set<string>([hashOf(root)]);
    let frontier: Node[] = [rootNode];
    for (let depth = 0; depth < cfg.maxDepth && frontier.length; depth++) {
      const next: Node[] = [];
      for (const node of frontier) {
        for (const a of legalActions(node.st, me)) {
          const c = cloneState(node.st);
          if (!applyActionCore(c, a).ok) continue;
          const actions = [...node.actions, a];
          if (c.over && c.winner === me) return actions;      // a win: take it
          const h = hashOf(c);
          if (seen.has(h)) continue;
          seen.add(h);
          next.push({ st: c, actions, q: evaluate(c, me) });
        }
      }
      next.sort((a, b) => b.q - a.q);
      frontier = next.slice(0, cfg.beam);
      all.push(...frontier);
    }
    // test the most promising finished turns against the enemy's reply
    all.sort((a, b) => b.q - a.q);
    const finalists = all.slice(0, cfg.finalists);
    if (!finalists.includes(rootNode)) finalists.push(rootNode);   // "do nothing" is always an option
    let best = rootNode, bestV = -Infinity;
    for (const f of finalists) {
      let sum = 0;
      for (let r = 0; r < cfg.replies; r++) sum += replyValue(cloneState(f.st, r + 1), me);
      const v = sum / cfg.replies + f.q * 0.05;
      if (v > bestV) { bestV = v; best = f; }
    }
    return best.actions;
  } finally {
    saved.forEach(fn => actionObservers.add(fn));
  }
}

/** play a whole turn for `me`, planning again whenever the real game surprises the plan */
export function searchTurn(st: GameState, me: PlayerIndex): void {
  let guard = 0;
  while (!st.over && st.active === me && guard++ < 40) {
    const plan = planTurn(st, me);
    if (!plan.length) break;
    const p = st.players[me];
    for (const a of plan) {
      const deckBefore = p.deck.length, fatigueBefore = p.fatigue;
      if (!applyAction(st, a).ok) break;                    // the real game differed: plan again
      if (st.over) return;
      if (p.deck.length !== deckBefore || p.fatigue !== fatigueBefore) break; // we drew cards: plan again
    }
  }
  if (!st.over && st.active === me) applyAction(st, { type: 'end' });
}
