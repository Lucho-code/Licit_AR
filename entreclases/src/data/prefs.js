// Preferencias de este dispositivo (curso elegido, último rol). Si el navegador bloquea
// localStorage, se guardan en memoria mientras la página esté abierta.
const memory = new Map();
const PREFIX = 'entreclases.';

export const prefs = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? (memory.has(key) ? memory.get(key) : fallback) : JSON.parse(raw);
    } catch {
      return memory.has(key) ? memory.get(key) : fallback;
    }
  },
  set(key, value) {
    memory.set(key, value);
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* solo memoria */
    }
  },
  remove(key) {
    memory.delete(key);
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* nada */
    }
  },
};
