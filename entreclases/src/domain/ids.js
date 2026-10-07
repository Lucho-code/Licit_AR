// Identificadores. Los códigos de curso evitan caracteres que se confunden (0/O, 1/I/L).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomInts(n, max) {
  const out = new Uint32Array(n);
  globalThis.crypto.getRandomValues(out);
  return Array.from(out, (v) => v % max);
}

export function newId(prefix = '') {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const body = randomInts(12, alphabet.length)
    .map((i) => alphabet[i])
    .join('');
  return prefix ? `${prefix}_${body}` : body;
}

export function newCourseCode() {
  return randomInts(6, CODE_ALPHABET.length)
    .map((i) => CODE_ALPHABET[i])
    .join('');
}

/** Normaliza lo que tipea el alumno: mayúsculas, sin espacios ni guiones. */
export function normalizeCode(input) {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
}

export function isValidCode(code) {
  return /^[A-Z0-9]{6}$/.test(code) && [...code].every((c) => CODE_ALPHABET.includes(c));
}

/** Glosa: convención de transcripción de lenguas de señas (palabra de referencia en mayúsculas). */
export function glossFrom(meaning) {
  return String(meaning || '')
    .split(/[,/]/)[0]
    .trim()
    .toUpperCase()
    .replace(/[¿?¡!.]/g, '')
    .replace(/\s+/g, '-');
}
