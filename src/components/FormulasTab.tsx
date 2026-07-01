/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { InputsState, CalculationResults } from '../types';
import { fmtLocal, fmtFactor } from '../utils';

interface FormulasTabProps {
  inputs: InputsState;
  results: CalculationResults;
}

// Interactive official price indexes and polynomial K redetermination calculator component
const RedeterminationCalculator: React.FC = () => {
  const [items, setItems] = useState([
    { name: 'Mano de Obra (UOCRA)', weight: 35, base: 1000, actual: 1250 },
    { name: 'Combustibles (YPF Gasoil)', weight: 15, base: 800, actual: 980 },
    { name: 'Asfalto y Áridos (R.21)', weight: 25, base: 1500, actual: 1950 },
    { name: 'Equipos y Repuestos (CAC)', weight: 15, base: 1100, actual: 1320 },
    { name: 'Gastos Generales (IPIM)', weight: 10, base: 700, actual: 810 },
  ]);

  const [certificadoBase, setCertificadoBase] = useState<number>(50000000);

  const totalWeight = useMemo(() => items.reduce((acc, curr) => acc + curr.weight, 0), [items]);

  const rubroCalculations = useMemo(() => {
    return items.map(item => {
      const variation = item.base > 0 ? item.actual / item.base : 1;
      const term = (item.weight / 100) * variation;
      return {
        ...item,
        variation,
        term,
      };
    });
  }, [items]);

  const K_R = useMemo(() => {
    const sumTerms = rubroCalculations.reduce((acc, curr) => acc + curr.term, 0);
    if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
      // Normalize if weights are not sum to 100%
      return sumTerms * (100 / totalWeight);
    }
    return sumTerms;
  }, [rubroCalculations, totalWeight]);

  const percentVariation = useMemo(() => {
    return (K_R - 1) * 100;
  }, [K_R]);

  const certificadoRedeterminado = useMemo(() => {
    return certificadoBase * K_R;
  }, [certificadoBase, K_R]);

  const handleItemChange = (index: number, field: 'weight' | 'base' | 'actual', value: number) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: Math.max(0, value)
      };
      return copy;
    });
  };

  const isTriggered = percentVariation >= 5;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Inputs side */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex justify-between items-center bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#D9D2C5]/60">
          <span className="text-[10px] font-bold uppercase text-[#71715A] tracking-wider">Estructura Polinómica de Obra</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="font-bold text-[#3A3732]">Suma Ponderación:</span>
            <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
              Math.abs(totalWeight - 100) < 0.01 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>
              {totalWeight}%
            </span>
          </div>
        </div>

        {Math.abs(totalWeight - 100) > 0.01 && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[10px] text-rose-800 leading-normal">
            ⚠️ <strong>Advertencia de Ponderación:</strong> La suma de los pesos de la fórmula polinómica debe sumar exactamente <strong>100%</strong> para cumplir el pliego. El simulador ha normalizado el cálculo de forma interna para tu conveniencia.
          </div>
        )}

        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const calculated = rubroCalculations[idx];
            return (
              <div key={idx} className="bg-white p-3 rounded-xl border border-[#D9D2C5]/70 hover:border-[#5A716E]/40 transition-all grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <span className="block font-bold text-xs text-[#2D2A26]">{item.name}</span>
                  <span className="text-[9px] text-[#A4947E] font-mono">Variación: +{((calculated.variation - 1) * 100).toFixed(1)}%</span>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 gap-0.5">
                  <label className="text-[8px] uppercase font-bold text-[#A4947E]">Peso (%)</label>
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleItemChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5A716E]"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 gap-0.5">
                  <label className="text-[8px] uppercase font-bold text-[#A4947E]">Índice Base (I₀)</label>
                  <input
                    type="number"
                    value={item.base}
                    onChange={(e) => handleItemChange(idx, 'base', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5A716E]"
                  />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 gap-0.5">
                  <label className="text-[8px] uppercase font-bold text-[#A4947E]">Índice Actual (I_t)</label>
                  <input
                    type="number"
                    value={item.actual}
                    onChange={(e) => handleItemChange(idx, 'actual', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5A716E]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results side */}
      <div className="lg:col-span-5 bg-[#FAF9F6] p-5 rounded-2xl border border-[#D9D2C5] flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider block">Resultado de Redeterminación</span>

          {/* Large Coeficiente Highlight */}
          <div className="bg-white p-4 rounded-xl border border-[#D9D2C5] text-center space-y-1 relative overflow-hidden">
            <span className="text-[9px] uppercase font-bold text-[#A4947E] block">Coeficiente de Redeterminación K_R</span>
            <div className="text-3xl font-extrabold text-[#5A716E] font-mono tracking-tight">
              {K_R.toFixed(4)}
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
              +{percentVariation.toFixed(2)}% de incremento
            </span>
          </div>

          {/* Trigger alert */}
          <div className={`p-3 rounded-xl border text-[10px] leading-relaxed flex items-start gap-2 ${
            isTriggered 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <span className="text-sm mt-0.5">{isTriggered ? '🟢' : '🟡'}</span>
            <div>
              <strong className="block uppercase font-bold text-[9px] mb-0.5">
                {isTriggered ? 'Umbral de Disparo Habilitado' : 'Umbral de Disparo Insuficiente'}
              </strong>
              {isTriggered 
                ? 'La variación supera el 5% legal exigido por el pliego oficial para autorizar la solicitud de redeterminación y redacción de adenda contractual.'
                : 'La variación de la canasta polinómica no alcanza el 5% mínimo contractual para disparar un reclamo. Se mantiene el certificado a precios básicos.'}
            </div>
          </div>

          {/* Certificado Update Calculator */}
          <div className="bg-white p-4 rounded-xl border border-[#D9D2C5] space-y-3">
            <span className="text-[10px] font-bold text-[#3A3732] uppercase tracking-wide block">Actualizar Certificado de Obra</span>
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-[#A4947E] block">Monto Certificado Básico ($)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-[#A4947E] font-bold">$</span>
                <input
                  type="number"
                  value={certificadoBase}
                  onChange={(e) => setCertificadoBase(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg pl-6 pr-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#5A716E]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0EDE9] grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#A4947E]">Monto Básico</span>
                <span className="font-bold text-[#3A3732]">{fmtLocal(certificadoBase)}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-bold text-emerald-800">Monto Redeterminado</span>
                <span className="font-bold text-[#5A716E]">{fmtLocal(certificadoRedeterminado)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-[#A4947E] italic leading-normal font-sans border-t border-[#D9D2C5]/50 pt-2.5">
          * El cálculo aplica ponderaciones ponderadas por rubro según metodología contractual normalizada de la Ley de Obras Públicas Provincial.
        </div>
      </div>
    </div>
  );
};

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

      {/* NEW SECTION: Coeficiente K Redeterminación de Precios Polinómica */}
      <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#F0EDE9]">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#3A3732] flex items-center gap-1.5">
              <span>🧮</span> Calculadora de Coeficiente K de Redeterminación (Polinómica Oficial)
            </h3>
            <p className="text-[#7A746B] text-[11px] mt-0.5">
              Ingresa los índices de precios del mes de licitación (Base) vs. el mes de cobro (Actual) para verificar la variación de costos de la traza vial.
            </p>
          </div>
          <span className="text-[9px] bg-[#5A716E]/10 text-[#5A716E] font-bold px-2 py-0.5 rounded-md font-mono border border-[#5A716E]/20">
            Fórmula de Pliego Contractual
          </span>
        </div>

        <RedeterminationCalculator />
      </div>
    </div>
  );
});

FormulasTab.displayName = 'FormulasTab';
