'use strict';
(function () {
/* ============================================================
   YUDDH — campaign data.
   Eight single-player missions, each a fixed deck and a fixed
   situation. The engine reads these; the UI renders them.
   ============================================================ */

const rep = (id, n) => Array.from({ length: n }, () => id);

const CAMPAIGN = [

  /* ---------------------------------------------------------- 0 — tutorial */
  {
    id: 't0',
    title: 'The Training Ground',
    place: 'Magadha',
    year: 'The first lesson',
    tier: 'Tutorial',
    reward: 80,
    player: { empire: 'maurya', ally: 'neutral', hq: 24, faction: 'Maurya', capital: 'Pataliputra' },
    openingHand: ['n_padati', 'n_ashvarohi', 'y_kavach', 'n_aakraman'],
    enemy: {
      empire: 'rajput', ally: 'neutral', hq: 12, faction: 'Bandits', capital: 'The Camp',
      deck: [...rep('n_padati', 4), ...rep('n_dhanurdhar', 2), ...rep('n_ashvarohi', 2), ...rep('n_rakshak', 2)]
    },
    playerDeck: [...rep('n_padati', 3), ...rep('m_padati', 2), ...rep('n_ashvarohi', 2),
                 ...rep('n_dhanurdhar', 2), ...rep('n_aakraman', 2), ...rep('y_kavach', 1),
                 ...rep('y_pratikar', 1), ...rep('n_rathi', 2), ...rep('n_gaja', 1),
                 ...rep('n_senapati', 1), ...rep('n_maharathi', 1)],
    objective: { type: 'destroy' },
    aiLevel: 'easy',
    tutorial: [
      { id: 'deploy', done: 'deploy', text: 'Deploy a unit — click a card in your hand, then a lit slot in your Rajya.' },
      { id: 'advance', done: 'move', text: 'Now advance it — click your unit, then the lit slot on the Yudhbhumi.' },
      { id: 'attack', done: 'attackHq', text: 'Click your unit on the Yudhbhumi, then click the enemy Durg to strike it.' },
      { id: 'mantra', done: 'mantra', text: 'Cast a Mantra — click an order card in your hand; it resolves at once.' },
      { id: 'yantra', done: 'yantra', text: 'Set a Yantra — it lies face down and springs on the enemy turn.' },
      { id: 'win', done: 'win', text: 'Break their Durg to finish the lesson.' }
    ],
    briefing: 'Before the chronicle begins, learn the trade. A bandit camp holds the far bank. You have more men and better officers; what you do not yet have is practice.',
    hint: 'Nothing here can hurt you badly. Try every button — including the ones you think are a mistake.'
  },
  /* ---------------------------------------------------------- 1 */
  {
    id: 'c1',
    reward: 100,
    title: 'The First Throne',
    place: 'Pataliputra',
    year: 'c. 321 BCE',
    tier: 'Intro',
    player: { empire: 'maurya', ally: 'neutral', hq: 24, faction: 'Maurya', capital: 'Pataliputra' },
    enemy: {
      empire: 'maurya', ally: 'neutral', hq: 18, faction: 'Nanda', capital: 'Pataliputra',
      deck: [...rep('n_padati', 4), ...rep('n_dhanurdhar', 2), ...rep('n_rakshak', 2),
             ...rep('n_ashvarohi', 1), ...rep('n_rathi', 1), ...rep('n_gaja', 1),
             ...rep('n_aakraman', 1), ...rep('n_sena_bhojan', 1), ...rep('n_yudh_niti', 1)]
    },
    playerDeck: [...rep('n_padati', 3), ...rep('m_padati', 2), ...rep('n_dhanurdhar', 2),
                 ...rep('n_ashvarohi', 2), ...rep('n_rathi', 2), ...rep('n_rakshak', 2),
                 ...rep('n_gaja', 1), ...rep('n_maharathi', 1), ...rep('m_hasti', 1),
                 ...rep('n_senapati', 1), ...rep('n_aakraman', 2), ...rep('n_yudh_niti', 1),
                 ...rep('n_sena_bhojan', 1), ...rep('n_atirathi', 1)],
    objective: { type: 'destroy' },
    aiLevel: 'easy',
    briefing: 'A young adventurer from Magadha has gathered an army at the edge of the Nanda capital. The Nanda treasury is vast, but their frontier levies are thin and badly led. Take the Yudhbhumi, hold it, and their Durg will fall.',
    hint: 'Units cannot attack the turn they are deployed unless they have Vega. Deploy, wait a turn, then advance into the Yudhbhumi and strike.'
  },

  /* ---------------------------------------------------------- 2 */
  {
    id: 'c2',
    reward: 120,
    title: 'The Indus Line',
    place: 'The Indus',
    year: 'c. 305 BCE',
    tier: 'Standard',
    player: { empire: 'maurya', ally: 'gupta', hq: 26, faction: 'Maurya', capital: 'Pataliputra' },
    enemy: {
      empire: 'chalukya', ally: 'neutral', hq: 24, faction: 'Seleucid', capital: 'Alexandria',
      deck: [...rep('n_rakshak', 2), ...rep('n_gaja', 2), ...rep('n_padati', 4),
             ...rep('n_maharathi', 2), ...rep('c_rakshak', 2), ...rep('c_senapati', 1),
             ...rep('n_ashvarohi', 2), ...rep('n_dhanurdhar', 2), ...rep('n_aakraman', 2),
             ...rep('n_sena_bhojan', 1), ...rep('c_shilpa', 1)]
    },
    playerDeck: [...rep('m_padati', 2), ...rep('n_padati', 2), ...rep('n_ashvarohi', 2),
                 ...rep('n_rathi', 2), ...rep('n_dhanurdhar', 2), ...rep('n_rakshak', 2),
                 ...rep('m_hasti', 2), ...rep('n_gaja', 1), ...rep('m_chanakya', 1),
                 ...rep('n_senapati', 1), ...rep('n_maharathi', 1), ...rep('n_atirathi', 1),
                 ...rep('m_arthashastra', 1), ...rep('n_aakraman', 2), ...rep('n_sena_bhojan', 1)],
    preset: { enemyFront: ['n_rakshak'] },
    objective: { type: 'destroy' },
    aiLevel: 'normal',
    briefing: 'A Macedonian successor army has crossed the river and planted its elephants on the Yudhbhumi. Their heavy infantry will not be shifted by chariots alone. Break the guards first — a Raksha unit shields everything behind it.',
    hint: 'Raksha units must be destroyed before the units beside them can be attacked. Ranged units strike from your Rajya line without taking a counter-blow.'
  },

  /* ---------------------------------------------------------- 3 */
  {
    id: 'c3',
    reward: 130,
    title: 'The Golden Age',
    place: 'Ujjain',
    year: '4th century CE',
    tier: 'Standard',
    player: { empire: 'gupta', ally: 'chola', hq: 28, faction: 'Gupta', capital: 'Ujjain', drawBonus: 1 },
    enemy: {
      empire: 'rajput', ally: 'neutral', hq: 22, faction: 'Western Satraps', capital: 'Ujjain',
      deck: [...rep('r_yoddha', 2), ...rep('n_ashvarohi', 3), ...rep('n_rathi', 2),
             ...rep('r_archer', 2), ...rep('n_rakshak', 2), ...rep('r_gaja', 2),
             ...rep('n_padati', 3), ...rep('n_maharathi', 2), ...rep('n_aakraman', 2),
             ...rep('r_kshatra', 1), ...rep('n_sena_bhojan', 1)]
    },
    playerDeck: [...rep('g_dhanurdhar', 3), ...rep('g_pandit', 2), ...rep('g_mandir', 3),
                 ...rep('g_ashvarohi', 3), ...rep('n_rakshak', 3), ...rep('n_padati', 3),
                 ...rep('n_senapati', 2), ...rep('n_gaja', 2), ...rep('ch_pot', 1),
                 ...rep('n_dhanurdhar', 2), ...rep('n_rathi', 1), ...rep('g_samudragupta', 1),
                 ...rep('g_swarn_yug', 1), ...rep('n_yudh_niti', 1),
                 ...rep('n_aakraman', 2), ...rep('n_sena_bhojan', 2)],
    objective: { type: 'destroy' },
    aiLevel: 'normal',
    briefing: 'The Satrap cavalry raids faster than your levies can answer. But this is an age of academies and endowments: your court draws two cards a turn, and every Mantra you cast draws another. Out-supply them.',
    hint: 'Gupta draws a card whenever you cast a Mantra. Card advantage compounds — do not hoard Mantras in hand.'
  },

  /* ---------------------------------------------------------- 4 */
  {
    id: 'c4',
    reward: 150,
    title: "Pulakeshin's Stand",
    place: 'The Narmada',
    year: 'c. 620 CE',
    tier: 'Hard',
    player: { empire: 'chalukya', ally: 'rajput', hq: 24, faction: 'Chalukya', capital: 'Badami' },
    enemy: {
      empire: 'gupta', ally: 'neutral', hq: 30, faction: 'Harsha', capital: 'Kannauj',
      deck: [...rep('g_dhanurdhar', 4), ...rep('g_ashvarohi', 4), ...rep('n_rathi', 3),
             ...rep('n_maharathi', 3), ...rep('n_gaja', 3), ...rep('g_pandit', 2),
             ...rep('n_padati', 3), ...rep('n_rakshak', 2), ...rep('n_atirathi', 1),
             ...rep('n_aakraman', 3), ...rep('n_visha_baan', 2), ...rep('n_sena_bhojan', 1),
             ...rep('g_swarn_yug', 1)],
      drawBonus: 1, startKosha: 2
    },
    playerDeck: [...rep('c_rakshak', 2), ...rep('c_ashvarohi', 3), ...rep('n_rakshak', 2),
                 ...rep('n_gaja', 1), ...rep('n_padati', 3), ...rep('c_senapati', 2),
                 ...rep('c_gaja', 1), ...rep('n_dhanurdhar', 2), ...rep('c_shilpa', 1),
                 ...rep('n_sena_bhojan', 1), ...rep('n_aakraman', 2), ...rep('n_yudh_niti', 1)],
    preset: { enemyFront: ['n_rathi', 'g_ashvarohi', 'n_maharathi', 'n_gaja'], enemySupport: ['g_dhanurdhar', 'g_ashvarohi'] },
    objective: { type: 'survive', turns: 9 },
    aiLevel: 'normal',
    briefing: 'The emperor of the north has brought the whole weight of the Ganga plain to the river. You do not have to win — you have to still be standing. Hold for nine turns and his host will melt away for want of supply.',
    hint: 'This is a defensive mission. Raksha units in your Rajya line also shield your Durg from direct assault. Do not throw units away attacking.'
  },

  /* ---------------------------------------------------------- 5 */
  {
    id: 'c5',
    reward: 140,
    title: 'The Sea Road',
    place: 'Thanjavur',
    year: 'c. 1014 CE',
    tier: 'Standard',
    player: { empire: 'chola', ally: 'maurya', hq: 24, faction: 'Chola', capital: 'Thanjavur' },
    enemy: {
      empire: 'chalukya', ally: 'neutral', hq: 26, faction: 'Srivijaya', capital: 'Kadaram',
      deck: [...rep('n_rakshak', 3), ...rep('n_dhanurdhar', 3), ...rep('c_rakshak', 2),
             ...rep('n_gaja', 2), ...rep('n_padati', 2), ...rep('c_gaja', 1),
             ...rep('n_maharathi', 1), ...rep('n_aakraman', 2), ...rep('c_shilpa', 1)]
    },
    playerDeck: [...rep('ch_archer', 3), ...rep('ch_navik', 3), ...rep('ch_sena', 2),
                 ...rep('n_rakshak', 2), ...rep('ch_pot', 2), ...rep('n_padati', 2),
                 ...rep('n_rathi', 1), ...rep('n_gaja', 1), ...rep('ch_rajaraja', 1),
                 ...rep('ch_vyapari', 2), ...rep('n_aakraman', 2), ...rep('n_sena_bhojan', 1)],
    preset: { enemySupport: ['n_dhanurdhar', 'c_rakshak'] },
    objective: { type: 'destroy' },
    aiLevel: 'normal',
    briefing: 'Across the bay, a rival thalassocracy has barred the straits. Their archers are dug in behind shield walls. Your own bowmen hit harder than anyone else in the Indian Ocean — use them to clear the line, then send the marines in.',
    hint: 'Chola ranged units get +1 attack. Ranged units in your Rajya line can only strike enemy units in the Yudhbhumi — they cannot reach the enemy rear.'
  },

  /* ---------------------------------------------------------- 6 */
  {
    id: 'c6',
    reward: 150,
    title: "Prithviraj's Charge",
    place: 'Tarain',
    year: '1191 CE',
    tier: 'Hard',
    player: { empire: 'rajput', ally: 'chalukya', hq: 24, faction: 'Chahamana', capital: 'Ajmer' },
    enemy: {
      empire: 'maurya', ally: 'neutral', hq: 26, faction: 'Ghurid', capital: 'Ghazni',
      deck: [...rep('n_rathi', 3), ...rep('n_ashvarohi', 3), ...rep('n_maharathi', 2),
             ...rep('n_atirathi', 1), ...rep('n_rakshak', 2), ...rep('n_padati', 2),
             ...rep('n_aakraman', 2), ...rep('n_yudh_niti', 1), ...rep('n_sena_bhojan', 1)]
    },
    playerDeck: [...rep('r_yoddha', 3), ...rep('r_maharathi', 2), ...rep('r_gaja', 2),
                 ...rep('r_archer', 2), ...rep('n_ashvarohi', 2), ...rep('r_sena', 1),
                 ...rep('n_rakshak', 2), ...rep('r_prithviraj', 1), ...rep('n_padati', 2),
                 ...rep('r_kshatra', 2), ...rep('n_aakraman', 2), ...rep('n_sena_bhojan', 1)],
    objective: { type: 'deadline', turns: 12 },
    aiLevel: 'normal',
    briefing: 'The Ghurid cavalry is faster than yours and will grow stronger every turn the war drags on. Your Rajput Vega units deploy ready to fight — but you have ten turns before their reinforcements make the field impossible. Win before then.',
    hint: 'Rajput Vega units arrive able to act immediately and get +1 attack. You lose this battle if the enemy Durg still stands after turn 10.'
  },

  /* ---------------------------------------------------------- 7 */
  {
    id: 'c7',
    reward: 160,
    title: 'The Burning Library',
    place: 'Nalanda',
    year: 'c. 8th century CE',
    tier: 'Hard',
    player: { empire: 'gupta', ally: 'rajput', hq: 26, faction: 'Gupta', capital: 'Nalanda' },
    enemy: {
      empire: 'rajput', ally: 'neutral', hq: 20, faction: 'Raiders', capital: 'The Camps',
      deck: [...rep('n_padati', 4), ...rep('n_ashvarohi', 4), ...rep('n_rathi', 3),
             ...rep('n_maharathi', 2), ...rep('n_aakraman', 2), ...rep('n_visha_baan', 2),
             ...rep('n_rakshak', 3), ...rep('n_atirathi', 1), ...rep('n_gaja', 2),
             ...rep('n_yudh_niti', 2), ...rep('n_sena_bhojan', 1)],
      drawBonus: 1, startKosha: 2
    },
    playerDeck: [...rep('g_dhanurdhar', 3), ...rep('g_pandit', 2), ...rep('g_ashvarohi', 2),
                 ...rep('g_mandir', 2), ...rep('n_rakshak', 3), ...rep('n_gaja', 1),
                 ...rep('n_senapati', 1), ...rep('n_dhanurdhar', 2), ...rep('n_aakraman', 2),
                 ...rep('n_sena_bhojan', 2), ...rep('g_swarn_yug', 1), ...rep('n_yudh_niti', 1)],
    preset: { enemyFront: ['n_ashvarohi'] },
    objective: { type: 'destroy' },
    aiLevel: 'hard',
    briefing: 'Raiders are burning the monasteries and they keep coming — they draw faster and they started with a war chest. There is no wall left to hide behind. Break the warband before it breaks the library.',
    hint: 'The enemy draws two cards a turn and began with extra Kosha. Expect to be out-numbered: trade efficiently and use Aakraman to finish wounded units.'
  },

  /* ---------------------------------------------------------- 8 */
  {
    id: 'c8',
    reward: 200,
    title: 'Samrat',
    place: 'The Deccan',
    year: 'c. 1160 CE',
    tier: 'Final',
    player: { empire: 'chalukya', ally: 'chola', hq: 30, faction: 'Chalukya', capital: 'Kalyani' },
    enemy: {
      empire: 'rajput', ally: 'maurya', hq: 24, faction: 'Kalachuri', capital: 'Tripuri',
      deck: [...rep('r_yoddha', 3), ...rep('r_maharathi', 2), ...rep('r_gaja', 2),
             ...rep('n_atirathi', 1), ...rep('n_maharathi', 2), ...rep('n_rakshak', 2),
             ...rep('r_sena', 1), ...rep('r_kshatra', 2), ...rep('n_aakraman', 2),
             ...rep('n_sena_bhojan', 1), ...rep('n_visha_baan', 1)],
      startKosha: 2
    },
    playerDeck: [...rep('c_rakshak', 3), ...rep('c_ashvarohi', 2), ...rep('c_gaja', 2),
                 ...rep('c_senapati', 2), ...rep('n_rakshak', 2), ...rep('n_dhanurdhar', 2),
                 ...rep('ch_pot', 1), ...rep('c_pulakeshin', 1), ...rep('n_gaja', 1),
                 ...rep('c_shilpa', 2), ...rep('n_aakraman', 2), ...rep('n_sena_bhojan', 1),
                 ...rep('n_yudh_niti', 1), ...rep('n_padati', 2)],
    preset: { enemyFront: ['r_maharathi'] },
    objective: { type: 'destroy' },
    aiLevel: 'hard',
    briefing: 'A rival claimant holds the Deccan with a larger treasury and a heavier army, and he is already standing on the Yudhbhumi. There is no clever trick left — only the long grind of shield walls, elephants and attrition. Take the line, and keep it.',
    hint: 'The enemy opens with +2 Kosha and a chariot on the Yudhbhumi. Raksha units are your answer: they absorb the first blow of every attack.'
  }
];

function buildGame(E, m, seed, upgrades) {
  const side = (cfg) => ({
    empire: cfg.empire, ally: cfg.ally || 'neutral',
    deck: cfg.deck, hq: cfg.hq, faction: cfg.faction, capital: cfg.capital,
    drawBonus: cfg.drawBonus || 0, startKosha: cfg.startKosha || 1,
    upgrades: cfg.upgrades || {}, openingHand: cfg.openingHand
  });
  return E.newGame({
    seed: seed === undefined ? (Date.now() % 1000000) : seed,
    player: side({ ...m.player, deck: m.playerDeck, upgrades: upgrades || {}, openingHand: m.openingHand }),
    enemy: side(m.enemy),
    preset: m.preset || {},
    objective: m.objective,
    aiLevel: m.aiLevel,
    scenarioId: m.id,
    scenarioName: m.title
  });
}

const API = { CAMPAIGN, buildGame };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.YUDDH_CAMPAIGN = API;
})();
