/* ============================================================
   Chola campaign, "The Crossing to Lanka" — battle 1 (c. 993 CE).
   A Chola army sent by Rajaraja I crossed the Palk Strait and took
   Anuradhapura, the old capital of northern Sri Lanka. The Chola
   record says it was conquered; the Sinhalese chronicle (Culavamsa)
   says King Mahinda V's army, unpaid, would not obey him and he
   withdrew to Ruhuna. The battle is invented; both voices are kept
   in history.json. Decks: src/data/decks.json ("lanka").
   Paintings: art/PROMPTS-BATCH11.md.
   The Chola side crosses in force (Marakkalam draws and pays, Valangai
   hold the beach, Vandiyadevan rallies a line); Anuradhapura answers
   with elephants, archers, monks and its great tank. The treasury is
   empty in the sources, but the engine cannot start a side below the
   default Kosha, so the Sinhalese get a smaller Durg and no Kosha cards
   except Wewa Jala.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('lanka');

export const LANKA = {
  id: 'lanka',
  title: 'The Crossing to Lanka',
  place: 'Anuradhapura, Sri Lanka',
  year: 'c. 993 CE',
  battlefield: 'anuradhapura',
  briefing: "Rajaraja has sent the fleet across the strait and the army is yours. Behind you the ships ride at anchor with their tiger sails; ahead lies Anuradhapura, a city older than any throne you have taken, with white stupas, a great tank and elephants at the gate. The king's own soldiers have not been paid and no longer obey him, but the men who still stand with him stand well. Land in order, hold the beach and take the capital. Whatever the island's chroniclers say of this day, the Chola record will say only that it was conquered.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 24,
  enemyStartKosha: 1
};

export function lankaGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'chola', ally: 'neutral', deck: LANKA.playerDeck, hq: 24, faction: 'Chola', capital: 'Gangaikonda Cholapuram', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: LANKA.enemyDeck, hq: LANKA.enemyHq, startKosha: LANKA.enemyStartKosha, faction: 'Anuradhapura', capital: 'Anuradhapura' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: LANKA.id,
    scenarioName: LANKA.title,
    rules: 'yuddh',
    season
  });
}

export const LANKA_SCENARIO: Scenario = {
  ...LANKA,
  objective: 'Land, hold the beach and take Anuradhapura.',
  heroCard: 'ch_rajaraja',
  defeatCard: 'si_mahinda',
  enemyName: 'Anuradhapura host',
  durgArt: ['durg_gangaikonda', 'durg_anuradhapura'],
  winText: turn => `Anuradhapura falls in turn ${turn}. The Chola record will say the north was conquered; the chronicle will say the king's own army had already turned from him. Both are true enough to be written down.`,
  loseText: 'The elephants hold the road and the tank floods the paddies. The ships take the army back across the strait, and the island keeps its king.',
  nextId: 'ganga',
  nextLabel: 'The Ganga Road',
  goLabel: 'To battle',
  game: seed => lankaGame(seed, 'normal')
};
