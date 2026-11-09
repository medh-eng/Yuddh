/* ============================================================
   The Roll of Renown: one column per empire with the player's rank,
   Yash progress, wins and the next title. Tap a column to open that
   empire's campaign. Ranks are titles only (data/ranks.json).
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { FONT_BODY, FONT_DEVA, FONT_SERIF, FONT_TITLE, INK } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H } from '../cards/paint';
import { makeButton } from '../ui/button';
import { audio } from '../audio';
import { loadArt, loadBattlefield, orTimeout } from '../../assets/manifest';
import { battlesWon, CAMPAIGNS, type Campaign } from '../../campaign/campaign';
import { EMPIRES, LADDER, standing } from '../../meta/standing';
import { destroyTree, type Scene, type Stage } from '../stage';

export function standingScene(stage: Stage, back: () => void, open: (c: Campaign) => void): Scene {
  const s: Scene = new Container();
  const body = new Container();
  s.addChild(body);
  let alive = true;

  async function draw(): Promise<void> {
    await orTimeout(loadArt(CAMPAIGNS.map(c => EMPIRES[c.id]?.hero).filter(Boolean)), 4000);
    if (!alive) return;
    body.removeChildren().forEach(c => destroyTree(c as Container));
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const hdr = ph ? 118 : 205;
    body.addChild(new Graphics().rect(0, 0, W, hdr).fill({ color: 0x0a0604, alpha: 0.6 }));
    const kicker = new Text({ text: 'RANK & RENOWN', style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
    kicker.position.set(ph ? 60 : 100, ph ? 12 : 40);
    const title = new Text({ text: 'The Roll of Renown', style: { fontFamily: FONT_TITLE, fontSize: ph ? 54 : 72, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    title.position.set(ph ? 56 : 96, ph ? 38 : 70);
    body.addChild(kicker, title);
    const bk = makeButton('Back', back, { w: ph ? 150 : 170 });
    bk.position.set(ph ? W - 104 : W - 120, ph ? 52 : 70);
    body.addChild(bk);

    const won = battlesWon();
    const n = CAMPAIGNS.length, margin = ph ? 50 : 90, colW = (W - 2 * margin) / n;
    const sc0 = ph ? 0.26 : 0.46, ch = FACE_H * sc0;
    const cardCy = hdr + (ph ? 14 : 36) + ch / 2;
    const st = standing();
    CAMPAIGNS.forEach((camp, i) => {
      const e = EMPIRES[camp.id];
      if (!e) return;
      const s0 = st.of(camp.id), v = st.view(camp.id);
      const col = new Container();
      col.position.set(margin + colW * (i + 0.5), 0);
      const face = new Sprite(cardFace(e.hero)); face.anchor.set(0.5); face.scale.set(sc0); face.position.set(0, cardCy);
      col.addChild(face);
      let y = cardCy + ch / 2 + (ph ? 10 : 18);
      const add = (t: Text): void => { t.anchor.set(0.5, 0); t.position.set(0, y); if (t.width > colW - 24) t.scale.set((colW - 24) / t.width); y += t.height * t.scale.y + (ph ? 4 : 8); col.addChild(t); };
      add(new Text({ text: `${e.name.toUpperCase()} · ${e.hindi}`, style: { fontFamily: FONT_TITLE, fontSize: Math.round(22 * k), fontWeight: '700', letterSpacing: 3, fill: INK.gold, stroke: { color: 0x000000, width: 3 } } }));
      add(new Text({ text: v.rank.name, style: { fontFamily: FONT_TITLE, fontSize: Math.round(34 * (ph ? 1 : 1)), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 4 } } }));
      add(new Text({ text: `${v.rank.hindi} · ${v.rank.gloss}`, style: { fontFamily: FONT_DEVA, fontSize: Math.round(24 * k), fill: INK.cream, stroke: { color: 0x000000, width: 3 } } }));
      // progress to the next rank
      const bw = colW - (ph ? 50 : 90), bh = ph ? 12 : 16;
      const pct = v.next ? Math.min(1, v.into / v.span) : 1;
      const bar = new Graphics().roundRect(-bw / 2, y + 2, bw, bh, bh / 2).fill({ color: 0x1a0f08, alpha: 0.95 }).stroke({ width: 2, color: INK.gold })
        .roundRect(-bw / 2 + 2, y + 4, Math.max(bh - 4, (bw - 4) * pct), bh - 4, (bh - 4) / 2).fill(INK.gold);
      col.addChild(bar); y += bh + (ph ? 8 : 12);
      add(new Text({ text: v.next ? `Yash ${s0.yash} · ${v.next.from - s0.yash} to ${v.next.name}` : `Yash ${s0.yash} · highest rank`, style: { fontFamily: FONT_BODY, fontSize: Math.round(22 * k), fontWeight: '700', fill: INK.cream, stroke: { color: 0x000000, width: 3 } } }));
      const cleared = camp.nodes.filter(nd => !nd.scenario.coached && won.includes(nd.scenario.id)).length, total = camp.nodes.filter(nd => !nd.scenario.coached).length;
      add(new Text({ text: `Battles cleared ${cleared}/${total} · won ${s0.wins} of ${s0.played}`, style: { fontFamily: FONT_BODY, fontSize: Math.round(20 * k), fill: INK.cream, stroke: { color: 0x000000, width: 3 } } }));
      if (s0.vetWins) add(new Text({ text: `Veteran wins ${s0.vetWins}`, style: { fontFamily: FONT_BODY, fontSize: Math.round(20 * k), fontWeight: '700', fill: INK.gold, stroke: { color: 0x000000, width: 3 } } }));
      col.eventMode = 'static'; col.cursor = 'pointer';
      col.hitArea = { contains: (x: number, yy: number) => Math.abs(x) < colW / 2 && yy > hdr && yy < H - 120 };
      col.on('pointertap', () => { audio.unlock(); audio.play('click'); open(camp); });
      body.addChild(col);
    });
    // the ladder and the rules of earning Yash
    const ladder = new Text({ text: LADDER.map(r => r.name).join('  ·  '), style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 4 }, align: 'center' } });
    const gloss = new Text({ text: LADDER.map(r => r.gloss).join('  ·  '), style: { fontFamily: FONT_SERIF, fontSize: Math.round(20 * k), fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 3 }, align: 'center' } });
    const rule = new Text({ text: 'Yash: +80 for a win, +120 more for your first win in a battle, +20 for a defeat, ×1.5 against the Veteran foe. Ranks are titles; they never change a battle.', style: { fontFamily: FONT_BODY, fontSize: Math.round(19 * k), fill: INK.cream, stroke: { color: 0x000000, width: 3 }, align: 'center', wordWrap: true, wordWrapWidth: W - 160 } });
    [ladder, gloss, rule].forEach(t => { t.anchor.set(0.5, 1); t.eventMode = 'none'; if (t.width > W - 120 && t !== rule) t.scale.set((W - 120) / t.width); body.addChild(t); });
    rule.position.set(W / 2, H - (ph ? 12 : 30));
    gloss.position.set(W / 2, rule.y - rule.height - (ph ? 4 : 8));
    ladder.position.set(W / 2, gloss.y - gloss.height * gloss.scale.y - (ph ? 2 : 4));
  }

  s.relayout = () => { void draw(); };
  s.enter = () => {
    audio.playMusic('music_briefing');
    void loadBattlefield('pataliputra').then(t => { if (alive) stage.setBackdrop(t, 0.45); });
    void draw();
  };
  s.leave = () => { alive = false; };
  return s;
}
