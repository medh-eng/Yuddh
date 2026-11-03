#!/usr/bin/env node
/* ============================================================
   Converts Pon's master art into small, fast game files.
     art/source/cards/<card id>.png        → public/assets/cards/<id>.webp        (750×1050)
     art/source/battlefields/<name>.png    → public/assets/battlefields/<name>.webp (2560×1440)
   Masters stay out of git (too large); the converted files are committed.
   Usage: npm run assets
   ============================================================ */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const jobs = [
  { from: 'art/source/cards', to: 'public/assets/cards', w: 750, h: 1050, q: 82 },
  { from: 'art/source/battlefields', to: 'public/assets/battlefields', w: 2560, h: 1440, q: 80 }
];
const cards = [];
for (const j of jobs) {
  const src = join(root, j.from), dst = join(root, j.to);
  if (!existsSync(src)) continue;
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(src).filter(f => /\.(png|jpe?g|webp)$/i.test(f))) {
    const id = parse(f).name;
    await sharp(join(src, f)).resize(j.w, j.h, { fit: 'cover', position: 'attention' }).webp({ quality: j.q }).toFile(join(dst, `${id}.webp`));
    if (j.from.endsWith('cards')) cards.push(id);
    console.log(`  ${j.to}/${id}.webp`);
  }
}
const existing = existsSync(join(root, 'public/assets/cards'))
  ? readdirSync(join(root, 'public/assets/cards')).filter(f => f.endsWith('.webp')).map(f => parse(f).name) : [];
const all = [...new Set([...existing, ...cards])].sort();
writeFileSync(join(root, 'src/assets/card-art.json'), JSON.stringify(all, null, 2) + '\n');
console.log(`${all.length} card paintings registered`);
