// Grabación de tomas cortas con MediaRecorder (sin audio: en lengua de señas no hace falta).
import { streamSettings } from './camera.js';

const TYPES = [
  'video/mp4;codecs=avc1.42E01E',
  'video/mp4;codecs=avc1',
  'video/mp4',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
];

export function canRecord() {
  return typeof globalThis.MediaRecorder !== 'undefined';
}

export function pickMimeType() {
  if (!canRecord()) return null;
  return TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

/** Arranca una grabación. Devuelve { stop(), done } donde done resuelve la toma. */
export function startRecording(stream, { maxMs = 8000, bitsPerSecond = 1_500_000 } = {}) {
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: bitsPerSecond });
  const chunks = [];
  const started = performance.now();
  let timer = null;
  const done = new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data);
    };
    recorder.onerror = (e) => reject(e.error || new Error('Falló la grabación.'));
    recorder.onstop = () => {
      clearTimeout(timer);
      const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0];
      const blob = new Blob(chunks, { type });
      const s = streamSettings(stream);
      resolve({
        blob,
        mimeType: type,
        durationMs: Math.round(performance.now() - started),
        width: s.width || null,
        height: s.height || null,
        fps: s.frameRate ? Math.round(s.frameRate) : null,
      });
    };
  });
  recorder.start(250);
  timer = setTimeout(() => {
    if (recorder.state !== 'inactive') recorder.stop();
  }, maxMs);
  return {
    stop() {
      if (recorder.state !== 'inactive') recorder.stop();
    },
    done,
    startedAt: started,
  };
}
