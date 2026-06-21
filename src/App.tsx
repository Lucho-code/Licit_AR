/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import {
  Calculator,
  ShieldAlert,
  Award,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  RefreshCw,
  BarChart4,
  PieChart as PieIcon,
  HelpCircle,
  Download,
  Info,
  ChevronRight,
  Database,
  CheckCircle,
  AlertCircle,
  Upload,
  FileUp,
  Sparkles,
  Brain,
  Calendar,
  Layers
} from 'lucide-react';
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
  Line,
  ScatterChart,
  Scatter
} from 'recharts';
import { InputsState, ScenarioResult, RowMeta } from './types';
import {
  DEFAULT_INPUTS,
  PRESETS,
  fmtLocal,
  fmtFactor,
  calcEscenario,
  FILAS_ESTRUCTURA
} from './utils';

export default function App() {
  const [inputs, setInputs] = useState<InputsState>(DEFAULT_INPUTS);
  const [selectedScenario, setSelectedScenario] = useState<'min' | 'opt' | 'max'>('opt');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedRow, setInspectedRow] = useState<RowMeta | null>(FILAS_ESTRUCTURA[19]); // Defecto en el total
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'formulas' | 'gantt'>('table');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [licitacionInfo, setLicitacionInfo] = useState<string>(
    "Licitación Vial Pública 02/2026 — Provincia de Santa Fe, Argentina. Obra: Repavimentación e Infraestructura de Corredores Primarios. Pliego contractual: acopio preventivo de Hormigón H-30."
  );
  
  // States for interactive Gantt Timeline Chart
  const [plazoObra, setPlazoObra] = useState<number>(12);
  const [gp1, setGp1] = useState<number>(100);
  const [gp2, setGp2] = useState<number>(75);
  const [gp3, setGp3] = useState<number>(40);
  const [gp4, setGp4] = useState<number>(20);
  const [gp5, setGp5] = useState<number>(0);
  const [gp6, setGp6] = useState<number>(0);

  // States for sensitivity analysis visualization
  const [inflMaxRange, setInflMaxRange] = useState<number>(25);
  const [sensitivityMetric, setSensitivityMetric] = useState<'pv' | 'k'>('k');

  // States for AI Document Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    estimatedTitle: string;
    estimatedLocation: string;
    explanation: string;
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Dynamic loading messages to show during AI document ingestion
  const loadingSteps = [
    "Subiendo documentación técnica de obra...",
    "Gemini analizando el presupuesto y pliego contractual...",
    "Correlacionando coeficientes bajo la Ley de Obras de Santa Fe...",
    "Verificando consistencia del índice polinómico K..."
  ];

  // Effect to rotate loading steps during analysis
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [analyzing]);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setAnalysisError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedFile({
        name: file.name,
        type: file.type || "application/octet-stream",
        base64: base64
      });
    };
    reader.onerror = () => {
      setAnalysisError("Error al leer el archivo en el navegador.");
    };
    reader.readAsDataURL(file);
  };

  // Submit file and prompt to backend API
  const handleAnalyzePliego = async () => {
    if (!uploadedFile) {
      setAnalysisError("Debe seleccionar o arrastrar un pliego o documento de cómputo primero.");
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze-pliego", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          fileData: uploadedFile.base64,
          userPrompt: userPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ocurrió un error inesperado al analizar el pliego.");
      }

      // Update simulation parameters with extracted values
      setInputs({
        base_cd: data.base_cd,
        base_cant_ant: data.base_cant_ant,
        base_p_h30: data.base_p_h30,
        t_ci: data.t_ci,
        t_seg: data.t_seg,
        t_gg: data.t_gg,
        t_imp: data.t_imp,
        t_fin: data.t_fin,
        // Preserve standard public non-variable parameters
        t_gar: DEFAULT_INPUTS.t_gar,
        t_sel: DEFAULT_INPUTS.t_sel,
        t_apo: DEFAULT_INPUTS.t_apo,
        inf_min: DEFAULT_INPUTS.inf_min,
        ben_min: DEFAULT_INPUTS.ben_min,
        inf_opt: DEFAULT_INPUTS.inf_opt,
        ben_opt: DEFAULT_INPUTS.ben_opt,
        inf_max: DEFAULT_INPUTS.inf_max,
        ben_max: DEFAULT_INPUTS.ben_max,
        factor_contingencia: DEFAULT_INPUTS.factor_contingencia,
      });

      setAnalysisResult({
        estimatedTitle: data.estimatedTitle,
        estimatedLocation: data.estimatedLocation,
        explanation: data.explanation,
      });

      setLicitacionInfo(
        `${data.estimatedTitle} — ${data.estimatedLocation}\n\nResumen del pliego analizado:\n• Costo Directo base estimado: $${(data.base_cd || 0).toLocaleString('es-AR')}\n• Acopio de H-30 de pliego: ${data.base_cant_ant || 0} m³\n• Análisis de justificación: ${data.explanation}`
      );
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Error al conectar con el servidor de análisis IA.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Calcs
  const results = useMemo(() => {
    return {
      min: calcEscenario(inputs, inputs.inf_min, inputs.ben_min),
      opt: calcEscenario(inputs, inputs.inf_opt, inputs.ben_opt),
      max: calcEscenario(inputs, inputs.inf_max, inputs.ben_max),
    };
  }, [inputs]);

  const activeResult = useMemo(() => {
    return results[selectedScenario];
  }, [results, selectedScenario]);

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

  // Handle Input Changes safely
  const handleInputChange = (key: keyof InputsState, value: string) => {
    const numValue = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? 0 : numValue
    }));
  };

  // Reset to original
  const resetToDefault = () => {
    setInputs(DEFAULT_INPUTS);
  };

  // Load preset
  const loadPreset = (presetInputs: InputsState) => {
    setInputs(presetInputs);
  };

  // Export as CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Concepto Estructural,Escenario Minimo ($),Escenario Optimo ($),Escenario Maximo ($)\n";
    
    FILAS_ESTRUCTURA.forEach(f => {
      const valMin = results.min[f.key].toFixed(2);
      const valOpt = results.opt[f.key].toFixed(2);
      const valMax = results.max[f.key].toFixed(2);
      csvContent += `"${f.label.replace(/"/g, '""')}",${valMin},${valOpt},${valMax}\n`;
    });
    
    // Add factors at end
    csvContent += `\n"FACTOR DE ESCALAMIENTO K PLANTEADO",${results.min.k.toFixed(4)},${results.opt.k.toFixed(4)},${results.max.k.toFixed(4)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analisis_polinomico_licitacion_02_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      inputs,
      results,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "escenarios_licitacion_02_2026.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // Export as formatted Excel with active functional formulas
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Simulación Polinómica');

      // Configure gridlines
      worksheet.views = [{ showGridLines: true }];

      // Column widths
      worksheet.columns = [
        { key: 'colA', width: 4 },
        { key: 'colB', width: 48 },
        { key: 'colC', width: 22 },
        { key: 'colD', width: 22 },
        { key: 'colE', width: 22 },
      ];

      const styleRowRange = (rowNum: number, startCol: number, endCol: number, styles: any) => {
        const row = worksheet.getRow(rowNum);
        for (let c = startCol; c <= endCol; c++) {
          const cell = row.getCell(c);
          if (styles.fill) cell.fill = styles.fill;
          if (styles.font) cell.font = styles.font;
          if (styles.alignment) cell.alignment = styles.alignment;
          if (styles.border) cell.border = styles.border;
        }
      };

      // Title Block
      worksheet.mergeCells('B2:E2');
      const titleCell = worksheet.getCell('B2');
      titleCell.value = 'CALCULADORA VIAL MULTIESCENARIO - FÓRMULA POLINÓMICA K';
      titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3A3732' }
      };
      worksheet.getRow(2).height = 40;

      worksheet.mergeCells('B3:E3');
      const subtitleCell = worksheet.getCell('B3');
      subtitleCell.value = 'Licitación Vial Pública 02/2026 — Provincia de Santa Fe, Argentina (Planilla con Fórmulas Activas)';
      subtitleCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: '7A746B' } };
      subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(3).height = 20;

      // Section I Header
      worksheet.mergeCells('B5:E5');
      const sec1Header = worksheet.getCell('B5');
      sec1Header.value = 'SECCIÓN I: CONFIGURACIÓN GENERAL Y ELEMENTOS OPERATIVOS';
      sec1Header.font = { name: 'Arial', size: 10, bold: true, color: { argb: '33322E' } };
      sec1Header.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'EBE7DF' }
      };
      sec1Header.alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getRow(5).height = 25;

      const addConfigRow = (rowNum: number, label: string, val: number, format: string) => {
        worksheet.getCell(`B${rowNum}`).value = label;
        worksheet.getCell(`C${rowNum}`).value = val;
        worksheet.getCell(`C${rowNum}`).numFmt = format;
        worksheet.getCell(`B${rowNum}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: '5A554E' } };
        worksheet.getCell(`C${rowNum}`).font = { name: 'Arial', size: 9, bold: true };
        worksheet.getCell(`C${rowNum}`).alignment = { horizontal: 'right' };
      };

      addConfigRow(6, 'Costo Directo Base de Obra (CD)', inputs.base_cd, '"$"#,##0.00');
      addConfigRow(7, 'Cantidad de Hormigón H-30 para acopio contractual (m³)', inputs.base_cant_ant, '#,##0');
      addConfigRow(8, 'Precio unitario corriente de m³ de Hormigón H-30 ($)', inputs.base_p_h30, '"$"#,##0.00');

      // Costo Acopio Formula
      worksheet.getCell('B9').value = 'Monto de Acopio Anticipado Preventivo ($)';
      worksheet.getCell('B9').font = { name: 'Arial', size: 9, bold: true, color: { argb: '71715A' } };
      worksheet.getCell('C9').value = { formula: 'C7*C8' };
      worksheet.getCell('C9').numFmt = '"$"#,##0.00';
      worksheet.getCell('C9').font = { name: 'Arial', size: 9, bold: true, color: { argb: '71715A' } };
      worksheet.getCell('C9').alignment = { horizontal: 'right' };

      addConfigRow(10, 'Costo Indirecto (t_ci %)', inputs.t_ci / 100, '0.00%');
      addConfigRow(11, 'Seguros ART / Responsabilidad Civil (t_seg %)', inputs.t_seg / 100, '0.00%');
      addConfigRow(12, 'Garantías de Pliego (t_gar %)', inputs.t_gar / 100, '0.00%');
      addConfigRow(13, 'Sellado de Contrato Provincial (t_sel %)', inputs.t_sel / 100, '0.00%');
      addConfigRow(14, 'Aportes Profesionales de Ley (t_apo %)', inputs.t_apo / 100, '0.00%');
      addConfigRow(15, 'Imprevistos de Campo y Suelo (t_imp %)', inputs.t_imp / 100, '0.00%');
      addConfigRow(16, 'Gastos Generales de Sede (t_gg %)', inputs.t_gg / 100, '0.00%');
      addConfigRow(17, 'Costo Financiero Neto s / scoperto (t_fin %)', inputs.t_fin / 100, '0.00%');

      // Borders to Seccion I
      for (let r = 5; r <= 17; r++) {
        worksheet.getRow(r).getCell(2).border = { left: { style: 'thin', color: { argb: 'D9D2C5' } } };
        worksheet.getRow(r).getCell(3).border = { right: { style: 'thin', color: { argb: 'D9D2C5' } } };
      }

      // Scenario Config Row
      worksheet.getCell('B18').value = 'Parámetros Específicos de los Escenarios';
      worksheet.getCell('B18').font = { name: 'Arial', size: 9, bold: true, color: { argb: '3A3732' } };
      worksheet.getCell('C18').value = 'Mínimo (Agresivo)';
      worksheet.getCell('D18').value = 'Óptimo (Estándar)';
      worksheet.getCell('E18').value = 'Máximo (Protegido)';

      styleRowRange(18, 2, 5, {
        font: { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '5A716E' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      worksheet.getRow(18).height = 24;

      // Inflation row
      worksheet.getCell('B19').value = 'Tasa de Inflación Proyectada';
      worksheet.getCell('B19').font = { name: 'Arial', size: 9, bold: true, color: { argb: '5A554E' } };
      worksheet.getCell('C19').value = inputs.inf_min / 100;
      worksheet.getCell('D19').value = inputs.inf_opt / 100;
      worksheet.getCell('E19').value = inputs.inf_max / 100;

      // Profit row
      worksheet.getCell('B20').value = 'Beneficio Empresario Neto Objetivo';
      worksheet.getCell('B20').font = { name: 'Arial', size: 9, bold: true, color: { argb: '5A554E' } };
      worksheet.getCell('C20').value = inputs.ben_min / 100;
      worksheet.getCell('D20').value = inputs.ben_opt / 100;
      worksheet.getCell('E20').value = inputs.ben_max / 100;

      for (let c = 3; c <= 5; c++) {
        worksheet.getCell(19, c).numFmt = '0.00%';
        worksheet.getCell(20, c).numFmt = '0.00%';
        worksheet.getCell(19, c).font = { name: 'Arial', size: 9, bold: true };
        worksheet.getCell(20, c).font = { name: 'Arial', size: 9, bold: true };
        worksheet.getCell(19, c).alignment = { horizontal: 'right' };
        worksheet.getCell(20, c).alignment = { horizontal: 'right' };
      }

      // Global Contingency Factor Row in Row 21
      worksheet.getCell('B21').value = 'Factor de Contingencia Global (Multiplicador)';
      worksheet.getCell('B21').font = { name: 'Arial', size: 9, bold: true, color: { argb: '8C6A5A' } };
      worksheet.getCell('C21').value = inputs.factor_contingencia;
      worksheet.getCell('C21').numFmt = '0.00';
      worksheet.getCell('C21').font = { name: 'Arial', size: 9, bold: true, color: { argb: '8C6A5A' } };
      worksheet.getCell('C21').alignment = { horizontal: 'right' };
      worksheet.getCell('D21').value = { formula: 'C21' };
      worksheet.getCell('D21').numFmt = '0.00';
      worksheet.getCell('D21').font = { name: 'Arial', size: 9, bold: true, color: { argb: '8C6A5A' } };
      worksheet.getCell('D21').alignment = { horizontal: 'right' };
      worksheet.getCell('E21').value = { formula: 'C21' };
      worksheet.getCell('E21').numFmt = '0.00';
      worksheet.getCell('E21').font = { name: 'Arial', size: 9, bold: true, color: { argb: '8C6A5A' } };
      worksheet.getCell('E21').alignment = { horizontal: 'right' };

      // Budget Table Headers
      worksheet.getCell('B23').value = 'CONCEPTO VIAL DE COSTO / IMPUESTO';
      worksheet.getCell('C23').value = 'MÍNIMO (AGRESIVO)';
      worksheet.getCell('D23').value = 'ÓPTIMO (ESTÁNDAR)';
      worksheet.getCell('E23').value = 'MÁXIMO (PROTEGIDO)';

      styleRowRange(23, 2, 5, {
        font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '33322E' } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      });
      worksheet.getRow(23).height = 28;

      // Calculations table matching math logic exactly with live excel formula binders
      worksheet.getCell('B24').value = '1. COSTO DIRECTO BASE';
      worksheet.getCell('C24').value = { formula: 'C$6' };
      worksheet.getCell('D24').value = { formula: 'C$6' };
      worksheet.getCell('E24').value = { formula: 'C$6' };

      worksheet.getCell('B25').value = '2. COSTO INDIRECTO';
      worksheet.getCell('C25').value = { formula: 'C24*C$10*C$21' };
      worksheet.getCell('D25').value = { formula: 'D24*C$10*D$21' };
      worksheet.getCell('E25').value = { formula: 'E24*C$10*E$21' };

      worksheet.getCell('B26').value = '   3.1 SEGUROS (RC y ART)';
      worksheet.getCell('C26').value = { formula: 'C24*C$11*C$21' };
      worksheet.getCell('D26').value = { formula: 'D24*C$11*D$21' };
      worksheet.getCell('E26').value = { formula: 'E24*C$11*E$21' };

      worksheet.getCell('B27').value = '   3.2 GARANTÍAS DE PLIEGO';
      worksheet.getCell('C27').value = { formula: 'C24*C$12*C$21' };
      worksheet.getCell('D27').value = { formula: 'D24*C$12*D$21' };
      worksheet.getCell('E27').value = { formula: 'E24*C$12*E$21' };

      worksheet.getCell('B28').value = '   3.3 SELLADO DE CONTRATO';
      worksheet.getCell('C28').value = { formula: 'C24*C$13*C$21' };
      worksheet.getCell('D28').value = { formula: 'D24*C$13*D$21' };
      worksheet.getCell('E28').value = { formula: 'E24*C$13*E$21' };

      worksheet.getCell('B29').value = '   3.4 APORTES PROFESIONALES';
      worksheet.getCell('C29').value = { formula: 'C24*C$14*C$21' };
      worksheet.getCell('D29').value = { formula: 'D24*C$14*D$21' };
      worksheet.getCell('E29').value = { formula: 'E24*C$14*E$21' };

      worksheet.getCell('B30').value = '4. IMPREVISTOS DE CAMPO';
      worksheet.getCell('C30').value = { formula: '(C24+C25)*C$15*C$21' };
      worksheet.getCell('D30').value = { formula: '(D24+D25)*C$15*D$21' };
      worksheet.getCell('E30').value = { formula: '(E24+E25)*C$15*E$21' };

      worksheet.getCell('B31').value = '5. SUBTOTAL COSTOS OPERATIVOS';
      worksheet.getCell('C31').value = { formula: 'SUM(C24:C30)' };
      worksheet.getCell('D31').value = { formula: 'SUM(D24:D30)' };
      worksheet.getCell('E31').value = { formula: 'SUM(E24:E30)' };

      worksheet.getCell('B32').value = '6. INFLACIÓN / RIESGO PAÍS ASUMIDO';
      worksheet.getCell('C32').value = { formula: 'C31*C$19' };
      worksheet.getCell('D32').value = { formula: 'D31*D$19' };
      worksheet.getCell('E32').value = { formula: 'E31*E$19' };

      worksheet.getCell('B33').value = '7. GASTOS GENERALES EMPRESA';
      worksheet.getCell('C33').value = { formula: '(C31+C32)*C$16*C$21' };
      worksheet.getCell('D33').value = { formula: '(D31+D32)*C$16*D$21' };
      worksheet.getCell('E33').value = { formula: '(E31+E32)*C$16*E$21' };

      worksheet.getCell('B34').value = '8. COSTO TOTAL DE LA OBRA';
      worksheet.getCell('C34').value = { formula: 'C31+C32+C33' };
      worksheet.getCell('D34').value = { formula: 'D31+D32+D33' };
      worksheet.getCell('E34').value = { formula: 'E31+E32+E33' };

      worksheet.getCell('B35').value = '10. COSTO FINANCIERO (Neto s / Descubierto)';
      worksheet.getCell('C35').value = { formula: 'MAX(0, C34-C$9)*C$17' };
      worksheet.getCell('D35').value = { formula: 'MAX(0, D34-C$9)*C$17' };
      worksheet.getCell('E35').value = { formula: 'MAX(0, E34-C$9)*C$17' };

      worksheet.getCell('B36').value = '11. SUBTOTAL ANTES DE BENEFICIO';
      worksheet.getCell('C36').value = { formula: 'C34+C35' };
      worksheet.getCell('D36').value = { formula: 'D34+D35' };
      worksheet.getCell('E36').value = { formula: 'E34+E35' };

      worksheet.getCell('B37').value = '12. BENEFICIO NETO REQUERIDO';
      worksheet.getCell('C37').value = { formula: 'C36*C$20' };
      worksheet.getCell('D37').value = { formula: 'D36*D$20' };
      worksheet.getCell('E37').value = { formula: 'E36*E$20' };

      worksheet.getCell('B38').value = '13. PRECIO ANTES DE IMPUESTOS';
      worksheet.getCell('C38').value = { formula: 'C36+C37' };
      worksheet.getCell('D38').value = { formula: 'D36+D37' };
      worksheet.getCell('E38').value = { formula: 'E36+E37' };

      worksheet.getCell('B39').value = '14. INGRESOS BRUTOS (3.5% Santa Fe)';
      worksheet.getCell('C39').value = { formula: 'C38*0.035' };
      worksheet.getCell('D39').value = { formula: 'D38*0.035' };
      worksheet.getCell('E39').value = { formula: 'E38*0.035' };

      worksheet.getCell('B40').value = '15. IMPUESTO AL CHEQUE (Créd./Déb.)';
      worksheet.getCell('C40').value = { formula: '0.006*(C34+C38*0.041)' };
      worksheet.getCell('D40').value = { formula: '0.006*(D34+D38*0.041)' };
      worksheet.getCell('E40').value = { formula: '0.006*(E34+E38*0.041)' };

      worksheet.getCell('B41').value = '18. PRECIO DE VENTA (Neto de IVA)';
      worksheet.getCell('C41').value = { formula: 'C38+C39+C40' };
      worksheet.getCell('D41').value = { formula: 'D38+D39+D40' };
      worksheet.getCell('E41').value = { formula: 'E38+E39+E40' };

      worksheet.getCell('B42').value = '19. I.V.A. (21.0%)';
      worksheet.getCell('C42').value = { formula: 'C38*0.21' };
      worksheet.getCell('D42').value = { formula: 'D38*0.21' };
      worksheet.getCell('E42').value = { formula: 'E38*0.21' };

      worksheet.getCell('B43').value = '20. PRECIO DE VENTA TOTAL DE OFERTA';
      worksheet.getCell('C43').value = { formula: 'C41+C42' };
      worksheet.getCell('D43').value = { formula: 'D41+D42' };
      worksheet.getCell('E43').value = { formula: 'E41+E42' };

      const normalFont = { name: 'Arial', size: 9 };
      const indentFont = { name: 'Arial', size: 9, color: { argb: '7A746B' } };
      const subtotalFont = { name: 'Arial', size: 9, bold: true, color: { argb: '2D2A26' } };
      const totalFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };

      const subtotalFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9F8F6' } };
      const borderCell = {
        top: { style: 'thin' as const, color: { argb: 'D9D2C5' } },
        bottom: { style: 'thin' as const, color: { argb: 'D9D2C5' } }
      };

      const codeIndex: Record<number, string> = {
        24: 'normal', 25: 'normal', 26: 'indent', 27: 'indent', 28: 'indent', 29: 'indent',
        30: 'normal', 31: 'subtotal', 32: 'normal', 33: 'normal', 34: 'subtotal', 35: 'normal',
        36: 'subtotal', 37: 'normal', 38: 'subtotal', 39: 'normal', 40: 'normal', 41: 'subtotal',
        42: 'normal', 43: 'total'
      };

      for (let r = 24; r <= 43; r++) {
        const type = codeIndex[r];
        const row = worksheet.getRow(r);
        worksheet.getRow(r).height = 20;

        let fontToUse = normalFont;
        if (type === 'indent') fontToUse = indentFont;
        if (type === 'subtotal') fontToUse = subtotalFont;
        if (type === 'total') fontToUse = totalFont;

        row.getCell(2).font = fontToUse;
        if (type === 'subtotal') {
          styleRowRange(r, 2, 5, { fill: subtotalFill, font: subtotalFont, border: borderCell });
        }

        for (let col = 3; col <= 5; col++) {
          const cell = row.getCell(col);
          cell.numFmt = '"$"#,##0.00';
          cell.font = fontToUse;
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }

        if (type === 'total') {
          styleRowRange(r, 2, 5, {
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '5A716E' } },
            font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFF' } },
            border: {
              top: { style: 'medium' as const, color: { argb: '2D2A26' } },
              bottom: { style: 'double' as const, color: { argb: '2D2A26' } }
            }
          });
        }
      }

      // Row 45: Factor K Final Row
      worksheet.getRow(45).height = 32;
      worksheet.getCell('B45').value = 'FACTOR MULTIPLICADOR K (Polinómico final)';
      worksheet.getCell('B45').font = { name: 'Arial', size: 10, bold: true, color: { argb: '3A3732' } };
      worksheet.getCell('B45').alignment = { horizontal: 'left', vertical: 'middle' };

      worksheet.getCell('C45').value = { formula: 'C43/C24' };
      worksheet.getCell('D45').value = { formula: 'D43/D24' };
      worksheet.getCell('E45').value = { formula: 'E43/E24' };

      worksheet.getCell('C45').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFEFE0' } };
      worksheet.getCell('C45').font = { name: 'Arial', size: 11, bold: true, color: { argb: '71715A' } };
      worksheet.getCell('D45').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0EFEF' } };
      worksheet.getCell('D45').font = { name: 'Arial', size: 11, bold: true, color: { argb: '5A716E' } };
      worksheet.getCell('E45').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFE0E0' } };
      worksheet.getCell('E45').font = { name: 'Arial', size: 11, bold: true, color: { argb: '8C6A5A' } };

      for (let col = 3; col <= 5; col++) {
        const cell = worksheet.getCell(45, col);
        cell.numFmt = '0.0000';
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' as const, color: { argb: '2D2A26' } },
          bottom: { style: 'medium' as const, color: { argb: '2D2A26' } }
        };
      }

      // Generate buffer and trigger client-side download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analisis_polinomico_vial_santa_fe_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating Excel file:", error);
    }
  };

  // Export as visually polished, high-fidelity PDF report
  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Colors
      const rgbPrimary = [90, 113, 110]; // #5A716E
      const rgbSecondary = [113, 113, 90]; // #71715A
      const rgbDark = [45, 42, 38]; // #2D2A26
      const rgbBgNeutral = [245, 242, 237]; // #F5F2ED
      const rgbAccent = [140, 106, 90]; // #8C6A5A

      // Helper: Draw Header Band
      const drawHeader = (pageNum: number) => {
        doc.setFillColor(rgbDark[0], rgbDark[1], rgbDark[2]);
        doc.rect(0, 0, pageWidth, 28, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('INFORME TÉCNICO EJECUTIVO - SIMULACIÓN POLINÓMICA K', margin, 12);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text(`Licitación Pública de Infraestructura Vial - Provincia de Santa Fe | Página ${pageNum} de 2`, margin, 19);
        
        doc.setFillColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
        doc.rect(0, 28, pageWidth, 1.5, 'F');
      };

      // PAGE 1
      drawHeader(1);
      let yPos = 40;

      // 1. FICHA TÉCNICA Y PARÁMETROS DE LICITACIÓN
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      doc.text('I. FICHA DE DATOS LICITATORIOS Y ESPECIFICACIONES DE OBRA', margin, yPos);
      yPos += 4;

      // Draw box for ficha tecnica
      doc.setFillColor(rgbBgNeutral[0], rgbBgNeutral[1], rgbBgNeutral[2]);
      doc.rect(margin, yPos, contentWidth, 48, 'F');
      doc.setDrawColor(217, 210, 197);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPos, contentWidth, 48, 'S');

      // Add project meta from custom text field
      doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Detalles del Pliego Analizado:', margin + 5, yPos + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      const docLines = doc.splitTextToSize(licitacionInfo || '', contentWidth - 14);
      const linesToShow = docLines.slice(0, 4); // Show up to 4 lines
      linesToShow.forEach((lineText: string, i: number) => {
        doc.text(lineText, margin + 5, yPos + 11.5 + (i * 4.2));
      });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`Simulación: ${new Date().toLocaleDateString('es-AR')}`, margin + contentWidth - 42, yPos + 6);

      // Line separator in the box
      doc.setDrawColor(217, 210, 197);
      doc.line(margin + 5, yPos + 29, margin + contentWidth - 5, yPos + 29);

      // Add core parameters values
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Costo Directo Base:', margin + 5, yPos + 34);
      doc.setFont('Helvetica', 'normal');
      doc.text(fmtLocal(inputs.base_cd), margin + 38, yPos + 34);

      doc.setFont('Helvetica', 'bold');
      doc.text('Régimen Acopio:', margin + 5, yPos + 40);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${inputs.base_cant_ant} m³ de Hormigón H-30`, margin + 34, yPos + 40);

      doc.setFont('Helvetica', 'bold');
      doc.text('Monto de Acopio:', margin + 115, yPos + 34);
      doc.setFont('Helvetica', 'normal');
      doc.text(fmtLocal(inputs.base_cant_ant * inputs.base_p_h30), margin + 143, yPos + 34);

      doc.setFont('Helvetica', 'bold');
      doc.text('Coef. Indirecto:', margin + 115, yPos + 40);
      doc.setFont('Helvetica', 'normal');
      doc.text(`CI: ${inputs.t_ci}% | GG: ${inputs.t_gg}% | IMP: ${inputs.t_imp}%`, margin + 141, yPos + 40);

      doc.setFont('Helvetica', 'bold');
      doc.text('Costo m³ H-30:', margin + 5, yPos + 45);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${fmtLocal(inputs.base_p_h30)} por m³`, margin + 31, yPos + 45);

      doc.setFont('Helvetica', 'bold');
      doc.text('Sellado Contrato:', margin + 115, yPos + 45);
      doc.setFont('Helvetica', 'normal');
      doc.text(`${inputs.t_sel}% de Ley Provincial`, margin + 144, yPos + 45);

      yPos += 54;

      // 2. COMPARATIVE BUDGET TABLE
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      doc.text('II. ESTRUCTURA COMPARATIVA DE COSTOS Y OFERTA FINAL', margin, yPos);
      yPos += 4;

      // Draw table headers
      const colWidths = [65, 37, 39, 39]; // Total must be contentWidth = 180
      const colPositions = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
      ];

      doc.setFillColor(rgbDark[0], rgbDark[1], rgbDark[2]);
      doc.rect(margin, yPos, contentWidth, 7, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('CONCEPTO ESTRUCTURAL', colPositions[0] + 3, yPos + 5);
      doc.text('MÍNIMO (AGRESIVO)', colPositions[1] + colWidths[1] - 3, yPos + 5, { align: 'right' });
      doc.text('ÓPTIMO (ESTÁNDAR)', colPositions[2] + colWidths[2] - 3, yPos + 5, { align: 'right' });
      doc.text('MÁXIMO (PROTEGIDO)', colPositions[3] + colWidths[3] - 3, yPos + 5, { align: 'right' });
      
      yPos += 7;

      // Table rows definitions
      const rowsData = [
        { label: '1. COSTO DIRECTO BASE de Obra', key: 'cd', style: 'normal' },
        { label: '2. Costo Indirecto de Campo (t_ci)', key: 'ci', style: 'indent' },
        { label: '3. Seguros (RC + ART) y Pliegos', key: 'seg_total', style: 'indent', calc: (r: any) => r.seg + r.gar + r.sel + r.apo },
        { label: '4. Margen para Imprevistos (t_imp)', key: 'imp', style: 'indent' },
        { label: '5. SUBTOTAL COSTOS OPERATIVOS', key: 'sub5', style: 'subtotal' }, // key is 'sub5'
        { label: '6. Tasa de Inflación Contemplada', key: 'infl', style: 'normal' },
        { label: '7. Gastos Generales Sede (t_gg)', key: 'gg', style: 'normal' },
        { label: '8. COSTO TOTAL DE LA OBRA', key: 'c_total', style: 'subtotal' }, // key is 'c_total'
        { label: '10. Costo Financiero (Neto descubierto)', key: 'fin', style: 'normal' }, // key is 'fin'
        { label: '11. Beneficio Empresario Real Proyectado', key: 'ben', style: 'normal' },
        { label: '12. Base antes de Impuestos', key: 'sub13', style: 'subtotal' }, // key is 'sub13'
        { label: '13. Ingresos Brutos (3.5% Santa Fe)', key: 'iibb', style: 'indent' }, // key is 'iibb'
        { label: '14. Impuesto al Cheque (Crédito/Débito)', key: 'cheque', style: 'indent' }, // key is 'cheque'
        { label: '15. Impuesto al Valor Agregado (IVA 21.0%)', key: 'iva', style: 'indent' }, // key is 'iva'
        { label: '16. PRECIO TOTAL DE OFERTA DE OBRA', key: 'pv_total', style: 'total' }, // key is 'pv_total'
      ];

      rowsData.forEach((row, index) => {
        const isDarkRow = index % 2 === 1;
        const isSubtotal = row.style === 'subtotal';
        const isTotal = row.style === 'total';
        const isIndent = row.style === 'indent';

        // Row background
        if (isTotal) {
          doc.setFillColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
          doc.rect(margin, yPos, contentWidth, 6.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('Helvetica', 'bold');
        } else if (isSubtotal) {
          doc.setFillColor(235, 231, 223); // bg subtotals
          doc.rect(margin, yPos, contentWidth, 6, 'F');
          doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
          doc.setFont('Helvetica', 'bold');
        } else {
          if (isDarkRow) {
            doc.setFillColor(250, 249, 247);
            doc.rect(margin, yPos, contentWidth, 5.5, 'F');
          }
          doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
          if (isIndent) {
            doc.setFont('Helvetica', 'oblique');
          } else {
            doc.setFont('Helvetica', 'normal');
          }
        }

        const fontSize = (isTotal || isSubtotal) ? 8.5 : 8;
        doc.setFontSize(fontSize);

        // Draw cells
        const labelTxt = isIndent ? `   • ${row.label}` : row.label;
        doc.text(labelTxt, colPositions[0] + 3, yPos + (isTotal ? 4.5 : isSubtotal ? 4.2 : 3.8));

        const getVal = (scenario: 'min' | 'opt' | 'max') => {
          if (row.calc) {
            return row.calc(results[scenario]);
          }
          return (results[scenario] as any)[row.key];
        };

        const valMin = getVal('min');
        const valOpt = getVal('opt');
        const valMax = getVal('max');

        doc.text(fmtLocal(valMin), colPositions[1] + colWidths[1] - 3, yPos + (isTotal ? 4.5 : isSubtotal ? 4.2 : 3.8), { align: 'right' });
        doc.text(fmtLocal(valOpt), colPositions[2] + colWidths[2] - 3, yPos + (isTotal ? 4.5 : isSubtotal ? 4.2 : 3.8), { align: 'right' });
        doc.text(fmtLocal(valMax), colPositions[3] + colWidths[3] - 3, yPos + (isTotal ? 4.5 : isSubtotal ? 4.2 : 3.8), { align: 'right' });

        yPos += isTotal ? 6.5 : isSubtotal ? 6 : 5.5;
      });

      yPos += 3;

      // K MULTIPLIER FACTOR FINAL ROW
      doc.setFillColor(rgbSecondary[0], rgbSecondary[1], rgbSecondary[2]);
      doc.rect(margin, yPos, contentWidth, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('FACTOR MULTIPLICADOR K (Coeficiente Oficial de Redeterminación)', colPositions[0] + 3, yPos + 5.2);

      doc.text(fmtFactor(results.min.k), colPositions[1] + colWidths[1] - 3, yPos + 5.2, { align: 'right' });
      doc.text(fmtFactor(results.opt.k), colPositions[2] + colWidths[2] - 3, yPos + 5.2, { align: 'right' });
      doc.text(fmtFactor(results.max.k), colPositions[3] + colWidths[3] - 3, yPos + 5.2, { align: 'right' });

      // PAGE 2 (Charts & conclusions)
      doc.addPage();
      drawHeader(2);
      yPos = 38;

      // III. GRAPHIC COMPARISONS (Vector Graphic Drawings inside PDF)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      doc.text('III. ANÁLISIS GRÁFICO DE OFERTAS Y ESTRUCTURA DE COSTOS', margin, yPos);
      yPos += 5;

      // Draw visual bar charts
      // Total offer chart
      const chartX = margin + 10;
      const chartY = yPos + 40;
      const chartW = 75;
      const chartH = 38;

      doc.setDrawColor(217, 210, 197);
      doc.setLineWidth(0.3);
      doc.line(chartX, chartY, chartX + chartW, chartY); // X axis
      doc.line(chartX, chartY, chartX, chartY - chartH); // Y axis

      // Draw grid lines
      for (let i = 1; i <= 4; i++) {
        const gridY = chartY - (chartH * i / 4);
        doc.setDrawColor(240, 235, 225);
        doc.line(chartX, gridY, chartX + chartW, gridY);
      }

      // Values scaling factor
      const maxVal = Math.max(results.min.pv_total, results.opt.pv_total, results.max.pv_total) * 1.1;
      const getBarHeight = (val: number) => (val / maxVal) * chartH;

      const barW = 12;
      const barSpacing = (chartW - (barW * 3)) / 4;

      const scenariosList = [
        { label: 'Mínimo', val: results.min.pv_total, color: rgbSecondary },
        { label: 'Óptimo', val: results.opt.pv_total, color: rgbPrimary },
        { label: 'Máximo', val: results.max.pv_total, color: rgbAccent }
      ];

      scenariosList.forEach((sc, idx) => {
        const h = getBarHeight(sc.val);
        const bx = chartX + barSpacing + (idx * (barW + barSpacing));
        const by = chartY - h;

        doc.setFillColor(sc.color[0], sc.color[1], sc.color[2]);
        doc.rect(bx, by, barW, h, 'F');
        doc.setDrawColor(rgbDark[0], rgbDark[1], rgbDark[2]);
        doc.setLineWidth(0.1);
        doc.rect(bx, by, barW, h, 'S');

        // Draw value over bar
        doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(`$${(sc.val / 1e6).toFixed(1)}M`, bx + (barW/2), by - 1.5, { align: 'center' });

        // Label under bar
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(sc.label, bx + (barW/2), chartY + 4, { align: 'center' });
      });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
      doc.text('Comparativa del Precio Final ($)', chartX + (chartW / 2), chartY - chartH - 4, { align: 'center' });


      // CHART 2: Desglose de Gastos en Coeficientes (Óptimo)
      const chart2X = margin + 100;
      const chart2Y = chartY;
      const chart2W = 65;
      const chart2H = chartH;

      // Draw beautiful Segmented Stacked Bar representation of Óptimo Scenario
      const optRes = results.opt;
      const distribution = [
        { name: 'Directo', val: optRes.cd, color: [90, 113, 110] }, // Primary
        { name: 'Indirecto', val: optRes.ci + optRes.imp + optRes.seg + optRes.gar + optRes.sel + optRes.apo, color: [113, 113, 90] }, // Secondary
        { name: 'Gastos', val: optRes.gg + optRes.infl + optRes.fin, color: [164, 148, 126] }, // Earth
        { name: 'Beneficio', val: optRes.ben, color: [140, 106, 90] }, // Accent
        { name: 'Fisco', val: optRes.iibb + optRes.cheque + optRes.iva, color: [60, 58, 54] }, // Dark Coal
      ];

      const sumDist = distribution.reduce((acc, d) => acc + d.val, 0);

      // Draw segmented card block
      let blockY = chart2Y - chart2H + 4;
      let blockX = chart2X + 2;
      const blockWidth = 24;

      distribution.forEach((dist) => {
        const pct = dist.val / sumDist;
        const segmentH = pct * (chart2H - 4);

        doc.setFillColor(dist.color[0], dist.color[1], dist.color[2]);
        doc.rect(blockX, blockY, blockWidth, segmentH, 'F');
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.rect(blockX, blockY, blockWidth, segmentH, 'S');

        // Label on the right
        doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(`${dist.name}: ${(pct * 100).toFixed(1)}%`, blockX + blockWidth + 5, blockY + (segmentH / 2) + 1.5);

        blockY += segmentH;
      });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Distribución de Erogación (Óptimo)', chart2X + 20, chart2Y - chart2H, { align: 'center' });

      yPos += 54;

      // IV. EXECUTIVE CONCLUSIONS
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(rgbPrimary[0], rgbPrimary[1], rgbPrimary[2]);
      doc.text('IV. CONCLUSIONES DEL ANÁLISIS POLINÓMICO Y GESTIÓN DE RIESGOS', margin, yPos);
      yPos += 4;

      // Draw bounding box for conclusions
      doc.setFillColor(rgbBgNeutral[0], rgbBgNeutral[1], rgbBgNeutral[2]);
      doc.rect(margin, yPos, contentWidth, 75, 'F');
      doc.setDrawColor(217, 210, 197);
      doc.setLineWidth(0.2);
      doc.rect(margin, yPos, contentWidth, 75, 'S');

      doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);

      const introText = "El cálculo del coeficiente multiplicador polinómico K se fundamenta en la legislación de obra gubernamental de la Provincia de Santa Fe. Los tres escenarios simulados proveen un espectro estratégico clave para los tomadores de decisiones antes de proceder al sellado contractual y la apertura del pliego:";
      const introLines = doc.splitTextToSize(introText, contentWidth - 10);
      doc.text(introLines, margin + 5, yPos + 6);

      let textY = yPos + 18;

      // Bullet points
      const bullet1 = `• ESCENARIO ÓPTIMO (Equilibrado) - K = ${fmtFactor(results.opt.k)}: Contempla una oferta robusta de ${fmtLocal(results.opt.pv_total)} con un impacto inflacionario estimado de ${inputs.inf_opt}% y beneficio de ${inputs.ben_opt}%. Provee un blindaje fiscal e imprevisto integral, reduciendo el riesgo de descalce por alzas imprevistas de asfalto y áridos viales.`;
      const bullet1Lines = doc.splitTextToSize(bullet1, contentWidth - 10);
      doc.setFont('Helvetica', 'bold');
      doc.text(bullet1Lines, margin + 5, textY);
      textY += (bullet1Lines.length * 4.2);

      const bullet2 = `• ESCENARIO MÍNIMO (Agresivo) - K = ${fmtFactor(results.min.k)}: Con una oferta de ${fmtLocal(results.min.pv_total)}, asume una inflación de ${inputs.inf_min}% y beneficios reducidos de ${inputs.ben_min}%. Su implementación eleva la probabilidad de ganar la licitación, pero expone sustancialmente el balance técnico ante fallos en subrasantes viales o imprevistos fluviales en Santa Fe.`;
      const bullet2Lines = doc.splitTextToSize(bullet2, contentWidth - 10);
      doc.setFont('Helvetica', 'normal');
      doc.text(bullet2Lines, margin + 5, textY);
      textY += (bullet2Lines.length * 4.2);

      const bullet3 = `• ESCENARIO MÁXIMO (Protegido) - K = ${fmtFactor(results.max.k)}: Oferta cotizada en ${fmtLocal(results.max.pv_total)} para amortiguar desvíos extraordinarios de inflación (${inputs.inf_max}%) y resguardar un margen superior (${inputs.ben_max}%). Óptimo ante sospechas de alta dispersión de precios en áridos en corralones provinciales.`;
      const bullet3Lines = doc.splitTextToSize(bullet3, contentWidth - 10);
      doc.text(bullet3Lines, margin + 5, textY);
      
      yPos += 82;

      // AUDITING / SIGNATURE SECTION
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(rgbSecondary[0], rgbSecondary[1], rgbSecondary[2]);
      doc.text('V. REVISIÓN Y REGISTRO AUDITOR DE LICITACIONES', margin, yPos);
      yPos += 5;

      // Sign lines
      const signW = 50;
      doc.setDrawColor(217, 210, 197);
      doc.setLineWidth(0.4);
      
      // Line Left
      doc.line(margin + 15, yPos + 18, margin + 15 + signW, yPos + 18);
      // Line Right
      doc.line(margin + contentWidth - 15 - signW, yPos + 18, margin + contentWidth - 15, yPos + 18);

      doc.setTextColor(rgbDark[0], rgbDark[1], rgbDark[2]);
      doc.setFontSize(7.5);
      doc.setFont('Helvetica', 'bold');
      doc.text('REP. TÉCNICO VIAL / INGENIERÍA', margin + 15 + (signW / 2), yPos + 22, { align: 'center' });
      doc.text('GERENTE DE FINANZAS / COMPLEMENTO', margin + contentWidth - 15 - (signW / 2), yPos + 22, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(110, 110, 110);
      doc.text('Firma autorizada y aclaración', margin + 15 + (signW / 2), yPos + 26, { align: 'center' });
      doc.text('Aprobación presupuestaria contractual', margin + contentWidth - 15 - (signW / 2), yPos + 26, { align: 'center' });

      // Save the document!
      doc.save(`informe_ejecutivo_polinomico_santa_fe_${new Date().getFullYear()}.pdf`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error("Error creating executive PDF:", e);
    }
  };

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

  // Filter structure rows
  const filteredRows = useMemo(() => {
    return FILAS_ESTRUCTURA.filter(row =>
      row.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Advance Mitigation math explanation
  const advanceValue = inputs.base_cant_ant * inputs.base_p_h30;
  const advancePercentMin = Math.min(100, (advanceValue / results.min.c_total) * 100);
  const advancePercentOpt = Math.min(100, (advanceValue / results.opt.c_total) * 100);
  const advancePercentMax = Math.min(100, (advanceValue / results.max.c_total) * 100);

  // Memoized Phases specification for the Gantt Diagram
  const phasesData = useMemo(() => {
    return [
      {
        id: 1,
        name: "Instalación de Obrador, Replanteo e Ingeniería",
        start: 1,
        end: Math.max(2, Math.ceil(plazoObra * 0.15)),
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
        start: Math.max(2, Math.ceil(plazoObra * 0.1)),
        end: Math.max(3, Math.ceil(plazoObra * 0.45)),
        progress: gp2,
        setProgress: setGp2,
        costPct: 0.18,
        colorClass: "bg-[#A4947E]",
        progressColorClass: "bg-[#8A7965]",
        milestone: "Compactación de la Base Estabilizada",
        milestoneMonth: Math.max(2, Math.ceil(plazoObra * 0.35)),
      },
      {
        id: 3,
        name: "Obras de Arte, Alcantarillas y Canalización Pluvial",
        start: Math.max(3, Math.ceil(plazoObra * 0.25)),
        end: Math.max(4, Math.ceil(plazoObra * 0.6)),
        progress: gp3,
        setProgress: setGp3,
        costPct: 0.12,
        colorClass: "bg-[#8C6A5A]",
        progressColorClass: "bg-[#765445]",
        milestone: "Pruebas Hidráulicas de Sumideros Completas",
        milestoneMonth: Math.max(3, Math.ceil(plazoObra * 0.5)),
      },
      {
        id: 4,
        name: "Pavimentación Calzada Principal (Hormigón H-30)",
        start: Math.max(4, Math.ceil(plazoObra * 0.4)),
        end: Math.max(5, Math.ceil(plazoObra * 0.85)),
        progress: gp4,
        setProgress: setGp4,
        costPct: 0.50, // 50% of direct cost
        colorClass: "bg-[#5A716E]",
        progressColorClass: "bg-[#455755]",
        milestone: "Colocación final del Hormigón H-30 contractual",
        milestoneMonth: Math.max(4, Math.ceil(plazoObra * 0.75)),
      },
      {
        id: 5,
        name: "Señalización Vertical, Horizontal y Guardarrailes",
        start: Math.max(5, Math.ceil(plazoObra * 0.8)),
        end: Math.max(6, Math.ceil(plazoObra * 0.95)),
        progress: gp5,
        setProgress: setGp5,
        costPct: 0.07,
        colorClass: "bg-[#2D2A26]",
        progressColorClass: "bg-[#1C1A18]",
        milestone: "Demarcación Calzada Pintura Reflectiva",
        milestoneMonth: Math.max(5, Math.ceil(plazoObra * 0.9)),
      },
      {
        id: 6,
        name: "Recepción Provisional, Limpieza y Certificación Final",
        start: Math.max(6, Math.ceil(plazoObra * 0.9)),
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
  }, [plazoObra, gp1, gp2, gp3, gp4, gp5, gp6, results.opt.cd]);

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#2D2A26] font-sans selection:bg-[#5A716E] selection:text-white">
      {/* Top Professional Header Banner */}
      <header className="bg-[#F5F2ED] text-[#2D2A26] relative overflow-hidden border-b border-[#D9D2C5]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3 flex-1 w-full">
              <h1 className="text-3xl sm:text-4xl font-bold font-display italic tracking-tight text-[#3A3732] mb-1">
                Calculadora Vial Multiescenario
              </h1>
              <div className="space-y-1 w-full max-w-4xl">
                <label htmlFor="licitacion-info-textarea" className="block text-[10px] font-bold uppercase tracking-wider text-[#71715A] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5A716E]"></span>
                  Información de la Licitación Analizada
                </label>
                <textarea
                  id="licitacion-info-textarea"
                  value={licitacionInfo}
                  onChange={(e) => setLicitacionInfo(e.target.value)}
                  className="w-full min-h-[64px] p-2.5 text-xs sm:text-sm bg-white border border-[#D9D2C5] rounded-xl text-[#3A3732] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] leading-relaxed resize-y font-sans transition-all shadow-xs"
                  placeholder="Complete aquí los datos de la licitación provincial, expediente o pliego analizado..."
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={resetToDefault}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A554E] hover:text-[#2D2A26] bg-[#EBE7DF] hover:bg-[#D9D2C5] border border-[#D9D2C5] rounded-lg transition-all cursor-pointer"
                title="Restaurar parámetros por defecto"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Valores Base
              </button>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#71715A] hover:bg-[#5E5E4A] rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Planilla Excel (.xlsx)
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#5A716E] hover:bg-[#485B58] rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                Reporte PDF (.pdf)
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A554E] hover:text-[#2D2A26] bg-[#EBE7DF] hover:bg-[#D9D2C5] border border-[#D9D2C5] rounded-lg transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Banner de Feedback de Export de Datos */}
        <AnimatePresence>
          {exportSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-semibold">¡Exportación Exitosa!</span> Descarga efectuada correctamente con el esquema polinómico actualizado en base a los coeficientes ingresados.
                </div>
              </div>
              <button onClick={() => setExportSuccess(false)} className="text-emerald-500 hover:text-emerald-700 font-semibold text-xs uppercase px-2 py-1">Descartar</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Presets Grid */}
        <section className="mb-8 bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-xs">
          <h2 className="text-xs font-bold tracking-wider text-[#71715A] uppercase mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-[#5A716E]" />
            Configuraciones Preestablecidas de Licitación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset.inputs)}
                className="text-left p-3.5 rounded-xl border border-[#D9D2C5] hover:border-[#5A716E] hover:bg-[#F9F8F6]/80 transition-all group cursor-pointer"
              >
                <div className="font-bold text-[#2D2A26] text-sm group-hover:text-[#5A716E] transition-colors">
                  {preset.name}
                </div>
                <div className="text-[#7A746B] text-xs mt-1 leading-relaxed">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AI INGESTION & DOCUMENT AUDITING CONTAINER */}
        <section className="mb-8 bg-white rounded-2xl border border-[#D9D2C5] shadow-xs overflow-hidden">
          <div className="bg-[#5A716E] text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#485B58] rounded-lg">
                <Sparkles className="h-5 w-5 text-[#C7BDB3]" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase">
                  Auditoría Inteligente de Pliegos e Impuestos (IA Gemini)
                </h2>
                <p className="text-[#C7BDB3] text-xs">
                  Carga pliegos de bases o planillas de cómputos viales para calcular automáticamente los parámetros y el coeficiente K óptimo.
                </p>
              </div>
            </div>
            {analysisResult && (
              <button
                type="button"
                onClick={() => {
                  setAnalysisResult(null);
                  setUploadedFile(null);
                  setUserPrompt('');
                }}
                className="text-xs border border-[#C7BDB3] hover:bg-white hover:text-[#5A716E] px-3 py-1 rounded-lg transition-all cursor-pointer"
              >
                Limpiar Análisis
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {!analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* File Drop & Zone */}
                <div className="lg:col-span-7 space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all ${
                      dragOver
                        ? "border-[#5A716E] bg-[#F5F2ED]"
                        : "border-[#D9D2C5] hover:border-[#5A716E] bg-[#FAFAFA]"
                    }`}
                  >
                    <div className="p-3 bg-[#EBE7DF] rounded-full text-[#5A716E] mb-3">
                      <FileUp className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-semibold text-[#2D2A26] mb-1">
                      {uploadedFile ? `Archivo cargado: ${uploadedFile.name}` : "Arrastre su pliego de licitación aquí"}
                    </p>
                    <p className="text-xs text-[#7A746B] mb-4">
                      Soporta PDFs, textos, cómputos (.pdf, .txt, .docx, .csv, .json)
                    </p>

                    <div className="relative inline-block">
                      <label
                        htmlFor="file-upload-input"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#5A554E] hover:text-[#2D2A26] bg-[#EBE7DF] hover:bg-[#D9D2C5] border border-[#D9D2C5] rounded-lg transition-all cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {uploadedFile ? "Cambiar Archivo" : "Seleccionar Archivo"}
                      </label>
                      <input
                        id="file-upload-input"
                        type="file"
                        accept=".pdf,.txt,.docx,.csv,.json"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={analyzing}
                      />
                    </div>
                  </div>

                  {analysisError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span>{analysisError}</span>
                    </div>
                  )}
                </div>

                {/* Instructions Input */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="user-prompt-instructions" className="block text-xs font-bold text-[#5A554E] uppercase tracking-wider">
                      Instrucciones sobre la Obra o Ruta (Opcional)
                    </label>
                    <textarea
                      id="user-prompt-instructions"
                      rows={3}
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Ej: Estimá para una repavimentación urbana en el municipio de San Lorenzo, reduciendo el margen de imprevistos."
                      className="w-full p-2.5 text-xs bg-[#FAFAFA] border border-[#D9D2C5] rounded-xl focus:border-[#5A716E] focus:ring-1 focus:ring-[#5A716E] outline-none transition-all placeholder:text-[#A4947E]/70 resize-none"
                      disabled={analyzing}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzePliego}
                    disabled={analyzing || !uploadedFile}
                    className={`w-full inline-flex items-center justify-center gap-2 p-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all shadow-xs cursor-pointer ${
                      analyzing
                        ? "bg-[#7A746B] cursor-not-allowed"
                        : !uploadedFile
                        ? "bg-[#A4947E] opacity-60 cursor-not-allowed"
                        : "bg-[#5A716E] hover:bg-[#485B58]"
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Analizando...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        <span>Evaluar Costos Estimados con IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading stage */}
            {analyzing && (
              <div className="p-6 bg-[#F5F2ED] rounded-xl flex flex-col items-center justify-center text-center space-y-4 border border-[#D9D2C5]">
                <RefreshCw className="h-10 w-10 text-[#5A716E] animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#2D2A26] animate-pulse">
                    {loadingSteps[loadingStep]}
                  </p>
                  <p className="text-[#7A746B] text-xs">
                    Estamos utilizando la inteligencia artificial de Gemini para extraer especificaciones clave y recalcular los costos de obra.
                  </p>
                </div>
              </div>
            )}

            {/* Success Result Panel */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FAFAFA] border border-emerald-100 rounded-xl overflow-hidden"
              >
                <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        ¡Auditoría de Pliego Procesada Exitosamente!
                      </span>
                      <h3 className="text-sm font-bold text-gray-900">
                        {analysisResult.estimatedTitle} — {analysisResult.estimatedLocation}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Parámetros Actualizados en la Planilla
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-[#D9D2C5]/50">
                    <div className="bg-white p-3 rounded-xl border border-[#D9D2C5]/70 text-center">
                      <span className="block text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Costo Directo Base</span>
                      <strong className="block text-sm text-[#2D2A26] mt-1">{fmtLocal(inputs.base_cd)}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D9D2C5]/70 text-center">
                      <span className="block text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Acopio H-30</span>
                      <strong className="block text-sm text-[#2D2A26] mt-1">{inputs.base_cant_ant} m³</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D9D2C5]/70 text-center">
                      <span className="block text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Precio m³ H-30</span>
                      <strong className="block text-sm text-[#2D2A26] mt-1">{fmtLocal(inputs.base_p_h30)}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#D9D2C5]/70 text-center">
                      <span className="block text-[10px] font-bold text-[#71715A] uppercase tracking-wider">Coeficientes Clave</span>
                      <strong className="block text-xs text-[#2D2A26] mt-1.5 flex justify-center gap-2">
                        <span>CI: {inputs.t_ci}%</span>
                        <span>GG: {inputs.t_gg}%</span>
                        <span>IMP: {inputs.t_imp}%</span>
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#3A3732] uppercase tracking-wider">
                      Informe Técnico de Justificación Financiera
                    </h4>
                    <div className="text-xs text-[#5A554E] leading-relaxed p-4 bg-white rounded-xl border border-[#D9D2C5]/70 whitespace-pre-wrap">
                      {analysisResult.explanation}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A4947E] italic">
                    * Los valores anteriores han reemplazado automáticamente los controles del simulador. Modifique libremente las márgenes de inflación o los beneficios para continuar ajustando su oferta polinómica.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONTROL & INPUT PARAMETERS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#EBE7DF] p-6 rounded-2xl border border-[#D9D2C5] shadow-xs relative">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D9D2C5]/70">
                <div className="flex items-center gap-2.5">
                  <Calculator className="h-5 w-5 text-[#5A716E]" />
                  <h2 className="font-display font-semibold text-[#2D2A26]">Panel de Parámetros</h2>
                </div>
                <span className="text-xs text-[#71715A] font-mono">Licitación 02/2026</span>
              </div>

              {/* SECTION 1: COSTOS DE OBRA */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-bold text-[#71715A] uppercase tracking-wider mb-2">1. Costos Directos de Obra</h3>
                
                {/* Costo Directo Base */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <label htmlFor="base_cd" className="text-[#3A3732]">Costo Directo Base (CD)</label>
                    <span className="text-[#2D2A26] font-bold font-mono">{fmtLocal(inputs.base_cd)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000000"
                    max="200000000"
                    step="500000"
                    value={inputs.base_cd}
                    onChange={(e) => handleInputChange('base_cd', e.target.value)}
                    className="w-full h-1.5 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E]"
                  />
                  <input
                    id="base_cd"
                    type="number"
                    value={inputs.base_cd}
                    onChange={(e) => handleInputChange('base_cd', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#D9D2C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] font-mono font-semibold text-[#2D2A26]"
                  />
                </div>

                {/* Precio H-30 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <label htmlFor="base_p_h30" className="text-[#3A3732]">Precio Unitario Hormigón H-30 ($/m³)</label>
                    <span className="text-[#2D2A26] font-bold font-mono">{fmtLocal(inputs.base_p_h30)}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="300000"
                    step="1000"
                    value={inputs.base_p_h30}
                    onChange={(e) => handleInputChange('base_p_h30', e.target.value)}
                    className="w-full h-1.5 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E]"
                  />
                  <input
                    id="base_p_h30"
                    type="number"
                    value={inputs.base_p_h30}
                    onChange={(e) => handleInputChange('base_p_h30', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-[#D9D2C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] font-mono font-semibold text-[#2D2A26]"
                  />
                </div>

                {/* Volumen Anticipo */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <label htmlFor="base_cant_ant" className="text-[#3A3732]">Volumen de Acopio / Anticipo de Pliego (m³)</label>
                    <span className="text-[#2D2A26] font-bold font-mono">{inputs.base_cant_ant} m³</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                    value={inputs.base_cant_ant}
                    onChange={(e) => handleInputChange('base_cant_ant', e.target.value)}
                    className="w-full h-1.5 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#5A716E]"
                  />
                  <div className="flex flex-col sm:flex-row gap-2 text-xs">
                    <input
                      id="base_cant_ant"
                      type="number"
                      value={inputs.base_cant_ant}
                      onChange={(e) => handleInputChange('base_cant_ant', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-[#D9D2C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] font-mono font-semibold text-[#2D2A26]"
                    />
                    <div className="bg-[#D4CEC5] px-2.5 py-1.5 rounded-xl text-[#3A3732] flex items-center shrink-0 font-medium text-[10px]">
                      Valor de acopio: {fmtLocal(advanceValue)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COEFICIENTES FIJOS */}
              <div className="space-y-4 mb-6 pt-4 border-t border-[#D9D2C5]/70">
                <h3 className="text-xs font-bold text-[#71715A] uppercase tracking-wider mb-2">2. Coeficientes Estructurales Fijos (%)</h3>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label htmlFor="t_ci" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Costo Indirecto</label>
                    <div className="relative">
                      <input
                        id="t_ci"
                        type="number"
                        step="0.05"
                        value={inputs.t_ci}
                        onChange={(e) => handleInputChange('t_ci', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_seg" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Seguros RC y ART</label>
                    <div className="relative">
                      <input
                        id="t_seg"
                        type="number"
                        step="0.1"
                        value={inputs.t_seg}
                        onChange={(e) => handleInputChange('t_seg', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_gar" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Garantía de Oferta</label>
                    <div className="relative">
                      <input
                        id="t_gar"
                        type="number"
                        step="0.05"
                        value={inputs.t_gar}
                        onChange={(e) => handleInputChange('t_gar', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_sel" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Sellado Provincial</label>
                    <div className="relative">
                      <input
                        id="t_sel"
                        type="number"
                        step="0.05"
                        value={inputs.t_sel}
                        onChange={(e) => handleInputChange('t_sel', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_apo" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Aportes Colegios</label>
                    <div className="relative">
                      <input
                        id="t_apo"
                        type="number"
                        step="0.1"
                        value={inputs.t_apo}
                        onChange={(e) => handleInputChange('t_apo', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_imp" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Imprevistos Campo</label>
                    <div className="relative">
                      <input
                        id="t_imp"
                        type="number"
                        step="0.1"
                        value={inputs.t_imp}
                        onChange={(e) => handleInputChange('t_imp', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_gg" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">Gastos Grales (Sede)</label>
                    <div className="relative">
                      <input
                        id="t_gg"
                        type="number"
                        step="0.5"
                        value={inputs.t_gg}
                        onChange={(e) => handleInputChange('t_gg', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="t_fin" className="block text-[10px] font-bold text-[#3A3732] uppercase tracking-wide">CF Neto S/ Descubierto</label>
                    <div className="relative">
                      <input
                        id="t_fin"
                        type="number"
                        step="0.1"
                        value={inputs.t_fin}
                        onChange={(e) => handleInputChange('t_fin', e.target.value)}
                        className="w-full pl-3 pr-6 py-1.5 bg-white border border-[#D9D2C5] rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E] text-[#2D2A26]"
                      />
                      <span className="absolute right-2.5 top-2.5 text-[#7a746b] font-semibold text-xs">%</span>
                    </div>
                  </div>
                </div>

                {/* Ajuste Rápido de Contingencia */}
                <div className="mt-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#D9D2C5]/80 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-[#8C6A5A] uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[#8C6A5A]" />
                      Ajuste Rápido: Factor de Contingencia
                    </span>
                    <span className="font-mono text-xs font-bold text-[#8C6A5A] bg-[#8C6A5A]/10 px-2 py-0.5 rounded-lg border border-[#8C6A5A]/20">
                      x{inputs.factor_contingencia.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7A746B] leading-relaxed">
                    Incrementa o reduce de forma lineal todos los rubros indirectos y provisiones operativas durante la etapa final del pliego de licitación.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={inputs.factor_contingencia}
                      onChange={(e) => handleInputChange('factor_contingencia', e.target.value)}
                      className="flex-1 h-1 bg-[#D9D2C5]/50 rounded-lg appearance-none cursor-pointer accent-[#8C6A5A]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="5.0"
                      value={inputs.factor_contingencia}
                      onChange={(e) => handleInputChange('factor_contingencia', e.target.value)}
                      className="w-16 px-1 py-1 text-center font-mono text-xs bg-white border border-[#D9D2C5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8C6A5A]/15 focus:border-[#8C6A5A] text-[#2D2A26] font-bold"
                    />
                  </div>
                </div>

                </div>

              {/* SECTION 3: VARIABLES MUTABLES POR ESCENARIO */}
              <div className="space-y-4 pt-4 border-t border-[#D9D2C5]/70">
                <h3 className="text-xs font-bold text-[#71715A] uppercase tracking-wider mb-2">3. Variables Específicas por Escenario (%)</h3>
                
                <div className="bg-[#F5F2ED] p-3 rounded-2xl border border-[#D9D2C5] space-y-4">
                  {/* Minimo */}
                  <div>
                    <span className="text-[11px] font-bold text-[#71715A] block mb-1">ESCENARIO MÍNIMO (Agresivo, Bajo Riesgo)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Inflación</span>
                        <input
                          type="number"
                          value={inputs.inf_min}
                          onChange={(e) => handleInputChange('inf_min', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Incentivo</span>
                        <input
                          type="number"
                          value={inputs.ben_min}
                          onChange={(e) => handleInputChange('ben_min', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optimo */}
                  <div>
                    <span className="text-[11px] font-bold text-[#5A716E] block mb-1">ESCENARIO ÓPTIMO (Equilibrado)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Inflación</span>
                        <input
                          type="number"
                          value={inputs.inf_opt}
                          onChange={(e) => handleInputChange('inf_opt', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Incentivo</span>
                        <input
                          type="number"
                          value={inputs.ben_opt}
                          onChange={(e) => handleInputChange('ben_opt', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maximo */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8C6A5A] block mb-1">ESCENARIO MÁXIMO (Protección ante Volatilidad)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Inflación</span>
                        <input
                          type="number"
                          value={inputs.inf_max}
                          onChange={(e) => handleInputChange('inf_max', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[9px] text-[#7A746B] uppercase font-bold">Incentivo</span>
                        <input
                          type="number"
                          value={inputs.ben_max}
                          onChange={(e) => handleInputChange('ben_max', e.target.value)}
                          className="w-full bg-white border border-[#D9D2C5] rounded-xl pl-14 pr-4 py-1 text-right text-xs font-mono font-bold text-[#2D2A26] focus:outline-none focus:ring-2 focus:ring-[#5A716E]/15 focus:border-[#5A716E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance supply explanation note */}
            <div className="bg-[#3A3732] text-[#F5F2ED] p-5 rounded-2xl border border-[#2D2A26] shadow-md">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-[#B6A699] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white font-display italic tracking-wide uppercase">
                    Mitigación de Descalce Financiero
                  </h4>
                  <p className="text-xs text-[#C7BDB3] leading-relaxed">
                    El pliego estipula un **Anticipo de Acopio Financiero (230m³ H-30)** valorizado a precio corriente. 
                    Dicha inyección líquida permite amortizar los costos operativos y atenúa el **Costo Financiero (Ítem 10)**, 
                    ya que éste se computa únicamente sobre la base neta de descubierto disponible en plaza:
                  </p>
                  <div className="bg-[#2D2A26]/80 p-2.5 rounded-xl border border-[#1C1A18] text-[11px] font-mono leading-relaxed space-y-1 text-[#D4CEC5]">
                    <div>• Acopio Anticipado: <span className="text-white font-semibold">{fmtLocal(advanceValue)}</span></div>
                    <div>• Impacto s/ Costo Obra:</div>
                    <div className="pl-2">- Min: {advancePercentMin.toFixed(1)}% mitigado</div>
                    <div className="pl-2">- Opt: {advancePercentOpt.toFixed(1)}% mitigado</div>
                    <div className="pl-2">- Max: {advancePercentMax.toFixed(1)}% mitigado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS, TABLES & CHARTS (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

             {/* TOP DYNAMIC SUMMARY BADGES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* MINIMO CONTAINER */}
              <button
                type="button"
                onClick={() => setSelectedScenario('min')}
                className={`text-left p-5 rounded-2xl border relative overflow-hidden transition-all text-ellipsis cursor-pointer ${
                  selectedScenario === 'min'
                    ? 'ring-2 ring-[#71715A] ring-offset-2 bg-[#71715A]/10 border-[#71715A] shadow-xs'
                    : 'bg-white border-[#D9D2C5] hover:border-[#71715A] hover:bg-[#F9F8F6]/85'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#71715A]">Mínimo (Agresivo)</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedScenario === 'min' ? 'bg-[#71715A] animate-pulse' : 'bg-[#D9D2C5]'}`}></div>
                </div>
                <div className="text-3xl font-display font-extrabold tracking-tight text-[#3A3732] my-1">
                  {fmtFactor(results.min.k)}
                </div>
                <p className="text-xs font-mono font-bold text-[#7A746B]">Oferta: {fmtLocal(results.min.pv_total)}</p>
                <div className="mt-2.5 pt-2.5 border-t border-[#D9D2C5]/50 flex justify-between text-[11px] text-[#7A746B]">
                  <span>Beneficio Neto:</span>
                  <span className="font-mono text-[#71715A] font-bold">{fmtLocal(results.min.ben)} ({inputs.ben_min}%)</span>
                </div>
              </button>

              {/* OPTIMO CONTAINER */}
              <button
                type="button"
                onClick={() => setSelectedScenario('opt')}
                className={`text-left p-5 rounded-2xl border relative overflow-hidden transition-all text-[#2D2A26] cursor-pointer ${
                  selectedScenario === 'opt'
                    ? 'ring-2 ring-[#5A716E] ring-offset-2 bg-[#5A716E]/10 border-[#5A716E] shadow-xs'
                    : 'bg-white border-[#D9D2C5] hover:border-[#5A716E] hover:bg-[#F9F8F6]/85'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A716E]">Óptimo (Equilibrado)</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedScenario === 'opt' ? 'bg-[#5A716E] animate-pulse' : 'bg-[#D9D2C5]'}`}></div>
                </div>
                <div className="text-3xl font-display font-extrabold tracking-tight text-[#3A3732] my-1">
                  {fmtFactor(results.opt.k)}
                </div>
                <p className="text-xs font-mono font-bold text-[#7A746B]">Oferta: {fmtLocal(results.opt.pv_total)}</p>
                <div className="mt-2.5 pt-2.5 border-t border-[#D9D2C5]/50 flex justify-between text-[11px] text-[#7A746B]">
                  <span>Beneficio Neto:</span>
                  <span className="font-mono text-[#5A716E] font-bold">{fmtLocal(results.opt.ben)} ({inputs.ben_opt}%)</span>
                </div>
              </button>

              {/* MAXIMO CONTAINER */}
              <button
                type="button"
                onClick={() => setSelectedScenario('max')}
                className={`text-left p-5 rounded-2xl border relative overflow-hidden transition-all text-ellipsis cursor-pointer ${
                  selectedScenario === 'max'
                    ? 'ring-2 ring-[#8C6A5A] ring-offset-2 bg-[#8C6A5A]/10 border-[#8C6A5A] shadow-xs'
                    : 'bg-white border-[#D9D2C5] hover:border-[#8C6A5A] hover:bg-[#F9F8F6]/85'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C6A5A]">Máximo (Protección)</span>
                  <div className={`h-2.5 w-2.5 rounded-full ${selectedScenario === 'max' ? 'bg-[#8C6A5A] animate-pulse' : 'bg-[#D9D2C5]'}`}></div>
                </div>
                <div className="text-3xl font-display font-extrabold tracking-tight text-[#3A3732] my-1">
                  {fmtFactor(results.max.k)}
                </div>
                <p className="text-xs font-mono font-bold text-[#7A746B]">Oferta: {fmtLocal(results.max.pv_total)}</p>
                <div className="mt-2.5 pt-2.5 border-t border-[#D9D2C5]/50 flex justify-between text-[11px] text-[#7A746B]">
                  <span>Beneficio Neto:</span>
                  <span className="font-mono text-[#8C6A5A] font-bold">{fmtLocal(results.max.ben)} ({inputs.ben_max}%)</span>
                </div>
              </button>

            </div>

            {/* CENTRAL TABS CONTROL */}
            <div className="bg-white rounded-2xl border border-[#D9D2C5] overflow-hidden shadow-sm">
              <div className="flex bg-[#EBE7DF] border-b border-[#D9D2C5] p-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('table')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'table'
                      ? 'bg-white text-[#2D2A26] shadow-xs'
                      : 'text-[#7A746B] hover:text-[#2D2A26]'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4 text-[#5A716E]" />
                  Estructura Comparativa
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('charts')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'charts'
                      ? 'bg-white text-[#2D2A26] shadow-xs'
                      : 'text-[#7A746B] hover:text-[#2D2A26]'
                  }`}
                >
                  <BarChart4 className="h-4 w-4 text-[#5A716E]" />
                  Gráficos y Distribución
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('formulas')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'formulas'
                      ? 'bg-white text-[#2D2A26] shadow-xs'
                      : 'text-[#7A746B] hover:text-[#2D2A26]'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 text-[#5A716E]" />
                  Fórmulas e Índices K
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gantt')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all focus:outline-none cursor-pointer ${
                    activeTab === 'gantt'
                      ? 'bg-white text-[#2D2A26] shadow-xs'
                      : 'text-[#7A746B] hover:text-[#2D2A26]'
                  }`}
                >
                  <Calendar className="h-4 w-4 text-[#5A716E]" />
                  Cronograma Gantt
                </button>
              </div>

              <div className="p-4 sm:p-6">
                
                {/* TAB 1: COMPARATIVE STRUCTURE TABLE */}
                {activeTab === 'table' && (
                  <div className="space-y-4">
                    {/* Search & Tooltip Row */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-72">
                        <input
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
                )}

                {/* TAB 2: RICH DYNAMIC CHARTS */}
                {activeTab === 'charts' && (
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

                    {/* NEW SECTION: DETAILED INFLATION SENSITIVITY CURVES */}
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
                )}                   {/* TAB 3: FORMULA INSPECTOR */}
                {activeTab === 'formulas' && (
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
                )}

                {activeTab === 'gantt' && (
                  <div className="space-y-6">
                    {/* Header Controls for Gantt */}
                    <div className="bg-[#F5F2ED] p-5 rounded-2xl border border-[#D9D2C5] space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#3A3732] uppercase tracking-wider flex items-center gap-2">
                            <Layers className="h-4 w-4 text-[#5A716E]" />
                            Cronograma de Obra Vial Estimado (Diagrama Gantt)
                          </h4>
                          <p className="text-xs text-[#7A746B] leading-relaxed">
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
                            min="6"
                            max="24"
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

                                      {/* Hito/Milestone Indicator (Diamond badge on the grid column) */}
                                      <div
                                        className="absolute -top-3.5 flex flex-col items-center z-20 pointer-events-none"
                                        style={{
                                          left: `calc(${((phase.milestoneMonth - 0.5) / plazoObra) * 100}% - 8px)`
                                        }}
                                        title={`Hito: ${phase.milestone} (Mes ${phase.milestoneMonth})`}
                                      >
                                        <div className={`h-4 w-4 transform rotate-45 border flex items-center justify-center shadow-xs transition-colors ${
                                          isCompleted
                                            ? 'bg-emerald-600 border-emerald-800 text-white'
                                            : 'bg-amber-500 border-amber-700 text-white'
                                        }`}>
                                          <span className="transform -rotate-45 text-[7px] font-extrabold">H</span>
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
                          return (
                            <div key={phase.id} className="flex gap-3 items-start p-3 bg-[#F5F2ED]/40 rounded-xl border border-[#D9D2C5]/50">
                              <span className={`inline-flex shrink-0 p-1 rounded-full text-white ${
                                isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                              }`}>
                                <CheckCircle className="h-3.5 w-3.5" />
                              </span>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-[#71715A] uppercase tracking-wide">
                                  Hito de Fase {phase.id} — Mes {phase.milestoneMonth}
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
                )}

              </div>
            </div>

            {/* QUICK ACTIONS & JSON EXPORT */}
            <div className="bg-white p-5 rounded-2xl border border-[#D9D2C5] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="p-3 bg-[#F5F2ED] text-[#5A716E] rounded-xl">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#3A3732] text-sm font-display">Respaldo Técnico Integrado</h4>
                  <p className="text-xs text-[#7A746B]">Descarga la estructura completa de precios y simuladores directamente para los pliegos oficiales.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5A716E] hover:bg-[#475957] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Descargar Reporte PDF (.pdf)
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#71715A] hover:bg-[#5E5E4A] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Descargar Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#8C6A5A] hover:bg-[#785A4D] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  Descargar JSON
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer information section */}
      <footer className="bg-[#3A3732] text-[#C7BDB3] text-xs py-8 mt-16 border-t border-[#2D2A26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="font-medium font-display italic text-[#EBE7DF]">
            Calculadora Vial Multiescenario para Análisis Polinómico • Licitación de Obra Pública Vial
          </p>
          <div className="flex justify-center items-center gap-2 text-[#A4947E] flex-wrap text-[11px]">
            <span>Amortización de Equipos Propios</span>
            <span>•</span>
            <span>Atenuación Financiera por Acopio H-30</span>
            <span>•</span>
            <span>Ley de Coparticipación IIBB Santa Fe</span>
          </div>
          <p className="text-[#A4947E]/80 text-[10px]">
            Herramienta ejecutiva provista para análisis de riesgo del oferente bajo variables de alta variabilidad macroeconómica.
          </p>
        </div>
      </footer>
    </div>
  );
}
