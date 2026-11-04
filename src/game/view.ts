/* ============================================================
   Screen modes. Desktops and tablets use the 1920×1080 design
   space. Phones held sideways get a shorter design space (720 high,
   as wide as the screen's shape allows, from 16:9 up to 2.5:1), so
   everything is drawn half as large again, and `ui` enlarges text
   and controls a little more on top. Sized for 5.5–6 inch phones. Scenes read `view` when they lay themselves out.
   ============================================================ */
import { DESIGN_H, DESIGN_W } from './theme';

export interface View {
  /** design width and height for responsive scenes */
  w: number; h: number;
  /** a phone in landscape: short side of the window at most 540 CSS px */
  phone: boolean;
  /** extra size for text and controls (1 on desktop) */
  ui: number;
}

export const view: View = { w: DESIGN_W, h: DESIGN_H, phone: false, ui: 1 };

/** Re-measure the window. Returns true when the mode or design size changed. */
export function measureView(): boolean {
  const W = window.innerWidth, H = window.innerHeight;
  const phone = Math.min(W, H) <= 540;
  let w = DESIGN_W, h = DESIGN_H, ui = 1;
  if (phone) {
    h = 720;
    w = Math.round(Math.max(1280, Math.min(1800, (h * W) / Math.max(1, H))));
    ui = 1.25;
  }
  const changed = w !== view.w || h !== view.h || phone !== view.phone;
  view.w = w; view.h = h; view.phone = phone; view.ui = ui;
  return changed;
}

/** a font size (or control size) for the current mode */
export const fs = (n: number): number => Math.round(n * view.ui);
