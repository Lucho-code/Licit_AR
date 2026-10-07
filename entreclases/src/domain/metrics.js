// Métricas del piloto de 2 semanas y veredicto contra los criterios acordados de antemano.
// Los umbrales por defecto son orientativos: se ajustan desde el panel antes de arrancar.
import { addDays, diffDays, weekdayOf } from './dates.js';

export const DEFAULT_THRESHOLDS = Object.freeze({
  windowDays: 10, // duración de la cohorte, desde que cada alumno se suma
  minActiveDays: 7, // días con práctica para contar como "completó"
  confirmShare: 0.5, // proporción que debe completar para confirmar
  reachLesson: 5, // lección que hay que alcanzar…
  refuteShare: 0.25, // …si menos de esta proporción llega, se refuta
  preClassShare: 0.4, // si más de esta proporción de días activos cae el día antes de la clase: no hay hábito
});

const ACTIVITY = new Set(['learn', 'mirror', 'self', 'answer', 'lesson_done', 'review_done']);

export function participantStats(participant, events, thresholds, todayKey) {
  const thr = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const own = events.filter((e) => e.uid === participant.uid);
  const start = participant.joinedDate;
  const end = addDays(start, thr.windowDays - 1);
  const activeDates = [...new Set(own.filter((e) => ACTIVITY.has(e.t)).map((e) => e.d))].sort();
  const inWindow = activeDates.filter((d) => d >= start && d <= end);
  const answers = own.filter((e) => e.t === 'answer');
  const correct = answers.filter((e) => e.ok).length;
  const lessonsDone = new Set(own.filter((e) => e.t === 'lesson_done').map((e) => e.l)).size;
  const lastAt = own.reduce((m, e) => Math.max(m, e.at || 0), 0) || null;
  return {
    uid: participant.uid,
    alias: participant.alias,
    joinedDate: start,
    windowEnd: end,
    windowEnded: todayKey > end,
    activeDates,
    activeInWindow: inWindow.length,
    dayIndexes: new Set(inWindow.map((d) => diffDays(start, d) + 1)),
    lessonsDone,
    answers: answers.length,
    accuracy: answers.length ? correct / answers.length : null,
    lastAt,
    completed: inWindow.length >= thr.minActiveDays,
    reachedLesson: lessonsDone >= thr.reachLesson,
  };
}

function median(values) {
  if (!values.length) return null;
  const s = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * @param {{participants: Array<{uid, alias, joinedDate}>, events: Array, classWeekday: number|null,
 *          thresholds?: object, paymentSignal?: boolean, todayKey: string}} input
 */
export function cohortMetrics({ participants, events, classWeekday = null, thresholds, paymentSignal = false, todayKey }) {
  const thr = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const stats = participants.map((p) => participantStats(p, events, thr, todayKey));
  const n = stats.length;

  // Retención por día de cohorte: de quienes ya llegaron al día d, cuántos practicaron ese día.
  const retention = [];
  for (let d = 1; d <= thr.windowDays; d++) {
    const eligible = stats.filter((s) => addDays(s.joinedDate, d - 1) <= todayKey);
    const active = eligible.filter((s) => s.dayIndexes.has(d));
    retention.push({ day: d, eligible: eligible.length, active: active.length, share: eligible.length ? active.length / eligible.length : null });
  }

  // ¿La práctica se concentra el día anterior a la clase?
  let preClass = null;
  if (classWeekday !== null && classWeekday !== undefined && classWeekday !== '') {
    const before = (Number(classWeekday) + 6) % 7;
    const all = stats.flatMap((s) => s.activeDates.filter((d) => d >= s.joinedDate && d <= s.windowEnd));
    const hits = all.filter((d) => weekdayOf(d) === before).length;
    preClass = all.length ? { weekday: before, share: hits / all.length, days: all.length } : null;
  }

  // Minutos por día de práctica (de la primera a la última acción del día, tope 60).
  const byDay = new Map();
  for (const e of events) {
    if (!ACTIVITY.has(e.t) || !e.at) continue;
    const key = `${e.uid}|${e.d}`;
    const cur = byDay.get(key) || [e.at, e.at];
    byDay.set(key, [Math.min(cur[0], e.at), Math.max(cur[1], e.at)]);
  }
  const minutes = [...byDay.values()].map(([a, b]) => Math.min(60, (b - a) / 60000));

  const ended = stats.filter((s) => s.windowEnded);
  const base = ended.length ? ended : stats;
  const share = (list, pred) => (list.length ? list.filter(pred).length / list.length : null);
  const answered = stats.filter((s) => s.accuracy !== null);

  const summary = {
    n,
    ended: ended.length,
    completionShare: share(base, (s) => s.completed),
    reachShare: share(base, (s) => s.reachedLesson),
    avgActiveDays: n ? stats.reduce((a, s) => a + s.activeInWindow, 0) / n : null,
    avgAccuracy: answered.length ? answered.reduce((a, s) => a + s.accuracy, 0) / answered.length : null,
    medianMinutes: median(minutes),
    retention,
    preClass,
  };
  return { thresholds: thr, stats, summary, verdict: verdict(summary, thr, paymentSignal) };
}

export function verdict(summary, thr, paymentSignal) {
  const preClassFlag = !!(summary.preClass && summary.preClass.share >= thr.preClassShare);
  if (summary.n === 0) {
    return { code: 'sin-datos', title: 'Todavía no hay alumnos', detail: 'Compartí el código del curso para empezar la cohorte.', preClassFlag };
  }
  if (summary.ended < Math.ceil(summary.n * 0.8)) {
    return {
      code: 'en-curso',
      title: 'Piloto en curso',
      detail: `${summary.ended} de ${summary.n} alumnos terminaron su ventana de ${thr.windowDays} días. Los valores son parciales.`,
      preClassFlag,
    };
  }
  if (summary.reachShare !== null && summary.reachShare < thr.refuteShare) {
    return {
      code: 'refuta',
      title: 'La hipótesis no se sostiene',
      detail: `Menos del ${pct(thr.refuteShare)} llegó a la lección ${thr.reachLesson}. Con material diario hecho por su docente, el grupo no sostuvo la práctica.`,
      preClassFlag,
    };
  }
  if (summary.completionShare !== null && summary.completionShare >= thr.confirmShare) {
    if (preClassFlag) {
      return {
        code: 'no-concluyente',
        title: 'Hay uso, pero no hábito',
        detail: 'Se alcanzó el umbral de días, pero la práctica se concentra el día anterior a la clase.',
        preClassFlag,
      };
    }
    return paymentSignal
      ? { code: 'confirma', title: 'La hipótesis se confirma', detail: 'El grupo practicó entre clases y hay señal de pago.', preClassFlag }
      : {
          code: 'confirma-uso',
          title: 'El uso se confirma; falta la señal de pago',
          detail: 'El grupo practicó entre clases. Falta que la institución acepte un piloto pago o que haya pre-compras.',
          preClassFlag,
        };
  }
  return {
    code: 'no-concluyente',
    title: 'Resultado no concluyente',
    detail: 'Quedó entre los dos umbrales. Revisá las entrevistas antes de decidir.',
    preClassFlag,
  };
}

export function pct(x, digits = 0) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  return `${(x * 100).toFixed(digits).replace('.', ',')}\u00a0%`;
}
