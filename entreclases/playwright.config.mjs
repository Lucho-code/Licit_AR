import { defineConfig } from '@playwright/test';

// Pruebas de punta a punta en Chromium con una cámara simulada.
//   demo:     modo demo (todo en el navegador)
//   firebase: modo piloto contra los emuladores de Firebase (npm run test:firebase)
export default defineConfig({
  testDir: 'test/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block',
    permissions: ['camera'],
    launchOptions: {
      args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
    },
  },
  webServer: [
    {
      command: 'node scripts/serve.mjs 4173',
      url: 'http://127.0.0.1:4173/index.html',
      reuseExistingServer: true,
    },
    {
      command: 'node scripts/serve.mjs 4174',
      url: 'http://127.0.0.1:4174/index.html',
      reuseExistingServer: true,
      env: { SERVE_DIR: 'movil', SERVE_NO_INDEX: '1' },
    },
  ],
  projects: [
    { name: 'demo', testMatch: /demo\.spec\.mjs/ },
    { name: 'firebase', testMatch: /firebase\.spec\.mjs/ },
    { name: 'movil', testMatch: /movil\.spec\.mjs/, use: { baseURL: 'http://127.0.0.1:4174' } },
  ],
});
