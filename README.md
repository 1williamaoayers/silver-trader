# 📈 Silver Trader (白银交易员)

**专为白银 (XAG/USD) 投资者打造的极简实时行情监控工具。**

无论你是坐在电脑前，还是躺在床上玩手机，都能随时掌握最新价格。

## ✨ 主要功能

*   **🚀 实时数据**：直连新浪财经接口，国内网络秒开，无延迟，不需要特殊网络。
*   **🔴 红涨绿跌**：符合国人习惯的配色（上涨红色，下跌绿色）。
*   **📱 多端支持**：
    *   **电脑版**：下载 exe 文件，双击即用。
    *   **手机版**：部署在玩客云/树莓派上，手机浏览器随时访问。

---

## 📖 零基础小白使用指南

### 1️⃣ 电脑版 (Windows) - 最简单！
如果你只想在电脑上看行情，不想折腾代码：

1.  点击本页面右侧的 **[Releases](https://github.com/1williamaoayers/silver-trader/releases)** (发行版)。
2.  找到最新的版本，点击下载 `SilverTrader.exe` 文件。
3.  下载后**直接双击运行**即可！
    *   *注意：如果杀毒软件误报，请选择“允许运行”或“信任此文件”，这是因为个人开发的软件没有购买昂贵的数字签名。*

---

### 2️⃣ 玩客云 / 树莓派 / NAS 用户 (手机看行情)
如果你有一台装了 Docker 的设备（比如刷了 OpenWrt 的玩客云），想在手机上看行情：

#### 🚀 极简部署（一条命令搞定）
通过 SSH 连接到你的设备，复制下面的命令并回车：

```bash
docker run -d --name silver-trader --restart always -p 8888:80 ghcr.io/1williamaoayers/silver-trader:latest
```

#### 📂 指定目录部署（可选）
如果你想把程序文件放在自己指定的目录（例如 `/home/silver`），或者你想以后方便修改配置，可以使用下面的命令：

```bash
# 1. 创建目录
mkdir -p /home/silver

# 2. 运行容器（将本地目录映射进去）
docker run -d \
  --name silver-trader \
  --restart always \
  -p 8888:80 \
  -v /home/silver:/app/data \
  ghcr.io/1williamaoayers/silver-trader:latest
```
*(注意：`/home/silver` 可以改成你喜欢的任何路径)*

#### 📱 如何访问？
*   打开手机浏览器，输入：`http://你设备的IP:8888`
*   例如：`http://192.168.3.99:8888`

---

## 🛠️ 进阶：开发者指南 (如果你懂代码)

如果你想自己修改代码或编译：

### 📂 项目结构
- `silver_app.py`: 电脑桌面版源码 (Python/Tkinter)。
- `src/`: 手机网页版源码 (React + Vite)。
- `Dockerfile`: 用于构建 Docker 镜像的配置文件。

### 🔧 本地开发 (Python)
```bash
pip install -r requirements.txt
python silver_app.py
```

### 📦 自己打包 EXE
```bash
# 需要先安装 PyInstaller
pip install pyinstaller
pyinstaller SilverTrader.spec
# 打包好的文件在 dist/ 目录下
```

### 🐳 Docker 镜像构建
本项目使用了 GitHub Actions 自动构建多架构镜像 (支持 amd64, arm64, armv7)，推送到 GitHub Packages。
如果你修改了代码，推送到 GitHub 后会自动触发构建。

---

**完全免费开源，如果觉得好用，请点击右上角的 Star ⭐️ 支持一下！**
