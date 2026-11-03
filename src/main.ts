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
import { loadCardImages } from './game/cards/paint';
import { audio } from './game/audio';
import { loadCardArt } from './assets/manifest';
import { FONT_DEVA, FONT_SERIF } from './game/theme';

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
  await Promise.all([loadCardArt(), loadCardImages(), preloadBattle()]);
  document.getElementById('boot')?.remove();

  window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
  const title = () => stage.show(titleScene({
    battle: () => { audio.unlock(); stage.show(battleScene(stage, title)); },
    preview: () => stage.show(battlePreviewScene(title)),
    prototype: () => { window.location.href = `${import.meta.env.BASE_URL}prototype/`; }
  }));
  title();
}

void boot();
