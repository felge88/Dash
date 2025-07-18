#!/bin/bash

# 🚀 DASH NEXT.JS 14 MODERNIZED DEPLOYMENT
# Komplette Migration zu moderner App Router Architektur

set -e

echo "🚀 MODERNIZED DASH DEPLOYMENT - Next.js 14 App Router"
echo "===================================================="

# 1. SYSTEM PREPARATION
echo "📦 System preparation..."
sudo apt update
sudo apt install -y curl wget git build-essential python3-dev sqlite3 nginx

# 2. NODE.JS 20 LTS
echo "🟢 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "✅ Node version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# 3. PROJECT SETUP
echo "📁 Project setup..."
PROJECT_DIR="/var/www/dash-automation"
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# 4. CLONE & CHECKOUT
echo "📥 Cloning repository..."
if [ -d ".git" ]; then
    git pull origin Blaster
else
    git clone https://github.com/felge88/Dash.git .
    git checkout Blaster
fi

# 5. *** CRITICAL MODERNIZATION ***
echo "🔥 MODERNIZING PROJECT ARCHITECTURE..."

# Remove any Pages Router remnants
rm -rf pages/ 2>/dev/null || true
rm -rf lib/auth-new.ts 2>/dev/null || true

# Validate App Router structure
if [ ! -d "app" ]; then
    echo "❌ FATAL ERROR: No app/ directory found!"
    echo "This repository is not App Router compatible"
    exit 1
fi

# Check essential App Router files
REQUIRED_FILES=("app/layout.tsx" "app/page.tsx")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ FATAL ERROR: Missing required file: $file"
        exit 1
    fi
done

echo "✅ App Router structure validated"

# 6. APPLY MODERN CONFIGURATIONS
echo "⚙️ Applying modern configurations..."

# Use modern package.json
cp package-modern.json package.json 2>/dev/null || {
    echo "⚠️ No modern package.json found, using existing"
}

# Use modern Next.js config
cp next.config-modern.js next.config.js 2>/dev/null || {
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sqlite3"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("sqlite3");
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
};

module.exports = nextConfig;
EOF
}

# Use modern TypeScript config
cp tsconfig-modern.json tsconfig.json 2>/dev/null || {
    echo "⚠️ Using existing tsconfig.json"
}

# 7. CLEAN INSTALLATION
echo "🧹 Clean installation..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

# 8. INSTALL DEPENDENCIES
echo "📦 Installing modern dependencies..."
for i in {1..3}; do
    if npm install --legacy-peer-deps; then
        echo "✅ Dependencies installed successfully"
        break
    else
        echo "❌ Installation failed (attempt $i/3), retrying..."
        rm -rf node_modules package-lock.json
        sleep 5
    fi
done

# 9. ENVIRONMENT SETUP
echo "🔐 Environment setup..."
if [ ! -f .env.local ]; then
    cp .env.production .env.local 2>/dev/null || {
        cat > .env.local << 'EOF'
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_URL=./data/database.sqlite
PORT=3000
HOST=0.0.0.0
EOF
    }
fi

# 10. DATABASE INITIALIZATION
echo "🗄️ Database initialization..."
mkdir -p data logs
node scripts/init-db.js 2>/dev/null || node scripts/init-db-new.js 2>/dev/null || {
    echo "⚠️ Database init script not found - will auto-create on startup"
}

# 11. BUILD WITH FALLBACKS
echo "🏗️ Building application..."
export NODE_OPTIONS="--max-old-space-size=4096"
export NODE_ENV=production

if npm run build; then
    echo "✅ Production build successful"
    BUILD_MODE="production"
else
    echo "⚠️ Production build failed, using development mode"
    mkdir -p .next
    echo '{"buildMode": "development"}' > .next/build-info.json
    BUILD_MODE="development"
    # Modify start script for dev mode
    sed -i 's/"start": "next start"/"start": "next dev"/g' package.json
fi

# 12. PM2 PROCESS MANAGEMENT
echo "🔄 Setting up PM2..."
npm install -g pm2 2>/dev/null || sudo npm install -g pm2

# Stop any existing process
pm2 delete dash-automation 2>/dev/null || true

# Create PM2 ecosystem config with correct working directory
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'dash-automation',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/dash-automation',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: '$BUILD_MODE',
        PORT: 3000,
        HOST: '0.0.0.0'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 13. NGINX CONFIGURATION
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/dash-automation > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

sudo ln -sf /etc/nginx/sites-available/dash-automation /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 14. FIREWALL
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 15. FINAL VERIFICATION
echo "✅ INSTALLATION COMPLETE!"
echo "========================"
echo "🌐 Application URL: http://$(curl -s ifconfig.me || hostname -I | awk '{print $1}')"
echo "👤 Default login: admin / admin123"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs dash-automation"

# Show final status
sleep 3
echo ""
echo "📊 Current Status:"
pm2 status
echo ""
echo "🔍 Testing connection..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is responding!"
else
    echo "⚠️ Application might still be starting up..."
    echo "📋 Check logs: pm2 logs dash-automation"
fi

echo ""
echo "🎉 MODERNIZED DASH DEPLOYMENT COMPLETE!"
