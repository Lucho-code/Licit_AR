// Lecciones diarias a partir del paquete publicado por el/la docente.
// Regla del piloto: una lección nueva por día (el repaso siempre está disponible).
import { learnedIds } from './srs.js';

/** Señas y frases con al menos un video, de una lección, en orden. */
export function playableItems(pack) {
  return (pack?.items || []).filter((it) => it.media && it.media.length > 0);
}

export function lessonItems(pack, n) {
  return playableItems(pack)
    .filter((it) => it.lesson === n)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function lessonNumbers(pack) {
  return [...new Set(playableItems(pack).map((it) => it.lesson))].sort((a, b) => a - b);
}

export function lessonTitle(pack, n) {
  const found = (pack?.lessons || []).find((l) => l.n === n);
  return found && found.title ? found.title : `Lección ${n}`;
}

/** Avance por lección: una lección está completa cuando todas sus señas tienen tarjeta de repaso. */
export function lessonsProgress(pack, srs) {
  const learned = learnedIds(srs);
  return lessonNumbers(pack).map((n) => {
    const items = lessonItems(pack, n);
    const done = items.filter((it) => learned.has(it.id)).length;
    return { n, title: lessonTitle(pack, n), total: items.length, learned: done, complete: done === items.length };
  });
}

/**
 * Qué puede hacer hoy el alumno.
 * state: 'empty' (no hay nada publicado) | 'ready' | 'wait-tomorrow' | 'all-done'
 */
export function todayStatus(pack, participant, todayKey) {
  const progress = lessonsProgress(pack, participant?.srs);
  const total = progress.length;
  const completedCount = progress.filter((p) => p.complete).length;
  if (total === 0) return { state: 'empty', next: null, total, completedCount, progress };
  const next = progress.find((p) => !p.complete);
  if (!next) return { state: 'all-done', next: null, total, completedCount, progress };
  if (participant?.lastLessonDate === todayKey) {
    return { state: 'wait-tomorrow', next, total, completedCount, progress };
  }
  return { state: 'ready', next, total, completedCount, progress };
}

/** Lo que se aprende en la sesión: solo lo que todavía no tiene tarjeta. */
export function newItemsForLesson(pack, n, srs) {
  const learned = learnedIds(srs);
  return lessonItems(pack, n).filter((it) => !learned.has(it.id));
}

/** Distractores: todo lo publicado hasta esta lección. */
export function poolUpTo(pack, n) {
  return playableItems(pack).filter((it) => it.lesson <= n);
}
