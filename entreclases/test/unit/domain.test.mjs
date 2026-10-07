import { test } from 'node:test';
import assert from 'node:assert/strict';

import { addDays, diffDays, localDateKey, weekdayOf, weekStart } from '../../src/domain/dates.js';
import { glossFrom, isValidCode, newCourseCode, normalizeCode, newId } from '../../src/domain/ids.js';
import { GRADE, combineGrades, dueIds, newCard, schedule, learnedIds } from '../../src/domain/srs.js';
import { isCorrect, makeQuestion, mulberry32, recognizeQuestions, reviewQuestions } from '../../src/domain/quiz.js';
import { lessonNumbers, lessonsProgress, newItemsForLesson, playableItems, todayStatus } from '../../src/domain/lessons.js';
import { cohortMetrics, participantStats, pct } from '../../src/domain/metrics.js';
import { decimal, toCSV } from '../../src/domain/csv.js';
import { DRAFT_PLAN, draftItems } from '../../src/domain/plan.js';

// ---------- fechas ----------
test('fechas: claves locales y aritmética de días', () => {
  assert.match(localDateKey(new Date(2026, 9, 7, 23, 59)), /^2026-10-07$/);
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(diffDays('2026-10-01', '2026-10-11'), 10);
  assert.equal(diffDays('2026-10-11', '2026-10-01'), -10);
  assert.equal(weekdayOf('2026-10-07'), 3); // miércoles
  assert.equal(weekStart('2026-10-07'), '2026-10-05');
  assert.equal(weekStart('2026-10-11'), '2026-10-05'); // domingo → lunes anterior
});

// ---------- ids ----------
test('ids: códigos de curso legibles', () => {
  for (let i = 0; i < 200; i++) assert.ok(isValidCode(newCourseCode()));
  assert.equal(normalizeCode('  k7p-2qx '), 'K7P2QX');
  assert.equal(isValidCode('K7P2QX'), true);
  assert.equal(isValidCode('O0I1L5'), false);
  assert.equal(isValidCode('ABC'), false);
  assert.match(newId('it'), /^it_[0-9a-z]{12}$/);
  assert.equal(glossFrom('¿Cómo estás?'), 'CÓMO-ESTÁS');
  assert.equal(glossFrom('hermano / hermana'), 'HERMANO');
});

// ---------- repaso espaciado ----------
test('srs: los aciertos alargan el intervalo y los errores lo reinician', () => {
  const today = '2026-10-07';
  let c = newCard(today);
  assert.equal(c.due, today);
  c = schedule(c, GRADE.GOOD, today);
  assert.deepEqual([c.box, c.due], [1, '2026-10-08']);
  c = schedule(c, GRADE.GOOD, '2026-10-08');
  assert.deepEqual([c.box, c.due], [2, '2026-10-10']);
  c = schedule(c, GRADE.GOOD, '2026-10-10');
  assert.deepEqual([c.box, c.due], [3, '2026-10-14']);
  c = schedule(c, GRADE.HARD, '2026-10-14');
  assert.deepEqual([c.box, c.due], [3, '2026-10-18']);
  c = schedule(c, GRADE.AGAIN, '2026-10-18');
  assert.deepEqual([c.box, c.due, c.lapses], [1, '2026-10-19', 1]);
  // la caja máxima no se pasa
  for (let i = 0; i < 20; i++) c = schedule(c, GRADE.GOOD, '2026-10-19');
  assert.equal(c.box, 6);
});

test('srs: manda la peor nota de la sesión y el orden de repaso', () => {
  assert.equal(combineGrades([GRADE.GOOD, GRADE.HARD]), GRADE.HARD);
  assert.equal(combineGrades([GRADE.GOOD, GRADE.AGAIN, GRADE.HARD]), GRADE.AGAIN);
  assert.equal(combineGrades([GRADE.GOOD]), GRADE.GOOD);
  assert.equal(combineGrades([]), null);
  const srs = {
    a: { box: 2, due: '2026-10-05', reps: 2 },
    b: { box: 1, due: '2026-10-07', reps: 1 },
    c: { box: 3, due: '2026-10-09', reps: 3 },
    d: { box: 0, due: '2026-10-01', reps: 0 }, // nunca se vio: no cuenta
    e: { box: 1, due: '2026-10-05', reps: 1 },
  };
  assert.deepEqual(dueIds(srs, '2026-10-07'), ['e', 'a', 'b']);
  assert.deepEqual(dueIds(srs, '2026-10-07', new Set(['a', 'b'])), ['a', 'b']);
  assert.deepEqual([...learnedIds(srs)].sort(), ['a', 'b', 'c', 'e']);
});

