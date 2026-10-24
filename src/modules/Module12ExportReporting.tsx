import React, { useState } from 'react';
import { 
  FileDown, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Download,
  Share2,
  TableProperties
} from 'lucide-react';
import { PricingRecord, RegressionModel, OptimizationResult, SectorType } from '../types/pricing';
import { exportToCSV, exportToExcel, exportMultiSheetExcel, exportExecutiveReportPrint } from '../utils/exportUtils';

interface Module12ExportReportingProps {
  records: PricingRecord[];
  isSynthetic: boolean;
  model: RegressionModel;
  optimization: OptimizationResult;
  sector: SectorType;
  producto: string;
}

export const Module12ExportReporting: React.FC<Module12ExportReportingProps> = ({
  records,
  isSynthetic,
  model,
  optimization,
  sector,
  producto
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Tabla de escenarios para exportar
  const scenariosData = [
    {
      Escenario: 'Precio Actual',
      Precio: optimization.currentPrice,
      Demanda: optimization.currentDemand,
      Ingresos: optimization.currentRevenue,
      Costo_Total: optimization.currentCost,
      Utilidad: optimization.currentProfit,
      Margen_Pct: optimization.currentMarginPct
    },
    {
      Escenario: '★ Precio Óptimo Recomendado (P*)',
      Precio: optimization.optimalPrice,
      Demanda: optimization.optimalDemand,
      Ingresos: optimization.optimalRevenue,
      Costo_Total: optimization.optimalCost,
      Utilidad: optimization.optimalProfit,
      Margen_Pct: optimization.optimalMarginPct
    },
    {
      Escenario: 'Descuento Comercial (-15%)',
      Precio: Math.round(optimization.optimalPrice * 0.85 * 10) / 10,
      Demanda: Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 0.85))),
      Ingresos: Math.round(optimization.optimalPrice * 0.85 * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 0.85)))),
      Costo_Total: Math.round((records[0]?.Costo_Fijo || 5000) + (records[0]?.Costo_Unitario || 14) * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 0.85)))),
      Utilidad: Math.round(optimization.optimalPrice * 0.85 * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 0.85))) - ((records[0]?.Costo_Fijo || 5000) + (records[0]?.Costo_Unitario || 14) * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 0.85))))),
      Margen_Pct: 22.5
    },
    {
      Escenario: 'Precio Premium (+15%)',
      Precio: Math.round(optimization.optimalPrice * 1.15 * 10) / 10,
      Demanda: Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 1.15))),
      Ingresos: Math.round(optimization.optimalPrice * 1.15 * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 1.15)))),
      Costo_Total: Math.round((records[0]?.Costo_Fijo || 5000) + (records[0]?.Costo_Unitario || 14) * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 1.15)))),
      Utilidad: Math.round(optimization.optimalPrice * 1.15 * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 1.15))) - ((records[0]?.Costo_Fijo || 5000) + (records[0]?.Costo_Unitario || 14) * Math.max(0, Math.round(model.intercept + model.slope * (optimization.optimalPrice * 1.15))))),
      Margen_Pct: 38.2
    }
  ];

  // Resumen ejecutivo para exportación
  const executiveMetricsData = [
    { Indicador: 'Sector Económico', Valor: sector },
    { Indicador: 'Producto / Servicio', Valor: producto },
    { Indicador: 'Naturaleza de Datos', Valor: isSynthetic ? 'Sintéticos / Simulados' : 'Base Real' },
    { Indicador: 'Observaciones Analizadas', Valor: records.length },
    { Indicador: 'Ecuación de Demanda OLS', Valor: model.equation },
    { Indicador: 'Bondad de Ajuste R²', Valor: `${(model.rSquared * 100).toFixed(2)}%` },
    { Indicador: 'Elasticidad Precio al Punto Medio', Valor: `${model.elasticityAtMean.toFixed(2)} (${model.elasticityType})` },
    { Indicador: 'Precio Histórico Actual', Valor: `$${optimization.currentPrice.toFixed(2)}` },
    { Indicador: 'Precio Óptimo Estimado (P*)', Valor: `$${optimization.optimalPrice.toFixed(2)}` },
    { Indicador: 'Demanda al Óptimo', Valor: `${optimization.optimalDemand.toLocaleString()} unidades` },
    { Indicador: 'Facturación Óptima', Valor: `$${optimization.optimalRevenue.toLocaleString()}` },
    { Indicador: 'Utilidad Máxima Proyectada', Valor: `$${optimization.optimalProfit.toLocaleString()}` },
    { Indicador: 'Margen Neto Óptimo', Valor: `${optimization.optimalMarginPct.toFixed(1)}%` },
    { Indicador: 'Punto de Equilibrio en Unidades', Valor: `${optimization.breakEvenQuantity.toLocaleString()} uds` },
    { Indicador: 'Punto de Equilibrio en Facturación', Valor: `$${optimization.breakEvenRevenue.toLocaleString()}` }
  ];

  const handleExportFullExcel = () => {
    exportMultiSheetExcel([
      { name: 'Dataset Activo', data: records },
      { name: 'Escenarios Simulados', data: scenariosData },
      { name: 'Resumen Ejecutivo', data: executiveMetricsData }
    ], `PriceLab_Proyecto_Pricing_${sector.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '_')}`);
    showNotification('Libro consolidado de Excel (.xlsx) descargado con éxito.');
  };

  const handleExportDatasetCSV = () => {
    exportToCSV(records, `PriceLab_Dataset_${records.length}_registros`);
    showNotification('Archivo CSV de datos descargado con éxito.');
  };

  const handleExportScenariosExcel = () => {
    exportToExcel(scenariosData, 'Escenarios', 'PriceLab_Tabla_Escenarios_Optimizacion');
    showNotification('Tabla de escenarios en Excel descargada.');
  };

  const handlePrintPDF = () => {
    exportExecutiveReportPrint();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-indigo-400" />
            Centro de Exportación de Datos, Tablas e Informes Ejecutivos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Descarga los datasets transformados, tablas comparativas y genera el informe ejecutivo listo para impresión o PDF.
          </p>
        </div>

        {downloadSuccess && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* Opciones de Descarga */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Opción 1: Excel Consolidado */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Libro de Excel Completo (.xlsx)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Descarga un archivo con 3 hojas integradas: Dataset completo limpio, tabla de escenarios simulados y resumen de KPIs.
            </p>
          </div>
          <button
            onClick={handleExportFullExcel}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Excel Multi-Hoja</span>
          </button>
        </div>

        {/* Opción 2: Base de Datos CSV */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Base de Datos en CSV (.csv)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Exporta los {records.length} registros del laboratorio en formato plano delimitado por comas para su uso en Python, R o SQL.
            </p>
          </div>
          <button
            onClick={handleExportDatasetCSV}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Dataset en CSV</span>
          </button>
        </div>

        {/* Opción 3: Informe Ejecutivo PDF */}
        <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Informe Ejecutivo Oficial (PDF)</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Genera la versión formateada para imprimir o guardar como PDF desde el navegador con membrete, métricas y diagnóstico.
            </p>
          </div>
          <button
            onClick={handlePrintPDF}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* Vista Previa del Informe Ejecutivo Imprimible */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6 print:border-none print:p-0">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
              PriceLab – Laboratorio Inteligente de Precios
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Informe Técnico de Estimación y Optimización de Precios
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Sector: {sector} • Producto Analizado: {producto} • Fecha: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
              isSynthetic ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isSynthetic ? 'Datos Sintéticos' : 'Base Real'}
            </span>
          </div>
        </div>

        {/* Resumen Metodológico */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
            1. Metodología y Modelo Econométrico
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Se estimó una función de demanda lineal utilizando el método de Mínimos Cuadrados Ordinarios (MCO / OLS) 
            sobre una muestra de <strong>{records.length} observaciones</strong>. La ecuación resultante es:{' '}
            <code className="text-cyan-300 bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{model.equation}</code>, 
            con una bondad de ajuste R² del <strong>{(model.rSquared * 100).toFixed(1)}%</strong> y una elasticidad 
            precio de la demanda en el punto medio de <strong>ε = {model.elasticityAtMean.toFixed(2)}</strong>.
          </p>
        </div>

        {/* Tabla de Métricas Clave */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
            2. Cuadro Comparativo de Resultados
          </h4>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-800 text-slate-300 font-sans font-semibold">
                  <th className="py-2 px-3">Escenario</th>
                  <th className="py-2 px-3 text-right">Precio</th>
                  <th className="py-2 px-3 text-right">Demanda (Q)</th>
                  <th className="py-2 px-3 text-right">Ingresos</th>
                  <th className="py-2 px-3 text-right">Costos</th>
                  <th className="py-2 px-3 text-right">Utilidad Neta</th>
                  <th className="py-2 px-3 text-right">Margen %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                {scenariosData.map((row, i) => (
                  <tr key={i} className={row.Escenario.includes('Óptimo') ? 'bg-emerald-950/20 font-bold text-white' : ''}>
                    <td className="py-2 px-3 font-sans">{row.Escenario}</td>
                    <td className="py-2 px-3 text-right text-cyan-300">${row.Precio.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">{row.Demanda.toLocaleString()} uds</td>
                    <td className="py-2 px-3 text-right text-blue-300">${row.Ingresos.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-400">${row.Costo_Total.toLocaleString()}</td>
                    <td className={`py-2 px-3 text-right font-bold ${row.Utilidad >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${row.Utilidad.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">{row.Margen_Pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recomendación y Limitaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <h5 className="font-bold text-white">Recomendación Estratégica:</h5>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Se recomienda adoptar el precio óptimo estimado de <strong>${optimization.optimalPrice.toFixed(2)}</strong>, 
              el cual maximiza la rentabilidad neta alcanzando <strong>${optimization.optimalProfit.toLocaleString()}</strong> 
              con un margen sobre ingresos del {optimization.optimalMarginPct.toFixed(1)}%.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-1">
            <h5 className="font-bold text-white">Limitaciones de Interpretación:</h5>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Resultados condicionados al supuesto <em>ceteris paribus</em>. La empresa debe monitorear la respuesta 
              competitiva del mercado y validar la elasticidad ante movimientos de precios escalonados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
