/* ============================================================
   YUDDH: rank and renown (Yash) per empire.
   Each empire's campaign earns Yash on its own: a win, the first
   win of a battle, a defeat (a little), a Veteran foe (x1.5). Yash
   sets a rank on a seven-step ladder (data/ranks.json). Ranks are
   titles; they never change a battle. A rank-up pays a little Kirti.
   Storage is injectable so tests run without a browser.
   ============================================================ */
import RANKS from '../data/ranks.json';
import type { Store } from './progress';
import { Meta } from './progress';

export interface RankDef { name: string; hindi: string; gloss: string; from: number }
export interface EmpireStanding { yash: number; wins: number; played: number; vetWins: number }
export type StandingData = Record<string, EmpireStanding>
export interface RankView { level: number; rank: RankDef; next: RankDef | null; into: number; span: number }
export interface Gain { yash: number; before: number; after: number; rankedUp: boolean; kirti: number }

export const LADDER: RankDef[] = RANKS.ranks;
export const EMPIRES = RANKS.empires as Record<string, { name: string; hindi: string; hero: string }>;
const KEY = 'yuddh.standing.v1';

export function rankOf(yash: number): RankView {
  let level = 0;
  LADDER.forEach((r, i) => { if (yash >= r.from) level = i; });
  const next = LADDER[level + 1] ?? null;
  return { level, rank: LADDER[level], next, into: yash - LADDER[level].from, span: next ? next.from - LADDER[level].from : 0 };
}

export function yashFor(won: boolean, firstClear: boolean, veteran: boolean): number {
  const y = RANKS.yash;
  const base = won ? y.win + (firstClear ? y.firstClear : 0) : y.loss;
  return Math.round(base * (veteran ? y.veteranMultiplier : 1));
}

const memoryStore = (): Store => { const m = new Map<string, string>(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v); } }; };
function defaultStore(): Store {
  try { if (typeof localStorage !== 'undefined') { localStorage.getItem(KEY); return localStorage; } } catch { /* blocked */ }
  return memoryStore();
}

export class Standing {
  data: StandingData = {};
  constructor(private store: Store = defaultStore(), private meta: Meta = new Meta(store)) { this.load(); }
  load(): void {
    try { const v = JSON.parse(this.store.getItem(KEY) || '{}'); this.data = v && typeof v === 'object' ? v : {}; } catch { this.data = {}; }
  }
  save(): void { try { this.store.setItem(KEY, JSON.stringify(this.data)); } catch { /* full or blocked */ } }
  of(empire: string): EmpireStanding { const d = this.data[empire]; return { yash: d?.yash ?? 0, wins: d?.wins ?? 0, played: d?.played ?? 0, vetWins: d?.vetWins ?? 0 }; }
  view(empire: string): RankView { return rankOf(this.of(empire).yash); }
  /** record one finished battle */
  record(empire: string, won: boolean, firstClear: boolean, veteran: boolean): Gain {
    const e = this.of(empire);
    const before = e.yash, gain = yashFor(won, firstClear, veteran);
    e.yash += gain; e.played += 1;
    if (won) { e.wins += 1; if (veteran) e.vetWins += 1; }
    this.data[empire] = e; this.save();
    const lv0 = rankOf(before).level, lv1 = rankOf(e.yash).level;
    let kirti = 0;
    if (lv1 > lv0) { kirti = RANKS.yash.kirtiPerRankUp * (lv1 - lv0); this.meta.award(kirti); }
    return { yash: gain, before, after: e.yash, rankedUp: lv1 > lv0, kirti };
  }
}

let shared: Standing | null = null;
export const standing = (): Standing => (shared ??= new Standing());
