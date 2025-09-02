#!/bin/bash

# FLCM 2.0 BMad-Style Installation Script
# Zero compilation, configuration-driven architecture

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
FLCM_VERSION="2.0.0"
INSTALL_DIR="${HOME}/.flcm"
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"

# Print header
print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║      FLCM v${FLCM_VERSION} Installation      ║"
    echo "║     BMad-Style Architecture           ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking requirements...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo "Please install Node.js 14+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements satisfied${NC}"
    echo "   Node.js: $(node --version)"
    echo "   npm: $(npm --version)"
    echo ""
}

# Install FLCM
install_flcm() {
    echo -e "${BLUE}📦 Installing FLCM...${NC}"
    
    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  Removing existing installation...${NC}"
        rm -rf "$INSTALL_DIR"
    fi
    
    # Clone repository
    echo "📥 Downloading FLCM..."
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null || {
        echo -e "${RED}❌ Failed to download FLCM${NC}"
        exit 1
    }
    
    cd "$INSTALL_DIR"
    
    # Install minimal dependencies (no TypeScript!)
    echo "📦 Installing dependencies (minimal)..."
    cat > package.json << 'EOF'
{
  "name": "flcm",
  "version": "2.0.0",
  "description": "FLCM - Friction Lab Content Maker (BMad Style)",
  "main": "flcm-core/flcm-cli.js",
  "bin": {
    "flcm": "./flcm-core/flcm-cli.js"
  },
  "scripts": {
    "start": "node flcm-core/flcm-cli.js"
  },
  "dependencies": {
    "js-yaml": "^4.1.0",
    "dotenv": "^16.0.0",
    "chalk": "^4.1.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF
    
    npm install --silent --production
    
    # Make CLI executable
    chmod +x flcm-core/flcm-cli.js
    
    # Create directories
    mkdir -p flcm-core/{agents,tasks,methodologies,templates,config}
    mkdir -p data/{cache,analytics,users}
    
    echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
}

# Setup global command
setup_command() {
    echo -e "${BLUE}🔗 Setting up global command...${NC}"
    
    # Try npm link first
    cd "$INSTALL_DIR"
    if npm link 2>/dev/null; then
        echo -e "${GREEN}✅ Global command 'flcm' installed${NC}"
    else
        # Fallback to local bin
        mkdir -p "$HOME/.local/bin"
        ln -sf "$INSTALL_DIR/flcm-core/flcm-cli.js" "$HOME/.local/bin/flcm"
        
        # Add to PATH if needed
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
            echo -e "${YELLOW}💡 Added ~/.local/bin to PATH${NC}"
            echo -e "${YELLOW}   Run: source ~/.bashrc${NC}"
        fi
    fi
}

# Create default configuration
create_config() {
    echo -e "${BLUE}⚙️  Creating configuration...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Create core configuration
    cat > flcm-core/config/core-config.yaml << 'EOF'
# FLCM Core Configuration
version: 2.0.0
mode: bmad-style

agents:
  - scholar
  - creator
  - publisher

workflows:
  standard:
    steps:
      - agent: scholar
        task: analyze-content
      - agent: creator
        task: create-article
      - agent: publisher
        task: publish-content
  quick:
    steps:
      - agent: creator
        task: create-article
      - agent: publisher
        task: publish-content

defaults:
  creationMode: standard
  platforms: [xiaohongshu, zhihu]
  language: zh-CN
  voiceDNA: true
EOF
    
    # Create user preferences template
    cat > flcm-core/config/user-prefs.yaml << 'EOF'
# User Preferences
# Edit this file to customize FLCM behavior

preferences:
  defaultMode: standard
  favoriteFrameworks:
    - SWOT
    - SCAMPER
  platforms:
    primary: xiaohongshu
    secondary: [zhihu, wechat]
  voice:
    tone: professional
    style: engaging
EOF
    
    echo -e "${GREEN}✅ Configuration created${NC}"
}

# Test installation
test_installation() {
    echo -e "${BLUE}🧪 Testing installation...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Test CLI
    if node flcm-core/flcm-cli.js status &>/dev/null; then
        echo -e "${GREEN}✅ CLI test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  CLI test failed, but installation complete${NC}"
    fi
    
    # Test global command
    if command -v flcm &>/dev/null; then
        echo -e "${GREEN}✅ Global command available${NC}"
    else
        echo -e "${YELLOW}⚠️  Global command not in PATH yet${NC}"
        echo "   Try: source ~/.bashrc"
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo ""
    echo -e "${BLUE}Quick Start:${NC}"
    echo "  flcm help              # Show commands"
    echo "  flcm status            # Check system"
    echo "  flcm analyze <url>     # Analyze content"
    echo "  flcm create quick      # Quick creation"
    echo ""
    echo -e "${BLUE}Configuration:${NC}"
    echo "  Edit: ~/.flcm/flcm-core/config/user-prefs.yaml"
    echo ""
    echo -e "${GREEN}Ready to create amazing content! 🚀${NC}"
}

# Main execution
main() {
    print_header
    check_requirements
    install_flcm
    setup_command
    create_config
    test_installation
    show_next_steps
}

# Run
main "$@"