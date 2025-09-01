/**
 * FLCM Configuration Watcher
 * Monitors configuration files for changes and handles hot-reload
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { FLCMConfig } from './config-schema';
import { ConfigManager } from './config-manager';
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
export declare class ConfigWatcher extends EventEmitter {
    private watcher?;
    private configManager;
    private options;
    private reloadTimer?;
    private watchPaths;
    private isWatching;
    private pendingChanges;
    constructor(configManager: ConfigManager, options?: WatcherOptions);
    /**
     * Start watching configuration files
     */
    start(paths?: string[]): Promise<void>;
    /**
     * Get default paths to watch
     */
    private getDefaultWatchPaths;
    /**
     * Set up watcher event handlers
     */
    private setupEventHandlers;
    /**
     * Handle file change events
     */
    private handleFileEvent;
    /**
     * Process accumulated changes
     */
    private processChanges;
    /**
     * Reload configuration
     */
    private reloadConfiguration;
    /**
     * Validate changed configuration files
     */
    private validateChangedFiles;
    /**
     * Detect changes between configurations
     */
    private detectChanges;
    /**
     * Stop watching
     */
    stop(): Promise<void>;
    /**
     * Add path to watch list
     */
    addPath(path: string): void;
    /**
     * Remove path from watch list
     */
    removePath(path: string): void;
    /**
     * Get watched paths
     */
    getWatchedPaths(): string[];
    /**
     * Check if watcher is running
     */
    isRunning(): boolean;
    /**
     * Clean up resources
     */
    destroy(): Promise<void>;
}
/**
 * Create and start a config watcher
 */
export declare function createConfigWatcher(configManager: ConfigManager, options?: WatcherOptions): Promise<ConfigWatcher>;
