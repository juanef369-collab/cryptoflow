
import React, { useState, useEffect } from 'react';
import { fetchLatestNews, enhanceSummary } from '../services/geminiService';
import { NewsItem } from '../types';

const LiveNewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchLatestNews();
      setNews(data);
    } catch (err) {
      console.error("Main news load failed");
    } finally {
      setLoading(false);
    }

    // Proceso de mejora MUCHO más lento para no saturar la cuota
    // Solo mejoramos si no está ya en caché (que lo maneja el servicio)
    for (const item of news) {
      if (item.summary.length < 100 && !item.isEnhanced) {
        setEnhancing(prev => ({ ...prev, [item.id]: true }));
        try {
          // Espera de 5 segundos entre cada mejora de noticia individual
          await new Promise(r => setTimeout(r, 5000));
          const detailed = await enhanceSummary(item.title, item.summary);
          setNews(prev => prev.map(n => n.id === item.id ? { ...n, summary: detailed, isEnhanced: true } : n));
        } catch (err) {
          // Error silencioso para no ensuciar la consola, simplemente no se mejora esa noticia
        } finally {
          setEnhancing(prev => ({ ...prev, [item.id]: false }));
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    // Actualización cada 30 minutos en lugar de 15 para conservar cuota
    const timer = setInterval(loadData, 1800000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          ライブ・ニュース
        </h3>
        <button 
          onClick={loadData}
          disabled={loading}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-400 transition-colors disabled:opacity-50"
        >
          {loading ? '更新中...' : '最新に更新'}
        </button>
      </div>

      <div className="grid gap-4">
        {loading && news.length === 0 ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse h-32"></div>
          ))
        ) : news.length > 0 ? (
          news.map((item: NewsItem) => (
            <a 
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block glass rounded-2xl p-5 hover:neon-border transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between text-[10px] mb-2 text-slate-500 font-bold uppercase tracking-widest">
                <span>{item.source || 'Breaking News'}</span>
                <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
              </div>
              <h4 className="font-bold text-lg leading-tight group-hover:text-emerald-400 transition-colors mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                {enhancing[item.id] ? 'AI解析中...' : item.summary}
              </p>
              
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                   <i className={`fas fa-check-circle text-[10px] ${item.isEnhanced ? 'text-emerald-500' : 'text-slate-600'}`}></i>
                   <span className="text-[9px] text-slate-500">{item.isEnhanced ? 'AI検証済み分析' : 'ソース確認中'}</span>
                </div>
                <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  詳細を読む <i className="fas fa-external-link-alt ml-1 text-[10px]"></i>
                </span>
              </div>
            </a>
          ))
        ) : (
          <div className="p-10 text-center glass rounded-2xl border-dashed border-slate-700">
             <i className="fas fa-robot text-slate-600 mb-2"></i>
             <p className="text-sm text-slate-400">現在ニュースの最適化中です。1分ほどお待ちください。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveNewsFeed;
