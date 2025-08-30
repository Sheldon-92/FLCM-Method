/**
 * Configuration Loader for FLCM System
 * Handles loading, validation, and merging of configuration files
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ConfigLoader {
    constructor() {
        this.basePath = path.join(process.cwd(), '.flcm-core');
        this.coreConfigPath = path.join(this.basePath, 'core-config.yaml');
        this.userConfigPath = path.join(this.basePath, 'data', 'user-config.yaml');
        this.config = null;
        this.fileWatcher = null;
    }

    /**
     * Load and merge configuration files
     * @returns {Object} Merged configuration object
     */
    load() {
        try {
            // Load core configuration
            const coreConfig = this.loadYamlFile(this.coreConfigPath);
            
            // Load user configuration if exists
            let userConfig = {};
            if (fs.existsSync(this.userConfigPath)) {
                userConfig = this.loadYamlFile(this.userConfigPath);
            }
            
            // Merge configurations (user overrides core)
            this.config = this.mergeConfigs(coreConfig, userConfig);
            
            // Validate merged configuration
            this.validateConfig(this.config);
            
            return this.config;
        } catch (error) {
            console.error('Configuration loading failed:', error.message);
            throw error;
        }
    }

    /**
     * Load YAML file and parse it
     * @param {string} filePath - Path to YAML file
     * @returns {Object} Parsed YAML object
     */
    loadYamlFile(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return yaml.load(fileContent);
        } catch (error) {
            throw new Error(`Failed to load ${filePath}: ${error.message}`);
        }
    }

    /**
     * Merge two configuration objects (deep merge)
     * @param {Object} base - Base configuration
     * @param {Object} override - Override configuration
     * @returns {Object} Merged configuration
     */
    mergeConfigs(base, override) {
        const merged = { ...base };
        
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
                    merged[key] = this.mergeConfigs(base[key] || {}, override[key]);
                } else {
                    merged[key] = override[key];
                }
            }
        }
        
        return merged;
    }

    /**
     * Validate configuration against schema
     * @param {Object} config - Configuration to validate
     * @throws {Error} If configuration is invalid
     */
    validateConfig(config) {
        // Check required fields
        if (!config.system || !config.system.version) {
            throw new Error('Configuration must include system.version');
        }
        
        // Validate mode
        const validModes = ['development', 'production'];
        if (config.system.mode && !validModes.includes(config.system.mode)) {
            throw new Error(`Invalid mode: ${config.system.mode}. Must be one of: ${validModes.join(', ')}`);
        }
        
        // Validate agents
        if (config.agents) {
            const validAgents = ['collector', 'scholar', 'creator', 'adapter'];
            for (const agent in config.agents) {
                if (!validAgents.includes(agent)) {
                    throw new Error(`Invalid agent: ${agent}. Must be one of: ${validAgents.join(', ')}`);
                }
            }
        }
        
        // Validate workflows
        if (config.workflows) {
            const validWorkflows = ['quick_mode', 'standard_mode'];
            for (const workflow in config.workflows) {
                if (!validWorkflows.includes(workflow)) {
                    throw new Error(`Invalid workflow: ${workflow}. Must be one of: ${validWorkflows.join(', ')}`);
                }
            }
        }
        
        // Validate file paths
        if (config.paths) {
            for (const [key, value] of Object.entries(config.paths)) {
                if (typeof value !== 'string') {
                    throw new Error(`Path ${key} must be a string`);
                }
            }
        }
        
        // Validate debug settings
        if (config.debug) {
            const validLogLevels = ['debug', 'info', 'warning', 'error'];
            if (config.debug.log_level && !validLogLevels.includes(config.debug.log_level)) {
                throw new Error(`Invalid log level: ${config.debug.log_level}`);
            }
        }
    }

    /**
     * Enable hot-reload for configuration files
     * @param {Function} callback - Callback to execute on config change
     */
    enableHotReload(callback) {
        // Watch core config
        this.watchFile(this.coreConfigPath, callback);
        
        // Watch user config if it exists
        if (fs.existsSync(this.userConfigPath)) {
            this.watchFile(this.userConfigPath, callback);
        }
    }

    /**
     * Watch a file for changes
     * @param {string} filePath - File to watch
     * @param {Function} callback - Callback on change
     */
    watchFile(filePath, callback) {
        fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
                console.log(`Configuration file changed: ${filePath}`);
                try {
                    const oldConfig = this.config;
                    this.load();
                    console.log('Configuration reloaded successfully');
                    if (callback) {
                        callback(this.config, oldConfig);
                    }
                } catch (error) {
                    console.error('Failed to reload configuration:', error.message);
                    console.log('Keeping previous valid configuration');
                }
            }
        });
    }

    /**
     * Disable hot-reload
     */
    disableHotReload() {
        fs.unwatchFile(this.coreConfigPath);
        if (fs.existsSync(this.userConfigPath)) {
            fs.unwatchFile(this.userConfigPath);
        }
    }

    /**
     * Get a configuration value by path
     * @param {string} path - Dot-separated path (e.g., 'agents.collector.enabled')
     * @param {*} defaultValue - Default value if path not found
     * @returns {*} Configuration value
     */
    get(path, defaultValue = null) {
        if (!this.config) {
            this.load();
        }
        
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} True if enabled
     */
    isEnabled(feature) {
        return this.get(feature + '.enabled', false) === true;
    }
}

// Export singleton instance
module.exports = new ConfigLoader();