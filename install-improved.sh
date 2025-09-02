#!/bin/bash

# FLCM 2.0 Improved Installation Script
# Better path management and user control

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
FLCM_VERSION="2.0.0"
REPO_URL="https://github.com/Sheldon-92/FLCM-Method.git"

# Default installation directory (NOT in home root!)
DEFAULT_INSTALL_DIR="${HOME}/.local/share/flcm"

# Print header
print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║      FLCM v${FLCM_VERSION} Installation      ║"
    echo "║     Improved Path Management          ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

# Choose installation directory
choose_install_dir() {
    echo -e "${BLUE}📁 Choose installation location:${NC}"
    echo ""
    echo "  1) ${HOME}/.local/share/flcm  ${GREEN}(Recommended - Standard location)${NC}"
    echo "  2) ${HOME}/Applications/flcm  ${YELLOW}(User Applications folder)${NC}"
    echo "  3) /opt/flcm                  ${YELLOW}(System-wide - requires sudo)${NC}"
    echo "  4) ./flcm                      ${YELLOW}(Current directory)${NC}"
    echo "  5) Custom path"
    echo ""
    
    # Non-interactive mode - use default
    if [ ! -t 0 ]; then
        echo -e "${BLUE}Non-interactive mode: Using default path${NC}"
        INSTALL_DIR="$DEFAULT_INSTALL_DIR"
        return
    fi
    
    read -p "Select option [1-5] (default: 1): " choice
    
    case $choice in
        2)
            INSTALL_DIR="${HOME}/Applications/flcm"
            mkdir -p "${HOME}/Applications"
            ;;
        3)
            INSTALL_DIR="/opt/flcm"
            if [ ! -w "/opt" ]; then
                echo -e "${RED}❌ /opt requires sudo permissions${NC}"
                echo -e "${YELLOW}Falling back to default location${NC}"
                INSTALL_DIR="$DEFAULT_INSTALL_DIR"
            fi
            ;;
        4)
            INSTALL_DIR="$(pwd)/flcm"
            ;;
        5)
            read -p "Enter custom path: " custom_path
            if [ -z "$custom_path" ]; then
                INSTALL_DIR="$DEFAULT_INSTALL_DIR"
            else
                # Expand tilde and variables
                INSTALL_DIR=$(eval echo "$custom_path")
            fi
            ;;
        *)
            INSTALL_DIR="$DEFAULT_INSTALL_DIR"
            ;;
    esac
    
    # Ensure parent directory exists and is writable
    PARENT_DIR=$(dirname "$INSTALL_DIR")
    if [ ! -d "$PARENT_DIR" ]; then
        mkdir -p "$PARENT_DIR" 2>/dev/null || {
            echo -e "${RED}❌ Cannot create parent directory: $PARENT_DIR${NC}"
            echo -e "${YELLOW}Using default location instead${NC}"
            INSTALL_DIR="$DEFAULT_INSTALL_DIR"
            mkdir -p "$(dirname $DEFAULT_INSTALL_DIR)"
        }
    fi
    
    echo -e "${GREEN}✅ Installation path: $INSTALL_DIR${NC}"
    echo ""
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
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ $NODE_MAJOR -lt 14 ]; then
        echo -e "${RED}❌ Node.js version too old (v$NODE_VERSION)${NC}"
        echo "Please upgrade to Node.js 14+"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        echo -e "${YELLOW}⚠️  git is not installed${NC}"
        echo "Will download as archive instead"
        USE_ARCHIVE=true
    fi
    
    echo -e "${GREEN}✅ Requirements satisfied${NC}"
    echo "   Node.js: $(node --version)"
    echo "   npm: $(npm --version)"
    [ -z "$USE_ARCHIVE" ] && echo "   git: $(git --version | head -n1)"
    echo ""
}

# Clean existing installation
clean_existing() {
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  Existing installation found at: $INSTALL_DIR${NC}"
        
        if [ -t 0 ]; then
            read -p "Remove existing installation? [y/N]: " remove
            if [[ $remove =~ ^[Yy]$ ]]; then
                echo "Removing..."
                rm -rf "$INSTALL_DIR"
            else
                echo -e "${RED}Installation cancelled${NC}"
                exit 1
            fi
        else
            echo "Removing existing installation..."
            rm -rf "$INSTALL_DIR"
        fi
    fi
}

