/**
 * FLCM Command Router
 * Routes and executes FLCM commands with proper integration to agents
 */
import { CommandContext, CommandResult } from './types';
export declare class CommandRouter {
    private handlers;
    private aliases;
    private history;
    constructor();
    /**
     * Register all available command handlers
     */
    private registerHandlers;
    /**
     * Register command aliases
     */
    private registerAliases;
    /**
     * Execute a command
     */
    execute(context: CommandContext): Promise<CommandResult>;
    /**
     * Resolve command aliases
     */
    private resolveAlias;
    /**
     * Show help information
     */
    private showHelp;
    /**
     * Show system status
     */
    private showStatus;
    /**
     * Show command history
     */
    private showHistory;
    /**
     * Record command in history
     */
    private recordHistory;
    /**
     * Get command suggestions for autocomplete
     */
    getSuggestions(partial: string): string[];
    /**
     * Get command history
     */
    getHistory(): Array<any>;
}
export declare const router: CommandRouter;
export default function executeCommand(command: string, args?: string[], options?: Record<string, any>, user?: any): Promise<CommandResult>;
