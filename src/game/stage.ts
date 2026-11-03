/* Pixi application, fixed 1920×1080 design space scaled to fit the
   window, and a tiny scene switcher. */
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { DESIGN_H, DESIGN_W, INK } from './theme';

export interface Scene extends Container { enter?(): void; leave?(): void }

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
    await this.app.init({
      resizeTo: window, background: INK.night, antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true
    });
    document.body.appendChild(this.app.canvas);
    this.app.stage.addChild(this.backdrop, this.root);
    const fit = () => {
      const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
      this.root.scale.set(s);
      this.root.position.set((window.innerWidth - DESIGN_W * s) / 2, (window.innerHeight - DESIGN_H * s) / 2);
    };
    window.addEventListener('resize', () => { fit(); this.fitBackdrop(); });
    fit();
  }

  /** a picture that fills the whole window behind the design area, dimmed by `dim` */
  setBackdrop(tex: Texture | null, dim = 0.5): void {
    this.backdrop.removeChildren().forEach(c => c.destroy());
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

  show(scene: Scene): void {
    const old = this.current;
    this.current = scene;
    scene.alpha = 0;
    this.root.addChild(scene);
    scene.enter?.();
    gsap.to(scene, { alpha: 1, duration: 0.5 });
    if (old) gsap.to(old, { alpha: 0, duration: 0.35, onComplete: () => { old.leave?.(); destroyTree(old); } });
  }
}
