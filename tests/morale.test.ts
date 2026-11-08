/* Morale and rout (Yuddh rules): who breaks, where they flee, when they rally. */
import { describe, expect, it } from 'vitest';
import { applyAction, buildDeck, drainEvents, findUnit, newGame, type Unit } from '../src/engine';

const mk = () => newGame({
  player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') },
  enemy: { empire: 'neutral', ally: 'neutral', deck: buildDeck('neutral', 'neutral') },
  seed: 3, rules: 'yuddh', season: 'sharad'
});
const unit = (uid: number, cardId: string, owner: 0 | 1, atk: number, hp: number, maxHp = hp, extra: Partial<Unit> = {}): Unit => ({
  uid, cardId, name: cardId, sub: '', glyph: '', empire: 'neutral', atk, hp, maxHp, op: 1,
  range: 'melee', kw: [], owner, canAct: true, moved: false, attacked: false, smokeBroken: false, ...extra
});
/** player 0's `attacker` on the Yudhbhumi against player 1's `defender` on the Yudhbhumi-facing Rajya line */
function duel(attacker: Unit, defender: Unit) {
  const st = mk();
  st.players[0].kosha = 10;
  st.front.owner = 0; st.front.units = [attacker];
  st.players[1].support = [defender];
  drainEvents(st);
  return st;
}

describe('rout', () => {
  it('a defender that survives a blow down to a third of its health breaks', () => {
    // 9 health: the line is 3. A 6-damage blow leaves 3.
    const st = duel(unit(1, 'n_padati', 0, 6, 9), unit(2, 'm_padati', 1, 1, 9));
    expect(applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } }).ok).toBe(true);
    const d = findUnit(st, 1, 2)!.unit;
    expect(d.routed).toBe(1);
    expect(d.canAct).toBe(false);
    expect(drainEvents(st).some(e => e.t === 'rout' && e.uid === 2)).toBe(true);
  });
  it('a blow that leaves it above the line does not break it', () => {
    const st = duel(unit(1, 'n_padati', 0, 5, 9), unit(2, 'm_padati', 1, 1, 9));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 1, 2)!.unit.routed).toBeUndefined();
  });
  it('a unit already below the line cannot break again by being hit again', () => {
    const st = duel(unit(1, 'n_padati', 0, 1, 9), unit(2, 'm_padati', 1, 1, 3, 9));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 1, 2)!.unit.routed).toBeUndefined();
  });
  it('a broken unit on the Yudhbhumi flees to its Rajya line, and the line is left empty', () => {
    const st = mk();
    st.players[1].kosha = 10; st.active = 1;
    const mine = unit(1, 'n_padati', 0, 6, 9);
    const theirs = unit(2, 'm_padati', 1, 1, 9);
    st.front.owner = 1; st.front.units = [theirs];
    st.players[0].support = [mine]; // player 0 shoots from the Rajya line
    mine.range = 'ranged';
    st.active = 0; st.players[0].kosha = 10;
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(st.front.owner).toBeNull();
    expect(st.front.units.length).toBe(0);
    expect(st.players[1].support.some(u => u.uid === 2 && u.routed === 1)).toBe(true);
    expect(drainEvents(st).some(e => e.t === 'rout' && e.fled)).toBe(true);
  });
  it('with a full Rajya line a broken unit cannot flee but still loses its turn', () => {
    const st = mk();
    const theirs = unit(2, 'm_padati', 1, 1, 9);
    st.front.owner = 1; st.front.units = [theirs];
    st.players[1].support = [unit(11, 'n_padati', 1, 1, 1), unit(12, 'n_padati', 1, 1, 1), unit(13, 'n_padati', 1, 1, 1), unit(14, 'n_padati', 1, 1, 1)];
    const mine = unit(1, 'n_padati', 0, 6, 9, 9, { range: 'ranged' });
    st.players[0].support = [mine]; st.players[0].kosha = 10;
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(st.front.units.some(u => u.uid === 2 && u.routed === 1)).toBe(true);
    expect(drainEvents(st).some(e => e.t === 'rout' && !e.fled)).toBe(true);
  });
  it('a routed unit takes no action in its next turn, then rallies the turn after', () => {
    const st = duel(unit(1, 'n_padati', 0, 6, 9), unit(2, 'm_padati', 1, 1, 9));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    applyAction(st, { type: 'end' });                                 // player 1's turn: it rests
    let u = findUnit(st, 1, 2)!.unit;
    expect(u.routed).toBe(2); expect(u.canAct).toBe(false);
    applyAction(st, { type: 'end' }); applyAction(st, { type: 'end' }); // player 1's following turn: it rallies
    u = findUnit(st, 1, 2)!.unit;
    expect(u.routed).toBeUndefined(); expect(u.canAct).toBe(true);
  });
  it('a routed unit strikes no counter-blow, and cutting it down earns no Dharma', () => {
    const st = duel(unit(1, 'n_padati', 0, 2, 9), unit(2, 'm_padati', 1, 4, 2, 9, { routed: 2, canAct: false }));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 1, 2)).toBeNull();
    expect(findUnit(st, 0, 1)!.unit.hp).toBe(10);         // untouched (9) +1 for promotion: no counter-blow
    expect(st.players[0].dharma ?? 0).toBe(0);             // no fair fight
  });
  it('the attacker breaks too if the counter-blow leaves it low and it did not win', () => {
    const st = duel(unit(1, 'n_padati', 0, 1, 9), unit(2, 'm_padati', 1, 6, 20));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 0, 1)!.unit.routed).toBe(1);
  });
  it('a unit that destroys its foe does not break from the counter-blow', () => {
    const st = duel(unit(1, 'n_padati', 0, 3, 9), unit(2, 'm_padati', 1, 6, 3));
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    const a = findUnit(st, 0, 1)!.unit;
    expect(a.hp).toBe(4);                                  // 3 left, +1 for promotion
    expect(a.routed).toBeUndefined();
  });
});

