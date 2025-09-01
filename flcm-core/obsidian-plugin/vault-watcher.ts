/**
 * Vault Watcher
 * Monitors vault changes for real-time sync
 */

import { App, TFile, TFolder } from 'obsidian';
import { FLCMSettings } from './types';
import * as chokidar from 'chokidar';
import * as path from 'path';

export class VaultWatcher {
  private app: App;
  private settings: FLCMSettings;
  private watcher?: chokidar.FSWatcher;
  private isWatching: boolean = false;
  private onFileChanged: (file: TFile) => void;
  private debounceTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay = 1000; // 1 second

  constructor(
    app: App,
    settings: FLCMSettings,
    onFileChanged: (file: TFile) => void
  ) {
    this.app = app;
    this.settings = settings;
    this.onFileChanged = onFileChanged;
  }

  /**
   * Start watching vault for changes
   */
  start(): void {
    if (this.isWatching) {
      return;
    }

    try {
      const vaultPath = this.app.vault.adapter.basePath;
      
      // Configure watcher options
      const watcherOptions: chokidar.WatchOptions = {
        ignored: this.getIgnorePatterns(),
        ignoreInitial: true,
        followSymlinks: false,
        atomic: 250, // Wait 250ms for atomic writes
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      };

      // Create watcher
      this.watcher = chokidar.watch(vaultPath, watcherOptions);

      // Set up event handlers
      this.watcher
        .on('change', (filePath: string) => {
          this.handleFileChange(filePath);
        })
        .on('add', (filePath: string) => {
          this.handleFileAdd(filePath);
        })
        .on('unlink', (filePath: string) => {
          this.handleFileDelete(filePath);
        })
        .on('error', (error) => {
          console.error('Vault watcher error:', error);
        });

      this.isWatching = true;
      console.log('Vault watcher started');

    } catch (error) {
      console.error('Failed to start vault watcher:', error);
    }
  }

  /**
   * Stop watching vault
   */
  stop(): void {
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
  isWatchingVault(): boolean {
    return this.isWatching;
  }

  /**
   * Handle file change
   */
  private handleFileChange(filePath: string): void {
    if (!this.shouldWatch(filePath)) {
      return;
    }

    // Debounce rapid changes
    this.debounceFileEvent(filePath, () => {
      const file = this.getFileFromPath(filePath);
      if (file instanceof TFile) {
        this.onFileChanged(file);
      }
    });
  }

  /**
   * Handle file add
   */
  private handleFileAdd(filePath: string): void {
    if (!this.shouldWatch(filePath)) {
      return;
    }

    // Debounce to avoid triggering on partial writes
    this.debounceFileEvent(filePath, () => {
      const file = this.getFileFromPath(filePath);
      if (file instanceof TFile) {
        this.onFileChanged(file);
      }
    }, 2000); // Longer delay for new files
  }

  /**
   * Handle file delete
   */
  private handleFileDelete(filePath: string): void {
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
  private debounceFileEvent(filePath: string, callback: () => void, delay?: number): void {
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
  private getFileFromPath(filePath: string): TFile | null {
    const relativePath = this.getRelativePath(filePath);
    const file = this.app.vault.getAbstractFileByPath(relativePath);
    
    if (file instanceof TFile) {
      return file;
    }
    
    return null;
  }

  /**
   * Get relative path from absolute path
   */
  private getRelativePath(absolutePath: string): string {
    const vaultPath = this.app.vault.adapter.basePath;
    return path.relative(vaultPath, absolutePath).replace(/\\/g, '/');
  }

  /**
   * Check if file should be watched
   */
  private shouldWatch(filePath: string): boolean {
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
      const isIncluded = this.settings.syncFilter.includeDirectories.some(
        includeDir => relativePath.startsWith(includeDir)
      );
      if (!isIncluded) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get ignore patterns for chokidar
   */
  private getIgnorePatterns(): (string | RegExp)[] {
    const patterns: (string | RegExp)[] = [
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
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get watcher statistics
   */
  getStats(): any {
    return {
      isWatching: this.isWatching,
      pendingDebounces: this.debounceTimeouts.size,
      debounceDelay: this.debounceDelay
    };
  }

  /**
   * Force trigger change for file (useful for testing)
   */
  triggerFileChange(file: TFile): void {
    this.onFileChanged(file);
  }

  /**
   * Update settings and restart watcher if needed
   */
  updateSettings(settings: FLCMSettings): void {
    this.settings = settings;
    
    // Restart watcher to apply new filters
    if (this.isWatching) {
      this.stop();
      this.start();
    }
  }
}