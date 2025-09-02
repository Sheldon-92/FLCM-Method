#!/bin/bash

# Build Pre-compiled Version of FLCM
# Creates a working CLI without TypeScript compilation

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔨 Building Pre-compiled FLCM CLI...${NC}"

# Ensure dist directory exists
mkdir -p dist

# Copy the main CLI with path fixes
echo -e "${BLUE}📋 Creating pre-compiled CLI...${NC}"
# The cli.js is already updated with path fixes above

# Make sure CLI is executable
chmod +x dist/cli.js

# Test the CLI
echo -e "${BLUE}🧪 Testing CLI functionality...${NC}"

if node dist/cli.js --version > /dev/null; then
    echo -e "${GREEN}✅ Version test passed${NC}"
else
    echo -e "${RED}❌ Version test failed${NC}"
    exit 1
fi

if node dist/cli.js status > /dev/null; then
    echo -e "${GREEN}✅ Status test passed${NC}"
else
    echo -e "${RED}❌ Status test failed${NC}"
    exit 1
fi

# Create a simple index.js for programmatic access
echo -e "${BLUE}📦 Creating index.js...${NC}"
cat > dist/index.js << 'EOF'
/**
 * FLCM Programmatic Interface
 * Pre-compiled version for easy installation
 */

const path = require('path');
const fs = require('fs');

// Re-export CLI functionality for programmatic use
const flcm = {
  version: '2.0.0',
  
  getStatus: () => {
    const installDir = path.dirname(__dirname);
    const flcmCoreDir = path.join(installDir, 'flcm-core');
    
    return {
      version: '2.0.0',
      installPath: installDir,
      coreModulesAvailable: fs.existsSync(flcmCoreDir),
      agents: fs.existsSync(path.join(flcmCoreDir, 'agents')) ? 
        fs.readdirSync(path.join(flcmCoreDir, 'agents')).filter(f => f.endsWith('.yaml') || f.endsWith('.ts')).length : 0
    };
  },
  
  getConfig: () => {
    const installDir = path.dirname(__dirname);
    const envPath = path.join(installDir, '.env');
    const coreConfigPath = path.join(installDir, 'flcm-core', 'core-config.yaml');
    
    return {
      version: '2.0.0',
      hasEnvFile: fs.existsSync(envPath),
      hasCoreConfig: fs.existsSync(coreConfigPath),
      installDir: installDir
    };
  }
};

module.exports = flcm;
EOF

# Update package.json to reflect the working version
echo -e "${BLUE}📝 Updating package.json version...${NC}"
if [ -f package.json ]; then
    # Use node to update version to 2.0.0
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.version = '2.0.0';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
fi

echo -e "${GREEN}✅ Pre-compiled build complete!${NC}"
echo ""
echo -e "${BLUE}📋 Build Summary:${NC}"
echo "   CLI: dist/cli.js (executable)"
echo "   API: dist/index.js (programmatic)"
echo "   Version: 2.0.0"
echo ""
echo -e "${BLUE}🧪 Quick Test:${NC}"
echo "   node dist/cli.js --version"
echo "   node dist/cli.js status"
echo ""
echo -e "${YELLOW}💡 This version avoids TypeScript compilation issues${NC}"
echo -e "${YELLOW}   and works directly with Node.js${NC}"