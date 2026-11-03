/* ============================================================
   YUDDH — meta progression (Kirti and per-card upgrades).
   Same save key as the prototype, so existing progress carries
   over. Storage is injectable so tests run without a browser.
   ============================================================ */
export interface MetaData { kirti: number; upgrades: Record<string, number>; done: Record<string, boolean> }
export interface Store { getItem(k: string): string | null; setItem(k: string, v: string): void }

const KEY = 'yuddh.meta.v2';
const LEGACY_KEY = 'yuddh.progress.v1';
export const MAX_LEVEL = 2;
export const UPGRADE_COST = [60, 140];

const memoryStore = (): Store => { const m = new Map<string, string>(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v); } }; };
function defaultStore(): Store {
  try { if (typeof localStorage !== 'undefined') { localStorage.getItem(KEY); return localStorage; } } catch { /* blocked */ }
  return memoryStore();
}

export class Meta {
  data: MetaData = { kirti: 0, upgrades: {}, done: {} };
  constructor(private store: Store = defaultStore()) { this.load(); }

  load(): MetaData {
    let d: Partial<MetaData> | null = null;
    try { d = JSON.parse(this.store.getItem(KEY) || 'null'); } catch { d = null; }
    if (!d) {
      try { const old = JSON.parse(this.store.getItem(LEGACY_KEY) || 'null'); d = { done: (old && old.done) || {} }; }
      catch { d = {}; }
    }
    this.data = { kirti: d.kirti || 0, upgrades: d.upgrades || {}, done: d.done || {} };
    return this.data;
  }
  save(): void { try { this.store.setItem(KEY, JSON.stringify(this.data)); } catch { /* full or blocked */ } }
  reset(): void { this.data = { kirti: 0, upgrades: {}, done: {} }; this.save(); }
  kirti(): number { return this.data.kirti; }
  award(n: number): number { this.data.kirti += Math.max(0, Math.round(n)); this.save(); return this.data.kirti; }
  level(cardId: string): number { return this.data.upgrades[cardId] || 0; }
  cost(cardId: string): number | null { const l = this.level(cardId); return l >= MAX_LEVEL ? null : UPGRADE_COST[l]; }
  canUpgrade(cardId: string): boolean { const c = this.cost(cardId); return c !== null && this.data.kirti >= c; }
  upgrade(cardId: string): { ok: true; level: number } | { ok: false; reason: string } {
    const c = this.cost(cardId);
    if (c === null || this.data.kirti < c) return { ok: false, reason: 'Not enough Kirti' };
    this.data.kirti -= c;
    this.data.upgrades[cardId] = this.level(cardId) + 1;
    this.save();
    return { ok: true, level: this.data.upgrades[cardId] };
  }
  upgrades(): Record<string, number> { return { ...this.data.upgrades }; }
  isDone(id: string): boolean { return !!this.data.done[id]; }
  markDone(id: string): boolean { const first = !this.data.done[id]; this.data.done[id] = true; this.save(); return first; }
  resetProgress(): void { this.data.done = {}; this.save(); }
}
