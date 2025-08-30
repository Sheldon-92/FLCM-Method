#!/usr/bin/env node

/**
 * FLCM Installation Script (Node.js version)
 * Cross-platform installer for FLCM
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FLCM_VERSION = '1.0.0';
const DEFAULT_INSTALL_DIR = './flcm';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

// Helper function to print colored messages
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Banner
function showBanner() {
  console.log('');
  console.log('==========================================');
  console.log('  FLCM - Friction Lab Content Maker');
  console.log(`  Version: ${FLCM_VERSION}`);
  console.log('==========================================');
  console.log('');
}

// Check dependencies
function checkDependencies() {
  print('🔍 Checking dependencies...', 'blue');
  
  try {
    const nodeVersion = process.version;
    print(`✅ Node.js found: ${nodeVersion}`, 'green');
    
    const npmVersion = execSync('npm -v', { encoding: 'utf8' }).trim();
    print(`✅ npm found: ${npmVersion}`, 'green');
    
    return true;
  } catch (error) {
    print('❌ npm is not installed. Please install npm first.', 'red');
    return false;
  }
}

// Create installation directory
function createInstallDir(installDir) {
  if (fs.existsSync(installDir)) {
    print(`⚠️  Installation directory already exists: ${installDir}`, 'yellow');
    print('Please remove it manually if you want to reinstall.', 'yellow');
    return false;
  }
  
  print(`📁 Creating installation directory: ${installDir}`, 'blue');
  fs.mkdirSync(installDir, { recursive: true });
  return true;
}

// Copy directory recursively
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItem => {
      copyRecursive(
        path.join(src, childItem),
        path.join(dest, childItem)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy FLCM core files
function copyFlcmCore(installDir) {
  print('📦 Copying FLCM core files...', 'blue');
  
  const scriptDir = __dirname;
  const excludeFiles = ['install.sh', 'install.js', '.DS_Store'];
  
  // Get all items in source directory
  const items = fs.readdirSync(scriptDir);
  
  items.forEach(item => {
    if (!excludeFiles.includes(item)) {
      const srcPath = path.join(scriptDir, item);
      const destPath = path.join(installDir, item);
      copyRecursive(srcPath, destPath);
    }
  });
  
  print('✅ Core files copied', 'green');
}

// Setup Claude integration
function setupClaudeIntegration(installDir) {
  print('🔌 Setting up Claude Code integration...', 'blue');
  
  const parentDir = path.dirname(installDir);
  const claudePath = path.join(parentDir, '.claude');
  const claudeCommandsPath = path.join(claudePath, 'commands', 'FLCM');
  
  if (!fs.existsSync(claudeCommandsPath)) {
    print('📝 Creating Claude configuration directory...', 'yellow');
    fs.mkdirSync(claudeCommandsPath, { recursive: true });
  }
  
  const templatePath = path.join(installDir, '.claude-template', 'commands', 'FLCM', 'flcm.md');
  if (fs.existsSync(templatePath)) {
    const destPath = path.join(claudeCommandsPath, 'flcm.md');
    fs.copyFileSync(templatePath, destPath);
    print('✅ Claude command installed: /flcm', 'green');
  } else {
    print('⚠️  Claude template not found, skipping Claude integration', 'yellow');
  }
}

// Setup package.json
function setupPackageJson(installDir) {
  print('📋 Setting up package.json...', 'blue');
  
  const packageJsonPath = path.join(installDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    const packageJson = {
      name: 'flcm',
      version: '1.0.0',
      description: 'FLCM - Friction Lab Content Maker',
      main: 'index.js',
      scripts: {
        test: 'node tests/validate-phase1.js',
        validate: 'node tests/validate-phase1.js',
        flcm: 'node flcm'
      },
      keywords: ['content', 'creation', 'ai', 'automation'],
      author: 'Friction Lab',
      license: 'MIT',
      dependencies: {
        'js-yaml': '^4.1.0'
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'typescript': '^5.0.0'
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    print('✅ package.json created', 'green');
  } else {
    print('⚠️  package.json already exists, skipping', 'yellow');
  }
}

// Install dependencies
function installDependencies(installDir) {
  print('📦 Installing dependencies...', 'blue');
  
  try {
    process.chdir(installDir);
    execSync('npm install js-yaml --save', { stdio: 'ignore' });
    print('✅ Dependencies installed', 'green');
  } catch (error) {
    print('⚠️  Could not install js-yaml, continuing without it', 'yellow');
  }
}

// Create CLI wrapper
function createCliWrapper(installDir) {
  print('🚀 Creating CLI wrapper...', 'blue');
  
  const cliScript = `#!/usr/bin/env node

/**
 * FLCM CLI Wrapper
 * Command-line interface for FLCM
 */

