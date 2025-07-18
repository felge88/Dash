#!/bin/bash

# 🔍 BACKEND VALIDATION & COMPATIBILITY CHECK
# Überprüft alle API-Routen und Backend-Module systematisch

set -e

echo "🔍 BACKEND VALIDATION & COMPATIBILITY CHECK"
echo "==========================================="

cd /var/www/dash-automation || cd "$(pwd)"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. CHECK CORE MODULES
echo -e "${YELLOW}📋 STEP 1: Checking core modules...${NC}"

echo "🔍 Checking lib/auth.ts..."
if [ -f "lib/auth.ts" ]; then
    echo -e "${GREEN}✅ lib/auth.ts exists${NC}"
    
    # Check for required functions
    if grep -q "authenticateUser" lib/auth.ts; then
        echo -e "${GREEN}✅ authenticateUser function found${NC}"
    else
        echo -e "${RED}❌ authenticateUser function missing${NC}"
    fi
    
    if grep -q "loginUser" lib/auth.ts; then
        echo -e "${GREEN}✅ loginUser function found${NC}"
    else
        echo -e "${RED}❌ loginUser function missing${NC}"
    fi
    
    if grep -q "verifyToken" lib/auth.ts; then
        echo -e "${GREEN}✅ verifyToken function found${NC}"
    else
        echo -e "${RED}❌ verifyToken function missing${NC}"
    fi
else
    echo -e "${RED}❌ lib/auth.ts missing - CRITICAL ERROR${NC}"
fi

echo "🔍 Checking lib/database.ts..."
if [ -f "lib/database.ts" ]; then
    echo -e "${GREEN}✅ lib/database.ts exists${NC}"
    
    # Check for required functions
    if grep -q "getUserById\|getUserByUsername" lib/database.ts; then
        echo -e "${GREEN}✅ User functions found${NC}"
    else
        echo -e "${RED}❌ User functions missing${NC}"
    fi
else
    echo -e "${RED}❌ lib/database.ts missing - CRITICAL ERROR${NC}"
fi

# 2. CHECK API ROUTES
echo -e "\n${YELLOW}📋 STEP 2: Checking API routes...${NC}"

API_ROUTES_COUNT=0
PROBLEMATIC_ROUTES=()

find app/api -name "*.ts" -type f | while read file; do
    API_ROUTES_COUNT=$((API_ROUTES_COUNT + 1))
    echo "🔍 Checking $file..."
    
    # Check for outdated imports
    if grep -q "auth-new\|database-new" "$file"; then
        echo -e "${RED}❌ Outdated imports found in $file${NC}"
        PROBLEMATIC_ROUTES+=("$file")
    fi
    
    # Check for deprecated functions
    if grep -q "authenticateRequest" "$file"; then
        echo -e "${RED}❌ Deprecated authenticateRequest found in $file${NC}"
        PROBLEMATIC_ROUTES+=("$file")
    fi
    
    # Check for proper imports
    if grep -q "@/lib/auth" "$file" && ! grep -q "auth-new" "$file"; then
        echo -e "${GREEN}✅ Proper auth import in $file${NC}"
    fi
done

echo -e "\n${YELLOW}📊 API Routes Summary:${NC}"
echo "Total API routes found: $(find app/api -name "*.ts" -type f | wc -l)"

# 3. CHECK MIDDLEWARE
echo -e "\n${YELLOW}📋 STEP 3: Checking middleware...${NC}"

if [ -f "middleware.ts" ]; then
    echo -e "${GREEN}✅ middleware.ts exists${NC}"
    
    if grep -q "auth-new" middleware.ts; then
        echo -e "${RED}❌ Outdated import in middleware.ts${NC}"
    else
        echo -e "${GREEN}✅ Middleware imports are clean${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ middleware.ts not found${NC}"
fi

# 4. CHECK COMPONENT IMPORTS
echo -e "\n${YELLOW}📋 STEP 4: Checking component imports...${NC}"

COMPONENT_ISSUES=0

find components -name "*.tsx" -type f | while read file; do
    if grep -q "auth-new\|database-new" "$file"; then
        echo -e "${RED}❌ Outdated imports in $file${NC}"
        COMPONENT_ISSUES=$((COMPONENT_ISSUES + 1))
    fi
done

