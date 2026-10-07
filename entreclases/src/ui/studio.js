import { useMemo, useState } from 'preact/hooks';
import { html } from './html.js';
import { useApp } from './ctx.js';
import { Loading, ErrorBox, Empty, Chip, StatusChip, KindChip, ConfirmButton, CopyField, Sheet, ProgressBar } from './common.js';
import { useAsync, inviteLink, fmtDateTime, IS_PREVIEW } from './util.js';
import { WEEKDAYS } from '../domain/dates.js';
import { groupMedia, itemStatus, publishableItems, STATUS } from '../domain/pack.js';
import { primaryMeaning } from '../domain/quiz.js';
import { PanelTab } from './panel.js';

const TABS = [
  ['contenido', 'Contenido'],
  ['senantes', 'Señantes'],
  ['equipo', 'Equipo'],
  ['publicar', 'Publicar'],
  ['panel', 'Panel del piloto'],
];

// ---------------------------------------------------------------- inicio del estudio
export function StudioHome() {
  const { store, session, navigate, notify } = useApp();
  const isDemo = store.mode === 'demo';
  const signedIn = isDemo || (session && !session.isAnonymous);
  const courses = useAsync(() => (signedIn ? store.listMyCourses() : Promise.resolve([])), [signedIn, session?.uid]);
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return html`<section class="card narrow-card">
      <p class="eyebrow">Estudio docente</p>
      <h1 class="title">Entrá con tu cuenta de Google</h1>
      <p class="muted">Con tu cuenta podés crear cursos, grabar las señas y ver el avance del grupo. Los alumnos no necesitan cuenta: entran con el código del curso.</p>
      <button type="button" class="btn btn-primary btn-lg btn-block" disabled=${busy}
        onClick=${async () => {
          setBusy(true);
          try {
            await store.signInStaff();
          } catch (err) {
            notify(err.message || 'No pudimos iniciar sesión.', 'bad');
          } finally {
            setBusy(false);
          }
        }}>Entrar con Google</button>
    </section>`;
  }

  return html`<div class="studio-home">
    <header class="page-head">
      <p class="eyebrow">Estudio docente</p>
      <h1 class="title">Tus cursos</h1>
      ${!isDemo && session?.email && html`<p class="muted small">Sesión: ${session.email} · <button type="button" class="link-btn" onClick=${() => store.signOut()}>Salir</button></p>`}
    </header>
    ${courses.loading && html`<${Loading} />`}
    ${courses.error && html`<${ErrorBox} error=${courses.error} onRetry=${courses.reload} />`}
    ${courses.data &&
    (courses.data.length
      ? html`<ul class="course-list">
          ${courses.data.map(
            (c) => html`<li>
              <a class="course-card" href=${`#/estudio/${c.id}`} onClick=${(e) => {
                e.preventDefault();
                navigate(`estudio/${c.id}`);
              }}>
                <span class="course-name">${c.name}</span>
                <span class="course-meta">
                  <span class="code-chip" aria-label=${`Código ${c.code}`}>${c.code}</span>
                  ${c.publishedVersion ? html`<${Chip} tone="ok">Publicado v${c.publishedVersion}<//>` : html`<${Chip}>Sin publicar<//>`}
                  ${c.classWeekday !== null && c.classWeekday !== undefined && html`<span class="muted small">Clase: ${WEEKDAYS[c.classWeekday]}</span>`}
                </span>
              </a>
            </li>`,
          )}
        </ul>`
      : html`<${Empty} title="Todavía no tenés cursos">Creá el primero con el formulario de abajo.<//>`)}
    <${CreateCourse} onCreated=${(c) => navigate(`estudio/${c.id}`)} />
    ${isDemo &&
    html`<section class="card danger-zone">
      <h2 class="card-title">Reiniciar el demo</h2>
      <p class="muted">Borra todo lo guardado en este dispositivo y vuelve a cargar los dos cursos de ejemplo.</p>
      <${ConfirmButton} label="Reiniciar demo" question="¿Borrar todo lo del demo?" confirmLabel="Sí, reiniciar"
        onConfirm=${async () => {
          await store.resetDemo();
          notify('Demo reiniciado');
          courses.reload();
        }} />
    </section>`}
  </div>`;
}

function WeekdaySelect({ id, value, onChange }) {
  return html`<select id=${id} value=${value === null || value === undefined ? '' : String(value)} onChange=${(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
    <option value="">Sin día fijo</option>
    ${[1, 2, 3, 4, 5, 6, 0].map((d) => html`<option value=${String(d)}>${WEEKDAYS[d]}</option>`)}
  </select>`;
}

function CreateCourse({ onCreated }) {
  const { store, notify } = useApp();
  const [form, setForm] = useState({ name: '', region: 'Litoral (Rosario)', classWeekday: null, lessonsCount: 10, withDraftPlan: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  return html`<details class="card create-course">
    <summary class="card-title">Crear un curso nuevo</summary>
    <form class="form" onSubmit=${async (e) => {
      e.preventDefault();
      setError(null);
      if (form.name.trim().length < 3) {
        setError('Poné un nombre de al menos 3 letras.');
        return;
      }
      setBusy(true);
      try {
        const course = await store.createCourse({ ...form, name: form.name.trim() });
        notify(`Curso creado. Código: ${course.code}`);
        onCreated(course);
      } catch (err) {
        setError(err.message || 'No pudimos crear el curso.');
      } finally {
        setBusy(false);
      }
    }}>
      <div class="field">
        <label for="cc-name">Nombre del curso</label>
        <input id="cc-name" value=${form.name} maxlength="80" placeholder="LSA Nivel 1 · Círculo de Sordos · martes" onInput=${(e) => set('name')(e.target.value)} />
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cc-region">Variante regional</label>
          <input id="cc-region" value=${form.region} maxlength="60" onInput=${(e) => set('region')(e.target.value)} />
        </div>
        <div class="field">
          <label for="cc-day">Día de clase</label>
          <${WeekdaySelect} id="cc-day" value=${form.classWeekday} onChange=${set('classWeekday')} />
        </div>
        <div class="field">
          <label for="cc-lessons">Lecciones</label>
          <input id="cc-lessons" type="number" min="1" max="60" value=${form.lessonsCount} onInput=${(e) => set('lessonsCount')(Number(e.target.value))} />
        </div>
      </div>
      <label class="check">
        <input id="cc-draft" type="checkbox" checked=${form.withDraftPlan} onChange=${(e) => set('withDraftPlan')(e.target.checked)} />
        <span>Cargar el plan borrador (10 lecciones de 5 señas y 2 frases) para revisarlo con el/la docente sordo/a</span>
      </label>
      ${error && html`<p class="form-error" role="alert">${error}</p>`}
      <button type="submit" class="btn btn-primary" disabled=${busy}>${busy ? 'Creando…' : 'Crear curso'}</button>
    </form>
  </details>`;
}

// ---------------------------------------------------------------- curso
export function StudioCourse({ courseId, tab }) {
  const { store, navigate } = useApp();
  const course = useAsync(() => store.getCourse(courseId), [courseId]);
  const [editing, setEditing] = useState(false);

  if (course.loading && !course.data) return html`<${Loading} />`;
  if (course.error) return html`<${ErrorBox} error=${course.error} onRetry=${course.reload} />`;
  if (!course.data) {
    return html`<${Empty} title="No encontramos este curso o no tenés acceso"
      action=${html`<button type="button" class="btn btn-primary" onClick=${() => navigate('estudio')}>Volver al estudio</button>`}>
      Pedile a quien lo creó que te sume desde la pestaña Equipo.
    <//>`;
  }
  const c = course.data;
  const current = TABS.some(([k]) => k === tab) ? tab : 'contenido';
  return html`<div class="studio-course">
    <header class="page-head course-head">
      <div>
        <p class="eyebrow"><a href="#/estudio" onClick=${(e) => {
          e.preventDefault();
          navigate('estudio');
        }}>Estudio</a> / Curso</p>
        <h1 class="title">${c.name}</h1>
        <p class="muted small">
          Código <span class="code-chip">${c.code}</span>
          ${c.region && html` · ${c.region}`}
          ${c.classWeekday !== null && c.classWeekday !== undefined && html` · Clase: ${WEEKDAYS[c.classWeekday]}`}
          ${' · '}${c.publishedVersion ? `Publicado v${c.publishedVersion}` : 'Sin publicar'}
        </p>
      </div>
      <button type="button" class="btn btn-ghost" onClick=${() => setEditing(true)}>Editar datos</button>
    </header>
    <nav class="tabs" aria-label="Secciones del curso">
      ${TABS.map(
        ([key, label]) => html`<a href=${`#/estudio/${courseId}/${key}`} class="tab" aria-current=${current === key ? 'page' : undefined}
          onClick=${(e) => {
            e.preventDefault();
            navigate(`estudio/${courseId}/${key}`);
          }}>${label}</a>`,
      )}
    </nav>
    ${current === 'contenido' && html`<${ContentTab} course=${c} onCourseChange=${course.reload} />`}
    ${current === 'senantes' && html`<${SignersTab} course=${c} />`}
    ${current === 'equipo' && html`<${TeamTab} course=${c} />`}
    ${current === 'publicar' && html`<${PublishTab} course=${c} onPublished=${course.reload} />`}
    ${current === 'panel' && html`<${PanelTab} course=${c} onCourseChange=${course.reload} />`}
    ${editing && html`<${EditCourse} course=${c} onClose=${() => setEditing(false)} onSaved=${() => {
      setEditing(false);
      course.reload();
    }} />`}
  </div>`;
}

