
import React, { useState, useEffect } from 'react';
import { fetchLatestNews, enhanceSummary } from '../services/geminiService';
import { NewsItem } from '../types';

const LiveNewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

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
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 1800000); 
    return () => clearInterval(timer);
  }, []);

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'fa-face-smile';
      case 'negative': return 'fa-face-frown';
      default: return 'fa-face-meh';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          AI ニュースフィード
        </h3>
        <button 
          onClick={loadData}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-slate-400 transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? '更新中...' : '最新に更新'}
        </button>
      </div>

      <div className="grid gap-4">
        {loading && news.length === 0 ? (
          [1, 2, 3].map(i => (
            <div key={i} className="glass rounded-3xl p-6 animate-pulse h-40 border border-slate-800/50"></div>
          ))
        ) : news.length > 0 ? (
          news.map((item: NewsItem) => (
            <a 
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block glass rounded-3xl p-6 hover:neon-border transition-all group relative overflow-hidden border border-slate-800/50 hover:bg-slate-800/30"
            >
              <div className="flex justify-between items-center text-[10px] mb-3 text-slate-500 font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">{item.source || 'Breaking News'}</span>
                  <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
                  <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50 ${getSentimentColor(item.sentiment)}`}>
                  <i className={`fas ${getSentimentIcon(item.sentiment)} text-[10px]`}></i>
                  <span className="text-[9px] font-black">{item.sentiment?.toUpperCase()}</span>
                </div>
              </div>
              <h4 className="font-black text-lg leading-tight group-hover:text-emerald-400 transition-colors mb-3">
                {item.title}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 font-medium">
                {item.summary}
              </p>

              {item.actionableInsight && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-lightbulb text-emerald-400 text-xs"></i>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">投資アクション</span>
                  </div>
                  <p className="text-xs text-slate-300 font-bold leading-relaxed">
                    {item.actionableInsight}
                  </p>
                </div>
              )}
              
              <div className="mt-auto flex items-center justify-between border-t border-slate-800/50 pt-4">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                     <i className="fas fa-robot text-[10px] text-emerald-500"></i>
                   </div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Summarized</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  記事を読む <i className="fas fa-arrow-right ml-1"></i>
                </span>
              </div>
            </a>
          ))
        ) : (
          <div className="p-16 text-center glass rounded-3xl border-dashed border-slate-800 bg-slate-900/20">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <i className="fas fa-robot text-slate-600 text-2xl"></i>
             </div>
             <p className="text-sm text-slate-400 font-bold">現在ニュースを収集中です...</p>
             <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">AI Grounding System Active</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveNewsFeed;
