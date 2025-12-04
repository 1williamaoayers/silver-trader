import { useState, useEffect } from 'react';

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
    const processData = (dataStr: string) => {
       try {
          if (dataStr) {
            // dataStr format: "price,unk,buy,sell,high,low,time,prev_close,..."
            // Actually for hf_XAG: price, ?, ?, ?, high, low, time, prevClose, ...
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
    };

    const fetchSinaData = async () => {
      // Detect environment
      const isHttps = window.location.protocol === 'https:';

      if (isHttps) {
        // --- Cloudflare Pages Mode (HTTPS) ---
        // Browser blocks mixed content (HTTP API from HTTPS page), so we use our own proxy.
        try {
          const res = await fetch(`/api/quote?_=${Date.now()}`);
          if (res.ok) {
             const text = await res.text();
             // Response format: var hq_str_hf_XAG="...";
             const match = text.match(/"([^"]+)"/);
             if (match && match[1]) {
               processData(match[1]);
             }
          } else {
            setConnected(false);
          }
        } catch (e) {
          console.error("Proxy fetch error", e);
          setConnected(false);
        }

      } else {
        // --- Docker / Local Mode (HTTP) ---
        // Use JSONP directly for fastest speed and no backend requirement
        const script = document.createElement('script');
        script.src = `http://hq.sinajs.cn/list=hf_XAG&_=${Date.now()}`; // Use HTTP to match page
        script.referrerPolicy = 'no-referrer';
        script.async = true;

        script.onload = () => {
          // @ts-ignore
          const dataStr = window.hq_str_hf_XAG;
          processData(dataStr);
          document.body.removeChild(script);
        };

        script.onerror = () => {
          setConnected(false);
          document.body.removeChild(script);
        };

        document.body.appendChild(script);
      }
    };

    // Initial fetch
    fetchSinaData();

    // Poll every 1 second
    const interval = setInterval(fetchSinaData, 1000);

    return () => clearInterval(interval);
  }, []);

  return { ticker, connected, lastUpdate };
};
