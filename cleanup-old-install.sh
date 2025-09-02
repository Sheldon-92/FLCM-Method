#!/bin/bash

# FLCM Cleanup Script
# Removes old installations and cleans up the mess

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║     FLCM Old Installation Cleanup     ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}This script will help clean up old FLCM installations${NC}"
echo ""

# Check for old installations
OLD_LOCATIONS=(
    "$HOME/.flcm"
    "$HOME/flcm"
    "$HOME/.flcm-core"
    "$HOME/FLCM"
    "$HOME/flcm-test"
    "/opt/flcm"
    "/usr/local/flcm"
)

FOUND_INSTALLATIONS=()

echo -e "${BLUE}🔍 Searching for old installations...${NC}"
echo ""

for location in "${OLD_LOCATIONS[@]}"; do
    if [ -d "$location" ]; then
        # Check if it's actually FLCM
        if [ -f "$location/package.json" ] || [ -f "$location/flcm-core/cli.js" ] || [ -f "$location/install.sh" ]; then
            SIZE=$(du -sh "$location" 2>/dev/null | cut -f1)
            echo -e "  ${YELLOW}Found:${NC} $location (Size: $SIZE)"
            FOUND_INSTALLATIONS+=("$location")
        fi
    fi
done

# Check for global npm installations
if npm list -g flcm &>/dev/null; then
    echo -e "  ${YELLOW}Found:${NC} Global npm package 'flcm'"
    FOUND_INSTALLATIONS+=("npm-global")
fi

# Check for symlinks
SYMLINKS=(
    "$HOME/.local/bin/flcm"
    "/usr/local/bin/flcm"
    "/usr/bin/flcm"
)

for link in "${SYMLINKS[@]}"; do
    if [ -L "$link" ] || [ -f "$link" ]; then
        echo -e "  ${YELLOW}Found:${NC} Command link at $link"
        FOUND_INSTALLATIONS+=("$link")
    fi
done

if [ ${#FOUND_INSTALLATIONS[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ No old FLCM installations found${NC}"
    echo ""
    echo "Your system is clean!"
    exit 0
fi

echo ""
echo -e "${RED}⚠️  Found ${#FOUND_INSTALLATIONS[@]} installation(s)${NC}"
echo ""

# Interactive cleanup
if [ -t 0 ]; then
    echo -e "${YELLOW}Would you like to clean up these installations?${NC}"
    echo ""
    echo "  1) Remove all old installations"
    echo "  2) Select which to remove"
    echo "  3) Cancel (keep everything)"
    echo ""
    read -p "Choose option [1-3]: " choice
    
    case $choice in
        1)
            echo ""
            echo -e "${RED}🗑️  Removing all old installations...${NC}"
            for item in "${FOUND_INSTALLATIONS[@]}"; do
                if [ "$item" == "npm-global" ]; then
                    echo "  Removing global npm package..."
                    npm uninstall -g flcm 2>/dev/null || true
                elif [ -d "$item" ]; then
                    echo "  Removing directory: $item"
                    rm -rf "$item"
                elif [ -f "$item" ] || [ -L "$item" ]; then
                    echo "  Removing file/link: $item"
                    rm -f "$item"
                fi
            done
            echo -e "${GREEN}✅ Cleanup complete!${NC}"
            ;;
            
        2)
            echo ""
            for item in "${FOUND_INSTALLATIONS[@]}"; do
                if [ "$item" == "npm-global" ]; then
                    read -p "Remove global npm package 'flcm'? [y/N]: " remove
                    if [[ $remove =~ ^[Yy]$ ]]; then
                        npm uninstall -g flcm 2>/dev/null || true
                        echo "  Removed"
                    fi
                else
                    read -p "Remove $item? [y/N]: " remove
                    if [[ $remove =~ ^[Yy]$ ]]; then
                        if [ -d "$item" ]; then
                            rm -rf "$item"
                        else
                            rm -f "$item"
                        fi
                        echo "  Removed"
                    fi
                fi
            done
            echo -e "${GREEN}✅ Selected items removed${NC}"
            ;;
            
        *)
            echo -e "${YELLOW}Cancelled - no changes made${NC}"
            exit 0
            ;;
    esac
else
    # Non-interactive mode
    echo -e "${BLUE}Non-interactive mode: Listing locations only${NC}"
    echo ""
    echo "To remove manually, run:"
    for item in "${FOUND_INSTALLATIONS[@]}"; do
        if [ "$item" == "npm-global" ]; then
            echo "  npm uninstall -g flcm"
        elif [ -d "$item" ]; then
            echo "  rm -rf $item"
        else
            echo "  rm -f $item"
        fi
    done
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Cleanup finished!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Install FLCM properly using:"
echo "   ${GREEN}curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install-improved.sh | bash${NC}"
echo ""
echo "2. The new installer will:"
echo "   - Ask where to install (not in home root!)"
echo "   - Create proper command links"
echo "   - Include an uninstaller"
echo ""
echo -e "${YELLOW}Recommended installation path:${NC} ~/.local/share/flcm"