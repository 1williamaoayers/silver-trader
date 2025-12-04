import React from 'react';
import { TickerData } from '../hooks/useBinanceData';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  ticker: TickerData | null;
}

export const Header: React.FC<HeaderProps> = ({ ticker }) => {
  // Placeholder values when ticker is loading
  const displayTicker = ticker || {
    price: 0,
    priceChangePercent: 0,
    bestBid: 0,
    bestAsk: 0
  };

  const leverage = 5;
  const leveragedChange = displayTicker.priceChangePercent * leverage;
  const isPositive = leveragedChange >= 0;
  const color = isPositive ? '#26a69a' : '#ef5350';

  // Use lighter placeholder color if no real data
  const priceColor = ticker ? color : '#555';
  const bgColor = ticker 
    ? (isPositive ? 'rgba(38, 166, 154, 0.1)' : 'rgba(239, 83, 80, 0.1)')
    : '#2a2a2a';

  return (
    <div className="header">
      <div className="symbol-info">
        <h1>XAG/USDT</h1>
        <span className="leverage-tag">5X</span>
      </div>
      
      <div className="price-container">
        <div className="main-price" style={{ color: priceColor }}>
          {ticker ? displayTicker.price.toFixed(4) : 'Loading...'}
        </div>
        <div className="price-stats">
          <div className="change-pill" style={{ backgroundColor: bgColor, color: priceColor }}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(leveragedChange).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="market-detail">
        <div className="detail-item">
          <span className="label">Bid</span>
          <span className="value buy">{ticker ? displayTicker.bestBid.toFixed(4) : '--'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Ask</span>
          <span className="value sell">{ticker ? displayTicker.bestAsk.toFixed(4) : '--'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Real 24h Chg</span>
          <span className="value">{ticker ? displayTicker.priceChangePercent.toFixed(2) : '--'}%</span>
        </div>
      </div>
    </div>
  );
};
