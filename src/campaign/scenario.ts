/* What the battle screen needs to know about a battle: its story, its two
   Durgs, its music, and how to set up the game. The First Throne and the
   tutorial are both scenarios; later campaign missions will be too. */
import type { GameState } from '../engine/types';

/** the history pages: shown under the briefing, and the epilogue after a victory */
export interface History {
  /** what the sources say happened (2–4 sentences) */
  happened: string;
  /** what the game bends or invents, said plainly */
  changes: string;
  /** one line: the main sources */
  sources: string;
  /** after a win: what came next in history */
  epilogue: string;
}

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
  history?: History;
  /** a guided battle: the coach explains each step */
  coached?: boolean;
}
