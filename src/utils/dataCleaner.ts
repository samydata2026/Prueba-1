/**
 * Utilidades de Detección, Diagnóstico y Limpieza de Datos para PriceLab
 */

import { PricingRecord, CleaningSummary } from '../types/pricing';

export interface ColumnQualityReport {
  column: string;
  nullCount: number;
  nullPct: number;
  distinctCount: number;
  dataType: string;
  min?: number;
  max?: number;
}

export interface AnomalyReport {
  nullsTotal: number;
  nullsByColumn: Record<string, number>;
  duplicatesCount: number;
  duplicateIndices: number[];
  priceOutliersCount: number;
  quantityOutliersCount: number;
  priceBelowCostCount: number;
  negativeValuesCount: number;
  totalAnomalies: number;
}

export function analyzeDatasetQuality(records: PricingRecord[]): {
  report: ColumnQualityReport[];
  anomalies: AnomalyReport;
} {
  const n = records.length;
  if (n === 0) {
    return {
      report: [],
      anomalies: {
        nullsTotal: 0,
        nullsByColumn: {},
        duplicatesCount: 0,
        duplicateIndices: [],
        priceOutliersCount: 0,
        quantityOutliersCount: 0,
        priceBelowCostCount: 0,
        negativeValuesCount: 0,
        totalAnomalies: 0
      }
    };
  }

  const columns = Object.keys(records[0]);
  const nullsByCol: Record<string, number> = {};
  const report: ColumnQualityReport[] = [];

  for (const col of columns) {
    let nullCount = 0;
    const distinctSet = new Set();
    let numMin = Infinity;
    let numMax = -Infinity;
    let isNumeric = true;

    for (const r of records) {
      const val = r[col];
      if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) {
        nullCount++;
      } else {
        distinctSet.add(val);
        if (typeof val === 'number') {
          if (val < numMin) numMin = val;
          if (val > numMax) numMax = val;
        } else {
          isNumeric = false;
        }
      }
    }

    nullsByCol[col] = nullCount;
    report.push({
      column: col,
      nullCount,
      nullPct: Math.round((nullCount / n) * 1000) / 10,
      distinctCount: distinctSet.size,
      dataType: isNumeric ? 'number' : typeof records[0][col],
      min: numMin !== Infinity ? Math.round(numMin * 100) / 100 : undefined,
      max: numMax !== -Infinity ? Math.round(numMax * 100) / 100 : undefined
    });
  }

  // Detección de duplicados (basado en Fecha + Precio + Cantidad o ID)
  const seenSignatures = new Set<string>();
  const duplicateIndices: number[] = [];
  records.forEach((r, idx) => {
    const signature = `${r.Fecha}_${r.Producto}_${r.Precio}_${r.Cantidad_Demandada}`;
    if (seenSignatures.has(signature)) {
      duplicateIndices.push(idx);
    } else {
      seenSignatures.add(signature);
    }
  });

  // Outliers en Precios y Cantidad mediante IQR
  const precios = records.map(r => r.Precio).filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
  const cantidades = records.map(r => r.Cantidad_Demandada).filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);

  const getIQRBounds = (arr: number[]) => {
    if (arr.length < 4) return { lower: -Infinity, upper: Infinity };
    const q1 = arr[Math.floor(arr.length * 0.25)];
    const q3 = arr[Math.floor(arr.length * 0.75)];
    const iqr = q3 - q1;
    return { lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr };
  };

  const pBounds = getIQRBounds(precios);
  const qBounds = getIQRBounds(cantidades);

  let priceOutliersCount = 0;
  let quantityOutliersCount = 0;
  let priceBelowCostCount = 0;
  let negativeValuesCount = 0;
  let nullsTotal = 0;

  for (const c in nullsByCol) {
    nullsTotal += nullsByCol[c];
  }

  for (const r of records) {
    if (r.Precio < pBounds.lower || r.Precio > pBounds.upper) priceOutliersCount++;
    if (r.Cantidad_Demandada < qBounds.lower || r.Cantidad_Demandada > qBounds.upper) quantityOutliersCount++;
    if (r.Precio < r.Costo_Unitario) priceBelowCostCount++;
    if (r.Precio <= 0 || r.Cantidad_Demandada < 0 || r.Costo_Unitario < 0) negativeValuesCount++;
  }

  const totalAnomalies = nullsTotal + duplicateIndices.length + priceBelowCostCount + negativeValuesCount;

  return {
    report,
    anomalies: {
      nullsTotal,
      nullsByColumn: nullsByCol,
      duplicatesCount: duplicateIndices.length,
      duplicateIndices,
      priceOutliersCount,
      quantityOutliersCount,
      priceBelowCostCount,
      negativeValuesCount,
      totalAnomalies
    }
  };
}

export interface CleaningOptions {
  removeDuplicates: boolean;
  handleNulls: 'remove' | 'impute_median' | 'none';
  filterOutliers: boolean; // filter extreme outliers
  fixNegativeOrZeroPrices: boolean;
  recalculateFinancials: boolean;
}

