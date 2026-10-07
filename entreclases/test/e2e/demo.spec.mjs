// Recorridos completos en modo demo, con cámara simulada de Chromium.
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** Recorre una sesión entera respondiendo bien. Devuelve los tipos de pregunta vistos. */
async function runSession(page, { wrongAt = -1 } = {}) {
  const types = [];
  for (let step = 0; step < 60; step++) {
    const card = page.locator(`[data-step="${step}"]`);
    const summary = page.locator('.summary');
    await expect(card.or(summary)).toBeVisible();
    if (await summary.isVisible()) return types;
    if (await card.evaluate((el) => el.classList.contains('learn-card'))) {
      await card.getByRole('button', { name: 'Siguiente' }).click();
      continue;
    }
    const answer = await card.getAttribute('data-answer');
    types.push(await card.getAttribute('data-type'));
    const pick = types.length - 1 === wrongAt ? card.locator(`[data-option-id]:not([data-option-id="${answer}"])`).first() : card.locator(`[data-option-id="${answer}"]`);
    await pick.click();
    await card.getByRole('button', { name: 'Continuar' }).click();
  }
  throw new Error('La sesión no terminó');
}

async function noHorizontalScroll(page) {
  const { scroll, view } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, view: window.innerWidth }));
  expect(scroll, 'la página no debe desplazarse de costado').toBeLessThanOrEqual(view);
}

