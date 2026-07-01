/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ShieldAlert, Layers, RefreshCw, BarChart4 } from 'lucide-react';
import {
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Scatter,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { InputsState } from '../types';

interface RiesgosTabProps {
  selectedScenario: 'min' | 'opt' | 'max';
  risksState: any;
  handleUpdateRisk: (rubroId: string, type: 'probability' | 'impact', val: number) => void;
  inputs: InputsState;
  setInputs: React.Dispatch<React.SetStateAction<InputsState>>;
}

export const RUBROS_RIESGO = [
  { id: 'suelo', name: 'Suelo, Humedad y Subrasantes', desc: 'Riesgos geotécnicos, arcillas expansivas viales o retrasos por exceso de humedad en el corredor.' },
  { id: 'asfalto', name: 'Suelos, Asfalto y Hormigón H-30', desc: 'Variabilidad abrupta de precios de cemento portland, asfalto y áridos que deforma el presupuesto.' },
  { id: 'movimiento', name: 'Movimiento de Suelos y Combustible', desc: 'Evolución del precio de Gasoil, cupos internos y repuestos para maquinaria pesada importada.' },
  { id: 'mano_obra', name: 'Mano de Obra y Paritarias UOCRA', desc: 'Presión de aumentos salariales imprevistos, huelgas o baja productividad local en la traza.' },
  { id: 'logistica', name: 'Logística, Fletes e Insumos Viales', desc: 'Demoras y sobrecostos por fletes de canteras distantes y logística de distribución en calzada.' },
  { id: 'tramites', name: 'Certificaciones y Burocracia Provincial', desc: 'Demora en la liquidación de certificados viales estatales de obra pública y cálculo de K.' },
];

export const RiesgosTab: React.FC<RiesgosTabProps> = React.memo(({
  selectedScenario,
  risksState,
  handleUpdateRisk,
  inputs,
  setInputs
}) => {

  const dataList = useMemo(() => {
    const currentRisks = risksState[selectedScenario] || {};
    return RUBROS_RIESGO.map((rubro) => {
      const rVal = currentRisks[rubro.id] || { probability: 3, impact: 3 };
      return {
        id: rubro.id,
        name: rubro.name,
        desc: rubro.desc,
        probability: rVal.probability,
        impact: rVal.impact,
        score: rVal.probability * rVal.impact
      };
    });
  }, [risksState, selectedScenario]);

  const {
    averageRiskScore,
    criticalCount,
    moderateCount,
    severityText,
    alertStyle,
    recommendedContingency,
    displayRecFactor,
    isFactorMismatch
  } = useMemo(() => {
    const totalScore = dataList.reduce((acc, curr) => acc + curr.score, 0);
    const avg = totalScore / Math.max(1, dataList.length);
    
    const crit = dataList.filter(d => d.score >= 12).length;
    const mod = dataList.filter(d => d.score >= 6 && d.score < 12).length;

    let sevText = 'Controlado';
    let alertSt = 'bg-emerald-50 border-emerald-200 text-emerald-800';
    let recCont = 1.00;

    if (avg >= 11) {
      sevText = 'CRÍTICO';
      alertSt = 'bg-rose-50 border-rose-300 text-rose-800';
      recCont = 1.20; // 20% protection factor
    } else if (avg >= 6) {
      sevText = 'MODERADO';
      alertSt = 'bg-amber-50 border-amber-300 text-amber-800';
      recCont = 1.10; // 10% protection factor
    } else {
      recCont = 1.02; // 2% minimum fallback factor
    }

    const recFactor = recCont.toFixed(2);
    const mismatch = inputs.factor_contingencia.toFixed(2) !== recFactor;

    return {
      averageRiskScore: avg,
      criticalCount: crit,
      moderateCount: mod,
      severityText: sevText,
      alertStyle: alertSt,
      recommendedContingency: recCont,
      displayRecFactor: recFactor,
      isFactorMismatch: mismatch
    };
  }, [dataList, inputs.factor_contingencia]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#5A716E]/10 p-5 rounded-2xl border border-[#5A716E]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white text-[#5A716E] border border-[#5A716E]/20 shadow-xs">
            <ShieldAlert className="h-3 w-3 animate-pulse" />
            Gestión Integrada de Riesgos Viales
          </span>
          <h4 className="font-bold text-sm text-[#3A3732] uppercase tracking-wider flex items-center gap-2">
            Matriz de Riesgo de Licitación
          </h4>
          <p className="text-xs text-[#7A746B] leading-relaxed font-sans">
            Visualice y simule la probabilidad vs. el impacto de riesgos críticos para el escenario seleccionado <strong className="uppercase text-[#5A716E]">{selectedScenario}</strong>. Edite los valores para recalcular recomendaciones de contingencia en tiempo real.
          </p>
        </div>
        <div className="shrink-0 bg-white px-3.5 py-2 rounded-xl border border-[#D9D2C5] text-right text-[11px] text-[#7A746B] shadow-xs">
          Uso del Escenario: <strong className="uppercase text-[#5A716E] font-extrabold">{selectedScenario}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: interactive slider controllers per rubro */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#EBE7DF]">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#71715A] flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#5A716E]" />
                Calibración de Rubros Vulnerables
              </h5>
              <span className="text-[10px] text-[#7A746B]">Modificable del 1 al 5</span>
            </div>

            <div className="space-y-4">
              {RUBROS_RIESGO.map((rubro) => {
                const currentRisk = risksState[selectedScenario]?.[rubro.id] || { probability: 3, impact: 3 };
                const score = currentRisk.probability * currentRisk.impact;
                
                let severityValText = 'BAJO';
                let severityBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                if (score >= 12) {
                  severityValText = 'CRÍTICO';
                  severityBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                } else if (score >= 6) {
                  severityValText = 'MODERADO';
                  severityBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                }

                // Recommendations based on score severity & rubro type
                let mitigationAdvice = '';
                if (rubro.id === 'suelo') {
                  mitigationAdvice = score >= 12 
                    ? 'Exige ensayos de suelo exhaustivos inmediatos y aditivos estabilizadores alemanes de alta gamma.' 
                    : 'Muestreos de subrasante por lote tradicionales cubren el riesgo habitual.';
                } else if (rubro.id === 'asfalto') {
                  mitigationAdvice = score >= 12 
                    ? '¡Alerta de Descalce! Pactar acopio preventivo físico en refinerías e indexar bajo Ley de Obras.' 
                    : 'Indexación estándar por costo de asfalto CAC / INDEC suficiente.';
                } else if (rubro.id === 'movimiento') {
                  mitigationAdvice = score >= 12 
                    ? 'Alquilar flotas con logística integrada y blindar contratos de gasoil mayorista.' 
                    : 'Subcontratación convencional de fletes locales sin acopio de combustible.';
                } else if (rubro.id === 'mano_obra') {
                  mitigationAdvice = score >= 12 
                    ? 'Incrementar previsión por conflictividad UOCRA e incentivos por cumplimiento de hito.' 
                    : 'Cumplimiento regular de paritarias y presentismo provincial.';
                } else if (rubro.id === 'logistica') {
                  mitigationAdvice = score >= 12 
                    ? 'Establecer 2 canteras secundarias e incorporar plus de ruidos y peajes en flete.' 
                    : 'Flete regular desde canteras de Santa Fe capital.';
                } else if (rubro.id === 'tramites') {
                  mitigationAdvice = score >= 12 
                    ? 'Elevar costo financiero de capital de trabajo por riesgo de pagos a 120 días.' 
                    : 'Cobro de certificados municipales estándar dentro de los 60 días de ley.';
                }

                return (
                  <div key={rubro.id} className="p-4 bg-[#FAF9F6] border border-[#D9D2C5]/75 rounded-xl hover:shadow-xs transition-shadow space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <h6 className="font-bold text-xs text-[#2D2A26] sm:text-sm">{rubro.name}</h6>
                        <p className="text-[10px] text-[#7A746B] leading-relaxed font-sans">{rubro.desc}</p>
                      </div>
                      <span className={`shrink-0 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${severityBadgeColor}`}>
                        {severityValText} ({score})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EBE7DF]/60">
                      {/* Probabilidad control */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#71715A]">
                          <span className="font-bold uppercase tracking-wider">Probabilidad</span>
                          <span className="font-mono font-bold text-[#3A3732]">{currentRisk.probability}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentRisk.probability <= 1}
                            onClick={() => handleUpdateRisk(rubro.id, 'probability', Math.max(1, currentRisk.probability - 1))}
                            className="h-5 w-5 bg-white border border-[#D9D2C5] rounded-md text-[10px] font-bold flex items-center justify-center text-[#71715A] disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={currentRisk.probability}
                            onChange={(e) => handleUpdateRisk(rubro.id, 'probability', parseInt(e.target.value))}
                            className="flex-1 h-1 bg-[#EBE7DF] rounded-md accent-[#5A716E] cursor-pointer"
                          />
                          <button
                            type="button"
                            disabled={currentRisk.probability >= 5}
                            onClick={() => handleUpdateRisk(rubro.id, 'probability', Math.min(5, currentRisk.probability + 1))}
                            className="h-5 w-5 bg-white border border-[#D9D2C5] rounded-md text-[10px] font-bold flex items-center justify-center text-[#71715A] disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Impacto control */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#71715A]">
                          <span className="font-bold uppercase tracking-wider">Impacto potencial</span>
                          <span className="font-mono font-bold text-[#3A3732]">{currentRisk.impact}/5</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentRisk.impact <= 1}
                            onClick={() => handleUpdateRisk(rubro.id, 'impact', Math.max(1, currentRisk.impact - 1))}
                            className="h-5 w-5 bg-white border border-[#D9D2C5] rounded-md text-[10px] font-bold flex items-center justify-center text-[#71715A] disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={currentRisk.impact}
                            onChange={(e) => handleUpdateRisk(rubro.id, 'impact', parseInt(e.target.value))}
                            className="flex-1 h-1 bg-[#EBE7DF] rounded-md accent-[#5A716E] cursor-pointer"
                          />
                          <button
                            type="button"
                            disabled={currentRisk.impact >= 5}
                            onClick={() => handleUpdateRisk(rubro.id, 'impact', Math.min(5, currentRisk.impact + 1))}
                            className="h-5 w-5 bg-white border border-[#D9D2C5] rounded-md text-[10px] font-bold flex items-center justify-center text-[#71715A] disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 bg-white rounded-lg text-[9px] text-[#71715A] border border-[#EBE7DF] flex items-start gap-1 leading-relaxed">
                      <span className="font-bold text-[#5A716E]">Protocolo:</span>
                      <span>{mitigationAdvice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Scatter Chart & dynamic calculation link */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Panel / Control Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-xs space-y-4">
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#71715A] flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-[#5A716E]" />
              Estado General de Contingencias
            </h5>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-[#FAF9F6] border border-[#EBE7DF] rounded-xl space-y-1">
                <span className="block text-[8px] font-bold text-[#7A746B] uppercase">Rango Promedio</span>
                <div className="font-mono text-lg font-extrabold text-[#2D2A26]">
                  {averageRiskScore.toFixed(1)}
                </div>
                <span className={`inline-block text-[7px] font-bold px-1.5 py-0.2 rounded uppercase ${alertStyle}`}>
                  {severityText}
                </span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-[#EBE7DF] rounded-xl space-y-1">
                <span className="block text-[8px] font-bold text-[#7A746B] uppercase">Cat. Crítica</span>
                <div className="font-mono text-lg font-extrabold text-rose-700">
                  {criticalCount}
                </div>
                <span className="text-[7px] text-[#7A746B] uppercase font-bold">Riesgos &gt;=12</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-[#EBE7DF] rounded-xl space-y-1">
                <span className="block text-[8px] font-bold text-[#7A746B] uppercase">Cat. Moderada</span>
                <div className="font-mono text-lg font-extrabold text-amber-700">
                  {moderateCount}
                </div>
                <span className="text-[7px] text-[#7A746B] uppercase font-bold">Riesgos 6..11</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#D9D2C5] space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#3A3732] font-bold flex items-center gap-1">
                  🛡️ Corrector Técnico Sugerido:
                </span>
                <span className="font-mono font-extrabold text-[#5A716E] bg-white border border-[#D9D2C5] px-2 py-0.5 rounded-md text-xs">
                  {displayRecFactor}x
                </span>
              </div>
              <p className="text-[10px] text-[#7A746B] leading-relaxed">
                La evaluación de variables arroja un multiplicador de contingencia sugerido de <strong className="font-mono">{displayRecFactor}x</strong>. Su protección activa cargada en variables principales de simulación es de <strong className="font-mono">{inputs.factor_contingencia.toFixed(2)}x</strong>.
              </p>
              {isFactorMismatch && (
                <button
                  type="button"
                  onClick={() => {
                    setInputs(prev => ({
                      ...prev,
                      factor_contingencia: recommendedContingency
                    }));
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#5A716E] hover:bg-[#475957] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  Sincronizar Simulador Principal a {displayRecFactor}x
                </button>
              )}
            </div>
          </div>

          {/* Interactive Recharts Scatter Chart */}
          <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#71715A] flex items-center gap-1.5">
                <BarChart4 className="h-4 w-4 text-[#5A716E]" />
                Matriz de Dispersión
              </h5>
              <span className="text-[9px] font-bold text-[#7A746B] uppercase">Prob. vs Imp.</span>
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#EBE7DF] relative">
              {/* Color Legend Badge */}
              <div className="absolute top-2 right-2 flex gap-1.5 text-[7px] font-bold uppercase z-10 pointer-events-none">
                <span className="px-1 py-0.2 bg-rose-50 border border-rose-200 text-rose-600 rounded">R &gt;= 12</span>
                <span className="px-1 py-0.2 bg-amber-50 border border-amber-200 text-amber-600 rounded">R 6-11</span>
                <span className="px-1 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded">R &lt; 6</span>
              </div>

              <div className="h-72 w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 25, right: 10, bottom: 25, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D5" />
                    <XAxis 
                      type="number" 
                      dataKey="probability" 
                      name="Probabilidad" 
                      domain={[0.5, 5.5]} 
                      ticks={[1, 2, 3, 4, 5]} 
                      tickFormatter={(v) => {
                        if (v === 1) return 'M.Bajo (1)';
                        if (v === 2) return 'Bajo (2)';
                        if (v === 3) return 'Medio (3)';
                        if (v === 4) return 'Alto (4)';
                        if (v === 5) return 'M.Alto (5)';
                        return '';
                      }}
                      stroke="#7A746B"
                      fontSize={8}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="impact" 
                      name="Impacto" 
                      domain={[0.5, 5.5]} 
                      ticks={[1, 2, 3, 4, 5]} 
                      tickFormatter={(v) => {
                        if (v === 1) return 'Insign. (1)';
                        if (v === 2) return 'Menor (2)';
                        if (v === 3) return 'Moder. (3)';
                        if (v === 4) return 'Mayor (4)';
                        if (v === 5) return 'Catas. (5)';
                        return '';
                      }}
                      stroke="#7A746B"
                      fontSize={8}
                    />
                    <ReTooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          const sc = d.probability * d.impact;
                          let sev = 'BAJO';
                          let strokeC = 'border-emerald-300';
                          let textC = 'text-emerald-700';
                          let bgC = 'bg-emerald-50';
                          if (sc >= 12) {
                            sev = 'CRÍTICO';
                            strokeC = 'border-rose-300';
                            textC = 'text-rose-700';
                            bgC = 'bg-rose-50';
                          } else if (sc >= 6) {
                            sev = 'MODERADO';
                            strokeC = 'border-amber-300';
                            textC = 'text-amber-700';
                            bgC = 'bg-amber-50';
                          }

                          return (
                            <div className={`p-2.5 bg-white rounded-xl border leading-relaxed shadow-lg max-w-xs ${strokeC} ${bgC} text-[10px]`}>
                              <div className="font-bold text-[#2D2A26] uppercase text-[9px] mb-0.5">{d.name}</div>
                              <div className="text-[10.5px]">Sección: <strong className={textC}>{sev} ({sc})</strong></div>
                              <p className="text-[9px] text-[#7A746B] italic leading-snug my-1 mt-0.5 font-sans">{d.desc}</p>
                              <div className="flex gap-2.5 text-[9px] font-mono font-bold text-gray-700">
                                <span>Probabilidad: {d.probability}</span>
                                <span>Impacto: {d.impact}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Riesgos" data={dataList}>
                      {dataList.map((entry, idx) => {
                        const sc = entry.probability * entry.impact;
                        let fillCell = '#10B981'; // green
                        if (sc >= 12) fillCell = '#EF4444'; // red
                        else if (sc >= 6) fillCell = '#F59E0B'; // amber
                        return (
                          <Cell 
                            key={`cell-${idx}`} 
                            fill={fillCell} 
                            stroke="#fff" 
                            strokeWidth={2}
                            r={10} 
                            className="transition-all hover:scale-125 cursor-pointer outline-none"
                          />
                        );
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

RiesgosTab.displayName = 'RiesgosTab';
