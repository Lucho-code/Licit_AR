/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InputsState {
  base_cd: number;
  base_p_h30: number;
  base_cant_ant: number;
  t_ci: number;
  t_seg: number;
  t_gar: number;
  t_sel: number;
  t_apo: number;
  t_imp: number;
  t_gg: number;
  t_fin: number;
  inf_min: number;
  ben_min: number;
  inf_opt: number;
  ben_opt: number;
  inf_max: number;
  ben_max: number;
  factor_contingencia: number;
  plazo_obra: number;
}

export interface ScenarioResult {
  cd: number;
  ci: number;
  seg: number;
  gar: number;
  sel: number;
  apo: number;
  imp: number;
  sub5: number;
  infl: number;
  gg: number;
  c_total: number;
  fin: number;
  sub11: number;
  ben: number;
  sub13: number;
  iibb: number;
  cheque: number;
  pv_neto: number;
  iva: number;
  pv_total: number;
  k: number;
}

export interface CalculationResults {
  min: ScenarioResult;
  opt: ScenarioResult;
  max: ScenarioResult;
}

export interface RowMeta {
  key: keyof ScenarioResult;
  label: string;
  type: 'normal' | 'indent' | 'subtotal' | 'total';
  description: string;
}
