/* ============================================================
   Phase 1 battle — "The First Throne": Chandragupta and Chanakya
   against the Nanda army before Pataliputra, c. 321 BCE.
   Both decks use only cards that have their painting. Each side
   carries a Pratikar Yantra so hidden traps spring in most battles
   (Yuddh rules; simulated: the player side wins about 68%, ~18 turns).
   ============================================================ */
import { newGame } from '../engine/rules';
import type { AiLevel, GameState } from '../engine/types';

const rep = (id: string, n: number) => Array.from({ length: n }, () => id);

export const FIRST_THRONE = {
  id: 'first_throne',
  title: 'The First Throne',
  place: 'Pataliputra',
  year: 'c. 321 BCE',
  battlefield: 'pataliputra',
  briefing: 'The Nanda king sits on a mountain of gold, but his frontier levies are thin and badly led. Chanakya has spent years preparing this army. Take the Yudhbhumi, hold it, and the gates of Pataliputra will open.',
  playerDeck: [
    ...rep('n_padati', 3), ...rep('m_padati', 3), ...rep('n_dhanurdhar', 2), ...rep('n_ashvarohi', 2),
    ...rep('n_rakshak', 2), ...rep('n_rathi', 2), 'n_maharathi', 'n_atirathi', 'n_gaja', 'm_hasti',
    'n_senapati', ...rep('m_gudhchar', 2), 'm_chanakya', 'm_chandragupta', 'm_arthashastra',
    ...rep('n_aakraman', 2), 'n_sena_bhojan', 'n_yudh_niti', 'y_kavach', 'y_pratikar', 's_agni', 's_chakravyuha'
  ],
  // the Nanda host: famous for its elephants and chariots, thin on good infantry
  enemyDeck: [
    ...rep('n_padati', 3), ...rep('n_dhanurdhar', 3), ...rep('n_rakshak', 3), ...rep('n_ashvarohi', 2),
    ...rep('n_rathi', 2), ...rep('n_gaja', 2), ...rep('n_maharathi', 2), 'n_senapati', 'n_atirathi',
    ...rep('n_aakraman', 2), 'n_sena_bhojan', 'n_visha_baan', 'y_kavach', 'y_pratikar', 's_agni', 's_chakravyuha'
  ],
  enemyHq: 24,
  enemyStartKosha: 1
};

export function firstThroneGame(seed: number, level: AiLevel = 'normal', upgrades: Record<string, number> = {}): GameState {
  return newGame({
    seed,
    player: { empire: 'maurya', ally: 'neutral', deck: FIRST_THRONE.playerDeck, hq: 24, faction: 'Maurya', capital: 'Chandragupta\'s Camp', upgrades },
    enemy: { empire: 'neutral', ally: 'neutral', deck: FIRST_THRONE.enemyDeck, hq: FIRST_THRONE.enemyHq, startKosha: FIRST_THRONE.enemyStartKosha, faction: 'Nanda', capital: 'Pataliputra' },
    aiLevel: level,
    objective: { type: 'destroy' },
    scenarioId: FIRST_THRONE.id,
    scenarioName: FIRST_THRONE.title,
    rules: 'yuddh'
  });
}
