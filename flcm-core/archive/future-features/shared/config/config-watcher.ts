/**
 * FLCM Configuration Watcher
 * Monitors configuration files for changes and handles hot-reload
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { FLCMConfig } from './config-schema';
import { ConfigManager } from './config-manager';
import { createLogger } from '../utils/logger';

const logger = createLogger('ConfigWatcher');

/**
 * Configuration change event
 */
export interface ConfigChangeEvent {
  type: 'added' | 'changed' | 'removed';
  path: string;
  oldConfig?: FLCMConfig;
  newConfig?: FLCMConfig;
  error?: Error;
}

/**
 * Watcher options
 */
export interface WatcherOptions {
  debounceMs?: number;
  ignoreInitial?: boolean;
  persistent?: boolean;
  depth?: number;
  followSymlinks?: boolean;
  autoReload?: boolean;
  validateBeforeReload?: boolean;
}

/**
 * Configuration Watcher
 * Advanced file watching with intelligent reload handling
 */
export class ConfigWatcher extends EventEmitter {
  private watcher?: chokidar.FSWatcher;
  private configManager: ConfigManager;
  private options: Required<WatcherOptions>;
  private reloadTimer?: NodeJS.Timeout;
  private watchPaths: string[] = [];
  private isWatching: boolean = false;
  private pendingChanges: Set<string> = new Set();

  constructor(configManager: ConfigManager, options: WatcherOptions = {}) {
    super();
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
  async start(paths?: string[]): Promise<void> {
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
      await new Promise<void>((resolve) => {
        this.watcher!.once('ready', () => {
          this.isWatching = true;
          logger.info('Config watcher ready');
          this.emit('ready');
          resolve();
        });
      });
    } catch (error) {
      logger.error('Failed to start config watcher:', error);
      throw error;
    }
  }

  /**
   * Get default paths to watch
   */
  private getDefaultWatchPaths(): string[] {
    const paths = [
      './.flcm-config.yaml',
      './.flcm-config.yml',
      './.flcm-core/core-config.yaml',
      './.flcm-core/core-config.yml',
    ];

    const homePath = process.env.HOME;
    if (homePath) {
      paths.push(
        path.join(homePath, '.flcm', 'config.yaml'),
        path.join(homePath, '.flcm', 'config.yml')
      );
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
  private setupEventHandlers(): void {
    if (!this.watcher) return;

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
  private handleFileEvent(type: 'added' | 'changed' | 'removed', filePath: string): void {
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
  private async processChanges(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    const changedFiles = Array.from(this.pendingChanges);
    this.pendingChanges.clear();

    logger.info(`Processing configuration changes in: ${changedFiles.join(', ')}`);

    try {
      // Get current config for comparison
      const oldConfig = this.configManager.getConfig();

      // Determine if we should reload
      if (this.options.autoReload) {
        await this.reloadConfiguration(oldConfig, changedFiles);
      } else {
        // Just notify about changes
        this.emit('changes-detected', {
          files: changedFiles,
          oldConfig,
        });
      }
    } catch (error) {
      logger.error('Error processing configuration changes:', error);
      this.emit('reload-error', error);
    }
  }

  /**
   * Reload configuration
   */
  private async reloadConfiguration(oldConfig: FLCMConfig, changedFiles: string[]): Promise<void> {
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
        path: changedFiles[0], // Primary changed file
        oldConfig,
        newConfig,
        changes,
      });

      logger.info(`Configuration reloaded successfully. ${changes.length} changes detected.`);
    } catch (error) {
      logger.error('Failed to reload configuration:', error);
      
      this.emit('reload-error', {
        error,
        files: changedFiles,
        oldConfig,
      });

      // Attempt to restore old config
      try {
        await this.configManager.load();
      } catch (restoreError) {
        logger.error('Failed to restore configuration:', restoreError);
      }
    }
  }

  /**
   * Validate changed configuration files
   */
  private async validateChangedFiles(files: string[]): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      try {
        const content = await fs.promises.readFile(file, 'utf8');
        
        // Basic YAML validation
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const yaml = require('js-yaml');
          yaml.load(content);
        }
      } catch (error: any) {
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
  private detectChanges(oldConfig: FLCMConfig, newConfig: FLCMConfig): string[] {
    const changes: string[] = [];

    const compareObjects = (path: string, old: any, new_: any): void => {
      if (old === new_) return;

      if (typeof old !== typeof new_) {
        changes.push(`${path}: type changed from ${typeof old} to ${typeof new_}`);
        return;
      }

      if (typeof old !== 'object' || old === null) {
        changes.push(`${path}: ${old} ’ ${new_}`);
        return;
      }

      // Compare object properties
      const allKeys = new Set([...Object.keys(old), ...Object.keys(new_)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in old)) {
          changes.push(`${newPath}: added`);
        } else if (!(key in new_)) {
          changes.push(`${newPath}: removed`);
        } else {
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
  async stop(): Promise<void> {
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
  addPath(path: string): void {
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
  removePath(path: string): void {
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
  getWatchedPaths(): string[] {
    return [...this.watchPaths];
  }

  /**
   * Check if watcher is running
   */
  isRunning(): boolean {
    return this.isWatching;
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
 * Create and start a config watcher
 */
export async function createConfigWatcher(
  configManager: ConfigManager,
  options?: WatcherOptions
): Promise<ConfigWatcher> {
  const watcher = new ConfigWatcher(configManager, options);
  await watcher.start();
  return watcher;
}