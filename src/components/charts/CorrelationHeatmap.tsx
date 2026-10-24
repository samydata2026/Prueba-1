import React, { useState } from 'react';

interface CorrelationHeatmapProps {
  keys: string[];
  matrix: number[][];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ keys, matrix }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: string;
    col: string;
    val: number;
    x: number;
    y: number;
  } | null>(null);

  if (!keys || keys.length === 0 || !matrix || matrix.length === 0) {
    return <div className="p-4 text-xs text-slate-500">Matriz no disponible</div>;
  }

  const getColor = (val: number) => {
    if (val === 1) return 'bg-indigo-600 text-white font-bold';
    if (val > 0.6) return 'bg-emerald-600/80 text-white';
    if (val > 0.25) return 'bg-emerald-500/40 text-emerald-100';
    if (val > -0.25) return 'bg-slate-800 text-slate-300';
    if (val > -0.6) return 'bg-rose-500/40 text-rose-100';
    return 'bg-rose-600/80 text-white font-semibold';
  };

  const getInterpretation = (r: number, k1: string, k2: string) => {
    if (k1 === k2) return 'Autocorrelación perfecta (1.00).';
    const abs = Math.abs(r);
    const dir = r < 0 ? 'inversa (negativa)' : 'directa (positiva)';
    let strength = 'muy débil';
    if (abs >= 0.7) strength = 'muy fuerte';
    else if (abs >= 0.5) strength = 'moderada';
    else if (abs >= 0.3) strength = 'leve';

    return `Relación ${dir} ${strength} (r = ${r.toFixed(2)}). ${
      r < -0.4 && (k1.includes('Precio') || k2.includes('Precio')) && (k1.includes('Cantidad') || k2.includes('Cantidad'))
        ? 'Refleja la Ley Económica de la Demanda: a mayor precio, disminuye la cantidad adquirida.'
        : ''
    }`;
  };

  const formatKey = (key: string) => {
    return key.replace(/_/g, ' ');
  };

  return (
    <div className="relative overflow-x-auto bg-slate-900/40 rounded-xl border border-slate-800 p-3">
      <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
        <span>Matriz de Correlación Lineal (Pearson)</span>
        <span className="text-[11px] text-slate-400 font-normal">Escala: -1.0 (Inversa) a +1.0 (Directa)</span>
      </div>

      <div className="inline-block min-w-full align-middle">
        <table className="border-collapse text-[11px] w-full">
          <thead>
            <tr>
              <th className="p-1.5 text-left text-slate-400 font-normal">Variable</th>
              {keys.map((k, i) => (
                <th key={i} className="p-1.5 text-center text-slate-300 font-medium max-w-[90px] truncate" title={formatKey(k)}>
                  {formatKey(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((rowKey, i) => (
              <tr key={i} className="border-t border-slate-800/60">
                <td className="p-1.5 text-slate-300 font-medium whitespace-nowrap">
                  {formatKey(rowKey)}
                </td>
                {keys.map((colKey, j) => {
                  const val = matrix[i]?.[j] ?? 0;
                  const colorClass = getColor(val);

                  return (
                    <td
                      key={j}
                      className="p-1 text-center"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          row: formatKey(rowKey),
                          col: formatKey(colKey),
                          val,
                          x: rect.left,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={`py-1 px-1.5 rounded transition-transform cursor-pointer hover:scale-105 font-mono ${colorClass}`}>
                        {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (
        <div className="mt-3 p-2 bg-slate-800/90 rounded border border-slate-700 text-xs text-slate-300 flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0"></div>
          <div>
            <span className="font-semibold text-cyan-300">{hoveredCell.row}</span> vs{' '}
            <span className="font-semibold text-cyan-300">{hoveredCell.col}</span>:
            <span className="ml-1 text-slate-200">
              {getInterpretation(hoveredCell.val, hoveredCell.row, hoveredCell.col)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
