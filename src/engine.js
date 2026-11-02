'use strict';
/* ============================================================
   YUDDH — Rise of the Rajyas   (engine v2)
   A tactical card game of ancient India. Pure rules engine:
   no DOM, no external deps. Runs in node and in the browser.
   v2 adds: scenarios (custom decks / board / HQ), objectives,
   modifiers, and a three-level single-player AI.
   ============================================================ */

const EMPIRES = {
  maurya: {
    id: 'maurya', name: 'Maurya', capital: 'Pataliputra', color: '#d99a2b', glyph: 'मौ',
    passive: 'Arthashastra — the first unit costing 3 or more that you deploy each turn costs 1 less Kosha.'
  },
  gupta: {
    id: 'gupta', name: 'Gupta', capital: 'Ujjain', color: '#2f8f74', glyph: 'गु',
    passive: 'Golden Age — the first Mantra you cast each turn draws a card.'
  },
  chalukya: {
    id: 'chalukya', name: 'Chalukya', capital: 'Badami', color: '#b4532a', glyph: 'चा',
    passive: 'Stone Forts — your Durg starts with 28 defence, and your Raksha units get +1 attack.'
  },
  chola: {
    id: 'chola', name: 'Chola', capital: 'Thanjavur', color: '#3f6fa8', glyph: 'चो',
    passive: 'Naval Supremacy — your ranged units get +1 attack.'
  },
  rajput: {
    id: 'rajput', name: 'Rajput', capital: 'Kannauj', color: '#a83f5b', glyph: 'रा',
    passive: 'Kshatra — your Vega units get +1 attack when deployed.'
  },
  neutral: { id: 'neutral', name: 'Mercenary', capital: '—', color: '#7c7466', glyph: 'सा', passive: 'Hired swords, available to every throne.' }
};
const EMPIRE_ORDER = ['maurya', 'gupta', 'chalukya', 'chola', 'rajput'];

