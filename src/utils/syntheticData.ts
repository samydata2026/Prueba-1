/**
 * Generador de Datos Sintéticos Económicamente Coherentes para PriceLab
 */

import { PricingRecord, SectorType, SyntheticConfig } from '../types/pricing';

export const SECTOR_PRESETS: Record<SectorType, {
  defaultProduct: string;
  precioBase: number;
  precioMin: number;
  precioMax: number;
  costoUnitario: number;
  costoFijo: number;
  elasticidad: number;
  productsList: string[];
}> = {
  'Retail / Consumo Masivo': {
    defaultProduct: 'Café Especial Tostado 500g',
    precioBase: 32.0,
    precioMin: 20.0,
    precioMax: 48.0,
    costoUnitario: 14.5,
    costoFijo: 4500,
    elasticidad: -1.65,
    productsList: [
      'Café Especial Tostado 500g',
      'Vino Reserva Valle Central 750ml',
      'Zapatillas Running Pro',
      'Aceite de Oliva Extra Virgen 1L',
      'Detergente Ecológico Concentrado 3L'
    ]
  },
  'Tecnología SaaS & Software': {
    defaultProduct: 'Suscripción Cloud Business (Usuario/Mes)',
    precioBase: 49.0,
    precioMin: 29.0,
    precioMax: 89.0,
    costoUnitario: 8.0,
    costoFijo: 18000,
    elasticidad: -1.25,
    productsList: [
      'Suscripción Cloud Business (Usuario/Mes)',
      'Plan Enterprise Data Analytics',
      'Licencia API Developers Pro',
      'Suite CRM Omnicanal Starter',
      'Almacenamiento Seguro Cloud 2TB'
    ]
  },
  'Servicios Profesionales & B2B': {
    defaultProduct: 'Consultoría en Optimización Comercial (Hora)',
    precioBase: 120.0,
    precioMin: 80.0,
    precioMax: 220.0,
    costoUnitario: 45.0,
    costoFijo: 12000,
    elasticidad: -0.95,
    productsList: [
      'Consultoría en Optimización Comercial (Hora)',
      'Auditoría Financiera y Contable',
      'Capacitación Corporativa In-Company',
      'Asesoría Legal Corporativa Mensual',
      'Gestión de Pauta Digital B2B'
    ]
  },
  'Gastronomía & Alimentos': {
    defaultProduct: 'Menú Degustación Ejecutivo Gourmet',
    precioBase: 26.5,
    precioMin: 18.0,
    precioMax: 40.0,
    costoUnitario: 9.8,
    costoFijo: 6200,
    elasticidad: -1.85,
    productsList: [
      'Menú Degustación Ejecutivo Gourmet',
      'Corte de Carne Premium Angus 400g',
      'Pizza Artesanal Masa Madre',
      'Cocktail de Autor Especial',
      'Pastelería Francesa Artesanal'
    ]
  },
  'Farmacéutica & Salud': {
    defaultProduct: 'Suplemento Multivitamínico Antioxidante 60 Cáps.',
    precioBase: 42.0,
    precioMin: 28.0,
    precioMax: 65.0,
    costoUnitario: 12.0,
    costoFijo: 9500,
    elasticidad: -0.75, // Demanda más inelástica
    productsList: [
      'Suplemento Multivitamínico Antioxidante 60 Cáps.',
      'Tratamiento Dermocosmético Reparador 50ml',
      'Monitoreo Glucosa Digital Sensor',
      'Analgésico Antiinflamatorio Acción Rápida',
      'Colágeno Hidrolizado Marino 300g'
    ]
  },
  'Manufactura & Bienes Industriales': {
    defaultProduct: 'Válvula de Control Neumática 2 Pulgadas',
    precioBase: 340.0,
    precioMin: 240.0,
    precioMax: 490.0,
    costoUnitario: 165.0,
    costoFijo: 35000,
    elasticidad: -1.15,
    productsList: [
      'Válvula de Control Neumática 2 Pulgadas',
      'Motor Eléctrico Trifásico 5HP',
      'Bomba Centrífuga Sumergible',
      'Rodamiento Industrial Sellado Alta Carga',
      'Tablero de Automatización PLC Modular'
    ]
  }
};

/**
 * Generador con semilla determinista pseudoaleatoria para reproducibilidad si se desea
 */
class SimpleRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  gaussian(): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}

