/* ============================================================
   Chola campaign, "The Ganga Road" — battle 2.
   About 1019–22 CE a Chola army marched north through Kalinga into
   Bengal and beat Mahipala I of the Pala empire, then carried Ganga
   water south. The general Araiyan Rajarajan led it; Rajendra waited
   on the Godavari. Rajendra's inscriptions name the kings beaten but
   not the fights, so the battle is invented, and the conquests were
   not kept. Decks: src/data/decks.json ("ganga"). Paintings:
   art/PROMPTS-BATCH10.md.
   The Chola side is fast and ranged (Naval Supremacy passive, bodyguard
   Raksha, Araiyan rallying a line, Ganga Jal healing); the Pala side has
   the home ground: elephants that trample, river-boat archers, teachers
   who keep its hand full and a monsoon flood.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('ganga');

export const GANGA = {
  id: 'ganga',
  title: 'The Ganga Road',
  place: 'The Ganga, Bengal',
  year: 'c. 1021 CE',
  battlefield: 'ganga',
  briefing: "The emperor has stayed behind on the Godavari; the army is yours. You have marched through Kalinga and Odisha and beaten a king at every river, and now the Ganga lies ahead with Mahipala of the Palas on its bank: elephants at the water's edge, archers in long boats, monasteries full of teachers and a monsoon about to break. Strike fast and keep your healers close. You are not here to rule Bengal. You are here to fill the bronze pots and carry the river home.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 26,
  enemyStartKosha: 1
};

export function gangaGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'chola', ally: 'neutral', deck: GANGA.playerDeck, hq: 24, faction: 'Chola', capital: 'Gangaikonda Cholapuram', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: GANGA.enemyDeck, hq: GANGA.enemyHq, startKosha: GANGA.enemyStartKosha, faction: 'Pala', capital: 'Gauda' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: GANGA.id,
    scenarioName: GANGA.title,
    rules: 'yuddh',
    season
  });
}

export const GANGA_SCENARIO: Scenario = {
  ...GANGA,
  objective: "Break Mahipala's river line and reach the Ganga.",
  heroCard: 'ch_araiyan',
  defeatCard: 'pl_mahipala',
  enemyName: 'Pala host',
  durgArt: ['durg_gangaikonda', 'durg_pala'],
  winText: turn => `Mahipala is beaten in turn ${turn}. The pots are filled at the Ganga, and the army turns south with the water. The inscription names no more than that.`,
  loseText: 'The elephants hold the bank and the monsoon closes the river. The army turns back with empty pots.',
  goLabel: 'To battle',
  game: seed => gangaGame(seed, 'normal')
};
