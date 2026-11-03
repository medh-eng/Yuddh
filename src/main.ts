/* YUDDH: Rise of the Rajyas — entry point. */
import { Stage } from './game/stage';
import { titleScene } from './game/scenes/title';
import { battlePreviewScene } from './game/scenes/battlePreview';
import { loadCardArt } from './assets/manifest';
import { FONT_DEVA, FONT_SERIF } from './game/theme';

async function boot(): Promise<void> {
  // Pixi draws text onto canvas, so the web fonts must be ready first.
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`700 40px ${FONT_SERIF}`),
        document.fonts.load(`600 40px ${FONT_SERIF}`),
        document.fonts.load(`40px ${FONT_DEVA}`, 'युद्ध')
      ]),
      new Promise(r => setTimeout(r, 2500))
    ]);
  } catch { /* fall back to system serif */ }

  const stage = new Stage();
  await stage.init();
  await loadCardArt();
  document.getElementById('boot')?.remove();

  const title = () => stage.show(titleScene({
    preview: () => stage.show(battlePreviewScene(title)),
    prototype: () => { window.location.href = `${import.meta.env.BASE_URL}prototype/`; }
  }));
  title();
}

void boot();
