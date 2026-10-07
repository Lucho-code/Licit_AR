import { useMemo, useState } from 'preact/hooks';
import { html } from './html.js';
import { useApp } from './ctx.js';
import { Loading, ErrorBox, ConfirmButton } from './common.js';
import { cx, useAsync, fmtNumber, fmtDateTime, saveTextFile, copyText } from './util.js';
import { cohortMetrics, DEFAULT_THRESHOLDS, pct } from '../domain/metrics.js';
import { localDateKey, formatDateShort, WEEKDAYS } from '../domain/dates.js';
import { toCSV, decimal } from '../domain/csv.js';

const VERDICT_STYLE = {
  confirma: ['ok', '✓'],
  'confirma-uso': ['ok', '✓'],
  refuta: ['bad', '✕'],
  'no-concluyente': ['warn', '?'],
  'en-curso': ['accent', '◐'],
  'sin-datos': ['neutral', '·'],
};

export function PanelTab({ course, onCourseChange }) {
  const { store, notify } = useApp();
  const data = useAsync(async () => {
    const [participants, events] = await Promise.all([store.listParticipants(course.id), store.listEvents(course.id)]);
    return { participants, events };
  }, [course.id]);
  const [busy, setBusy] = useState(false);
  const today = localDateKey();
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(course.pilot?.thresholds || {}) };
  const paymentSignal = !!course.pilot?.paymentSignal;

  const metrics = useMemo(() => {
    if (!data.data) return null;
    return cohortMetrics({
      participants: data.data.participants,
      events: data.data.events,
      classWeekday: course.classWeekday,
      thresholds,
      paymentSignal,
      todayKey: today,
    });
  }, [data.data, course.pilot, course.classWeekday]);

  if (data.loading && !data.data) return html`<${Loading} label="Calculando el panel…" />`;
  if (data.error) return html`<${ErrorBox} error=${data.error} onRetry=${data.reload} />`;

  const { summary, verdict, stats } = metrics;
  const simulated = data.data.participants.some((p) => p.simulated);
  const [tone, icon] = VERDICT_STYLE[verdict.code] || VERDICT_STYLE['sin-datos'];
  const thr = metrics.thresholds;

  const exportCSV = async (kind) => {
    let text;
    let name;
    if (kind === 'participants') {
      name = `entreclases-participantes-${course.code}-${today}.csv`;
      text = toCSV(stats, [
        { label: 'Alumno', key: 'alias' },
        { label: 'Se sumó', key: 'joinedDate' },
        { label: `Días activos (primeros ${thr.windowDays})`, key: 'activeInWindow' },
        { label: 'Lecciones completas', key: 'lessonsDone' },
        { label: 'Respuestas', key: 'answers' },
        { label: 'Aciertos %', value: (s) => (s.accuracy === null ? '' : decimal(s.accuracy * 100)) },
        { label: 'Completó', value: (s) => (s.completed ? 'sí' : 'no') },
        { label: 'Último uso', value: (s) => (s.lastAt ? new Date(s.lastAt).toISOString() : '') },
      ]);
    } else {
      name = `entreclases-eventos-${course.code}-${today}.csv`;
      const alias = new Map(data.data.participants.map((p) => [p.uid, p.alias]));
      text = toCSV(data.data.events, [
        { label: 'Alumno', value: (e) => alias.get(e.uid) || e.uid },
        { label: 'Fecha', key: 'd' },
        { label: 'Hora', value: (e) => (e.at ? new Date(e.at).toISOString() : '') },
        { label: 'Evento', key: 't' },
        { label: 'Ítem', key: 'i' },
        { label: 'Lección', key: 'l' },
        { label: 'Correcto', value: (e) => (e.ok === undefined ? '' : e.ok ? 'sí' : 'no') },
        { label: 'Autoevaluación', key: 'g' },
        { label: 'Tiempo de respuesta (ms)', key: 'ms' },
        { label: 'Versión de contenido', key: 'v' },
      ]);
    }
    const result = await saveTextFile(name, text);
    if (result === 'saved') notify('Archivo listo');
    else if (result === 'declined') notify('Descarga cancelada', 'warn');
    else notify((await copyText(text)) ? 'Copiado: pegalo en una planilla' : 'No se pudo exportar en esta vista', 'warn');
  };

  return html`<section class="panel-tab">
    ${simulated &&
    html`<div class="notice notice-warn sim-banner"><p><strong>Datos simulados.</strong> Hay alumnos de ejemplo generados para entender el panel. No son personas reales.</p></div>`}

    <div class=${cx('verdict card', `verdict-${tone}`)} role="status">
      <span class="verdict-icon" aria-hidden="true">${icon}</span>
      <div>
        <p class="eyebrow">Veredicto del piloto</p>
        <h2 class="verdict-title">${verdict.title}</h2>
        <p>${verdict.detail}</p>
        ${verdict.preClassFlag &&
        html`<p class="text-warn"><strong>Atención:</strong> ${pct(summary.preClass?.share)} de los días de práctica caen el ${WEEKDAYS[summary.preClass.weekday]}, el día antes de la clase.</p>`}
      </div>
    </div>

    <dl class="kpis kpis-criteria" aria-label="Criterios del piloto">
      <${Kpi} label=${`Practicaron ${thr.minActiveDays}+ de ${thr.windowDays} días`} value=${pct(summary.completionShare)}
        note=${`Meta: ${pct(thr.confirmShare)} o más`} status=${summary.completionShare === null ? null : summary.completionShare >= thr.confirmShare ? 'ok' : 'warn'} />
      <${Kpi} label=${`Llegaron a la lección ${thr.reachLesson}`} value=${pct(summary.reachShare)}
        note=${`Se refuta con menos de ${pct(thr.refuteShare)}`} status=${summary.reachShare === null ? null : summary.reachShare < thr.refuteShare ? 'bad' : 'ok'} />
      ${summary.preClass &&
      html`<${Kpi} label="Práctica el día antes de clase" value=${pct(summary.preClass.share)}
        note=${`Alerta desde ${pct(thr.preClassShare)}`} status=${summary.preClass.share >= thr.preClassShare ? 'warn' : 'ok'} />`}
    </dl>
    <dl class="kpis" aria-label="Uso">
      <${Kpi} label="Alumnos" value=${summary.n} note=${summary.n ? `${summary.ended} con la ventana terminada` : 'Todavía nadie se sumó'} />
      <${Kpi} label="Días activos, promedio" value=${fmtNumber(summary.avgActiveDays)} note=${`de ${thr.windowDays}`} />
      <${Kpi} label="Aciertos, promedio" value=${pct(summary.avgAccuracy)} />
      <${Kpi} label="Minutos por día, mediana" value=${fmtNumber(summary.medianMinutes, 0)} />
    </dl>

    ${summary.n > 0 &&
    html`<div class="charts">
      <${ActiveDaysChart} stats=${stats} thr=${thr} />
      <${RetentionChart} retention=${summary.retention} />
    </div>`}

    ${summary.n > 0 &&
    html`<div class="card">
      <h2 class="card-title">Alumnos</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th scope="col">Alumno</th><th scope="col">Se sumó</th><th scope="col" class="num">Días activos</th><th scope="col" class="num">Lecciones</th><th scope="col" class="num">Aciertos</th><th scope="col">Último uso</th><th scope="col">Estado</th></tr></thead>
          <tbody>
            ${stats
              .slice()
              .sort((a, b) => b.activeInWindow - a.activeInWindow || a.alias.localeCompare(b.alias))
              .map(
                (s) => html`<tr>
                  <th scope="row">${s.alias}</th>
                  <td>${formatDateShort(s.joinedDate)}</td>
                  <td class="num">${s.activeInWindow}</td>
                  <td class="num">${s.lessonsDone}</td>
                  <td class="num">${pct(s.accuracy)}</td>
                  <td>${fmtDateTime(s.lastAt)}</td>
                  <td>${s.completed ? html`<span class="state state-ok">✓ Completó</span>` : s.windowEnded ? html`<span class="state state-bad">✕ No llegó</span>` : html`<span class="state">◐ En curso</span>`}</td>
                </tr>`,
              )}
          </tbody>
        </table>
      </div>
    </div>`}

    <div class="card">
      <h2 class="card-title">Exportar</h2>
      <p class="muted">Planillas para Excel o Google Sheets (separador punto y coma).</p>
      <div class="row-actions">
        <button type="button" class="btn btn-ghost" onClick=${() => exportCSV('participants')}>Participantes (CSV)</button>
        <button type="button" class="btn btn-ghost" onClick=${() => exportCSV('events')}>Eventos (CSV)</button>
      </div>
    </div>

    <${CriteriaForm} course=${course} thr=${thr} paymentSignal=${paymentSignal} onSaved=${onCourseChange} />

    ${store.mode === 'demo' &&
    html`<div class="card">
      <h2 class="card-title">Probar el panel con una cohorte simulada</h2>
      <p class="muted">Genera 40 alumnos de ejemplo con distintos hábitos (constantes, irregulares, que abandonan y que practican solo antes de clase). Quedan marcados como simulados.</p>
      <div class="row-actions">
        <button type="button" class="btn btn-primary" disabled=${busy} onClick=${async () => {
          setBusy(true);
          try {
            await store.simulate(course.id);
            notify('Cohorte simulada cargada');
            data.reload();
          } finally {
            setBusy(false);
          }
        }}>Simular 40 alumnos</button>
        ${simulated &&
        html`<${ConfirmButton} label="Borrar la simulación" question="¿Borrar los alumnos simulados?" confirmLabel="Sí, borrar"
          onConfirm=${async () => {
            await store.clearSimulation(course.id);
            notify('Simulación borrada');
            data.reload();
          }} />`}
      </div>
    </div>`}
  </section>`;
}

