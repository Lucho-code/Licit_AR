// Lee duración y tamaño de un video antes de subirlo, y detecta si este navegador puede reproducirlo.

export function readVideoMeta(blob, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    let settled = false;
    const finish = (meta) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.removeAttribute('src');
      v.load();
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    const timer = setTimeout(() => finish({ playable: false, durationMs: null, width: null, height: null }), timeoutMs);
    v.onloadedmetadata = () => {
      const base = { playable: true, width: v.videoWidth || null, height: v.videoHeight || null };
      if (v.duration === Infinity || Number.isNaN(v.duration)) {
        // Videos grabados en el navegador a veces no traen duración: forzamos el cálculo.
        v.ontimeupdate = () => {
          v.ontimeupdate = null;
          finish({ ...base, durationMs: Number.isFinite(v.duration) ? Math.round(v.duration * 1000) : null });
        };
        v.currentTime = 1e7;
        return;
      }
      finish({ ...base, durationMs: Math.round(v.duration * 1000) });
    };
    v.onerror = () => finish({ playable: false, durationMs: null, width: null, height: null });
    v.src = url;
  });
}
