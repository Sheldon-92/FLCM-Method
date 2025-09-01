/**
 * Creator Command Handler
 * Bridges Claude commands to CreatorAgent functionality
 */
import { CommandHandler, CommandContext, CommandResult } from './types';
export declare class CreatorHandler implements CommandHandler {
    private creatorAgent;
    private scholarAgent;
    private collectorAgent;
    constructor();
    execute(context: CommandContext): Promise<CommandResult>;
    /**
     * Parse command input and options
     */
    private parseInput;
    /**
     * Create a content brief from topic
     */
    private createTopicBrief;
    /**
     * Parse synthesis file (simplified for demo)
     */
    private parseSynthesisFile;
    /**
     * Save creation results
     */
    private saveResults;
    /**
     * Format draft results as Markdown
     */
    private formatAsMarkdown;
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
