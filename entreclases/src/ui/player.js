import { useEffect, useRef, useState } from 'preact/hooks';
import { html } from './html.js';
import { cx, fmtRate } from './util.js';
import { openCamera, stopStream } from '../media/camera.js';

const RATES = [0.25, 0.5, 0.75, 1];

function useMediaSrc(store, media) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);
  const id = media?.id;
  useEffect(() => {
    let alive = true;
    setSrc(null);
    setError(null);
    if (!media) return undefined;
    store
      .mediaSrc(media)
      .then((url) => {
        if (!alive) return;
        if (url) setSrc(url);
        else setError('No encontramos este video.');
      })
      .catch(() => alive && setError('No pudimos cargar el video.'));
    return () => {
      alive = false;
    };
  }, [id]);
  return [src, error];
}

/** Reproductor pensado para señas: repite solo, cámara lenta, espejo y cambio de toma. */
export function SignPlayer({ store, media = [], initialRate = 1, compact = false, label = 'Video de la seña', showCaption = true }) {
  const [take, setTake] = useState(0);
  const [rate, setRate] = useState(initialRate);
  const [mirror, setMirror] = useState(false);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState(false);
  const ref = useRef(null);
  const current = media[Math.min(take, media.length - 1)];
  const [src, srcError] = useMediaSrc(store, current);

  useEffect(() => {
    setTake(0);
  }, [media.map((m) => m.id).join('|')]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    setBroken(false);
    v.muted = true;
    v.playbackRate = rate;
    if (!paused) v.play().catch(() => setPaused(true));
  }, [src]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = rate;
  }, [rate]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const error = srcError || (broken ? 'Este navegador no puede reproducir el video.' : null);
  return html`<figure class=${cx('stage', compact && 'compact')}>
    <div class="stage-frame">
      ${error
        ? html`<p class="stage-msg">${error}</p>`
        : html`<video ref=${ref} src=${src || undefined} muted playsinline loop autoplay preload="auto" aria-label=${label}
            class=${cx(mirror && 'mirrored')}
            onLoadedData=${(e) => {
              e.currentTarget.playbackRate = rate;
            }}
            onError=${() => src && setBroken(true)}
            onClick=${toggle}></video>`}
      <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
      <span class="readout" aria-hidden="true">${fmtRate(rate)}${mirror ? ' · espejo' : ''}${paused ? ' · pausa' : ''}</span>
    </div>
    <div class="stage-controls">
      <button type="button" class="ctl" onClick=${toggle} aria-label=${paused ? 'Reproducir' : 'Pausar'}>${paused ? '▶' : '❚❚'}</button>
      <div class="speeds" role="group" aria-label="Velocidad">
        ${RATES.map(
          (r) => html`<button type="button" class="ctl speed" aria-pressed=${rate === r} onClick=${() => setRate(r)}>${fmtRate(r)}</button>`,
        )}
      </div>
      <button type="button" class="ctl" aria-pressed=${mirror} onClick=${() => setMirror(!mirror)} title="Ver la seña como en un espejo">Espejo</button>
      ${media.length > 1 &&
      html`<button type="button" class="ctl" onClick=${() => setTake((take + 1) % media.length)} title="Ver otra toma">
        Toma ${take + 1}/${media.length}
      </button>`}
    </div>
    ${showCaption && current && (current.signer || current.angle) &&
    html`<figcaption>${current.signer ? `Seña de ${current.signer}` : ''}${current.signer && current.angle ? ' · ' : ''}${current.angle ? `vista ${current.angle}` : ''}</figcaption>`}
  </figure>`;
}

/** Video chico para las opciones de "¿cuál es la seña?". */
export function VideoTile({ store, media, label }) {
  const [src, error] = useMediaSrc(store, media?.[0]);
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (v && src) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, [src]);
  if (error) return html`<div class="tile-msg">${error}</div>`;
  return html`<video ref=${ref} src=${src || undefined} muted playsinline loop autoplay preload="auto" aria-label=${label}></video>`;
}

/** Espejo: el modelo arriba y la cámara frontal abajo. No se graba ni se envía nada. */
export function MirrorPractice({ store, item, onGrade, onClose }) {
  const selfRef = useRef(null);
  const [state, setState] = useState('opening');
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream = null;
    let alive = true;
    openCamera({ facingMode: 'user', width: 640, height: 480, frameRate: 30 })
      .then((s) => {
        if (!alive) {
          stopStream(s);
          return;
        }
        stream = s;
        const v = selfRef.current;
        if (v) {
          v.srcObject = s;
          v.play().catch(() => {});
        }
        setState('on');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message);
        setState('off');
      });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      alive = false;
      stopStream(stream);
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const meaning = item.meanings?.[0] || '';
  return html`<div class="overlay mirror-practice" role="dialog" aria-modal="true" aria-label=${`Practicar «${meaning}» frente al espejo`}>
    <header class="overlay-head">
      <div>
        <p class="eyebrow">Espejo</p>
        <h2>${meaning}</h2>
      </div>
      <button type="button" class="icon-btn" aria-label="Cerrar espejo" onClick=${onClose}>✕</button>
    </header>
    <div class="mirror-grid">
      <${SignPlayer} store=${store} media=${item.media} initialRate=${0.5} compact label=${`Seña de «${meaning}»`} />
      <figure class="selfview">
        <video ref=${selfRef} muted playsinline autoplay class=${cx('mirrored', state !== 'on' && 'hidden-video')} aria-label="Tu cámara, como un espejo"></video>
        ${state === 'opening' && html`<p class="stage-msg">Abriendo la cámara…</p>`}
        ${state === 'off' && html`<p class="stage-msg">${error} Igual podés practicar mirando el video.</p>`}
        <figcaption>Tu espejo · no se graba ni se envía</figcaption>
      </figure>
    </div>
    <footer class="overlay-foot">
      <p id="selfcheck-q">¿Cómo te salió?</p>
      <div class="selfcheck" role="group" aria-labelledby="selfcheck-q">
        <button type="button" class="btn btn-ghost" onClick=${() => onGrade('again')}>Me costó</button>
        <button type="button" class="btn btn-ghost" onClick=${() => onGrade('hard')}>Más o menos</button>
        <button type="button" class="btn btn-primary" onClick=${() => onGrade('good')}>Me salió</button>
      </div>
    </footer>
  </div>`;
}
