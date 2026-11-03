/* Pixi application, fixed 1920×1080 design space scaled to fit the
   window, and a tiny scene switcher. */
import { Application, Container } from 'pixi.js';
import gsap from 'gsap';
import { DESIGN_H, DESIGN_W, INK } from './theme';

export interface Scene extends Container { enter?(): void; leave?(): void }

export class Stage {
  app = new Application();
  root = new Container();
  current: Scene | null = null;

  async init(): Promise<void> {
    await this.app.init({
      resizeTo: window, background: INK.night, antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), autoDensity: true
    });
    document.body.appendChild(this.app.canvas);
    this.app.stage.addChild(this.root);
    const fit = () => {
      const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
      this.root.scale.set(s);
      this.root.position.set((window.innerWidth - DESIGN_W * s) / 2, (window.innerHeight - DESIGN_H * s) / 2);
    };
    window.addEventListener('resize', fit);
    fit();
  }

  show(scene: Scene): void {
    const old = this.current;
    this.current = scene;
    scene.alpha = 0;
    this.root.addChild(scene);
    scene.enter?.();
    gsap.to(scene, { alpha: 1, duration: 0.5 });
    if (old) gsap.to(old, { alpha: 0, duration: 0.35, onComplete: () => { old.leave?.(); old.destroy({ children: true }); } });
  }
}
