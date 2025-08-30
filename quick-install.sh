#!/bin/bash

# FLCM Quick Install - Simplified version with better error handling
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

echo -e "${BLUE}🚀 FLCM Quick Install${NC}"
echo "Installing to: $INSTALL_DIR"
echo ""

# Check requirements
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null || ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Missing requirements${NC}"
    echo "Please install Node.js (16+), npm, and git"
    exit 1
fi

# Remove existing installation
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Removing existing installation...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Clone and install
echo -e "${BLUE}📥 Downloading FLCM...${NC}"
git clone --depth 1 --quiet "$REPO_URL" "$INSTALL_DIR"

echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd "$INSTALL_DIR"
npm install --silent

echo -e "${BLUE}🔨 Building FLCM...${NC}"
npm run build --silent

echo -e "${BLUE}🧹 Cleaning up dev dependencies...${NC}"
npm prune --production --silent

# Setup command
echo -e "${BLUE}🔗 Setting up command...${NC}"
mkdir -p "$HOME/.local/bin"
ln -sf "$INSTALL_DIR/dist/cli.js" "$HOME/.local/bin/flcm"
chmod +x "$HOME/.local/bin/flcm"

# Add to PATH if needed
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
    export PATH="$HOME/.local/bin:$PATH"
fi

echo ""
echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
echo ""
echo -e "${YELLOW}Quick start:${NC}"
echo "  flcm --version"
echo "  flcm quick 'Your topic'"
echo "  flcm create"
echo ""
echo -e "${YELLOW}If 'flcm' command not found, restart your terminal or run:${NC}"
echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""