import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Sparkles, 
  FileSpreadsheet, 
  FileText, 
  Code2, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Info,
  Sliders
} from 'lucide-react';
import { PricingRecord, SectorType, SyntheticConfig } from '../types/pricing';
import { generateSyntheticDataset, SECTOR_PRESETS } from '../utils/syntheticData';

interface Module2DataImportProps {
  currentRecords: PricingRecord[];
  isSynthetic: boolean;
  sector: SectorType;
  producto: string;
  onDataLoaded: (records: PricingRecord[], isSynthetic: boolean) => void;
  onNextModule: () => void;
}

export const Module2DataImport: React.FC<Module2DataImportProps> = ({
  currentRecords,
  isSynthetic,
  sector,
  producto,
  onDataLoaded,
  onNextModule
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'synthetic' | 'file'>('synthetic');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const preset = SECTOR_PRESETS[sector] || SECTOR_PRESETS['Retail / Consumo Masivo'];

  // Parámetros de configuración del generador sintético
  const [syntheticConfig, setSyntheticConfig] = useState<SyntheticConfig>({
    sector,
    producto,
    recordsCount: 300,
    precioBase: preset.precioBase,
    precioMin: preset.precioMin,
    precioMax: preset.precioMax,
    costoUnitarioBase: preset.costoUnitario,
    costoFijoBase: preset.costoFijo,
    nivelCompetencia: 'Medio',
    elasticidadTeorica: preset.elasticidad,
    ruidoAleatorio: 0.12,
    periodo: 'Semanal'
  });

  const handleGenerateSynthetic = () => {
    const data = generateSyntheticDataset(syntheticConfig);
    onDataLoaded(data, true);
    setUploadSuccess(`Se han generado exitosamente ${data.length} registros sintéticos coherentes.`);
    setUploadError(null);
  };

  // Manejo de carga de archivos (Excel, CSV, JSON, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const fileName = file.name.toLowerCase();
    const reader = new FileReader();

    if (fileName.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json) && json.length > 0) {
            processImportedArray(json, file.name);
          } else {
            setUploadError('El archivo JSON debe contener un arreglo de objetos no vacío.');
          }
        } catch (err: any) {
          setUploadError(`Error de formato JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      // CSV, XLSX, XLS o TXT con XLSX parser
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          if (json && json.length > 0) {
            processImportedArray(json, file.name);
          } else {
            setUploadError('La hoja de cálculo está vacía o no tiene encabezados válidos.');
          }
        } catch (err: any) {
          setUploadError(`Error al procesar archivo: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const processImportedArray = (rawData: any[], fileName: string) => {
    try {
      const records: PricingRecord[] = rawData.map((row, idx) => {
        // Mapeo flexible de nombres de columnas
        const findVal = (possibleKeys: string[], defaultVal: any) => {
          for (const key of possibleKeys) {
            const found = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
            if (found !== undefined && row[found] !== undefined && row[found] !== '') {
              return row[found];
            }
          }
          return defaultVal;
        };

        const precio = Number(findVal(['Precio', 'Price', 'P', 'Precio_Venta', 'PrecioVenta', 'Unit_Price'], 20));
        const cantidad = Number(findVal(['Cantidad_Demandada', 'Demanda', 'Cantidad', 'Quantity', 'Q', 'Ventas', 'Units'], 100));
        const costoUnit = Number(findVal(['Costo_Unitario', 'CostoUnitario', 'Costo_Variable', 'Cost', 'UnitCost', 'CVU'], precio * 0.45));
        const costoFijo = Number(findVal(['Costo_Fijo', 'CostoFijo', 'FixedCost', 'CF', 'Gastos_Fijos'], 4000));
        const sectorVal = String(findVal(['Sector', 'Industria', 'Category', 'Categoria'], sector));
        const prodVal = String(findVal(['Producto', 'Product', 'Item', 'SKU', 'Articulo'], producto));
        const fechaVal = String(findVal(['Fecha', 'Date', 'Periodo', 'Time'], new Date(2026, 0, idx + 1).toISOString().split('T')[0]));
        const compVal = String(findVal(['Competencia', 'Competition', 'Nivel_Competencia'], 'Medio'));
        const promoVal = String(findVal(['Promocion', 'Promo', 'Descuento', 'Discount'], 'No'));
        const tempVal = String(findVal(['Temporada', 'Season', 'Estacion'], 'Media'));

        const ingresos = Number(row.Ingresos) || Math.round(precio * cantidad * 100) / 100;
        const costoTotal = Number(row.Costo_Total) || Math.round((costoFijo + costoUnit * cantidad) * 100) / 100;
        const utilidad = Number(row.Utilidad) || Math.round((ingresos - costoTotal) * 100) / 100;

        return {
          ID_Producto: String(row.ID_Producto || row.ID || `IMP-${idx + 1}`),
          Fecha: fechaVal,
          Sector: sectorVal,
          Producto: prodVal,
          Precio: isNaN(precio) ? 0 : precio,
          Cantidad_Demandada: isNaN(cantidad) ? 0 : cantidad,
          Costo_Unitario: isNaN(costoUnit) ? 0 : costoUnit,
          Costo_Fijo: isNaN(costoFijo) ? 0 : costoFijo,
          Competencia: compVal,
          Promocion: promoVal,
          Temporada: tempVal,
          Ingresos: ingresos,
          Costo_Total: costoTotal,
          Utilidad: utilidad,
          ...row
        };
      });

      onDataLoaded(records, false);
      setUploadSuccess(`Archivo "${fileName}" importado con éxito: ${records.length} registros cargados.`);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(`Fallo al normalizar registros: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Selector de Pestaña */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('synthetic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'synthetic'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Generador Automático de Datos Simulados</span>
        </button>

        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'file'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Cargar Archivo Propio (CSV / XLSX / JSON / TXT)</span>
        </button>
      </div>

      {/* Alerta de Éxito / Error */}
      {uploadSuccess && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
          <button
            onClick={onNextModule}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs transition"
          >
            Avanzar a Caracterización →
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-rose-950/30 border border-rose-600/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* PESTAÑA 1: Generador Sintético */}
      {activeTab === 'synthetic' && (
        <div className="space-y-6">
          {/* Disclaimer de datos sintéticos */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-semibold block mb-0.5">
                Identificación de Información Sintética / Simulada:
              </strong>
              Los registros generados en este módulo son elaborados algorítmicamente mediante relaciones microeconómicas 
              teóricas (elasticidad precio de la demanda, ruido estocástico gaussiano y estacionalidad). 
              No constituyen transacciones reales de mercado y se etiquetan formalmente como modelo sintético.
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Configuración del Modelo de Simulación
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Sector: {sector}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Número de registros */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Número de Transacciones / Registros:</span>
                  <span className="font-mono font-bold text-indigo-400">{syntheticConfig.recordsCount}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={syntheticConfig.recordsCount}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, recordsCount: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
                <span className="text-[10px] text-slate-400">Rango permitido: 50 a 800 periodos</span>
              </div>

              {/* Rango de Precios */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Rango de Precios ($ Min - Max):</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    ${syntheticConfig.precioMin} - ${syntheticConfig.precioMax}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={syntheticConfig.precioMin}
                    onChange={(e) => setSyntheticConfig({ ...syntheticConfig, precioMin: Number(e.target.value) })}
                    className="w-1/2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="number"
                    value={syntheticConfig.precioMax}
                    onChange={(e) => setSyntheticConfig({ ...syntheticConfig, precioMax: Number(e.target.value) })}
                    className="w-1/2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Dispersión de precios observados</span>
              </div>

              {/* Costo Unitario Variable */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Costo Variable Unitario (c_v):</span>
                  <span className="font-mono text-emerald-400 font-bold">${syntheticConfig.costoUnitarioBase}</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={syntheticConfig.costoUnitarioBase}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, costoUnitarioBase: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
                <span className="text-[10px] text-slate-400">Costo de adquisición o fabricación</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
              {/* Costo Fijo */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">Costos Fijos del Periodo ($):</label>
                <input
                  type="number"
                  step="100"
                  value={syntheticConfig.costoFijoBase}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, costoFijoBase: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>

              {/* Nivel de Competencia */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">Intensidad Competitiva:</label>
                <select
                  value={syntheticConfig.nivelCompetencia}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, nivelCompetencia: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="Bajo">Bajo (Liderazgo / Monopólico)</option>
                  <option value="Medio">Medio (Oligopolio moderado)</option>
                  <option value="Alto">Alto (Competencia activa)</option>
                  <option value="Agresivo">Agresivo (Guerra de precios)</option>
                </select>
              </div>

              {/* Elasticidad Teórica */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Elasticidad Precio teórica:</span>
                  <span className="font-mono text-cyan-300 font-semibold">{syntheticConfig.elasticidadTeorica}</span>
                </div>
                <input
                  type="range"
                  min={-2.8}
                  max={-0.4}
                  step={0.05}
                  value={syntheticConfig.elasticidadTeorica}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, elasticidadTeorica: Number(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Frecuencia temporal */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block">Frecuencia de Registro:</label>
                <select
                  value={syntheticConfig.periodo}
                  onChange={(e) => setSyntheticConfig({ ...syntheticConfig, periodo: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Al generar, se calcularán automáticamente las 14 variables de analítica de pricing.
              </span>
              <button
                onClick={handleGenerateSynthetic}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-600/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Dataset Sintético ({syntheticConfig.recordsCount} filas)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: Carga de Archivos */}
      {activeTab === 'file' && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-900/40 hover:bg-slate-800/50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Haz clic o arrastra tu archivo aquí
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Formatos soportados: <strong>CSV, Excel (.xlsx, .xls), JSON, TXT delimitado</strong> (coma, punto y coma o tabulador).
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel / CSV
              </span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> JSON estructurado
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> TXT Tabulado
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-4 text-xs space-y-2 text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Directrices de compatibilidad de columnas para archivos reales:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Se requiere al menos columnas reconocibles como <strong>Precio</strong> y <strong>Cantidad_Demandada</strong>.</li>
              <li>Columnas opcionales pero recomendadas: Costo_Unitario, Costo_Fijo, Fecha, Producto, Promocion.</li>
              <li>Si no existen columnas calculadas (Ingresos, Costos, Utilidad), PriceLab las generará automáticamente.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Resumen de la Base Actual Cargada */}
      {currentRecords && currentRecords.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Estado Actual del Repositorio de Datos:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentRecords.length} filas activas
              </span>
              {isSynthetic ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sintético
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Archivo Real
                </span>
              )}
            </div>

            <button
              onClick={onNextModule}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
            >
              <span>Explorar Estructura (Módulo 3)</span>
              <span>→</span>
            </button>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-1.5 px-2">ID</th>
                  <th className="py-1.5 px-2">Fecha</th>
                  <th className="py-1.5 px-2">Producto</th>
                  <th className="py-1.5 px-2 text-right">Precio</th>
                  <th className="py-1.5 px-2 text-right">Cantidad</th>
                  <th className="py-1.5 px-2 text-right">C. Unit</th>
                  <th className="py-1.5 px-2 text-right">Ingresos</th>
                  <th className="py-1.5 px-2 text-right">Utilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300 font-mono">
                {currentRecords.slice(0, 3).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-1.5 px-2 text-indigo-300">{r.ID_Producto}</td>
                    <td className="py-1.5 px-2">{r.Fecha}</td>
                    <td className="py-1.5 px-2 font-sans">{r.Producto}</td>
                    <td className="py-1.5 px-2 text-right text-cyan-300">${r.Precio?.toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right text-emerald-300">{r.Cantidad_Demandada?.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right text-slate-400">${r.Costo_Unitario?.toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right text-blue-300">${r.Ingresos?.toLocaleString()}</td>
                    <td className={`py-1.5 px-2 text-right font-bold ${r.Utilidad >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${r.Utilidad?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
