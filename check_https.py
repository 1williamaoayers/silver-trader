import requests

def check_https_sina():
    url = "https://hq.sinajs.cn/list=hf_XAG"
    headers = {"Referer": "https://finance.sina.com.cn/"}
    try:
        print(f"Testing HTTPS: {url}")
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            print("✅ HTTPS Works!")
            print(resp.text[:100])
        else:
            print(f"❌ Failed: {resp.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

check_https_sina()