function Kpi({ label, value, note, status }) {
  const mark = status === 'ok' ? '✓' : status === 'bad' ? '✕' : status === 'warn' ? '!' : null;
  return html`<div class=${cx('kpi', status && `kpi-${status}`)}>
    <dt>${label}</dt>
    <dd>
      <span class="kpi-value">${value}</span>
      ${mark && html`<span class="kpi-mark" aria-label=${status === 'ok' ? 'cumple' : status === 'bad' ? 'no cumple' : 'atención'}>${mark}</span>`}
    </dd>
    ${note && html`<dd class="kpi-note">${note}</dd>`}
  </div>`;
}

/** Barras HTML (escalan bien en el celular). Un solo color; el detalle va en el tooltip y en la tabla. */
function Bars({ id, title, subtitle, data, yMax, yTicks, fmtTick, band, tableHead }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  return html`<figure class="card chart" aria-labelledby=${`${id}-t`}>
    <figcaption>
      <h3 id=${`${id}-t`} class="card-title">${title}</h3>
      ${subtitle && html`<p class="muted small">${subtitle}</p>`}
    </figcaption>
    <div class="bars" onPointerLeave=${() => setHover(null)}>
      <div class="bars-plot">
        ${yTicks.map(
          (t) => html`<div class="gridline" style=${`bottom:${(t / yMax) * 100}%`}><span>${fmtTick(t)}</span></div>`,
        )}
        ${band &&
        html`<div class="bars-band" style=${`left:${(band.from / n) * 100}%;width:${((n - band.from) / n) * 100}%`}><span>${band.label}</span></div>`}
        <ol class="bars-cols" style=${`--n:${n}`}>
          ${data.map(
            (d, i) => html`<li class=${cx('bar-col', hover === i && 'is-hover')}>
              <button type="button" class="bar-hit" aria-label=${d.aria}
                onPointerEnter=${() => setHover(i)} onFocus=${() => setHover(i)} onBlur=${() => setHover(null)} onClick=${() => setHover(i)}>
                ${d.value > 0 && html`<span class="bar" style=${`height:${Math.max(1.5, (d.value / yMax) * 100)}%`}></span>`}
              </button>
            </li>`,
          )}
        </ol>
        ${hover !== null &&
        html`<div class="tooltip" role="presentation" style=${`left:${((hover + 0.5) / n) * 100}%;bottom:${Math.min(92, (data[hover].value / yMax) * 100 + 6)}%`}>
          <strong>${data[hover].valueLabel}</strong><span>${data[hover].detail}</span>
        </div>`}
      </div>
      <ol class="bars-x" style=${`--n:${n}`} aria-hidden="true">${data.map((d) => html`<li>${d.x}</li>`)}</ol>
    </div>
    <details class="chart-table">
      <summary>Ver como tabla</summary>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>${tableHead.map((h) => html`<th scope="col">${h}</th>`)}</tr></thead>
          <tbody>${data.map((d) => html`<tr><th scope="row">${d.x}</th><td class="num">${d.valueLabel}</td><td>${d.detail}</td></tr>`)}</tbody>
        </table>
      </div>
    </details>
  </figure>`;
}

