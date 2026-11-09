import { describe, expect, it } from 'vitest';
import { Standing, LADDER, rankOf, yashFor } from '../src/meta/standing';
import { Meta, type Store } from '../src/meta/progress';
import { CAMPAIGNS, empireOfBattle } from '../src/campaign/campaign';
import { EMPIRES } from '../src/meta/standing';

const mem = (): Store => { const m = new Map<string, string>(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v); } }; };

describe('rank and renown', () => {
  it('has seven ranks, rising, starting at zero', () => {
    expect(LADDER.length).toBe(7);
    LADDER.forEach((r, i) => { if (i) expect(r.from).toBeGreaterThan(LADDER[i - 1].from); });
    expect(LADDER[0].from).toBe(0);
  });
  it('earns Yash: win 80, first clear +120, loss 20, Veteran x1.5', () => {
    expect(yashFor(true, false, false)).toBe(80);
    expect(yashFor(true, true, false)).toBe(200);
    expect(yashFor(false, false, false)).toBe(20);
    expect(yashFor(true, true, true)).toBe(300);
  });
  it('rank follows Yash and reports progress to the next', () => {
    expect(rankOf(0).rank.name).toBe('Padati');
    expect(rankOf(149).level).toBe(0);
    const v = rankOf(150);
    expect(v.rank.name).toBe('Gulmapati'); expect(v.next?.name).toBe('Nayaka');
    expect(rankOf(99999).next).toBeNull();
  });
  it('records battles per empire, announces a rank-up once and pays Kirti', () => {
    const store = mem(), meta = new Meta(store), st = new Standing(store, meta);
    const g = st.record('maurya', true, true, false);
    expect(g).toMatchObject({ yash: 200, rankedUp: true, kirti: 25 });
    expect(meta.kirti()).toBe(25);
    const g2 = st.record('maurya', true, false, false);
    expect(g2.rankedUp).toBe(false);
    expect(st.of('maurya')).toMatchObject({ yash: 280, wins: 2, played: 2 });
    expect(st.of('gupta').yash).toBe(0);
    st.record('gupta', false, false, true);
    expect(st.of('gupta')).toMatchObject({ yash: 30, wins: 0, played: 1, vetWins: 0 });
  });
  it('persists across loads', () => {
    const store = mem();
    new Standing(store, new Meta(store)).record('chola', true, true, true);
    expect(new Standing(store, new Meta(store)).of('chola').vetWins).toBe(1);
  });
  it('every campaign has an empire entry and the coached tutorial belongs to none', () => {
    CAMPAIGNS.forEach(c => expect(EMPIRES[c.id], c.id).toBeDefined());
    expect(empireOfBattle('tutorial')).toBeUndefined();
    expect(empireOfBattle('kadaram')).toBe('chola');
    expect(empireOfBattle('first_throne')).toBe('maurya');
  });
});
