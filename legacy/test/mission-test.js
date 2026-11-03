const E = require('../src/engine.js');
const C = require('../src/campaign.js');

const N = 60;
const rows = [];

for (const m of C.CAMPAIGN) {
  let wins = 0, losses = 0, draws = 0, turns = 0, errors = 0, timeout = 0;
  const reasons = {};
  for (let s = 0; s < N; s++) {
    let st;
    try {
      st = C.buildGame(E, m, 1000 + s * 37);
      let g = 0;
      while (!st.over && g++ < 300) {
        // the player is played by the strongest AI; the enemy at the mission's level
        const lvl = st.active === 0 ? 'hard' : m.aiLevel;
        E.aiTurn(st, st.active, lvl);
        st.players.forEach(p => {
          if (p.support.length > 4) throw new Error('support overflow');
          if (p.kosha < 0) throw new Error('negative kosha');
        });
        if (st.front.owner !== null && st.front.units.length === 0) throw new Error('empty owned front');
      }
      if (!st.over) { timeout++; continue; }
      turns += st.turn;
      reasons[st.winReason] = (reasons[st.winReason] || 0) + 1;
      if (st.winner === 0) wins++;
      else if (st.winner === 1) losses++;
      else draws++;
    } catch (e) {
      errors++;
      if (errors === 1) console.log('  !!', m.id, e.message);
    }
  }
  const played = wins + losses + draws;
  rows.push({
    id: m.id, title: m.title, tier: m.tier, ai: m.aiLevel,
    winRate: played ? Math.round(wins / played * 100) : 0,
    wins, losses, draws, timeout, errors,
    avgTurns: played ? (turns / played).toFixed(1) : '-',
    reasons: Object.entries(reasons).map(([k, v]) => `${k}:${v}`).join(' ')
  });
}

console.log('\nid  tier      ai      win%  W/L/D   avgT   reasons          title');
rows.forEach(r => {
  console.log(
    r.id.padEnd(4),
    r.tier.padEnd(9),
    r.ai.padEnd(7),
    String(r.winRate + '%').padStart(4),
    `${r.wins}/${r.losses}/${r.draws}`.padEnd(7),
    String(r.avgTurns).padStart(4),
    '  ' + r.reasons.padEnd(17),
    r.title,
    r.errors ? `ERRORS:${r.errors}` : '',
    r.timeout ? `TIMEOUTS:${r.timeout}` : ''
  );
});
