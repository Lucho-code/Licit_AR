// Modo piloto: datos compartidos entre docentes y alumnos con Firebase
// (Authentication + Firestore + Storage). Misma interfaz que LocalStore.
//   · Docentes: cuenta de Google. Alumnos: sin cuenta (sesión anónima del dispositivo).
//   · Las reglas de seguridad están en firebase/firestore.rules y firebase/storage.rules.
import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { connectStorageEmulator, deleteObject, getDownloadURL, getStorage, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { newCourseCode, newId } from '../domain/ids.js';
import { localDateKey } from '../domain/dates.js';
import { draftItems, draftLessonTitles } from '../domain/plan.js';
import { buildPack } from '../domain/pack.js';
import { StoreError, clampLessons, courseDoc, mergeItem, participantDoc, stripUndefined } from './model.js';

const MESSAGES = {
  'permission-denied': 'No tenés permiso para esto. Si sos docente, pedí que te sumen al equipo del curso.',
  unavailable: 'Sin conexión con el servidor. Lo que hiciste se guarda y se envía cuando vuelva la conexión.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permití ventanas emergentes para este sitio.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase (Authentication → Settings → Authorized domains).',
  'auth/operation-not-allowed': 'Falta habilitar el método de inicio de sesión en Firebase Authentication.',
  'auth/admin-restricted-operation': 'Falta habilitar el acceso anónimo en Firebase Authentication.',
  'storage/unauthorized': 'No tenés permiso para subir videos a este curso.',
  'storage/retry-limit-exceeded': 'La subida tardó demasiado. Revisá la conexión y probá de nuevo.',
};

function friendly(err) {
  if (err instanceof StoreError) return err;
  const code = err?.code || '';
  const e = new StoreError(code, MESSAGES[code] || err?.message || 'Algo salió mal con el servidor.');
  e.cause = err;
  return e;
}

async function guard(fn) {
  try {
    return await fn();
  } catch (err) {
    throw friendly(err);
  }
}

const withId = (snap) => (snap.exists() ? { id: snap.id, ...snap.data() } : null);

export class FirebaseStore {
  constructor(cfg) {
    this.mode = 'firebase';
    this.cfg = cfg;
    this.session = null;
    this.listeners = new Set();
  }

  async init() {
    this.app = initializeApp(this.cfg.firebase);
    this.auth = getAuth(this.app);
    let localCache;
    try {
      localCache = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
    } catch {
      localCache = undefined;
    }
    this.db = initializeFirestore(this.app, localCache ? { localCache } : {});
    this.storage = getStorage(this.app);
    if (this.cfg.useEmulators) {
      const host = this.cfg.emulatorHost || '127.0.0.1';
      connectAuthEmulator(this.auth, `http://${host}:9099`, { disableWarnings: true });
      connectFirestoreEmulator(this.db, host, 8080);
      connectStorageEmulator(this.storage, host, 9199);
    }
    await new Promise((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (user) => {
        unsub();
        this._setUser(user);
        resolve();
      });
    });
    onAuthStateChanged(this.auth, (user) => this._setUser(user));
  }

  // ---------- sesión ----------
  _setUser(user) {
    this.session = user
      ? { uid: user.uid, email: user.email ? user.email.toLowerCase() : null, name: user.displayName || user.email || '', isAnonymous: user.isAnonymous }
      : null;
    for (const cb of this.listeners) cb(this.session);
  }
  getSession() {
    return this.session;
  }
  onSessionChange(cb) {
    this.listeners.add(cb);
    cb(this.session);
    return () => this.listeners.delete(cb);
  }
  async signInStaff() {
    return guard(async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const current = this.auth.currentUser;
      if (current && current.isAnonymous) {
        // Si en este teléfono ya practicó como alumno, se vincula la cuenta y conserva su avance.
        try {
          const result = await linkWithPopup(current, provider);
          this._setUser(result.user);
          return this.session;
        } catch (err) {
          const reuse = ['auth/credential-already-in-use', 'auth/email-already-in-use', 'auth/provider-already-linked'];
          if (!reuse.includes(err?.code)) throw err;
        }
      }
      await signInWithPopup(this.auth, provider);
      return this.session;
    });
  }
  /** Solo con emuladores: inicia sesión de docente sin ventana de Google (para pruebas automáticas). */
  async signInTestStaff(email) {
    if (!this.cfg.useEmulators) throw new StoreError('forbidden', 'Solo disponible con emuladores.');
    const credential = GoogleAuthProvider.credential(JSON.stringify({ sub: `test-${email}`, email, email_verified: true }));
    await signInWithCredential(this.auth, credential);
    return this.session;
  }
  async signOut() {
    await signOut(this.auth);
  }
  async _ensureUser() {
    if (!this.auth.currentUser) await guard(() => signInAnonymously(this.auth));
    return this.auth.currentUser;
  }
  _staffEmail() {
    const u = this.auth.currentUser;
    if (!u || u.isAnonymous || !u.email) throw new StoreError('auth', 'Entrá con tu cuenta de Google para usar el estudio.');
    return u.email.toLowerCase();
  }

  // ---------- cursos ----------
  async createCourse({ name, region, classWeekday, lessonsCount = 10, withDraftPlan = false }) {
    return guard(async () => {
      const email = this._staffEmail();
      const uid = this.auth.currentUser.uid;
      const n = clampLessons(lessonsCount);
      let code = null;
      for (let i = 0; i < 8 && !code; i++) {
        const candidate = newCourseCode();
        if (!(await getDoc(doc(this.db, 'codes', candidate))).exists()) code = candidate;
      }
      if (!code) throw new StoreError('code', 'No pudimos generar un código. Probá de nuevo.');
      const id = newId('c');
      const course = courseDoc({ name, region, classWeekday, lessonsCount: n, lessonTitles: withDraftPlan ? draftLessonTitles(n) : undefined }, { code, ownerUid: uid });
      const batch = writeBatch(this.db);
      batch.set(doc(this.db, 'courses', id), course);
      batch.set(doc(this.db, 'courses', id, 'staff', email), { email, role: 'owner', addedAt: Date.now() });
      batch.set(doc(this.db, 'codes', code), { courseId: id, name: course.name });
      await batch.commit();
      if (withDraftPlan) {
        const items = writeBatch(this.db);
        for (const it of draftItems().filter((i) => i.lesson <= n)) {
          const itemId = newId('it');
          items.set(doc(this.db, 'courses', id, 'items', itemId), { ...mergeItem(null, it), id: itemId });
        }
        await items.commit();
      }
      return { id, ...course };
    });
  }

  async listMyCourses() {
    return guard(async () => {
      const u = this.auth.currentUser;
      if (!u || u.isAnonymous || !u.email) return [];
      const snap = await getDocs(query(collectionGroup(this.db, 'staff'), where('email', '==', u.email.toLowerCase())));
      const ids = [...new Set(snap.docs.map((d) => d.ref.parent.parent.id))];
      const courses = await Promise.all(ids.map((id) => this.getCourse(id)));
      return courses.filter(Boolean).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    });
  }

  async getCourse(courseId) {
    return guard(async () => {
      await this._ensureUser();
      return withId(await getDoc(doc(this.db, 'courses', courseId)));
    });
  }

  async updateCourse(courseId, patch) {
    return guard(async () => {
      const clean = stripUndefined(patch);
      await updateDoc(doc(this.db, 'courses', courseId), clean);
      if (clean.name) {
        const course = await this.getCourse(courseId);
        await updateDoc(doc(this.db, 'codes', course.code), { name: clean.name });
      }
      return this.getCourse(courseId);
    });
  }

  async listStaff(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'staff'));
      return snap.docs.map((d) => d.data()).sort((a, b) => (a.role === 'owner' ? -1 : b.role === 'owner' ? 1 : a.email.localeCompare(b.email)));
    });
  }

  async addStaff(courseId, email) {
    return guard(() => setDoc(doc(this.db, 'courses', courseId, 'staff', email.toLowerCase()), { email: email.toLowerCase(), role: 'staff', addedAt: Date.now() }));
  }

  async removeStaff(courseId, email) {
    return guard(() => deleteDoc(doc(this.db, 'courses', courseId, 'staff', email.toLowerCase())));
  }

  // ---------- contenido ----------
  async listItems(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'items'));
      return snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => a.lesson - b.lesson || a.order - b.order);
    });
  }

  async saveItem(courseId, item) {
    return guard(async () => {
      const id = item.id || newId('it');
      const ref = doc(this.db, 'courses', courseId, 'items', id);
      const prev = item.id ? (await getDoc(ref)).data() || null : null;
      const next = { ...mergeItem(prev, item), id };
      await setDoc(ref, next);
      return next;
    });
  }

  async deleteItem(courseId, itemId) {
    return guard(async () => {
      const media = (await this.listMedia(courseId)).filter((m) => m.itemId === itemId);
      for (const m of media) await this.deleteMedia(courseId, m, { keepItem: true });
      await deleteDoc(doc(this.db, 'courses', courseId, 'items', itemId));
    });
  }

  async listMedia(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'media'));
      return snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    });
  }

  async addMedia(courseId, { itemId, blob, signerId, angle, width, height, fps, durationMs, mimeType }, onProgress) {
    return guard(async () => {
      const id = newId('md');
      const type = mimeType || blob.type || 'video/mp4';
      const ext = type.includes('webm') ? 'webm' : type.includes('quicktime') ? 'mov' : 'mp4';
      const path = `courses/${courseId}/media/${id}.${ext}`;
      const task = uploadBytesResumable(storageRef(this.storage, path), blob, { contentType: type, cacheControl: 'public,max-age=31536000' });
      await new Promise((resolve, reject) => {
        task.on('state_changed', (s) => onProgress?.(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0), reject, resolve);
      });
      const url = await getDownloadURL(task.snapshot.ref);
      const media = {
        id,
        itemId,
        signerId: signerId || null,
        angle: angle || 'frente',
        src: url,
        storagePath: path,
        mimeType: type,
        width: width || null,
        height: height || null,
        fps: fps || null,
        durationMs: durationMs || null,
        sizeBytes: blob.size,
        createdAt: Date.now(),
      };
      await setDoc(doc(this.db, 'courses', courseId, 'media', id), media);
      const item = (await getDoc(doc(this.db, 'courses', courseId, 'items', itemId))).data();
      if (item && !item.primaryMediaId) await this.saveItem(courseId, { id: itemId, primaryMediaId: id });
      return media;
    });
  }

  async deleteMedia(courseId, media, { keepItem = false } = {}) {
    return guard(async () => {
      if (media.storagePath) {
        try {
          await deleteObject(storageRef(this.storage, media.storagePath));
        } catch (err) {
          if (err?.code !== 'storage/object-not-found') throw err;
        }
      }
      await deleteDoc(doc(this.db, 'courses', courseId, 'media', media.id));
      if (keepItem) return;
      const item = (await getDoc(doc(this.db, 'courses', courseId, 'items', media.itemId))).data();
      if (item && item.primaryMediaId === media.id) {
        const rest = (await this.listMedia(courseId)).filter((m) => m.itemId === media.itemId);
        await this.saveItem(courseId, { id: media.itemId, primaryMediaId: rest[0]?.id || null, validatedBy: rest.length ? item.validatedBy : null });
      }
    });
  }

  async listSigners(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'signers'));
      return snap.docs.map((d) => ({ ...d.data(), id: d.id })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    });
  }

  async saveSigner(courseId, signer) {
    return guard(async () => {
      const id = signer.id || newId('sg');
      const ref = doc(this.db, 'courses', courseId, 'signers', id);
      const prev = signer.id ? (await getDoc(ref)).data() || {} : {};
      const next = { createdAt: Date.now(), ...prev, ...stripUndefined(signer), id, updatedAt: Date.now() };
      await setDoc(ref, next);
      return next;
    });
  }

  async deleteSigner(courseId, signerId) {
    return guard(() => deleteDoc(doc(this.db, 'courses', courseId, 'signers', signerId)));
  }

  async publish(courseId, { onlyValidated = true } = {}) {
    return guard(async () => {
      const course = await this.getCourse(courseId);
      const [items, media, signers] = await Promise.all([this.listItems(courseId), this.listMedia(courseId), this.listSigners(courseId)]);
      const version = (course.publishedVersion || 0) + 1;
      const pack = buildPack({ course, items, media, signers, version, onlyValidated });
      if (pack.items.length === 0) throw new StoreError('empty', 'No hay señas listas para publicar.');
      await setDoc(doc(this.db, 'courses', courseId, 'packs', String(version)), pack);
      await updateDoc(doc(this.db, 'courses', courseId), { publishedVersion: version, publishedAt: pack.publishedAt });
      return { version, count: pack.items.length };
    });
  }

  async listPacks(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'packs'));
      return snap.docs
        .map((d) => d.data())
        .map((p) => ({ version: p.version, publishedAt: p.publishedAt, count: p.items.length }))
        .sort((a, b) => b.version - a.version);
    });
  }

  // ---------- alumnos ----------
  async findCourseByCode(code) {
    return guard(async () => {
      await this._ensureUser();
      const snap = await getDoc(doc(this.db, 'codes', code));
      return snap.exists() ? { courseId: snap.data().courseId, name: snap.data().name } : null;
    });
  }

  async joinCourse(courseId, alias) {
    return guard(async () => {
      const user = await this._ensureUser();
      const ref = doc(this.db, 'courses', courseId, 'participants', user.uid);
      const prev = await getDoc(ref);
      if (prev.exists()) {
        await updateDoc(ref, { alias });
        return { ...prev.data(), alias };
      }
      const today = localDateKey();
      const participant = participantDoc(user.uid, alias, today);
      await setDoc(ref, participant);
      await this.logEvents(courseId, [{ t: 'join', at: Date.now(), d: today }]);
      return participant;
    });
  }

  async getParticipant(courseId) {
    return guard(async () => {
      const user = this.auth.currentUser;
      if (!user) return null;
      const snap = await getDoc(doc(this.db, 'courses', courseId, 'participants', user.uid));
      return snap.exists() ? snap.data() : null;
    });
  }

  async updateParticipant(courseId, patch) {
    return guard(async () => {
      const user = await this._ensureUser();
      await updateDoc(doc(this.db, 'courses', courseId, 'participants', user.uid), stripUndefined(patch));
    });
  }

  async getPack(courseId) {
    return guard(async () => {
      const course = await this.getCourse(courseId);
      if (!course || !course.publishedVersion) return null;
      const snap = await getDoc(doc(this.db, 'courses', courseId, 'packs', String(course.publishedVersion)));
      return snap.exists() ? snap.data() : null;
    });
  }

  async logEvents(courseId, events) {
    const user = this.auth.currentUser;
    if (!user || !events.length) return;
    // Sin await al servidor: con la caché persistente, la escritura queda en cola si no hay conexión.
    const write = addDoc(collection(this.db, 'courses', courseId, 'events'), { uid: user.uid, at: serverTimestamp(), events });
    write.catch((err) => console.warn('No se pudieron registrar eventos:', err?.code || err));
    await Promise.race([write, new Promise((r) => setTimeout(r, 1500))]);
  }

  async flushEvents() {}

  // ---------- panel ----------
  async listParticipants(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'participants'));
      return snap.docs.map((d) => d.data());
    });
  }

  async listEvents(courseId) {
    return guard(async () => {
      const snap = await getDocs(collection(this.db, 'courses', courseId, 'events'));
      return snap.docs.flatMap((d) => {
        const chunk = d.data();
        return (chunk.events || []).map((e) => ({ ...e, uid: chunk.uid }));
      });
    });
  }

  // ---------- videos ----------
  async mediaSrc(media) {
    return media?.src || null;
  }
}
