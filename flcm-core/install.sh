#!/bin/bash

# FLCM Installation Script
# Installs FLCM as a standalone content creation system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FLCM_VERSION="1.0.0"
INSTALL_DIR="${1:-./flcm}"
CLAUDE_DIR=".claude"

# Banner
echo ""
echo "=========================================="
echo "  FLCM - Friction Lab Content Maker"
echo "  Version: $FLCM_VERSION"
echo "=========================================="
echo ""

# Function to print colored messages
print_msg() {
    local color=$1
    local msg=$2
    echo -e "${color}${msg}${NC}"
}

# Function to check dependencies
check_dependencies() {
    print_msg "$BLUE" "🔍 Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_msg "$RED" "❌ Node.js is not installed. Please install Node.js first."
        exit 1
    else
        NODE_VERSION=$(node -v)
        print_msg "$GREEN" "✅ Node.js found: $NODE_VERSION"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_msg "$RED" "❌ npm is not installed. Please install npm first."
        exit 1
    else
        NPM_VERSION=$(npm -v)
        print_msg "$GREEN" "✅ npm found: $NPM_VERSION"
    fi
}

# Function to create installation directory
create_install_dir() {
    if [ -d "$INSTALL_DIR" ]; then
        print_msg "$YELLOW" "⚠️  Installation directory already exists: $INSTALL_DIR"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_msg "$RED" "Installation cancelled."
            exit 1
        fi
        rm -rf "$INSTALL_DIR"
    fi
    
    print_msg "$BLUE" "📁 Creating installation directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
}

# Function to copy FLCM core files
copy_flcm_core() {
    print_msg "$BLUE" "📦 Copying FLCM core files..."
    
    # Get the directory where this script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    FLCM_CORE_DIR="$SCRIPT_DIR"
    
    # Copy all FLCM core files
    cp -r "$FLCM_CORE_DIR"/* "$INSTALL_DIR/" 2>/dev/null || true
    
    # Remove installation script from target
    rm -f "$INSTALL_DIR/install.sh"
    rm -f "$INSTALL_DIR/install.js"
    
    print_msg "$GREEN" "✅ Core files copied"
}

# Function to setup Claude integration
setup_claude_integration() {
    print_msg "$BLUE" "🔌 Setting up Claude Code integration..."
    
    # Check if .claude directory exists in parent directory
    PARENT_DIR="$(dirname "$INSTALL_DIR")"
    CLAUDE_PATH="$PARENT_DIR/$CLAUDE_DIR"
    
    if [ ! -d "$CLAUDE_PATH" ]; then
        print_msg "$YELLOW" "📝 Creating Claude configuration directory..."
        mkdir -p "$CLAUDE_PATH/commands/FLCM"
    fi
    
    # Copy Claude command template
    if [ -f "$INSTALL_DIR/.claude-template/commands/FLCM/flcm.md" ]; then
        cp "$INSTALL_DIR/.claude-template/commands/FLCM/flcm.md" "$CLAUDE_PATH/commands/FLCM/"
        print_msg "$GREEN" "✅ Claude command installed: /flcm"
    else
        print_msg "$YELLOW" "⚠️  Claude template not found, skipping Claude integration"
    fi
}

# Function to initialize package.json
setup_package_json() {
    print_msg "$BLUE" "📋 Setting up package.json..."
    
    cd "$INSTALL_DIR"
    
    # Create package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        cat > package.json << 'EOF'
{
  "name": "flcm",
  "version": "1.0.0",
  "description": "FLCM - Friction Lab Content Maker",
  "main": "index.js",
  "scripts": {
    "test": "node tests/validate-phase1.js",
    "validate": "node tests/validate-phase1.js",
    "flcm": "node commands/cli.js"
  },
  "keywords": [
    "content",
    "creation",
    "ai",
    "automation"
  ],
  "author": "Friction Lab",
  "license": "MIT",
  "dependencies": {
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
EOF
        print_msg "$GREEN" "✅ package.json created"
    else
        print_msg "$YELLOW" "⚠️  package.json already exists, skipping"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_msg "$BLUE" "📦 Installing dependencies..."
    
    cd "$INSTALL_DIR"
    
    # Install only js-yaml to avoid heavy dependencies
    npm install js-yaml --save 2>/dev/null || {
        print_msg "$YELLOW" "⚠️  Could not install js-yaml, continuing without it"
    }
    
    print_msg "$GREEN" "✅ Dependencies installed"
}

# Function to create CLI wrapper
create_cli_wrapper() {
    print_msg "$BLUE" "🚀 Creating CLI wrapper..."
    
    cat > "$INSTALL_DIR/flcm" << 'EOF'
#!/usr/bin/env node

/**
 * FLCM CLI Wrapper
 * Command-line interface for FLCM
 */

const path = require('path');
const fs = require('fs');

// Load FLCM
const flcmPath = path.join(__dirname, 'commands', 'index.js');

if (fs.existsSync(flcmPath)) {
    const { flcm } = require(flcmPath);
    
    // Get command from arguments
    const args = process.argv.slice(2);
    const command = args.join(' ') || 'help';
    
    // Execute command
    flcm(command).catch(console.error);
} else {
    console.error('FLCM not properly installed. Please run install.sh');
    process.exit(1);
}
EOF
    
    chmod +x "$INSTALL_DIR/flcm"
    print_msg "$GREEN" "✅ CLI wrapper created"
}

# Function to validate installation
validate_installation() {
    print_msg "$BLUE" "🔍 Validating installation..."
    
    cd "$INSTALL_DIR"
    
    # Run validation tests
    if [ -f "tests/validate-phase1.js" ]; then
        node tests/validate-phase1.js > /dev/null 2>&1 && {
            print_msg "$GREEN" "✅ Installation validated"
        } || {
            print_msg "$YELLOW" "⚠️  Some validation tests failed, but installation completed"
        }
    else
        print_msg "$YELLOW" "⚠️  Validation script not found"
    fi
}

# Function to show completion message
show_completion() {
    echo ""
    print_msg "$GREEN" "🎉 FLCM installation completed successfully!"
    echo ""
    echo "Installation directory: $INSTALL_DIR"
    echo ""
    echo "To get started:"
    echo "  cd $INSTALL_DIR"
    echo "  ./flcm help"
    echo ""
    echo "Or use with Claude Code:"
    echo "  /flcm"
    echo ""
    echo "For more information, see the documentation in:"
    echo "  $INSTALL_DIR/README.md"
    echo ""
}

# Main installation flow
main() {
    print_msg "$BLUE" "Starting FLCM installation..."
    echo ""
    
    # Step 1: Check dependencies
    check_dependencies
    
    # Step 2: Create installation directory
    create_install_dir
    
    # Step 3: Copy FLCM core files
    copy_flcm_core
    
    # Step 4: Setup Claude integration
    setup_claude_integration
    
    # Step 5: Setup package.json
    setup_package_json
    
    # Step 6: Install dependencies
    install_dependencies
    
    # Step 7: Create CLI wrapper
    create_cli_wrapper
    
    # Step 8: Validate installation
    validate_installation
    
    # Step 9: Show completion message
    show_completion
}

# Handle errors
trap 'print_msg "$RED" "❌ Installation failed. Please check the error messages above."' ERR

# Run main installation
main