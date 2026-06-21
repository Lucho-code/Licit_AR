/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  ShieldAlert,
  Award,
  FileSpreadsheet,
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
  Brain
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
  Cell
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
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'formulas'>('table');
  const [exportSuccess, setExportSuccess] = useState(false);

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
      });

      setAnalysisResult({
        estimatedTitle: data.estimatedTitle,
        estimatedLocation: data.estimatedLocation,
        explanation: data.explanation,
      });
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

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#2D2A26] font-sans selection:bg-[#5A716E] selection:text-white">
      {/* Top Professional Header Banner */}
      <header className="bg-[#F5F2ED] text-[#2D2A26] relative overflow-hidden border-b border-[#D9D2C5]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] bg-[#E0DCD4] text-[#5A554E]">
                  Licitación Vial Pública 02/2026
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] bg-[#E0DCD4] text-[#5A554E]">
                  Fórmula Polinómica
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display italic tracking-tight text-[#3A3732] mb-1">
                Calculadora Vial Multiescenario
              </h1>
              <p className="text-[#7A746B] text-xs sm:text-sm max-w-3xl leading-relaxed">
                Estructura de costos avanzada para pavimentación con amortización inteligente de equipos propios, 
                imprevistos técnicos y amortiguación por anticipo financiero de H-30 (Pliego contractual: 230m³).
              </p>
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
              <div className="relative">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#5A716E] hover:bg-[#485B58] rounded-lg transition-all shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar CSV
                </button>
              </div>
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
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5A716E] hover:bg-[#475957] text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer"
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
