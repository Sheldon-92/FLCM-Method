/**
 * Command Mode
 * Legacy command-based interaction (FLCM 1.0 style)
 */
import { SharedContext } from '../shared-context';
export declare class CommandMode {
    private context;
    private logger;
    private commandMappings;
    private deprecationWarnings;
    constructor(context: SharedContext);
    /**
     * Initialize legacy command mappings
     */
    private initializeCommandMappings;
    /**
     * Process command input
     */
    process(input: string): Promise<string>;
    /**
     * Parse command and arguments
     */
    private parseCommand;
    /**
     * Resolve command considering aliases
     */
    private resolveCommand;
    /**
     * Execute command
     */
    private executeCommand;
    /**
     * Execute built-in command
     */
    private executeBuiltinCommand;
    /**
     * Execute legacy command
     */
    private executeLegacyCommand;
    /**
     * Handle unknown command
     */
    private handleUnknownCommand;
    /**
     * Get command suggestions
     */
    private getSuggestions;
    /**
     * Calculate Levenshtein distance for suggestions
     */
    private levenshteinDistance;
    /**
     * Format deprecation warning
     */
    private formatDeprecationWarning;
    /**
     * Get help text
     */
    getHelp(): string;
    /**
     * Get status
     */
    private getStatus;
    /**
     * Initialize mode
     */
    initialize(context: SharedContext): Promise<void>;
    /**
     * Prepare for mode switch
     */
    prepareForSwitch(): Promise<void>;
    /**
     * Set deprecation warnings
     */
    setDeprecationWarnings(enabled: boolean): void;
}
