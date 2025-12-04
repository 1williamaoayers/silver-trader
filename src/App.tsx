import { useBinanceData } from './hooks/useBinanceData';
import { Chart } from './components/Chart';
import { Header } from './components/Header';
import './App.css';

function App() {
  const { candles, currentCandle, ticker, connected } = useBinanceData();

  return (
    <div className="app-container">
      <div className="status-bar">
        <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
        {connected ? 'Market Live' : 'Connecting...'}
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
