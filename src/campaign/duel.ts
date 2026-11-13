/* ============================================================
   The Duel: two people, one device (pass-and-play). Each picks a
   faction; the faction's deck is the one its campaign battle uses
   (decks.json), its Durg and hero come from src/data/duel.json.
   Both players are "human": the battle scene turns the board
   around between turns (engine/duel.ts) and shows a pass-the-device
   curtain. The second player draws one extra card to offset going
   second. The season is drawn at random.
   ============================================================ */
import duelJson from '../data/duel.json';
import { newGame } from '../engine/rules';
import { CARDS } from '../engine/cards';
import type { EmpireId, GameState, Season } from '../engine/types';
import { decksOf } from '../data';
import type { Scenario } from './scenario';
import type { Link } from '../game/net/link';

export interface Faction {
  id: string; name: string; hindi: string; empire: EmpireId; capital: string; faction: string;
  deck: [string, 'player' | 'enemy']; /** Durg hit points in a duel: the balance lever, tuned by simulation (tests/_sim) */ hq?: number; /** starting Kosha ceiling (default 1): a second, lighter balance lever */ kosha?: number;
  /** duel-only deck tuning (the strongest lever — one copy can swing 30 points): extra copies appended before padding… */ add?: string[];
  /** …and copies removed before padding (one per listed id). Neither touches the campaign deck in decks.json. */ trim?: string[];
  durg: string; hero: string; ground: string; blurb: string;
}
export const FACTIONS = duelJson.factions as unknown as Faction[];
export const factionById = (id: string): Faction | undefined => FACTIONS.find(f => f.id === id);

const SEASON_LIST: Season[] = ['sharad', 'varsha', 'grishma', 'hemanta'];
/** A duel runs about 16 turns and both sides draw every turn, so a campaign deck of 20-30 cards runs dry and the loser is whoever draws more (Gupta, whose Mantras draw, lost 94% of its games to attrition). Every duel deck is padded to this many cards by repeating its non-legendary cards in order; legendary cards appear once. */
export const DUEL_DECK_SIZE = 52;
const deckOf = (f: Faction): string[] => {
  const d = decksOf(f.deck[0]);
  let base = (f.deck[1] === 'player' ? d.player : d.enemy).slice();
  // duel-only tuning (duel.json): trim takes one copy out per listed id, add puts extra copies in.
  // Both run before padding, so the padding repeats the tuned deck — a single edit carries weight.
  for (const id of f.trim ?? []) { const i = base.indexOf(id); if (i >= 0) base.splice(i, 1); }
  base = base.concat(f.add ?? []);
  const out = base.slice();
  const pool = base.filter(id => CARDS[id]?.rarity !== 'legendary');
  for (let i = 0; pool.length && out.length < DUEL_DECK_SIZE; i++) out.push(pool[i % pool.length]);
  return out;
};

export function duelGame(a: Faction, b: Faction, seed: number): GameState {
  const season = SEASON_LIST[Math.abs(Math.floor(seed)) % SEASON_LIST.length];
  return newGame({
    seed,
    player: { empire: a.empire, ally: 'neutral', deck: deckOf(a), faction: a.faction, capital: a.capital, hq: a.hq, startKosha: a.kosha },
    enemy: { empire: b.empire, ally: 'neutral', deck: deckOf(b), faction: b.faction, capital: b.capital, hq: b.hq, startKosha: b.kosha, handSize: 5 },
    aiLevel: 'normal',
    objective: { type: 'destroy' },
    scenarioId: 'duel',
    scenarioName: `${a.name} vs ${b.name}`,
    rules: 'yuddh',
    season
  });
}

/** the scenario the battle screen plays for this pairing (a is player 1 and moves first) */
export function duelScenario(a: Faction, b: Faction, online?: { link: Link; role: 'host' | 'guest'; seed: number; ground: string }): Scenario {
  const ground = online?.ground ?? (Math.random() < 0.5 ? a.ground : b.ground);
  return {
    id: 'duel',
    title: `${a.name} against ${b.name}`,
    place: online ? 'Two phones' : 'Pass and play',
    year: 'Two commanders',
    battlefield: ground,
    briefing: online ? `Two phones, one battle. ${a.name} (the host) moves first and ${b.name} draws one extra card to make up for it. Each of you sees only your own hand. If the connection drops the battle ends, so keep both phones awake and online.` : `Two commanders share one table. ${a.name} moves first and ${b.name} draws one extra card to make up for it. When you end your turn the screen is hidden: pass the device and let the other player tap when they are ready. Nobody should look while the other plays; each player's hand shows only on their own turn.`,
    objective: 'Break the other commander\'s Durg.',
    heroCard: online?.role === 'guest' ? b.hero : a.hero,
    defeatCard: online?.role === 'guest' ? a.hero : b.hero,
    enemyName: online?.role === 'guest' ? a.name : `${b.name} host`,
    durgArt: [a.durg, b.durg],
    winText: turn => `The Durg falls in turn ${turn}.`,
    loseText: '',
    goLabel: online ? (online.role === 'host' ? 'Begin the battle' : 'I am ready') : 'Begin the duel',
    online: online ? { link: online.link, role: online.role } : undefined,
    fixedSeed: online?.seed,
    playerDeck: deckOf(a),
    enemyDeck: deckOf(b),
    game: seed => duelGame(a, b, seed),
    duel: { sides: [{ name: a.name, hero: a.hero, durg: a.durg }, { name: b.name, hero: b.hero, durg: b.durg }] }
  };
}
