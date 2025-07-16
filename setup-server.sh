#!/bin/bash

# ===========================================
# 🚀 AUTOMATION DASHBOARD - Quick Setup Script
# ===========================================
# Für Ubuntu 22.04 Server: 194.164.62.92
# ===========================================

set -e  # Exit on any error

echo "🚀 Starting Automation Dashboard Setup..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ===========================================
# SCHRITT 1: System Updates
# ===========================================
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release htop

# ===========================================
# SCHRITT 2: Firewall Setup
# ===========================================
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

print_success "Firewall configured"

# ===========================================
# SCHRITT 3: Docker Installation
# ===========================================
print_status "Installing Docker..."

# Remove old Docker versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

print_success "Docker installed successfully"

# ===========================================
# SCHRITT 4: Node.js Installation (Backup)
# ===========================================
print_status "Installing Node.js..."

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install global packages
sudo npm install -g pnpm pm2

print_success "Node.js installed successfully"

# ===========================================
# SCHRITT 5: Project Directory Setup
# ===========================================
print_status "Setting up project directory..."

PROJECT_DIR="/opt/automation-dashboard"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

print_success "Project directory created: $PROJECT_DIR"

# ===========================================
# SCHRITT 6: Nginx Installation
# ===========================================
print_status "Installing Nginx..."

sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/automation-dashboard > /dev/null << EOF
server {
    listen 80;
    server_name 194.164.62.92;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Security headers
        proxy_set_header X-Frame-Options DENY;
        proxy_set_header X-Content-Type-Options nosniff;
        proxy_set_header X-XSS-Protection "1; mode=block";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/automation-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

print_success "Nginx configured successfully"

# ===========================================
# SCHRITT 7: System Information
# ===========================================
echo ""
echo "======================================"
print_success "Setup completed successfully!"
echo "======================================"

print_status "System Information:"
echo "  - Docker Version: $(docker --version)"
echo "  - Docker Compose Version: $(docker-compose --version)"
echo "  - Node.js Version: $(node --version)"
echo "  - NPM Version: $(npm --version)"
echo "  - Nginx Status: $(sudo systemctl is-active nginx)"

echo ""
print_warning "IMPORTANT NEXT STEPS:"
echo "1. Navigate to project directory: cd $PROJECT_DIR"
echo "2. Clone your project or upload files"
echo "3. Copy and configure .env file"
echo "4. Run: docker-compose up -d"
echo "5. Access dashboard: http://194.164.62.92"

echo ""
print_warning "SECURITY NOTES:"
echo "1. Change default passwords immediately"
echo "2. Update JWT_SECRET in .env file"
echo "3. Configure SSL certificate for HTTPS"
echo "4. Review firewall rules"

echo ""
print_status "Manual project deployment commands:"
echo "cd $PROJECT_DIR"
echo "git clone https://github.com/felge88/Dash.git ."
echo "cp .env.example .env"
echo "nano .env  # Edit configuration"
echo "docker-compose up -d"

echo ""
print_success "🎉 Server is ready for deployment!"
echo "Access your dashboard at: http://194.164.62.92"

# ===========================================
# SCHRITT 8: Post-Installation Commands
# ===========================================
echo ""
print_success "🎉 System setup completed!"

# Create project deployment script
cat > /tmp/deploy-dashboard.sh << 'DEPLOY_EOF'
#!/bin/bash
echo "🚀 Deploying Automation Dashboard..."

# Navigate to project directory
cd /opt/automation-dashboard

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/felge88/Dash.git .
git checkout Blaster

# Setup environment
echo "⚙️ Configuring environment..."
cp .env.example .env

# Create necessary directories
mkdir -p data uploads logs uploads/{profiles,instagram,youtube}

echo "✅ Project files ready!"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Edit .env file: nano .env"
echo "2. Change JWT_SECRET to a secure value"
echo "3. Start application: docker-compose up -d"
echo "4. Check status: docker-compose ps"
echo "5. Access dashboard: http://194.164.62.92:3000"
echo ""
echo "📝 Login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  CHANGE IMMEDIATELY AFTER LOGIN!"
DEPLOY_EOF

chmod +x /tmp/deploy-dashboard.sh

echo ""
print_warning "NEXT STEPS AFTER REBOOT:"
echo "1. Run: sudo /tmp/deploy-dashboard.sh"
echo "2. Edit .env: nano /opt/automation-dashboard/.env"
echo "3. Start: cd /opt/automation-dashboard && docker-compose up -d"
echo ""
print_warning "Or run the complete deployment now with:"
echo "sudo /tmp/deploy-dashboard.sh"

echo ""
read -p "🔄 Reboot now to apply Docker changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Rebooting system..."
    sudo reboot
else
    print_warning "Run 'newgrp docker' or logout/login to use Docker without sudo"
    print_status "You can now run: sudo /tmp/deploy-dashboard.sh"
fi
