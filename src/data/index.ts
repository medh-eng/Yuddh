/* ============================================================
   Typed access to the JSON data files in this folder.
   Balance changes (stats, costs, deck lists, rule constants) are
   edits to cards.json / decks.json / rules.json, not to code.
   ============================================================ */
import type { CardDef, Empire, EmpireId, Season } from '../engine/types';
import cardsJson from './cards.json';
import decksJson from './decks.json';
import rulesJson from './rules.json';

export const EMPIRE_DATA = cardsJson.empires as unknown as Record<EmpireId, Empire>;
export const EMPIRE_ORDER_DATA = cardsJson.empireOrder as EmpireId[];
export const CLASSIC_CARDS = cardsJson.classic as unknown as CardDef[];
export const YUDDH_CARDS = cardsJson.yuddh as unknown as CardDef[];
/** designed but unpainted: not loaded by the engine until their art arrives */
export const PENDING_CARDS = cardsJson.pendingArt as unknown as CardDef[];

/** 'id*3' → three copies of id; order is kept (decks are shuffled from a seeded generator) */
export function expandDeck(list: readonly string[]): string[] {
  return list.flatMap(e => { const [id, n] = e.split('*'); return Array.from({ length: n ? Number(n) : 1 }, () => id); });
}

type DeckEntry = { player: string[]; enemy: string[] };
const decks = decksJson as unknown as Record<string, DeckEntry>;
/** the two decks of a battle, by scenario id (see decks.json) */
export function decksOf(scenarioId: string): { player: string[]; enemy: string[] } {
  const d = decks[scenarioId];
  if (!d) throw new Error(`no deck entry for ${scenarioId} in src/data/decks.json`);
  return { player: expandDeck(d.player), enemy: expandDeck(d.enemy) };
}

export const RULES = {
  ranks: rulesJson.ranks as string[],
  dharmaMax: rulesJson.dharmaMax,
  kutaCards: new Set<string>(rulesJson.kutaCards),
  chargeClasses: new Set<string>(rulesJson.chargeClasses),
  seasons: rulesJson.seasons as Record<Season, { name: string; english: string; rule: string }>
};
