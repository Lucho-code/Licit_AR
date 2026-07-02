/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  calcEscenario,
  DEFAULT_INPUTS,
  ALIC_IIBB,
  ALIC_CHEQUE,
  ALIC_IVA,
  COEF_ROTACION_BANCARIA,
} from './utils';
import { InputsState } from './types';

// Caso simple verificable a mano: sin acopio, sin costo financiero,
// solo CD + 10% de indirectos + 10% de beneficio.
const CASO_SIMPLE: InputsState = {
  base_cd: 100_000,
  base_p_h30: 0,
  base_cant_ant: 0,
  t_ci: 10,
  t_seg: 0,
  t_gar: 0,
  t_sel: 0,
  t_apo: 0,
  t_imp: 0,
  t_gg: 0,
  t_fin: 0,
  inf_min: 0,
  ben_min: 0,
  inf_opt: 0,
  ben_opt: 10,
  inf_max: 0,
  ben_max: 0,
  factor_contingencia: 1,
};

describe('calcEscenario — caso simple verificado a mano', () => {
  const r = calcEscenario(CASO_SIMPLE, 0, 10, 12);

  it('calcula la cadena de costos base', () => {
    expect(r.cd).toBe(100_000);
    expect(r.ci).toBeCloseTo(10_000, 6);
    expect(r.sub5).toBeCloseTo(110_000, 6);
    expect(r.infl).toBe(0);
    expect(r.gg).toBe(0);
    expect(r.c_total).toBeCloseTo(110_000, 6);
    expect(r.fin).toBe(0);
    expect(r.sub11).toBeCloseTo(110_000, 6);
  });

  it('calcula beneficio e impuestos', () => {
    expect(r.ben).toBeCloseTo(11_000, 6);
    expect(r.sub13).toBeCloseTo(121_000, 6);
    // Cheque: 0.6% × (c_total + sub13 × 4.1%)
    const chequeEsperado = ALIC_CHEQUE * (110_000 + 121_000 * COEF_ROTACION_BANCARIA);
    expect(r.cheque).toBeCloseTo(chequeEsperado, 6);
    // IVA plano sobre sub13
    expect(r.iva).toBeCloseTo(121_000 * ALIC_IVA, 6);
  });

  it('gross-up de IIBB: el impuesto es exactamente 3,5% del precio neto de IVA', () => {
    expect(r.iibb / r.pv_neto).toBeCloseTo(ALIC_IIBB, 10);
  });

  it('K = PV total / CD', () => {
    expect(r.k).toBeCloseTo(r.pv_total / r.cd, 10);
  });
});

describe('calcEscenario — costo financiero ligado al plazo', () => {
  const inputs: InputsState = { ...CASO_SIMPLE, t_fin: 2 };

  it('compone la tasa mensual sobre la mitad del plazo', () => {
    const r = calcEscenario(inputs, 0, 0, 12);
    // base financiera = c_total (sin acopio); factor = (1.02^6 − 1)
    const esperado = r.c_total * (Math.pow(1.02, 6) - 1);
    expect(r.fin).toBeCloseTo(esperado, 6);
  });

  it('mayor plazo implica mayor costo financiero', () => {
    const r6 = calcEscenario(inputs, 0, 0, 6);
    const r24 = calcEscenario(inputs, 0, 0, 24);
    expect(r24.fin).toBeGreaterThan(r6.fin);
  });

  it('plazo 0 anula el costo financiero', () => {
    const r = calcEscenario(inputs, 0, 0, 0);
    expect(r.fin).toBe(0);
  });

  it('acopio mayor al costo total deja base financiera en cero (clamp)', () => {
    const conAcopio: InputsState = {
      ...inputs,
      base_cant_ant: 10,
      base_p_h30: 1_000_000, // acopio $10M >> c_total $110k
    };
    const r = calcEscenario(conAcopio, 0, 0, 12);
    expect(r.fin).toBe(0);
  });
});

describe('calcEscenario — invariantes estructurales', () => {
  const r = calcEscenario(DEFAULT_INPUTS, DEFAULT_INPUTS.inf_opt, DEFAULT_INPUTS.ben_opt, 12);

  it('sub5 es la suma de sus componentes', () => {
    const suma = r.cd + r.ci + r.seg + r.gar + r.sel + r.apo + r.imp;
    expect(r.sub5).toBeCloseTo(suma, 6);
  });

  it('pv_neto = sub13 + iibb + cheque; pv_total = pv_neto + iva', () => {
    expect(r.pv_neto).toBeCloseTo(r.sub13 + r.iibb + r.cheque, 6);
    expect(r.pv_total).toBeCloseTo(r.pv_neto + r.iva, 6);
  });

  it('K > 1 para cualquier estructura de costos positiva', () => {
    expect(r.k).toBeGreaterThan(1);
  });

  it('factor de contingencia escala los rubros indirectos linealmente', () => {
    const doble = calcEscenario(
      { ...DEFAULT_INPUTS, factor_contingencia: 2 },
      DEFAULT_INPUTS.inf_opt,
      DEFAULT_INPUTS.ben_opt,
      12
    );
    expect(doble.ci).toBeCloseTo(r.ci * 2, 6);
    expect(doble.seg).toBeCloseTo(r.seg * 2, 6);
    // CD no se escala
    expect(doble.cd).toBe(r.cd);
  });

  it('mayor inflación nunca reduce la oferta', () => {
    const r0 = calcEscenario(DEFAULT_INPUTS, 0, 9, 12);
    const r10 = calcEscenario(DEFAULT_INPUTS, 10, 9, 12);
    expect(r10.pv_total).toBeGreaterThan(r0.pv_total);
  });
});
