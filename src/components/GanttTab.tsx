/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Layers, CheckCircle } from 'lucide-react';
import { CalculationResults } from '../types';
import { fmtLocal } from '../utils';

interface GanttTabProps {
  plazoObra: number;
  setPlazoObra: (p: number) => void;
  results: CalculationResults;
  gp1: number;
  setGp1: (p: number) => void;
  gp2: number;
  setGp2: (p: number) => void;
  gp3: number;
  setGp3: (p: number) => void;
  gp4: number;
  setGp4: (p: number) => void;
  gp5: number;
  setGp5: (p: number) => void;
  gp6: number;
  setGp6: (p: number) => void;
}

export const GanttTab: React.FC<GanttTabProps> = React.memo(({
  plazoObra,
  setPlazoObra,
  results,
  gp1,
  setGp1,
  gp2,
  setGp2,
  gp3,
  setGp3,
  gp4,
  setGp4,
  gp5,
  setGp5,
  gp6,
  setGp6
}) => {
  const phasesData = useMemo(() => {
    const scale = (pct: number) => {
      return Math.max(1, Math.min(plazoObra, Math.ceil(plazoObra * pct)));
    };
    return [
      {
        id: 1,
        name: "Instalación de Obrador, Replanteo e Ingeniería",
        start: 1,
        end: scale(0.15),
        progress: gp1,
        setProgress: setGp1,
        costPct: 0.08,
        colorClass: "bg-[#71715A]",
        progressColorClass: "bg-[#5E5E4A]",
        milestone: "Firma de Inicio y Replanteo del Obrador",
        milestoneMonth: 1,
      },
      {
        id: 2,
        name: "Movimiento de Suelos, Desmonte y Excavaciones",
        start: scale(0.1),
        end: scale(0.45),
        progress: gp2,
        setProgress: setGp2,
        costPct: 0.18,
        colorClass: "bg-[#A4947E]",
        progressColorClass: "bg-[#8A7965]",
        milestone: "Compactación de la Base Estabilizada",
        milestoneMonth: scale(0.35),
      },
      {
        id: 3,
        name: "Obras de Arte, Alcantarillas y Canalización Pluvial",
        start: scale(0.25),
        end: scale(0.6),
        progress: gp3,
        setProgress: setGp3,
        costPct: 0.12,
        colorClass: "bg-[#8C6A5A]",
        progressColorClass: "bg-[#765445]",
        milestone: "Pruebas Hidráulicas de Sumideros Completas",
        milestoneMonth: scale(0.5),
      },
      {
        id: 4,
        name: "Pavimentación Calzada Principal (Hormigón H-30)",
        start: scale(0.4),
        end: scale(0.85),
        progress: gp4,
        setProgress: setGp4,
        costPct: 0.50, // 50% of direct cost
        colorClass: "bg-[#5A716E]",
        progressColorClass: "bg-[#455755]",
        milestone: "Colocación final del Hormigón H-30 contractual",
        milestoneMonth: scale(0.75),
      },
      {
        id: 5,
        name: "Señalización Vertical, Horizontal y Guardarrailes",
        start: scale(0.8),
        end: scale(0.95),
        progress: gp5,
        setProgress: setGp5,
        costPct: 0.07,
        colorClass: "bg-[#2D2A26]",
        progressColorClass: "bg-[#1C1A18]",
        milestone: "Demarcación Calzada Pintura Reflectiva",
        milestoneMonth: scale(0.9),
      },
      {
        id: 6,
        name: "Recepción Provisional, Limpieza y Certificación Final",
        start: scale(0.9),
        end: plazoObra,
        progress: gp6,
        setProgress: setGp6,
        costPct: 0.05,
        colorClass: "bg-[#B6A699]",
        progressColorClass: "bg-[#9A8A7C]",
        milestone: "Inauguración Vial e Inspección Fiscal",
        milestoneMonth: plazoObra,
      },
    ];
  }, [plazoObra, gp1, gp2, gp3, gp4, gp5, gp6]);

  return (
    <div className="space-y-6">
      {/* Header Controls for Gantt */}
      <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-[#D9D2C5] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[#3A3732] uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#5A716E]" />
              Cronograma de Obra Vial Estimado (Diagrama Gantt)
            </h4>
            <p className="text-xs text-[#7A746B] leading-relaxed font-sans">
              Visualización de las fases del proyecto de infraestructura, hitos contractuales clave y su avance físico. 
              Las fases se adaptan dinámicamente según el plazo total y cargan flujos del Costo Directo base.
            </p>
          </div>
          
          {/* Duration control slider */}
          <div className="bg-white px-4 py-2.5 rounded-xl border border-[#D9D2C5] shrink-0 w-full sm:w-auto shadow-xs">
            <div className="flex justify-between items-center gap-4 mb-1">
              <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wide">Plazo Obra Total</span>
              <span className="text-xs font-mono font-bold text-[#5A716E] bg-[#5A716E]/10 px-2 py-0.5 rounded-lg">{plazoObra} Meses</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={plazoObra}
              onChange={(e) => setPlazoObra(parseInt(e.target.value))}
              className="w-full sm:w-48 h-1.5 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E]"
            />
          </div>
        </div>
      </div>

      {/* Gantt Graphics Grid Wrapper */}
      <div className="bg-white rounded-2xl border border-[#D9D2C5] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-[800px] space-y-5">
            {/* Row: Weeks / Month Grid Headers */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#71715A]">Especificación y Costeo de Fases</span>
              </div>
              <div className="col-span-8">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${plazoObra}, minmax(0, 1fr))` }}>
                  {Array.from({ length: plazoObra }, (_, i) => i + 1).map((mes) => (
                    <div key={mes} className="text-center font-mono text-[10px] font-bold text-[#7A746B] border-l border-[#F0EDE9] py-1">
                      M{mes}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phases Render Loop */}
            <div className="space-y-4 border-t border-[#F0EDE9] pt-4">
              {phasesData.map((phase) => {
                const isCompleted = phase.progress === 100;
                const estimatedCost = results.opt.cd * phase.costPct;

                return (
                  <div key={phase.id} className="grid grid-cols-12 gap-4 items-center group py-2 rounded-xl hover:bg-[#F9F8F6]/50 transition-colors">
                    {/* Left details panel */}
                    <div className="col-span-4 space-y-1.5 pr-2 border-r border-[#F0EDE9]">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-bold text-xs text-[#2D2A26] leading-snug">{phase.name}</h5>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F5F2ED] text-[#71715A] shrink-0">
                          M{phase.start} - M{phase.end}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#7A746B]">
                        <span className="font-mono">Asignación: <strong className="text-[#3A3732] font-semibold">{fmtLocal(estimatedCost)}</strong> ({(phase.costPct * 100).toFixed(0)}%)</span>
                        <span className="font-mono font-bold text-[#5A716E] bg-[#5A716E]/5 px-1.5 py-0.2 rounded">{phase.progress}%</span>
                      </div>
                      
                      {/* Small slider inside row to let user adjust progress easily */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] font-bold text-[#A4947E] uppercase">Ajustar Avance:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={phase.progress}
                          onChange={(e) => phase.setProgress(parseInt(e.target.value))}
                          className="h-1 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E] flex-1 max-w-[120px]"
                        />
                      </div>
                    </div>

                    {/* Right side: Dynamic Grid and Bar */}
                    <div className="col-span-8 relative py-3 font-sans">
                      {/* Monthly background column lines */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${plazoObra}, minmax(0, 1fr))` }}>
                        {Array.from({ length: plazoObra }, (_, i) => i + 1).map((mes) => (
                          <div key={mes} className="border-l border-[#F0EDE9] h-full opacity-60"></div>
                        ))}
                        {/* Last rightmost border for layout completion */}
                        <div className="border-r border-[#F0EDE9] h-full absolute right-0 top-0 opacity-60"></div>
                      </div>

                      {/* The Horizontal Gantt Bar */}
                      <div className="grid relative z-10" style={{ gridTemplateColumns: `repeat(${plazoObra}, minmax(0, 1fr))` }}>
                        <div
                          className="h-7 rounded-lg overflow-hidden relative shadow-xs flex items-center transition-all duration-300"
                          style={{
                            gridColumn: `${phase.start} / ${phase.end + 1}`,
                            backgroundColor: `${phase.colorClass}1F`, // ~12% opacity
                            border: `1px solid ${phase.colorClass}50`,
                          }}
                        >
                          {/* Colored Progress Fill inside Bar */}
                          <div
                            className={`h-full opacity-85 transition-all duration-300 ${phase.colorClass}`}
                            style={{ width: `${phase.progress}%` }}
                          />

                          {/* Text info overlay centering inside the bar */}
                          <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold pointer-events-none">
                            <span className={`${isCompleted ? 'text-white' : 'text-[#3A3732]'} truncate max-w-[240px]`}>
                              {isCompleted ? "✓ Completado" : `En curso — Mes ${phase.start}`}
                            </span>
                            <span className={phase.progress > 50 && isCompleted ? 'text-white' : 'text-[#3A3732]'}>
                              {phase.progress}%
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Milestones / Checklist Box */}
      <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-xs">
        <h4 className="text-xs font-bold tracking-wider text-[#71715A] uppercase mb-4 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-[#5A716E]" />
          Listado de Control de Hitos Críticos Viales
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phasesData.map((phase) => {
            const isCompleted = phase.progress === 100;
            const milestoneMonth = phase.id === 1 ? 1 : phase.id === 2 ? Math.max(1, Math.min(plazoObra, Math.ceil(plazoObra * 0.35))) : phase.id === 3 ? Math.max(1, Math.min(plazoObra, Math.ceil(plazoObra * 0.5))) : phase.id === 4 ? Math.max(1, Math.min(plazoObra, Math.ceil(plazoObra * 0.75))) : phase.id === 5 ? Math.max(1, Math.min(plazoObra, Math.ceil(plazoObra * 0.9))) : plazoObra;

            return (
              <div key={phase.id} className="flex gap-3 items-start p-3 bg-[#F5F2ED]/40 rounded-xl border border-[#D9D2C5]/50">
                <span className={`inline-flex shrink-0 p-1 rounded-full text-white ${
                  isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                }`}>
                  <CheckCircle className="h-3.5 w-3.5" />
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wide">
                    Hito de Fase {phase.id} — Mes {milestoneMonth}
                  </span>
                  <h5 className="font-bold text-xs text-gray-900 leading-snug">{phase.milestone}</h5>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isCompleted ? "Alcanzado" : `${phase.progress}% de avance`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

GanttTab.displayName = 'GanttTab';
