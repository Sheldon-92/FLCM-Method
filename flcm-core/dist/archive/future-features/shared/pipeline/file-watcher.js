"use strict";
/**
 * FLCM File Watcher System
 * Monitors document directories and triggers pipeline processing
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
exports.createFileWatcher = exports.FileWatcher = exports.FileEventType = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
const chokidar = __importStar(require("chokidar"));
const document_schema_1 = require("./document-schema");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('FileWatcher');
/**
 * File event types
 */
var FileEventType;
(function (FileEventType) {
    FileEventType["ADDED"] = "added";
    FileEventType["CHANGED"] = "changed";
    FileEventType["REMOVED"] = "removed";
    FileEventType["READY"] = "ready";
    FileEventType["ERROR"] = "error";
})(FileEventType = exports.FileEventType || (exports.FileEventType = {}));
/**
 * File Watcher
 * Monitors directories and triggers document processing
 */
class FileWatcher extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.watchers = new Map();
        this.processingQueue = [];
        this.debounceTimers = new Map();
        this.isWatching = false;
        this.fileCache = new Map(); // For detecting real changes
        this.config = {
            ...config,
            debounceMs: config.debounceMs || 500,
            options: {
                ignored: /(^|[\/\\])\../,
                persistent: true,
                awaitWriteFinish: {
                    stabilityThreshold: 2000,
                    pollInterval: 100,
                },
                ...config.options,
            },
        };
    }
    /**
     * Start watching all configured directories
     */
    async start() {
        if (this.isWatching) {
            logger.warn('File watcher already running');
            return;
        }
        try {
            logger.info('Starting file watcher');
            // Ensure all directories exist
            await this.ensureDirectories();
            // Set up watchers for each stage
            await this.setupWatcher(document_schema_1.DocumentStage.INPUT, this.config.paths.input);
            await this.setupWatcher(document_schema_1.DocumentStage.INSIGHTS, this.config.paths.insights);
            await this.setupWatcher(document_schema_1.DocumentStage.CONTENT, this.config.paths.content);
            await this.setupWatcher(document_schema_1.DocumentStage.PUBLISHED, this.config.paths.published);
            if (this.config.paths.archive) {
                await this.setupWatcher(document_schema_1.DocumentStage.ARCHIVED, this.config.paths.archive);
            }
            this.isWatching = true;
            // Start queue processor
            this.startQueueProcessor();
            logger.info('File watcher started successfully');
            this.emit('started');
        }
        catch (error) {
            logger.error('Failed to start file watcher:', error);
            throw error;
        }
    }
    /**
     * Ensure all watch directories exist
     */
    async ensureDirectories() {
        const dirs = Object.values(this.config.paths).filter(p => p);
        for (const dir of dirs) {
            try {
                await fs.promises.mkdir(dir, { recursive: true });
                logger.debug(`Ensured directory exists: ${dir}`);
            }
            catch (error) {
                logger.error(`Failed to create directory ${dir}:`, error);
                throw error;
            }
        }
    }
    /**
     * Set up watcher for a specific directory
     */
    async setupWatcher(stage, watchPath) {
        return new Promise((resolve, reject) => {
            const watcher = chokidar.watch(watchPath, this.config.options);
            watcher
                .on('add', (filePath, stats) => this.handleFileEvent(FileEventType.ADDED, filePath, stage, stats))
                .on('change', (filePath, stats) => this.handleFileEvent(FileEventType.CHANGED, filePath, stage, stats))
                .on('unlink', (filePath) => this.handleFileEvent(FileEventType.REMOVED, filePath, stage))
                .on('error', (error) => {
                logger.error(`Watcher error for ${stage}:`, error);
                this.emit('error', { stage, error });
            })
                .on('ready', () => {
                logger.info(`Watcher ready for ${stage}: ${watchPath}`);
                resolve();
            });
            this.watchers.set(stage, watcher);
        });
    }
    /**
     * Handle file events with debouncing
     */
    handleFileEvent(type, filePath, stage, stats) {
        // Apply file filters
        if (!this.shouldProcessFile(filePath, stats)) {
            logger.debug(`Skipping file ${filePath} due to filters`);
            return;
        }
        // Create event
        const event = {
            type,
            path: filePath,
            stage,
            stats,
        };
        // Debounce the event
        const debounceKey = `${type}:${filePath}`;
        if (this.debounceTimers.has(debounceKey)) {
            clearTimeout(this.debounceTimers.get(debounceKey));
        }
        const timer = setTimeout(() => {
            this.debounceTimers.delete(debounceKey);
            this.processFileEvent(event);
        }, this.config.debounceMs);
        this.debounceTimers.set(debounceKey, timer);
    }
    /**
     * Check if file should be processed based on filters
     */
    shouldProcessFile(filePath, stats) {
        const filters = this.config.fileFilters;
        if (!filters)
            return true;
        // Check extension
        if (filters.extensions) {
            const ext = path.extname(filePath).toLowerCase();
            if (!filters.extensions.includes(ext)) {
                return false;
            }
        }
        // Check file size
        if (stats) {
            if (filters.minSize && stats.size < filters.minSize) {
                return false;
            }
            if (filters.maxSize && stats.size > filters.maxSize) {
                return false;
            }
        }
        // Check ignore patterns
        if (filters.ignorePatterns) {
            const fileName = path.basename(filePath);
            for (const pattern of filters.ignorePatterns) {
                if (pattern.test(fileName)) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Process a file event
     */
    async processFileEvent(event) {
        try {
            logger.info(`Processing ${event.type} event for ${event.path} in ${event.stage}`);
            // Check for real changes (not just touch)
            if (event.type === FileEventType.CHANGED) {
                const hasRealChange = await this.detectRealChange(event.path);
                if (!hasRealChange) {
                    logger.debug(`No real changes detected in ${event.path}`);
                    return;
                }
            }
            // Add to processing queue
            this.processingQueue.push({
                event,
                timestamp: new Date(),
                retries: 0,
            });
            // Emit event for pipeline processing
            this.emit('file-event', event);
            // Stage-specific events
            this.emit(`${event.stage}:${event.type}`, event);
            // Trigger next stage processing
            this.triggerNextStage(event);
        }
        catch (error) {
            logger.error(`Error processing file event:`, error);
            this.emit('error', { event, error });
        }
    }
    /**
     * Detect if file has real changes (content changed, not just metadata)
     */
    async detectRealChange(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const hash = this.simpleHash(content);
            const cachedHash = this.fileCache.get(filePath);
            if (cachedHash === hash) {
                return false;
            }
            this.fileCache.set(filePath, hash);
            return true;
        }
        catch (error) {
            logger.error(`Error reading file for change detection:`, error);
            return true; // Assume change on error
        }
    }
    /**
     * Simple hash function for change detection
     */
    simpleHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    /**
     * Trigger processing for the next stage in pipeline
     */
    triggerNextStage(event) {
        if (event.type !== FileEventType.ADDED && event.type !== FileEventType.CHANGED) {
            return;
        }
        let nextStage = null;
        switch (event.stage) {
            case document_schema_1.DocumentStage.INPUT:
                nextStage = document_schema_1.DocumentStage.INSIGHTS;
                break;
            case document_schema_1.DocumentStage.INSIGHTS:
                nextStage = document_schema_1.DocumentStage.CONTENT;
                break;
            case document_schema_1.DocumentStage.CONTENT:
                nextStage = document_schema_1.DocumentStage.PUBLISHED;
                break;
        }
        if (nextStage) {
            logger.info(`Triggering ${nextStage} processing for ${event.path}`);
            this.emit('trigger-stage', {
                currentStage: event.stage,
                nextStage,
                sourcePath: event.path,
            });
        }
    }
    /**
     * Start queue processor for handling events
     */
    startQueueProcessor() {
        setInterval(() => {
            if (this.processingQueue.length === 0)
                return;
            const now = new Date();
            const processableItems = this.processingQueue.filter(item => {
                const age = now.getTime() - item.timestamp.getTime();
                return age > 1000; // Process items older than 1 second
            });
            for (const item of processableItems) {
                this.emit('process-queue-item', item);
                // Remove from queue
                const index = this.processingQueue.indexOf(item);
                if (index > -1) {
                    this.processingQueue.splice(index, 1);
                }
            }
        }, 1000);
    }
    /**
     * Get file statistics for a path
     */
    async getFileStats(filePath) {
        try {
            return await fs.promises.stat(filePath);
        }
        catch (error) {
            logger.error(`Error getting file stats for ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Get files in a stage directory
     */
    async getStageFiles(stage) {
        const stagePath = this.getStagePath(stage);
        if (!stagePath)
            return [];
        try {
            const files = await fs.promises.readdir(stagePath);
            return files
                .map(f => path.join(stagePath, f))
                .filter(f => this.shouldProcessFile(f));
        }
        catch (error) {
            logger.error(`Error reading stage directory ${stage}:`, error);
            return [];
        }
    }
    /**
     * Get path for a stage
     */
    getStagePath(stage) {
        switch (stage) {
            case document_schema_1.DocumentStage.INPUT:
                return this.config.paths.input;
            case document_schema_1.DocumentStage.INSIGHTS:
                return this.config.paths.insights;
            case document_schema_1.DocumentStage.CONTENT:
                return this.config.paths.content;
            case document_schema_1.DocumentStage.PUBLISHED:
                return this.config.paths.published;
            case document_schema_1.DocumentStage.ARCHIVED:
                return this.config.paths.archive || null;
            default:
                return null;
        }
    }
    /**
     * Move file between stages
     */
    async moveFileToStage(filePath, fromStage, toStage) {
        const toPath = this.getStagePath(toStage);
        if (!toPath) {
            throw new Error(`No path configured for stage ${toStage}`);
        }
        const fileName = path.basename(filePath);
        const destPath = path.join(toPath, fileName);
        try {
            await fs.promises.rename(filePath, destPath);
            logger.info(`Moved file from ${fromStage} to ${toStage}: ${fileName}`);
            this.emit('file-moved', {
                from: filePath,
                to: destPath,
                fromStage,
                toStage,
            });
            return destPath;
        }
        catch (error) {
            logger.error(`Error moving file:`, error);
            throw error;
        }
    }
    /**
     * Copy file to another stage
     */
    async copyFileToStage(filePath, toStage, newName) {
        const toPath = this.getStagePath(toStage);
        if (!toPath) {
            throw new Error(`No path configured for stage ${toStage}`);
        }
        const fileName = newName || path.basename(filePath);
        const destPath = path.join(toPath, fileName);
        try {
            await fs.promises.copyFile(filePath, destPath);
            logger.info(`Copied file to ${toStage}: ${fileName}`);
            this.emit('file-copied', {
                from: filePath,
                to: destPath,
                stage: toStage,
            });
            return destPath;
        }
        catch (error) {
            logger.error(`Error copying file:`, error);
            throw error;
        }
    }
    /**
     * Get watcher statistics
     */
    getStatistics() {
        return {
            watching: this.isWatching,
            stages: Array.from(this.watchers.keys()),
            queueLength: this.processingQueue.length,
            cachedFiles: this.fileCache.size,
        };
    }
    /**
     * Stop watching
     */
    async stop() {
        if (!this.isWatching) {
            logger.warn('File watcher not running');
            return;
        }
        logger.info('Stopping file watcher');
        // Clear debounce timers
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        // Close all watchers
        for (const [stage, watcher] of this.watchers) {
            await watcher.close();
            logger.debug(`Closed watcher for ${stage}`);
        }
        this.watchers.clear();
        // Clear caches
        this.fileCache.clear();
        this.processingQueue = [];
        this.isWatching = false;
        logger.info('File watcher stopped');
        this.emit('stopped');
    }
    /**
     * Clean up resources
     */
    async destroy() {
        await this.stop();
        this.removeAllListeners();
    }
}
exports.FileWatcher = FileWatcher;
/**
 * Create and start a file watcher
 */
async function createFileWatcher(config) {
    const watcher = new FileWatcher(config);
    await watcher.start();
    return watcher;
}
exports.createFileWatcher = createFileWatcher;
//# sourceMappingURL=file-watcher.js.map