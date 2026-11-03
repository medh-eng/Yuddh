const E = require('../src/engine.js');
const mk = () => E.newGame({
  player: { empire: 'maurya', ally: 'gupta', deck: E.buildDeck('maurya', 'gupta') },
  enemy: { empire: 'rajput', ally: 'neutral', deck: E.buildDeck('rajput', 'neutral') },
  seed: 11
});
let pass = 0, fail = 0;
const check = (name, cond, extra) => { if (cond) { pass++; console.log('  ok  ', name); } else { fail++; console.log('  FAIL', name, extra || ''); } };

// 1. Vighna: enemy deploys a unit, it is destroyed
{
  const st = mk();
  st.players[1].yantras.push({ cardId: 'y_vighna', uid: 999 });
  st.players[0].hand.unshift('n_padati');
  st.players[0].kosha = 10;
  const before = E.allUnits(st, 0).length;
  const r = E.applyAction(st, { type: 'play', handIndex: 0 });
  check('vighna triggers on deploy', r.ok && E.allUnits(st, 0).length === before, JSON.stringify({ ok: r.ok, before, after: E.allUnits(st, 0).length }));
  check('vighna is consumed', st.players[1].yantras.length === 0);
}
// 2. Kavach: prevents 4 damage to the HQ
{
  const st = mk();
  st.players[1].yantras.push({ cardId: 'y_kavach', uid: 998 });
  // put a big attacker on the front for player 0
  const u = { uid: 5000, cardId: 'n_atirathi', name: 'Atirathi', sub: '', glyph: 'अ', empire: 'neutral', atk: 6, hp: 5, maxHp: 5, op: 1, range: 'melee', kw: [], owner: 0, canAct: true, moved: false, attacked: false, smokeBroken: false };
  st.front.owner = 0; st.front.units = [u];
  st.players[0].kosha = 10;
  const hpBefore = st.players[1].hq.hp;
  const r = E.applyAction(st, { type: 'attack', uid: 5000, target: { kind: 'hq', owner: 1 } });
  check('kavach reduces HQ damage by 4', r.ok && hpBefore - st.players[1].hq.hp === 2, JSON.stringify({ ok: r.ok, dealt: hpBefore - st.players[1].hq.hp }));
}
// 3. Pratikar: punishes the attacker
{
  const st = mk();
  st.players[1].yantras.push({ cardId: 'y_pratikar', uid: 997 });
  const a = { uid: 6000, cardId: 'n_gaja', name: 'Gaja', sub: '', glyph: 'ग', empire: 'neutral', atk: 4, hp: 5, maxHp: 5, op: 1, range: 'melee', kw: [], owner: 0, canAct: true, moved: false, attacked: false, smokeBroken: false };
  const d = { uid: 6001, cardId: 'n_gaja', name: 'Gaja', sub: '', glyph: 'ग', empire: 'neutral', atk: 4, hp: 5, maxHp: 5, op: 1, range: 'melee', kw: [], owner: 1, canAct: true, moved: false, attacked: false, smokeBroken: false };
  st.front.owner = 0; st.front.units = [a];
  st.players[1].support = [d];
  st.players[0].kosha = 10;
  const r = E.applyAction(st, { type: 'attack', uid: 6000, target: { kind: 'unit', owner: 1, uid: 6001 } });
  // attacker: 5 hp, takes 4 retaliation + 3 pratikar = dead
  const stillThere = E.findUnit(st, 0, 6000);
  check('pratikar kills the attacker', r.ok && !stillThere, JSON.stringify({ ok: r.ok, hp: stillThere && stillThere.unit.hp }));
}
// 4. Shakti: Agni Baan deals 5
{
  const st = mk();
  const d = { uid: 7000, cardId: 'n_gaja', name: 'Gaja', sub: '', glyph: 'ग', empire: 'neutral', atk: 4, hp: 5, maxHp: 5, op: 1, range: 'melee', kw: [], owner: 1, canAct: true, moved: false, attacked: false, smokeBroken: false };
  st.players[1].support = [d];
  st.players[0].hand.unshift('s_agni');
  st.players[0].kosha = 12;
  const r = E.applyAction(st, { type: 'play', handIndex: 0, target: { kind: 'unit', owner: 1, uid: 7000 } });
  check('agni baan deals 5 and kills', r.ok && !E.findUnit(st, 1, 7000), JSON.stringify(r));
}
// 5. upgrades apply
{
  const st = E.newGame({
    player: { empire: 'maurya', ally: 'gupta', deck: ['n_gaja'], upgrades: { n_gaja: 2 } },
    enemy: { empire: 'rajput', ally: 'neutral', deck: ['n_padati'] }, seed: 5
  });
  st.players[0].hand = ['n_gaja']; st.players[0].kosha = 12;
  E.applyAction(st, { type: 'play', handIndex: 0 });
  const u = E.allUnits(st, 0)[0].unit;
  check('upgrade adds +2/+2', u.atk === 6 && u.hp === 7, JSON.stringify({ atk: u.atk, hp: u.hp }));
}
// 6. events fire
{
  const st = mk();
  st.players[0].hand.unshift('n_padati'); st.players[0].kosha = 10;
  E.drainEvents(st);
  E.applyAction(st, { type: 'play', handIndex: 0 });
  const ev = E.drainEvents(st);
  check('deploy event emitted', ev.some(e => e.t === 'deploy'));
  check('events drained', E.drainEvents(st).length === 0);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
