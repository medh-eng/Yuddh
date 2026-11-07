/* ============================================================
   Battle 2 of the Gupta campaign — "The Digvijaya": Samudragupta against
   the allied Naga kings (Ganapati Naga, Nagasena, Achyuta) at Padmavati,
   c. 340 CE (the Allahabad Pillar names them among the kings of Aryavarta
   he "uprooted"). Decks are in src/data/decks.json ("digvijaya").
   DRAFT: move to src/campaign/ when the batch 6 paintings are in
   (see art/PROMPTS-BATCH6.md). Simulated at ~50% for the player side.
   Naga: cheap clan infantry and shielded archers, three named kings,
   elephants, venom (Sarpa Vish, a Kuta card). Gupta: Samudragupta's
   +1 attack to every unit, Veena (draw, Kosha, Dharma), Ashwamedha.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('digvijaya');

export const DIGVIJAYA = {
  id: 'digvijaya',
  title: 'The Digvijaya',
  place: 'Padmavati',
  year: 'c. 340 CE',
  battlefield: 'padmavati',
  briefing: 'Three Naga kings have joined their clans against you, and the forest is theirs: spearmen close ranks, archers shoot from behind planted shields, and their elephants can break a line. Samudragupta has not come to rule the Ganges plain by halves. Play the king who also plays the veena: keep to Dharma, let the court feed your armies, and when the line is set, send every blade forward at once.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 22,
  enemyStartKosha: 1
};

export function digvijayaGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'gupta', ally: 'neutral', deck: DIGVIJAYA.playerDeck, hq: 24, faction: 'Gupta', capital: 'Pataliputra', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: DIGVIJAYA.enemyDeck, hq: DIGVIJAYA.enemyHq, startKosha: DIGVIJAYA.enemyStartKosha, faction: 'Naga kings', capital: 'Padmavati' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: DIGVIJAYA.id,
    scenarioName: DIGVIJAYA.title,
    rules: 'yuddh',
    season
  });
}

export const DIGVIJAYA_SCENARIO: Scenario = {
  ...DIGVIJAYA,
  objective: 'Break Padmavati before the Naga kings break Pataliputra.',
  heroCard: 'g_samudragupta',
  defeatCard: 'na_ganapati_naga',
  enemyName: 'Naga host',
  durgArt: ['durg_pataliputra', 'durg_padmavati'],
  music: { briefing: 'music_gupta_briefing', calm: 'music_gupta_calm', intense: 'music_gupta_intense' },
  winText: turn => `Ganapati Naga falls in turn ${turn}. The Allahabad Pillar will say the kings of Aryavarta were uprooted, and Samudragupta will turn south.`,
  loseText: 'The Naga clans close ranks in the forest. The march of conquest is put off for a generation.',
  goLabel: 'To battle',
  game: seed => digvijayaGame(seed, 'normal')
};
