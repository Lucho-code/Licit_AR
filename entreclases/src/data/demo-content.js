// Contenido del modo demo.
// 1) "Curso de muestra": trazos abstractos con videos generados (NO son señas) para probar la app.
// 2) "Piloto LSA (borrador)": el plan de 10 lecciones, todo pendiente de grabación por el/la docente.

export const SAMPLE_COURSE = {
  name: 'Curso de muestra',
  code: 'PRUEBA',
  region: 'Muestra',
  classWeekday: 3,
  lessonTitles: [
    { n: 1, title: 'Trazos simples' },
    { n: 2, title: 'Más trazos' },
  ],
};

const NOTE = 'Video de muestra para probar la app. No es una seña de LSA.';

export const SAMPLE_ITEMS = [
  { key: 'circulo', kind: 'sign', meanings: ['Círculo'], lesson: 1, order: 1 },
  { key: 'ocho', kind: 'sign', meanings: ['Ocho'], lesson: 1, order: 2 },
  { key: 'zigzag', kind: 'sign', meanings: ['Zigzag'], lesson: 1, order: 3 },
  { key: 'vaiven', kind: 'sign', meanings: ['Vaivén'], lesson: 1, order: 4 },
  { key: 'frase-circulo-vaiven', kind: 'phrase', meanings: ['Círculo y vaivén'], lesson: 1, order: 5 },
  { key: 'arriba-abajo', kind: 'sign', meanings: ['Arriba y abajo'], lesson: 2, order: 1 },
  { key: 'diagonal', kind: 'sign', meanings: ['Diagonal'], lesson: 2, order: 2 },
  { key: 'frase-ocho-diagonal', kind: 'phrase', meanings: ['Ocho y diagonal'], lesson: 2, order: 3 },
].map((it) => ({ ...it, notes: NOTE }));

export const DRAFT_COURSE = {
  name: 'Piloto LSA (borrador)',
  region: 'Litoral (Rosario)',
  classWeekday: 3,
  lessonsCount: 10,
};

let preferWebm = null;
function supportsH264() {
  if (preferWebm === null) {
    try {
      const v = globalThis.document?.createElement('video');
      preferWebm = v ? !v.canPlayType('video/mp4; codecs="avc1.4D401E"') : false;
    } catch {
      preferWebm = false;
    }
  }
  return !preferWebm;
}

/** URL de un video de muestra (MP4 si el navegador reproduce H.264; si no, WebM).
 *  En la vista previa de un solo archivo los videos vienen embebidos. */
export function demoVideoUrl(name) {
  const ext = supportsH264() ? 'mp4' : 'webm';
  const embedded = globalThis.__ENTRECLASES_DEMO_VIDEOS__;
  if (embedded && embedded[`${name}.${ext}`]) return embedded[`${name}.${ext}`];
  return `demo/${name}.${ext}`;
}
