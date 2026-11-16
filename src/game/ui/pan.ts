/* A sideways-swipeable strip: a clipped window onto a wider `content`
   container. Drag (mouse or finger) with a little momentum, wheel, arrow
   keys, or the edge arrows. Things inside keep one fixed, large size and the
   strip simply gets longer, instead of everything shrinking to fit.
   A tap inside the strip must first ask `pan.dragged()`: a swipe that ends on
   a card or button must not also press it. */
import { Container, Graphics, Rectangle } from 'pixi.js';
import gsap from 'gsap';
import { INK } from '../theme';

export interface PanBox { x: number; y: number; w: number; h: number }
export interface Pan {
  view: Container;
  /** put the strip's contents here; x runs from the strip's left edge */
  content: Container;
  box: PanBox;
  setWidth(contentW: number): void;
  offset(): number;
  max(): number;
  scrollTo(off: number, animate?: boolean): void;
  scrollBy(d: number, animate?: boolean): void;
  /** true after a swipe, until the next press: ignore taps while it is */
  dragged(): boolean;
  onScroll(cb: () => void): void;
}

export function makePan(box: PanBox, opts: { keys?: boolean } = {}): Pan {
  const view = new Container();
  view.position.set(box.x, box.y);
  const content = new Container();
  const mask = new Graphics().rect(0, 0, box.w, box.h).fill(0xffffff);
  view.addChild(content, mask);
  content.mask = mask;
  view.eventMode = 'static';
  view.hitArea = new Rectangle(0, 0, box.w, box.h);

  let width = box.w, off = 0;
  let down = false, moved = false, startX = 0, startOff = 0, lastX = 0, lastT = 0, vel = 0;
  const listeners: (() => void)[] = [];
  const state = { v: 0 };
  const max = (): number => Math.max(0, width - box.w);
  const stop = (): void => { gsap.killTweensOf(state); };
  const apply = (o: number): void => {
    if (content.destroyed) return;
    off = o; content.x = -o;
    listeners.forEach(f => f());
  };
  const rubber = (o: number): number => (o < 0 ? o * 0.35 : o > max() ? max() + (o - max()) * 0.35 : o);
  const clamp = (o: number): number => Math.max(0, Math.min(max(), o));
  const glide = (to: number, dur: number): void => {
    stop(); state.v = off;
    gsap.to(state, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => apply(state.v) });
  };
  const lx = (e: { global: { x: number; y: number } }): number => view.toLocal(e.global).x;

  view.on('pointerdown', e => {
    stop(); down = true; moved = false; startX = lx(e); startOff = off; lastX = startX; lastT = performance.now(); vel = 0;
  });
  view.on('globalpointermove', e => {
    if (!down) return;
    const x = lx(e);
    if (!moved && Math.abs(x - startX) > 14) moved = true;
    if (!moved) return;
    apply(rubber(startOff - (x - startX)));
    const t = performance.now(), dt = t - lastT;
    if (dt > 0) { vel = 0.75 * vel + 0.25 * (-(x - lastX) / dt); lastX = x; lastT = t; }
  });
  const up = (): void => {
    if (!down) return;
    down = false;
    if (!moved) return;
    if (performance.now() - lastT > 90) vel = 0; // the finger rested before it lifted
    const target = clamp(off + vel * 320);
    glide(target, Math.min(0.9, 0.3 + Math.abs(target - off) / 2500));
  };
  view.on('pointerup', up);
  view.on('pointerupoutside', up);
  view.on('pointercancel', up);
  view.on('wheel', e => {
    if (max() === 0) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    stop(); apply(clamp(off + (d / (view.worldTransform.a || 1)) * 1.2));
  });

  const pan: Pan = {
    view, content, box,
    setWidth(w) { width = w; apply(Math.min(off, max())); },
    offset: () => off,
    max,
    scrollTo(o, animate = true) { const t = clamp(o); if (animate) glide(t, 0.5); else { stop(); apply(t); } },
    scrollBy(d, animate = false) { pan.scrollTo(off + d, animate); },
    dragged: () => moved,
    onScroll(cb) { listeners.push(cb); }
  };

  const key = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowRight') pan.scrollBy(box.w * 0.5, true);
    else if (e.key === 'ArrowLeft') pan.scrollBy(-box.w * 0.5, true);
  };
  if (opts.keys) window.addEventListener('keydown', key);
  view.on('destroyed', () => { stop(); window.removeEventListener('keydown', key); });
  return pan;
}

/** Edge arrows (shown only while there is more in that direction) and a thin position bar,
    so it is clear the strip can be swiped. Add the result above the pan, not inside it. */
export function panHints(pan: Pan, o: { k: number; cy?: number; r?: number; bar?: boolean }): Container {
  const c = new Container();
  const { box } = pan;
  const r = o.r ?? 30 * o.k;
  const cy = o.cy ?? box.y + box.h / 2;
  const arrow = (dir: -1 | 1): Container => {
    const b = new Container();
    b.addChild(new Graphics().circle(0, 0, r).fill({ color: 0x140c07, alpha: 0.8 }).stroke({ width: 2, color: INK.gold, alpha: 0.9 }));
    const s = r * 0.32;
    b.addChild(new Graphics().moveTo(-dir * s * 0.6, -s * 1.2).lineTo(dir * s * 0.7, 0).lineTo(-dir * s * 0.6, s * 1.2).stroke({ width: Math.max(3, r * 0.14), color: INK.goldPale, cap: 'round', join: 'round' }));
    b.position.set(dir < 0 ? box.x + r + 4 : box.x + box.w - r - 4, cy);
    b.eventMode = 'static'; b.cursor = 'pointer';
    b.on('pointertap', () => pan.scrollBy(dir * box.w * 0.7, true));
    return b;
  };
  const left = arrow(-1), right = arrow(1);
  c.addChild(left, right);
  const barG = new Graphics();
  barG.eventMode = 'none';
  if (o.bar !== false) c.addChild(barG);
  const update = (): void => {
    if (c.destroyed) return;
    const m = pan.max();
    left.visible = pan.offset() > 6;
    right.visible = pan.offset() < m - 6;
    barG.clear();
    if (m > 0 && o.bar !== false) {
      const tw = Math.min(420, box.w * 0.3), th = 5, tx = box.x + box.w / 2 - tw / 2, ty = box.y + box.h - 8;
      const frac = box.w / (box.w + m);
      barG.roundRect(tx, ty, tw, th, 2.5).fill({ color: 0x000000, alpha: 0.45 });
      barG.roundRect(tx + (tw - tw * frac) * (pan.offset() / m), ty, tw * frac, th, 2.5).fill({ color: INK.gold, alpha: 0.9 });
    }
  };
  pan.onScroll(update);
  update();
  return c;
}
