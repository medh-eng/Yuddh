import { describe, expect, it } from 'vitest';
import { CARD_ART } from '../src/assets/manifest';
import { aiTurn, CARDS } from '../src/engine';
import { FACTIONS, duelGame, duelScenario } from '../src/campaign/duel';

describe('the Duel roster', () => {
  it('every faction has a real deck, hero and painted art', () => {
    expect(FACTIONS.length).toBeGreaterThanOrEqual(16);
    for (const f of FACTIONS) {
      const sc = duelScenario(f, f);
      for (const id of [...sc.playerDeck, f.hero]) { expect(CARDS[id], `${f.id} ${id}`).toBeDefined(); expect(CARD_ART, `${f.id} ${id}`).toContain(id); }
      expect(CARD_ART, `${f.id} durg`).toContain(f.durg);
    }
  });
  it('any pairing plays to a finish and the second player opens with one extra card', () => {
    for (let i = 0; i < FACTIONS.length; i++) {
      const a = FACTIONS[i], b = FACTIONS[(i * 7 + 3) % FACTIONS.length];
      const st = duelGame(a, b, 100 + i);
      expect(st.players[1].hand.length).toBe(st.players[0].hand.length + 1);
      let g = 0;
      while (!st.over && g++ < 400) aiTurn(st, st.active, 'normal');
      expect(st.over, `${a.id} vs ${b.id}`).toBe(true);
    }
  });
  it('a duel has two humans: both sides use the same rules and Durg labels', () => {
    const sc = duelScenario(FACTIONS[0], FACTIONS[5]);
    expect(sc.duel?.sides.map(x => x.name)).toEqual([FACTIONS[0].name, FACTIONS[5].name]);
    expect(sc.durgArt).toEqual([FACTIONS[0].durg, FACTIONS[5].durg]);
  });
});
