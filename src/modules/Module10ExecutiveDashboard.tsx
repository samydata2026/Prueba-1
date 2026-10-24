import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Percent, 
  Filter, 
  CheckCircle2, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Building,
  Layers
} from 'lucide-react';
import { PricingRecord, RegressionModel, OptimizationResult, SectorType } from '../types/pricing';

interface Module10ExecutiveDashboardProps {
  records: PricingRecord[];
  model: RegressionModel;
  optimization: OptimizationResult;
  sector: SectorType;
  producto: string;
  onNextModule: () => void;
  onNavigateToExport: () => void;
}

export const Module10ExecutiveDashboard: React.FC<Module10ExecutiveDashboardProps> = ({
  records,
  model,
  optimization,
  sector,
  producto,
  onNextModule,
  onNavigateToExport
}) => {
  const [selectedScenarioFilter, setSelectedScenarioFilter] = useState<'optimal' | 'current'>('optimal');

  const activePrice = selectedScenarioFilter === 'optimal' ? optimization.optimalPrice : optimization.currentPrice;
  const activeDemand = selectedScenarioFilter === 'optimal' ? optimization.optimalDemand : optimization.currentDemand;
  const activeRevenue = selectedScenarioFilter === 'optimal' ? optimization.optimalRevenue : optimization.currentRevenue;
  const activeCost = selectedScenarioFilter === 'optimal' ? optimization.optimalCost : optimization.currentCost;
  const activeProfit = selectedScenarioFilter === 'optimal' ? optimization.optimalProfit : optimization.currentProfit;
  const activeMargin = selectedScenarioFilter === 'optimal' ? optimization.optimalMarginPct : optimization.currentMarginPct;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado Ejecutivo */}
      <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              Tablero de Control Ejecutivo de Pricing
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Consolidado Directivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sector: <strong className="text-white">{sector}</strong> • Producto: <strong className="text-cyan-300">{producto}</strong> • Modelo OLS (R² = {(model.rSquared * 100).toFixed(1)}%)
          </p>
        </div>

        {/* Filtro de Escenario */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setSelectedScenarioFilter('optimal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedScenarioFilter === 'optimal'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ★ Escenario Óptimo P*
          </button>
          <button
            onClick={() => setSelectedScenarioFilter('current')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedScenarioFilter === 'current'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Escenario Actual
          </button>
        </div>
      </div>

      {/* Grid Principal de 8 Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Precio Unitario */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="text-[11px] font-medium text-slate-400 mb-1">
            {selectedScenarioFilter === 'optimal' ? 'Precio Óptimo (P*)' : 'Precio Actual'}
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-cyan-400">
            ${activePrice.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Vs actual (${optimization.currentPrice.toFixed(2)}):</span>
            <span className="font-mono text-cyan-300 font-bold">
              {optimization.optimalPrice >= optimization.currentPrice
                ? `+${(((optimization.optimalPrice - optimization.currentPrice) / optimization.currentPrice) * 100).toFixed(1)}%`
                : `${(((optimization.optimalPrice - optimization.currentPrice) / optimization.currentPrice) * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>

        {/* KPI 2: Demanda Estimada */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Demanda Proyectada</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-white">
            {activeDemand.toLocaleString()} <span className="text-xs font-normal text-slate-400">uds</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Sensibilidad (b):</span>
            <span className="font-mono text-slate-300">{Math.abs(model.slope).toFixed(1)} uds/$</span>
          </div>
        </div>

        {/* KPI 3: Ingresos Totales */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Facturación Total (IT)</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-blue-400">
            ${activeRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            P × Q proyectado
          </div>
        </div>

        {/* KPI 4: Costos Totales */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Costos Totales (CT)</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-rose-400">
            ${activeCost.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            CF + (c_v × Q)
          </div>
        </div>

        {/* KPI 5: Utilidad Neta */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="text-[11px] font-medium text-emerald-400 mb-1 flex items-center justify-between">
            <span>Utilidad Neta (Π)</span>
            {selectedScenarioFilter === 'optimal' && <span className="text-[10px] font-bold">★ MÁXIMA</span>}
          </div>
          <div className={`text-2xl lg:text-3xl font-bold font-mono ${activeProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${activeProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Incremento proyectado:</span>
            <span className="font-mono text-emerald-300 font-bold">
              {optimization.profitIncreasePct > 0 ? `+${optimization.profitIncreasePct}%` : '0%'}
            </span>
          </div>
        </div>

        {/* KPI 6: Margen Neto % */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Margen Neto s/Ventas</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-indigo-400">
            {activeMargin.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Margen Bruto Unitario: ${optimization.unitContributionMargin.toFixed(2)}
          </div>
        </div>

        {/* KPI 7: Punto de Equilibrio Unidades */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Punto de Equilibrio (Q)</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-amber-400">
            {optimization.breakEvenQuantity.toLocaleString()} <span className="text-xs font-normal text-slate-400">uds</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            CF / (P − c_v)
          </div>
        </div>

        {/* KPI 8: Punto de Equilibrio en Facturación */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 mb-1">Punto de Equilibrio ($)</div>
          <div className="text-2xl lg:text-3xl font-bold font-mono text-amber-300">
            ${optimization.breakEvenRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-2">
            Facturación mínima de seguridad
          </div>
        </div>
      </div>

      {/* Resumen Estratégico Ejecutivo */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Recomendaciones Ejecutivas para la Gerencia Comercial
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-cyan-300 block">1. Política de Precios Inmediata</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Ajustar el precio de lista gradualmente hacia el óptimo de <strong>${optimization.optimalPrice.toFixed(2)}</strong>. 
              Dado que la elasticidad es {model.elasticityType.toLowerCase()} (ε = {model.elasticityAtMean.toFixed(2)}), 
              este nivel captura el máximo valor sin provocar deserción masiva.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-emerald-300 block">2. Protección de Punto de Equilibrio</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              La operación requiere vender como mínimo <strong>{optimization.breakEvenQuantity.toLocaleString()} unidades</strong> 
              para cubrir los costos fijos. La demanda proyectada actual supera este umbral, otorgando un colchón de seguridad robusto.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1.5">
            <span className="font-bold text-indigo-300 block">3. Gestión de Descuentos y Promociones</span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              No otorgar descuentos comerciales que sitúen el precio por debajo de ${Math.round(records[0]?.Costo_Unitario * 1.25 || 20)}, 
              respetando la regla de margen mínimo configurada para salvaguardar el EBITDA del producto.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de Navegación y Exportación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onNavigateToExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
        >
          <Download className="w-4 h-4 text-slate-300" />
          <span>Exportar Todo a Excel o PDF</span>
        </button>

        <button
          onClick={onNextModule}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Interpretación Inteligente de Resultados (Módulo 11)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
