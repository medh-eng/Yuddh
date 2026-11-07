/* ============================================================
   YUDDH — computer opponent (prototype heuristics, ported as-is).
   Every decision goes through the public rules API, so the AI can
   never cheat. Phase 2 replaces this with a search-based AI; until
   then it must play exactly like the prototype (golden test).
   ============================================================ */
import { CARDS } from './cards';
import {
  allUnits, applyAction, canAttack, canMove, canPlay, findUnit, koshaCost, other
} from './rules';
import type { AiLevel, CardDef, GameState, PlayerIndex, Target, Unit } from './types';

interface PlayOption { i: number; c: CardDef; target: Target | null; kind: 'unit' | 'removal' | 'order'; victim?: Unit }

const unitValue = (u: Unit) =>
  u.atk * 1.35 + u.hp + (u.kw.includes('raksha') ? 1.5 : 0) + (u.kw.includes('veg') ? 1 : 0);

/** total damage we could put into the enemy Durg this turn */
export function faceDamageAvailable(st: GameState, pIdx: PlayerIndex): number {
  const enemy = other(pIdx);
  const cands = allUnits(st, pIdx)
    .filter(x => canAttack(st, pIdx, x.unit.uid, { kind: 'hq', owner: enemy }).ok)
    .map(x => x.unit)
    .sort((a, b) => a.op - b.op);
  let kosha = st.players[pIdx].kosha, total = 0;
  for (const u of cands) { if (kosha >= u.op) { kosha -= u.op; total += u.atk; } }
  return total;
}

export const hasLethal = (st: GameState, pIdx: PlayerIndex) =>
  faceDamageAvailable(st, pIdx) >= st.players[other(pIdx)].hq.hp;

function boardPower(st: GameState, owner: PlayerIndex): number {
  let v = 0;
  allUnits(st, owner).forEach(x => { v += unitValue(x.unit); });
  return v;
}

function attackScore(st: GameState, pIdx: PlayerIndex, a: Unit, target: Target, aggr?: number): number {
  const enemy = other(pIdx);
  const k = aggr || 1;
  if (target.kind === 'hq') {
    const hp = st.players[enemy].hq.hp;
    return a.atk >= hp ? 5000 : a.atk * 1.6 * k;
  }
  const f = findUnit(st, enemy, target.uid);
  if (!f) return -1;
  const d = f.unit;
  const kills = a.atk >= d.hp;
  const retaliation = (a.range === 'melee' && d.range === 'melee') ? d.atk : 0;
  const weDie = retaliation >= a.hp;
  let s = 0;
  if (kills) s += unitValue(d) + 2.5;
  else s += Math.min(a.atk, d.hp) * 0.45;
  if (retaliation) s -= Math.min(retaliation, a.hp) * 0.7;
  if (weDie) s -= unitValue(a) * 0.85;
  if (kills && !weDie) s += 2;
  if (f.line === 'front' && kills) s += 1.5;   // breaking their hold on the line
  if (d.atk >= 5) s += 1.5;                     // kill their big threats
  return s;
}

function bestAttackFor(st: GameState, pIdx: PlayerIndex, unit: Unit): { target: Target; score: number } | null {
  const enemy = other(pIdx);
  const opts: { target: Target; score: number }[] = [];
  const hq: Target = { kind: 'hq', owner: enemy };
  if (canAttack(st, pIdx, unit.uid, hq).ok) opts.push({ target: hq, score: attackScore(st, pIdx, unit, hq) });
  allUnits(st, enemy).forEach(x => {
    const t: Target = { kind: 'unit', owner: enemy, uid: x.unit.uid };
    if (!canAttack(st, pIdx, unit.uid, t).ok) return;
    opts.push({ target: t, score: attackScore(st, pIdx, unit, t) });
  });
  opts.sort((a, b) => b.score - a.score);
  return opts[0] || null;
}

function playableCards(st: GameState, pIdx: PlayerIndex): PlayOption[] {
  const p = st.players[pIdx];
  const out: PlayOption[] = [];
  p.hand.forEach((cardId, i) => {
    const c = CARDS[cardId];
    if (p.kosha < koshaCost(st, pIdx, c)) return;
    if (c.type === 'unit') {
      if (!canPlay(st, pIdx, i).ok) return;
      out.push({ i, c, target: null, kind: 'unit' });
    } else if (c.target === 'enemyUnit') {
      const enemy = other(pIdx);
      allUnits(st, enemy).forEach(x => {
        const t: Target = { kind: 'unit', owner: enemy, uid: x.unit.uid };
        if (canPlay(st, pIdx, i, t).ok) out.push({ i, c, target: t, kind: 'removal', victim: x.unit });
      });
    } else if (canPlay(st, pIdx, i).ok) {
      out.push({ i, c, target: null, kind: 'order' });
    }
  });
  return out;
}

