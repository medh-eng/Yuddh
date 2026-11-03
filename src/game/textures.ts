/* Procedural textures painted on a 2D canvas once, then handed to
   Pixi. Stand-ins until the painted battlefield maps arrive. */
import { Texture } from 'pixi.js';

const cache = new Map<string, Texture>();

function paint(key: string, w: number, h: number, fn: (g: CanvasRenderingContext2D) => void): Texture {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d')!);
  const t = Texture.from(c);
  cache.set(key, t);
  return t;
}

/** warm oil-lamp pool of light */
export const lampGlow = () => paint('lamp', 512, 512, g => {
  const r = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  r.addColorStop(0, 'rgba(255,190,110,0.55)');
  r.addColorStop(0.35, 'rgba(220,130,60,0.22)');
  r.addColorStop(1, 'rgba(120,60,20,0)');
  g.fillStyle = r; g.fillRect(0, 0, 512, 512);
});

/** dark teak table with long grain */
export const teak = () => paint('teak', 1024, 1024, g => {
  g.fillStyle = '#2a1a10'; g.fillRect(0, 0, 1024, 1024);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 260; i++) {
    const y = rnd() * 1024, a = 0.03 + rnd() * 0.07, light = rnd() > 0.5;
    g.strokeStyle = light ? `rgba(120,78,44,${a})` : `rgba(0,0,0,${a * 1.4})`;
    g.lineWidth = 1 + rnd() * 3;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x / 140 + i) * 6 * rnd());
    g.stroke();
  }
});

/** vignette to pull the eye to the centre of the table */
export const vignette = () => paint('vignette', 512, 512, g => {
  const r = g.createRadialGradient(256, 256, 120, 256, 256, 360);
  r.addColorStop(0, 'rgba(0,0,0,0)');
  r.addColorStop(1, 'rgba(0,0,0,0.85)');
  g.fillStyle = r; g.fillRect(0, 0, 512, 512);
});

/** vertical sheen for card frames */
export const sheen = () => paint('sheen', 8, 256, g => {
  const l = g.createLinearGradient(0, 0, 0, 256);
  l.addColorStop(0, 'rgba(255,255,255,0.35)');
  l.addColorStop(0.45, 'rgba(255,255,255,0.0)');
  l.addColorStop(1, 'rgba(0,0,0,0.35)');
  g.fillStyle = l; g.fillRect(0, 0, 8, 256);
});
