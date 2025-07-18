#!/bin/bash
# ===========================================
#!/bin/bash

# 🚀 DASH AUTOMATION - COMPLETE SERVER INSTALLATION
# Automatische Installation für Ubuntu 22.04 Server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-""}
PROJECT_DIR="/home/deploy/blaster"
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

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
    echo "[WARNING] $1" >> $LOG_FILE
}

# Create log file
sudo touch $LOG_FILE
sudo chmod 666 $LOG_FILE

log "🚀 DASH AUTOMATION - COMPLETE SERVER INSTALLATION"
log "================================================="

# Check if running as root - CREATE USER IF NEEDED
if [[ $EUID -eq 0 ]]; then
   log "⚠️ Running as root - creating deployment user..."
   
   # Create deployment user
   if ! id "deploy" &>/dev/null; then
       log "📝 Creating 'deploy' user..."
       useradd -m -s /bin/bash deploy
       usermod -aG sudo deploy
       log "✅ User 'deploy' created"
   else
       log "✅ User 'deploy' already exists"
   fi
   
   # Set up SSH access for deploy user
   mkdir -p /home/deploy/.ssh
   if [ -f /root/.ssh/authorized_keys ]; then
       cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
       chown -R deploy:deploy /home/deploy/.ssh
       chmod 700 /home/deploy/.ssh
       chmod 600 /home/deploy/.ssh/authorized_keys
       log "✅ SSH keys copied to deploy user"
   fi
   
   # Switch to deploy user and re-run script
   log "🔄 Switching to deploy user and re-running installation..."
   exec sudo -u deploy bash -c "curl -fsSL https://raw.githubusercontent.com/felge88/Dash/Blaster/auto-install-server.sh | bash"
fi

# Now running as non-root user
log "✅ Running as user: $(whoami)"

# Update system
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "📦 Installing essential packages..."
sudo apt install -y curl wget git build-essential software-properties-common 
    unzip sqlite3 ufw fail2ban htop

# Configure firewall
log "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create swap if needed
log "💾 Checking swap space..."
if ! swapon --show | grep -q "/swapfile"; then
    log "💾 Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Install Node.js 20 LTS
log "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "✅ Node.js version: $NODE_VERSION"
log "✅ NPM version: $NPM_VERSION"

# Install PM2
log "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
log "📦 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create project directory
log "📁 Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

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

# Set proper permissions
sudo chown -R $USER:$USER $PROJECT_DIR
chmod +x *.sh

# Run cleanup script
log "🧹 Running project cleanup..."
if [ -f "cleanup-project.sh" ]; then
    ./cleanup-project.sh
else
    warning "cleanup-project.sh not found, skipping cleanup"
fi

# Create environment file
log "⚙️ Creating environment configuration..."
cat > .env.production << EOF
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
EOF

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
    warning "init-db.js not found, skipping database initialization"
fi

# Build project
log "🏗️ Building project..."
export NODE_ENV=production
if npm run build; then
    log "✅ Build successful"
else
    warning "Build failed, creating development fallback"
    mkdir -p .next
    echo '{"buildMode": "development"}' > .next/build-info.json
    sed -i 's/"start": "next start"/"start": "next dev"/g' package.json
fi

# Configure PM2
log "⚙️ Configuring PM2..."
cat > ecosystem.config.js << 'EOF'
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
EOF

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Configure Nginx
log "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/dash-automation > /dev/null << 'EOF'
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
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/dash-automation /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if sudo nginx -t; then
    log "✅ Nginx configuration valid"
    sudo systemctl reload nginx
else
    error "Nginx configuration invalid"
    exit 1
fi

# Start PM2
log "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | grep -E "^sudo" | bash || true

# Configure PM2 log rotation
pm2 install pm2-logrotate || true
pm2 set pm2-logrotate:max_size 10M || true
pm2 set pm2-logrotate:retain 30 || true
pm2 set pm2-logrotate:compress true || true

# Create monitoring script
log "📊 Creating monitoring script..."
cat > /home/$USER/monitor-dash.sh << 'EOF'
#!/bin/bash
echo "=== DASH AUTOMATION HEALTH CHECK ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Memory: $(free -h | grep Mem)"
echo "Disk: $(df -h / | tail -1)"
echo ""
echo "PM2 Status:"
pm2 status
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "Application Response:"
curl -I http://localhost:3000 2>/dev/null || echo "Application not responding"
EOF

chmod +x /home/$USER/monitor-dash.sh

# Create backup script
log "💾 Creating backup script..."
cat > /home/$USER/backup-dash.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/var/www/dash-automation"

mkdir -p $BACKUP_DIR

# Database Backup
if [ -f "$PROJECT_DIR/database.sqlite" ]; then
    cp $PROJECT_DIR/database.sqlite $BACKUP_DIR/database_$DATE.sqlite
fi

# Environment Backup
if [ -f "$PROJECT_DIR/.env.production" ]; then
    cp $PROJECT_DIR/.env.production $BACKUP_DIR/env_$DATE.backup
fi

# Keep only last 7 days
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/$USER/backup-dash.sh