// ---------- ejercicios ----------
const media = [{ id: 'm', src: 'x' }];
const item = (id, kind, meaning, lesson = 1, order = 1) => ({ id, kind, meanings: [meaning], lesson, order, media });
const pool = [
  item('s1', 'sign', 'hola'),
  item('s2', 'sign', 'chau'),
  item('s3', 'sign', 'gracias'),
  item('s4', 'sign', 'por favor'),
  item('s5', 'sign', 'perdón'),
  item('p1', 'phrase', '¿Cómo estás?'),
  item('p2', 'phrase', 'Bien, ¿y vos?'),
];

test('quiz: opciones únicas que incluyen la respuesta', () => {
  const rng = mulberry32(1);
  const q = makeQuestion('video-to-text', pool[0], pool, rng);
  assert.equal(q.options.length, 4);
  assert.ok(q.options.some((o) => o.id === 's1'));
  assert.equal(new Set(q.options.map((o) => o.label)).size, 4);
  assert.ok(isCorrect(q, 's1'));
  assert.ok(!isCorrect(q, q.options.find((o) => o.id !== 's1').id));
  const v = makeQuestion('text-to-video', pool[0], pool, rng);
  assert.equal(v.options.length, 3);
  assert.ok(v.options.every((o) => o.id.startsWith('s')), 'las opciones de video son del mismo tipo');
});

test('quiz: sin distractores no hay pregunta; con pocas frases se completa con señas', () => {
  assert.equal(makeQuestion('video-to-text', pool[0], [pool[0]], mulberry32(2)), null);
  const q = makeQuestion('video-to-text', pool[5], pool, mulberry32(3));
  assert.equal(q.options.length, 4);
  assert.ok(q.options.some((o) => o.id === 'p2'));
  // un ítem sin video no se usa como distractor
  const noVideo = { ...pool[1], media: [] };
  const q2 = makeQuestion('video-to-text', pool[0], [pool[0], noVideo], mulberry32(4));
  assert.equal(q2, null);
});

test('quiz: la fijación alterna sentidos y es determinista con semilla', () => {
  const qs1 = recognizeQuestions(pool, pool, mulberry32(7));
  const qs2 = recognizeQuestions(pool, pool, mulberry32(7));
  assert.deepEqual(qs1, qs2);
  assert.equal(qs1.length, pool.length);
  const types = qs1.filter((q) => q.kind === 'sign').map((q) => q.type);
  assert.ok(types.includes('video-to-text') && types.includes('text-to-video'));
  assert.ok(qs1.filter((q) => q.kind === 'phrase').every((q) => q.type === 'video-to-text'));
  assert.equal(reviewQuestions(pool, pool, mulberry32(8), 3).length, 3);
});

// ---------- lecciones ----------
test('lecciones: estados del día y lecciones reabiertas', () => {
  const pack = {
    items: [
      item('a', 'sign', 'uno', 1, 1),
      item('b', 'sign', 'dos', 1, 2),
      item('c', 'sign', 'tres', 2, 1),
      { ...item('d', 'sign', 'cuatro', 3, 1), media: [] }, // sin video: no se publica
    ],
  };
  const today = '2026-10-07';
  assert.equal(playableItems(pack).length, 3);
  assert.deepEqual(lessonNumbers(pack), [1, 2]);
  assert.equal(todayStatus({ items: [] }, {}, today).state, 'empty');
  let st = todayStatus(pack, { srs: {} }, today);
  assert.equal(st.state, 'ready');
  assert.equal(st.next.n, 1);
  const srs = { a: { box: 1, due: '2026-10-08', reps: 1 }, b: { box: 1, due: '2026-10-08', reps: 1 } };
  st = todayStatus(pack, { srs, lastLessonDate: today }, today);
  assert.equal(st.state, 'wait-tomorrow');
  assert.equal(st.next.n, 2);
  st = todayStatus(pack, { srs, lastLessonDate: '2026-10-06' }, today);
  assert.equal(st.state, 'ready');
  const all = { ...srs, c: { box: 1, due: '2026-10-08', reps: 1 } };
  assert.equal(todayStatus(pack, { srs: all }, today).state, 'all-done');
  // la docente agrega una seña a la lección 1 ya completa: la lección se reabre solo con lo nuevo
  pack.items.push(item('e', 'sign', 'cinco', 1, 3));
  assert.equal(lessonsProgress(pack, all)[0].complete, false);
  assert.deepEqual(newItemsForLesson(pack, 1, all).map((i) => i.id), ['e']);
});

// ---------- métricas ----------
function ev(uid, d, t = 'answer', extra = {}) {
  return { uid, d, t, at: Date.parse(`${d}T20:00:00Z`), ok: true, ...extra };
}
function days(uid, start, count, step = 1) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(ev(uid, addDays(start, i * step)));
  return out;
}
function lessons(uid, d, count) {
  return Array.from({ length: count }, (_, i) => ev(uid, d, 'lesson_done', { l: i + 1 }));
}