/* ---------------- card table ---------------- */
const CARD_LIST = [
  /* ---------- neutral ---------- */
  { id: 'n_padati', name: 'Padati', sub: 'Swordsman', empire: 'neutral', type: 'unit', cost: 1, op: 1, atk: 1, hp: 2, range: 'melee', glyph: 'प', text: 'The backbone of every army.' },
  { id: 'n_dhanurdhar', name: 'Dhanurdhar', sub: 'Archer', empire: 'neutral', type: 'unit', cost: 2, op: 1, atk: 1, hp: 2, range: 'ranged', glyph: 'ध', text: 'Strikes from the Rajya line without taking a counter-blow.' },
  { id: 'n_ashvarohi', name: 'Ashvarohi', sub: 'Cavalry', empire: 'neutral', type: 'unit', cost: 2, op: 1, atk: 2, hp: 2, range: 'melee', kw: ['veg'], glyph: 'अ', text: 'Vega — can act the turn it is deployed.' },
  { id: 'n_rakshak', name: 'Rakshak', sub: 'Shield Wall', empire: 'neutral', type: 'unit', cost: 2, op: 1, atk: 1, hp: 4, range: 'melee', kw: ['raksha'], glyph: 'र', text: 'Raksha — enemy attacks must strike this unit first.' },
  { id: 'n_rathi', name: 'Rathi', sub: 'Chariot', empire: 'neutral', type: 'unit', cost: 3, op: 1, atk: 3, hp: 2, range: 'melee', kw: ['veg'], glyph: 'र', text: 'Vega. Fast, fragile, and always first over the line.' },
  { id: 'n_maharathi', name: 'Maharathi', sub: 'Elite Chariot', empire: 'neutral', type: 'unit', cost: 4, op: 2, atk: 4, hp: 4, range: 'melee', kw: ['veg'], glyph: 'म', text: 'Vega. A commander of ten thousand.' },
  { id: 'n_gaja', name: 'Gaja', sub: 'War Elephant', empire: 'neutral', type: 'unit', cost: 4, op: 2, atk: 4, hp: 5, range: 'melee', kw: ['raksha'], glyph: 'ग', text: 'Raksha. The wall that walks.' },
  { id: 'n_senapati', name: 'Senapati', sub: 'Commander', empire: 'neutral', type: 'unit', cost: 3, op: 1, atk: 2, hp: 3, range: 'melee', glyph: 'से', text: 'Deploy — your other units in this line get +1 attack.', deploy: 'buffLine' },
  { id: 'n_atirathi', name: 'Atirathi', sub: 'Legendary Warrior', empire: 'neutral', type: 'unit', cost: 5, op: 2, atk: 6, hp: 5, range: 'melee', kw: ['veg'], glyph: 'अ', text: 'Vega. One who fights a thousand chariots alone.' },
  { id: 'n_aakraman', name: 'Aakraman', sub: 'Assault', empire: 'neutral', type: 'order', cost: 2, target: 'enemyUnit', glyph: 'आ', text: 'Deal 2 damage to an enemy unit.' },
  { id: 'n_sena_bhojan', name: 'Sena Bhojan', sub: 'Supply Column', empire: 'neutral', type: 'order', cost: 2, glyph: 'भ', text: 'Restore 4 defence to your Durg.' },
  { id: 'n_yudh_niti', name: 'Yudh Niti', sub: 'Strategy', empire: 'neutral', type: 'order', cost: 3, glyph: 'नी', text: 'Draw 2 cards.' },

  /* ---------- Yantra — played face-down, springs on the enemy's turn ---------- */
  { id: 'y_vighna', name: 'Vighna Yantra', sub: 'Obstruction', empire: 'neutral', type: 'yantra', kind: 'yantra',
    cost: 2, glyph: 'वि', trigger: 'onEnemyDeploy', power: 0,
    text: 'Yantra — when the enemy deploys a unit, destroy it.' },
  { id: 'y_kavach', name: 'Kavach Yantra', sub: 'Ward', empire: 'neutral', type: 'yantra', kind: 'yantra',
    cost: 2, glyph: 'क', trigger: 'onHQAttack', power: 4,
    text: 'Yantra — when the enemy attacks your Durg, prevent 4 damage.' },
  { id: 'y_pratikar', name: 'Pratikar Yantra', sub: 'Reprisal', empire: 'neutral', type: 'yantra', kind: 'yantra',
    cost: 2, glyph: 'प्र', trigger: 'onUnitAttack', power: 3,
    text: 'Yantra — when an enemy unit attacks one of yours, deal 3 damage to it.' },

  /* ---------- Shakti — the decisive stroke ---------- */
  { id: 's_agni', name: 'Agni Baan', sub: 'Fire Arrow', empire: 'neutral', type: 'order', kind: 'shakti',
    cost: 4, target: 'enemyUnit', glyph: 'अ', text: 'Shakti — deal 5 damage to an enemy unit.' },
  { id: 's_chakravyuha', name: 'Chakravyuha', sub: 'Encircling Formation', empire: 'neutral', type: 'order', kind: 'shakti',
    cost: 5, glyph: 'च', text: 'Shakti — deal 2 damage to every enemy unit.' },
  { id: 's_ashwamedha', name: 'Ashwamedha', sub: 'Horse Sacrifice', empire: 'neutral', type: 'order', kind: 'shakti',
    cost: 6, glyph: 'अ', text: 'Shakti — all your units get +2 attack and +2 defence.' },
  { id: 'n_visha_baan', name: 'Visha Baan', sub: 'Poisoned Arrows', empire: 'neutral', type: 'order', cost: 4, glyph: 'वि', text: 'Deal 1 damage to every enemy unit.' },

  /* ---------- Maurya ---------- */
  { id: 'm_padati', name: 'Mauryan Padati', sub: 'Swordsman', empire: 'maurya', type: 'unit', cost: 1, op: 1, atk: 2, hp: 1, range: 'melee', glyph: 'प', text: 'Cheap, drilled, endless.' },
  { id: 'm_gudhchar', name: 'Gudhchar', sub: 'Spy', empire: 'maurya', type: 'unit', cost: 2, op: 1, atk: 1, hp: 1, range: 'ranged', glyph: 'गू', text: 'Deploy — draw a card.', deploy: 'draw1' },
  { id: 'm_hasti', name: 'Hasti Sena', sub: 'Elephant Corps', empire: 'maurya', type: 'unit', cost: 5, op: 2, atk: 5, hp: 5, range: 'melee', glyph: 'ह', text: 'The arm that broke Seleucus.' },
  { id: 'm_chanakya', name: 'Chanakya', sub: 'Strategist', empire: 'maurya', type: 'unit', cost: 4, op: 1, atk: 2, hp: 4, range: 'melee', glyph: 'चा', text: 'Deploy — draw a card and gain 1 Kosha.', deploy: 'drawKosha' },
  { id: 'm_chandragupta', name: 'Chandragupta', sub: 'Samrat', empire: 'maurya', type: 'unit', cost: 7, op: 2, atk: 6, hp: 7, range: 'melee', kw: ['veg'], glyph: 'स', text: 'Vega. Deploy — all your units get +1 attack.', deploy: 'buffAll' },
  { id: 'm_arthashastra', name: 'Arthashastra', sub: 'Treatise', empire: 'maurya', type: 'order', cost: 3, glyph: 'अ', text: 'Draw a card and gain 2 Kosha.' },

  /* ---------- Gupta ---------- */
  { id: 'g_dhanurdhar', name: 'Gupta Dhanurdhar', sub: 'Archer', empire: 'gupta', type: 'unit', cost: 2, op: 1, atk: 2, hp: 2, range: 'ranged', glyph: 'ध', text: 'Trained in the akhadas of the golden age.' },
  { id: 'g_pandit', name: 'Nalanda Pandit', sub: 'Scholar', empire: 'gupta', type: 'unit', cost: 3, op: 1, atk: 1, hp: 4, range: 'melee', glyph: 'पं', text: 'Deploy — draw a card.', deploy: 'draw1' },
  { id: 'g_ashvarohi', name: 'Gupta Ashvarohi', sub: 'Cavalry', empire: 'gupta', type: 'unit', cost: 3, op: 1, atk: 3, hp: 2, range: 'melee', kw: ['veg'], glyph: 'अ', text: 'Vega.' },
  { id: 'g_mandir', name: 'Mandir Shilpi', sub: 'Temple Builder', empire: 'gupta', type: 'unit', cost: 2, op: 1, atk: 1, hp: 3, range: 'melee', glyph: 'शि', text: 'Deploy — gain 1 Kosha.', deploy: 'kosha1' },
  { id: 'g_samudragupta', name: 'Samudragupta', sub: 'Samrat', empire: 'gupta', type: 'unit', cost: 7, op: 2, atk: 6, hp: 7, range: 'melee', kw: ['veg'], glyph: 'स', text: 'Vega. Deploy — all your units get +1 attack.', deploy: 'buffAll' },
  { id: 'g_swarn_yug', name: 'Swarn Yug', sub: 'Golden Age', empire: 'gupta', type: 'order', cost: 4, glyph: 'स्व', text: 'Draw 2 cards and restore 3 to your Durg.' },

  /* ---------- Chalukya ---------- */
  { id: 'c_rakshak', name: 'Durg Rakshak', sub: 'Fort Guard', empire: 'chalukya', type: 'unit', cost: 2, op: 1, atk: 2, hp: 5, range: 'melee', kw: ['raksha'], glyph: 'र', text: 'Raksha. Carved into the rock of Badami.' },
  { id: 'c_ashvarohi', name: 'Chalukya Ashvarohi', sub: 'Cavalry', empire: 'chalukya', type: 'unit', cost: 3, op: 1, atk: 3, hp: 4, range: 'melee', kw: ['veg'], glyph: 'अ', text: 'Vega.' },
  { id: 'c_gaja', name: 'Chalukya Gaja', sub: 'War Elephant', empire: 'chalukya', type: 'unit', cost: 5, op: 2, atk: 5, hp: 5, range: 'melee', kw: ['raksha'], glyph: 'ग', text: 'Raksha.' },
  { id: 'c_pulakeshin', name: 'Pulakeshin II', sub: 'Samrat', empire: 'chalukya', type: 'unit', cost: 7, op: 2, atk: 6, hp: 6, range: 'melee', kw: ['veg', 'raksha'], glyph: 'स', text: 'Vega, Raksha. He turned back Harsha at the Narmada.' },
  { id: 'c_senapati', name: 'Chalukya Senapati', sub: 'Commander', empire: 'chalukya', type: 'unit', cost: 4, op: 1, atk: 3, hp: 4, range: 'melee', glyph: 'से', text: 'Deploy — your other units in this line get +1 attack.', deploy: 'buffLine' },
  { id: 'c_shilpa', name: 'Shilpa Kala', sub: 'Temple Engineering', empire: 'chalukya', type: 'order', cost: 3, glyph: 'शि', text: 'Restore 5 to your Durg and gain 1 Kosha.' },

  /* ---------- Chola ---------- */
  { id: 'ch_navik', name: 'Chola Navik', sub: 'Marine', empire: 'chola', type: 'unit', cost: 2, op: 1, atk: 3, hp: 3, range: 'melee', glyph: 'न', text: 'Fights as well ashore as afloat.' },
  { id: 'ch_archer', name: 'Chola Dhanurdhar', sub: 'Archer', empire: 'chola', type: 'unit', cost: 2, op: 1, atk: 2, hp: 3, range: 'ranged', glyph: 'ध', text: 'Ranged.' },
  { id: 'ch_pot', name: 'Yuddh Pot', sub: 'Warship', empire: 'chola', type: 'unit', cost: 4, op: 2, atk: 5, hp: 5, range: 'ranged', glyph: 'पो', text: 'Ranged. The Bay of Bengal was a Chola lake.' },
  { id: 'ch_rajaraja', name: 'Rajaraja Chola', sub: 'Samrat', empire: 'chola', type: 'unit', cost: 7, op: 2, atk: 6, hp: 6, range: 'ranged', glyph: 'स', text: 'Deploy — draw a card.', deploy: 'draw1' },
  { id: 'ch_sena', name: 'Chola Senapati', sub: 'Commander', empire: 'chola', type: 'unit', cost: 3, op: 1, atk: 3, hp: 3, range: 'melee', glyph: 'से', text: 'Deploy — your other units in this line get +1 attack.', deploy: 'buffLine' },
  { id: 'ch_vyapari', name: 'Chola Vyapari', sub: 'Sea Trader', empire: 'chola', type: 'order', cost: 1, glyph: 'व्या', text: 'Gain 2 Kosha.' },

  /* ---------- Rajput ---------- */
  { id: 'r_yoddha', name: 'Rajput Yoddha', sub: 'Warrior', empire: 'rajput', type: 'unit', cost: 2, op: 1, atk: 3, hp: 2, range: 'melee', kw: ['veg'], glyph: 'यो', text: 'Vega.' },
  { id: 'r_archer', name: 'Pratihara Dhanurdhar', sub: 'Archer', empire: 'rajput', type: 'unit', cost: 2, op: 1, atk: 2, hp: 2, range: 'ranged', glyph: 'ध', text: 'Ranged.' },
  { id: 'r_gaja', name: 'Pratihara Gaja', sub: 'War Elephant', empire: 'rajput', type: 'unit', cost: 4, op: 2, atk: 4, hp: 4, range: 'melee', kw: ['raksha'], glyph: 'ग', text: 'Raksha.' },
  { id: 'r_maharathi', name: 'Rajput Maharathi', sub: 'Elite Chariot', empire: 'rajput', type: 'unit', cost: 5, op: 2, atk: 5, hp: 5, range: 'melee', kw: ['veg'], glyph: 'म', text: 'Vega.' },
  { id: 'r_prithviraj', name: 'Prithviraj Chauhan', sub: 'Samrat', empire: 'rajput', type: 'unit', cost: 7, op: 2, atk: 6, hp: 6, range: 'melee', kw: ['veg'], glyph: 'स', text: 'Vega. Deploy — all your units get +1 attack.', deploy: 'buffAll' },
  { id: 'r_sena', name: 'Rajput Senapati', sub: 'Commander', empire: 'rajput', type: 'unit', cost: 4, op: 1, atk: 3, hp: 4, range: 'melee', glyph: 'से', text: 'Deploy — your other units in this line get +1 attack.', deploy: 'buffLine' },
  { id: 'r_kshatra', name: 'Kshatra Dharma', sub: 'Code of War', empire: 'rajput', type: 'order', cost: 2, glyph: 'क्ष', text: 'Your units in the Yudhbhumi get +2 attack.' }
];

