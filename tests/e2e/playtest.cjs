/* Scripted playtest: plays The First Throne through real mouse drags in
   Chromium, saving screenshots along the way. The game lists the legal
   drags (window.__yuddh.moves); the bot performs them with the mouse.
   Usage: node tests/e2e/playtest.cjs <url> <outdir> [width height] */
const { chromium } = require(process.env.PW || 'playwright');
const [url = 'http://localhost:4173/', out = '.', W = '1600', H = '900'] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(2500);
  const s = Math.min(+W / 1920, +H / 1080), ox = (+W - 1920 * s) / 2, oy = (+H - 1080 * s) / 2;
  const at = (x, y) => [ox + x * s, oy + y * s];
  const shot = n => p.screenshot({ path: `${out}/${n}.png` });
  const info = () => p.evaluate(() => { const y = window.__yuddh; const st = y.state(); return { active: st.active, over: st.over, winner: st.winner, turn: st.turn, busy: y.busy(), hq: st.players.map(q => q.hq.hp), kosha: st.players[0].kosha }; });
  const idle = async () => { for (let i = 0; i < 160; i++) { const y = await info(); if (!y.busy && (y.active === 0 || y.over)) return y; await p.waitForTimeout(250); } return info(); };
  const drag = async (f, t) => {
    await p.mouse.move(...at(f.x, f.y)); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(...at(f.x + (t.x - f.x) * i / 10, f.y + (t.y - f.y) * i / 10));
    await p.waitForTimeout(80); await p.mouse.up();
  };
  await shot('01-title');
  await p.mouse.click(...at(960, 680)); await p.waitForTimeout(1800); await shot('02-briefing');
  await p.mouse.click(...at(1030, 800)); await p.waitForTimeout(2800);
  // hover a card to check it lifts and is readable
  const h0 = await p.evaluate(() => window.__yuddh.hand()[1]);
  await p.mouse.move(...at(h0.x, h0.y)); await p.waitForTimeout(500); await shot('03-hover');
  await p.mouse.move(...at(900, 500)); await p.waitForTimeout(300);
  const log = []; let actions = 0, failed = 0;
  for (let turn = 0; turn < 40; turn++) {
    let y = await idle();
    if (y.over) break;
    for (let k = 0; k < 12; k++) {
      const moves = await p.evaluate(() => window.__yuddh.moves());
      if (!moves.length) break;
      // prefer: strike the Durg > attack > deploy > cast > advance
      const rank = m => /Durg/.test(m.what) ? 0 : /attacks/.test(m.what) ? 1 : /advances/.test(m.what) ? 2 : /deploy/.test(m.what) ? 3 : 4;
      moves.sort((a, b) => rank(a) - rank(b));
      const m = moves[0];
      const before = JSON.stringify(await info());
      await drag(m.from, m.to);
      y = await idle();
      if (JSON.stringify(y) === before) { failed++; log.push(`no effect: ${m.what}`); break; }
      actions++; log.push(`t${y.turn}: ${m.what}`);
      if (actions === 6) await shot('04-playing');
      if (y.over) break;
    }
    if (turn === 4) await shot('05-midgame');
    y = await info(); if (y.over) break;
    await p.mouse.click(...at(1690, 448));
    await p.waitForTimeout(1500);
    if (turn === 3) await shot('06-enemy-turn');
  }
  await p.waitForTimeout(2600);
  await shot('07-end');
  const fin = await info();
  console.log(JSON.stringify({ result: fin, actions, failed, last: log.slice(-8), errors: errs }, null, 1));
  await b.close();
})();
