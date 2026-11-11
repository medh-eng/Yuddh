import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { KOPPAM, KOPPAM_SCENARIO, koppamGame } from '../src/campaign/koppam';

describe('Koppam', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...KOPPAM.playerDeck, ...KOPPAM.enemyDeck, ...KOPPAM_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(KOPPAM.battlefield).toBe('koppam');
  });
  it('is close and hard: the Chola side wins 45–62% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = koppamGame(11000 + s * 43);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Koppam: Chola side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.45);
    expect(rate).toBeLessThan(0.62);
  });
  it('the Chola campaign has its own tab on the map, ending at Koppam', () => {
    const c = CAMPAIGNS.find(x => x.id === 'chola')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['lanka', 'ganga', 'kadaram', 'koppam']);
    expect(c.nodes[2].scenario.nextId).toBe('koppam');
  });
});