describe('who never breaks', () => {
  const blow = (defender: Unit, extraFriends: Unit[] = []) => {
    const st = duel(unit(1, 'n_padati', 0, 6, 9), defender);
    st.players[1].support.push(...extraFriends);
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: defender.uid } });
    return findUnit(st, 1, defender.uid)!.unit;
  };
  it('Raksha shield-walls stand', () => {
    expect(blow(unit(2, 'n_rakshak', 1, 1, 9, 9, { kw: ['raksha'] })).routed).toBeUndefined();
  });
  it('Mahaveer (twice-honoured) units stand', () => {
    expect(blow(unit(2, 'm_padati', 1, 1, 9, 9, { rank: 2 })).routed).toBeUndefined();
  });
  it('the army of a standard-bearer stands', () => {
    expect(blow(unit(2, 'm_padati', 1, 1, 9), [unit(3, 'm_raja_dhwaja', 1, 1, 3)]).routed).toBeUndefined();
  });
  it('an army at full Dharma stands', () => {
    const st = duel(unit(1, 'n_padati', 0, 6, 9), unit(2, 'm_padati', 1, 1, 9));
    st.players[1].dharma = 3;
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 1, 2)!.unit.routed).toBeUndefined();
  });
  it('the classic ruleset has no morale at all', () => {
    const st = newGame({ player: { empire: 'maurya', ally: 'neutral', deck: buildDeck('maurya', 'neutral') }, enemy: { empire: 'neutral', ally: 'neutral', deck: buildDeck('neutral', 'neutral') }, seed: 3 });
    st.players[0].kosha = 10; st.front.owner = 0; st.front.units = [unit(1, 'n_padati', 0, 6, 9)];
    st.players[1].support = [unit(2, 'm_padati', 1, 1, 9)];
    applyAction(st, { type: 'attack', uid: 1, target: { kind: 'unit', owner: 1, uid: 2 } });
    expect(findUnit(st, 1, 2)!.unit.routed).toBeUndefined();
  });
});
