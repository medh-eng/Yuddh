import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { PULLALUR, PULLALUR_SCENARIO, pullalurGame } from '../src/campaign/pullalur';

describe('Pullalur', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...PULLALUR.playerDeck, ...PULLALUR.enemyDeck, ...PULLALUR_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(PULLALUR.battlefield).toBe('pullalur');
  });
  it('is fair: the Chalukya side wins 40–70% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = pullalurGame(9000 + s * 41);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Pullalur: Chalukya side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.7);
  });
  it('the Chalukya campaign runs Narmada → Pullalur → Badami', () => {
    const c = CAMPAIGNS.find(x => x.id === 'chalukya')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['narmada_line', 'pullalur', 'badami']);
    expect(c.nodes[0].scenario.nextId).toBe('pullalur');
    expect(c.nodes[1].scenario.nextId).toBe('badami');
  });
});
