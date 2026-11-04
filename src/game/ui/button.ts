import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { FONT_SERIF, INK } from '../theme';
import { view } from '../view';

/** every live button, so the automated playtest can find and press them by label */
const live = new Set<Container & { label: string }>();
const shownOnScreen = (c: Container): boolean => {
  for (let o: Container | null = c; o; o = o.parent) if (!o.visible || o.alpha === 0) return false;
  return true;
};
(window as unknown as { __yuddhButtons: () => { label: string; x: number; y: number }[] }).__yuddhButtons = () =>
  [...live].filter(b => !b.destroyed && b.parent && shownOnScreen(b)).map(b => { const p = b.getGlobalPosition(); return { label: b.label, x: p.x, y: p.y }; });

/** Gold-edged lacquer button. `primary` is filled gold. Sized up on phones (view.ui) unless `ui` is given. */
export function makeButton(label: string, onTap: () => void, opts: { w?: number; primary?: boolean; ui?: number } = {}): Container {
  const k = opts.ui ?? view.ui;
  const w = (opts.w ?? 340) * k, h = 64 * k;
  const c = new Container() as Container & { label: string };
  c.label = label;
  const bg = new Graphics();
  const draw = (hover: boolean) => {
    bg.clear();
    bg.roundRect(-w / 2, -h / 2, w, h, 6)
      .fill({ color: opts.primary ? (hover ? 0xe6bd62 : INK.gold) : (hover ? 0x3a2618 : 0x24170e), alpha: opts.primary ? 1 : 0.85 })
      .stroke({ width: 2, color: hover ? INK.goldPale : INK.gold, alpha: 0.9 });
    bg.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 3).stroke({ width: 1, color: INK.goldPale, alpha: 0.25 });
  };
  draw(false);
  const t = new Text({
    text: label.toUpperCase(),
    style: { fontFamily: FONT_SERIF, fontSize: Math.round(24 * k), fontWeight: '700', letterSpacing: 5, fill: opts.primary ? 0x22150d : INK.goldPale }
  });
  t.anchor.set(0.5);
  c.addChild(bg, t);
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.on('pointerover', () => { draw(true); gsap.to(c.scale, { x: 1.04, y: 1.04, duration: 0.15 }); });
  c.on('pointerout', () => { draw(false); gsap.to(c.scale, { x: 1, y: 1, duration: 0.15 }); });
  c.on('pointertap', onTap);
  live.add(c);
  c.on('destroyed', () => live.delete(c));
  return c;
}