const CARDS = {};
CARD_LIST.forEach(c => { CARDS[c.id] = c; });
const KW_LABEL = { veg: 'Vega', raksha: 'Raksha', dhuan: 'Dhuan' };

/* ---------------- helpers ---------------- */
function rngFactory(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function buildDeck(empire, ally) {
  const deck = [];
  CARD_LIST.filter(c => c.empire === empire).forEach(c => { deck.push(c.id); deck.push(c.id); });
  CARD_LIST.filter(c => c.empire === ally).forEach(c => deck.push(c.id));
  CARD_LIST.filter(c => c.empire === 'neutral').forEach(c => deck.push(c.id));
  return deck;
}
function log(st, msg, side) {
  st.log.push({ turn: st.turn, msg, side: side === undefined ? st.active : side });
  if (st.log.length > 240) st.log.shift();
}

function makeUnit(st, cardId, owner) {
  const c = CARDS[cardId];
  const u = {
    uid: st.nextUid++, cardId, name: c.name, sub: c.sub, glyph: c.glyph, empire: c.empire,
    atk: c.atk, hp: c.hp, maxHp: c.hp, op: c.op, range: c.range,
    kw: (c.kw || []).slice(), owner,
    canAct: false, moved: false, attacked: false, smokeBroken: false
  };
  const lvl = (st.players[owner].upgrades && st.players[owner].upgrades[cardId]) || 0;
  if (lvl) { u.atk += lvl; u.hp += lvl; u.maxHp += lvl; u.upgraded = lvl; }
  const emp = st.players[owner].empire;
  if (emp === 'rajput' && u.kw.includes('veg')) u.atk += 1;
  if (emp === 'chola' && u.range === 'ranged') u.atk += 1;
  if (emp === 'chalukya' && u.kw.includes('raksha')) u.atk += 1;
  return u;
}

function makePlayer(st, side, cfg) {
  const empire = cfg.empire, ally = cfg.ally || 'neutral';
  const emp = EMPIRES[empire];
  const baseHq = cfg.hq || (empire === 'chalukya' ? 28 : 24);
  const deckList = cfg.deck && cfg.deck.length ? cfg.deck.slice() : buildDeck(empire, ally);
  const p = {
    side, empire, ally,
    faction: cfg.faction || emp.name,
    hq: { name: cfg.capital || emp.capital, hp: baseHq, maxHp: baseHq },
    kosha: 1, maxKosha: cfg.startKosha || 1,
    deck: shuffle(deckList, st.rng),
    hand: [], discard: [],
    support: [], yantras: [], fatigue: 0,
    upgrades: cfg.upgrades || {},
    drawBonus: cfg.drawBonus || 0,
    counters: { ordersPlayed: 0, unitsThisTurn: 0 }
  };
  return p;
}

function draw(st, pIdx, n) {
  const p = st.players[pIdx];
  for (let i = 0; i < (n || 1); i++) {
    if (p.deck.length === 0) {
      p.fatigue += 1;
      p.hq.hp -= p.fatigue;
      log(st, `Deck exhausted — ${EMPIRES[p.empire].name} takes ${p.fatigue} attrition damage.`, pIdx);
      checkDeath(st);
      continue;
    }
    if (p.hand.length >= 10) { p.discard.push(p.deck.pop()); continue; }
    p.hand.push(p.deck.pop());
  }
}

function checkDeath(st) {
  if (st.over) return;
  const a = st.players[0].hq.hp <= 0;
  const b = st.players[1].hq.hp <= 0;
  if (!a && !b) return;
  st.over = true;
  if (a && b) st.winner = null;
  else st.winner = a ? 1 : 0;
  st.winReason = a && b ? 'both' : 'destroy';
  log(st, st.winner === null ? 'Both capitals burn. A draw.' : `${EMPIRES[st.players[st.winner].empire].name} wins the war.`, st.winner === null ? 0 : st.winner);
}

function findUnit(st, owner, uid) {
  const p = st.players[owner];
  let u = p.support.find(x => x.uid === uid);
  if (u) return { unit: u, line: 'support' };
  if (st.front.owner === owner) {
    u = st.front.units.find(x => x.uid === uid);
    if (u) return { unit: u, line: 'front' };
  }
  return null;
}
function allUnits(st, owner) {
  const out = st.players[owner].support.map(u => ({ unit: u, line: 'support' }));
  if (st.front.owner === owner) st.front.units.forEach(u => out.push({ unit: u, line: 'front' }));
  return out;
}
function destroyUnit(st, owner, uid) {
  const p = st.players[owner];
  let idx = p.support.findIndex(x => x.uid === uid);
  if (idx >= 0) {
    const [u] = p.support.splice(idx, 1);
    p.discard.push(u.cardId);
    log(st, `${u.name} is destroyed.`, owner);
  } else if (st.front.owner === owner) {
    idx = st.front.units.findIndex(x => x.uid === uid);
    if (idx >= 0) {
      const [u] = st.front.units.splice(idx, 1);
      p.discard.push(u.cardId);
      log(st, `${u.name} falls on the Yudhbhumi.`, owner);
      if (st.front.units.length === 0) st.front.owner = null;
    }
  }
}
function damageUnit(st, owner, uid, amount) {
  const f = findUnit(st, owner, uid);
  if (!f) return;
  f.unit.hp -= amount;
  if (f.unit.hp <= 0) destroyUnit(st, owner, uid);
}
function damageAll(st, owner, amount) {
  allUnits(st, owner).slice().forEach(x => damageUnit(st, owner, x.unit.uid, amount));
}
function damageHQ(st, owner, amount) {
  const p = st.players[owner];
  p.hq.hp -= amount;
  log(st, `${EMPIRES[p.empire].name}'s Durg takes ${amount} damage.`, owner);
  checkDeath(st);
}
function koshaCost(st, owner, card) {
  let c = card.cost;
  const pl = st.players[owner];
  const lvl = (pl.upgrades && pl.upgrades[card.id]) || 0;
  if (card.type !== 'unit' && lvl) c = Math.max(1, c - lvl);
  if (card.type === 'unit' && card.cost >= 3 && pl.empire === 'maurya' && (pl.counters.unitsThisTurn || 0) === 0) c = c - 1;
  return c;
}

/* ---------------- game creation ---------------- */
function newGame(opts) {
  const st = {
    seed: opts.seed === undefined ? 1 : opts.seed,
    turn: 1, active: 0, over: false, winner: null, winReason: null,
    log: [], nextUid: 1, events: [],
    front: { owner: null, units: [] },
    players: [],
    aiLevel: opts.aiLevel || 'normal',
    objective: opts.objective || { type: 'destroy' },
    scenarioId: opts.scenarioId || null,
    scenarioName: opts.scenarioName || null
  };
  st.rng = rngFactory(st.seed);
  st.players.push(makePlayer(st, 'p0', opts.player));
  st.players.push(makePlayer(st, 'p1', opts.enemy));

  // preset battlefield
  const preset = opts.preset || {};
  (preset.enemyFront || []).forEach(cardId => {
    const u = makeUnit(st, cardId, 1);
    u.canAct = true;
    st.front.units.push(u);
  });
  if (st.front.units.length) st.front.owner = 1;
  (preset.playerFront || []).forEach(cardId => {
    if (st.front.owner !== null) return;
    const u = makeUnit(st, cardId, 0);
    u.canAct = true;
    st.front.units.push(u);
    st.front.owner = 0;
  });
  (preset.enemySupport || []).forEach(cardId => { const u = makeUnit(st, cardId, 1); u.canAct = true; st.players[1].support.push(u); });
  (preset.playerSupport || []).forEach(cardId => { const u = makeUnit(st, cardId, 0); u.canAct = true; st.players[0].support.push(u); });

  draw(st, 0, opts.player.handSize || 4);
  draw(st, 1, opts.enemy.handSize || 4);
  if (opts.player.openingHand && opts.player.openingHand.length) {
    const p0 = st.players[0];
    const wanted = opts.player.openingHand.slice();
    // put the randomly drawn cards back, then take the scripted ones out
    p0.deck.push(...p0.hand);
    shuffle(p0.deck, st.rng);
    wanted.forEach(cid => {
      const i = p0.deck.indexOf(cid);
      if (i >= 0) p0.deck.splice(i, 1);
    });
    p0.hand = wanted;
  }
  startTurn(st, 0, true);
  log(st, 'The war begins.', 0);
  return st;
}

function startTurn(st, idx, first) {
  if (st.over) return;
  const p = st.players[idx];
  st.active = idx;
  p.maxKosha = Math.min(12, p.maxKosha + 1);
  p.kosha = p.maxKosha;
  p.counters.unitsThisTurn = 0;
  p.counters.mantraThisTurn = false;
  allUnits(st, idx).forEach(x => {
    x.unit.canAct = true;
    x.unit.moved = false;
    x.unit.attacked = false;
  });
  if (!first) draw(st, idx, 1 + (p.drawBonus || 0));
  log(st, `${EMPIRES[p.empire].name} — turn begins.`, idx);

  // clock objectives, checked when a new round begins
  if (idx === 0 && st.objective.turns && st.turn > st.objective.turns) {
    if (st.objective.type === 'survive') {
      st.over = true; st.winner = 0; st.winReason = 'survive';
      log(st, 'The enemy host disperses. The line held.', 0);
    } else if (st.objective.type === 'deadline') {
      st.over = true; st.winner = 1; st.winReason = 'deadline';
      log(st, 'Reinforcements arrive. The moment has passed.', 1);
    }
  }
}


/* ---------- Yantra resolution ---------- */
function fireYantra(st, owner, trigger, ctx) {
  const p = st.players[owner];
  if (!p || !p.yantras || !p.yantras.length) return null;
  const idx = p.yantras.findIndex(y => {
    const c = CARDS[y.cardId];
    return c && c.trigger === trigger;
  });
  if (idx < 0) return null;
  const [y] = p.yantras.splice(idx, 1);
  const c = CARDS[y.cardId];
  p.discard.push(y.cardId);
  log(st, `${EMPIRES[p.empire].name} springs a ${c.name}.`, owner);
  pushEvent(st, { t: 'yantra', owner, cardId: y.cardId });
  return { card: c, power: c.power || 0 };
}

function pushEvent(st, e) {
  if (!st.events) st.events = [];
  st.events.push(e);
}

/* ---------------- legality ---------------- */
function hasGuard(list) { return list.some(u => u.kw.includes('raksha')); }

function canAttack(st, pIdx, attackerUid, target) {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const found = findUnit(st, pIdx, attackerUid);
  if (!found) return { ok: false, reason: 'No such unit' };
  const a = found.unit;
  if (!a.canAct || a.attacked) return { ok: false, reason: 'Already acted' };
  if (p.kosha < a.op) return { ok: false, reason: 'Not enough Kosha' };
  const fromSupport = found.line === 'support';

  if (target.kind === 'hq') {
    if (target.owner === pIdx) return { ok: false, reason: 'Own capital' };
    if (fromSupport) return { ok: false, reason: 'Only from the Yudhbhumi' };
    if (st.front.owner !== pIdx) return { ok: false, reason: 'You do not hold the Yudhbhumi' };
    // Raksha guards protect units, not the capital: only the Yudhbhumi gates a Durg assault.
    return { ok: true };
  }

  if (target.owner === pIdx) return { ok: false, reason: 'Friendly unit' };
  const f = findUnit(st, target.owner, target.uid);
  if (!f) return { ok: false, reason: 'No such target' };
  if (f.unit.kw.includes('dhuan') && !f.unit.smokeBroken) return { ok: false, reason: 'Hidden by Dhuan' };
  if (fromSupport && f.line !== 'front') return { ok: false, reason: 'From your Rajya line you can only strike the Yudhbhumi' };

  const sameLine = f.line === 'front' ? st.front.units : st.players[target.owner].support;
  if (hasGuard(sameLine) && !f.unit.kw.includes('raksha')) return { ok: false, reason: 'A Raksha unit shields this one' };
  return { ok: true };
}

function canMove(st, pIdx, uid) {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const found = findUnit(st, pIdx, uid);
  if (!found || found.line !== 'support') return { ok: false, reason: 'Only from the Rajya line' };
  const u = found.unit;
  if (!u.canAct || u.moved) return { ok: false, reason: 'Already acted' };
  if (p.kosha < u.op) return { ok: false, reason: 'Not enough Kosha' };
  if (st.front.owner !== null && st.front.owner !== pIdx) return { ok: false, reason: 'The enemy holds the Yudhbhumi' };
  if (st.front.units.length >= 4) return { ok: false, reason: 'The Yudhbhumi is full' };
  return { ok: true };
}

function canPlay(st, pIdx, handIdx, target) {
  if (st.over) return { ok: false, reason: 'Game over' };
  if (pIdx !== st.active) return { ok: false, reason: 'Not your turn' };
  const p = st.players[pIdx];
  const cardId = p.hand[handIdx];
  if (!cardId) return { ok: false, reason: 'No such card' };
  const c = CARDS[cardId];
  if (p.kosha < koshaCost(st, pIdx, c)) return { ok: false, reason: 'Not enough Kosha' };
  if (c.type === 'unit' && p.support.length >= 4) return { ok: false, reason: 'Rajya line is full' };
  if (c.type === 'yantra' && p.yantras.length >= 2) return { ok: false, reason: 'You have two Yantras set' };
  if (c.target === 'enemyUnit') {
    if (!target || target.kind !== 'unit') return { ok: false, reason: 'Choose an enemy unit' };
    const f = findUnit(st, target.owner, target.uid);
    if (!f || target.owner === pIdx) return { ok: false, reason: 'Choose an enemy unit' };
    if (f.unit.kw.includes('dhuan') && !f.unit.smokeBroken) return { ok: false, reason: 'Hidden by Dhuan' };
  }
  return { ok: true };
}

/* ---------------- effects ---------------- */
function applyDeploy(st, pIdx, unit, line) {
  const c = CARDS[unit.cardId];
  const p = st.players[pIdx];
  switch (c.deploy) {
    case 'draw1': draw(st, pIdx, 1); break;
    case 'drawKosha': draw(st, pIdx, 1); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'kosha1': p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'buffLine': {
      const list = line === 'front' ? st.front.units : p.support;
      list.forEach(u => { if (u.uid !== unit.uid) u.atk += 1; });
      break;
    }
    case 'buffAll': allUnits(st, pIdx).forEach(x => { x.unit.atk += 1; }); break;
  }
}

function applyOrder(st, pIdx, cardId, target) {
  const p = st.players[pIdx];
  switch (cardId) {
    case 'n_aakraman': damageUnit(st, target.owner, target.uid, 2); break;
    case 'n_sena_bhojan': p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 4); break;
    case 'n_yudh_niti': draw(st, pIdx, 2); break;
    case 'n_visha_baan': damageAll(st, 1 - pIdx, 1); break;
    case 'm_arthashastra': draw(st, pIdx, 1); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 2); break;
    case 'g_swarn_yug': draw(st, pIdx, 2); p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 3); break;
    case 'c_shilpa': p.hq.hp = Math.min(p.hq.maxHp, p.hq.hp + 5); p.kosha = Math.min(p.maxKosha + 1, p.kosha + 1); break;
    case 'ch_vyapari': p.kosha = Math.min(p.maxKosha + 1, p.kosha + 2); break;
    case 'r_kshatra': if (st.front.owner === pIdx) st.front.units.forEach(u => { u.atk += 2; }); break;
    case 's_agni': damageUnit(st, target.owner, target.uid, 5); break;
    case 's_chakravyuha': damageAll(st, 1 - pIdx, 2); break;
    case 's_ashwamedha':
      allUnits(st, pIdx).forEach(x => { x.unit.atk += 2; x.unit.hp += 2; x.unit.maxHp += 2; });
      break;
  }
  p.counters.ordersPlayed += 1;
  if (p.empire === 'gupta' && CARDS[cardId].kind !== 'shakti' && !p.counters.mantraThisTurn) {
    p.counters.mantraThisTurn = true;
    draw(st, pIdx, 1);
  }
  checkDeath(st);
}

