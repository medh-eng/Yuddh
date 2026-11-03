/* ============================================================
   YUDDH — the prototype campaign: nine missions with fixed decks.
   Data generated from legacy/src/campaign.js. In Phase 3 these are
   re-cut into the three Itihasa campaigns.
   ============================================================ */
import { newGame } from "../engine/rules";
import type { AiLevel, EmpireId, GameState, Objective, Preset } from "../engine/types";

export interface MissionSide {
  empire: EmpireId; ally?: EmpireId; hq?: number; faction?: string; capital?: string;
  deck?: string[]; drawBonus?: number; startKosha?: number;
}
export interface TutorialStep { id: string; done: string; text: string }
export interface Mission {
  id: string; title: string; place: string; year: string; tier: string; reward: number;
  player: MissionSide; enemy: MissionSide; playerDeck: string[];
  openingHand?: string[]; preset?: Preset; objective: Objective; aiLevel: AiLevel;
  tutorial?: TutorialStep[]; briefing: string; hint: string;
}

export const CAMPAIGN: Mission[] = [
  {
    "id": "t0",
    "title": "The Training Ground",
    "place": "Magadha",
    "year": "The first lesson",
    "tier": "Tutorial",
    "reward": 80,
    "player": {
      "empire": "maurya",
      "ally": "neutral",
      "hq": 24,
      "faction": "Maurya",
      "capital": "Pataliputra"
    },
    "openingHand": [
      "n_padati",
      "n_ashvarohi",
      "y_kavach",
      "n_aakraman"
    ],
    "enemy": {
      "empire": "rajput",
      "ally": "neutral",
      "hq": 12,
      "faction": "Bandits",
      "capital": "The Camp",
      "deck": [
        "n_padati",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_dhanurdhar",
        "n_dhanurdhar",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_rakshak",
        "n_rakshak"
      ]
    },
    "playerDeck": [
      "n_padati",
      "n_padati",
      "n_padati",
      "m_padati",
      "m_padati",
      "n_ashvarohi",
      "n_ashvarohi",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "n_aakraman",
      "n_aakraman",
      "y_kavach",
      "y_pratikar",
      "n_rathi",
      "n_rathi",
      "n_gaja",
      "n_senapati",
      "n_maharathi"
    ],
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "easy",
    "tutorial": [
      {
        "id": "deploy",
        "done": "deploy",
        "text": "Deploy a unit — click a card in your hand, then a lit slot in your Rajya."
      },
      {
        "id": "advance",
        "done": "move",
        "text": "Now advance it — click your unit, then the lit slot on the Yudhbhumi."
      },
      {
        "id": "attack",
        "done": "attackHq",
        "text": "Click your unit on the Yudhbhumi, then click the enemy Durg to strike it."
      },
      {
        "id": "mantra",
        "done": "mantra",
        "text": "Cast a Mantra — click an order card in your hand; it resolves at once."
      },
      {
        "id": "yantra",
        "done": "yantra",
        "text": "Set a Yantra — it lies face down and springs on the enemy turn."
      },
      {
        "id": "win",
        "done": "win",
        "text": "Break their Durg to finish the lesson."
      }
    ],
    "briefing": "Before the chronicle begins, learn the trade. A bandit camp holds the far bank. You have more men and better officers; what you do not yet have is practice.",
    "hint": "Nothing here can hurt you badly. Try every button — including the ones you think are a mistake."
  },
  {
    "id": "c1",
    "reward": 100,
    "title": "The First Throne",
    "place": "Pataliputra",
    "year": "c. 321 BCE",
    "tier": "Intro",
    "player": {
      "empire": "maurya",
      "ally": "neutral",
      "hq": 24,
      "faction": "Maurya",
      "capital": "Pataliputra"
    },
    "enemy": {
      "empire": "maurya",
      "ally": "neutral",
      "hq": 18,
      "faction": "Nanda",
      "capital": "Pataliputra",
      "deck": [
        "n_padati",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_dhanurdhar",
        "n_dhanurdhar",
        "n_rakshak",
        "n_rakshak",
        "n_ashvarohi",
        "n_rathi",
        "n_gaja",
        "n_aakraman",
        "n_sena_bhojan",
        "n_yudh_niti"
      ]
    },
    "playerDeck": [
      "n_padati",
      "n_padati",
      "n_padati",
      "m_padati",
      "m_padati",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "n_ashvarohi",
      "n_ashvarohi",
      "n_rathi",
      "n_rathi",
      "n_rakshak",
      "n_rakshak",
      "n_gaja",
      "n_maharathi",
      "m_hasti",
      "n_senapati",
      "n_aakraman",
      "n_aakraman",
      "n_yudh_niti",
      "n_sena_bhojan",
      "n_atirathi"
    ],
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "easy",
    "briefing": "A young adventurer from Magadha has gathered an army at the edge of the Nanda capital. The Nanda treasury is vast, but their frontier levies are thin and badly led. Take the Yudhbhumi, hold it, and their Durg will fall.",
    "hint": "Units cannot attack the turn they are deployed unless they have Vega. Deploy, wait a turn, then advance into the Yudhbhumi and strike."
  },
  {
    "id": "c2",
    "reward": 120,
    "title": "The Indus Line",
    "place": "The Indus",
    "year": "c. 305 BCE",
    "tier": "Standard",
    "player": {
      "empire": "maurya",
      "ally": "gupta",
      "hq": 26,
      "faction": "Maurya",
      "capital": "Pataliputra"
    },
    "enemy": {
      "empire": "chalukya",
      "ally": "neutral",
      "hq": 24,
      "faction": "Seleucid",
      "capital": "Alexandria",
      "deck": [
        "n_rakshak",
        "n_rakshak",
        "n_gaja",
        "n_gaja",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_maharathi",
        "n_maharathi",
        "c_rakshak",
        "c_rakshak",
        "c_senapati",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_dhanurdhar",
        "n_dhanurdhar",
        "n_aakraman",
        "n_aakraman",
        "n_sena_bhojan",
        "c_shilpa"
      ]
    },
    "playerDeck": [
      "m_padati",
      "m_padati",
      "n_padati",
      "n_padati",
      "n_ashvarohi",
      "n_ashvarohi",
      "n_rathi",
      "n_rathi",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "n_rakshak",
      "n_rakshak",
      "m_hasti",
      "m_hasti",
      "n_gaja",
      "m_chanakya",
      "n_senapati",
      "n_maharathi",
      "n_atirathi",
      "m_arthashastra",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan"
    ],
    "preset": {
      "enemyFront": [
        "n_rakshak"
      ]
    },
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "normal",
    "briefing": "A Macedonian successor army has crossed the river and planted its elephants on the Yudhbhumi. Their heavy infantry will not be shifted by chariots alone. Break the guards first — a Raksha unit shields everything behind it.",
    "hint": "Raksha units must be destroyed before the units beside them can be attacked. Ranged units strike from your Rajya line without taking a counter-blow."
  },
  {
    "id": "c3",
    "reward": 130,
    "title": "The Golden Age",
    "place": "Ujjain",
    "year": "4th century CE",
    "tier": "Standard",
    "player": {
      "empire": "gupta",
      "ally": "chola",
      "hq": 28,
      "faction": "Gupta",
      "capital": "Ujjain",
      "drawBonus": 1
    },
    "enemy": {
      "empire": "rajput",
      "ally": "neutral",
      "hq": 22,
      "faction": "Western Satraps",
      "capital": "Ujjain",
      "deck": [
        "r_yoddha",
        "r_yoddha",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_rathi",
        "n_rathi",
        "r_archer",
        "r_archer",
        "n_rakshak",
        "n_rakshak",
        "r_gaja",
        "r_gaja",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_maharathi",
        "n_maharathi",
        "n_aakraman",
        "n_aakraman",
        "r_kshatra",
        "n_sena_bhojan"
      ]
    },
    "playerDeck": [
      "g_dhanurdhar",
      "g_dhanurdhar",
      "g_dhanurdhar",
      "g_pandit",
      "g_pandit",
      "g_mandir",
      "g_mandir",
      "g_mandir",
      "g_ashvarohi",
      "g_ashvarohi",
      "g_ashvarohi",
      "n_rakshak",
      "n_rakshak",
      "n_rakshak",
      "n_padati",
      "n_padati",
      "n_padati",
      "n_senapati",
      "n_senapati",
      "n_gaja",
      "n_gaja",
      "ch_pot",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "n_rathi",
      "g_samudragupta",
      "g_swarn_yug",
      "n_yudh_niti",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan",
      "n_sena_bhojan"
    ],
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "normal",
    "briefing": "The Satrap cavalry raids faster than your levies can answer. But this is an age of academies and endowments: your court draws two cards a turn, and every Mantra you cast draws another. Out-supply them.",
    "hint": "Gupta draws a card whenever you cast a Mantra. Card advantage compounds — do not hoard Mantras in hand."
  },
  {
    "id": "c4",
    "reward": 150,
    "title": "Pulakeshin's Stand",
    "place": "The Narmada",
    "year": "c. 620 CE",
    "tier": "Hard",
    "player": {
      "empire": "chalukya",
      "ally": "rajput",
      "hq": 24,
      "faction": "Chalukya",
      "capital": "Badami"
    },
    "enemy": {
      "empire": "gupta",
      "ally": "neutral",
      "hq": 30,
      "faction": "Harsha",
      "capital": "Kannauj",
      "deck": [
        "g_dhanurdhar",
        "g_dhanurdhar",
        "g_dhanurdhar",
        "g_dhanurdhar",
        "g_ashvarohi",
        "g_ashvarohi",
        "g_ashvarohi",
        "g_ashvarohi",
        "n_rathi",
        "n_rathi",
        "n_rathi",
        "n_maharathi",
        "n_maharathi",
        "n_maharathi",
        "n_gaja",
        "n_gaja",
        "n_gaja",
        "g_pandit",
        "g_pandit",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_rakshak",
        "n_rakshak",
        "n_atirathi",
        "n_aakraman",
        "n_aakraman",
        "n_aakraman",
        "n_visha_baan",
        "n_visha_baan",
        "n_sena_bhojan",
        "g_swarn_yug"
      ],
      "drawBonus": 1,
      "startKosha": 2
    },
    "playerDeck": [
      "c_rakshak",
      "c_rakshak",
      "c_ashvarohi",
      "c_ashvarohi",
      "c_ashvarohi",
      "n_rakshak",
      "n_rakshak",
      "n_gaja",
      "n_padati",
      "n_padati",
      "n_padati",
      "c_senapati",
      "c_senapati",
      "c_gaja",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "c_shilpa",
      "n_sena_bhojan",
      "n_aakraman",
      "n_aakraman",
      "n_yudh_niti"
    ],
    "preset": {
      "enemyFront": [
        "n_rathi",
        "g_ashvarohi",
        "n_maharathi",
        "n_gaja"
      ],
      "enemySupport": [
        "g_dhanurdhar",
        "g_ashvarohi"
      ]
    },
    "objective": {
      "type": "survive",
      "turns": 9
    },
    "aiLevel": "normal",
    "briefing": "The emperor of the north has brought the whole weight of the Ganga plain to the river. You do not have to win — you have to still be standing. Hold for nine turns and his host will melt away for want of supply.",
    "hint": "This is a defensive mission. Raksha units in your Rajya line also shield your Durg from direct assault. Do not throw units away attacking."
  },
  {
    "id": "c5",
    "reward": 140,
    "title": "The Sea Road",
    "place": "Thanjavur",
    "year": "c. 1014 CE",
    "tier": "Standard",
    "player": {
      "empire": "chola",
      "ally": "maurya",
      "hq": 24,
      "faction": "Chola",
      "capital": "Thanjavur"
    },
    "enemy": {
      "empire": "chalukya",
      "ally": "neutral",
      "hq": 26,
      "faction": "Srivijaya",
      "capital": "Kadaram",
      "deck": [
        "n_rakshak",
        "n_rakshak",
        "n_rakshak",
        "n_dhanurdhar",
        "n_dhanurdhar",
        "n_dhanurdhar",
        "c_rakshak",
        "c_rakshak",
        "n_gaja",
        "n_gaja",
        "n_padati",
        "n_padati",
        "c_gaja",
        "n_maharathi",
        "n_aakraman",
        "n_aakraman",
        "c_shilpa"
      ]
    },
    "playerDeck": [
      "ch_archer",
      "ch_archer",
      "ch_archer",
      "ch_navik",
      "ch_navik",
      "ch_navik",
      "ch_sena",
      "ch_sena",
      "n_rakshak",
      "n_rakshak",
      "ch_pot",
      "ch_pot",
      "n_padati",
      "n_padati",
      "n_rathi",
      "n_gaja",
      "ch_rajaraja",
      "ch_vyapari",
      "ch_vyapari",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan"
    ],
    "preset": {
      "enemySupport": [
        "n_dhanurdhar",
        "c_rakshak"
      ]
    },
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "normal",
    "briefing": "Across the bay, a rival thalassocracy has barred the straits. Their archers are dug in behind shield walls. Your own bowmen hit harder than anyone else in the Indian Ocean — use them to clear the line, then send the marines in.",
    "hint": "Chola ranged units get +1 attack. Ranged units in your Rajya line can only strike enemy units in the Yudhbhumi — they cannot reach the enemy rear."
  },
  {
    "id": "c6",
    "reward": 150,
    "title": "Prithviraj's Charge",
    "place": "Tarain",
    "year": "1191 CE",
    "tier": "Hard",
    "player": {
      "empire": "rajput",
      "ally": "chalukya",
      "hq": 24,
      "faction": "Chahamana",
      "capital": "Ajmer"
    },
    "enemy": {
      "empire": "maurya",
      "ally": "neutral",
      "hq": 26,
      "faction": "Ghurid",
      "capital": "Ghazni",
      "deck": [
        "n_rathi",
        "n_rathi",
        "n_rathi",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_maharathi",
        "n_maharathi",
        "n_atirathi",
        "n_rakshak",
        "n_rakshak",
        "n_padati",
        "n_padati",
        "n_aakraman",
        "n_aakraman",
        "n_yudh_niti",
        "n_sena_bhojan"
      ]
    },
    "playerDeck": [
      "r_yoddha",
      "r_yoddha",
      "r_yoddha",
      "r_maharathi",
      "r_maharathi",
      "r_gaja",
      "r_gaja",
      "r_archer",
      "r_archer",
      "n_ashvarohi",
      "n_ashvarohi",
      "r_sena",
      "n_rakshak",
      "n_rakshak",
      "r_prithviraj",
      "n_padati",
      "n_padati",
      "r_kshatra",
      "r_kshatra",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan"
    ],
    "objective": {
      "type": "deadline",
      "turns": 12
    },
    "aiLevel": "normal",
    "briefing": "The Ghurid cavalry is faster than yours and will grow stronger every turn the war drags on. Your Rajput Vega units deploy ready to fight — but you have ten turns before their reinforcements make the field impossible. Win before then.",
    "hint": "Rajput Vega units arrive able to act immediately and get +1 attack. You lose this battle if the enemy Durg still stands after turn 10."
  },
  {
    "id": "c7",
    "reward": 160,
    "title": "The Burning Library",
    "place": "Nalanda",
    "year": "c. 8th century CE",
    "tier": "Hard",
    "player": {
      "empire": "gupta",
      "ally": "rajput",
      "hq": 26,
      "faction": "Gupta",
      "capital": "Nalanda"
    },
    "enemy": {
      "empire": "rajput",
      "ally": "neutral",
      "hq": 20,
      "faction": "Raiders",
      "capital": "The Camps",
      "deck": [
        "n_padati",
        "n_padati",
        "n_padati",
        "n_padati",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_ashvarohi",
        "n_rathi",
        "n_rathi",
        "n_rathi",
        "n_maharathi",
        "n_maharathi",
        "n_aakraman",
        "n_aakraman",
        "n_visha_baan",
        "n_visha_baan",
        "n_rakshak",
        "n_rakshak",
        "n_rakshak",
        "n_atirathi",
        "n_gaja",
        "n_gaja",
        "n_yudh_niti",
        "n_yudh_niti",
        "n_sena_bhojan"
      ],
      "drawBonus": 1,
      "startKosha": 2
    },
    "playerDeck": [
      "g_dhanurdhar",
      "g_dhanurdhar",
      "g_dhanurdhar",
      "g_pandit",
      "g_pandit",
      "g_ashvarohi",
      "g_ashvarohi",
      "g_mandir",
      "g_mandir",
      "n_rakshak",
      "n_rakshak",
      "n_rakshak",
      "n_gaja",
      "n_senapati",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan",
      "n_sena_bhojan",
      "g_swarn_yug",
      "n_yudh_niti"
    ],
    "preset": {
      "enemyFront": [
        "n_ashvarohi"
      ]
    },
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "hard",
    "briefing": "Raiders are burning the monasteries and they keep coming — they draw faster and they started with a war chest. There is no wall left to hide behind. Break the warband before it breaks the library.",
    "hint": "The enemy draws two cards a turn and began with extra Kosha. Expect to be out-numbered: trade efficiently and use Aakraman to finish wounded units."
  },
  {
    "id": "c8",
    "reward": 200,
    "title": "Samrat",
    "place": "The Deccan",
    "year": "c. 1160 CE",
    "tier": "Final",
    "player": {
      "empire": "chalukya",
      "ally": "chola",
      "hq": 30,
      "faction": "Chalukya",
      "capital": "Kalyani"
    },
    "enemy": {
      "empire": "rajput",
      "ally": "maurya",
      "hq": 24,
      "faction": "Kalachuri",
      "capital": "Tripuri",
      "deck": [
        "r_yoddha",
        "r_yoddha",
        "r_yoddha",
        "r_maharathi",
        "r_maharathi",
        "r_gaja",
        "r_gaja",
        "n_atirathi",
        "n_maharathi",
        "n_maharathi",
        "n_rakshak",
        "n_rakshak",
        "r_sena",
        "r_kshatra",
        "r_kshatra",
        "n_aakraman",
        "n_aakraman",
        "n_sena_bhojan",
        "n_visha_baan"
      ],
      "startKosha": 2
    },
    "playerDeck": [
      "c_rakshak",
      "c_rakshak",
      "c_rakshak",
      "c_ashvarohi",
      "c_ashvarohi",
      "c_gaja",
      "c_gaja",
      "c_senapati",
      "c_senapati",
      "n_rakshak",
      "n_rakshak",
      "n_dhanurdhar",
      "n_dhanurdhar",
      "ch_pot",
      "c_pulakeshin",
      "n_gaja",
      "c_shilpa",
      "c_shilpa",
      "n_aakraman",
      "n_aakraman",
      "n_sena_bhojan",
      "n_yudh_niti",
      "n_padati",
      "n_padati"
    ],
    "preset": {
      "enemyFront": [
        "r_maharathi"
      ]
    },
    "objective": {
      "type": "destroy"
    },
    "aiLevel": "hard",
    "briefing": "A rival claimant holds the Deccan with a larger treasury and a heavier army, and he is already standing on the Yudhbhumi. There is no clever trick left — only the long grind of shield walls, elephants and attrition. Take the line, and keep it.",
    "hint": "The enemy opens with +2 Kosha and a chariot on the Yudhbhumi. Raksha units are your answer: they absorb the first blow of every attack."
  }
] as Mission[];

export function buildGame(m: Mission, seed?: number, upgrades?: Record<string, number>): GameState {
  const side = (cfg: MissionSide & { upgrades?: Record<string, number>; openingHand?: string[] }) => ({
    empire: cfg.empire, ally: cfg.ally || "neutral" as EmpireId,
    deck: cfg.deck, hq: cfg.hq, faction: cfg.faction, capital: cfg.capital,
    drawBonus: cfg.drawBonus || 0, startKosha: cfg.startKosha || 1,
    upgrades: cfg.upgrades || {}, openingHand: cfg.openingHand
  });
  return newGame({
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
