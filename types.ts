
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
  // Se cambia a obligatorio para evitar errores al acceder a .length
  summary: string;
  // Se añade la propiedad que faltaba
  isEnhanced?: boolean;
}

export interface AIInsight {
  trend: string;
  recommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
}