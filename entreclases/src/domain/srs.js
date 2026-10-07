// Repaso espaciado tipo Leitner.
// Cada seña vive en una "caja"; un acierto la pasa a la caja siguiente, con un intervalo más largo.
// Es deliberadamente simple para el piloto: el registro de eventos permite cambiar luego a FSRS
// sin perder historia.
import { addDays } from './dates.js';

/** Días de espera por caja. La caja 0 es "nueva": se ve el mismo día. */
export const INTERVALS = [0, 1, 2, 4, 7, 14, 30];

export const GRADE = Object.freeze({ AGAIN: 'again', HARD: 'hard', GOOD: 'good' });

export function newCard(todayKey) {
  return { box: 0, due: todayKey, reps: 0, lapses: 0, last: null };
}

/** Aplica una calificación y devuelve la tarjeta nueva (no muta la anterior). */
export function schedule(card, grade, todayKey) {
  const c = card ? { ...card } : newCard(todayKey);
  c.reps += 1;
  c.last = todayKey;
  if (grade === GRADE.AGAIN) {
    c.box = 1;
    c.lapses += 1;
  } else if (grade === GRADE.HARD) {
    c.box = Math.max(1, c.box);
  } else {
    c.box = Math.min(c.box + 1, INTERVALS.length - 1);
  }
  c.due = addDays(todayKey, Math.max(1, INTERVALS[c.box]));
  return c;
}

/** Una seña puede recibir varias notas en una sesión: manda la peor. */
export function combineGrades(grades) {
  if (!grades || grades.length === 0) return null;
  if (grades.includes(GRADE.AGAIN)) return GRADE.AGAIN;
  if (grades.includes(GRADE.HARD)) return GRADE.HARD;
  return GRADE.GOOD;
}

export function isDue(card, todayKey) {
  return !!card && card.due <= todayKey;
}

/** IDs de señas para repasar hoy, primero las más atrasadas y las de cajas bajas. */
export function dueIds(srs, todayKey, validIds) {
  return Object.entries(srs || {})
    .filter(([id, card]) => (!validIds || validIds.has(id)) && card.reps > 0 && isDue(card, todayKey))
    .sort(([, a], [, b]) => (a.due === b.due ? a.box - b.box : a.due < b.due ? -1 : 1))
    .map(([id]) => id);
}

export function learnedIds(srs) {
  return new Set(Object.entries(srs || {}).filter(([, c]) => c.reps > 0).map(([id]) => id));
}
