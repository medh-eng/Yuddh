/* ============================================================
   Sound. Every effect has a name; a recording in
   public/assets/sfx/<name>.mp3 (listed in src/assets/sfx.json by
   `npm run assets`) replaces its synthesised stand-in. Recordings are
   fetched as soon as sound is unlocked, so even the first one plays.

   Music: six pieces (title, briefing, calm and intense battle,
   victory, defeat) stream from the same folder. Looping pieces
   cross-fade into a fresh copy of themselves near the end, so the
   fade-out at the end of each recording never leaves a gap. Without
   a recording, a tanpura-like drone stands in.
   ============================================================ */
import recordedList from '../assets/sfx.json';

const BASE = import.meta.env.BASE_URL;
const RECORDED = new Set(recordedList as string[]);

export type Sfx = 'conch' | 'drum' | 'clash' | 'bow' | 'arrowHit' | 'deploy' | 'cardDraw' | 'cardPlay'
  | 'march' | 'fortHit' | 'death' | 'coin' | 'yantra' | 'fire' | 'victory' | 'defeat' | 'click' | 'elephant';
/** the six core pieces, or a campaign's own piece named music_<something> (see art/SOUND-LIST.md) */
export type Track = 'music_title' | 'music_briefing' | 'music_battle_calm' | 'music_battle_intense' | 'music_victory' | 'music_defeat' | `music_${string}`;

const SFX_NAMES: Sfx[] = ['conch', 'drum', 'clash', 'bow', 'arrowHit', 'deploy', 'cardDraw', 'cardPlay', 'march', 'fortHit',
  'death', 'coin', 'yantra', 'fire', 'victory', 'defeat', 'click', 'elephant'];
/** level of each recording relative to the others (1 = as converted) */
const LEVEL: Partial<Record<Sfx, number>> = { conch: 0.85, elephant: 0.8, fortHit: 0.9, drum: 1.1 };
/** these vary their pitch a little each time, so repeated blows do not sound copied */
const VARY = new Set<Sfx>(['clash', 'bow', 'arrowHit', 'deploy', 'cardDraw', 'cardPlay', 'death', 'march', 'click']);
const ONE_SHOT = new Set<Track>(['music_victory', 'music_defeat']);
const XFADE = 4;  // seconds of cross-fade when a looping piece wraps round

interface Voice { el: HTMLAudioElement; g: GainNode }
interface Playing { track: Track; loop: boolean; voices: Voice[]; cur: number; crossing: boolean; timer: number }

