// Reglas de seguridad de Firestore y Storage contra los emuladores.
//   npm run test:firebase   (levanta los emuladores y corre estas pruebas)
import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getBytes, ref, uploadBytes } from 'firebase/storage';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let env;

const OWNER = { uid: 'owner', email: 'ana@example.com' };
const STAFF = { uid: 'staff', email: 'interprete@example.com' };
const STRANGER = { uid: 'stranger', email: 'otro@example.com' };

const googleCtx = (u) => env.authenticatedContext(u.uid, { email: u.email, email_verified: true });
const studentCtx = (uid = 'alumno1') => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } });

const course = (over = {}) => ({
  name: 'LSA 1',
  code: 'ABC234',
  region: 'Litoral',
  classWeekday: 3,
  lessonsCount: 10,
  lessonTitles: [],
  signLanguage: 'lsa',
  publishedVersion: 0,
  ownerUid: OWNER.uid,
  createdAt: 1,
  pilot: {},
  ...over,
});

const participant = (uid, over = {}) => ({
  uid,
  alias: 'Lucía',
  joinedAt: 1,
  joinedDate: '2026-10-07',
  srs: {},
  lastLessonDate: null,
  practiceDates: [],
  lastActiveAt: 1,
  ...over,
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-entreclases',
    firestore: { rules: readFileSync(path.join(root, 'firebase/firestore.rules'), 'utf8'), host: '127.0.0.1', port: 8080 },
    storage: { rules: readFileSync(path.join(root, 'firebase/storage.rules'), 'utf8'), host: '127.0.0.1', port: 9199 },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
});

/** Curso con dueña, intérprete en el equipo y un paquete publicado. */
async function seedCourse() {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'courses/c1'), course({ publishedVersion: 1 }));
    await setDoc(doc(db, 'courses/c1/staff', OWNER.email), { email: OWNER.email, role: 'owner', addedAt: 1 });
    await setDoc(doc(db, 'courses/c1/staff', STAFF.email), { email: STAFF.email, role: 'staff', addedAt: 1 });
    await setDoc(doc(db, 'codes/ABC234'), { courseId: 'c1', name: 'LSA 1' });
    await setDoc(doc(db, 'courses/c1/items/i1'), { id: 'i1', kind: 'sign', meanings: ['hola'] });
    await setDoc(doc(db, 'courses/c1/signers/s1'), { id: 's1', name: 'Ana', consent: { appUse: true } });
    await setDoc(doc(db, 'courses/c1/packs/1'), { version: 1, items: [] });
  });
}

test('crear un curso: solo con cuenta de Google y como dueño/a, en un mismo lote', async () => {
  const db = googleCtx(OWNER).firestore();
  const batch = writeBatch(db);
  batch.set(doc(db, 'courses/c9'), course({ code: 'XYZ789' }));
  batch.set(doc(db, 'courses/c9/staff', OWNER.email), { email: OWNER.email, role: 'owner', addedAt: 1 });
  batch.set(doc(db, 'codes/XYZ789'), { courseId: 'c9', name: 'LSA 1' });
  await assertSucceeds(batch.commit());

  // un alumno anónimo no puede crear cursos
  const anon = studentCtx().firestore();
  await assertFails(setDoc(doc(anon, 'courses/c10'), course({ code: 'QQQ222', ownerUid: 'alumno1' })));
  // nadie puede declararse dueño de un curso ajeno
  const intruder = googleCtx(STRANGER).firestore();
  await assertFails(setDoc(doc(intruder, 'courses/c9/staff', STRANGER.email), { email: STRANGER.email, role: 'owner', addedAt: 1 }));
  await assertFails(setDoc(doc(intruder, 'courses/c9/staff', STRANGER.email), { email: STRANGER.email, role: 'staff', addedAt: 1 }));
  // ni apropiarse de un código de otro curso
  await assertFails(setDoc(doc(intruder, 'codes/XYZ789'), { courseId: 'c9', name: 'otro' }));
});

test('equipo docente: lee y edita el contenido; un extraño no', async () => {
  await seedCourse();
  const staff = googleCtx(STAFF).firestore();
  await assertSucceeds(getDoc(doc(staff, 'courses/c1/items/i1')));
  await assertSucceeds(setDoc(doc(staff, 'courses/c1/items/i2'), { id: 'i2', kind: 'phrase', meanings: ['¿Cómo estás?'] }));
  await assertSucceeds(getDocs(collection(staff, 'courses/c1/signers')));
  await assertSucceeds(updateDoc(doc(staff, 'courses/c1'), { publishedVersion: 2 }));
  // no puede cambiar dueño ni código
  await assertFails(updateDoc(doc(staff, 'courses/c1'), { ownerUid: STAFF.uid }));
  await assertFails(updateDoc(doc(staff, 'courses/c1'), { code: 'ZZZ999' }));
  // no puede sacar a la dueña del equipo, sí sumar a otra persona
  await assertFails(deleteDoc(doc(staff, 'courses/c1/staff', OWNER.email)));
  await assertSucceeds(setDoc(doc(staff, 'courses/c1/staff', 'nueva@example.com'), { email: 'nueva@example.com', role: 'staff', addedAt: 1 }));

  const stranger = googleCtx(STRANGER).firestore();
  await assertFails(getDoc(doc(stranger, 'courses/c1/items/i1')));
  await assertFails(getDocs(collection(stranger, 'courses/c1/signers')));
  await assertFails(updateDoc(doc(stranger, 'courses/c1'), { name: 'hackeado' }));
});

