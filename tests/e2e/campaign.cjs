/* Scripted playtest of the campaign: title → Campaign map → The Indus Line (or SCENARIO=golden_age), played through
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
  await press('Campaign'); await p.waitForTimeout(2500); await shot('02-campaign-map');
  const nodes = await p.evaluate(() => window.__yuddhCampaign());
  console.log('map nodes', JSON.stringify(nodes));
  const target = process.env.SCENARIO || 'indus_line';
  if (['golden_age','digvijaya','mahakantara','kanchi','narmada_line','kadaram','ganga','lanka','tarain1','tarain2','chandawar','pullalur'].includes(target)) { const tab = nodes.find(n => n.id === (['narmada_line','pullalur'].includes(target) ? 'tab:chalukya' : ['tarain1','tarain2','chandawar'].includes(target) ? 'tab:rajput' : ['kadaram','ganga','lanka'].includes(target) ? 'tab:chola' : 'tab:gupta')); await p.mouse.click(tab.x, tab.y); await p.waitForTimeout(2500); await shot('02b-gupta-map'); }
  const indus = (await p.evaluate(() => window.__yuddhCampaign())).find(n => n.id === target);
  await p.mouse.click(indus.x, indus.y);
  await p.waitForFunction(() => !!window.__yuddh && !window.__yuddhButtons().some(b => b.label === 'Campaign'), null, { timeout: 90000 }); await p.waitForTimeout(1800); await shot('03-indus-briefing');
  await press('To battle'); await p.waitForTimeout(3200); await shot('04-indus-start');
  const hand = await p.evaluate(() => window.__yuddh.hand());
  await p.mouse.click(hand[2].x, hand[2].y); await p.waitForTimeout(500); await shot('05-selected');
  await p.mouse.click(hand[2].x, hand[2].y); await p.waitForTimeout(300);
  await p.mouse.move(+W / 2, +H / 3); await p.waitForTimeout(300);
  const log = []; let actions = 0, failed = 0, springs = 0;
  for (let turn = 0; turn < +(process.env.TURNS || 40); turn++) {
    let y = await idle();
    if (y.over) break;
    for (let k = 0; k < 12; k++) {
      const moves = await p.evaluate(() => window.__yuddh.moves());
      if (!moves.length) break;
      // prefer: strike the Durg > attack > advance > deploy > cast
      const rank = m => /Durg/.test(m.what) ? 0 : /attacks/.test(m.what) ? 1 : /advances/.test(m.what) ? 2 : /deploy/.test(m.what) ? 3 : 4;
      moves.sort((a, c) => rank(a) - rank(c));
      const m = moves[0];
      const before = JSON.stringify(await info());
      await drag(m.from, m.to);
      if (/cast y_/.test(m.what)) { await p.waitForTimeout(330); await shot(`10-yantra-set-t${turn}`); }
      y = await idle();
      if (JSON.stringify(y) === before) {
        failed++;
        log.push(`no effect: ${m.what} (${Math.round(m.from.x)},${Math.round(m.from.y)} → ${Math.round(m.to.x)},${Math.round(m.to.y)})`);
        if (failed <= 3) await shot(`fail-${failed}`);
        break;
      }
      actions++; log.push(`t${y.turn}: ${m.what}`);
      if (actions === 6) await shot('11-playing');
      if (y.over) break;
    }
    if (turn === 4) await shot('12-midgame');
    if (turn === 4 || turn === 8) {
      // read an enemy card: tap it, photograph the reading panel, tap to close
      const foe = (await p.evaluate(() => window.__yuddh.tokens())).find(t => t.owner === 1);
      if (foe) { await p.mouse.click(foe.x, foe.y); await p.waitForTimeout(700); await shot(`12-read-enemy-t${turn}`); await p.mouse.click(5, +H / 2); await p.waitForTimeout(400); }
    }
    y = await info(); if (y.over) break;
    const before = y.yantras.join();
    const end = await p.evaluate(() => window.__yuddh.endTurn());
    await p.mouse.click(end.x, end.y);
    // film the enemy turn of turn 2 to catch cards turning over
    if (turn === 2) for (let f = 0; f < 10; f++) { await p.waitForTimeout(330); await shot(`13-enemy-turn-${String(f).padStart(2, '0')}`); }
    else await p.waitForTimeout(1500);
    const after = await info();
    if (after.yantras.join() !== before) springs++;
  }
  await p.waitForTimeout(2600);
  await shot('14-end');
  const fin = await info();
  console.log(JSON.stringify({ result: fin, actions, failed, yantraChanges: springs, last: log.slice(-8), failures: log.filter(l => l.startsWith('no effect')), errors: errs }, null, 1));
  await b.close();
})();