const path = require('path');
const fs = require('fs');

// Convert TypeScript commands to JavaScript if needed
function loadCommand() {
  const jsPath = path.join(__dirname, 'commands', 'index.js');
  const tsPath = path.join(__dirname, 'commands', 'index.ts');
  
  // Try JavaScript first
  if (fs.existsSync(jsPath)) {
    return require(jsPath);
  }
  
  // If only TypeScript exists, provide instructions
  if (fs.existsSync(tsPath)) {
    console.log('FLCM requires TypeScript compilation.');
    console.log('Please run: npx tsc');
    process.exit(1);
  }
  
  console.error('FLCM commands not found. Please reinstall.');
  process.exit(1);
}

// Load FLCM
try {
  const { flcm } = loadCommand();
  
  // Get command from arguments
  const args = process.argv.slice(2);
  const command = args.join(' ') || 'help';
  
  // Execute command
  flcm(command).catch(console.error);
} catch (error) {
  console.error('Error loading FLCM:', error.message);
  process.exit(1);
}
`;
  
  const cliPath = path.join(installDir, 'flcm');
  fs.writeFileSync(cliPath, cliScript);
  
  // Make executable on Unix-like systems
  if (process.platform !== 'win32') {
    fs.chmodSync(cliPath, '755');
  }
  
  // Create batch file for Windows
  if (process.platform === 'win32') {
    const batchScript = `@echo off
node "%~dp0\\flcm" %*
`;
    fs.writeFileSync(path.join(installDir, 'flcm.bat'), batchScript);
  }
  
  print('✅ CLI wrapper created', 'green');
}

// Create simplified JavaScript command entry point
function createJsCommands(installDir) {
  print('📝 Creating JavaScript command entry...', 'blue');
  
  const jsCommand = `/**
 * FLCM Command Entry Point (Simplified JavaScript version)
 */

const fs = require('fs');
const path = require('path');