/* ---------------- actions ---------------- */
function applyAction(st, action) {
  if (st.over) return { ok: false, reason: 'Game over' };
  const pIdx = st.active;
  const p = st.players[pIdx];

  if (action.type === 'play') {
    const chk = canPlay(st, pIdx, action.handIndex, action.target);
    if (!chk.ok) return chk;
    const cardId = p.hand[action.handIndex];
    const c = CARDS[cardId];
    p.kosha -= koshaCost(st, pIdx, c);
    p.hand.splice(action.handIndex, 1);

    if (c.type === 'unit') {
      const u = makeUnit(st, cardId, pIdx);
      p.support.push(u);
      u.canAct = u.kw.includes('veg');
      p.counters.unitsThisTurn = (p.counters.unitsThisTurn || 0) + 1;
      log(st, `${EMPIRES[p.empire].name} deploys ${u.name}.`, pIdx);
      pushEvent(st, { t: 'deploy', owner: pIdx, uid: u.uid, cardId });
      applyDeploy(st, pIdx, u, 'support');
      // an enemy Vighna Yantra may unmake the deployment
      const trap = fireYantra(st, 1 - pIdx, 'onEnemyDeploy', { unit: u });
      if (trap) destroyUnit(st, pIdx, u.uid);
    } else if (c.type === 'yantra') {
      p.yantras.push({ cardId, uid: st.nextUid++ });
      log(st, `${EMPIRES[p.empire].name} sets a Yantra, face down.`, pIdx);
      pushEvent(st, { t: 'yantraSet', owner: pIdx });
    } else {
      log(st, `${EMPIRES[p.empire].name} casts ${c.name}.`, pIdx);
      pushEvent(st, { t: 'order', owner: pIdx, cardId });
      p.discard.push(cardId);
      applyOrder(st, pIdx, cardId, action.target);
    }
    checkDeath(st);
    return { ok: true };
  }

  if (action.type === 'move') {
    const chk = canMove(st, pIdx, action.uid);
    if (!chk.ok) return chk;
    const f = findUnit(st, pIdx, action.uid);
    const u = f.unit;
    p.kosha -= u.op;
    p.support.splice(p.support.findIndex(x => x.uid === u.uid), 1);
    if (st.front.owner === null) st.front.owner = pIdx;
    st.front.units.push(u);
    u.moved = true;
    log(st, `${u.name} advances to the Yudhbhumi.`, pIdx);
    pushEvent(st, { t: 'move', owner: pIdx, uid: u.uid });
    return { ok: true };
  }

  if (action.type === 'attack') {
    const chk = canAttack(st, pIdx, action.uid, action.target);
    if (!chk.ok) return chk;
    const f = findUnit(st, pIdx, action.uid);
    const a = f.unit;
    p.kosha -= a.op;
    a.attacked = true;
    if (a.kw.includes('dhuan')) a.smokeBroken = true;

    if (action.target.kind === 'hq') {
      let dmg = a.atk;
      const ward = fireYantra(st, action.target.owner, 'onHQAttack', { attacker: a });
      if (ward) dmg = Math.max(0, dmg - ward.power);
      log(st, dmg > 0
        ? `${a.name} strikes the enemy Durg for ${dmg}.`
        : `${a.name}'s blow is turned aside by the ward.`, pIdx);
      pushEvent(st, { t: 'hq', owner: action.target.owner, dmg, attacker: pIdx });
      if (dmg > 0) damageHQ(st, action.target.owner, dmg);
      return { ok: true };
    }
    const tf = findUnit(st, action.target.owner, action.target.uid);
    const d = tf.unit;
    log(st, `${a.name} attacks ${d.name}.`, pIdx);
    pushEvent(st, { t: 'attack', owner: pIdx, uid: a.uid, target: { owner: action.target.owner, uid: d.uid }, dmg: a.atk });
    d.hp -= a.atk;
    const dmgBack = (a.range === 'melee' && d.range === 'melee') ? d.atk : 0;
    if (dmgBack > 0) a.hp -= dmgBack;
    if (d.hp <= 0) { pushEvent(st, { t: 'death', owner: action.target.owner, uid: d.uid }); destroyUnit(st, action.target.owner, d.uid); }
    if (a.hp <= 0) { pushEvent(st, { t: 'death', owner: pIdx, uid: a.uid }); destroyUnit(st, pIdx, a.uid); }
    // a Pratikar Yantra punishes the attacker
    const reprisal = fireYantra(st, action.target.owner, 'onUnitAttack', { attacker: a });
    if (reprisal) damageUnit(st, pIdx, a.uid, reprisal.power);
    checkDeath(st);
    return { ok: true };
  }

  if (action.type === 'end') {
    log(st, `${EMPIRES[p.empire].name} ends the turn.`, pIdx);
    const next = 1 - pIdx;
    if (next === 0) st.turn += 1;
    startTurn(st, next);
    return { ok: true };
  }
  return { ok: false, reason: 'Unknown action' };
}

