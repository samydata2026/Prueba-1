import React from 'react';

interface SensitivityPoint {
  deltaPct: number;
  precio: number;
  demanda: number;
  utilidad: number;
  deltaProfitPct: number;
  deltaDemandPct: number;
}

interface SensitivityChartProps {
  data: SensitivityPoint[];
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-slate-900/40 rounded-xl border border-slate-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-200">
          Sensibilidad de Utilidad Neta frente a Variaciones de Precio
        </h4>
        <span className="text-[11px] text-slate-400">Escenarios ±5%, ±10%, ±15%, ±20%</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {data.filter(d => d.deltaPct !== 0).map((pt, idx) => {
          const isProfitable = pt.deltaProfitPct >= 0;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                isProfitable
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-rose-950/20 border-rose-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">
                  {pt.deltaPct > 0 ? `+${pt.deltaPct}%` : `${pt.deltaPct}%`} en Precio
                </span>
                <span className="font-mono text-slate-400 text-[11px]">${pt.precio.toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-base font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pt.deltaProfitPct > 0 ? `+${pt.deltaProfitPct.toFixed(1)}%` : `${pt.deltaProfitPct.toFixed(1)}%`}
                </span>
                <span className="text-[11px] text-slate-400">en Utilidad</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                <span>Demanda estimada:</span>
                <span className="font-mono text-slate-300">{Math.round(pt.demanda).toLocaleString()} uds</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de impacto comparativa */}
      <div className="space-y-2 mt-2">
        {data.map((pt, idx) => {
          const barWidth = Math.min(100, Math.abs(pt.deltaProfitPct) * 1.5);
          const isPos = pt.deltaProfitPct >= 0;
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span className="w-20 font-mono text-slate-400 text-right">
                {pt.deltaPct === 0 ? 'Base (0%)' : `${pt.deltaPct > 0 ? '+' : ''}${pt.deltaPct}%`}
              </span>
              <div className="flex-1 h-3.5 bg-slate-800 rounded-full overflow-hidden flex items-center relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    pt.deltaPct === 0 ? 'bg-cyan-500' : isPos ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(4, barWidth)}%` }}
                />
              </div>
              <span className="w-24 text-right font-mono text-[11px] text-slate-300">
                ${Math.round(pt.utilidad).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