function orderValue(st: GameState, pIdx: PlayerIndex, entry: PlayOption): number {
  const p = st.players[pIdx];
  const enemy = other(pIdx);
  const id = entry.c.id;
  if (id === 'n_aakraman' || id === 's_agni' || (entry.kind === 'removal' && entry.c.power)) {
    const v = entry.victim;
    if (!v) return 0;
    const dmg = entry.c.power ?? (id === 's_agni' ? 5 : 2);
    return (dmg >= v.hp ? unitValue(v) + 2 : dmg * 0.6) + (entry.c.hqDamage ?? 0) * 0.5;
  }
  if (id === 'se_megasthenes') return p.hand.length <= 6 ? 6 : 2;
  if (id === 's_chakravyuha') {
    const n = allUnits(st, enemy).length;
    return n >= 2 ? 4 + n * 2 : 0;
  }
  if (id === 's_ashwamedha') return allUnits(st, pIdx).length >= 3 ? 9 : 1;
  if (id === 'y_vighna' || id === 'y_kavach' || id === 'y_pratikar') return p.yantras.length >= 2 ? 0 : 3.5;
  if (id === 'n_sena_bhojan' || id === 'c_shilpa') return (p.hq.maxHp - p.hq.hp) >= 6 ? 7 : 0;
  if (id === 'g_swarn_yug') return p.hand.length <= 6 ? 7.5 : 3;
  if (id === 'n_yudh_niti' || id === 'm_arthashastra') return p.hand.length <= 5 ? 7 : 2;
  if (id === 'n_visha_baan') return allUnits(st, enemy).length >= 3 ? 9 : (allUnits(st, enemy).length === 2 ? 3 : 0);
  if (id === 'r_kshatra') return (st.front.owner === pIdx && st.front.units.length >= 2) ? 8 : 0;
  if (id === 'ch_vyapari') return 5.5;
  if (id === 'nd_nanda_kosha') return p.hand.some(h => CARDS[h].cost > p.kosha && CARDS[h].cost <= p.kosha + 2) ? 6 : 0;
  if (id === 'nd_kashtha_prakara') return p.yantras.length >= 2 ? 0 : 3.5;
  if (id === 'm_garuda_vyuha') return allUnits(st, pIdx).filter(x => x.unit.canAct && !x.unit.attacked).length >= 2 ? 7 : 0;
  if (id === 'm_makara_vyuha') return st.front.owner === pIdx && st.front.units.length >= 2 ? 6 : 0;
  return 3;
}

function unitPlayScore(st: GameState, pIdx: PlayerIndex, entry: PlayOption): number {
  const c = entry.c;
  const p = st.players[pIdx];
  const cost = koshaCost(st, pIdx, c);
  let s = ((c.atk ?? 0) * 1.35 + (c.hp ?? 0)) - cost * 0.55;
  if (c.kw && c.kw.includes('veg')) s += 2.2;
  if (c.kw && c.kw.includes('raksha')) s += 1.4;
  if (c.deploy) s += 1.2;
  if (st.players[other(pIdx)].support.length >= 3 && (c.hp ?? 0) <= 2) s -= 0.8;
  if (p.hand.length >= 8) s += 1;
  return s;
}

export function aiPlayPhase(st: GameState, pIdx: PlayerIndex, level: AiLevel): void {
  let guard = 0;
  const rng = st.rng;
  while (guard++ < 14) {
    const options = playableCards(st, pIdx);
    if (!options.length) break;
    const scored = options.map(o => ({
      o, score: o.kind === 'unit' ? unitPlayScore(st, pIdx, o) : orderValue(st, pIdx, o)
    })).filter(x => x.score > 0);
    if (!scored.length) break;

    if (level === 'easy') {
      if (rng() < 0.2) break;
      const pick = scored[Math.floor(rng() * scored.length)];
      if (!applyAction(st, { type: 'play', handIndex: pick.o.i, target: pick.o.target }).ok) break;
      continue;
    }
    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0];
    if (!applyAction(st, { type: 'play', handIndex: pick.o.i, target: pick.o.target }).ok) break;
  }
}

function advance(st: GameState, pIdx: PlayerIndex, level: AiLevel): void {
  const rng = st.rng;
  let guard = 0;
  while (guard++ < 12) {
    const p = st.players[pIdx];
    if (st.front.owner !== null && st.front.owner !== pIdx) break;
    if (st.front.units.length >= 4) break;
    const movable = p.support.filter(u => canMove(st, pIdx, u.uid).ok);
    if (!movable.length) break;
    movable.sort((a, b) => (b.atk + b.hp) - (a.atk + a.hp));
    const candidate = movable[0];
    // keep a body at home if the enemy is already on our doorstep
    const enemyOnLine = st.front.owner === other(pIdx);
    if (enemyOnLine && p.support.length >= 3 && candidate.atk <= 1 && level !== 'easy') break;
    if (level === 'easy' && rng() < 0.3) break;
    if (!applyAction(st, { type: 'move', uid: candidate.uid }).ok) break;
  }
}

