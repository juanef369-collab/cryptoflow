
import React, { useState } from 'react';

const PortfolioCalculator: React.FC = () => {
  const [currency, setCurrency] = useState<'JPY' | 'USD'>('JPY');
  const [investment, setInvestment] = useState<number>(100000);
  const [entryPrice, setEntryPrice] = useState<number>(6500000);
  const [exitPrice, setExitPrice] = useState<number>(7000000);

  // Simple conversion factors for simulation purposes
  const handleCurrencyChange = (newCurrency: 'JPY' | 'USD') => {
    if (newCurrency === currency) return;
    
    const rate = 150; // Approx JPY/USD
    if (newCurrency === 'USD') {
      setInvestment(prev => Math.round(prev / rate));
      setEntryPrice(prev => Math.round(prev / rate));
      setExitPrice(prev => Math.round(prev / rate));
    } else {
      setInvestment(prev => Math.round(prev * rate));
      setEntryPrice(prev => Math.round(prev * rate));
      setExitPrice(prev => Math.round(prev * rate));
    }
    setCurrency(newCurrency);
  };

  const profit = ((investment / entryPrice) * exitPrice) - investment;
  const roi = (profit / investment) * 100;

  const symbol = currency === 'JPY' ? '¥' : '$';

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-calculator text-blue-400"></i>
          収益計算シミュレーター
        </h3>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button 
            onClick={() => handleCurrencyChange('JPY')}
            className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${currency === 'JPY' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            JPY
          </button>
          <button 
            onClick={() => handleCurrencyChange('USD')}
            className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            USD
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">投資額 ({currency})</label>
          <input 
            type="number" 
            value={investment}
            onChange={(e) => setInvestment(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">購入価格 ({currency})</label>
            <input 
              type="number" 
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">目標価格 ({currency})</label>
            <input 
              type="number" 
              value={exitPrice}
              onChange={(e) => setExitPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-slate-400">見込み利益</span>
            <span className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {symbol}{Math.round(profit).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">ROI (投資利益率)</span>
            <span className={`text-lg font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {roi.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCalculator;
