export async function onRequest(context) {
  const url = "http://hq.sinajs.cn/list=hf_XAG";
  
  try {
    const response = await fetch(url, {
      headers: {
        "Referer": "http://finance.sina.com.cn/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // Sina returns GBK usually, but fetch might decode it as UTF-8 which causes mess.
    // However, for the numbers (price), ASCII is fine. The name might be garbled but we don't use the name.
    const text = await response.text();

    return new Response(text, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(`Error fetching data: ${err.message}`, { status: 500 });
  }
}
