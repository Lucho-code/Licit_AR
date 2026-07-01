/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { InputsState, CalculationResults, ScenarioResult } from '../types';
import { calcEscenario, fmtLocal } from '../utils';

interface ChartsTabProps {
  inputs: InputsState;
  results: CalculationResults;
  selectedScenario: 'min' | 'opt' | 'max';
  activeResult: ScenarioResult;
  sensitivityMetric: 'pv' | 'k';
  setSensitivityMetric: (metric: 'pv' | 'k') => void;
  inflMaxRange: number;
  setInflMaxRange: (range: number) => void;
}

export const ChartsTab: React.FC<ChartsTabProps> = React.memo(({
  inputs,
  results,
  selectedScenario,
  activeResult,
  sensitivityMetric,
  setSensitivityMetric,
  inflMaxRange,
  setInflMaxRange
}) => {
  // Data for Recharts Bar Chart
  const barChartData = useMemo(() => {
    return [
      {
        name: 'Costo Directo',
        min: results.min.cd,
        opt: results.opt.cd,
        max: results.max.cd,
      },
      {
        name: 'Imprev. & Seguros',
        min: results.min.imp + results.min.seg + results.min.gar + results.min.sel + results.min.apo,
        opt: results.opt.imp + results.opt.seg + results.opt.gar + results.opt.sel + results.opt.apo,
        max: results.max.imp + results.max.seg + results.max.gar + results.max.sel + results.max.apo,
      },
      {
        name: 'Gastos & Inflat.',
        min: results.min.gg + results.min.infl,
        opt: results.opt.gg + results.opt.infl,
        max: results.max.gg + results.max.infl,
      },
      {
        name: 'Beneficio Neto',
        min: results.min.ben,
        opt: results.opt.ben,
        max: results.max.ben,
      },
      {
        name: 'Impuestos & IVA',
        min: results.min.iibb + results.min.cheque + results.min.iva,
        opt: results.opt.iibb + results.opt.cheque + results.opt.iva,
        max: results.max.iibb + results.max.cheque + results.max.iva,
      }
    ];
  }, [results]);

  // Data for Recharts Selected Scenario Donut
  const donutChartData = useMemo(() => {
    const res = activeResult;
    return [
      { name: 'Costo Directo', value: res.cd, color: '#3A3732' },
      { name: 'Costos Indirectos & Seguros', value: res.ci + res.seg + res.gar + res.sel + res.apo, color: '#5A716E' },
      { name: 'Imprevistos', value: res.imp, color: '#71715A' },
      { name: 'Inflación supuesta', value: res.infl, color: '#8C6A5A' },
      { name: 'Gastos Generales (Sede)', value: res.gg, color: '#A4947E' },
      { name: 'Costo Financiero Neto', value: res.fin, color: '#B6A699' },
      { name: 'Beneficio requerido', value: res.ben, color: '#C7BDB3' },
      { name: 'Gravámenes (IIBB + Cheque)', value: res.iibb + res.cheque, color: '#D4CEC5' },
      { name: 'I.V.A (21%)', value: res.iva, color: '#D9D2C5' }
    ].filter(item => item.value > 0);
  }, [activeResult]);

  // Data for Sensitivity Line Chart
  const sensitivityData = useMemo(() => {
    const list = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const inflVal = (inflMaxRange / steps) * i;
      const rMin = calcEscenario(inputs, inflVal, inputs.ben_min);
      const rOpt = calcEscenario(inputs, inflVal, inputs.ben_opt);
      const rMax = calcEscenario(inputs, inflVal, inputs.ben_max);
      list.push({
        inflation: inflVal,
        formattedInflation: `${inflVal.toFixed(1)}%`,
        min_k: Number(rMin.k.toFixed(4)),
        opt_k: Number(rOpt.k.toFixed(4)),
        max_k: Number(rMax.k.toFixed(4)),
        min_pv: Math.round(rMin.pv_total),
        opt_pv: Math.round(rOpt.pv_total),
        max_pv: Math.round(rMax.pv_total),
      });
    }
    return list;
  }, [inputs, inflMaxRange]);

  return (
    <div className="space-y-8">
      {/* Chart Header Settings */}
      <div className="bg-[#F5F2ED] p-4 rounded-2xl border border-[#D9D2C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold block text-[#3A3732]">Distribución de Recursos</span>
          <p className="text-[#7A746B]">Verifica cómo se desglosan los costos y el impacto del beneficio neto en los tres escenarios.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-[#2D2A26] border border-[#D9D2C5]">
            Selección Activa: <strong className="ml-1 uppercase text-[#5A716E]">{selectedScenario}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Bar comparison (Cross comparison) */}
        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-bold text-[#7A746B] uppercase tracking-wide block text-center md:text-left">
            Comparativa de Componentes Estructurales ($)
          </span>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#D9D2C5" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7A746B' }} />
                <YAxis tickFormatter={(val) => `$${(val / 1e6).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#7A746B' }} />
                <ReTooltip
                  formatter={(value: any) => [fmtLocal(Number(value)), '']}
                  cursor={{ fill: '#F5F2ED', opacity: 0.5 }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="min" fill="#71715A" name="Mínimo (Agresivo)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="opt" fill="#5A716E" name="Óptimo (Estándar)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" fill="#8C6A5A" name="Máximo (Protegido)" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut break down for currently selected scenario */}
        <div className="md:col-span-5 space-y-4">
          <span className="text-xs font-bold text-[#7A746B] uppercase tracking-wide block text-center">
            Desglose del Precio de Venta (Escenario {selectedScenario.toUpperCase()})
          </span>
          <div className="h-56 sm:h-64 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value: any) => [fmtLocal(Number(value)), '']} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {donutChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#7A746B] truncate">{item.name}</span>
                <span className="font-mono font-bold text-[#3A3732] ml-auto">
                  {((item.value / activeResult.pv_total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED INFLATION SENSITIVITY CURVES */}
      <div className="border-t border-[#D9D2C5]/60 pt-8 space-y-6">
        {/* Section Header with Controls */}
        <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-[#D9D2C5] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <h4 className="font-bold text-sm text-[#3A3732] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#5A716E]" />
              Modelado de Sensibilidad y Elasticidad de la Oferta viales
            </h4>
            <p className="text-xs text-[#7A746B] leading-relaxed max-w-4xl font-sans">
              Simula en tiempo real la respuesta matemática del presupuesto vial ante variaciones continuas de la inflación supuesta. Compara la pendiente de incremento del Coeficiente de Reajuste <strong>K</strong> y la oferta de licitación final para los escenarios proyectados.
            </p>
          </div>
          
          {/* Interactive Widgets */}
          <div className="flex flex-wrap items-center gap-4 shrink-0 sm:flex-nowrap w-full lg:w-auto">
            {/* Toggle Metric */}
            <div className="bg-white p-1 rounded-xl border border-[#D9D2C5] flex gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSensitivityMetric('k')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sensitivityMetric === 'k'
                    ? 'bg-[#5A716E] text-white shadow-xs'
                    : 'text-[#7A746B] hover:text-[#2D2A26]'
                }`}
              >
                Factor K
              </button>
              <button
                type="button"
                onClick={() => setSensitivityMetric('pv')}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sensitivityMetric === 'pv'
                    ? 'bg-[#5A716E] text-white shadow-xs'
                    : 'text-[#7A746B] hover:text-[#2D2A26]'
                }`}
              >
                Oferta ($)
              </button>
            </div>

            {/* Dynamic Range Slider */}
            <div className="bg-white px-3.5 py-1.5 rounded-xl border border-[#D9D2C5] min-w-[200px] w-full sm:w-auto shadow-xs">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#71715A] mb-1">
                <span>Simular hasta</span>
                <span>{inflMaxRange}% Inflación</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={inflMaxRange}
                onChange={(e) => setInflMaxRange(parseInt(e.target.value))}
                className="w-full h-1 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E]"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Line Chart Panel */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#D9D2C5] space-y-4 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold text-[#7A746B] uppercase tracking-wide">
              <span>
                Comportamiento de la Oferta ({sensitivityMetric === 'k' ? 'Factor K Polinómico' : 'Precio de Venta Total'}) por Curva de Inflación
              </span>
              <span className="font-mono text-[10px] text-[#A4947E]">{sensitivityData.length} puntos calculados</span>
            </div>

            <div className="h-72 sm:h-96 w-full font-sans">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#D9D2C5" />
                  <XAxis 
                    dataKey="inflation" 
                    type="number"
                    domain={[0, inflMaxRange]}
                    tickFormatter={(val) => `${val.toFixed(1)}%`}
                    tick={{ fontSize: 10, fill: '#7A746B' }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => sensitivityMetric === 'k' ? val.toFixed(4) : `$${(val / 1e6).toFixed(1)}M`}
                    tick={{ fontSize: 10, fill: '#7A746B' }}
                  />
                  <ReTooltip 
                    formatter={(value: any, name: string) => {
                      const parsedName = name === 'min_k' || name === 'min_pv' 
                        ? 'Mínimo (Agresivo)' 
                        : name === 'opt_k' || name === 'opt_pv' 
                          ? 'Óptimo (Estándar)' 
                          : 'Máximo (Protegido)';
                      const formattedVal = sensitivityMetric === 'k' 
                        ? Number(value).toFixed(4) 
                        : fmtLocal(Number(value));
                      return [formattedVal, parsedName];
                    }}
                    labelFormatter={(label: any) => `Inflación Supuesta: ${Number(label).toFixed(1)}%`}
                    contentStyle={{ backgroundColor: '#F5F2ED', border: '1px solid #D9D2C5', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey={sensitivityMetric === 'k' ? 'min_k' : 'min_pv'} 
                    stroke="#71715A" 
                    strokeWidth={2}
                    name={sensitivityMetric === 'k' ? 'min_k' : 'min_pv'}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={sensitivityMetric === 'k' ? 'opt_k' : 'opt_pv'} 
                    stroke="#5A716E" 
                    strokeWidth={3}
                    name={sensitivityMetric === 'k' ? 'opt_k' : 'opt_pv'}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={sensitivityMetric === 'k' ? 'max_k' : 'max_pv'} 
                    stroke="#8C6A5A" 
                    strokeWidth={2}
                    name={sensitivityMetric === 'k' ? 'max_k' : 'max_pv'}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analytical & Elasticity Explanatory Panel */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#D9D2C5] flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#7A746B] uppercase tracking-wide block border-b border-[#F0EDE9] pb-2">
                Reporte de Elasticidad e Impacto
              </span>

              <p className="text-[11px] text-[#7A746B] leading-relaxed font-sans">
                La inclinación o pendiente de las curvas demuestra la **elasticidad lineal** del presupuesto respecto al incremento en la tasa de inflación en cada escenario:
              </p>

              <div className="space-y-3">
                {/* Scenario Min Slope */}
                <div className="p-3 bg-[#71715A]/5 rounded-xl border border-[#71715A]/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wide">Mínimo (Agresivo)</span>
                    <span className="text-[10px] font-mono font-bold text-[#71715A]">b = {inputs.ben_min}%</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ K Factor:</span>
                    <span className="font-bold text-gray-800">
                      +{((calcEscenario(inputs, 10, inputs.ben_min).k - calcEscenario(inputs, 0, inputs.ben_min).k) / 10).toFixed(5)} / 1%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ Oferta Total:</span>
                    <span className="font-bold text-[#71715A]">
                      +{fmtLocal(((calcEscenario(inputs, 10, inputs.ben_min).pv_total - calcEscenario(inputs, 0, inputs.ben_min).pv_total) / 10))}
                    </span>
                  </div>
                </div>

                {/* Scenario Opt Slope */}
                <div className="p-3 bg-[#5A716E]/5 rounded-xl border border-[#5A716E]/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#5A716E] uppercase tracking-wide">Óptimo (Estándar)</span>
                    <span className="text-[10px] font-mono font-bold text-[#5A716E]">b = {inputs.ben_opt}%</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ K Factor:</span>
                    <span className="font-bold text-gray-800">
                      +{((calcEscenario(inputs, 10, inputs.ben_opt).k - calcEscenario(inputs, 0, inputs.ben_opt).k) / 10).toFixed(5)} / 1%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ Oferta Total:</span>
                    <span className="font-bold text-[#5A716E]">
                      +{fmtLocal(((calcEscenario(inputs, 10, inputs.ben_opt).pv_total - calcEscenario(inputs, 0, inputs.ben_opt).pv_total) / 10))}
                    </span>
                  </div>
                </div>

                {/* Scenario Max Slope */}
                <div className="p-3 bg-[#8C6A5A]/5 rounded-xl border border-[#8C6A5A]/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#8C6A5A] uppercase tracking-wide">Máximo (Protegido)</span>
                    <span className="text-[10px] font-mono font-bold text-[#8C6A5A]">b = {inputs.ben_max}%</span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ K Factor:</span>
                    <span className="font-bold text-gray-800">
                      +{((calcEscenario(inputs, 10, inputs.ben_max).k - calcEscenario(inputs, 0, inputs.ben_max).k) / 10).toFixed(5)} / 1%
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-gray-500 text-[10px]">Δ Oferta Total:</span>
                    <span className="font-bold text-[#8C6A5A]">
                      +{fmtLocal(((calcEscenario(inputs, 10, inputs.ben_max).pv_total - calcEscenario(inputs, 0, inputs.ben_max).pv_total) / 10))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#F5F2ED] rounded-xl border border-[#D9D2C5] text-[10px] text-[#7A746B] leading-relaxed font-sans">
              <span className="font-bold text-[#3A3732] block uppercase tracking-wider mb-0.5">Influencia del Acopio:</span>
              El acopio financiero por anticipo contractual de H-30 disminuye la base de financiamiento neta en obra, lo que a su vez mitiga eficazmente la pendiente de ascenso.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartsTab.displayName = 'ChartsTab';
