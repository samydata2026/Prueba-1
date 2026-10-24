/**
 * Motor Estadístico y Econométrico para PriceLab
 */

import { PricingRecord, RegressionModel } from '../types/pricing';

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
}

export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  const n = values.length;
  if (n === 0) {
    return { count: 0, mean: 0, median: 0, stdDev: 0, min: 0, max: 0, q1: 0, q3: 0, iqr: 0, skewness: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Mediana
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Cuartiles
  const getPercentile = (p: number) => {
    const idx = (n - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  // Varianza y Desviación estándar
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);

  // Asimetría (Fisher-Pearson)
  let skewness = 0;
  if (n > 2 && stdDev > 0) {
    const m3 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
    skewness = m3 / Math.pow(stdDev, 3);
  }

  return {
    count: n,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[n - 1] * 100) / 100,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
    skewness: Math.round(skewness * 100) / 100
  };
}

/**
 * Regresión Lineal Ordinaria (OLS): Demanda (Q) en función de Precio (P)
 * Q = a + b * P
 */
export function fitLinearDemandModel(records: PricingRecord[]): RegressionModel {
  const valid = records.filter(r => !isNaN(r.Precio) && !isNaN(r.Cantidad_Demandada) && r.Precio > 0 && r.Cantidad_Demandada >= 0);
  const n = valid.length;

  if (n < 3) {
    return {
      intercept: 1000,
      slope: -10,
      rSquared: 0,
      adjRSquared: 0,
      stdError: 0,
      tStat: 0,
      pValue: 1,
      equation: 'Q = 1000 - 10 * P (Estimación por defecto)',
      elasticityAtMean: -1.0,
      elasticityType: 'Unitaria',
      meanPrice: 50,
      meanQuantity: 500,
      residuals: [],
      isStatisticallySignificant: false
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const r of valid) {
    const x = r.Precio;
    const y = r.Cantidad_Demandada;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  const denominator = sumXX - (sumX * sumX) / n;
  const slope = denominator !== 0 ? (sumXY - (sumX * sumY) / n) / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Suma de cuadrados
  let ssTot = 0;
  let ssRes = 0;
  const residuals = valid.map(r => {
    const x = r.Precio;
    const y = r.Cantidad_Demandada;
    const yHat = intercept + slope * x;
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += Math.pow(residual, 2);
    return { x, y, yHat, residual };
  });

  const rSquared = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
  const adjRSquared = n > 2 ? Math.max(0, 1 - (1 - rSquared) * (n - 1) / (n - 2)) : rSquared;

  // Error estándar del estimador de pendiente
  const s2 = n > 2 ? ssRes / (n - 2) : 0;
  const seSlope = denominator > 0 && s2 > 0 ? Math.sqrt(s2 / denominator) : 0.0001;
  const tStat = seSlope !== 0 ? slope / seSlope : 0;
  
  // Aproximación p-value para t-distribution con df = n - 2
  const absT = Math.abs(tStat);
  let pValue = 0.5;
  if (absT > 3.29) pValue = 0.001;
  else if (absT > 2.58) pValue = 0.01;
  else if (absT > 1.96) pValue = 0.05;
  else if (absT > 1.645) pValue = 0.10;
  else pValue = 0.25;

  // Elasticidad precio en la media: Ed = (dQ / dP) * (P_bar / Q_bar) = slope * (meanX / meanY)
  const elasticityAtMean = meanY !== 0 ? slope * (meanX / meanY) : -1.0;
  const absE = Math.abs(elasticityAtMean);
  let elasticityType: 'Elástica' | 'Inelástica' | 'Unitaria' = 'Inelástica';
  if (absE > 1.05) elasticityType = 'Elástica';
  else if (absE < 0.95) elasticityType = 'Inelástica';
  else elasticityType = 'Unitaria';

  const sign = slope >= 0 ? '+' : '-';
  const equation = `Q = ${intercept.toFixed(2)} ${sign} ${Math.abs(slope).toFixed(2)} · P`;

  return {
    intercept,
    slope,
    rSquared,
    adjRSquared,
    stdError: seSlope,
    tStat,
    pValue,
    equation,
    elasticityAtMean,
    elasticityType,
    meanPrice: meanX,
    meanQuantity: meanY,
    residuals,
    isStatisticallySignificant: pValue < 0.05
  };
}

/**
 * Matriz de correlación de Pearson para variables numéricas
 */
export function calculateCorrelationMatrix(records: PricingRecord[], keys: (keyof PricingRecord)[]): {
  keys: string[];
  matrix: number[][];
} {
  const n = records.length;
  const numericKeys = keys.filter(k => {
    return records.some(r => typeof r[k] === 'number');
  });

  const matrix: number[][] = [];

  for (let i = 0; i < numericKeys.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < numericKeys.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        continue;
      }
      const k1 = numericKeys[i];
      const k2 = numericKeys[j];

      let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
      let validCount = 0;

      for (const r of records) {
        const v1 = Number(r[k1]);
        const v2 = Number(r[k2]);
        if (!isNaN(v1) && !isNaN(v2)) {
          sum1 += v1;
          sum2 += v2;
          sum1Sq += v1 * v1;
          sum2Sq += v2 * v2;
          pSum += v1 * v2;
          validCount++;
        }
      }

      if (validCount === 0) {
        matrix[i][j] = 0;
        continue;
      }

      const num = pSum - (sum1 * sum2 / validCount);
      const den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / validCount) * (sum2Sq - Math.pow(sum2, 2) / validCount));
      const rVal = den === 0 ? 0 : num / den;
      matrix[i][j] = Math.round(Math.max(-1, Math.min(1, rVal)) * 100) / 100;
    }
  }

  return {
    keys: numericKeys.map(k => String(k)),
    matrix
  };
}

/**
 * Agrupación en intervalos (Histograma)
 */
export function generateHistogramBins(values: number[], numBins: number = 10): {
  binStart: number;
  binEnd: number;
  label: string;
  count: number;
}[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ binStart: min, binEnd: max, label: `${min.toFixed(1)}`, count: values.length }];
  }

  const binWidth = (max - min) / numBins;
  const bins = Array.from({ length: numBins }, (_, i) => {
    const start = min + i * binWidth;
    const end = start + binWidth;
    return {
      binStart: start,
      binEnd: end,
      label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0
    };
  });

  for (const val of values) {
    let placed = false;
    for (let i = 0; i < numBins; i++) {
      if (val >= bins[i].binStart && (i === numBins - 1 ? val <= bins[i].binEnd : val < bins[i].binEnd)) {
        bins[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins[numBins - 1].count++;
    }
  }

  return bins;
}
