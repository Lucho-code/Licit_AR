import './styles.css';
import { render } from 'preact';
import { html } from './ui/html.js';
import { App } from './ui/app.js';

const IS_PREVIEW = typeof __PREVIEW__ !== 'undefined' && __PREVIEW__;
const IS_DEV = typeof __DEV__ !== 'undefined' && __DEV__;

render(html`<${App} />`, document.getElementById('app'));

// Funciona sin conexión una vez instalada (no aplica a la vista previa ni al modo desarrollo).
if (!IS_PREVIEW && !IS_DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker no registrado:', err));
  });
}
