import { describe, expect, it } from 'vitest';
import { aiTurn, CARDS } from '../src/engine';
import { DUEL_DECK_SIZE, FACTIONS, duelGame, duelScenario, factionById } from '../src/campaign/duel';

describe('Duel balance (pass-and-play)', () => {
  it('every duel deck is padded to the same size, legendary cards once', () => {
    for (const f of FACTIONS) {
      const sc = duelScenario(f, f);
      expect(sc.playerDeck.length, f.id).toBeGreaterThanOrEqual(DUEL_DECK_SIZE);
      // legendary cards once (Kalinga has no named hero: its showpiece card is an epic elephant)
      for (const id of new Set(sc.playerDeck.filter(id => CARDS[id]?.rarity === 'legendary')))
        expect(sc.playerDeck.filter(x => x === id).length, `${f.id} ${id}`).toBeLessThanOrEqual(1);
    }
  });
  it('Maurya against Gupta is an even match from either seat (Gupta once lost 94% of its games by drawing its deck dry)', () => {
    const m = factionById('maurya')!, g = factionById('gupta')!;
    let mw = 0, n = 0;
    for (let i = 0; i < 120; i++) for (const [a, b] of [[m, g], [g, m]] as const) {
      const st = duelGame(a, b, 4000 + i * 13);
      let k = 0; while (!st.over && k++ < 500) aiTurn(st, st.active, 'normal');
      n++; if (st.winner !== null && st.players[st.winner].faction === m.faction) mw++;
    }
    const r = mw / n;
    console.log(`Duel: Maurya wins ${(r * 100).toFixed(0)}% against Gupta`);
    expect(r).toBeGreaterThan(0.38);
    expect(r).toBeLessThan(0.62);
  });
});
