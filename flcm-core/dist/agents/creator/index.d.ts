/**
 * Creator Agent
 * Content generation with Voice DNA system
 */
import { BaseAgent } from '../base-agent';
import { AgentCapability, AgentRequest, AgentResponse } from '../types';
import { ContentDocument, InsightsDocument } from '../../shared/pipeline/document-schema';
import { CreationMode } from '../../shared/config/config-schema';
/**
 * Creation options
 */
export interface CreationOptions {
    mode: CreationMode;
    voiceProfile?: VoiceDNAProfile;
    framework?: ContentFramework;
    interactive?: boolean;
    targetWordCount?: number;
    tone?: 'professional' | 'casual' | 'academic' | 'creative';
}
/**
 * Voice DNA Profile
 */
export interface VoiceDNAProfile {
    id: string;
    userId: string;
    created: Date;
    updated: Date;
    sampleCount: number;
    style: {
        formality: number;
        complexity: number;
        emotionality: number;
        technicality: number;
    };
    patterns: {
        sentenceLength: {
            avg: number;
            std: number;
        };
        paragraphLength: {
            avg: number;
            std: number;
        };
        vocabularyRichness: number;
        punctuationStyle: Record<string, number>;
    };
    vocabulary: {
        commonWords: string[];
        uniquePhrases: string[];
        preferredTransitions: string[];
        avoidedWords: string[];
    };
    tone: {
        sentiment: 'positive' | 'neutral' | 'negative';
        energy: 'high' | 'medium' | 'low';
        confidence: number;
    };
}
/**
 * Content framework types
 */
export type ContentFramework = 'narrative' | 'analytical' | 'instructional' | 'persuasive' | 'descriptive';
/**
 * Consistency score
 */
export interface ConsistencyScore {
    overall: number;
    style: number;
    vocabulary: number;
    structure: number;
    tone: number;
    details: string[];
}
/**
 * Creator Agent Implementation
 */
export declare class CreatorAgent extends BaseAgent {
    readonly id = "creator";
    readonly name = "Creator Agent";
    readonly version = "2.0.0";
    private voiceDNAAnalyzer;
    private contentGenerator;
    private dialogueManager;
    private voiceProfiles;
    private creationStats;
    constructor();
    /**
     * Get agent capabilities
     */
    getCapabilities(): AgentCapability[];
    /**
     * Main content creation method
     */
    create(insights: InsightsDocument, options: CreationOptions): Promise<ContentDocument>;
    /**
     * Quick content creation (3-minute target)
     */
    private quickCreate;
    /**
     * Standard content creation (framework-based)
     */
    private standardCreate;
    /**
     * Custom content creation (interactive)
     */
    private customCreate;
    /**
     * Extract Voice DNA from samples
     */
    extractVoiceDNA(samples: string[]): Promise<VoiceDNAProfile>;
    /**
     * Apply Voice DNA to content
     */
    applyVoiceDNA(content: string, profile: VoiceDNAProfile): Promise<string>;
    /**
     * Validate content consistency with Voice DNA
     */
    validateConsistency(content: string, profile: VoiceDNAProfile): Promise<ConsistencyScore>;
    /**
     * Helper methods for text transformation
     */
    private makeInformal;
    private makeFormal;
    private applyVocabulary;
    private adjustStructure;
    private applyTone;
    /**
     * Comparison methods for consistency scoring
     */
    private compareStyle;
    private compareVocabulary;
    private compareStructure;
    private compareTone;
    /**
     * Generate title from insights
     */
    private generateTitle;
    /**
     * Expand a point with additional content
     */
    private expandPoint;
    /**
     * Generate conclusion from key points
     */
    private generateConclusion;
    /**
     * Get default voice profile
     */
    private getDefaultVoiceProfile;
    /**
     * Create content document
     */
    private createContentDocument;
    /**
     * Extract sections from content
     */
    private extractSections;
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
export declare const creatorAgent: CreatorAgent;
