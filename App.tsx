
import React, { useState } from 'react';
import { NAV_ITEMS, SUPPORTED_COINS } from './constants';
import MarketChart from './components/MarketChart';
import AIAnalyst from './components/AIAnalyst';
import PortfolioCalculator from './components/PortfolioCalculator';
import LiveNewsFeed from './components/LiveNewsFeed';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-64 flex flex-col bg-[#0b1120] text-slate-100 selection:bg-emerald-500/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 glass border-r border-slate-800/50 flex-col p-6 z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-black tracking-tight">CryptoFlow <span className="text-emerald-400 italic">JP</span></h1>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* AdSense Sidebar - Maximize earnings here */}
        <div className="mt-auto p-4 glass rounded-2xl border-dashed border-slate-700 bg-slate-900/40">
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
             <i className="fas fa-ad text-slate-700 text-3xl mb-2 opacity-30"></i>
             <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Advertisement</p>
             {/* AdSense Vertical Responsive Unit Start */}
             {/* <ins className="adsbygoogle" style={{display:'block'}} data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins> */}
             {/* AdSense Vertical Responsive Unit End */}
          </div>
        </div>
      </aside>

      {/* Main Header - Mobile */}
      <header className="md:hidden glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-slate-800">
         <h1 className="text-lg font-black tracking-tighter">CryptoFlow <span className="text-emerald-400">JP</span></h1>
         <div className="flex gap-4 items-center">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <i className="fas fa-bars text-slate-400 text-xl"></i>
         </div>
      </header>

      {/* Content Body */}
      <main className="flex-1 pt-24 md:pt-10 px-4 md:px-10 max-w-7xl mx-auto w-full space-y-8 pb-10">
        
        {/* AdSense Top Header Slot */}
        <div className="w-full glass rounded-2xl py-3 flex items-center justify-center border border-dashed border-slate-800 bg-slate-900/20 overflow-hidden">
           <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em]">Sponsored Intelligence Feed</div>
           {/* <ins className="adsbygoogle" style={{display:'inline-block',width:'728px',height:'90px'}} data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX"></ins> */}
        </div>

        {/* Real-time Dashboard Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-2xl border-emerald-500/5 transition-all hover:border-emerald-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black flex items-center gap-3">
                  {selectedCoin} <span className="text-emerald-400">市場分析</span>
                </h2>
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     AI Grounding System Live
                   </p>
                   <span className="h-3 w-px bg-slate-800"></span>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global Data Feed</p>
                </div>
              </div>
              <div className="relative group">
                <select 
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="bg-slate-900 border border-slate-700/50 rounded-xl px-5 py-3 text-sm font-bold outline-none cursor-pointer hover:border-emerald-500/50 transition-all appearance-none pr-12 w-full md:w-auto"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1em' }}
                >
                  {SUPPORTED_COINS.map(coin => (
                    <option key={coin.symbol} value={coin.symbol}>{coin.name} ({coin.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <MarketChart selectedCoin={selectedCoin} />
            
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-8 pt-8 border-t border-slate-800/50">
               <div>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">現在の価格</p>
                 <p className="text-xl md:text-2xl font-black tracking-tight">¥{selectedCoin === 'BTC' ? '7,120,500' : '412,420'}</p>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">24H変動率</p>
                 <p className="text-xl md:text-2xl font-black text-emerald-400">+{Math.random().toFixed(2)}%</p>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">市場シグナル</p>
                 <p className="text-xl md:text-2xl font-black text-blue-400 flex items-center gap-2">
                   STRONG <i className="fas fa-arrow-trend-up text-sm"></i>
                 </p>
               </div>
            </div>
          </div>

          <AIAnalyst selectedCoin={selectedCoin} />
        </section>

        {/* Secondary Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">投資分析ツール</h3>
              <span className="h-px flex-1 mx-6 bg-slate-800/50"></span>
            </div>
            
            <PortfolioCalculator />
            
            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5 border-emerald-500/10 shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 <i className="fas fa-paper-plane text-6xl text-emerald-400"></i>
               </div>
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">🚀</div>
                 <div>
                   <h4 className="font-black text-lg">AI プレミアム通信</h4>
                   <p className="text-xs text-slate-400 leading-relaxed">毎朝、AIが厳選した市場動向と予測を配信中</p>
                 </div>
               </div>
               <div className="flex flex-col sm:flex-row gap-3">
                 <input type="email" placeholder="メールアドレスを入力" className="flex-1 bg-slate-900 border border-slate-700/50 rounded-xl px-5 py-4 text-sm focus:border-emerald-500 outline-none transition-all" />
                 <button className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95">無料購読</button>
               </div>
            </div>
            
            {/* AdSense Native In-Feed Slot */}
            <div className="w-full glass rounded-3xl p-4 border border-dashed border-slate-800 bg-slate-900/10 flex items-center justify-center min-h-[200px]">
               <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.2em]">In-Feed Recommendation</p>
            </div>
          </div>

          <LiveNewsFeed />
        </section>
      </main>

      {/* Footer & Global Status */}
      <footer className="glass border-t border-slate-800/50 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-2xl font-black tracking-tighter">CryptoFlow <span className="text-emerald-400">JP</span></h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              日本市場に特化した次世代AIクリプト・インテリジェンス。最新のデータ解析と市場予測を提供します。
            </p>
            <div className="flex justify-center md:justify-start gap-5 text-lg text-slate-400">
              <i className="fab fa-twitter hover:text-emerald-400 cursor-pointer transition-colors"></i>
              <i className="fab fa-line hover:text-green-500 cursor-pointer transition-colors"></i>
              <i className="fab fa-discord hover:text-indigo-400 cursor-pointer transition-colors"></i>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 text-center md:text-left">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Resources</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="hover:text-emerald-400 cursor-pointer">利用規約</li>
                <li className="hover:text-emerald-400 cursor-pointer">プライバシーポリシー</li>
                <li className="hover:text-emerald-400 cursor-pointer">免責事項</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Market</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="hover:text-emerald-400 cursor-pointer">価格チャート</li>
                <li className="hover:text-emerald-400 cursor-pointer">AI予測ツール</li>
                <li className="hover:text-emerald-400 cursor-pointer">ニュースフィード</li>
              </ul>
            </div>
          </div>

          <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
             <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-slate-800 inline-flex items-center gap-3">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">System Operational</span>
             </div>
             <p className="text-[10px] text-slate-600 font-medium">Powered by Gemini 3 Flash & CryptoFlow Engine</p>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-800/30 text-center px-6">
           <p className="text-[9px] text-slate-700 font-medium max-w-3xl mx-auto leading-relaxed">
             投資に関するご注意: 暗号資産の取引は元本割れのリスクがあります。本サイトの提供するAI分析は参考情報であり、利益を保証するものではありません。実際の投資判断はご自身の責任で行ってください。
             <br />
             2024 © CryptoFlow JP Intelligence. All Rights Reserved.
           </p>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-800/80 flex justify-around p-4 z-50 rounded-t-[2.5rem] shadow-2xl backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-emerald-400 -translate-y-1' : 'text-slate-500'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
