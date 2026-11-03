import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { FONT_SERIF, INK } from '../theme';

/** Gold-edged lacquer button. `primary` is filled gold. */
export function makeButton(label: string, onTap: () => void, opts: { w?: number; primary?: boolean } = {}): Container {
  const w = opts.w ?? 340, h = 64;
  const c = new Container();
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
    style: { fontFamily: FONT_SERIF, fontSize: 24, fontWeight: '700', letterSpacing: 5, fill: opts.primary ? 0x22150d : INK.goldPale }
  });
  t.anchor.set(0.5);
  c.addChild(bg, t);
  c.eventMode = 'static';
  c.cursor = 'pointer';
  c.on('pointerover', () => { draw(true); gsap.to(c.scale, { x: 1.04, y: 1.04, duration: 0.15 }); });
  c.on('pointerout', () => { draw(false); gsap.to(c.scale, { x: 1, y: 1, duration: 0.15 }); });
  c.on('pointertap', onTap);
  return c;
}