function EditCourse({ course, onClose, onSaved }) {
  const { store, notify } = useApp();
  const [form, setForm] = useState({
    name: course.name,
    region: course.region || '',
    classWeekday: course.classWeekday ?? null,
    lessonsCount: course.lessonsCount || 10,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm({ ...form, [k]: v });
  return html`<${Sheet} title="Datos del curso" onClose=${onClose}>
    <form class="form" onSubmit=${async (e) => {
      e.preventDefault();
      setBusy(true);
      try {
        const n = Math.max(1, Math.min(60, Number(form.lessonsCount) || 1));
        const titles = Array.from({ length: n }, (_, i) => course.lessonTitles?.[i] || { n: i + 1, title: '' });
        await store.updateCourse(course.id, { name: form.name.trim() || course.name, region: form.region.trim(), classWeekday: form.classWeekday, lessonsCount: n, lessonTitles: titles });
        notify('Datos guardados');
        onSaved();
      } catch (err) {
        notify(err.message || 'No se pudo guardar.', 'bad');
      } finally {
        setBusy(false);
      }
    }}>
      <div class="field"><label for="ec-name">Nombre</label><input id="ec-name" value=${form.name} maxlength="80" onInput=${(e) => set('name')(e.target.value)} /></div>
      <div class="field"><label for="ec-region">Variante regional</label><input id="ec-region" value=${form.region} maxlength="60" onInput=${(e) => set('region')(e.target.value)} /></div>
      <div class="field-row">
        <div class="field"><label for="ec-day">Día de clase</label><${WeekdaySelect} id="ec-day" value=${form.classWeekday} onChange=${set('classWeekday')} /></div>
        <div class="field"><label for="ec-lessons">Lecciones</label><input id="ec-lessons" type="number" min="1" max="60" value=${form.lessonsCount} onInput=${(e) => set('lessonsCount')(e.target.value)} /></div>
      </div>
      <p class="hint">El día de clase sirve para detectar si el grupo practica solo la noche anterior.</p>
      <button type="submit" class="btn btn-primary" disabled=${busy}>Guardar</button>
    </form>
  <//>`;
}

// ---------------------------------------------------------------- contenido
const FILTERS = [
  ['todas', 'Todas'],
  [STATUS.PENDING, 'Pendientes'],
  [STATUS.RECORDED, 'Sin validar'],
  [STATUS.VALIDATED, 'Validadas'],
];

function ContentTab({ course, onCourseChange }) {
  const { store, navigate, notify } = useApp();
  const data = useAsync(async () => {
    const [items, media] = await Promise.all([store.listItems(course.id), store.listMedia(course.id)]);
    return { items, media };
  }, [course.id]);
  const [filter, setFilter] = useState('todas');

  const rows = useMemo(() => {
    if (!data.data) return [];
    const byItem = groupMedia(data.data.media);
    return data.data.items.map((it) => ({ ...it, takes: byItem.get(it.id)?.length || 0, status: itemStatus(it, byItem.get(it.id)) }));
  }, [data.data]);

  if (data.loading && !data.data) return html`<${Loading} />`;
  if (data.error) return html`<${ErrorBox} error=${data.error} onRetry=${data.reload} />`;

  const count = (s) => rows.filter((r) => r.status === s).length;
  const lessons = Array.from({ length: course.lessonsCount || 1 }, (_, i) => i + 1);
  const saveTitle = async (n, title) => {
    const titles = lessons.map((k) => course.lessonTitles?.find((l) => l.n === k) || { n: k, title: '' });
    if ((titles[n - 1].title || '') === title) return;
    titles[n - 1] = { n, title };
    try {
      await store.updateCourse(course.id, { lessonTitles: titles });
      onCourseChange();
    } catch (err) {
      notify(err.message || 'No se pudo guardar el título.', 'bad');
    }
  };

  return html`<section class="content-tab">
    <div class="content-summary card">
      <div class="summary-counts">
        <p><strong>${rows.length}</strong> ítems · <strong>${count(STATUS.VALIDATED)}</strong> validados · <strong>${count(STATUS.RECORDED)}</strong> sin validar · <strong>${count(STATUS.PENDING)}</strong> pendientes</p>
        <${ProgressBar} value=${count(STATUS.VALIDATED)} max=${rows.length || 1} label="Ítems validados" />
      </div>
      <div class="filters" role="group" aria-label="Filtrar por estado">
        ${FILTERS.map(([k, label]) => html`<button type="button" class="ctl" aria-pressed=${filter === k} onClick=${() => setFilter(k)}>${label}</button>`)}
      </div>
    </div>
    ${lessons.map((n) => {
      const items = rows.filter((r) => r.lesson === n && (filter === 'todas' || r.status === filter));
      const title = course.lessonTitles?.find((l) => l.n === n)?.title || '';
      return html`<section class="lesson-block" aria-label=${`Lección ${n}`}>
        <header class="lesson-block-head">
          <span class="lesson-n">Lección ${n}</span>
          <input class="lesson-title-input" aria-label=${`Título de la lección ${n}`} value=${title} placeholder="Título (opcional)" maxlength="60"
            onBlur=${(e) => saveTitle(n, e.target.value.trim())} onKeyDown=${(e) => e.key === 'Enter' && e.target.blur()} />
        </header>
        ${items.length === 0 && filter === 'todas' && html`<p class="muted small">Sin ítems todavía.</p>`}
        <ul class="item-list">
          ${items.map(
            (it) => html`<li>
              <a class="item-row" href=${`#/estudio/${course.id}/item/${it.id}`} onClick=${(e) => {
                e.preventDefault();
                navigate(`estudio/${course.id}/item/${it.id}`);
              }}>
                <span class="item-main"><${KindChip} kind=${it.kind} /> <span class="item-meaning">${primaryMeaning(it) || 'Sin significado'}</span></span>
                <span class="item-meta"><${StatusChip} status=${it.status} />${it.takes > 0 && html`<span class="muted small">${it.takes} ${it.takes === 1 ? 'toma' : 'tomas'}</span>`}</span>
              </a>
            </li>`,
          )}
        </ul>
        <div class="row-actions">
          <button type="button" class="btn btn-ghost btn-sm" onClick=${() => navigate(`estudio/${course.id}/item/nuevo-sign-${n}`)}>+ Seña</button>
          <button type="button" class="btn btn-ghost btn-sm" onClick=${() => navigate(`estudio/${course.id}/item/nuevo-phrase-${n}`)}>+ Frase</button>
        </div>
      </section>`;
    })}
  </section>`;
}

// ---------------------------------------------------------------- señantes y consentimiento
const EMPTY_SIGNER = {
  name: '',
  region: '',
  role: 'docente',
  consent: { appUse: true, territories: 'Argentina', years: 5, aiTraining: false, derivatives: false, revocation: 'Puede pedir la baja de sus videos con 30 días de aviso.', signedAt: '', documentRef: '' },
};

export function hasConsent(signer) {
  return !!(signer && signer.consent && signer.consent.appUse && signer.consent.signedAt);
}

function SignersTab({ course }) {
  const { store, notify } = useApp();
  const data = useAsync(async () => {
    const [signers, media] = await Promise.all([store.listSigners(course.id), store.listMedia(course.id)]);
    return { signers: signers.filter((s) => !s.sample), media };
  }, [course.id]);
  const [form, setForm] = useState(null);

  if (data.loading && !data.data) return html`<${Loading} />`;
  if (data.error) return html`<${ErrorBox} error=${data.error} onRetry=${data.reload} />`;

  return html`<section class="signers-tab">
    <div class="notice">
      <p><strong>Antes de grabar:</strong> registrá a cada persona que aparece en los videos y su consentimiento firmado. Sin consentimiento cargado, la app no deja grabar con esa persona.</p>
    </div>
    ${data.data.signers.length === 0
      ? html`<${Empty} title="Todavía no hay señantes registrados">Empezá por el/la docente sordo/a del curso.<//>`
      : html`<ul class="signer-list">
          ${data.data.signers.map((s) => {
            const takes = data.data.media.filter((m) => m.signerId === s.id).length;
            return html`<li class="card signer-card">
              <div>
                <p class="signer-name">${s.name} <span class="muted small">· ${s.role}${s.region ? ` · ${s.region}` : ''}</span></p>
                <p class="small">
                  ${hasConsent(s) ? html`<${Chip} tone="ok">Consentimiento ${s.consent.signedAt}<//>` : html`<${Chip} tone="bad">Falta consentimiento<//>`}
                  ${' '}${s.consent?.aiTraining ? html`<${Chip}>Autoriza IA<//>` : html`<${Chip}>No autoriza IA<//>`}
                  ${' '}<span class="muted">${takes} ${takes === 1 ? 'toma' : 'tomas'}</span>
                </p>
              </div>
              <div class="row-actions">
                <button type="button" class="btn btn-ghost btn-sm" onClick=${() => setForm(structuredClone(s))}>Editar</button>
                <${ConfirmButton} label="Borrar" className="btn btn-ghost btn-sm" disabled=${takes > 0}
                  question="¿Borrar a esta persona?" confirmLabel="Sí, borrar"
                  onConfirm=${async () => {
                    await store.deleteSigner(course.id, s.id);
                    notify('Señante borrado');
                    data.reload();
                  }} />
              </div>
            </li>`;
          })}
        </ul>`}
    <button type="button" class="btn btn-primary" onClick=${() => setForm(structuredClone(EMPTY_SIGNER))}>Registrar señante</button>
    ${form &&
    html`<${SignerForm} course=${course} initial=${form} onClose=${() => setForm(null)}
      onSaved=${() => {
        setForm(null);
        data.reload();
      }} />`}
  </section>`;
}

function SignerForm({ course, initial, onClose, onSaved }) {
  const { store, notify } = useApp();
  const [s, setS] = useState(initial);
  const [error, setError] = useState(null);
  const setC = (k, v) => setS({ ...s, consent: { ...s.consent, [k]: v } });
  return html`<${Sheet} title=${s.id ? 'Editar señante' : 'Registrar señante'} onClose=${onClose}>
    <form class="form" onSubmit=${async (e) => {
      e.preventDefault();
      setError(null);
      if (s.name.trim().length < 2) {
        setError('Falta el nombre.');
        return;
      }
      if (!s.consent.appUse || !s.consent.signedAt) {
        setError('Para grabar hace falta el consentimiento de uso en la app con su fecha de firma.');
        return;
      }
      try {
        await store.saveSigner(course.id, { ...s, name: s.name.trim(), consent: { ...s.consent, years: Number(s.consent.years) || null } });
        notify('Señante guardado');
        onSaved();
      } catch (err) {
        setError(err.message || 'No se pudo guardar.');
      }
    }}>
      <div class="field-row">
        <div class="field"><label for="sg-name">Nombre</label><input id="sg-name" value=${s.name} maxlength="60" onInput=${(e) => setS({ ...s, name: e.target.value })} /></div>
        <div class="field"><label for="sg-role">Rol</label>
          <select id="sg-role" value=${s.role} onChange=${(e) => setS({ ...s, role: e.target.value })}>
            <option value="docente">Docente</option><option value="señante">Señante</option>
          </select>
        </div>
      </div>
      <div class="field"><label for="sg-region">Región de su variante</label><input id="sg-region" value=${s.region} maxlength="60" placeholder="Rosario" onInput=${(e) => setS({ ...s, region: e.target.value })} /></div>
      <fieldset class="consent">
        <legend>Consentimiento de uso de imagen</legend>
        <p class="hint">Registrá lo que dice el documento firmado (en papel o PDF). La app no reemplaza ese documento.</p>
        <label class="check"><input id="sg-app" type="checkbox" checked=${s.consent.appUse} onChange=${(e) => setC('appUse', e.target.checked)} /><span>Autoriza el uso de sus videos en la app y materiales del curso</span></label>
        <div class="field-row">
          <div class="field"><label for="sg-terr">Territorios</label><input id="sg-terr" value=${s.consent.territories} onInput=${(e) => setC('territories', e.target.value)} /></div>
          <div class="field"><label for="sg-years">Plazo (años)</label><input id="sg-years" type="number" min="1" max="99" value=${s.consent.years} onInput=${(e) => setC('years', e.target.value)} /></div>
        </div>
        <label class="check"><input id="sg-ai" type="checkbox" checked=${s.consent.aiTraining} onChange=${(e) => setC('aiTraining', e.target.checked)} /><span>Autoriza usar sus videos para entrenar modelos de IA</span></label>
        <label class="check"><input id="sg-der" type="checkbox" checked=${s.consent.derivatives} onChange=${(e) => setC('derivatives', e.target.checked)} /><span>Autoriza obras derivadas (recortes, compilados)</span></label>
        <div class="field"><label for="sg-rev">Condiciones de baja</label><input id="sg-rev" value=${s.consent.revocation} onInput=${(e) => setC('revocation', e.target.value)} /></div>
        <div class="field-row">
          <div class="field"><label for="sg-date">Fecha de firma</label><input id="sg-date" type="date" value=${s.consent.signedAt} onInput=${(e) => setC('signedAt', e.target.value)} /></div>
          <div class="field"><label for="sg-doc">Dónde está el documento</label><input id="sg-doc" value=${s.consent.documentRef} placeholder="Carpeta Drive / acta en papel" onInput=${(e) => setC('documentRef', e.target.value)} /></div>
        </div>
      </fieldset>
      ${error && html`<p class="form-error" role="alert">${error}</p>`}
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  <//>`;
}