export function executeDataCleaning(
  records: PricingRecord[],
  options: CleaningOptions
): {
  cleaned: PricingRecord[];
  summary: CleaningSummary;
} {
  const originalCount = records.length;
  const actionsApplied: string[] = [];
  let nullsFixed = 0;
  let duplicatesRemoved = 0;
  let outliersAdjusted = 0;
  let inconsistenciesFixed = 0;

  let current = [...records];

  // 1. Eliminar duplicados
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const filtered: PricingRecord[] = [];
    for (const r of current) {
      const sig = `${r.Fecha}_${r.Producto}_${r.Precio}_${r.Cantidad_Demandada}`;
      if (!seen.has(sig)) {
        seen.add(sig);
        filtered.push(r);
      } else {
        duplicatesRemoved++;
      }
    }
    current = filtered;
    if (duplicatesRemoved > 0) {
      actionsApplied.push(`Se eliminaron ${duplicatesRemoved} registros duplicados.`);
    }
  }

  // 2. Manejo de nulos
  if (options.handleNulls === 'remove') {
    const beforeCount = current.length;
    current = current.filter(r => {
      return (
        r.Precio !== null && !isNaN(r.Precio) &&
        r.Cantidad_Demandada !== null && !isNaN(r.Cantidad_Demandada) &&
        r.Costo_Unitario !== null && !isNaN(r.Costo_Unitario)
      );
    });
    nullsFixed = beforeCount - current.length;
    if (nullsFixed > 0) {
      actionsApplied.push(`Se eliminaron ${nullsFixed} filas con valores nulos o incompletos.`);
    }
  } else if (options.handleNulls === 'impute_median') {
    // Calcular medianas para imputar
    const validPrecios = current.map(r => r.Precio).filter(v => !isNaN(v) && v > 0).sort((a, b) => a - b);
    const validCant = current.map(r => r.Cantidad_Demandada).filter(v => !isNaN(v) && v >= 0).sort((a, b) => a - b);
    const medPrecio = validPrecios.length ? validPrecios[Math.floor(validPrecios.length / 2)] : 25;
    const medCant = validCant.length ? validCant[Math.floor(validCant.length / 2)] : 100;

    current = current.map(r => {
      let modified = false;
      const clone = { ...r };
      if (clone.Precio === null || isNaN(clone.Precio) || clone.Precio <= 0) {
        clone.Precio = medPrecio;
        nullsFixed++;
        modified = true;
      }
      if (clone.Cantidad_Demandada === null || isNaN(clone.Cantidad_Demandada) || clone.Cantidad_Demandada < 0) {
        clone.Cantidad_Demandada = medCant;
        nullsFixed++;
        modified = true;
      }
      return clone;
    });
    if (nullsFixed > 0) {
      actionsApplied.push(`Se imputaron ${nullsFixed} valores nulos/inválidos con la mediana del segmento.`);
    }
  }

  // 3. Corregir precios <= 0 o negativos
  if (options.fixNegativeOrZeroPrices) {
    const before = current.length;
    current = current.filter(r => r.Precio > 0 && r.Cantidad_Demandada >= 0);
    inconsistenciesFixed += (before - current.length);
    if (inconsistenciesFixed > 0) {
      actionsApplied.push(`Se descartaron ${inconsistenciesFixed} registros con precios <= 0 o cantidades negativas.`);
    }
  }

  // 4. Filtrar o recortar outliers extremos
  if (options.filterOutliers && current.length > 8) {
    const precios = current.map(r => r.Precio).sort((a, b) => a - b);
    const q1 = precios[Math.floor(precios.length * 0.25)];
    const q3 = precios[Math.floor(precios.length * 0.75)];
    const iqr = q3 - q1;
    const lower = Math.max(1, q1 - 2.5 * iqr);
    const upper = q3 + 2.5 * iqr;

    const before = current.length;
    current = current.filter(r => r.Precio >= lower && r.Precio <= upper);
    outliersAdjusted = before - current.length;
    if (outliersAdjusted > 0) {
      actionsApplied.push(`Se filtraron ${outliersAdjusted} valores atípicos severos de precio fuera de [${lower.toFixed(1)}, ${upper.toFixed(1)}].`);
    }
  }

  // 5. Recalcular fórmulas financieras
  if (options.recalculateFinancials) {
    current = current.map(r => {
      const precio = Number(r.Precio) || 0;
      const cant = Number(r.Cantidad_Demandada) || 0;
      const cu = Number(r.Costo_Unitario) || (precio * 0.4);
      const cf = Number(r.Costo_Fijo) || 5000;
      const ing = Math.round(precio * cant * 100) / 100;
      const cTot = Math.round((cf + cu * cant) * 100) / 100;
      const util = Math.round((ing - cTot) * 100) / 100;

      return {
        ...r,
        Ingresos: ing,
        Costo_Total: cTot,
        Utilidad: util
      };
    });
    actionsApplied.push('Se verificó y sincronizó la integridad contable: Ingresos = P × Q, Costo Total = CF + CU × Q, Utilidad = Ingresos − Costo.');
  }

  return {
    cleaned: current,
    summary: {
      originalCount,
      cleanedCount: current.length,
      nullsRemovedOrImputed: nullsFixed,
      duplicatesRemoved,
      outliersAdjusted,
      inconsistenciesFixed,
      actionsApplied
    }
  };
}
