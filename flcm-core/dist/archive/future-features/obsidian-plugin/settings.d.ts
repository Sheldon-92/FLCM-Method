/**
 * FLCM Plugin Settings Tab
 */
import { App, PluginSettingTab } from 'obsidian';
import FLCMPlugin from './main';
export declare class FLCMSettingTab extends PluginSettingTab {
    plugin: FLCMPlugin;
    constructor(app: App, plugin: FLCMPlugin);
    display(): void;
    private addConnectionSettings;
    private addSyncSettings;
    private addFilterSettings;
    private addMetadataSettings;
    private addAdvancedSettings;
    private addStatusInformation;
    private testConnection;
    private updateConnectionStatus;
    private createFLCMDocument;
}
