import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { VIKRAM_RETURN, VIKRAM_RETURN_SCENARIO, vikramReturnGame } from '../src/campaign/vikramReturn';

describe("Vikramaditya's Return", () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...VIKRAM_RETURN.playerDeck, ...VIKRAM_RETURN.enemyDeck, ...VIKRAM_RETURN_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(VIKRAM_RETURN.battlefield).toBe('vatapi');
  });
  it('is a win for the player, kinder than Badami: 50–70% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = vikramReturnGame(21000 + s * 47);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Vikramaditya's Return: Chalukya side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.5);
    expect(rate).toBeLessThan(0.7);
  });
  it("the Chalukya campaign closes with Vikramaditya's Return", () => {
    const c = CAMPAIGNS.find(x => x.id === 'chalukya')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['narmada_line', 'pullalur', 'badami', 'vikram_return']);
    expect(c.nodes[2].scenario.nextId).toBe('vikram_return');
  });
});
