import React from 'react';
import { TickerData } from '../hooks/useBinanceData';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface HeaderProps {
  ticker: TickerData | null;
}

export const Header: React.FC<HeaderProps> = ({ ticker }) => {
  if (!ticker) return <div className="header-loading">Loading market data...</div>;

  const leverage = 5;
  const leveragedChange = ticker.priceChangePercent * leverage;
  const isPositive = leveragedChange >= 0;
  const color = isPositive ? '#26a69a' : '#ef5350';

  return (
    <div className="header">
      <div className="symbol-info">
        <h1>XAG/USDT</h1>
        <span className="leverage-tag">5X</span>
      </div>
      
      <div className="price-container">
        <div className="main-price" style={{ color }}>
          {ticker.price.toFixed(4)}
        </div>
        <div className="price-stats">
          <div className="change-pill" style={{ backgroundColor: isPositive ? 'rgba(38, 166, 154, 0.1)' : 'rgba(239, 83, 80, 0.1)', color }}>
            {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(leveragedChange).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="market-detail">
        <div className="detail-item">
          <span className="label">Bid</span>
          <span className="value buy">{ticker.bestBid.toFixed(4)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Ask</span>
          <span className="value sell">{ticker.bestAsk.toFixed(4)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Real 24h Chg</span>
          <span className="value">{ticker.priceChangePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};
