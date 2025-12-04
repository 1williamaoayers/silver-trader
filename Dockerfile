FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for Tkinter if used, though headless is better)
# RUN apt-get update && apt-get install -y python3-tk && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Use piwheels for ARM builds to avoid compiling Rust
RUN pip install --no-cache-dir --extra-index-url https://www.piwheels.org/simple -r requirements.txt

COPY . .

# Default command - user can override
CMD ["python", "silver_app.py"]
