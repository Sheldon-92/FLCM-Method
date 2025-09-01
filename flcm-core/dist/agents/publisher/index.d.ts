/**
 * Publisher Agent
 * Multi-platform content adaptation and publishing
 */
import { BaseAgent } from '../base-agent';
import { AgentCapability, AgentRequest, AgentResponse } from '../types';
import { ContentDocument } from '../../shared/pipeline/document-schema';
import { Platform } from '../../shared/config/config-schema';
/**
 * Publishing options
 */
export interface PublishOptions {
    platforms: Platform[];
    schedule?: PublishSchedule;
    optimize?: boolean;
    generateVisuals?: boolean;
}
/**
 * Publishing schedule
 */
export interface PublishSchedule {
    immediate?: boolean;
    scheduledTime?: Date;
    optimalTime?: boolean;
    timezone?: string;
}
/**
 * Platform content
 */
export interface PlatformContent {
    platform: Platform;
    title: string;
    body: string;
    hashtags: string[];
    keywords: string[];
    visualSuggestions: VisualRecommendation[];
    metadata: {
        length: number;
        readingTime: number;
        optimizationScore: number;
    };
}
/**
 * Visual recommendation
 */
export interface VisualRecommendation {
    type: 'cover' | 'inline' | 'infographic' | 'thumbnail';
    description: string;
    style: string;
    elements: string[];
}
/**
 * Publishing result
 */
export interface PublishResult {
    platform: Platform;
    success: boolean;
    content: PlatformContent;
    publishedUrl?: string;
    error?: string;
    metrics?: {
        optimizationScore: number;
        expectedReach: number;
        bestTime?: string;
    };
}
/**
 * Scheduled post
 */
export interface ScheduledPost {
    id: string;
    content: ContentDocument;
    platforms: Platform[];
    scheduledTime: Date;
    status: 'pending' | 'publishing' | 'published' | 'failed';
}
/**
 * Platform adapter interface
 */
export interface PlatformAdapter {
    platform: Platform;
    adapt(content: ContentDocument): Promise<PlatformContent>;
    optimize(content: PlatformContent): Promise<PlatformContent>;
    generateHashtags(content: string): string[];
    suggestVisuals(content: string): VisualRecommendation[];
    getOptimalTime(): string;
}
/**
 * Publisher Agent Implementation
 */
export declare class PublisherAgent extends BaseAgent {
    readonly id = "publisher";
    readonly name = "Publisher Agent";
    readonly version = "2.0.0";
    private adapters;
    private publishQueue;
    private publishingStats;
    constructor();
    /**
     * Get agent capabilities
     */
    getCapabilities(): AgentCapability[];
    /**
     * Initialize platform adapters
     */
    private initializeAdapters;
    /**
     * Main publishing method
     */
    publish(content: ContentDocument, options: PublishOptions): Promise<PublishResult[]>;
    /**
     * Adapt content for specific platform
     */
    adaptForPlatform(content: ContentDocument, platform: Platform): Promise<PlatformContent>;
    /**
     * Optimize content for platform
     */
    private optimizeContent;
    /**
     * Generate hashtags for content
     */
    optimizeHashtags(content: string, platform: Platform): string[];
    /**
     * Optimize content length
     */
    optimizeLength(content: string, maxLength: number): string;
    /**
     * Generate visual suggestions
     */
    private generateVisualSuggestions;
    /**
     * Schedule a post
     */
    schedule(content: ContentDocument, schedule: PublishSchedule, platforms: Platform[]): Promise<void>;
    /**
     * Schedule post for single platform
     */
    private schedulePost;
    /**
     * Get publishing queue
     */
    getQueue(): ScheduledPost[];
    /**
     * Publish to platform (simulated)
     */
    private publishToPlatform;
    /**
     * Format platform content as string
     */
    private formatPlatformContent;
    /**
     * Start queue processor
     */
    private startQueueProcessor;
    /**
     * Process publishing queue
     */
    private processQueue;
    /**
     * Calculate optimal publishing time
     */
    private calculateOptimalTime;
    /**
     * Get optimal time for platform
     */
    private getOptimalTime;
    /**
     * Calculate expected reach
     */
    private calculateExpectedReach;
    /**
     * Generate default hashtags
     */
    private generateDefaultHashtags;
    /**
     * Generate default visual suggestions
     */
    private generateDefaultVisuals;
    /**
     * Generate post ID
     */
    private generatePostId;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Process agent request
     */
    processRequest(request: AgentRequest): Promise<AgentResponse>;
    /**
     * Agent lifecycle methods
     */
    protected onInitialize(): Promise<void>;
    protected onStart(): Promise<void>;
    protected onStop(): Promise<void>;
    protected onShutdown(): Promise<void>;
}
export declare const publisherAgent: PublisherAgent;
