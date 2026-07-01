/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ChevronRight, AlertCircle } from 'lucide-react';
import { InputsState, CalculationResults, RowMeta } from '../types';
import { FILAS_ESTRUCTURA, fmtLocal } from '../utils';

interface TableTabProps {
  inputs: InputsState;
  results: CalculationResults;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inspectedRow: RowMeta | null;
  setInspectedRow: (row: RowMeta | null) => void;
}

export const TableTab: React.FC<TableTabProps> = React.memo(({
  inputs,
  results,
  searchQuery,
  setSearchQuery,
  inspectedRow,
  setInspectedRow
}) => {
  const filteredRows = useMemo(() => {
    return FILAS_ESTRUCTURA.filter(row =>
      row.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Tooltip Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <input
            id="table-search"
            type="text"
            placeholder="Buscar concepto o rubro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[#2D2A26] placeholder-[#A4947E] bg-[#F9F8F6] border border-[#D9D2C5] rounded-xl px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
          />
        </div>
        <div className="text-right text-[11px] text-[#7A746B] flex items-center gap-1">
          <Info className="h-3 w-3 text-[#5A716E]" />
          Haz clic en un renglón para detallar su fórmula e impacto relativo.
        </div>
      </div>

      {/* Highly Crafted Table */}
      <div className="overflow-x-auto rounded-xl border border-[#D9D2C5] bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D9D2C5] bg-[#3B3A36] text-[#F5F2ED]">
              <th className="py-2.5 px-4 font-semibold text-left">Concepto Estructural</th>
              <th className="py-2.5 px-3 text-right font-semibold">Mínimo (Agresivo)</th>
              <th className="py-2.5 px-3 text-right font-semibold">Óptimo (Estándar)</th>
              <th className="py-2.5 px-3 text-right font-semibold">Máximo (Protegido)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE9]">
            {filteredRows.map((f) => {
              const isSubtotal = f.type === 'subtotal';
              const isTotal = f.type === 'total';
              const isIndent = f.type === 'indent';
              const isInspected = inspectedRow?.key === f.key;

              let bgClass = "hover:bg-[#F9F8F6]/60 transition-colors";
              if (isSubtotal) bgClass = "bg-[#F9F8F6] font-bold text-[#2D2A26]";
              if (isTotal) bgClass = "bg-[#F5F2ED] font-extrabold text-[#3A3732] border-y-2 border-[#D9D2C5]";
              if (isInspected) bgClass = `${bgClass} ring-1 ring-[#5A716E] bg-[#EBE7DF]/30`;

              return (
                <tr
                  key={f.key}
                  onClick={() => setInspectedRow(f)}
                  className={`cursor-pointer ${bgClass}`}
                >
                  <td className={`py-2 px-4 flex items-center gap-1.5 ${isIndent ? 'pl-8 text-[#7A746B]' : 'font-medium text-[#2D2A26]'}`}>
                    {isIndent && <ChevronRight className="h-2.5 w-2.5 text-[#A4947E] flex-shrink-0" />}
                    <span>{f.label}</span>
                  </td>
                  
                  {/* Min val */}
                  <td className={`py-2 px-3 text-right font-mono ${
                    isTotal ? 'text-[#71715A] font-bold bg-[#71715A]/10' : 'text-[#2D2A26]'
                  }`}>
                    {fmtLocal(results.min[f.key])}
                  </td>

                  {/* Opt val */}
                  <td className={`py-2 px-3 text-right font-mono ${
                    isTotal ? 'text-[#5A716E] font-bold bg-[#5A716E]/10' : 'text-[#2D2A26] font-medium'
                  }`}>
                    {fmtLocal(results.opt[f.key])}
                  </td>

                  {/* Max val */}
                  <td className={`py-2 px-3 text-right font-mono ${
                    isTotal ? 'text-[#8C6A5A] font-bold bg-[#8C6A5A]/10' : 'text-[#2D2A26]'
                  }`}>
                    {fmtLocal(results.max[f.key])}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#7A746B]">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#A4947E]" />
                  No se encontraron rubros estructurales que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inspected Row Details Card */}
      <AnimatePresence mode="wait">
        {inspectedRow && (
          <motion.div
            key={inspectedRow.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#EBE7DF]/75 p-4 rounded-xl border border-[#D9D2C5] flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#5A716E] uppercase tracking-widest block">Ítem Inspeccionado</span>
              <h4 className="font-bold text-[#3A3732] text-sm">{inspectedRow.label}</h4>
              <p className="text-xs text-[#7A746B] leading-relaxed max-w-2xl">{inspectedRow.description}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-[#D9D2C5] font-mono text-[11px] self-start md:self-auto shrink-0 shadow-xs">
              <span className="text-[#A4947E] block text-[9px] uppercase font-bold mb-1">Peso Promedio en Oferta</span>
              <span className="text-[#3A3732] font-semibold">{fmtLocal(results.opt[inspectedRow.key])}</span>
              <span className="text-[#5A716E] font-semibold block mt-0.5">
                {((results.opt[inspectedRow.key] / results.opt.pv_total) * 100).toFixed(2)} % del final
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TableTab.displayName = 'TableTab';
