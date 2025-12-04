import requests
import time
import json

def test_investpy_search():
    print("\n=== Testing Sina Global Futures History API ===")
    timestamp = int(time.time() * 1000)
    url = f"https://gu.sina.cn/ft/api/jsonp.php/var%20_hf_XAG=/GlobalService.getGlobalFuturesDailyKLine?symbol=hf_XAG&_={timestamp}"
    
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            content = resp.text
            start_idx = content.find('(')
            end_idx = content.rfind(')')
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx+1 : end_idx]
                data = json.loads(json_str)
                
                # Sina API returns empty array or fewer records if symbol is wrong or market closed?
                # But hf_XAG is correct for realtime.
                # Let's check the data structure.
                print(f"✅ Fetch Success. Records: {len(data)}")
                if len(data) > 0:
                    print(f"   First: {data[0]}")
                    print(f"   Last:  {data[-1]}")
                else:
                    print("   ⚠️ Data array is empty.")
                return True
            else:
                print(f"❌ Parse Failed. Content: {content[:100]}")
        else:
            print(f"❌ Status: {resp.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    return False

if __name__ == "__main__":
    test_investpy_search()
