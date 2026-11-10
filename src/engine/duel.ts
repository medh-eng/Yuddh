/* ============================================================
   Pass-and-play support. The battle screen always shows player 0 at
   the bottom and player 1 at the top. For two humans on one device
   the state is turned around between turns, so whoever is about to
   move is always player 0 and sits at the bottom of the board.
   `swapSides` is the whole trick: it exchanges the two players and
   every field that names one. The engine treats the sides
   identically, so a game played with swaps matches a game played
   without them (tests/duel.test.ts replays one against the other).
   No DOM code here.
   ============================================================ */
import type { GameState, PlayerIndex, Unit } from './types';

const flip = (i: PlayerIndex): PlayerIndex => (i === 0 ? 1 : 0);

/** Exchange the players and every index that refers to one. Drain pending events before calling. */
export function swapSides(st: GameState): void {
  const [a, b] = st.players;
  st.players = [b, a];
  st.players[0].side = 'p0'; st.players[1].side = 'p1';
  const turn = (list: Unit[]) => list.forEach(u => { u.owner = flip(u.owner); });
  st.players.forEach(p => turn(p.support));
  turn(st.front.units);
  if (st.front.owner !== null) st.front.owner = flip(st.front.owner);
  st.active = flip(st.active);
  if (st.winner !== null) st.winner = flip(st.winner);
  st.log.forEach(e => { e.side = e.side === 0 || e.side === 1 ? 1 - e.side : e.side; });
}

/**
 * Call right after player 0 (in the current frame) ends the turn and before `swapSides`.
 * The engine adds a turn when play returns to player 0; in the swapped frame that moment
 * is "the original first player is up again", which is when `flipped` is true.
 */
export function fixTurnAfterEnd(st: GameState, flipped: boolean): void {
  if (flipped) st.turn += 1;
}
