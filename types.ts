
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  summary: string;
  actionableInsight?: string;
  isEnhanced?: boolean;
}

export interface AIInsight {
  trend: string;
  recommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
}