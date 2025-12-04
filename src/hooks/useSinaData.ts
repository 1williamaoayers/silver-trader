import { useState, useEffect, useRef } from 'react';

export interface SinaTicker {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  prevClose: number;
  time: string;
}

export const useSinaData = () => {
  const [ticker, setTicker] = useState<SinaTicker | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchSinaData = () => {
      const script = document.createElement('script');
      script.src = `https://hq.sinajs.cn/list=hf_XAG&_=${Date.now()}`;
      script.async = true;

      script.onload = () => {
        try {
          // @ts-ignore
          const dataStr = window.hq_str_hf_XAG;
          if (dataStr) {
            const parts = dataStr.split(',');
            if (parts.length > 8) {
              const currentPrice = parseFloat(parts[0]);
              const prevClose = parseFloat(parts[7]);
              const high = parseFloat(parts[4]);
              const low = parseFloat(parts[5]);
              const timeStr = parts[6];

              let change = 0;
              let changePercent = 0;

              if (prevClose > 0) {
                change = currentPrice - prevClose;
                changePercent = (change / prevClose) * 100;
              }

              setTicker({
                price: currentPrice,
                change,
                changePercent,
                high,
                low,
                prevClose,
                time: timeStr
              });
              setConnected(true);
              setLastUpdate(new Date().toLocaleTimeString());
            }
          }
        } catch (e) {
          console.error("Parse error", e);
          setConnected(false);
        }
        // Cleanup
        document.body.removeChild(script);
      };

      script.onerror = () => {
        setConnected(false);
        document.body.removeChild(script);
      };

      document.body.appendChild(script);
    };

    // Initial fetch
    fetchSinaData();

    // Poll every 1 second
    const interval = setInterval(fetchSinaData, 1000);

    return () => clearInterval(interval);
  }, []);

  return { ticker, connected, lastUpdate };
};
