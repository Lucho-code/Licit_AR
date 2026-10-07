import { useMemo, useRef, useState } from 'preact/hooks';
import { html } from './html.js';
import { useApp } from './ctx.js';
import { prefs } from '../data/prefs.js';
import { Loading, ErrorBox, Empty, KindChip, ProgressBar } from './common.js';
import { SignPlayer, VideoTile, MirrorPractice } from './player.js';
import { cx, useAsync, useTracker } from './util.js';
import { localDateKey } from '../domain/dates.js';
import { lessonTitle, newItemsForLesson, playableItems, poolUpTo, todayStatus } from '../domain/lessons.js';
import { combineGrades, dueIds, GRADE, learnedIds, newCard, schedule } from '../domain/srs.js';
import { isCorrect, primaryMeaning, recognizeQuestions, reviewQuestions, shuffle } from '../domain/quiz.js';

function uniqueById(list) {
  return [...new Map(list.map((i) => [i.id, i])).values()];
}

/** Arma la sesión: aprender (lo nuevo) → reconocer → repasar lo que vence hoy. */
export function buildPlan(mode, pack, participant, today, rng = Math.random) {
  const srs = participant.srs || {};
  const all = playableItems(pack);
  const valid = new Set(all.map((i) => i.id));
  const byId = new Map(all.map((i) => [i.id, i]));
  const learned = learnedIds(srs);
  const learnedPool = all.filter((i) => learned.has(i.id));

  if (mode === 'lesson') {
    const status = todayStatus(pack, participant, today);
    if (status.state !== 'ready') return { kind: 'blocked', reason: status.state, status };
    const n = status.next.n;
    const fresh = newItemsForLesson(pack, n, srs);
    const freshIds = new Set(fresh.map((i) => i.id));
    const pool = poolUpTo(pack, n);
    const recognize = recognizeQuestions(fresh, pool, rng);
    const due = dueIds(srs, today, valid)
      .filter((id) => !freshIds.has(id))
      .map((id) => byId.get(id));
    const review = reviewQuestions(due, uniqueById([...pool, ...learnedPool]), rng, 8);
    return {
      kind: 'lesson',
      lesson: n,
      title: lessonTitle(pack, n),
      byId,
      steps: [
        ...fresh.map((item) => ({ type: 'learn', item })),
        ...recognize.map((q) => ({ type: 'question', q, phase: 'recognize' })),
        ...review.map((q) => ({ type: 'question', q, phase: 'review' })),
      ],
    };
  }

  let ids = dueIds(srs, today, valid);
  let extra = false;
  if (ids.length === 0) {
    ids = shuffle([...learned].filter((id) => valid.has(id)), rng).slice(0, 8);
    extra = true;
  }
  const items = ids.map((id) => byId.get(id)).filter(Boolean);
  const qs = reviewQuestions(items, learnedPool.length >= 2 ? learnedPool : all, rng, 15);
  if (qs.length === 0) return { kind: 'blocked', reason: 'review-empty' };
  return { kind: 'review', extra, byId, steps: qs.map((q) => ({ type: 'question', q, phase: 'review' })) };
}

export function Session({ mode }) {
  const { store } = useApp();
  const courseId = prefs.get('courseId');
  const { data, loading, error, reload } = useAsync(async () => {
    if (!courseId) return null;
    const [course, pack, participant] = await Promise.all([store.getCourse(courseId), store.getPack(courseId), store.getParticipant(courseId)]);
    return { course, pack, participant };
  }, [courseId, mode]);

  if (loading) return html`<div class="session"><${Loading} label="Preparando la sesión…" /></div>`;
  if (error) return html`<div class="session"><${ErrorBox} error=${error} onRetry=${reload} /></div>`;
  if (!data?.participant || !data?.pack) {
    return html`<div class="session"><${Blocked} reason=${data?.pack ? 'join' : 'empty'} /></div>`;
  }
  return html`<${Runner} key=${mode} mode=${mode} courseId=${courseId} ...${data} />`;
}

