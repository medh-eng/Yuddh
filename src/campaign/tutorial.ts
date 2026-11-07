/* ============================================================
   The training ground: a short, gentle battle at Chanakya's camp
   that teaches the game step by step (the coach lives in the battle
   screen). A fixed opening hand, a weak border outpost with a small
   Durg, and the easy AI.
   ============================================================ */
import { newGame } from '../engine/rules';
import { decksOf } from '../data';
import type { Scenario } from './scenario';

const { player: playerDeck, enemy: enemyDeck } = decksOf('training_ground');

export const TUTORIAL: Scenario = {
  id: 'training_ground',
  title: 'The Training Ground',
  place: "Chanakya's camp",
  year: 'before the war',
  battlefield: 'pataliputra',
  briefing: 'Before he gives you an army, Chanakya wants to see you command one. A small Nanda border post sits across the field. He will stand beside you and explain each order as you give it.',
  objective: 'Learn to play: destroy the border post.',
  heroCard: 'm_chanakya',
  defeatCard: 'n_padati',
  enemyName: 'Nanda outpost',
  durgArt: ['durg_maurya_camp', 'durg_pataliputra'],
  winText: turn => `The outpost falls in turn ${turn}. Chanakya nods: you are ready for The First Throne.`,
  loseText: 'The outpost holds. Chanakya smiles: even he lost his first battles. Try again.',
  goLabel: 'Begin training',
  nextId: 'first_throne',
  nextLabel: 'The First Throne',
  playerDeck, enemyDeck,
  coached: true,
  game: seed => newGame({
    seed,
    player: { empire: 'maurya', ally: 'neutral', deck: playerDeck, hq: 24, faction: 'Maurya', capital: "Chanakya's Camp",
      openingHand: ['n_padati', 'n_ashvarohi', 'n_dhanurdhar', 'n_padati'] },
    enemy: { empire: 'neutral', ally: 'neutral', deck: enemyDeck, hq: 12, startKosha: 0, faction: 'Nanda', capital: 'Border Post' },
    aiLevel: 'easy',
    objective: { type: 'destroy' },
    scenarioId: 'training_ground',
    scenarioName: 'The Training Ground',
    rules: 'yuddh'
  })
};

const KEY = 'yuddh.tutorial.done';
export const tutorialDone = (): boolean => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
export const markTutorialDone = (): void => { try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ } };
