/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputsState, ScenarioResult, RowMeta } from './types';

export const DEFAULT_INPUTS: InputsState = {
  base_cd: 68314500,
  base_p_h30: 125000,
  base_cant_ant: 230,
  t_ci: 0.2,
  t_seg: 1.0,
  t_gar: 0.1,
  t_sel: 0.3,
  t_apo: 0.5,
  t_imp: 3.0,
  t_gg: 8.0,
  t_fin: 1.0,
  inf_min: 3.0,
  ben_min: 6.0,
  inf_opt: 5.0,
  ben_opt: 9.0,
  inf_max: 7.0,
  ben_max: 12.0,
  factor_contingencia: 1.0,
};

export const PRESETS = [
  {
    name: 'Condiciones Originales de Licitación',
    description: 'Coeficientes y valores estándar para la licitación de febrero de 2026.',
    inputs: { ...DEFAULT_INPUTS }
  },
  {
    name: 'Escenario de Alta Inflación (Protección)',
    description: 'Incrementa coberturas imprevistas, inflación supuesta y beneficio ante riesgo financiero.',
    inputs: {
      ...DEFAULT_INPUTS,
      t_imp: 6.0,
      t_fin: 2.5,
      inf_min: 6.0,
      ben_min: 8.0,
      inf_opt: 10.0,
      ben_opt: 12.0,
      inf_max: 15.0,
      ben_max: 18.0,
    }
  },
  {
    name: 'Estrategia Agresiva (Bajo Margen)',
    description: 'Estructura minimizada para ganar la licitación ajustando imprevistos y beneficios al límite.',
    inputs: {
      ...DEFAULT_INPUTS,
      t_imp: 1.5,
      t_gg: 6.0,
      t_fin: 0.5,
      inf_min: 2.0,
      ben_min: 4.0,
      inf_opt: 4.0,
      ben_opt: 6.0,
      inf_max: 6.0,
      ben_max: 8.0,
    }
  },
  {
    name: 'Obra en Gran Escala (Doble de Volumen)',
    description: 'Obra de mayor escala, duplicando el costo directo base y adaptando los acopios financieros.',
    inputs: {
      ...DEFAULT_INPUTS,
      base_cd: 136629000,
      base_cant_ant: 450,
      t_ci: 0.15,
      t_gg: 7.0,
    }
  }
];

export function fmtLocal(v: number): string {
  return '$ ' + v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtFactor(v: number): string {
  return v.toFixed(4);
}

export function calcEscenario(d: InputsState, inf_tasa: number, ben_tasa: number): ScenarioResult {
  const cd = d.base_cd;
  const anticipo_valor = d.base_cant_ant * d.base_p_h30;
  const fc = d.factor_contingencia !== undefined ? d.factor_contingencia : 1.0;

  const ci = cd * (d.t_ci / 100) * fc;
  const seg = cd * (d.t_seg / 100) * fc;
  const gar = cd * (d.t_gar / 100) * fc;
  const sel = cd * (d.t_sel / 100) * fc;
  const apo = cd * (d.t_apo / 100) * fc;
  const imp = (cd + ci) * (d.t_imp / 100) * fc;
  
  const sub5 = cd + ci + seg + gar + sel + apo + imp;
  const infl = sub5 * (inf_tasa / 100);
  const gg = (sub5 + infl) * (d.t_gg / 100) * fc;
  
  const c_total = sub5 + infl + gg;
  
  // Mitigación del Costo Financiero por la inyección líquida del Anticipo
  const base_financiera = Math.max(0, c_total - anticipo_valor);
  const fin = base_financiera * (d.t_fin / 100);
  
  const sub11 = c_total + fin;
  const ben = sub11 * (ben_tasa / 100);
  const sub13 = sub11 + ben;
  
  const iibb = sub13 * 0.035;
  const cheque = 0.006 * (c_total + (sub13 * 0.041));
  
  const pv_neto = sub13 + iibb + cheque;
  const iva = sub13 * 0.21;
  const pv_total = pv_neto + iva;
  const k = pv_total / cd;

  return { cd, ci, seg, gar, sel, apo, imp, sub5, infl, gg, c_total, fin, sub11, ben, sub13, iibb, cheque, pv_neto, iva, pv_total, k };
}

export const FILAS_ESTRUCTURA: RowMeta[] = [
  {
    key: 'cd',
    label: '1. COSTO DIRECTO BASE',
    type: 'normal',
    description: 'Suma de insumos de mano de obra, materiales y amortización de equipos fijos en obra.'
  },
  {
    key: 'ci',
    label: '2. COSTO INDIRECTO',
    type: 'normal',
    description: 'Gastos de estructura en obra, personal de supervisión y campamentos no imputables directamente.'
  },
  {
    key: 'seg',
    label: '3.1 SEGUROS (RC y ART)',
    type: 'indent',
    description: 'Responsabilidad Civil combinada y pólizas de cobertura para personal (Aseguradoras de Riesgos del Trabajo).'
  },
  {
    key: 'gar',
    label: '3.2 GARANTÍAS DE PLIEGO',
    type: 'indent',
    description: 'Costo financiero de fianza para mantenimiento de la oferta del pliego de licitación.'
  },
  {
    key: 'sel',
    label: '3.3 SELLADO DE CONTRATO',
    type: 'indent',
    description: 'Tasa impositiva provincial aplicable a la formalización e instrumentación del contrato.'
  },
  {
    key: 'apo',
    label: '3.4 APORTES PROFESIONALES',
    type: 'indent',
    description: 'Contribuciones obligatorias a cajas previsionales y colegios colegiados de ingeniería o agrimensura.'
  },
  {
    key: 'imp',
    label: '4. IMPREVISTOS DE CAMPO',
    type: 'normal',
    description: 'Fondo de contingencia técnica para fluctuaciones imprevistas del suelo, clima o demoras locales.'
  },
  {
    key: 'sub5',
    label: '5. SUBTOTAL COSTOS OPERATIVOS',
    type: 'subtotal',
    description: 'Suma del Costo Directo con Indirectos, Seguros, Garantías, Sellado, Aportes e Imprevistos.'
  },
  {
    key: 'infl',
    label: '6. INFLACIÓN / RIESGO PAÍS ASUMIDO',
    type: 'normal',
    description: 'Proyección acumulativa de escalada de precios para el período de ejecución estimado.'
  },
  {
    key: 'gg',
    label: '7. GASTOS GENERALES EMPRESA',
    type: 'normal',
    description: 'Cuotaparte correspondiente a la estructura de sede central, gerencia corporativa y administración.'
  },
  {
    key: 'c_total',
    label: '8. COSTO TOTAL DE LA OBRA',
    type: 'subtotal',
    description: 'Costo consolidated de ejecución física, contingencias, inflación proyectada y gastos administrativos.'
  },
  {
    key: 'fin',
    label: '10. COSTO FINANCIERO (Neto s/ Descubierto)',
    type: 'normal',
    description: 'Costo del capital por desfases de flujos mensuales, atenuado por la cuantía líquida del acopio (anticipo).'
  },
  {
    key: 'sub11',
    label: '11. SUBTOTAL ANTES DE BENEFICIO',
    type: 'subtotal',
    description: 'Consolide financiero de costos duros operativos e intereses financieros de preconcesión.'
  },
  {
    key: 'ben',
    label: '12. BENEFICIO NETO REQUERIDO',
    type: 'normal',
    description: 'Rentabilidad neta objetivo antes de impuestos estipulada para el nivel de riesgo de la licitación.'
  },
  {
    key: 'sub13',
    label: '13. PRECIO ANTES DE IMPUESTOS',
    type: 'subtotal',
    description: 'Precio base de facturación previo al gravamen fiscal e impositivo local y nacional.'
  },
  {
    key: 'iibb',
    label: '14. INGRESOS BRUTOS (3.5% Santa Fe)',
    type: 'normal',
    description: 'Alícuota provincial del Impuesto sobre los Ingresos Brutos aplicable a la actividad de construcción.'
  },
  {
    key: 'cheque',
    label: '15. IMPUESTO AL CHEQUE (Créd./Déb.)',
    type: 'normal',
    description: 'Impuesto nacional sobre créditos y débitos bancarios calculado dinámicamente sobre la base impositiva consolidada.'
  },
  {
    key: 'pv_neto',
    label: '18. PRECIO DE VENTA (Neto de IVA)',
    type: 'subtotal',
    description: 'Precio total neto que percibirá la constructora previo a la recaudación de IVA.'
  },
  {
    key: 'iva',
    label: '19. I.V.A. (21.0%)',
    type: 'normal',
    description: 'Impuesto al Valor Agregado obligatorio nacional que se aplica para la facturación final.'
  },
  {
    key: 'pv_total',
    label: '20. PRECIO DE VENTA TOTAL DE OFERTA',
    type: 'total',
    description: 'Importe final de la propuesta que se presentará en el sobre de licitación comercial.'
  }
];
