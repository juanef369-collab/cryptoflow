
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
  const cacheKey = 'latest_news_v3';
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
    const news = await runSerialized<NewsItem[]>(() => fetchWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "日本市場に関連する最新の仮想通貨ニュースを5つ取得してください。各ニュースについて、以下の情報を日本語で提供してください：\n1. タイトル\n2. 非常に簡潔な要約（60文字以内）\n3. 日本の投資家向けの具体的なアクションや影響（40文字以内）\n4. ソース名とURL\n5. 市場へのセンチメント（positive, neutral, negative）",
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
    return [];
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
  const cacheKey = `price_v2_${symbol}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const ai = getAI();
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
