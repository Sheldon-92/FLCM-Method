/**
 * Adapter Agent Implementation
 * Optimizes content for specific platforms while maintaining message integrity
 */
import { BaseAgent, Document } from '../base-agent';
export interface ContentDraft extends Document {
    type: 'content-draft';
    title: string;
    hook: string;
    content: string;
    structure: {
        sections: string[];
        flow: string;
    };
    voiceProfile: {
        tone: {
            formality: number;
            emotion: number;
            authority: number;
        };
        style: {
            conversational: boolean;
            dataOriented: boolean;
            storytelling: boolean;
        };
    };
    sparkElements: {
        keyMessage: string;
        purpose: string;
        audience: string;
    };
    engagementScore: number;
}
export interface AdaptedContent extends Document {
    type: 'adapted-content';
    platform: string;
    optimizedTitle: string;
    optimizedContent: string;
    hashtags: string[];
    formatting: {
        type: string;
        elements: string[];
    };
    characterCount: number;
    engagementElements: string[];
    visualSuggestions: string[];
    postingStrategy: {
        bestTime: string;
        frequency: string;
        crossPosting: string[];
    };
    metadata: {
        platformFitScore: number;
        messagePreservation: number;
        estimatedReach: string;
        optimizationTime: number;
    };
}
export declare class AdapterAgent extends BaseAgent {
    name: string;
    description: string;
    private platformOptimizer;
    private hashtagGenerator;
    private supportedPlatforms;
    constructor();
    process(input: ContentDraft, platform?: string): Promise<AdaptedContent | AdaptedContent[]>;
    private adaptForPlatform;
    private extractKeywords;
    private isCommonWord;
    private optimizeTitle;
    private enhanceTitle;
    private generateVisualSuggestions;
    private generatePostingStrategy;
    private extractEngagementElements;
    private calculatePlatformFit;
    private calculateMessagePreservation;
    private estimateReach;
    private finalizeContent;
    private generateId;
}
export default AdapterAgent;
