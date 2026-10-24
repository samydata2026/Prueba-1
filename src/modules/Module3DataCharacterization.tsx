import React, { useState } from 'react';
import { 
  Table2, 
  HelpCircle, 
  Tag, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Target,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { PricingRecord, VariableMeta, VariableType, VariableRole } from '../types/pricing';

interface Module3DataCharacterizationProps {
  records: PricingRecord[];
  isSynthetic: boolean;
  onNextModule: () => void;
}

const DEFAULT_METADATA_DICT: Record<string, {
  name: string;
  type: VariableType;
  role: VariableRole;
  description: string;
  unit?: string;
}> = {
  ID_Producto: {
    name: 'Identificador del Producto/Registro',
    type: 'qualitative_nominal',
    role: 'identifier',
    description: 'Código único alfanumérico para indexación de la transacción o periodo.'
  },
  Fecha: {
    name: 'Fecha de la Transacción',
    type: 'qualitative_ordinal',
    role: 'feature',
    description: 'Marca temporal para análisis de estacionalidad y series de tiempo comerciales.'
  },
  Sector: {
    name: 'Sector Económico',
    type: 'qualitative_nominal',
    role: 'feature',
    description: 'Industria económica de referencia que condiciona elasticidades y márgenes.'
  },
  Producto: {
    name: 'Nombre del Producto / Servicio',
    type: 'qualitative_nominal',
    role: 'identifier',
    description: 'Denominación comercial del bien transado en el mercado.'
  },
  Precio: {
    name: 'Precio Unitario de Venta',
    type: 'quantitative_continuous',
    role: 'feature',
    description: 'Monto monetario cobrado al cliente por unidad vendida. Variable clave de decisión.',
    unit: '$'
  },
  Cantidad_Demandada: {
    name: 'Cantidad Demandada / Unidades Vendidas',
    type: 'quantitative_discrete',
    role: 'target',
    description: 'Volumen total adquirido por los consumidores. Variable dependiente primaria en OLS.',
    unit: 'uds'
  },
  Costo_Unitario: {
    name: 'Costo Variable Unitario',
    type: 'quantitative_continuous',
    role: 'feature',
    description: 'Costo marginal incurrido por cada unidad producida o adquirida (materia prima, comisiones).',
    unit: '$'
  },
  Costo_Fijo: {
    name: 'Costos Fijos del Periodo',
    type: 'quantitative_continuous',
    role: 'feature',
    description: 'Gastos operativos independientes del volumen (alquiler, salarios fijos, licencias).',
    unit: '$'
  },
  Competencia: {
    name: 'Nivel o Presión Competitiva',
    type: 'qualitative_ordinal',
    role: 'feature',
    description: 'Intensidad de rivalidad del mercado (Bajo, Medio, Alto, Agresivo) o precio rival.'
  },
  Promocion: {
    name: 'Indicador Promocional',
    type: 'qualitative_nominal',
    role: 'feature',
    description: 'Señal binaria (Sí/No) que indica si operaba descuento comercial o campaña.'
  },
  Temporada: {
    name: 'Periodo Comercial / Estacionalidad',
    type: 'qualitative_ordinal',
    role: 'feature',
    description: 'Ciclo estacional que afecta la curva de demanda (Baja, Media, Alta).'
  },
  Ingresos: {
    name: 'Ingresos Totales',
    type: 'quantitative_continuous',
    role: 'derived',
    description: 'Valor total facturado. Fórmula contable: Precio × Cantidad_Demandada.',
    unit: '$'
  },
  Costo_Total: {
    name: 'Costos Totales',
    type: 'quantitative_continuous',
    role: 'derived',
    description: 'Estructura agregada de costos: Costo_Fijo + (Costo_Unitario × Cantidad_Demandada).',
    unit: '$'
  },
  Utilidad: {
    name: 'Utilidad Neta / Beneficio Contable',
    type: 'quantitative_continuous',
    role: 'target',
    description: 'Margen de ganancia neto del periodo: Ingresos − Costo_Total. Objetivo de optimización.',
    unit: '$'
  }
};

export const Module3DataCharacterization: React.FC<Module3DataCharacterizationProps> = ({
  records,
  isSynthetic,
  onNextModule
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 5;

  if (!records || records.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No hay datos cargados en el laboratorio. Por favor, regresa al Módulo 2 para generar o importar un conjunto de datos.
      </div>
    );
  }

  const columns = Object.keys(records[0]);
  const rowCount = records.length;
  const colCount = columns.length;
  const approxMemoryKB = Math.round((JSON.stringify(records).length / 1024) * 10) / 10;

  // Filtrado de filas
  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r).some(v => String(v).toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const displayedRows = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Clasificación de variables
  const variablesList: VariableMeta[] = columns.map(col => {
    const defaultMeta = DEFAULT_METADATA_DICT[col];
    const sampleVal = records[0]?.[col];

    if (defaultMeta) {
      return {
        key: col,
        name: defaultMeta.name,
        type: defaultMeta.type,
        role: defaultMeta.role,
        description: defaultMeta.description,
        unit: defaultMeta.unit,
        sampleValue: sampleVal
      };
    }

    // Inferencia automática para columnas personalizadas
    const isNum = typeof sampleVal === 'number';
    return {
      key: col,
      name: col.replace(/_/g, ' '),
      type: isNum ? 'quantitative_continuous' : 'qualitative_nominal',
      role: 'feature',
      description: `Variable detectada dinámicamente en el conjunto de datos (${typeof sampleVal}).`,
      sampleValue: sampleVal
    };
  });

  const continuousCount = variablesList.filter(v => v.type === 'quantitative_continuous').length;
  const discreteCount = variablesList.filter(v => v.type === 'quantitative_discrete').length;
  const nominalCount = variablesList.filter(v => v.type === 'qualitative_nominal').length;
  const ordinalCount = variablesList.filter(v => v.type === 'qualitative_ordinal').length;

  const targetVariables = variablesList.filter(v => v.role === 'target');
  const explanatoryVariables = variablesList.filter(v => v.role === 'feature');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumen Superior de Métricas Estructurales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Registros (Filas):</span>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
            {rowCount.toLocaleString()}
            <span className="text-xs font-normal text-slate-500">obs</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Dimensiones (Columnas):</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 flex items-baseline gap-1.5">
            {colCount}
            <span className="text-xs font-normal text-slate-500">vars</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Memoria Estimada:</span>
          <div className="text-2xl font-bold font-mono text-indigo-400 flex items-baseline gap-1.5">
            {approxMemoryKB}
            <span className="text-xs font-normal text-slate-500">KB</span>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block mb-1">Naturaleza de Datos:</span>
          <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isSynthetic ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            {isSynthetic ? 'Sintéticos / Simulados' : 'Transaccionales Reales'}
          </div>
        </div>
      </div>

      {/* Explicación Automática en Lenguaje Natural */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-4 rounded-xl border border-indigo-900/40 space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Diagnóstico Automático de la Estructura de Datos</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          El conjunto de datos cargado contiene <strong>{rowCount} observaciones</strong> y <strong>{colCount} atributos</strong>. 
          Presenta una arquitectura idónea para econometría de precios: cuenta con variables continuas para modelación financiera 
          (<strong>{continuousCount} variables continuas</strong> como Precio, Costos y Márgenes), una variable de respuesta de volumen 
          (<strong>Cantidad_Demandada</strong>) y factores contextuales (<strong>{nominalCount} nominales y {ordinalCount} ordinales</strong>) 
          que permiten estimar elasticidades y segmentar por estacionalidad o competencia.
        </p>
      </div>

      {/* Vista Previa de Filas con Paginación */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Table2 className="w-4 h-4 text-cyan-400" />
              Vista Previa Interactiva de Registros
            </h3>
            <span className="text-[11px] text-slate-400">Primeras observaciones del conjunto activo</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar valor..."
                className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                {columns.map((c, i) => (
                  <th key={i} className="py-2 px-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
              {displayedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map((col, cIdx) => {
                    const val = row[col];
                    const isPrice = col === 'Precio' || col === 'Costo_Unitario';
                    const isMoney = col === 'Ingresos' || col === 'Costo_Total' || col === 'Utilidad';

                    return (
                      <td key={cIdx} className="py-2 px-3 whitespace-nowrap">
                        {typeof val === 'number' ? (
                          isPrice ? (
                            <span className="text-cyan-300 font-medium">${val.toFixed(2)}</span>
                          ) : isMoney ? (
                            <span className={col === 'Utilidad' && val < 0 ? 'text-rose-400' : 'text-emerald-300'}>
                              ${Math.round(val).toLocaleString()}
                            </span>
                          ) : (
                            val.toLocaleString()
                          )
                        ) : (
                          <span className="font-sans text-slate-300">{String(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Mostrando {Math.min(filteredRecords.length, (currentPage - 1) * rowsPerPage + 1)} -{' '}
            {Math.min(filteredRecords.length, currentPage * rowsPerPage)} de {filteredRecords.length} filas
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-white">{currentPage} / {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Taxonomía y Diccionario de Variables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Diccionario de Datos y Clasificación Metodológica
          </h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Cuantitativas ({continuousCount + discreteCount})
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Cualitativas ({nominalCount + ordinalCount})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {variablesList.map((v, i) => {
            const isTarget = v.role === 'target';
            const isDerived = v.role === 'derived';

            return (
              <div
                key={i}
                className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{v.key}</span>
                    {isTarget && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1">
                        <Target className="w-3 h-3" /> Target
                      </span>
                    )}
                    {isDerived && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                        Calculada
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    v.type.startsWith('quantitative')
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {v.type === 'quantitative_continuous' ? 'Cuantitativa Continua' :
                     v.type === 'quantitative_discrete' ? 'Cuantitativa Discreta' :
                     v.type === 'qualitative_ordinal' ? 'Cualitativa Ordinal' : 'Cualitativa Nominal'}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-300">{v.name}</div>
                <p className="text-[11px] text-slate-400 leading-normal">{v.description}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                  <span>Rol: {v.role}</span>
                  <span>Ejemplo: {String(v.sampleValue ?? 'N/A')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Continuar a Limpieza y Preparación (Módulo 4)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
