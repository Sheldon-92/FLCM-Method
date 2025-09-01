/**
 * FLCM Sync Engine
 * Handles bidirectional synchronization between Obsidian and FLCM
 */
import { App, TFile } from 'obsidian';
import { FLCMSettings, SyncOperation, SyncStats } from './types';
import { FLCMClient } from './flcm-client';
import { FrontmatterManager } from './frontmatter-manager';
export declare class FLCMSyncEngine {
    private app;
    private settings;
    private flcmClient;
    private frontmatterManager;
    private conflictResolver;
    private syncQueue;
    private processingQueue;
    private stats;
    constructor(app: App, settings: FLCMSettings, flcmClient: FLCMClient, frontmatterManager: FrontmatterManager);
    /**
     * Initialize sync statistics
     */
    private initializeStats;
    /**
     * Sync all eligible files
     */
    syncAll(): Promise<{
        successful: number;
        failed: number;
        conflicts: number;
    }>;
    /**
     * Sync individual file
     */
    syncFile(file: TFile, direction?: 'to-flcm' | 'to-obsidian' | 'bidirectional'): Promise<SyncOperation>;
    /**
     * Process sync operation
     */
    private processSyncOperation;
    /**
     * Bidirectional sync
     */
    private bidirectionalSync;
    /**
     * Sync to FLCM
     */
    private syncToFLCM;
    /**
     * Sync to Obsidian
     */
    private syncToObsidian;
    /**
     * Sync to Obsidian from document
     */
    private syncToObsidianFromDocument;
    /**
     * Handle sync conflict
     */
    private handleConflict;
    /**
     * Get base content for three-way merge
     */
    private getBaseContent;
    /**
     * Show conflict resolution UI
     */
    private showConflictUI;
    /**
     * Delete from FLCM
     */
    deleteFromFLCM(filePath: string): Promise<void>;
    /**
     * Rename in FLCM
     */
    renameInFLCM(oldPath: string, newPath: string): Promise<void>;
    /**
     * Check if file should be synced
     */
    private shouldSyncFile;
    /**
     * Calculate content checksum
     */
    private calculateChecksum;
    /**
     * Create sync error
     */
    private createSyncError;
    /**
     * Update sync statistics
     */
    private updateStats;
    /**
     * Get sync statistics
     */
    getStats(): SyncStats;
    /**
     * Get sync queue status
     */
    getSyncQueue(): SyncOperation[];
    /**
     * Stop sync engine
     */
    stop(): Promise<void>;
}
