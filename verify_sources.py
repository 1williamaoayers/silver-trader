import requests
import time
import json

def test_source(name, url, headers=None, parser=None):
    print(f"\nTesting {name}...")
    print(f"URL: {url}")
    try:
        start = time.time()
        response = requests.get(url, headers=headers, timeout=5)
        latency = (time.time() - start) * 1000
        
        if response.status_code == 200:
            print(f"✅ Status: 200 OK ({latency:.0f}ms)")
            content = response.text[:200] # Preview
            print(f"Raw Data: {content}")
            
            if parser:
                try:
                    price = parser(response.text)
                    print(f"💰 Parsed Price: {price}")
                    return True
                except Exception as e:
                    print(f"⚠️ Parse Error: {e}")
            return True
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
    return False

# Parsers
def parse_sina(text):
    # var hq_str_hf_XAG="31.525,..."
    return text.split('"')[1].split(',')[0]

def parse_binance(text):
    return json.loads(text)['price']

def parse_yahoo(text):
    data = json.loads(text)
    return data['chart']['result'][0]['meta']['regularMarketPrice']

def parse_eastmoney(text):
    # jQuery123({"data":{"f43":31.52,"f44":31.53...}})
    # f43 is usually latest price
    json_str = text[text.find('(')+1 : text.rfind(')')]
    data = json.loads(json_str)
    return data['data']['f43']

# Headers
headers_common = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

headers_sina = {"Referer": "http://finance.sina.com.cn/"}

print("="*50)
print("STARTING COMPREHENSIVE DATA SOURCE TEST")
print("="*50)

# 1. Sina Finance (London Silver)
test_source("Sina Finance (hf_XAG)", 
            "http://hq.sinajs.cn/list=hf_XAG", 
            headers=headers_sina, 
            parser=parse_sina)

# 2. EastMoney (Spot Silver) - Code usually 102.XAG or similar. Let's try finding the right code.
# XAGUSD in EastMoney. 
# Trying a generic search API first might be too complex, let's try a known endpoint for XAG
# secid=120.XAGUSD is a guess, let's try a few.
# Actually, let's stick to what usually works.
# http://push2.eastmoney.com/api/qt/stock/get?secid=102.XAGUSD&fields=f43,f57,f58
test_source("EastMoney (XAGUSD)", 
            "http://push2.eastmoney.com/api/qt/stock/get?secid=102.XAGUSD&fields=f43,f44,f45,f46,f47,f48",
            headers=headers_common,
            parser=parse_eastmoney)

# 3. Yahoo Finance (Raw API)
test_source("Yahoo Finance (XAG=X)", 
            "https://query1.finance.yahoo.com/v8/finance/chart/XAG=X?interval=1m&range=1d",
            headers=headers_common,
            parser=parse_yahoo)

# 4. Binance (Direct)
test_source("Binance API (Direct)", 
            "https://api.binance.com/api/v3/ticker/price?symbol=XAGUSDT",
            parser=parse_binance)

print("\n" + "="*50)
print("TEST COMPLETE")
print("="*50)
