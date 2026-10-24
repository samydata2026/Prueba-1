/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * PriceLab - Laboratorio Inteligente de Precios
 * Estimación, Simulación y Optimización de Precios mediante Analítica de Datos
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SectorType, PricingRecord, RegressionModel, OptimizationResult, CleaningSummary } from './types/pricing';
import { generateSyntheticDataset, SECTOR_PRESETS } from './utils/syntheticData';
import { fitLinearDemandModel } from './utils/statistics';
import { Header } from './components/Header';
import { Sidebar, MODULES_LIST } from './components/Sidebar';

// Módulos
import { Module1Welcome } from './modules/Module1Welcome';
import { Module2DataImport } from './modules/Module2DataImport';
import { Module3DataCharacterization } from './modules/Module3DataCharacterization';
import { Module4DataCleaning } from './modules/Module4DataCleaning';
import { Module5ExploratoryAnalysis } from './modules/Module5ExploratoryAnalysis';
import { Module6DemandCurve } from './modules/Module6DemandCurve';
import { Module7FinancialModel } from './modules/Module7FinancialModel';
import { Module8PricingOptimization } from './modules/Module8PricingOptimization';
import { Module9PricingPolicies } from './modules/Module9PricingPolicies';
import { Module10ExecutiveDashboard } from './modules/Module10ExecutiveDashboard';
import { Module11SmartInterpretation } from './modules/Module11SmartInterpretation';
import { Module12ExportReporting } from './modules/Module12ExportReporting';

