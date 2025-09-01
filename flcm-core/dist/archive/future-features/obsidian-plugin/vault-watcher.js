"use strict";
/**
 * Vault Watcher
 * Monitors vault changes for real-time sync
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
exports.VaultWatcher = void 0;
const obsidian_1 = require("obsidian");
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
class VaultWatcher {
    constructor(app, settings, onFileChanged) {
        this.isWatching = false;
        this.debounceTimeouts = new Map();
        this.debounceDelay = 1000; // 1 second
        this.app = app;
        this.settings = settings;
        this.onFileChanged = onFileChanged;
    }
    /**
     * Start watching vault for changes
     */
    start() {
        if (this.isWatching) {
            return;
        }
        try {
            const vaultPath = this.app.vault.adapter.basePath;
            // Configure watcher options
            const watcherOptions = {
                ignored: this.getIgnorePatterns(),
                ignoreInitial: true,
                followSymlinks: false,
                atomic: 250,
                awaitWriteFinish: {
                    stabilityThreshold: 500,
                    pollInterval: 100
                }
            };
            // Create watcher
            this.watcher = chokidar.watch(vaultPath, watcherOptions);
            // Set up event handlers
            this.watcher
                .on('change', (filePath) => {
                this.handleFileChange(filePath);
            })
                .on('add', (filePath) => {
                this.handleFileAdd(filePath);
            })
                .on('unlink', (filePath) => {
                this.handleFileDelete(filePath);
            })
                .on('error', (error) => {
                console.error('Vault watcher error:', error);
            });
            this.isWatching = true;
            console.log('Vault watcher started');
        }
        catch (error) {
            console.error('Failed to start vault watcher:', error);
        }
    }
    /**
     * Stop watching vault
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = undefined;
        }
        // Clear pending debounce timeouts
        for (const timeout of this.debounceTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.debounceTimeouts.clear();
        this.isWatching = false;
        console.log('Vault watcher stopped');
    }
    /**
     * Check if watcher is running
     */
    isWatchingVault() {
        return this.isWatching;
    }
    /**
     * Handle file change
     */
    handleFileChange(filePath) {
        if (!this.shouldWatch(filePath)) {
            return;
        }
        // Debounce rapid changes
        this.debounceFileEvent(filePath, () => {
            const file = this.getFileFromPath(filePath);
            if (file instanceof obsidian_1.TFile) {
                this.onFileChanged(file);
            }
        });
    }
    /**
     * Handle file add
     */
    handleFileAdd(filePath) {
        if (!this.shouldWatch(filePath)) {
            return;
        }
        // Debounce to avoid triggering on partial writes
        this.debounceFileEvent(filePath, () => {
            const file = this.getFileFromPath(filePath);
            if (file instanceof obsidian_1.TFile) {
                this.onFileChanged(file);
            }
        }, 2000); // Longer delay for new files
    }
    /**
     * Handle file delete
     */
    handleFileDelete(filePath) {
        if (!this.shouldWatch(filePath)) {
            return;
        }
        // Create a mock file object for deletion handling
        const relativePath = this.getRelativePath(filePath);
        console.log(`File deleted: ${relativePath}`);
        // Note: We can't create a TFile for a deleted file
        // The sync engine should handle this case separately
    }
    /**
     * Debounce file events
     */
    debounceFileEvent(filePath, callback, delay) {
        // Clear existing timeout
        const existingTimeout = this.debounceTimeouts.get(filePath);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        // Set new timeout
        const timeout = setTimeout(() => {
            this.debounceTimeouts.delete(filePath);
            callback();
        }, delay || this.debounceDelay);
        this.debounceTimeouts.set(filePath, timeout);
    }
    /**
     * Get file from absolute path
     */
    getFileFromPath(filePath) {
        const relativePath = this.getRelativePath(filePath);
        const file = this.app.vault.getAbstractFileByPath(relativePath);
        if (file instanceof obsidian_1.TFile) {
            return file;
        }
        return null;
    }
    /**
     * Get relative path from absolute path
     */
    getRelativePath(absolutePath) {
        const vaultPath = this.app.vault.adapter.basePath;
        return path.relative(vaultPath, absolutePath).replace(/\\/g, '/');
    }
    /**
     * Check if file should be watched
     */
    shouldWatch(filePath) {
        const relativePath = this.getRelativePath(filePath);
        // Only watch markdown files
        if (!relativePath.endsWith('.md')) {
            return false;
        }
        // Check excluded directories
        for (const excludeDir of this.settings.syncFilter.excludeDirectories) {
            if (relativePath.startsWith(excludeDir)) {
                return false;
            }
        }
        // Check included directories
        if (this.settings.syncFilter.includeDirectories.length > 0) {
            const isIncluded = this.settings.syncFilter.includeDirectories.some(includeDir => relativePath.startsWith(includeDir));
            if (!isIncluded) {
                return false;
            }
        }
        return true;
    }
    /**
     * Get ignore patterns for chokidar
     */
    getIgnorePatterns() {
        const patterns = [
            // Always ignore these
            /\.obsidian/,
            /\.trash/,
            /\.git/,
            /node_modules/,
            /\.DS_Store/,
            /Thumbs\.db/,
            /\.tmp$/,
            /\.swp$/,
            /~$/
        ];
        // Add user-defined exclusions
        for (const excludeDir of this.settings.syncFilter.excludeDirectories) {
            patterns.push(new RegExp(this.escapeRegex(excludeDir)));
        }
        return patterns;
    }
    /**
     * Escape string for regex
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Get watcher statistics
     */
    getStats() {
        return {
            isWatching: this.isWatching,
            pendingDebounces: this.debounceTimeouts.size,
            debounceDelay: this.debounceDelay
        };
    }
    /**
     * Force trigger change for file (useful for testing)
     */
    triggerFileChange(file) {
        this.onFileChanged(file);
    }
    /**
     * Update settings and restart watcher if needed
     */
    updateSettings(settings) {
        this.settings = settings;
        // Restart watcher to apply new filters
        if (this.isWatching) {
            this.stop();
            this.start();
        }
    }
}
exports.VaultWatcher = VaultWatcher;
//# sourceMappingURL=vault-watcher.js.map