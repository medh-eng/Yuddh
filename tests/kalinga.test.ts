import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { KALINGA, KALINGA_SCENARIO, kalingaGame } from '../src/campaign/kalinga';

describe('Kalinga', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...KALINGA.playerDeck, ...KALINGA.enemyDeck, ...KALINGA_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(KALINGA.battlefield).toBe('dhauli');
  });
  it('is fair: the Maurya side wins 40–70% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = kalingaGame(9000 + s * 41);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Kalinga: Maurya side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.4);
    expect(rate).toBeLessThan(0.7);
  });
  it('the Maurya campaign ends Indus Line → Kalinga, and Kalinga leads to the Digvijaya', () => {
    const c = CAMPAIGNS.find(x => x.id === 'maurya')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['training_ground', 'first_throne', 'indus_line', 'kalinga']);
    expect(c.nodes[2].scenario.nextId).toBe('kalinga');
    expect(KALINGA_SCENARIO.nextId).toBe('digvijaya');
  });
  it('Ashoka, the Rock Edict and the Daya do what their cards say', () => {
    expect(CARDS.m_ashoka.deploy).toBe('buffAll');
    expect(CARDS.m_shila_lekh.heal).toBe(5);
    expect(CARDS.m_shila_lekh.dharma).toBe(1);
    expect(CARDS.kl_daya.damageFront).toBe(2);
    expect(CARDS.kl_gaja.sub).toMatch(/Elephant/);
  });
});
