
import React from 'react';

export const SUPPORTED_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'Ripple' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
];

export const MOCK_CHART_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  price: 60000 + Math.random() * 5000,
}));

export const NAV_ITEMS = [
  { label: 'ホーム', icon: <i className="fas fa-home"></i>, id: 'home' },
  { label: 'ニュース分析', icon: <i className="fas fa-newspaper"></i>, id: 'news' },
  { label: 'ポートフォリオ', icon: <i className="fas fa-wallet"></i>, id: 'portfolio' },
  { label: 'AI予想', icon: <i className="fas fa-robot"></i>, id: 'ai' },
];
