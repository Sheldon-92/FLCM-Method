/**
 * Collector Agent Implementation
 * Responsible for gathering and processing input sources
 */
import { BaseAgent, Document } from '../base-agent';
import { RICEScore } from '../../methodologies/collection/rice';
import { SignalAnalysis } from '../../methodologies/collection/signal-to-noise';
/**
 * Collector-specific input structure
 */
export interface CollectorInput extends Document {
    type: 'url' | 'text' | 'file';
    source: string;
    options?: {
        extractImages?: boolean;
        followLinks?: boolean;
        maxDepth?: number;
    };
}
/**
 * Content brief output structure
 */
export interface ContentBrief extends Document {
    type: 'content-brief';
    signals: {
        keyInsights: string[];
        relevanceScores: Record<string, number>;
        extractedPatterns: string[];
        signalAnalysis?: SignalAnalysis;
    };
    summary: {
        mainTopic: string;
        keyPoints: string[];
        targetAudience: string;
    };
    riceScore: RICEScore;
    metadata: {
        sourceUrl?: string;
        extractionDate: Date;
        wordCount: number;
        readingTime: number;
        quality: 'high' | 'medium' | 'low';
    };
}
/**
 * Collector Agent Class
 */
export declare class CollectorAgent extends BaseAgent {
    private riceFramework;
    private signalFilter;
    constructor();
    /**
     * Initialize Collector-specific resources
     */
    protected onInit(): Promise<void>;
    /**
     * Execute collection and signal extraction
     */
    protected onExecute(input: Document): Promise<Document>;
    /**
     * Cleanup Collector resources
     */
    protected onCleanup(): Promise<void>;
    /**
     * Validate Collector input
     */
    protected validateInput(input: Document): void;
    private extractFromUrl;
    private extractFromFile;
    private determineQuality;
    private extractPatterns;
    private identifyMainTopic;
    private extractKeyPoints;
    private identifyAudience;
    private generateDocumentId;
}
