import React from 'react';

interface BreakEvenChartProps {
  precio: number;
  costoUnitario: number;
  costoFijo: number;
  currentQ: number;
  height?: number;
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({
  precio,
  costoUnitario,
  costoFijo,
  currentQ,
  height = 300
}) => {
  const marginContribution = precio - costoUnitario;
  const breakEvenQ = marginContribution > 0 ? costoFijo / marginContribution : 0;
  const breakEvenRev = breakEvenQ * precio;

  const width = 640;
  const padding = { top: 25, right: 35, bottom: 45, left: 75 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Rango de cantidad a graficar (desde 0 hasta ~1.8x el punto de equilibrio o currentQ)
  const maxQ = Math.max(breakEvenQ * 1.8, currentQ * 1.3, 100);
  const maxMoney = Math.max(maxQ * precio, costoFijo + costoUnitario * maxQ) * 1.1;

  const scaleX = (q: number) => padding.left + (q / maxQ) * innerWidth;
  const scaleY = (money: number) => padding.top + innerHeight - (money / maxMoney) * innerHeight;

  const xBe = scaleX(breakEvenQ);
  const yBe = scaleY(breakEvenRev);

  const xCurrent = scaleX(currentQ);
  const yCurrentRev = scaleY(currentQ * precio);

  return (
    <div className="relative w-full bg-slate-900/40 rounded-xl border border-slate-800 p-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-2 text-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-3 h-0.5 bg-blue-400"></span> Ingresos Totales
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-3 h-0.5 bg-rose-400"></span> Costos Totales
          </span>
          <span className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="w-3 h-0.5 bg-slate-500 border-t border-dashed"></span> Costo Fijo (${costoFijo.toLocaleString()})
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Punto de Equilibrio: {Math.round(breakEvenQ).toLocaleString()} unidades (${Math.round(breakEvenRev).toLocaleString()})
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Zonas de Pérdida y Ganancia */}
        {marginContribution > 0 && breakEvenQ < maxQ && (
          <>
            {/* Zona de pérdidas */}
            <polygon
              points={`${scaleX(0)},${scaleY(0)} ${xBe},${yBe} ${scaleX(0)},${scaleY(costoFijo)}`}
              fill="#f43f5e"
              fillOpacity="0.12"
            />
            {/* Zona de ganancias */}
            <polygon
              points={`${xBe},${yBe} ${scaleX(maxQ)},${scaleY(maxQ * precio)} ${scaleX(maxQ)},${scaleY(costoFijo + costoUnitario * maxQ)}`}
              fill="#10b981"
              fillOpacity="0.12"
            />
          </>
        )}

        {/* Línea de Costo Fijo */}
        <line
          x1={padding.left}
          y1={scaleY(costoFijo)}
          x2={width - padding.right}
          y2={scaleY(costoFijo)}
          stroke="#64748b"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* Línea de Costos Totales: CT = CF + Cu * Q */}
        <line
          x1={padding.left}
          y1={scaleY(costoFijo)}
          x2={scaleX(maxQ)}
          y2={scaleY(costoFijo + costoUnitario * maxQ)}
          stroke="#f43f5e"
          strokeWidth="2"
        />

        {/* Línea de Ingresos Totales: IT = P * Q */}
        <line
          x1={padding.left}
          y1={scaleY(0)}
          x2={scaleX(maxQ)}
          y2={scaleY(maxQ * precio)}
          stroke="#3b82f6"
          strokeWidth="2.2"
        />

        {/* Ejes */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#475569"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#475569"
        />

        {/* Punto de Equilibrio */}
        {marginContribution > 0 && breakEvenQ <= maxQ && (
          <g>
            <circle cx={xBe} cy={yBe} r={6} fill="#fbbf24" stroke="#0f172a" strokeWidth="2" />
            <line
              x1={xBe}
              y1={yBe}
              x2={xBe}
              y2={height - padding.bottom}
              stroke="#fbbf24"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
            <text
              x={xBe}
              y={yBe - 10}
              textAnchor="middle"
              className="fill-amber-300 font-bold text-[11px]"
            >
              PE ({Math.round(breakEvenQ)} uds)
            </text>
          </g>
        )}

        {/* Posición de la Demanda Actual */}
        {currentQ <= maxQ && (
          <g>
            <line
              x1={xCurrent}
              y1={padding.top}
              x2={xCurrent}
              y2={height - padding.bottom}
              stroke="#38bdf8"
              strokeDasharray="3 2"
              strokeWidth="1.2"
            />
            <circle
              cx={xCurrent}
              cy={yCurrentRev}
              r={5}
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <text
              x={xCurrent}
              y={padding.top - 4}
              textAnchor="middle"
              className="fill-cyan-400 font-semibold text-[10px]"
            >
              Operación Actual
            </text>
          </g>
        )}

        {/* Ticks eje X */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const qVal = Math.round(maxQ * pct);
          const x = scaleX(qVal);
          return (
            <text
              key={i}
              x={x}
              y={height - padding.bottom + 16}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[9px]"
            >
              {qVal}
            </text>
          );
        })}

        {/* Ticks eje Y */}
        {[0, 0.5, 1].map((pct, i) => {
          const mVal = Math.round(maxMoney * pct);
          const y = scaleY(mVal);
          return (
            <text
              key={i}
              x={padding.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-slate-500 font-mono text-[9px]"
            >
              ${mVal.toLocaleString()}
            </text>
          );
        })}

        <text
          x={padding.left + innerWidth / 2}
          y={height - 12}
          textAnchor="middle"
          className="fill-slate-400 text-[10px]"
        >
          Volumen Producido y Vendido (Unidades Q)
        </text>
      </svg>
    </div>
  );
};
