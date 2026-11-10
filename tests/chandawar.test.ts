import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS, strikeDamage } from '../src/engine';
import { newGame } from '../src/engine/rules';
import { CAMPAIGNS } from '../src/campaign/campaign';
import { CHANDAWAR, CHANDAWAR_SCENARIO, chandawarGame } from '../src/campaign/chandawar';

describe('The Battle of Chandawar', () => {
  it('uses only painted, existing cards, Durgs and battlefield', () => {
    for (const id of [...CHANDAWAR.playerDeck, ...CHANDAWAR.enemyDeck, ...CHANDAWAR_SCENARIO.durgArt]) {
      if (id.startsWith('durg_')) { expect(CARD_ART, id).toContain(id); continue; }
      expect(CARDS[id], id).toBeDefined();
      expect(CARD_ART, id).toContain(id);
    }
    expect(CHANDAWAR.battlefield).toBe('chandawar');
  });
  it('is a hard fight: the Rajput side wins 30–55% when both sides play "normal"', () => {
    let wins = 0, games = 0, turns = 0;
    for (let s = 0; s < 200; s++) {
      const st = chandawarGame(9000 + s * 41);
      let g = 0;
      while (!st.over && g++ < 300) aiTurn(st, st.active, 'normal');
      games++; turns += st.turn; if (st.winner === 0) wins++;
    }
    const rate = wins / games;
    console.log(`Chandawar 1194: Rajput side wins ${(rate * 100).toFixed(0)}%, average ${(turns / games).toFixed(1)} turns`);
    expect(rate).toBeGreaterThan(0.3);
    expect(rate).toBeLessThan(0.55);
  });
  it('Elephant-Shooters deal extra damage to a War Elephant and only to one', () => {
    expect(CARDS['gh_marksmen'].vsElephant).toBe(2);
    const st = newGame({ seed: 1, player: { empire: 'rajput', deck: ['r_rana'] }, enemy: { empire: 'neutral', deck: ['gh_marksmen'] }, rules: 'yuddh', season: 'sharad' });
    const a = { cardId: 'gh_marksmen', atk: 2, range: 'ranged', owner: 1, uid: 99 } as never;
    expect(strikeDamage(st, a, { cardId: 'r_howdah' })).toBe(4);
    expect(strikeDamage(st, a, { cardId: 'r_jayachandra' })).toBe(4);
    expect(strikeDamage(st, a, { cardId: 'r_rana' })).toBe(2);
    expect(strikeDamage(st, a)).toBe(2);
  });
  it('the Rajput campaign runs First Tarain → Second Tarain → Chandawar', () => {
    const c = CAMPAIGNS.find(x => x.id === 'rajput')!;
    expect(c.nodes.map(n => n.scenario.id)).toEqual(['tarain1', 'tarain2', 'chandawar']);
    expect(c.nodes[1].scenario.nextId).toBe('chandawar');
  });
});
