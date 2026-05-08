export interface CompetitiveCardsData {
  topShareCategory: string | null;
  topSharePercentage: number | null;
  bestGrowthCategory: string | null;
  bestGrowthPercentage: number | null;
  worstGrowthCategory: string | null;
  worstGrowthPercentage: number | null;
}

export interface CompetitiveCategory {
    category: string;
    brandSales: number;
    categorySales: number;
    brandVolume: number;
    categoryVolume: number;
    salesBenchmark: number;
    volumeBenchmark: number;
    salesShare: number;
    volumeShare: number;
    averageBrandPrice: number;
    averageBenchmarkPrice: number;
}
