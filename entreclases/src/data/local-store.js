// Modo demo: todo queda guardado en este dispositivo (IndexedDB).
// Implementa la misma interfaz que FirebaseStore para que la interfaz no distinga el modo.
import { openKV } from './kv.js';
import { glossFrom, newCourseCode, newId } from '../domain/ids.js';
import { localDateKey, addDays } from '../domain/dates.js';
import { draftItems, draftLessonTitles } from '../domain/plan.js';
import { buildPack } from '../domain/pack.js';
import { simulateCohort } from '../domain/simulate.js';
import { StoreError, clampLessons, courseDoc, mergeItem, participantDoc } from './model.js';
import { DRAFT_COURSE, SAMPLE_COURSE, SAMPLE_ITEMS, demoVideoUrl } from './demo-content.js';

const DEMO_UID = 'demo-user';
const SEED_VERSION = 1;

export { StoreError };

export class LocalStore {
  constructor() {
    this.mode = 'demo';
    this.kv = null;
    this.urls = new Map();
    this.session = { uid: DEMO_UID, email: null, name: 'Vos', isAnonymous: false, staff: true };
  }

  async init() {
    this.kv = await openKV();
    this.persistent = this.kv.persistent;
    const meta = await this.kv.get('meta/seed');
    if (!meta || meta.version !== SEED_VERSION) {
      await this.seedDemo();
      await this.kv.set('meta/seed', { version: SEED_VERSION, at: Date.now() });
    }
  }

  // ---------- sesión ----------
  getSession() {
    return this.session;
  }
  onSessionChange(cb) {
    cb(this.session);
    return () => {};
  }
  async signInStaff() {
    return this.session;
  }
  async signOut() {}

  // ---------- semilla del demo ----------
  async seedDemo() {
    const now = Date.now();
    const sample = await this._newCourse({ ...SAMPLE_COURSE, lessonsCount: SAMPLE_COURSE.lessonTitles.length }, SAMPLE_COURSE.code);
    const signer = { id: 'sg_muestra', name: 'Muestra', region: '', role: 'muestra', consent: null, sample: true, createdAt: now };
    await this.kv.set(`courses/${sample.id}/signers/${signer.id}`, signer);
    const items = [];
    const media = [];
    for (const s of SAMPLE_ITEMS) {
      const item = {
        id: `it_${s.key}`,
        kind: s.kind,
        meanings: s.meanings,
        gloss: glossFrom(s.meanings[0]),
        lesson: s.lesson,
        order: s.order,
        notes: s.notes,
        region: '',
        params: {},
        validatedBy: 'Muestra',
        validatedAt: now,
        primaryMediaId: `md_${s.key}`,
        createdAt: now,
        updatedAt: now,
      };
      const m = {
        id: `md_${s.key}`,
        itemId: item.id,
        signerId: signer.id,
        angle: 'frente',
        src: `demo:${s.key}`,
        mimeType: 'video/mp4',
        width: 480,
        height: 360,
        fps: 50,
        durationMs: s.kind === 'phrase' ? 6000 : 3000,
        createdAt: now,
      };
      items.push(item);
      media.push(m);
      await this.kv.set(`courses/${sample.id}/items/${item.id}`, item);
      await this.kv.set(`courses/${sample.id}/media/${m.id}`, m);
    }
    const pack = buildPack({ course: sample, items, media, signers: [signer], version: 1, now });
    await this.kv.set(`courses/${sample.id}/packs/1`, pack);
    await this.updateCourse(sample.id, { publishedVersion: 1 });
    await this.createCourse({ ...DRAFT_COURSE, withDraftPlan: true });
  }

  async resetDemo() {
    for (const url of this.urls.values()) URL.revokeObjectURL(url);
    this.urls.clear();
    await this.kv.clear();
    await this.seedDemo();
    await this.kv.set('meta/seed', { version: SEED_VERSION, at: Date.now() });
  }

  // ---------- cursos (equipo docente) ----------
  async _uniqueCode(preferred) {
    if (preferred && !(await this.kv.get(`codes/${preferred}`))) return preferred;
    for (;;) {
      const code = newCourseCode();
      if (!(await this.kv.get(`codes/${code}`))) return code;
    }
  }

  async _newCourse(fields, preferredCode) {
    const id = newId('c');
    const code = await this._uniqueCode(preferredCode);
    const course = { id, ...courseDoc(fields, { code, ownerUid: this.session.uid }) };
    await this.kv.set(`courses/${id}`, course);
    await this.kv.set(`codes/${code}`, { courseId: id, name: course.name });
    return course;
  }

