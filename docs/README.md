# MarketShield AI Documentation

## 1. Project Overview

MarketShield AI is a full-stack web application that evaluates whether an online marketplace listing is likely fraudulent, suspicious, or legitimate. Users submit a product URL from supported marketplaces such as Amazon, Flipkart, eBay, Walmart, Etsy, or Best Buy. The platform extracts product metadata, compares benchmark prices from similar products, applies heuristic fraud checks, and optionally enriches the verdict with `gemini-3-flash-preview`.

### Features
- React + Vite single-page application with TailwindCSS, Framer Motion, responsive design, and glassmorphism-inspired premium UI.
- Dark mode toggle with persisted user preference.
- Sticky navigation, hero input form, animated loading overlay, skeleton loaders, and toast-based error messaging.
- Product result dashboard with image preview, seller details, ratings summary, warnings, confidence score, and price comparison chart.
- Analysis history stored locally in the browser.
- Node.js + Express API with URL validation, rate limiting, secure environment variable configuration, and structured JSON responses.
- Marketplace scraping/fetching with graceful fallback to benchmark dataset when live pages block requests.
- Rule-based fraud scoring plus Gemini API analysis for explainable classification.
- Deployment assets for Nginx reverse proxy and production hosting.

### Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Lucide React, Recharts
- **Backend:** Node.js, Express, Cheerio, dotenv, express-rate-limit, cors
- **AI:** Gemini 3 Flash Preview API (`gemini-3-flash-preview`)
- **Deployment:** Nginx, PM2 or systemd, Let's Encrypt / Certbot

## 2. Setup Instructions

### Prerequisites
- Node.js 20+ recommended
- npm 10+
- A Gemini API key with access to the `gemini-3-flash-preview` model

### Backend Setup
1. Open a terminal in the project root.
2. Install dependencies for the monorepo:
   ```bash
   npm install
   ```
3. Create a backend environment file from the example:
   ```bash
   cp .env.example backend/.env
   ```
4. Update `backend/.env` with your real Gemini key and any overrides:
   ```env
   GEMINI_API_KEY=your_real_key
   PORT=8080
   CLIENT_ORIGIN=http://localhost:5173
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=20
   ```
5. Start only the backend in development mode:
   ```bash
   npm run dev:backend
   ```
6. The API will be available at `http://localhost:8080/api`.

### Frontend Setup
1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev:frontend
   ```
3. Open `http://localhost:5173` in your browser.
4. The frontend proxies `/api` requests to the backend automatically during development.

### Full Development Workflow
Run both frontend and backend concurrently from the repository root:
```bash
npm run dev
```

## 3. Arch Linux Deployment Guide

### Install Required Packages
```bash
sudo pacman -Syu
sudo pacman -S nodejs npm nginx git certbot certbot-nginx ufw
sudo npm install -g pm2
```

### Step 1: Clone the Project
```bash
git clone https://your-git-host/marketshield-ai.git
cd marketshield-ai
npm install
```

### Step 2: Configure Environment Variables
```bash
cp .env.example backend/.env
nano backend/.env
```
Provide your production values:
```env
GEMINI_API_KEY=your_production_key
PORT=8080
CLIENT_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

### Step 3: Build the Frontend
```bash
npm run build
```
The frontend production build will be generated in `frontend/dist`.

### Step 4A: Run the Backend with PM2
```bash
pm2 start backend/src/server.js --name marketshield-api
pm2 save
pm2 startup systemd
```

### Step 4B: Run the Backend with systemd (Alternative)
Create `/etc/systemd/system/marketshield.service`:
```ini
[Unit]
Description=MarketShield AI Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/marketshield-ai
ExecStart=/usr/bin/node backend/src/server.js
EnvironmentFile=/var/www/marketshield-ai/backend/.env
Restart=always
User=http
Group=http

[Install]
WantedBy=multi-user.target
```
Enable and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now marketshield.service
sudo systemctl status marketshield.service
```

### Step 5: Configure Nginx Reverse Proxy
Copy the provided sample config from `deploy/nginx-marketshield.conf` into `/etc/nginx/sites-available/marketshield.conf` or your preferred Arch Linux include path.

#### Sample Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/marketshield-ai/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable Nginx:
```bash
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

### Step 6: Firewall Setup
Using UFW:
```bash
sudo systemctl enable --now ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Using `iptables` (alternative):
```bash
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables-save | sudo tee /etc/iptables/iptables.rules
```

### Step 7: SSL Setup with Let's Encrypt
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo systemctl status certbot-renew.timer
```
Certbot will update the Nginx config to serve HTTPS automatically.

## 4. Environment Variables
Example configuration:
```env
GEMINI_API_KEY=xzy
PORT=8080
CLIENT_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20
```

## 5. API Documentation

### Endpoint
`POST /api/analyze`

### Request Body
```json
{
  "url": "string"
}
```

### Example Response
```json
{
  "title": "Apple iPhone 15 128GB Blue",
  "price": 799,
  "averagePrice": 814,
  "image": "https://example.com/image.jpg",
  "fraudPrediction": "Likely Legit",
  "confidence": 82,
  "explanation": "The seller is verified, the price aligns with benchmarks, and review volume is healthy."
}
```

### Response Notes
- `warnings` contains heuristic or AI-generated fraud signals.
- `similarProducts` includes the benchmark records used to compute average market price.
- `scrapedLive` indicates whether live page extraction succeeded.
- If Gemini is unavailable, the API still returns a rule-based assessment.

## 6. Future Improvements
- Replace heuristic scoring with a trained fraud detection model.
- Add persistent database storage for analysis history and audit logs.
- Integrate real-time price tracking APIs for more accurate market comparisons.
- Expand supported marketplaces and locale-aware currency normalization.
- Add multi-language UI and explanation support.
- Introduce browser extension workflows for one-click product checks.
