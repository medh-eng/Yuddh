/* Title screen: Pon's painting of two armies at sunrise, drifting
   slowly, with the title in the open sky between them. */
import { Container, Graphics, Sprite, Text, Texture, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { FONT_DEVA, FONT_SERIF, INK, FONT_TITLE } from '../theme';
import { view } from '../view';
import { makeButton } from '../ui/button';
import { audio } from '../audio';
import { battlefieldUrl } from '../../assets/manifest';
import { tutorialDone } from '../../campaign/tutorial';
import type { Scene, Stage } from '../stage';

/** a soft dark pool, laid behind lettering so it reads against the bright sky */
let shadeTex: Texture | null = null;
function shadePool(): Texture {
  if (shadeTex) return shadeTex;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d')!;
  const r = g.createRadialGradient(256, 128, 0, 256, 128, 256);
  r.addColorStop(0, 'rgba(12,6,2,0.78)'); r.addColorStop(0.55, 'rgba(12,6,2,0.45)'); r.addColorStop(1, 'rgba(12,6,2,0)');
  g.setTransform(1, 0, 0, 0.5, 0, 64); g.fillStyle = r; g.fillRect(0, 0, 512, 512);
  shadeTex = Texture.from(c);
  return shadeTex;
}

import { noticePanel } from '../ui/historyPanel';
import { destroyTree } from '../stage';

const NOTICE_KEY = 'yuddh.notice.v1';
const noticeSeen = (): boolean => { try { return localStorage.getItem(NOTICE_KEY) === '1'; } catch { return true; } };
const markNotice = (): void => { try { localStorage.setItem(NOTICE_KEY, '1'); } catch { /* private mode */ } };

export function titleScene(stage: Stage, go: { battle(): void; tutorial(): void; campaign(): void; standing(): void; gallery(): void; preview(): void; prototype(): void }): Scene {
  const s: Scene = new Container();
  const painting = Texture.from(battlefieldUrl('title'));
  const art = new Sprite(painting); art.anchor.set(0.5);
  const pool = new Sprite(shadePool()); pool.anchor.set(0.5);
  const pool2 = new Sprite(shadePool()); pool2.anchor.set(0.5);
  s.addChild(art, pool, pool2);

  const deva = new Text({ text: 'युद्ध', style: { fontFamily: FONT_DEVA, fontSize: 64, fill: INK.gold, stroke: { color: 0x1a0d05, width: 4 } } });
  deva.anchor.set(0.5);
  const title = new Text({ text: 'YUDDH', style: { fontFamily: FONT_TITLE, fontSize: 200, fontWeight: '700', letterSpacing: 30, fill: INK.goldPale, stroke: { color: 0x1a0d05, width: 6 }, dropShadow: { color: 0x000000, blur: 18, distance: 0, alpha: 0.9 } } });
  title.anchor.set(0.5);
  const sub = new Text({ text: 'RISE OF THE RAJYAS', style: { fontFamily: FONT_TITLE, fontSize: 30, fontWeight: '700', letterSpacing: 18, fill: INK.gold, stroke: { color: 0x1a0d05, width: 4 } } });
  sub.anchor.set(0.5);
  const rule = new Graphics();
  s.addChild(deva, title, sub, rule);

  const buttons = new Container();
  s.addChild(buttons);
  const note = new Text({ text: 'Phase 2 build · The Maurya campaign: Pataliputra to the Indus', style: { fontFamily: FONT_SERIF, fontSize: 20, fontStyle: 'italic', fill: INK.cream, stroke: { color: 0x000000, width: 3 } } });
  note.anchor.set(0.5);
  s.addChild(note);
  const about = new Container();
  s.addChild(about);
  let noticeUp: Container | null = null;
  function openNotice(): void {
    if (noticeUp) return;
    const p = noticePanel(() => { markNotice(); destroyTree(p); noticeUp = null; });
    noticeUp = p; s.addChild(p);
  }

  // dust motes drifting in the sunlight
  const motes = new Container();
  s.addChild(motes);
  const specks: { g: Graphics; vy: number; vx: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const g = new Graphics().circle(0, 0, 1.2 + Math.random() * 2).fill(0xffe2a8);
    g.blendMode = 'add';
    g.alpha = 0.15 + Math.random() * 0.45;
    motes.addChild(g);
    specks.push({ g, vy: 0.08 + Math.random() * 0.3, vx: 0.1 + Math.random() * 0.25 });
  }

  let drift: gsap.core.Tween | null = null;
  let chosen = false;
  function layout(): void {
    const W = view.w, H = view.h, ph = view.phone, k = view.ui;
    const cover = Math.max(W / painting.width, H / painting.height) * 1.04;
    art.position.set(W / 2, H / 2); art.scale.set(cover);
    drift?.kill();
    drift = gsap.fromTo(art.scale, { x: cover, y: cover }, { x: cover * 1.07, y: cover * 1.07, duration: 40, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const ty = ph ? 186 : 280;
    deva.style.fontSize = ph ? 56 : 64; deva.position.set(W / 2, ty - (ph ? 112 : 136));
    title.style.fontSize = ph ? 168 : 200; title.position.set(W / 2 + 15, ty);
    sub.style.fontSize = Math.round(30 * (ph ? 1.2 : 1)); sub.position.set(W / 2 + 9, ty + (ph ? 102 : 126));
    const ry = ty + (ph ? 140 : 174);
    rule.clear().moveTo(W / 2 - 260, ry).lineTo(W / 2 + 260, ry).stroke({ width: 1.5, color: INK.gold, alpha: 0.8 })
      .poly([W / 2, ry - 8, W / 2 + 8, ry, W / 2, ry + 8, W / 2 - 8, ry]).fill(INK.gold);
    pool.position.set(W / 2, ty - 10); pool.width = ph ? 1250 : 1500; pool.height = ph ? 470 : 560;

    buttons.removeChildren().forEach(c => c.destroy({ children: true }));
    // new players are pointed at the training ground first
    const fresh = !tutorialDone();
    const list: [string, () => void, boolean][] = fresh
      ? [['Learn to play', go.tutorial, true], ['To battle', go.battle, false], ['Campaign', go.campaign, false], ['Rank & Renown', go.standing, false], ['Card gallery', go.gallery, false], ['Watch two generals', go.preview, false]]
      : [['Campaign', go.campaign, true], ['To battle', go.battle, false], ['Rank & Renown', go.standing, false], ['Learn to play', go.tutorial, false], ['Card gallery', go.gallery, false], ['Watch two generals', go.preview, false]];
    list.forEach(([label, fn, primary], i) => {
      // one choice per visit: a second tap while a battle's paintings load would start a second scene
      const b = makeButton(label, () => { if (chosen) return; chosen = true; fn(); }, { primary, w: ph ? 380 : 400 });
      // phones: two columns, the odd last button centred; desktop: one column
      if (ph) b.position.set(i === list.length - 1 && list.length % 2 ? W / 2 : W / 2 + (i % 2 ? 1 : -1) * 270, 440 + Math.floor(i / 2) * 92);
      else b.position.set(W / 2, 598 + i * 72);
      buttons.addChild(b);
    });
    about.removeChildren().forEach(c => c.destroy({ children: true }));
    const ab = makeButton('History', openNotice, { w: 170, ui: ph ? 0.85 : 1 });
    ab.position.set(ph ? W - 106 : W - 140, ph ? 40 : 56);
    about.addChild(ab);
    pool2.position.set(W / 2, ph ? 530 : 800); pool2.width = ph ? 1400 : 900; pool2.height = ph ? 400 : 640;
    note.style.fontSize = Math.round(20 * k); note.position.set(W / 2, H - (ph ? 34 : 40));
    specks.forEach(p => p.g.position.set(Math.random() * W, Math.random() * H));
  }
  layout();

  const tick = (t: Ticker) => {
    const W = view.w, H = view.h;
    for (const p of specks) {
      p.g.y -= p.vy * t.deltaTime; p.g.x += p.vx * t.deltaTime;
      if (p.g.y < -10 || p.g.x > W + 10) { p.g.y = H * (0.3 + Math.random() * 0.7); p.g.x = Math.random() * W * 0.8; }
    }
  };
  s.relayout = layout;
  s.enter = () => {
    stage.setBackdrop(painting, 0.35);
    audio.playMusic('music_title');
    if (!noticeSeen()) openNotice();
    Ticker.shared.add(tick);
    gsap.from([deva, title, sub], { y: '+=30', alpha: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out' });
    gsap.from(buttons.children, { alpha: 0, duration: 0.8, delay: 0.7, stagger: 0.12 });
  };
  s.leave = () => { Ticker.shared.remove(tick); drift?.kill(); };
  return s;
}
