import { useEffect, useMemo, useState } from 'preact/hooks';
import { html } from './html.js';
import { useApp } from './ctx.js';
import { prefs } from '../data/prefs.js';
import { Loading, ErrorBox, Empty, KindChip, Sheet } from './common.js';
import { SignPlayer, MirrorPractice } from './player.js';
import { cx, useAsync, streakFrom, useTracker } from './util.js';
import { isValidCode, normalizeCode } from '../domain/ids.js';
import { addDays, formatDateLong, localDateKey, weekdayOf, weekStart, WEEKDAYS, WEEKDAYS_SHORT } from '../domain/dates.js';
import { lessonItems, lessonTitle, playableItems, todayStatus } from '../domain/lessons.js';
import { dueIds, learnedIds } from '../domain/srs.js';
import { primaryMeaning } from '../domain/quiz.js';

export function rememberCourse(courseId, code, name) {
  prefs.set('courseId', courseId);
  const list = prefs.get('courses', []).filter((c) => c.courseId !== courseId);
  prefs.set('courses', [{ courseId, code, name }, ...list].slice(0, 8));
}

// ---------------------------------------------------------------- bienvenida
export function Welcome() {
  const { store, navigate, notify } = useApp();
  const isDemo = store.mode === 'demo';
  const [busy, setBusy] = useState(false);

  const trySample = async () => {
    setBusy(true);
    try {
      const hit = await store.findCourseByCode('PRUEBA');
      if (!hit) {
        notify('No encontramos el curso de muestra. Podés reiniciar el demo desde Estudio.', 'bad');
        return;
      }
      await store.joinCourse(hit.courseId, prefs.get('alias', 'Vos'));
      rememberCourse(hit.courseId, 'PRUEBA', hit.name);
      navigate('hoy');
    } finally {
      setBusy(false);
    }
  };

  return html`<section class="hero">
      <p class="eyebrow">Lengua de Señas Argentina</p>
      <h1 class="display">Practicá entre una clase y la otra.</h1>
      <p class="lead">
        Videos de tu docente, cámara lenta, espejo y un repaso corto cada día para no olvidar lo que viste en clase.
      </p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary btn-lg" onClick=${() => navigate('unirse')}>Tengo un código de curso</button>
        ${isDemo
          ? html`<button type="button" class="btn btn-ghost btn-lg" disabled=${busy} onClick=${trySample}>Probar el curso de muestra</button>`
          : html`<a class="btn btn-ghost btn-lg" href="?demo">Ver una demostración</a>`}
      </div>
      <p class="hero-foot">
        <a href="#/estudio" onClick=${(e) => {
          e.preventDefault();
          navigate('estudio');
        }}>Soy docente o coordino un curso →</a>
      </p>
    </section>
    <section class="howto">
      <h2 class="section-title">Cómo funciona</h2>
      <ol class="steps">
        <li><strong>Tu docente graba las señas</strong> de cada clase y las publica en la app.</li>
        <li><strong>Cada día hacés una lección corta:</strong> mirás la seña, la practicás frente al espejo y respondés.</li>
        <li><strong>El repaso te las vuelve a mostrar</strong> justo antes de que se te olviden.</li>
      </ol>
      <p class="muted small">La cámara se usa solo en tu teléfono, como un espejo. No se graba ni se envía nada.</p>
    </section>`;
}

