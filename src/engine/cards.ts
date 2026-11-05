import { YUDDH_CARD_LIST } from './yuddhCards';
/* ============================================================
   YUDDH — card and empire data.
   Generated once from the prototype engine (legacy/src/engine.js)
   so every stat matches; edit freely from here on.
   ============================================================ */
import type { CardDef, Empire, EmpireId, Keyword } from "./types";

export const EMPIRES: Record<EmpireId, Empire> = {
  "maurya": {
    "id": "maurya",
    "name": "Maurya",
    "capital": "Pataliputra",
    "color": "#d99a2b",
    "glyph": "मौ",
    "passive": "Arthashastra — the first unit costing 3 or more that you deploy each turn costs 1 less Kosha."
  },
  "gupta": {
    "id": "gupta",
    "name": "Gupta",
    "capital": "Ujjain",
    "color": "#2f8f74",
    "glyph": "गु",
    "passive": "Golden Age — the first Mantra you cast each turn draws a card."
  },
  "chalukya": {
    "id": "chalukya",
    "name": "Chalukya",
    "capital": "Badami",
    "color": "#b4532a",
    "glyph": "चा",
    "passive": "Stone Forts — your Durg starts with 28 defence, and your Raksha units get +1 attack."
  },
  "chola": {
    "id": "chola",
    "name": "Chola",
    "capital": "Thanjavur",
    "color": "#3f6fa8",
    "glyph": "चो",
    "passive": "Naval Supremacy — your ranged units get +1 attack."
  },
  "rajput": {
    "id": "rajput",
    "name": "Rajput",
    "capital": "Kannauj",
    "color": "#a83f5b",
    "glyph": "रा",
    "passive": "Kshatra — your Vega units get +1 attack when deployed."
  },
  "neutral": {
    "id": "neutral",
    "name": "Mercenary",
    "capital": "—",
    "color": "#7c7466",
    "glyph": "सा",
    "passive": "Hired swords, available to every throne."
  }
};

export const EMPIRE_ORDER: EmpireId[] = ["maurya","gupta","chalukya","chola","rajput"];

