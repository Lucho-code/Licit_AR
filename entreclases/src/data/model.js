// Forma de los documentos, compartida por el modo demo (local) y el modo piloto (Firebase).
import { glossFrom } from '../domain/ids.js';
import { DEFAULT_THRESHOLDS } from '../domain/metrics.js';

export class StoreError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function clampLessons(v) {
  return Math.max(1, Math.min(60, Number(v) || 10));
}

export function normalizeWeekday(v) {
  return v === '' || v === null || v === undefined ? null : Number(v);
}

export function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v !== undefined));
}

export function courseDoc({ name, region, classWeekday, lessonsCount, lessonTitles }, { code, ownerUid, now = Date.now() }) {
  const n = clampLessons(lessonsCount);
  return {
    name: String(name || '').trim().slice(0, 80) || 'Curso sin nombre',
    code,
    region: String(region || '').trim().slice(0, 60),
    classWeekday: normalizeWeekday(classWeekday),
    lessonsCount: n,
    lessonTitles: lessonTitles || Array.from({ length: n }, (_, i) => ({ n: i + 1, title: '' })),
    signLanguage: 'lsa',
    publishedVersion: 0,
    ownerUid,
    createdAt: now,
    pilot: { thresholds: { ...DEFAULT_THRESHOLDS }, paymentSignal: false, notes: '' },
  };
}

/** Une el ítem guardado con los cambios y normaliza campos. */
export function mergeItem(prev, patch, now = Date.now()) {
  const base = {
    kind: 'sign',
    meanings: [],
    lesson: 1,
    order: 0,
    notes: '',
    region: '',
    params: {},
    validatedBy: null,
    validatedAt: null,
    primaryMediaId: null,
    createdAt: now,
  };
  const next = { ...base, ...(prev || {}), ...stripUndefined(patch), updatedAt: now };
  next.kind = next.kind === 'phrase' ? 'phrase' : 'sign';
  next.meanings = (next.meanings || []).map((m) => String(m).trim()).filter(Boolean);
  next.lesson = Number(next.lesson) || 1;
  next.order = Number(next.order) || 0;
  next.gloss = (patch && patch.gloss) || glossFrom(next.meanings[0]);
  return next;
}

export function participantDoc(uid, alias, todayKey, now = Date.now()) {
  return { uid, alias, joinedAt: now, joinedDate: todayKey, srs: {}, lastLessonDate: null, practiceDates: [], lastActiveAt: now };
}
