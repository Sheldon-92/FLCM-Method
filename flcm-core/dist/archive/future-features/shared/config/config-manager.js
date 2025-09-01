"use strict";
/**
 * FLCM Configuration Manager
 * Handles loading, validation, merging, and hot-reload of configuration
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
exports.loadConfig = exports.configManager = exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const events_1 = require("events");
const config_schema_1 = require("./config-schema");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('ConfigManager');
/**
 * Configuration file priority order (highest to lowest)
 */
const CONFIG_PRIORITY = [
    './.flcm-config.yaml',
    './.flcm-config.yml',
    '~/.flcm/config.yaml',
    '~/.flcm/config.yml',
    './.flcm-core/core-config.yaml',
    './.flcm-core/core-config.yml', // Alternative extension
];
/**
 * Configuration Manager
 * Manages all configuration loading, validation, and updates
 */
class ConfigManager extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.watchers = new Map();
        this.options = {
            watchEnabled: false,
            envPrefix: 'FLCM_',
            strictValidation: true,
            ...options,
        };
        this.config = (0, config_schema_1.getDefaultConfig)();
    }
    /**
     * Load configuration from files and environment
     */
    async load(customPath) {
        try {
            // Find configuration file
            const configPath = customPath || this.findConfigFile();
            if (!configPath) {
                logger.warn('No configuration file found, using defaults');
                this.config = (0, config_schema_1.getDefaultConfig)();
                return this.config;
            }
            this.configPath = configPath;
            logger.info(`Loading configuration from: ${configPath}`);
            // Load and parse YAML
            const configContent = await fs.promises.readFile(configPath, 'utf8');
            const rawConfig = yaml.load(configContent);
            // Apply environment variable overrides
            const configWithEnv = this.applyEnvironmentOverrides(rawConfig);
            // Validate configuration
            const validation = this.validate(configWithEnv);
            if (!validation.valid) {
                if (this.options.strictValidation) {
                    throw new Error(`Configuration validation failed: ${validation.errors?.join(', ')}`);
                }
                else {
                    logger.warn(`Configuration warnings: ${validation.warnings?.join(', ')}`);
                }
            }
            // Merge with defaults
            this.config = this.merge((0, config_schema_1.getDefaultConfig)(), configWithEnv);
            // Set up file watching if enabled
            if (this.options.watchEnabled) {
                this.setupWatcher(configPath);
            }
            logger.info('Configuration loaded successfully');
            this.emit('loaded', this.config);
            return this.config;
        }
        catch (error) {
            logger.error('Failed to load configuration:', error);
            throw error;
        }
    }
    /**
     * Find the highest priority configuration file that exists
     */
    findConfigFile() {
        const expandHome = (filepath) => {
            if (filepath.startsWith('~/')) {
                return path.join(process.env.HOME || '', filepath.slice(2));
            }
            return filepath;
        };
        for (const configPath of CONFIG_PRIORITY) {
            const fullPath = path.resolve(expandHome(configPath));
            if (fs.existsSync(fullPath)) {
                return fullPath;
            }
        }
        return undefined;
    }
    /**
     * Apply environment variable overrides
     */
    applyEnvironmentOverrides(config) {
        const result = { ...config };
        const prefix = this.options.envPrefix;
        // Process environment variables
        for (const [key, value] of Object.entries(process.env)) {
            if (!key.startsWith(prefix))
                continue;
            // Convert FLCM_MAIN_TIMEOUT to main.timeout
            const configPath = key
                .slice(prefix.length)
                .toLowerCase()
                .split('_')
                .join('.');
            this.setDeepValue(result, configPath, this.parseEnvValue(value));
        }
        return result;
    }
    /**
     * Parse environment variable value to appropriate type
     */
    parseEnvValue(value) {
        if (!value)
            return undefined;
        // Boolean
        if (value.toLowerCase() === 'true')
            return true;
        if (value.toLowerCase() === 'false')
            return false;
        // Number
        if (/^\d+$/.test(value))
            return parseInt(value, 10);
        if (/^\d+\.\d+$/.test(value))
            return parseFloat(value);
        // Array (comma-separated)
        if (value.includes(',')) {
            return value.split(',').map(v => v.trim());
        }
        // String
        return value;
    }
    /**
     * Set a value deep in an object using dot notation
     */
    setDeepValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    /**
     * Validate configuration against schema
     */
    validate(config) {
        try {
            const result = config_schema_1.FLCMConfigSchema.safeParse(config);
            if (result.success) {
                return { valid: true };
            }
            const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return {
                valid: false,
                errors,
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [`Validation error: ${error}`],
            };
        }
    }
    /**
     * Merge configurations with proper precedence
     */
    merge(base, override) {
        const merged = this.deepMerge(base, override);
        // Ensure version compatibility
        if (override.version && !this.isVersionCompatible(base.version, override.version)) {
            logger.warn(`Version mismatch: base=${base.version}, override=${override.version}`);
        }
        return merged;
    }
    /**
     * Deep merge two objects
     */
    deepMerge(base, override) {
        if (!override)
            return base;
        if (!base)
            return override;
        const result = { ...base };
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
                    result[key] = this.deepMerge(base[key], override[key]);
                }
                else {
                    result[key] = override[key];
                }
            }
        }
        return result;
    }
    /**
     * Check version compatibility
     */
    isVersionCompatible(baseVersion, overrideVersion) {
        const [baseMajor] = baseVersion.split('.').map(Number);
        const [overrideMajor] = overrideVersion.split('.').map(Number);
        return baseMajor === overrideMajor;
    }
    /**
     * Set up file watcher for hot-reload
     */
    setupWatcher(configPath) {
        // Clear existing watcher
        if (this.watchers.has(configPath)) {
            this.watchers.get(configPath)?.close();
        }
        const watcher = fs.watch(configPath, (eventType) => {
            if (eventType === 'change') {
                // Debounce reload
                if (this.reloadTimer) {
                    clearTimeout(this.reloadTimer);
                }
                this.reloadTimer = setTimeout(() => {
                    logger.info('Configuration file changed, reloading...');
                    this.reload();
                }, 500);
            }
        });
        this.watchers.set(configPath, watcher);
        logger.info(`Watching configuration file: ${configPath}`);
    }
    /**
     * Reload configuration
     */
    async reload() {
        try {
            const oldConfig = { ...this.config };
            await this.load(this.configPath);
            // Emit change event with old and new configs
            this.emit('changed', {
                old: oldConfig,
                new: this.config,
            });
            logger.info('Configuration reloaded successfully');
        }
        catch (error) {
            logger.error('Failed to reload configuration:', error);
            this.emit('reload-error', error);
        }
    }
    /**
     * Watch for configuration changes
     */
    watch(callback) {
        this.on('changed', ({ new: newConfig }) => {
            callback(newConfig);
        });
        // Enable watching if not already enabled
        if (!this.options.watchEnabled && this.configPath) {
            this.options.watchEnabled = true;
            this.setupWatcher(this.configPath);
        }
    }
    /**
     * Get configuration value by path
     */
    get(path) {
        const parts = path.split('.');
        let current = this.config;
        for (const part of parts) {
            if (current[part] === undefined) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    /**
     * Set configuration value by path (runtime only, not persisted)
     */
    set(path, value) {
        this.setDeepValue(this.config, path, value);
        this.emit('runtime-change', { path, value });
    }
    /**
     * Get the current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Stop watching configuration files
     */
    stopWatching() {
        for (const [path, watcher] of this.watchers) {
            watcher.close();
            logger.info(`Stopped watching: ${path}`);
        }
        this.watchers.clear();
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = undefined;
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        this.stopWatching();
        this.removeAllListeners();
    }
}
exports.ConfigManager = ConfigManager;
// Export singleton instance for convenience
exports.configManager = new ConfigManager();
// Export default function for quick loading
async function loadConfig(options) {
    const manager = new ConfigManager(options);
    return manager.load();
}
exports.loadConfig = loadConfig;
//# sourceMappingURL=config-manager.js.map