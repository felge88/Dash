#!/bin/bash

# Blaster Project Setup Validation Script
# This script validates the complete installation and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Check if script is run as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Run as the deploy user."
   exit 1
fi

log "🔍 Starting Blaster Project Setup Validation..."

# Check Node.js version
log "📦 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    info "Node.js version: $NODE_VERSION"
    
    # Check if Node.js version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        error "Node.js version must be >= 18. Current version: $NODE_VERSION"
        exit 1
    fi
    log "✅ Node.js version is valid"
else
    error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check npm version
log "📦 Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    info "npm version: $NPM_VERSION"
    log "✅ npm is available"
else
    error "npm is not installed or not in PATH"
    exit 1
fi

# Check PM2 installation
log "📦 Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    info "PM2 version: $PM2_VERSION"
    log "✅ PM2 is available"
else
    error "PM2 is not installed or not in PATH"
    exit 1
fi

# Check project directory
log "📁 Checking project directory..."
PROJECT_DIR="/home/deploy/blaster"
if [ -d "$PROJECT_DIR" ]; then
    info "Project directory exists: $PROJECT_DIR"
    cd "$PROJECT_DIR"
    log "✅ Project directory is accessible"
else
    error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Check package.json
log "📄 Checking package.json..."
if [ -f "package.json" ]; then
    info "package.json exists"
    
    # Check if dependencies are installed
    if [ -d "node_modules" ]; then
        info "node_modules directory exists"
        log "✅ Dependencies appear to be installed"
    else
        warn "node_modules directory not found. Dependencies may need to be installed."
    fi
else
    error "package.json not found in project directory"
    exit 1
fi

# Check database file
log "🗄️ Checking database file..."
if [ -f "database.sqlite" ]; then
    info "Database file exists: database.sqlite"
    
    # Check database file size
    DB_SIZE=$(stat -c%s "database.sqlite")
    if [ "$DB_SIZE" -gt 0 ]; then
        info "Database file size: $DB_SIZE bytes"
        log "✅ Database file is not empty"
    else
        warn "Database file is empty. May need initialization."
    fi
else
    warn "Database file not found. May need initialization."
fi

# Check Next.js build
log "🏗️ Checking Next.js build..."
if [ -d ".next" ]; then
    info ".next directory exists"
    
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID)
        info "Build ID: $BUILD_ID"
        log "✅ Next.js build appears complete"
    else
        warn ".next/BUILD_ID not found. Build may be incomplete."
    fi
else
    warn ".next directory not found. Project may need to be built."
fi

# Check ecosystem.config.js
log "⚙️ Checking PM2 ecosystem configuration..."
if [ -f "ecosystem.config.js" ]; then
    info "ecosystem.config.js exists"
    
    # Check if log directory exists
    LOG_DIR="/var/log/pm2"
    if [ -d "$LOG_DIR" ]; then
        info "PM2 log directory exists: $LOG_DIR"
        
        # Check permissions
        if [ -w "$LOG_DIR" ]; then
            info "PM2 log directory is writable"
            log "✅ PM2 logging is configured correctly"
        else
            warn "PM2 log directory is not writable. May cause logging issues."
        fi
    else
        warn "PM2 log directory not found: $LOG_DIR"
    fi
else
    error "ecosystem.config.js not found"
    exit 1
fi

# Check Nginx configuration
log "🌐 Checking Nginx configuration..."
if systemctl is-active --quiet nginx; then
    info "Nginx is running"
    
    # Check if Nginx configuration exists
    NGINX_CONFIG="/etc/nginx/sites-available/blaster"
    if [ -f "$NGINX_CONFIG" ]; then
        info "Nginx configuration exists: $NGINX_CONFIG"
        
        # Check if site is enabled
        if [ -L "/etc/nginx/sites-enabled/blaster" ]; then
            info "Nginx site is enabled"
            log "✅ Nginx configuration is complete"
        else
            warn "Nginx site is not enabled"
        fi
    else
        warn "Nginx configuration not found: $NGINX_CONFIG"
    fi
else
    error "Nginx is not running"
    exit 1
fi

# Check SSL certificates (if applicable)
log "🔐 Checking SSL certificates..."
SSL_CERT="/etc/letsencrypt/live/*/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/*/privkey.pem"
if ls $SSL_CERT 1> /dev/null 2>&1 && ls $SSL_KEY 1> /dev/null 2>&1; then
    info "SSL certificates found"
    log "✅ SSL certificates are available"
else
    warn "SSL certificates not found. HTTPS may not be configured."
fi

# Check firewall status
log "🛡️ Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status | grep -c "Status: active" || echo "0")
    if [ "$UFW_STATUS" -eq 1 ]; then
        info "UFW firewall is active"
        
        # Check if required ports are open
        if ufw status | grep -q "22/tcp"; then
            info "SSH port (22) is open"
        fi
        if ufw status | grep -q "80/tcp"; then
            info "HTTP port (80) is open"
        fi
        if ufw status | grep -q "443/tcp"; then
            info "HTTPS port (443) is open"
        fi
        
        log "✅ Firewall is configured"
    else
        warn "UFW firewall is not active"
    fi
else
    warn "UFW firewall not found"
fi

# Check disk space
log "💾 Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    info "Disk usage: ${DISK_USAGE}%"
    log "✅ Sufficient disk space available"
else
    warn "Disk usage is high: ${DISK_USAGE}%"
fi

# Check system resources
log "🖥️ Checking system resources..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
info "Memory usage: ${MEMORY_USAGE}%"

LOAD_AVERAGE=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
info "Load average: $LOAD_AVERAGE"

# Test Next.js application
log "🧪 Testing Next.js application..."
if [ -f "package.json" ]; then
    # Check if we can run the build command
    if npm run build --dry-run &> /dev/null; then
        info "Build command is available"
        log "✅ Next.js application can be built"
    else
        warn "Build command may have issues"
    fi
else
    error "Cannot test Next.js application without package.json"
fi

# Final validation summary
log "📊 Validation Summary:"
echo ""
echo -e "${GREEN}✅ Core Requirements:${NC}"
echo "  - Node.js >= 18: ✅"
echo "  - npm: ✅"
echo "  - PM2: ✅"
echo "  - Project directory: ✅"
echo "  - Nginx: ✅"
echo ""

echo -e "${YELLOW}⚠️  Optional Components:${NC}"
echo "  - SSL certificates: $([ -f "$SSL_CERT" ] && echo "✅" || echo "❌")"
echo "  - Database initialized: $([ -f "database.sqlite" ] && [ -s "database.sqlite" ] && echo "✅" || echo "❌")"
echo "  - Next.js build: $([ -d ".next" ] && echo "✅" || echo "❌")"
echo ""

log "🎉 Validation completed successfully!"
log "📋 Next steps:"
echo "  1. If database is not initialized, run: npm run db:init"
echo "  2. If project is not built, run: npm run build"
echo "  3. To start the application, run: pm2 start ecosystem.config.js"
echo "  4. To check application status, run: pm2 status"
echo "  5. To view logs, run: pm2 logs"
echo ""
log "🚀 Your Blaster project setup is ready!"
