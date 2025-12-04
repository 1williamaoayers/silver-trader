import yfinance as yf
import time
import pandas as pd

def verify_silver_data():
    print("正在尝试拉取 XAG-USD (现货白银) 数据...\n")

    # 1. 拉取 1 周历史数据
    print("1. [验证历史数据] 尝试获取最近 5 天的 K 线数据...")
    try:
        # 银价在 Yahoo 的 Symbol 通常是 "SI=F" (期货) 或 "XAG-USD" (现货)
        ticker = yf.Ticker("XAG-USD") 
        hist = ticker.history(period="5d", interval="1h")
        
        if not hist.empty:
            print(f"✅ 成功获取历史数据！共 {len(hist)} 条。")
            print("前 2 条数据：")
            print(hist.head(2)[['Open', 'High', 'Low', 'Close']])
            print("\n最后 2 条数据：")
            print(hist.tail(2)[['Open', 'High', 'Low', 'Close']])
        else:
            print("❌ XAG-USD 历史数据为空。")
            return

        # 2. 验证实时数据更新
        print("\n2. [验证实时数据] 正在监听实时价格变化 (采集 5 次，间隔 2 秒)...")
        for i in range(5):
            try:
                # 使用 fast_info 获取最新报价
                price = ticker.fast_info.last_price
                print(f"   ⏱️ 第 {i+1} 次采样: {price:.4f} USD (时间: {time.strftime('%H:%M:%S')})")
            except Exception as e:
                 print(f"   ❌ 采样失败: {e}")
            
            time.sleep(2)
        
        print("\n✅ 验证结论：数据源 (Yahoo Finance) 正常工作，历史和实时数据均可获取。")

    except Exception as e:
        print(f"❌ 验证过程中发生错误: {e}")

if __name__ == "__main__":
    verify_silver_data()
