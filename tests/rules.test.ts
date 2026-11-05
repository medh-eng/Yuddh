/* Card-mechanics checks, ported from the prototype's yantra-test.js. */
import { describe, expect, it } from 'vitest';
import { allUnits, applyAction, buildDeck, canAttack, canMove, drainEvents, findUnit, newGame, type Unit } from '../src/engine';
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

describe('Yuddh rules (The First Throne onward)', () => {
  const mkY = () => newGame({
    player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') },
    enemy: { empire: 'rajput', ally: 'neutral', deck: buildDeck('rajput', 'neutral') },
    seed: 12, rules: 'yuddh'
  });
  it('a Raksha on the enemy Rajya line guards the Durg until it falls', () => {
    const st = mkY();
    st.front.owner = 0; st.front.units = [unit(7000, 'n_padati', 0, 3, 3)];
    st.players[1].support = [{ ...unit(7001, 'n_rakshak', 1, 1, 4), kw: ['raksha'] }];
    st.players[0].kosha = 10;
    expect(canAttack(st, 0, 7000, { kind: 'hq', owner: 1 }).ok).toBe(false);
    st.players[1].support = [];
    expect(canAttack(st, 0, 7000, { kind: 'hq', owner: 1 }).ok).toBe(true);
  });
  it('classic rules still let a unit pass the Raksha (golden traces)', () => {
    const st = mk();
    st.front.owner = 0; st.front.units = [unit(7100, 'n_padati', 0, 3, 3)];
    st.players[1].support = [{ ...unit(7101, 'n_rakshak', 1, 1, 4), kw: ['raksha'] }];
    st.players[0].kosha = 10;
    expect(canAttack(st, 0, 7100, { kind: 'hq', owner: 1 }).ok).toBe(true);
  });
  it('foot units either advance or attack in a turn; cavalry and chariots can do both', () => {
    const st = mkY();
    st.players[0].kosha = 10;
    st.players[0].support = [unit(7200, 'n_padati', 0, 2, 2), unit(7201, 'n_ashvarohi', 0, 2, 2)];
    expect(applyAction(st, { type: 'move', uid: 7200 }).ok).toBe(true);
    expect(applyAction(st, { type: 'move', uid: 7201 }).ok).toBe(true);
    expect(canAttack(st, 0, 7200, { kind: 'hq', owner: 1 }).ok).toBe(false);
    expect(canAttack(st, 0, 7201, { kind: 'hq', owner: 1 }).ok).toBe(true);
  });
  it('a unit that attacked cannot then advance', () => {
    const st = mkY();
    st.players[0].kosha = 10;
    st.players[0].support = [{ ...unit(7300, 'n_dhanurdhar', 0, 1, 2), range: 'ranged' }];
    st.front.owner = 1; st.front.units = [unit(7301, 'n_padati', 1, 1, 9)];
    expect(applyAction(st, { type: 'attack', uid: 7300, target: { kind: 'unit', owner: 1, uid: 7301 } }).ok).toBe(true);
    st.front = { owner: null, units: [] };
    expect(canMove(st, 0, 7300).ok).toBe(false);
  });
  it('a unit that destroys an enemy and survives is promoted, twice at most', () => {
    const st = mkY();
    st.players[0].kosha = 10;
    st.front.owner = 0; st.front.units = [unit(7400, 'n_padati', 0, 3, 9)];
    st.players[1].support = [unit(7401, 'n_padati', 1, 1, 1)];
    expect(applyAction(st, { type: 'attack', uid: 7400, target: { kind: 'unit', owner: 1, uid: 7401 } }).ok).toBe(true);
    const u = findUnit(st, 0, 7400)!.unit;
    expect([u.rank, u.atk, u.maxHp]).toEqual([1, 3, 10]);
    expect(drainEvents(st).some(e => e.t === 'promote')).toBe(true);
  });
});

describe('war elephants (Yuddh rules)', () => {
  it('a war elephant that crushes a unit tramples the leftover damage into the Durg', () => {
    const st = newGame({
      player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') },
      enemy: { empire: 'rajput', ally: 'neutral', deck: buildDeck('rajput', 'neutral') },
      seed: 21, rules: 'yuddh'
    });
    st.players[0].kosha = 10;
    st.front.owner = 0; st.front.units = [unit(7500, 'n_gaja', 0, 4, 5)];
    st.players[1].support = [unit(7501, 'n_padati', 1, 1, 1)];
    const hq = st.players[1].hq.hp;
    expect(applyAction(st, { type: 'attack', uid: 7500, target: { kind: 'unit', owner: 1, uid: 7501 } }).ok).toBe(true);
    expect(st.players[1].hq.hp).toBe(hq - 3);
  });
});

