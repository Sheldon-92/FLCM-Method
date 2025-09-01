"use strict";
/**
 * Mode Manager
 * Handles switching between command and collaborative modes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeManager = void 0;
const command_mode_1 = require("./modes/command-mode");
const collaborative_mode_1 = require("./modes/collaborative-mode");
const shared_context_1 = require("./shared-context");
const preference_manager_1 = require("./preference-manager");
const logger_1 = require("../shared/utils/logger");
class ModeManager {
    constructor() {
        this.logger = new logger_1.Logger('ModeManager');
        this.preferenceManager = new preference_manager_1.PreferenceManager();
        this.context = new shared_context_1.SharedContext();
        this.transitions = [];
        // Initialize modes
        this.modes = new Map();
        this.modes.set('command', new command_mode_1.CommandMode(this.context));
        this.modes.set('collaborative', new collaborative_mode_1.CollaborativeMode(this.context));
        // Load user preference or default
        this.currentMode = this.loadDefaultMode();
        this.logger.info(`Initialized with mode: ${this.currentMode}`);
    }
    /**
     * Get current interaction mode
     */
    getCurrentMode() {
        return this.currentMode;
    }
    /**
     * Get current mode handler
     */
    getCurrentModeHandler() {
        return this.modes.get(this.currentMode);
    }
    /**
     * Switch to a different mode
     */
    async switchMode(targetMode, reason) {
        if (targetMode === this.currentMode) {
            this.logger.debug('Already in target mode');
            return true;
        }
        this.logger.info(`Switching from ${this.currentMode} to ${targetMode}`);
        try {
            // Prepare for transition
            const transition = {
                from: this.currentMode,
                to: targetMode,
                timestamp: new Date(),
                context_preserved: false,
                reason
            };
            // Save current context
            const currentHandler = this.modes.get(this.currentMode);
            if (currentHandler) {
                await currentHandler.prepareForSwitch();
            }
            // Preserve context if enabled
            const preferences = await this.preferenceManager.getPreferences();
            if (preferences.preserve_context_on_switch) {
                const preserved = await this.context.migrateContext(this.currentMode, targetMode);
                transition.context_preserved = preserved;
            }
            // Switch mode
            this.currentMode = targetMode;
            // Initialize new mode with context
            const newHandler = this.modes.get(targetMode);
            if (newHandler) {
                await newHandler.initialize(this.context);
            }
            // Record transition
            this.transitions.push(transition);
            this.context.incrementModeSwitches();
            // Save preference if this is user-initiated
            if (reason === 'user_request') {
                await this.preferenceManager.setDefaultMode(targetMode);
            }
            this.logger.info(`Mode switch complete: ${targetMode}`);
            return true;
        }
        catch (error) {
            this.logger.error('Mode switch failed', { error });
            return false;
        }
    }
    /**
     * Process user input based on current mode
     */
    async processInput(input) {
        // Check for mode switch command
        if (this.isModeSwitch)
            Command(input);
        {
            return this.handleModeSwitchCommand(input);
        }
        // Process with current mode handler
        const handler = this.getCurrentModeHandler();
        if (!handler) {
            return 'Error: No mode handler available';
        }
        try {
            // Record input in conversation history
            const entryBefore = {
                timestamp: new Date(),
                mode: this.currentMode,
                input,
                output: ''
            };
            // Process input
            const output = await handler.process(input);
            // Update conversation entry
            entryBefore.output = output;
            this.context.addConversationEntry(entryBefore);
            return output;
        }
        catch (error) {
            this.logger.error('Input processing failed', { error, input });
            return `Error processing input: ${error.message}`;
        }
    }
    /**
     * Check if input is a mode switch command
     */
    isModeSwitchCommand(input) {
        const trimmed = input.trim().toLowerCase();
        return trimmed.startsWith('/mode ') ||
            trimmed === '/mode' ||
            trimmed.startsWith('switch to ') ||
            trimmed.includes('mode');
    }
    /**
     * Handle mode switch command
     */
    async handleModeSwitchCommand(input) {
        const trimmed = input.trim().toLowerCase();
        // Parse target mode
        let targetMode = null;
        if (trimmed.includes('command')) {
            targetMode = 'command';
        }
        else if (trimmed.includes('collaborative') || trimmed.includes('collab')) {
            targetMode = 'collaborative';
        }
        else if (trimmed === '/mode') {
            // Toggle mode
            targetMode = this.currentMode === 'command' ? 'collaborative' : 'command';
        }
        if (!targetMode) {
            return `Current mode: ${this.currentMode}\nAvailable modes: command, collaborative\nUse '/mode <mode>' to switch`;
        }
        // Switch mode
        const success = await this.switchMode(targetMode, 'user_request');
        if (success) {
            return this.getModeWelcomeMessage(targetMode);
        }
        else {
            return `Failed to switch to ${targetMode} mode`;
        }
    }
    /**
     * Get welcome message for mode
     */
    getModeWelcomeMessage(mode) {
        const messages = {
            command: `Switched to command mode. Legacy commands available.
Type 'help' for command list or '/mode collaborative' to switch back.`,
            collaborative: `Switched to collaborative mode. I'll guide you through frameworks.
Just tell me what you want to explore, create, or publish.
Type '/mode command' for legacy commands.`
        };
        return messages[mode] || `Switched to ${mode} mode`;
    }
    /**
     * Load default mode from preferences
     */
    loadDefaultMode() {
        try {
            const preferences = this.preferenceManager.getPreferencesSync();
            return preferences.default_mode || 'collaborative';
        }
        catch {
            // Default to collaborative mode for new users
            return 'collaborative';
        }
    }
    /**
     * Get mode statistics
     */
    getStatistics() {
        return {
            current_mode: this.currentMode,
            total_transitions: this.transitions.length,
            context_preservations: this.transitions.filter(t => t.context_preserved).length,
            session_data: this.context.getSessionData(),
            mode_usage: this.calculateModeUsage()
        };
    }
    /**
     * Calculate mode usage statistics
     */
    calculateModeUsage() {
        const usage = {
            command: 0,
            collaborative: 0
        };
        const history = this.context.getConversationHistory();
        history.forEach(entry => {
            usage[entry.mode]++;
        });
        return usage;
    }
    /**
     * Get mode help text
     */
    getModeHelp(mode) {
        const targetMode = mode || this.currentMode;
        const handler = this.modes.get(targetMode);
        if (handler && typeof handler.getHelp === 'function') {
            return handler.getHelp();
        }
        return `No help available for ${targetMode} mode`;
    }
    /**
     * Export context for persistence
     */
    async exportContext() {
        return {
            mode: this.currentMode,
            conversation_history: this.context.getConversationHistory(),
            active_documents: this.context.getActiveDocuments(),
            framework_state: this.context.getFrameworkState(),
            user_preferences: await this.preferenceManager.getPreferences(),
            session_data: this.context.getSessionData()
        };
    }
    /**
     * Import context from persistence
     */
    async importContext(context) {
        // Restore mode
        this.currentMode = context.mode;
        // Restore context
        await this.context.restore(context);
        // Restore preferences
        await this.preferenceManager.setPreferences(context.user_preferences);
        // Reinitialize current mode handler
        const handler = this.modes.get(this.currentMode);
        if (handler) {
            await handler.initialize(this.context);
        }
        this.logger.info('Context imported successfully');
    }
}
exports.ModeManager = ModeManager;
//# sourceMappingURL=mode-manager.js.map