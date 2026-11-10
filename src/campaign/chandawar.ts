/* ============================================================
   Rajput campaign, "The Battle of Chandawar" (1194 CE). After Tarain
   the sultan of Ghur turned on the Gahadavala kingdom of Jayachandra,
   lord of Kannauj and Varanasi. Hasan Nizami and Ibn al-Athir agree on
   the shape: a Gahadavala host strong in war elephants, Jayachandra on
   one himself, and a Ghurid victory on the Yamuna. The player leads
   the host (as at both Tarains). The Ghurid answer to elephants is the
   foot archer: Elephant-Shooters deal extra damage to a War Elephant
   (`vsElephant`). No troop numbers; the Jaichand-traitor legend is NOT
   used (see history.json). Decks: decks.json ("chandawar").
   Paintings: art/PROMPTS-BATCH14.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('chandawar');

export const CHANDAWAR = {
  id: 'chandawar',
  title: 'The Battle of Chandawar',
  place: 'The Yamuna, near Chandawar',
  year: '1194 CE',
  battlefield: 'chandawar',
  briefing: "The sultan who beat Prithviraj has marched east against Kannauj. Jayachandra's host is strong in war elephants, and the Ghurid captains know it: they have brought foot archers trained to shoot the driver and the beast, and light horse to cross the ford before you can hold it. Keep the elephants behind a wall of spears, hold the bank, and do not send the tall beasts in alone.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 28,
  playerHq: 24
};

export function chandawarGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'sharad'): GameState {
  return newGame({
    seed,
    player: { empire: 'rajput', ally: 'neutral', deck: CHANDAWAR.playerDeck, hq: CHANDAWAR.playerHq, faction: 'Rajput', capital: 'Kannauj', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: CHANDAWAR.enemyDeck, hq: CHANDAWAR.enemyHq, faction: 'Ghurid army', capital: 'Ghurid camp' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: CHANDAWAR.id,
    scenarioName: CHANDAWAR.title,
    rules: 'yuddh',
    season
  });
}

export const CHANDAWAR_SCENARIO: Scenario = {
  ...CHANDAWAR,
  objective: "Hold the Yamuna against the sultan's host before the foot archers bring down your elephants.",
  heroCard: 'r_jayachandra',
  defeatCard: 'gh_muizz',
  enemyName: 'Ghurid host',
  durgArt: ['durg_kannauj_gahadavala', 'durg_ghurid_camp'],
  winText: turn => `The Ghurid line breaks in turn ${turn}. History did not go this way: the Persian chroniclers say Jayachandra was killed on his elephant at Chandawar and Kannauj and Varanasi passed to the sultan. You have held the river where he could not.`,
  loseText: "The arrows find the drivers, the great beasts turn back into your own line, and the light horse are across the ford. This is how the chroniclers say it ended: Jayachandra killed, Kannauj and Varanasi lost.",
  goLabel: 'To battle',
  game: seed => chandawarGame(seed, 'normal')
};