/* ============================================================
   AI — three levels. All decisions go through the public rules
   API, so the AI can never cheat.
   ============================================================ */
function unitValue(u) {
  return u.atk * 1.35 + u.hp + (u.kw.includes('raksha') ? 1.5 : 0) + (u.kw.includes('veg') ? 1 : 0);
}

/* total damage we could put into the enemy HQ this turn */
function faceDamageAvailable(st, pIdx) {
  const enemy = 1 - pIdx;
  const cands = allUnits(st, pIdx)
    .filter(x => canAttack(st, pIdx, x.unit.uid, { kind: 'hq', owner: enemy }).ok)
    .map(x => x.unit)
    .sort((a, b) => a.op - b.op);
  let kosha = st.players[pIdx].kosha, total = 0;
  for (const u of cands) { if (kosha >= u.op) { kosha -= u.op; total += u.atk; } }
  return total;
}
function hasLethal(st, pIdx) {
  return faceDamageAvailable(st, pIdx) >= st.players[1 - pIdx].hq.hp;
}

/* score a single attack */
function boardPower(st, owner) {
  let v = 0;
  allUnits(st, owner).forEach(x => { v += unitValue(x.unit); });
  return v;
}
function attackScore(st, pIdx, a, target, aggr) {
  const enemy = 1 - pIdx;
  const k = aggr || 1;
  if (target.kind === 'hq') {
    const hp = st.players[enemy].hq.hp;
    return a.atk >= hp ? 5000 : a.atk * 1.6 * k;
  }
  const f = findUnit(st, enemy, target.uid);
  if (!f) return -1;
  const d = f.unit;
  const kills = a.atk >= d.hp;
  const retaliation = (a.range === 'melee' && d.range === 'melee') ? d.atk : 0;
  const weDie = retaliation >= a.hp;
  let s = 0;
  if (kills) s += unitValue(d) + 2.5;
  else s += Math.min(a.atk, d.hp) * 0.45;
  if (retaliation) s -= Math.min(retaliation, a.hp) * 0.7;
  if (weDie) s -= unitValue(a) * 0.85;
  if (kills && !weDie) s += 2;
  if (f.line === 'front' && kills) s += 1.5;   // breaking their hold on the line
  if (d.atk >= 5) s += 1.5;                     // kill their big threats
  return s;
}

