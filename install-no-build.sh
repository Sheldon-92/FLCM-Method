#!/bin/bash

# FLCM No-Build Install - Uses pre-built files, no TypeScript compilation needed
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"
INSTALL_DIR="$HOME/.flcm"

echo -e "${BLUE}🚀 FLCM No-Build Install${NC}"
echo -e "${YELLOW}(Uses pre-built files - no compilation needed)${NC}"
echo "Installing to: $INSTALL_DIR"
echo ""

# Check requirements (only need Node and git, not npm build tools)
if ! command -v node &> /dev/null || ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Missing requirements${NC}"
    echo "Please install Node.js (16+) and git"
    exit 1
fi

# Remove existing installation
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Removing existing installation...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Clone repository
echo -e "${BLUE}📥 Downloading FLCM...${NC}"
git clone --depth 1 --quiet "$REPO_URL" "$INSTALL_DIR"

# Navigate to directory  
cd "$INSTALL_DIR"

# Install only production dependencies (no dev deps, no build)
echo -e "${BLUE}📦 Installing runtime dependencies...${NC}"
npm install --production --silent

# Verify pre-built files exist
if [ ! -f "dist/cli.js" ]; then
    echo -e "${RED}❌ Pre-built files missing. Using fallback method...${NC}"
    # Install TypeScript temporarily and build
    npm install typescript --silent
    ./node_modules/.bin/tsc
    npm uninstall typescript --silent
fi

# Setup global command
echo -e "${BLUE}🔗 Setting up global command...${NC}"
mkdir -p "$HOME/.local/bin"
ln -sf "$INSTALL_DIR/dist/cli.js" "$HOME/.local/bin/flcm"
chmod +x "$HOME/.local/bin/flcm"
chmod +x "$INSTALL_DIR/dist/cli.js"

# Add to PATH if needed
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
    export PATH="$HOME/.local/bin:$PATH"
fi

# Test the installation
echo -e "${BLUE}🧪 Testing installation...${NC}"
if "$HOME/.local/bin/flcm" --version &>/dev/null; then
    echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Quick start:${NC}"
    echo "  flcm --version"
    echo "  flcm quick 'Your topic'"
    echo "  flcm create"
    echo ""
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${YELLOW}If 'flcm' command not found, restart your terminal or run:${NC}"
        echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
else
    echo -e "${RED}❌ Installation test failed${NC}"
    echo "Try running manually: $HOME/.local/bin/flcm --version"
fi