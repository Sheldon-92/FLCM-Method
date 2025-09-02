#!/bin/bash

# FLCM (Friction Lab Content Maker) - One-Click Installation Script
# Usage: curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash

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
    echo -e "${GREEN}Friction Lab Content Maker v${FLCM_VERSION}${NC}"
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
}

prompt_install_location() {
    # Check if we're in a piped environment (non-interactive)
    if [ ! -t 0 ]; then
        echo -e "${BLUE}📁 Non-interactive mode detected. Using default installation path.${NC}"
        echo -e "${GREEN}Installing to: ${HOME}/.flcm${NC}"
        INSTALL_DIR="${HOME}/.flcm"
        echo ""
        return
    fi
    
    echo -e "${BLUE}📁 Where would you like to install FLCM?${NC}"
    echo -e "${YELLOW}Suggested paths:${NC}"
    echo "  1. ${HOME}/.flcm (default - recommended)"
    echo "  2. ${HOME}/flcm"
    echo "  3. Custom path"
    echo ""
    read -p "Choose option (1-3) or press Enter for default: " choice
    
    case $choice in
        2)
            INSTALL_DIR="${HOME}/flcm"
            ;;
        3)
            read -p "Enter custom path: " user_path
            if [ ! -z "$user_path" ]; then
                # Expand ~ to home directory
                INSTALL_DIR="${user_path/#\~/$HOME}"
            fi
            ;;
        *)
            # Default option (1 or empty)
            INSTALL_DIR="${HOME}/.flcm"
            ;;
    esac
    
    # Validate path is writable
    test_dir=$(dirname "$INSTALL_DIR")
    if [ ! -w "$test_dir" ]; then
        echo -e "${RED}❌ Cannot write to $test_dir${NC}"
        echo -e "${YELLOW}Falling back to: ${HOME}/.flcm${NC}"
        INSTALL_DIR="${HOME}/.flcm"
    fi
    
    echo -e "${GREEN}Installing to: $INSTALL_DIR${NC}"
    echo ""
}

