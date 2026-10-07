// Elige el modo según config.js: con datos de Firebase → piloto real; sin datos → demo local.
// Agregando ?demo a la dirección se fuerza el modo demo aunque haya Firebase configurado.
import { LocalStore } from './local-store.js';

const IS_PREVIEW = typeof __PREVIEW__ !== 'undefined' && __PREVIEW__;

export async function createStore() {
  const cfg = globalThis.ENTRECLASES_CONFIG || {};
  let forceDemo = false;
  try {
    forceDemo = new URLSearchParams(globalThis.location?.search || '').has('demo');
  } catch {
    forceDemo = false;
  }
  if (!IS_PREVIEW && cfg.firebase && cfg.firebase.projectId && !forceDemo) {
    const { FirebaseStore } = await import('./firebase-store.js');
    const store = new FirebaseStore(cfg);
    await store.init();
    return store;
  }
  const store = new LocalStore();
  await store.init();
  return store;
}
