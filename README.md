# DevPortfolio — Full-Stack Website for DevOps Practice

A simple but complete Node.js + HTML website designed to practice DevOps skills:
containerisation, CI/CD, reverse proxying, and deployment.

## Project Structure

```
devportfolio/
├── frontend/
│   └── index.html       ← Static website (HTML/CSS/JS)
├── server.js            ← Express backend
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

## API Endpoints

| Method | Endpoint       | Description            |
|--------|----------------|------------------------|
| GET    | /api/status    | Server status & uptime |
| GET    | /api/health    | Health check (Docker)  |
| GET    | /api/info      | App info & endpoints   |
| POST   | /api/contact   | Contact form handler   |

---

## 🚀 Option 1 — Run Locally (Node.js)

```bash
# Install dependencies
npm install

# Start server
npm start
# → http://localhost:3000
```

For live-reload during development:
```bash
npm run dev   # uses nodemon
```

---

## 🐳 Option 2 — Run with Docker

```bash
# Build image
docker build -t devportfolio .

# Run container
docker run -p 3000:3000 devportfolio
# → http://localhost:3000
```

---

## 🐙 Option 3 — Docker Compose (recommended)

```bash
docker-compose up --build
# → http://localhost:3000

# Stop
docker-compose down
```

---

## ☁️ Option 4 — Deploy to a VPS (Ubuntu)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone / upload your project
git clone https://github.com/yourhandle/devportfolio.git
cd devportfolio

# 4. Start with Docker Compose
docker-compose up -d

# 5. Check it's running
curl http://localhost:3000/api/health
```

### With Nginx reverse proxy on port 80

Install Nginx on the host:
```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/devportfolio`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/devportfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔁 GitHub Actions CI/CD (optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & push Docker image
        run: |
          docker build -t devportfolio .
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/devportfolio
            git pull
            docker-compose up -d --build
```

---

## Environment Variables

| Variable | Default | Description     |
|----------|---------|-----------------|
| PORT     | 3000    | Server port     |
| NODE_ENV | development | Environment |
