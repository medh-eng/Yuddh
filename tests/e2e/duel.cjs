/* Scripted playtest of pass-and-play: title → Two players → pick A and B (env A, B ids from data/duel.json) → both sides played by the bot with the pass-the-device curtain between turns, played through
   real mouse drags in Chromium, saving screenshots along the way. Set TURNS to stop early.
   The game lists its buttons (window.__yuddhButtons) and every legal drag
   (window.__yuddh.moves) in screen pixels; the bot presses and drags them.
   Usage: node tests/e2e/playtest.cjs <url> <outdir> [width height] */
const { chromium } = require(process.env.PW || 'playwright');
const [url = 'http://localhost:4173/', out = '.', W = '1600', H = '900'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  // the sandbox's software GPU draws a few frames a second at desktop size; a drag can take longer
  // than the 0.48 s hold that opens a card, so the bot holds that off (real devices are unaffected)
  await p.addInitScript(() => { window.__yuddhLongPressMs = 4000; try { localStorage.setItem('yuddh.notice.v1', '1'); } catch (e) { /* the first-launch history notice would cover the title */ } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(2500);
  const shot = n => p.screenshot({ path: `${out}/${n}.png` });
  const press = async (label, nth = 0) => {
    let bs = [];
    // buttons fade in one after another; wait up to 10 s for this one to appear
    for (let i = 0; i < 40; i++) { bs = (await p.evaluate(() => window.__yuddhButtons())).filter(x => x.label === label); if (bs[nth]) break; await p.waitForTimeout(250); }
    if (!bs[nth]) throw new Error(`no button "${label}" (have: ${(await p.evaluate(() => window.__yuddhButtons())).map(x => x.label).join(', ')})`);
    await p.mouse.click(bs[nth].x, bs[nth].y);
  };
  const info = () => p.evaluate(() => { const y = window.__yuddh; const st = y.state(); return { active: st.active, over: st.over, winner: st.winner, turn: st.turn, busy: y.busy(), hq: st.players.map(q => q.hq.hp), kosha: st.players[0].kosha, yantras: st.players.map(q => q.yantras.length) }; });
  const idle = async () => { for (let i = 0; i < 200; i++) { const y = await info(); if (!y.busy && (y.active === 0 || y.over)) return y; await p.waitForTimeout(250); } return info(); };
  const drag = async (f, t) => {
    // with a mouse, the hand card under the pointer lifts and grows over its neighbours; step off the hand
    // first so the card the bot wants is not hidden under one lifted earlier
    if (f.y > +H * 0.7) { await p.mouse.move(f.x, +H * 0.45); await p.waitForTimeout(450); }
    await p.mouse.move(f.x, f.y); await p.waitForTimeout(350); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(f.x + (t.x - f.x) * i / 10, f.y + (t.y - f.y) * i / 10);
    await p.waitForTimeout(80); await p.mouse.up();
  };
  await shot('01-title');
  // the first-launch history notice sits over the title until it is dismissed
  if ((await p.evaluate(() => window.__yuddhButtons())).some(x => x.label === 'Understood')) { await press('Understood'); await p.waitForTimeout(800); }
  await press('Two players'); await p.waitForTimeout(2500); await shot('20-pick-1');
  const A = process.env.A || 'rajput', B = process.env.B || 'ghurid';
  await p.evaluate(a => window.__yuddhDuel.pick(a), A); await p.waitForTimeout(1500); await shot('21-picked-1');
  await p.evaluate(() => window.__yuddhDuel.next()); await p.waitForTimeout(1500); await shot('22-pick-2');
  await p.evaluate(b => window.__yuddhDuel.pick(b), B); await p.waitForTimeout(1200);
  await p.evaluate(() => window.__yuddhDuel.next());
  await p.waitForFunction(() => !!window.__yuddh && !window.__yuddhButtons().some(b => b.label === 'Begin the duel' && false), null, { timeout: 90000 });
  await p.waitForTimeout(2000); await shot('23-briefing');
  await press('Begin the duel'); await p.waitForTimeout(3200); await shot('24-start');
  const flips = [], handsSeen = [];
  let actions = 0, failed = 0, curtains = 0; const log = [];
  for (let turn = 0; turn < +(process.env.TURNS || 14); turn++) {
    let y = await idle();
    if (y.over) break;
    const fl = await p.evaluate(() => window.__yuddh.flipped()); flips.push(fl);
    handsSeen.push(await p.evaluate(() => window.__yuddh.hand().length));
    if (turn < 2) await shot(`30-turn-${turn}`);
    if (process.env.FAST && turn === 1) await p.evaluate(() => window.__yuddh.state().players.forEach(q => { q.hq.hp = 3; }));
    for (let k = 0; k < 12; k++) {
      const moves = await p.evaluate(() => window.__yuddh.moves());
      if (!moves.length) break;
      const rank = m => /Durg/.test(m.what) ? 0 : /attacks/.test(m.what) ? 1 : /advances/.test(m.what) ? 2 : /deploy/.test(m.what) ? 3 : 4;
      moves.sort((a, c) => rank(a) - rank(c));
      const m = moves[0];
      const before = JSON.stringify(await info());
      await drag(m.from, m.to);
      y = await idle();
      if (JSON.stringify(y) === before) { failed++; log.push(`no effect: ${m.what}`); if (failed <= 3) await shot(`fail-${failed}`); break; }
      actions++; log.push(`t${y.turn}${fl ? 'B' : 'A'}: ${m.what}`);
      if (y.over) break;
    }
    y = await info(); if (y.over) break;
    const end = await p.evaluate(() => window.__yuddh.endTurn());
    await p.mouse.click(end.x, end.y);
    if (turn === 0) { await p.waitForTimeout(700); await shot('31-curtain'); }
    await press('I am ready'); curtains++;
    if (turn < 2) { /* the curtain is up: shot happens after the press, so take it before next time */ }
    await p.waitForTimeout(1800);
  }
  await p.waitForTimeout(2600);
  await shot('40-end');
  const fin = await info();
  const flipped = await p.evaluate(() => window.__yuddh.flipped());
  console.log(JSON.stringify({ result: fin, flipped, flips, handsSeen, curtains, actions, failed, last: log.slice(-6), failures: log.filter(l => l.startsWith('no effect')), errors: errs }, null, 1));
  await b.close();
})();
