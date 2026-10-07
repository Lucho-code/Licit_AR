// Piloto real (modo Firebase) contra los emuladores: docente y alumno en navegadores separados.
//   npm run test:firebase
import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EMULATOR_CONFIG = `window.ENTRECLASES_CONFIG = {
  firebase: { apiKey: 'demo-key', authDomain: 'demo-entreclases.firebaseapp.com', projectId: 'demo-entreclases', storageBucket: 'demo-entreclases.appspot.com', appId: '1:1:web:1' },
  useEmulators: true,
};`;

async function openApp(browser, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`));
  await page.route('**/config.js', (route) => route.fulfill({ contentType: 'text/javascript', body: EMULATOR_CONFIG }));
  await page.goto('/');
  await page.waitForFunction(() => window.__entreclases?.store?.mode === 'firebase');
  return page;
}

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

test('piloto con Firebase: la docente publica, el alumno practica y el panel lo mide', async ({ browser }, testInfo) => {
  const options = testInfo.project.use;
  const contextOptions = { baseURL: options.baseURL, viewport: options.viewport, serviceWorkers: 'block', permissions: ['camera'] };

  // ---- docente (cuenta de Google simulada en el emulador)
  const teacher = await openApp(browser, contextOptions);
  await teacher.evaluate(() => window.__entreclases.store.signInTestStaff('ana@example.com'));
  await teacher.goto('/#/estudio');
  await expect(teacher.getByRole('heading', { name: 'Tus cursos' })).toBeVisible();
  await expect(teacher.getByText('Sesión: ana@example.com')).toBeVisible();
  await teacher.getByText('Crear un curso nuevo').click();
  await teacher.getByLabel('Nombre del curso').fill('LSA 1 · Círculo de Sordos');
  await teacher.getByLabel('Día de clase').selectOption('3');
  await teacher.getByRole('button', { name: 'Crear curso' }).click();
  await expect(teacher.getByRole('heading', { name: 'LSA 1 · Círculo de Sordos' })).toBeVisible();
  await expect(teacher.getByText('70 ítems')).toBeVisible();

  await teacher.getByRole('link', { name: 'Señantes' }).click();
  await teacher.getByRole('button', { name: 'Registrar señante' }).click();
  await teacher.getByLabel('Nombre').fill('Ana');
  await teacher.getByLabel('Fecha de firma').fill('2026-10-07');
  await teacher.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click();
  await expect(teacher.locator('.signer-card')).toContainText('Consentimiento 2026-10-07');

  for (const word of ['hola', 'chau']) {
    await teacher.getByRole('link', { name: 'Contenido' }).click();
    await teacher.locator('.item-row', { hasText: new RegExp(`^Seña\\s*${word}`) }).click();
    await expect(teacher.getByRole('heading', { name: word })).toBeVisible();
    await teacher.locator('#take-file').setInputFiles(path.join(root, 'public/demo/ocho.webm'));
    await expect(teacher.locator('.take')).toHaveCount(1, { timeout: 20_000 });
    await teacher.getByLabel('Validé esta seña: es correcta y está bien grabada').check();
    await expect(teacher.locator('.page-head')).toContainText('Validada');
    await teacher.getByRole('link', { name: /LSA 1 · Círculo de Sordos/ }).click();
  }
  await teacher.getByRole('link', { name: 'Publicar' }).click();
  await teacher.getByRole('button', { name: 'Publicar versión 1' }).click();
  await expect(teacher.getByText('Versiones publicadas')).toBeVisible();
  const code = (await teacher.locator('.big-code').textContent()).trim();

  // ---- alumno: sin cuenta, solo con el código
  const student = await openApp(browser, contextOptions);
  await student.goto(`/#/unirse/${code}`);
  await student.getByLabel('¿Cómo te llamamos?').fill('Lucía');
  await student.getByLabel(/Acepto que mi docente/).check();
  await student.getByRole('button', { name: 'Entrar al curso' }).click();
  await expect(student.getByText('Lección 1 de 1')).toBeVisible();
  await student.getByRole('button', { name: 'Empezar la lección' }).click();
  const card = student.locator('[data-step="0"]');
  await expect(card).toContainText('Seña de Ana');
  await expect.poll(() => card.locator('.stage-frame video').evaluate((v) => v.readyState), { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  await runSession(student);
  await expect(student.getByRole('heading', { name: '¡Lección completa!' })).toBeVisible();
  await student.getByRole('button', { name: 'Volver a Hoy' }).click();
  // solo se publicó la lección 1: queda todo hecho hasta que la docente publique más
  await expect(student.getByText('Hiciste todas las lecciones publicadas')).toBeVisible();
  await expect(student.locator('.stats')).toContainText('Señas aprendidas2');
  // el alumno no puede entrar al estudio del curso
  await student.goto('/#/estudio');
  await expect(student.getByRole('button', { name: 'Entrar con Google' })).toBeVisible();

  // ---- panel de la docente
  await teacher.getByRole('link', { name: 'Panel del piloto' }).click();
  await expect(teacher.locator('.kpi', { hasText: 'Alumnos' })).toContainText('1');
  const row = teacher.locator('table.data tbody tr', { hasText: 'Lucía' });
  await expect(row).toBeVisible();
  await expect(row.locator('td.num').first()).toHaveText('1'); // días activos
  await expect(teacher.locator('.verdict-title')).toHaveText('Piloto en curso');
});
