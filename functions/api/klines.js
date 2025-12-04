export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Get query parameters
  const symbol = url.searchParams.get('symbol') || 'XAGUSDT';
  const interval = url.searchParams.get('interval') || '1m';
  const limit = url.searchParams.get('limit') || '1000';

  const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(binanceUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Workers',
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Enable CORS
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data', details: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