class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  sfxBus!: GainNode;
  musicBus!: GainNode;
  music = true;
  sfx = true;
  private recorded = new Map<Sfx, AudioBuffer | null>();
  private drone: { stop(): void } | null = null;
  private wanted: { track: Track; loop: boolean } | null = null;
  private playing: Playing | null = null;
  private fading: Playing[] = [];
  private blocked = false;

  /** must be called from a user gesture */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      if (this.blocked) { this.blocked = false; this.playing?.voices[this.playing.cur].el.play().catch(() => { this.blocked = true; }); }
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.8; this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain(); this.musicBus.gain.value = 0.5; this.musicBus.connect(this.master);
    try { this.music = localStorage.getItem('yuddh.music') !== 'off'; this.sfx = localStorage.getItem('yuddh.sfx') !== 'off'; } catch { /* private mode */ }
    this.sfxBus.gain.value = this.sfx ? 1 : 0;
    SFX_NAMES.forEach(n => { if (RECORDED.has(n)) void this.load(n); });
    document.addEventListener('visibilitychange', () => this.onVisibility());
    this.applyMusic();
  }

  /** a recording exists for this effect or piece of music */
  has(name: Sfx | Track): boolean { return RECORDED.has(name); }

  toggleMusic(): boolean {
    this.music = !this.music;
    try { localStorage.setItem('yuddh.music', this.music ? 'on' : 'off'); } catch { /* ignore */ }
    this.applyMusic();
    return this.music;
  }
  toggleSfx(): boolean {
    this.sfx = !this.sfx;
    try { localStorage.setItem('yuddh.sfx', this.sfx ? 'on' : 'off'); } catch { /* ignore */ }
    if (this.ctx) this.sfxBus.gain.value = this.sfx ? 1 : 0;
    return this.sfx;
  }

  play(name: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || !this.sfx) return;
    const rec = this.recorded.get(name);
    if (rec) {
      const s = ctx.createBufferSource(); s.buffer = rec;
      if (VARY.has(name)) s.playbackRate.value = 0.94 + Math.random() * 0.12;
      const g = ctx.createGain(); g.gain.value = LEVEL[name] ?? 1;
      s.connect(g); g.connect(this.sfxBus); s.start();
      return;
    }
    if (rec === undefined && RECORDED.has(name)) void this.load(name);
    SYNTH[name](ctx, this.sfxBus);
  }

  private async load(name: Sfx): Promise<void> {
    if (this.recorded.has(name)) return;
    this.recorded.set(name, null);
    try {
      const r = await fetch(`${BASE}assets/sfx/${name}.mp3`);
      if (!r.ok || !this.ctx) return;
      this.recorded.set(name, await this.ctx.decodeAudioData(await r.arrayBuffer()));
    } catch { /* keep the synth */ }
  }

  /* ---------------- music ---------------- */

  /** Ask for a piece of music (null for silence). Asking for the piece already playing does nothing,
      so scenes can call this freely. Before sound is unlocked the request waits. */
  playMusic(track: Track | null): void {
    if (track && this.wanted?.track === track) return;
    this.wanted = track ? { track, loop: !ONE_SHOT.has(track) } : null;
    if (this.ctx) this.applyMusic();
  }
  get track(): Track | null { return this.wanted?.track ?? null; }

  private applyMusic(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = this.music ? this.wanted : null;
    if (this.playing && this.playing.track !== w?.track) { this.fadeOut(this.playing, 1.4); this.playing = null; }
    if (!w) { this.drone?.stop(); this.drone = null; return; }
    if (RECORDED.has(w.track)) {
      this.drone?.stop(); this.drone = null;
      if (!this.playing) this.playing = this.startTrack(w.track, w.loop);
    } else if (w.loop) this.startDrone();
    else { this.drone?.stop(); this.drone = null; }
  }

  private voice(track: Track): Voice {
    const ctx = this.ctx!;
    const el = new Audio(`${BASE}assets/sfx/${track}.mp3`);
    el.preload = 'auto';
    const src = ctx.createMediaElementSource(el);
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(g); g.connect(this.musicBus);
    return { el, g };
  }

  private startTrack(track: Track, loop: boolean): Playing {
    const ctx = this.ctx!;
    const v = this.voice(track);
    const p: Playing = { track, loop, voices: [v], cur: 0, crossing: false, timer: 0 };
    v.el.play().catch(() => { this.blocked = true; });
    v.g.gain.setValueAtTime(0, ctx.currentTime);
    v.g.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5);
    if (loop) {
      p.timer = window.setInterval(() => {
        const a = p.voices[p.cur];
        if (p.crossing || !a.el.duration || !isFinite(a.el.duration) || a.el.paused) return;
        if (a.el.currentTime < a.el.duration - XFADE) return;
        p.crossing = true;
        const nextIdx = 1 - p.cur;
        const b = p.voices[nextIdx] ?? (p.voices[nextIdx] = this.voice(track));
        b.el.currentTime = 0;
        b.el.play().catch(() => { this.blocked = true; });
        const t = ctx.currentTime;
        b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(0, t); b.g.gain.linearRampToValueAtTime(1, t + XFADE);
        a.g.gain.cancelScheduledValues(t); a.g.gain.setValueAtTime(a.g.gain.value, t); a.g.gain.linearRampToValueAtTime(0, t + XFADE);
        setTimeout(() => { a.el.pause(); p.cur = nextIdx; p.crossing = false; }, XFADE * 1000 + 150);
      }, 250);
    }
    return p;
  }

  private fadeOut(p: Playing, secs: number): void {
    const ctx = this.ctx!;
    clearInterval(p.timer);
    const t = ctx.currentTime;
    p.voices.forEach(v => { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + secs); });
    this.fading.push(p);
    setTimeout(() => {
      p.voices.forEach(v => { v.el.pause(); v.el.removeAttribute('src'); v.el.load(); v.g.disconnect(); });
      this.fading = this.fading.filter(f => f !== p);
    }, secs * 1000 + 100);
  }

  /** stop the music while the game is in the background (phones), and pick it up again on return */
  private onVisibility(): void {
    if (!this.ctx) return;
    const v = this.playing?.voices[this.playing.cur];
    if (document.hidden) { v?.el.pause(); void this.ctx.suspend(); }
    else { void this.ctx.resume(); if (v && this.music) v.el.play().catch(() => { this.blocked = true; }); }
  }

  /** tanpura-like drone on Sa and Pa, breathing slowly */
  private startDrone(): void {
    const ctx = this.ctx;
    if (!ctx || this.drone) return;
    const out = ctx.createGain(); out.gain.value = 0; out.connect(this.musicBus);
    out.gain.linearRampToValueAtTime(0.64, ctx.currentTime + 4);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
    const nodes: OscillatorNode[] = [];
    const sa = 110;
    [[sa, 0.16], [sa * 1.5, 0.1], [sa * 2, 0.09], [sa / 2, 0.12], [sa * 2.003, 0.05]].forEach(([f, v], i) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const gn = ctx.createGain(); gn.gain.value = v;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07 + i * 0.031;
      const lg = ctx.createGain(); lg.gain.value = v * 0.6;
      lfo.connect(lg); lg.connect(gn.gain);
      o.connect(gn); gn.connect(lp); o.start(); lfo.start();
      nodes.push(o, lfo);
    });
    this.drone = { stop: () => { out.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); setTimeout(() => nodes.forEach(n => n.stop()), 1200); } };
  }
}

