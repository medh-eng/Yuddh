/* YUDDH: Rise of the Rajyas — entry point. */
// fonts ship with the game (offline, Android) — no Google Fonts request
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/alegreya-sans/500.css';
import '@fontsource/alegreya-sans/500-italic.css';
import '@fontsource/alegreya-sans/700.css';
import '@fontsource/alegreya-sans/800.css';
import { Stage } from './game/stage';
import { view } from './game/view';
import { canFullscreen, isFullscreen, toggleFullscreen } from './game/fullscreen';
import { titleScene } from './game/scenes/title';
import { battlePreviewScene } from './game/scenes/battlePreview';
import { battleScene, preloadBattle } from './game/scenes/battle';
import { galleryScene } from './game/scenes/gallery';
import { campaignScene } from './game/scenes/campaign';
import { standingScene } from './game/scenes/standing';
import { duelSetupScene } from './game/scenes/duelSetup';
import { duelScenario } from './campaign/duel';
import { scenarioById, type Campaign } from './campaign/campaign';
import type { Scenario } from './campaign/scenario';
import { audio } from './game/audio';
import { TUTORIAL } from './campaign/tutorial';
import { CARD_ART, loadArt, loadBattlefield } from './assets/manifest';
import { FONT_BODY, FONT_DEVA, FONT_SERIF, FONT_TITLE } from './game/theme';

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
        document.fonts.load(`700 40px ${FONT_TITLE}`),
        document.fonts.load(`600 40px ${FONT_TITLE}`),
        document.fonts.load(`700 40px ${FONT_BODY}`),
        document.fonts.load(`800 40px ${FONT_BODY}`),
        document.fonts.load(`500 40px ${FONT_BODY}`),
        document.fonts.load(`italic 500 40px ${FONT_BODY}`),
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
  // a sideways phone: the first press also goes full screen, hiding the address bar (once; ⛶ in battle toggles it)
  let askedFull = false;
  window.addEventListener('pointerup', () => {
    if (askedFull || !view.phone || !canFullscreen() || isFullscreen()) return;
    askedFull = true; void toggleFullscreen();
  });
  /** play a campaign battle; winning it offers the next one, and leaving returns to `back` */
  const play = (sc: Scenario, back: () => void): void => {
    audio.unlock();
    const next = sc.nextId ? scenarioById(sc.nextId) : undefined;
    void loading(preloadBattle(sc)).then(() =>
      stage.show(battleScene(stage, back, sc, next ? () => play(next, back) : undefined, { map: campaign, title })));
  };
  const campaign = (start?: Campaign): void => stage.show(campaignScene(stage, sc => play(sc, campaign), title, start));
  const standing = (): void => stage.show(standingScene(stage, title, c => campaign(c)));
  /** pass-and-play: choose two factions, then play on one device */
  const duel = (): void => stage.show(duelSetupScene(stage, title, (a, b) => {
    audio.unlock();
    const sc = duelScenario(a, b);
    void loading(preloadBattle(sc)).then(() => stage.show(battleScene(stage, title, sc, undefined, { title, setup: duel })));
  }));
  const title = (): void => stage.show(titleScene(stage, {
    battle: () => { audio.unlock(); void loading(battleReady).then(() => stage.show(battleScene(stage, title, undefined, () => play(scenarioById('indus_line')!, title), { map: campaign, title }))); },
    tutorial: () => play(TUTORIAL, title),
    campaign: () => campaign(),
    standing,
    duel,
    gallery: () => { audio.unlock(); stage.show(galleryScene(stage, title)); },
    preview: () => { void loading(loadArt(CARD_ART)).then(() => { stage.setBackdrop(null); stage.show(battlePreviewScene(title)); }); },
    prototype: () => { window.location.href = `${import.meta.env.BASE_URL}prototype/`; }
  }));
  title();
}

void boot();
