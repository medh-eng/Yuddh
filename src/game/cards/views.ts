/* Display objects for the battle: unit tokens, hand cards, the Durg. */
import { Container, Graphics, Sprite, Text, Texture, Ticker } from 'pixi.js';
import gsap from 'gsap';
import { CARDS, type Unit } from '../../engine';
import { FONT_DEVA, FONT_SERIF, INK } from '../theme';
import { cardBack, cardFace, durgFace, statBadge, tokenFace } from './paint';
import { flipSprite, type FlipOptions } from './flip';

/* ---------- stat badge textures (cached per value and tone) ---------- */
const badgeCache = new Map<string, Texture>();
function badge(kind: 'atk' | 'hp', value: number, tone: 'base' | 'up' | 'down'): Texture {
  const key = `${kind}:${value}:${tone}`;
  const hit = badgeCache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = 112; cv.height = 112;
  const g = cv.getContext('2d')!;
  statBadge(g, 56, 56, 40, kind);
  g.fillStyle = tone === 'up' ? '#9cff8a' : tone === 'down' ? '#ff8f7a' : '#ffffff';
  g.font = `700 52px ${FONT_SERIF}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = 8;
  g.fillText(String(value), 56, 59);
  const t = Texture.from(cv);
  badgeCache.set(key, t);
  return t;
}

export const TOKEN_DW = 170, TOKEN_DH = 210;

/* ============================================================ unit token */
export class TokenView extends Container {
  readonly uid: number;
  readonly owner: 0 | 1;
  readonly cardId: string;
  atk = 0; hp = 0;
  private art: Sprite;
  private atkB: Sprite;
  private hpB: Sprite;
  private ring = new Graphics();
  private icons = new Container();
  private pulse = 0;
  private ringMode: 'none' | 'ready' | 'target' | 'selected' = 'none';
  private tick = (t: Ticker) => { this.pulse += t.deltaTime * 0.06; if (this.ringMode !== 'none') this.ring.alpha = 0.65 + Math.sin(this.pulse) * 0.35; };

  /** `big` draws larger stat badges and marks, for small (phone) screens */
  constructor(u: Unit, readonly big = false) {
    super();
    this.uid = u.uid; this.owner = u.owner; this.cardId = u.cardId;
    const bs = big ? 0.8 : 0.56, inset = big ? 4 : 16;
    const shadow = new Graphics().roundRect(-TOKEN_DW / 2 + 6, -TOKEN_DH / 2 + 10, TOKEN_DW, TOKEN_DH, 12).fill({ color: 0x000000, alpha: 0.5 });
    this.art = new Sprite(tokenFace(u.cardId, u.owner));
    this.art.anchor.set(0.5); this.art.scale.set(0.5);
    this.atkB = new Sprite(); this.atkB.anchor.set(0.5); this.atkB.scale.set(bs); this.atkB.position.set(-TOKEN_DW / 2 + inset, TOKEN_DH / 2 - 14);
    this.hpB = new Sprite(); this.hpB.anchor.set(0.5); this.hpB.scale.set(bs); this.hpB.position.set(TOKEN_DW / 2 - inset, TOKEN_DH / 2 - 14);
    this.addChild(this.ring, shadow, this.art, this.icons, this.atkB, this.hpB);
    this.eventMode = 'static';
    this.update(u);
    Ticker.shared.add(this.tick);
  }

  update(u: Unit): void {
    const c = CARDS[u.cardId];
    const baseAtk = (c.atk ?? 0) + (u.upgraded ?? 0), baseHp = (c.hp ?? 0) + (u.upgraded ?? 0);
    this.atk = u.atk; this.hp = u.hp;
    this.atkB.texture = badge('atk', u.atk, u.atk > baseAtk ? 'up' : u.atk < baseAtk ? 'down' : 'base');
    this.hpB.texture = badge('hp', u.hp, u.hp < u.maxHp ? 'down' : u.maxHp > baseHp ? 'up' : 'base');
    // keyword marks along the left edge
    this.icons.removeChildren().forEach(ch => ch.destroy());
    const k = this.big ? 1.35 : 1;
    let y = -TOKEN_DH / 2 + 26 * k;
    const add = (kind: 'raksha' | 'veg' | 'ranged') => { const ic = kwIcon(kind, -TOKEN_DW / 2 + 4, y); ic.scale.set(k); this.icons.addChild(ic); y += 40 * k; };
    if (u.kw.includes('raksha')) add('raksha');
    if (u.kw.includes('veg')) add('veg');
    if (u.range === 'ranged') add('ranged');
  }

  setRing(mode: 'none' | 'ready' | 'target' | 'selected'): void {
    if (mode === this.ringMode) return;
    this.ringMode = mode;
    this.ring.clear();
    if (mode === 'none') return;
    const col = mode === 'target' ? 0xff5a3c : mode === 'selected' ? 0xffffff : 0x7dff8a;
    const w = mode === 'ready' ? 4 : 6;
    this.ring.roundRect(-TOKEN_DW / 2 - 6, -TOKEN_DH / 2 - 6, TOKEN_DW + 12, TOKEN_DH + 12, 16).stroke({ width: w, color: col });
    this.ring.roundRect(-TOKEN_DW / 2 - 12, -TOKEN_DH / 2 - 12, TOKEN_DW + 24, TOKEN_DH + 24, 20).stroke({ width: 10, color: col, alpha: 0.25 });
  }

  /** exhausted units sit dimmer */
  setSpent(spent: boolean): void { this.art.tint = spent ? 0x9a9088 : 0xffffff; }

  override destroy(): void { Ticker.shared.remove(this.tick); stopTweens(this); super.destroy({ children: true }); }
}

/** stop every tween on a display object before it is destroyed */
export function stopTweens(o: Container): void { gsap.killTweensOf(o); gsap.killTweensOf(o.scale); }

function kwIcon(kind: 'raksha' | 'veg' | 'ranged', x: number, y: number): Container {
  const c = new Container();
  const g = new Graphics();
  if (kind === 'raksha') {
    g.circle(0, 0, 17).fill(0x2a3240).stroke({ width: 2.5, color: 0xdfe6ee });
    g.moveTo(-8, -9).quadraticCurveTo(0, -12, 8, -9).lineTo(7, 2).quadraticCurveTo(4, 9, 0, 11).quadraticCurveTo(-4, 9, -7, 2).closePath().fill(0xdfe6ee);
  } else if (kind === 'veg') {
    g.circle(0, 0, 17).fill(0x3a2410).stroke({ width: 2.5, color: 0xffc04a });
    g.poly([-9, -8, -1, 0, -9, 8, -5, 8, 3, 0, -5, -8]).fill(0xffc04a);
    g.poly([-1, -8, 7, 0, -1, 8, 3, 8, 11, 0, 3, -8]).fill(0xffc04a);
  } else {
    g.circle(0, 0, 17).fill(0x1a2a1a).stroke({ width: 2.5, color: 0x9be08a });
    g.moveTo(-9, 9).lineTo(9, -9).stroke({ width: 2.5, color: 0x9be08a });
    g.poly([9, -9, 1, -7, 7, -1]).fill(0x9be08a);
  }
  c.addChild(g); c.position.set(x, y);
  return c;
}

/* ============================================================ hand card */
export const HAND_SCALE = 0.31;  // canvas px → design px for a card in hand

export class HandCard extends Container {
  readonly cardId: string;
  readonly face: Sprite;
  private glow = new Graphics();
  home = { x: 0, y: 0, rot: 0 };
  /** seconds to wait before flying in from the deck (set for a freshly drawn card, cleared once it has) */
  drawDelay: number | null = null;
  faceDown: boolean;
  /** true while the card is turning over */
  flipping = false;

  constructor(cardId: string, readonly upgrade = 0, faceDown = false) {
    super();
    this.cardId = cardId;
    this.faceDown = faceDown;
    this.face = new Sprite(faceDown ? cardBack() : cardFace(cardId, upgrade));
    this.face.anchor.set(0.5);
    const shadow = new Graphics().roundRect(-120 + 8, -168 + 12, 240, 336, 13).fill({ color: 0x000000, alpha: 0.5 });
    shadow.scale.set(1);
    this.face.scale.set(0.5);
    const inner = new Container();
    inner.addChild(this.glow, shadow, this.face);
    this.addChild(inner);
    this.scale.set(HAND_SCALE / 0.5);
    this.eventMode = 'static';
    this.cursor = 'grab';
  }

  override destroy(): void { stopTweens(this); super.destroy({ children: true }); }

  /** what the card costs right now, painted on its coin (undefined = printed cost) */
  cost: number | undefined = undefined;
  setCost(n: number): void {
    if (n === this.cost) return;
    this.cost = n;
    if (!this.faceDown && !this.flipping) this.face.texture = cardFace(this.cardId, this.upgrade, n);
  }

  /** turn the card face up (from the deck, or a yantra springing) */
  turnUp(opts: FlipOptions = {}): Promise<void> {
    if (!this.faceDown) return Promise.resolve();
    this.faceDown = false; this.flipping = true;
    return flipSprite(this.face, cardFace(this.cardId, this.upgrade, this.cost), opts).then(() => { this.flipping = false; });
  }
  /** turn the card face down (a yantra being set) */
  turnDown(opts: FlipOptions = {}): Promise<void> {
    if (this.faceDown) return Promise.resolve();
    this.faceDown = true; this.flipping = true;
    return flipSprite(this.face, cardBack(), { dir: -1, ...opts }).then(() => { this.flipping = false; });
  }

  setPlayable(on: boolean): void {
    this.glow.clear();
    if (on) {
      this.glow.roundRect(-126, -174, 252, 348, 16).stroke({ width: 7, color: 0x7dff8a, alpha: 0.9 });
      this.glow.roundRect(-133, -181, 266, 362, 20).stroke({ width: 10, color: 0x7dff8a, alpha: 0.22 });
    }
  }
}

/* ============================================================ Durg */
export class DurgView extends Container {
  private plate = new Graphics();
  private art: Sprite;
  private hpText: Text;
  private nameText: Text;
  private subText: Text;
  private ring = new Graphics();
  private embers = new Container();
  private stage = 0;
  private spawnT = 0;
  hp = 0;
  private tick = (t: Ticker) => this.burn(t.deltaTime);

  constructor(readonly owner: 0 | 1, artId: string) {
    super();
    this.art = new Sprite(durgFace(artId, owner));
    this.art.anchor.set(0.5); this.art.scale.set(0.5);
    this.hpText = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 64, fontWeight: '700', fill: 0xffffff, stroke: { color: 0x000000, width: 6 } } });
    this.hpText.anchor.set(0.5); this.hpText.position.set(0, 52);
    this.nameText = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 26, fontWeight: '700', fill: INK.goldPale, align: 'center', stroke: { color: 0x000000, width: 4 }, wordWrap: true, wordWrapWidth: 226, lineHeight: 28 } });
    this.nameText.anchor.set(0.5, 1); this.nameText.position.set(0, -73);
    this.subText = new Text({ text: '', style: { fontFamily: FONT_SERIF, fontSize: 14, fontWeight: '700', letterSpacing: 4, fill: INK.gold, stroke: { color: 0x000000, width: 3 } } });
    this.subText.anchor.set(0.5); this.subText.position.set(0, -58);
    this.addChild(this.ring, this.art, this.plate, this.embers, this.nameText, this.subText, this.hpText);
    this.eventMode = 'static';
    Ticker.shared.add(this.tick);
  }

  /** larger lettering for small screens (k = 1 on desktop) */
  setTextScale(k: number): void {
    this.nameText.style.fontSize = Math.round(26 * k); this.nameText.style.lineHeight = Math.round(28 * k);
    this.nameText.style.wordWrapWidth = 226;
    this.subText.style.fontSize = Math.round(14 * k); this.subText.style.letterSpacing = k > 1 ? 2 : 4;
    this.hpText.style.fontSize = Math.round(64 * Math.min(k, 1.25));
    this.subText.y = -58 + (k - 1) * 6;
  }

  set(name: string, faction: string, hp: number, max: number): void {
    this.hp = hp;
    const col = this.owner === 0 ? INK.gold : 0xe0674a;
    void col;
    this.plate.clear();
    const frac = Math.max(0, hp) / max;
    this.plate.roundRect(-96, 90, 192, 9, 4).fill({ color: 0x000000, alpha: 0.7 });
    this.plate.roundRect(-96, 90, 192 * frac, 9, 4).fill(frac > 0.5 ? INK.malachite : frac > 0.25 ? 0xd9a441 : INK.vermilion);
    // the painting darkens and reddens as the walls fall
    this.art.tint = frac > 0.66 ? 0xffffff : frac > 0.33 ? 0xe8c8b0 : 0xd09080;
    this.nameText.text = name; this.subText.text = `${faction.toUpperCase()} · DURG`;
    this.hpText.text = String(Math.max(0, hp));
    this.stage = frac > 0.66 ? 0 : frac > 0.33 ? 1 : 2;
  }

  setRing(on: boolean): void {
    this.ring.clear();
    if (on) this.ring.roundRect(-128, -126, 256, 252, 18).stroke({ width: 7, color: 0xff5a3c });
  }

  private burn(dt: number): void {
    if (this.stage === 0) return;
    this.spawnT += dt;
    if (this.spawnT < (this.stage === 2 ? 2 : 5)) return;
    this.spawnT = 0;
    const fire = this.stage === 2 && Math.random() < 0.6;
    const p = new Graphics().circle(0, 0, fire ? 4 + Math.random() * 4 : 6 + Math.random() * 8).fill(fire ? 0xff8a2a : 0x3a3430);
    if (fire) p.blendMode = 'add';
    p.alpha = fire ? 0.9 : 0.5;
    p.position.set(-70 + Math.random() * 140, -40 - Math.random() * 30);
    this.embers.addChild(p);
    gsap.to(p, { y: p.y - 60 - Math.random() * 40, x: p.x + (Math.random() - 0.3) * 30, alpha: 0, duration: fire ? 0.9 : 1.8, onComplete: () => p.destroy() });
    gsap.to(p.scale, { x: fire ? 0.3 : 2.2, y: fire ? 0.3 : 2.2, duration: fire ? 0.9 : 1.8 });
  }

  override destroy(): void { Ticker.shared.remove(this.tick); stopTweens(this); this.embers.children.forEach(c => stopTweens(c as Container)); super.destroy({ children: true }); }
}

/* ============================================================ Kosha diyas */
export function drawDiyas(g: Graphics, kosha: number, max: number): void {
  g.clear();
  for (let i = 0; i < 12; i++) {
    const x = (i % 6) * 34, y = Math.floor(i / 6) * 34;
    if (i >= max) { g.circle(x, y + 6, 4).fill({ color: 0x3a2a1a, alpha: 0.6 }); continue; }
    g.ellipse(x, y + 8, 13, 6).fill(0x9c5a2a).stroke({ width: 1.5, color: 0x3a1a08 });
    if (i < kosha) {
      g.ellipse(x, y - 4, 5, 10).fill({ color: 0xffb040, alpha: 0.95 });
      g.ellipse(x, y - 2, 2.5, 5).fill({ color: 0xfff2c0 });
      g.circle(x, y - 2, 14).fill({ color: 0xff9a30, alpha: 0.12 });
    }
  }
}

export const devaFont = FONT_DEVA;
