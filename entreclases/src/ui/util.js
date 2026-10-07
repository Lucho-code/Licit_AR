import { useEffect, useState, useCallback, useRef } from 'preact/hooks';
import { localDateKey } from '../domain/dates.js';
import { offerFile } from './download.js';

export const IS_PREVIEW = typeof __PREVIEW__ !== 'undefined' && __PREVIEW__;

export const cx = (...args) => args.filter(Boolean).join(' ');

export const fmtRate = (r) => `${String(r).replace('.', ',')}×`;

export function fmtNumber(x, digits = 1) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  return Number(x).toFixed(digits).replace('.', ',');
}

export function fmtBytes(n) {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function fmtDuration(ms) {
  if (!ms) return '';
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

export function fmtDateTime(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Carga asincrónica con recarga manual. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then(
        (data) => alive && setState({ loading: false, data, error: null }),
        (error) => alive && setState({ loading: false, data: null, error }),
      );
    return () => {
      alive = false;
    };
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Ofrece un archivo de texto para guardar: 'saved', 'declined' o null si no se pudo. */
export async function saveTextFile(filename, text, mime = 'text/csv') {
  try {
    return await offerFile(filename, text, mime);
  } catch {
    return null;
  }
}

export function inviteLink(code) {
  if (IS_PREVIEW) return null;
  const base = location.href.split('#')[0].split('?')[0];
  return `${base}#/unirse/${code}`;
}

/** Registra eventos de práctica en tandas (menos escrituras, funciona sin conexión con Firebase). */
export function useTracker(store, courseId, version) {
  const buffer = useRef([]);
  const flush = useCallback(async () => {
    const events = buffer.current.splice(0);
    if (events.length && courseId) {
      try {
        await store.logEvents(courseId, events);
      } catch (err) {
        console.warn('No se pudieron guardar eventos', err);
      }
    }
  }, [store, courseId]);
  const track = useCallback(
    (t, extra = {}) => {
      const e = { t, at: Date.now(), d: localDateKey() };
      if (version) e.v = version;
      for (const [k, v] of Object.entries(extra)) if (v !== undefined && v !== null) e[k] = v;
      buffer.current.push(e);
      if (buffer.current.length >= 12) flush();
    },
    [version, flush],
  );
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [flush]);
  return { track, flush };
}

export function streakFrom(dates, todayKey) {
  const set = new Set(dates || []);
  let day = todayKey;
  if (!set.has(day)) {
    const d = new Date(`${todayKey}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    day = d.toISOString().slice(0, 10);
  }
  let n = 0;
  while (set.has(day)) {
    n += 1;
    const d = new Date(`${day}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    day = d.toISOString().slice(0, 10);
  }
  return n;
}
