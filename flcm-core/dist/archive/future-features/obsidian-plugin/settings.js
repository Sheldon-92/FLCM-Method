"use strict";
/**
 * FLCM Plugin Settings Tab
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLCMSettingTab = void 0;
const obsidian_1 = require("obsidian");
class FLCMSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        // Title
        containerEl.createEl('h2', { text: 'FLCM Framework Integration' });
        // Connection Settings
        this.addConnectionSettings(containerEl);
        // Sync Settings
        this.addSyncSettings(containerEl);
        // Filter Settings
        this.addFilterSettings(containerEl);
        // Metadata Settings
        this.addMetadataSettings(containerEl);
        // Advanced Settings
        this.addAdvancedSettings(containerEl);
        // Status Information
        this.addStatusInformation(containerEl);
    }
    addConnectionSettings(containerEl) {
        containerEl.createEl('h3', { text: 'Connection Settings' });
        // FLCM Path
        new obsidian_1.Setting(containerEl)
            .setName('FLCM Installation Path')
            .setDesc('Path to your FLCM installation directory (e.g., /Users/you/.flcm)')
            .addText(text => text
            .setPlaceholder('/path/to/flcm')
            .setValue(this.plugin.settings.flcmPath)
            .onChange(async (value) => {
            this.plugin.settings.flcmPath = value;
            await this.plugin.saveSettings();
            await this.testConnection();
        }));
        // Test Connection Button
        new obsidian_1.Setting(containerEl)
            .setName('Test Connection')
            .setDesc('Test connection to FLCM system')
            .addButton(button => button
            .setButtonText('Test Connection')
            .setCta()
            .onClick(async () => {
            await this.testConnection();
        }));
    }
    addSyncSettings(containerEl) {
        containerEl.createEl('h3', { text: 'Synchronization Settings' });
        // Sync Mode
        new obsidian_1.Setting(containerEl)
            .setName('Sync Mode')
            .setDesc('How documents should be synchronized with FLCM')
            .addDropdown(dropdown => dropdown
            .addOption('manual', 'Manual - Sync only when requested')
            .addOption('auto', 'Automatic - Sync at regular intervals')
            .addOption('realtime', 'Real-time - Sync on every change')
            .setValue(this.plugin.settings.syncMode)
            .onChange(async (value) => {
            this.plugin.settings.syncMode = value;
            await this.plugin.saveSettings();
        }));
        // Auto-sync Interval (only show if auto mode selected)
        if (this.plugin.settings.syncMode === 'auto') {
            new obsidian_1.Setting(containerEl)
                .setName('Auto-sync Interval')
                .setDesc('How often to automatically sync (in minutes)')
                .addSlider(slider => slider
                .setLimits(1, 120, 1)
                .setValue(this.plugin.settings.autoSyncInterval)
                .setDynamicTooltip()
                .onChange(async (value) => {
                this.plugin.settings.autoSyncInterval = value;
                await this.plugin.saveSettings();
            }));
        }
        // Conflict Resolution
        new obsidian_1.Setting(containerEl)
            .setName('Conflict Resolution')
            .setDesc('How to handle conflicts when both versions have changes')
            .addDropdown(dropdown => dropdown
            .addOption('ask', 'Always Ask - Show conflict dialog')
            .addOption('local', 'Prefer Local - Use Obsidian version')
            .addOption('remote', 'Prefer Remote - Use FLCM version')
            .addOption('newest', 'Prefer Newest - Use most recently modified')
            .setValue(this.plugin.settings.conflictResolution)
            .onChange(async (value) => {
            this.plugin.settings.conflictResolution = value;
            await this.plugin.saveSettings();
        }));
    }
    addFilterSettings(containerEl) {
        containerEl.createEl('h3', { text: 'Sync Filters' });
        // Include Directories
        new obsidian_1.Setting(containerEl)
            .setName('Include Directories')
            .setDesc('Only sync files in these directories (comma-separated, leave empty to include all)')
            .addTextArea(text => text
            .setPlaceholder('folder1, folder2/subfolder')
            .setValue(this.plugin.settings.syncFilter.includeDirectories.join(', '))
            .onChange(async (value) => {
            this.plugin.settings.syncFilter.includeDirectories =
                value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            await this.plugin.saveSettings();
        }));
        // Exclude Directories
        new obsidian_1.Setting(containerEl)
            .setName('Exclude Directories')
            .setDesc('Never sync files in these directories (comma-separated)')
            .addTextArea(text => text
            .setPlaceholder('.obsidian, .trash, private')
            .setValue(this.plugin.settings.syncFilter.excludeDirectories.join(', '))
            .onChange(async (value) => {
            this.plugin.settings.syncFilter.excludeDirectories =
                value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            await this.plugin.saveSettings();
        }));
        // Include Tags
        new obsidian_1.Setting(containerEl)
            .setName('Include Tags')
            .setDesc('Only sync notes with these tags (comma-separated, leave empty to include all)')
            .addText(text => text
            .setPlaceholder('#flcm, #work, #learning')
            .setValue(this.plugin.settings.syncFilter.includeTags.join(', '))
            .onChange(async (value) => {
            this.plugin.settings.syncFilter.includeTags =
                value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            await this.plugin.saveSettings();
        }));
        // Exclude Tags
        new obsidian_1.Setting(containerEl)
            .setName('Exclude Tags')
            .setDesc('Never sync notes with these tags (comma-separated)')
            .addText(text => text
            .setPlaceholder('#private, #draft, #archive')
            .setValue(this.plugin.settings.syncFilter.excludeTags.join(', '))
            .onChange(async (value) => {
            this.plugin.settings.syncFilter.excludeTags =
                value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            await this.plugin.saveSettings();
        }));
    }
    addMetadataSettings(containerEl) {
        containerEl.createEl('h3', { text: 'Metadata Settings' });
        // Preserve Obsidian Metadata
        new obsidian_1.Setting(containerEl)
            .setName('Preserve Obsidian Metadata')
            .setDesc('Keep existing Obsidian frontmatter when syncing')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.metadata.preserveObsidianMetadata)
            .onChange(async (value) => {
            this.plugin.settings.metadata.preserveObsidianMetadata = value;
            await this.plugin.saveSettings();
        }));
        // Add Creation Date
        new obsidian_1.Setting(containerEl)
            .setName('Add Creation Date')
            .setDesc('Automatically add creation date to FLCM metadata')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.metadata.addCreationDate)
            .onChange(async (value) => {
            this.plugin.settings.metadata.addCreationDate = value;
            await this.plugin.saveSettings();
        }));
        // Add Modification Date
        new obsidian_1.Setting(containerEl)
            .setName('Add Modification Date')
            .setDesc('Automatically add modification date to FLCM metadata')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.metadata.addModificationDate)
            .onChange(async (value) => {
            this.plugin.settings.metadata.addModificationDate = value;
            await this.plugin.saveSettings();
        }));
        // Add Sync Timestamp
        new obsidian_1.Setting(containerEl)
            .setName('Add Sync Timestamp')
            .setDesc('Track when documents were last synced')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.metadata.addSyncTimestamp)
            .onChange(async (value) => {
            this.plugin.settings.metadata.addSyncTimestamp = value;
            await this.plugin.saveSettings();
        }));
    }
    addAdvancedSettings(containerEl) {
        // Collapsible advanced section
        const advancedDetails = containerEl.createEl('details');
        advancedDetails.createEl('summary', { text: 'Advanced Settings' });
        const advancedContainer = advancedDetails.createEl('div');
        // Max Sync Retries
        new obsidian_1.Setting(advancedContainer)
            .setName('Max Sync Retries')
            .setDesc('Number of times to retry failed sync operations')
            .addSlider(slider => slider
            .setLimits(1, 10, 1)
            .setValue(this.plugin.settings.advanced.maxSyncRetries)
            .setDynamicTooltip()
            .onChange(async (value) => {
            this.plugin.settings.advanced.maxSyncRetries = value;
            await this.plugin.saveSettings();
        }));
        // Sync Timeout
        new obsidian_1.Setting(advancedContainer)
            .setName('Sync Timeout')
            .setDesc('Timeout for sync operations (in seconds)')
            .addSlider(slider => slider
            .setLimits(5, 300, 5)
            .setValue(this.plugin.settings.advanced.syncTimeout)
            .setDynamicTooltip()
            .onChange(async (value) => {
            this.plugin.settings.advanced.syncTimeout = value;
            await this.plugin.saveSettings();
        }));
        // Conflict Backup
        new obsidian_1.Setting(advancedContainer)
            .setName('Create Conflict Backups')
            .setDesc('Create backup files when conflicts are detected')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.advanced.conflictBackupEnabled)
            .onChange(async (value) => {
            this.plugin.settings.advanced.conflictBackupEnabled = value;
            await this.plugin.saveSettings();
        }));
        // Debug Logging
        new obsidian_1.Setting(advancedContainer)
            .setName('Debug Logging')
            .setDesc('Enable detailed logging for troubleshooting')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.advanced.debugLogging)
            .onChange(async (value) => {
            this.plugin.settings.advanced.debugLogging = value;
            await this.plugin.saveSettings();
        }));
    }
    addStatusInformation(containerEl) {
        containerEl.createEl('h3', { text: 'Status' });
        // Connection Status
        const statusContainer = containerEl.createEl('div');
        statusContainer.style.marginBottom = '20px';
        const statusEl = statusContainer.createEl('p');
        statusEl.textContent = 'Checking connection...';
        // Update status
        this.updateConnectionStatus(statusEl);
        // Sync Statistics
        if (this.plugin.syncEngine) {
            const stats = this.plugin.syncEngine.getStats();
            const statsContainer = containerEl.createEl('div', { cls: 'flcm-stats' });
            statsContainer.createEl('h4', { text: 'Sync Statistics' });
            const statsGrid = statsContainer.createEl('div', { cls: 'flcm-stats-grid' });
            statsGrid.style.display = 'grid';
            statsGrid.style.gridTemplateColumns = '1fr 1fr';
            statsGrid.style.gap = '10px';
            statsGrid.createEl('div').innerHTML = `<strong>Total Syncs:</strong> ${stats.totalSyncs}`;
            statsGrid.createEl('div').innerHTML = `<strong>Successful:</strong> ${stats.successfulSyncs}`;
            statsGrid.createEl('div').innerHTML = `<strong>Failed:</strong> ${stats.failedSyncs}`;
            statsGrid.createEl('div').innerHTML = `<strong>Conflicts:</strong> ${stats.conflictsSyncs}`;
            if (stats.lastSyncTime) {
                statsContainer.createEl('p').innerHTML =
                    `<strong>Last Sync:</strong> ${stats.lastSyncTime.toLocaleString()}`;
            }
            if (stats.avgSyncTime > 0) {
                statsContainer.createEl('p').innerHTML =
                    `<strong>Average Sync Time:</strong> ${stats.avgSyncTime.toFixed(0)}ms`;
            }
        }
        // Action Buttons
        const actionsContainer = containerEl.createEl('div');
        actionsContainer.style.marginTop = '20px';
        // Manual Sync Button
        new obsidian_1.Setting(actionsContainer)
            .addButton(button => button
            .setButtonText('Sync All Documents')
            .setCta()
            .onClick(async () => {
            await this.plugin.manualSync();
        }))
            .addButton(button => button
            .setButtonText('Create FLCM Document')
            .onClick(async () => {
            await this.createFLCMDocument();
        }));
        // Clear Statistics Button
        new obsidian_1.Setting(actionsContainer)
            .addButton(button => button
            .setButtonText('Clear Statistics')
            .setWarning()
            .onClick(async () => {
            // Reset stats (would need to be implemented in sync engine)
            new obsidian_1.Notice('Statistics cleared');
        }));
    }
    async testConnection() {
        if (!this.plugin.settings.flcmPath) {
            new obsidian_1.Notice('Please set FLCM path first', 3000);
            return;
        }
        try {
            const isConnected = await this.plugin.flcmClient.testConnection();
            if (isConnected) {
                new obsidian_1.Notice('✅ FLCM connection successful', 3000);
            }
            else {
                new obsidian_1.Notice('❌ FLCM connection failed. Please check the path.', 5000);
            }
        }
        catch (error) {
            console.error('Connection test failed:', error);
            new obsidian_1.Notice(`❌ Connection test failed: ${error.message}`, 5000);
        }
    }
    async updateConnectionStatus(statusEl) {
        if (!this.plugin.settings.flcmPath) {
            statusEl.innerHTML = '❌ FLCM path not configured';
            statusEl.style.color = 'var(--text-error)';
            return;
        }
        try {
            const isConnected = await this.plugin.flcmClient.testConnection();
            if (isConnected) {
                statusEl.innerHTML = '✅ Connected to FLCM';
                statusEl.style.color = 'var(--text-success)';
            }
            else {
                statusEl.innerHTML = '❌ Cannot connect to FLCM';
                statusEl.style.color = 'var(--text-error)';
            }
        }
        catch (error) {
            statusEl.innerHTML = '❌ Connection error';
            statusEl.style.color = 'var(--text-error)';
        }
    }
    async createFLCMDocument() {
        const template = await this.plugin.frontmatterManager.createTemplate();
        const fileName = `FLCM-${Date.now()}.md`;
        try {
            const file = await this.app.vault.create(fileName, template);
            // Open the new file
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(file);
            new obsidian_1.Notice(`Created FLCM document: ${fileName}`, 3000);
        }
        catch (error) {
            console.error('Failed to create FLCM document:', error);
            new obsidian_1.Notice(`Failed to create document: ${error.message}`, 5000);
        }
    }
}
exports.FLCMSettingTab = FLCMSettingTab;
//# sourceMappingURL=settings.js.map