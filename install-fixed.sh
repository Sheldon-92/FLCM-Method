#!/bin/bash

# FLCM (Friction Lab Content Maker) - Fixed Installation Script
# Resolves CLI path issues and provides pre-compiled functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FLCM_VERSION="2.0.0"
INSTALL_DIR="${HOME}/.flcm"
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "███████╗██╗      ██████╗███╗   ███╗"
    echo "██╔════╝██║     ██╔════╝████╗ ████║"
    echo "█████╗  ██║     ██║     ██╔████╔██║"
    echo "██╔══╝  ██║     ██║     ██║╚██╔╝██║"
    echo "██║     ███████╗╚██████╗██║ ╚═╝ ██║"
    echo "╚═╝     ╚══════╝ ╚═════╝╚═╝     ╚═╝"
    echo -e "${NC}"
    echo -e "${GREEN}Friction Lab Content Maker v${FLCM_VERSION} - FIXED VERSION${NC}"
    echo -e "${YELLOW}AI-powered multi-platform content creation${NC}"
    echo ""
}

check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo "Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
    if [ $NODE_MAJOR -lt 16 ]; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
        echo "Please upgrade to Node.js 16+"
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
    echo "   git: $(git --version | head -n1)"
    echo ""
}

install_flcm() {
    echo -e "${BLUE}🚀 Installing FLCM (Fixed Version)...${NC}"
    
    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  Existing installation found. Removing...${NC}"
        rm -rf "$INSTALL_DIR" 2>/dev/null || {
            echo -e "${RED}❌ Failed to remove existing installation${NC}"
            echo -e "${YELLOW}Try running: sudo rm -rf $INSTALL_DIR${NC}"
            exit 1
        }
    fi
    
    # Clone repository
    echo "📥 Downloading FLCM..."
    if ! git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null; then
        echo -e "${RED}❌ Failed to download FLCM${NC}"
        echo "Please check your internet connection and try again"
        exit 1
    fi
    
    # Navigate to install directory
    cd "$INSTALL_DIR"
    
    # Install only production dependencies (no build needed)
    echo "📦 Installing runtime dependencies..."
    if ! npm install --production --silent 2>/dev/null; then
        echo -e "${YELLOW}⚠️  npm install failed, trying alternative approach...${NC}"
        # Create minimal package structure if npm install fails
        mkdir -p node_modules
    fi
    
    # Ensure dist directory and CLI exist
    echo "🔧 Setting up CLI..."
    mkdir -p dist
    
    # The dist/cli.js should already be in the repo with the fixed version
    if [ ! -f "dist/cli.js" ]; then
        echo -e "${RED}❌ Pre-compiled CLI not found. Please ensure dist/cli.js exists in the repository.${NC}"
        exit 1
    fi
    
    # Make CLI executable
    chmod +x dist/cli.js
    
    # Verify CLI works
    echo "🧪 Testing CLI..."
    if node dist/cli.js --version > /dev/null 2>&1; then
        echo -e "${GREEN}✅ CLI test passed${NC}"
    else
        echo -e "${RED}❌ CLI test failed${NC}"
        echo "Checking CLI file contents..."
        head -5 dist/cli.js
        exit 1
    fi
    
    echo -e "${GREEN}✅ FLCM core installed successfully!${NC}"
}

