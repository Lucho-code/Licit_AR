/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { InputsState, CalculationResults } from '../types';
import { fmtLocal, fmtFactor, calcEscenario } from '../utils';

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

// Component to project K coefficient across the 3 scenarios (Min, Opt, Max) using expected index value input
const KProjectionCalculator: React.FC<FormulasTabProps> = ({ inputs, results }) => {
  const [baseIndex, setBaseIndex] = useState<number>(1000);
  const [expectedIndex, setExpectedIndex] = useState<number>(1350);

  const projectedInflation = useMemo(() => {
    if (baseIndex <= 0) return 0;
    return ((expectedIndex / baseIndex) - 1) * 100;
  }, [baseIndex, expectedIndex]);

  const projMin = useMemo(() => {
    return calcEscenario(inputs, projectedInflation, inputs.ben_min);
  }, [inputs, projectedInflation]);

  const projOpt = useMemo(() => {
    return calcEscenario(inputs, projectedInflation, inputs.ben_opt);
  }, [inputs, projectedInflation]);

  const projMax = useMemo(() => {
    return calcEscenario(inputs, projectedInflation, inputs.ben_max);
  }, [inputs, projectedInflation]);

  // Handle index limits nicely
  const handleIndexChange = (val: number, type: 'base' | 'expected') => {
    const numVal = Math.max(1, val);
    if (type === 'base') {
      setBaseIndex(numVal);
    } else {
      setExpectedIndex(numVal);
    }
  };

  return (
    <div className="space-y-5 text-[#3A3732] font-sans">
      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#D9D2C5]/70 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3 grid grid-cols-1 gap-1">
          <label className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Índice Base Licitación (I₀)</label>
          <input
            type="number"
            value={baseIndex}
            onChange={(e) => handleIndexChange(parseFloat(e.target.value) || 0, 'base')}
            className="w-full text-xs font-semibold text-[#2D2A26] bg-white border border-[#D9D2C5] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
          />
        </div>

        <div className="w-full md:w-1/3 grid grid-cols-1 gap-1">
          <label className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Índice Actual Esperado (I_t)</label>
          <input
            type="number"
            value={expectedIndex}
            onChange={(e) => handleIndexChange(parseFloat(e.target.value) || 0, 'expected')}
            className="w-full text-xs font-semibold text-[#2D2A26] bg-white border border-[#D9D2C5] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
          />
        </div>

        <div className="w-full md:w-1/3 text-center bg-white p-3 rounded-xl border border-[#D9D2C5]/50 flex flex-col justify-center items-center">
          <span className="text-[9px] uppercase font-bold text-[#A4947E]">Variación Proyectada (Inflación)</span>
          <span className={`text-lg font-black font-mono tracking-tight mt-0.5 ${
            projectedInflation >= 0 ? 'text-[#5A716E]' : 'text-rose-700'
          }`}>
            {projectedInflation >= 0 ? '+' : ''}{projectedInflation.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Slider for expected index */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-[#71715A]">
          <span>Ajustar Índice Actual Esperado:</span>
          <span className="font-mono text-[#5A716E]">{expectedIndex} ({projectedInflation >= 0 ? '+' : ''}{projectedInflation.toFixed(1)}%)</span>
        </div>
        <input
          type="range"
          min={Math.floor(baseIndex / 2)}
          max={baseIndex * 3}
          value={expectedIndex}
          onChange={(e) => setExpectedIndex(parseInt(e.target.value) || 1)}
          className="w-full accent-[#5A716E] h-1 bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg cursor-pointer"
        />
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ESCENARIO MÍNIMO */}
        <div className="bg-white rounded-xl border border-[#D9D2C5] p-4 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#7A746B]/40 transition-all">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-[#FAF9F6] pb-1.5">
              <span className="font-bold text-xs uppercase tracking-wide text-[#7A746B]">Escenario Mínimo</span>
              <span className="text-[8px] bg-[#7A746B]/10 text-[#7A746B] px-1.5 py-0.2 rounded font-bold">
                Margen: {inputs.ben_min}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center py-1 bg-[#FAF9F6] rounded-lg">
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#A4947E]">K Actual</span>
                <span className="text-xs font-bold font-mono text-[#7A746B]">{results.min.k.toFixed(4)}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#5A716E]">K Proyectado</span>
                <span className="text-sm font-black font-mono text-[#5A716E]">{projMin.k.toFixed(4)}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Original:</span>
                <span className="font-mono font-medium">{fmtLocal(results.min.pv_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Proyectado:</span>
                <span className="font-mono font-bold text-[#2D2A26]">{fmtLocal(projMin.pv_total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FAF9F6] pt-2 text-[10px] text-right">
            <span className="text-[#A4947E]">Diferencia de Oferta: </span>
            <strong className={`font-mono ${projMin.pv_total - results.min.pv_total >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {projMin.pv_total - results.min.pv_total >= 0 ? '+' : ''}
              {fmtLocal(projMin.pv_total - results.min.pv_total)}
            </strong>
          </div>
        </div>

        {/* ESCENARIO ÓPTIMO */}
        <div className="bg-[#5A716E]/5 rounded-xl border border-[#5A716E]/30 p-4 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#5A716E]/60 transition-all ring-1 ring-[#5A716E]/10">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-[#FAF9F6] pb-1.5">
              <span className="font-bold text-xs uppercase tracking-wide text-[#5A716E]">Escenario Óptimo</span>
              <span className="text-[8px] bg-[#5A716E]/10 text-[#5A716E] px-1.5 py-0.2 rounded font-bold">
                Margen: {inputs.ben_opt}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center py-1 bg-white rounded-lg border border-[#5A716E]/15">
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#A4947E]">K Actual</span>
                <span className="text-xs font-bold font-mono text-[#7A746B]">{results.opt.k.toFixed(4)}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#5A716E]">K Proyectado</span>
                <span className="text-sm font-black font-mono text-[#5A716E]">{projOpt.k.toFixed(4)}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Original:</span>
                <span className="font-mono font-medium">{fmtLocal(results.opt.pv_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Proyectado:</span>
                <span className="font-mono font-bold text-[#2D2A26]">{fmtLocal(projOpt.pv_total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FAF9F6] pt-2 text-[10px] text-right">
            <span className="text-[#A4947E]">Diferencia de Oferta: </span>
            <strong className={`font-mono ${projOpt.pv_total - results.opt.pv_total >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {projOpt.pv_total - results.opt.pv_total >= 0 ? '+' : ''}
              {fmtLocal(projOpt.pv_total - results.opt.pv_total)}
            </strong>
          </div>
        </div>

        {/* ESCENARIO MÁXIMO */}
        <div className="bg-white rounded-xl border border-[#D9D2C5] p-4 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#7A746B]/40 transition-all">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-[#FAF9F6] pb-1.5">
              <span className="font-bold text-xs uppercase tracking-wide text-rose-800">Escenario Máximo</span>
              <span className="text-[8px] bg-rose-50 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                Margen: {inputs.ben_max}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center py-1 bg-[#FAF9F6] rounded-lg">
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#A4947E]">K Actual</span>
                <span className="text-xs font-bold font-mono text-[#7A746B]">{results.max.k.toFixed(4)}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-bold text-[#5A716E]">K Proyectado</span>
                <span className="text-sm font-black font-mono text-[#5A716E]">{projMax.k.toFixed(4)}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Original:</span>
                <span className="font-mono font-medium">{fmtLocal(results.max.pv_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A4947E] text-[10px]">Precio Proyectado:</span>
                <span className="font-mono font-bold text-[#2D2A26]">{fmtLocal(projMax.pv_total)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#FAF9F6] pt-2 text-[10px] text-right">
            <span className="text-[#A4947E]">Diferencia de Oferta: </span>
            <strong className={`font-mono ${projMax.pv_total - results.max.pv_total >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {projMax.pv_total - results.max.pv_total >= 0 ? '+' : ''}
              {fmtLocal(projMax.pv_total - results.max.pv_total)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to convert custom K to Offer value and vice versa
const BidirectionalKCalculator: React.FC<FormulasTabProps> = ({ inputs, results }) => {
  const cdBase = inputs.base_cd;
  
  const [customK, setCustomK] = useState<number>(() => parseFloat(results.opt.k.toFixed(4)));
  const [customOffer, setCustomOffer] = useState<number>(() => {
    return parseFloat((results.opt.k * cdBase).toFixed(2));
  });

  const handleKChange = (kVal: number) => {
    const safeK = Math.max(0.1, kVal);
    setCustomK(safeK);
    setCustomOffer(parseFloat((safeK * cdBase).toFixed(2)));
  };

  const handleOfferChange = (offerVal: number) => {
    const safeOffer = Math.max(1, offerVal);
    setCustomOffer(safeOffer);
    if (cdBase > 0) {
      setCustomK(parseFloat((safeOffer / cdBase).toFixed(4)));
    }
  };

  const statusMessage = useMemo(() => {
    const minK = results.min.k;
    const maxK = results.max.k;
    if (customK < minK - 0.01) {
      return {
        type: 'danger',
        label: 'Margen de Riesgo Financiero Elevado',
        desc: 'El coeficiente K ingresado se encuentra por debajo de la estructura de costo real mínimo requerido. La oferta corre riesgo de ejecutarse a pérdida.',
        color: 'text-rose-800 bg-rose-50 border-rose-200'
      };
    } else if (customK > maxK + 0.01) {
      return {
        type: 'warning',
        label: 'Límite de Competitividad Superado',
        desc: 'El coeficiente K ingresado supera el rango máximo estimado. Si bien provee un excelente margen de utilidad, la oferta podría quedar descalificada en la licitación por precio excesivo.',
        color: 'text-amber-800 bg-amber-50 border-amber-200'
      };
    } else {
      return {
        type: 'success',
        label: 'Rango Seguro de Diseño Presupuestario',
        desc: 'El coeficiente K y el valor de oferta se encuentran dentro de las directrices financieras de diseño (entre el escenario mínimo y máximo de la obra).',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      };
    }
  }, [customK, results]);

  return (
    <div className="space-y-5 text-[#3A3732] font-sans">
      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#D9D2C5]/60">
        <span className="text-[10px] font-bold uppercase text-[#71715A] tracking-wider block mb-2">Base de Cálculo de Referencia</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-[#D9D2C5]/40 text-xs">
            <span className="text-[#7A746B]">Costo Directo Base (CD):</span>
            <span className="font-bold font-mono text-[#2D2A26]">{fmtLocal(cdBase)}</span>
          </div>
          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-[#D9D2C5]/40 text-xs">
            <span className="text-[#7A746B]">Margen Seguro Sugerido (K):</span>
            <span className="font-bold font-mono text-[#5A716E]">
              {results.min.k.toFixed(4)} ... {results.max.k.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Input K Panel */}
        <div className="bg-white p-4 rounded-xl border border-[#D9D2C5] space-y-4 shadow-2xs">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider block">Coeficiente de Redeterminación K</label>
            <span className="text-[9px] text-[#A4947E] font-bold font-mono bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#D9D2C5]/50">Entrada K</span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={customK}
                onChange={(e) => handleKChange(parseFloat(e.target.value) || 0)}
                className="w-full text-lg font-bold text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-mono text-[#A4947E] font-bold">K-FACTOR</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[#7A746B]">
                <span>Ajuste rápido de K:</span>
                <span className="font-mono font-bold text-[#5A716E]">{customK.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="1.0000"
                max="2.5000"
                step="0.0050"
                value={customK}
                onChange={(e) => handleKChange(parseFloat(e.target.value) || 1)}
                className="w-full accent-[#5A716E] h-1 bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Input Oferta Panel */}
        <div className="bg-white p-4 rounded-xl border border-[#D9D2C5] space-y-4 shadow-2xs">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider block">Valor de Oferta Resultante (Precio de Venta)</label>
            <span className="text-[9px] text-[#A4947E] font-bold font-mono bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#D9D2C5]/50">Entrada Oferta</span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-[#A4947E] font-bold">$</span>
              <input
                type="number"
                step="1000"
                value={customOffer}
                onChange={(e) => handleOfferChange(parseFloat(e.target.value) || 0)}
                className="w-full text-lg font-bold text-[#2D2A26] bg-[#FAF9F6] border border-[#D9D2C5] rounded-xl pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-mono text-[#A4947E] font-bold">ARS</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[#7A746B]">
                <span>Ajuste rápido de Oferta (M):</span>
                <span className="font-mono font-bold text-[#5A716E]">${(customOffer / 1000000).toFixed(1)} M</span>
              </div>
              <input
                type="range"
                min={Math.floor(cdBase)}
                max={cdBase * 2.5}
                step="50000"
                value={customOffer}
                onChange={(e) => handleOfferChange(parseFloat(e.target.value) || cdBase)}
                className="w-full accent-[#5A716E] h-1 bg-[#FAF9F6] border border-[#D9D2C5] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison and status section */}
      <div className={`p-4 rounded-xl border text-[11px] leading-relaxed flex items-start gap-3 transition-all ${statusMessage.color}`}>
        <span className="text-lg mt-0.5">
          {statusMessage.type === 'danger' ? '⚠️' : statusMessage.type === 'warning' ? '⚡' : '🛡️'}
        </span>
        <div className="space-y-1">
          <strong className="block uppercase tracking-wider text-[10px] font-extrabold">{statusMessage.label}</strong>
          <p className="font-sans leading-normal">{statusMessage.desc}</p>
        </div>
      </div>

      {/* Quick comparison values table */}
      <div className="bg-white p-4 rounded-xl border border-[#D9D2C5]/70 space-y-3">
        <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wider block">Comparativa de Escenarios vs. Valor Personalizado</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-[#FAF9F6] rounded-lg border border-[#D9D2C5]/40 space-y-0.5">
            <span className="block text-[8px] uppercase font-bold text-[#7A746B]">Mínimo ({results.min.k.toFixed(4)})</span>
            <span className="block font-mono font-bold text-xs text-[#2D2A26]">{fmtLocal(results.min.pv_total)}</span>
          </div>
          <div className="p-2.5 bg-[#5A716E]/5 rounded-lg border border-[#5A716E]/20 space-y-0.5">
            <span className="block text-[8px] uppercase font-bold text-[#5A716E]">Óptimo ({results.opt.k.toFixed(4)})</span>
            <span className="block font-mono font-bold text-xs text-[#5A716E]">{fmtLocal(results.opt.pv_total)}</span>
          </div>
          <div className="p-2.5 bg-[#FAF9F6] rounded-lg border border-[#D9D2C5]/40 space-y-0.5">
            <span className="block text-[8px] uppercase font-bold text-rose-800">Máximo ({results.max.k.toFixed(4)})</span>
            <span className="block font-mono font-bold text-xs text-rose-900">{fmtLocal(results.max.pv_total)}</span>
          </div>
          <div className="p-2.5 bg-[#FAF9F6] rounded-lg border border-[#5A716E]/30 space-y-0.5 ring-1 ring-[#5A716E]/20">
            <span className="block text-[8px] uppercase font-bold text-emerald-800 font-sans">Personalizado ({customK.toFixed(4)})</span>
            <span className="block font-mono font-black text-xs text-emerald-850">{fmtLocal(customOffer)}</span>
          </div>
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

      {/* NEW SECTION: Proyección de Coeficiente K Contractual por Índice Esperado */}
      <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#F0EDE9]">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#3A3732] flex items-center gap-1.5">
              <span>📈</span> Proyección de Coeficiente K y Oferta por Índice Esperado
            </h3>
            <p className="text-[#7A746B] text-[11px] mt-0.5">
              Ingresa un índice actual esperado general (por ejemplo, CAC) para simular y comparar el impacto inflacionario en el coeficiente K y el valor final de la oferta para los tres escenarios.
            </p>
          </div>
          <span className="text-[9px] bg-[#5A716E]/10 text-[#5A716E] font-bold px-2 py-0.5 rounded-md font-mono border border-[#5A716E]/20">
            Simulador de Escenarios
          </span>
        </div>

        <KProjectionCalculator inputs={inputs} results={results} />
      </div>

      {/* NEW SECTION: Conversión Directa Bidireccional (K ⇄ Oferta) */}
      <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#F0EDE9]">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#3A3732] flex items-center gap-1.5">
              <span>🔄</span> Conversor Directo Bidireccional: Coeficiente K ⇄ Valor de Oferta
            </h3>
            <p className="text-[#7A746B] text-[11px] mt-0.5">
              Establece un coeficiente K libremente para calcular de inmediato la valuación total de la oferta, o ingresa tu precio de venta objetivo para determinar el factor K resultante.
            </p>
          </div>
          <span className="text-[9px] bg-[#5A716E]/10 text-[#5A716E] font-bold px-2 py-0.5 rounded-md font-mono border border-[#5A716E]/20">
            Relación Proporcional CD
          </span>
        </div>

        <BidirectionalKCalculator inputs={inputs} results={results} />
      </div>
    </div>
  );
});

FormulasTab.displayName = 'FormulasTab';
