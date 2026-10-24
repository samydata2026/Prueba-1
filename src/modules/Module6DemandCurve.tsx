import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  HelpCircle, 
  Sparkles, 
  Sliders, 
  TrendingDown, 
  Calculator, 
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PricingRecord, RegressionModel, SubjectiveDemandConfig } from '../types/pricing';
import { fitLinearDemandModel } from '../utils/statistics';
import { DemandScatterChart } from '../components/charts/DemandScatterChart';

interface Module6DemandCurveProps {
  records: PricingRecord[];
  onModelEstimated: (model: RegressionModel) => void;
  onNextModule: () => void;
}

export const Module6DemandCurve: React.FC<Module6DemandCurveProps> = ({
  records,
  onModelEstimated,
  onNextModule
}) => {
  // Ajuste OLS
  const regressionModel = useMemo(() => {
    const model = fitLinearDemandModel(records);
    onModelEstimated(model);
    return model;
  }, [records]);

  // Simulador de precio para proyectar demanda en tiempo real
  const [testPrice, setTestPrice] = useState<number>(regressionModel.meanPrice || 35);

  // Curva subjetiva/hipotética
  const [showSubjective, setShowSubjective] = useState<boolean>(false);
  const [subjectiveConfig, setSubjectiveConfig] = useState<SubjectiveDemandConfig>({
    willingnessToPayMax: Math.round(regressionModel.meanPrice * 2.2),
    priceSensitivity: 1.35,
    brandPositioning: 'Mass-Market',
    customerPerceptionScore: 7.5,
    expectedReferencePrice: Math.round(regressionModel.meanPrice * 1.05)
  });

  // Datos para el gráfico
  const chartData = useMemo(() => {
    return records.map(r => ({
      x: r.Precio,
      y: r.Cantidad_Demandada,
      id: r.ID_Producto,
      promo: r.Promocion,
      season: r.Temporada
    }));
  }, [records]);

  // Proyección de demanda con el modelo lineal
  const predictedQ = Math.max(0, Math.round(regressionModel.intercept + regressionModel.slope * testPrice));

  // Elasticidad calculada al precio de prueba
  const elasticityAtTestPrice = predictedQ > 0 ? (regressionModel.slope * (testPrice / predictedQ)) : -1.0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado del Módulo */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              Modelado Microeconómico de la Curva de Demanda
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Estimación por Mínimos Cuadrados Ordinarios (MCO / OLS) y contraste con escenarios de demanda subjetiva.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              R² = {(regressionModel.rSquared * 100).toFixed(1)}%
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              regressionModel.elasticityType === 'Elástica'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
            }`}>
              Demanda {regressionModel.elasticityType} (ε = {regressionModel.elasticityAtMean.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico Principal de Demanda OLS */}
      <div className="space-y-3">
        <DemandScatterChart
          data={chartData}
          model={regressionModel}
          subjectiveConfig={subjectiveConfig}
          showSubjective={showSubjective}
          userSimulatedPrice={testPrice}
        />
      </div>

      {/* Tarjetas de Coeficientes y Métricas Econométricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Ecuación Estimada (OLS):</span>
          <div className="font-mono font-bold text-sm text-cyan-300 truncate" title={regressionModel.equation}>
            {regressionModel.equation}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Q = a + b · P</span>
        </div>

        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Pendiente (Sensibilidad b):</span>
          <div className="font-mono font-bold text-sm text-rose-400">
            {regressionModel.slope.toFixed(2)} uds / $
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Por cada +$1 en precio, Q cae {Math.abs(regressionModel.slope).toFixed(1)} uds
          </span>
        </div>

        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Bondad de Ajuste R²:</span>
          <div className="font-mono font-bold text-sm text-indigo-400">
            {(regressionModel.rSquared * 100).toFixed(1)}% (R² adj: {(regressionModel.adjRSquared * 100).toFixed(1)}%)
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Varianza de ventas explicada por precio
          </span>
        </div>

        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Significancia Estadística:</span>
          <div className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>p-valor &lt; {regressionModel.pValue.toFixed(3)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            t-stat = {regressionModel.tStat.toFixed(2)} (Robusto al 95%)
          </span>
        </div>
      </div>

      {/* Calculadora Interactiva de Proyección de Demanda */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 rounded-xl border border-indigo-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            Simulador de Proyección de Demanda por Precio de Decisión
          </h4>
          <span className="text-xs text-indigo-300 font-mono">
            Modelo: Q = {regressionModel.intercept.toFixed(1)} {regressionModel.slope < 0 ? '-' : '+'} {Math.abs(regressionModel.slope).toFixed(2)} · P
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Precio a Evaluar ($):</span>
              <span className="font-mono text-cyan-400 font-bold text-base">${testPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={Math.max(1, Math.round(regressionModel.meanPrice * 0.4))}
              max={Math.round(regressionModel.meanPrice * 2.2)}
              step={0.5}
              value={testPrice}
              onChange={(e) => setTestPrice(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Mínimo</span>
              <span>Precio Medio: ${regressionModel.meanPrice.toFixed(1)}</span>
              <span>Máximo</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-400 block">Demanda Estimada Proyectada:</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {predictedQ.toLocaleString()} <span className="text-xs font-normal text-slate-400">unidades</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Ingresos brutos esperados: ${(testPrice * predictedQ).toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-400 block">Elasticidad Puntual (ε):</span>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {elasticityAtTestPrice.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-300">
              {Math.abs(elasticityAtTestPrice) > 1.05
                ? 'Zona Elástica: Un alza del 10% en precio reduce ingresos.'
                : Math.abs(elasticityAtTestPrice) < 0.95
                ? 'Zona Inelástica: Un alza de precio incrementa ingresos.'
                : 'Elasticidad Unitaria: Ingresos en su punto estacionario.'}
            </div>
          </div>
        </div>
      </div>

      {/* PARTE B: Curva de Demanda Subjetiva / Hipotética */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Simulador de Curva de Demanda Subjetiva (Percepción y WTP)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Modifica supuestos hipotéticos de disposición a pagar (WTP), sensibilidad y posicionamiento para comparar con la evidencia empírica.
            </p>
          </div>

          <button
            onClick={() => setShowSubjective(!showSubjective)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              showSubjective
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            <span>{showSubjective ? 'Ocultar Curva Subjetiva' : 'Superponer Curva Subjetiva en Gráfico'}</span>
          </button>
        </div>

        {/* Disclaimer de supuestos teóricos */}
        <div className="p-3 bg-amber-950/20 border border-amber-600/30 rounded-lg text-xs text-amber-300/90 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Aviso Metodológico:</strong> Los resultados generados en este bloque corresponden a 
            <strong> supuestos de simulación teórica</strong> del usuario y no a observaciones fácticas del mercado.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Disposición a pagar máxima (WTP) */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Disposición a Pagar Máxima (WTP):</span>
              <span className="font-mono text-amber-400 font-bold">${subjectiveConfig.willingnessToPayMax}</span>
            </div>
            <input
              type="range"
              min={Math.round(regressionModel.meanPrice * 1.2)}
              max={Math.round(regressionModel.meanPrice * 3.5)}
              step={2}
              value={subjectiveConfig.willingnessToPayMax}
              onChange={(e) => setSubjectiveConfig({ ...subjectiveConfig, willingnessToPayMax: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <span className="text-[10px] text-slate-400">Precio de reserva donde la demanda cae a 0</span>
          </div>

          {/* Sensibilidad al precio */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Sensibilidad Hipotética:</span>
              <span className="font-mono text-cyan-400 font-bold">{subjectiveConfig.priceSensitivity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={2.5}
              step={0.05}
              value={subjectiveConfig.priceSensitivity}
              onChange={(e) => setSubjectiveConfig({ ...subjectiveConfig, priceSensitivity: Number(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <span className="text-[10px] text-slate-400">Mayor valor = curva más elástica y convexa</span>
          </div>

          {/* Posicionamiento de marca */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <label className="text-xs text-slate-300 block font-semibold">Posicionamiento Percibido:</label>
            <select
              value={subjectiveConfig.brandPositioning}
              onChange={(e) => setSubjectiveConfig({ ...subjectiveConfig, brandPositioning: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
            >
              <option value="Low-Cost">Low-Cost / Descuento (Sensibilidad Extrema)</option>
              <option value="Mass-Market">Mass-Market (Equilibrio Calidad-Precio)</option>
              <option value="Premium">Premium (Alta Inelasticidad de Marca)</option>
              <option value="Lujo">Lujo / Veblen (Demanda con estatus)</option>
            </select>
            <span className="text-[10px] text-slate-400 block">Modifica la pendiente percibida</span>
          </div>
        </div>
      </div>

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Modelo Financiero y CVP (Módulo 7)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
