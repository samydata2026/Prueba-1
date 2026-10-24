import React from 'react';
import { 
  Settings2, 
  UploadCloud, 
  Table2, 
  Sparkle, 
  BarChart3, 
  LineChart, 
  Calculator, 
  Target, 
  Briefcase, 
  LayoutDashboard, 
  BrainCircuit, 
  FileDown,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export interface ModuleItem {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const MODULES_LIST: ModuleItem[] = [
  {
    id: 1,
    title: '1. Inicio y Configuración',
    shortTitle: 'Configuración',
    category: 'Entorno de Trabajo',
    icon: Settings2,
    description: 'Definición de sector, producto y modalidad'
  },
  {
    id: 2,
    title: '2. Importación o Generación',
    shortTitle: 'Datos',
    category: 'Entorno de Trabajo',
    icon: UploadCloud,
    description: 'Carga de archivos o simulación sintética'
  },
  {
    id: 3,
    title: '3. Caracterización de Datos',
    shortTitle: 'Caracterización',
    category: 'Auditoría & Calidad',
    icon: Table2,
    description: 'Taxonomía, tipos y diccionario de variables'
  },
  {
    id: 4,
    title: '4. Limpieza y Preparación',
    shortTitle: 'Limpieza',
    category: 'Auditoría & Calidad',
    icon: Sparkle,
    description: 'Nulos, duplicados, outliers y comparador'
  },
  {
    id: 5,
    title: '5. Análisis Exploratorio & Reglas',
    shortTitle: 'Exploratorio & Reglas',
    category: 'Econometría',
    icon: BarChart3,
    description: 'Distribuciones, correlaciones y reglas de negocio'
  },
  {
    id: 6,
    title: '6. Curva de Demanda (OLS)',
    shortTitle: 'Curva de Demanda',
    category: 'Econometría',
    icon: LineChart,
    description: 'Estimación OLS, elasticidad y curva subjetiva'
  },
  {
    id: 7,
    title: '7. Modelo Financiero (CVP)',
    shortTitle: 'Modelo Financiero',
    category: 'Finanzas de Precios',
    icon: Calculator,
    description: 'Ingresos, costos totales y punto de equilibrio'
  },
  {
    id: 8,
    title: '8. Optimización de Precios P*',
    shortTitle: 'Optimización P*',
    category: 'Optimización',
    icon: Target,
    description: 'Máxima utilidad, escenarios y sensibilidad'
  },
  {
    id: 9,
    title: '9. Políticas Comerciales',
    shortTitle: 'Políticas de Precios',
    category: 'Estrategia Comercial',
    icon: Briefcase,
    description: 'Lanzamiento, competencia y bundling'
  },
  {
    id: 10,
    title: '10. Dashboard Ejecutivo',
    shortTitle: 'Dashboard',
    category: 'Reportes Ejecutivos',
    icon: LayoutDashboard,
    description: 'KPIs consolidados y tablero interactivo'
  },
  {
    id: 11,
    title: '11. Interpretación Inteligente',
    shortTitle: 'Interpretación',
    category: 'Reportes Ejecutivos',
    icon: BrainCircuit,
    description: 'Diagnósticos en lenguaje natural y riesgos'
  },
  {
    id: 12,
    title: '12. Exportación de Resultados',
    shortTitle: 'Exportación',
    category: 'Reportes Ejecutivos',
    icon: FileDown,
    description: 'Descarga Excel, CSV e informe ejecutivo PDF'
  }
];

interface SidebarProps {
  currentModule: number;
  onSelectModule: (id: number) => void;
  completedModules: number[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  completedModules
}) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-slate-900/60 lg:min-h-[calc(100vh-57px)] border-r border-slate-800 p-3 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-2 py-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Fases del Laboratorio (12 Módulos)
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Flujo guiado de analítica de pricing
          </div>
        </div>

        {/* Lista de navegación */}
        <nav className="space-y-1">
          {MODULES_LIST.map((mod) => {
            const Icon = mod.icon;
            const isActive = currentModule === mod.id;
            const isCompleted = completedModules.includes(mod.id);

            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs truncate">{mod.title}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {mod.shortTitle}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center pl-1">
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer del sidebar con guía de atajo */}
      <div className="mt-6 pt-3 border-t border-slate-800/80 px-2">
        <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Modo Interactivo Activo
          </div>
          <div>Cualquier cambio de parámetros en los simuladores actualiza instantáneamente todos los módulos.</div>
        </div>
      </div>
    </aside>
  );
};
