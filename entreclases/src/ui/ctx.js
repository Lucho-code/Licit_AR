import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

/** Contexto global: store, sesión, ruta, navegación y avisos. */
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
