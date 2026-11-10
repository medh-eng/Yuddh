/* What the battle screen needs to know about a battle: its story, its two
   Durgs, its music, and how to set up the game. The First Throne and the
   tutorial are both scenarios; later campaign missions will be too. */
import type { GameState } from '../engine/types';

export interface DuelSide { name: string; hero: string; durg: string }

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
  /** pass-and-play: two humans, no AI; sides[0] moves first. The battle turns the board between turns. */
  duel?: { sides: [DuelSide, DuelSide] };
  /** two phones: the link to the other player, and which end this is (the host moves first and keeps the real frame) */
  online?: { link: import('../game/net/link').Link; role: 'host' | 'guest' };
  /** two phones: both devices deal from this seed */
  fixedSeed?: number;
}
