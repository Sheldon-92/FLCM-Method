/**
 * Standard Mode Workflow
 * 45-60 minute comprehensive content creation with full optimization
 */
/// <reference types="node" />
import { WorkflowResult } from './pipeline-orchestrator';
import { EventEmitter } from 'events';
export interface StandardModeOptions {
    topic: string;
    platforms?: string[];
    voiceProfile?: 'casual' | 'professional' | 'academic' | 'technical';
    depth?: 'standard' | 'comprehensive' | 'expert';
    optimization?: 'balanced' | 'quality' | 'speed';
    maxDuration?: number;
}
export declare class StandardModeWorkflow extends EventEmitter {
    private orchestrator;
    private startTime;
    private config;
    constructor();
    /**
     * Execute Standard Mode workflow
     */
    execute(options: StandardModeOptions): Promise<WorkflowResult>;
    /**
     * Execute with quality monitoring
     */
    private executeWithQualityMonitoring;
    /**
     * Customize configuration based on options
     */
    private customizeConfig;
    /**
     * Setup event listeners for detailed progress tracking
     */
    private setupEventListeners;
    /**
     * Display agent-specific metrics
     */
    private displayAgentMetrics;
    /**
     * Perform post-execution quality analysis
     */
    private performQualityAnalysis;
    /**
     * Attempt recovery from checkpoint
     */
    private attemptCheckpointRecovery;
    /**
     * Get elapsed time in format MM:SS
     */
    private getElapsedTime;
    /**
     * Display comprehensive summary
     */
    private displayComprehensiveSummary;
    /**
     * Get detailed metrics
     */
    getDetailedMetrics(): any;
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
export declare const StandardModePresets: {
    thoughtLeadership: {
        topic: string;
        platforms: string[];
        voiceProfile: "professional";
        depth: "comprehensive";
        optimization: "quality";
        maxDuration: number;
    };
    technicalArticle: {
        topic: string;
        platforms: string[];
        voiceProfile: "technical";
        depth: "expert";
        optimization: "quality";
        maxDuration: number;
    };
    viralCampaign: {
        topic: string;
        platforms: string[];
        voiceProfile: "casual";
        depth: "standard";
        optimization: "balanced";
        maxDuration: number;
    };
    educationalContent: {
        topic: string;
        platforms: string[];
        voiceProfile: "academic";
        depth: "comprehensive";
        optimization: "quality";
        maxDuration: number;
    };
};
export default StandardModeWorkflow;
//# sourceMappingURL=standard-mode.d.ts.map