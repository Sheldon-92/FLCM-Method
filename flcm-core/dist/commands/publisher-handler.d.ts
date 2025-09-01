/**
 * Publisher Command Handler
 * Bridges Claude commands to Publisher/Adapter Agent functionality
 */
import { CommandHandler, CommandContext, CommandResult } from './types';
export declare class PublisherHandler implements CommandHandler {
    private adapterAgent;
    private supportedPlatforms;
    constructor();
    execute(context: CommandContext): Promise<CommandResult>;
    /**
     * Parse command input and options
     */
    private parseInput;
    /**
     * Parse content file to ContentDraft
     */
    private parseContentFile;
    /**
     * Handle content scheduling
     */
    private handleScheduling;
    /**
     * Save publishing results
     */
    private saveResults;
    /**
     * Format adapted content as Markdown
     */
    private formatAsMarkdown;
    /**
     * Create summary report for all platforms
     */
    private createSummaryReport;
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
