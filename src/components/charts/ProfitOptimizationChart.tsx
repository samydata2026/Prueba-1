import React, { useState } from 'react';
import { OptimizationResult, RegressionModel } from '../../types/pricing';

interface ProfitOptimizationChartProps {
  model: RegressionModel;
  costoUnitario: number;
  costoFijo: number;
  optimization: OptimizationResult;
  minPrice: number;
  maxPrice: number;
  height?: number;
}

export const ProfitOptimizationChart: React.FC<ProfitOptimizationChartProps> = ({
  model,
  costoUnitario,
  costoFijo,
  optimization,
  minPrice,
  maxPrice,
  height = 360
}) => {
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  const width = 720;
  const padding = { top: 30, right: 40, bottom: 50, left: 75 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Rango de evaluación
  const pStart = Math.max(costoUnitario * 0.9, minPrice * 0.85);
  const pEnd = maxPrice * 1.15;
  const steps = 60;

  const points: {
    p: number;
    q: number;
    revenue: number;
    cost: number;
    profit: number;
  }[] = [];

  let maxVal = 0;
  let minVal = 0;

  for (let i = 0; i <= steps; i++) {
    const p = pStart + (i / steps) * (pEnd - pStart);
    const q = Math.max(0, model.intercept + model.slope * p);
    const revenue = p * q;
    const cost = costoFijo + costoUnitario * q;
    const profit = revenue - cost;

    points.push({ p, q, revenue, cost, profit });

    if (revenue > maxVal) maxVal = revenue;
    if (profit > maxVal) maxVal = profit;
    if (profit < minVal) minVal = profit;
  }

  // Escalas
  maxVal = maxVal * 1.1;
  minVal = Math.min(0, minVal * 1.1);

  const scaleX = (x: number) => padding.left + ((x - pStart) / (pEnd - pStart || 1)) * innerWidth;
  const scaleY = (y: number) => padding.top + innerHeight - ((y - minVal) / (maxVal - minVal || 1)) * innerHeight;

  // Generar SVG Paths
  const makePath = (key: 'revenue' | 'cost' | 'profit') => {
    return points
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.p).toFixed(1)} ${scaleY(pt[key]).toFixed(1)}`)
      .join(' ');
  };

  const revenuePath = makePath('revenue');
  const costPath = makePath('cost');
  const profitPath = makePath('profit');

  // Eje cero para profit
  const zeroY = scaleY(0);

  // Ticks
  const xTicksCount = 6;
  const xTicks = Array.from({ length: xTicksCount }, (_, i) => pStart + (i / (xTicksCount - 1)) * (pEnd - pStart));

  const yTicksCount = 6;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => minVal + (i / (yTicksCount - 1)) * (maxVal - minVal));

  const optX = scaleX(optimization.optimalPrice);
  const optY = scaleY(optimization.optimalProfit);

  const currX = scaleX(optimization.currentPrice);
  const currY = scaleY(optimization.currentProfit);

  // Hover data calculation
  let hoverData = null;
  if (hoveredPrice !== null) {
    const q = Math.max(0, model.intercept + model.slope * hoveredPrice);
    const rev = hoveredPrice * q;
    const c = costoFijo + costoUnitario * q;
    const prof = rev - c;
    hoverData = { p: hoveredPrice, q, rev, c, prof };
  }

  return (
    <div className="relative w-full overflow-hidden bg-slate-900/40 rounded-xl border border-slate-800 p-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-3.5 h-1 bg-emerald-400 rounded-full"></span>
            Utilidad Neta (Π)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-3.5 h-0.5 bg-blue-400"></span>
            Ingresos Totales (P × Q)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400/80 font-medium">
            <span className="w-3.5 h-0.5 bg-rose-400/80"></span>
            Costos Totales (CF + c_v × Q)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            Óptimo P*: ${optimization.optimalPrice.toFixed(2)} | Π*: ${Math.round(optimization.optimalProfit).toLocaleString()}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const svgX = ((e.clientX - rect.left) / rect.width) * width;
          if (svgX >= padding.left && svgX <= width - padding.right) {
            const pVal = pStart + ((svgX - padding.left) / innerWidth) * (pEnd - pStart);
            setHoveredPrice(Math.round(pVal * 10) / 10);
          }
        }}
        onMouseLeave={() => setHoveredPrice(null)}
      >
        {/* Cuadrícula */}
        {yTicks.map((yVal, i) => {
          const y = scaleY(yVal);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={yVal === 0 ? '#475569' : '#1e293b'}
                strokeWidth={yVal === 0 ? '1.5' : '1'}
                strokeDasharray={yVal === 0 ? '' : '3 3'}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                ${Math.round(yVal).toLocaleString()}
              </text>
            </g>
          );
        })}

        {xTicks.map((xVal, i) => {
          const x = scaleX(xVal);
          return (
            <g key={`x-${i}`}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={height - padding.bottom}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
              <text
                x={x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-mono"
              >
                ${xVal.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Ejes */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#475569"
          strokeWidth="1.2"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Curvas */}
        <path d={costPath} fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="4 2" />
        <path d={revenuePath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        <path d={profitPath} fill="none" stroke="#10b981" strokeWidth="3" />

        {/* Sombra suave bajo la curva de utilidad */}
        <path
          d={`${profitPath} L ${scaleX(pEnd)} ${zeroY} L ${scaleX(pStart)} ${zeroY} Z`}
          fill="#10b981"
          fillOpacity="0.08"
        />

        {/* Marcador del Precio Actual */}
        {optimization.currentPrice >= pStart && optimization.currentPrice <= pEnd && (
          <g>
            <line
              x1={currX}
              y1={padding.top}
              x2={currX}
              y2={height - padding.bottom}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle cx={currX} cy={currY} r={5} fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
            <text
              x={currX}
              y={padding.top - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[10px] font-semibold"
            >
              Actual (${optimization.currentPrice.toFixed(1)})
            </text>
          </g>
        )}

        {/* Marcador del Precio Óptimo P* */}
        {optimization.optimalPrice >= pStart && optimization.optimalPrice <= pEnd && (
          <g>
            <line
              x1={optX}
              y1={padding.top}
              x2={optX}
              y2={height - padding.bottom}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx={optX} cy={optY} r={7} fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            <text
              x={optX}
              y={padding.top - 8}
              textAnchor="middle"
              className="fill-emerald-400 text-[11px] font-bold"
            >
              ★ Óptimo (${optimization.optimalPrice.toFixed(1)})
            </text>
          </g>
        )}

        {/* Línea interactiva de hover */}
        {hoverData && (
          <g>
            <line
              x1={scaleX(hoverData.p)}
              y1={padding.top}
              x2={scaleX(hoverData.p)}
              y2={height - padding.bottom}
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <circle cx={scaleX(hoverData.p)} cy={scaleY(hoverData.prof)} r={4} fill="#38bdf8" />
          </g>
        )}

        {/* Rótulos */}
        <text
          x={padding.left + innerWidth / 2}
          y={height - 12}
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-medium"
        >
          Precio de Venta ($ P)
        </text>
        <text
          x={- (padding.top + innerHeight / 2)}
          y={20}
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-medium"
        >
          Valores Financieros ($)
        </text>
      </svg>

      {/* Tooltip de Hover */}
      {hoverData && (
        <div className="absolute top-4 left-24 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 shadow-xl pointer-events-none">
          <div className="font-semibold text-cyan-400 mb-1">
            Simulación a Precio ${hoverData.p.toFixed(2)}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <span className="text-slate-400">Demanda esperada:</span>
            <span className="font-mono text-right">{Math.round(hoverData.q).toLocaleString()} uds</span>
            <span className="text-slate-400">Ingresos:</span>
            <span className="font-mono text-blue-300 text-right">${Math.round(hoverData.rev).toLocaleString()}</span>
            <span className="text-slate-400">Costos:</span>
            <span className="font-mono text-rose-300 text-right">${Math.round(hoverData.c).toLocaleString()}</span>
            <span className="text-slate-400 font-semibold">Utilidad Neta:</span>
            <span className={`font-mono font-bold text-right ${hoverData.prof >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${Math.round(hoverData.prof).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
