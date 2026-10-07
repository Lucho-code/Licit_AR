import { h } from 'preact';
import htm from 'htm';

/** Plantillas tipo JSX sin paso de compilación: html`<div class="x">${valor}</div>` */
export const html = htm.bind(h);
