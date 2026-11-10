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

import { mirrorAction, syncHash, actionObservers, type Action } from '../src/engine';

describe('two-phone lockstep', () => {
  it('host and guest stay in step when only mirrored actions are exchanged', () => {
    for (const seed of [3, 77, 901]) {
      const host = mk(seed);                       // real frame
      const guest = mk(seed); swapSides(guest);    // guest's frame: guest is player 0
      let guard = 0, steps = 0;
      while (!host.over && guard++ < 300) {
        const hostMoves = host.active === 0;
        const mover = hostMoves ? host : guest, other = hostMoves ? guest : host;
        const sent: Action[] = [];
        const obs = (_s: GameState, a: Action) => { if (_s === mover) sent.push(a); };
        actionObservers.add(obs);
        try { aiTurn(mover, 0, 'normal'); } finally { actionObservers.delete(obs); }
        // the mover's actions travel in the host's frame
        for (const a of sent) {
          const wire = hostMoves ? a : mirrorAction(a);        // guest -> host frame
          const local = hostMoves ? mirrorAction(wire) : wire; // host frame -> receiver's frame
          expect(applyAction(other, local).ok).toBe(true);
          steps++;
        }
        // the mover finished its whole turn before the receiver replayed it, so compare now
        expect(syncHash(host, false), `seed ${seed} step ${steps}`).toBe(syncHash(guest, true));
      }
      expect(host.over).toBe(guest.over);
    }
  });
  it('mirrorAction is its own inverse', () => {
    const a: Action = { type: 'attack', uid: 4, target: { kind: 'unit', owner: 1, uid: 9 } };
    expect(mirrorAction(mirrorAction(a))).toEqual(a);
    expect(mirrorAction({ type: 'end' })).toEqual({ type: 'end' });
  });
});
