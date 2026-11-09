/* ============================================================
   Battle 1 of the Gupta campaign — "The Golden Age": Chandragupta II
   (Vikramaditya) against the last Western Kshatrapa king, Rudrasimha III,
   at Ujjain, c. 400 CE. Decks are in src/data/decks.json ("golden_age").
   The Satraps are cheap, fast and fragile (horse-archers, lancers, silver
   for Kosha, a desert storm that hits every unit); the Gupta win with
   court and craft (Navaratna and Swarn Yug draw cards, Kalidasa and the
   Pandits too, and the Iron Pillar wards the Durg). The Gupta passive,
   "the first Mantra you cast each turn draws a card", feeds on it.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('golden_age');

export const GOLDEN_AGE = {
  id: 'golden_age',
  title: 'The Golden Age',
  place: 'Ujjain',
  year: 'c. 400 CE',
  battlefield: 'ujjain',
  briefing: 'The Western Satraps have raided the Malwa border for three hundred years, and their horse-archers are faster than any levy. But this is an age of academies and endowments: your court draws cards where theirs draws silver. Weather the arrows, hold the line, and make Ujjain the second capital of the empire.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 22,
  enemyStartKosha: 1
};

export function goldenAgeGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'gupta', ally: 'neutral', deck: GOLDEN_AGE.playerDeck, hq: 24, faction: 'Gupta', capital: 'Ujjain', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: GOLDEN_AGE.enemyDeck, hq: GOLDEN_AGE.enemyHq, startKosha: GOLDEN_AGE.enemyStartKosha, faction: 'Western Kshatrapas', capital: 'the Satrap stronghold' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: GOLDEN_AGE.id,
    scenarioName: GOLDEN_AGE.title,
    rules: 'yuddh',
    season
  });
}

export const GOLDEN_AGE_SCENARIO: Scenario = {
  ...GOLDEN_AGE,
  objective: 'Destroy the Satrap stronghold before they destroy Ujjain.',
  heroCard: 'g_vikramaditya',
  defeatCard: 'sa_rudrasimha',
  enemyName: 'Satrap host',
  durgArt: ['durg_ujjain', 'durg_satrap_camp'],
  music: { briefing: 'music_gupta_briefing', calm: 'music_gupta_calm', intense: 'music_gupta_intense' },
  winText: turn => `Rudrasimha falls in turn ${turn}. Ujjain opens its gates, and the empire has a second capital.`,
  loseText: 'The Saka arrows darken the sky. The Satraps hold Malwa for another generation.',
  goLabel: 'To battle',
  game: seed => goldenAgeGame(seed, 'normal')
};