function bestAttackFor(st, pIdx, unit) {
  const enemy = 1 - pIdx;
  const opts = [];
  const hqChk = canAttack(st, pIdx, unit.uid, { kind: 'hq', owner: enemy });
  if (hqChk.ok) opts.push({ target: { kind: 'hq', owner: enemy }, score: attackScore(st, pIdx, unit, { kind: 'hq', owner: enemy }) });
  allUnits(st, enemy).forEach(x => {
    const t = { kind: 'unit', owner: enemy, uid: x.unit.uid };
    if (!canAttack(st, pIdx, unit.uid, t).ok) return;
    opts.push({ target: t, score: attackScore(st, pIdx, unit, t) });
  });
  opts.sort((a, b) => b.score - a.score);
  return opts[0] || null;
}

function playableCards(st, pIdx) {
  const p = st.players[pIdx];
  const out = [];
  p.hand.forEach((cardId, i) => {
    const c = CARDS[cardId];
    if (p.kosha < koshaCost(st, pIdx, c)) return;
    if (c.type === 'unit') {
      if (!canPlay(st, pIdx, i).ok) return;
      out.push({ i, c, target: null, kind: 'unit' });
    } else if (c.target === 'enemyUnit') {
      const enemy = 1 - pIdx;
      allUnits(st, enemy).forEach(x => {
        const t = { kind: 'unit', owner: enemy, uid: x.unit.uid };
        if (canPlay(st, pIdx, i, t).ok) out.push({ i, c, target: t, kind: 'removal', victim: x.unit });
      });
    } else {
      if (canPlay(st, pIdx, i).ok) out.push({ i, c, target: null, kind: 'order' });
    }
  });
  return out;
}

