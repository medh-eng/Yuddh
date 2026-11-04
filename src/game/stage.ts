/* Pixi application, a design space scaled to fit the window (see view.ts),
   and a tiny scene switcher. */
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { INK } from './theme';
import { measureView, view } from './view';

export interface Scene extends Container {
  enter?(): void;
  leave?(): void;
  /** called when the window changes between desktop and phone layouts, or the phone's shape changes */
  relayout?(): void;
  /** a fixed design size; scenes without one follow `view` */
  design?: { w: number; h: number };
}

/** Stop every tween on a display object and everything inside it, then destroy it.
    A tween left running on a destroyed object throws on every frame and stalls all animation. */
export function destroyTree(o: Container): void {
  const walk = (c: Container) => {
    gsap.killTweensOf(c); gsap.killTweensOf(c.scale);
    c.children.forEach(ch => walk(ch as Container));
  };
  walk(o);
  o.destroy({ children: true });
}

export class Stage {
  app = new Application();
  root = new Container();
  backdrop = new Container();
  current: Scene | null = null;
  private fitBackdrop = () => {};

  async init(): Promise<void> {
    measureView();
    await this.app.init({
      resizeTo: window, background: INK.night, antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true
    });
    document.body.appendChild(this.app.canvas);
    this.app.stage.addChild(this.backdrop, this.root);
    window.addEventListener('resize', () => {
      const changed = measureView();
      if (changed) this.current?.relayout?.();
      this.fit(); this.fitBackdrop();
    });
    this.fit();
  }

  /** scale the design space of the current scene into the window, centred */
  fit(): void {
    const d = this.current?.design ?? view;
    const s = Math.min(window.innerWidth / d.w, window.innerHeight / d.h);
    this.root.scale.set(s);
    this.root.position.set((window.innerWidth - d.w * s) / 2, (window.innerHeight - d.h * s) / 2);
  }

  /** a picture that fills the whole window behind the design area, dimmed by `dim` */
  setBackdrop(tex: Texture | null, dim = 0.5): void {
    this.backdrop.children.forEach(c => gsap.killTweensOf(c));
    this.backdrop.removeChildren().forEach(c => c.destroy());
    gsap.killTweensOf(this.backdrop);
    this.fitBackdrop = () => {};
    if (!tex) return;
    const sp = new Sprite(tex);
    const shade = new Graphics();
    this.backdrop.addChild(sp, shade);
    this.fitBackdrop = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const s = Math.max(w / tex.width, h / tex.height);
      sp.scale.set(s); sp.position.set((w - tex.width * s) / 2, (h - tex.height * s) / 2);
      shade.clear().rect(0, 0, w, h).fill({ color: 0x0a0604, alpha: dim });
    };
    this.fitBackdrop();
    this.backdrop.alpha = 0;
    gsap.to(this.backdrop, { alpha: 1, duration: 0.6 });
  }

  /** the backdrop picture, for scenes that animate it (the title's slow drift) */
  backdropSprite(): Sprite | null { return (this.backdrop.children[0] as Sprite) ?? null; }

  show(scene: Scene): void {
    const old = this.current;
    this.current = scene;
    this.fit();
    scene.alpha = 0;
    this.root.addChild(scene);
    scene.enter?.();
    gsap.to(scene, { alpha: 1, duration: 0.5 });
    if (old) gsap.to(old, { alpha: 0, duration: 0.35, onComplete: () => { old.leave?.(); destroyTree(old); } });
  }
}
