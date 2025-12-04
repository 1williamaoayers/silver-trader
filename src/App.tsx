import { useBinanceData } from './hooks/useBinanceData';
import { Chart } from './components/Chart';
import { Header } from './components/Header';
import './App.css';

function App() {
  const { candles, currentCandle, ticker, connected, error, debugInfo } = useBinanceData();

  return (
    <div className="app-container">
      <div className="status-bar">
        <div className={`status-dot ${connected ? 'connected' : error ? 'error' : 'disconnected'}`} />
        {error ? error : (connected ? 'Market Live' : 'Connecting...')}
      </div>

      {/* Debug Panel - Visible but small */}
      <div style={{ fontSize: '10px', color: '#555', background: '#000', padding: '2px 8px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
         <span>Hist: {debugInfo.historyStatus}</span>
         <span>WS: {debugInfo.wsUrl}</span>
         <span>Msgs: {debugInfo.msgCount}</span>
         <span>Last: {debugInfo.lastMsgTime}</span>
      </div>
      
      <Header ticker={ticker} />
      
      <div className="chart-container">
        <Chart data={candles} currentCandle={currentCandle} />
      </div>

      <div className="trade-actions">
        <button className="btn btn-buy">Buy / Long</button>
        <button className="btn btn-sell">Sell / Short</button>
      </div>
    </div>
  );
}

export default App;
