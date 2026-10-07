// Cámara: se usa para el espejo del alumno (no se graba) y para que el/la docente grabe tomas.

const IS_PREVIEW = typeof __PREVIEW__ !== 'undefined' && __PREVIEW__;

const MESSAGES = {
  NotAllowedError: 'No hay permiso para usar la cámara. Habilitalo en la configuración del navegador para este sitio.',
  SecurityError: 'La cámara no está disponible en esta vista. Abrí la app desde su dirección propia (https).',
  NotFoundError: 'No encontramos una cámara en este dispositivo.',
  OverconstrainedError: 'La cámara no admite la configuración pedida.',
  NotReadableError: 'La cámara está en uso por otra app. Cerrala y probá de nuevo.',
  NotSupportedError: 'Este navegador no permite usar la cámara acá. Probá con Chrome actualizado.',
  AbortError: 'Se cortó el acceso a la cámara. Probá de nuevo.',
};

export function cameraAvailable() {
  return !!globalThis.navigator?.mediaDevices?.getUserMedia;
}

function cameraError(err) {
  let message = MESSAGES[err?.name] || 'No pudimos abrir la cámara.';
  if (IS_PREVIEW) message = 'En esta vista previa la cámara está bloqueada. Probala en la app publicada en tu celular.';
  const e = new Error(message);
  e.code = err?.name || 'Error';
  return e;
}

export async function openCamera({ facingMode = 'user', width = 1280, height = 720, frameRate = 50 } = {}) {
  if (!cameraAvailable()) throw cameraError({ name: 'NotSupportedError' });
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode, width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: frameRate } },
    });
  } catch (err) {
    if (err?.name === 'OverconstrainedError') {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode } });
      } catch (err2) {
        throw cameraError(err2);
      }
    }
    throw cameraError(err);
  }
}

export function stopStream(stream) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function streamSettings(stream) {
  const track = stream?.getVideoTracks?.()[0];
  return track ? track.getSettings() : {};
}
