import React, { useState } from 'react';

interface HistogramChartProps {
  bins: { binStart: number; binEnd: number; label: string; count: number }[];
  title?: string;
  unit?: string;
  mean?: number;
  height?: number;
  color?: string;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  bins,
  title = 'Distribución de Frecuencias',
  unit = '',
  mean,
  height = 240,
  color = '#38bdf8'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!bins || bins.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500 text-xs">Sin datos para histograma</div>;
  }

  const width = 580;
  const padding = { top: 20, right: 25, bottom: 40, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxCount = Math.max(1, ...bins.map(b => b.count));
  const barWidth = innerWidth / bins.length;

  const scaleY = (val: number) => padding.top + innerHeight - (val / maxCount) * innerHeight;

  return (
    <div className="relative w-full bg-slate-900/40 rounded-xl border border-slate-800 p-3 select-none">
      <div className="flex items-center justify-between mb-2 px-1 text-xs">
        <span className="font-semibold text-slate-300">{title}</span>
        {mean !== undefined && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            Media: {mean.toFixed(2)} {unit}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Líneas horizontales de cuadrícula */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const countVal = Math.round(maxCount * pct);
          const y = scaleY(countVal);
          return (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-500 text-[10px] font-mono"
              >
                {countVal}
              </text>
            </g>
          );
        })}

        {/* Barras del histograma */}
        {bins.map((bin, idx) => {
          const x = padding.left + idx * barWidth;
          const y = scaleY(bin.count);
          const h = innerHeight - (y - padding.top);
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={idx}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                x={x + 2}
                y={y}
                width={Math.max(2, barWidth - 4)}
                height={Math.max(0, h)}
                fill={isHovered ? '#60a5fa' : color}
                fillOpacity={isHovered ? 0.95 : 0.75}
                rx={3}
                className="transition-colors duration-150"
              />
              {bin.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {bin.count}
                </text>
              )}
            </g>
          );
        })}

        {/* Eje base */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#475569"
          strokeWidth="1.2"
        />

        {/* Etiquetas de rango inferior */}
        {bins.map((bin, idx) => {
          if (bins.length > 8 && idx % 2 !== 0 && idx !== bins.length - 1) return null;
          const x = padding.left + idx * barWidth + barWidth / 2;
          return (
            <text
              key={idx}
              x={x}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 text-[9px] font-mono"
            >
              {bin.binStart.toFixed(1)}
            </text>
          );
        })}
      </svg>

      {hoveredIndex !== null && (
        <div className="absolute top-8 right-6 bg-slate-800/95 border border-slate-700 rounded px-2.5 py-1 text-[11px] text-slate-200 pointer-events-none shadow-md">
          <div className="text-cyan-400 font-semibold">{bins[hoveredIndex].label} {unit}</div>
          <div>Frecuencia: <span className="font-mono font-bold text-white">{bins[hoveredIndex].count}</span> registros</div>
        </div>
      )}
    </div>
  );
};
