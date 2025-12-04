export async function onRequest(context) {
  const url = "http://hq.sinajs.cn/list=hf_XAG";
  
  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "http://finance.sina.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return new Response(`Sina API Error: ${response.status}`, { status: 502 });
    }

    // Sina returns GBK encoding. We must decode it to UTF-8 here.
    // Otherwise, the browser receiving this via fetch might get confused or see mojibake.
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("gbk");
    const text = decoder.decode(buffer);

    return new Response(text, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (err) {
    return new Response(`Worker Error: ${err.message}`, { status: 500 });
  }
}
