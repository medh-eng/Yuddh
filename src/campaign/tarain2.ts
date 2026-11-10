/* ============================================================
   Rajput campaign, "The Second Battle of Tarain" (1192 CE).
   A year after his wounding, Mu'izz al-Din Muhammad of Ghor came back
   to the same plain and won. Minhaj-i Siraj and Hasan Nizami describe
   an army that harassed the Rajput line with mounted archers, drew
   it out, and struck with its heavy cavalry only when the line was
   worn. The player leads the RAJPUTS (Pon, 10 Nov 2026), so this is
   the hard fight: the same men, a better-prepared enemy. No troop
   numbers, no speeches; see history.json. Decks: decks.json
   ("tarain2"). Paintings: art/PROMPTS-BATCH13.md.
   Ghurids: Feigned Flight (damage to the whole front line), the
   Mailed Reserve, Aibak and Dawn Charge. Rajputs: Skandaraja, the
   clan foot, the Charan Bard (when painted) and the old Tarain cards.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('tarain2');

export const TARAIN2 = {
  id: 'tarain2',
  title: 'The Second Battle of Tarain',
  place: 'Tarain, Haryana',
  year: '1192 CE',
  battlefield: 'tarain',
  briefing: "A year ago the sultan left this plain carried by a soldier. He has come back with a rebuilt army, and this time his horse archers do not charge: they shoot, turn away and wait for your riders to follow. Behind a low rise stands the heavy cavalry that has not yet drawn a blade. The clans are tired of waiting and the young lords want to pursue. Hold your line, keep your guard around the Durg, and do not chase what is meant to be chased.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 28
};

export function tarain2Game(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'sharad'): GameState {
  return newGame({
    seed,
    player: { empire: 'rajput', ally: 'neutral', deck: TARAIN2.playerDeck, hq: 24, faction: 'Rajput', capital: 'Ajmer', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: TARAIN2.enemyDeck, hq: TARAIN2.enemyHq, faction: 'Ghurid army', capital: 'Ghurid camp' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: TARAIN2.id,
    scenarioName: TARAIN2.title,
    rules: 'yuddh',
    season
  });
}

export const TARAIN2_SCENARIO: Scenario = {
  ...TARAIN2,
  objective: "Break the sultan's host at Tarain, as no one did in 1192.",
  heroCard: 'r_prithviraj',
  defeatCard: 'gh_aibak',
  enemyName: 'Ghurid host',
  durgArt: ['durg_ajmer', 'durg_ghurid_camp'],
  winText: turn => `The Ghurid line breaks in turn ${turn}. History did not go this way: in 1192 the Rajput host was beaten, Prithviraj was taken, and Delhi and Ajmer passed to the sultan's governors. You have held where they did not.`,
  loseText: "The heavy horse comes up from behind the rise and the tired line gives way. This is how the sources say it ended: the host broke, Prithviraj was taken, and Delhi and Ajmer soon had new governors.",
  goLabel: 'To battle',
  game: seed => tarain2Game(seed, 'normal')
};
