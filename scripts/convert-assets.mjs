#!/usr/bin/env node
/* ============================================================
   Converts Pon's master art into small, fast game files.
     art/source/cards/<card id>.png        → public/assets/cards/<id>.webp        (720 wide, full picture kept)
     art/source/battlefields/<name>.png    → public/assets/battlefields/<name>.webp (up to 2560 wide)
   Masters live in art/source/ (uploaded on GitHub); the small WebP files are what the game loads.
     art/source/sfx/<name>.wav|mp3          → public/assets/sfx/<name>.mp3 (needs ffmpeg)
   Usage: npm run assets
   ============================================================ */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const jobs = [
  { from: 'art/source/cards', to: 'public/assets/cards', w: 720, q: 84 },
  { from: 'art/source/battlefields', to: 'public/assets/battlefields', w: 2560, q: 82 }
];
const cards = [];
for (const j of jobs) {
  const src = join(root, j.from), dst = join(root, j.to);
  if (!existsSync(src)) continue;
  mkdirSync(dst, { recursive: true });
  for (const f of readdirSync(src).filter(f => /\.(png|jpe?g|webp)$/i.test(f))) {
    const id = parse(f).name;
    await sharp(join(src, f)).resize({ width: j.w, withoutEnlargement: true }).webp({ quality: j.q }).toFile(join(dst, `${id}.webp`));
    if (j.from.endsWith('cards')) cards.push(id);
    console.log(`  ${j.to}/${id}.webp`);
  }
}
// sounds: art/source/sfx/<name>.(wav|mp3|ogg|m4a) → public/assets/sfx/<name>.mp3 (mono effects, stereo music)
const sfxSrc = join(root, 'art/source/sfx'), sfxDst = join(root, 'public/assets/sfx');
if (existsSync(sfxSrc)) {
  mkdirSync(sfxDst, { recursive: true });
  for (const f of readdirSync(sfxSrc).filter(f => /\.(wav|mp3|ogg|m4a|flac)$/i.test(f))) {
    const id = parse(f).name, music = id.startsWith('music_');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(sfxSrc, f),
      ...(music ? ['-ac', '2', '-b:a', '128k'] : ['-ac', '1', '-b:a', '96k', '-af', 'silenceremove=start_periods=1:start_threshold=-50dB']),
      join(sfxDst, `${id}.mp3`)]);
    console.log(`  public/assets/sfx/${id}.mp3`);
  }
}
const sfxList = existsSync(sfxDst) ? readdirSync(sfxDst).filter(f => f.endsWith('.mp3')).map(f => parse(f).name).sort() : [];
writeFileSync(join(root, 'src/assets/sfx.json'), JSON.stringify(sfxList, null, 2) + '\n');
console.log(`${sfxList.length} recorded sounds registered`);
const existing = existsSync(join(root, 'public/assets/cards'))
  ? readdirSync(join(root, 'public/assets/cards')).filter(f => f.endsWith('.webp')).map(f => parse(f).name) : [];
const all = [...new Set([...existing, ...cards])].sort();
writeFileSync(join(root, 'src/assets/card-art.json'), JSON.stringify(all, null, 2) + '\n');
console.log(`${all.length} card paintings registered`);
