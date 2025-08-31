#!/bin/bash

# FLCM Auto Install Script - 完全自动化，无需用户输入
# 专门为 curl | bash 设计

set -e

# Configuration
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"
INSTALL_DIR="${FLCM_DIR:-$HOME/.flcm}"  # 可通过环境变量自定义

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Logo
show_logo() {
    echo -e "${BLUE}"
    cat << 'EOF'

███████╗██╗      ██████╗███╗   ███╗
██╔════╝██║     ██╔════╝████╗ ████║
█████╗  ██║     ██║     ██╔████╔██║
██╔══╝  ██║     ██║     ██║╚██╔╝██║
██║     ███████╗╚██████╗██║ ╚═╝ ██║
╚═╝     ╚══════╝ ╚═════╝╚═╝     ╚═╝

EOF
    echo -e "${GREEN}Friction Lab Content Maker v1.0.0${NC}"
    echo -e "${YELLOW}AI-powered multi-platform content creation${NC}"
    echo ""
}

# Check requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    local missing=false
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo "   Please install Node.js (v14+) from https://nodejs.org"
        missing=true
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        missing=true
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ git is not installed${NC}"
        missing=true
    fi
    
    if [ "$missing" = true ]; then
        echo ""
        echo -e "${YELLOW}Please install missing requirements and try again${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
    echo "   Node.js: $(node --version)"
    echo "   npm: $(npm --version)"
    echo "   git: git version $(git --version | cut -d' ' -f3)"
    echo ""
}

# Install FLCM
install_flcm() {
    echo -e "${BLUE}📁 Installing to: ${INSTALL_DIR}${NC}"
    echo ""
    
    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  Removing existing installation...${NC}"
        rm -rf "$INSTALL_DIR" || {
            echo -e "${RED}❌ Failed to remove existing installation${NC}"
            echo -e "${YELLOW}Try: sudo rm -rf $INSTALL_DIR${NC}"
            exit 1
        }
    fi
    
    # Clone repository
    echo -e "${BLUE}📥 Downloading FLCM...${NC}"
    git clone --quiet --depth 1 "$REPO_URL" "$INSTALL_DIR" || {
        echo -e "${RED}❌ Failed to download FLCM${NC}"
        exit 1
    }
    
    # Navigate to install directory
    cd "$INSTALL_DIR"
    
    # Install dependencies
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install --silent 2>&1 | grep -v "npm WARN" || true
    
    # Build project
    echo -e "${BLUE}🔨 Building FLCM...${NC}"
    if npm run build --silent 2>&1 | grep -v "npm WARN"; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Build had warnings, but continuing...${NC}"
    fi
    
    # Clean up
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    npm prune --production --silent 2>/dev/null || true
    
    # Create global symlink
    echo -e "${BLUE}🔗 Setting up global command...${NC}"
    if npm link --silent 2>/dev/null; then
        echo -e "${GREEN}✅ Global command installed${NC}"
    else
        # Fallback: create shell alias
        echo -e "${YELLOW}Setting up shell alias...${NC}"
        ALIAS_CMD="alias flcm='node ${INSTALL_DIR}/dist/cli/flcm-cli-simple.js 2>/dev/null || node ${INSTALL_DIR}/flcm-core/cli/flcm-cli-simple.js'"
        
        # Add to bash
        if [ -f "$HOME/.bashrc" ]; then
            grep -q "alias flcm=" "$HOME/.bashrc" || echo "$ALIAS_CMD" >> "$HOME/.bashrc"
        fi
        
        # Add to zsh
        if [ -f "$HOME/.zshrc" ]; then
            grep -q "alias flcm=" "$HOME/.zshrc" || echo "$ALIAS_CMD" >> "$HOME/.zshrc"
        fi
    fi
}

# Show success message
show_success() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📍 Installation location:${NC}"
    echo "   $INSTALL_DIR"
    echo ""
    echo -e "${YELLOW}🎯 Next steps:${NC}"
    echo ""
    echo "1. Restart your terminal or run:"
    echo -e "   ${GREEN}source ~/.zshrc${NC}  (or ${GREEN}source ~/.bashrc${NC})"
    echo ""
    echo "2. Open the folder in Claude Code:"
    echo -e "   ${GREEN}$INSTALL_DIR${NC}"
    echo ""
    echo "3. Use FLCM commands in Claude Code:"
    echo -e "   ${GREEN}/flcm${NC}          - Start FLCM system"
    echo -e "   ${GREEN}/collector${NC}     - Information gathering"
    echo -e "   ${GREEN}/scholar${NC}       - Deep learning"
    echo -e "   ${GREEN}/creator${NC}       - Content creation"
    echo -e "   ${GREEN}/adapter${NC}       - Platform optimization"
    echo ""
    echo "4. Or use CLI (after restarting terminal):"
    echo -e "   ${GREEN}flcm quick \"Your topic\"${NC}"
    echo -e "   ${GREEN}flcm create${NC}"
    echo ""
    echo -e "${CYAN}💡 Custom installation:${NC}"
    echo "   To install in a different location, set FLCM_DIR:"
    echo -e "   ${GREEN}FLCM_DIR=/custom/path curl -fsSL ... | bash${NC}"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC} https://github.com/Sheldon-92/FLCM-Method"
    echo ""
}

# Main execution
main() {
    show_logo
    check_requirements
    install_flcm
    show_success
}

# Run
main