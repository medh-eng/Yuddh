import { YUDDH_CARDS, CLASSIC_CARDS, EMPIRE_DATA, EMPIRE_ORDER_DATA } from '../data';
/* ============================================================
   YUDDH — card and empire lookups.
   The data itself lives in src/data/cards.json (edit numbers there).
   ============================================================ */
import type { CardDef, Empire, EmpireId, Keyword } from "./types";

export const EMPIRES: Record<EmpireId, Empire> = EMPIRE_DATA;
export const EMPIRE_ORDER: EmpireId[] = EMPIRE_ORDER_DATA;

/** the prototype's 50 cards (the golden traces replay them; buildDeck uses only these) */
export const CARD_LIST: CardDef[] = CLASSIC_CARDS;

/** every card: the prototype's 50 and the YUDDH cards (which buildDeck never sees) */
export const CARDS: Record<string, CardDef> = Object.fromEntries([...CARD_LIST, ...YUDDH_CARDS].map(c => [c.id, c]));

export const KW_LABEL: Record<Keyword, string> = { veg: "Vega", raksha: "Raksha", dhuan: "Dhuan" };
