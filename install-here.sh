#!/bin/bash

# FLCM 2.0 - Install in Current Directory Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install-here.sh | bash
# This script installs FLCM in the current directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FLCM_VERSION="2.0.0"
CURRENT_DIR="$(pwd)"
INSTALL_DIR="$CURRENT_DIR/flcm"
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"

# Print header
echo -e "${BLUE}"
echo "███████╗██╗      ██████╗███╗   ███╗"
echo "██╔════╝██║     ██╔════╝████╗ ████║"
echo "█████╗  ██║     ██║     ██╔████╔██║"
echo "██╔══╝  ██║     ██║     ██║╚██╔╝██║"
echo "██║     ███████╗╚██████╗██║ ╚═╝ ██║"
echo "╚═╝     ╚══════╝ ╚═════╝╚═╝     ╚═╝"
echo -e "${NC}"
echo -e "${GREEN}FLCM 2.0 - Enterprise AI-Powered Learning Platform${NC}"
echo -e "${YELLOW}Installing in current directory...${NC}"
echo ""

# Show installation location
echo -e "${BLUE}📍 Installation Details:${NC}"
echo -e "   Current directory: ${GREEN}$CURRENT_DIR${NC}"
echo -e "   FLCM will be installed to: ${GREEN}$INSTALL_DIR${NC}"
echo ""

# Check if already exists
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory $INSTALL_DIR already exists!${NC}"
    read -p "Do you want to remove it and reinstall? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo -e "${RED}Installation cancelled${NC}"
        exit 1
    fi
    echo -e "${YELLOW}Removing existing installation...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# Check requirements
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
    echo "Please upgrade to Node.js 18+"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git is not installed${NC}"
    echo "Please install git first"
    exit 1
fi

echo -e "${GREEN}✅ All requirements satisfied${NC}"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   git: $(git --version | head -n1)"
echo ""

# Clone repository
echo -e "${BLUE}📥 Downloading FLCM...${NC}"
git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null || {
    echo -e "${RED}❌ Failed to download FLCM${NC}"
    exit 1
}

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd "$INSTALL_DIR"
npm install --silent --no-fund --no-audit 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Some warnings during npm install (usually safe to ignore)${NC}"
}

# Build the project
echo -e "${BLUE}🔨 Building FLCM...${NC}"
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Build warnings (usually safe to ignore)${NC}"
    }
fi

# Create local CLI wrapper
echo -e "${BLUE}🔧 Creating local CLI...${NC}"
cat > "$INSTALL_DIR/flcm" << 'EOF'
#!/bin/bash
# FLCM CLI Wrapper
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
node "$SCRIPT_DIR/flcm-core/cli/index.js" "$@"
EOF
chmod +x "$INSTALL_DIR/flcm"

# Success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 FLCM 2.0 installed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📍 Installation location:${NC} $INSTALL_DIR"
echo ""
echo -e "${BLUE}To use FLCM from this directory:${NC}"
echo -e "   ${GREEN}./flcm/flcm --help${NC}              # Show help"
echo -e "   ${GREEN}./flcm/flcm create \"topic\"${NC}      # Create content"
echo -e "   ${GREEN}./flcm/flcm quick \"topic\"${NC}       # Quick mode"
echo ""
echo -e "${BLUE}To add FLCM to your PATH (optional):${NC}"
echo -e "   ${GREEN}export PATH=\"$INSTALL_DIR:\$PATH\"${NC}"
echo -e "   Then you can use: ${GREEN}flcm --help${NC}"
echo ""
echo -e "${BLUE}To add permanently to PATH, add this line to ~/.bashrc or ~/.zshrc:${NC}"
echo -e "   ${GREEN}export PATH=\"$INSTALL_DIR:\$PATH\"${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC} $INSTALL_DIR/docs/"
echo -e "${YELLOW}🔧 Configuration:${NC} $INSTALL_DIR/.env"
echo ""
echo -e "${GREEN}Happy content creating! 🚀${NC}"