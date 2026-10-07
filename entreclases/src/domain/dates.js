// Fechas como claves 'AAAA-MM-DD' en hora local del dispositivo.
// Las cuentas se hacen sobre UTC para que los cambios de horario no corran los días.

const DAY_MS = 86400000;

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toUtc(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms) {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key, n) {
  return fromUtc(toUtc(key) + n * DAY_MS);
}

/** Días desde `fromKey` hasta `toKey` (positivo si toKey es posterior). */
export function diffDays(fromKey, toKey) {
  return Math.round((toUtc(toKey) - toUtc(fromKey)) / DAY_MS);
}

/** 0 = domingo … 6 = sábado */
export function weekdayOf(key) {
  return new Date(toUtc(key)).getUTCDay();
}

/** Lunes de la semana de `key` (las semanas arrancan el lunes). */
export function weekStart(key) {
  const wd = weekdayOf(key);
  return addDays(key, wd === 0 ? -6 : 1 - wd);
}

export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function formatDateLong(key) {
  const [y, m, d] = key.split('-').map(Number);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${WEEKDAYS[weekdayOf(key)]} ${d} ${months[m - 1]} ${y}`;
}

export function formatDateShort(key) {
  const [, m, d] = key.split('-').map(Number);
  return `${d}/${m}`;
}
