/**
 * PriceLab - Definiciones de Tipos y Modelos de Datos
 */

export type SectorType = 
  | 'Retail / Consumo Masivo'
  | 'Tecnología SaaS & Software'
  | 'Servicios Profesionales & B2B'
  | 'Gastronomía & Alimentos'
  | 'Farmacéutica & Salud'
  | 'Manufactura & Bienes Industriales';

export type VariableType = 
  | 'quantitative_continuous'
  | 'quantitative_discrete'
  | 'qualitative_nominal'
  | 'qualitative_ordinal';

export type VariableRole = 'target' | 'feature' | 'identifier' | 'derived';

export interface VariableMeta {
  key: string;
  name: string;
  type: VariableType;
  role: VariableRole;
  description: string;
  unit?: string;
  sampleValue?: string | number;
}

export interface PricingRecord {
  ID_Producto: string;
  Fecha: string;
  Sector: SectorType | string;
  Producto: string;
  Precio: number;
  Cantidad_Demandada: number;
  Costo_Unitario: number;
  Costo_Fijo: number;
  Competencia: 'Bajo' | 'Medio' | 'Alto' | 'Agresivo' | string;
  Promocion: 'Sí' | 'No' | string;
  Temporada: 'Baja' | 'Media' | 'Alta' | string;
  Ingresos: number;
  Costo_Total: number;
  Utilidad: number;
  [key: string]: any;
}

export interface SyntheticConfig {
  sector: SectorType;
  producto: string;
  recordsCount: number;
  precioBase: number;
  precioMin: number;
  precioMax: number;
  costoUnitarioBase: number;
  costoFijoBase: number;
  nivelCompetencia: 'Bajo' | 'Medio' | 'Alto' | 'Agresivo';
  elasticidadTeorica: number; // e.g. -1.5
  ruidoAleatorio: number; // 0.05 to 0.3
  periodo: 'Diario' | 'Semanal' | 'Mensual';
}

export interface BusinessRulesConfig {
  minPriceAboveCost: boolean;
  minMarginPct: number; // e.g. 20%
  requireNegativeElasticity: boolean;
  alertOnNegativeProfit: boolean;
}

export interface BusinessRuleViolation {
  id: string;
  ruleName: string;
  severity: 'warning' | 'error';
  description: string;
  count: number;
  affectedRowIds: string[];
}

export interface CleaningSummary {
  originalCount: number;
  cleanedCount: number;
  nullsRemovedOrImputed: number;
  duplicatesRemoved: number;
  outliersAdjusted: number;
  inconsistenciesFixed: number;
  actionsApplied: string[];
}

export interface RegressionModel {
  intercept: number; // a
  slope: number; // -b
  rSquared: number;
  adjRSquared: number;
  stdError: number;
  tStat: number;
  pValue: number;
  equation: string;
  elasticityAtMean: number;
  elasticityType: 'Elástica' | 'Inelástica' | 'Unitaria';
  meanPrice: number;
  meanQuantity: number;
  residuals: { x: number; y: number; yHat: number; residual: number }[];
  isStatisticallySignificant: boolean;
}

export interface SubjectiveDemandConfig {
  willingnessToPayMax: number;
  priceSensitivity: number; // 0.5 to 2.5
  brandPositioning: 'Low-Cost' | 'Mass-Market' | 'Premium' | 'Lujo';
  customerPerceptionScore: number; // 1 to 10
  expectedReferencePrice: number;
}

export interface OptimizationResult {
  currentPrice: number;
  currentDemand: number;
  currentRevenue: number;
  currentCost: number;
  currentProfit: number;
  currentMarginPct: number;

  optimalPrice: number;
  optimalDemand: number;
  optimalRevenue: number;
  optimalCost: number;
  optimalProfit: number;
  optimalMarginPct: number;

  profitIncreasePct: number;
  profitIncreaseAbs: number;
  breakEvenQuantity: number;
  breakEvenRevenue: number;
  unitContributionMargin: number;
  contributionMarginRatio: number;
}

export interface ScenarioPoint {
  label: string;
  precio: number;
  demanda: number;
  ingresos: number;
  costoTotal: number;
  utilidad: number;
  margenPct: number;
  esOptimo?: boolean;
  esActual?: boolean;
}

export interface ProductLaunchScenario {
  name: 'Penetración' | 'Descremación' | 'Basado en Costos' | 'Basado en Valor';
  description: string;
  suggestedPrice: number;
  projectedDemand: number;
  projectedRevenue: number;
  projectedProfit: number;
  marketShareTarget: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  paybackPeriodMonths: number;
}

export interface CompetitorScenario {
  competitorPrice: number;
  priceDeltaPct: number;
  strategy: 'Igualar Precio' | 'Mantener y Diferenciar' | 'Reducir Costos' | 'Crear Segunda Marca';
  projectedDemandDeltaPct: number;
  projectedProfitImpactPct: number;
  recommendation: string;
}

export interface BundleScenario {
  productA: string;
  priceA: number;
  costA: number;
  demandA: number;

  productB: string;
  priceB: number;
  costB: number;
  demandB: number;

  bundleDiscountPct: number;
  bundlePrice: number;
  bundleCost: number;
  bundleProjectedDemand: number;
  
  individualProfitCombined: number;
  bundledProfitCombined: number;
  profitDeltaPct: number;
}
