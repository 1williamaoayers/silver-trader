# Silver Trader

Real-time Silver (XAG/USD) price monitor with live chart and 5x leverage simulation.
Designed for both Desktop (Python/Tkinter) and Mobile (Web/React) use.

## 📂 Project Structure

- **`silver_app.py`**: Python Desktop App (Tkinter). Runs locally or in Docker (headless).
- **`src/`**: React Web App source code.
- **`Dockerfile`**: Multi-arch Docker build configuration (uses piwheels for fast ARM builds).
- **`deploy_ghcr.py`**: Deployment script to pull and run the Docker image on OneCloud/Server.
- **`.github/workflows/publish.yml`**: CI/CD pipeline to build Docker image for amd64/arm64/armv7.

## 🚀 Deployment (OneCloud / OpenWrt / ARM)

1. **Push to GitHub**:
   Committing code to `main` branch triggers the GitHub Action.
   It builds the Docker image for `linux/amd64`, `linux/arm64`, and `linux/arm/v7`.

2. **Deploy to Device**:
   Run the deployment script locally to update the container on your device:
   ```bash
   python deploy_ghcr.py
   ```
   *(Make sure to edit `deploy_ghcr.py` with your device IP and SSH credentials)*

## 🛠 Local Development

### Python App
```bash
pip install -r requirements.txt
python silver_app.py
```

### Web App
```bash
npm install
npm run dev
```

### Build EXE (Windows)
To create a standalone Windows executable:
```bash
pyinstaller SilverTrader.spec
```
Output will be in `dist/SilverTrader.exe`.

## 📦 Releases

The Windows EXE can be downloaded from the [GitHub Releases](https://github.com/YOUR_USERNAME/silver-trader/releases) page.