function niceMax(v) {
  if (v <= 4) return 4;
  const step = v <= 10 ? 2 : v <= 25 ? 5 : 10;
  return Math.ceil(v / step) * step;
}

function ActiveDaysChart({ stats, thr }) {
  const counts = Array.from({ length: thr.windowDays + 1 }, (_, k) => stats.filter((s) => s.activeInWindow === k).length);
  const yMax = niceMax(Math.max(...counts));
  const step = yMax / 4;
  return html`<${Bars} id="chart-days" title="Días con práctica por alumno"
    subtitle=${`Cuántos alumnos practicaron 0, 1, 2… de sus primeros ${thr.windowDays} días`}
    data=${counts.map((c, k) => ({
      x: String(k),
      value: c,
      valueLabel: `${c} ${c === 1 ? 'alumno' : 'alumnos'}`,
      detail: `${k} ${k === 1 ? 'día' : 'días'} con práctica`,
      aria: `${k} días: ${c} alumnos`,
    }))}
    yMax=${yMax} yTicks=${[step, step * 2, step * 3, yMax]} fmtTick=${(t) => String(Math.round(t))}
    band=${{ from: thr.minActiveDays, label: `Meta: ${thr.minActiveDays}+ días` }}
    tableHead=${['Días', 'Alumnos', 'Detalle']} />`;
}

