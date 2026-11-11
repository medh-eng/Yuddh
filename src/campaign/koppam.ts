/* ============================================================
   Chola campaign, battle 4 (chronologically the last): Koppam.
   About 1052 or 1054 CE — sources differ — Rajadhiraja I, Rajendra I's
   son, led the Chola army against Someshvara I (Ahavamalla) of the
   Western Chalukyas, the rival power of the Deccan, at Koppam
   (usually read as Koppal, by the Tungabhadra). Chola sources (above
   all the Manimangalam record of Rajendra II, 1055, and the
   Thanjavur inscriptions) agree: Rajadhiraja rode a war elephant into
   the fighting and was killed on it by a downpour of arrows; his
   brother Rajendra II, wounded and held back early, returned, rallied
   the broken army and turned the battle, and was crowned on the
   field. The Chalukya side's own record is mostly silent; later
   Chalukya sources claim the war for themselves, and the claim that
   Someshvara's brother Jayasimha died there is doubted (he lived on).
   No troop numbers survive and the battle itself is invented from
   that outcome. Decks: src/data/decks.json ("koppam").
   Paintings: art/PROMPTS-BATCH17.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('koppam');

export const KOPPAM = {
  id: 'koppam',
  title: 'Koppam',
  place: 'Koppam (Koppal, on the Tungabhadra)',
  year: 'c. 1052–54 CE',
  battlefield: 'koppam',
  briefing: 'Someshvara I of the Western Chalukyas has brought his whole strength to the Tungabhadra. Rajadhiraja rides his war elephant to the front of the line, as he always does. The Chalukya record of this day is nearly silent; the Chola record says the king fell under a downpour of arrows and the army almost broke with him — until his brother Rajendra came back. Hold this field, whatever it costs you.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 34,
  playerHq: 24
};

export function koppamGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'grishma'): GameState {
  return newGame({
    seed,
    player: { empire: 'chola', ally: 'neutral', deck: KOPPAM.playerDeck, hq: KOPPAM.playerHq, faction: 'Chola', capital: 'Gangaikonda Cholapuram', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: KOPPAM.enemyDeck, hq: KOPPAM.enemyHq, faction: 'Western Chalukya', capital: 'Kalyani' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: KOPPAM.id,
    scenarioName: KOPPAM.title,
    rules: 'yuddh',
    season
  });
}

export const KOPPAM_SCENARIO: Scenario = {
  ...KOPPAM,
  objective: "Hold the field at Koppam against Someshvara I, whatever the cost.",
  heroCard: 'ch_rajadhiraja',
  defeatCard: 'wc_someshvara',
  enemyName: 'Western Chalukya host',
  durgArt: ['durg_gangaikonda', 'durg_kalyani'],
  winText: turn => `By turn ${turn} the Chalukya line gives way. The Chola inscriptions will claim elephants, horses and queens as plunder; whether Rajadhiraja still sits his elephant to see it, no record says outright.`,
  loseText: "The arrows find Rajadhiraja on his elephant, and this time no rally comes in time. The Tamil poets will still call him Yanai-mel-thunjina Devar, the king who died on the elephant — but the field, this day, is not won.",
  goLabel: 'To battle',
  game: seed => koppamGame(seed, 'normal')
};