function Blocked({ reason, status }) {
  const { navigate } = useApp();
  const messages = {
    'wait-tomorrow': ['Ya hiciste la lección de hoy', `La lección ${status?.next?.n ?? ''} se habilita mañana. Mientras tanto, podés repasar.`],
    'all-done': ['Hiciste todas las lecciones publicadas', 'Seguí con el repaso diario hasta que tu docente publique más.'],
    empty: ['Todavía no hay lecciones publicadas', 'Cuando tu docente publique las primeras señas, aparecen en Hoy.'],
    'review-empty': ['Todavía no hay señas para repasar', 'Hacé la primera lección y mañana vas a tener tu primer repaso.'],
    join: ['Necesitás sumarte al curso', 'Entrá con el código que te dio tu docente.'],
  };
  const [title, body] = messages[reason] || messages.empty;
  return html`<main class="session-body">
    <${Empty} title=${title}
      action=${html`<div class="row-actions">
        ${reason === 'wait-tomorrow' && html`<button type="button" class="btn btn-primary" onClick=${() => navigate('repaso')}>Repasar</button>`}
        <button type="button" class="btn btn-ghost" onClick=${() => navigate(reason === 'join' ? 'unirse' : 'hoy')}>${reason === 'join' ? 'Sumarme' : 'Volver a Hoy'}</button>
      </div>`}>${body}<//>
  </main>`;
}

function Runner({ mode, courseId, course, pack, participant }) {
  const { store, navigate, notify } = useApp();
  const today = localDateKey();
  const plan = useMemo(() => buildPlan(mode, pack, participant, today), []);
  const { track, flush } = useTracker(store, courseId, pack.version);
  const [queue, setQueue] = useState(plan.steps || []);
  const [index, setIndex] = useState(0);
  const [mirrorItem, setMirrorItem] = useState(null);
  const [summary, setSummary] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const grades = useRef(new Map());
  const stats = useRef({ answered: 0, correct: 0, learned: 0, started: Date.now() });
  const finishing = useRef(false);

  if (plan.kind === 'blocked') return html`<div class="session"><${Blocked} reason=${plan.reason} status=${plan.status} /></div>`;

  const addGrade = (itemId, grade) => {
    if (!grades.current.has(itemId)) grades.current.set(itemId, []);
    grades.current.get(itemId).push(grade);
  };

  const finish = async () => {
    if (finishing.current) return;
    finishing.current = true;
    const srs = { ...(participant.srs || {}) };
    const touched = new Set(queue.map((s) => (s.type === 'learn' ? s.item.id : s.q.itemId)));
    for (const id of touched) {
      const grade = combineGrades(grades.current.get(id)) || GRADE.GOOD;
      if (plan.extra && grade === GRADE.GOOD) continue;
      srs[id] = schedule(srs[id] || newCard(today), grade, today);
    }
    const practiceDates = [...new Set([...(participant.practiceDates || []), today])].slice(-120);
    const patch = { srs, practiceDates, lastActiveAt: Date.now() };
    if (plan.kind === 'lesson') patch.lastLessonDate = today;
    try {
      await store.updateParticipant(courseId, patch);
    } catch (err) {
      notify('No pudimos guardar tu avance. Revisá la conexión.', 'bad');
      console.error(err);
    }
    track(plan.kind === 'lesson' ? 'lesson_done' : 'review_done', { l: plan.lesson });
    await flush();
    setSummary({
      ...stats.current,
      minutes: Math.max(1, Math.round((Date.now() - stats.current.started) / 60000)),
    });
  };

  const next = () => {
    if (index + 1 >= queue.length) finish();
    else setIndex(index + 1);
  };

  if (summary) return html`<div class="session"><${Summary} plan=${plan} pack=${pack} summary=${summary} /></div>`;

  const step = queue[index];
  const phaseLabel =
    step.type === 'learn' ? 'Aprender' : step.phase === 'recognize' ? 'Reconocer' : 'Repaso';

  return html`<div class="session">
    <header class="session-bar">
      ${leaving
        ? html`<span class="confirm" role="group" aria-label="Salir de la sesión">
            <span class="confirm-q">¿Salir? Se pierde el avance de esta sesión.</span>
            <button type="button" class="btn btn-danger btn-sm" onClick=${() => {
              flush();
              navigate('hoy');
            }}>Salir</button>
            <button type="button" class="btn btn-ghost btn-sm" onClick=${() => setLeaving(false)}>Seguir</button>
          </span>`
        : html`<button type="button" class="icon-btn" aria-label="Salir de la sesión"
            onClick=${() => (index === 0 ? navigate('hoy') : setLeaving(true))}>✕</button>
          <${ProgressBar} value=${index} max=${queue.length} label="Avance de la sesión" />
          <span class="session-step">${phaseLabel}</span>`}
    </header>
    <main class="session-body">
      ${step.type === 'learn'
        ? html`<${LearnCard} key=${`l-${index}`} step=${index} item=${step.item} plan=${plan}
            onMirror=${() => {
              track('mirror', { i: step.item.id });
              setMirrorItem(step.item);
            }}
            onNext=${() => {
              track('learn', { i: step.item.id, l: plan.lesson });
              stats.current.learned += 1;
              next();
            }} />`
        : html`<${QuestionCard} key=${`q-${index}`} index=${index} step=${step} byId=${plan.byId}
            onAnswer=${(optionId, ms) => {
              const ok = isCorrect(step.q, optionId);
              track('answer', { i: step.q.itemId, ok, ms, q: step.q.type, s: step.phase, l: plan.lesson });
              if (!step.retry) {
                stats.current.answered += 1;
                if (ok) stats.current.correct += 1;
              }
              addGrade(step.q.itemId, ok ? GRADE.GOOD : GRADE.AGAIN);
              if (!ok && !step.retry) setQueue((q) => [...q, { ...step, retry: true }]);
            }}
            onNext=${next} />`}
    </main>
    ${mirrorItem &&
    html`<${MirrorPractice} store=${store} item=${mirrorItem}
      onGrade=${(g) => {
        track('self', { i: mirrorItem.id, g });
        addGrade(mirrorItem.id, g);
        setMirrorItem(null);
      }}
      onClose=${() => setMirrorItem(null)} />`}
  </div>`;
}

