/* ============================================================
   Chola campaign, "Rajendra's Sea Road" — battle 1: Kadaram.
   About 1025 CE Rajendra I sent a fleet across the Bay of Bengal
   against Sangrama Vijayottungavarman of Kadaram (Kedah), a port of
   the Srivijaya realm. The Chola inscriptions (Rajendra's own
   Tamil prasasti, c. 1026) say the king was captured; why it happened
   is argued, and Srivijaya's side is hardly recorded, so the fight
   itself is invented. Decks are in src/data/decks.json ("kadaram").
   The Chola player has the Naval Supremacy passive (ranged +1 attack):
   archers, marines and warships, a merchant-guild guard that pays its
   way, and Rajendra at the prow (+1 attack to all). Kadaram answers
   with a wall of lashed boats, harbour archers, a captain who rallies
   his line, a rich king and fire boats. Paintings: art/PROMPTS-BATCH9.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('kadaram');

export const KADARAM = {
  id: 'kadaram',
  title: "Rajendra's Sea Road",
  place: 'Kadaram',
  year: 'c. 1025 CE',
  battlefield: 'kadaram',
  briefing: "Rajendra has built a new capital and a new road, and the road is the sea. Across the Bay of Bengal lies Kadaram, the harbour of a rich trading realm: piers, warehouses, a tiered tower and a wall of lashed boats. Its king is no pirate; his ships have carried the strait's wealth for generations. Your ranged ships rule the water, but a harbour is a wall of its own. Break the boats, answer the fire ships, and bring the king of Kadaram back as the inscriptions say you did.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 26,
  enemyStartKosha: 1
};

export function kadaramGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'chola', ally: 'neutral', deck: KADARAM.playerDeck, hq: 24, faction: 'Chola', capital: 'Gangaikonda Cholapuram', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: KADARAM.enemyDeck, hq: KADARAM.enemyHq, startKosha: KADARAM.enemyStartKosha, faction: 'Kadaram', capital: 'Kadaram' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: KADARAM.id,
    scenarioName: KADARAM.title,
    rules: 'yuddh',
    season
  });
}

export const KADARAM_SCENARIO: Scenario = {
  ...KADARAM,
  objective: 'Break the boat wall and take the harbour of Kadaram.',
  heroCard: 'ch_rajendra',
  defeatCard: 'sv_sangrama',
  enemyName: 'Kadaram fleet',
  durgArt: ['durg_gangaikonda', 'durg_kadaram'],
  winText: turn => `Kadaram falls in turn ${turn}. The Chola inscriptions will say the king was taken with his elephants and his treasure; Kadaram's own voice is silent.`,
  loseText: 'The fire boats find the fleet. The Chola ships turn back across the Bay, and the sea road stays closed.',
  goLabel: 'To battle',
  nextId: 'koppam',
  nextLabel: 'Koppam',
  game: seed => kadaramGame(seed, 'normal')
};
