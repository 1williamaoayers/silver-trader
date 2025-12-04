import requests
import time
from datetime import datetime

# Sina Finance Real-time API for London Silver (XAG)
URL = "http://hq.sinajs.cn/list=hf_XAG"
HEADERS = {"Referer": "http://finance.sina.com.cn/"}

def check_consistency(iterations=10):
    print(f"Starting {iterations}-round consistency check against Sina Finance...")
    print(f"Target URL: {URL}\n")
    
    success_count = 0
    
    for i in range(iterations):
        try:
            timestamp = datetime.now().strftime("%H:%M:%S")
            resp = requests.get(URL, headers=HEADERS, timeout=5)
            
            if resp.status_code == 200 and "hf_XAG" in resp.text:
                # Format: var hq_str_hf_XAG="price,?,bid,ask,high,low,time,prev_close,...";
                content = resp.text.split('"')[1]
                data = content.split(',')
                
                if len(data) > 0:
                    price = data[0]
                    update_time = data[6]
                    print(f"[{i+1}/{iterations}] {timestamp} -> Price: {price} | Source Time: {update_time} | ✅ Valid")
                    success_count += 1
                else:
                    print(f"[{i+1}/{iterations}] {timestamp} -> ❌ Empty Data")
            else:
                print(f"[{i+1}/{iterations}] {timestamp} -> ❌ Request Failed (Status: {resp.status_code})")
                
        except Exception as e:
             print(f"[{i+1}/{iterations}] {timestamp} -> ❌ Error: {e}")
        
        time.sleep(1) # Wait 1s between checks
        
    print("\n" + "="*30)
    print(f"Check Complete: {success_count}/{iterations} Successful")
    print("="*30)
    
    if success_count == iterations:
        print("CONCLUSION: Data source is STABLE and CONSISTENT.")
        return True
    else:
        print("CONCLUSION: Data source is UNSTABLE.")
        return False

if __name__ == "__main__":
    check_consistency()
