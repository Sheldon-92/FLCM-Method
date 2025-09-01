# Installation Guide

## System Requirements

Before installing FLCM 2.0, ensure your system meets these requirements:

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows 10+
- **Node.js**: Version 18.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 1GB free space
- **Internet**: Required for initial setup and content processing

### Recommended Setup
- **Operating System**: Ubuntu 20.04+ or macOS 12+
- **Node.js**: Version 18.17+ (LTS)
- **RAM**: 16GB for optimal performance
- **Disk Space**: 5GB+ for workspace and cache
- **Shell**: Bash or Zsh (for installation scripts)

## Quick Installation

The fastest way to get FLCM 2.0 running is using our automated installer:

```bash
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

This will:
1. Check system requirements
2. Install FLCM 2.0 to `~/.flcm`
3. Add FLCM to your PATH
4. Run initial configuration
5. Verify installation

### Alternative Quick Install (No Build Required)

If you encounter build issues, use the pre-built version:

```bash
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install-no-build.sh | bash
```

## Manual Installation

For more control over the installation process:

### 1. Download FLCM 2.0

```bash
# Clone the repository
git clone https://github.com/Sheldon-92/FLCM-Method.git
cd FLCM-Method

# Or download the latest release
curl -L https://github.com/Sheldon-92/FLCM-Method/releases/latest/download/flcm-v2.0.0.tar.gz | tar -xz
```

### 2. Install Dependencies

```bash
cd flcm-core
npm install
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Install Globally

```bash
# Add to PATH (add to your shell profile)
echo 'export PATH="$HOME/.flcm/flcm-core/dist:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Or create symlink
ln -sf "$(pwd)/dist/index.js" /usr/local/bin/flcm
chmod +x /usr/local/bin/flcm
```

### 5. Initialize Configuration

```bash
flcm init
```

## Platform-Specific Installation

### macOS

#### Using Homebrew (Recommended)

```bash
# Add FLCM tap (coming soon)
brew tap sheldon-92/flcm
brew install flcm

# Or install directly from URL
brew install https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/flcm.rb
```

#### Manual macOS Installation

```bash
# Ensure you have Command Line Tools
xcode-select --install

# Install using our script
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### Linux (Ubuntu/Debian)

```bash
# Update packages
sudo apt update

# Install Node.js if not present
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install FLCM
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### Linux (CentOS/RHEL)

```bash
# Install Node.js if not present
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install FLCM
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

### Windows

#### Using PowerShell (Recommended)

```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install using PowerShell script
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.ps1'))
```

#### Using WSL (Alternative)

```bash
# Install WSL2 if not present
wsl --install

# Inside WSL, use the Linux installation method
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install.sh | bash
```

## Docker Installation

For containerized deployment:

### Using Docker Compose (Recommended)

```bash
# Download docker-compose.yml
curl -O https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/docker-compose.yml

# Start FLCM
docker-compose up -d

# Initialize
docker-compose exec flcm flcm init
```

### Using Docker Run

```bash
# Pull the image
docker pull sheldon92/flcm:latest

# Run FLCM
docker run -d \\
  --name flcm \\
  -v ~/.flcm:/app/data \\
  -p 3000:3000 \\
  sheldon92/flcm:latest

# Initialize
docker exec -it flcm flcm init
```

## Development Installation

For contributing or advanced customization:

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/FLCM-Method.git
cd FLCM-Method
git remote add upstream https://github.com/Sheldon-92/FLCM-Method.git
```

### 2. Install Development Dependencies

```bash
cd flcm-core
npm install
npm install -g typescript ts-node nodemon
```

### 3. Set up Development Environment

```bash
# Copy environment template
cp ../.env.example .env

# Edit configuration
nano .env
```

### 4. Run in Development Mode

```bash
npm run dev
```

## Installation Verification

After installation, verify everything is working:

### 1. Check Version

```bash
flcm --version
# Should output: FLCM 2.0.x
```

### 2. Run Health Check

```bash
flcm health
# Should show all systems healthy
```

### 3. Test Basic Functionality

```bash
# Initialize a test project
mkdir test-flcm && cd test-flcm
flcm init

# Test content processing
echo "# Test Content" > test.md
flcm process test.md
```

## Configuration

### Initial Configuration

After installation, run the configuration wizard:

```bash
flcm configure
```

This will guide you through:
- Setting up your workspace
- Configuring agents
- Setting methodologies preferences
- Connecting to external services (optional)

### Manual Configuration

Edit the configuration file directly:

```bash
# Open configuration in your editor
flcm config edit

# Or edit manually
nano ~/.flcm/core-config.yaml
```

## Troubleshooting Installation

### Common Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# If too old, update using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Permission Issues (Linux/macOS)

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

#### Build Failures

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use pre-built version
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/install-no-build.sh | bash
```

#### Path Issues

```bash
# Check if FLCM is in PATH
which flcm

# If not found, add to PATH
echo 'export PATH="$HOME/.flcm/flcm-core/dist:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Getting Help

If you encounter issues:

1. **Check the logs**: `flcm logs`
2. **Run diagnostics**: `flcm doctor`
3. **Check documentation**: Visit [flcm-docs.netlify.app](https://flcm-docs.netlify.app)
4. **Report issues**: [GitHub Issues](https://github.com/Sheldon-92/FLCM-Method/issues)
5. **Join community**: [Discussions](https://github.com/Sheldon-92/FLCM-Method/discussions)

## Next Steps

After successful installation:

1. **[Quick Start Guide](/guide/quick-start)** - Get up and running in 5 minutes
2. **[Configuration Guide](/guide/configuration)** - Customize FLCM for your needs
3. **[Core Concepts](/guide/agents)** - Understand how FLCM works
4. **[Examples](/examples/)** - See FLCM in action

## Uninstalling FLCM 2.0

If you need to remove FLCM:

```bash
# Using the uninstall script
curl -sSL https://raw.githubusercontent.com/Sheldon-92/FLCM-Method/main/uninstall.sh | bash

# Or manually
rm -rf ~/.flcm
# Remove PATH entry from your shell profile
```

---

**Need help?** Check our [Troubleshooting Guide](/guide/troubleshooting) or [open an issue](https://github.com/Sheldon-92/FLCM-Method/issues).