function orderValue(st, pIdx, entry) {
  const p = st.players[pIdx];
  const enemy = 1 - pIdx;
  const id = entry.c.id;
  if (id === 'n_aakraman' || id === 's_agni') {
    const v = entry.victim;
    if (!v) return 0;
    const dmg = id === 's_agni' ? 5 : 2;
    return (dmg >= v.hp ? unitValue(v) + 2 : dmg * 0.6);
  }
  if (id === 's_chakravyuha') {
    const n = allUnits(st, enemy).length;
    return n >= 2 ? 4 + n * 2 : 0;
  }
  if (id === 's_ashwamedha') return allUnits(st, pIdx).length >= 3 ? 9 : 1;
  if (id === 'y_vighna' || id === 'y_kavach' || id === 'y_pratikar') {
    return p.yantras.length >= 2 ? 0 : 3.5;
  }
  if (id === 'n_sena_bhojan' || id === 'c_shilpa') return (p.hq.maxHp - p.hq.hp) >= 6 ? 7 : 0;
  if (id === 'g_swarn_yug') return p.hand.length <= 6 ? 7.5 : 3;
  if (id === 'n_yudh_niti' || id === 'm_arthashastra') return p.hand.length <= 5 ? 7 : 2;
  if (id === 'n_visha_baan') return allUnits(st, enemy).length >= 3 ? 9 : (allUnits(st, enemy).length === 2 ? 3 : 0);
  if (id === 'r_kshatra') return (st.front.owner === pIdx && st.front.units.length >= 2) ? 8 : 0;
  if (id === 'ch_vyapari') return 5.5;
  return 3;
}

function unitPlayScore(st, pIdx, entry) {
  const c = entry.c;
  const p = st.players[pIdx];
  const cost = koshaCost(st, pIdx, c);
  let s = (c.atk * 1.35 + c.hp) - cost * 0.55;
  if (c.kw && c.kw.includes('veg')) s += 2.2;              // acts immediately = tempo
  if (c.kw && c.kw.includes('raksha')) s += 1.4;
  if (c.deploy) s += 1.2;
  if (st.players[1 - pIdx].support.length + (st.front.owner === 0 ? 0 : 0) >= 3 && c.hp <= 2) s -= 0.8;
  if (p.hand.length >= 8) s += 1;                          // dumping cards
  return s;
}

function aiPlayPhase(st, pIdx, level) {
  let guard = 0;
  const rng = st.rng;
  while (guard++ < 14) {
    const p = st.players[pIdx];
    const options = playableCards(st, pIdx);
    if (!options.length) break;

    let scored = options.map(o => ({
      o,
      score: o.kind === 'unit' ? unitPlayScore(st, pIdx, o) : orderValue(st, pIdx, o)
    })).filter(x => x.score > 0);

    if (!scored.length) break;

    if (level === 'easy') {
      // easy: play something random and affordable, sometimes nothing
      if (rng() < 0.2) break;
      const pick = scored[Math.floor(rng() * scored.length)];
      const res = applyAction(st, { type: 'play', handIndex: pick.o.i, target: pick.o.target });
      if (!res.ok) break;
      continue;
    }

    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0];
    const res = applyAction(st, { type: 'play', handIndex: pick.o.i, target: pick.o.target });
    if (!res.ok) break;
  }
}

function aiCombatPhase(st, pIdx, level) {
  const rng = st.rng;

  // 1. move units into the contested line
  let guard = 0;
  while (guard++ < 12) {
    const p = st.players[pIdx];
    if (st.front.owner !== null && st.front.owner !== pIdx) break;
    if (st.front.units.length >= 4) break;
    const movable = p.support.filter(u => canMove(st, pIdx, u.uid).ok);
    if (!movable.length) break;
    movable.sort((a, b) => (b.atk + b.hp) - (a.atk + a.hp));
    const candidate = movable[0];
    // keep a body at home if the enemy is already on our doorstep
    const enemyOnLine = st.front.owner === 1 - pIdx;
    if (enemyOnLine && p.support.length >= 3 && candidate.atk <= 1 && level !== 'easy') break;
    if (level === 'easy' && rng() < 0.3) break;
    const res = applyAction(st, { type: 'move', uid: candidate.uid });
    if (!res.ok) break;
  }

  // 2. attacks
  guard = 0;
  while (guard++ < 24) {
    const p = st.players[pIdx];
    const ready = allUnits(st, pIdx).filter(x => !x.unit.attacked && x.unit.canAct && p.kosha >= x.unit.op);
    if (!ready.length) break;

    // lethal check first
    if (level === 'hard' && hasLethal(st, pIdx)) {
      const cand = ready
        .filter(x => canAttack(st, pIdx, x.unit.uid, { kind: 'hq', owner: 1 - pIdx }).ok)
        .sort((a, b) => a.unit.op - b.unit.op)[0];
      if (cand) {
        applyAction(st, { type: 'attack', uid: cand.unit.uid, target: { kind: 'hq', owner: 1 - pIdx } });
        continue;
      }
    }

    let best = null;
    ready.forEach(x => {
      if (level === 'easy' && rng() < 0.45) return;
      const pick = bestAttackFor(st, pIdx, x.unit);
      if (!pick) return;
      if (!best || pick.score > best.score) best = { uid: x.unit.uid, target: pick.target, score: pick.score };
    });

    if (!best) break;
    if (level !== 'easy' && best.score <= 0.4) break;
    const res = applyAction(st, { type: 'attack', uid: best.uid, target: best.target });
    if (!res.ok) break;
  }
}


