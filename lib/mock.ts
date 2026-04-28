// Mock data coherent with bigquery-public-data.thelook_ecommerce
// All metrics derivable from: orders, order_items, products, inventory_items, users, events.

export const RETAILER = "TheLook";
export const CURRENT_BRAND = "Calvin Klein"; // brand from products.brand (plausible in TheLook)

export const BRANDS = [
  "Calvin Klein", "Allegra K", "Levi's", "Carhartt", "Hanes",
  "Volcom", "Quiksilver", "True Religion", "Diesel", "7 For All Mankind",
];

export const CATEGORIES = [
  "Tops & Tees", "Jeans", "Outerwear & Coats", "Sweaters", "Activewear",
  "Dresses", "Accessories", "Shorts", "Underwear", "Swim",
];

export const DEPARTMENTS = ["Women", "Men"];

export const COUNTRIES = ["United States", "Brasil", "China", "España", "Australia", "Francia", "Alemania", "Reino Unido"];
export const STATES = ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Oregon", "Massachusetts"];
export const TRAFFIC_SOURCES = ["Search", "Organic", "Email", "Facebook", "Display"];

// --- Helpers
const seedRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};
const rand = seedRand(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

// --- KPIs (brand-level, current period)
export const brandKpis = {
  totalSales: 1284530,
  orders: 9842,
  units: 14376,
  uniqueCustomers: 7218,
  avgTicket: 130.51,
  avgSalePrice: 89.35,
  // vs prev period
  deltas: {
    totalSales: 12.4,
    orders: 8.1,
    units: 9.6,
    uniqueCustomers: 6.2,
    avgTicket: 4.0,
    avgSalePrice: -1.8,
  },
};

// --- Time series: monthly sales (last 12 months)
export const salesTimeSeries = [
  { month: "May", sales: 78500, prev: 71000, orders: 612 },
  { month: "Jun", sales: 84200, prev: 75000, orders: 660 },
  { month: "Jul", sales: 91500, prev: 80000, orders: 715 },
  { month: "Aug", sales: 102000, prev: 88000, orders: 798 },
  { month: "Sep", sales: 96800, prev: 90000, orders: 760 },
  { month: "Oct", sales: 110400, prev: 94000, orders: 862 },
  { month: "Nov", sales: 142000, prev: 120000, orders: 1108 },
  { month: "Dec", sales: 168500, prev: 150000, orders: 1320 },
  { month: "Ene", sales: 121000, prev: 110000, orders: 945 },
  { month: "Feb", sales: 109800, prev: 102000, orders: 858 },
  { month: "Mar", sales: 124300, prev: 112000, orders: 970 },
  { month: "Abr", sales: 115530, prev: 108000, orders: 902 },
];

// --- Sales by category (brand)
export const salesByCategory = [
  { category: "Jeans", sales: 312400, units: 3120, avgPrice: 100.1 },
  { category: "Tops & Tees", sales: 248900, units: 4980, avgPrice: 49.9 },
  { category: "Outerwear & Coats", sales: 198600, units: 1240, avgPrice: 160.2 },
  { category: "Sweaters", sales: 152300, units: 1740, avgPrice: 87.5 },
  { category: "Dresses", sales: 138400, units: 1610, avgPrice: 86.0 },
  { category: "Activewear", sales: 96800, units: 1320, avgPrice: 73.3 },
  { category: "Accessories", sales: 72100, units: 1750, avgPrice: 41.2 },
  { category: "Shorts", sales: 65030, units: 990, avgPrice: 65.7 },
];

// --- Sales by department
export const salesByDepartment = [
  { name: "Women", value: 742300 },
  { name: "Men", value: 542230 },
];

// --- Top products
export const topProducts = Array.from({ length: 24 }).map((_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length];
  const dep = i % 2 === 0 ? "Women" : "Men";
  const sales = round(40000 - i * 1300 + rand() * 5000);
  const units = Math.round(sales / (40 + rand() * 80));
  const avgPrice = round(sales / units);
  const variation = round((rand() - 0.4) * 40, 1);
  return {
    id: `P-${1000 + i}`,
    name: `${["Slim", "Classic", "Premium", "Vintage", "Tailored", "Relaxed"][i % 6]} ${cat.split(" ")[0]} ${["A1", "B2", "C3", "X9", "M4"][i % 5]}`,
    brand: CURRENT_BRAND,
    category: cat,
    department: dep,
    sales,
    units,
    avgPrice,
    variation,
  };
});

// --- Demographics
export const demoByGender = [
  { name: "Mujer", value: 58 },
  { name: "Hombre", value: 42 },
];
export const demoByAge = [
  { band: "18-24", customers: 1180 },
  { band: "25-34", customers: 2240 },
  { band: "35-44", customers: 1860 },
  { band: "45-54", customers: 1180 },
  { band: "55-64", customers: 540 },
  { band: "65+", customers: 218 },
];
export const demoByCountry = [
  { country: "United States", customers: 3890, sales: 612400 },
  { country: "Brasil", customers: 980, sales: 142800 },
  { country: "China", customers: 870, sales: 128600 },
  { country: "España", customers: 540, sales: 98200 },
  { country: "Australia", customers: 410, sales: 76300 },
  { country: "Reino Unido", customers: 320, sales: 62100 },
  { country: "Francia", customers: 208, sales: 41200 },
];

// --- Recency / Frequency scatter
export const rfScatter = Array.from({ length: 80 }).map((_, i) => ({
  recency: Math.round(2 + rand() * 180),
  frequency: Math.round(1 + rand() * 12),
  ticket: Math.round(40 + rand() * 240),
  size: Math.round(20 + rand() * 200),
  id: i,
}));

