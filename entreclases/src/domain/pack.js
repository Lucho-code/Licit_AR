// Paquete publicado: la "foto" del contenido que ven los alumnos.
// Separar borrador (lo que edita el/la docente) de paquete (lo que se publica) permite
// corregir sin romper la práctica de nadie, y versionar cada publicación.
import { glossFrom } from './ids.js';

export const STATUS = Object.freeze({ PENDING: 'pendiente', RECORDED: 'grabada', VALIDATED: 'validada' });

export function itemStatus(item, mediaForItem) {
  if (!mediaForItem || mediaForItem.length === 0) return STATUS.PENDING;
  return item.validatedBy ? STATUS.VALIDATED : STATUS.RECORDED;
}

/** Ítems que entrarían en la próxima publicación. */
export function publishableItems(items, media, { onlyValidated = true } = {}) {
  const byItem = groupMedia(media);
  return items.filter((it) => {
    const m = byItem.get(it.id) || [];
    if (m.length === 0) return false;
    return onlyValidated ? !!it.validatedBy : true;
  });
}

export function groupMedia(media) {
  const map = new Map();
  for (const m of media) {
    if (!map.has(m.itemId)) map.set(m.itemId, []);
    map.get(m.itemId).push(m);
  }
  return map;
}

export function buildPack({ course, items, media, signers, version, onlyValidated = true, now = Date.now() }) {
  const byItem = groupMedia(media);
  const signerName = new Map((signers || []).map((s) => [s.id, s.name]));
  const packItems = publishableItems(items, media, { onlyValidated })
    .map((it) => {
      const takes = (byItem.get(it.id) || []).slice().sort((a, b) => {
        if (a.id === it.primaryMediaId) return -1;
        if (b.id === it.primaryMediaId) return 1;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
      return {
        id: it.id,
        kind: it.kind,
        meanings: (it.meanings || []).filter(Boolean),
        gloss: it.gloss || glossFrom(it.meanings?.[0]),
        lesson: Number(it.lesson) || 1,
        order: Number(it.order) || 0,
        notes: it.notes || '',
        region: it.region || course.region || '',
        media: takes.map((m) => ({ id: m.id, src: m.src, signer: signerName.get(m.signerId) || '', angle: m.angle || 'frente' })),
      };
    })
    .sort((a, b) => a.lesson - b.lesson || a.order - b.order);
  return {
    version,
    publishedAt: now,
    signLanguage: course.signLanguage || 'lsa',
    lessons: (course.lessonTitles || []).map((l) => ({ n: l.n, title: l.title || '' })),
    items: packItems,
  };
}
