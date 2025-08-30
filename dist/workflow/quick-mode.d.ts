/**
 * Quick Mode Workflow
 * 20-30 minute content creation with essential processing
 */
/// <reference types="node" />
import { WorkflowResult } from './pipeline-orchestrator';
import { EventEmitter } from 'events';
export interface QuickModeOptions {
    topic: string;
    platforms?: string[];
    voiceProfile?: 'casual' | 'professional' | 'academic';
    maxDuration?: number;
}
export declare class QuickModeWorkflow extends EventEmitter {
    private orchestrator;
    private startTime;
    private config;
    constructor();
    /**
     * Execute Quick Mode workflow
     */
    execute(options: QuickModeOptions): Promise<WorkflowResult>;
    /**
     * Customize configuration based on options
     */
    private customizeConfig;
    /**
     * Setup event listeners for progress tracking
     */
    private setupEventListeners;
    /**
     * Get elapsed time in minutes:seconds format
     */
    private getElapsedTime;
    /**
     * Display workflow summary
     */
    private displaySummary;
    /**
     * Estimate time remaining
     */
    estimateTimeRemaining(): number;
    /**
     * Get current progress percentage
     */
    getProgress(): number;
    /**
     * Pause workflow
     */
    pause(): void;
    /**
     * Resume workflow
     */
    resume(): void;
    /**
     * Cancel workflow
     */
    cancel(): void;
}
export declare const QuickModePresets: {
    blogPost: {
        topic: string;
        platforms: string[];
        voiceProfile: "professional";
        maxDuration: number;
    };
    socialUpdate: {
        topic: string;
        platforms: string[];
        voiceProfile: "casual";
        maxDuration: number;
    };
    thoughtLeadership: {
        topic: string;
        platforms: string[];
        voiceProfile: "professional";
        maxDuration: number;
    };
    viralContent: {
        topic: string;
        platforms: string[];
        voiceProfile: "casual";
        maxDuration: number;
    };
};
export default QuickModeWorkflow;
//# sourceMappingURL=quick-mode.d.ts.map