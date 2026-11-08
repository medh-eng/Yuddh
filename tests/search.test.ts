/* The search AI (level 'search'): it must be stronger than the heuristic AI, must not cheat,
   must not disturb the real game while it thinks, and must be repeatable. */
import { describe, expect, it } from 'vitest';
import { actionObservers, aiTurn, type GameState } from '../src/engine';
import { planTurn } from '../src/engine/search';
import { firstThroneGame } from '../src/campaign/firstThrone';
import { indusLineGame } from '../src/campaign/indusLine';

const snapshot = (st: GameState): string => { const { rng: _r, ...rest } = st; return JSON.stringify(rest); };

/** play to the end; `p0` and `p1` are the levels of the two sides */
function play(mk: (s: number) => GameState, seed: number, p0: 'normal' | 'search', p1: 'normal' | 'search'): GameState {
  const st = mk(seed);
  let g = 0;
  while (!st.over && g++ < 300) aiTurn(st, st.active, st.active === 0 ? p0 : p1);
  return st;
}

describe('search AI', () => {
  it('beats the heuristic AI on both sides of the board', () => {
    let score = 0, games = 0;
    for (const mk of [firstThroneGame, indusLineGame]) {
      for (let s = 0; s < 24; s++) {
        const seed = 9100 + s * 61;
        if (play(mk, seed, 'search', 'normal').winner === 0) score++;
        if (play(mk, seed, 'normal', 'search').winner === 1) score++;
        games += 2;
      }
    }
    console.log(`search AI scores ${(score / games * 100).toFixed(0)}% against the normal AI (${games} games)`);
    expect(score / games).toBeGreaterThan(0.65);
  }, 120_000);

  it('planning leaves the real game untouched and silent', () => {
    const st = firstThroneGame(4242);
    for (let i = 0; i < 5; i++) aiTurn(st, st.active, 'normal');     // reach a mid-game position
    let calls = 0;
    const obs = () => { calls++; };
    actionObservers.add(obs);
    const before = snapshot(st);
    planTurn(st, st.active);
    actionObservers.delete(obs);
    expect(snapshot(st)).toBe(before);
    expect(calls).toBe(0);
    expect(actionObservers.size).toBe(0);
  });

  it('is repeatable: the same position gives the same plan', () => {
    const st = indusLineGame(777);
    for (let i = 0; i < 6; i++) aiTurn(st, st.active, 'normal');
    expect(JSON.stringify(planTurn(st, st.active))).toBe(JSON.stringify(planTurn(st, st.active)));
  });

  it('does not use what it cannot see: swapping the enemy hand with its deck changes nothing', () => {
    const st = firstThroneGame(1313);
    for (let i = 0; i < 7; i++) aiTurn(st, st.active, 'normal');
    const me = st.active, op = st.players[1 - me];
    const plan = JSON.stringify(planTurn(st, me));
    // swap the enemy's whole hand with the top of its deck, and reverse its deck: same unseen pool
    const n = op.hand.length;
    const top = op.deck.splice(op.deck.length - n, n);
    op.deck.push(...op.hand); op.hand = top; op.deck.reverse();
    expect(JSON.stringify(planTurn(st, me))).toBe(plan);
  });

  it('plays whole games to a finish, mirror match', () => {
    for (let s = 0; s < 4; s++) expect(play(firstThroneGame, 31 + s, 'search', 'search').over).toBe(true);
  });
});
