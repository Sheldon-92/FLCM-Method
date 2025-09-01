"use strict";
/**
 * FLCM Configuration Watcher
 * Monitors configuration files for changes and handles hot-reload
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
exports.createConfigWatcher = exports.ConfigWatcher = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const chokidar = __importStar(require("chokidar"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('ConfigWatcher');
/**
 * Configuration Watcher
 * Advanced file watching with intelligent reload handling
 */
class ConfigWatcher extends events_1.EventEmitter {
    constructor(configManager, options = {}) {
        super();
        this.watchPaths = [];
        this.isWatching = false;
        this.pendingChanges = new Set();
        this.configManager = configManager;
        this.options = {
            debounceMs: 500,
            ignoreInitial: true,
            persistent: true,
            depth: 5,
            followSymlinks: false,
            autoReload: true,
            validateBeforeReload: true,
            ...options,
        };
    }
    /**
     * Start watching configuration files
     */
    async start(paths) {
        if (this.isWatching) {
            logger.warn('Watcher already running');
            return;
        }
        try {
            // Determine paths to watch
            this.watchPaths = paths || this.getDefaultWatchPaths();
            logger.info(`Starting config watcher for: ${this.watchPaths.join(', ')}`);
            // Create chokidar watcher
            this.watcher = chokidar.watch(this.watchPaths, {
                persistent: this.options.persistent,
                ignoreInitial: this.options.ignoreInitial,
                followSymlinks: this.options.followSymlinks,
                depth: this.options.depth,
                awaitWriteFinish: {
                    stabilityThreshold: 200,
                    pollInterval: 100,
                },
            });
            // Set up event handlers
            this.setupEventHandlers();
            // Wait for watcher to be ready
            await new Promise((resolve) => {
                this.watcher.once('ready', () => {
                    this.isWatching = true;
                    logger.info('Config watcher ready');
                    this.emit('ready');
                    resolve();
                });
            });
        }
        catch (error) {
            logger.error('Failed to start config watcher:', error);
            throw error;
        }
    }
    /**
     * Get default paths to watch
     */
    getDefaultWatchPaths() {
        const paths = [
            './.flcm-config.yaml',
            './.flcm-config.yml',
            './.flcm-core/core-config.yaml',
            './.flcm-core/core-config.yml',
        ];
        const homePath = process.env.HOME;
        if (homePath) {
            paths.push(path.join(homePath, '.flcm', 'config.yaml'), path.join(homePath, '.flcm', 'config.yml'));
        }
        // Filter to existing paths
        return paths.filter(p => {
            const resolvedPath = path.resolve(p);
            return fs.existsSync(resolvedPath);
        });
    }
    /**
     * Set up watcher event handlers
     */
    setupEventHandlers() {
        if (!this.watcher)
            return;
        this.watcher.on('add', (filePath) => this.handleFileEvent('added', filePath));
        this.watcher.on('change', (filePath) => this.handleFileEvent('changed', filePath));
        this.watcher.on('unlink', (filePath) => this.handleFileEvent('removed', filePath));
        this.watcher.on('error', (error) => {
            logger.error('Watcher error:', error);
            this.emit('error', error);
        });
    }
    /**
     * Handle file change events
     */
    handleFileEvent(type, filePath) {
        logger.debug(`File ${type}: ${filePath}`);
        // Add to pending changes
        this.pendingChanges.add(filePath);
        // Emit raw event
        this.emit('file-event', { type, path: filePath });
        // Debounce reload
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
        }
        this.reloadTimer = setTimeout(() => {
            this.processChanges();
        }, this.options.debounceMs);
    }
    /**
     * Process accumulated changes
     */
    async processChanges() {
        if (this.pendingChanges.size === 0)
            return;
        const changedFiles = Array.from(this.pendingChanges);
        this.pendingChanges.clear();
        logger.info(`Processing configuration changes in: ${changedFiles.join(', ')}`);
        try {
            // Get current config for comparison
            const oldConfig = this.configManager.getConfig();
            // Determine if we should reload
            if (this.options.autoReload) {
                await this.reloadConfiguration(oldConfig, changedFiles);
            }
            else {
                // Just notify about changes
                this.emit('changes-detected', {
                    files: changedFiles,
                    oldConfig,
                });
            }
        }
        catch (error) {
            logger.error('Error processing configuration changes:', error);
            this.emit('reload-error', error);
        }
    }
    /**
     * Reload configuration
     */
    async reloadConfiguration(oldConfig, changedFiles) {
        try {
            // Validate before reload if requested
            if (this.options.validateBeforeReload) {
                const validationResult = await this.validateChangedFiles(changedFiles);
                if (!validationResult.valid) {
                    logger.warn('Configuration validation failed, skipping reload');
                    this.emit('validation-failed', validationResult);
                    return;
                }
            }
            // Reload configuration
            await this.configManager.reload();
            const newConfig = this.configManager.getConfig();
            // Detect what changed
            const changes = this.detectChanges(oldConfig, newConfig);
            // Emit change event
            this.emit('config-changed', {
                type: 'changed',
                path: changedFiles[0],
                oldConfig,
                newConfig,
                changes,
            });
            logger.info(`Configuration reloaded successfully. ${changes.length} changes detected.`);
        }
        catch (error) {
            logger.error('Failed to reload configuration:', error);
            this.emit('reload-error', {
                error,
                files: changedFiles,
                oldConfig,
            });
            // Attempt to restore old config
            try {
                await this.configManager.load();
            }
            catch (restoreError) {
                logger.error('Failed to restore configuration:', restoreError);
            }
        }
    }
    /**
     * Validate changed configuration files
     */
    async validateChangedFiles(files) {
        const errors = [];
        for (const file of files) {
            if (!fs.existsSync(file))
                continue;
            try {
                const content = await fs.promises.readFile(file, 'utf8');
                // Basic YAML validation
                if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                    const yaml = require('js-yaml');
                    yaml.load(content);
                }
            }
            catch (error) {
                errors.push(`${file}: ${error.message}`);
            }
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
    /**
     * Detect changes between configurations
     */
    detectChanges(oldConfig, newConfig) {
        const changes = [];
        const compareObjects = (path, old, new_) => {
            if (old === new_)
                return;
            if (typeof old !== typeof new_) {
                changes.push(`${path}: type changed from ${typeof old} to ${typeof new_}`);
                return;
            }
            if (typeof old !== 'object' || old === null) {
                changes.push(`${path}: ${old} � ${new_}`);
                return;
            }
            // Compare object properties
            const allKeys = new Set([...Object.keys(old), ...Object.keys(new_)]);
            for (const key of allKeys) {
                const newPath = path ? `${path}.${key}` : key;
                if (!(key in old)) {
                    changes.push(`${newPath}: added`);
                }
                else if (!(key in new_)) {
                    changes.push(`${newPath}: removed`);
                }
                else {
                    compareObjects(newPath, old[key], new_[key]);
                }
            }
        };
        compareObjects('', oldConfig, newConfig);
        return changes;
    }
    /**
     * Stop watching
     */
    async stop() {
        if (!this.isWatching) {
            logger.warn('Watcher not running');
            return;
        }
        logger.info('Stopping config watcher');
        // Clear pending timer
        if (this.reloadTimer) {
            clearTimeout(this.reloadTimer);
            this.reloadTimer = undefined;
        }
        // Close watcher
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = undefined;
        }
        this.isWatching = false;
        this.pendingChanges.clear();
        logger.info('Config watcher stopped');
        this.emit('stopped');
    }
    /**
     * Add path to watch list
     */
    addPath(path) {
        if (!this.watcher) {
            throw new Error('Watcher not started');
        }
        if (!this.watchPaths.includes(path)) {
            this.watcher.add(path);
            this.watchPaths.push(path);
            logger.info(`Added path to watch: ${path}`);
        }
    }
    /**
     * Remove path from watch list
     */
    removePath(path) {
        if (!this.watcher) {
            throw new Error('Watcher not started');
        }
        const index = this.watchPaths.indexOf(path);
        if (index > -1) {
            this.watcher.unwatch(path);
            this.watchPaths.splice(index, 1);
            logger.info(`Removed path from watch: ${path}`);
        }
    }
    /**
     * Get watched paths
     */
    getWatchedPaths() {
        return [...this.watchPaths];
    }
    /**
     * Check if watcher is running
     */
    isRunning() {
        return this.isWatching;
    }
    /**
     * Clean up resources
     */
    async destroy() {
        await this.stop();
        this.removeAllListeners();
    }
}
exports.ConfigWatcher = ConfigWatcher;
/**
 * Create and start a config watcher
 */
async function createConfigWatcher(configManager, options) {
    const watcher = new ConfigWatcher(configManager, options);
    await watcher.start();
    return watcher;
}
exports.createConfigWatcher = createConfigWatcher;
//# sourceMappingURL=config-watcher.js.map