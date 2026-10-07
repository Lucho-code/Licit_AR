import { useCallback, useEffect, useState } from 'preact/hooks';
import { AppCtx, useApp } from './ctx.js';
import { html } from './html.js';
import { createStore } from '../data/store.js';
import { prefs } from '../data/prefs.js';
import { Loading, ErrorBox, Logo } from './common.js';
import { cx, IS_PREVIEW } from './util.js';
import { Welcome, Join, Today, MySigns } from './student.js';
import { Session } from './session.js';
import { StudioHome, StudioCourse } from './studio.js';
import { ItemEditor } from './item-editor.js';

function parseHash() {
  let raw = '';
  try {
    raw = globalThis.location?.hash || '';
  } catch {
    raw = '';
  }
  const parts = raw
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((p) => decodeURIComponent(p));
  return { parts, key: parts.join('/') };
}

function useRouter() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((path) => {
    const clean = path.replace(/^#?\/?/, '');
    const parts = clean.split('/').filter(Boolean);
    try {
      if (globalThis.location.hash.replace(/^#\/?/, '') === clean) setRoute({ parts, key: parts.join('/') });
      else globalThis.location.hash = `#/${clean}`;
    } catch {
      setRoute({ parts, key: parts.join('/') });
      window.scrollTo(0, 0);
    }
  }, []);
  return [route, navigate];
}

export function App() {
  const [store, setStore] = useState(null);
  const [bootError, setBootError] = useState(null);
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState(null);
  const [route, navigate] = useRouter();

  useEffect(() => {
    let unsub = () => {};
    createStore()
      .then((s) => {
        setStore(s);
        unsub = s.onSessionChange(setSession);
        if (typeof window !== 'undefined') window.__entreclases = { store: s };
      })
      .catch((err) => setBootError(err));
    return () => unsub();
  }, []);

  const notify = useCallback((message, tone = 'ok') => {
    setToast({ message, tone, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  if (bootError) {
    return html`<main class="page"><h1 class="title">No pudimos abrir Entreclases</h1><${ErrorBox} error=${bootError} onRetry=${() => location.reload()} /></main>`;
  }
  if (!store) return html`<main class="page"><${Loading} label="Abriendo Entreclases…" /></main>`;

  const ctx = { store, session, route, navigate, notify };
  return html`<${AppCtx.Provider} value=${ctx}>
    <${Router} />
    ${toast && html`<div class=${cx('toast', `toast-${toast.tone}`)} role="status" key=${toast.id}>${toast.message}</div>`}
  <//>`;
}

function Router() {
  const { store, session, route, navigate } = useApp();
  const [first, second, third, fourth] = route.parts;
  switch (first) {
    case undefined:
      return html`<${Root} />`;
    case 'bienvenida':
      return html`<${Shell} area="student"><${Welcome} /><//>`;
    case 'unirse':
      return html`<${Shell} area="student"><${Join} code=${second || ''} /><//>`;
    case 'hoy':
      return html`<${Shell} area="student"><${Today} /><//>`;
    case 'senas':
      return html`<${Shell} area="student"><${MySigns} /><//>`;
    case 'leccion':
      return html`<${Session} mode="lesson" />`;
    case 'repaso':
      return html`<${Session} mode="review" />`;
    case 'estudio':
      // En el modo piloto, el estudio pide cuenta de Google: si no hay, se muestra el ingreso.
      if (!second || (store.mode === 'firebase' && (!session || session.isAnonymous))) {
        return html`<${Shell} area="studio"><${StudioHome} /><//>`;
      }
      if (third === 'item') return html`<${Shell} area="studio" wide><${ItemEditor} courseId=${second} itemId=${fourth} /><//>`;
      return html`<${Shell} area="studio" wide><${StudioCourse} courseId=${second} tab=${third || 'contenido'} /><//>`;
    default:
      return html`<${Shell} area="student">
        <h1 class="title">No encontramos esa pantalla</h1>
        <button class="btn btn-primary" onClick=${() => navigate('')}>Ir al inicio</button>
      <//>`;
  }
}

function Root() {
  const { navigate } = useApp();
  useEffect(() => {
    navigate(prefs.get('courseId') ? 'hoy' : 'bienvenida');
  }, []);
  return html`<main class="page"><${Loading} /></main>`;
}

function Shell({ area, wide = false, children }) {
  const { store, session, route, navigate } = useApp();
  const isDemo = store.mode === 'demo';
  const canStudio = isDemo || (session && !session.isAnonymous);
  const hasCourse = !!prefs.get('courseId');
  const here = route.parts[0];
  const link = (path, label) =>
    html`<a href=${`#/${path}`} aria-current=${here === path.split('/')[0] ? 'page' : undefined}
      onClick=${(e) => {
        e.preventDefault();
        navigate(path);
      }}>${label}</a>`;
  return html`<div class=${cx('app', `area-${area}`)}>
    <header class="topbar">
      <a class="brand" href="#/" onClick=${(e) => {
        e.preventDefault();
        navigate('');
      }}><${Logo} /><span>Entreclases</span></a>
      ${isDemo && html`<span class="mode-badge" title="Todo queda guardado solo en este dispositivo">${IS_PREVIEW ? 'Vista previa' : 'Demo'}</span>`}
      <nav class="topnav" aria-label="Secciones">
        ${hasCourse && link('hoy', 'Hoy')}
        ${hasCourse && link('senas', 'Mis señas')}
        ${canStudio && link('estudio', 'Estudio')}
      </nav>
    </header>
    <main class=${cx('page', wide && 'wide')}>${children}</main>
  </div>`;
}
