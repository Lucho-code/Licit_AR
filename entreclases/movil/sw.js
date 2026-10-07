// Service worker de Entreclases: deja la app disponible sin conexión.
// El build completa el identificador de versión y la lista de archivos a precargar.
const CACHE = 'entreclases-muykxb5h';
const PRECACHE = ["index.html","app.js?v=muykxb5h","app.css?v=muykxb5h","config.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('entreclases-') && k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') return event.respondWith(networkFirst(req, 'index.html'));
    if (url.pathname.endsWith('/config.js')) return event.respondWith(networkFirst(req));
    if (req.headers.has('range')) return event.respondWith(rangeResponse(req));
    return event.respondWith(cacheFirst(req));
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return event.respondWith(staleWhileRevalidate(req));
  }
  // Firebase y cualquier otro servicio: directo a la red.
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok && res.status === 200) {
    const cache = await caches.open(CACHE);
    cache.put(req, res.clone());
  }
  return res;
}

async function networkFirst(req, fallbackPath) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(fallbackPath || req, res.clone());
      return res;
    }
    // Algunos hosts no sirven el índice de una carpeta (404): se usa la app guardada.
    const cached = fallbackPath ? await caches.match(fallbackPath) : null;
    return cached || res;
  } catch (err) {
    const cached = await caches.match(fallbackPath || req);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// Los <video> piden rangos de bytes; si el archivo está en caché se responde el tramo pedido.
async function rangeResponse(req) {
  const plain = new Request(req.url);
  let cached = await caches.match(plain);
  if (!cached) {
    try {
      const res = await fetch(plain);
      if (!res.ok) return fetch(req);
      const cache = await caches.open(CACHE);
      await cache.put(plain, res.clone());
      cached = res;
    } catch {
      return fetch(req);
    }
  }
  const blob = await cached.blob();
  const match = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  const size = blob.size;
  let start = match && match[1] ? Number(match[1]) : 0;
  let end = match && match[2] ? Number(match[2]) : size - 1;
  if (!match || !match[1]) {
    if (match && match[2]) {
      start = Math.max(0, size - Number(match[2]));
      end = size - 1;
    }
  }
  end = Math.min(end, size - 1);
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
