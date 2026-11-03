import { defineConfig } from 'vite';

// Served from https://medh-eng.github.io/Yuddh/ — relative base also works for the Android wrapper.
export default defineConfig({
  base: './',
  build: { target: 'es2022', assetsInlineLimit: 0, chunkSizeWarningLimit: 1200 },
  test: { include: ['tests/**/*.test.ts'] }
});
