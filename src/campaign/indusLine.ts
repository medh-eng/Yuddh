/* ============================================================
   Battle 2 of the Maurya campaign — "The Indus Line": Chandragupta
   against Seleucus Nicator, c. 305 BCE. Seleucus, Alexander's
   general, crossed toward the Indus to win back the provinces Alexander
   had taken; the war ended in a treaty and five hundred elephants.
   Decks are in src/data/decks.json ("indus_line").
   The enemy is a hedge of pikes (se_phalanx punishes anything that
   advances and strikes it), Companion cavalry, hired archers and
   stone-throwers: slow to start, hard to charge. The answer is
   elephants, orders and patience.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('indus_line');

export const INDUS_LINE = {
  id: 'indus_line',
  title: 'The Indus Line',
  place: 'The Indus',
  year: 'c. 305 BCE',
  battlefield: 'indus',
  briefing: 'Alexander is dead, and his general Seleucus has come east to take back the provinces beyond the Indus. His phalanx is a wall of iron pikes; do not run onto it. Hold the fords, let the elephants speak, and make Seleucus bargain.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 24,
  enemyStartKosha: 1
};

export function indusLineGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'maurya', ally: 'neutral', deck: INDUS_LINE.playerDeck, hq: 24, faction: 'Maurya', capital: 'Sindhu Kotta', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: INDUS_LINE.enemyDeck, hq: INDUS_LINE.enemyHq, startKosha: INDUS_LINE.enemyStartKosha, faction: 'Seleucid', capital: 'the Seleucid camp' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: INDUS_LINE.id,
    scenarioName: INDUS_LINE.title,
    rules: 'yuddh',
    season
  });
}

export const INDUS_LINE_SCENARIO: Scenario = {
  ...INDUS_LINE,
  objective: 'Destroy the Seleucid camp before they destroy Sindhu Kotta.',
  heroCard: 'm_chandragupta',
  defeatCard: 'se_seleucus',
  enemyName: 'Seleucid army',
  durgArt: ['durg_sindhu_kotta', 'durg_seleucid_camp'],
  winText: turn => `Seleucus asks for terms in turn ${turn}. The Indus becomes the border, and five hundred elephants cross it westward.`,
  loseText: 'The pikes hold the river. Seleucus keeps the western provinces, and Chanakya begins again.',
  goLabel: 'To battle',
  nextId: 'golden_age',
  nextLabel: 'The Golden Age',
  game: seed => indusLineGame(seed, 'normal')
};