// --- Traffic sources
export const trafficSources = [
  { source: "Search", customers: 3120, sales: 482300 },
  { source: "Organic", customers: 1980, sales: 298600 },
  { source: "Email", customers: 1120, sales: 210400 },
  { source: "Facebook", customers: 680, sales: 168200 },
  { source: "Display", customers: 318, sales: 125030 },
];

// --- Catálogo
export const catalogQualityScore = 78; // 0-100
export const catalogIssues = {
  missingName: 14,
  missingSku: 22,
  missingRetailPrice: 8,
  lowSellThrough: 41,
  inconsistentCostRetail: 11,
  total: 312,
};

export const catalogProducts = Array.from({ length: 18 }).map((_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length];
  const dep = i % 2 === 0 ? "Women" : "Men";
  const retail = round(30 + rand() * 180);
  const cost = round(retail * (0.35 + rand() * 0.3));
  const score = Math.round(40 + rand() * 60);
  const sellThrough = round(rand() * 0.85, 2);
  const states = ["OK", "Revisar", "Acción"] as const;
  const state = score > 80 ? "OK" : score > 60 ? "Revisar" : "Acción";
  return {
    id: `SKU-${20000 + i}`,
    name: `${["Slim Fit", "Oversized", "Classic", "Eco", "Premium"][i % 5]} ${cat.split(" ")[0]} ${i + 1}`,
    brand: CURRENT_BRAND,
    category: cat,
    department: dep,
    retail,
    cost,
    score,
    sellThrough,
    state,
    suggestion:
      score < 60
        ? "Reescribir título y agregar atributos"
        : score < 80
        ? "Mejorar descripción y categorización"
        : "Mantener",
  };
});

// --- Competencia (benchmark agregado, sin nombres)
export const competitionByCategory = salesByCategory.slice(0, 7).map((c) => {
  const brandShare = round(8 + rand() * 22, 1);
  const brandAvg = c.avgPrice;
  const benchAvg = round(brandAvg * (0.85 + rand() * 0.35), 1);
  const benchSales = Math.round(c.sales / (brandShare / 100));
  return {
    category: c.category,
    brandSales: c.sales,
    categorySales: benchSales,
    share: brandShare,
    brandAvgPrice: brandAvg,
    benchAvgPrice: benchAvg,
    opportunity:
      brandShare < 14
        ? "Baja participación, evaluar surtido"
        : brandAvg > benchAvg * 1.1
        ? "Precio sobre benchmark"
        : brandAvg < benchAvg * 0.9
        ? "Precio bajo benchmark, margen"
        : "Posición competitiva",
  };
});

export const competitionTrend = salesTimeSeries.map((p) => ({
  month: p.month,
  brand: p.sales,
  benchmark: Math.round(p.sales * (1.6 + rand() * 0.6)),
}));

// --- Segmentos sugeridos
export const suggestedSegments = [
  {
    id: "s1",
    name: "Compradoras frecuentes de Jeans",
    description: "Mujeres 25-44 con 3+ órdenes en últimos 90 días en categoría Jeans",
    rules: ["gender = Mujer", "age 25-44", "category = Jeans", "frecuencia ≥ 3", "recencia ≤ 90d"],
    size: 1284,
    potential: "Alto",
  },
  {
    id: "s2",
    name: "Clientes recientes de alto ticket",
    description: "Compraron en últimos 30 días con ticket promedio > $180",
    rules: ["recencia ≤ 30d", "ticket promedio > $180"],
    size: 612,
    potential: "Alto",
  },
  {
    id: "s3",
    name: "Captados por Email con baja frecuencia",
    description: "Origen Email, 1 sola orden histórica, recencia 60-180d",
    rules: ["traffic_source = Email", "frecuencia = 1", "recencia 60-180d"],
    size: 940,
    potential: "Medio",
  },
  {
    id: "s4",
    name: "Outerwear US — invierno",
    description: "Clientes en US que compraron Outerwear en últimos 120 días",
    rules: ["country = US", "category = Outerwear & Coats", "recencia ≤ 120d"],
    size: 478,
    potential: "Medio",
  },
];

export const segmentFields = [
  { key: "category", label: "Categoría", options: CATEGORIES },
  { key: "department", label: "Department", options: DEPARTMENTS },
  { key: "gender", label: "Gender", options: ["Mujer", "Hombre"] },
  { key: "age", label: "Rango de edad", options: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"] },
  { key: "country", label: "País", options: COUNTRIES },
  { key: "state", label: "Estado", options: STATES },
  { key: "traffic_source", label: "Traffic source", options: TRAFFIC_SOURCES },
  { key: "frequency", label: "Frecuencia (≥)", options: ["1", "2", "3", "5", "10"] },
  { key: "recency", label: "Recencia (≤ días)", options: ["7", "30", "60", "90", "180"] },
  { key: "ticket", label: "Ticket promedio (≥)", options: ["50", "100", "150", "200"] },
];

// --- Insights destacados
export const featuredInsights = [
  {
    title: "Jeans lidera ventas y supera benchmark",
    body: "Tu marca representa 24,3% del share de la categoría Jeans. El ticket promedio supera al benchmark de categoría en 8%.",
    tone: "positive" as const,
  },
  {
    title: "Outerwear con baja participación",
    body: "Outerwear & Coats genera buen volumen total en TheLook pero tu share de ventas es 9,1%. Oportunidad de surtido.",
    tone: "warning" as const,
  },
  {
    title: "Email genera ticket alto",
    body: "Clientes provenientes de traffic_source = Email muestran ticket promedio 22% sobre el promedio de marca.",
    tone: "info" as const,
  },
  {
    title: "Calidad de catálogo en 78/100",
    body: "22 productos sin SKU y 14 con nombres poco descriptivos. Resolverlos puede mejorar discoverability.",
    tone: "warning" as const,
  },
];
