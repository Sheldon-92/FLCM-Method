"use strict";
/**
 * Preference Manager
 * Handles user preference persistence
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferenceManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const logger_1 = require("../shared/utils/logger");
class PreferenceManager {
    constructor() {
        this.preferences = null;
        this.logger = new logger_1.Logger('PreferenceManager');
        // Set preference file path
        const flcmDir = path.join(os.homedir(), '.flcm');
        this.preferencePath = path.join(flcmDir, 'preferences.json');
        // Default preferences
        this.defaultPreferences = {
            default_mode: 'collaborative',
            auto_suggest_frameworks: true,
            show_deprecation_warnings: true,
            preserve_context_on_switch: true,
            command_aliases: [
                { old: 'analyze', new: 'explore' },
                { old: 'write', new: 'create' },
                { old: 'post', new: 'publish' }
            ],
            collaborative_style: {
                verbosity: 'normal',
                guidance_level: 'intermediate'
            }
        };
        // Ensure directory exists
        this.ensureDirectoryExists();
        // Load preferences
        this.loadPreferences();
    }
    /**
     * Ensure .flcm directory exists
     */
    ensureDirectoryExists() {
        const dir = path.dirname(this.preferencePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            this.logger.info('Created .flcm directory');
        }
    }
    /**
     * Load preferences from file
     */
    loadPreferences() {
        try {
            if (fs.existsSync(this.preferencePath)) {
                const data = fs.readFileSync(this.preferencePath, 'utf8');
                this.preferences = JSON.parse(data);
                this.logger.info('Preferences loaded');
            }
            else {
                // Create default preferences file
                this.preferences = { ...this.defaultPreferences };
                this.savePreferences();
                this.logger.info('Created default preferences');
            }
        }
        catch (error) {
            this.logger.error('Failed to load preferences', { error });
            this.preferences = { ...this.defaultPreferences };
        }
    }
    /**
     * Save preferences to file
     */
    savePreferences() {
        try {
            const data = JSON.stringify(this.preferences, null, 2);
            fs.writeFileSync(this.preferencePath, data);
            this.logger.debug('Preferences saved');
        }
        catch (error) {
            this.logger.error('Failed to save preferences', { error });
        }
    }
    /**
     * Get preferences (async)
     */
    async getPreferences() {
        if (!this.preferences) {
            this.loadPreferences();
        }
        return this.preferences || this.defaultPreferences;
    }
    /**
     * Get preferences (sync)
     */
    getPreferencesSync() {
        if (!this.preferences) {
            this.loadPreferences();
        }
        return this.preferences || this.defaultPreferences;
    }
    /**
     * Set preferences
     */
    async setPreferences(preferences) {
        this.preferences = preferences;
        this.savePreferences();
    }
    /**
     * Update specific preference
     */
    async updatePreference(key, value) {
        if (!this.preferences) {
            this.preferences = { ...this.defaultPreferences };
        }
        this.preferences[key] = value;
        this.savePreferences();
        this.logger.debug(`Updated preference: ${key}`);
    }
    /**
     * Set default mode
     */
    async setDefaultMode(mode) {
        await this.updatePreference('default_mode', mode);
    }
    /**
     * Get default mode
     */
    getDefaultMode() {
        const prefs = this.getPreferencesSync();
        return prefs.default_mode;
    }
    /**
     * Toggle framework suggestions
     */
    async toggleFrameworkSuggestions() {
        const current = this.preferences?.auto_suggest_frameworks ?? true;
        const newValue = !current;
        await this.updatePreference('auto_suggest_frameworks', newValue);
        return newValue;
    }
    /**
     * Toggle deprecation warnings
     */
    async toggleDeprecationWarnings() {
        const current = this.preferences?.show_deprecation_warnings ?? true;
        const newValue = !current;
        await this.updatePreference('show_deprecation_warnings', newValue);
        return newValue;
    }
    /**
     * Toggle context preservation
     */
    async toggleContextPreservation() {
        const current = this.preferences?.preserve_context_on_switch ?? true;
        const newValue = !current;
        await this.updatePreference('preserve_context_on_switch', newValue);
        return newValue;
    }
    /**
     * Add command alias
     */
    async addCommandAlias(oldCommand, newCommand) {
        if (!this.preferences) {
            this.preferences = { ...this.defaultPreferences };
        }
        // Check if alias exists
        const exists = this.preferences.command_aliases.some(alias => alias.old === oldCommand);
        if (!exists) {
            this.preferences.command_aliases.push({
                old: oldCommand,
                new: newCommand
            });
            this.savePreferences();
            this.logger.info(`Added command alias: ${oldCommand} -> ${newCommand}`);
        }
    }
    /**
     * Remove command alias
     */
    async removeCommandAlias(oldCommand) {
        if (!this.preferences)
            return;
        this.preferences.command_aliases = this.preferences.command_aliases.filter(alias => alias.old !== oldCommand);
        this.savePreferences();
        this.logger.info(`Removed command alias: ${oldCommand}`);
    }
    /**
     * Set collaborative style
     */
    async setCollaborativeStyle(verbosity, guidanceLevel) {
        await this.updatePreference('collaborative_style', {
            verbosity,
            guidance_level: guidanceLevel
        });
    }
    /**
     * Reset to defaults
     */
    async resetToDefaults() {
        this.preferences = { ...this.defaultPreferences };
        this.savePreferences();
        this.logger.info('Preferences reset to defaults');
    }
    /**
     * Export preferences
     */
    async exportPreferences() {
        const prefs = await this.getPreferences();
        return JSON.stringify(prefs, null, 2);
    }
    /**
     * Import preferences
     */
    async importPreferences(data) {
        try {
            const imported = JSON.parse(data);
            // Validate structure
            if (!imported.default_mode || !imported.collaborative_style) {
                throw new Error('Invalid preference structure');
            }
            this.preferences = imported;
            this.savePreferences();
            this.logger.info('Preferences imported successfully');
        }
        catch (error) {
            this.logger.error('Failed to import preferences', { error });
            throw new Error(`Import failed: ${error.message}`);
        }
    }
    /**
     * Get preference statistics
     */
    getStatistics() {
        const prefs = this.getPreferencesSync();
        return {
            default_mode: prefs.default_mode,
            auto_suggest: prefs.auto_suggest_frameworks,
            deprecation_warnings: prefs.show_deprecation_warnings,
            context_preservation: prefs.preserve_context_on_switch,
            alias_count: prefs.command_aliases.length,
            style: prefs.collaborative_style,
            file_path: this.preferencePath
        };
    }
}
exports.PreferenceManager = PreferenceManager;
//# sourceMappingURL=preference-manager.js.map