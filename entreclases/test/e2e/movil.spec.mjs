// Versión de prueba para el celular (carpeta movil/), con emulación de teléfono y service worker activo.
//   npm run test:movil
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 7'], serviceWorkers: 'allow', permissions: ['camera'] });

async function runSession(page) {
  for (let step = 0; step < 60; step++) {
    const card = page.locator(`[data-step="${step}"]`);
    const summary = page.locator('.summary');
    await expect(card.or(summary)).toBeVisible();
    if (await summary.isVisible()) return;
    if (await card.evaluate((el) => el.classList.contains('learn-card'))) {
      await card.getByRole('button', { name: 'Siguiente' }).click();
      continue;
    }
    const answer = await card.getAttribute('data-answer');
    await card.locator(`[data-option-id="${answer}"]`).click();
    await card.getByRole('button', { name: 'Continuar' }).click();
  }
  throw new Error('La sesión no terminó');
}

test('celular: se instala, funciona sin conexión y usa la cámara', async ({ page, context }) => {
  await page.goto('/index.html');
  await expect(page.getByRole('heading', { name: 'Practicá entre una clase y la otra.' })).toBeVisible();
  // service worker activo: la app queda guardada en el teléfono
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  expect(manifest.start_url).toBe('./index.html');

  // modo demo: lección con el espejo (cámara frontal simulada)
  await page.getByRole('button', { name: 'Probar el curso de muestra' }).click();
  await page.getByRole('button', { name: 'Empezar la lección' }).click();
  const first = page.locator('[data-step="0"]');
  await expect.poll(() => first.locator('.stage-frame video').evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
  await first.getByRole('button', { name: 'Practicar frente al espejo' }).click();
  const mirror = page.getByRole('dialog', { name: /frente al espejo/ });
  await expect.poll(() => mirror.locator('.selfview video').evaluate((v) => !!v.srcObject)).toBe(true);
  await mirror.getByRole('button', { name: 'Me salió' }).click();
  await runSession(page);
  await expect(page.getByRole('heading', { name: '¡Lección completa!' })).toBeVisible();

  // sin conexión: la app abre igual y conserva el avance
  await context.setOffline(true);
  await page.goto('/index.html#/hoy');
  await expect(page.getByText('Lección de hoy: hecha')).toBeVisible();
  // la carpeta sin index.html también abre desde la app guardada
  await page.goto('/');
  await expect(page.locator('.brand')).toBeVisible();
  await context.setOffline(false);

  // sin desborde horizontal en el teléfono
  const { scroll, view } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, view: window.innerWidth }));
  expect(scroll).toBeLessThanOrEqual(view);
});

test('celular: la docente graba una toma con la cámara del teléfono', async ({ page }) => {
  await page.goto('/index.html#/estudio');
  await page.getByRole('link', { name: /Piloto LSA \(borrador\)/ }).click();
  await page.getByRole('link', { name: 'Señantes' }).click();
  await page.getByRole('button', { name: 'Registrar señante' }).click();
  await page.getByLabel('Nombre').fill('Ana');
  await page.getByLabel('Fecha de firma').fill('2026-10-07');
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('link', { name: 'Contenido' }).click();
  await page.locator('.item-row', { hasText: 'gracias' }).click();
  await page.getByRole('button', { name: 'Grabar con la cámara' }).click();
  const recorder = page.getByRole('dialog', { name: 'Grabar «gracias»' });
  await recorder.getByRole('button', { name: 'Grabar (cuenta 3 s)' }).click();
  await expect(recorder.getByText(/REC/)).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(1000);
  await recorder.getByRole('button', { name: 'Detener' }).click();
  await recorder.getByRole('button', { name: 'Guardar toma' }).click();
  await expect(page.locator('.take')).toHaveCount(1);
});
