import tkinter as tk
from tkinter import ttk
import threading
import time
import requests
import collections
from datetime import datetime

# Configuration
SINA_API_URL = "http://hq.sinajs.cn/list=hf_XAG"

class SilverTraderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Silver Trader (Live Monitor)")
        self.root.geometry("450x700")
        self.root.configure(bg="#121212")
        self.root.resizable(False, False)

        # Styles
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure("TLabel", background="#121212", foreground="#e0e0e0", font=("Helvetica", 12))
        self.style.configure("Header.TLabel", font=("Helvetica", 24, "bold"))
        self.style.configure("Price.TLabel", font=("Helvetica", 48, "bold"))
        
        # Data Buffer for "Real-time History"
        self.price_history = collections.deque(maxlen=20) 
        
        self.create_ui()
        
        self.is_running = True
        
        # Start Polling Thread
        self.poll_thread = threading.Thread(target=self.poll_realtime_data)
        self.poll_thread.daemon = True
        self.poll_thread.start()

    def create_ui(self):
        # Status
        self.status_var = tk.StringVar(value="Initializing...")
        self.status_label = ttk.Label(self.root, textvariable=self.status_var, font=("Helvetica", 10), foreground="#888")
        self.status_label.pack(pady=5)

        # Header
        header_frame = tk.Frame(self.root, bg="#121212")
        header_frame.pack(pady=20)
        ttk.Label(header_frame, text="XAG / USD", style="Header.TLabel").pack()
        tk.Label(header_frame, text=" Live Monitor ", bg="#ff5722", fg="white", font=("Helvetica", 10, "bold")).pack(pady=5)

        # Price
        self.price_var = tk.StringVar(value="--.--")
        self.price_label = ttk.Label(self.root, textvariable=self.price_var, style="Price.TLabel", foreground="#ffffff")
        self.price_label.pack(pady=20)

        # Stats
        stats_frame = tk.Frame(self.root, bg="#1e1e1e", padx=20, pady=20)
        stats_frame.pack(fill="x", padx=20)

        # 1. 5X Leverage Display (Now on TOP, Large Font, No prefix)
        self.leverage_var = tk.StringVar(value="--.--%")
        self.leverage_label = tk.Label(stats_frame, textvariable=self.leverage_var, bg="#1e1e1e", fg="white", font=("Helvetica", 18, "bold"))
        self.leverage_label.pack(pady=(10, 5))

        # 2. Real Change (Now BELOW, Smaller Font)
        self.change_var = tk.StringVar(value="--.--%")
        self.change_label = tk.Label(stats_frame, textvariable=self.change_var, bg="#1e1e1e", fg="white", font=("Helvetica", 14))
        self.change_label.pack(pady=(0, 5))
        
        # Range
        range_frame = tk.Frame(stats_frame, bg="#1e1e1e")
        range_frame.pack(fill="x", pady=10)
        
        self.high_var = tk.StringVar(value="H: --")
        tk.Label(range_frame, textvariable=self.high_var, bg="#1e1e1e", fg="#e0e0e0", font=("Helvetica", 12)).pack(side="left", expand=True)
        
        self.low_var = tk.StringVar(value="L: --")
        tk.Label(range_frame, textvariable=self.low_var, bg="#1e1e1e", fg="#e0e0e0", font=("Helvetica", 12)).pack(side="right", expand=True)

        # Live Ticks List
        tk.Label(self.root, text="Recent Ticks (Real-time)", bg="#121212", fg="#888", font=("Helvetica", 10)).pack(pady=(20, 5))
        self.ticks_text = tk.Text(self.root, height=10, bg="#000000", fg="#00ff00", font=("Consolas", 10), state='disabled')
        self.ticks_text.pack(fill="x", padx=20, pady=5)

        # Buttons (Red for Buy/Up, Green for Sell/Down)
        btn_frame = tk.Frame(self.root, bg="#121212")
        btn_frame.pack(side="bottom", fill="x", padx=20, pady=30)

        # Buy = Red (#ef5350)
        tk.Button(btn_frame, text="BUY / LONG", bg="#ef5350", fg="white", font=("Helvetica", 14, "bold"), height=2, borderwidth=0).pack(side="left", fill="x", expand=True, padx=5)
        # Sell = Green (#26a69a)
        tk.Button(btn_frame, text="SELL / SHORT", bg="#26a69a", fg="white", font=("Helvetica", 14, "bold"), height=2, borderwidth=0).pack(side="right", fill="x", expand=True, padx=5)

    def update_ticks_display(self):
        self.ticks_text.config(state='normal')
        self.ticks_text.delete('1.0', 'end')
        for t, p in reversed(self.price_history):
            self.ticks_text.insert('end', f"[{t}] {p:.4f}\n")
        self.ticks_text.config(state='disabled')

    def update_ui(self, price, change_percent, high, low, update_time):
        try:
            is_positive = change_percent >= 0
            # Chinese Color Scheme: Red for Up, Green for Down
            color = "#ef5350" if is_positive else "#26a69a"

            self.price_var.set(f"{price:.4f}")
            self.high_var.set(f"H: {high:.4f}")
            self.low_var.set(f"L: {low:.4f}")
            
            # 5X Leverage (Big, Top)
            leverage_percent = change_percent * 5
            self.leverage_var.set(f"{leverage_percent:+.2f}%")
            self.leverage_label.configure(fg=color)

            # Real Change (Small, Bottom)
            self.change_var.set(f"{change_percent:+.2f}%")
            self.change_label.configure(fg=color)
            
            self.price_label.configure(foreground=color)
            
            self.status_var.set(f"● Market Live (Sina)")
            self.status_label.configure(foreground="#4caf50") # Status dot always green for connected
            
            current_time_str = time.strftime("%H:%M:%S")
            if not self.price_history or self.price_history[-1][0] != current_time_str:
                 self.price_history.append((current_time_str, price))
                 self.update_ticks_display()
            
        except Exception as e:
            print(f"Update error: {e}")

    def poll_realtime_data(self):
        headers = {"Referer": "http://finance.sina.com.cn/"}
        
        while self.is_running:
            try:
                resp = requests.get(SINA_API_URL, headers=headers, timeout=5)
                if resp.status_code == 200 and "hf_XAG" in resp.text:
                    content = resp.text.split('"')[1]
                    data = content.split(',')
                    
                    if len(data) > 8:
                        current_price = float(data[0])
                        prev_close = float(data[7])
                        high = float(data[4])
                        low = float(data[5])
                        update_time = data[6]
                        
                        if prev_close > 0:
                            change = current_price - prev_close
                            change_percent = (change / prev_close) * 100
                        else:
                            change_percent = 0.0

                        self.root.after(0, self.update_ui, current_price, change_percent, high, low, update_time)
                
            except Exception as e:
                self.root.after(0, lambda: self.status_var.set("Retrying connection..."))
            
            time.sleep(1)

if __name__ == "__main__":
    root = tk.Tk()
    app = SilverTraderApp(root)
    root.mainloop()
