/* What the battle screen needs to know about a battle: its story, its two
   Durgs, its music, and how to set up the game. The First Throne and the
   tutorial are both scenarios; later campaign missions will be too. */
import type { GameState } from '../engine/types';

export interface Scenario {
  id: string;
  title: string;
  place: string;
  year: string;
  battlefield: string;
  briefing: string;
  /** one line under the briefing: how to win */
  objective: string;
  /** the painting beside the briefing and on the victory screen; and on defeat */
  heroCard: string;
  defeatCard: string;
  /** the enemy as the turn banner and hints name it */
  enemyName: string;
  /** Durg paintings: [yours, theirs] */
  durgArt: [string, string];
  winText: (turn: number) => string;
  loseText: string;
  /** the button on the briefing */
  goLabel: string;
  playerDeck: string[];
  enemyDeck: string[];
  game: (seed: number) => GameState;
  /** the battle that follows in the campaign, and the label of the victory button that leads to it */
  nextId?: string;
  nextLabel?: string;
  /** this battle's own music (files named music_<x> in art/source/sfx); any piece not delivered falls back to the standard one */
  music?: { briefing?: string; calm?: string; intense?: string };
  /** a guided battle: the coach explains each step */
  coached?: boolean;
}
