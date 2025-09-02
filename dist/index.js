/**
 * FLCM Programmatic Interface
 * Pre-compiled version for easy installation
 */

const path = require('path');
const fs = require('fs');

// Re-export CLI functionality for programmatic use
const flcm = {
  version: '2.0.0',
  
  getStatus: () => {
    const installDir = path.dirname(__dirname);
    const flcmCoreDir = path.join(installDir, 'flcm-core');
    
    return {
      version: '2.0.0',
      installPath: installDir,
      coreModulesAvailable: fs.existsSync(flcmCoreDir),
      agents: fs.existsSync(path.join(flcmCoreDir, 'agents')) ? 
        fs.readdirSync(path.join(flcmCoreDir, 'agents')).filter(f => f.endsWith('.yaml') || f.endsWith('.ts')).length : 0
    };
  },
  
  getConfig: () => {
    const installDir = path.dirname(__dirname);
    const envPath = path.join(installDir, '.env');
    const coreConfigPath = path.join(installDir, 'flcm-core', 'core-config.yaml');
    
    return {
      version: '2.0.0',
      hasEnvFile: fs.existsSync(envPath),
      hasCoreConfig: fs.existsSync(coreConfigPath),
      installDir: installDir
    };
  }
};

module.exports = flcm;
