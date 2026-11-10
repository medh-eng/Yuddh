/* ============================================================
   Rajput campaign, "The First Battle of Tarain" (1191 CE).
   Mu'izz al-Din Muhammad of Ghor took Tabarhinda and Prithviraj III
   Chauhan marched out against him with his feudatories. Minhaj-i Siraj
   (Tabaqat-i Nasiri, 1260) says the Ghurid army was beaten and the
   sultan wounded by Govind Rai of Delhi. The battle itself is invented
   (no numbers, no speeches); see history.json. Decks: decks.json
   ("tarain1"). Paintings: art/PROMPTS-BATCH12.md. A year later the
   sultan returned and won the second battle (batch 13, not built).
   Rajputs: cheap Vega cavalry (+1 attack from the Rajput passive), the
   Durg guard, elephants and Prithviraj. Ghurids: mounted archers that
   shoot on arrival, guard cavalry, the war-drums and the fort behind
   them. Season is fixed to Sharad (firm ground): a cavalry battle on a
   dry plain, and the sources give no season rule.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('tarain1');

export const TARAIN1 = {
  id: 'tarain1',
  title: 'The First Battle of Tarain',
  place: 'Tarain, Haryana',
  year: '1191 CE',
  battlefield: 'tarain',
  briefing: "The sultan of Ghur has taken Tabarhinda and left a garrison in it, and the whole of the Rana's country has answered Prithviraj's call: Delhi, Ajmer and the clans between them, each under its own banner. Across the plain at Tarain waits a disciplined army with mounted archers, a drilled horse guard and kettle-drums that move a whole line at once. Ride out with the feudatories, hold the centre and break the sultan's host. Win it well, and remember that the Persian writers say the sultan was carried from the field alive.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 24
};

export function tarain1Game(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'sharad'): GameState {
  return newGame({
    seed,
    player: { empire: 'rajput', ally: 'neutral', deck: TARAIN1.playerDeck, hq: 24, faction: 'Rajput', capital: 'Ajmer', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: TARAIN1.enemyDeck, hq: TARAIN1.enemyHq, faction: 'Ghurid army', capital: 'Ghurid camp' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: TARAIN1.id,
    scenarioName: TARAIN1.title,
    rules: 'yuddh',
    season
  });
}

export const TARAIN1_SCENARIO: Scenario = {
  ...TARAIN1,
  objective: "Break the sultan's host at Tarain.",
  heroCard: 'r_prithviraj',
  defeatCard: 'gh_muizz',
  enemyName: 'Ghurid host',
  durgArt: ['durg_ajmer', 'durg_ghurid_camp'],
  winText: turn => `The Ghurid line breaks in turn ${turn}. The Persian writers say the sultan was wounded and led from the field alive; Tabarhinda is still to be settled, and a year is a short time.`,
  loseText: "The kettle-drums beat, the line pushes as one and the clan banners fall back toward Delhi. The sultan keeps the field, and the Chahamana poets have a harder poem to write.",
  goLabel: 'To battle',
  game: seed => tarain1Game(seed, 'normal')
};
