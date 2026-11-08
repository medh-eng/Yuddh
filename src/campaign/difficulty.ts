/* The player's choice of foe. Standard = the heuristic opponent each battle was balanced
   against. Veteran = the search AI (src/engine/search.ts), which plans whole turns ahead.
   One setting for the whole game, kept in the browser. */
import type { AiLevel } from '../engine/types';

const KEY = 'yuddh.foe.v1';
export const veteranFoe = (): boolean => { try { return localStorage.getItem(KEY) === 'veteran'; } catch { return false; } };
export const setVeteranFoe = (on: boolean): void => { try { localStorage.setItem(KEY, on ? 'veteran' : 'standard'); } catch { /* private mode */ } };
/** the AI level for a battle whose own default is `base` */
export const foeLevel = (base: AiLevel): AiLevel => (veteranFoe() ? 'search' : base);
