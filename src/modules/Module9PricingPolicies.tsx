import React, { useState } from 'react';
import { 
  Briefcase, 
  Rocket, 
  Swords, 
  Package, 
  TrendingUp, 
  Check, 
  ArrowRight,
  ShieldAlert,
  Percent,
  DollarSign
} from 'lucide-react';
import { PricingRecord, RegressionModel, OptimizationResult, BundleScenario } from '../types/pricing';

interface Module9PricingPoliciesProps {
  records: PricingRecord[];
  model: RegressionModel;
  optimization: OptimizationResult;
  onNextModule: () => void;
}

export const Module9PricingPolicies: React.FC<Module9PricingPoliciesProps> = ({
  records,
  model,
  optimization,
  onNextModule
}) => {
  const [activePolicyTab, setActivePolicyTab] = useState<'launch' | 'competition' | 'bundling'>('launch');

  // Parámetros de partida
  const pOpt = optimization.optimalPrice;
  const cv = records[0]?.Costo_Unitario || 14;
  const cf = records[0]?.Costo_Fijo || 5000;

  // SIMULADOR A: Lanzamiento de Producto
  const launchStrategies = [
    {
      name: 'Precio de Penetración',
      badge: 'Crecimiento Acelerado',
      price: Math.round((cv * 1.25) * 10) / 10,
      description: 'Fijar un precio agresivamente bajo para derribar barreras de entrada y captar rápidamente cuota de mercado.',
      expectedShare: '35% - 45% cuota mercado',
      risk: 'Medio (Margen unitario estrecho)',
      paybackMonths: 4.5
    },
    {
      name: 'Precio de Descremación (Skimming)',
      badge: 'Captura de Excedente',
      price: Math.round((pOpt * 1.35) * 10) / 10,
      description: 'Precio premium inicial dirigido a early adopters con alta disposición a pagar, antes de reducirlo gradualmente.',
      expectedShare: '12% - 18% cuota mercado',
      risk: 'Bajo (Altísima rentabilidad por unidad)',
      paybackMonths: 3.2
    },
    {
      name: 'Precio Basado en Costos (Cost-Plus)',
      badge: 'Enfoque Tradicional',
      price: Math.round((cv * 1.5) * 10) / 10,
      description: 'Aplica un margen estándar del 50% sobre el costo variable unitario para asegurar rentabilidad contable.',
      expectedShare: '22% - 28% cuota mercado',
      risk: 'Bajo (Ignora sensibilidad de la demanda)',
      paybackMonths: 5.8
    },
    {
      name: 'Precio Basado en Valor Percibido',
      badge: 'Enfoque Estratégico',
      price: Math.round((pOpt * 1.08) * 10) / 10,
      description: 'Precio alineado con el retorno y beneficios económicos percibidos por el cliente frente a sustitutos.',
      expectedShare: '25% - 32% cuota mercado',
      risk: 'Moderado (Requiere comunicación de valor)',
      paybackMonths: 3.8
    }
  ];

  // SIMULADOR B: Entrada de Competencia
  const [competitorPrice, setCompetitorPrice] = useState<number>(Math.round(pOpt * 0.85));
  const [differentiationScore, setDifferentiationScore] = useState<number>(7); // 1 a 10
  const [selectedResponse, setSelectedResponse] = useState<'match' | 'differentiate' | 'cost_cut' | 'fighting_brand'>('differentiate');

  const priceDiffPct = Math.round(((competitorPrice - pOpt) / pOpt) * 100);

  // SIMULADOR C: Productos Complementarios (Bundling)
  const [bundleData, setBundleData] = useState<BundleScenario>({
    productA: records[0]?.Producto || 'Producto Principal A',
    priceA: pOpt,
    costA: cv,
    demandA: Math.round(optimization.optimalDemand * 0.6),

    productB: 'Accesorio / Servicio B Complementario',
    priceB: Math.round(pOpt * 0.45),
    costB: Math.round(cv * 0.35),
    demandB: Math.round(optimization.optimalDemand * 0.3),

    bundleDiscountPct: 15,
    bundlePrice: Math.round((pOpt + pOpt * 0.45) * 0.85),
    bundleCost: cv + Math.round(cv * 0.35),
    bundleProjectedDemand: Math.round(optimization.optimalDemand * 0.42),

    individualProfitCombined: 0,
    bundledProfitCombined: 0,
    profitDeltaPct: 0
  });

  // Recálculo del escenario de Bundling
  const priceComboIndividual = bundleData.priceA + bundleData.priceB;
  const bundleCalculatedPrice = Math.round(priceComboIndividual * (1 - bundleData.bundleDiscountPct / 100) * 10) / 10;
  const profitIndividualCombined = (bundleData.priceA - bundleData.costA) * bundleData.demandA + (bundleData.priceB - bundleData.costB) * bundleData.demandB;
  
  // Demanda con paquete (aumenta el volumen global por el atractivo del combo)
  const profitWithBundle = 
    ((bundleData.priceA - bundleData.costA) * (bundleData.demandA * 0.4)) +
    ((bundleData.priceB - bundleData.costB) * (bundleData.demandB * 0.4)) +
    ((bundleCalculatedPrice - bundleData.bundleCost) * bundleData.bundleProjectedDemand);

  const bundleProfitDeltaPct = profitIndividualCombined > 0
    ? ((profitWithBundle - profitIndividualCombined) / profitIndividualCombined) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Simuladores de Políticas Comerciales y Estrategias de Pricing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evalúa tres coyunturas críticas de negocio: lanzamiento, amenaza de rivales y empaquetamiento (bundling).
          </p>
        </div>

        {/* Pestañas de Políticas */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActivePolicyTab('launch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activePolicyTab === 'launch'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Lanzamiento</span>
          </button>

          <button
            onClick={() => setActivePolicyTab('competition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activePolicyTab === 'competition'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Competencia</span>
          </button>

          <button
            onClick={() => setActivePolicyTab('bundling')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activePolicyTab === 'bundling'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Bundling</span>
          </button>
        </div>
      </div>

      {/* CASO A: Lanzamiento de Producto */}
      {activePolicyTab === 'launch' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Evaluación Comparativa de 4 Estrategias de Lanzamiento al Mercado
            </h4>
            <p className="text-xs text-slate-400">
              Analiza cómo varía el volumen, el riesgo y el periodo de retorno de inversión según el precio inicial fijado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {launchStrategies.map((strat, i) => {
              const q = Math.max(0, Math.round(model.intercept + model.slope * strat.price));
              const ing = strat.price * q;
              const cost = cf + cv * q;
              const util = ing - cost;
              const margen = ing > 0 ? (util / ing) * 100 : 0;

              return (
                <div
                  key={i}
                  className="bg-slate-900/50 rounded-xl border border-slate-800 hover:border-indigo-600/50 p-5 space-y-3 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{strat.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                      {strat.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{strat.description}</p>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Precio Sugerido:</span>
                      <span className="text-cyan-400 font-bold font-mono">${strat.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Demanda Estimada:</span>
                      <span className="text-white font-mono">{q.toLocaleString()} uds</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Utilidad Periodo:</span>
                      <span className={`font-mono font-bold ${util >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${util.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                    <span>Cuota Objetivo: <strong className="text-slate-200">{strat.expectedShare}</strong></span>
                    <span>Payback: <strong className="text-emerald-300">{strat.paybackMonths} meses</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CASO B: Entrada de Competencia */}
      {activePolicyTab === 'competition' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400" />
              Simulador de Respuesta Estratégica ante Guerra o Entrada de Rival
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Precio del Competidor Agresivo ($):</span>
                  <span className="font-mono text-rose-400 font-bold text-base">${competitorPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(cv * 0.9)}
                  max={Math.round(pOpt * 1.3)}
                  step={0.5}
                  value={competitorPrice}
                  onChange={(e) => setCompetitorPrice(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <div className="text-[11px] text-slate-400">
                  Diferencial frente a tu precio óptimo (${pOpt.toFixed(2)}):{' '}
                  <span className={`font-mono font-bold ${priceDiffPct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {priceDiffPct > 0 ? `+${priceDiffPct}%` : `${priceDiffPct}%`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Índice de Diferenciación de tu Marca (1 a 10):</span>
                  <span className="font-mono text-cyan-400 font-bold text-base">{differentiationScore}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={differentiationScore}
                  onChange={(e) => setDifferentiationScore(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[10px] text-slate-400">
                  {differentiationScore >= 7
                    ? 'Alta lealtad de clientes. No se recomienda bajar precios precipitadamente.'
                    : 'Baja diferenciación de producto. Alto riesgo de fuga de volumen por precio.'}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Respuestas Tácticas Evaluadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedResponse('match')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedResponse === 'match'
                  ? 'bg-rose-950/20 border-rose-500'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs">Estrategia 1: Igualar Precio Rival</span>
                <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Alto Riesgo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Bajas tu precio a ${competitorPrice.toFixed(2)}. Conservas volumen pero canibalizas margen unitario 
                y arriesgas espirales deflacionarias.
              </p>
              <div className="text-[11px] font-mono text-rose-300">
                Impacto en Utilidad Estimada: -{Math.abs(Math.round(priceDiffPct * 1.4))}%
              </div>
            </div>

            <div
              onClick={() => setSelectedResponse('differentiate')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedResponse === 'differentiate'
                  ? 'bg-emerald-950/20 border-emerald-500'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs">Estrategia 2: Defender Precio con Diferenciación</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Recomendada
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Mantienes precio en ${pOpt.toFixed(2)}. Inviertes en servicio, garantía o empaque para justificar la prima de calidad.
              </p>
              <div className="text-[11px] font-mono text-emerald-300">
                Pérdida moderada de volumen ({Math.max(3, Math.round(18 - differentiationScore * 1.5))}%), preservando rentabilidad unitaria.
              </div>
            </div>

            <div
              onClick={() => setSelectedResponse('cost_cut')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedResponse === 'cost_cut'
                  ? 'bg-indigo-950/20 border-indigo-500'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs">Estrategia 3: Eficiencia Operativa y Costos</span>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Estructural
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Renegocias insumos para reducir c_v un 12%. Te permite igualar margen sin perder cuota de mercado.
              </p>
              <div className="text-[11px] font-mono text-indigo-300">
                Recuperación proyectada del margen bruto en 60 días.
              </div>
            </div>

            <div
              onClick={() => setSelectedResponse('fighting_brand')}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                selectedResponse === 'fighting_brand'
                  ? 'bg-amber-950/20 border-amber-500'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs">Estrategia 4: Marca de Combate (Fighting Brand)</span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Segmentada
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Lanzas una submarca económica sin canibalizar tu producto principal, neutralizando al competidor low-cost.
              </p>
              <div className="text-[11px] font-mono text-amber-300">
                Blindaje del producto premium + captura de volumen sensible a precio.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASO C: Bundling y Productos Complementarios */}
      {activePolicyTab === 'bundling' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-400" />
              Simulador de Venta en Paquete (Bundling) vs Venta Individual
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 space-y-2">
                <span className="font-bold text-cyan-300 block">Producto Principal A:</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio Individual:</span>
                  <span className="font-mono text-white font-bold">${bundleData.priceA.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Costo Variable:</span>
                  <span className="font-mono text-slate-400">${bundleData.costA.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demanda Sola:</span>
                  <span className="font-mono text-white">{bundleData.demandA} uds</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 space-y-2">
                <span className="font-bold text-emerald-300 block">Producto Complementario B:</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio Individual:</span>
                  <span className="font-mono text-white font-bold">${bundleData.priceB.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Costo Variable:</span>
                  <span className="font-mono text-slate-400">${bundleData.costB.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Demanda Sola:</span>
                  <span className="font-mono text-white">{bundleData.demandB} uds</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-700/60 space-y-2">
                <span className="font-bold text-indigo-300 block">Configuración del Paquete (A + B):</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Descuento Paquete:</span>
                  <span className="font-mono text-indigo-300 font-bold">{bundleData.bundleDiscountPct}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={1}
                  value={bundleData.bundleDiscountPct}
                  onChange={(e) => setBundleData({ ...bundleData, bundleDiscountPct: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] pt-1 border-t border-indigo-800/40">
                  <span className="text-slate-300">Precio del Combo:</span>
                  <span className="font-mono text-emerald-400 font-bold">${bundleCalculatedPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Resultado Financiero Comparativo del Paquete */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Utilidad Combinada con Estrategia de Paquete:</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  ${Math.round(profitWithBundle).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-400">
                  Frente a venta individual separada (${Math.round(profitIndividualCombined).toLocaleString()})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-sm font-mono">
                  {bundleProfitDeltaPct >= 0 ? `+${bundleProfitDeltaPct.toFixed(1)}%` : `${bundleProfitDeltaPct.toFixed(1)}%`} en Rentabilidad Agregada
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Dashboard Ejecutivo (Módulo 10)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
