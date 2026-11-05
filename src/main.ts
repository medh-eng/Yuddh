/* YUDDH: Rise of the Rajyas — entry point. */
// fonts ship with the game (offline, Android) — no Google Fonts request
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import { Stage } from './game/stage';
import { titleScene } from './game/scenes/title';
import { battlePreviewScene } from './game/scenes/battlePreview';
import { battleScene, preloadBattle } from './game/scenes/battle';
import { galleryScene } from './game/scenes/gallery';
import { audio } from './game/audio';
import { TUTORIAL } from './campaign/tutorial';
import { CARD_ART, loadArt, loadBattlefield } from './assets/manifest';
import { FONT_DEVA, FONT_SERIF } from './game/theme';

/** a quiet "loading" line over the screen while something is fetched */
async function loading<T>(p: Promise<T>): Promise<T> {
  const el = document.createElement('div');
  el.textContent = 'Unrolling the paintings…';
  el.style.cssText = 'position:fixed;inset:auto 0 6%;text-align:center;color:#f0d79a;font:italic 500 22px "Cormorant Garamond",Georgia,serif;text-shadow:0 1px 4px #000;pointer-events:none;opacity:0;transition:opacity .3s';
  const t = setTimeout(() => { document.body.appendChild(el); requestAnimationFrame(() => { el.style.opacity = '1'; }); }, 250);
  try { return await p; } finally { clearTimeout(t); el.remove(); }
}

async function boot(): Promise<void> {
  // Pixi draws text onto canvas, so the web fonts must be ready first.
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`700 40px ${FONT_SERIF}`),
        document.fonts.load(`600 40px ${FONT_SERIF}`),
        document.fonts.load(`500 40px ${FONT_SERIF}`),
        document.fonts.load(`italic 500 40px ${FONT_SERIF}`),
        document.fonts.load(`40px ${FONT_DEVA}`, 'युद्ध')
      ]),
      new Promise(r => setTimeout(r, 2500))
    ]);
  } catch { /* fall back to system serif */ }

  const stage = new Stage();
  await stage.init();
  await loadBattlefield('title');
  document.getElementById('boot')?.remove();
  // the first battle's paintings load while the title is on screen
  const battleReady = preloadBattle();

  window.addEventListener('pointerdown', () => audio.unlock());
  const title = (): void => stage.show(titleScene(stage, {
    battle: () => { audio.unlock(); void loading(battleReady).then(() => stage.show(battleScene(stage, title))); },
    tutorial: () => {
      audio.unlock();
      void loading(Promise.all([battleReady, preloadBattle(TUTORIAL)])).then(() =>
        stage.show(battleScene(stage, title, TUTORIAL, () => void loading(battleReady).then(() => stage.show(battleScene(stage, title))))));
    },
    gallery: () => { audio.unlock(); stage.show(galleryScene(stage, title)); },
    preview: () => { void loading(loadArt(CARD_ART)).then(() => { stage.setBackdrop(null); stage.show(battlePreviewScene(title)); }); },
    prototype: () => { window.location.href = `${import.meta.env.BASE_URL}prototype/`; }
  }));
  title();
}

void boot();