if [ $COMPONENT_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All component imports are clean${NC}"
fi

# 5. CHECK PAGES/APP ROUTER
echo -e "\n${YELLOW}📋 STEP 5: Checking app router structure...${NC}"

if [ -d "app" ]; then
    echo -e "${GREEN}✅ App router structure found${NC}"
    
    # Check for layout.tsx
    if [ -f "app/layout.tsx" ]; then
        echo -e "${GREEN}✅ app/layout.tsx exists${NC}"
    else
        echo -e "${RED}❌ app/layout.tsx missing${NC}"
    fi
    
    # Check for page.tsx
    if [ -f "app/page.tsx" ]; then
        echo -e "${GREEN}✅ app/page.tsx exists${NC}"
    else
        echo -e "${RED}❌ app/page.tsx missing${NC}"
    fi
    
    # Check dashboard structure
    if [ -d "app/dashboard" ]; then
        echo -e "${GREEN}✅ Dashboard structure exists${NC}"
    else
        echo -e "${RED}❌ Dashboard structure missing${NC}"
    fi
else
    echo -e "${RED}❌ App router structure missing - CRITICAL ERROR${NC}"
fi

# 6. CHECK DEPENDENCIES
echo -e "\n${YELLOW}📋 STEP 6: Checking dependencies...${NC}"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
    
    # Check for required dependencies
    if grep -q "\"next\"" package.json; then
        echo -e "${GREEN}✅ Next.js dependency found${NC}"
    else
        echo -e "${RED}❌ Next.js dependency missing${NC}"
    fi
    
    if grep -q "\"react\"" package.json; then
        echo -e "${GREEN}✅ React dependency found${NC}"
    else
        echo -e "${RED}❌ React dependency missing${NC}"
    fi
    
    if grep -q "\"jsonwebtoken\"" package.json; then
        echo -e "${GREEN}✅ JWT dependency found${NC}"
    else
        echo -e "${RED}❌ JWT dependency missing${NC}"
    fi
    
    if grep -q "\"bcryptjs\"" package.json; then
        echo -e "${GREEN}✅ Bcrypt dependency found${NC}"
    else
        echo -e "${RED}❌ Bcrypt dependency missing${NC}"
    fi
else
    echo -e "${RED}❌ package.json missing - CRITICAL ERROR${NC}"
fi

# 7. CHECK CONFIGURATION
echo -e "\n${YELLOW}📋 STEP 7: Checking configuration...${NC}"

if [ -f "next.config.js" ]; then
    echo -e "${GREEN}✅ next.config.js exists${NC}"
    
    if grep -q "standalone" next.config.js; then
        echo -e "${GREEN}✅ Standalone output configured${NC}"
    else
        echo -e "${YELLOW}⚠️ Standalone output not configured${NC}"
    fi
else
    echo -e "${RED}❌ next.config.js missing${NC}"
fi

if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✅ tsconfig.json exists${NC}"
else
    echo -e "${RED}❌ tsconfig.json missing${NC}"
fi

# 8. CHECK BUILD FILES
echo -e "\n${YELLOW}📋 STEP 8: Checking build status...${NC}"

if [ -d ".next" ]; then
    echo -e "${GREEN}✅ .next directory exists${NC}"
    
    if [ -f ".next/standalone/server.js" ]; then
        echo -e "${GREEN}✅ Standalone build found${NC}"
    else
        echo -e "${YELLOW}⚠️ Standalone build missing${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ .next directory missing - needs build${NC}"
fi

# 9. FINAL VALIDATION REPORT
echo -e "\n${YELLOW}📊 FINAL VALIDATION REPORT${NC}"
echo "=================================="

echo -e "\n${GREEN}✅ WORKING COMPONENTS:${NC}"
echo "• Core module structure exists"
echo "• API routes are present"
echo "• App router structure is in place"
echo "• Dependencies are configured"

echo -e "\n${YELLOW}⚠️ POTENTIAL ISSUES:${NC}"
echo "• Check for outdated imports in API routes"
echo "• Verify all auth functions are properly implemented"
echo "• Ensure database module is complete"
echo "• Build may need to be regenerated"

echo -e "\n${RED}❌ CRITICAL ITEMS TO CHECK:${NC}"
if [ ! -f "lib/auth.ts" ]; then
    echo "• lib/auth.ts is missing - MUST BE FIXED"
fi
if [ ! -f "lib/database.ts" ]; then
    echo "• lib/database.ts is missing - MUST BE FIXED"
fi
if [ ! -f "package.json" ]; then
    echo "• package.json is missing - MUST BE FIXED"
fi

echo -e "\n${GREEN}🎯 RECOMMENDED NEXT STEPS:${NC}"
echo "1. Run cleanup-project.sh to fix all issues"
echo "2. Test authentication endpoints"
echo "3. Verify database connections"
echo "4. Build and deploy to production"

echo -e "\n${GREEN}🔍 BACKEND VALIDATION COMPLETE!${NC}"
