/**
 * Preference Manager
 * Handles user preference persistence
 */
import { UserPreferences, InteractionMode } from './types';
export declare class PreferenceManager {
    private logger;
    private preferencePath;
    private preferences;
    private defaultPreferences;
    constructor();
    /**
     * Ensure .flcm directory exists
     */
    private ensureDirectoryExists;
    /**
     * Load preferences from file
     */
    private loadPreferences;
    /**
     * Save preferences to file
     */
    private savePreferences;
    /**
     * Get preferences (async)
     */
    getPreferences(): Promise<UserPreferences>;
    /**
     * Get preferences (sync)
     */
    getPreferencesSync(): UserPreferences;
    /**
     * Set preferences
     */
    setPreferences(preferences: UserPreferences): Promise<void>;
    /**
     * Update specific preference
     */
    updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): Promise<void>;
    /**
     * Set default mode
     */
    setDefaultMode(mode: InteractionMode): Promise<void>;
    /**
     * Get default mode
     */
    getDefaultMode(): InteractionMode;
    /**
     * Toggle framework suggestions
     */
    toggleFrameworkSuggestions(): Promise<boolean>;
    /**
     * Toggle deprecation warnings
     */
    toggleDeprecationWarnings(): Promise<boolean>;
    /**
     * Toggle context preservation
     */
    toggleContextPreservation(): Promise<boolean>;
    /**
     * Add command alias
     */
    addCommandAlias(oldCommand: string, newCommand: string): Promise<void>;
    /**
     * Remove command alias
     */
    removeCommandAlias(oldCommand: string): Promise<void>;
    /**
     * Set collaborative style
     */
    setCollaborativeStyle(verbosity: 'minimal' | 'normal' | 'detailed', guidanceLevel: 'beginner' | 'intermediate' | 'expert'): Promise<void>;
    /**
     * Reset to defaults
     */
    resetToDefaults(): Promise<void>;
    /**
     * Export preferences
     */
    exportPreferences(): Promise<string>;
    /**
     * Import preferences
     */
    importPreferences(data: string): Promise<void>;
    /**
     * Get preference statistics
     */
    getStatistics(): any;
}
