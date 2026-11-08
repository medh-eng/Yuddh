/* The History panel: a painting on the left, and on the right what history
   says, what the game changes (each row tagged HISTORY / TRADITION / INVENTED),
   and a source line at the bottom. Also used for the epilogue after a victory
   and for the one-time "history and imagination" notice. */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { FONT_BODY, FONT_SERIF, FONT_TITLE, INK } from '../theme';
import { view } from '../view';
import { cardFace } from '../cards/paint';
import { makeButton } from './button';
import { HISTORY_NOTICE, historyOf, type HistoryBasis } from '../../data';

const TAG: Record<HistoryBasis, number> = { HISTORY: 0xe6bd62, TRADITION: 0x8fc4ff, INVENTED: 0xff9a86 };

interface Block { head: string; text?: string; rows?: { basis: HistoryBasis; text: string }[] }
interface Spec { kicker: string; title: string; card?: string; blocks: Block[]; source: string; button: string; onClose: () => void }

function build(spec: Spec): Container {
  const W = view.w, H = view.h, ph = view.phone, k = view.ui;
  const c = new Container();
  const dim = new Graphics().rect(0, 0, W, H).fill({ color: 0x000000, alpha: 0.94 });
  dim.eventMode = 'static';
  c.addChild(dim);
  let tx = ph ? 60 : 120;
  if (spec.card) {
    const sc = ph ? (H * 0.62) / 672 : 0.62;
    const art = new Sprite(cardFace(spec.card)); art.anchor.set(0.5); art.rotation = -0.04; art.scale.set(sc);
    art.position.set((ph ? 40 : 90) + 240 * sc, ph ? H * 0.44 : H * 0.44);
    c.addChild(art);
    tx = (ph ? 40 : 90) + 480 * sc + (ph ? 40 : 60);
  }
  const wrap = W - tx - (ph ? 40 : 100);
  const kick = new Text({ text: spec.kicker, style: { fontFamily: FONT_TITLE, fontSize: Math.round(20 * k), fontWeight: '700', letterSpacing: 6, fill: INK.gold } });
  const title = new Text({ text: spec.title, style: { fontFamily: FONT_TITLE, fontSize: ph ? 54 : 64, fontWeight: '700', fill: INK.goldPale } });
  if (title.width > wrap) title.scale.set(wrap / title.width);
  const btn = makeButton(spec.button, spec.onClose, { primary: true, w: 300 });
  const btnY = H - (ph ? 54 : 78);
  btn.position.set(W - (ph ? 190 : 270), btnY);
  const src = new Text({ text: spec.source, style: { fontFamily: FONT_BODY, fontSize: Math.round(21 * k), fontStyle: 'italic', fill: INK.cream, wordWrap: true, wordWrapWidth: wrap - (ph ? 330 : 360), lineHeight: Math.round(27 * k) } });
  // the source line gets at most three short lines beside the button: shrink the type until it does
  for (let f = Math.round(21 * k); f >= 13 && src.height > 3 * f * 1.25; f--) { src.style.fontSize = f; src.style.lineHeight = Math.round(f * 1.25); }
  src.anchor.set(0, 0.5); src.position.set(tx, btnY);
  kick.position.set(tx, ph ? 22 : 70); title.position.set(tx, kick.y + kick.height + 4);
  c.addChild(kick, title, src, btn);

  // body: step the type down until everything fits above the source line
  const body = new Container(); c.addChild(body);
  const top = title.y + title.height * title.scale.y + (ph ? 12 : 26), limit = btnY - (ph ? 50 : 62);
  for (let f = ph ? 24 : 30; f >= 17; f -= 1) {
    body.removeChildren().forEach(o => o.destroy({ children: true }));
    let y = top;
    for (const b of spec.blocks) {
      const h = new Text({ text: b.head, style: { fontFamily: FONT_TITLE, fontSize: Math.round(f * 0.7 * k), fontWeight: '700', letterSpacing: 4, fill: INK.gold } });
      h.position.set(tx, y); body.addChild(h); y += h.height + 4;
      if (b.text) {
        const t = new Text({ text: b.text, style: { fontFamily: FONT_SERIF, fontSize: Math.round(f * k), fill: INK.cream, wordWrap: true, wordWrapWidth: wrap, lineHeight: Math.round(f * k * 1.34) } });
        t.position.set(tx, y); body.addChild(t); y += t.height + (ph ? 8 : 14);
      }
      for (const r of b.rows ?? []) {
        const tg = new Text({ text: r.basis, style: { fontFamily: FONT_TITLE, fontSize: Math.round(f * 0.62 * k), fontWeight: '700', letterSpacing: 2, fill: 0x22150d } });
        const tw = tg.width + 18, th = tg.height + 6;
        const pill = new Graphics().roundRect(0, 0, tw, th, 5).fill(TAG[r.basis]);
        pill.position.set(tx, y + 2); tg.position.set(tx + 9, y + 5);
        const t = new Text({ text: r.text, style: { fontFamily: FONT_SERIF, fontSize: Math.round(f * 0.92 * k), fill: INK.cream, wordWrap: true, wordWrapWidth: wrap - 150 * k, lineHeight: Math.round(f * 0.92 * k * 1.3) } });
        t.position.set(tx + Math.max(tw, 112 * k) + 14, y);
        body.addChild(pill, tg, t); y += Math.max(t.height, th) + (ph ? 6 : 10);
      }
      y += ph ? 4 : 10;
    }
    if (y <= limit) break;
  }
  return c;
}

/** the History note of a battle; null when it has none */
export function historyPanel(scenarioId: string, title: string, card: string, onClose: () => void, button = 'Back'): Container | null {
  const h = historyOf(scenarioId); if (!h) return null;
  return build({ kicker: 'HISTORY · ' + h.kicker, title, card, button, onClose, source: h.source,
    blocks: [{ head: 'WHAT HISTORY SAYS', text: h.happened }, { head: 'WHAT THE GAME CHANGES', rows: h.changed }] });
}

/** after a victory: a short epilogue with the same source line */
export function epiloguePanel(scenarioId: string, title: string, card: string, onClose: () => void, button = 'Continue'): Container | null {
  const h = historyOf(scenarioId); if (!h) return null;
  return build({ kicker: 'AFTER THE BATTLE', title, card, button, onClose, source: h.source, blocks: [{ head: 'WHAT CAME NEXT', text: h.epilogue }] });
}

/** the "history and imagination" notice shown on first launch and from the title screen */
export function noticePanel(onClose: () => void, button = 'Understood'): Container {
  return build({ kicker: 'ABOUT THE GAME', title: HISTORY_NOTICE.title, button, onClose, source: HISTORY_NOTICE.source, blocks: [{ head: 'A NOTE BEFORE YOU BEGIN', text: HISTORY_NOTICE.text }] });
}