  async createCourse({ name, region, classWeekday, lessonsCount = 10, withDraftPlan = false }) {
    const n = clampLessons(lessonsCount);
    const course = await this._newCourse({
      name,
      region,
      classWeekday,
      lessonsCount: n,
      lessonTitles: withDraftPlan ? draftLessonTitles(n) : undefined,
    });
    if (withDraftPlan) {
      for (const it of draftItems().filter((i) => i.lesson <= n)) await this.saveItem(course.id, it);
    }
    return course;
  }

  async listMyCourses() {
    const rows = await this.kv.list('courses/');
    return rows.map((r) => r.value).sort((a, b) => a.createdAt - b.createdAt);
  }

  getCourse(courseId) {
    return this.kv.get(`courses/${courseId}`);
  }

  async updateCourse(courseId, patch) {
    const course = await this.getCourse(courseId);
    if (!course) throw new StoreError('not-found', 'No encontramos el curso.');
    const next = { ...course, ...patch };
    await this.kv.set(`courses/${courseId}`, next);
    if (patch.name) await this.kv.set(`codes/${course.code}`, { courseId, name: next.name });
    return next;
  }

  async listStaff() {
    return [{ email: 'Este dispositivo', role: 'owner' }];
  }
  async addStaff() {
    throw new StoreError('demo', 'Sumar docentes requiere el modo piloto (con Firebase). En el demo, todo queda en este dispositivo.');
  }
  async removeStaff() {
    throw new StoreError('demo', 'No disponible en el modo demo.');
  }

