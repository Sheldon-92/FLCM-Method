/**
 * Document Transformer for FLCM Pipeline
 * Transforms documents between different formats in the pipeline
 */
import { ContentBrief, KnowledgeSynthesis, ContentDraft, PlatformAdaptation, VoiceProfile } from './document-schemas';
/**
 * Transformation options
 */
export interface TransformOptions {
    preserveMetadata?: boolean;
    generateId?: boolean;
    includeTimestamp?: boolean;
    voiceProfile?: VoiceProfile;
    targetPlatform?: string;
}
/**
 * Document Transformer Class
 */
export declare class DocumentTransformer {
    /**
     * Transform Content Brief to Knowledge Synthesis
     */
    briefToSynthesis(brief: ContentBrief, options?: TransformOptions): Partial<KnowledgeSynthesis>;
    /**
     * Transform Knowledge Synthesis to Content Draft
     */
    synthesisToDraft(synthesis: KnowledgeSynthesis, options?: TransformOptions): Partial<ContentDraft>;
    /**
     * Transform Content Draft to Platform Adaptation
     */
    draftToAdaptation(draft: ContentDraft, platform: PlatformAdaptation['platform'], options?: TransformOptions): Partial<PlatformAdaptation>;
    /**
     * Transform metadata between agents
     */
    private transformMetadata;
    /**
     * Generate document ID
     */
    private generateDocumentId;
    /**
     * Generate title from concept
     */
    private generateTitle;
    /**
     * Build initial content from synthesis
     */
    private buildInitialContent;
    /**
     * Create default voice profile
     */
    private createDefaultVoiceProfile;
    /**
     * Analyze content structure
     */
    private analyzeContentStructure;
    /**
     * Detect content format
     */
    private detectFormat;
    /**
     * Generate hooks from synthesis
     */
    private generateHooks;
    /**
     * Adapt content for specific platform
     */
    private adaptContentForPlatform;
    /**
     * Create Twitter thread
     */
    private createTwitterThread;
    /**
     * Format for LinkedIn
     */
    private formatForLinkedIn;
    /**
     * Format for WeChat
     */
    private formatForWeChat;
    /**
     * Format for Xiaohongshu
     */
    private formatForXiaohongshu;
    /**
     * Optimize for long-form platforms
     */
    private optimizeForLongForm;
    /**
     * Track optimizations made
     */
    private trackOptimizations;
    /**
     * Generate hashtags for platform
     */
    private generateHashtags;
    /**
     * Generate media prompts
     */
    private generateMediaPrompts;
    /**
     * Generate call to action
     */
    private generateCallToAction;
    /**
     * Get platform rules
     */
    private getPlatformRules;
}
//# sourceMappingURL=document-transformer.d.ts.map