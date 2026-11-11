import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { BADAMI, BADAMI_SCENARIO, badamiGame } from '../src/campaign/badami';

describe('The Fall of Badami', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...BADAMI.playerDeck, ...BADAMI.enemyDeck, ...BADAMI_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(BADAMI.battlefield).toBe('vatapi');
  });
  it('is hard but fair: the Chalukya side wins 30–60% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = badamiGame(9500 + s * 41);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Badami: Chalukya side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.3);
    expect(rate).toBeLessThan(0.6);
  });
  it('the Chalukya campaign runs Narmada → Pullalur → Badami → Vikramaditya\'s Return', () => {
    const c = CAMPAIGNS.find(x => x.id === 'chalukya')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['narmada_line', 'pullalur', 'badami', 'vikram_return']);
    expect(c.nodes[1].scenario.nextId).toBe('badami');
    expect(c.nodes[2].scenario.nextId).toBe('vikram_return');
  });
});
