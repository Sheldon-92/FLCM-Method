#!/bin/bash

# FLCM Deployment Script
# Pushes the project to GitHub

set -e

echo "🚀 FLCM Deployment Script"
echo "========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in FLCM project directory"
    echo "Please run this script from the project root"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add GitHub remote if not exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/Sheldon-92/FLCM-Method.git
else
    echo "✅ GitHub remote already configured"
fi

# Build the project to ensure it works
echo "🔨 Building project..."
npm run build

# Test the CLI
echo "🧪 Testing CLI..."
node dist/cli.js --version

# Stage all files
echo "📋 Staging files for commit..."
git add .

# Create commit message
COMMIT_MSG="Deploy FLCM v1.0.0 - Production ready

- Complete CLI implementation
- One-line installation script
- GitHub Actions CI/CD
- Docker support
- Comprehensive documentation"

# Commit changes
echo "💾 Creating commit..."
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Your FLCM project is now live at:"
echo "    https://github.com/Sheldon-92/FLCM-Method"
echo ""
echo "👥 Users can now install with:"
echo "    curl -fsSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash"
echo ""
echo "🌟 Don't forget to star your own repository!"