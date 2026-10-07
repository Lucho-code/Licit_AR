// Almacenamiento local por rutas (como documentos) + blobs de video.
// Usa IndexedDB; si el navegador lo bloquea (ventana privada, vista embebida) cae a memoria.

const DB_NAME = 'entreclases';
const DB_VERSION = 1;

function promisify(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      reject(err);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('docs')) db.createObjectStore('docs');
      if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqueada'));
  });
}

const directChild = (prefix) => (key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/');

function idbKV(db) {
  const tx = (store, mode = 'readonly') => db.transaction(store, mode).objectStore(store);
  return {
    persistent: true,
    get: (path) => promisify(tx('docs').get(path)).then((v) => v ?? null),
    set: (path, value) => promisify(tx('docs', 'readwrite').put(value, path)),
    delete: (path) => promisify(tx('docs', 'readwrite').delete(path)),
    async list(prefix) {
      const range = IDBKeyRange.bound(prefix, `${prefix}￿`);
      const store = tx('docs');
      const [keys, values] = await Promise.all([promisify(store.getAllKeys(range)), promisify(store.getAll(range))]);
      const isChild = directChild(prefix);
      return keys.map((k, i) => ({ path: k, value: values[i] })).filter((e) => isChild(e.path));
    },
    async deletePrefix(prefix) {
      const range = IDBKeyRange.bound(prefix, `${prefix}￿`);
      await promisify(tx('docs', 'readwrite').delete(range));
    },
    getBlob: (id) => promisify(tx('blobs').get(id)).then((v) => v ?? null),
    setBlob: (id, blob) => promisify(tx('blobs', 'readwrite').put(blob, id)),
    deleteBlob: (id) => promisify(tx('blobs', 'readwrite').delete(id)),
    async clear() {
      await promisify(tx('docs', 'readwrite').clear());
      await promisify(tx('blobs', 'readwrite').clear());
    },
  };
}

export function memoryKV() {
  const docs = new Map();
  const blobs = new Map();
  const clone = (v) => (v === undefined || v === null ? null : structuredClone(v));
  return {
    persistent: false,
    get: async (path) => clone(docs.get(path)),
    set: async (path, value) => void docs.set(path, clone(value)),
    delete: async (path) => void docs.delete(path),
    async list(prefix) {
      const isChild = directChild(prefix);
      return [...docs.entries()].filter(([k]) => isChild(k)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([path, value]) => ({ path, value: clone(value) }));
    },
    async deletePrefix(prefix) {
      for (const k of [...docs.keys()]) if (k.startsWith(prefix)) docs.delete(k);
    },
    getBlob: async (id) => blobs.get(id) ?? null,
    setBlob: async (id, blob) => void blobs.set(id, blob),
    deleteBlob: async (id) => void blobs.delete(id),
    async clear() {
      docs.clear();
      blobs.clear();
    },
  };
}

export async function openKV() {
  try {
    if (typeof indexedDB === 'undefined') throw new Error('sin IndexedDB');
    // Algunas vistas embebidas dejan la apertura colgada: a los 2 s se sigue en memoria.
    const db = await Promise.race([openDb(), new Promise((_, reject) => setTimeout(() => reject(new Error('IndexedDB no responde')), 2000))]);
    // Prueba de escritura: algunas vistas embebidas abren la base pero rechazan escrituras.
    const kv = idbKV(db);
    await kv.set('meta/probe', 1);
    return kv;
  } catch {
    return memoryKV();
  }
}
