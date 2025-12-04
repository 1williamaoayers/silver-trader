import requests
import yfinance as yf
import time
import json

def test_sina_realtime():
    print("\n=== 1. Testing Real-time Data (Sina Finance) ===")
    url = "http://hq.sinajs.cn/list=hf_XAG"
    headers = {"Referer": "http://finance.sina.com.cn/"}
    try:
        start = time.time()
        resp = requests.get(url, headers=headers, timeout=5)
        latency = (time.time() - start) * 1000
        
        if resp.status_code == 200 and "hf_XAG" in resp.text:
            # Format: var hq_str_hf_XAG="price,?,bid,ask,high,low,time,prev_close,...";
            content = resp.text.split('"')[1]
            data = content.split(',')
            price = data[0]
            prev_close = data[7]
            update_time = data[6]
            
            print(f"✅ Connection Success ({latency:.0f}ms)")
            print(f"   Price: {price}")
            print(f"   Time:  {update_time}")
            print(f"   Prev:  {prev_close}")
            return True
        else:
            print(f"❌ Failed. Status: {resp.status_code}")
            print(f"   Response: {resp.text[:100]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_yahoo_history():
    print("\n=== 2. Testing Historical Data (Yahoo Finance) ===")
    try:
        start = time.time()
        # Try fetching 1 month of data
        ticker = yf.Ticker("XAG-USD")
        hist = ticker.history(period="1mo", interval="1d")
        latency = (time.time() - start) * 1000
        
        if not hist.empty:
            print(f"✅ Fetch Success ({latency:.0f}ms)")
            print(f"   Rows: {len(hist)}")
            print(f"   Date Range: {hist.index[0].date()} to {hist.index[-1].date()}")
            print("\n   First 2 Rows:")
            print(hist[['Open', 'High', 'Low', 'Close']].head(2))
            print("\n   Last 2 Rows:")
            print(hist[['Open', 'High', 'Low', 'Close']].tail(2))
            return True
        else:
            print("❌ Fetch returned empty dataframe.")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("Starting Pre-flight Data Check...")
    sina_ok = test_sina_realtime()
    yahoo_ok = test_yahoo_history()
    
    print("\n=== SUMMARY ===")
    print(f"Real-time (Sina): {'✅ PASS' if sina_ok else '❌ FAIL'}")
    print(f"History (Yahoo):  {'✅ PASS' if yahoo_ok else '❌ FAIL'}")
