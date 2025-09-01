/**
 * Content Generator
 * Framework-based content generation engine
 */
import { InsightsDocument } from '../../shared/pipeline/document-schema';
import { VoiceDNAProfile, ContentFramework } from './index';
export interface GenerationOptions {
    insights: InsightsDocument;
    framework: ContentFramework;
    targetWords: number;
    tone: 'professional' | 'casual' | 'academic' | 'creative';
    profile: VoiceDNAProfile;
}
export interface Feedback {
    satisfied: boolean;
    suggestions: string[];
    focusAreas: string[];
}
export declare class ContentGenerator {
    /**
     * Generate content using framework
     */
    generate(options: GenerationOptions): Promise<string>;
    /**
     * Generate initial draft
     */
    generateDraft(insights: InsightsDocument): Promise<string>;
    /**
     * Refine content based on feedback
     */
    refine(content: string, feedback: Feedback): Promise<string>;
    /**
     * Framework-specific generation methods
     */
    private generateNarrative;
    private generateAnalytical;
    private generateInstructional;
    private generatePersuasive;
    private generateDescriptive;
    /**
     * Helper methods
     */
    private generateTitle;
    private generateIntroduction;
    private generateConclusion;
    private expandFinding;
    private formatAnalysisResult;
    private applySuggestion;
    private enhanceArea;
    private buildNarrative;
    private extractProblem;
    private analyzePoint;
    private generateSolutions;
    private extractTopic;
    private generatePrerequisites;
    private generateSteps;
    private generateTips;
    private generateHook;
    private buildArgument;
    private generateCallToAction;
    private generateOverview;
    private describeInDetail;
    private transformToTitle;
    private transformToStepTitle;
    private applyTone;
    private adjustLength;
}
