/**
 * Creator Agent Implementation
 * Responsible for content creation with voice preservation
 */
import { BaseAgent, Document } from '../base-agent';
import { VoiceProfile } from '../../methodologies/creation/voice-dna';
import { SPARKElements, ContentStructure } from '../../methodologies/creation/spark-framework';
/**
 * Content draft output structure
 */
export interface ContentDraft extends Document {
    type: 'content-draft';
    title: string;
    hook: string;
    content: string;
    structure: ContentStructure;
    voiceProfile: VoiceProfile;
    sparkElements: SPARKElements;
    revisions: Revision[];
    engagementScore: number;
    wordCount: number;
    readingTime: number;
    metadata: {
        iterations: number;
        voiceConsistency: number;
        hookEffectiveness: number;
        processingTime: number;
        readyToPublish: boolean;
    };
}
export interface Revision {
    version: number;
    timestamp: Date;
    changes: string[];
    improvement: number;
}
/**
 * Creator Agent Class
 */
export declare class CreatorAgent extends BaseAgent {
    private voiceAnalyzer;
    private sparkFramework;
    private userVoiceProfile;
    constructor();
    /**
     * Initialize Creator-specific resources
     */
    protected onInit(): Promise<void>;
    /**
     * Execute content creation
     */
    protected onExecute(input: Document): Promise<Document>;
    /**
     * Cleanup Creator resources
     */
    protected onCleanup(): Promise<void>;
    /**
     * Validate Creator input
     */
    protected validateInput(input: Document): void;
    /**
     * Load user voice profile from storage
     */
    private loadUserVoiceProfile;
    /**
     * Save user voice profile to storage
     */
    private saveUserVoiceProfile;
    /**
     * Extract audience from synthesis
     */
    private extractAudience;
    /**
     * Generate title
     */
    private generateTitle;
    /**
     * Create initial draft
     */
    private createInitialDraft;
    /**
     * Generate a content section
     */
    private generateSection;
    /**
     * Generate main content
     */
    private generateMainContent;
    /**
     * Generate examples
     */
    private generateExamples;
    /**
     * Generate conclusion
     */
    private generateConclusion;
    /**
     * Refine content iteratively
     */
    private refineContent;
    /**
     * Improve transitions
     */
    private improveTransitions;
    /**
     * Balance paragraph lengths
     */
    private balanceParagraphs;
    /**
     * Simplify sentences
     */
    private simplifySentences;
    /**
     * Add engagement elements
     */
    private addEngagementElements;
    /**
     * Polish language
     */
    private polishLanguage;
    /**
     * Calculate engagement score
     */
    private calculateEngagement;
    /**
     * Calculate voice consistency
     */
    private calculateVoiceConsistency;
    /**
     * Evaluate hook effectiveness
     */
    private evaluateHook;
    /**
     * Update session statistics
     */
    private updateStatistics;
    /**
     * Generate document ID
     */
    private generateDocumentId;
}
export default CreatorAgent;
