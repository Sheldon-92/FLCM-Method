/**
 * FLCM File Watcher System
 * Monitors document directories and triggers pipeline processing
 */
/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs';
import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import { DocumentStage } from './document-schema';
/**
 * File event types
 */
export declare enum FileEventType {
    ADDED = "added",
    CHANGED = "changed",
    REMOVED = "removed",
    READY = "ready",
    ERROR = "error"
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
 * File Watcher
 * Monitors directories and triggers document processing
 */
export declare class FileWatcher extends EventEmitter {
    private config;
    private watchers;
    private processingQueue;
    private debounceTimers;
    private isWatching;
    private fileCache;
    constructor(config: FileWatcherConfig);
    /**
     * Start watching all configured directories
     */
    start(): Promise<void>;
    /**
     * Ensure all watch directories exist
     */
    private ensureDirectories;
    /**
     * Set up watcher for a specific directory
     */
    private setupWatcher;
    /**
     * Handle file events with debouncing
     */
    private handleFileEvent;
    /**
     * Check if file should be processed based on filters
     */
    private shouldProcessFile;
    /**
     * Process a file event
     */
    private processFileEvent;
    /**
     * Detect if file has real changes (content changed, not just metadata)
     */
    private detectRealChange;
    /**
     * Simple hash function for change detection
     */
    private simpleHash;
    /**
     * Trigger processing for the next stage in pipeline
     */
    private triggerNextStage;
    /**
     * Start queue processor for handling events
     */
    private startQueueProcessor;
    /**
     * Get file statistics for a path
     */
    getFileStats(filePath: string): Promise<fs.Stats | null>;
    /**
     * Get files in a stage directory
     */
    getStageFiles(stage: DocumentStage): Promise<string[]>;
    /**
     * Get path for a stage
     */
    private getStagePath;
    /**
     * Move file between stages
     */
    moveFileToStage(filePath: string, fromStage: DocumentStage, toStage: DocumentStage): Promise<string>;
    /**
     * Copy file to another stage
     */
    copyFileToStage(filePath: string, toStage: DocumentStage, newName?: string): Promise<string>;
    /**
     * Get watcher statistics
     */
    getStatistics(): {
        watching: boolean;
        stages: DocumentStage[];
        queueLength: number;
        cachedFiles: number;
    };
    /**
     * Stop watching
     */
    stop(): Promise<void>;
    /**
     * Clean up resources
     */
    destroy(): Promise<void>;
}
/**
 * Create and start a file watcher
 */
export declare function createFileWatcher(config: FileWatcherConfig): Promise<FileWatcher>;
