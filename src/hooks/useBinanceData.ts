import { useEffect, useState, useRef } from 'react';
import { Time } from 'lightweight-charts';

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface TickerData {
  price: number;
  priceChangePercent: number;
  bestBid: number;
  bestAsk: number;
}

const SYMBOL = 'XAGUSDT';
const INTERVAL = '1m';

export const useBinanceData = () => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=1000`);
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          time: (item[0] / 1000) as Time, // Lightweight charts uses seconds
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setCandles(formattedData);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  // WebSocket connection with reconnection logic
  useEffect(() => {
    const connect = () => {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${SYMBOL.toLowerCase()}@kline_${INTERVAL}/${SYMBOL.toLowerCase()}@ticker`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('Connected to Binance WS');
        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { stream, data } = message;

          if (stream.includes('kline')) {
            const k = data.k;
            const newCandle = {
              time: (k.t / 1000) as Time,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
            };
            setCurrentCandle(newCandle);
          }

          if (stream.includes('ticker')) {
            setTicker({
              price: parseFloat(data.c),
              priceChangePercent: parseFloat(data.P),
              bestBid: parseFloat(data.b),
              bestAsk: parseFloat(data.a),
            });
          }
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      ws.onclose = (event) => {
        setConnected(false);
        console.log('Disconnected from Binance WS', event.code, event.reason);
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectTimeoutRef.current) {
           reconnectTimeoutRef.current = setTimeout(() => {
             console.log('Attempting to reconnect...');
             connect();
           }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close(); // This will trigger onclose which handles reconnection
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return { candles, currentCandle, ticker, connected };
};
