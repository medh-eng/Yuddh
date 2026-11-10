/* ============================================================
   What a card's words mean, for the reading panel beside a card
   held up for inspection (the way KARDS explains its keywords).
   Each entry is a bold heading, a short plain-language line, and
   an icon. Wording follows the Yuddh rules (src/engine/rules.ts).
   ============================================================ */
import { CARDS, EMPIRES, RANK_NAMES, isSteadfast, routLine, type GameState, type Season, type Unit } from '../../engine';

export type GlossIcon = 'charge' | 'foot' | 'ranged' | 'melee' | 'raksha' | 'veg' | 'rank' | 'deploy' | 'yantra'
  | 'shakti' | 'mantra' | 'kosha' | 'op' | 'empire' | 'wound';
export interface Gloss { icon: GlossIcon; title: string; body: string }

const CHARGES = new Set(['Cavalry', 'Chariot', 'Elite Chariot', 'Legendary Warrior']);

/** everything worth explaining about a card, most important first; `unit` adds its state on the board */
export function glossFor(cardId: string, unit?: Unit, cost?: number, season?: Season, turn?: number, state?: GameState): Gloss[] {
  const c = CARDS[cardId];
  if (!c) return [];
  const out: Gloss[] = [];
  if (c.type === 'unit') {
    if (unit && unit.hp < unit.maxHp) out.push({ icon: 'wound', title: `WOUNDED ${unit.hp} / ${unit.maxHp}`, body: 'Lost health does not come back.' });
    if (unit?.routed) out.push({ icon: 'wound', title: 'ROUTED', body: 'Broken and fleeing: it takes no action this turn, strikes no counter-blow, and rallies afterwards. Cutting it down earns no Dharma.' });
    else if (unit && state && state.rules === 'yuddh') out.push(isSteadfast(state, unit)
      ? { icon: 'raksha', title: 'STEADFAST', body: 'It will not break: a shield-wall, a hero, a twice-honoured veteran, or an army with its standard flying or at full Dharma.' }
      : { icon: 'wound', title: `MORALE: BREAKS AT ${routLine(unit)}`, body: `A blow that leaves it with ${routLine(unit)} health or less breaks it: it flees to the Rajya line and loses its next turn.` });
    if (unit?.rank) out.push({ icon: 'rank', title: RANK_NAMES[unit.rank].toUpperCase(), body: unit.rank >= 2 ? 'Honoured twice for valour: +1 attack and +2 health.' : 'Honoured for valour: +1 health. One more kill makes it Mahaveer (+1 attack).' });
    out.push(CHARGES.has(c.sub)
      ? { icon: 'charge', title: c.sub.toUpperCase(), body: season === 'varsha' ? 'Charges in dry weather; in the monsoon mud it must advance or attack, not both.' : 'Charges: can advance to the Yudhbhumi and attack in the same turn.' }
      : { icon: 'foot', title: c.sub.toUpperCase(), body: 'Each turn it advances or attacks, not both.' });
    out.push(c.range === 'ranged'
      ? { icon: 'ranged', title: 'RANGED', body: season === 'grishma' ? 'Shoots from either line and takes no counter-blow. Summer heat haze: deals 1 less damage.' : 'Shoots from either line and takes no counter-blow.' }
      : { icon: 'melee', title: 'MELEE', body: 'Trades blows with other melee units: both deal damage. Winning such a fight earns Dharma.' });
    if (/Elephant/.test(c.sub)) out.push({ icon: 'charge', title: 'TRAMPLE', body: 'When it crushes a unit, the damage it did not need falls on the enemy Durg.' });
    if (unit?.surge !== undefined && unit.surge === turn) out.push({ icon: 'charge', title: 'GARUDA VYUHA', body: 'The eagle formation: this turn it may advance and attack.' });
    if (c.id === 'm_raja_dhwaja') out.push({ icon: 'rank', title: 'MORALE', body: 'While he stands, your other units on the Yudhbhumi deal +1 damage, and none of your units will break.' });
    if (c.vsElephant) out.push({ icon: 'ranged', title: 'ELEPHANT-SHOOTERS', body: `Trained against the great beasts: deals ${c.vsElephant} extra damage to a War Elephant.` });
    if (c.reprisal) out.push({ icon: 'raksha', title: 'PIKES', body: `A melee unit that advanced this turn and strikes it takes ${c.reprisal} damage.` });
    if (c.id === 'm_shalya_vaidya') out.push({ icon: 'wound', title: 'SURGEON', body: 'At the start of your turn he heals 2 health on your most wounded unit.' });
    if (c.kw?.includes('raksha')) out.push({ icon: 'raksha', title: 'RAKSHA', body: 'Guard: must be struck first in its line, and on the Rajya line it shields the Durg.' });
    if (c.kw?.includes('veg')) out.push({ icon: 'veg', title: 'VEGA', body: 'Swift: can move or attack on the turn it is deployed.' });
    if (/^Deploy/i.test(c.text) || /Deploy —/.test(c.text)) out.push({ icon: 'deploy', title: 'DEPLOY', body: 'The effect happens once, when the card is played.' });
    if (!unit?.rank) out.push({ icon: 'rank', title: 'PROMOTION', body: 'Destroy an enemy and survive: Veer (+1 health), then Mahaveer (+1 attack, +1 health more).' });
    out.push({ icon: 'op', title: `ORDERS COST ${c.op ?? 1}`, body: `Advancing or attacking spends ${c.op ?? 1} Kosha (the bronze coin).` });
  } else if (c.type === 'yantra') {
    out.push({ icon: 'yantra', title: 'YANTRA', body: 'A hidden trap. It is set face-down and springs by itself when its moment comes. Setting one moves you toward Kuta.' });
  } else if (c.kind === 'shakti') {
    out.push({ icon: 'shakti', title: 'SHAKTI', body: 'A great power: a costly order that can turn a whole battle.' });
  } else {
    out.push({ icon: 'mantra', title: 'MANTRA', body: 'An order: it takes effect at once and is then spent.' });
  }
  if (c.id === 'n_visha_baan' || c.id === 'm_gudhchar') out.push({ icon: 'yantra', title: 'KUTA', body: 'Cunning, not honour: playing it moves you one step toward Kuta.' });
  const printed = c.cost;
  if (cost !== undefined && cost < printed) out.push({ icon: 'kosha', title: `KOSHA ${cost}, NOT ${printed}`, body: "Cheaper this turn: your empire's gift." });
  if (c.empire !== 'neutral') out.push({ icon: 'empire', title: EMPIRES[c.empire].name.toUpperCase(), body: EMPIRES[c.empire].passive });
  return out;
}
