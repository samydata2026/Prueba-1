import React, { useState, useMemo } from 'react';
import { 
  Sparkle, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Layers, 
  ArrowRight,
  TrendingDown,
  Filter,
  ShieldAlert
} from 'lucide-react';
import { PricingRecord, CleaningSummary } from '../types/pricing';
import { analyzeDatasetQuality, executeDataCleaning, CleaningOptions } from '../utils/dataCleaner';

interface Module4DataCleaningProps {
  records: PricingRecord[];
  onDataCleaned: (cleanedRecords: PricingRecord[], summary: CleaningSummary) => void;
  onNextModule: () => void;
}

export const Module4DataCleaning: React.FC<Module4DataCleaningProps> = ({
  records,
  onDataCleaned,
  onNextModule
}) => {
  // Opciones de limpieza seleccionables por el usuario
  const [options, setOptions] = useState<CleaningOptions>({
    removeDuplicates: true,
    handleNulls: 'impute_median',
    filterOutliers: true,
    fixNegativeOrZeroPrices: true,
    recalculateFinancials: true
  });

  const [lastSummary, setLastSummary] = useState<CleaningSummary | null>(null);

  // Análisis de calidad actual
  const qualityReport = useMemo(() => {
    return analyzeDatasetQuality(records);
  }, [records]);

  const { report, anomalies } = qualityReport;

  const handleApplyCleaning = () => {
    const result = executeDataCleaning(records, options);
    setLastSummary(result.summary);
    onDataCleaned(result.cleaned, result.summary);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumen de Salud del Dataset */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-indigo-400" />
              Auditoría de Calidad e Integridad de Datos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detección automática de inconsistencias contables, valores ausentes, duplicados y outliers estadísticos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              anomalies.totalAnomalies === 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {anomalies.totalAnomalies === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dataset Limpio y Conforme</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>{anomalies.totalAnomalies} observaciones requieren atención</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tarjetas de Diagnóstico */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Valores Faltantes (Nulos):</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold font-mono ${anomalies.nullsTotal > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {anomalies.nullsTotal}
              </span>
              <span className="text-[11px] text-slate-500">
                ({records.length > 0 ? ((anomalies.nullsTotal / (records.length * (report.length || 1))) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Registros Duplicados:</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold font-mono ${anomalies.duplicatesCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {anomalies.duplicatesCount}
              </span>
              <span className="text-[11px] text-slate-500">filas repetidas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Outliers de Precio (IQR):</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold font-mono ${anomalies.priceOutliersCount > 0 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {anomalies.priceOutliersCount}
              </span>
              <span className="text-[11px] text-slate-500">atípicos leves</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Ventas bajo Costo (P &lt; CU):</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-xl font-bold font-mono ${anomalies.priceBelowCostCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {anomalies.priceBelowCostCount}
              </span>
              <span className="text-[11px] text-slate-500">inconsistencias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calidad Columna por Columna */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Diagnóstico de Nulos y Cardinalidad por Columna
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <th className="py-2 px-3">Columna</th>
                <th className="py-2 px-3">Tipo Detectado</th>
                <th className="py-2 px-3 text-right">Valores Nulos</th>
                <th className="py-2 px-3 text-right">% Nulos</th>
                <th className="py-2 px-3 text-right">Valores Únicos</th>
                <th className="py-2 px-3 text-right">Rango Min - Max</th>
                <th className="py-2 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {report.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-white font-sans">{col.column}</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">{col.dataType}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={col.nullCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {col.nullCount}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">{col.nullPct}%</td>
                  <td className="py-2 px-3 text-right text-indigo-300">{col.distinctCount}</td>
                  <td className="py-2 px-3 text-right text-slate-400">
                    {col.min !== undefined && col.max !== undefined
                      ? `${col.min.toLocaleString()} — ${col.max.toLocaleString()}`
                      : '—'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {col.nullCount === 0 ? (
                      <span className="text-emerald-400 text-[10px] font-sans">✓ Saludable</span>
                    ) : (
                      <span className="text-amber-400 text-[10px] font-sans">⚠ Nulos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de Configuración de Acciones de Limpieza */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Configuración del Pipeline de Limpieza y Transformación
          </h4>
          <span className="text-xs text-slate-400">Personaliza los criterios a aplicar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Opción 1: Duplicados */}
          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={options.removeDuplicates}
              onChange={(e) => setOptions({ ...options, removeDuplicates: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Eliminar Registros Duplicados</span>
              <span className="text-slate-400 text-[11px]">
                Detecta y purga transacciones con firmas idénticas de fecha, producto, precio y volumen.
              </span>
            </div>
          </label>

          {/* Opción 2: Valores negativos o cero */}
          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={options.fixNegativeOrZeroPrices}
              onChange={(e) => setOptions({ ...options, fixNegativeOrZeroPrices: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Filtrar Precios y Cantidades Negativas o Cero</span>
              <span className="text-slate-400 text-[11px]">
                Previene errores econométricos y logarítmicos descartando precios P ≤ 0 o cantidades Q &lt; 0.
              </span>
            </div>
          </label>

          {/* Opción 3: Tratamiento de Nulos */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <span className="font-semibold text-white block">Estrategia para Valores Ausentes (Nulos):</span>
            <select
              value={options.handleNulls}
              onChange={(e) => setOptions({ ...options, handleNulls: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
            >
              <option value="impute_median">Imputar con la Mediana del Segmento (Recomendado)</option>
              <option value="remove">Eliminar filas incompletas (Listwise Deletion)</option>
              <option value="none">Conservar sin modificar</option>
            </select>
          </div>

          {/* Opción 4: Outliers */}
          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800">
            <input
              type="checkbox"
              checked={options.filterOutliers}
              onChange={(e) => setOptions({ ...options, filterOutliers: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Filtrar Outliers Extremos de Precio (IQR &gt; 2.5)</span>
              <span className="text-slate-400 text-[11px]">
                Elimina distorsiones severas producidas por errores de digitación o precios atípicos desproporcionados.
              </span>
            </div>
          </label>

          {/* Opción 5: Recalcular Integridad Financiera */}
          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800 md:col-span-2">
            <input
              type="checkbox"
              checked={options.recalculateFinancials}
              onChange={(e) => setOptions({ ...options, recalculateFinancials: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Recalcular y Sincronizar Integridad Contable</span>
              <span className="text-slate-400 text-[11px]">
                Garantiza que Ingresos = P × Q, Costo_Total = CF + CU × Q, y Utilidad = Ingresos − Costo_Total en todo el dataset.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleApplyCleaning}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-md shadow-indigo-600/20 transition"
          >
            <Sparkle className="w-4 h-4" />
            <span>Ejecutar Pipeline de Limpieza</span>
          </button>
        </div>
      </div>

      {/* Resumen Comparativo ANTES vs DESPUÉS */}
      {lastSummary && (
        <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 rounded-xl border border-emerald-800/40 p-5 space-y-4">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Resultado de la Transformación: Comparativa Antes vs Después</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Registros Originales:</span>
              <span className="text-lg font-bold font-mono text-white">{lastSummary.originalCount}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Registros Conservados:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{lastSummary.cleanedCount}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Nulos o Inconsistentes:</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {lastSummary.nullsRemovedOrImputed + lastSummary.inconsistenciesFixed} tratados
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Outliers / Duplicados:</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {lastSummary.outliersAdjusted + lastSummary.duplicatesRemoved} purgados
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-300 block">Bitácora de Transformaciones Aplicadas:</span>
            <ul className="space-y-1 text-xs text-slate-400">
              {lastSummary.actionsApplied.map((act, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Análisis Exploratorio & Reglas de Negocio (Módulo 5)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
