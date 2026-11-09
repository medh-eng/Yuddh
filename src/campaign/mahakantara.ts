/* ============================================================
   Gupta campaign — "The Great Forest": Samudragupta's southern march
   meets Vyaghraraja of Mahakantara (the Allahabad Pillar names him
   among the twelve southern kings it says were captured and then
   released). Decks are in src/data/decks.json ("mahakantara").
   The forest side is a battle of ambush: Dhuan archers and king stay
   hidden until they strike, wild elephants guard the line, and a snare
   (Vana Jaal, a Kuta card) punishes every attack. The Gupta win with
   the court (Harishena draws, Dakshinapatha pays, Grahana-Moksha heals
   and draws: "capture, then release"). Paintings: art/PROMPTS-BATCH8.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('mahakantara');

export const MAHAKANTARA = {
  id: 'mahakantara',
  title: 'The Great Forest',
  place: 'Mahakantara',
  year: 'mid-4th century CE',
  battlefield: 'mahakantara',
  briefing: 'South of the Ganges plain the road enters the Great Forest, and Vyaghraraja, the tiger-king, knows every path in it. His archers vanish among the sal trees until the first arrow, his elephants stand in the clearings, and pits and snares wait for anyone who attacks in haste. Samudragupta has an army and a poet: scout before you strike, keep your court drawing cards, and remember what the Pillar says of the twelve southern kings: captured, then released.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 24,
  enemyStartKosha: 1
};

export function mahakantaraGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'gupta', ally: 'neutral', deck: MAHAKANTARA.playerDeck, hq: 24, faction: 'Gupta', capital: 'Pataliputra', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: MAHAKANTARA.enemyDeck, hq: MAHAKANTARA.enemyHq, startKosha: MAHAKANTARA.enemyStartKosha, faction: 'Forest kingdoms', capital: 'Mahakantara' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: MAHAKANTARA.id,
    scenarioName: MAHAKANTARA.title,
    rules: 'yuddh',
    season
  });
}

export const MAHAKANTARA_SCENARIO: Scenario = {
  ...MAHAKANTARA,
  objective: "Break Vyaghraraja's stockade before the forest breaks your march.",
  heroCard: 'g_samudragupta',
  defeatCard: 'mk_vyaghraraja',
  enemyName: 'Forest host',
  durgArt: ['durg_pataliputra', 'durg_mahakantara'],
  music: { briefing: 'music_gupta_briefing', calm: 'music_gupta_calm', intense: 'music_gupta_intense' },
  winText: turn => `Vyaghraraja yields in turn ${turn}. Harishena will write that he was taken, and then set free to rule his forest again.`,
  loseText: 'The sal trees close behind the column. The tiger-king keeps his forest, and the road south waits.',
  nextId: 'kanchi',
  nextLabel: 'The Walls of Kanchi',
  goLabel: 'To battle',
  game: seed => mahakantaraGame(seed, 'normal')
};