setup_global_command() {
    echo -e "${BLUE}🔗 Setting up global command...${NC}"
    
    # Try npm link first (preferred method)
    if npm link 2>/dev/null; then
        echo -e "${GREEN}✅ Global command 'flcm' installed via npm link${NC}"
        return 0
    fi
    
    # Fallback: create symlink in ~/.local/bin
    echo -e "${YELLOW}📁 Creating local bin symlink...${NC}"
    mkdir -p "$HOME/.local/bin"
    
    # Remove existing symlink if it exists
    [ -L "$HOME/.local/bin/flcm" ] && rm "$HOME/.local/bin/flcm"
    
    # Create new symlink
    ln -sf "$INSTALL_DIR/dist/cli.js" "$HOME/.local/bin/flcm"
    chmod +x "$HOME/.local/bin/flcm"
    
    echo -e "${GREEN}✅ Command 'flcm' installed to ~/.local/bin${NC}"
    
    # Check if .local/bin is in PATH
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${YELLOW}💡 Adding ~/.local/bin to PATH...${NC}"
        
        # Add to .bashrc
        if [ -f "$HOME/.bashrc" ]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        fi
        
        # Add to .zshrc if it exists
        if [ -f "$HOME/.zshrc" ]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
        fi
        
        # Add to .profile as fallback
        if [ -f "$HOME/.profile" ]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.profile"
        fi
        
        echo -e "${GREEN}✅ PATH updated. Restart terminal or run: source ~/.bashrc${NC}"
        echo -e "${BLUE}🔄 You can also run: export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
    fi
}

setup_environment() {
    echo -e "${BLUE}⚙️  Setting up environment...${NC}"
    
    # Copy environment template if it doesn't exist
    if [ ! -f "$INSTALL_DIR/.env" ] && [ -f "$INSTALL_DIR/.env.example" ]; then
        cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
        echo -e "${GREEN}✅ Environment file created${NC}"
    fi
    
    # Create necessary directories
    mkdir -p "$INSTALL_DIR/data/cache"
    mkdir -p "$INSTALL_DIR/data/analytics"  
    mkdir -p "$INSTALL_DIR/data/users"
    mkdir -p "$INSTALL_DIR/logs"
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
}

run_tests() {
    echo -e "${BLUE}🧪 Running installation tests...${NC}"
    
    cd "$INSTALL_DIR"
    
    echo "Testing direct CLI execution..."
    if node dist/cli.js --version; then
        echo -e "${GREEN}✅ Direct execution test passed${NC}"
    else
        echo -e "${RED}❌ Direct execution test failed${NC}"
        return 1
    fi
    
    echo ""
    echo "Testing global command (if available)..."
    if command -v flcm &> /dev/null; then
        if flcm --version; then
            echo -e "${GREEN}✅ Global command test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Global command found but execution failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Global command not yet available (restart terminal)${NC}"
    fi
    
    echo ""
    echo "Testing status command..."
    if node dist/cli.js status; then
        echo -e "${GREEN}✅ Status command test passed${NC}"
    else
        echo -e "${RED}❌ Status command test failed${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ All installation tests completed!${NC}"
}

show_next_steps() {
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo ""
    echo -e "${BLUE}Quick Test:${NC}"
    echo "   Run this to test the installation:"
    echo "   cd $INSTALL_DIR && node dist/cli.js status"
    echo ""
    echo -e "${BLUE}Global Command Setup:${NC}"
    if command -v flcm &> /dev/null; then
        echo -e "${GREEN}   ✅ 'flcm' command is ready to use globally${NC}"
        echo "   Try: flcm status"
    else
        echo -e "${YELLOW}   🔄 Restart your terminal, then try: flcm status${NC}"
        echo "   Or run: export PATH=\"\$HOME/.local/bin:\$PATH\""
    fi
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo "   flcm status      # Check system status"
    echo "   flcm config      # View configuration"
    echo "   flcm --help      # Show all commands"
    echo "   flcm --version   # Show version"
    echo ""
    echo -e "${BLUE}Files & Directories:${NC}"
    echo "   Installation: $INSTALL_DIR"
    echo "   CLI: $INSTALL_DIR/dist/cli.js"
    echo "   Core: $INSTALL_DIR/flcm-core/"
    echo "   Config: $INSTALL_DIR/.env"
    echo ""
    echo -e "${GREEN}Happy content creating! 🚀${NC}"
}

# Main execution
main() {
    print_header
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        echo -e "${RED}❌ Please don't run this script as root${NC}"
        exit 1
    fi
    
    check_requirements
    install_flcm
    setup_global_command
    setup_environment
    run_tests
    show_next_steps
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Installation cancelled by user${NC}"; exit 1' INT

# Run main function
main "$@"