# Install FLCM
install_flcm() {
    echo -e "${BLUE}📦 Installing FLCM to: $INSTALL_DIR${NC}"
    
    # Download source
    if [ -z "$USE_ARCHIVE" ]; then
        echo "📥 Cloning repository..."
        git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null || {
            echo -e "${RED}❌ Failed to clone repository${NC}"
            exit 1
        }
    else
        echo "📥 Downloading archive..."
        mkdir -p "$INSTALL_DIR"
        curl -L "https://github.com/Sheldon-92/FLCM-Method/archive/main.tar.gz" | tar xz -C "$INSTALL_DIR" --strip-components=1
    fi
    
    cd "$INSTALL_DIR"
    
    # Create minimal package.json for BMad-style
    cat > package.json << 'EOF'
{
  "name": "flcm",
  "version": "2.0.0",
  "description": "FLCM - Friction Lab Content Maker",
  "main": "flcm-core/flcm-cli.js",
  "bin": {
    "flcm": "./flcm-core/flcm-cli.js"
  },
  "scripts": {
    "start": "node flcm-core/flcm-cli.js"
  },
  "dependencies": {
    "js-yaml": "^4.1.0",
    "dotenv": "^16.0.0"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}
EOF
    
    # Install minimal dependencies
    echo "📦 Installing dependencies..."
    npm install --production --silent 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Some optional dependencies failed${NC}"
    }
    
    # Make CLI executable
    chmod +x flcm-core/flcm-cli.js 2>/dev/null || true
    chmod +x flcm-core/cli.js 2>/dev/null || true
    
    echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
}

# Setup command
setup_command() {
    echo -e "${BLUE}🔗 Setting up 'flcm' command...${NC}"
    
    # Create wrapper script
    WRAPPER_PATH="${HOME}/.local/bin/flcm"
    mkdir -p "${HOME}/.local/bin"
    
    cat > "$WRAPPER_PATH" << EOF
#!/bin/bash
# FLCM wrapper script
exec node "$INSTALL_DIR/flcm-core/flcm-cli.js" "\$@"
EOF
    
    chmod +x "$WRAPPER_PATH"
    
    # Check if ~/.local/bin is in PATH
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${YELLOW}📝 Adding ~/.local/bin to PATH...${NC}"
        
        # Add to shell configs
        for rc in .bashrc .zshrc; do
            if [ -f "$HOME/$rc" ]; then
                grep -q "export PATH.*\.local/bin" "$HOME/$rc" || {
                    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/$rc"
                    echo "   Updated $rc"
                }
            fi
        done
        
        echo -e "${YELLOW}⚠️  Restart your terminal or run:${NC}"
        echo "   source ~/.bashrc"
    fi
    
    echo -e "${GREEN}✅ Command 'flcm' configured${NC}"
}

# Create uninstall script
create_uninstaller() {
    echo -e "${BLUE}📝 Creating uninstaller...${NC}"
    
    cat > "$INSTALL_DIR/uninstall.sh" << EOF
#!/bin/bash
# FLCM Uninstaller

echo "🗑️  Uninstalling FLCM..."

# Remove installation directory
rm -rf "$INSTALL_DIR"

# Remove command
rm -f "${HOME}/.local/bin/flcm"

echo "✅ FLCM uninstalled"
echo ""
echo "Note: PATH modifications in .bashrc/.zshrc were not removed"
echo "You can remove them manually if desired"
EOF
    
    chmod +x "$INSTALL_DIR/uninstall.sh"
    echo -e "${GREEN}✅ Uninstaller created at: $INSTALL_DIR/uninstall.sh${NC}"
}

# Save installation info
save_install_info() {
    cat > "$INSTALL_DIR/.flcm-install-info" << EOF
{
  "version": "$FLCM_VERSION",
  "installDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "installPath": "$INSTALL_DIR",
  "installer": "install-improved.sh"
}
EOF
}

# Test installation
test_installation() {
    echo -e "${BLUE}🧪 Testing installation...${NC}"
    
    if [ -f "$INSTALL_DIR/flcm-core/flcm-cli.js" ]; then
        node "$INSTALL_DIR/flcm-core/flcm-cli.js" status &>/dev/null && {
            echo -e "${GREEN}✅ Installation test passed${NC}"
        } || {
            echo -e "${YELLOW}⚠️  Basic test failed, but installation complete${NC}"
        }
    fi
}

# Show completion message
show_completion() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     🎉 Installation Complete! 🎉      ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 Installed to:${NC} $INSTALL_DIR"
    echo -e "${BLUE}🗑️  To uninstall:${NC} $INSTALL_DIR/uninstall.sh"
    echo ""
    echo -e "${YELLOW}Quick Start:${NC}"
    echo "  flcm help              # Show commands"
    echo "  flcm status            # Check system"
    echo "  flcm analyze <url>     # Analyze content"
    echo ""
    
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${RED}⚠️  Important:${NC}"
        echo "  Run this command first: ${GREEN}source ~/.bashrc${NC}"
        echo ""
    fi
}

# Main execution
main() {
    print_header
    check_requirements
    choose_install_dir
    clean_existing
    install_flcm
    setup_command
    create_uninstaller
    save_install_info
    test_installation
    show_completion
}

# Handle errors
trap 'echo -e "\n${RED}❌ Installation failed${NC}"; exit 1' ERR

# Run
main "$@"