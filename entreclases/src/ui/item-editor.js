import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { html } from './html.js';
import { useApp } from './ctx.js';
import { Loading, ErrorBox, Empty, Chip, StatusChip, ConfirmButton } from './common.js';
import { SignPlayer } from './player.js';
import { hasConsent } from './studio.js';
import { cx, useAsync, fmtBytes, fmtDuration } from './util.js';
import { groupMedia, itemStatus } from '../domain/pack.js';
import { openCamera, stopStream, streamSettings } from '../media/camera.js';
import { canRecord, startRecording } from '../media/recorder.js';
import { readVideoMeta } from '../media/video-meta.js';

const MAX_UPLOAD = 20 * 1024 * 1024;
const PARAMS = [
  ['configuracion', 'Configuración (forma de la mano)'],
  ['ubicacion', 'Ubicación'],
  ['movimiento', 'Movimiento'],
  ['orientacion', 'Orientación de la palma'],
  ['rnm', 'Rasgos no manuales (cara, cuerpo)'],
];

function splitMeanings(main, others) {
  return [main, ...String(others || '').split('/')].map((s) => s.trim()).filter(Boolean);
}

export function ItemEditor({ courseId, itemId }) {
  const { store, navigate, notify } = useApp();
  const isNew = String(itemId || '').startsWith('nuevo');
  const [, newKind, newLesson] = isNew ? itemId.split('-') : [];

  const data = useAsync(async () => {
    const [course, items, media, signers] = await Promise.all([
      store.getCourse(courseId),
      store.listItems(courseId),
      store.listMedia(courseId),
      store.listSigners(courseId),
    ]);
    if (!course) return null;
    let item = items.find((i) => i.id === itemId);
    if (isNew) {
      const lesson = Number(newLesson) || 1;
      const order = Math.max(0, ...items.filter((i) => i.lesson === lesson).map((i) => i.order || 0)) + 1;
      item = { kind: newKind === 'phrase' ? 'phrase' : 'sign', meanings: [], lesson, order, notes: '', region: course.region || '', params: {} };
    }
    return { course, items, item, media, signers: signers.filter((s) => !s.sample) };
  }, [courseId, itemId]);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [signerId, setSignerId] = useState('');
  const [angle, setAngle] = useState('frente');
  const [uploading, setUploading] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const it = data.data?.item;
    if (!it) return;
    setForm({
      kind: it.kind,
      main: it.meanings?.[0] || '',
      others: (it.meanings || []).slice(1).join(' / '),
      lesson: it.lesson,
      order: it.order,
      notes: it.notes || '',
      region: it.region || data.data.course.region || '',
      params: { ...(it.params || {}) },
    });
  }, [data.data]);

  const consented = useMemo(() => (data.data?.signers || []).filter(hasConsent), [data.data]);
  useEffect(() => {
    if (!signerId && consented.length) setSignerId(consented[0].id);
  }, [consented.length]);

  if (data.loading && !data.data) return html`<${Loading} />`;
  if (data.error) return html`<${ErrorBox} error=${data.error} onRetry=${data.reload} />`;
  if (!data.data || !data.data.item) {
    return html`<${Empty} title="No encontramos este ítem"
      action=${html`<button type="button" class="btn btn-primary" onClick=${() => navigate(`estudio/${courseId}`)}>Volver al contenido</button>`} />`;
  }
  if (!form) return html`<${Loading} />`;

  const { course, item, items } = data.data;
  const takes = isNew ? [] : data.data.media.filter((m) => m.itemId === item.id);
  const status = itemStatus(item, takes);
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  const signerById = new Map(data.data.signers.map((s) => [s.id, s]));

  const byItem = groupMedia(data.data.media);
  const ordered = items.slice().sort((a, b) => a.lesson - b.lesson || a.order - b.order);
  const pos = ordered.findIndex((i) => i.id === item.id);
  const nextPending = pos >= 0 ? ordered.slice(pos + 1).find((i) => !(byItem.get(i.id) || []).length) : null;

  const save = async (e) => {
    e?.preventDefault();
    const meanings = splitMeanings(form.main, form.others);
    if (!meanings.length) {
      notify('Escribí al menos un significado en español.', 'bad');
      return null;
    }
    setSaving(true);
    try {
      const saved = await store.saveItem(courseId, {
        ...(isNew ? {} : { id: item.id }),
        kind: form.kind,
        meanings,
        lesson: Number(form.lesson) || 1,
        order: Number(form.order) || 0,
        notes: form.notes.trim(),
        region: form.region.trim(),
        params: form.params,
      });
      notify('Guardado');
      if (isNew) navigate(`estudio/${courseId}/item/${saved.id}`);
      else data.reload();
      return saved;
    } catch (err) {
      notify(err.message || 'No se pudo guardar.', 'bad');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD) {
      notify('El video pesa más de 20 MB. Recortalo o grabalo con la cámara de la app.', 'bad');
      return;
    }
    setUploading({ progress: 0, name: file.name });
    try {
      const meta = await readVideoMeta(file);
      if (!meta.playable) {
        notify('Este navegador no puede reproducir ese archivo. Si viene de un iPhone, grabalo en «Más compatible» (H.264) o usá «Grabar con la cámara».', 'bad');
        return;
      }
      if (meta.durationMs && meta.durationMs > 30000) {
        notify('El video dura más de 30 s. Las señas sueltas duran 2 a 5 s y las frases menos de 15 s.', 'bad');
        return;
      }
      await store.addMedia(
        courseId,
        { itemId: item.id, blob: file, signerId, angle, width: meta.width, height: meta.height, durationMs: meta.durationMs, mimeType: file.type },
        (p) => setUploading({ progress: p, name: file.name }),
      );
      notify('Toma subida');
      data.reload();
    } catch (err) {
      notify(err.message || 'No se pudo subir el video.', 'bad');
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setValidated = async (checked, by) => {
    try {
      await store.saveItem(courseId, { id: item.id, validatedBy: checked ? by || 'Docente' : null, validatedAt: checked ? Date.now() : null });
      notify(checked ? 'Marcada como validada' : 'Validación quitada');
      data.reload();
    } catch (err) {
      notify(err.message || 'No se pudo guardar.', 'bad');
    }
  };

  return html`<div class="item-editor">
    <header class="page-head">
      <p class="eyebrow"><a href=${`#/estudio/${courseId}`} onClick=${(e) => {
        e.preventDefault();
        navigate(`estudio/${courseId}`);
      }}>← ${course.name}</a></p>
      <h1 class="title">${isNew ? (form.kind === 'phrase' ? 'Nueva frase' : 'Nueva seña') : form.main || 'Sin significado'}</h1>
      ${!isNew && html`<p><${StatusChip} status=${status} /></p>`}
    </header>

    <div class="editor-grid">
      <form class="card form" onSubmit=${save}>
        <fieldset class="segmented">
          <legend>Tipo</legend>
          <label><input type="radio" name="kind" value="sign" checked=${form.kind === 'sign'} onChange=${() => set('kind')('sign')} /> <span>Seña</span></label>
          <label><input type="radio" name="kind" value="phrase" checked=${form.kind === 'phrase'} onChange=${() => set('kind')('phrase')} /> <span>Frase</span></label>
        </fieldset>
        <div class="field">
          <label for="it-main">Significado en español</label>
          <input id="it-main" value=${form.main} maxlength="80" placeholder=${form.kind === 'phrase' ? '¿Cómo te llamás?' : 'gracias'} onInput=${(e) => set('main')(e.target.value)} />
        </div>
        <div class="field">
          <label for="it-others">Otros significados (opcional)</label>
          <input id="it-others" value=${form.others} maxlength="120" placeholder="Separalos con / " onInput=${(e) => set('others')(e.target.value)} />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="it-lesson">Lección</label>
            <select id="it-lesson" value=${String(form.lesson)} onChange=${(e) => set('lesson')(Number(e.target.value))}>
              ${Array.from({ length: course.lessonsCount || 1 }, (_, i) => html`<option value=${String(i + 1)}>${i + 1}${course.lessonTitles?.[i]?.title ? ` · ${course.lessonTitles[i].title}` : ''}</option>`)}
            </select>
          </div>
          <div class="field">
            <label for="it-order">Orden</label>
            <input id="it-order" type="number" min="0" value=${form.order} onInput=${(e) => set('order')(e.target.value)} />
          </div>
        </div>
        <div class="field">
          <label for="it-notes">Nota para los alumnos (opcional)</label>
          <textarea id="it-notes" rows="2" maxlength="300" placeholder="Ej.: fijate en la expresión de la cara" value=${form.notes} onInput=${(e) => set('notes')(e.target.value)}></textarea>
        </div>
        <div class="field">
          <label for="it-region">Variante regional</label>
          <input id="it-region" value=${form.region} maxlength="60" onInput=${(e) => set('region')(e.target.value)} />
        </div>
        <details class="params">
          <summary>Datos lingüísticos (opcional)</summary>
          <p class="hint">Sirven para buscar señas por forma y, más adelante, para entrenar herramientas con consentimiento.</p>
          ${PARAMS.map(
            ([k, label]) => html`<div class="field">
              <label for=${`it-p-${k}`}>${label}</label>
              <input id=${`it-p-${k}`} value=${form.params[k] || ''} maxlength="80" onInput=${(e) => set('params')({ ...form.params, [k]: e.target.value })} />
            </div>`,
          )}
        </details>
        <div class="row-actions">
          <button type="submit" class="btn btn-primary" disabled=${saving}>${saving ? 'Guardando…' : 'Guardar'}</button>
          ${!isNew &&
          html`<${ConfirmButton} label="Borrar ítem" question="¿Borrar el ítem y sus tomas?" confirmLabel="Sí, borrar"
            onConfirm=${async () => {
              await store.deleteItem(courseId, item.id);
              notify('Ítem borrado');
              navigate(`estudio/${courseId}`);
            }} />`}
        </div>
      </form>

      <section class="card takes-panel" aria-labelledby="takes-title">
        <h2 id="takes-title" class="card-title">Tomas en video</h2>
        ${isNew
          ? html`<p class="muted">Guardá el ítem para poder grabar o subir el video.</p>`
          : html`
            ${takes.length === 0 && html`<p class="muted">Todavía no hay video. Grabá la seña con la cámara o subí un archivo.</p>`}
            <ul class="takes">
              ${takes.map(
                (m) => html`<li class=${cx('take', item.primaryMediaId === m.id && 'is-primary')}>
                  <${SignPlayer} store=${store} media=${[m]} compact showCaption=${false} label=${`Toma de «${form.main}»`} />
                  <div class="take-meta">
                    <p>${signerById.get(m.signerId)?.name || 'Sin señante'} · vista ${m.angle || 'frente'}</p>
                    <p class="muted small">${[m.width && m.height && `${m.width}×${m.height}`, m.fps && `${m.fps} fps`, fmtDuration(m.durationMs), fmtBytes(m.sizeBytes)].filter(Boolean).join(' · ')}</p>
                    <div class="row-actions">
                      ${item.primaryMediaId === m.id
                        ? html`<${Chip} tone="accent">Principal<//>`
                        : html`<button type="button" class="btn btn-ghost btn-sm" onClick=${async () => {
                            await store.saveItem(courseId, { id: item.id, primaryMediaId: m.id });
                            data.reload();
                          }}>Usar como principal</button>`}
                      <${ConfirmButton} label="Borrar" className="btn btn-ghost btn-sm" question="¿Borrar esta toma?" confirmLabel="Sí, borrar"
                        onConfirm=${async () => {
                          await store.deleteMedia(courseId, m);
                          notify('Toma borrada');
                          data.reload();
                        }} />
                    </div>
                  </div>
                </li>`,
              )}
            </ul>
            ${consented.length === 0
              ? html`<div class="notice notice-warn">
                  <p>Para grabar, primero registrá a la persona que aparece en el video y su consentimiento.</p>
                  <button type="button" class="btn btn-primary btn-sm" onClick=${() => navigate(`estudio/${courseId}/senantes`)}>Ir a Señantes</button>
                </div>`
              : html`<div class="take-setup">
                  <div class="field-row">
                    <div class="field">
                      <label for="take-signer">Quién seña</label>
                      <select id="take-signer" value=${signerId} onChange=${(e) => setSignerId(e.target.value)}>
                        ${consented.map((s) => html`<option value=${s.id}>${s.name}</option>`)}
                      </select>
                    </div>
                    <div class="field">
                      <label for="take-angle">Vista</label>
                      <select id="take-angle" value=${angle} onChange=${(e) => setAngle(e.target.value)}>
                        <option value="frente">De frente</option>
                        <option value="45°">A 45°</option>
                        <option value="perfil">De perfil</option>
                      </select>
                    </div>
                  </div>
                  <div class="row-actions">
                    ${canRecord() && html`<button type="button" class="btn btn-primary" onClick=${() => setRecording(true)}>Grabar con la cámara</button>`}
                    <button type="button" class="btn btn-ghost" disabled=${!!uploading} onClick=${() => fileRef.current?.click()}>
                      ${uploading ? `Subiendo… ${Math.round((uploading.progress || 0) * 100)} %` : 'Subir un video'}
                    </button>
                    <input ref=${fileRef} id="take-file" type="file" accept="video/*" class="visually-hidden" tabindex="-1" aria-label="Elegir un video para subir"
                      onChange=${(e) => upload(e.target.files?.[0])} />
                  </div>
                </div>`}
            ${takes.length > 0 &&
            html`<${Validation} item=${item} onChange=${setValidated} defaultBy=${consented.find((s) => s.role === 'docente')?.name || consented[0]?.name || ''} />`}
            ${nextPending &&
            html`<p class="next-pending">
              <a href=${`#/estudio/${courseId}/item/${nextPending.id}`} onClick=${(e) => {
                e.preventDefault();
                navigate(`estudio/${courseId}/item/${nextPending.id}`);
              }}>Siguiente pendiente: «${nextPending.meanings?.[0] || 'sin significado'}» (lección ${nextPending.lesson}) →</a>
            </p>`}
          `}
      </section>
    </div>

    ${recording &&
    html`<${Recorder} courseId=${courseId} item=${item} meaning=${form.main} signer=${signerById.get(signerId)} angle=${angle}
      onClose=${() => setRecording(false)}
      onSaved=${() => {
        setRecording(false);
        notify('Toma guardada');
        data.reload();
      }} />`}
  </div>`;
}

function Validation({ item, onChange, defaultBy }) {
  const [by, setBy] = useState(item.validatedBy || defaultBy);
  const [validated, setValidated] = useState(!!item.validatedBy);
  useEffect(() => {
    setValidated(!!item.validatedBy);
    if (item.validatedBy) setBy(item.validatedBy);
  }, [item.validatedBy]);
  return html`<div class=${cx('validation', validated && 'is-validated')}>
    <label class="check">
      <input id="it-validated" type="checkbox" checked=${validated}
        onChange=${(e) => {
          setValidated(e.target.checked);
          onChange(e.target.checked, by);
        }} />
      <span>Validé esta seña: es correcta y está bien grabada</span>
    </label>
    <div class="field">
      <label for="it-validated-by">Validada por</label>
      <input id="it-validated-by" value=${by} maxlength="60" disabled=${validated} onInput=${(e) => setBy(e.target.value)} />
    </div>
  </div>`;
}

// ---------------------------------------------------------------- grabador
const CHECKLIST = [
  'Fondo liso y mate (gris o azul)',
  'Ropa lisa y oscura, sin accesorios',
  'Luz de frente, sin sombras en la cara',
  'Encuadre de la cabeza a la cadera',
  'Empezar y terminar con las manos en reposo',
];

function Recorder({ courseId, item, meaning, signer, angle, onClose, onSaved }) {
  const { store, notify } = useApp();
  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recRef = useRef(null);
  const [facing, setFacing] = useState('user');
  const [phase, setPhase] = useState('opening');
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({});
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [take, setTake] = useState(null);

  useEffect(() => {
    let alive = true;
    setPhase('opening');
    setError(null);
    openCamera({ facingMode: facing })
      .then((stream) => {
        if (!alive) {
          stopStream(stream);
          return;
        }
        stopStream(streamRef.current);
        streamRef.current = stream;
        setSettings(streamSettings(stream));
        if (liveRef.current) {
          liveRef.current.srcObject = stream;
          liveRef.current.play().catch(() => {});
        }
        setPhase('live');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message);
        setPhase('error');
      });
    return () => {
      alive = false;
    };
  }, [facing]);

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
      recRef.current?.stop();
      stopStream(streamRef.current);
    };
  }, []);

  useEffect(() => () => take && URL.revokeObjectURL(take.url), [take]);

  const startRec = () => {
    const rec = startRecording(streamRef.current, { maxMs: 8000 });
    recRef.current = rec;
    setElapsed(0);
    setPhase('recording');
    rec.done
      .then((result) => {
        setTake({ ...result, url: URL.createObjectURL(result.blob) });
        setPhase('review');
      })
      .catch((err) => {
        setError(err.message);
        setPhase('error');
      });
  };

  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    if (count === 0) {
      startRec();
      return undefined;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== 'recording') return undefined;
    const started = recRef.current?.startedAt ?? performance.now();
    const tick = setInterval(() => setElapsed(Math.floor((performance.now() - started) / 100) / 10), 100);
    return () => clearInterval(tick);
  }, [phase]);

  const fps = settings.frameRate ? Math.round(settings.frameRate) : null;
  const ratio = settings.width && settings.height ? settings.width / settings.height : 4 / 3;
  const frameStyle = `aspect-ratio:${ratio};max-width:min(100%, calc(62vh * ${ratio.toFixed(4)}))`;
  const save = async () => {
    setPhase('saving');
    try {
      await store.addMedia(courseId, {
        itemId: item.id,
        blob: take.blob,
        signerId: signer?.id,
        angle,
        width: take.width,
        height: take.height,
        fps: take.fps,
        durationMs: take.durationMs,
        mimeType: take.mimeType,
      });
      onSaved();
    } catch (err) {
      notify(err.message || 'No se pudo guardar la toma.', 'bad');
      setPhase('review');
    }
  };

  return html`<div class="overlay recorder" role="dialog" aria-modal="true" aria-label=${`Grabar «${meaning}»`}>
    <header class="overlay-head">
      <div>
        <p class="eyebrow">Grabando · ${signer?.name || ''} · vista ${angle}</p>
        <h2>${meaning}</h2>
      </div>
      <button type="button" class="icon-btn" aria-label="Cerrar grabador" onClick=${onClose}>✕</button>
    </header>
    <div class="rec-stage">
      <div class=${cx('rec-frame', facing === 'user' && phase !== 'review' && 'selfie')} style=${frameStyle}>
        <video ref=${liveRef} muted playsinline autoplay class=${cx(phase === 'review' && 'hidden-video')} aria-label="Vista de la cámara"></video>
        ${phase === 'review' && take && html`<video src=${take.url} muted playsinline autoplay loop aria-label="Toma grabada"></video>`}
        ${phase !== 'review' &&
        html`<svg class="guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="8" x2="100" y2="8" />
          <line x1="0" y1="92" x2="100" y2="92" />
          <line x1="50" y1="0" x2="50" y2="100" class="center" />
          <rect x="12" y="8" width="76" height="84" class="space" />
        </svg>
        <span class="guide-label top">cabeza</span><span class="guide-label bottom">cadera</span>`}
        ${phase === 'countdown' && html`<span class="countdown" aria-live="assertive">${count || ''}</span>`}
        ${phase === 'recording' && html`<span class="rec-badge"><span class="rec-dot"></span> REC ${String(elapsed).replace('.', ',')} s</span>`}
        ${(phase === 'opening' || phase === 'error') && html`<p class="stage-msg">${phase === 'opening' ? 'Abriendo la cámara…' : error}</p>`}
      </div>
      <aside class="rec-side">
        ${phase === 'review'
          ? html`<p><strong>Así lo van a ver los alumnos.</strong> Revisá que se vea la cara y las manos completas.</p>
            <p class="muted small">${[take?.width && take?.height && `${take.width}×${take.height}`, take?.fps && `${take.fps} fps`, fmtDuration(take?.durationMs), fmtBytes(take?.blob?.size)].filter(Boolean).join(' · ')}</p>`
          : html`<ul class="checklist">${CHECKLIST.map((c) => html`<li>${c}</li>`)}</ul>
            ${fps && html`<p class=${cx('small', fps < 30 ? 'text-warn' : 'muted')}>${settings.width}×${settings.height} · ${fps} fps${fps < 30 ? ': pocos cuadros, la cámara lenta se verá cortada.' : fps >= 50 ? ': ideal para cámara lenta.' : ''}</p>`}
            ${facing === 'user' && html`<p class="muted small">La vista previa está espejada para ubicarte; el video se guarda sin espejar.</p>`}`}
      </aside>
    </div>
    <footer class="overlay-foot rec-actions">
      ${phase === 'live' &&
      html`<button type="button" class="btn btn-ghost" onClick=${() => setFacing(facing === 'user' ? 'environment' : 'user')}>
          ${facing === 'user' ? 'Usar cámara trasera' : 'Usar cámara frontal'}
        </button>
        <button type="button" class="btn btn-rec" onClick=${() => {
          setCount(3);
          setPhase('countdown');
        }}>Grabar (cuenta 3 s)</button>`}
      ${phase === 'recording' && html`<button type="button" class="btn btn-rec" onClick=${() => recRef.current?.stop()}>Detener</button>`}
      ${phase === 'review' &&
      html`<button type="button" class="btn btn-ghost" onClick=${() => {
          setTake(null);
          setPhase('live');
        }}>Repetir</button>
        <button type="button" class="btn btn-primary" onClick=${save}>Guardar toma</button>`}
      ${phase === 'saving' && html`<span class="muted">Guardando…</span>`}
      ${phase === 'error' && html`<button type="button" class="btn btn-ghost" onClick=${onClose}>Cerrar</button>`}
    </footer>
  </div>`;
}
