/* ============================================================
   Battle 3 of the Maurya campaign — "The Kalinga War": Ashoka's
   conquest of Kalinga, c. 261 BCE (Major Rock Edict XIII is the only
   source; the king of Kalinga is not named, so the enemy has no hero).
   Decks are in src/data/decks.json ("kalinga").
   The Kalinga side defends: sturdy elephants (Raksha), steady foot,
   hill archers and The Daya in Spate (damage to the whole front).
   The Maurya side wins by weight and by Ashoka's +1 attack, and has
   the Rock Edict (heal + Dharma) for the day after.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('kalinga');

export const KALINGA = {
  id: 'kalinga',
  title: 'The Kalinga War',
  place: 'The Daya, below Dhauli',
  year: 'c. 261 BCE',
  battlefield: 'dhauli',
  briefing: 'Ashoka has been emperor for eight years, and Kalinga, rich in ports and elephants, has never bowed to Pataliputra. Its elephants are the best in India and its people will defend their own coast. Break the line, but remember that every unit you spend is a family somewhere. Win this one, and then decide what winning is for.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 26,
  enemyStartKosha: 2
};

export function kalingaGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'maurya', ally: 'neutral', deck: KALINGA.playerDeck, hq: 24, faction: 'Maurya', capital: 'Pataliputra', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: KALINGA.enemyDeck, hq: KALINGA.enemyHq, startKosha: KALINGA.enemyStartKosha, faction: 'Kalinga', capital: 'Tosali' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: KALINGA.id,
    scenarioName: KALINGA.title,
    rules: 'yuddh',
    season
  });
}

export const KALINGA_SCENARIO: Scenario = {
  ...KALINGA,
  objective: 'Break the Kalinga line before they break your Durg.',
  heroCard: 'm_ashoka',
  defeatCard: 'kl_gaja',
  enemyName: 'Kalinga army',
  durgArt: ['durg_maurya_camp', 'durg_tosali'],
  winText: turn => `Kalinga falls in turn ${turn}. Ashoka walks the field afterwards, and the edict he orders cut will say that he is sorry.`,
  loseText: 'The Kalinga line holds the river. Pataliputra will have to ask itself whether this war was worth fighting.',
  goLabel: 'To battle',
  nextId: 'digvijaya',
  nextLabel: 'The Digvijaya',
  game: seed => kalingaGame(seed, 'normal')
};
