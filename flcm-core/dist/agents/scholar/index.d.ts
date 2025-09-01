/**
 * Scholar Agent
 * Deep learning and multi-source analysis agent
 */
/// <reference types="node" />
/// <reference types="node" />
import { BaseAgent } from '../base-agent';
import { AgentCapability, AgentRequest, AgentResponse } from '../types';
import { InsightsDocument, SourceType } from '../../shared/pipeline/document-schema';
import { Framework } from '../../shared/config/config-schema';
/**
 * Scholar input configuration
 */
export interface ScholarInput {
    source: string | Buffer | any;
    type?: SourceType;
    frameworks?: Framework[];
    options?: AnalysisOptions;
}
/**
 * Analysis options
 */
export interface AnalysisOptions {
    maxProcessingTime?: number;
    parallelFrameworks?: boolean;
    cacheResults?: boolean;
    extractCitations?: boolean;
    generateSummary?: boolean;
}
/**
 * Framework analysis result
 */
export interface FrameworkResult {
    framework: Framework;
    results: any;
    confidence: number;
    processingTime: number;
    insights: string[];
}
/**
 * Performance metrics
 */
export interface PerformanceMetrics {
    totalAnalyses: number;
    averageProcessingTime: number;
    frameworkUsage: Record<Framework, number>;
    inputTypeDistribution: Record<SourceType, number>;
    errorRate: number;
}
/**
 * Scholar Agent Implementation
 */
export declare class ScholarAgent extends BaseAgent {
    readonly id = "scholar";
    readonly name = "Scholar Agent";
    readonly version = "2.0.0";
    private processors;
    private frameworks;
    private metrics;
    private processingCache;
    constructor();
    /**
     * Get agent capabilities
     */
    getCapabilities(): AgentCapability[];
    /**
     * Initialize input processors
     */
    private initializeProcessors;
    /**
     * Initialize analysis frameworks
     */
    private initializeFrameworks;
    /**
     * Initialize performance metrics
     */
    private initializeMetrics;
    /**
     * Main analysis method
     */
    analyze(input: ScholarInput): Promise<InsightsDocument>;
    /**
     * Validate input
     */
    private validateInput;
    /**
     * Detect input type from source
     */
    detectInputType(source: any): SourceType;
    /**
     * Extract content from source
     */
    private extractContent;
    /**
     * Apply analysis frameworks
     */
    private applyFrameworks;
    /**
     * Apply single framework
     */
    applyFramework(content: string, framework: Framework): Promise<FrameworkResult>;
    /**
     * Calculate confidence score for framework results
     */
    private calculateConfidence;
    /**
     * Generate insights document
     */
    private generateInsightsDocument;
    /**
     * Format insights content as markdown
     */
    private formatInsightsContent;
    /**
     * Extract key findings from framework results
     */
    private extractKeyFindings;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Extract citations from content
     */
    private extractCitations;
    /**
     * Generate summary from framework results
     */
    private generateSummary;
    /**
     * Generate cache key for input
     */
    private generateCacheKey;
    /**
     * Generate simple hash
     */
    private generateHash;
    /**
     * Update performance metrics
     */
    private updateMetrics;
    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Process agent request
     */
    processRequest(request: AgentRequest): Promise<AgentResponse>;
    /**
     * Initialize agent
     */
    protected onInitialize(): Promise<void>;
    /**
     * Start agent
     */
    protected onStart(): Promise<void>;
    /**
     * Stop agent
     */
    protected onStop(): Promise<void>;
    /**
     * Clean up resources
     */
    protected onShutdown(): Promise<void>;
}
export declare const scholarAgent: ScholarAgent;
