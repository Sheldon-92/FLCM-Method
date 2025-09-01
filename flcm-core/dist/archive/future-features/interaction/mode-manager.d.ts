/**
 * Mode Manager
 * Handles switching between command and collaborative modes
 */
import { InteractionMode, ModeContext } from './types';
export declare class ModeManager {
    private modes;
    private currentMode;
    private context;
    private preferenceManager;
    private logger;
    private transitions;
    constructor();
    /**
     * Get current interaction mode
     */
    getCurrentMode(): InteractionMode;
    /**
     * Get current mode handler
     */
    getCurrentModeHandler(): any;
    /**
     * Switch to a different mode
     */
    switchMode(targetMode: InteractionMode, reason?: string): Promise<boolean>;
    /**
     * Process user input based on current mode
     */
    processInput(input: string): Promise<string>;
    /**
     * Check if input is a mode switch command
     */
    private isModeSwitchCommand;
    /**
     * Handle mode switch command
     */
    private handleModeSwitchCommand;
    /**
     * Get welcome message for mode
     */
    private getModeWelcomeMessage;
    /**
     * Load default mode from preferences
     */
    private loadDefaultMode;
    /**
     * Get mode statistics
     */
    getStatistics(): any;
    /**
     * Calculate mode usage statistics
     */
    private calculateModeUsage;
    /**
     * Get mode help text
     */
    getModeHelp(mode?: InteractionMode): string;
    /**
     * Export context for persistence
     */
    exportContext(): Promise<ModeContext>;
    /**
     * Import context from persistence
     */
    importContext(context: ModeContext): Promise<void>;
}