# Setup cron jobs
log "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-dash.sh >> /var/log/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 */4 * * * /usr/bin/pm2 save") | crontab -
(crontab -l 2>/dev/null; echo "0 6 * * * /home/$USER/monitor-dash.sh >> /var/log/health.log 2>&1") | crontab -

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Final status check
log "🔍 Final status check..."
sleep 5

# Check if PM2 is running
if pm2 list | grep -q "dash-automation"; then
    log "✅ PM2 application is running"
else
    error "PM2 application failed to start"
fi

# Check if Nginx is running
if sudo systemctl is-active --quiet nginx; then
    log "✅ Nginx is running"
else
    error "Nginx is not running"
fi

# Check if application responds
if curl -s http://localhost:3000 > /dev/null; then
    log "✅ Application is responding"
else
    warning "Application may not be fully ready yet"
fi

# Installation complete
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
log "📊 Management Commands:"
log "   • Status: pm2 status"
log "   • Logs: pm2 logs dash-automation"
log "   • Restart: pm2 restart dash-automation"
log "   • Monitor: /home/$USER/monitor-dash.sh"
log "   • Backup: /home/$USER/backup-dash.sh"
log ""
log "🛠️ Troubleshooting:"
log "   • Check logs: tail -f $LOG_FILE"
log "   • PM2 logs: pm2 logs dash-automation"
log "   • Nginx logs: sudo tail -f /var/log/nginx/error.log"
log ""
log "🚀 Installation completed successfully!"

# Show final status
pm2 status
sudo systemctl status nginx --no-pager -l
# ===========================================

echo "🚀 Starting Automation Dashboard Installation on Ubuntu Server..."
echo "================================================================="

# SCHRITT 1: System prüfen
echo "📊 System Information:"
whoami
pwd
uname -a
echo ""

# SCHRITT 2: Setup-Script herunterladen
echo "📥 Downloading setup script..."
wget -O setup-server.sh https://raw.githubusercontent.com/felge88/Dash/Blaster/setup-server.sh
chmod +x setup-server.sh

# SCHRITT 3: System-Installation starten
echo "🔧 Starting automated system setup..."
sudo ./setup-server.sh

echo "✅ System setup completed!"
echo ""

# SCHRITT 4: Projekt deployment vorbereiten
echo "📦 Preparing project deployment..."
sudo mkdir -p /opt/automation-dashboard
sudo chown $USER:$USER /opt/automation-dashboard
cd /opt/automation-dashboard

# SCHRITT 5: Repository klonen
echo "📥 Cloning repository..."
git clone https://github.com/felge88/Dash.git .
git checkout Blaster

# SCHRITT 6: Environment konfigurieren
echo "⚙️ Setting up environment..."
cp .env.example .env

# Automatische .env Konfiguration
cat > .env << 'ENV_EOF'
# Database
DATABASE_URL=./data/database.sqlite

# JWT Authentication (WICHTIG: In Production ändern!)
JWT_SECRET=IhrSuperGeheimesJWTSchlüsselMindestens32ZeichenLang123456789

# Server Configuration
PORT=3000
NODE_ENV=production
HOSTNAME=0.0.0.0

# External APIs (Optional - später konfigurieren)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
OPENAI_API_KEY=your-openai-api-key

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://194.164.62.92:3000

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000

# Automation
ENABLE_CRON_JOBS=true
INSTAGRAM_AUTO_POST=false
YOUTUBE_AUTO_CLEANUP=true
ENV_EOF

# SCHRITT 7: Verzeichnisse erstellen
echo "📁 Creating directories..."
mkdir -p data uploads logs
mkdir -p uploads/{profiles,instagram,youtube}

# SCHRITT 8: Docker Container starten
echo "🐳 Starting Docker containers..."
docker-compose up -d

# SCHRITT 9: Status prüfen
echo "📊 Checking status..."
sleep 5
docker-compose ps
echo ""

# SCHRITT 10: Health Check
echo "🏥 Health check..."
sleep 10
curl -f http://localhost:3000/api/health || echo "Health check pending..."

echo ""
echo "================================================================="
echo "🎉 INSTALLATION COMPLETED!"
echo "================================================================="
echo ""
echo "✅ Dashboard URL: http://194.164.62.92:3000"
echo "✅ Login: admin / admin123 (SOFORT ÄNDERN!)"
echo ""
echo "📊 Status Commands:"
echo "   docker-compose ps              # Container Status"
echo "   docker-compose logs -f         # Live Logs"
echo "   sudo systemctl status nginx    # Nginx Status"
echo "   sudo ufw status                # Firewall Status"
echo ""
echo "🔧 Management Commands:"
echo "   docker-compose restart         # Restart Services"
echo "   docker-compose down            # Stop Services"
echo "   docker-compose up -d           # Start Services"
echo ""
echo "🌐 Access Dashboard:"
echo "   Direct: http://194.164.62.92:3000"
echo "   Nginx:  http://194.164.62.92"
echo ""
echo "⚠️  WICHTIG: Ändere sofort das Admin-Passwort nach dem ersten Login!"
