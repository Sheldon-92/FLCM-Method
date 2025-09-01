/**
 * FLCM Command Router
 * Routes and executes FLCM commands
 */
export interface CommandContext {
    command: string;
    args: string[];
    options: Record<string, any>;
}
export declare class CommandRouter {
    private commands;
    private aliases;
    private history;
    constructor();
    /**
     * Register all available commands
     */
    private registerCommands;
    /**
     * Register command aliases
     */
    private registerAliases;
    /**
     * Execute a command
     */
    execute(context: CommandContext): Promise<void>;
    /**
     * Resolve command aliases
     */
    private resolveAlias;
    /**
     * Record command in history
     */
    private recordHistory;
    /**
     * Persist command history to file
     */
    private persistHistory;
    /**
     * Get command suggestions for autocomplete
     */
    getSuggestions(partial: string): string[];
    /**
     * Get command history
     */
    getHistory(): Array<any>;
    /**
     * Placeholder for not yet implemented commands
     */
    private notImplemented;
}
export declare const router: CommandRouter;
export default function executeCommand(command: string, args?: string[], options?: Record<string, any>): Promise<void>;
