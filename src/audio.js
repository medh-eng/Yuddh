'use strict';
/* ============================================================
   YUDDH — procedural audio.
   Every sound is synthesised at runtime with the Web Audio API:
   no audio files, nothing to download, works offline.
   ============================================================ */
(function () {

  const KEY = 'yuddh.audio.v1';
  let ctx = null, master = null, musicBus = null, drone = null;
  let musicTimer = null, musicStep = 0;
  let prefs = { sfx: true, music: true };

  try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    musicBus.gain.value = 0.0;
    musicBus.connect(master);
    return ctx;
  }

  const now = () => ctx.currentTime;

  function env(gainNode, t0, attack, decay, peak) {
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  function tone(opts) {
    if (!ctx) return;
    const t0 = now();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(opts.freq, t0);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opts.to), t0 + (opts.dur || 0.2));
    let node = o;
    if (opts.filter) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = opts.filter;
      o.connect(f); node = f;
    }
    node.connect(g); g.connect(opts.bus || master);
    env(g, t0, opts.attack || 0.006, opts.dur || 0.2, opts.gain || 0.15);
    o.start(t0);
    o.stop(t0 + (opts.dur || 0.2) + (opts.attack || 0.006) + 0.05);
  }

  function noise(opts) {
    if (!ctx) return;
    const t0 = now();
    const dur = opts.dur || 0.15;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = opts.type || 'bandpass';
    f.frequency.setValueAtTime(opts.freq || 1200, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(Math.max(60, opts.to), t0 + dur);
    f.Q.value = opts.q || 1.2;
    const g = ctx.createGain();
    env(g, t0, 0.004, dur, opts.gain || 0.12);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  /* ---------------- sound effects ---------------- */
  const SFX = {
    click() { tone({ freq: 760, to: 620, dur: 0.06, gain: 0.05, type: 'triangle' }); },
    draw() { tone({ freq: 520, to: 720, dur: 0.09, gain: 0.05, type: 'sine' }); },
    deploy() {
      tone({ freq: 190, to: 84, dur: 0.22, gain: 0.18, type: 'sine' });
      noise({ freq: 900, to: 300, dur: 0.12, gain: 0.07 });
    },
    move() { noise({ freq: 500, to: 1400, dur: 0.14, gain: 0.05, q: 0.7 }); },
    attack() {
      noise({ freq: 2400, to: 700, dur: 0.13, gain: 0.14, q: 0.9 });
      tone({ freq: 170, to: 90, dur: 0.16, gain: 0.12, type: 'square', filter: 900 });
    },
    hit() {
      noise({ freq: 700, to: 220, dur: 0.1, gain: 0.1, type: 'lowpass' });
      tone({ freq: 120, to: 70, dur: 0.14, gain: 0.1, type: 'sine' });
    },
    death() { tone({ freq: 260, to: 62, dur: 0.36, gain: 0.14, type: 'sawtooth', filter: 700 }); },
    hq() {
      tone({ freq: 84, to: 40, dur: 0.5, gain: 0.26, type: 'sine' });
      noise({ freq: 320, to: 90, dur: 0.35, gain: 0.12, type: 'lowpass' });
    },
    yantra() {
      tone({ freq: 880, to: 1500, dur: 0.3, gain: 0.09, type: 'triangle' });
      tone({ freq: 1320, to: 1980, dur: 0.22, gain: 0.05, type: 'sine' });
    },
    coin() {
      tone({ freq: 940, dur: 0.1, gain: 0.07, type: 'triangle' });
      setTimeout(() => tone({ freq: 1400, dur: 0.14, gain: 0.06, type: 'triangle' }), 80);
    },
    victory() {
      tone({ freq: 180, to: 300, dur: 1.3, gain: 0.16, type: 'sawtooth', filter: 1100 });
      setTimeout(() => tone({ freq: 300, to: 420, dur: 1.0, gain: 0.1, type: 'sine' }), 260);
      setTimeout(() => tone({ freq: 452, dur: 0.9, gain: 0.08, type: 'triangle' }), 620);
    },
    defeat() {
      tone({ freq: 220, to: 74, dur: 1.2, gain: 0.16, type: 'sawtooth', filter: 600 });
      setTimeout(() => tone({ freq: 150, to: 58, dur: 1.1, gain: 0.1, type: 'sine' }), 200);
    }
  };

  function sfx(name) {
    if (!prefs.sfx) return;
    if (!init()) return;
    const f = SFX[name];
    if (f) { try { f(); } catch (e) {} }
  }

  /* ---------------- generative raga bed ---------------- */
  const SA = 146.83;                                   // D
  const SCALE = [1, 16 / 15, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5, 2];

  function startDrone() {
    if (!ctx || drone) return;
    drone = ctx.createGain();
    drone.gain.value = 0.05;
    drone.connect(musicBus);
    [SA, SA * 1.5, SA * 2].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 2 ? 'triangle' : 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.25 : 0.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lg = ctx.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(drone);
      o.start(); lfo.start();
    });
  }

  function pluck(freq, when, gain) {
    const t0 = now() + when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
    o.connect(g); g.connect(musicBus);
    o.start(t0); o.stop(t0 + 1.7);
  }

  function scheduleMusic() {
    if (!prefs.music || !ctx) return;
    musicStep++;
    const deg = [0, 2, 3, 4, 2, 5, 4, 3, 1, 3, 0, 4][musicStep % 12];
    const oct = musicStep % 7 === 0 ? 2 : 1;
    pluck(SA * SCALE[deg] * oct, 0, 0.09);
    if (musicStep % 4 === 0) pluck(SA * SCALE[(deg + 2) % 8] * 2, 0.42, 0.05);
    musicTimer = setTimeout(scheduleMusic, 1150 + Math.random() * 500);
  }

  function setMusic(on) {
    prefs.music = on; save();
    if (!init()) return;
    if (on) {
      musicBus.gain.cancelScheduledValues(now());
      musicBus.gain.linearRampToValueAtTime(1, now() + 1.2);
      startDrone();
      if (!musicTimer) scheduleMusic();
    } else {
      musicBus.gain.linearRampToValueAtTime(0, now() + 0.4);
      if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    }
  }

  function setSfx(on) { prefs.sfx = on; save(); }

  const API = {
    init, sfx, setMusic, setSfx,
    get musicOn() { return prefs.music; },
    get sfxOn() { return prefs.sfx; },
    /* first gesture unlocks audio in every browser */
    unlock() {
      if (!init()) return;
      if (prefs.music && !musicTimer) setMusic(true);
    }
  };

  if (typeof window !== 'undefined') window.YUDDH_AUDIO = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
