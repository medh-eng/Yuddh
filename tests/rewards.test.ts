import { describe, it, expect } from 'vitest';
import RANKS from '../src/data/ranks.json';
import { rankOf, LADDER } from '../src/meta/standing';

describe('rank rewards', () => {
  it('reward levels exist on the ladder', () => {
    expect(RANKS.rewards.chronicleLevel).toBeLessThan(LADDER.length);
    expect(RANKS.rewards.gildedLevel).toBeLessThan(LADDER.length);
    expect(rankOf(LADDER[RANKS.rewards.chronicleLevel].from).level).toBe(RANKS.rewards.chronicleLevel);
  });
  it('every ranked empire has a chronicle with a source line', () => {
    for (const id of Object.keys(RANKS.empires)) {
      const c = (RANKS.chronicles as Record<string, { title: string; text: string; source: string }>)[id];
      expect(c, id).toBeTruthy();
      expect(c.text.length).toBeGreaterThan(80);
      expect(c.source.length).toBeGreaterThan(10);
    }
  });
});
