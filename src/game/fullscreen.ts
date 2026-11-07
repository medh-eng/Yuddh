/* Full screen, so the browser's address bar stops eating a fifth of a sideways phone.
   Android Chrome also lets a full-screen page hold landscape. iPhones have no full-screen
   API for pages; there the button is hidden (adding the game to the home screen does it). */
export const canFullscreen = (): boolean => !!document.fullscreenEnabled;
export const isFullscreen = (): boolean => !!document.fullscreenElement;

export async function toggleFullscreen(): Promise<void> {
  try {
    if (isFullscreen()) { await document.exitFullscreen(); return; }
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
    await o.lock?.('landscape').catch(() => { /* desktop browsers refuse; that is fine */ });
  } catch { /* refused: stay as we are */ }
}
