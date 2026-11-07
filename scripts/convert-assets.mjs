#!/usr/bin/env node
/* ============================================================
   Converts Pon's master art and sound into small, fast game files.
     art/source/cards/<card id>.png        → public/assets/cards/<id>.webp         (720 wide, full picture kept)
     art/source/battlefields/<name>.png    → public/assets/battlefields/<name>.webp (up to 2560 wide)
     art/source/sfx/<name>.wav|mp3         → public/assets/sfx/<name>.mp3            (needs ffmpeg)
   Masters stay untouched in art/source/; the small files are what the game loads.

   Sound effects are cut to one clean hit: the start of the sound is
   found automatically (no silence before it), the file is cut to the
   length in SHAPE below (stopping early if a second hit begins), faded
   out, and brought to an even loudness. Music keeps its full length
   with silence trimmed from both ends so it loops tightly.
   Usage: npm run assets
   ============================================================ */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;

/* ---------------- pictures ---------------- */
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

/* ---------------- sounds ---------------- */
/** other names a file may arrive under → the game's name for it */
const ALIAS = { shankh: 'conch', nagara: 'drum', dhol: 'drum', horse_gallop: 'gallop', 'horse-gallop': 'gallop', 'sand-wind-gust': 'sandGust', 'wind-gust': 'sandGust', horsegallop: 'gallop', galloping: 'gallop', sand_wind: 'sandGust', sandwind: 'sandGust', sand_gust: 'sandGust', wind_gust: 'sandGust', gust: 'sandGust' };
/** name: [longest length s, fade-out s, one hit only, loudness dBFS RMS] */
const SHAPE = {
  conch: [2.6, 0.9, false, -20], drum: [1.1, 0.5, true, -15], clash: [0.6, 0.15, true, -16],
  bow: [0.6, 0.2, true, -17], arrowHit: [0.45, 0.15, true, -16], deploy: [0.6, 0.25, true, -15],
  fortHit: [1.3, 0.5, false, -17], elephant: [1.7, 0.6, false, -19], cardDraw: [0.25, 0.08, true, -20],
  cardPlay: [0.35, 0.1, true, -18], march: [0.9, 0.25, false, -18], death: [0.9, 0.3, false, -18],
  coin: [0.6, 0.25, false, -19], yantra: [0.9, 0.3, false, -18], fire: [1.3, 0.5, false, -18],
  click: [0.12, 0.04, true, -22], gallop: [1.3, 0.45, false, -18], sandGust: [1.6, 0.7, false, -20], victory: [4.5, 1.2, false, -18], defeat: [3.5, 1.2, false, -18]
};
const SR = 22050, WIN = Math.round(SR * 0.01);

/** decide where a sound effect starts and ends, and how much to turn it up or down */
function shapeOf(file, name) {
  const [maxLen, fadeLen, oneHit, target] = SHAPE[name] ?? [1.5, 0.4, false, -18];
  const raw = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const db = [];
  for (let i = 0; i < x.length; i += WIN) {
    let s = 0; const n = Math.min(WIN, x.length - i);
    for (let k = 0; k < n; k++) s += x[i + k] * x[i + k];
    db.push(10 * Math.log10(s / n + 1e-12));
  }
  const peak = Math.max(...db), peakAt = db.indexOf(peak);
  const onset = Math.max(0, db.findIndex(d => d >= peak - 30) - 1);
  let end = db.length;
  // stop before a second hit: after the first strong hit, a jump of 12 dB above the quietest point since
  if (oneHit) {
    let hit = db.findIndex((d, w) => w >= onset && d >= peak - 10);
    for (let w = hit; w < Math.min(db.length, hit + 6); w++) if (db[w] > db[hit]) hit = w;
    let low = db[hit];
    for (let w = hit + 1; w < db.length; w++) {
      low = Math.min(low, db[w]);
      if (w > hit + 5 && db[w] > low + 12 && db[w] > peak - 16) { end = w - 1; break; }
    }
  }
  // and when the sound has died away
  for (let w = db.length - 1; w > peakAt; w--) if (db[w] > peak - 55) { end = Math.min(end, w + 1); break; }
  const start = onset * 0.01;
  const len = Math.min(maxLen, Math.max(0.05, end * 0.01 - start));
  // loudness of the part we keep
  const a = Math.floor(start * SR), b = Math.min(x.length, Math.floor((start + len) * SR));
  let ss = 0, pk = 0;
  for (let i = a; i < b; i++) { ss += x[i] * x[i]; pk = Math.max(pk, Math.abs(x[i])); }
  const rms = 10 * Math.log10(ss / Math.max(1, b - a) + 1e-12), pkDb = 20 * Math.log10(pk + 1e-12);
  const gain = Math.min(target - rms, -1 - pkDb);
  return { start, len, fade: Math.min(fadeLen, len * 0.5), gain };
}

const sfxSrc = join(root, 'art/source/sfx'), sfxDst = join(root, 'public/assets/sfx');
if (existsSync(sfxSrc)) {
  mkdirSync(sfxDst, { recursive: true });
  for (const f of readdirSync(sfxSrc).filter(f => /\.(wav|mp3|ogg|m4a|flac)$/i.test(f))) {
    const raw = parse(f).name, id = ALIAS[raw] ?? raw, music = id.startsWith('music_');
    const src = join(sfxSrc, f), out = join(sfxDst, `${id}.mp3`);
    if (music) {
      const trim = 'silenceremove=start_periods=1:start_threshold=-55dB';
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', `${trim},areverse,${trim},areverse`, '-ac', '2', '-ar', '44100', '-b:a', '128k', out]);
      console.log(`  public/assets/sfx/${id}.mp3  (music)`);
    } else {
      const s = shapeOf(src, id);
      // atrim, not -ss: seeking inside an MP3 can skip the opening transient
      const af = [`atrim=${s.start.toFixed(3)}:${(s.start + s.len).toFixed(3)}`, 'asetpts=PTS-STARTPTS', 'afade=t=in:d=0.004',
        `afade=t=out:st=${(s.len - s.fade).toFixed(3)}:d=${s.fade.toFixed(3)}`, `volume=${s.gain.toFixed(1)}dB`].join(',');
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-af', af, '-ac', '1', '-ar', '44100', '-b:a', '96k', out]);
      console.log(`  public/assets/sfx/${id}.mp3  from ${f}: ${s.start.toFixed(2)}s + ${s.len.toFixed(2)}s, ${s.gain >= 0 ? '+' : ''}${s.gain.toFixed(1)} dB`);
    }
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
