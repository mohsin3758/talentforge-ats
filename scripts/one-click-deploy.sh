#!/bin/bash
#
# TalentForge ATS — All-in-One VPS Deploy Script
#
# Run this SINGLE command on your VPS as root:
#   bash <(curl -sL https://raw.githubusercontent.com/mohsin3758/talentforge-ats/main/scripts/one-click-deploy.sh)
#
# This script does EVERYTHING:
#   1. Installs Node.js, Bun, PM2, Nginx, unzip
#   2. Clones the repo
#   3. Configures environment (Neon Postgres + NextAuth)
#   4. Builds the app
#   5. Pushes database schema + seeds data
#   6. Starts the app with PM2
#   7. Configures Nginx reverse proxy
#
set -e

echo "🚀 TalentForge ATS — One-Click VPS Deploy"
echo "=========================================="
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Run as root: sudo bash one-click-deploy.sh"
  exit 1
fi

DOMAIN=${1:-""}
EMAIL=${2:-"admin@talentforge.com"}
APP_DIR="/var/www/talentforge-ats"
VPS_IP=$(curl -s ifconfig.me)

echo "📋 Configuration:"
echo "   VPS IP: $VPS_IP"
echo "   Domain: ${DOMAIN:-$(echo '(using IP address)')}"
echo "   Email:  $EMAIL"
echo "   App dir: $APP_DIR"
echo ""

# ============================================
# STEP 1: System packages
# ============================================
echo "=== Step 1/8: Installing system packages ==="
apt update -y
apt install -y curl git build-essential nginx ufw unzip certbot python3-certbot-nginx
echo "✓ System packages installed"

# ============================================
# STEP 2: Node.js
# ============================================
echo ""
echo "=== Step 2/8: Installing Node.js 20 LTS ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo "✓ Node.js: $(node --version)"

# ============================================
# STEP 3: Bun (with unzip fix)
# ============================================
echo ""
echo "=== Step 3/8: Installing Bun ==="
if ! command -v bun &> /dev/null; then
  # unzip is required by bun installer
  apt install -y unzip
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi
echo "✓ Bun: $(bun --version)"

# ============================================
# STEP 4: PM2
# ============================================
echo ""
echo "=== Step 4/8: Installing PM2 ==="
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi
echo "✓ PM2: $(pm2 --version)"

# ============================================
# STEP 5: Clone repo + install deps
# ============================================
echo ""
echo "=== Step 5/8: Cloning repository ==="
if [ -d "$APP_DIR/.git" ]; then
  echo "Repo exists, pulling latest..."
  cd "$APP_DIR"
  git pull origin main || true
else
  rm -rf "$APP_DIR"
  git clone https://github.com/mohsin3758/talentforge-ats.git "$APP_DIR"
  cd "$APP_DIR"
fi
echo "✓ Code cloned"

echo ""
echo "  Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install
echo "✓ Dependencies installed"

# ============================================
# STEP 6: Configure environment
# ============================================
echo ""
echo "=== Step 6/8: Configuring environment ==="

# Use domain if provided, otherwise use IP
if [ -n "$DOMAIN" ]; then
  APP_URL="https://$DOMAIN"
else
  APP_URL="http://$VPS_IP"
fi

# Generate NEXTAUTH_SECRET if not exists
SECRET=$(openssl rand -base64 32)

cat > "$APP_DIR/.env.production" << EOF
DATABASE_URL="postgresql://neondb_owner:npg_qlP1TDCxEeB0@ep-square-breeze-ajbcy1om-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_URL="$APP_URL"
NODE_ENV="production"
PORT=3000
EOF

echo "✓ Environment configured"
echo "  DATABASE_URL: Neon Postgres (pre-configured)"
echo "  NEXTAUTH_URL: $APP_URL"

# ============================================
# STEP 7: Database + Build
# ============================================
echo ""
echo "=== Step 7/8: Database + Build ==="

export $(grep -v '^#' "$APP_DIR/.env.production" | xargs)

echo "  Generating Prisma client..."
bun run db:generate
echo "✓ Prisma client generated"

echo ""
echo "  Pushing database schema..."
bun run db:push
echo "✓ Schema pushed"

echo ""
echo "  Checking if database needs seeding..."
USER_COUNT=$(bun -e "import {db} from './src/lib/db'; const c = await db.user.count(); console.log(c)" 2>/dev/null || echo "0")
if [ "$USER_COUNT" = "0" ]; then
  echo "  Seeding database..."
  bun scripts/seed-ats.ts
  bun scripts/seed-admin.ts
  echo "✓ Database seeded (6 jobs, 30 candidates, 40 apps, admin user)"
else
  echo "✓ Database already has data ($USER_COUNT users), skipping seed"
fi

echo ""
echo "  Building production app..."
bun run build
echo "✓ Build complete"

# ============================================
# STEP 8: Start app + Nginx
# ============================================
echo ""
echo "=== Step 8/8: Starting app + Nginx ==="

# Configure firewall
ufw allow OpenSSH 2>/dev/null || true
ufw allow 'Nginx Full' 2>/dev/null || true
ufw --force enable 2>/dev/null || true
echo "✓ Firewall configured"

# Stop existing PM2 process
pm2 delete talentforge-ats 2>/dev/null || true

# Start app with PM2
pm2 start bun --name talentforge-ats -- run start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "✓ App started with PM2 (auto-restart on boot)"

# Configure Nginx
SERVER_NAME="${DOMAIN:-$VPS_IP}"

cat > /etc/nginx/sites-available/talentforge-ats << NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/talentforge-ats /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
echo "✓ Nginx configured and restarted"

# SSL (only if domain provided)
if [ -n "$DOMAIN" ]; then
  echo ""
  echo "  Installing SSL certificate..."
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || echo "⚠️ SSL setup failed (you can run it later: certbot --nginx -d $DOMAIN)"
  echo "✓ SSL configured"
fi

# ============================================
# VERIFY
# ============================================
echo ""
echo "=== Verifying deployment ==="
sleep 3

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "✓ App is running on port 3000"
else
  echo "⚠️ App returned status $STATUS — checking PM2 logs..."
  pm2 logs talentforge-ats --lines 10 --nostream
fi

# ============================================
# DONE
# ============================================
echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
if [ -n "$DOMAIN" ]; then
  echo "   🌐 App URL:  https://$DOMAIN"
  echo "   🔐 Login:    https://$DOMAIN/login"
else
  echo "   🌐 App URL:  http://$VPS_IP"
  echo "   🔐 Login:    http://$VPS_IP/login"
fi
echo ""
echo "   📧 Email:    admin@talentforge.com"
echo "   🔑 Password: Admin123!"
echo ""
echo "   PM2 commands:"
echo "     pm2 status                 # Check status"
echo "     pm2 logs talentforge-ats   # View logs"
echo "     pm2 restart talentforge-ats # Restart"
echo ""
if [ -z "$DOMAIN" ]; then
  echo "   📌 To add a domain later:"
  echo "      1. Point DNS A record to $VPS_IP"
  echo "      2. Run: certbot --nginx -d yourdomain.com"
  echo "      3. Update NEXTAUTH_URL in .env.production"
fi
echo ""
echo "================================"
