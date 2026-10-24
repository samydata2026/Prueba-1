import React from 'react';
import { 
  FlaskConical, 
  Database, 
  Sparkles, 
  Download, 
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { SectorType } from '../types/pricing';

interface HeaderProps {
  currentModule: number;
  sector: SectorType;
  producto: string;
  isSynthetic: boolean;
  recordsCount: number;
  onReset: () => void;
  onNavigateToExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sector,
  producto,
  isSynthetic,
  recordsCount,
  onReset,
  onNavigateToExport
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                PriceLab
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Analytics v2.5
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Laboratorio Inteligente de Estimación, Simulación y Optimización de Precios
            </p>
          </div>
        </div>

        {/* Badge de Estado del Dataset */}
        <div className="hidden md:flex items-center gap-2">
          {isSynthetic ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Datos Sintéticos Simulados</span>
              <span className="text-slate-400 text-[10px]">({recordsCount} registros)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Base Real Cargada</span>
              <span className="text-slate-400 text-[10px]">({recordsCount} registros)</span>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs truncate max-w-[200px]" title={`${sector} - ${producto}`}>
            <span className="text-slate-400 mr-1">{sector.split('/')[0]}:</span>
            <span className="font-medium text-cyan-300">{producto}</span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            title="Reiniciar con nueva configuración o parámetros"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Nueva Config</span>
          </button>

          <button
            onClick={onNavigateToExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>
    </header>
  );
};
