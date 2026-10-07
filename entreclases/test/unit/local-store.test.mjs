import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LocalStore } from '../../src/data/local-store.js';
import { buildPack, itemStatus, STATUS } from '../../src/domain/pack.js';
import { todayStatus } from '../../src/domain/lessons.js';
import { cohortMetrics } from '../../src/domain/metrics.js';
import { localDateKey } from '../../src/domain/dates.js';

test('pack: solo publica lo grabado (y validado), con la toma principal primero', () => {
  const course = { region: 'Litoral', lessonTitles: [{ n: 1, title: 'Saludos' }] };
  const items = [
    { id: 'a', kind: 'sign', meanings: ['hola'], lesson: 1, order: 2, validatedBy: 'Ana', primaryMediaId: 'm2' },
    { id: 'b', kind: 'sign', meanings: ['chau'], lesson: 1, order: 1, validatedBy: null },
    { id: 'c', kind: 'sign', meanings: ['gracias'], lesson: 1, order: 3, validatedBy: 'Ana' },
  ];
  const media = [
    { id: 'm1', itemId: 'a', src: 'x1', signerId: 's1', createdAt: 1 },
    { id: 'm2', itemId: 'a', src: 'x2', signerId: 's1', createdAt: 2 },
    { id: 'm3', itemId: 'b', src: 'x3', signerId: 's1', createdAt: 3 },
  ];
  const signers = [{ id: 's1', name: 'Ana' }];
  const pack = buildPack({ course, items, media, signers, version: 3, now: 10 });
  assert.equal(pack.version, 3);
  assert.deepEqual(pack.items.map((i) => i.id), ['a']);
  assert.deepEqual(pack.items[0].media.map((m) => m.id), ['m2', 'm1']);
  assert.equal(pack.items[0].media[0].signer, 'Ana');
  assert.equal(pack.items[0].region, 'Litoral');
  const all = buildPack({ course, items, media, signers, version: 4, onlyValidated: false });
  assert.deepEqual(all.items.map((i) => i.id), ['b', 'a']);
  assert.equal(itemStatus(items[2], []), STATUS.PENDING);
  assert.equal(itemStatus(items[1], [media[2]]), STATUS.RECORDED);
  assert.equal(itemStatus(items[0], [media[0]]), STATUS.VALIDATED);
});

test('store local: demo sembrado, alumno, publicación y cohorte simulada', async () => {
  const store = new LocalStore();
  await store.init();
  assert.equal(store.mode, 'demo');
  assert.equal(store.persistent, false); // en Node no hay IndexedDB: memoria

  const courses = await store.listMyCourses();
  assert.equal(courses.length, 2);
  const [sample, draft] = courses;
  assert.equal(sample.code, 'PRUEBA');

  // curso de muestra publicado con 8 ítems
  const pack = await store.getPack(sample.id);
  assert.equal(pack.items.length, 8);
  assert.equal(pack.items[0].media[0].src, 'demo:circulo');
  assert.equal(await store.mediaSrc(pack.items[0].media[0]), 'demo/circulo.mp4'); // en Node no hay <video>: se asume H.264

  // borrador: 70 ítems pendientes y nada publicado
  const draftItems = await store.listItems(draft.id);
  assert.equal(draftItems.length, 70);
  assert.equal(await store.getPack(draft.id), null);
  await assert.rejects(() => store.publish(draft.id), /No hay señas listas/);

  // alumno se suma con el código
  const found = await store.findCourseByCode('PRUEBA');
  assert.equal(found.courseId, sample.id);
  const p = await store.joinCourse(sample.id, 'Lucía');
  assert.equal(p.alias, 'Lucía');
  assert.equal(todayStatus(pack, p, localDateKey()).state, 'ready');
  await store.updateParticipant(sample.id, { lastLessonDate: localDateKey() });
  assert.equal((await store.getParticipant(sample.id)).lastLessonDate, localDateKey());
  const evs = await store.listEvents(sample.id);
  assert.equal(evs.filter((e) => e.t === 'join').length, 1);

  // la docente graba una toma, valida y publica
  const target = draftItems[0];
  const signer = await store.saveSigner(draft.id, { name: 'Ana', consent: { signedAt: '2026-10-07' } });
  const media = await store.addMedia(draft.id, { itemId: target.id, blob: new Blob(['x'], { type: 'video/webm' }), signerId: signer.id, angle: 'frente' });
  assert.equal((await store.listItems(draft.id)).find((i) => i.id === target.id).primaryMediaId, media.id);
  await assert.rejects(() => store.publish(draft.id), /No hay señas listas/); // falta validar
  await store.saveItem(draft.id, { id: target.id, validatedBy: 'Ana', validatedAt: Date.now() });
  const res = await store.publish(draft.id);
  assert.deepEqual(res, { version: 1, count: 1 });
  const draftPack = await store.getPack(draft.id);
  assert.equal(draftPack.items[0].media[0].signer, 'Ana');
  assert.match(await store.mediaSrc(draftPack.items[0].media[0]), /^blob:/);

  // borrar la única toma deja el ítem sin validar
  await store.deleteMedia(draft.id, media);
  const after = (await store.listItems(draft.id)).find((i) => i.id === target.id);
  assert.equal(after.primaryMediaId, null);
  assert.equal(after.validatedBy, null);

  // cohorte simulada: 40 alumnos y un veredicto calculable
  await store.simulate(draft.id);
  const parts = await store.listParticipants(draft.id);
  assert.equal(parts.filter((x) => x.simulated).length, 40);
  const metrics = cohortMetrics({ participants: parts, events: await store.listEvents(draft.id), classWeekday: 3, todayKey: localDateKey() });
  assert.equal(metrics.summary.n, 40);
  assert.ok(['confirma-uso', 'no-concluyente', 'refuta'].includes(metrics.verdict.code), metrics.verdict.code);
  await store.clearSimulation(draft.id);
  assert.equal((await store.listParticipants(draft.id)).length, 0);
});
