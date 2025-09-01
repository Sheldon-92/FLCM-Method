/**
 * Vault Watcher
 * Monitors vault changes for real-time sync
 */
import { App, TFile } from 'obsidian';
import { FLCMSettings } from './types';
export declare class VaultWatcher {
    private app;
    private settings;
    private watcher?;
    private isWatching;
    private onFileChanged;
    private debounceTimeouts;
    private readonly debounceDelay;
    constructor(app: App, settings: FLCMSettings, onFileChanged: (file: TFile) => void);
    /**
     * Start watching vault for changes
     */
    start(): void;
    /**
     * Stop watching vault
     */
    stop(): void;
    /**
     * Check if watcher is running
     */
    isWatchingVault(): boolean;
    /**
     * Handle file change
     */
    private handleFileChange;
    /**
     * Handle file add
     */
    private handleFileAdd;
    /**
     * Handle file delete
     */
    private handleFileDelete;
    /**
     * Debounce file events
     */
    private debounceFileEvent;
    /**
     * Get file from absolute path
     */
    private getFileFromPath;
    /**
     * Get relative path from absolute path
     */
    private getRelativePath;
    /**
     * Check if file should be watched
     */
    private shouldWatch;
    /**
     * Get ignore patterns for chokidar
     */
    private getIgnorePatterns;
    /**
     * Escape string for regex
     */
    private escapeRegex;
    /**
     * Get watcher statistics
     */
    getStats(): any;
    /**
     * Force trigger change for file (useful for testing)
     */
    triggerFileChange(file: TFile): void;
    /**
     * Update settings and restart watcher if needed
     */
    updateSettings(settings: FLCMSettings): void;
}
