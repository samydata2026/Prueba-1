import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  ArrowRight,
  Filter,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { PricingRecord, BusinessRulesConfig, BusinessRuleViolation } from '../types/pricing';
import { calculateDescriptiveStats, calculateCorrelationMatrix, generateHistogramBins } from '../utils/statistics';
import { HistogramChart } from '../components/charts/HistogramChart';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';

interface Module5ExploratoryAnalysisProps {
  records: PricingRecord[];
  onNextModule: () => void;
}

export const Module5ExploratoryAnalysis: React.FC<Module5ExploratoryAnalysisProps> = ({
  records,
  onNextModule
}) => {
  // Configuración interactiva de Reglas de Negocio
  const [rulesConfig, setRulesConfig] = useState<BusinessRulesConfig>({
    minPriceAboveCost: true,
    minMarginPct: 20, // mínimo 20% de margen bruto
    requireNegativeElasticity: true,
    alertOnNegativeProfit: true
  });

  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('Todas');
  const [selectedPromoFilter, setSelectedPromoFilter] = useState<string>('Todas');

  // Filtrado reactivo de datos para explorar segmentos
  const filteredData = useMemo(() => {
    return records.filter(r => {
      if (selectedSeasonFilter !== 'Todas' && r.Temporada !== selectedSeasonFilter) return false;
      if (selectedPromoFilter !== 'Todas' && r.Promocion !== selectedPromoFilter) return false;
      return true;
    });
  }, [records, selectedSeasonFilter, selectedPromoFilter]);

  // Estadísticas descriptivas
  const precios = useMemo(() => filteredData.map(r => r.Precio).filter(v => !isNaN(v)), [filteredData]);
  const cantidades = useMemo(() => filteredData.map(r => r.Cantidad_Demandada).filter(v => !isNaN(v)), [filteredData]);
  const ingresos = useMemo(() => filteredData.map(r => r.Ingresos).filter(v => !isNaN(v)), [filteredData]);
  const utilidades = useMemo(() => filteredData.map(r => r.Utilidad).filter(v => !isNaN(v)), [filteredData]);

  const statsPrecio = useMemo(() => calculateDescriptiveStats(precios), [precios]);
  const statsCantidad = useMemo(() => calculateDescriptiveStats(cantidades), [cantidades]);
  const statsIngresos = useMemo(() => calculateDescriptiveStats(ingresos), [ingresos]);
  const statsUtilidad = useMemo(() => calculateDescriptiveStats(utilidades), [utilidades]);

  // Histogramas
  const binsPrecio = useMemo(() => generateHistogramBins(precios, 10), [precios]);
  const binsCantidad = useMemo(() => generateHistogramBins(cantidades, 10), [cantidades]);

  // Matriz de correlación
  const correlationData = useMemo(() => {
    const keys: (keyof PricingRecord)[] = ['Precio', 'Cantidad_Demandada', 'Costo_Unitario', 'Ingresos', 'Costo_Total', 'Utilidad'];
    return calculateCorrelationMatrix(records, keys);
  }, [records]);

  // Verificación de Reglas de Negocio
  const ruleViolations = useMemo(() => {
    const violations: BusinessRuleViolation[] = [];

    // Regla 1: Precio > Costo Variable Unitario
    if (rulesConfig.minPriceAboveCost) {
      const belowCostRows = records.filter(r => r.Precio < r.Costo_Unitario);
      if (belowCostRows.length > 0) {
        violations.push({
          id: 'rule_1',
          ruleName: 'Precio de Venta inferior al Costo Variable Unitario',
          severity: 'error',
          description: `Se detectaron ${belowCostRows.length} transacciones donde P < c_v, generando margen de contribución unitario negativo (venta a pérdida directa).`,
          count: belowCostRows.length,
          affectedRowIds: belowCostRows.slice(0, 5).map(r => r.ID_Producto)
        });
      }
    }

    // Regla 2: Margen mínimo exigido
    if (rulesConfig.minMarginPct > 0) {
      const lowMarginRows = records.filter(r => {
        if (r.Precio <= 0) return true;
        const margin = ((r.Precio - r.Costo_Unitario) / r.Precio) * 100;
        return margin < rulesConfig.minMarginPct;
      });
      if (lowMarginRows.length > 0) {
        violations.push({
          id: 'rule_2',
          ruleName: `Incumplimiento de Margen Bruto Mínimo (${rulesConfig.minMarginPct}%)`,
          severity: 'warning',
          description: `${lowMarginRows.length} periodos u operaciones operaron con un margen sobre costo inferior al umbral comercial exigido del ${rulesConfig.minMarginPct}%.`,
          count: lowMarginRows.length,
          affectedRowIds: lowMarginRows.slice(0, 5).map(r => r.ID_Producto)
        });
      }
    }

    // Regla 3: Utilidad neta negativa considerando costos fijos
    if (rulesConfig.alertOnNegativeProfit) {
      const lossRows = records.filter(r => r.Utilidad < 0);
      if (lossRows.length > 0) {
        violations.push({
          id: 'rule_3',
          ruleName: 'Periodos Comerciales con Pérdida Operativa (Utilidad < 0)',
          severity: 'warning',
          description: `${lossRows.length} registros no alcanzaron a absorber la totalidad de los costos fijos y variables del periodo comercial.`,
          count: lossRows.length,
          affectedRowIds: lossRows.slice(0, 5).map(r => r.ID_Producto)
        });
      }
    }

    return violations;
  }, [records, rulesConfig]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra de Filtros Exploratorios */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Exploración Estadística y Validación de Reglas Comerciales
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analiza la dispersión de precios, volúmenes transados y evalúa el cumplimiento de las restricciones de rentabilidad.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300">Temporada:</span>
            <select
              value={selectedSeasonFilter}
              onChange={(e) => setSelectedSeasonFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
            >
              <option value="Todas">Todas</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Promoción:</span>
            <select
              value={selectedPromoFilter}
              onChange={(e) => setSelectedPromoFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-white text-xs"
            >
              <option value="Todas">Todas</option>
              <option value="Sí">Con Promoción</option>
              <option value="No">Sin Promoción</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Estadísticos Descriptivos */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Tabla Resumen de Estadística Descriptiva ({filteredData.length} registros)
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <th className="py-2 px-3">Variable</th>
                <th className="py-2 px-3 text-right">Media</th>
                <th className="py-2 px-3 text-right">Mediana</th>
                <th className="py-2 px-3 text-right">Desv. Estándar</th>
                <th className="py-2 px-3 text-right">Mínimo</th>
                <th className="py-2 px-3 text-right">Máximo</th>
                <th className="py-2 px-3 text-right">IQR (Q3 - Q1)</th>
                <th className="py-2 px-3 text-right">Asimetría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-cyan-300 font-sans">Precio de Venta ($)</td>
                <td className="py-2 px-3 text-right">${statsPrecio.mean.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">${statsPrecio.median.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">${statsPrecio.stdDev.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">${statsPrecio.min.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">${statsPrecio.max.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">${statsPrecio.iqr.toFixed(2)}</td>
                <td className="py-2 px-3 text-right">{statsPrecio.skewness.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-emerald-300 font-sans">Cantidad Demandada (uds)</td>
                <td className="py-2 px-3 text-right">{statsCantidad.mean.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.median.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.stdDev.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.min.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.max.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.iqr.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsCantidad.skewness.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-blue-300 font-sans">Ingresos Totales ($)</td>
                <td className="py-2 px-3 text-right">${statsIngresos.mean.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsIngresos.median.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsIngresos.stdDev.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsIngresos.min.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsIngresos.max.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsIngresos.iqr.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsIngresos.skewness.toFixed(2)}</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2 px-3 font-semibold text-indigo-300 font-sans">Utilidad Neta ($)</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.mean.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.median.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.stdDev.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.min.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.max.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">${statsUtilidad.iqr.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{statsUtilidad.skewness.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Histogramas de Precios y Cantidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HistogramChart
          bins={binsPrecio}
          title="Distribución de Frecuencia: Precios de Venta ($)"
          unit="$"
          mean={statsPrecio.mean}
          color="#38bdf8"
        />
        <HistogramChart
          bins={binsCantidad}
          title="Distribución de Frecuencia: Cantidad Demandada (Unidades)"
          unit="uds"
          mean={statsCantidad.mean}
          color="#34d399"
        />
      </div>

      {/* Matriz de Correlación de Pearson */}
      <CorrelationHeatmap
        keys={correlationData.keys}
        matrix={correlationData.matrix}
      />

      {/* Motor Configurable de Reglas de Negocio */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Motor de Validación de Reglas Comerciales de Pricing
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Define los límites comerciales y detecta anomalías que comprometan la viabilidad del negocio.
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            ruleViolations.length === 0
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
          }`}>
            {ruleViolations.length === 0 ? '✓ 100% Reglas Satisfechas' : `${ruleViolations.length} Alertas Activas`}
          </span>
        </div>

        {/* Controles de Reglas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <label className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rulesConfig.minPriceAboveCost}
              onChange={(e) => setRulesConfig({ ...rulesConfig, minPriceAboveCost: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Precio &gt; Costo Variable Unitario</span>
              <span className="text-[11px] text-slate-400">Exige margen de contribución unitario estrictamente positivo.</span>
            </div>
          </label>

          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold text-white">Margen Bruto Mínimo:</span>
              <span className="font-mono text-cyan-400 font-bold">{rulesConfig.minMarginPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={5}
              value={rulesConfig.minMarginPct}
              onChange={(e) => setRulesConfig({ ...rulesConfig, minMarginPct: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-400 block">Umbral de descuento máximo permitido</span>
          </div>

          <label className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rulesConfig.alertOnNegativeProfit}
              onChange={(e) => setRulesConfig({ ...rulesConfig, alertOnNegativeProfit: e.target.checked })}
              className="mt-0.5 accent-indigo-500 rounded"
            />
            <div>
              <span className="font-semibold text-white block">Alerta de Pérdida Operativa</span>
              <span className="text-[11px] text-slate-400">Notificar periodos con Utilidad Neta &lt; $0.</span>
            </div>
          </label>
        </div>

        {/* Alertas Detectadas */}
        {ruleViolations.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-300 block">Alertas Generadas por el Motor:</span>
            {ruleViolations.map((v) => (
              <div
                key={v.id}
                className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                  v.severity === 'error'
                    ? 'bg-rose-950/20 border-rose-600/40 text-rose-200'
                    : 'bg-amber-950/20 border-amber-600/40 text-amber-200'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${v.severity === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <span>{v.ruleName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                      {v.count} casos
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{v.description}</p>
                  <div className="text-[10px] font-mono text-slate-400">
                    Muestra de IDs afectados: {v.affectedRowIds.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Avanzar a Curva de Demanda Econométrica (Módulo 6)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