// Simple command router
async function flcm(input = 'help') {
  const parts = input.trim().split(' ');
  const command = parts[0] || 'help';
  
  console.log('');
  console.log('🚀 FLCM - Friction Lab Content Maker');
  console.log('Version: 1.0.0');
  console.log('');
  
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'init':
      console.log('Initializing FLCM system...');
      console.log('✅ FLCM is ready to use!');
      break;
      
    case 'validate':
    case 'test':
      runValidation();
      break;
      
    default:
      console.log(\`Unknown command: \${command}\`);
      console.log('Run "flcm help" for available commands');
  }
}

function showHelp() {
  console.log('Available commands:');
  console.log('  help      - Show this help message');
  console.log('  init      - Initialize FLCM system');
  console.log('  status    - Check system status');
  console.log('  validate  - Run validation tests');
  console.log('');
  console.log('For full TypeScript version with all features:');
  console.log('  1. Install TypeScript: npm install -g typescript');
  console.log('  2. Compile: npx tsc');
  console.log('  3. Run: ./flcm <command>');
}

function showStatus() {
  console.log('📊 System Status:');
  console.log('  Core: ✅ Installed');
  
  // Check for TypeScript files
  const hasTsFiles = fs.existsSync(path.join(__dirname, '..', 'commands', 'index.ts'));
  const hasJsFiles = fs.existsSync(path.join(__dirname, '..', 'commands', 'index.js'));
  
  if (hasJsFiles) {
    console.log('  Commands: ✅ Compiled');
  } else if (hasTsFiles) {
    console.log('  Commands: ⚠️  TypeScript (needs compilation)');
  } else {
    console.log('  Commands: ❌ Not found');
  }
  
  // Check for config
  const hasConfig = fs.existsSync(path.join(__dirname, '..', 'core-config.yaml'));
  console.log(\`  Config: \${hasConfig ? '✅' : '❌'} \${hasConfig ? 'Found' : 'Not found'}\`);
}

function runValidation() {
  const validationPath = path.join(__dirname, '..', 'tests', 'validate-phase1.js');
  if (fs.existsSync(validationPath)) {
    require(validationPath);
  } else {
    console.log('❌ Validation script not found');
  }
}

module.exports = { flcm };

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  flcm(args.join(' ')).catch(console.error);
}
`;
  
  const commandsDir = path.join(installDir, 'commands');
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }
  
  // Only create if index.js doesn't exist
  const jsPath = path.join(commandsDir, 'index.js');
  if (!fs.existsSync(jsPath)) {
    fs.writeFileSync(jsPath, jsCommand);
    print('✅ JavaScript commands created', 'green');
  }
}

// Validate installation
function validateInstallation(installDir) {
  print('🔍 Validating installation...', 'blue');
  
  const validationScript = path.join(installDir, 'tests', 'validate-phase1.js');
  if (fs.existsSync(validationScript)) {
    try {
      require(validationScript);
      print('✅ Installation validated', 'green');
    } catch (error) {
      print('⚠️  Some validation tests failed, but installation completed', 'yellow');
    }
  } else {
    print('⚠️  Validation script not found', 'yellow');
  }
}

// Show completion message
function showCompletion(installDir) {
  console.log('');
  print('🎉 FLCM installation completed successfully!', 'green');
  console.log('');
  console.log(`Installation directory: ${installDir}`);
  console.log('');
  console.log('To get started:');
  console.log(`  cd ${installDir}`);
  
  if (process.platform === 'win32') {
    console.log('  flcm.bat help');
  } else {
    console.log('  ./flcm help');
  }
  
  console.log('');
  console.log('Or use with Claude Code:');
  console.log('  /flcm');
  console.log('');
  console.log('For TypeScript support (full features):');
  console.log('  npm install -g typescript');
  console.log('  npx tsc');
  console.log('');
}

// Main installation function
async function install() {
  showBanner();
  
  // Get installation directory from command line or use default
  const installDir = process.argv[2] || DEFAULT_INSTALL_DIR;
  
  print('Starting FLCM installation...', 'blue');
  console.log('');
  
  // Step 1: Check dependencies
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Step 2: Create installation directory
  if (!createInstallDir(installDir)) {
    process.exit(1);
  }
  
  try {
    // Step 3: Copy FLCM core files
    copyFlcmCore(installDir);
    
    // Step 4: Setup Claude integration
    setupClaudeIntegration(installDir);
    
    // Step 5: Setup package.json
    setupPackageJson(installDir);
    
    // Step 6: Install dependencies
    installDependencies(installDir);
    
    // Step 7: Create JavaScript commands
    createJsCommands(installDir);
    
    // Step 8: Create CLI wrapper
    createCliWrapper(installDir);
    
    // Step 9: Validate installation
    validateInstallation(installDir);
    
    // Step 10: Show completion message
    showCompletion(installDir);
    
  } catch (error) {
    print(`❌ Installation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run installation
if (require.main === module) {
  install().catch(error => {
    print(`❌ Installation error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { install };