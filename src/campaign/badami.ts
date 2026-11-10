/* ============================================================
   Battle 3 of the Chalukya campaign, "The Fall of Badami" (642 CE).
   After Pullalur, Mahendravarman I's son Narasimhavarman I (Mamalla,
   "the great wrestler") set out to answer his father's defeat. In 642
   CE a Pallava army, which Tamil tradition (the Periya Puranam) says
   was led by the general Paranjothi, marched on Vatapi (Badami), the
   Chalukya capital. Pulakeshin II met it outside the city and is
   presumed (not recorded outright) to have died in the fighting. The
   Kuram and Velurpalaiyam plates record the Pallava claim: the king
   took "the pillar of victory standing in the centre of Vatapi" and
   earned the title Vatapikonda, conqueror of Vatapi. The Chalukya
   record of the fall is silent; Pulakeshin's son Vikramaditya I
   restored the kingdom by about 655-670 (history.json "badami").
   This is a defence of the capital the player is meant to lose about
   as often as win: three battles into the Pallava war, the ground
   finally runs out. Decks: src/data/decks.json ("badami").
   Paintings: art/PROMPTS-BATCH18.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('badami');

export const BADAMI = {
  id: 'badami',
  title: 'The Fall of Badami',
  place: 'Vatapi (Badami)',
  year: '642 CE',
  battlefield: 'vatapi',
  briefing: 'This is the third time the Pallava have come. Mahendravarman is dead; his son Narasimhavarman, a wrestler-king with a grudge to answer, has marched on Vatapi itself. There is no river to hold and no walls to fall back behind: only the cliffs above the city and whatever is left of the army that held the Narmada and broke at Pullalur. Hold the ground outside your own gates.',
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 29,
  playerHq: 27
};

export function badamiGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'grishma'): GameState {
  return newGame({
    seed,
    player: { empire: 'chalukya', ally: 'neutral', deck: BADAMI.playerDeck, hq: BADAMI.playerHq, faction: 'Chalukya', capital: 'Badami', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: BADAMI.enemyDeck, hq: BADAMI.enemyHq, faction: 'Pallava army', capital: 'Kanchipuram' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: BADAMI.id,
    scenarioName: BADAMI.title,
    rules: 'yuddh',
    season
  });
}

export const BADAMI_SCENARIO: Scenario = {
  ...BADAMI,
  objective: 'Hold the ground outside Vatapi against Narasimhavarman\'s army.',
  heroCard: 'c_pulakeshin',
  defeatCard: 'pv_narasimhavarman',
  enemyName: 'Pallava host',
  durgArt: ['durg_badami', 'durg_pallava_camp'],
  winText: turn => `Narasimhavarman's wrestlers break outside the gates in turn ${turn}, and the pillar he meant to cut at the city's centre stays uncarved. Badami stands, for now.`,
  loseText: "Pulakeshin II falls outside his own capital, or the sources fall silent and the game assumes he did. Narasimhavarman cuts \"Vatapikonda\" into a captured pillar and holds the city for twelve years, until Pulakeshin's son Vikramaditya I takes it back.",
  goLabel: 'To battle',
  game: seed => badamiGame(seed, 'normal')
};
