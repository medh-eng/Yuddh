'use strict';
/* ============================================================
   YUDDH — procedural card art.
   No image files: every card's illustration is drawn as SVG from
   the card's own identity, so the game stays one self-contained
   file and works offline.
   ============================================================ */
(function () {

  const C = 'currentColor';

  /* ---- motifs: each returns SVG markup inside a 100x100 box ---- */
  const D = '#0b1016';                 // dark, for interior detail
  const MOTIF = {
    sword: `<path d="M50 12 L57 32 L57 60 L43 60 L43 32 Z"/>
      <rect x="33" y="60" width="34" height="7" rx="3"/>
      <rect x="46" y="67" width="8" height="16" rx="3"/>
      <circle cx="50" cy="88" r="5"/>
      <path d="M50 20 v38" stroke="${D}" stroke-width="1.6" opacity=".35"/>`,
    bow: `<path d="M66 14 Q32 50 66 86" fill="none" stroke="${C}" stroke-width="4"/>
      <line x1="66" y1="14" x2="66" y2="86" stroke="${C}" stroke-width="1.4" opacity=".65"/>
      <line x1="24" y1="50" x2="72" y2="50" stroke="${D}" stroke-width="3"/>
      <path d="M20 50 l12 -6 v12 z"/>`,
    chariot: `<circle cx="50" cy="60" r="19" fill="none" stroke="${C}" stroke-width="4"/>
      <circle cx="50" cy="60" r="4" fill="${D}"/>
      <g stroke="${D}" stroke-width="2.5" opacity=".55">
        <line x1="50" y1="43" x2="50" y2="77"/><line x1="33" y1="60" x2="67" y2="60"/>
        <line x1="38" y1="48" x2="62" y2="72"/><line x1="62" y1="48" x2="38" y2="72"/>
      </g>
      <rect x="30" y="26" width="40" height="15" rx="4"/>
      <rect x="34" y="31" width="32" height="4" fill="${D}" opacity=".3"/>`,
    elephant: `<ellipse cx="44" cy="50" rx="26" ry="18"/>
      <circle cx="70" cy="42" r="13"/>
      <path d="M78 48 q11 13 5 27 q-2 5 -7 3 q-4 -2 -1 -7 q5 -9 -2 -16 z"/>
      <ellipse cx="64" cy="38" rx="7" ry="9" fill="${D}" opacity=".22"/>
      <rect x="28" y="62" width="8" height="20" rx="3"/>
      <rect x="44" y="64" width="8" height="18" rx="3"/>
      <path d="M76 52 q10 4 8 12" fill="none" stroke="${D}" stroke-width="2.5" opacity=".45"/>`,
    horse: `<path d="M36 76 A17 17 0 1 1 64 76" fill="none" stroke="${C}" stroke-width="8"/>
      <line x1="50" y1="16" x2="50" y2="88" stroke="${D}" stroke-width="3" opacity=".55"/>
      <path d="M50 18 l10 7 -10 7 z"/>`,
    banner: `<rect x="45" y="18" width="5" height="70" rx="2"/>
      <path d="M50 22 L86 33 L50 46 Z"/>
      <circle cx="47" cy="13" r="5"/>
      <path d="M50 46 L74 53 L50 60 Z" fill="${D}" opacity=".3"/>`,
    parasol: `<path d="M18 44 Q50 14 82 44 Z"/>
      <path d="M18 44 q32 11 64 0" fill="none" stroke="${D}" stroke-width="2.2" opacity=".4"/>
      <line x1="50" y1="44" x2="50" y2="86" stroke="${D}" stroke-width="4" opacity=".8"/>
      <circle cx="50" cy="12" r="4"/>
      <path d="M34 30 q16 -8 32 0" fill="none" stroke="${D}" stroke-width="1.6" opacity=".3"/>`,
    ship: `<path d="M16 64 q34 15 68 0 l-7 15 q-27 9 -54 0 z"/>
      <line x1="50" y1="18" x2="50" y2="64" stroke="${D}" stroke-width="3.5" opacity=".7"/>
      <path d="M53 22 L80 58 L53 58 Z"/>
      <path d="M53 30 L68 54" stroke="${D}" stroke-width="1.5" opacity=".3" fill="none"/>`,
    flame: `<path d="M50 16 q18 24 9 41 q-5 11 -9 13 q-4 -2 -9 -13 q-9 -17 9 -41 z"/>
      <path d="M50 46 q8 11 4 19 q-4 5 -4 5 q0 0 -4 -5 q-4 -8 4 -19 z" fill="${D}" opacity=".28"/>`,
    shield: `<path d="M50 14 L80 27 V54 q0 23 -30 34 q-30 -11 -30 -34 V27 Z"/>
      <circle cx="50" cy="50" r="11" fill="none" stroke="${D}" stroke-width="3" opacity=".4"/>
      <path d="M50 30 v40" stroke="${D}" stroke-width="2" opacity=".28"/>
      <circle cx="50" cy="50" r="3" fill="${D}" opacity=".5"/>`,
    trident: `<line x1="50" y1="26" x2="50" y2="88" stroke="${C}" stroke-width="4"/>
      <path d="M26 16 v20 M50 8 v28 M74 16 v20" stroke="${C}" stroke-width="4" fill="none"/>
      <path d="M26 36 q24 13 48 0" fill="none" stroke="${C}" stroke-width="3.5"/>
      <path d="M50 40 v40" stroke="${D}" stroke-width="1.4" opacity=".3"/>`,
    book: `<path d="M18 32 q17 -9 32 0 q15 -9 32 0 v36 q-17 -9 -32 0 q-15 -9 -32 0 z"/>
      <line x1="50" y1="32" x2="50" y2="68" stroke="${D}" stroke-width="2.5" opacity=".45"/>
      <g stroke="${D}" stroke-width="1.4" opacity=".22">
        <line x1="26" y1="42" x2="44" y2="40"/><line x1="26" y1="50" x2="44" y2="48"/>
        <line x1="56" y1="40" x2="74" y2="42"/><line x1="56" y1="48" x2="74" y2="50"/>
      </g>`,
    eye: `<path d="M16 50 q34 -28 68 0 q-34 28 -68 0 z"/>
      <circle cx="50" cy="50" r="10" fill="none" stroke="${D}" stroke-width="3" opacity=".55"/>
      <circle cx="50" cy="50" r="4" fill="${D}" opacity=".7"/>`,
    temple: `<path d="M20 84 V48 L50 22 L80 48 V84 Z"/>
      <rect x="43" y="58" width="14" height="26" fill="${D}" opacity=".38"/>
      <path d="M20 48 h60" stroke="${D}" stroke-width="2.6" opacity=".35"/>
      <path d="M28 84 V56 M72 84 V56" stroke="${D}" stroke-width="1.6" opacity=".2"/>`,
    tower: `<path d="M26 84 V34 h48 v50 z"/>
      <path d="M26 34 l6 -10 h12 l6 10 z M56 34 l6 -10 h12 l6 10 z"/>
      <rect x="44" y="56" width="12" height="28" fill="${D}" opacity=".38"/>
      <path d="M32 46 h36" stroke="${D}" stroke-width="1.6" opacity=".25"/>`,
    fist: `<circle cx="50" cy="50" r="26" fill="none" stroke="${C}" stroke-width="4"/>
      <path d="M50 24 v52 M24 50 h52" stroke="${D}" stroke-width="2.5" opacity=".4"/>
      <circle cx="50" cy="50" r="6" fill="${D}" opacity=".4"/>`,
    lotus: `<g opacity=".95">
      <ellipse cx="50" cy="40" rx="9" ry="20"/>
      <ellipse cx="50" cy="40" rx="9" ry="20" transform="rotate(40 50 58)"/>
      <ellipse cx="50" cy="40" rx="9" ry="20" transform="rotate(-40 50 58)"/>
      <ellipse cx="50" cy="40" rx="9" ry="20" transform="rotate(72 50 58)" opacity=".7"/>
      <ellipse cx="50" cy="40" rx="9" ry="20" transform="rotate(-72 50 58)" opacity=".7"/>
    </g>
    <path d="M24 62 q26 16 52 0" fill="none" stroke="${D}" stroke-width="2.5" opacity=".35"/>`
  };

  /* which motif suits a card */
  function motifFor(card) {
    if (card.type === 'yantra') return 'shield';
    if (card.kind === 'shakti') return 'trident';
    if (card.type === 'order') return card.sub && /draw|treatise|strategy|golden|code/i.test(card.sub) ? 'lotus' : 'flame';
    const s = ((card.sub || '') + ' ' + (card.name || '')).toLowerCase();
    if (/elephant|gaja|hasti/.test(s)) return 'elephant';
    if (/chariot|rathi/.test(s)) return 'chariot';
    if (/archer|dhanurdhar|bow/.test(s)) return 'bow';
    if (/cavalry|ashvarohi|horse/.test(s)) return 'horse';
    if (/commander|senapati/.test(s)) return 'banner';
    if (/samrat|emperor/.test(s)) return 'parasol';
    if (/ship|warship|naval|pot/.test(s)) return 'ship';
    if (/scholar|pandit/.test(s)) return 'book';
    if (/spy|gudhchar/.test(s)) return 'eye';
    if (/builder|shilpi/.test(s)) return 'temple';
    if (/guard|rakshak|wall|shield/.test(s)) return 'tower';
    if (/marine|navik/.test(s)) return 'fist';
    return 'sword';
  }

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /* ---- the full card illustration ---- */
  function cardArt(card, empireColor) {
    const seed = hash(card.id || card.name || 'x');
    const rot = seed % 360;
    const rings = 2 + (seed % 2);
    const motif = MOTIF[motifFor(card)] || MOTIF.sword;
    const gid = 'ag_' + (card.id || seed);
    const col = empireColor || '#d9a441';

    let ringSvg = '';
    for (let i = 0; i < rings; i++) {
      const r = 26 + i * 11;
      ringSvg += `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${col}" stroke-width="${i === 0 ? 1.2 : 0.7}"
        stroke-dasharray="${i === 0 ? '3 5' : '1 7'}" opacity="${0.5 - i * 0.12}"/>`;
    }

    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" class="cardart" aria-hidden="true">
      <defs>
        <radialGradient id="${gid}" cx="50%" cy="34%" r="72%">
          <stop offset="0%" stop-color="${col}" stop-opacity="0.34"/>
          <stop offset="55%" stop-color="${col}" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#0a0e14" stop-opacity="0.96"/>
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#${gid})"/>
      <g transform="rotate(${rot} 50 50)" opacity=".9">${ringSvg}</g>
      <path d="M0 74 q50 -14 100 0" fill="none" stroke="${col}" stroke-width=".8" opacity=".35"/>
      <g transform="translate(0,2)" fill="currentColor" color="#efe4c8" opacity=".93">${motif}</g>
      <rect width="100" height="100" fill="none" stroke="${col}" stroke-width=".6" opacity=".25"/>
    </svg>`;
  }

  /* ---- backdrop for the battlefield ---- */
  function backdrop() {
    let arches = '';
    for (let i = 0; i < 9; i++) {
      const x = i * 130 - 40;
      arches += `<path d="M${x} 620 V300 q0 -90 65 -90 q65 0 65 90 V620" fill="none"
        stroke="#d9a441" stroke-width="1" opacity="0.05"/>`;
    }
    let dots = '';
    for (let i = 0; i < 40; i++) {
      const x = (i * 137) % 1200, y = (i * 271) % 800, r = 0.6 + (i % 3) * 0.5;
      dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe4c8" opacity="${0.05 + (i % 5) * 0.012}"/>`;
    }
    return `<svg class="backdrop" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      ${arches}${dots}
    </svg>`;
  }

  const API = { cardArt, backdrop, motifFor, MOTIF };
  if (typeof window !== 'undefined') window.YUDDH_ART = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
