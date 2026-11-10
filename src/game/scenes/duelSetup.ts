/* ============================================================
   The Duel, set-up screen (pass-and-play, two humans, one device).
   Player 1 picks a faction, then hands the device to Player 2 who
   picks theirs; any pairing is allowed, including a mirror match.
   The list comes from data/duel.json. window.__yuddhDuel exposes the
   picker for the playtest.
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { FONT_BODY, FONT_DEVA, FONT_SERIF, FONT_TITLE, INK } from '../theme';
import { view } from '../view';
import { cardFace, FACE_H, FACE_W } from '../cards/paint';
import { makeButton } from '../ui/button';
import { audio } from '../audio';
import { loadArt, loadBattlefield, orTimeout } from '../../assets/manifest';
import { FACTIONS, type Faction } from '../../campaign/duel';
import { EMPIRES } from '../../engine';
import { destroyTree, type Scene, type Stage } from '../stage';

export function duelSetupScene(stage: Stage, back: () => void, begin: (a: Faction, b: Faction) => void, solo = false): Scene {
  const s: Scene = new Container();
  const body = new Container();
  s.addChild(body);
  let alive = true;
  let step: 0 | 1 = 0;                    // whose pick it is
  let first: Faction | null = null;       // player 1's faction once chosen
  let chosen: Faction | null = null;      // the highlighted faction for this step

  async function draw(): Promise<void> {
    await orTimeout(loadArt(FACTIONS.map(f => f.hero)), 4000);
    if (!alive) return;
    body.removeChildren().forEach(c => destroyTree(c as Container));
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const hdr = ph ? 96 : 150;
    body.addChild(new Graphics().rect(0, 0, W, hdr).fill({ color: 0x0a0604, alpha: 0.6 }));
    const kicker = new Text({ text: solo ? 'TWO PHONES' : step === 0 ? 'PASS AND PLAY · PLAYER 1' : 'PASS AND PLAY · PLAYER 2', style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 8, fill: INK.gold, stroke: { color: 0x000000, width: 4 } } });
    kicker.position.set(ph ? 40 : 90, ph ? 10 : 28);
    const title = new Text({ text: solo || step === 0 ? 'Choose your faction' : first ? `Choose a faction to face ${first.name}` : 'Choose your faction', style: { fontFamily: FONT_TITLE, fontSize: ph ? 46 : 64, fontWeight: '700', fill: INK.goldPale, stroke: { color: 0x000000, width: 6 } } });
    title.position.set(ph ? 38 : 86, ph ? 34 : 56);
    if (title.width > W - (ph ? 300 : 360)) title.scale.set((W - (ph ? 300 : 360)) / title.width);
    body.addChild(kicker, title);
    const bk = makeButton(step === 0 ? 'Back' : 'Change player 1', () => { if (step === 1) { step = 0; chosen = first; draw(); } else back(); }, { w: step === 1 ? 260 : (ph ? 150 : 170), ui: ph ? 0.85 : 1 });
    bk.position.set(W - (step === 1 ? (ph ? 130 : 160) : (ph ? 96 : 120)), ph ? 48 : 70);
    body.addChild(bk);

    // the grid of factions
    const cols = 8, rows = Math.ceil(FACTIONS.length / cols);
    const margin = ph ? 40 : 80, colW = (W - 2 * margin) / cols;
    const sc = Math.min(colW * 0.86 / FACE_W, ph ? 0.2 : 0.34), ch = FACE_H * sc, cw = FACE_W * sc;
    const rowH = ch + (ph ? 40 : 56);
    const gy = hdr + (ph ? 16 : 34);
    FACTIONS.forEach((f, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const t = new Container();
      t.position.set(margin + colW * (col + 0.5), gy + rowH * row + ch / 2);
      const on = chosen?.id === f.id;
      const ring = new Graphics();
      ring.roundRect(-cw / 2 - 6, -ch / 2 - 6, cw + 12, ch + 12, 10).fill({ color: on ? INK.gold : 0x000000, alpha: on ? 0.35 : 0 }).stroke({ width: on ? 4 : 0, color: INK.goldPale });
      const face = new Sprite(cardFace(f.hero)); face.anchor.set(0.5); face.scale.set(sc);
      face.alpha = on || !chosen ? 1 : 0.72;
      const name = new Text({ text: f.name, style: { fontFamily: FONT_TITLE, fontSize: Math.round(19 * k), fontWeight: '700', fill: on ? INK.goldPale : INK.cream, stroke: { color: 0x000000, width: 4 }, align: 'center' } });
      name.anchor.set(0.5, 0); name.position.set(0, ch / 2 + 8);
      if (name.width > colW - 8) name.scale.set((colW - 8) / name.width);
      t.addChild(ring, face, name);
      t.hitArea = { contains: (x: number, y: number) => Math.abs(x) < colW / 2 && y > -ch / 2 - 6 && y < ch / 2 + 40 };
      t.eventMode = 'static'; t.cursor = 'pointer';
      t.on('pointertap', () => { audio.play('click'); chosen = f; void draw(); });
      body.addChild(t);
    });

    // what the chosen faction is
    const iy = gy + rowH * rows + (ph ? 6 : 20);
    if (chosen) {
      const e = EMPIRES[chosen.empire];
      const nm = new Text({ text: chosen.name.toUpperCase(), style: { fontFamily: FONT_TITLE, fontSize: Math.round(30 * k), fontWeight: '700', letterSpacing: 4, fill: INK.goldPale, stroke: { color: 0x000000, width: 4 } } });
      const hi = new Text({ text: chosen.hindi, style: { fontFamily: FONT_DEVA, fontSize: Math.round(28 * k), fill: INK.gold, stroke: { color: 0x000000, width: 3 } } });
      const bl = new Text({ text: `${chosen.blurb}${e.passive ? `\n${e.passive}` : ''}`, style: { fontFamily: FONT_BODY, fontSize: Math.round(22 * k), fontWeight: '700', fill: INK.cream, wordWrap: true, wordWrapWidth: W - 2 * margin - 40, lineHeight: Math.round(30 * k), stroke: { color: 0x000000, width: 3 } } });
      nm.position.set(margin + 20, iy); hi.position.set(nm.x + nm.width + 24, iy + 2); bl.position.set(margin + 20, iy + nm.height + 6);
      body.addChild(nm, hi, bl);
    } else {
      const hint = new Text({ text: 'Tap a faction to see what it plays like.', style: { fontFamily: FONT_SERIF, fontSize: Math.round(28 * k), fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 3 } } });
      hint.position.set(margin + 20, iy); body.addChild(hint);
    }

    // proceed
    const ready = !!chosen;
    const label = solo ? 'Continue' : step === 0 ? 'Player 1 is ready' : 'Begin the duel';
    const go = makeButton(label, () => {
      if (!chosen) return;
      audio.play('conch');
      if (solo) begin(chosen, chosen);
      else if (step === 0) { first = chosen; step = 1; chosen = null; void draw(); }
      else if (first) begin(first, chosen);
    }, { primary: true, w: 400, ui: ph ? 1 : 1 });
    go.position.set(W / 2, H - (ph ? 44 : 70)); go.alpha = ready ? 1 : 0.4;
    body.addChild(go);
    const note = new Text({ text: solo ? 'Choose the faction you will command. Your friend chooses theirs on their own phone.' : step === 0 ? 'Player 1 moves first. Player 2 will choose next, so look away if you like.' : 'Player 2 draws one extra card to offset moving second.', style: { fontFamily: FONT_SERIF, fontSize: Math.round(22 * k), fontStyle: 'italic', fill: INK.gold, stroke: { color: 0x000000, width: 3 } } });
    note.anchor.set(0.5); note.position.set(W / 2, H - (ph ? 116 : 128));
    body.addChild(note);
  }

  (window as unknown as { __yuddhDuel: unknown }).__yuddhDuel = {
    pick: (id: string) => { chosen = FACTIONS.find(f => f.id === id) ?? null; void draw(); },
    next: () => { if (!chosen) return; if (solo) begin(chosen, chosen); else if (step === 0) { first = chosen; step = 1; chosen = null; void draw(); } else if (first) begin(first, chosen); }
  };
  s.relayout = () => { void draw(); };
  s.enter = () => {
    audio.playMusic('music_briefing');
    void loadBattlefield('tarain').then(t => { if (alive) stage.setBackdrop(t, 0.45); });
    void draw();
  };
  s.leave = () => { alive = false; };
  return s;
}