export function generateSyntheticDataset(config: SyntheticConfig, randomSeed?: number): PricingRecord[] {
  const rng = new SimpleRandom(randomSeed ?? (Date.now() % 100000));
  const records: PricingRecord[] = [];

  const {
    sector,
    producto,
    recordsCount,
    precioMin,
    precioMax,
    costoUnitarioBase,
    costoFijoBase,
    nivelCompetencia,
    elasticidadTeorica,
    periodo
  } = config;

  // Calculamos cantidad base a precio medio
  const precioMedio = (precioMin + precioMax) / 2;
  const cantidadBaseReferencia = sector === 'Manufactura & Bienes Industriales' ? 450 :
    sector === 'Servicios Profesionales & B2B' ? 320 :
    sector === 'Tecnología SaaS & Software' ? 1800 :
    sector === 'Gastronomía & Alimentos' ? 2400 :
    sector === 'Farmacéutica & Salud' ? 1200 : 3500;

  // Fecha de inicio retrocediendo periodos
  const fechaFin = new Date(2026, 9, 1);
  const diasPorPeriodo = periodo === 'Diario' ? 1 : periodo === 'Semanal' ? 7 : 30;

  // Factor de competencia
  const compImpactMap = {
    'Bajo': 1.15,
    'Medio': 1.0,
    'Alto': 0.88,
    'Agresivo': 0.76
  };
  const compFactor = compImpactMap[nivelCompetencia] || 1.0;

  for (let i = 0; i < recordsCount; i++) {
    const fecha = new Date(fechaFin.getTime() - (recordsCount - i) * diasPorPeriodo * 24 * 60 * 60 * 1000);
    const fechaStr = fecha.toISOString().split('T')[0];

    // Estacionalidad mensual
    const mes = fecha.getMonth();
    let temporada: 'Baja' | 'Media' | 'Alta' = 'Media';
    let factorTemporada = 1.0;
    if (mes === 11 || mes === 6 || mes === 7) { // dic, jul, ago
      temporada = 'Alta';
      factorTemporada = 1.28;
    } else if (mes === 0 || mes === 1 || mes === 8) { // ene, feb, sep
      temporada = 'Baja';
      factorTemporada = 0.82;
    }

    // Promoción en algunos periodos
    const tienePromocion = rng.next() > 0.72;
    const promocionStr = tienePromocion ? 'Sí' : 'No';
    const factorPromocion = tienePromocion ? 1.22 : 1.0;

    // Generar precio con variación uniforme dentro del rango
    // Con leve sesgo a promociones teniendo precios menores
    let precio = precioMin + rng.next() * (precioMax - precioMin);
    if (tienePromocion) {
      precio = Math.max(precioMin, precio * 0.88);
    }
    precio = Math.round(precio * 100) / 100;

    // Curva de demanda microeconómica con elasticidad precio:
    // Q = Q0 * (P / P0)^elasticidad * factores * (1 + ruido)
    const ratioPrecio = precio / precioMedio;
    const factorElasticidad = Math.pow(ratioPrecio, elasticidadTeorica);
    const ruido = 1 + rng.gaussian() * (config.ruidoAleatorio || 0.12);

    let cantidadCalculada = cantidadBaseReferencia * factorElasticidad * factorTemporada * factorPromocion * compFactor * ruido;
    let cantidad = Math.max(5, Math.round(cantidadCalculada));

    // Variación pequeña en costos variables unitarios por inflación o materias primas
    const costoUnitario = Math.round((costoUnitarioBase * (1 + (rng.gaussian() * 0.04))) * 100) / 100;

    // Costo fijo con pequeña variación mensual
    const costoFijo = Math.round(costoFijoBase * (1 + (rng.gaussian() * 0.02)));

    // Variables financieras resultantes
    const ingresos = Math.round(precio * cantidad * 100) / 100;
    const costoTotal = Math.round((costoFijo + costoUnitario * cantidad) * 100) / 100;
    const utilidad = Math.round((ingresos - costoTotal) * 100) / 100;

    records.push({
      ID_Producto: `PRD-${1000 + i}`,
      Fecha: fechaStr,
      Sector: sector,
      Producto: producto,
      Precio: precio,
      Cantidad_Demandada: cantidad,
      Costo_Unitario: costoUnitario,
      Costo_Fijo: costoFijo,
      Competencia: nivelCompetencia,
      Promocion: promocionStr,
      Temporada: temporada,
      Ingresos: ingresos,
      Costo_Total: costoTotal,
      Utilidad: utilidad
    });
  }

  return records;
}
