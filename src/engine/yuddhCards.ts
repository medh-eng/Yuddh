/* ============================================================
   Cards made for YUDDH (Phase 2 onward), painted by Pon in batch 3.
   Kept apart from CARD_LIST (the prototype's 50 cards), so buildDeck()
   and the 154 golden traces never see them; they join the CARDS lookup
   and are used by hand-built decks (The First Throne). Their rules
   only exist under the Yuddh ruleset.
   ============================================================ */
import type { CardDef } from './types';

export const YUDDH_CARD_LIST: CardDef[] = [
  // ---- the Nanda court (the enemy in The First Throne) ----
  { id: 'nd_dhana_nanda', name: 'Dhana Nanda', sub: 'King of Magadha', empire: 'neutral', type: 'unit', cost: 7, op: 2, atk: 4, hp: 7, range: 'melee', kw: ['raksha'],
    glyph: 'ध', text: 'Raksha. Deploy — gain 2 Kosha from the royal hoard.', deploy: 'kosha2', rarity: 'legendary' },
  { id: 'nd_amatya_rakshasa', name: 'Amatya Rakshasa', sub: 'Minister', empire: 'neutral', type: 'unit', cost: 4, op: 1, atk: 2, hp: 4, range: 'melee',
    glyph: 'रा', text: 'Deploy — set a Pratikar Yantra, face down, at no cost.', deploy: 'setYantra', rarity: 'epic' },
  { id: 'nd_gaja_sena', name: 'Gaja Sena', sub: 'War Elephant', empire: 'neutral', type: 'unit', cost: 5, op: 2, atk: 4, hp: 6, range: 'melee', kw: ['raksha'],
    glyph: 'ग', text: 'Raksha. Tramples: a crushed unit\'s spare damage falls on the Durg.', rarity: 'rare' },
  { id: 'nd_ratha_dal', name: 'Ratha Dal', sub: 'Chariot', empire: 'neutral', type: 'unit', cost: 4, op: 1, atk: 3, hp: 3, range: 'melee', kw: ['veg'],
    glyph: 'र', text: 'Vega. Charges: advance and strike in one turn.', rarity: 'common' },
  { id: 'nd_nanda_kosha', name: 'Nanda Kosha', sub: 'Royal Treasury', empire: 'neutral', type: 'order', cost: 1,
    glyph: 'को', text: 'Gain 3 Kosha this turn.', rarity: 'rare' },
  { id: 'nd_kashtha_prakara', name: 'Kashtha Prakara', sub: 'Timber Walls', empire: 'neutral', type: 'yantra', kind: 'yantra', cost: 2,
    glyph: 'प्रा', trigger: 'onHQAttack', power: 3, text: 'Yantra — when the enemy attacks your Durg, prevent 3 damage and deal 2 to the attacker.', rarity: 'rare' },
  // ---- Maurya heroes and formations ----
  { id: 'm_parvataka', name: 'Parvataka', sub: 'Mountain King', empire: 'maurya', type: 'unit', cost: 5, op: 2, atk: 4, hp: 5, range: 'melee', kw: ['raksha'],
    glyph: 'प', text: 'Raksha. Deploy — his hillmen deal 1 damage to every enemy on the Yudhbhumi.', deploy: 'hillVolley', rarity: 'epic' },
  { id: 'm_garuda_vyuha', name: 'Garuda Vyuha', sub: 'Eagle Formation', empire: 'maurya', type: 'order', cost: 4,
    glyph: 'ग', text: 'Your units get +1 attack, and this turn every one of them may advance and attack.', rarity: 'epic' },
  { id: 'm_makara_vyuha', name: 'Makara Vyuha', sub: 'Crocodile Formation', empire: 'maurya', type: 'order', cost: 3,
    glyph: 'म', text: 'Your units on the Yudhbhumi get +2 health (if you hold none there, your Rajya line gets +1).', rarity: 'rare' },
  { id: 'm_raja_dhwaja', name: 'Raja Dhwaja', sub: 'Standard-bearer', empire: 'maurya', type: 'unit', cost: 2, op: 1, atk: 1, hp: 3, range: 'melee',
    glyph: 'ध्व', text: 'Morale — while he stands, your other units on the Yudhbhumi deal +1 damage.', rarity: 'rare' },
  { id: 'm_shalya_vaidya', name: 'Shalya Vaidya', sub: 'Army Surgeon', empire: 'maurya', type: 'unit', cost: 2, op: 1, atk: 0, hp: 3, range: 'ranged',
    glyph: 'वै', text: 'At the start of your turn, heal 2 health on your most wounded unit.', rarity: 'rare' },
  { id: 'm_hastipaka', name: 'Hastipaka', sub: 'Mahout', empire: 'maurya', type: 'unit', cost: 2, op: 1, atk: 1, hp: 2, range: 'melee',
    glyph: 'ह', text: 'Deploy — your elephants get +1 attack and +1 health.', deploy: 'elephantBuff', rarity: 'common' }
];
