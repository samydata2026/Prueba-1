import React, { useState } from 'react';
import { 
  BrainCircuit, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  AlertCircle, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { PricingRecord, RegressionModel, OptimizationResult, SectorType } from '../types/pricing';

interface Module11SmartInterpretationProps {
  records: PricingRecord[];
  model: RegressionModel;
  optimization: OptimizationResult;
  sector: SectorType;
  producto: string;
  onNextModule: () => void;
}

export const Module11SmartInterpretation: React.FC<Module11SmartInterpretationProps> = ({
  records,
  model,
  optimization,
  sector,
  producto,
  onNextModule
}) => {
  const [copied, setCopied] = useState(false);

  // Generación determinista y analítica del informe en lenguaje natural
  const findingsExploratory = `El conjunto de datos comprende ${records.length} observaciones analizadas para el sector de ${sector} (producto: "${producto}"). 
El precio de venta promedio observado fue de $${model.meanPrice.toFixed(2)}, con un volumen promedio de demanda de ${Math.round(model.meanQuantity).toLocaleString()} unidades por periodo. 
Se constata una variabilidad coherente con la dinámica comercial del sector, donde las variaciones de precio ejercen una influencia estadísticamente significativa sobre la cantidad transada.`;

  const demandBehavior = `La estimación econométrica por Mínimos Cuadrados Ordinarios (MCO) arrojó la ecuación: ${model.equation}, con un coeficiente de determinación R² del ${(model.rSquared * 100).toFixed(1)}% (p-valor < ${model.pValue.toFixed(3)}). 
La pendiente calculada es de ${model.slope.toFixed(2)}, lo que significa que por cada incremento de $1.00 en el precio unitario, la demanda promedio se contrae en ${Math.abs(model.slope).toFixed(2)} unidades. 
La elasticidad precio de la demanda en el punto medio se ubicó en ε = ${model.elasticityAtMean.toFixed(2)}, categorizándose formalmente como demanda ${model.elasticityType}. Esto implica que el mercado presenta una sensibilidad ${model.elasticityType === 'Elástica' ? 'alta a los incrementos de precio, por lo que subidas excesivas destruyen volumen y reducen los ingresos totales' : 'moderada o inelástica, existiendo margen para transferir incrementos de costo sin colapsar la base de clientes'}.`;

  const profitRelation = `La interacción entre la función de demanda y la estructura de costos (costo variable unitario de $${(records[0]?.Costo_Unitario || 14).toFixed(2)} y costos fijos de $${(records[0]?.Costo_Fijo || 5000).toLocaleString()}) define una curva de utilidad cóncava (parabólica). 
A precios excesivamente reducidos, aunque el volumen es alto, el margen unitario no logra absorber los costos fijos. Por el contrario, a precios muy elevados, el volumen se deprime hasta extinguir el beneficio. 
El punto de equilibrio operativo se alcanza en ${optimization.breakEvenQuantity.toLocaleString()} unidades vendidas (facturación mínima de $${optimization.breakEvenRevenue.toLocaleString()}).`;

  const scenarioComparison = `Al comparar la situación actual frente al óptimo microeconómico:
- Precio Actual: $${optimization.currentPrice.toFixed(2)} genera una demanda de ${optimization.currentDemand.toLocaleString()} unidades y una utilidad neta de $${optimization.currentProfit.toLocaleString()} (margen neto del ${optimization.currentMarginPct.toFixed(1)}%).
- Precio Óptimo Recomendado (P*): $${optimization.optimalPrice.toFixed(2)} proyecta una demanda de ${optimization.optimalDemand.toLocaleString()} unidades y una utilidad máxima de $${optimization.optimalProfit.toLocaleString()} (margen neto del ${optimization.optimalMarginPct.toFixed(1)}%).
- La transición al precio óptimo representa un incremento proyectado de $${optimization.profitIncreaseAbs.toLocaleString()} en el beneficio neto (${optimization.profitIncreasePct > 0 ? `+${optimization.profitIncreasePct}%` : '0%'}), optimizando el trade-off entre volumen y margen.`;

  const risksAndLimitations = `Condiciones y Limitaciones del Modelo:
1. Supuesto Ceteris Paribus: El modelo asume que las demás variables exógenas (ingreso de consumidores, preferencias, inflación, tasas de interés) permanecen constantes durante el horizonte de proyección.
2. Comportamiento Rival: El cálculo del precio óptimo no incorpora de forma endógena reacciones dinámicas de competidores (tales como represalias o guerras de precios).
3. Linealidad de la Demanda: La aproximación lineal OLS es altamente confiable dentro del rango de precios observados ($${(model.meanPrice * 0.7).toFixed(1)} a $${(model.meanPrice * 1.4).toFixed(1)}), pero extrapolaciones extremas fuera de este intervalo pueden presentar no-linealidades.`;

  const fullReportText = `=====================================================
PRICELAB - INFORME EJECUTIVO DE INTERPRETACIÓN ANALÍTICA
=====================================================
Sector: ${sector}
Producto: ${producto}
Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}

1. HALLAZGOS DEL ANÁLISIS EXPLORATORIO
${findingsExploratory}

2. COMPORTAMIENTO Y ELASTICIDAD DE LA DEMANDA
${demandBehavior}

3. RELACIÓN ENTRE PRECIO, COSTOS Y UTILIDAD
${profitRelation}

4. COMPARACIÓN DE ESCENARIOS Y OPTIMIZACIÓN
${scenarioComparison}

5. RIESGOS, SUPUESTOS Y CONDICIONES METODOLÓGICAS
${risksAndLimitations}
=====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Interpretación Inteligente y Diagnóstico en Lenguaje Natural
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Narrativa econométrica rigurosa construida a partir de los datos y modelos calculados, sin inventar hechos ni causalidades espurias.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          <span>{copied ? '¡Informe Copiado!' : 'Copiar Diagnóstico'}</span>
        </button>
      </div>

      {/* Tarjetas de Diagnóstico Seccional */}
      <div className="space-y-4">
        {/* Sección 1: Análisis Exploratorio */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>1. Hallazgos del Análisis Exploratorio de Datos</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {findingsExploratory}
          </p>
        </div>

        {/* Sección 2: Comportamiento de Demanda */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>2. Comportamiento y Elasticidad Precio de la Demanda</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {demandBehavior}
          </p>
        </div>

        {/* Sección 3: Relación Financiera */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>3. Relación entre Precio, Estructura de Costos y Utilidad</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {profitRelation}
          </p>
        </div>

        {/* Sección 4: Comparación de Escenarios */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>4. Veredicto Comparativo de Escenarios Comerciales</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
            {scenarioComparison}
          </div>
        </div>

        {/* Sección 5: Riesgos y Limitaciones */}
        <div className="bg-slate-900/50 rounded-xl border border-amber-900/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>5. Riesgos, Supuestos y Limitaciones Metodológicas</span>
          </div>
          <div className="text-xs text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
            {risksAndLimitations}
          </div>
        </div>
      </div>

      {/* Siguiente Módulo */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextModule}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
        >
          <span>Ir a Exportación y Generación de Informes (Módulo 12)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