// ---------------------------------------------------------------- unirse
export function Join({ code: initial = '' }) {
  const { store, navigate, notify } = useApp();
  const [code, setCode] = useState(normalizeCode(initial));
  const [alias, setAlias] = useState(prefs.get('alias', ''));
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const c = normalizeCode(code);
    if (!isValidCode(c)) {
      setError('El código tiene 6 letras y números (sin O, I, L, 0 ni 1). Revisalo con tu docente.');
      return;
    }
    if (alias.trim().length < 2) {
      setError('Escribí cómo querés que te llamemos (al menos 2 letras).');
      return;
    }
    if (!agree) {
      setError('Para sumarte, aceptá que tu docente vea tu avance.');
      return;
    }
    setBusy(true);
    try {
      const hit = await store.findCourseByCode(c);
      if (!hit) {
        setError('No encontramos ese código. Revisalo o pedíselo a tu docente.');
        return;
      }
      await store.joinCourse(hit.courseId, alias.trim());
      prefs.set('alias', alias.trim());
      rememberCourse(hit.courseId, c, hit.name);
      notify(`Te sumaste a «${hit.name}»`);
      navigate('hoy');
    } catch (err) {
      setError(err.message || 'No pudimos sumarte al curso. Probá de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return html`<form class="card form" onSubmit=${submit} novalidate>
    <h1 class="title">Sumate a tu curso</h1>
    <div class="field">
      <label for="join-code">Código del curso</label>
      <input id="join-code" class="code-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
        placeholder="ABC234" value=${code} onInput=${(e) => setCode(normalizeCode(e.target.value))} />
      <p class="hint">Te lo da tu docente: 6 letras y números.</p>
    </div>
    <div class="field">
      <label for="join-alias">¿Cómo te llamamos?</label>
      <input id="join-alias" maxlength="30" autocomplete="nickname" value=${alias} onInput=${(e) => setAlias(e.target.value)} />
      <p class="hint">Tu docente lo ve en el panel del curso. Puede ser un apodo.</p>
    </div>
    <label class="check">
      <input id="join-agree" type="checkbox" checked=${agree} onChange=${(e) => setAgree(e.target.checked)} />
      <span>Acepto que mi docente vea mi avance: días de práctica y respuestas. La cámara no graba nada.</span>
    </label>
    ${error && html`<p class="form-error" role="alert">${error}</p>`}
    <button type="submit" class="btn btn-primary btn-lg btn-block" disabled=${busy}>${busy ? 'Entrando…' : 'Entrar al curso'}</button>
  </form>`;
}

// ---------------------------------------------------------------- hoy
function useCourseData() {
  const { store } = useApp();
  const courseId = prefs.get('courseId');
  const state = useAsync(async () => {
    if (!courseId) return null;
    const [course, pack, participant] = await Promise.all([
      store.getCourse(courseId),
      store.getPack(courseId),
      store.getParticipant(courseId),
    ]);
    return { course, pack, participant };
  }, [courseId]);
  return { courseId, ...state };
}

function NeedsJoin({ courseId }) {
  const { navigate } = useApp();
  const remembered = prefs.get('courses', []).find((c) => c.courseId === courseId);
  return html`<${Empty} title="Necesitás sumarte a este curso en este dispositivo"
    action=${html`<button type="button" class="btn btn-primary" onClick=${() => navigate(remembered ? `unirse/${remembered.code}` : 'unirse')}>Sumarme</button>`}>
    Si ya te habías sumado desde otro teléfono, volvé a entrar con el mismo código.
  <//>`;
}

function WeekStrip({ today, practiced, classWeekday }) {
  const start = weekStart(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const hasClass = classWeekday !== null && classWeekday !== undefined && classWeekday !== '';
  return html`<ol class="week" aria-label="Tu semana">
    ${days.map((d) => {
      const wd = weekdayOf(d);
      const isClass = hasClass && Number(classWeekday) === wd;
      const done = practiced.has(d);
      const label = `${WEEKDAYS[wd]} ${Number(d.slice(8))}${done ? ', practicaste' : ''}${isClass ? ', día de clase' : ''}${d === today ? ', hoy' : ''}`;
      return html`<li class=${cx('week-day', d === today && 'is-today', isClass && 'is-class', done && 'is-done', d > today && 'is-future')} aria-label=${label}>
        <span class="wd" aria-hidden="true">${WEEKDAYS_SHORT[wd]}</span>
        <span class="dn" aria-hidden="true">${Number(d.slice(8))}</span>
        <span class="mark" aria-hidden="true"></span>
        ${isClass && html`<span class="tag" aria-hidden="true">clase</span>`}
      </li>`;
    })}
  </ol>`;
}

export function Today() {
  const { navigate } = useApp();
  const { courseId, data, loading, error, reload } = useCourseData();
  const today = localDateKey();

  useEffect(() => {
    if (!courseId) navigate('bienvenida');
  }, [courseId]);

  if (!courseId || loading) return html`<${Loading} />`;
  if (error) return html`<${ErrorBox} error=${error} onRetry=${reload} />`;
  if (!data?.course) {
    return html`<${Empty} title="No encontramos tu curso"
      action=${html`<button type="button" class="btn btn-primary" onClick=${() => navigate('unirse')}>Sumarme a un curso</button>`}>
      Puede que tu docente lo haya cerrado o que el código haya cambiado.
    <//>`;
  }
  if (!data.participant) return html`<${NeedsJoin} courseId=${courseId} />`;

  const { course, pack, participant } = data;
  const status = todayStatus(pack, participant, today);
  const valid = new Set(playableItems(pack).map((i) => i.id));
  const due = dueIds(participant.srs, today, valid);
  const learned = [...learnedIds(participant.srs)].filter((id) => valid.has(id)).length;
  const practiced = new Set(participant.practiceDates || []);
  const streak = streakFrom(participant.practiceDates, today);
  const next = status.next;
  const nextItems = next ? lessonItems(pack, next.n) : [];
  const nSigns = nextItems.filter((i) => i.kind === 'sign').length;
  const nPhrases = nextItems.filter((i) => i.kind === 'phrase').length;

  return html`<div class="today">
    <header class="page-head">
      <p class="eyebrow">${course.name}</p>
      <h1 class="title">Hoy, ${formatDateLong(today).replace(/ \d{4}$/, '')}</h1>
    </header>

    <${WeekStrip} today=${today} practiced=${practiced} classWeekday=${course.classWeekday} />

    <section class="card lesson-card" aria-labelledby="lesson-title">
      ${status.state === 'empty' &&
      html`<p class="eyebrow">Lecciones</p>
        <h2 id="lesson-title" class="card-title">Todavía no hay lecciones publicadas</h2>
        <p class="muted">Cuando tu docente publique las primeras señas, aparecen acá.</p>`}
      ${status.state === 'ready' &&
      html`<p class="eyebrow">Lección ${next.n} de ${status.total}</p>
        <h2 id="lesson-title" class="card-title">${lessonTitle(pack, next.n)}</h2>
        <p class="muted">${[nSigns && `${nSigns} ${nSigns === 1 ? 'seña' : 'señas'}`, nPhrases && `${nPhrases} ${nPhrases === 1 ? 'frase' : 'frases'}`].filter(Boolean).join(' y ')} · unos 8 minutos</p>
        <button type="button" class="btn btn-primary btn-lg btn-block" onClick=${() => navigate('leccion')}>
          ${next.learned > 0 ? 'Seguir la lección' : 'Empezar la lección'}
        </button>`}
      ${status.state === 'wait-tomorrow' &&
      html`<p class="eyebrow">Lección de hoy: hecha</p>
        <h2 id="lesson-title" class="card-title">Mañana sigue «${lessonTitle(pack, next.n)}»</h2>
        <p class="muted">Una lección por día ayuda a que lo aprendido se asiente. Mientras tanto, podés repasar.</p>`}
      ${status.state === 'all-done' &&
      html`<p class="eyebrow">${status.total} de ${status.total} lecciones</p>
        <h2 id="lesson-title" class="card-title">Hiciste todas las lecciones publicadas</h2>
        <p class="muted">Seguí con el repaso diario. Cuando tu docente publique más, aparecen acá.</p>`}
    </section>

    <section class="card review-card" aria-labelledby="review-title">
      <div>
        <p class="eyebrow">Repaso</p>
        <h2 id="review-title" class="card-title">${due.length ? `${due.length} ${due.length === 1 ? 'seña' : 'señas'} para hoy` : 'Nada pendiente hoy'}</h2>
      </div>
      <button type="button" class=${cx('btn', due.length ? 'btn-primary' : 'btn-ghost')} disabled=${learned === 0}
        onClick=${() => navigate('repaso')}>${due.length ? 'Repasar' : 'Repasar igual'}</button>
    </section>

    <dl class="stats">
      <div><dt>Días con práctica</dt><dd>${practiced.size}</dd></div>
      <div><dt>Señas aprendidas</dt><dd>${learned}</dd></div>
      <div><dt>Racha</dt><dd>${streak} ${streak === 1 ? 'día' : 'días'}</dd></div>
    </dl>

    <${CourseSwitcher} current=${courseId} />
  </div>`;
}

function CourseSwitcher({ current }) {
  const { navigate } = useApp();
  const courses = prefs.get('courses', []);
  const others = courses.filter((c) => c.courseId !== current);
  return html`<details class="switcher">
    <summary>Cambiar de curso</summary>
    <ul>
      ${others.map(
        (c) => html`<li><button type="button" class="link-btn" onClick=${() => {
          prefs.set('courseId', c.courseId);
          navigate('hoy');
          location.reload();
        }}>${c.name} <span class="muted">(${c.code})</span></button></li>`,
      )}
      <li><button type="button" class="link-btn" onClick=${() => navigate('unirse')}>Sumarme a otro curso con un código</button></li>
    </ul>
  </details>`;
}

// ---------------------------------------------------------------- mis señas
export function MySigns() {
  const { store, navigate } = useApp();
  const { courseId, data, loading, error, reload } = useCourseData();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const [mirror, setMirror] = useState(false);
  const { track } = useTracker(store, courseId, data?.pack?.version);

  const items = useMemo(() => {
    if (!data?.pack || !data?.participant) return [];
    const learned = learnedIds(data.participant.srs);
    return playableItems(data.pack).filter((i) => learned.has(i.id));
  }, [data]);

  useEffect(() => {
    if (!courseId) navigate('bienvenida');
  }, [courseId]);

  if (!courseId || loading) return html`<${Loading} />`;
  if (error) return html`<${ErrorBox} error=${error} onRetry=${reload} />`;
  if (!data?.participant) return html`<${NeedsJoin} courseId=${courseId} />`;

  const q = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const shown = q
    ? items.filter((i) => i.meanings.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q))
    : items;

  return html`<div class="mysigns">
    <header class="page-head">
      <p class="eyebrow">${data.course?.name || ''}</p>
      <h1 class="title">Mis señas</h1>
    </header>
    ${items.length === 0
      ? html`<${Empty} title="Todavía no aprendiste señas"
          action=${html`<button type="button" class="btn btn-primary" onClick=${() => navigate('hoy')}>Ir a la lección de hoy</button>`}>
          Las señas aparecen acá a medida que hacés las lecciones.
        <//>`
      : html`<div class="field">
            <label for="signs-search">Buscar por palabra</label>
            <input id="signs-search" type="search" value=${query} onInput=${(e) => setQuery(e.target.value)} placeholder="Ej.: gracias" />
          </div>
          <ul class="sign-list">
            ${shown.map(
              (it) => html`<li>
                <button type="button" class="sign-row" onClick=${() => setOpen(it)}>
                  <span class="sign-row-main">${primaryMeaning(it)}</span>
                  <span class="sign-row-meta"><${KindChip} kind=${it.kind} /> <span class="muted">Lección ${it.lesson}</span></span>
                </button>
              </li>`,
            )}
          </ul>
          ${shown.length === 0 && html`<p class="muted">No hay señas que coincidan con «${query}».</p>`}`}
    ${open && !mirror &&
    html`<${Sheet} title=${primaryMeaning(open)} onClose=${() => setOpen(null)}>
      <${SignPlayer} store=${store} media=${open.media} label=${`Seña de «${primaryMeaning(open)}»`} />
      ${open.meanings.length > 1 && html`<p><strong>También:</strong> ${open.meanings.slice(1).join(', ')}</p>`}
      ${open.notes && html`<p class="note">${open.notes}</p>`}
      ${open.region && html`<p class="muted small">Variante: ${open.region}</p>`}
      <button type="button" class="btn btn-ghost btn-block" onClick=${() => {
        track('mirror', { i: open.id });
        setMirror(true);
      }}>Practicar frente al espejo</button>
    <//>`}
    ${open && mirror &&
    html`<${MirrorPractice} store=${store} item=${open}
      onGrade=${(g) => {
        track('self', { i: open.id, g });
        setMirror(false);
      }}
      onClose=${() => setMirror(false)} />`}
  </div>`;
}
