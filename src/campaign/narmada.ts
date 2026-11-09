/* ============================================================
   Battle 1 of the Chalukya campaign, "Tigers of the South" — The Narmada
   Line: Pulakeshin II of Badami halts Harsha of Kanauj on the Narmada,
   c. 618–630 CE (the Aihole inscription, 634 CE, is the Chalukya record).
   Decks are in src/data/decks.json ("narmada_line").
   The Chalukya hold: a 28-point Durg, Raksha units with +1 attack, Narmada
   Ghat (2 damage to every enemy on the Yudhbhumi), the Boar Banner, and a
   poet who heals. Harsha comes wide: spearmen, an elephant corps that
   tramples, cavalry, Bana (cards) and Prayaga Dana (Kosha).
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('narmada_line');

export const NARMADA_LINE = {
  id: 'narmada_line',
  title: 'The Narmada Line',
  place: 'The Narmada',
  year: 'c. 618–630 CE',
  battlefield: 'narmada',
  briefing: 'Harsha of Kanauj has made himself lord of the north, and now his elephants turn south. Badami is a hill kingdom: it cannot match his numbers, so it must choose its ground. Hold the river, make every crossing cost him dearly, and let the Boar banner draw your horsemen together at the right moment. A river is the best wall, but only if someone stands behind it.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 34,
  enemyStartKosha: 2
};

export function narmadaGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'chalukya', ally: 'neutral', deck: NARMADA_LINE.playerDeck, faction: 'Chalukya', capital: 'Badami', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: NARMADA_LINE.enemyDeck, hq: NARMADA_LINE.enemyHq, startKosha: NARMADA_LINE.enemyStartKosha, faction: 'Vardhana empire', capital: 'Kanyakubja' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: NARMADA_LINE.id,
    scenarioName: NARMADA_LINE.title,
    rules: 'yuddh',
    season
  });
}

export const NARMADA_LINE_SCENARIO: Scenario = {
  ...NARMADA_LINE,
  objective: "Break Harsha's host on the Narmada before it breaks Badami.",
  heroCard: 'c_pulakeshin',
  defeatCard: 'vd_harsha',
  enemyName: 'Vardhana host',
  durgArt: ['durg_badami', 'durg_kanauj'],
  winText: turn => `Harsha's elephants break in turn ${turn}. Ravikirti will carve it in stone: the emperor lost his harsha, his joy, on the Narmada.`,
  loseText: "The elephants cross the Narmada. Harsha's lion banner flies over the Deccan, and the poets of Kanauj write the next chapter.",
  goLabel: 'To battle',
  game: seed => narmadaGame(seed, 'normal')
};
