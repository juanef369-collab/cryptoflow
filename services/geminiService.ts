
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight, NewsItem } from "../types";

// Lazy initialization of GoogleGenAI
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please check your environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Duración de caché aumentada a 2 horas para máxima eficiencia en producción
const CACHE_DURATION = 120 * 60 * 1000;

const getCache = <T>(key: string): T | null => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
};

const setCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

// Queue Manager para evitar 429 Resource Exhausted
let isExecuting = false;
const queue: (() => void)[] = [];

const processQueue = () => {
  if (isExecuting || queue.length === 0) return;
  isExecuting = true;
  const next = queue.shift();
  if (next) next();
};

const runSerialized = <T>(task: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        isExecuting = false;
        setTimeout(processQueue, 2000); // Espacio de seguridad entre llamadas
      }
    });
    processQueue();
  });
};

const fetchWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 5000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if ((error?.status === 429 || error?.message?.includes("429")) && retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const getMarketAnalysis = async (coinName: string, priceData: string): Promise<AIInsight> => {
  const cacheKey = `analysis_v2_${coinName}`;
  const cached = getCache<AIInsight>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const result = await runSerialized<AIInsight>(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analista profesional de cripto en Japón. Analiza ${coinName} con estos datos: ${priceData}. Responde en JSON con trend, recommendation, riskLevel (Low, Medium, High) y summary (en japonés).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trend: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              summary: { type: Type.STRING }
            },
            required: ["trend", "recommendation", "riskLevel", "summary"]
          }
        }
      });
      return JSON.parse(response.text || "{}") as AIInsight;
    }));
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    return {
      trend: "横ばい / 安定",
      recommendation: "長期保有を推奨。市場の急変動には注意してください。",
      riskLevel: "Medium",
      summary: "現在データ分析を最適化中です。価格動向を注視してください。"
    };
  }
};

export const fetchLatestNews = async (): Promise<NewsItem[]> => {
  const cacheKey = 'latest_news_v4';
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const news = await runSerialized<NewsItem[]>(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "仮想通貨市場（特に日本市場に関連するもの）の最新ニュースを5つ取得してください。必ずJSON形式で、title, summary, actionableInsight, url, source, sentimentを含めて返してください。検索ツールを使用して最新情報を取得してください。",
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                actionableInsight: { type: Type.STRING },
                url: { type: Type.STRING },
                source: { type: Type.STRING },
                sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] }
              },
              required: ["title", "summary", "actionableInsight", "url", "source", "sentiment"]
            }
          }
        }
      });

      const parsedNews = JSON.parse(response.text || "[]");
      
      if (!parsedNews || parsedNews.length === 0) throw new Error("No news found");

      return parsedNews.map((item: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: item.title,
        summary: item.summary,
        actionableInsight: item.actionableInsight,
        url: item.url || "https://jp.cointelegraph.com/",
        source: item.source || "AI Market Feed",
        sentiment: item.sentiment || "neutral",
        publishedAt: new Date().toISOString(),
        isEnhanced: true
      }));
    }));
    setCache(cacheKey, news);
    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Fallback news items if AI fails
    return [
      {
        id: 'fallback-1',
        title: 'ビットコイン、日本市場で安定した推移',
        summary: '主要な取引所での取引量は安定しており、投資家の関心は依然として高い状態が続いています。',
        actionableInsight: '長期的な保有戦略を維持しつつ、価格の押し目を待つのが賢明です。',
        url: 'https://jp.cointelegraph.com/',
        source: 'Market Analysis',
        sentiment: 'neutral',
        publishedAt: new Date().toISOString(),
        isEnhanced: false
      },
      {
        id: 'fallback-2',
        title: 'イーサリアムのアップグレードに対する期待感',
        summary: '次期アップデートに向けて開発が順調に進んでおり、エコシステムの拡大が期待されています。',
        actionableInsight: 'ステーキング報酬の動向を注視し、ポートフォリオの分散を検討してください。',
        url: 'https://jp.cointelegraph.com/',
        source: 'Tech Insights',
        sentiment: 'positive',
        publishedAt: new Date().toISOString(),
        isEnhanced: false
      }
    ];
  }
};

export const enhanceSummary = async (title: string, brief: string): Promise<string> => {
  const cacheKey = `enhanced_${btoa(title).substring(0, 20)}`;
  const cached = getCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const result = await runSerialized<string>(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `以下のニュースを日本の個人投資家向けに150文字で解説： ${title} - ${brief}`
      });
      return response.text || brief;
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    return brief;
  }
};

export const getPriceDataPoints = async (symbol: string) => {
  const cacheKey = `price_v3_${symbol}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const result = await runSerialized(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${symbol} の現在の日本円(JPY)価格と米ドル(USD)価格、および24時間の変動率を教えてください。JSON形式で返してください。`,
        config: { 
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priceJpy: { type: Type.STRING },
              priceUsd: { type: Type.STRING },
              change24h: { type: Type.STRING },
              summary: { type: Type.STRING },
              sources: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ["title", "url"]
                }
              }
            },
            required: ["priceJpy", "priceUsd", "change24h"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return parsed;
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    return { priceJpy: "---", priceUsd: "---", change24h: "0.00", summary: "情報取得中...", sources: [] };
  }
};
