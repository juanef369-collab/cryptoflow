
import React, { useState, useEffect } from 'react';
import { getMarketAnalysis } from '../services/geminiService';
import { AIInsight } from '../types';

interface AIAnalystProps {
  selectedCoin: string;
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ selectedCoin }) => {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    // In a real app, you'd pass actual recent price history
    const mockData = "Recent price trend: +5% in 24h, high volume on exchanges, MACD bullish crossover.";
    const result = await getMarketAnalysis(selectedCoin, mockData);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedCoin]);

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-robot text-emerald-400"></i>
          AIマーケット分析
        </h3>
        {loading && <div className="animate-spin h-5 w-5 border-2 border-emerald-400 border-t-transparent rounded-full"></div>}
      </div>

      {insight ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              insight.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
              insight.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              リスク: {insight.riskLevel}
            </span>
            <span className="text-sm text-slate-400">{selectedCoin} のトレンド</span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-sm text-slate-300 leading-relaxed">
              {insight.summary}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">戦略アドバイス</h4>
            <p className="text-sm text-emerald-100 italic">"{insight.recommendation}"</p>
          </div>

          <button 
            onClick={fetchAnalysis}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl font-bold text-sm"
          >
            最新の分析を更新
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          分析データを読み込んでいます...
        </div>
      )}
    </div>
  );
};

export default AIAnalyst;