/* ---------- hard level: one-ply search over a cloned board ---------- */
function cloneState(st) {
  return {
    seed: st.seed, turn: st.turn, active: st.active, over: st.over, winner: st.winner,
    winReason: st.winReason, log: [], nextUid: st.nextUid,
    front: { owner: st.front.owner, units: st.front.units.map(u => ({ ...u, kw: u.kw.slice() })) },
    players: st.players.map(p => ({
      ...p,
      hq: { ...p.hq },
      deck: p.deck.slice(), hand: p.hand.slice(), discard: p.discard.slice(),
      support: p.support.map(u => ({ ...u, kw: u.kw.slice() })),
      counters: { ...p.counters }
    })),
    rng: st.rng,
    aiLevel: st.aiLevel, objective: st.objective,
    scenarioId: st.scenarioId, scenarioName: st.scenarioName
  };
}

function boardScore(st, me) {
  const enemy = 1 - me;
  let s = 0;
  allUnits(st, me).forEach(x => { s += unitValue(x.unit); });
  allUnits(st, enemy).forEach(x => { s -= unitValue(x.unit) * 1.05; });
  s += (st.players[me].hq.hp - st.players[enemy].hq.hp) * 2.2;
  s += st.players[me].kosha * 0.15;
  s += st.players[me].hand.length * 0.25;
  if (st.front.owner === me) s += 2.5;
  else if (st.front.owner === enemy) s -= 2.5;
  return s;
}

function koshaReserve(st, pIdx) {
  let need = 0;
  allUnits(st, pIdx).forEach(x => { if (x.unit.canAct && !x.unit.attacked) need += x.unit.op; });
  return 0;
}

function hardPlayPhase(st, pIdx) {
  let guard = 0;
  while (guard++ < 12) {
    const p = st.players[pIdx];
    const reserve = koshaReserve(st, pIdx);
    const base = boardScore(st, pIdx);
    const options = playableCards(st, pIdx).filter(o => {
      const cost = koshaCost(st, pIdx, o.c);
      return p.kosha - cost >= reserve || o.kind !== 'unit';
    });
    if (!options.length) break;

    let best = null;
    for (const o of options) {
      const sim = cloneState(st);
      const res = applyAction(sim, { type: 'play', handIndex: o.i, target: o.target });
      if (!res.ok) continue;
      const delta = boardScore(sim, pIdx) - base;
      if (!best || delta > best.delta) best = { o, delta };
    }
    if (!best || best.delta <= -1) break;
    const res = applyAction(st, { type: 'play', handIndex: best.o.i, target: best.o.target });
    if (!res.ok) break;
  }
}

function hardCombatPhase(st, pIdx) {
  // advance: contest an empty line, but never over-commit — units on the
  // Yudhbhumi can be shot from the enemy Rajya line.
  let guard = 0;
  while (guard++ < 12) {
    const p = st.players[pIdx];
    if (st.front.owner !== null && st.front.owner !== pIdx) break;
    if (st.front.units.length >= 4) break;
    const movable = p.support.filter(u => canMove(st, pIdx, u.uid).ok);
    if (!movable.length) break;
    movable.sort((a, b) => (b.atk + b.hp) - (a.atk + a.hp));
    const cand = movable[0];
    if (st.front.owner === 1 - pIdx && p.support.length >= 3 && cand.atk <= 1) break;
    const res = applyAction(st, { type: 'move', uid: cand.uid });
    if (!res.ok) break;
  }

  // attacks: heuristic scoring, with aggression scaled by who owns the board
  guard = 0;
  while (guard++ < 24) {
    const p = st.players[pIdx];
    const ready = allUnits(st, pIdx).filter(x => !x.unit.attacked && x.unit.canAct && p.kosha >= x.unit.op);
    if (!ready.length) break;

    const mine = boardPower(st, pIdx), theirs = boardPower(st, 1 - pIdx);
    const aggr = Math.max(0.7, Math.min(2.2, 1 + (mine - theirs) / 12));

    // finish the game if we can
    if (hasLethal(st, pIdx)) {
      const cand = ready
        .filter(x => canAttack(st, pIdx, x.unit.uid, { kind: 'hq', owner: 1 - pIdx }).ok)
        .sort((a, b) => a.unit.op - b.unit.op)[0];
      if (cand) { applyAction(st, { type: 'attack', uid: cand.unit.uid, target: { kind: 'hq', owner: 1 - pIdx } }); continue; }
    }

    let best = null;
    for (const x of ready) {
      const targets = [];
      if (canAttack(st, pIdx, x.unit.uid, { kind: 'hq', owner: 1 - pIdx }).ok) targets.push({ kind: 'hq', owner: 1 - pIdx });
      allUnits(st, 1 - pIdx).forEach(t => {
        const tg = { kind: 'unit', owner: 1 - pIdx, uid: t.unit.uid };
        if (canAttack(st, pIdx, x.unit.uid, tg).ok) targets.push(tg);
      });
      for (const tg of targets) {
        const sc = attackScore(st, pIdx, x.unit, tg, aggr);
        if (!best || sc > best.score) best = { uid: x.unit.uid, target: tg, score: sc };
      }
    }
    if (!best || best.score <= 0.4) break;
    const res = applyAction(st, { type: 'attack', uid: best.uid, target: best.target });
    if (!res.ok) break;
  }
}

function aiTurn(st, pIdx, level) {
  if (st.over) return;
  const lvl = level || st.aiLevel || 'normal';
  if (lvl === 'hard') {
    aiPlayPhase(st, pIdx, 'normal');
    hardCombatPhase(st, pIdx);
  } else {
    aiPlayPhase(st, pIdx, lvl);
    aiCombatPhase(st, pIdx, lvl);
  }
  if (!st.over) applyAction(st, { type: 'end' });
}

/* objective helpers for the UI */
function objectiveStatus(st) {
  const o = st.objective || { type: 'destroy' };
  if (o.type === 'survive' || o.type === 'deadline') {
    const remaining = Math.max(0, o.turns - st.turn + 1);
    return { type: o.type, remaining, total: o.turns };
  }
  return { type: 'destroy' };
}

function drainEvents(st) {
  const e = st.events || [];
  st.events = [];
  return e;
}

const API = {
  EMPIRES, EMPIRE_ORDER, CARDS, CARD_LIST, KW_LABEL, drainEvents,
  newGame, applyAction, canPlay, canMove, canAttack,
  findUnit, allUnits, koshaCost, aiTurn, aiPlayPhase, aiCombatPhase,
  buildDeck, objectiveStatus, hasLethal, faceDamageAvailable
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.YUDDH = API;