function RetentionChart({ retention }) {
  return html`<${Bars} id="chart-retention" title="Práctica por día de la cohorte"
    subtitle="De quienes ya llegaron a ese día, qué parte practicó"
    data=${retention.map((r) => ({
      x: `D${r.day}`,
      value: r.share === null ? 0 : r.share,
      valueLabel: r.share === null ? '—' : pct(r.share),
      detail: r.eligible ? `${r.active} de ${r.eligible}` : 'Todavía nadie llegó a este día',
      aria: `Día ${r.day}: ${r.share === null ? 'sin datos' : `${pct(r.share)}, ${r.active} de ${r.eligible}`}`,
    }))}
    yMax=${1} yTicks=${[0.25, 0.5, 0.75, 1]} fmtTick=${(t) => pct(t)}
    tableHead=${['Día', 'Practicó', 'Alumnos']} />`;
}

function CriteriaForm({ course, thr, paymentSignal, onSaved }) {
  const { store, notify } = useApp();
  const [f, setF] = useState({
    windowDays: thr.windowDays,
    minActiveDays: thr.minActiveDays,
    confirmPct: Math.round(thr.confirmShare * 100),
    reachLesson: thr.reachLesson,
    refutePct: Math.round(thr.refuteShare * 100),
    preClassPct: Math.round(thr.preClassShare * 100),
    paymentSignal,
    notes: course.pilot?.notes || '',
  });
  const num = (k) => (e) => setF({ ...f, [k]: Number(e.target.value) });
  return html`<details class="card criteria">
    <summary class="card-title">Criterios del piloto</summary>
    <p class="muted">Acordalos antes de arrancar para no reinterpretar los resultados después. Son orientativos.</p>
    <form class="form" onSubmit=${async (e) => {
      e.preventDefault();
      try {
        await store.updateCourse(course.id, {
          pilot: {
            ...(course.pilot || {}),
            thresholds: {
              windowDays: Math.max(1, f.windowDays),
              minActiveDays: Math.max(1, Math.min(f.minActiveDays, f.windowDays)),
              confirmShare: f.confirmPct / 100,
              reachLesson: Math.max(1, f.reachLesson),
              refuteShare: f.refutePct / 100,
              preClassShare: f.preClassPct / 100,
            },
            paymentSignal: f.paymentSignal,
            notes: f.notes.trim(),
          },
        });
        notify('Criterios guardados');
        onSaved();
      } catch (err) {
        notify(err.message || 'No se pudieron guardar.', 'bad');
      }
    }}>
      <div class="field-row">
        <div class="field"><label for="cr-window">Duración de la cohorte (días)</label><input id="cr-window" type="number" min="1" max="60" value=${f.windowDays} onInput=${num('windowDays')} /></div>
        <div class="field"><label for="cr-min">Días de práctica para «completó»</label><input id="cr-min" type="number" min="1" max="60" value=${f.minActiveDays} onInput=${num('minActiveDays')} /></div>
        <div class="field"><label for="cr-confirm">Confirma si completa (%)</label><input id="cr-confirm" type="number" min="1" max="100" value=${f.confirmPct} onInput=${num('confirmPct')} /></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="cr-reach">Lección a alcanzar</label><input id="cr-reach" type="number" min="1" max="60" value=${f.reachLesson} onInput=${num('reachLesson')} /></div>
        <div class="field"><label for="cr-refute">Refuta si llega menos de (%)</label><input id="cr-refute" type="number" min="0" max="100" value=${f.refutePct} onInput=${num('refutePct')} /></div>
        <div class="field"><label for="cr-preclass">Alerta «solo antes de clase» desde (%)</label><input id="cr-preclass" type="number" min="1" max="100" value=${f.preClassPct} onInput=${num('preClassPct')} /></div>
      </div>
      <label class="check">
        <input id="cr-pay" type="checkbox" checked=${f.paymentSignal} onChange=${(e) => setF({ ...f, paymentSignal: e.target.checked })} />
        <span>Hay señal de pago: la institución aceptó un piloto pago o hubo pre-compras</span>
      </label>
      <div class="field"><label for="cr-notes">Notas (entrevistas, acuerdos)</label><textarea id="cr-notes" rows="3" maxlength="2000" value=${f.notes} onInput=${(e) => setF({ ...f, notes: e.target.value })}></textarea></div>
      <button type="submit" class="btn btn-primary">Guardar criterios</button>
    </form>
  </details>`;
}