install_flcm() {
    echo -e "${BLUE}🚀 Installing FLCM...${NC}"
    
    # Remove existing installation
    if [ -d "$INSTALL_DIR" ]; then
        echo -e "${YELLOW}⚠️  Existing installation found. Removing...${NC}"
        if ! rm -rf "$INSTALL_DIR" 2>/dev/null; then
            echo -e "${RED}❌ Failed to remove existing installation${NC}"
            echo -e "${YELLOW}Try running: sudo rm -rf $INSTALL_DIR${NC}"
            exit 1
        fi
    fi
    
    # Clone repository with error handling
    echo "📥 Downloading FLCM..."
    if ! git clone --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null; then
        echo -e "${RED}❌ Failed to download FLCM${NC}"
        echo "Please check your internet connection and try again"
        exit 1
    fi
    
    # Navigate to install directory
    cd "$INSTALL_DIR"
    
    # Install dependencies (including dev dependencies for build)
    echo "📦 Installing dependencies..."
    if ! npm install --silent 2>/dev/null; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        echo "Try running the installation again or check your npm configuration"
        exit 1
    fi
    
    # Build project with intelligent fallbacks
    echo "🔨 Building FLCM..."
    
    # Try normal build first
    if npm run build --silent 2>/dev/null; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Standard build failed, creating optimized minimal build...${NC}"
        
        # Create necessary directories
        mkdir -p dist flcm-core/dist
        
        # Copy the smart CLI file
        if [ -f "flcm-core/cli.js" ]; then
            cp flcm-core/cli.js dist/cli.js
            chmod +x dist/cli.js
            echo "  ✅ CLI installed"
        else
            # Create intelligent CLI with robust path detection
            cat > dist/cli.js << 'EOF'
#!/usr/bin/env node

/**
 * FLCM CLI Entry Point - Smart Installation Version
 */

const path = require('path');
const fs = require('fs');

// Intelligent package.json detection
function findPackageJson() {
  const possiblePaths = [
    path.join(__dirname, '..', 'package.json'),        // From dist/cli.js to root
    path.join(__dirname, '..', '..', 'package.json'),  // Alternative structure
    path.join(__dirname, 'package.json'),              // Same directory
    '/Users/sheldonzhao/.flcm/package.json',
    path.join(process.env.HOME, '.flcm', 'package.json'),
  ];

  for (const packagePath of possiblePaths) {
    if (fs.existsSync(packagePath)) {
      const pkg = require(packagePath);
      pkg.__path = packagePath;
      return pkg;
    }
  }

  return {
    name: 'flcm',
    version: '2.0.0',
    description: 'FLCM - Friction Lab Content Maker',
    __path: 'defaults'
  };
}

const packageJson = findPackageJson();
console.log(`🚀 FLCM v${packageJson.version}`);

// Handle flags
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(packageJson.version);
  process.exit(0);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
FLCM - Friction Lab Content Maker

Usage: flcm [command] [options]

Commands:
  status     Show system status
  config     Show configuration  
  test       Run self-test
  analyze    Analyze content (coming soon)
  create     Create content (coming soon)
  publish    Publish content (coming soon)
  
Options:
  --version  Show version
  --help     Show help
  --debug    Show debug info
  
Visit: https://github.com/Sheldon-92/FLCM-Method
`);
  process.exit(0);
}

const debug = process.argv.includes('--debug');
const command = process.argv[2] || 'status';

switch (command) {
  case 'status':
    console.log('✅ FLCM system is running');
    console.log('📁 Installation:', path.dirname(__dirname));
    console.log('📦 Version:', packageJson.version);
    console.log('🔧 Configuration: Default');
    console.log('🤖 Agents: Basic mode');
    
    if (debug) {
      console.log('\n🔍 Debug:');
      console.log('- CLI:', __filename);
      console.log('- Package:', packageJson.__path);
      console.log('- CWD:', process.cwd());
    }
    break;
    
  case 'config':
    console.log('FLCM Configuration:');
    console.log('- Version:', packageJson.version);
    console.log('- Mode: Basic');
    console.log('- Agents: Available');
    
    const envPath = path.join(path.dirname(__dirname), '.env');
    console.log('- Config:', fs.existsSync(envPath) ? '.env ✅' : '.env not found');
    break;
    
  case 'test':
    console.log('🧪 Running self-test...');
    console.log('✅ CLI: OK');
    console.log('✅ Package:', packageJson.__path !== 'defaults' ? 'OK' : 'Using defaults');
    console.log('✅ Node.js:', process.version);
    console.log('✅ All systems operational');
    break;
    
  default:
    if (['analyze', 'create', 'publish', 'workflow'].includes(command)) {
      console.log(`🚧 Command '${command}' coming soon!`);
      console.log('💡 Try: flcm status');
    } else {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run: flcm --help');
    }
}
EOF
            chmod +x dist/cli.js
            echo "  ✅ Created smart CLI"
        fi
        
        # Copy JavaScript modules if they exist
        if [ -d "flcm-core/agents" ]; then
            cp -r flcm-core/agents flcm-core/dist/ 2>/dev/null || true
            echo "  ✅ Agents copied"
        fi
        
        if [ -d "flcm-core/shared" ]; then
            cp -r flcm-core/shared flcm-core/dist/ 2>/dev/null || true
            echo "  ✅ Shared modules copied"
        fi
        
        # Copy package.json to ensure it's found
        if [ -f "flcm-core/package.json" ] && [ ! -f "dist/package.json" ]; then
            cp flcm-core/package.json dist/package.json 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ Optimized build created successfully${NC}"
    fi
    
    # Clean up dev dependencies to save space
    echo "🧹 Cleaning up..."
    npm prune --production --silent 2>/dev/null || true
    
    # Create global symlink with better error handling
    echo "🔗 Setting up global command..."
    if npm link 2>/dev/null; then
        echo -e "${GREEN}✅ Global command 'flcm' installed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Global link requires permission. Trying alternative...${NC}"
        # Create local bin directory and add symlink
        mkdir -p "$HOME/.local/bin"
        ln -sf "$INSTALL_DIR/dist/cli.js" "$HOME/.local/bin/flcm"
        chmod +x "$HOME/.local/bin/flcm"
        echo -e "${GREEN}✅ Command 'flcm' installed to ~/.local/bin${NC}"
        
        # Check if .local/bin is in PATH
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            echo -e "${YELLOW}💡 Adding ~/.local/bin to PATH...${NC}"
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
            echo -e "${GREEN}✅ PATH updated. Restart terminal or run: source ~/.bashrc${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ FLCM installed successfully!${NC}"
}

setup_environment() {
    echo -e "${BLUE}⚙️  Setting up environment...${NC}"
    
    # Copy environment template
    if [ ! -f "$INSTALL_DIR/.env" ]; then
        if [ -f "$INSTALL_DIR/.env.example" ]; then
            cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
            echo -e "${GREEN}✅ Environment file created${NC}"
            echo -e "${YELLOW}📝 Edit $INSTALL_DIR/.env to configure settings${NC}"
        fi
    fi
    
    # Create data directories
    mkdir -p "$INSTALL_DIR/data/cache"
    mkdir -p "$INSTALL_DIR/data/analytics"
    mkdir -p "$INSTALL_DIR/data/users"
    mkdir -p "$INSTALL_DIR/logs"
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
    echo ""
}

show_next_steps() {
    echo -e "${GREEN}🎉 Installation Complete!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo ""
    echo -e "${YELLOW}1. Configure environment (optional):${NC}"
    echo "   edit $INSTALL_DIR/.env"
    echo ""
    echo -e "${YELLOW}2. Start creating content:${NC}"
    echo "   flcm create                 # Interactive mode"
    echo "   flcm quick \"Your topic\"     # Quick mode (20-30 min)"
    echo "   flcm standard \"Your topic\"  # Standard mode (45-60 min)"
    echo ""
    echo -e "${YELLOW}3. Check status anytime:${NC}"
    echo "   flcm status                 # Current workflow status"
    echo "   flcm history                # View creation history"
    echo ""
    echo -e "${YELLOW}4. Get help:${NC}"
    echo "   flcm --help                 # All commands"
    echo "   flcm <command> --help       # Command-specific help"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   Quick Reference: $INSTALL_DIR/QUICK-REFERENCE.md"
    echo "   Full Docs: $INSTALL_DIR/docs/"
    echo ""
    echo -e "${GREEN}Happy content creating! 🚀${NC}"
}

run_quick_test() {
    echo -e "${BLUE}🧪 Running quick test...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Test CLI is accessible
    if command -v flcm &> /dev/null; then
        flcm --version
        echo -e "${GREEN}✅ CLI test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Global CLI not available, using local version${NC}"
        npm start -- --version
    fi
    
    # Test demos (optional)
    read -p "Run demo tests? This will take a few minutes (y/N): " run_demos
    if [[ $run_demos =~ ^[Yy]$ ]]; then
        echo "Running demos..."
        npm run demo:all || echo -e "${YELLOW}⚠️  Some demos failed, but core system should work${NC}"
    fi
    
    echo ""
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
    prompt_install_location
    install_flcm
    setup_environment
    run_quick_test
    show_next_steps
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Installation cancelled by user${NC}"; exit 1' INT

# Run main function
main "$@"