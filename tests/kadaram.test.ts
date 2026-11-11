import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { KADARAM, KADARAM_SCENARIO, kadaramGame } from '../src/campaign/kadaram';

describe("Rajendra's Sea Road (Kadaram)", () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...KADARAM.playerDeck, ...KADARAM.enemyDeck, ...KADARAM_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
  });
  it('is winnable but not free: the player side wins 45–70% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = kadaramGame(5000 + s * 37);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Kadaram: player side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.45);
    expect(rate).toBeLessThan(0.7);
  });
  it('the Chola campaign has its own tab on the map', () => {
    const c = CAMPAIGNS.find(x => x.id === 'chola')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['lanka', 'ganga', 'kadaram', 'koppam']);
    expect(c.nodes[2].scenario.nextId).toBe('koppam');
  });
});