test('"mis cursos": cada docente encuentra solo los suyos', async () => {
  await seedCourse();
  const staff = googleCtx(STAFF).firestore();
  const mine = await assertSucceeds(getDocs(query(collectionGroup(staff, 'staff'), where('email', '==', STAFF.email))));
  assert.equal(mine.size, 1);
  await assertFails(getDocs(query(collectionGroup(staff, 'staff'), where('email', '==', OWNER.email))));
});

test('alumnos: entran con el código, ven lo publicado y escriben solo lo suyo', async () => {
  await seedCourse();
  const db = studentCtx('alumno1').firestore();
  await assertSucceeds(getDoc(doc(db, 'codes/ABC234')));
  await assertFails(getDocs(collection(db, 'codes')));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'codes/ABC234')));
  await assertSucceeds(getDoc(doc(db, 'courses/c1')));
  await assertFails(getDocs(collection(db, 'courses')));

  // antes de sumarse no ve el paquete
  await assertFails(getDoc(doc(db, 'courses/c1/packs/1')));
  await assertFails(setDoc(doc(db, 'courses/c1/participants/otro'), participant('otro')));
  await assertFails(setDoc(doc(db, 'courses/c1/participants/alumno1'), { ...participant('alumno1'), admin: true }));
  await assertFails(setDoc(doc(db, 'courses/c1/participants/alumno1'), participant('alumno1', { alias: 'L' })));
  await assertSucceeds(setDoc(doc(db, 'courses/c1/participants/alumno1'), participant('alumno1')));
  await assertSucceeds(getDoc(doc(db, 'courses/c1/packs/1')));

  // contenido de trabajo del equipo: nunca
  await assertFails(getDoc(doc(db, 'courses/c1/items/i1')));
  await assertFails(getDocs(collection(db, 'courses/c1/signers')));
  await assertFails(setDoc(doc(db, 'courses/c1/packs/2'), { version: 2, items: [] }));

  // su avance sí; su fecha de ingreso no
  await assertSucceeds(updateDoc(doc(db, 'courses/c1/participants/alumno1'), { srs: { i1: { box: 1 } }, practiceDates: ['2026-10-07'] }));
  await assertFails(updateDoc(doc(db, 'courses/c1/participants/alumno1'), { joinedDate: '2026-01-01' }));
  await assertFails(getDocs(collection(db, 'courses/c1/participants')));

  // eventos: con hora del servidor y a su nombre; no los puede leer
  await assertSucceeds(addDoc(collection(db, 'courses/c1/events'), { uid: 'alumno1', at: serverTimestamp(), events: [{ t: 'learn', d: '2026-10-07' }] }));
  await assertFails(addDoc(collection(db, 'courses/c1/events'), { uid: 'otro', at: serverTimestamp(), events: [] }));
  await assertFails(addDoc(collection(db, 'courses/c1/events'), { uid: 'alumno1', at: 123, events: [] }));
  await assertFails(getDocs(collection(db, 'courses/c1/events')));

  // otro alumno no ve el avance ajeno
  const other = studentCtx('alumno2').firestore();
  await assertFails(getDoc(doc(other, 'courses/c1/participants/alumno1')));

  // el equipo sí ve participantes y eventos (panel)
  const staff = googleCtx(STAFF).firestore();
  await assertSucceeds(getDocs(collection(staff, 'courses/c1/participants')));
  await assertSucceeds(getDocs(collection(staff, 'courses/c1/events')));
});

test('videos: sube solo el equipo, solo video y menos de 20 MB; los ve quien tiene sesión', async () => {
  await seedCourse();
  const bytes = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 1, 2, 3]);
  const staff = googleCtx(STAFF).storage();
  await assertSucceeds(uploadBytes(ref(staff, 'courses/c1/media/m1.webm'), bytes, { contentType: 'video/webm' }));
  await assertFails(uploadBytes(ref(staff, 'courses/c1/media/m2.png'), bytes, { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(studentCtx().storage(), 'courses/c1/media/m3.webm'), bytes, { contentType: 'video/webm' }));
  await assertFails(uploadBytes(ref(googleCtx(STRANGER).storage(), 'courses/c1/media/m4.webm'), bytes, { contentType: 'video/webm' }));
  await assertSucceeds(getBytes(ref(studentCtx().storage(), 'courses/c1/media/m1.webm')));
  await assertFails(getBytes(ref(env.unauthenticatedContext().storage(), 'courses/c1/media/m1.webm')));
});
