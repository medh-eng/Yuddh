/* The TypeScript engine must replay every recorded prototype game
   exactly: same winner, same turn count, same log, same final board. */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aiTurn, newGame, type AiLevel, type EmpireId, type GameState } from '../src/engine';
import { CAMPAIGN, buildGame } from '../src/campaign/missions';

const golden = JSON.parse(readFileSync(new URL('./golden/traces.json', import.meta.url), 'utf8'));

function fingerprint(st: GameState) {
  const h = createHash('sha1');
  st.log.forEach(l => h.update(`${l.turn}|${l.side}|${l.msg}\n`));
  return {
    winner: st.winner, winReason: st.winReason, turn: st.turn, over: st.over,
    hq: st.players.map(p => p.hq.hp), kosha: st.players.map(p => [p.kosha, p.maxKosha]),
    hand: st.players.map(p => p.hand.join(',')), deck: st.players.map(p => p.deck.length),
    front: [st.front.owner, st.front.units.map(u => `${u.cardId}:${u.atk}/${u.hp}`).join(',')],
    nextUid: st.nextUid, logHash: h.digest('hex')
  };
}
function play(st: GameState, l0: AiLevel, l1: AiLevel) {
  let g = 0;
  while (!st.over && g++ < 300) aiTurn(st, st.active, st.active === 0 ? l0 : l1);
  return fingerprint(st);
}

describe('golden traces from the prototype engine', () => {
  it(`replays ${golden.skirmish.length} skirmish games identically`, () => {
    for (const g of golden.skirmish) {
      const st = newGame({ seed: g.seed, player: { empire: g.a as EmpireId, ally: g.allyA as EmpireId }, enemy: { empire: g.b as EmpireId, ally: 'neutral' } });
      expect(play(st, g.l0, g.l1), `seed ${g.seed} ${g.a} vs ${g.b}`).toEqual(g.result);
    }
  });
  it(`replays ${golden.campaign.length} campaign games identically`, () => {
    for (const g of golden.campaign) {
      const m = CAMPAIGN.find(x => x.id === g.id)!;
      const st = buildGame(m, g.seed, g.upgrades ? { n_padati: 1, n_gaja: 2, n_aakraman: 1 } : undefined);
      expect(play(st, 'hard', m.aiLevel), `${g.id} seed ${g.seed}`).toEqual(g.result);
    }
  });
});
