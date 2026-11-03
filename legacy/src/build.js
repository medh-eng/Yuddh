#!/usr/bin/env node
/* Build the single-file game from src/ into the repo root as index.html.
   Usage:  node src/build.js                                          */
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const ROOT = path.join(__dirname, '..');
const PARTS = { ENGINE: 'engine.js', CAMPAIGN: 'campaign.js', META: 'meta.js', ART: 'art.js', AUDIO: 'audio.js' };

let out = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
for (const [key, file] of Object.entries(PARTS)) {
  const token = `/*__${key}__*/`;
  if (!out.includes(token)) throw new Error('missing token ' + token);
  out = out.replace(token, () => fs.readFileSync(path.join(SRC, file), 'utf8'));
}
if (/\/\*__[A-Z]+__\*\//.test(out)) throw new Error('placeholder left behind');
fs.writeFileSync(path.join(ROOT, 'index.html'), out);
console.log('built index.html —', (out.length / 1024).toFixed(1) + ' KB');
