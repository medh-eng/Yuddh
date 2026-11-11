/* ============================================================
   The Maurya campaign ("Rise of Magadha"): the battles in order,
   and which of them the player has won. Phase 3 adds more campaigns
   and the briefings/cutscenes; for now this is the spine:
   The Training Ground → The First Throne → The Indus Line.
   ============================================================ */
import type { Scenario } from './scenario';
import { TUTORIAL, tutorialDone } from './tutorial';
import { FIRST_THRONE_SCENARIO } from './firstThrone';
import { INDUS_LINE_SCENARIO } from './indusLine';
import { KALINGA_SCENARIO } from './kalinga';
import { DIGVIJAYA_SCENARIO } from './digvijaya';
import { NARMADA_LINE_SCENARIO } from './narmada';
import { MAHAKANTARA_SCENARIO } from './mahakantara';
import { KANCHI_SCENARIO } from './kanchi';
import { GOLDEN_AGE_SCENARIO } from './goldenAge';
import { KADARAM_SCENARIO } from './kadaram';
import { GANGA_SCENARIO } from './ganga';
import { LANKA_SCENARIO } from './lanka';
import { TARAIN1_SCENARIO } from './tarain1';
import { TARAIN2_SCENARIO } from './tarain2';
import { CHANDAWAR_SCENARIO } from './chandawar';
import { PULLALUR_SCENARIO } from './pullalur';
import { BADAMI_SCENARIO } from './badami';
import { KOPPAM_SCENARIO } from './koppam';
import { VIKRAM_RETURN_SCENARIO } from './vikramReturn';

export interface CampaignNode {
  scenario: Scenario;
  /** the painting shown on the campaign map: the enemy's leader, or the teacher */
  face: string;
  /** one line under the title on the map */
  blurb: string;
}

export interface Campaign {
  id: string;
  /** small heading on the map */
  kicker: string;
  title: string;
  /** battlefield painted behind the map */
  ground: string;
  /** a painted campaign map (art/PROMPTS-MAPS.md), used instead of the battlefield once delivered: name of a file in art/source/battlefields, e.g. 'map_chola' */
  map?: string;
  nodes: CampaignNode[];
}

export const MAURYA_CAMPAIGN: CampaignNode[] = [
  { scenario: TUTORIAL, face: 'm_chanakya', blurb: 'Chanakya teaches the war.' },
  { scenario: FIRST_THRONE_SCENARIO, face: 'nd_dhana_nanda', blurb: 'Take Pataliputra from the Nanda.' },
  { scenario: INDUS_LINE_SCENARIO, face: 'se_seleucus', blurb: 'Meet Seleucus at the river.' },
  { scenario: KALINGA_SCENARIO, face: 'kl_gaja', blurb: 'Take Kalinga, and count the cost.' }
];
export const GUPTA_CAMPAIGN: CampaignNode[] = [
  { scenario: DIGVIJAYA_SCENARIO, face: 'na_ganapati_naga', blurb: 'Break the Naga kings of the Ganges plain.' },
  { scenario: MAHAKANTARA_SCENARIO, face: 'mk_vyaghraraja', blurb: 'March into the Great Forest of the tiger-king.' },
  { scenario: KANCHI_SCENARIO, face: 'pk_vishnugopa', blurb: 'Take the walls of Kanchi, far down the coast.' },
  { scenario: GOLDEN_AGE_SCENARIO, face: 'sa_rudrasimha', blurb: 'Take Ujjain from the Satraps.' }
];

export const CHALUKYA_CAMPAIGN: CampaignNode[] = [
  { scenario: NARMADA_LINE_SCENARIO, face: 'c_pulakeshin', blurb: 'Stop Harsha of Kanauj on the Narmada.' },
  { scenario: PULLALUR_SCENARIO, face: 'pv_mahendravarman', blurb: 'Break the clever king of Kanchi before the gates close.' },
  { scenario: BADAMI_SCENARIO, face: 'pv_narasimhavarman', blurb: 'Hold Vatapi itself against the wrestler-king\'s grudge.' },
  { scenario: VIKRAM_RETURN_SCENARIO, face: 'c_vikramaditya1', blurb: 'Take Vatapi back and restore the Chalukya kingdom.' }
];

