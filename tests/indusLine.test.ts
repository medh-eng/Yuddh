import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { INDUS_LINE, INDUS_LINE_SCENARIO, indusLineGame } from '../src/campaign/indusLine';

describe('The Indus Line', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...INDUS_LINE.playerDeck, ...INDUS_LINE.enemyDeck, ...INDUS_LINE_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
  });
  it('is winnable but not free: the player side wins 45–70% (harder than The First Throne) when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = indusLineGame(7000 + s * 37);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Indus Line: player side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.45);
    expect(rate).toBeLessThan(0.7);
  });
});