function LearnCard({ step, item, plan, onMirror, onNext }) {
  const { store } = useApp();
  const meaning = primaryMeaning(item);
  return html`<article class="learn-card" data-step=${step}>
    <header class="learn-head">
      <p class="eyebrow">${plan.kind === 'lesson' ? `Lección ${plan.lesson} · ${plan.title}` : 'Repaso'}</p>
      <h1 class="display meaning">${meaning}</h1>
      <div class="chips"><${KindChip} kind=${item.kind} />${item.region && html`<span class="muted small">Variante: ${item.region}</span>`}</div>
    </header>
    <${SignPlayer} store=${store} media=${item.media} label=${`Seña de «${meaning}»`} />
    ${item.meanings.length > 1 && html`<p><strong>También:</strong> ${item.meanings.slice(1).join(', ')}</p>`}
    ${item.notes && html`<p class="note">${item.notes}</p>`}
    <div class="learn-actions">
      <button type="button" class="btn btn-ghost btn-lg" onClick=${onMirror}>Practicar frente al espejo</button>
      <button type="button" class="btn btn-primary btn-lg" onClick=${onNext}>Siguiente</button>
    </div>
  </article>`;
}

function QuestionCard({ index, step, byId, onAnswer, onNext }) {
  const { store } = useApp();
  const { q } = step;
  const item = byId.get(q.itemId);
  const [chosen, setChosen] = useState(null);
  const shownAt = useRef(Date.now());
  const answered = chosen !== null;
  const ok = answered && chosen === q.answerId;
  const meaning = primaryMeaning(item);

  const pick = (id) => {
    if (answered) return;
    setChosen(id);
    onAnswer(id, Date.now() - shownAt.current);
  };
  const optionClass = (id) =>
    cx(answered && id === q.answerId && 'is-correct', answered && id === chosen && id !== q.answerId && 'is-wrong', answered && id !== chosen && id !== q.answerId && 'is-dim');

  return html`<article class="question" data-step=${index} data-answer=${q.answerId} data-type=${q.type}>
    ${step.retry && html`<p class="eyebrow">Otra vez</p>`}
    ${q.type === 'video-to-text'
      ? html`<h1 class="title">${item.kind === 'phrase' ? '¿Qué dice esta frase?' : '¿Qué significa esta seña?'}</h1>
          <${SignPlayer} store=${store} media=${item.media} label="Video de la pregunta" showCaption=${false} />
          <div class="options" role="group" aria-label="Opciones">
            ${q.options.map(
              (o) => html`<button type="button" class=${cx('option', optionClass(o.id))} data-option-id=${o.id} disabled=${answered && o.id !== chosen && o.id !== q.answerId}
                aria-pressed=${chosen === o.id} onClick=${() => pick(o.id)}>${o.label}</button>`,
            )}
          </div>`
      : html`<h1 class="title">¿Cuál es la seña de «${meaning}»?</h1>
          <div class="video-options" role="group" aria-label="Opciones en video">
            ${q.options.map(
              (o, i) => html`<button type="button" class=${cx('video-option', optionClass(o.id))} data-option-id=${o.id}
                aria-label=${`Opción ${i + 1}`} aria-pressed=${chosen === o.id} onClick=${() => pick(o.id)}>
                <${VideoTile} store=${store} media=${byId.get(o.id)?.media} label=${`Video de la opción ${i + 1}`} />
                <span class="video-option-n">${i + 1}</span>
              </button>`,
            )}
          </div>`}
    ${answered &&
    html`<div class=${cx('feedback', ok ? 'feedback-ok' : 'feedback-bad')} role="status">
      <p>${ok ? '¡Bien!' : html`Era <strong>«${meaning}»</strong>. La vas a volver a ver.`}</p>
      <button type="button" class="btn btn-primary btn-lg" autofocus onClick=${onNext}>Continuar</button>
    </div>`}
  </article>`;
}

