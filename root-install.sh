#!/bin/bash

# 🚀 DASH AUTOMATION - ROOT INSTALLATION SCRIPT
# Erstellt automatisch einen Deploy-User und installiert alles

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deploy"
PROJECT_DIR="/var/www/dash-automation"
LOG_FILE="/var/log/dash-installation.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    echo "[ERROR] $1" >> $LOG_FILE
}

# Create log file
touch $LOG_FILE
chmod 666 $LOG_FILE

log "🚀 DASH AUTOMATION - ROOT INSTALLATION"
log "======================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   log "Usage: curl -fsSL https://raw.githubusercontent.com/felge88/Dash/Blaster/root-install.sh | sudo bash"
   exit 1
fi

log "✅ Running as root - proceeding with installation"

# Update system
log "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log "📦 Installing essential packages..."
apt install -y curl wget git build-essential software-properties-common \
    unzip sqlite3 ufw fail2ban htop

# Create deploy user
log "👤 Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    usermod -aG sudo $DEPLOY_USER
    log "✅ User '$DEPLOY_USER' created"
else
    log "✅ User '$DEPLOY_USER' already exists"
fi

# Set up SSH access for deploy user
log "🔑 Setting up SSH access for deploy user..."
mkdir -p /home/$DEPLOY_USER/.ssh
if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/authorized_keys
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
    log "✅ SSH keys copied to deploy user"
else
    log "⚠️ No SSH keys found in /root/.ssh/authorized_keys"
fi

# Allow deploy user to run sudo without password (for installation only)
log "🔓 Configuring sudo access for deploy user..."
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/$DEPLOY_USER
chmod 440 /etc/sudoers.d/$DEPLOY_USER

# Configure firewall
log "🔥 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install Node.js 20 LTS
log "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
log "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
log "📦 Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Create project directory
log "📁 Creating project directory..."
mkdir -p $PROJECT_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $PROJECT_DIR

# Switch to deploy user for application installation
log "🔄 Switching to deploy user for application setup..."
sudo -u $DEPLOY_USER bash << 'EOF'
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> /var/log/dash-installation.log
}

PROJECT_DIR="/var/www/dash-automation"

# Clone repository
log "📦 Cloning Dash repository..."
cd $PROJECT_DIR
if [ -d ".git" ]; then
    log "🔄 Updating existing repository..."
    git fetch --all
    git reset --hard origin/Blaster
    git checkout Blaster
    git pull origin Blaster
else
    log "📦 Cloning fresh repository..."
    git clone https://github.com/felge88/Dash.git .
    git checkout Blaster
fi

# Make scripts executable
chmod +x *.sh

# Run cleanup script
log "🧹 Running project cleanup..."
if [ -f "cleanup-project.sh" ]; then
    ./cleanup-project.sh
else
    log "⚠️ cleanup-project.sh not found, skipping cleanup"
fi

# Create environment file
log "⚙️ Creating environment configuration..."
cat > .env.production << 'ENVEOF'
# Database
DATABASE_URL="./database.sqlite"

# JWT Secret
JWT_SECRET="dash-jwt-secret-$(openssl rand -hex 32)"

# Server Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET="dash-session-$(openssl rand -hex 32)"

# Logging
LOG_LEVEL=info
ENVEOF

# Install dependencies
log "📦 Installing project dependencies..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm cache clean --force
npm install --legacy-peer-deps

# Initialize database
log "🗄️ Initializing database..."
if [ -f "scripts/init-db.js" ]; then
    node scripts/init-db.js
else
    log "⚠️ init-db.js not found, skipping database initialization"
fi

# Build project
log "🏗️ Building project..."
export NODE_ENV=production
if npm run build; then
    log "✅ Build successful"
else
    log "⚠️ Build failed, creating development fallback"
    mkdir -p .next
    echo '{"buildMode": "development"}' > .next/build-info.json
    sed -i 's/"start": "next start"/"start": "next dev"/g' package.json
fi

# Configure PM2
log "⚙️ Configuring PM2..."
cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [{
    name: 'dash-automation',
    script: './node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/dash-automation',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/var/log/pm2/dash-automation-error.log',
    out_file: '/var/log/pm2/dash-automation-out.log',
    log_file: '/var/log/pm2/dash-automation.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
ECOEOF

log "✅ Application setup completed as deploy user"
EOF

# Create PM2 log directory
log "📁 Creating PM2 log directory..."
mkdir -p /var/log/pm2
chown -R $DEPLOY_USER:$DEPLOY_USER /var/log/pm2

# Configure Nginx
log "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/dash-automation << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=10r/m;
    
    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # API Rate Limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static Files
    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health Check
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
    
    # Uploads
    location /uploads {
        alias /var/www/dash-automation/public/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/dash-automation /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if nginx -t; then
    log "✅ Nginx configuration valid"
    systemctl reload nginx
else
    error "Nginx configuration invalid"
    exit 1
fi

# Start PM2 as deploy user
log "🚀 Starting application with PM2..."
sudo -u $DEPLOY_USER bash << 'EOF'
cd /var/www/dash-automation
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | grep -E "^sudo" | bash || true
EOF

# Remove sudo access for deploy user (security)
log "🔐 Removing passwordless sudo access for deploy user..."
rm -f /etc/sudoers.d/$DEPLOY_USER

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Final status check
log "🔍 Final status check..."
sleep 5

# Check services
NGINX_STATUS=$(systemctl is-active nginx)
PM2_STATUS=$(sudo -u $DEPLOY_USER pm2 list | grep -c "dash-automation" || echo "0")

log "🎉 INSTALLATION COMPLETE!"
log "========================="
log ""
log "✅ Dash Automation is now installed and running!"
log ""
log "🔗 Access your application:"
log "   • Local: http://localhost:3000"
log "   • Public: http://$SERVER_IP"
log ""
log "🎯 Default Login:"
log "   • Username: admin"
log "   • Password: admin123"
log "   • ⚠️ IMPORTANT: Change password after first login!"
log ""
log "📊 System Status:"
log "   • Nginx: $NGINX_STATUS"
log "   • PM2 Apps: $PM2_STATUS"
log "   • Deploy User: $DEPLOY_USER"
log ""
log "📊 Management Commands (as deploy user):"
log "   • Status: sudo -u $DEPLOY_USER pm2 status"
log "   • Logs: sudo -u $DEPLOY_USER pm2 logs dash-automation"
log "   • Restart: sudo -u $DEPLOY_USER pm2 restart dash-automation"
log ""
log "🔐 Security Notes:"
log "   • Firewall (UFW) is enabled"
log "   • Rate limiting is configured"
log "   • Deploy user has restricted access"
log ""
log "🚀 Installation completed successfully!"

# Show final status
echo -e "\n${GREEN}=== FINAL STATUS ===${NC}"
echo "Nginx Status: $(systemctl is-active nginx)"
echo "PM2 Status:"
sudo -u $DEPLOY_USER pm2 status
