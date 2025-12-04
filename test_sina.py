import requests
import time

def test_sina():
    # hf_XAG is London Silver (XAG) on Sina Finance
    url = "http://hq.sinajs.cn/list=hf_XAG"
    headers = {"Referer": "http://finance.sina.com.cn/"}
    
    try:
        print(f"Testing Sina Finance: {url}")
        resp = requests.get(url, headers=headers, timeout=5)
        print(f"Status Code: {resp.status_code}")
        print(f"Content: {resp.text}")
        
        if "hf_XAG" in resp.text:
            # Format: var hq_str_hf_XAG="31.525,31.535,31.525,31.525,31.600,31.450,15:59:59,31.525,31.540,2310.000,0,0,0,2025-12-04,Silver";
            # Fields: current_price, ?, bid, ask, high, low, time, prev_close, open, ...
            data = resp.text.split('"')[1].split(',')
            price = data[0]
            print(f"✅ Parsed Price: {price}")
            return True
    except Exception as e:
        print(f"❌ Sina Error: {e}")
        return False

test_sina()
