/**
 * FLCM Obsidian Plugin - Main Entry Point
 */

import { Plugin, Notice, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { FLCMSettings, SyncStatus } from './types';
import { FLCMSyncEngine } from './sync-engine';
import { FLCMSettingTab } from './settings';
import { SyncStatusIndicator } from './status-indicator';
import { ConflictResolver } from './conflict-resolver';
import { VaultWatcher } from './vault-watcher';
import { FrontmatterManager } from './frontmatter-manager';
import { FLCMClient } from './flcm-client';

const DEFAULT_SETTINGS: FLCMSettings = {
  flcmPath: '',
  syncMode: 'manual',
  conflictResolution: 'ask',
  autoSyncInterval: 15,
  enableStatusBar: true,
  enableNotifications: true,
  syncFilter: {
    includeTags: [],
    excludeTags: ['#private', '#draft'],
    includeDirectories: [],
    excludeDirectories: ['.obsidian', '.trash']
  },
  metadata: {
    preserveObsidianMetadata: true,
    addCreationDate: true,
    addModificationDate: true,
    addSyncTimestamp: true
  },
  advanced: {
    maxSyncRetries: 3,
    syncTimeout: 30,
    conflictBackupEnabled: true,
    debugLogging: false
  }
};

export default class FLCMPlugin extends Plugin {
  settings: FLCMSettings;
  syncEngine: FLCMSyncEngine;
  statusIndicator: SyncStatusIndicator;
  vaultWatcher: VaultWatcher;
  frontmatterManager: FrontmatterManager;
  flcmClient: FLCMClient;
  
  private statusBarItem: HTMLElement;
  private syncInProgress: boolean = false;
  private autoSyncInterval?: NodeJS.Timeout;

  async onload() {
    console.log('Loading FLCM Plugin...');
    
    // Load settings
    await this.loadSettings();
    
    // Initialize components
    await this.initializeComponents();
    
    // Set up UI
    this.setupUI();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Start auto-sync if enabled
    if (this.settings.syncMode === 'auto' || this.settings.syncMode === 'realtime') {
      this.startAutoSync();
    }
    
    // Add commands
    this.addCommands();
    
    console.log('FLCM Plugin loaded successfully');
    
    if (this.settings.enableNotifications) {
      new Notice('FLCM Plugin loaded successfully');
    }
  }

  async onunload() {
    console.log('Unloading FLCM Plugin...');
    
    // Stop auto-sync
    this.stopAutoSync();
    
    // Stop vault watcher
    if (this.vaultWatcher) {
      this.vaultWatcher.stop();
    }
    
    // Stop sync engine
    if (this.syncEngine) {
      await this.syncEngine.stop();
    }
    
    console.log('FLCM Plugin unloaded');
  }

  /**
   * Initialize all components
   */
  private async initializeComponents(): Promise<void> {
    try {
      // Initialize FLCM client
      this.flcmClient = new FLCMClient(this.settings.flcmPath, this.settings);
      
      // Initialize frontmatter manager
      this.frontmatterManager = new FrontmatterManager();
      
      // Initialize sync engine
      this.syncEngine = new FLCMSyncEngine(
        this.app,
        this.settings,
        this.flcmClient,
        this.frontmatterManager
      );
      
      // Initialize vault watcher
      this.vaultWatcher = new VaultWatcher(
        this.app,
        this.settings,
        (file) => this.onFileChanged(file)
      );
      
      // Test FLCM connection
      const isConnected = await this.flcmClient.testConnection();
      if (!isConnected && this.settings.flcmPath) {
        console.warn('FLCM connection failed');
        if (this.settings.enableNotifications) {
          new Notice('FLCM connection failed. Please check settings.', 5000);
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize FLCM Plugin components:', error);
      new Notice('Failed to initialize FLCM Plugin. Please check settings.', 5000);
    }
  }

  /**
   * Setup UI components
   */
  private setupUI(): void {
    // Add status bar item
    if (this.settings.enableStatusBar) {
      this.statusBarItem = this.addStatusBarItem();
      this.statusIndicator = new SyncStatusIndicator(this.statusBarItem);
      this.statusIndicator.updateStatus('idle');
    }
    
    // Add settings tab
    this.addSettingTab(new FLCMSettingTab(this.app, this));
    
    // Add ribbon icon
    this.addRibbonIcon('sync', 'FLCM Sync', async () => {
      await this.manualSync();
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // File creation
    this.registerEvent(
      this.app.vault.on('create', async (file) => {
        if (file instanceof TFile && this.shouldSyncFile(file)) {
          await this.handleFileCreated(file);
        }
      })
    );
    
    // File modification
    this.registerEvent(
      this.app.vault.on('modify', async (file) => {
        if (file instanceof TFile && this.shouldSyncFile(file)) {
          await this.handleFileModified(file);
        }
      })
    );
    
    // File deletion
    this.registerEvent(
      this.app.vault.on('delete', async (file) => {
        if (file instanceof TFile && this.shouldSyncFile(file)) {
          await this.handleFileDeleted(file);
        }
      })
    );
    
    // File rename
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        if (file instanceof TFile && this.shouldSyncFile(file)) {
          await this.handleFileRenamed(file, oldPath);
        }
      })
    );
  }

  /**
   * Add plugin commands
   */
  private addCommands(): void {
    // Manual sync command
    this.addCommand({
      id: 'flcm-manual-sync',
      name: 'Sync with FLCM',
      callback: async () => {
        await this.manualSync();
      }
    });
    
    // Sync current file
    this.addCommand({
      id: 'flcm-sync-current-file',
      name: 'Sync current file with FLCM',
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          await this.syncFile(activeFile);
        } else {
          new Notice('No active file to sync');
        }
      }
    });
    
    // Create FLCM document
    this.addCommand({
      id: 'flcm-create-document',
      name: 'Create FLCM document',
      callback: async () => {
        await this.createFLCMDocument();
      }
    });
    
    // View sync status
    this.addCommand({
      id: 'flcm-view-sync-status',
      name: 'View FLCM sync status',
      callback: () => {
        this.showSyncStatus();
      }
    });
  }

  /**
   * Handle file created
   */
  private async handleFileCreated(file: TFile): Promise<void> {
    if (this.settings.syncMode === 'realtime') {
      await this.syncFile(file, 'to-flcm');
    }
  }

  /**
   * Handle file modified
   */
  private async handleFileModified(file: TFile): Promise<void> {
    if (this.settings.syncMode === 'realtime') {
      // Debounce rapid modifications
      setTimeout(async () => {
        await this.syncFile(file, 'to-flcm');
      }, 1000);
    }
  }

  /**
   * Handle file deleted
   */
  private async handleFileDeleted(file: TFile): Promise<void> {
    if (this.settings.syncMode === 'realtime') {
      await this.syncEngine.deleteFromFLCM(file.path);
    }
  }

  /**
   * Handle file renamed
   */
  private async handleFileRenamed(file: TFile, oldPath: string): Promise<void> {
    if (this.settings.syncMode === 'realtime') {
      await this.syncEngine.renameInFLCM(oldPath, file.path);
    }
  }

  /**
   * File change handler for vault watcher
   */
  private async onFileChanged(file: TFile): Promise<void> {
    if (this.shouldSyncFile(file)) {
      await this.handleFileModified(file);
    }
  }

  /**
   * Check if file should be synced
   */
  private shouldSyncFile(file: TFile): boolean {
    // Check file extension
    if (!file.path.endsWith('.md')) {
      return false;
    }
    
    // Check excluded directories
    for (const excludeDir of this.settings.syncFilter.excludeDirectories) {
      if (file.path.startsWith(excludeDir)) {
        return false;
      }
    }
    
    // Check included directories
    if (this.settings.syncFilter.includeDirectories.length > 0) {
      const isIncluded = this.settings.syncFilter.includeDirectories.some(
        includeDir => file.path.startsWith(includeDir)
      );
      if (!isIncluded) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Manual sync trigger
   */
  public async manualSync(): Promise<void> {
    if (this.syncInProgress) {
      new Notice('Sync already in progress');
      return;
    }
    
    this.syncInProgress = true;
    this.statusIndicator?.updateStatus('syncing');
    
    try {
      const result = await this.syncEngine.syncAll();
      
      this.statusIndicator?.updateStatus('completed');
      
      if (this.settings.enableNotifications) {
        new Notice(`Sync completed: ${result.successful} successful, ${result.failed} failed`);
      }
      
    } catch (error) {
      console.error('Manual sync failed:', error);
      this.statusIndicator?.updateStatus('error', error.message);
      
      if (this.settings.enableNotifications) {
        new Notice(`Sync failed: ${error.message}`, 5000);
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync individual file
   */
  public async syncFile(file: TFile, direction?: 'to-flcm' | 'to-obsidian'): Promise<void> {
    try {
      await this.syncEngine.syncFile(file, direction || 'bidirectional');
      
      if (this.settings.enableNotifications) {
        new Notice(`Synced: ${file.name}`);
      }
      
    } catch (error) {
      console.error('File sync failed:', error);
      
      if (this.settings.enableNotifications) {
        new Notice(`Sync failed for ${file.name}: ${error.message}`, 5000);
      }
    }
  }

  /**
   * Create new FLCM document
   */
  private async createFLCMDocument(): Promise<void> {
    const template = await this.frontmatterManager.createTemplate();
    const fileName = `FLCM-${Date.now()}.md`;
    
    try {
      const file = await this.app.vault.create(fileName, template);
      await this.app.workspace.openLinkText(file.path, '', true);
      
      new Notice(`Created FLCM document: ${fileName}`);
    } catch (error) {
      console.error('Failed to create FLCM document:', error);
      new Notice(`Failed to create FLCM document: ${error.message}`, 5000);
    }
  }

  /**
   * Show sync status
   */
  private showSyncStatus(): void {
    const stats = this.syncEngine.getStats();
    const status = `
Sync Statistics:
- Total syncs: ${stats.totalSyncs}
- Successful: ${stats.successfulSyncs}
- Failed: ${stats.failedSyncs}
- Conflicts: ${stats.conflictsSyncs}
- Last sync: ${stats.lastSyncTime?.toLocaleString() || 'Never'}
- Average time: ${stats.avgSyncTime}ms
    `.trim();
    
    new Notice(status, 10000);
  }

  /**
   * Start auto-sync
   */
  private startAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    
    const intervalMs = this.settings.autoSyncInterval * 60 * 1000;
    
    this.autoSyncInterval = setInterval(async () => {
      if (!this.syncInProgress) {
        await this.manualSync();
      }
    }, intervalMs);
    
    console.log(`Auto-sync started with ${this.settings.autoSyncInterval}min interval`);
  }

  /**
   * Stop auto-sync
   */
  private stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = undefined;
      console.log('Auto-sync stopped');
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    
    // Restart auto-sync if settings changed
    if (this.settings.syncMode === 'auto' || this.settings.syncMode === 'realtime') {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }
}