// ---------------------------------------------------------------- equipo
function TeamTab({ course }) {
  const { store, notify } = useApp();
  const isDemo = store.mode === 'demo';
  const staff = useAsync(() => store.listStaff(course.id), [course.id]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  if (isDemo) {
    return html`<div class="notice">
      <p>En el modo demo todo queda en este dispositivo. Con el modo piloto (Firebase) podés sumar al equipo a cualquier persona con cuenta de Google: el/la docente sordo/a, intérpretes o quien coordine.</p>
    </div>`;
  }
  return html`<section class="team-tab">
    ${staff.loading && html`<${Loading} />`}
    ${staff.error && html`<${ErrorBox} error=${staff.error} onRetry=${staff.reload} />`}
    ${staff.data &&
    html`<ul class="staff-list">
      ${staff.data.map(
        (s) => html`<li class="card staff-row">
          <span>${s.email} ${s.role === 'owner' && html`<${Chip} tone="accent">Creó el curso<//>`}</span>
          ${s.role !== 'owner' &&
          html`<${ConfirmButton} label="Quitar" className="btn btn-ghost btn-sm" question="¿Quitar del equipo?" confirmLabel="Sí, quitar"
            onConfirm=${async () => {
              await store.removeStaff(course.id, s.email);
              notify('Quitado del equipo');
              staff.reload();
            }} />`}
        </li>`,
      )}
    </ul>`}
    <form class="form card" onSubmit=${async (e) => {
      e.preventDefault();
      const value = email.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        notify('Escribí un correo válido.', 'bad');
        return;
      }
      setBusy(true);
      try {
        await store.addStaff(course.id, value);
        setEmail('');
        notify('Sumado al equipo');
        staff.reload();
      } catch (err) {
        notify(err.message || 'No se pudo sumar.', 'bad');
      } finally {
        setBusy(false);
      }
    }}>
      <div class="field">
        <label for="staff-email">Sumar al equipo (cuenta de Google)</label>
        <input id="staff-email" type="email" value=${email} placeholder="docente@gmail.com" onInput=${(e) => setEmail(e.target.value)} />
        <p class="hint">Podrá grabar, validar, publicar y ver el panel.</p>
      </div>
      <button type="submit" class="btn btn-primary" disabled=${busy}>Sumar</button>
    </form>
  </section>`;
}

// ---------------------------------------------------------------- publicar
function PublishTab({ course, onPublished }) {
  const { store, notify } = useApp();
  const data = useAsync(async () => {
    const [items, media, packs] = await Promise.all([store.listItems(course.id), store.listMedia(course.id), store.listPacks(course.id)]);
    return { items, media, packs };
  }, [course.id, course.publishedVersion]);
  const [onlyValidated, setOnlyValidated] = useState(true);
  const [busy, setBusy] = useState(false);

  if (data.loading && !data.data) return html`<${Loading} />`;
  if (data.error) return html`<${ErrorBox} error=${data.error} onRetry=${data.reload} />`;

  const ready = publishableItems(data.data.items, data.data.media, { onlyValidated });
  const byLesson = new Map();
  for (const it of ready) byLesson.set(it.lesson, (byLesson.get(it.lesson) || 0) + 1);
  const link = inviteLink(course.code);

  return html`<section class="publish-tab">
    <div class="card invite">
      <p class="eyebrow">Para los alumnos</p>
      <p class="big-code" aria-label=${`Código del curso: ${course.code.split('').join(' ')}`}>${course.code}</p>
      <p class="muted">Los alumnos entran a la app, tocan «Tengo un código de curso» y lo escriben.</p>
      ${link && html`<${CopyField} id="invite-link" label="Enlace directo para compartir (WhatsApp, mail)" value=${link}
        onCopied=${(ok) => notify(ok ? 'Enlace copiado' : 'Seleccioná el enlace y copialo', ok ? 'ok' : 'warn')} />`}
    </div>
    <div class="card">
      <h2 class="card-title">Publicar una versión nueva</h2>
      <label class="check">
        <input id="pub-only-validated" type="checkbox" checked=${onlyValidated} onChange=${(e) => setOnlyValidated(e.target.checked)} />
        <span>Publicar solo lo validado por el/la docente sordo/a (recomendado)</span>
      </label>
      ${ready.length
        ? html`<p>${`Se publican ${ready.length} ${ready.length === 1 ? 'ítem' : 'ítems'}: `}${[...byLesson.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([n, k]) => `lección ${n} (${k})`)
            .join(', ')}.</p>`
        : html`<p class="muted">Todavía no hay ítems ${onlyValidated ? 'grabados y validados' : 'grabados'}.</p>`}
      <p class="hint">Los alumnos ven la versión nueva la próxima vez que abren la app. Lo que ya aprendieron se conserva.</p>
      <button type="button" class="btn btn-primary" disabled=${busy || ready.length === 0}
        onClick=${async () => {
          setBusy(true);
          try {
            const r = await store.publish(course.id, { onlyValidated });
            notify(`Publicada la versión ${r.version} con ${r.count} ítems`);
            onPublished();
            data.reload();
          } catch (err) {
            notify(err.message || 'No se pudo publicar.', 'bad');
          } finally {
            setBusy(false);
          }
        }}>${busy ? 'Publicando…' : `Publicar versión ${(course.publishedVersion || 0) + 1}`}</button>
    </div>
    ${data.data.packs.length > 0 &&
    html`<div class="card">
      <h2 class="card-title">Versiones publicadas</h2>
      <ul class="versions">
        ${data.data.packs.map((p) => html`<li><strong>v${p.version}</strong> · ${p.count} ítems · ${fmtDateTime(p.publishedAt)}</li>`)}
      </ul>
    </div>`}
    ${IS_PREVIEW && html`<p class="muted small">En la vista previa no hay enlace para compartir: los datos quedan en este navegador.</p>`}
  </section>`;
}

