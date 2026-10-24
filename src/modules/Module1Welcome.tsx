import React from 'react';
import { 
  Building2, 
  ShoppingBag, 
  Laptop, 
  UtensilsCrossed, 
  Pill, 
  Factory, 
  ArrowRight, 
  Sparkles, 
  Upload, 
  Check, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { SectorType } from '../types/pricing';
import { SECTOR_PRESETS } from '../utils/syntheticData';

interface Module1WelcomeProps {
  selectedSector: SectorType;
  onSelectSector: (sector: SectorType) => void;
  selectedProduct: string;
  onSelectProduct: (product: string) => void;
  mode: 'synthetic' | 'upload';
  onSelectMode: (mode: 'synthetic' | 'upload') => void;
  onStartLaboratory: () => void;
}

const SECTOR_CARDS: {
  id: SectorType;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  typicalElasticity: string;
  typicalMargin: string;
}[] = [
  {
    id: 'Retail / Consumo Masivo',
    icon: ShoppingBag,
    description: 'Bienes de alta rotación, promociones dinámicas y sensibilidad de precio media-alta.',
    typicalElasticity: 'Elástica (-1.5 a -2.0)',
    typicalMargin: '25% - 40%'
  },
  {
    id: 'Tecnología SaaS & Software',
    icon: Laptop,
    description: 'Modelos de suscripción recurrente (MRR), costo marginal cercano a cero y costo fijo alto.',
    typicalElasticity: 'Moderada (-1.1 a -1.4)',
    typicalMargin: '70% - 85%'
  },
  {
    id: 'Servicios Profesionales & B2B',
    icon: Building2,
    description: 'Honorarios basados en valor hora o proyectos a medida con negociación personalizada.',
    typicalElasticity: 'Inelástica (-0.7 a -1.1)',
    typicalMargin: '45% - 65%'
  },
  {
    id: 'Gastronomía & Alimentos',
    icon: UtensilsCrossed,
    description: 'Costos de materia prima perecederos, marcada estacionalidad y menús combinados.',
    typicalElasticity: 'Alta (-1.6 a -2.2)',
    typicalMargin: '60% - 75% bruto'
  },
  {
    id: 'Farmacéutica & Salud',
    icon: Pill,
    description: 'Demanda de baja elasticidad precio por necesidad clínica y fuerte regulación.',
    typicalElasticity: 'Inelástica (-0.5 a -0.9)',
    typicalMargin: '50% - 75%'
  },
  {
    id: 'Manufactura & Bienes Industriales',
    icon: Factory,
    description: 'Altos costos fijos de capital, economías de escala y contratos de suministro.',
    typicalElasticity: 'Unitaria/Moderada (-1.0 a -1.3)',
    typicalMargin: '30% - 48%'
  }
];

export const Module1Welcome: React.FC<Module1WelcomeProps> = ({
  selectedSector,
  onSelectSector,
  selectedProduct,
  onSelectProduct,
  mode,
  onSelectMode,
  onStartLaboratory
}) => {
  const currentPreset = SECTOR_PRESETS[selectedSector];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-800/40 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Entorno Profesional de Econometría y Pricing Estratégico
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Bienvenido a PriceLab
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Plataforma integral de analítica de datos para la <strong className="text-cyan-300">estimación de curvas de demanda</strong>, 
            <strong className="text-emerald-300"> simulación microeconómica</strong> y <strong className="text-indigo-300">optimización matemática de rentabilidad</strong>. 
            Diseñada tanto para fines académicos como para la toma de decisiones empresariales basadas en evidencia.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Regresión OLS & Elasticidad</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Reglas de Negocio & CVP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>12 Módulos Interactivos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Paso 1: Selección de Sector Económico */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">1</span>
              Selecciona el Sector Económico de Referencia
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              El sector calibra la elasticidad base, la estructura de costos y la dinámica competitiva del mercado.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTOR_CARDS.map((sector) => {
            const Icon = sector.icon;
            const isSelected = selectedSector === sector.id;

            return (
              <div
                key={sector.id}
                onClick={() => {
                  onSelectSector(sector.id);
                  onSelectProduct(SECTOR_PRESETS[sector.id].defaultProduct);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{sector.id}</h4>
                </div>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {sector.description}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Elasticidad Típica:</span>
                    <span className="text-cyan-300 font-mono font-medium">{sector.typicalElasticity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Margen Bruto:</span>
                    <span className="text-emerald-300 font-mono font-medium">{sector.typicalMargin}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Selección de Producto o Servicio */}
      <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">2</span>
          Producto o Servicio Específico para el Estudio
        </h3>
        <p className="text-xs text-slate-400">
          Puedes seleccionar uno de los productos de referencia del sector o escribir el nombre exacto de tu portafolio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Productos Típicos Precalibrados:
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => onSelectProduct(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {currentPreset.productsList.map((prod, i) => (
                <option key={i} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              O personaliza el nombre del producto/servicio:
            </label>
            <input
              type="text"
              value={selectedProduct}
              onChange={(e) => onSelectProduct(e.target.value)}
              placeholder="Ej. Plan Anual Enterprise 2026"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Paso 3: Modalidad de Trabajo */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">3</span>
          Modalidad de Datos para el Laboratorio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onSelectMode('synthetic')}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              mode === 'synthetic'
                ? 'bg-amber-950/20 border-amber-500/80 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Generar Base de Datos Simulada</h4>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Recomendado
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Genera instantáneamente un dataset coherente con las leyes microeconómicas del sector seleccionado. 
              Ideal para aprender, experimentar con elasticidades y simular escenarios sin requerir archivos externos.
            </p>
            <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded border border-amber-800/40">
              ✓ Incluye 14 variables comerciales: Precios, Demanda, Costos Fijos, Costos Variables, Promociones y Temporadas.
            </div>
          </div>

          <div
            onClick={() => onSelectMode('upload')}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              mode === 'upload'
                ? 'bg-emerald-950/20 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Cargar Base de Datos Propia</h4>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Empresarial
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Importa tus propios registros transaccionales históricos en formato <strong>CSV, Excel (.xlsx, .xls), JSON o TXT</strong>. 
              La plataforma mapeará automáticamente las columnas y ejecutará los diagnósticos de calidad.
            </p>
            <div className="text-[11px] text-emerald-300/90 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
              ✓ Compatible con reportes de ERPs, CRMs y sistemas de facturación estándar.
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Inicio Principal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="text-sm font-bold text-white">
            Listo para comenzar: {selectedSector}
          </div>
          <div className="text-xs text-slate-400">
            Producto: <span className="text-cyan-400 font-medium">{selectedProduct}</span> • Modalidad:{' '}
            <span className={mode === 'synthetic' ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
              {mode === 'synthetic' ? 'Simulación Sintética Automática' : 'Carga de Archivo Propio'}
            </span>
          </div>
        </div>

        <button
          onClick={onStartLaboratory}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 text-sm"
        >
          <span>Iniciar Laboratorio de Precios</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
