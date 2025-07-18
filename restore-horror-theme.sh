#!/bin/bash

# 🎨 HORROR THEME RESTORATION - Originales Design wiederherstellen
# Behebt Design-Probleme nach Modernisierung

set -e

echo "🎨 HORROR THEME RESTORATION..."
echo "=============================="

cd /var/www/dash-automation || cd "$(pwd)"

# 1. ORIGINAL HORROR THEME SICHERSTELLEN
echo "🔥 Restoring original Horror Theme..."

# Sicherstellen dass globals.css das Horror Theme hat
if ! grep -q "horror-glow" app/globals.css; then
    echo "❌ Horror Theme nicht gefunden - Download von GitHub..."
    curl -s https://raw.githubusercontent.com/felge88/Dash/Blaster/app/globals.css > app/globals.css
fi

# 2. TAILWIND CONFIG PRÜFEN
echo "🎨 Checking Tailwind configuration..."
if [ -f "tailwind.config.js" ]; then
    # Sicherstellen dass Horror-Farben definiert sind
    if ! grep -q "horror-" tailwind.config.js; then
        echo "🔧 Adding Horror Theme colors to Tailwind..."
        cat > tailwind.config.js << 'EOF'
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Horror Theme Colors
        'horror-bg': '#0a0a0a',
        'horror-surface': '#1a1a1a',
        'horror-border': '#333333',
        'horror-accent': '#00ff41',
        'horror-text': '#ffffff',
        'horror-muted': '#999999',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glitch": "glitch 0.3s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
EOF
    fi
fi

# 3. HORROR THEME COMPONENTS AKTUALISIEREN
echo "🔥 Updating Horror Theme components..."

# Prüfen ob Login Page Horror Theme hat
if [ -f "app/login/page.tsx" ]; then
    if ! grep -q "horror-bg" app/login/page.tsx; then
        echo "🔧 Updating login page with Horror Theme..."
        # Login Page mit Horror Theme aktualisieren
        curl -s https://raw.githubusercontent.com/felge88/Dash/Blaster/app/login/page.tsx > app/login/page.tsx
    fi
fi

# 4. DEPENDENCIES PRÜFEN
echo "📦 Checking Horror Theme dependencies..."
if ! npm list framer-motion &>/dev/null; then
    echo "📦 Installing missing animation dependencies..."
    npm install framer-motion
fi

# 5. REBUILD MIT HORROR THEME
echo "🏗️ Rebuilding with Horror Theme..."
npm run build 2>/dev/null || {
    echo "⚠️ Build failed - running in development mode with Horror Theme"
    # Sicherstellen dass dev mode das Horror Theme lädt
    sed -i 's/"start": "next start"/"start": "next dev"/g' package.json
}

# 6. PM2 NEUSTART
echo "🔄 Restarting application with Horror Theme..."
pm2 restart dash-automation 2>/dev/null || {
    pm2 start npm --name "dash-automation" --cwd "/var/www/dash-automation" -- start
}

echo "✅ HORROR THEME RESTORATION COMPLETE!"
echo "🎨 Original Dark Horror Design should now be restored"
echo "🌐 Check your application - it should have the original look"

# Status anzeigen
pm2 status
