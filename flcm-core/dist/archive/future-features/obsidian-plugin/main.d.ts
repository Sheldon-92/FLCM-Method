/**
 * FLCM Obsidian Plugin - Main Entry Point
 */
import { Plugin, TFile } from 'obsidian';
import { FLCMSettings } from './types';
import { FLCMSyncEngine } from './sync-engine';
import { SyncStatusIndicator } from './status-indicator';
import { VaultWatcher } from './vault-watcher';
import { FrontmatterManager } from './frontmatter-manager';
import { FLCMClient } from './flcm-client';
export default class FLCMPlugin extends Plugin {
    settings: FLCMSettings;
    syncEngine: FLCMSyncEngine;
    statusIndicator: SyncStatusIndicator;
    vaultWatcher: VaultWatcher;
    frontmatterManager: FrontmatterManager;
    flcmClient: FLCMClient;
    private statusBarItem;
    private syncInProgress;
    private autoSyncInterval?;
    onload(): Promise<void>;
    onunload(): Promise<void>;
    /**
     * Initialize all components
     */
    private initializeComponents;
    /**
     * Setup UI components
     */
    private setupUI;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Add plugin commands
     */
    private addCommands;
    /**
     * Handle file created
     */
    private handleFileCreated;
    /**
     * Handle file modified
     */
    private handleFileModified;
    /**
     * Handle file deleted
     */
    private handleFileDeleted;
    /**
     * Handle file renamed
     */
    private handleFileRenamed;
    /**
     * File change handler for vault watcher
     */
    private onFileChanged;
    /**
     * Check if file should be synced
     */
    private shouldSyncFile;
    /**
     * Manual sync trigger
     */
    manualSync(): Promise<void>;
    /**
     * Sync individual file
     */
    syncFile(file: TFile, direction?: 'to-flcm' | 'to-obsidian'): Promise<void>;
    /**
     * Create new FLCM document
     */
    private createFLCMDocument;
    /**
     * Show sync status
     */
    private showSyncStatus;
    /**
     * Start auto-sync
     */
    private startAutoSync;
    /**
     * Stop auto-sync
     */
    private stopAutoSync;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
}
