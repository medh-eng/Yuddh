/* Two-phone playtest: two browser pages (host and guest), paired by pasting codes through the DOM
   screen (window.__yuddhPair), then played with real mouse drags on whichever page is up.
   After every turn the two states must agree (hq health, hand/deck sizes, Kosha, unit counts), mirrored.
   Env: A (host faction), B (guest faction), TURNS (total turns, default 6).
   Usage: node tests/e2e/online.cjs <url> <outdir> [width height] */
const { chromium } = require(process.env.PW || 'playwright');
const [url = 'http://localhost:4173/', out = '.', W = '1280', H = '720'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const mk = async name => {
    const ctx = await b.newContext({ viewport: { width: +W, height: +H } });
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__yuddhLongPressMs = 4000; window.__yuddhIce = []; try { localStorage.setItem('yuddh.notice.v1', '1'); } catch (e) { /* notice */ } });
    p.errs = []; p.on('pageerror', e => p.errs.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') p.errs.push(name + ': ' + m.text()); });
    await p.goto(url); await p.waitForTimeout(2500);
    p.name = name; return p;
  };
  const [h, g] = [await mk('host'), await mk('guest')];
  const press = async (p, label) => {
    let bs = [];
    for (let i = 0; i < 80; i++) { bs = (await p.evaluate(() => window.__yuddhButtons())).filter(x => x.label === label); if (bs[0]) break; await p.waitForTimeout(250); }
    if (!bs[0]) throw new Error(`${p.name}: no button "${label}"`);
    await p.mouse.click(bs[0].x, bs[0].y);
  };
  const info = p => p.evaluate(() => { const y = window.__yuddh; const st = y.state(); return { active: st.active, over: st.over, winner: st.winner, turn: st.turn, busy: y.busy(), hq: st.players.map(q => q.hq.hp), kosha: st.players.map(q => q.kosha), hand: st.players.map(q => q.hand.length), deck: st.players.map(q => q.deck.length), units: st.players.map(q => q.support.length), front: st.front.units.length }; });
  for (const p of [h, g]) {
    if ((await p.evaluate(() => window.__yuddhButtons())).some(x => x.label === 'Understood')) { await press(p, 'Understood'); await p.waitForTimeout(600); }
    await press(p, 'Two phones'); await p.waitForTimeout(2200);
  }
  await h.evaluate(a => window.__yuddhDuel.pick(a), process.env.A || 'rajput'); await g.evaluate(a => window.__yuddhDuel.pick(a), process.env.B || 'ghurid');
  await h.waitForTimeout(1200);
  await h.evaluate(() => window.__yuddhDuel.next()); await g.evaluate(() => window.__yuddhDuel.next());
  await h.waitForSelector('#yp #h'); await g.waitForSelector('#yp #j');
  await h.screenshot({ path: `${out}/50-pair-home.png` });
  await h.click('#yp #h'); await h.waitForFunction(() => window.__yuddhPair && window.__yuddhPair.hostCode, null, { timeout: 20000 });
  const hostCode = await h.evaluate(() => window.__yuddhPair.hostCode);
  await h.screenshot({ path: `${out}/51-pair-host.png` });
  await g.click('#yp #j'); await g.evaluate(c => window.__yuddhPair.join(c), hostCode);
  await g.waitForFunction(() => window.__yuddhPair && window.__yuddhPair.guestCode, null, { timeout: 20000 });
  const guestCode = await g.evaluate(() => window.__yuddhPair.guestCode);
  await g.screenshot({ path: `${out}/52-pair-guest.png` });
  await h.evaluate(c => window.__yuddhPair.reply(c), guestCode);
  for (const p of [h, g]) await p.waitForFunction(() => !!window.__yuddh, null, { timeout: 120000 });
  await h.waitForTimeout(2500);
  await h.screenshot({ path: `${out}/53-host-briefing.png` }); await g.screenshot({ path: `${out}/54-guest-briefing.png` });
  await press(h, 'Begin the battle'); await press(g, 'I am ready');
  await h.waitForTimeout(3000);
  const drag = async (p, f, t) => {
    if (f.y > +H * 0.7) { await p.mouse.move(f.x, +H * 0.45); await p.waitForTimeout(450); }
    await p.mouse.move(f.x, f.y); await p.waitForTimeout(350); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(f.x + (t.x - f.x) * i / 10, f.y + (t.y - f.y) * i / 10);
    await p.waitForTimeout(80); await p.mouse.up();
  };
  const idle = async p => { for (let i = 0; i < 240; i++) { const y = await info(p); if (!y.busy && (y.active === 0 || y.over)) return y; await p.waitForTimeout(250); } return info(p); };
  const mism = [];
  const agree = async tag => {
    // let the receiver finish replaying
    for (let i = 0; i < 80; i++) { const [a, c] = [await info(h), await info(g)]; if (!a.busy && !c.busy) break; await h.waitForTimeout(250); }
    const [a, c] = [await info(h), await info(g)];
    const sw = x => [x[1], x[0]];
    const same = JSON.stringify([a.hq, a.kosha, a.hand, a.deck, a.units, a.front, a.over]) === JSON.stringify([sw(c.hq), sw(c.kosha), sw(c.hand), sw(c.deck), sw(c.units), c.front, c.over]);
    if (!same) mism.push({ tag, host: a, guest: c });
    return same;
  };
  let actions = 0, failed = 0; const log = [];
  for (let turn = 0; turn < +(process.env.TURNS || 6); turn++) {
    const p = turn % 2 === 0 ? h : g;
    let y = await idle(p);
    if (y.over) break;
    if (turn < 3) await p.screenshot({ path: `${out}/60-turn-${turn}-${p.name}.png` });
    for (let k = 0; k < 10; k++) {
      const moves = await p.evaluate(() => window.__yuddh.moves());
      if (!moves.length) break;
      const rank = m => /Durg/.test(m.what) ? 0 : /attacks/.test(m.what) ? 1 : /advances/.test(m.what) ? 2 : /deploy/.test(m.what) ? 3 : 4;
      moves.sort((x, z) => rank(x) - rank(z));
      const m = moves[0], before = JSON.stringify(await info(p));
      await drag(p, m.from, m.to); y = await idle(p);
      if (JSON.stringify(y) === before) { failed++; log.push(`no effect: ${m.what}`); break; }
      actions++; log.push(`${p.name}: ${m.what}`);
      if (y.over) break;
    }
    y = await info(p); if (y.over) break;
    const end = await p.evaluate(() => window.__yuddh.endTurn());
    await p.mouse.click(end.x, end.y);
    await p.waitForTimeout(1500);
    await agree(`after turn ${turn} (${p.name})`);
    if (turn < 2) { await h.screenshot({ path: `${out}/61-after-${turn}-host.png` }); await g.screenshot({ path: `${out}/62-after-${turn}-guest.png` }); }
  }
  console.log(JSON.stringify({ host: await info(h), guest: await info(g), actions, failed, mismatches: mism, last: log.slice(-5), errors: [...h.errs, ...g.errs] }, null, 1));
  await b.close();
})();
