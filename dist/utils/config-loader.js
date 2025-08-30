"use strict";
/**
 * Configuration Loader for FLCM System (TypeScript version)
 * Handles loading, validation, and merging of configuration files
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
class ConfigLoader {
    constructor() {
        this.config = null;
        this.watchers = new Map();
        this.basePath = path.join(process.cwd(), '.flcm-core');
        this.coreConfigPath = path.join(this.basePath, 'core-config.yaml');
        this.userConfigPath = path.join(this.basePath, 'data', 'user-config.yaml');
    }
    /**
     * Load and merge configuration files
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
        }
        catch (error) {
            console.error('Configuration loading failed:', error.message);
            throw error;
        }
    }
    /**
     * Load YAML file and parse it
     */
    loadYamlFile(filePath) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return yaml.load(fileContent);
        }
        catch (error) {
            throw new Error(`Failed to load ${filePath}: ${error.message}`);
        }
    }
    /**
     * Merge two configuration objects (deep merge)
     */
    mergeConfigs(base, override) {
        const merged = { ...base };
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                if (typeof override[key] === 'object' &&
                    override[key] !== null &&
                    !Array.isArray(override[key])) {
                    merged[key] = this.mergeConfigs(base[key] || {}, override[key]);
                }
                else {
                    merged[key] = override[key];
                }
            }
        }
        return merged;
    }
    /**
     * Validate configuration against schema
     */
    validateConfig(config) {
        // Check required fields
        if (!config.system || !config.system.version) {
            throw new Error('Configuration must include system.version');
        }
        // Validate mode
        const validModes = ['development', 'production'];
        if (config.system.mode && !validModes.includes(config.system.mode)) {
            throw new Error(`Invalid mode: ${config.system.mode}`);
        }
        // Validate agents
        if (config.agents) {
            const validAgents = ['collector', 'scholar', 'creator', 'adapter'];
            for (const agent in config.agents) {
                if (!validAgents.includes(agent)) {
                    throw new Error(`Invalid agent: ${agent}`);
                }
            }
        }
        // Validate workflows
        if (config.workflows) {
            const validWorkflows = ['quick_mode', 'standard_mode'];
            for (const workflow in config.workflows) {
                if (!validWorkflows.includes(workflow)) {
                    throw new Error(`Invalid workflow: ${workflow}`);
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
     */
    watchFile(filePath, callback) {
        if (this.watchers.has(filePath)) {
            return; // Already watching
        }
        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                console.log(`Configuration file changed: ${filePath}`);
                try {
                    const oldConfig = this.config;
                    this.load();
                    console.log('Configuration reloaded successfully');
                    if (callback && oldConfig) {
                        callback(this.config, oldConfig);
                    }
                }
                catch (error) {
                    console.error('Failed to reload configuration:', error.message);
                    console.log('Keeping previous valid configuration');
                }
            }
        });
        this.watchers.set(filePath, watcher);
    }
    /**
     * Disable hot-reload
     */
    disableHotReload() {
        for (const [path, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
    }
    /**
     * Get a configuration value by path
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
            }
            else {
                return defaultValue;
            }
        }
        return value;
    }
    /**
     * Check if a feature is enabled
     */
    isEnabled(feature) {
        return this.get(feature + '.enabled', false) === true;
    }
    /**
     * Get the current configuration
     */
    getConfig() {
        if (!this.config) {
            this.load();
        }
        return this.config;
    }
    /**
     * Save user configuration
     */
    saveUserConfig(userConfig) {
        try {
            const yamlStr = yaml.dump(userConfig);
            fs.writeFileSync(this.userConfigPath, yamlStr, 'utf8');
            console.log('User configuration saved successfully');
            // Reload to apply changes
            this.load();
        }
        catch (error) {
            throw new Error(`Failed to save user configuration: ${error.message}`);
        }
    }
}
// Export singleton instance
exports.default = new ConfigLoader();
//# sourceMappingURL=config-loader.js.map