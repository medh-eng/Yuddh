/* Card-mechanics checks, ported from the prototype's yantra-test.js. */
import { describe, expect, it } from 'vitest';
import { allUnits, applyAction, buildDeck, drainEvents, findUnit, newGame, type Unit } from '../src/engine';
import { Meta, type Store } from '../src/meta/progress';

const mk = () => newGame({
  player: { empire: 'maurya', ally: 'gupta', deck: buildDeck('maurya', 'gupta') },
  enemy: { empire: 'rajput', ally: 'neutral', deck: buildDeck('rajput', 'neutral') },
  seed: 11
});
const unit = (uid: number, cardId: string, owner: 0 | 1, atk: number, hp: number): Unit => ({
  uid, cardId, name: cardId, sub: '', glyph: '', empire: 'neutral', atk, hp, maxHp: hp, op: 1,
  range: 'melee', kw: [], owner, canAct: true, moved: false, attacked: false, smokeBroken: false
});

describe('yantras', () => {
  it('Vighna destroys a unit as it is deployed, and is consumed', () => {
    const st = mk();
    st.players[1].yantras.push({ cardId: 'y_vighna', uid: 999 });
    st.players[0].hand.unshift('n_padati'); st.players[0].kosha = 10;
    const before = allUnits(st, 0).length;
    expect(applyAction(st, { type: 'play', handIndex: 0 }).ok).toBe(true);
    expect(allUnits(st, 0).length).toBe(before);
    expect(st.players[1].yantras.length).toBe(0);
  });
  it('Kavach prevents 4 damage to the Durg', () => {
    const st = mk();
    st.players[1].yantras.push({ cardId: 'y_kavach', uid: 998 });
    st.front.owner = 0; st.front.units = [unit(5000, 'n_atirathi', 0, 6, 5)];
    st.players[0].kosha = 10;
    const hp = st.players[1].hq.hp;
    applyAction(st, { type: 'attack', uid: 5000, target: { kind: 'hq', owner: 1 } });
    expect(hp - st.players[1].hq.hp).toBe(2);
  });
  it('Pratikar punishes the attacker', () => {
    const st = mk();
    st.players[1].yantras.push({ cardId: 'y_pratikar', uid: 997 });
    st.front.owner = 0; st.front.units = [unit(6000, 'n_gaja', 0, 4, 5)];
    st.players[1].support = [unit(6001, 'n_gaja', 1, 4, 5)];
    st.players[0].kosha = 10;
    applyAction(st, { type: 'attack', uid: 6000, target: { kind: 'unit', owner: 1, uid: 6001 } });
    expect(findUnit(st, 0, 6000)).toBeNull();
  });
});

describe('orders, upgrades, events', () => {
  it('Agni Baan deals 5 and kills', () => {
    const st = mk();
    st.players[1].support = [unit(7000, 'n_gaja', 1, 4, 5)];
    st.players[0].hand.unshift('s_agni'); st.players[0].kosha = 12;
    expect(applyAction(st, { type: 'play', handIndex: 0, target: { kind: 'unit', owner: 1, uid: 7000 } }).ok).toBe(true);
    expect(findUnit(st, 1, 7000)).toBeNull();
  });
  it('upgrades add +1/+1 per level', () => {
    const st = newGame({ player: { empire: 'maurya', ally: 'gupta', deck: ['n_gaja'], upgrades: { n_gaja: 2 } }, enemy: { empire: 'rajput', deck: ['n_padati'] }, seed: 5 });
    st.players[0].hand = ['n_gaja']; st.players[0].kosha = 12;
    applyAction(st, { type: 'play', handIndex: 0 });
    const u = allUnits(st, 0)[0].unit;
    expect([u.atk, u.hp]).toEqual([6, 7]);
  });
  it('emits a deploy event and drains it', () => {
    const st = mk();
    st.players[0].hand.unshift('n_padati'); st.players[0].kosha = 10;
    drainEvents(st);
    applyAction(st, { type: 'play', handIndex: 0 });
    expect(drainEvents(st).some(e => e.t === 'deploy')).toBe(true);
    expect(drainEvents(st).length).toBe(0);
  });
});

describe('meta progression', () => {
  it('awards Kirti and buys upgrades, persisting through the store', () => {
    const m = new Map<string, string>();
    const store: Store = { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v); } };
    const meta = new Meta(store);
    meta.award(100);
    expect(meta.upgrade('n_gaja').ok).toBe(true);
    expect(meta.kirti()).toBe(40);
    expect(new Meta(store).level('n_gaja')).toBe(1);
  });
});