export const CARD_LIST: CardDef[] = [
  {"id":"n_padati","name":"Padati","sub":"Swordsman","empire":"neutral","type":"unit","cost":1,"op":1,"atk":1,"hp":2,"range":"melee","glyph":"प","text":"The backbone of every army.","rarity":"common"},
  {"id":"n_dhanurdhar","name":"Dhanurdhar","sub":"Archer","empire":"neutral","type":"unit","cost":2,"op":1,"atk":1,"hp":2,"range":"ranged","glyph":"ध","text":"Strikes from the Rajya line without taking a counter-blow.","rarity":"common"},
  {"id":"n_ashvarohi","name":"Ashvarohi","sub":"Cavalry","empire":"neutral","type":"unit","cost":2,"op":1,"atk":2,"hp":2,"range":"melee","kw":["veg"],"glyph":"अ","text":"Vega — can act the turn it is deployed.","rarity":"common"},
  {"id":"n_rakshak","name":"Rakshak","sub":"Shield Wall","empire":"neutral","type":"unit","cost":2,"op":1,"atk":1,"hp":4,"range":"melee","kw":["raksha"],"glyph":"र","text":"Raksha — enemy attacks must strike this unit first.","rarity":"common"},
  {"id":"n_rathi","name":"Rathi","sub":"Chariot","empire":"neutral","type":"unit","cost":3,"op":1,"atk":3,"hp":2,"range":"melee","kw":["veg"],"glyph":"र","text":"Vega. Fast, fragile, and always first over the line.","rarity":"common"},
  {"id":"n_maharathi","name":"Maharathi","sub":"Elite Chariot","empire":"neutral","type":"unit","cost":4,"op":2,"atk":4,"hp":4,"range":"melee","kw":["veg"],"glyph":"म","text":"Vega. A commander of ten thousand.","rarity":"rare"},
  {"id":"n_gaja","name":"Gaja","sub":"War Elephant","empire":"neutral","type":"unit","cost":4,"op":2,"atk":4,"hp":5,"range":"melee","kw":["raksha"],"glyph":"ग","text":"Raksha. The wall that walks.","rarity":"rare"},
  {"id":"n_senapati","name":"Senapati","sub":"Commander","empire":"neutral","type":"unit","cost":3,"op":1,"atk":2,"hp":3,"range":"melee","glyph":"से","text":"Deploy — your other units in this line get +1 attack.","deploy":"buffLine","rarity":"common"},
  {"id":"n_atirathi","name":"Atirathi","sub":"Legendary Warrior","empire":"neutral","type":"unit","cost":5,"op":2,"atk":6,"hp":5,"range":"melee","kw":["veg"],"glyph":"अ","text":"Vega. One who fights a thousand chariots alone.","rarity":"legendary"},
  {"id":"n_aakraman","name":"Aakraman","sub":"Assault","empire":"neutral","type":"order","cost":2,"target":"enemyUnit","glyph":"आ","text":"Deal 2 damage to an enemy unit.","rarity":"common"},
  {"id":"n_sena_bhojan","name":"Sena Bhojan","sub":"Supply Column","empire":"neutral","type":"order","cost":2,"glyph":"भ","text":"Restore 4 defence to your Durg.","rarity":"common"},
  {"id":"n_yudh_niti","name":"Yudh Niti","sub":"Strategy","empire":"neutral","type":"order","cost":3,"glyph":"नी","text":"Draw 2 cards.","rarity":"common"},
  {"id":"y_vighna","name":"Vighna Yantra","sub":"Obstruction","empire":"neutral","type":"yantra","kind":"yantra","cost":2,"glyph":"वि","trigger":"onEnemyDeploy","power":0,"text":"Yantra — when the enemy deploys a unit, destroy it.","rarity":"rare"},
  {"id":"y_kavach","name":"Kavach Yantra","sub":"Ward","empire":"neutral","type":"yantra","kind":"yantra","cost":2,"glyph":"क","trigger":"onHQAttack","power":4,"text":"Yantra — when the enemy attacks your Durg, prevent 4 damage.","rarity":"rare"},
  {"id":"y_pratikar","name":"Pratikar Yantra","sub":"Reprisal","empire":"neutral","type":"yantra","kind":"yantra","cost":2,"glyph":"प्र","trigger":"onUnitAttack","power":3,"text":"Yantra — when an enemy unit attacks one of yours, deal 3 damage to it.","rarity":"rare"},
  {"id":"s_agni","name":"Agni Baan","sub":"Fire Arrow","empire":"neutral","type":"order","kind":"shakti","cost":4,"target":"enemyUnit","glyph":"अ","text":"Shakti — deal 5 damage to an enemy unit.","rarity":"epic"},
  {"id":"s_chakravyuha","name":"Chakravyuha","sub":"Encircling Formation","empire":"neutral","type":"order","kind":"shakti","cost":5,"glyph":"च","text":"Shakti — deal 2 damage to every enemy unit.","rarity":"epic"},
  {"id":"s_ashwamedha","name":"Ashwamedha","sub":"Horse Sacrifice","empire":"neutral","type":"order","kind":"shakti","cost":6,"glyph":"अ","text":"Shakti — all your units get +2 attack and +2 defence.","rarity":"epic"},
  {"id":"n_visha_baan","name":"Visha Baan","sub":"Poisoned Arrows","empire":"neutral","type":"order","cost":4,"glyph":"वि","text":"Deal 1 damage to every enemy unit.","rarity":"rare"},
  {"id":"m_padati","name":"Mauryan Padati","sub":"Swordsman","empire":"maurya","type":"unit","cost":1,"op":1,"atk":2,"hp":1,"range":"melee","glyph":"प","text":"Cheap, drilled, endless.","rarity":"common"},
  {"id":"m_gudhchar","name":"Gudhchar","sub":"Spy","empire":"maurya","type":"unit","cost":2,"op":1,"atk":1,"hp":1,"range":"ranged","glyph":"गू","text":"Deploy — draw a card.","deploy":"draw1","rarity":"common"},
  {"id":"m_hasti","name":"Hasti Sena","sub":"Elephant Corps","empire":"maurya","type":"unit","cost":5,"op":2,"atk":5,"hp":5,"range":"melee","glyph":"ह","text":"The arm that broke Seleucus.","rarity":"rare"},
  {"id":"m_chanakya","name":"Chanakya","sub":"Strategist","empire":"maurya","type":"unit","cost":4,"op":1,"atk":2,"hp":4,"range":"melee","glyph":"चा","text":"Deploy — draw a card and gain 1 Kosha.","deploy":"drawKosha","rarity":"legendary"},
  {"id":"m_chandragupta","name":"Chandragupta","sub":"Samrat","empire":"maurya","type":"unit","cost":7,"op":2,"atk":6,"hp":7,"range":"melee","kw":["veg"],"glyph":"स","text":"Vega. Deploy — all your units get +1 attack.","deploy":"buffAll","rarity":"legendary"},
  {"id":"m_arthashastra","name":"Arthashastra","sub":"Treatise","empire":"maurya","type":"order","cost":3,"glyph":"अ","text":"Draw a card and gain 2 Kosha.","rarity":"common"},
  {"id":"g_dhanurdhar","name":"Gupta Dhanurdhar","sub":"Archer","empire":"gupta","type":"unit","cost":2,"op":1,"atk":2,"hp":2,"range":"ranged","glyph":"ध","text":"Trained in the akhadas of the golden age.","rarity":"common"},
  {"id":"g_pandit","name":"Nalanda Pandit","sub":"Scholar","empire":"gupta","type":"unit","cost":3,"op":1,"atk":1,"hp":4,"range":"melee","glyph":"पं","text":"Deploy — draw a card.","deploy":"draw1","rarity":"common"},
  {"id":"g_ashvarohi","name":"Gupta Ashvarohi","sub":"Cavalry","empire":"gupta","type":"unit","cost":3,"op":1,"atk":3,"hp":2,"range":"melee","kw":["veg"],"glyph":"अ","text":"Vega.","rarity":"common"},
  {"id":"g_mandir","name":"Mandir Shilpi","sub":"Temple Builder","empire":"gupta","type":"unit","cost":2,"op":1,"atk":1,"hp":3,"range":"melee","glyph":"शि","text":"Deploy — gain 1 Kosha.","deploy":"kosha1","rarity":"common"},
  {"id":"g_samudragupta","name":"Samudragupta","sub":"Samrat","empire":"gupta","type":"unit","cost":7,"op":2,"atk":6,"hp":7,"range":"melee","kw":["veg"],"glyph":"स","text":"Vega. Deploy — all your units get +1 attack.","deploy":"buffAll","rarity":"legendary"},
  {"id":"g_swarn_yug","name":"Swarn Yug","sub":"Golden Age","empire":"gupta","type":"order","cost":4,"glyph":"स्व","text":"Draw 2 cards and restore 3 to your Durg.","rarity":"rare"},
  {"id":"c_rakshak","name":"Durg Rakshak","sub":"Fort Guard","empire":"chalukya","type":"unit","cost":2,"op":1,"atk":2,"hp":5,"range":"melee","kw":["raksha"],"glyph":"र","text":"Raksha. Carved into the rock of Badami.","rarity":"common"},
  {"id":"c_ashvarohi","name":"Chalukya Ashvarohi","sub":"Cavalry","empire":"chalukya","type":"unit","cost":3,"op":1,"atk":3,"hp":4,"range":"melee","kw":["veg"],"glyph":"अ","text":"Vega.","rarity":"common"},
  {"id":"c_gaja","name":"Chalukya Gaja","sub":"War Elephant","empire":"chalukya","type":"unit","cost":5,"op":2,"atk":5,"hp":5,"range":"melee","kw":["raksha"],"glyph":"ग","text":"Raksha.","rarity":"rare"},
  {"id":"c_pulakeshin","name":"Pulakeshin II","sub":"Samrat","empire":"chalukya","type":"unit","cost":7,"op":2,"atk":6,"hp":6,"range":"melee","kw":["veg","raksha"],"glyph":"स","text":"Vega, Raksha. He turned back Harsha at the Narmada.","rarity":"legendary"},
  {"id":"c_senapati","name":"Chalukya Senapati","sub":"Commander","empire":"chalukya","type":"unit","cost":4,"op":1,"atk":3,"hp":4,"range":"melee","glyph":"से","text":"Deploy — your other units in this line get +1 attack.","deploy":"buffLine","rarity":"rare"},
  {"id":"c_shilpa","name":"Shilpa Kala","sub":"Temple Engineering","empire":"chalukya","type":"order","cost":3,"glyph":"शि","text":"Restore 5 to your Durg and gain 1 Kosha.","rarity":"common"},
  {"id":"ch_navik","name":"Chola Navik","sub":"Marine","empire":"chola","type":"unit","cost":2,"op":1,"atk":3,"hp":3,"range":"melee","glyph":"न","text":"Fights as well ashore as afloat.","rarity":"common"},
  {"id":"ch_archer","name":"Chola Dhanurdhar","sub":"Archer","empire":"chola","type":"unit","cost":2,"op":1,"atk":2,"hp":3,"range":"ranged","glyph":"ध","text":"Ranged.","rarity":"common"},
  {"id":"ch_pot","name":"Yuddh Pot","sub":"Warship","empire":"chola","type":"unit","cost":4,"op":2,"atk":5,"hp":5,"range":"ranged","glyph":"पो","text":"Ranged. The Bay of Bengal was a Chola lake.","rarity":"rare"},
  {"id":"ch_rajaraja","name":"Rajaraja Chola","sub":"Samrat","empire":"chola","type":"unit","cost":7,"op":2,"atk":6,"hp":6,"range":"ranged","glyph":"स","text":"Deploy — draw a card.","deploy":"draw1","rarity":"legendary"},
  {"id":"ch_sena","name":"Chola Senapati","sub":"Commander","empire":"chola","type":"unit","cost":3,"op":1,"atk":3,"hp":3,"range":"melee","glyph":"से","text":"Deploy — your other units in this line get +1 attack.","deploy":"buffLine","rarity":"common"},
  {"id":"ch_vyapari","name":"Chola Vyapari","sub":"Sea Trader","empire":"chola","type":"order","cost":1,"glyph":"व्या","text":"Gain 2 Kosha.","rarity":"common"},
  {"id":"r_yoddha","name":"Rajput Yoddha","sub":"Warrior","empire":"rajput","type":"unit","cost":2,"op":1,"atk":3,"hp":2,"range":"melee","kw":["veg"],"glyph":"यो","text":"Vega.","rarity":"common"},
  {"id":"r_archer","name":"Pratihara Dhanurdhar","sub":"Archer","empire":"rajput","type":"unit","cost":2,"op":1,"atk":2,"hp":2,"range":"ranged","glyph":"ध","text":"Ranged.","rarity":"common"},
  {"id":"r_gaja","name":"Pratihara Gaja","sub":"War Elephant","empire":"rajput","type":"unit","cost":4,"op":2,"atk":4,"hp":4,"range":"melee","kw":["raksha"],"glyph":"ग","text":"Raksha.","rarity":"rare"},
  {"id":"r_maharathi","name":"Rajput Maharathi","sub":"Elite Chariot","empire":"rajput","type":"unit","cost":5,"op":2,"atk":5,"hp":5,"range":"melee","kw":["veg"],"glyph":"म","text":"Vega.","rarity":"rare"},
  {"id":"r_prithviraj","name":"Prithviraj Chauhan","sub":"Samrat","empire":"rajput","type":"unit","cost":7,"op":2,"atk":6,"hp":6,"range":"melee","kw":["veg"],"glyph":"स","text":"Vega. Deploy — all your units get +1 attack.","deploy":"buffAll","rarity":"legendary"},
  {"id":"r_sena","name":"Rajput Senapati","sub":"Commander","empire":"rajput","type":"unit","cost":4,"op":1,"atk":3,"hp":4,"range":"melee","glyph":"से","text":"Deploy — your other units in this line get +1 attack.","deploy":"buffLine","rarity":"rare"},
  {"id":"r_kshatra","name":"Kshatra Dharma","sub":"Code of War","empire":"rajput","type":"order","cost":2,"glyph":"क्ष","text":"Your units in the Yudhbhumi get +2 attack.","rarity":"common"}
] as CardDef[];

/** every card: the prototype's 50 and the YUDDH cards (which buildDeck never sees) */
export const CARDS: Record<string, CardDef> = Object.fromEntries([...CARD_LIST, ...YUDDH_CARD_LIST].map(c => [c.id, c]));

export const KW_LABEL: Record<Keyword, string> = { veg: "Vega", raksha: "Raksha", dhuan: "Dhuan" };
