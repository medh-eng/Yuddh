/* ============================================================
   Chalukya campaign, battle 2, "Pullalur" (c. 618-630 CE). The Aihole
   inscription (Ravikirti, 634-635 CE) says Pulakeshin II defeated the
   Pallava king Mahendravarman I at Pullalur, near Kanchipuram, and
   that the Pallava then hid behind the walls of Kanchi. The player is
   Pulakeshin II; the Pallava can fall back (Retreat to Kanchi heals
   the Durg), so the host must break his army before the walls. The
   site and the fight are unknown and invented (history.json).
   Decks: decks.json ("pullalur"). Paintings: art/PROMPTS-BATCH15.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('pullalur');

export const PULLALUR = {
  id: 'pullalur',
  title: 'Pullalur',
  place: 'Pullalur, near Kanchipuram',
  year: 'c. 618–630 CE',
  battlefield: 'pullalur',
  briefing: "The Narmada was a river you held. Pullalur is a field fight against a clever king. Mahendravarman of Kanchi is a poet, a playwright and an engineer who cuts temples from living rock, and he knows that the walls of Kanchi stand close behind his line. Break his army on the red plain before it can fall back to them, and do not let the gates close with his army inside.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 30,
  playerHq: 28
};

export function pullalurGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'sharad'): GameState {
  return newGame({
    seed,
    player: { empire: 'chalukya', ally: 'neutral', deck: PULLALUR.playerDeck, hq: PULLALUR.playerHq, faction: 'Chalukya', capital: 'Badami', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: PULLALUR.enemyDeck, hq: PULLALUR.enemyHq, faction: 'Pallava army', capital: 'Kanchipuram' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: PULLALUR.id,
    scenarioName: PULLALUR.title,
    rules: 'yuddh',
    season
  });
}

export const PULLALUR_SCENARIO: Scenario = {
  ...PULLALUR,
  objective: "Break Mahendravarman's army on the plain before it reaches the walls of Kanchi.",
  heroCard: 'c_pulakeshin',
  defeatCard: 'pv_mahendravarman',
  enemyName: 'Pallava host',
  durgArt: ['durg_badami', 'durg_kanchi_pallava'],
  winText: turn => `The Pallava line breaks in turn ${turn}. Ravikirti's praise-poem says Pulakeshin won at Pullalur and that Mahendravarman then hid behind the walls of Kanchi. The Pallava would not forget it: his son took the war to Badami in 642 CE.`,
  loseText: "The gates of Kanchi close behind the elephants, and the Pallava king keeps his city and his army. The Chalukya poets will have to find another victory to carve in stone.",
  goLabel: 'To battle',
  game: seed => pullalurGame(seed, 'normal')
};
