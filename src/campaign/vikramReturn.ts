/* ============================================================
   Chalukya campaign, battle 4 (closing the arc): Vikramaditya's
   Return, c. 654–655 CE. Pulakeshin II's son Vikramaditya I spent the
   years after Badami (642 CE) rebuilding his father's shattered
   power. His own copper-plate grants (the Gadval, Nerur and Kendur
   plates, issued across his reign) say he "restored the fortunes of
   his family" and drove the Pallava out of Vatapi; historians place
   the recapture at around 654-655 CE, from the gap between his
   accession and later inscriptions that already treat Vatapi as
   recovered. No source names the Pallava commander he actually beat
   on the ground — Narasimhavarman I (the Pallava king from Badami)
   did not die until around 668 CE, so the man here is a garrison or
   governor, invented to be exactly that and nothing more. The whole
   battle is reconstructed from the gap, same as Pullalur and Badami
   before it. Decks: src/data/decks.json ("vikram_return"). Reuses the
   vatapi battlefield and the durg_badami Durg (now the player's
   again). Paintings: art/PROMPTS-BATCH19.md.
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const decks = decksOf('vikram_return');

export const VIKRAM_RETURN = {
  id: 'vikram_return',
  title: "Vikramaditya's Return",
  place: 'Vatapi (Badami)',
  year: 'c. 654–655 CE',
  battlefield: 'vatapi',
  briefing: "Twelve years. Your father fell outside these gates, or the record simply stops saying his name and lets you assume it. The Pallava garrison that has held Vatapi since is dug in, patched, and tired of holding it. There is no named king to beat here, no title to answer — only a fort to take back and a kingdom to make whole again.",
  playerDeck: decks.player,
  enemyDeck: decks.enemy,
  enemyHq: 24,
  playerHq: 26
};

export function vikramReturnGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}, season: Season = 'sharad'): GameState {
  return newGame({
    seed,
    player: { empire: 'chalukya', ally: 'neutral', deck: VIKRAM_RETURN.playerDeck, hq: VIKRAM_RETURN.playerHq, faction: 'Chalukya', capital: 'Badami', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: VIKRAM_RETURN.enemyDeck, hq: VIKRAM_RETURN.enemyHq, faction: 'Pallava garrison', capital: 'Vatapi (held)' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: VIKRAM_RETURN.id,
    scenarioName: VIKRAM_RETURN.title,
    rules: 'yuddh',
    season
  });
}

export const VIKRAM_RETURN_SCENARIO: Scenario = {
  ...VIKRAM_RETURN,
  objective: 'Retake Vatapi from the Pallava garrison and restore the Chalukya kingdom.',
  heroCard: 'c_vikramaditya1',
  defeatCard: 'pv_vatapi_adhikari',
  enemyName: 'Pallava garrison',
  durgArt: ['durg_badami', 'durg_vatapi_garrison'],
  winText: turn => `By turn ${turn} the garrison breaks and the gate is yours again. Vikramaditya's own grants will say he "restored the fortunes of his family" — a plainer claim than a title cut into a pillar, and this time it is the Chalukyas who get to make it.`,
  loseText: 'The garrison holds the rampart and the pillar stays where the Pallava put it. The kingdom will have to wait a little longer for the son who promised to rebuild it.',
  goLabel: 'To battle',
  game: seed => vikramReturnGame(seed, 'normal')
};
