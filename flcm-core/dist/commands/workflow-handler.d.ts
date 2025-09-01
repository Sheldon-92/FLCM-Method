/**
 * Workflow Command Handler
 * Orchestrates end-to-end content creation workflows
 */
import { CommandHandler, CommandContext, CommandResult } from './types';
export declare class WorkflowHandler implements CommandHandler {
    private collectorAgent;
    private scholarAgent;
    private creatorAgent;
    private adapterAgent;
    private mode;
    private supportedPlatforms;
    constructor(mode?: string);
    execute(context: CommandContext): Promise<CommandResult>;
    /**
     * Parse workflow configuration from context
     */
    private parseWorkflowConfig;
    /**
     * Initialize workflow progress tracking
     */
    private initializeProgress;
    /**
     * Initialize all agents
     */
    private initializeAgents;
    /**
     * Execute a workflow step with progress tracking
     */
    private executeStep;
    /**
     * Save content brief
     */
    private saveBrief;
    /**
     * Save knowledge synthesis
     */
    private saveSynthesis;
    /**
     * Save content draft
     */
    private saveDraft;
    /**
     * Save adapted content for all platforms
     */
    private saveAdaptedContent;
    /**
     * Generic stage output saver
     */
    private saveStageOutput;
    /**
     * Generate workflow summary
     */
    private generateWorkflowSummary;
    /**
     * Get file type from extension
     */
    private getFileType;
    /**
     * Get usage examples
     */
    private getExamples;
    /**
     * Show help information
     */
    private showHelp;
}
