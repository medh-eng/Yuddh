/* ============================================================
   Gupta campaign — "The Walls of Kanchi": the far end of the southern
   march. Vishnugopa of Kanchi is the seventh of the twelve southern
   kings the Allahabad Pillar says were captured and released. Decks are
   in src/data/decks.json ("kanchi"). Kanchi is a battle of walls and
   learning: gate guards and war elephants hold the line (Raksha),
   chariots charge round it, and scholars (Ghatika Pandits) keep the
   city's hand full. The Gupta side is the same court as in
   The Great Forest. Paintings: art/PROMPTS-BATCH8.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import { seasonFor } from './firstThrone';

const decks = decksOf('kanchi');

export const KANCHI = {
  id: 'kanchi',
  title: 'The Walls of Kanchi',
  place: 'Kanchi',
  year: 'mid-4th century CE',
  battlefield: 'kanchi',
  briefing: 'Kanchi is the last name on the southern list: a rich Pallava city of brick walls and gate towers, of elephants, chariots and a college whose scholars outnumber its guards. Vishnugopa will not meet you in the open; he waits behind his Raksha line and lets the city feed him cards. Break the gate guard, answer the chariots, and win the way a Gupta king wins in the south: not by burning the city, but by taking its king and giving him back his throne.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 26,
  enemyStartKosha: 1
};

export function kanchiGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = seasonFor(seed)): GameState {
  return newGame({
    seed,
    player: { empire: 'gupta', ally: 'neutral', deck: KANCHI.playerDeck, hq: 24, faction: 'Gupta', capital: 'Pataliputra', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: KANCHI.enemyDeck, hq: KANCHI.enemyHq, startKosha: KANCHI.enemyStartKosha, faction: 'Kanchi', capital: 'Kanchi' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: KANCHI.id,
    scenarioName: KANCHI.title,
    rules: 'yuddh',
    season
  });
}

export const KANCHI_SCENARIO: Scenario = {
  ...KANCHI,
  objective: 'Breach Kanchi before the Pallava city breaks your column.',
  heroCard: 'g_samudragupta',
  defeatCard: 'pk_vishnugopa',
  enemyName: 'Kanchi host',
  durgArt: ['durg_pataliputra', 'durg_kanchi'],
  music: { briefing: 'music_gupta_briefing', calm: 'music_gupta_calm', intense: 'music_gupta_intense' },
  winText: turn => `Vishnugopa is taken in turn ${turn}. The Pillar will say he was captured and released: a southern king restored under a northern name.`,
  loseText: 'The gate towers of Kanchi hold. The northern column turns for home, a long way from the Ganges.',
  nextId: 'golden_age',
  nextLabel: 'The Golden Age',
  goLabel: 'To battle',
  game: seed => kanchiGame(seed, 'normal')
};
