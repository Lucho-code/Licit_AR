/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { InputsState, CalculationResults } from '../types';
import { fmtLocal, fmtFactor } from '../utils';

interface FormulasTabProps {
  inputs: InputsState;
  results: CalculationResults;
}

export const FormulasTab: React.FC<FormulasTabProps> = React.memo(({
  inputs,
  results
}) => {
  const advanceValue = useMemo(() => {
    return inputs.base_cant_ant * inputs.base_p_h30;
  }, [inputs.base_cant_ant, inputs.base_p_h30]);

  const advancePercentOpt = useMemo(() => {
    return Math.min(100, (advanceValue / results.opt.c_total) * 100);
  }, [advanceValue, results.opt.c_total]);

  return (
    <div className="space-y-6 text-[#3A3732]">
      <div className="bg-[#F5F2ED] p-4 rounded-xl border border-[#D9D2C5]">
        <span className="font-bold text-[#3A3732] block text-xs uppercase mb-1">Cálculo de Coeficiente Multiplicador Polinómico K</span>
        <p className="text-xs text-[#7A746B] leading-relaxed font-sans">
          La devaluación, la estructura impositiva y el descalce de caja determinan el factor multiplicador final **K** aplicado al costo directo base. 
          A continuación se presenta un recuento auditado paso a paso con los valores actuales en tiempo real:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Step by Step Operations card */}
        <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] space-y-4">
          <span className="font-bold text-[#5A716E] border-b border-[#F0EDE9] pb-1.5 block text-[11px] uppercase">Rastro del Escenario Óptimo</span>
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-[#A4947E] block uppercase">1. Costo Base Total Operativo (cd + ci + seguros + imprevistos + sellado)</span>
              <div className="font-semibold text-[#2D2A26] mt-0.5 text-[11px]">
                {fmtLocal(results.opt.sub5)}
              </div>
              <span className="text-[9px] text-[#A4947E] block mt-0.5">Fórmula: DIRECTO + INDIRECTO + SEGUROS + GARANTÍAS + SELLADO + APORTES + IMPREVISTOS</span>
            </div>

            <div>
              <span className="text-[10px] text-[#A4947E] block uppercase">2. Costo Total Obra con Inflación Supuesta ({inputs.inf_opt}%)</span>
              <div className="font-semibold text-[#2D2A26] mt-0.5 text-[11px]">
                {fmtLocal(results.opt.c_total)}
              </div>
              <span className="text-[9px] text-[#A4947E] block mt-0.5">Fórmula: Costo Operativo + (Costo Operativo * {inputs.inf_opt}%) + Gastos Generales ({inputs.t_gg}%)</span>
            </div>

            <div>
              <span className="text-[10px] text-[#A4947E] block uppercase">3. Descuento de Acopio y Costo Financiero Neto ({inputs.t_fin}%)</span>
              <div className="font-semibold text-[#2D2A26] mt-0.5 text-[11px]">
                {fmtLocal(results.opt.fin)}
              </div>
              <span className="text-[9px] text-[#A4947E] block mt-0.5">
                Fórmula: Max(0, Costo Obra - {fmtLocal(advanceValue)}) * {inputs.t_fin}%
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#A4947E] block uppercase">4. Beneficio de Empresa ({inputs.ben_opt}%)</span>
              <div className="font-semibold text-[#2D2A26] mt-0.5 text-[11px]">
                {fmtLocal(results.opt.ben)}
              </div>
              <span className="text-[9px] text-[#A4947E] block mt-0.5">Fórmula: (Costo Obra + Costo Financiero) * {inputs.ben_opt}%</span>
            </div>

            <div>
              <span className="text-[10px] text-[#A4947E] block uppercase">5. Precio de Venta de Oferta (Con IVA 21% e Impuestos Locales)</span>
              <div className="font-bold text-[#5A716E] mt-0.5 text-sm">
                {fmtLocal(results.opt.pv_total)}
              </div>
              <span className="text-[9px] text-[#A4947E] block mt-0.5">Fórmula final con Ingresos Brutos (3.5% Santa Fe), IVA y Cheque</span>
            </div>
          </div>
        </div>

        {/* Mathematical logic equations definitions */}
        <div className="bg-[#3A3732] text-[#F5F2ED] p-5 rounded-2xl border border-[#2D2A26] space-y-4">
          <span className="font-bold text-[#B6A699] border-b border-[#2D2A26] pb-1.5 block text-[11px] uppercase">Ecuación Coeficiente K</span>
          
          <div className="space-y-4 leading-relaxed text-xs">
            <p className="text-[#C7BDB3] text-[11px]">
              El factor K se utiliza posteriormente en el rubro comercial para ajustar certificaciones sobre precios básicos de licitación:
            </p>
            
            <div className="bg-[#2D2A26]/80 p-4 rounded-xl border border-[#1C1A18]">
              <span className="text-[#A4947E] block text-[9px] font-bold uppercase mb-1">Ecuación Estándar</span>
              <div className="text-sm font-bold text-white font-mono">
                K = Venta / Costo Directo
              </div>
              <div className="text-[#D4CEC5] text-[10px] mt-2">
                Óptimo: {fmtLocal(results.opt.pv_total)} / {fmtLocal(results.opt.cd)}
              </div>
              <div className="text-lg font-extrabold text-[#B6A699] font-display mt-1">
                = {fmtFactor(results.opt.k)}
              </div>
            </div>

            <div className="space-y-2 text-[#C7BDB3] text-[11px]">
              <span className="font-bold text-white block text-[10px]">Puntos Críticos de Cumplimiento:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>**Amortización de Equipos Propios**: Incorporada de forma directa en el Costo Directo Base de Obra.</li>
                <li>**Impuesto al Cheque**: Formulado con alícuotas compuestas para descuento contable de un {advancePercentOpt.toFixed(0)}%.</li>
                <li>**Ahorro de Caja**: El acopio preventivo de H-30 disminuye el interés de préstamo puente del descubierto bancario.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

FormulasTab.displayName = 'FormulasTab';