/* ---------------- synth recipes ---------------- */
type Recipe = (ctx: AudioContext, out: AudioNode) => void;

function noise(ctx: AudioContext, dur: number): AudioBufferSourceNode {
  const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; return s;
}
function env(ctx: AudioContext, out: AudioNode, a: number, peak: number, d: number, t0 = ctx.currentTime): GainNode {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  g.connect(out); return g;
}
function tone(ctx: AudioContext, out: AudioNode, type: OscillatorType, f0: number, f1: number, a: number, peak: number, d: number, delay = 0): void {
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + a + d);
  o.connect(env(ctx, out, a, peak, d, t0)); o.start(t0); o.stop(t0 + a + d + 0.05);
}
function burst(ctx: AudioContext, out: AudioNode, type: BiquadFilterType, freq: number, q: number, a: number, peak: number, d: number, delay = 0): void {
  const t0 = ctx.currentTime + delay;
  const n = noise(ctx, a + d + 0.1);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  n.connect(f); f.connect(env(ctx, out, a, peak, d, t0)); n.start(t0);
}

const SYNTH: Record<Sfx, Recipe> = {
  conch: (ctx, out) => {
    const t0 = ctx.currentTime;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 3;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.35); g.gain.setValueAtTime(0.35, t0 + 1.3); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2);
    lp.connect(g); g.connect(out);
    [1, 2.01, 3.02].forEach((m, i) => {
      const o = ctx.createOscillator(); o.type = i ? 'sine' : 'sawtooth';
      o.frequency.setValueAtTime(196 * m * 0.94, t0); o.frequency.exponentialRampToValueAtTime(196 * m, t0 + 0.4);
      const vib = ctx.createOscillator(); vib.frequency.value = 5.5; const vg = ctx.createGain(); vg.gain.value = 2.5 * m;
      vib.connect(vg); vg.connect(o.frequency);
      const og = ctx.createGain(); og.gain.value = [0.6, 0.25, 0.12][i];
      o.connect(og); og.connect(lp); o.start(t0); vib.start(t0); o.stop(t0 + 2.3); vib.stop(t0 + 2.3);
    });
    burst(ctx, out, 'bandpass', 900, 1.2, 0.3, 0.05, 1.6);
  },
  drum: (ctx, out) => { tone(ctx, out, 'sine', 120, 45, 0.005, 0.9, 0.5); burst(ctx, out, 'lowpass', 300, 1, 0.003, 0.4, 0.15); },
  clash: (ctx, out) => {
    burst(ctx, out, 'highpass', 2500, 0.7, 0.002, 0.5, 0.25);
    [1730, 2410, 3370, 4600].forEach((f, i) => tone(ctx, out, 'triangle', f, f * 0.98, 0.002, 0.12 / (i + 1), 0.5));
  },
  bow: (ctx, out) => { tone(ctx, out, 'triangle', 180, 90, 0.002, 0.3, 0.18); burst(ctx, out, 'bandpass', 1800, 2, 0.05, 0.25, 0.35, 0.03); },
  arrowHit: (ctx, out) => { burst(ctx, out, 'bandpass', 900, 3, 0.002, 0.5, 0.1); tone(ctx, out, 'square', 260, 120, 0.002, 0.08, 0.08); },
  deploy: (ctx, out) => { tone(ctx, out, 'sine', 90, 40, 0.004, 0.8, 0.35); burst(ctx, out, 'lowpass', 600, 0.8, 0.01, 0.35, 0.4); },
  cardDraw: (ctx, out) => burst(ctx, out, 'bandpass', 3200, 1.5, 0.02, 0.15, 0.12),
  cardPlay: (ctx, out) => { burst(ctx, out, 'bandpass', 2200, 1.2, 0.03, 0.22, 0.18); tone(ctx, out, 'sine', 660, 990, 0.01, 0.06, 0.2, 0.05); },
  march: (ctx, out) => { for (let i = 0; i < 4; i++) { tone(ctx, out, 'sine', 80, 50, 0.004, 0.35, 0.12, i * 0.13); burst(ctx, out, 'lowpass', 500, 1, 0.004, 0.15, 0.1, i * 0.13); } },
  fortHit: (ctx, out) => { tone(ctx, out, 'sine', 70, 30, 0.005, 1, 0.8); burst(ctx, out, 'lowpass', 900, 0.7, 0.005, 0.7, 0.9); burst(ctx, out, 'bandpass', 2000, 1, 0.1, 0.12, 0.9, 0.1); },
  death: (ctx, out) => { burst(ctx, out, 'lowpass', 700, 0.7, 0.01, 0.5, 0.7); tone(ctx, out, 'sawtooth', 220, 70, 0.01, 0.08, 0.6); },
  coin: (ctx, out) => { tone(ctx, out, 'sine', 1568, 1568, 0.002, 0.15, 0.4); tone(ctx, out, 'sine', 2093, 2093, 0.002, 0.1, 0.5, 0.06); },
  yantra: (ctx, out) => { [523, 659, 784, 1046].forEach((f, i) => tone(ctx, out, 'triangle', f, f, 0.01, 0.12, 0.6, i * 0.07)); burst(ctx, out, 'highpass', 4000, 0.5, 0.3, 0.06, 0.8); },
  fire: (ctx, out) => { burst(ctx, out, 'lowpass', 1200, 0.5, 0.15, 0.5, 1.1); burst(ctx, out, 'bandpass', 3000, 0.8, 0.05, 0.2, 0.6, 0.1); },
  victory: (ctx, out) => { SYNTH.conch(ctx, out); [262, 330, 392, 523].forEach((f, i) => tone(ctx, out, 'triangle', f, f, 0.02, 0.15, 1.6, 0.5 + i * 0.18)); },
  defeat: (ctx, out) => { [392, 330, 262, 196].forEach((f, i) => tone(ctx, out, 'sine', f, f * 0.98, 0.05, 0.15, 1.2, i * 0.35)); },
  click: (ctx, out) => tone(ctx, out, 'sine', 880, 660, 0.002, 0.08, 0.06),
  elephant: (ctx, out) => {
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(380, t0); o.frequency.linearRampToValueAtTime(720, t0 + 0.25); o.frequency.linearRampToValueAtTime(520, t0 + 0.9);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2.5;
    o.connect(bp); bp.connect(env(ctx, out, 0.08, 0.3, 0.9, t0)); o.start(t0); o.stop(t0 + 1.1);
  }
};

export const audio = new AudioEngine();
