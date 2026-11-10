import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { TARAIN2, TARAIN2_SCENARIO, tarain2Game } from '../src/campaign/tarain2';

describe('The Second Battle of Tarain', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...TARAIN2.playerDeck, ...TARAIN2.enemyDeck, ...TARAIN2_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
  });
  it('is the hard one: the Rajput side wins 30–55% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = tarain2Game(7000 + s * 41);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Tarain 1192: Rajput side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.3);
    expect(rate).toBeLessThan(0.55);
  });
  it('Feigned Flight hits the whole Yudhbhumi line and Dawn Charge buffs and draws', () => {
    expect(CARDS['gh_feint'].damageFront).toBe(2);
    expect(CARDS['gh_dawn'].buffAtk).toBe(1);
    expect(CARDS['gh_dawn'].draw).toBe(1);
  });
  it('the Rajput campaign runs First Tarain → Second Tarain', () => {
    const c = CAMPAIGNS.find(x => x.id === 'rajput')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['tarain1', 'tarain2']);
  });
});
