# TalentForge ATS — Hostinger VPS Deployment Guide

Complete guide to deploy TalentForge ATS on a Hostinger VPS (or any Ubuntu VPS).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy (10 minutes)](#quick-deploy-10-minutes)
- [Step-by-Step Guide](#step-by-step-guide)
- [Post-Deployment](#post-deployment)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### What You Need

1. **Hostinger VPS** (or any Ubuntu 22.04/24.04 VPS)
   - Minimum: 2 vCPU, 4GB RAM, 50GB SSD
   - Recommended: 4 vCPU, 8GB RAM, 80GB SSD
2. **Domain name** pointed to your VPS IP address
   - A record: `ats.yourdomain.com` → `your.vps.ip`
3. **SSH access** to your VPS (root or sudo user)

### DNS Setup (before starting)

In your domain registrar (Hostinger, Namecheap, Cloudflare, etc.):

```
Type: A
Name: ats (or @ for root domain)
Value: YOUR.VPS.IP.ADDRESS
TTL: 300
```

Wait 5-30 minutes for DNS to propagate. Verify with:
```bash
dig ats.yourdomain.com +short
# Should return your VPS IP
```

## Quick Deploy (10 minutes)

```bash
# 1. SSH into your VPS
ssh root@your.vps.ip

# 2. Download and run the setup script
curl -sL https://raw.githubusercontent.com/mohsin3758/talentforge-ats/main/scripts/setup-vps.sh | bash

# 3. Upload your code (from your local machine)
scp -r ./* root@your.vps.ip:/var/www/talentforge-ats/

# 4. SSH back in and deploy
ssh root@your.vps.ip
cd /var/www/talentforge-ats
cp .env.production.example .env.production
nano .env.production  # Edit with your values
bash scripts/deploy-vps.sh

# 5. Visit your app
# https://ats.yourdomain.com
```

## Step-by-Step Guide

### Step 1: SSH into Your VPS

```bash
ssh root@your.vps.ip
# Enter your VPS password
```

### Step 2: Run VPS Setup Script

The setup script installs everything: Node.js, Bun, Nginx, PM2, Certbot (SSL), and configures the firewall.

```bash
# Download the setup script
curl -sL https://raw.githubusercontent.com/mohsin3758/talentforge-ats/main/scripts/setup-vps.sh -o setup-vps.sh
chmod +x setup-vps.sh

# Run it
bash setup-vps.sh
```

The script will ask for:
- Your domain name (e.g., `ats.yourdomain.com`)
- Your email (for SSL certificate)

It installs:
- ✅ Node.js 20 LTS
- ✅ Bun (JavaScript runtime)
- ✅ Nginx (reverse proxy)
- ✅ PM2 (process manager)
- ✅ Certbot (SSL certificates)
- ✅ UFW firewall

### Step 3: Upload Your Code

**From your local machine**, upload the project to the VPS:

```bash
# Option A: Clone from GitHub (if your repo is public)
ssh root@your.vps.ip "git clone https://github.com/mohsin3758/talentforge-ats.git /var/www/talentforge-ats"

# Option B: SCP from local machine
scp -r ./* root@your.vps.ip:/var/www/talentforge-ats/

# Option C: Use rsync (faster for updates)
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ root@your.vps.ip:/var/www/talentforge-ats/
```

### Step 4: Configure Environment

```bash
ssh root@your.vps.ip
cd /var/www/talentforge-ats

# Create production env file
cp .env.production.example .env.production
nano .env.production
```

Edit the values:

```bash
# Database — use Neon (free) or your own Postgres
DATABASE_URL="postgresql://user:pass@host:5432/talentforge?schema=public"

# Auth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="https://ats.yourdomain.com"
```

### Step 5: Deploy

```bash
bash scripts/deploy-vps.sh
```

This script:
1. ✅ Installs dependencies (`bun install`)
2. ✅ Generates Prisma client
3. ✅ Pushes database schema
4. ✅ Seeds the database (6 jobs, 30 candidates, admin user)
5. ✅ Builds the production app
6. ✅ Starts the app with PM2

### Step 6: Verify

Visit your domain: **https://ats.yourdomain.com**

- Login page: `https://ats.yourdomain.com/login`
- Email: `admin@talentforge.com`
- Password: `Admin123!`

## Post-Deployment

### Check App Status

```bash
# PM2 process status
pm2 status

# View logs
pm2 logs talentforge-ats

# Nginx status
systemctl status nginx

# Check if app is responding
curl -I http://localhost:3000
```

### Change Admin Password

After first login, change the admin password:

1. Login at `/login`
2. Or via CLI:
```bash
cd /var/www/talentforge-ats
ADMIN_PASSWORD="NewSecurePassword123!" bun scripts/seed-admin.ts
```

### Update the App

When you push new code to GitHub:

```bash
cd /var/www/talentforge-ats

# Pull latest code
git pull origin main

# Rebuild and restart
bash scripts/deploy-vps.sh
```

Or set up auto-deploy with a GitHub webhook.

## Maintenance

### PM2 Commands

```bash
pm2 status                    # View running processes
pm2 logs talentforge-ats      # View app logs
pm2 restart talentforge-ats   # Restart app
pm2 stop talentforge-ats      # Stop app
pm2 delete talentforge-ats    # Remove from PM2
pm2 monit                     # Real-time monitoring
```

### Nginx Commands

```bash
systemctl restart nginx       # Restart Nginx
systemctl status nginx        # Check status
nginx -t                      # Test config
tail -f /var/log/nginx/access.log  # View access logs
tail -f /var/log/nginx/error.log   # View error logs
```

### SSL Certificate Renewal

Certbot auto-renews certificates. To manually renew:

```bash
certbot renew
# Or test renewal (dry run)
certbot renew --dry-run
```

### Database Backup

```bash
# Export Neon database (if using Neon)
cd /var/www/talentforge-ats
bun -e "
import {db} from './src/lib/db';
const tables = ['Job','Candidate','Application','Interview','Communication','Offer','Note','Automation','User'];
for (const t of tables) {
  const data = await (db as any)[t.toLowerCase()].findMany();
  console.log(t + ': ' + data.length + ' records');
}
"
```

### View App Logs

```bash
# PM2 logs (app output)
pm2 logs talentforge-ats --lines 100

# Error logs
cat /var/log/talentforge-ats/error.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### App won't start

```bash
# Check PM2 logs
pm2 logs talentforge-ats --lines 50

# Common issues:
# 1. Missing env vars — check .env.production
# 2. Database connection — check DATABASE_URL
# 3. Build failed — run: bun run build
```

### 502 Bad Gateway

Nginx can't reach the app on port 3000.

```bash
# Check if app is running
pm2 status

# Restart if needed
pm2 restart talentforge-ats

# Check if port 3000 is listening
ss -tlnp | grep 3000
```

### SSL certificate error

```bash
# Check certificate status
certbot certificates

# Renew manually
certbot renew --force-renewal

# Check Nginx SSL config
nginx -t
```

### Database connection error

```bash
# Test database connection
cd /var/www/talentforge-ats
bun -e "import {db} from './src/lib/db'; await db.\$connect(); console.log('Connected!')"

# Common issues:
# 1. Wrong DATABASE_URL in .env.production
# 2. Database not accessible from VPS IP
# 3. SSL mode required (add ?sslmode=require to URL)
```

### AI features not working

The AI SDK needs a `.z-ai-config` file in the project root.

```bash
# Check if config exists
ls -la /var/www/talentforge-ats/.z-ai-config

# If missing, create it:
cat > /var/www/talentforge-ats/.z-ai-config << 'EOF'
{
  "baseUrl": "https://internal-api.z.ai/v1",
  "apiKey": "YOUR_API_KEY",
  "chatId": "your-chat-id",
  "token": "your-jwt-token",
  "userId": "your-user-id"
}
EOF

# Restart app
pm2 restart talentforge-ats
```

### Permission denied

```bash
# Fix ownership
chown -R www-data:www-data /var/www/talentforge-ats
chmod -R 755 /var/www/talentforge-ats

# Or if running as root
chown -R root:root /var/www/talentforge-ats
```

### Port 3000 already in use

```bash
# Find what's using port 3000
ss -tlnp | grep 3000

# Kill the process
kill -9 <PID>

# Restart PM2
pm2 restart talentforge-ats
```

## Architecture

```
Internet → Nginx (port 80/443) → Next.js (port 3000) → PostgreSQL (Neon/external)
                  ↓
              SSL/TLS
              (Let's Encrypt)
                  ↓
              PM2 Process Manager
              (auto-restart, logs)
```

- **Nginx**: Handles HTTPS, reverse proxies to Next.js
- **PM2**: Keeps the app running, auto-restarts on crash
- **Next.js**: The TalentForge ATS app (production build)
- **PostgreSQL**: Neon (free serverless) or your own database

## Security Checklist

- [ ] Change admin password from `Admin123!`
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable UFW firewall (done by setup script)
- [ ] SSL certificate active (done by setup script)
- [ ] SSH key authentication (disable password login)
- [ ] Regular database backups
- [ ] PM2 logs monitoring
- [ ] Fail2ban for SSH protection (optional: `apt install fail2ban`)
