'use strict';
/* ============================================================
   YUDDH — meta progression.
   Kirti (fame) is earned by fighting. It buys permanent upgrades
   to individual cards, which then appear in every battle.
   ============================================================ */
(function () {

  const KEY = 'yuddh.meta.v2';
  const LEGACY_KEY = 'yuddh.progress.v1';
  const MAX_LEVEL = 2;
  const UPGRADE_COST = [60, 140];      // cost to reach level 1, then level 2

  const Meta = {
    data: { kirti: 0, upgrades: {}, done: {} },

    load() {
      let d = null;
      try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
      if (!d) {
        // migrate the old progress-only save
        try {
          const old = JSON.parse(localStorage.getItem(LEGACY_KEY));
          d = { kirti: 0, upgrades: {}, done: (old && old.done) || {} };
        } catch (e) { d = { kirti: 0, upgrades: {}, done: {} }; }
      }
      this.data = {
        kirti: d.kirti || 0,
        upgrades: d.upgrades || {},
        done: d.done || {}
      };
      return this.data;
    },

    save() {
      try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) {}
    },

    reset() {
      this.data = { kirti: 0, upgrades: {}, done: {} };
      this.save();
    },

    kirti() { return this.data.kirti; },

    award(n) {
      this.data.kirti += Math.max(0, Math.round(n));
      this.save();
      return this.data.kirti;
    },

    level(cardId) { return this.data.upgrades[cardId] || 0; },

    cost(cardId) {
      const lvl = this.level(cardId);
      return lvl >= MAX_LEVEL ? null : UPGRADE_COST[lvl];
    },

    canUpgrade(cardId) {
      const c = this.cost(cardId);
      return c !== null && this.data.kirti >= c;
    },

    upgrade(cardId) {
      const c = this.cost(cardId);
      if (c === null || this.data.kirti < c) return { ok: false, reason: 'Not enough Kirti' };
      this.data.kirti -= c;
      this.data.upgrades[cardId] = this.level(cardId) + 1;
      this.save();
      return { ok: true, level: this.data.upgrades[cardId] };
    },

    /* the upgrades map handed to the engine */
    upgrades() { return { ...this.data.upgrades }; },

    isDone(id) { return !!this.data.done[id]; },

    markDone(id) {
      const first = !this.data.done[id];
      this.data.done[id] = true;
      this.save();
      return first;                       // true the first time this mission was won
    },

    resetProgress() {
      this.data.done = {};
      this.save();
    }
  };

  Meta.load();
  if (typeof window !== 'undefined') window.YUDDH_META = Meta;
  if (typeof module !== 'undefined' && module.exports) module.exports = Meta;
})();
