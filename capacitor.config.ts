import type { CapacitorConfig } from '@capacitor/cli';

/* YUDDH as an Android app: the whole dist/ build (game + art + music, ~91 MB)
   ships inside the app, so it plays fully offline. The appId is permanent once
   the first AAB is uploaded to Google Play — change it before then or never. */
const config: CapacitorConfig = {
  appId: 'com.medheng.yuddh',
  appName: 'YUDDH',
  webDir: 'dist',
  android: {
    // the game is a single local page; no server, no cleartext
    allowMixedContent: false
  }
};

export default config;
