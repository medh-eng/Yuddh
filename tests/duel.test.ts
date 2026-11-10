import { describe, expect, it } from 'vitest';
import { aiTurn, newGame, swapSides, fixTurnAfterEnd, drainEvents, applyAction, type GameState } from '../src/engine';
import { decksOf } from '../src/data';

const mk = (seed: number): GameState => newGame({
  seed, rules: 'yuddh', season: 'sharad', aiLevel: 'normal', objective: { type: 'destroy' },
  player: { empire: 'rajput', deck: decksOf('tarain2').player, faction: 'Rajput', capital: 'Ajmer' },
  enemy: { empire: 'neutral', deck: decksOf('tarain2').enemy, faction: 'Ghurid', capital: 'Camp', handSize: 5 }
});

describe('pass-and-play side swap', () => {
  it('a game played with the sides swapped every turn matches the same game played normally', () => {
    for (const seed of [11, 222, 3333, 44444, 555555]) {
      const plain = mk(seed);
      let g = 0;
      while (!plain.over && g++ < 400) aiTurn(plain, plain.active, 'normal');

      const swapped = mk(seed);
      let flipped = false; g = 0;
      while (!swapped.over && g++ < 400) {
        aiTurn(swapped, 0, 'normal');           // the mover is always player 0 in this frame
        if (swapped.over) break;
        // aiTurn ends the turn itself; undo nothing, just correct the turn counter and turn the board
        fixTurnAfterEnd(swapped, flipped);
        drainEvents(swapped);
        swapSides(swapped); flipped = !flipped;
      }
      const realWinner = swapped.winner === null ? null : (flipped ? 1 - swapped.winner : swapped.winner);
      expect(realWinner, `seed ${seed}`).toBe(plain.winner);
      expect(swapped.turn, `seed ${seed}`).toBe(plain.turn);
    }
  });
  it('swapSides is its own inverse', () => {
    const st = mk(9);
    applyAction(st, { type: 'end' });
    const before = JSON.stringify({ ...st, rng: 0 });
    swapSides(st); swapSides(st);
    expect(JSON.stringify({ ...st, rng: 0 })).toBe(before);
  });
  it('after a swap the mover is player 0 and unit owners follow their player', () => {
    const st = mk(5);
    applyAction(st, { type: 'end' });                 // player 1 is now up
    swapSides(st);
    expect(st.active).toBe(0);
    for (const [i, p] of st.players.entries()) p.support.forEach(u => expect(u.owner).toBe(i));
  });
});
