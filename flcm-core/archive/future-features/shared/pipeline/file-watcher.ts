/**
 * FLCM File Watcher System
 * Monitors document directories and triggers pipeline processing
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { DocumentStage, SourceType } from './document-schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('FileWatcher');

/**
 * File event types
 */
export enum FileEventType {
  ADDED = 'added',
  CHANGED = 'changed',
  REMOVED = 'removed',
  READY = 'ready',
  ERROR = 'error',
}

/**
 * File event data
 */
export interface FileEvent {
  type: FileEventType;
  path: string;
  stage: DocumentStage;
  stats?: fs.Stats;
  error?: Error;
}

/**
 * Watcher configuration
 */
export interface FileWatcherConfig {
  paths: {
    input: string;
    insights: string;
    content: string;
    published: string;
    archive?: string;
  };
  options?: chokidar.WatchOptions;
  debounceMs?: number;
  fileFilters?: {
    extensions?: string[];
    minSize?: number;
    maxSize?: number;
    ignorePatterns?: RegExp[];
  };
}

/**
 * File processing queue item
 */
interface QueueItem {
  event: FileEvent;
  timestamp: Date;
  retries: number;
}

/**
 * File Watcher
 * Monitors directories and triggers document processing
 */
export class FileWatcher extends EventEmitter {
  private config: FileWatcherConfig;
  private watchers: Map<DocumentStage, chokidar.FSWatcher> = new Map();
  private processingQueue: QueueItem[] = [];
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isWatching: boolean = false;
  private fileCache: Map<string, string> = new Map(); // For detecting real changes

  constructor(config: FileWatcherConfig) {
    super();
    this.config = {
      ...config,
      debounceMs: config.debounceMs || 500,
      options: {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
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
  async start(): Promise<void> {
    if (this.isWatching) {
      logger.warn('File watcher already running');
      return;
    }

    try {
      logger.info('Starting file watcher');

      // Ensure all directories exist
      await this.ensureDirectories();

      // Set up watchers for each stage
      await this.setupWatcher(DocumentStage.INPUT, this.config.paths.input);
      await this.setupWatcher(DocumentStage.INSIGHTS, this.config.paths.insights);
      await this.setupWatcher(DocumentStage.CONTENT, this.config.paths.content);
      await this.setupWatcher(DocumentStage.PUBLISHED, this.config.paths.published);

      if (this.config.paths.archive) {
        await this.setupWatcher(DocumentStage.ARCHIVED, this.config.paths.archive);
      }

      this.isWatching = true;
      
      // Start queue processor
      this.startQueueProcessor();
      
      logger.info('File watcher started successfully');
      this.emit('started');
    } catch (error) {
      logger.error('Failed to start file watcher:', error);
      throw error;
    }
  }

  /**
   * Ensure all watch directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = Object.values(this.config.paths).filter(p => p);
    
    for (const dir of dirs) {
      try {
        await fs.promises.mkdir(dir, { recursive: true });
        logger.debug(`Ensured directory exists: ${dir}`);
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error);
        throw error;
      }
    }
  }

  /**
   * Set up watcher for a specific directory
   */
  private async setupWatcher(stage: DocumentStage, watchPath: string): Promise<void> {
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
  private handleFileEvent(
    type: FileEventType,
    filePath: string,
    stage: DocumentStage,
    stats?: fs.Stats
  ): void {
    // Apply file filters
    if (!this.shouldProcessFile(filePath, stats)) {
      logger.debug(`Skipping file ${filePath} due to filters`);
      return;
    }

    // Create event
    const event: FileEvent = {
      type,
      path: filePath,
      stage,
      stats,
    };

    // Debounce the event
    const debounceKey = `${type}:${filePath}`;
    
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
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
  private shouldProcessFile(filePath: string, stats?: fs.Stats): boolean {
    const filters = this.config.fileFilters;
    if (!filters) return true;

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
  private async processFileEvent(event: FileEvent): Promise<void> {
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
    } catch (error) {
      logger.error(`Error processing file event:`, error);
      this.emit('error', { event, error });
    }
  }

  /**
   * Detect if file has real changes (content changed, not just metadata)
   */
  private async detectRealChange(filePath: string): Promise<boolean> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const hash = this.simpleHash(content);
      const cachedHash = this.fileCache.get(filePath);

      if (cachedHash === hash) {
        return false;
      }

      this.fileCache.set(filePath, hash);
      return true;
    } catch (error) {
      logger.error(`Error reading file for change detection:`, error);
      return true; // Assume change on error
    }
  }

  /**
   * Simple hash function for change detection
   */
  private simpleHash(content: string): string {
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
  private triggerNextStage(event: FileEvent): void {
    if (event.type !== FileEventType.ADDED && event.type !== FileEventType.CHANGED) {
      return;
    }

    let nextStage: DocumentStage | null = null;

    switch (event.stage) {
      case DocumentStage.INPUT:
        nextStage = DocumentStage.INSIGHTS;
        break;
      case DocumentStage.INSIGHTS:
        nextStage = DocumentStage.CONTENT;
        break;
      case DocumentStage.CONTENT:
        nextStage = DocumentStage.PUBLISHED;
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
  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.processingQueue.length === 0) return;

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
  async getFileStats(filePath: string): Promise<fs.Stats | null> {
    try {
      return await fs.promises.stat(filePath);
    } catch (error) {
      logger.error(`Error getting file stats for ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Get files in a stage directory
   */
  async getStageFiles(stage: DocumentStage): Promise<string[]> {
    const stagePath = this.getStagePath(stage);
    if (!stagePath) return [];

    try {
      const files = await fs.promises.readdir(stagePath);
      return files
        .map(f => path.join(stagePath, f))
        .filter(f => this.shouldProcessFile(f));
    } catch (error) {
      logger.error(`Error reading stage directory ${stage}:`, error);
      return [];
    }
  }

  /**
   * Get path for a stage
   */
  private getStagePath(stage: DocumentStage): string | null {
    switch (stage) {
      case DocumentStage.INPUT:
        return this.config.paths.input;
      case DocumentStage.INSIGHTS:
        return this.config.paths.insights;
      case DocumentStage.CONTENT:
        return this.config.paths.content;
      case DocumentStage.PUBLISHED:
        return this.config.paths.published;
      case DocumentStage.ARCHIVED:
        return this.config.paths.archive || null;
      default:
        return null;
    }
  }

  /**
   * Move file between stages
   */
  async moveFileToStage(
    filePath: string,
    fromStage: DocumentStage,
    toStage: DocumentStage
  ): Promise<string> {
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
    } catch (error) {
      logger.error(`Error moving file:`, error);
      throw error;
    }
  }

  /**
   * Copy file to another stage
   */
  async copyFileToStage(
    filePath: string,
    toStage: DocumentStage,
    newName?: string
  ): Promise<string> {
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
    } catch (error) {
      logger.error(`Error copying file:`, error);
      throw error;
    }
  }

  /**
   * Get watcher statistics
   */
  getStatistics(): {
    watching: boolean;
    stages: DocumentStage[];
    queueLength: number;
    cachedFiles: number;
  } {
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
  async stop(): Promise<void> {
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
  async destroy(): Promise<void> {
    await this.stop();
    this.removeAllListeners();
  }
}

/**
 * Create and start a file watcher
 */
export async function createFileWatcher(config: FileWatcherConfig): Promise<FileWatcher> {
  const watcher = new FileWatcher(config);
  await watcher.start();
  return watcher;
}