function strikeLethal(st: GameState, pIdx: PlayerIndex, ready: { unit: Unit }[]): boolean {
  const hq: Target = { kind: 'hq', owner: other(pIdx) };
  const cand = ready.filter(x => canAttack(st, pIdx, x.unit.uid, hq).ok).sort((a, b) => a.unit.op - b.unit.op)[0];
  if (!cand) return false;
  applyAction(st, { type: 'attack', uid: cand.unit.uid, target: hq });
  return true;
}

export function aiCombatPhase(st: GameState, pIdx: PlayerIndex, level: AiLevel): void {
  const rng = st.rng;
  advance(st, pIdx, level);
  let guard = 0;
  while (guard++ < 24) {
    const p = st.players[pIdx];
    const ready = allUnits(st, pIdx).filter(x => !x.unit.attacked && x.unit.canAct && p.kosha >= x.unit.op);
    if (!ready.length) break;
    if (level === 'hard' && hasLethal(st, pIdx) && strikeLethal(st, pIdx, ready)) continue;

    let best: { uid: number; target: Target; score: number } | null = null;
    ready.forEach(x => {
      if (level === 'easy' && rng() < 0.45) return;
      const pick = bestAttackFor(st, pIdx, x.unit);
      if (!pick) return;
      if (!best || pick.score > best.score) best = { uid: x.unit.uid, target: pick.target, score: pick.score };
    });
    const b = best as { uid: number; target: Target; score: number } | null;
    if (!b) break;
    if (level !== 'easy' && b.score <= 0.4) break;
    if (!applyAction(st, { type: 'attack', uid: b.uid, target: b.target }).ok) break;
  }
}

function hardCombatPhase(st: GameState, pIdx: PlayerIndex): void {
  // advance: same rules as normal, without the random hesitation
  let guard = 0;
  while (guard++ < 12) {
    const p = st.players[pIdx];
    if (st.front.owner !== null && st.front.owner !== pIdx) break;
    if (st.front.units.length >= 4) break;
    const movable = p.support.filter(u => canMove(st, pIdx, u.uid).ok);
    if (!movable.length) break;
    movable.sort((a, b) => (b.atk + b.hp) - (a.atk + a.hp));
    const cand = movable[0];
    if (st.front.owner === other(pIdx) && p.support.length >= 3 && cand.atk <= 1) break;
    if (!applyAction(st, { type: 'move', uid: cand.uid }).ok) break;
  }

  guard = 0;
  while (guard++ < 24) {
    const p = st.players[pIdx];
    const ready = allUnits(st, pIdx).filter(x => !x.unit.attacked && x.unit.canAct && p.kosha >= x.unit.op);
    if (!ready.length) break;
    const mine = boardPower(st, pIdx), theirs = boardPower(st, other(pIdx));
    const aggr = Math.max(0.7, Math.min(2.2, 1 + (mine - theirs) / 12));
    if (hasLethal(st, pIdx) && strikeLethal(st, pIdx, ready)) continue;

    let best: { uid: number; target: Target; score: number } | null = null;
    for (const x of ready) {
      const targets: Target[] = [];
      const hq: Target = { kind: 'hq', owner: other(pIdx) };
      if (canAttack(st, pIdx, x.unit.uid, hq).ok) targets.push(hq);
      allUnits(st, other(pIdx)).forEach(t => {
        const tg: Target = { kind: 'unit', owner: other(pIdx), uid: t.unit.uid };
        if (canAttack(st, pIdx, x.unit.uid, tg).ok) targets.push(tg);
      });
      for (const tg of targets) {
        const sc = attackScore(st, pIdx, x.unit, tg, aggr);
        if (!best || sc > best.score) best = { uid: x.unit.uid, target: tg, score: sc };
      }
    }
    if (!best || best.score <= 0.4) break;
    if (!applyAction(st, { type: 'attack', uid: best.uid, target: best.target }).ok) break;
  }
}

export function aiTurn(st: GameState, pIdx: PlayerIndex, level?: AiLevel): void {
  if (st.over) return;
  const lvl = level || st.aiLevel || 'normal';
  if (lvl === 'hard') {
    aiPlayPhase(st, pIdx, 'normal');
    hardCombatPhase(st, pIdx);
  } else {
    aiPlayPhase(st, pIdx, lvl);
    aiCombatPhase(st, pIdx, lvl);
  }
  if (!st.over) applyAction(st, { type: 'end' });
}
