/* ============================================================
   Card view — placeholder anatomy matching the plan:
   arch-topped painting, cost coin top-left, operation cost top-right,
   name ribbon, attack (sword) bottom-left, defence (shield)
   bottom-right, rarity gem. Phase 1 replaces the drawing, not the API.
   ============================================================ */
import { Container, Graphics, Sprite, Text } from 'pixi.js';
import { CARDS, type Unit } from '../../engine';
import { cardArt } from '../../assets/manifest';
import { EMPIRE_STYLE, FONT_DEVA, FONT_SERIF, INK } from '../theme';
import { sheen } from '../textures';

export const CARD_W = 150;
export const CARD_H = 210;

const RARITY_GEM = { common: 0xa0703a, rare: 0xcfd6de, epic: 0xf2c94c, legendary: 0xd33b4c } as const;

export class CardView extends Container {
  private atkText: Text;
  private hpText: Text;
  readonly cardId: string;

  constructor(cardId: string, unit?: Unit) {
    super();
    this.cardId = cardId;
    const c = CARDS[cardId];
    const st = EMPIRE_STYLE[c.empire];
    const w = CARD_W, h = CARD_H, x0 = -w / 2, y0 = -h / 2;

    // shadow + frame
    const g = new Graphics();
    g.roundRect(x0 + 4, y0 + 8, w, h, 10).fill({ color: 0x000000, alpha: 0.45 });
    g.roundRect(x0, y0, w, h, 10).fill(st.frame).stroke({ width: 2, color: st.frameLight });
    // arch-topped painting window
    const ax = x0 + 12, ay = y0 + 30, aw = w - 24, ah = 104;
    g.moveTo(ax, ay + ah).lineTo(ax, ay + 24)
      .arc(ax + aw / 2, ay + 24, aw / 2, Math.PI, 0)
      .lineTo(ax + aw, ay + ah).closePath()
      .fill(0x1a120c).stroke({ width: 2, color: st.frameLight, alpha: 0.9 });
    // palm-leaf text panel
    g.roundRect(x0 + 10, y0 + 150, w - 20, 34, 4).fill({ color: 0xe9d9b0, alpha: 0.92 });
    this.addChild(g);

    const art = cardArt(cardId);
    if (art) {
      const s = new Sprite(art);
      const scale = Math.max(aw / art.width, ah / art.height);
      s.scale.set(scale); s.anchor.set(0.5); s.position.set(0, ay + ah / 2);
      const mask = new Graphics().moveTo(ax, ay + ah).lineTo(ax, ay + 24).arc(ax + aw / 2, ay + 24, aw / 2, Math.PI, 0).lineTo(ax + aw, ay + ah).closePath().fill(0xffffff);
      s.mask = mask;
      this.addChild(mask, s);
    } else {
      const glyph = new Text({ text: c.glyph, style: { fontFamily: FONT_DEVA, fontSize: 58, fill: st.frameLight } });
      glyph.anchor.set(0.5); glyph.position.set(0, ay + ah / 2 + 8); glyph.alpha = 0.9;
      this.addChild(glyph);
    }

    const shine = new Sprite(sheen());
    shine.width = w; shine.height = h; shine.position.set(x0, y0); shine.alpha = 0.5; shine.blendMode = 'overlay';
    this.addChild(shine);

    // name ribbon
    const name = new Text({ text: c.name, style: { fontFamily: FONT_SERIF, fontSize: 17, fontWeight: '700', fill: 0x24170e, align: 'center', wordWrap: true, wordWrapWidth: w - 26 } });
    name.anchor.set(0.5); name.position.set(0, y0 + 160);
    const sub = new Text({ text: c.sub.toUpperCase(), style: { fontFamily: FONT_SERIF, fontSize: 10, letterSpacing: 2, fill: 0x5a4330 } });
    sub.anchor.set(0.5); sub.position.set(0, y0 + 176);
    this.addChild(name, sub);

    // cost coin and operation cost
    this.addChild(coin(x0 + 18, y0 + 18, String(c.cost), INK.gold, 0x24170e));
    if (c.type === 'unit') this.addChild(coin(-x0 - 18, y0 + 18, String(c.op ?? 0), 0x2a1c12, INK.goldPale, 13));

    // rarity gem
    const gem = new Graphics().poly([0, -7, 6, 0, 0, 7, -6, 0]).fill(RARITY_GEM[c.rarity ?? 'common']).stroke({ width: 1, color: 0x000000, alpha: 0.4 });
    gem.position.set(0, y0 + 142);
    this.addChild(gem);

    this.atkText = statText('');
    this.hpText = statText('');
    if (c.type === 'unit') {
      const sword = new Graphics().circle(x0 + 20, -y0 - 18, 17).fill(0x8f2a1c).stroke({ width: 2, color: INK.goldPale });
      const shield = new Graphics().circle(-x0 - 20, -y0 - 18, 17).fill(0x2b4d7a).stroke({ width: 2, color: INK.goldPale });
      this.atkText.position.set(x0 + 20, -y0 - 18);
      this.hpText.position.set(-x0 - 20, -y0 - 18);
      this.addChild(sword, shield, this.atkText, this.hpText);
      this.setStats(unit ? unit.atk : c.atk ?? 0, unit ? unit.hp : c.hp ?? 0);
    } else {
      const kind = new Text({ text: (c.kind ?? (c.type === 'order' ? 'mantra' : c.type)).toUpperCase(), style: { fontFamily: FONT_SERIF, fontSize: 12, fontWeight: '700', letterSpacing: 3, fill: st.frameLight } });
      kind.anchor.set(0.5); kind.position.set(0, -y0 - 14);
      this.addChild(kind);
    }
  }

  setStats(atk: number, hp: number): void {
    this.atkText.text = String(atk);
    this.hpText.text = String(hp);
  }
}

function coin(x: number, y: number, label: string, fill: number, ink: number, r = 16): Container {
  const c = new Container();
  c.addChild(new Graphics().circle(0, 0, r).fill(fill).stroke({ width: 2, color: 0x24170e, alpha: 0.6 }));
  const t = new Text({ text: label, style: { fontFamily: FONT_SERIF, fontSize: r + 4, fontWeight: '700', fill: ink } });
  t.anchor.set(0.5); c.addChild(t);
  c.position.set(x, y);
  return c;
}

function statText(s: string): Text {
  const t = new Text({ text: s, style: { fontFamily: FONT_SERIF, fontSize: 22, fontWeight: '700', fill: 0xffffff, stroke: { color: 0x000000, width: 3 } } });
  t.anchor.set(0.5);
  return t;
}
