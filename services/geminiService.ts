
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight, NewsItem } from "../types";

// Inicialización segura
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const cacheKey = 'latest_news_v2';
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const news = await runSerialized<NewsItem[]>(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "最新の仮想通貨ニュース、特に日本市場に関連するものを5つ。日本語で。",
        config: { tools: [{ googleSearch: {} }] }
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const text = response.text || "";
      const lines = text.split('\n').filter(l => l.length > 40).slice(0, 5);

      return lines.map((line, index) => ({
        id: `news-${index}-${Date.now()}`,
        title: line.substring(0, 80).split('：')[0],
        summary: line,
        url: (chunks[index] as any)?.web?.uri || "https://jp.cointelegraph.com/",
        source: (chunks[index] as any)?.web?.title || "AI Market Feed",
        publishedAt: new Date().toISOString(),
        isEnhanced: false
      }));
    }));
    setCache(cacheKey, news);
    return news;
  } catch {
    return [];
  }
};

export const enhanceSummary = async (title: string, brief: string): Promise<string> => {
  const cacheKey = `enhanced_${btoa(title).substring(0, 20)}`;
  const cached = getCache<string>(cacheKey);
  if (cached) return cached;

  try {
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
  const cacheKey = `price_v2_${symbol}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const result = await runSerialized(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${symbol} の現在の日本円価格と24時間の動向を教えてください。`,
        config: { tools: [{ googleSearch: {} }] }
      });
      return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    }));
    setCache(cacheKey, result);
    return result;
  } catch {
    return { text: "情報取得中...", sources: [] };
  }
};
