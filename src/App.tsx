import { useSinaData } from './hooks/useSinaData';
import './App.css';

function App() {
  const { ticker, connected, lastUpdate } = useSinaData();

  const isPositive = ticker ? ticker.changePercent >= 0 : true;
  const colorClass = isPositive ? 'text-up' : 'text-down';
  const btnBuyClass = 'btn-buy-red';
  const btnSellClass = 'btn-sell-green';

  const leveragePercent = ticker ? ticker.changePercent * 5 : 0;

  return (
    <div className="app-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        {connected ? `Market Live (Sina)` : 'Connecting...'}
        {connected && <span style={{marginLeft: '10px', opacity: 0.7}}>{lastUpdate}</span>}
      </div>

      {/* Main Content */}
      <div className="main-display">
        <div className="symbol-header">
            <h1>XAG / USD</h1>
            <span className="badge">Live Monitor</span>
        </div>

        {ticker ? (
            <>
                {/* 5X Leverage (Top, Large) */}
                <div className={`leverage-display ${colorClass}`}>
                    {leveragePercent > 0 ? '+' : ''}{leveragePercent.toFixed(2)}%
                </div>

                {/* Price (Huge) */}
                <div className={`price-display ${colorClass}`}>
                    {ticker.price.toFixed(4)}
                </div>

                {/* Real Change (Bottom, Small) */}
                <div className={`change-display ${colorClass}`}>
                    {ticker.changePercent > 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </div>

                {/* High/Low */}
                <div className="range-display">
                    <span>H: {ticker.high.toFixed(4)}</span>
                    <span>L: {ticker.low.toFixed(4)}</span>
                </div>
            </>
        ) : (
            <div className="loading-text">Loading Data...</div>
        )}
      </div>

      {/* Buttons */}
      <div className="trade-actions">
        <button className={`btn ${btnBuyClass}`}>BUY / LONG</button>
        <button className={`btn ${btnSellClass}`}>SELL / SHORT</button>
      </div>
    </div>
  );
}

export default App;