describe('seasons (Yuddh rules)', () => {
  const mkS = (season: 'sharad' | 'varsha' | 'grishma' | 'hemanta') => newGame({
    player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') },
    enemy: { empire: 'rajput', ally: 'neutral', deck: buildDeck('rajput', 'neutral') },
    seed: 33, rules: 'yuddh', season
  });
  it('Varsha mud stops cavalry charging', () => {
    const st = mkS('varsha');
    st.players[0].kosha = 10;
    st.players[0].support = [unit(7600, 'n_ashvarohi', 0, 2, 2)];
    expect(applyAction(st, { type: 'move', uid: 7600 }).ok).toBe(true);
    expect(canAttack(st, 0, 7600, { kind: 'hq', owner: 1 }).ok).toBe(false);
  });
  it('Grishma heat haze blunts archers by 1', () => {
    const st = mkS('grishma');
    st.players[0].kosha = 10;
    st.players[0].support = [{ ...unit(7700, 'n_dhanurdhar', 0, 3, 2), range: 'ranged' }];
    st.front.owner = 1; st.front.units = [unit(7701, 'n_padati', 1, 1, 9)];
    expect(applyAction(st, { type: 'attack', uid: 7700, target: { kind: 'unit', owner: 1, uid: 7701 } }).ok).toBe(true);
    expect(findUnit(st, 1, 7701)!.unit.hp).toBe(7);
  });
  it('Hemanta fills each treasury with one extra Kosha', () => {
    const st = mkS('hemanta');
    expect(st.players[0].kosha).toBe(st.players[0].maxKosha + 1);
  });
});

describe('batch 3 cards (Yuddh rules)', () => {
  const mkB = () => newGame({
    player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') },
    enemy: { empire: 'rajput', ally: 'neutral', deck: buildDeck('rajput', 'neutral') },
    seed: 44, rules: 'yuddh'
  });
  it('the new cards never enter buildDeck (golden traces untouched)', () => {
    const d = [...buildDeck('maurya', 'neutral'), ...buildDeck('neutral', 'maurya')];
    expect(d.some(id => id.startsWith('nd_') || ['m_parvataka', 'm_garuda_vyuha', 'm_makara_vyuha', 'm_raja_dhwaja', 'm_shalya_vaidya', 'm_hastipaka'].includes(id))).toBe(false);
  });
  it('a standard-bearer gives comrades on the Yudhbhumi +1 damage', () => {
    const st = mkB();
    st.players[0].kosha = 10;
    st.players[0].support = [unit(8000, 'm_raja_dhwaja', 0, 1, 3)];
    st.front.owner = 0; st.front.units = [unit(8001, 'n_padati', 0, 1, 9)];
    st.players[1].support = [unit(8002, 'n_padati', 1, 0, 9)];
    expect(applyAction(st, { type: 'attack', uid: 8001, target: { kind: 'unit', owner: 1, uid: 8002 } }).ok).toBe(true);
    expect(findUnit(st, 1, 8002)!.unit.hp).toBe(7);
  });
  it('Garuda Vyuha lets foot soldiers advance and attack in one turn', () => {
    const st = mkB();
    st.players[0].kosha = 10;
    st.players[0].support = [unit(8100, 'n_padati', 0, 2, 2)];
    st.players[0].hand = ['m_garuda_vyuha'];
    expect(applyAction(st, { type: 'play', handIndex: 0, target: null }).ok).toBe(true);
    expect(applyAction(st, { type: 'move', uid: 8100 }).ok).toBe(true);
    expect(canAttack(st, 0, 8100, { kind: 'hq', owner: 1 }).ok).toBe(true);
  });
  it('the timber walls blunt a Durg strike and shoot back', () => {
    const st = mkB();
    st.players[0].kosha = 10;
    st.front.owner = 0; st.front.units = [unit(8200, 'n_padati', 0, 5, 9)];
    st.players[1].yantras = [{ cardId: 'nd_kashtha_prakara', uid: 8201 }];
    const hq = st.players[1].hq.hp;
    expect(applyAction(st, { type: 'attack', uid: 8200, target: { kind: 'hq', owner: 1 } }).ok).toBe(true);
    expect(st.players[1].hq.hp).toBe(hq - 2);
    expect(findUnit(st, 0, 8200)!.unit.hp).toBe(7);
  });
  it('an army surgeon heals the most wounded unit at the start of the turn', () => {
    const st = mkB();
    st.players[0].support = [unit(8300, 'm_shalya_vaidya', 0, 0, 3), { ...unit(8301, 'n_padati', 0, 1, 1), maxHp: 5 }];
    applyAction(st, { type: 'end' });
    st.players[1].support = []; st.front = { owner: null, units: [] };
    applyAction(st, { type: 'end' });
    expect(findUnit(st, 0, 8301)!.unit.hp).toBe(3);
  });
});
