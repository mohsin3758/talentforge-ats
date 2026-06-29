#!/bin/bash
#
# TalentForge ATS — Hostinger VPS Setup Script
#
# Run this on a fresh Ubuntu 22.04/24.04 VPS as root:
#   bash scripts/setup-vps.sh
#
set -e

echo "🚀 TalentForge ATS — VPS Setup"
echo "================================"

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root: sudo bash scripts/setup-vps.sh"
  exit 1
fi

read -p "Enter your domain name (e.g., ats.yourdomain.com): " DOMAIN
read -p "Enter your email for SSL certificates: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo "❌ Domain and email are required"
  exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email:  $EMAIL"
echo ""
read -p "Continue? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "=== Step 1: System Update ==="
apt update && apt upgrade -y
apt install -y curl git build-essential nginx ufw certbot python3-certbot-nginx

echo ""
echo "=== Step 2: Install Node.js 20 LTS ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo "✓ Node.js: $(node --version)"

echo ""
echo "=== Step 3: Install Bun ==="
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
  echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
fi
echo "✓ Bun: $(bun --version)"

echo ""
echo "=== Step 4: Install PM2 ==="
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi
echo "✓ PM2: $(pm2 --version)"

echo ""
echo "=== Step 5: Configure Firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "✓ Firewall configured"

echo ""
echo "=== Step 6: Create App Directory ==="
APP_DIR="/var/www/talentforge-ats"
mkdir -p "$APP_DIR"
echo "✓ App directory: $APP_DIR"

echo ""
echo "=== Step 7: Configure Nginx ==="
cat > /etc/nginx/sites-available/talentforge-ats << NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    if (\$host = www.$DOMAIN) {
        return 301 https://$DOMAIN\$request_uri;
    }

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
systemctl reload nginx
echo "✓ Nginx configured for $DOMAIN"

echo ""
echo "=== Step 8: SSL Certificate ==="
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
echo "✓ SSL certificate installed"

echo ""
echo "=== Step 9: PM2 Startup ==="
pm2 startup systemd -u root --hp /root
pm2 save

echo ""
echo "================================"
echo "✅ VPS Setup Complete!"
echo ""
echo "Next steps:"
echo "   1. Upload your code to $APP_DIR"
echo "   2. Run: cd $APP_DIR && bash scripts/deploy-vps.sh"
echo "   3. Visit: https://$DOMAIN"
echo "================================"