  // ---------- contenido ----------
  async listItems(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/items/`);
    return rows.map((r) => r.value).sort((a, b) => a.lesson - b.lesson || a.order - b.order);
  }

  async saveItem(courseId, item) {
    const id = item.id || newId('it');
    const prev = item.id ? await this.kv.get(`courses/${courseId}/items/${id}`) : null;
    const next = { ...mergeItem(prev, item), id };
    await this.kv.set(`courses/${courseId}/items/${id}`, next);
    return next;
  }

  async deleteItem(courseId, itemId) {
    for (const m of (await this.listMedia(courseId)).filter((x) => x.itemId === itemId)) await this.deleteMedia(courseId, m, { keepItem: true });
    await this.kv.delete(`courses/${courseId}/items/${itemId}`);
  }

  async listMedia(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/media/`);
    return rows.map((r) => r.value).sort((a, b) => a.createdAt - b.createdAt);
  }

  async addMedia(courseId, { itemId, blob, signerId, angle, width, height, fps, durationMs, mimeType }, onProgress) {
    const id = newId('md');
    await this.kv.setBlob(id, blob);
    const media = {
      id,
      itemId,
      signerId: signerId || null,
      angle: angle || 'frente',
      src: `local:${id}`,
      mimeType: mimeType || blob.type || 'video/webm',
      width: width || null,
      height: height || null,
      fps: fps || null,
      durationMs: durationMs || null,
      sizeBytes: blob.size,
      createdAt: Date.now(),
    };
    await this.kv.set(`courses/${courseId}/media/${id}`, media);
    const item = await this.kv.get(`courses/${courseId}/items/${itemId}`);
    if (item && !item.primaryMediaId) await this.saveItem(courseId, { id: itemId, primaryMediaId: id });
    onProgress?.(1);
    return media;
  }

  async deleteMedia(courseId, media, { keepItem = false } = {}) {
    await this.kv.delete(`courses/${courseId}/media/${media.id}`);
    if (media.src?.startsWith('local:')) await this.kv.deleteBlob(media.id);
    const url = this.urls.get(media.id);
    if (url) {
      URL.revokeObjectURL(url);
      this.urls.delete(media.id);
    }
    if (!keepItem) {
      const item = await this.kv.get(`courses/${courseId}/items/${media.itemId}`);
      if (item && item.primaryMediaId === media.id) {
        const rest = (await this.listMedia(courseId)).filter((m) => m.itemId === media.itemId);
        await this.saveItem(courseId, { id: item.id, primaryMediaId: rest[0]?.id || null, validatedBy: rest.length ? item.validatedBy : null });
      }
    }
  }

  async listSigners(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/signers/`);
    return rows.map((r) => r.value).sort((a, b) => a.createdAt - b.createdAt);
  }

  async saveSigner(courseId, signer) {
    const id = signer.id || newId('sg');
    const prev = signer.id ? await this.kv.get(`courses/${courseId}/signers/${id}`) : null;
    const next = { createdAt: Date.now(), ...prev, ...signer, id, updatedAt: Date.now() };
    await this.kv.set(`courses/${courseId}/signers/${id}`, next);
    return next;
  }

  async deleteSigner(courseId, signerId) {
    await this.kv.delete(`courses/${courseId}/signers/${signerId}`);
  }

  async publish(courseId, { onlyValidated = true } = {}) {
    const course = await this.getCourse(courseId);
    const [items, media, signers] = await Promise.all([this.listItems(courseId), this.listMedia(courseId), this.listSigners(courseId)]);
    const version = (course.publishedVersion || 0) + 1;
    const pack = buildPack({ course, items, media, signers, version, onlyValidated });
    if (pack.items.length === 0) throw new StoreError('empty', 'No hay señas listas para publicar.');
    await this.kv.set(`courses/${courseId}/packs/${version}`, pack);
    await this.updateCourse(courseId, { publishedVersion: version, publishedAt: pack.publishedAt });
    return { version, count: pack.items.length };
  }

  async listPacks(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/packs/`);
    return rows.map((r) => ({ version: r.value.version, publishedAt: r.value.publishedAt, count: r.value.items.length })).sort((a, b) => b.version - a.version);
  }

  // ---------- alumnos ----------
  async findCourseByCode(code) {
    const hit = await this.kv.get(`codes/${code}`);
    return hit ? { courseId: hit.courseId, name: hit.name } : null;
  }

  async joinCourse(courseId, alias) {
    const path = `courses/${courseId}/participants/${this.session.uid}`;
    const prev = await this.kv.get(path);
    const today = localDateKey();
    const participant = prev ? { ...prev, alias } : participantDoc(this.session.uid, alias, today);
    await this.kv.set(path, participant);
    if (!prev) await this.logEvents(courseId, [{ t: 'join', at: Date.now(), d: today }]);
    return participant;
  }

  getParticipant(courseId) {
    return this.kv.get(`courses/${courseId}/participants/${this.session.uid}`);
  }

  async updateParticipant(courseId, patch) {
    const path = `courses/${courseId}/participants/${this.session.uid}`;
    const prev = await this.kv.get(path);
    await this.kv.set(path, { ...prev, ...patch });
  }

  async getPack(courseId) {
    const course = await this.getCourse(courseId);
    if (!course || !course.publishedVersion) return null;
    return this.kv.get(`courses/${courseId}/packs/${course.publishedVersion}`);
  }

  async logEvents(courseId, events) {
    if (!events.length) return;
    await this.kv.set(`courses/${courseId}/events/${newId('ev')}`, { uid: this.session.uid, events });
  }

  async flushEvents() {}

  // ---------- panel ----------
  async listParticipants(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/participants/`);
    return rows.map((r) => r.value);
  }

  async listEvents(courseId) {
    const rows = await this.kv.list(`courses/${courseId}/events/`);
    return rows.flatMap((r) => r.value.events.map((e) => ({ ...e, uid: r.value.uid })));
  }

  async simulate(courseId) {
    const course = await this.getCourse(courseId);
    await this.clearSimulation(courseId);
    const todayKey = localDateKey();
    const items = await this.listItems(courseId);
    const { participants, events } = simulateCohort({
      n: 40,
      startKey: addDays(todayKey, -13),
      todayKey,
      classWeekday: course.classWeekday ?? 3,
      windowDays: course.pilot?.thresholds?.windowDays || 10,
      lessonsCount: course.lessonsCount || 10,
      itemIds: items.map((i) => i.id),
      seed: Math.floor(Math.random() * 1e6),
    });
    for (const p of participants) {
      await this.kv.set(`courses/${courseId}/participants/${p.uid}`, { ...p, srs: {} });
      await this.kv.set(`courses/${courseId}/events/sim_${p.uid}`, {
        uid: p.uid,
        simulated: true,
        events: events.filter((e) => e.uid === p.uid).map(({ uid, ...e }) => e),
      });
    }
  }

  async clearSimulation(courseId) {
    for (const r of await this.kv.list(`courses/${courseId}/participants/`)) {
      if (r.value.simulated) await this.kv.delete(r.path);
    }
    for (const r of await this.kv.list(`courses/${courseId}/events/`)) {
      if (r.value.simulated) await this.kv.delete(r.path);
    }
  }

  // ---------- videos ----------
  async mediaSrc(media) {
    const src = media?.src || '';
    if (src.startsWith('demo:')) return demoVideoUrl(src.slice(5));
    if (src.startsWith('local:')) {
      const id = src.slice(6);
      if (this.urls.has(id)) return this.urls.get(id);
      const blob = await this.kv.getBlob(id);
      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      this.urls.set(id, url);
      return url;
    }
    return src || null;
  }
}
