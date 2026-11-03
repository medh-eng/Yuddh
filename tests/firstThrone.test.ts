import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { FIRST_THRONE, firstThroneGame } from '../src/campaign/firstThrone';

describe('The First Throne', () => {
  it('uses only painted, existing cards', () => {
    for (const id of [...FIRST_THRONE.playerDeck, ...FIRST_THRONE.enemyDeck]) {
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
  });
  it('is winnable but not free: the player side wins 55–80% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = firstThroneGame(5000 + s * 31);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`First Throne: player side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.55);
    expect(rate).toBeLessThan(0.80);
  });
});