test('métricas: confirma cuando la mitad completa y hay señal de pago', () => {
  const start = '2026-10-01';
  const participants = ['a', 'b', 'c', 'd'].map((uid) => ({ uid, alias: uid.toUpperCase(), joinedDate: start }));
  const events = [
    ...days('a', start, 8),
    ...lessons('a', start, 6),
    ...days('b', start, 7),
    ...lessons('b', start, 5),
    ...days('c', start, 2),
    ...lessons('c', start, 1),
  ];
  const base = { participants, events, todayKey: '2026-10-15', classWeekday: null };
  const r = cohortMetrics(base);
  assert.equal(r.summary.n, 4);
  assert.equal(r.summary.ended, 4);
  assert.equal(r.summary.completionShare, 0.5);
  assert.equal(r.summary.reachShare, 0.5);
  assert.equal(r.verdict.code, 'confirma-uso');
  assert.equal(cohortMetrics({ ...base, paymentSignal: true }).verdict.code, 'confirma');
  assert.equal(r.summary.retention[0].share, 0.75); // día 1: a, b, c
  assert.equal(r.summary.retention[7].share, 0.25); // día 8: solo a
});

test('métricas: refuta cuando casi nadie llega a la lección 5', () => {
  const start = '2026-10-01';
  const participants = ['a', 'b', 'c', 'd', 'e'].map((uid) => ({ uid, alias: uid, joinedDate: start }));
  const events = [...days('a', start, 9), ...lessons('a', start, 6), ...days('b', start, 3), ...lessons('b', start, 3)];
  const r = cohortMetrics({ participants, events, todayKey: '2026-10-20' });
  assert.equal(r.summary.reachShare, 0.2);
  assert.equal(r.verdict.code, 'refuta');
});

test('métricas: en curso mientras las ventanas no terminaron', () => {
  const participants = [{ uid: 'a', alias: 'a', joinedDate: '2026-10-05' }];
  const r = cohortMetrics({ participants, events: days('a', '2026-10-05', 2), todayKey: '2026-10-07' });
  assert.equal(r.verdict.code, 'en-curso');
  assert.equal(r.summary.retention[2].eligible, 1); // día 3 = hoy
  assert.equal(r.summary.retention[3].eligible, 0); // día 4 todavía no llegó
  assert.equal(cohortMetrics({ participants: [], events: [], todayKey: '2026-10-07' }).verdict.code, 'sin-datos');
});

test('métricas: detecta práctica concentrada el día antes de la clase', () => {
  // clase los jueves (4) → el día anterior es miércoles; 2026-10-07 y 2026-10-14 son miércoles
  const participants = [{ uid: 'a', alias: 'a', joinedDate: '2026-10-06' }];
  const events = [ev('a', '2026-10-07'), ev('a', '2026-10-14'), ev('a', '2026-10-09')];
  const r = cohortMetrics({ participants, events, classWeekday: 4, todayKey: '2026-10-30' });
  assert.equal(r.summary.preClass.weekday, 3);
  assert.equal(r.summary.preClass.share, 2 / 3);
  assert.equal(r.verdict.preClassFlag, true);
  const s = participantStats(participants[0], events, {}, '2026-10-30');
  assert.equal(s.activeInWindow, 3);
  assert.equal(s.accuracy, 1);
  assert.equal(pct(0.5), '50\u00a0%');
  assert.equal(pct(2 / 3, 1), '66,7\u00a0%');
});

// ---------- csv ----------
test('csv: separador punto y coma, BOM y escapes', () => {
  const csv = toCSV(
    [{ a: 'hola; chau', b: 'dijo "sí"', c: decimal(0.855 * 100) }],
    [
      { label: 'A', key: 'a' },
      { label: 'B', key: 'b' },
      { label: 'Aciertos %', key: 'c' },
    ],
  );
  assert.ok(csv.startsWith('﻿'));
  assert.equal(csv.slice(1), 'A;B;Aciertos %\r\n"hola; chau";"dijo ""sí""";85,5');
});

// ---------- plan borrador ----------
test('plan: 10 lecciones, 50 señas y 20 frases sin posiciones repetidas', () => {
  const items = draftItems();
  assert.equal(DRAFT_PLAN.length, 10);
  assert.equal(items.filter((i) => i.kind === 'sign').length, 50);
  assert.equal(items.filter((i) => i.kind === 'phrase').length, 20);
  assert.equal(new Set(items.map((i) => `${i.lesson}-${i.order}`)).size, items.length);
});
