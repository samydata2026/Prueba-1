import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Target, 
  Sliders, 
  Link2, 
  Unlink, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PricingRecord, RegressionModel } from '../types/pricing';
import { BreakEvenChart } from '../components/charts/BreakEvenChart';

interface Module7FinancialModelProps {
  records: PricingRecord[];
  model: RegressionModel;
  onNextModule: () => void;
}

export const Module7FinancialModel: React.FC<Module7FinancialModelProps> = ({
  records,
  model,
  onNextModule
}) => {
  // Valores promedio de partida basados en el dataset
  const avgRecord = records[0] || {
    Precio: 35,
    Cantidad_Demandada: 1200,
    Costo_Unitario: 14,
    Costo_Fijo: 5000
  };

  // Parámetros modificables interactivamente
  const [precio, setPrecio] = useState<number>(avgRecord.Precio || 35);
  const [costoUnitario, setCostoUnitario] = useState<number>(avgRecord.Costo_Unitario || 14);
  const [costoFijo, setCostoFijo] = useState<number>(avgRecord.Costo_Fijo || 5000);
  const [linkToDemandCurve, setLinkToDemandCurve] = useState<boolean>(true);
  const [manualDemand, setManualDemand] = useState<number>(avgRecord.Cantidad_Demandada || 1200);
  const [margenMinimoObjetivo, setMargenMinimoObjetivo] = useState<number>(25); // 25%

  // Cantidad demandada efectiva
  const cantidadEfectiva = linkToDemandCurve
    ? Math.max(0, Math.round(model.intercept + model.slope * precio))
    : manualDemand;

  // Cálculos financieros
  const ingresos = Math.round(precio * cantidadEfectiva);
  const costosVariablesTotales = Math.round(costoUnitario * cantidadEfectiva);
  const costoTotal = Math.round(costoFijo + costosVariablesTotales);
  const utilidad = Math.round(ingresos - costoTotal);
  const margenNetoPct = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
  
  // Margen de contribución
  const margenContribucionUnitario = precio - costoUnitario;
  const margenContribucionRatio = precio > 0 ? (margenContribucionUnitario / precio) * 100 : 0;

  // Punto de equilibrio
  const breakEvenQ = margenContribucionUnitario > 0 ? costoFijo / margenContribucionUnitario : 0;
  const breakEvenIngresos = breakEvenQ * precio;

  // Margen de seguridad: (Q_actual - Q_be) / Q_actual
  const margenSeguridadPct = cantidadEfectiva > 0 && margenContribucionUnitario > 0
    ? ((cantidadEfectiva - breakEvenQ) / cantidadEfectiva) * 100
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            Simulador Financiero de Precios: Costo - Volumen - Utilidad (CVP)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Interrelaciona la fijación de precio con los costos fijos, el costo marginal y el umbral de equilibrio operativo.
          </p>
        </div>

        <button
          onClick={() => setLinkToDemandCurve(!linkToDemandCurve)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            linkToDemandCurve
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {linkToDemandCurve ? (
            <>
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demanda Vinculada a Curva OLS</span>
            </>
          ) : (
            <>
              <Unlink className="w-3.5 h-3.5 text-slate-400" />
              <span>Demanda Manual Desvinculada</span>
            </>
          )}
        </button>
      </div>

      {/* Controles de Parámetros Financieros */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Ajuste Interactivo de Variables de Decisión y Costos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Precio de Venta */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between">
              <span className="text-slate-300">Precio Unitario (P):</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">${precio.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={Math.max(1, Math.round(costoUnitario * 0.8))}
              max={Math.round(costoUnitario * 4)}
              step={0.5}
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
            />
          </div>

          {/* Costo Variable Unitario */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between">
              <span className="text-slate-300">Costo Variable (c_v):</span>
              <span className="font-mono text-rose-400 font-bold text-sm">${costoUnitario.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(10, Math.round(precio * 1.2))}
              step={0.5}
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <input
              type="number"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
            />
          </div>

          {/* Costos Fijos */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between">
              <span className="text-slate-300">Costos Fijos (CF):</span>
              <span className="font-mono text-slate-300 font-bold text-sm">${costoFijo.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={40000}
              step={250}
              value={costoFijo}
              onChange={(e) => setCostoFijo(Number(e.target.value))}
              className="w-full accent-slate-400"
            />
            <input
              type="number"
              value={costoFijo}
              onChange={(e) => setCostoFijo(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
            />
          </div>

          {/* Demanda Q */}
          <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
            <div className="flex justify-between">
              <span className="text-slate-300">Cantidad Demandada (Q):</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {cantidadEfectiva.toLocaleString()} uds
              </span>
            </div>
            {linkToDemandCurve ? (
              <div className="p-2 bg-indigo-950/40 rounded border border-indigo-800/40 text-[10px] text-indigo-300">
                Calculada automáticamente con: <br />
                Q(P) = {model.intercept.toFixed(1)} {model.slope < 0 ? '-' : '+'} {Math.abs(model.slope).toFixed(2)} · {precio.toFixed(1)}
              </div>
            ) : (
              <>
                <input
                  type="range"
                  min={10}
                  max={5000}
                  step={50}
                  value={manualDemand}
                  onChange={(e) => setManualDemand(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <input
                  type="number"
                  value={manualDemand}
                  onChange={(e) => setManualDemand(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resultados Financieros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Ingresos Totales (P × Q):</span>
          <div className="text-2xl font-bold font-mono text-blue-400">
            ${ingresos.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Facturación bruta estimada</span>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Costo Total (CF + c_v × Q):</span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            ${costoTotal.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            CF: ${costoFijo.toLocaleString()} | CV: ${costosVariablesTotales.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Utilidad Neta (Π):</span>
          <div className={`text-2xl font-bold font-mono ${utilidad >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            ${utilidad.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ingresos − Costos Totales</span>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 block mb-1">Margen Neto sobre Ventas:</span>
          <div className={`text-2xl font-bold font-mono ${margenNetoPct >= margenMinimoObjetivo ? 'text-emerald-400' : 'text-amber-400'}`}>
            {margenNetoPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {margenNetoPct >= margenMinimoObjetivo ? '✓ Supera margen objetivo' : `⚠ Bajo objetivo (${margenMinimoObjetivo}%)`}
          </span>
        </div>
      </div>

      {/* Análisis de Punto de Equilibrio y Margen de Contribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Métricas CVP */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3 lg:col-span-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-400" />
            Diagnóstico del Punto de Equilibrio
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Margen de Contribución Unitario:</span>
              <div className="text-lg font-bold font-mono text-cyan-300">
                ${margenContribucionUnitario.toFixed(2)} / unidad
              </div>
              <span className="text-[10px] text-slate-500">
                Ratio de contribución: {margenContribucionRatio.toFixed(1)}% del precio
              </span>
            </div>

            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Punto de Equilibrio en Unidades (Q_be):</span>
              <div className="text-lg font-bold font-mono text-amber-400">
                {margenContribucionUnitario > 0 ? `${Math.ceil(breakEvenQ).toLocaleString()} uds` : 'Inalcanzable (P ≤ c_v)'}
              </div>
              <span className="text-[10px] text-slate-500">
                Volumen mínimo para no perder dinero
              </span>
            </div>

            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Punto de Equilibrio en Facturación ($):</span>
              <div className="text-lg font-bold font-mono text-amber-300">
                ${Math.round(breakEvenIngresos).toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Margen de Seguridad Operativo:</span>
              <div className={`text-lg font-bold font-mono ${margenSeguridadPct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {margenSeguridadPct.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500">
                {margenSeguridadPct > 0
                  ? `Las ventas pueden caer ${margenSeguridadPct.toFixed(1)}% antes de entrar en pérdidas.`
                  : 'Operando en zona de pérdidas operativas.'}
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico Visual de Punto de Equilibrio */}
        <div className="lg:col-span-2">
          <BreakEvenChart
            precio={precio}
            costoUnitario={costoUnitario}
            costoFijo={costoFijo}
            currentQ={cantidadEfectiva}
          />
        </div>
      </div>

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Simulación y Optimización de Precios P* (Módulo 8)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
