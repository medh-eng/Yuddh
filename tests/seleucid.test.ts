/* Seleucid cards (The Indus Line) and the JSON data files. */
import { describe, expect, it } from 'vitest';
import { CARDS, applyAction, canMove, dharmaOf, findUnit, newGame, type Unit } from '../src/engine';
import { PENDING_CARDS, decksOf, expandDeck } from '../src/data';
import { INDUS_LINE_SCENARIO } from '../src/campaign/indusLine';
import { MAURYA_CAMPAIGN } from '../src/campaign/campaign';

const mkYuddh = () => newGame({
  player: { empire: 'maurya', deck: ['n_padati'], faction: 'Maurya' },
  enemy: { empire: 'neutral', deck: ['n_padati'], faction: 'Seleucid' },
  seed: 3, rules: 'yuddh', season: 'sharad'
});
const unit = (uid: number, cardId: string, owner: 0 | 1, atk: number, hp: number, o: Partial<Unit> = {}): Unit => ({
  uid, cardId, name: cardId, sub: CARDS[cardId]?.sub ?? '', glyph: '', empire: 'neutral', atk, hp, maxHp: hp, op: 1,
  range: 'melee', kw: [], owner, canAct: true, moved: false, attacked: false, smokeBroken: false, ...o
});

describe('Seleucid cards', () => {
  it('Pike Phalanx hurts a melee unit that advanced this turn and struck it', () => {
    const st = mkYuddh();
    st.players[0].kosha = 10;
    st.front.owner = 0; st.front.units = [unit(10, 'n_atirathi', 0, 6, 9, { moved: true })];
    st.players[1].support = [unit(11, 'se_phalanx', 1, 2, 20, { kw: ['raksha'] })];
    // Atirathi charges: takes the phalanx's 2 counter-blow plus 2 from the pikes
    st.front.units[0].moved = true;
    const res = applyAction(st, { type: 'attack', uid: 10, target: { kind: 'unit', owner: 1, uid: 11 } });
    // Atirathi is a charging class, so the attack is legal
    expect(res.ok).toBe(true);
    expect(findUnit(st, 0, 10)!.unit.hp).toBe(9 - 2 - CARDS.se_phalanx.reprisal!);
  });
  it('Pike Phalanx does not hurt a unit that stood still', () => {
    const st = mkYuddh();
    st.players[0].kosha = 10;
    st.front.owner = 0; st.front.units = [unit(10, 'n_atirathi', 0, 6, 9)];
    st.players[1].support = [unit(11, 'se_phalanx', 1, 2, 20, { kw: ['raksha'] })];
    applyAction(st, { type: 'attack', uid: 10, target: { kind: 'unit', owner: 1, uid: 11 } });
    expect(findUnit(st, 0, 10)!.unit.hp).toBe(9 - 2);
  });
  it('Lithobolos deals its damage to the unit and 1 to the Durg', () => {
    const st = mkYuddh();
    const p = st.players[0];
    p.hand = ['se_lithobolos']; p.kosha = 10;
    st.players[1].support = [unit(20, 'n_gaja', 1, 4, 5)];
    const hq = st.players[1].hq.hp;
    expect(applyAction(st, { type: 'play', handIndex: 0, target: { kind: 'unit', owner: 1, uid: 20 } }).ok).toBe(true);
    expect(findUnit(st, 1, 20)!.unit.hp).toBe(5 - CARDS.se_lithobolos.power!);
    expect(st.players[1].hq.hp).toBe(hq - CARDS.se_lithobolos.hqDamage!);
  });
  it('Megasthenes draws a card and moves one step toward Dharma', () => {
    const st = mkYuddh();
    const p = st.players[0];
    p.hand = ['se_megasthenes']; p.kosha = 10; p.deck = ['n_padati', 'n_padati'];
    applyAction(st, { type: 'play', handIndex: 0 });
    expect(p.hand.length).toBe(1);
    expect(dharmaOf(p)).toBe(1);
  });
  it('Hetairoi are cavalry: they charge', () => {
    const st = mkYuddh();
    st.players[0].kosha = 10;
    st.players[0].support = [unit(30, 'se_hetairoi', 0, 4, 3, { kw: ['veg'] })];
    expect(canMove(st, 0, 30).ok).toBe(true);
  });
});

describe('data files', () => {
  it('every deck in decks.json names existing cards, and expandDeck keeps order', () => {
    for (const id of ['training_ground', 'first_throne', 'indus_line']) {
      const d = decksOf(id);
      for (const c of [...d.player, ...d.enemy]) expect(CARDS[c], `${id}: ${c}`).toBeDefined();
    }
    expect(expandDeck(['a', 'b*2', 'c'])).toEqual(['a', 'b', 'b', 'c']);
  });
  it('cards waiting for art are not loaded by the engine', () => {
    for (const c of PENDING_CARDS) expect(CARDS[c.id], c.id).toBeUndefined();
  });
  it('the campaign runs Training Ground → First Throne → Indus Line', () => {
    expect(MAURYA_CAMPAIGN.map(n => n.scenario.id)).toEqual(['training_ground', 'first_throne', 'indus_line']);
    expect(MAURYA_CAMPAIGN[0].scenario.nextId).toBe('first_throne');
    expect(MAURYA_CAMPAIGN[1].scenario.nextId).toBe('indus_line');
    expect(INDUS_LINE_SCENARIO.nextId).toBeUndefined();
  });
});