test('alumno: lección completa con cámara lenta, espejo y repaso', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Probar el curso de muestra' }).click();
  await expect(page.getByText('Lección 1 de 2')).toBeVisible();
  await noHorizontalScroll(page);

  await page.getByRole('button', { name: 'Empezar la lección' }).click();
  const first = page.locator('[data-step="0"]');
  await expect(first.getByRole('heading', { name: 'Círculo' })).toBeVisible();
  const video = first.locator('.stage-frame video');
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
  await first.getByRole('button', { name: '0,5×' }).click();
  await expect.poll(() => video.evaluate((v) => v.playbackRate)).toBe(0.5);
  await first.getByRole('button', { name: 'Espejo', exact: true }).click();
  await expect(video).toHaveClass(/mirrored/);

  // espejo con la cámara frontal (simulada): no se graba nada
  await first.getByRole('button', { name: 'Practicar frente al espejo' }).click();
  const mirror = page.getByRole('dialog', { name: /frente al espejo/ });
  await expect(mirror).toBeVisible();
  await expect.poll(() => mirror.locator('.selfview video').evaluate((v) => !!v.srcObject)).toBe(true);
  await mirror.getByRole('button', { name: 'Me salió' }).click();
  await expect(mirror).toBeHidden();

  const types = await runSession(page, { wrongAt: 0 });
  expect(types).toContain('video-to-text');
  expect(types).toContain('text-to-video');
  await expect(page.getByRole('heading', { name: '¡Lección completa!' })).toBeVisible();
  await expect(page.locator('.summary .stats')).toContainText('Señas nuevas5');

  await page.getByRole('button', { name: 'Volver a Hoy' }).click();
  await expect(page.getByText('Lección de hoy: hecha')).toBeVisible();
  await expect(page.locator('.stats')).toContainText('Señas aprendidas5');

  // el avance queda guardado en el dispositivo
  await page.reload();
  await expect(page.getByText('Lección de hoy: hecha')).toBeVisible();

  // repaso "igual" (no hay pendientes hoy) y Mis señas
  await page.getByRole('button', { name: 'Repasar igual' }).click();
  await runSession(page);
  await expect(page.getByRole('heading', { name: '¡Repaso hecho!' })).toBeVisible();
  await page.getByRole('button', { name: 'Volver a Hoy' }).click();
  await page.getByRole('link', { name: 'Mis señas' }).click();
  await expect(page.locator('.sign-row')).toHaveCount(5);
  await page.getByLabel('Buscar por palabra').fill('vaiven');
  await expect(page.locator('.sign-row')).toHaveCount(2); // «Vaivén» y la frase «Círculo y vaivén»
  await page.locator('.sign-row').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('alumno: el código inválido se explica', async ({ page }) => {
  await page.goto('/#/unirse');
  await page.getByLabel('Código del curso').fill('abc');
  await page.getByLabel('¿Cómo te llamamos?').fill('Lu');
  await page.getByRole('button', { name: 'Entrar al curso' }).click();
  await expect(page.getByRole('alert')).toContainText('6 letras y números');
  await page.getByLabel('Código del curso').fill('ZZZZ22');
  await page.getByLabel(/Acepto que mi docente/).check();
  await page.getByRole('button', { name: 'Entrar al curso' }).click();
  await expect(page.getByRole('alert')).toContainText('No encontramos ese código');
});

test('docente: graba, sube, valida y publica; el alumno practica lo publicado', async ({ page }) => {
  await page.goto('/#/estudio');
  await page.getByRole('link', { name: /Piloto LSA \(borrador\)/ }).click();
  await expect(page.getByText('70 ítems')).toBeVisible();

  // sin consentimiento no se puede grabar
  await page.locator('.item-row', { hasText: 'hola' }).click();
  await expect(page.getByText('primero registrá a la persona')).toBeVisible();
  await page.getByRole('button', { name: 'Ir a Señantes' }).click();
  await page.getByRole('button', { name: 'Registrar señante' }).click();
  await page.getByLabel('Nombre').fill('Ana');
  await page.getByLabel('Fecha de firma').fill('2026-10-07');
  await page.getByRole('dialog').getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('.signer-card')).toContainText('Consentimiento 2026-10-07');

  // grabar «hola» con la cámara
  await page.getByRole('link', { name: 'Contenido' }).click();
  await page.locator('.item-row', { hasText: 'hola' }).click();
  await page.getByRole('button', { name: 'Grabar con la cámara' }).click();
  const recorder = page.getByRole('dialog', { name: 'Grabar «hola»' });
  await expect(recorder.getByText('cabeza', { exact: true })).toBeVisible();
  await recorder.getByRole('button', { name: 'Grabar (cuenta 3 s)' }).click();
  await expect(recorder.getByText(/REC/)).toBeVisible({ timeout: 6000 });
  await page.waitForTimeout(1200);
  await recorder.getByRole('button', { name: 'Detener' }).click();
  await recorder.getByRole('button', { name: 'Guardar toma' }).click();
  await expect(page.locator('.take')).toHaveCount(1);
  await expect(page.locator('.take')).toContainText('Principal');
  await page.getByLabel('Validé esta seña: es correcta y está bien grabada').check();
  await expect(page.locator('.page-head')).toContainText('Validada');

  // subir un archivo para la siguiente pendiente («chau»)
  await page.getByRole('link', { name: /Siguiente pendiente: «chau»/ }).click();
  await expect(page.getByRole('heading', { name: 'chau' })).toBeVisible();
  await page.locator('#take-file').setInputFiles(path.join(root, 'public/demo/circulo.webm'));
  await expect(page.locator('.take')).toHaveCount(1);
  await page.getByLabel('Validé esta seña: es correcta y está bien grabada').check();
  await expect(page.locator('.page-head')).toContainText('Validada');

  // publicar
  await page.getByRole('link', { name: /Piloto LSA \(borrador\)/ }).click();
  await page.getByRole('link', { name: 'Publicar' }).click();
  await expect(page.getByText('Se publican 2 ítems: lección 1 (2).')).toBeVisible();
  await page.getByRole('button', { name: 'Publicar versión 1' }).click();
  await expect(page.getByText('Versiones publicadas')).toBeVisible();
  const code = (await page.locator('.big-code').textContent()).trim();
  expect(code).toMatch(/^[A-Z0-9]{6}$/);

  // el alumno entra con el código y practica
  await page.goto('/#/unirse');
  await page.getByLabel('Código del curso').fill(code);
  await page.getByLabel('¿Cómo te llamamos?').fill('Lucía');
  await page.getByLabel(/Acepto que mi docente/).check();
  await page.getByRole('button', { name: 'Entrar al curso' }).click();
  await expect(page.getByText('Lección 1 de 1')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saludos' })).toBeVisible();
  await page.getByRole('button', { name: 'Empezar la lección' }).click();
  const card = page.locator('[data-step="0"]');
  await expect(card.getByRole('heading', { name: 'hola' })).toBeVisible();
  await expect(card).toContainText('Seña de Ana');
  await expect.poll(() => card.locator('.stage-frame video').evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
  await runSession(page);
  await expect(page.getByRole('heading', { name: '¡Lección completa!' })).toBeVisible();
});

test('panel: cohorte simulada, criterios y exportación', async ({ page }) => {
  await page.goto('/#/estudio');
  await page.getByRole('link', { name: /Piloto LSA \(borrador\)/ }).click();
  await page.getByRole('link', { name: 'Panel del piloto' }).click();
  await expect(page.getByText('Todavía no hay alumnos')).toBeVisible();
  await page.getByRole('button', { name: 'Simular 40 alumnos' }).click();
  await expect(page.getByText('Datos simulados.')).toBeVisible();
  await expect(page.locator('.kpi', { hasText: 'Alumnos' })).toContainText('40');
  await expect(page.locator('.panel-tab table.data').last().locator('tbody tr')).toHaveCount(40);
  await expect(page.locator('.verdict-title')).not.toHaveText('Piloto en curso');
  await noHorizontalScroll(page);

  // criterios más exigentes → refuta
  await page.getByText('Criterios del piloto', { exact: true }).click();
  await page.getByLabel('Lección a alcanzar').fill('10');
  await page.getByLabel('Refuta si llega menos de (%)').fill('90');
  await page.getByRole('button', { name: 'Guardar criterios' }).click();
  await expect(page.locator('.verdict-title')).toHaveText('La hipótesis no se sostiene');

  // CSV para Excel en español
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Participantes (CSV)' }).click()]);
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv.split('\r\n')).toHaveLength(41);
  expect(csv.split('\r\n')[0]).toContain('Alumno;Se sumó;');

  await page.getByRole('button', { name: 'Borrar la simulación' }).click();
  await page.getByRole('button', { name: 'Sí, borrar' }).click();
  await expect(page.getByText('Todavía no hay alumnos')).toBeVisible();
});

test('estudio: crear un curso vacío y cargar la primera seña', async ({ page }) => {
  await page.goto('/#/estudio');
  await page.getByText('Crear un curso nuevo').click();
  await page.getByLabel('Nombre del curso').fill('LSA Nivel 1 · martes');
  await page.getByLabel('Día de clase').selectOption('2');
  await page.getByLabel('Lecciones', { exact: true }).fill('4');
  await page.getByLabel(/Cargar el plan borrador/).uncheck();
  await page.getByRole('button', { name: 'Crear curso' }).click();
  await expect(page.getByRole('heading', { name: 'LSA Nivel 1 · martes' })).toBeVisible();
  await expect(page.locator('.lesson-block')).toHaveCount(4);
  await page.locator('.lesson-block').nth(1).getByRole('button', { name: '+ Seña' }).click();
  await page.getByLabel('Significado en español').fill('buenas tardes');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('heading', { name: 'buenas tardes' })).toBeVisible();
  await expect(page.getByLabel('Lección')).toHaveValue('2');
});

test('vista previa de un solo archivo: funciona sin servidor', async ({ page }) => {
  // Se envuelve como lo hace el visor de Artifacts (doctype + charset + viewport).
  const content = await readFile(path.join(root, 'dist-preview/entreclases.html'), 'utf8');
  const shell = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${content}</body></html>`;
  await page.route('**/__vista-previa.html', (route) => route.fulfill({ contentType: 'text/html; charset=utf-8', body: shell }));
  await page.goto('/__vista-previa.html');
  await page.getByRole('button', { name: 'Probar el curso de muestra' }).click();
  await page.getByRole('button', { name: 'Empezar la lección' }).click();
  const video = page.locator('[data-step="0"] .stage-frame video');
  await expect.poll(() => video.evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(2);
  await runSession(page);
  await expect(page.getByRole('heading', { name: '¡Lección completa!' })).toBeVisible();
});
