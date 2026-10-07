import { useEffect, useRef, useState } from 'preact/hooks';
import { html } from './html.js';
import { cx } from './util.js';
import { STATUS } from '../domain/pack.js';

export function Logo({ size = 28 }) {
  // Visor de cámara con un trazo: la práctica es en video.
  return html`<svg class="logo" width=${size} height=${size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--accent)" />
    <path d="M7 11V7h4M21 7h4v4M25 21v4h-4M11 25H7v-4" fill="none" stroke="var(--on-accent)" stroke-width="2.2" stroke-linecap="round" />
    <path d="M10.5 19.5c2.5-6 8.5-7 11-3" fill="none" stroke="var(--on-accent)" stroke-width="2.2" stroke-linecap="round" opacity="0.55" />
    <circle cx="21.5" cy="16.5" r="2.6" fill="var(--on-accent)" />
  </svg>`;
}

export function Loading({ label = 'Cargando…' }) {
  return html`<div class="loading" role="status"><span class="spinner" aria-hidden="true"></span>${label}</div>`;
}

export function ErrorBox({ error, onRetry }) {
  const msg = error?.message || String(error || 'Algo salió mal.');
  return html`<div class="notice notice-bad" role="alert">
    <p>${msg}</p>
    ${onRetry && html`<button class="btn btn-ghost" onClick=${onRetry}>Reintentar</button>`}
  </div>`;
}

export function Empty({ title, children, action }) {
  return html`<div class="empty">
    <p class="empty-title">${title}</p>
    ${children && html`<div class="empty-body">${children}</div>`}
    ${action}
  </div>`;
}

export function Chip({ tone = 'neutral', children, title }) {
  return html`<span class=${cx('chip', `chip-${tone}`)} title=${title}>${children}</span>`;
}

export function StatusChip({ status }) {
  if (status === STATUS.VALIDATED) return html`<${Chip} tone="ok">Validada<//>`;
  if (status === STATUS.RECORDED) return html`<${Chip} tone="warn">Grabada, sin validar<//>`;
  return html`<${Chip}>Pendiente de grabación<//>`;
}

export function KindChip({ kind }) {
  return kind === 'phrase' ? html`<${Chip} tone="accent">Frase<//>` : html`<${Chip} tone="ink">Seña<//>`;
}

/** Confirmación en la misma pantalla (los diálogos del navegador no siempre están disponibles). */
export function ConfirmButton({ label, question = '¿Seguro?', confirmLabel = 'Sí, confirmar', onConfirm, className = 'btn btn-ghost', disabled }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!asking) {
    return html`<button type="button" class=${className} disabled=${disabled} onClick=${() => setAsking(true)}>${label}</button>`;
  }
  return html`<span class="confirm" role="group" aria-label=${question}>
    <span class="confirm-q">${question}</span>
    <button type="button" class="btn btn-danger btn-sm" disabled=${busy}
      onClick=${async () => {
        setBusy(true);
        try {
          await onConfirm();
        } finally {
          setBusy(false);
          setAsking(false);
        }
      }}>${confirmLabel}</button>
    <button type="button" class="btn btn-ghost btn-sm" onClick=${() => setAsking(false)}>Cancelar</button>
  </span>`;
}

/** Hoja modal. Escape o el botón cierran. */
export function Sheet({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      prev?.focus?.();
    };
  }, []);
  return html`<div class="sheet-backdrop" onClick=${(e) => e.target === e.currentTarget && onClose()}>
    <section class=${cx('sheet', wide && 'sheet-wide')} role="dialog" aria-modal="true" aria-label=${title} tabindex="-1" ref=${ref}>
      <header class="sheet-head">
        <h2>${title}</h2>
        <button type="button" class="icon-btn" aria-label="Cerrar" onClick=${onClose}>✕</button>
      </header>
      <div class="sheet-body">${children}</div>
    </section>
  </div>`;
}

export function CopyField({ id, label, value, onCopied }) {
  const ref = useRef(null);
  return html`<div class="field">
    <label for=${id}>${label}</label>
    <div class="copy-row">
      <input id=${id} ref=${ref} readonly value=${value} onFocus=${(e) => e.target.select()} />
      <button type="button" class="btn btn-ghost"
        onClick=${async () => {
          try {
            await navigator.clipboard.writeText(value);
            onCopied?.(true);
          } catch {
            ref.current?.select();
            onCopied?.(false);
          }
        }}>Copiar</button>
    </div>
  </div>`;
}

export function ProgressBar({ value, max, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return html`<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax=${max} aria-valuenow=${value} aria-label=${label}>
    <span style=${`width:${pct}%`}></span>
  </div>`;
}
