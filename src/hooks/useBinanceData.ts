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
// Use Binance public data stream (no API key required)
// Using wss://stream.binance.com:9443/stream is standard
// Fallback to wss://data-stream.binance.vision if main fails
const WS_URL_MAIN = `wss://stream.binance.com:9443/stream?streams=${SYMBOL.toLowerCase()}@kline_${INTERVAL}/${SYMBOL.toLowerCase()}@ticker`;
const WS_URL_FALLBACK = `wss://data-stream.binance.vision/stream?streams=${SYMBOL.toLowerCase()}@kline_${INTERVAL}/${SYMBOL.toLowerCase()}@ticker`;

export const useBinanceData = () => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const useFallbackRef = useRef(false);
  
  // Fetch historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Determine API URL: Use Cloudflare Proxy if on production, else Direct
        // Note: /api/klines is our Cloudflare Function
        const isProduction = import.meta.env.PROD;
        const baseUrl = isProduction ? '/api/klines' : 'https://api.binance.com/api/v3/klines';
        
        console.log(`Fetching history from: ${baseUrl}`);
        
        const response = await fetch(`${baseUrl}?symbol=${SYMBOL}&interval=${INTERVAL}&limit=1000`);
        
        if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if data is an array (Binance API returns array of arrays)
        if (!Array.isArray(data)) {
             throw new Error("Invalid data format received");
        }

        const formattedData = data.map((item: any) => ({
          time: (item[0] / 1000) as Time, // Lightweight charts uses seconds
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setCandles(formattedData);
        setError(null);
      } catch (error) {
        console.error('Error fetching history:', error);
        // Don't set error here immediately to avoid flashing if WS connects
        // But if WS also fails, user will see the WS error
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

      const url = useFallbackRef.current ? WS_URL_FALLBACK : WS_URL_MAIN;
      console.log(`Connecting to Binance WS (${useFallbackRef.current ? 'Fallback' : 'Main'})...`);
      
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
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
             // Toggle fallback URL on reconnection failure
             useFallbackRef.current = !useFallbackRef.current; 
             connect();
           }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket Connection Error');
        ws.close(); 
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

  return { candles, currentCandle, ticker, connected, error };
};
