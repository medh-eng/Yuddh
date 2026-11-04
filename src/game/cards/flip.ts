/* ============================================================
   Turning a card over. For the length of the turn the card's
   sprite is swapped for a perspective mesh whose corners follow a
   card rotating about its upright axis, so the near edge grows and
   the far edge shrinks as in a real hand. The face darkens as it
   turns edge-on, like a painting tilted away from the lamp.
   ============================================================ */
import { PerspectiveMesh, type Sprite, type Texture } from 'pixi.js';
import gsap from 'gsap';

export interface FlipOptions {
  duration?: number;
  delay?: number;
  /** 1 turns the right edge away from you, -1 the left */
  dir?: 1 | -1;
  /** called at the moment the new face comes into view */
  onHalf?: () => void;
}

/** Turn `sprite` (anchor 0.5) over to show `to`. Resolves when it has landed;
    safe if the sprite is destroyed half-way (the turn simply stops). */
export function flipSprite(sprite: Sprite, to: Texture, opts: FlipOptions = {}): Promise<void> {
  const parent = sprite.parent;
  if (!parent || sprite.destroyed) { if (!sprite.destroyed) sprite.texture = to; return Promise.resolve(); }
  const from = sprite.texture;
  const dir = opts.dir ?? 1;
  const mesh = new PerspectiveMesh({ texture: from, verticesX: 12, verticesY: 12 });
  mesh.position.copyFrom(sprite.position);
  mesh.scale.copyFrom(sprite.scale);
  mesh.rotation = sprite.rotation;
  parent.addChildAt(mesh, parent.getChildIndex(sprite) + 1);
  sprite.visible = false;

  let showing = from;
  const set = (a: number) => {
    // past half-way the new face shows, turning in from the other side so it is never mirrored
    const second = a > Math.PI / 2;
    const tex = second ? to : from;
    if (tex !== showing) { showing = tex; mesh.texture = tex; opts.onHalf?.(); }
    const th = second ? a - Math.PI : a;
    const w = tex.width, h = tex.height, f = w * 2.4;
    const hw = w / 2, hh = h / 2, c = Math.cos(th), sn = Math.sin(th) * dir;
    const kl = f / (f - hw * sn), kr = f / (f + hw * sn);
    mesh.setCorners(-hw * c * kl, -hh * kl, hw * c * kr, -hh * kr, hw * c * kr, hh * kr, -hw * c * kl, hh * kl);
    const b = Math.round(255 * (0.5 + 0.5 * Math.abs(c)));
    mesh.tint = (b << 16) | (b << 8) | b;
  };
  set(0);

  return new Promise(res => {
    const o = { a: 0 };
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      tween.kill();
      if (!sprite.destroyed) { sprite.texture = to; sprite.visible = true; }
      if (!mesh.destroyed) mesh.destroy();
      res();
    };
    const tween = gsap.to(o, {
      a: Math.PI, duration: opts.duration ?? 0.45, delay: opts.delay ?? 0, ease: 'power1.inOut',
      onUpdate: () => {
        if (sprite.destroyed || mesh.destroyed || !mesh.parent) { done(); return; }
        mesh.position.copyFrom(sprite.position); mesh.scale.copyFrom(sprite.scale); mesh.rotation = sprite.rotation;
        set(o.a);
      },
      onComplete: done
    });
  });
}
