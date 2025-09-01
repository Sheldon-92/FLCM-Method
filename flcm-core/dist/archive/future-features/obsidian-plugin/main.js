"use strict";
/**
 * FLCM Obsidian Plugin - Main Entry Point
 */
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const sync_engine_1 = require("./sync-engine");
const settings_1 = require("./settings");
const status_indicator_1 = require("./status-indicator");
const vault_watcher_1 = require("./vault-watcher");
const frontmatter_manager_1 = require("./frontmatter-manager");
const flcm_client_1 = require("./flcm-client");
const DEFAULT_SETTINGS = {
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
class FLCMPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.syncInProgress = false;
    }
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
            new obsidian_1.Notice('FLCM Plugin loaded successfully');
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
    async initializeComponents() {
        try {
            // Initialize FLCM client
            this.flcmClient = new flcm_client_1.FLCMClient(this.settings.flcmPath, this.settings);
            // Initialize frontmatter manager
            this.frontmatterManager = new frontmatter_manager_1.FrontmatterManager();
            // Initialize sync engine
            this.syncEngine = new sync_engine_1.FLCMSyncEngine(this.app, this.settings, this.flcmClient, this.frontmatterManager);
            // Initialize vault watcher
            this.vaultWatcher = new vault_watcher_1.VaultWatcher(this.app, this.settings, (file) => this.onFileChanged(file));
            // Test FLCM connection
            const isConnected = await this.flcmClient.testConnection();
            if (!isConnected && this.settings.flcmPath) {
                console.warn('FLCM connection failed');
                if (this.settings.enableNotifications) {
                    new obsidian_1.Notice('FLCM connection failed. Please check settings.', 5000);
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize FLCM Plugin components:', error);
            new obsidian_1.Notice('Failed to initialize FLCM Plugin. Please check settings.', 5000);
        }
    }
    /**
     * Setup UI components
     */
    setupUI() {
        // Add status bar item
        if (this.settings.enableStatusBar) {
            this.statusBarItem = this.addStatusBarItem();
            this.statusIndicator = new status_indicator_1.SyncStatusIndicator(this.statusBarItem);
            this.statusIndicator.updateStatus('idle');
        }
        // Add settings tab
        this.addSettingTab(new settings_1.FLCMSettingTab(this.app, this));
        // Add ribbon icon
        this.addRibbonIcon('sync', 'FLCM Sync', async () => {
            await this.manualSync();
        });
    }
    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // File creation
        this.registerEvent(this.app.vault.on('create', async (file) => {
            if (file instanceof obsidian_1.TFile && this.shouldSyncFile(file)) {
                await this.handleFileCreated(file);
            }
        }));
        // File modification
        this.registerEvent(this.app.vault.on('modify', async (file) => {
            if (file instanceof obsidian_1.TFile && this.shouldSyncFile(file)) {
                await this.handleFileModified(file);
            }
        }));
        // File deletion
        this.registerEvent(this.app.vault.on('delete', async (file) => {
            if (file instanceof obsidian_1.TFile && this.shouldSyncFile(file)) {
                await this.handleFileDeleted(file);
            }
        }));
        // File rename
        this.registerEvent(this.app.vault.on('rename', async (file, oldPath) => {
            if (file instanceof obsidian_1.TFile && this.shouldSyncFile(file)) {
                await this.handleFileRenamed(file, oldPath);
            }
        }));
    }
    /**
     * Add plugin commands
     */
    addCommands() {
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
                }
                else {
                    new obsidian_1.Notice('No active file to sync');
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
    async handleFileCreated(file) {
        if (this.settings.syncMode === 'realtime') {
            await this.syncFile(file, 'to-flcm');
        }
    }
    /**
     * Handle file modified
     */
    async handleFileModified(file) {
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
    async handleFileDeleted(file) {
        if (this.settings.syncMode === 'realtime') {
            await this.syncEngine.deleteFromFLCM(file.path);
        }
    }
    /**
     * Handle file renamed
     */
    async handleFileRenamed(file, oldPath) {
        if (this.settings.syncMode === 'realtime') {
            await this.syncEngine.renameInFLCM(oldPath, file.path);
        }
    }
    /**
     * File change handler for vault watcher
     */
    async onFileChanged(file) {
        if (this.shouldSyncFile(file)) {
            await this.handleFileModified(file);
        }
    }
    /**
     * Check if file should be synced
     */
    shouldSyncFile(file) {
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
            const isIncluded = this.settings.syncFilter.includeDirectories.some(includeDir => file.path.startsWith(includeDir));
            if (!isIncluded) {
                return false;
            }
        }
        return true;
    }
    /**
     * Manual sync trigger
     */
    async manualSync() {
        if (this.syncInProgress) {
            new obsidian_1.Notice('Sync already in progress');
            return;
        }
        this.syncInProgress = true;
        this.statusIndicator?.updateStatus('syncing');
        try {
            const result = await this.syncEngine.syncAll();
            this.statusIndicator?.updateStatus('completed');
            if (this.settings.enableNotifications) {
                new obsidian_1.Notice(`Sync completed: ${result.successful} successful, ${result.failed} failed`);
            }
        }
        catch (error) {
            console.error('Manual sync failed:', error);
            this.statusIndicator?.updateStatus('error', error.message);
            if (this.settings.enableNotifications) {
                new obsidian_1.Notice(`Sync failed: ${error.message}`, 5000);
            }
        }
        finally {
            this.syncInProgress = false;
        }
    }
    /**
     * Sync individual file
     */
    async syncFile(file, direction) {
        try {
            await this.syncEngine.syncFile(file, direction || 'bidirectional');
            if (this.settings.enableNotifications) {
                new obsidian_1.Notice(`Synced: ${file.name}`);
            }
        }
        catch (error) {
            console.error('File sync failed:', error);
            if (this.settings.enableNotifications) {
                new obsidian_1.Notice(`Sync failed for ${file.name}: ${error.message}`, 5000);
            }
        }
    }
    /**
     * Create new FLCM document
     */
    async createFLCMDocument() {
        const template = await this.frontmatterManager.createTemplate();
        const fileName = `FLCM-${Date.now()}.md`;
        try {
            const file = await this.app.vault.create(fileName, template);
            await this.app.workspace.openLinkText(file.path, '', true);
            new obsidian_1.Notice(`Created FLCM document: ${fileName}`);
        }
        catch (error) {
            console.error('Failed to create FLCM document:', error);
            new obsidian_1.Notice(`Failed to create FLCM document: ${error.message}`, 5000);
        }
    }
    /**
     * Show sync status
     */
    showSyncStatus() {
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
        new obsidian_1.Notice(status, 10000);
    }
    /**
     * Start auto-sync
     */
    startAutoSync() {
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
    stopAutoSync() {
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
        }
        else {
            this.stopAutoSync();
        }
    }
}
exports.default = FLCMPlugin;
//# sourceMappingURL=main.js.map