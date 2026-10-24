import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  Sliders, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TableProperties,
  Percent
} from 'lucide-react';
import { PricingRecord, RegressionModel, OptimizationResult, ScenarioPoint } from '../types/pricing';
import { ProfitOptimizationChart } from '../components/charts/ProfitOptimizationChart';
import { SensitivityChart } from '../components/charts/SensitivityChart';

interface Module8PricingOptimizationProps {
  records: PricingRecord[];
  model: RegressionModel;
  onOptimizationComputed: (opt: OptimizationResult) => void;
  onNextModule: () => void;
}

export const Module8PricingOptimization: React.FC<Module8PricingOptimizationProps> = ({
  records,
  model,
  onOptimizationComputed,
  onNextModule
}) => {
  // Parámetros base desde el dataset
  const avgRecord = records[0] || {
    Precio: 35,
    Costo_Unitario: 14,
    Costo_Fijo: 5000
  };

  const [costoUnitario, setCostoUnitario] = useState<number>(avgRecord.Costo_Unitario || 14);
  const [costoFijo, setCostoFijo] = useState<number>(avgRecord.Costo_Fijo || 5000);
  const [currentPrice, setCurrentPrice] = useState<number>(avgRecord.Precio || 35);

  // Restricciones comerciales configurables
  const [minPriceLimit, setMinPriceLimit] = useState<number>(Math.round(costoUnitario * 1.15));
  const [maxPriceLimit, setMaxPriceLimit] = useState<number>(Math.round(currentPrice * 2.2));

  // Optimización matemática cuadrática exacta:
  // Demanda: Q(P) = a + b * P (donde b < 0, representamos bAbs = |b| => Q(P) = a - bAbs * P)
  // Utilidad: Pi(P) = P * Q(P) - [CF + cv * Q(P)]
  // Pi(P) = P * (a - bAbs * P) - CF - cv * (a - bAbs * P)
  // Pi(P) = a*P - bAbs*P^2 - CF - a*cv + bAbs*cv*P
  // Pi(P) = -bAbs * P^2 + (a + bAbs * cv) * P - (CF + a * cv)
  // dPi/dP = -2 * bAbs * P + (a + bAbs * cv) = 0
  // P* = (a + bAbs * cv) / (2 * bAbs) = (a / (2 * bAbs)) + (cv / 2)
  const optimization: OptimizationResult = useMemo(() => {
    const a = model.intercept;
    const bAbs = Math.abs(model.slope) || 1;
    const cv = costoUnitario;
    const cf = costoFijo;

    let unconstrainedPStar = (a + bAbs * cv) / (2 * bAbs);
    unconstrainedPStar = Math.round(unconstrainedPStar * 100) / 100;

    // Aplicar restricciones
    const optimalPrice = Math.max(minPriceLimit, Math.min(maxPriceLimit, unconstrainedPStar));
    const optimalDemand = Math.max(0, Math.round(a - bAbs * optimalPrice));
    const optimalRevenue = Math.round(optimalPrice * optimalDemand);
    const optimalCost = Math.round(cf + cv * optimalDemand);
    const optimalProfit = Math.round(optimalRevenue - optimalCost);
    const optimalMarginPct = optimalRevenue > 0 ? (optimalProfit / optimalRevenue) * 100 : 0;

    // Métricas al precio actual
    const currentDemand = Math.max(0, Math.round(a - bAbs * currentPrice));
    const currentRevenue = Math.round(currentPrice * currentDemand);
    const currentCost = Math.round(cf + cv * currentDemand);
    const currentProfit = Math.round(currentRevenue - currentCost);
    const currentMarginPct = currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;

    const profitIncreaseAbs = optimalProfit - currentProfit;
    const profitIncreasePct = currentProfit > 0
      ? ((optimalProfit - currentProfit) / currentProfit) * 100
      : (optimalProfit > 0 ? 100 : 0);

    const unitContrib = optimalPrice - cv;
    const breakEvenQ = unitContrib > 0 ? Math.ceil(cf / unitContrib) : 0;
    const breakEvenRev = Math.round(breakEvenQ * optimalPrice);

    const result: OptimizationResult = {
      currentPrice,
      currentDemand,
      currentRevenue,
      currentCost,
      currentProfit,
      currentMarginPct,

      optimalPrice,
      optimalDemand,
      optimalRevenue,
      optimalCost,
      optimalProfit,
      optimalMarginPct,

      profitIncreasePct: Math.round(profitIncreasePct * 10) / 10,
      profitIncreaseAbs,
      breakEvenQuantity: breakEvenQ,
      breakEvenRevenue: breakEvenRev,
      unitContributionMargin: Math.round(unitContrib * 100) / 100,
      contributionMarginRatio: optimalPrice > 0 ? Math.round((unitContrib / optimalPrice) * 1000) / 10 : 0
    };

    onOptimizationComputed(result);
    return result;
  }, [model, costoUnitario, costoFijo, currentPrice, minPriceLimit, maxPriceLimit]);

  // Tabla comparativa de 5 escenarios comerciales
  const scenariosTable: ScenarioPoint[] = useMemo(() => {
    const pOpt = optimization.optimalPrice;
    const pCurr = optimization.currentPrice;
    const pLow = Math.round(pOpt * 0.8 * 10) / 10;
    const pHigh = Math.round(pOpt * 1.15 * 10) / 10;
    const pPremium = Math.round(pOpt * 1.35 * 10) / 10;

    const calcPoint = (p: number, label: string, esOptimo?: boolean, esActual?: boolean): ScenarioPoint => {
      const q = Math.max(0, Math.round(model.intercept + model.slope * p));
      const ing = Math.round(p * q);
      const c = Math.round(costoFijo + costoUnitario * q);
      const util = Math.round(ing - c);
      const margen = ing > 0 ? (util / ing) * 100 : 0;

      return {
        label,
        precio: p,
        demanda: q,
        ingresos: ing,
        costoTotal: c,
        utilidad: util,
        margenPct: Math.round(margen * 10) / 10,
        esOptimo,
        esActual
      };
    };

    return [
      calcPoint(pLow, 'Escenario Agresivo / Descuento'),
      calcPoint(pCurr, 'Precio Histórico Actual', false, true),
      calcPoint(pOpt, '★ Precio Óptimo Recomendado (P*)', true, false),
      calcPoint(pHigh, 'Escenario de Captura de Margen'),
      calcPoint(pPremium, 'Escenario Premium Selecto')
    ].sort((a, b) => a.precio - b.precio);
  }, [optimization, model, costoUnitario, costoFijo]);

  // Análisis de sensibilidad con variaciones porcentuales sobre el óptimo
  const sensitivityData = useMemo(() => {
    const deltas = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
    const baseProfit = optimization.optimalProfit;
    const baseDemand = optimization.optimalDemand;
    const pOpt = optimization.optimalPrice;

    return deltas.map(delta => {
      const p = Math.round(pOpt * (1 + delta / 100) * 10) / 10;
      const q = Math.max(0, Math.round(model.intercept + model.slope * p));
      const ing = p * q;
      const c = costoFijo + costoUnitario * q;
      const prof = ing - c;
      const deltaProfitPct = baseProfit !== 0 ? ((prof - baseProfit) / Math.abs(baseProfit)) * 100 : 0;
      const deltaDemandPct = baseDemand !== 0 ? ((q - baseDemand) / baseDemand) * 100 : 0;

      return {
        deltaPct: delta,
        precio: p,
        demanda: q,
        utilidad: prof,
        deltaProfitPct: Math.round(deltaProfitPct * 10) / 10,
        deltaDemandPct: Math.round(deltaDemandPct * 10) / 10
      };
    });
  }, [optimization, model, costoUnitario, costoFijo]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Optimización Matemática de Precios para Máxima Rentabilidad
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo analítico del precio óptimo P* resolviendo la primera derivada de la función de beneficio cuadrática dΠ/dP = 0.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            ★ P* Óptimo = ${optimization.optimalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Gráfico Dual de Optimización de Precios */}
      <div className="space-y-3">
        <ProfitOptimizationChart
          model={model}
          costoUnitario={costoUnitario}
          costoFijo={costoFijo}
          optimization={optimization}
          minPrice={minPriceLimit}
          maxPrice={maxPriceLimit}
        />
      </div>

      {/* Tarjeta de Ganancia y Contraste vs Precio Actual */}
      <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/20 p-5 rounded-xl border border-emerald-800/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Veredicto Econométrico de Optimización
            </span>
            <div className="text-base md:text-lg font-bold text-white">
              Alcanzar el precio óptimo <span className="text-emerald-300">${optimization.optimalPrice.toFixed(2)}</span> proyecta una mejora de{' '}
              <span className="text-emerald-400 font-mono">
                {optimization.profitIncreaseAbs >= 0 ? `+$${optimization.profitIncreaseAbs.toLocaleString()}` : `-$${Math.abs(optimization.profitIncreaseAbs).toLocaleString()}`}
              </span>{' '}
              ({optimization.profitIncreasePct > 0 ? `+${optimization.profitIncreasePct}%` : `${optimization.profitIncreasePct}%`} en Utilidad Neta).
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              El precio óptimo equilibra el margen unitario (${optimization.unitContributionMargin.toFixed(2)}) 
              con el volumen demandado ({optimization.optimalDemand.toLocaleString()} uds), maximizando el área de ganancia neta.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Precio Actual:</span>
              <span className="font-mono font-bold text-white text-base">${optimization.currentPrice.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 block">Utilidad: ${optimization.currentProfit.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-700/50">
              <span className="text-emerald-300 block mb-0.5">Precio Óptimo P*:</span>
              <span className="font-mono font-bold text-emerald-400 text-base">${optimization.optimalPrice.toFixed(2)}</span>
              <span className="text-[10px] text-emerald-300/80 block">Utilidad: ${optimization.optimalProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Restricciones Comerciales */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Restricciones y Parámetros del Entorno de Optimización
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-300 block font-semibold">Precio Histórico Actual:</span>
            <input
              type="number"
              step="0.5"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
            />
            <span className="text-[10px] text-slate-400 block">Punto de referencia actual</span>
          </div>

          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-300 block font-semibold">Costo Variable Unitario (c_v):</span>
            <input
              type="number"
              step="0.5"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-300 block font-semibold">Límite Mínimo de Precio (Piso):</span>
            <input
              type="number"
              step="1"
              value={minPriceLimit}
              onChange={(e) => setMinPriceLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
            />
            <span className="text-[10px] text-slate-400 block">Piso regulatorio o costo</span>
          </div>

          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <span className="text-slate-300 block font-semibold">Límite Máximo de Precio (Techo):</span>
            <input
              type="number"
              step="1"
              value={maxPriceLimit}
              onChange={(e) => setMaxPriceLimit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-xs"
            />
            <span className="text-[10px] text-slate-400 block">Barrera competitiva máxima</span>
          </div>
        </div>
      </div>

      {/* Tabla Comparativa de Escenarios Comerciales */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <TableProperties className="w-4 h-4 text-cyan-400" />
          Tabla Comparativa de Escenarios de Decisión Comercial
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <th className="py-2.5 px-3">Escenario</th>
                <th className="py-2.5 px-3 text-right">Precio ($)</th>
                <th className="py-2.5 px-3 text-right">Demanda Estimada</th>
                <th className="py-2.5 px-3 text-right">Ingresos Proyectados</th>
                <th className="py-2.5 px-3 text-right">Costos Totales</th>
                <th className="py-2.5 px-3 text-right">Utilidad Neta</th>
                <th className="py-2.5 px-3 text-right">Margen Neto %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {scenariosTable.map((s, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    s.esOptimo
                      ? 'bg-emerald-950/30 text-white font-semibold'
                      : s.esActual
                      ? 'bg-indigo-950/20'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans flex items-center gap-2">
                    {s.esOptimo && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                    <span className={s.esOptimo ? 'text-emerald-300 font-bold' : s.esActual ? 'text-indigo-300' : 'text-slate-300'}>
                      {s.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">${s.precio.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right">{s.demanda.toLocaleString()} uds</td>
                  <td className="py-2.5 px-3 text-right text-blue-300">${s.ingresos.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">${s.costoTotal.toLocaleString()}</td>
                  <td className={`py-2.5 px-3 text-right font-bold text-sm ${s.utilidad >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${s.utilidad.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">{s.margenPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis de Sensibilidad */}
      <SensitivityChart data={sensitivityData} />

      {/* Disclaimer de Optimización */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <span>
          <strong>Nota de Rigor Metodológico:</strong> El precio óptimo P* se calcula estrictamente bajo el supuesto microeconómico 
          <em> ceteris paribus</em> y la linealidad de la curva estimada. Constituye una recomendación analítica fundamentada en datos, 
          pero no una garantía estocástica de mercado, dado que factores exógenos no capturados en el modelo pueden alterar la respuesta de los consumidores.
        </span>
      </div>

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Políticas Comerciales de Precios (Módulo 9)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