function Summary({ plan, pack, summary }) {
  const { navigate } = useApp();
  const nextLesson = plan.kind === 'lesson' ? plan.lesson + 1 : null;
  const hasNext = nextLesson && playableItems(pack).some((i) => i.lesson === nextLesson);
  return html`<main class="session-body">
    <section class="summary">
      <p class="eyebrow">${plan.kind === 'lesson' ? `Lección ${plan.lesson} · ${plan.title}` : 'Repaso'}</p>
      <h1 class="display">${plan.kind === 'lesson' ? '¡Lección completa!' : '¡Repaso hecho!'}</h1>
      <dl class="stats">
        <div><dt>Aciertos</dt><dd>${summary.correct} de ${summary.answered}</dd></div>
        ${plan.kind === 'lesson' && html`<div><dt>Señas nuevas</dt><dd>${summary.learned}</dd></div>`}
        <div><dt>Minutos</dt><dd>${summary.minutes}</dd></div>
      </dl>
      <p class="lead">
        ${plan.kind === 'lesson'
          ? hasNext
            ? `Mañana se habilita la lección ${nextLesson}: «${lessonTitle(pack, nextLesson)}».`
            : 'Por ahora no hay más lecciones publicadas. Mañana te espera el repaso.'
          : 'Las que te costaron vuelven mañana; las que salieron bien, en unos días.'}
      </p>
      <button type="button" class="btn btn-primary btn-lg btn-block" onClick=${() => navigate('hoy')}>Volver a Hoy</button>
    </section>
  </main>`;
}
