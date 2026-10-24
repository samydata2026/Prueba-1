import React, { useState } from 'react';
import { RegressionModel, SubjectiveDemandConfig } from '../../types/pricing';

interface DemandScatterChartProps {
  data: { x: number; y: number; id?: string; promo?: string; season?: string }[];
  model: RegressionModel;
  subjectiveConfig?: SubjectiveDemandConfig;
  showSubjective?: boolean;
  userSimulatedPrice?: number;
  height?: number;
}

export const DemandScatterChart: React.FC<DemandScatterChartProps> = ({
  data,
  model,
  subjectiveConfig,
  showSubjective = false,
  userSimulatedPrice,
  height = 360
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    yPred: number;
    id?: string;
    promo?: string;
    season?: string;
  } | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Sin datos para graficar</div>;
  }

  // Dimensiones y márgenes
  const width = 720;
  const padding = { top: 30, right: 40, bottom: 50, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);

  const minX = Math.max(0, Math.min(...xValues) * 0.85);
  const maxX = Math.max(...xValues) * 1.15;
  const minY = 0;
  const maxY = Math.max(...yValues) * 1.15;

  const scaleX = (x: number) => padding.left + ((x - minX) / (maxX - minX || 1)) * innerWidth;
  const scaleY = (y: number) => padding.top + innerHeight - ((y - minY) / (maxY - minY || 1)) * innerHeight;

  // Línea de regresión lineal OLS
  const xLineStart = minX;
  const yLineStart = Math.max(0, model.intercept + model.slope * xLineStart);
  const xLineEnd = maxX;
  const yLineEnd = Math.max(0, model.intercept + model.slope * xLineEnd);

  // Línea de demanda subjetiva/hipotética si está activa
  let subjectivePoints = '';
  if (showSubjective && subjectiveConfig) {
    const steps = 30;
    const pts: string[] = [];
    const wtpMax = subjectiveConfig.willingnessToPayMax || maxX;
    const q0 = model.meanQuantity * 1.15;
    const sens = subjectiveConfig.priceSensitivity || 1.2;

    for (let i = 0; i <= steps; i++) {
      const px = minX + (i / steps) * (maxX - minX);
      // Modelo subjetivo logístico o potencia decreciente
      const ratio = Math.max(0, 1 - (px / wtpMax));
      const qSub = Math.max(0, q0 * Math.pow(ratio, sens));
      const sx = scaleX(px);
      const sy = scaleY(qSub);
      pts.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    subjectivePoints = pts.join(' ');
  }

  // Ticks para ejes
  const xTicksCount = 6;
  const xTicks = Array.from({ length: xTicksCount }, (_, i) => minX + (i / (xTicksCount - 1)) * (maxX - minX));

  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => minY + (i / (yTicksCount - 1)) * (maxY - minY));

  return (
    <div className="relative w-full overflow-hidden bg-slate-900/40 rounded-xl border border-slate-800 p-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Datos observados ({data.length} pts)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
            <span className="w-3.5 h-0.5 bg-indigo-400"></span>
            Curva de Demanda OLS (R² = {(model.rSquared * 100).toFixed(1)}%)
          </span>
          {showSubjective && (
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-3.5 h-0.5 border-t border-dashed border-amber-400"></span>
              Demanda Subjetiva
            </span>
          )}
        </div>
        <div className="text-slate-400 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          {model.equation}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Ejes y Cuadrícula */}
        {yTicks.map((yVal, i) => {
          const y = scaleY(yVal);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {Math.round(yVal)}
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

        {/* Ejes principales */}
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

        {/* Rótulos de ejes */}
        <text
          x={padding.left + innerWidth / 2}
          y={height - 12}
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-medium tracking-wide"
        >
          Precio de Venta Unitario ($ P)
        </text>
        <text
          x={- (padding.top + innerHeight / 2)}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          className="fill-slate-300 text-[11px] font-medium tracking-wide"
        >
          Cantidad Demandada (Unidades Q)
        </text>

        {/* Línea de regresión estimada */}
        <line
          x1={scaleX(xLineStart)}
          y1={scaleY(yLineStart)}
          x2={scaleX(xLineEnd)}
          y2={scaleY(yLineEnd)}
          stroke="#818cf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Curva subjetiva si está habilitada */}
        {showSubjective && subjectivePoints && (
          <path
            d={subjectivePoints}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        )}

        {/* Marcador de precio simulado por usuario */}
        {userSimulatedPrice && userSimulatedPrice >= minX && userSimulatedPrice <= maxX && (
          <g>
            <line
              x1={scaleX(userSimulatedPrice)}
              y1={padding.top}
              x2={scaleX(userSimulatedPrice)}
              y2={height - padding.bottom}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            {(() => {
              const qSim = Math.max(0, model.intercept + model.slope * userSimulatedPrice);
              return (
                <circle
                  cx={scaleX(userSimulatedPrice)}
                  cy={scaleY(qSim)}
                  r={6}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })()}
          </g>
        )}

        {/* Puntos de dispersión */}
        {data.map((pt, idx) => {
          const cx = scaleX(pt.x);
          const cy = scaleY(pt.y);
          const yPred = model.intercept + model.slope * pt.x;

          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={4}
              className="cursor-pointer transition-all duration-150 hover:r-6"
              fill={pt.promo === 'Sí' ? '#f43f5e' : '#38bdf8'}
              fillOpacity={0.75}
              stroke="#0f172a"
              strokeWidth="1.2"
              onMouseEnter={() => setHoveredPoint({ ...pt, yPred })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip flotante */}
      {hoveredPoint && (
        <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 shadow-xl pointer-events-none transition-all">
          <div className="font-semibold text-cyan-400 mb-1">
            {hoveredPoint.id || 'Observación'}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <span className="text-slate-400">Precio real:</span>
            <span className="font-mono font-medium text-right">${hoveredPoint.x.toFixed(2)}</span>
            <span className="text-slate-400">Demanda real:</span>
            <span className="font-mono font-medium text-right">{hoveredPoint.y.toLocaleString()} uds</span>
            <span className="text-slate-400">Demanda modelo:</span>
            <span className="font-mono text-indigo-300 font-medium text-right">{Math.round(hoveredPoint.yPred).toLocaleString()} uds</span>
            <span className="text-slate-400">Residuo (e):</span>
            <span className={`font-mono text-right ${hoveredPoint.y - hoveredPoint.yPred >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(hoveredPoint.y - hoveredPoint.yPred).toFixed(1)}
            </span>
            {hoveredPoint.promo && (
              <>
                <span className="text-slate-400">Promoción:</span>
                <span className="text-right text-amber-300">{hoveredPoint.promo}</span>
              </>
            )}
            {hoveredPoint.season && (
              <>
                <span className="text-slate-400">Temporada:</span>
                <span className="text-right">{hoveredPoint.season}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
