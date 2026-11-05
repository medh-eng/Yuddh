/* ============================================================
   YUDDH — core types for the rules engine.
   The engine has no DOM code: it runs in the browser, in a web
   worker for the AI, and in node for tests and balance runs.
   ============================================================ */

export type EmpireId = 'maurya' | 'gupta' | 'chalukya' | 'chola' | 'rajput' | 'neutral';
export type PlayerIndex = 0 | 1;
export type Keyword = 'veg' | 'raksha' | 'dhuan';
export type CardType = 'unit' | 'order' | 'yantra';
export type Range = 'melee' | 'ranged';
export type AiLevel = 'easy' | 'normal' | 'hard';
export type Line = 'support' | 'front';
export type DeployEffect = 'draw1' | 'drawKosha' | 'kosha1' | 'buffLine' | 'buffAll';
export type YantraTrigger = 'onEnemyDeploy' | 'onHQAttack' | 'onUnitAttack';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Empire {
  id: EmpireId;
  name: string;
  capital: string;
  color: string;
  glyph: string;
  passive: string;
}

export interface CardDef {
  id: string;
  name: string;
  sub: string;
  empire: EmpireId;
  type: CardType;
  /** 'shakti' marks power orders; 'yantra' marks face-down traps */
  kind?: 'shakti' | 'yantra';
  cost: number;
  op?: number;
  atk?: number;
  hp?: number;
  range?: Range;
  kw?: Keyword[];
  glyph: string;
  text: string;
  deploy?: DeployEffect;
  target?: 'enemyUnit';
  trigger?: YantraTrigger;
  power?: number;
  rarity?: Rarity;
}

export interface Unit {
  uid: number;
  cardId: string;
  name: string;
  sub: string;
  glyph: string;
  empire: EmpireId;
  atk: number;
  hp: number;
  maxHp: number;
  op: number;
  range: Range;
  kw: Keyword[];
  owner: PlayerIndex;
  canAct: boolean;
  moved: boolean;
  attacked: boolean;
  smokeBroken: boolean;
  upgraded?: number;
  /** Yuddh rules: battle honours won by destroying enemy units (0–2): Veer +1 health, Mahaveer also +1 attack */
  rank?: number;
}

export interface SetYantra { cardId: string; uid: number }

export interface Player {
  side: 'p0' | 'p1';
  empire: EmpireId;
  ally: EmpireId;
  faction: string;
  hq: { name: string; hp: number; maxHp: number };
  kosha: number;
  maxKosha: number;
  deck: string[];
  hand: string[];
  discard: string[];
  support: Unit[];
  yantras: SetYantra[];
  fatigue: number;
  upgrades: Record<string, number>;
  drawBonus: number;
  counters: { ordersPlayed: number; unitsThisTurn: number; mantraThisTurn?: boolean };
}

export type Objective =
  | { type: 'destroy'; turns?: number }
  | { type: 'survive'; turns: number }
  | { type: 'deadline'; turns: number };

export type WinReason = 'destroy' | 'both' | 'survive' | 'deadline' | null;

export interface LogEntry { turn: number; msg: string; side: number }

export type GameEvent =
  | { t: 'deploy'; owner: PlayerIndex; uid: number; cardId: string }
  | { t: 'move'; owner: PlayerIndex; uid: number }
  | { t: 'attack'; owner: PlayerIndex; uid: number; target: { owner: PlayerIndex; uid: number }; dmg: number }
  | { t: 'death'; owner: PlayerIndex; uid: number }
  | { t: 'hq'; owner: PlayerIndex; dmg: number; attacker: PlayerIndex; uid: number }
  | { t: 'order'; owner: PlayerIndex; cardId: string }
  | { t: 'yantra'; owner: PlayerIndex; cardId: string }
  | { t: 'yantraSet'; owner: PlayerIndex }
  | { t: 'promote'; owner: PlayerIndex; uid: number; rank: number }
  | { t: 'trample'; owner: PlayerIndex; uid: number; dmg: number };

export interface GameState {
  seed: number;
  turn: number;
  active: PlayerIndex;
  over: boolean;
  winner: PlayerIndex | null;
  winReason: WinReason;
  log: LogEntry[];
  nextUid: number;
  events: GameEvent[];
  front: { owner: PlayerIndex | null; units: Unit[] };
  players: [Player, Player];
  aiLevel: AiLevel;
  objective: Objective;
  scenarioId: string | null;
  scenarioName: string | null;
  rules?: Ruleset;
  rng: () => number;
}

export type Target =
  | { kind: 'hq'; owner: PlayerIndex }
  | { kind: 'unit'; owner: PlayerIndex; uid: number };

export type Action =
  | { type: 'play'; handIndex: number; target?: Target | null }
  | { type: 'move'; uid: number }
  | { type: 'attack'; uid: number; target: Target }
  | { type: 'end' };

export type Check = { ok: true } | { ok: false; reason: string };

export interface SideConfig {
  empire: EmpireId;
  ally?: EmpireId;
  deck?: string[];
  hq?: number;
  faction?: string;
  capital?: string;
  startKosha?: number;
  drawBonus?: number;
  upgrades?: Record<string, number>;
  handSize?: number;
  openingHand?: string[];
}

export interface Preset {
  enemyFront?: string[];
  playerFront?: string[];
  enemySupport?: string[];
  playerSupport?: string[];
}

export interface NewGameOptions {
  seed?: number;
  player: SideConfig;
  enemy: SideConfig;
  preset?: Preset;
  aiLevel?: AiLevel;
  objective?: Objective;
  scenarioId?: string | null;
  scenarioName?: string | null;
  /** 'classic' = the prototype's rules (golden traces); 'yuddh' = Raksha guards the Durg,
      and a unit either moves or attacks in a turn unless it is mounted (see canCharge) */
  rules?: Ruleset;
}
export type Ruleset = 'classic' | 'yuddh';
