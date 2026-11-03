/* Records the outcome of many seeded AI-vs-AI games using Sarwam's
   original engine. The TypeScript engine must reproduce every one. */
const E = require('./src/engine.js');
const C = require('./src/campaign.js');
const crypto = require('crypto');

function fingerprint(st) {
  const h = crypto.createHash('sha1');
  st.log.forEach(l => h.update(`${l.turn}|${l.side}|${l.msg}\n`));
  return {
    winner: st.winner, winReason: st.winReason, turn: st.turn, over: st.over,
    hq: st.players.map(p => p.hq.hp), kosha: st.players.map(p => [p.kosha, p.maxKosha]),
    hand: st.players.map(p => p.hand.join(',')), deck: st.players.map(p => p.deck.length),
    front: [st.front.owner, st.front.units.map(u => `${u.cardId}:${u.atk}/${u.hp}`).join(',')],
    nextUid: st.nextUid, logHash: h.digest('hex')
  };
}
function play(st, lvl0, lvl1) {
  let g = 0;
  while (!st.over && g++ < 300) E.aiTurn(st, st.active, st.active === 0 ? lvl0 : lvl1);
  return fingerprint(st);
}
const out = { skirmish: [], campaign: [] };
const levels = ['easy', 'normal', 'hard'];
let k = 0;
for (const a of E.EMPIRE_ORDER) for (const b of E.EMPIRE_ORDER) {
  for (let s = 0; s < 4; s++) {
    const seed = 100 + (k++) * 7;
    const l0 = levels[s % 3], l1 = levels[(s + 1) % 3];
    const allyA = E.EMPIRE_ORDER[(E.EMPIRE_ORDER.indexOf(a) + 1) % 5];
    const st = E.newGame({ seed, player: { empire: a, ally: allyA }, enemy: { empire: b, ally: 'neutral' } });
    out.skirmish.push({ seed, a, allyA, b, l0, l1, result: play(st, l0, l1) });
  }
}
for (const m of C.CAMPAIGN) for (let s = 0; s < 6; s++) {
  const seed = 1000 + s * 37;
  const st = C.buildGame(E, m, seed, s % 2 ? { n_padati: 1, n_gaja: 2, n_aakraman: 1 } : undefined);
  out.campaign.push({ id: m.id, seed, upgrades: s % 2 === 1, result: play(st, 'hard', m.aiLevel) });
}
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
console.log('golden traces:', out.skirmish.length, 'skirmish,', out.campaign.length, 'campaign');
