/**
 * FLCM Help Command
 * Display available commands and usage information
 */
export interface HelpOptions {
    command?: string;
    verbose?: boolean;
}
export declare class HelpCommand {
    private commands;
    constructor();
    /**
     * Initialize command definitions
     */
    private initializeCommands;
    /**
     * Execute the help command
     */
    execute(options?: HelpOptions): Promise<void>;
    /**
     * Show help for a specific command
     */
    private showCommandHelp;
    /**
     * Show all available commands
     */
    private showAllCommands;
}
export default function help(options?: HelpOptions): Promise<void>;