export const RAJPUT_CAMPAIGN: CampaignNode[] = [
  { scenario: TARAIN1_SCENARIO, face: 'gh_muizz', blurb: "Break the sultan of Ghur at Tarain, 1191." },
  { scenario: TARAIN2_SCENARIO, face: 'gh_aibak', blurb: "Hold the plain against the patient plan of 1192." },
  { scenario: CHANDAWAR_SCENARIO, face: 'gh_marksmen', blurb: "Hold the Yamuna for Kannauj against the elephant-shooters, 1194." }
];

export const CHOLA_CAMPAIGN: CampaignNode[] = [
  { scenario: LANKA_SCENARIO, face: 'si_mahinda', blurb: 'Cross the strait and take Anuradhapura from Mahinda V.' },
  { scenario: GANGA_SCENARIO, face: 'pl_mahipala', blurb: 'March north to the Ganga and beat the Pala elephants on its bank.' },
  { scenario: KADARAM_SCENARIO, face: 'sv_sangrama', blurb: 'Sail to Kadaram and break the harbour of the sea kings.' },
  { scenario: KOPPAM_SCENARIO, face: 'wc_someshvara', blurb: "Hold the field at Koppam against Someshvara I, whatever it costs." }
];

export const CAMPAIGNS: Campaign[] = [
  { id: 'maurya', kicker: 'THE MAURYA CAMPAIGN', title: 'Rise of Magadha', ground: 'pataliputra', map: 'map_maurya', nodes: MAURYA_CAMPAIGN },
  { id: 'gupta', kicker: 'THE GUPTA CAMPAIGN', title: 'The Golden Age', ground: 'ujjain', map: 'map_gupta', nodes: GUPTA_CAMPAIGN },
  { id: 'chalukya', kicker: 'THE CHALUKYA CAMPAIGN', title: 'Tigers of the South', ground: 'narmada', map: 'map_chalukya', nodes: CHALUKYA_CAMPAIGN },
  { id: 'chola', kicker: 'THE CHOLA CAMPAIGN', title: 'The Tiger Banner', ground: 'ganga', map: 'map_chola', nodes: CHOLA_CAMPAIGN },
  { id: 'rajput', kicker: 'THE RAJPUT CAMPAIGN', title: 'The Saffron Banner', ground: 'tarain', map: 'map_rajput', nodes: RAJPUT_CAMPAIGN }
];

export const scenarioById = (id: string): Scenario | undefined =>
  CAMPAIGNS.flatMap(c => c.nodes).find(n => n.scenario.id === id)?.scenario;

/** the first campaign that still has a battle not won (the last one when all are done) */
export function currentCampaign(): Campaign {
  const won = battlesWon();
  return CAMPAIGNS.find(c => c.nodes.some(n => !won.includes(n.scenario.id))) ?? CAMPAIGNS[CAMPAIGNS.length - 1];
}

const KEY = 'yuddh.campaign.v1';
const read = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };

/** battles won at least once (the training ground also counts when its own flag is set) */
export function battlesWon(): string[] {
  const won = read();
  if (tutorialDone() && !won.includes(TUTORIAL.id)) won.push(TUTORIAL.id);
  return won;
}
export function markBattleWon(id: string): void {
  const won = read();
  if (won.includes(id)) return;
  won.push(id);
  try { localStorage.setItem(KEY, JSON.stringify(won)); } catch { /* private mode */ }
}

/** which empire's campaign a battle belongs to (the coached training ground belongs to none) */
export function empireOfBattle(id: string): string | undefined {
  return CAMPAIGNS.find(c => c.nodes.some(n => n.scenario.id === id && !n.scenario.coached))?.id;
}