export default function App() {
  const [currentModule, setCurrentModule] = useState<number>(1);
  const [completedModules, setCompletedModules] = useState<number[]>([1]);

  // Configuración de Sector y Producto
  const [selectedSector, setSelectedSector] = useState<SectorType>('Retail / Consumo Masivo');
  const [selectedProduct, setSelectedProduct] = useState<string>(
    SECTOR_PRESETS['Retail / Consumo Masivo'].defaultProduct
  );
  const [workingMode, setWorkingMode] = useState<'synthetic' | 'upload'>('synthetic');
  const [isSynthetic, setIsSynthetic] = useState<boolean>(true);

  // Inicialización inmediata del dataset sintético por defecto (REQUISITO FUNDAMENTAL)
  const [records, setRecords] = useState<PricingRecord[]>(() => {
    const preset = SECTOR_PRESETS['Retail / Consumo Masivo'];
    return generateSyntheticDataset({
      sector: 'Retail / Consumo Masivo',
      producto: preset.defaultProduct,
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
  });

  // Modelo de regresión OLS calculado en tiempo real
  const [regressionModel, setRegressionModel] = useState<RegressionModel>(() => {
    return fitLinearDemandModel(records);
  });

  // Recalcular modelo cuando cambien los datos
  useEffect(() => {
    if (records.length > 0) {
      setRegressionModel(fitLinearDemandModel(records));
    }
  }, [records]);

  // Resultados de Optimización
  const [optimization, setOptimization] = useState<OptimizationResult>(() => {
    const model = fitLinearDemandModel(records);
    const avgRec = records[0] || { Precio: 32, Costo_Unitario: 14.5, Costo_Fijo: 4500 };
    const cv = avgRec.Costo_Unitario || 14.5;
    const cf = avgRec.Costo_Fijo || 4500;
    const bAbs = Math.abs(model.slope) || 1;
    const pOpt = Math.round(((model.intercept + bAbs * cv) / (2 * bAbs)) * 100) / 100;
    const qOpt = Math.max(0, Math.round(model.intercept + model.slope * pOpt));
    const revOpt = pOpt * qOpt;
    const costOpt = cf + cv * qOpt;
    const profOpt = revOpt - costOpt;

    const pCurr = avgRec.Precio || 32;
    const qCurr = Math.max(0, Math.round(model.intercept + model.slope * pCurr));
    const revCurr = pCurr * qCurr;
    const costCurr = cf + cv * qCurr;
    const profCurr = revCurr - costCurr;

    return {
      currentPrice: pCurr,
      currentDemand: qCurr,
      currentRevenue: revCurr,
      currentCost: costCurr,
      currentProfit: profCurr,
      currentMarginPct: revCurr > 0 ? (profCurr / revCurr) * 100 : 0,

      optimalPrice: pOpt,
      optimalDemand: qOpt,
      optimalRevenue: revOpt,
      optimalCost: costOpt,
      optimalProfit: profOpt,
      optimalMarginPct: revOpt > 0 ? (profOpt / revOpt) * 100 : 0,

      profitIncreasePct: profCurr > 0 ? ((profOpt - profCurr) / profCurr) * 100 : 0,
      profitIncreaseAbs: profOpt - profCurr,
      breakEvenQuantity: Math.ceil(cf / Math.max(1, pOpt - cv)),
      breakEvenRevenue: Math.ceil(cf / Math.max(1, pOpt - cv)) * pOpt,
      unitContributionMargin: pOpt - cv,
      contributionMarginRatio: (pOpt - cv) / pOpt
    };
  });

  const markModuleCompleted = (id: number) => {
    if (!completedModules.includes(id)) {
      setCompletedModules((prev) => [...prev, id]);
    }
  };

  const handleNavigateModule = (id: number) => {
    markModuleCompleted(currentModule);
    setCurrentModule(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextModule = () => {
    markModuleCompleted(currentModule);
    if (currentModule < 12) {
      setCurrentModule(currentModule + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDataLoaded = (newRecords: PricingRecord[], synthetic: boolean) => {
    setRecords(newRecords);
    setIsSynthetic(synthetic);
    markModuleCompleted(2);
  };

  const handleDataCleaned = (cleanedRecords: PricingRecord[], summary: CleaningSummary) => {
    setRecords(cleanedRecords);
    markModuleCompleted(4);
  };

  const handleReset = () => {
    setCurrentModule(1);
    const preset = SECTOR_PRESETS[selectedSector];
    const freshData = generateSyntheticDataset({
      sector: selectedSector,
      producto: selectedProduct || preset.defaultProduct,
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
    setRecords(freshData);
    setIsSynthetic(true);
    setCompletedModules([1]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra Superior */}
      <Header
        currentModule={currentModule}
        sector={selectedSector}
        producto={selectedProduct}
        isSynthetic={isSynthetic}
        recordsCount={records.length}
        onReset={handleReset}
        onNavigateToExport={() => handleNavigateModule(12)}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Barra Lateral de Navegación por los 12 Módulos */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={handleNavigateModule}
          completedModules={completedModules}
        />

        {/* Área de Trabajo Principal */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {currentModule === 1 && (
            <Module1Welcome
              selectedSector={selectedSector}
              onSelectSector={(s) => {
                setSelectedSector(s);
                const p = SECTOR_PRESETS[s];
                setSelectedProduct(p.defaultProduct);
                // Regenerar dataset con nuevo sector
                const fresh = generateSyntheticDataset({
                  sector: s,
                  producto: p.defaultProduct,
                  recordsCount: 300,
                  precioBase: p.precioBase,
                  precioMin: p.precioMin,
                  precioMax: p.precioMax,
                  costoUnitarioBase: p.costoUnitario,
                  costoFijoBase: p.costoFijo,
                  nivelCompetencia: 'Medio',
                  elasticidadTeorica: p.elasticidad,
                  ruidoAleatorio: 0.12,
                  periodo: 'Semanal'
                });
                setRecords(fresh);
                setIsSynthetic(true);
              }}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              mode={workingMode}
              onSelectMode={setWorkingMode}
              onStartLaboratory={() => handleNavigateModule(2)}
            />
          )}

          {currentModule === 2 && (
            <Module2DataImport
              currentRecords={records}
              isSynthetic={isSynthetic}
              sector={selectedSector}
              producto={selectedProduct}
              onDataLoaded={handleDataLoaded}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 3 && (
            <Module3DataCharacterization
              records={records}
              isSynthetic={isSynthetic}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 4 && (
            <Module4DataCleaning
              records={records}
              onDataCleaned={handleDataCleaned}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 5 && (
            <Module5ExploratoryAnalysis
              records={records}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 6 && (
            <Module6DemandCurve
              records={records}
              onModelEstimated={setRegressionModel}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 7 && (
            <Module7FinancialModel
              records={records}
              model={regressionModel}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 8 && (
            <Module8PricingOptimization
              records={records}
              model={regressionModel}
              onOptimizationComputed={setOptimization}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 9 && (
            <Module9PricingPolicies
              records={records}
              model={regressionModel}
              optimization={optimization}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 10 && (
            <Module10ExecutiveDashboard
              records={records}
              model={regressionModel}
              optimization={optimization}
              sector={selectedSector}
              producto={selectedProduct}
              onNextModule={handleNextModule}
              onNavigateToExport={() => handleNavigateModule(12)}
            />
          )}

          {currentModule === 11 && (
            <Module11SmartInterpretation
              records={records}
              model={regressionModel}
              optimization={optimization}
              sector={selectedSector}
              producto={selectedProduct}
              onNextModule={handleNextModule}
            />
          )}

          {currentModule === 12 && (
            <Module12ExportReporting
              records={records}
              isSynthetic={isSynthetic}
              model={regressionModel}
              optimization={optimization}
              sector={selectedSector}
              producto={selectedProduct}
            />
          )}
        </main>
      </div>
    </div>
  );
}
