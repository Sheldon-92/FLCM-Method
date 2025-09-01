/**
 * Scholar Command Handler
 * Bridges Claude commands to ScholarAgent functionality
 */
import { CommandHandler, CommandContext, CommandResult } from './types';
export declare class ScholarHandler implements CommandHandler {
    private scholarAgent;
    private collectorAgent;
    constructor();
    execute(context: CommandContext): Promise<CommandResult>;
    /**
     * Parse command input and convert to Document
     */
    private parseInput;
    /**
     * Save analysis results
     */
    private saveResults;
    /**
     * Format synthesis results as Markdown
     */
    private formatAsMarkdown;
    /**
     * Get input description for logging
     */
    private getInputDescription;
    /**
     * Determine file type from extension
     */
    private getFileType;
    /**
     * Get suggestions based on error code
     */
    private getSuggestions;
    /**
     * Get usage examples
     */
    private getExamples;
    /**
     * Show help information
     */
    private showHelp;
}
