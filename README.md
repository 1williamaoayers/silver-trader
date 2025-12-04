# Silver Trader (XAG/USD) - Real-time Leveraged Tracker

A real-time Silver (XAG/USD) trading dashboard built with React, TypeScript, and Vite.

## Features

- **Real-time Data**: Connects directly to Binance WebSocket API (No API key required).
- **Interactive Charts**: Powered by TradingView's Lightweight Charts.
- **5x Leverage Simulation**: Automatically calculates and displays 5x leveraged price changes.
- **Live Order Book**: Shows real-time Best Bid and Best Ask prices.
- **PWA Ready**: Installable on Android and iOS devices as a native-like app.

## Deployment to Cloudflare Pages

This project is ready to be deployed on Cloudflare Pages.

1. Push this repository to GitHub.
2. Log in to Cloudflare Dashboard > Pages.
3. Click **Connect to Git** and select this repository.
4. Use the following build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Lightweight Charts
- Lucide React (Icons)
