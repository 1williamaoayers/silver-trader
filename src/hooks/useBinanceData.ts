import { useEffect, useState } from 'react';
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
  
  // Fetch historical data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=1000`);
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

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${SYMBOL.toLowerCase()}@kline_${INTERVAL}/${SYMBOL.toLowerCase()}@ticker`);

    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to Binance WS');
    };

    ws.onmessage = (event) => {
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
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from Binance WS');
    };

    return () => {
      ws.close();
    };
  }, []);

  return { candles, currentCandle, ticker, connected };
};
