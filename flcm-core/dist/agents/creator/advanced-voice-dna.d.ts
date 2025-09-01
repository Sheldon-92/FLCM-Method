/**
 * Advanced Voice DNA System
 * Enhanced pattern recognition and style adaptation for Phase 3
 */
import { VoiceDNAProfile } from './index';
/**
 * Enhanced Voice DNA Profile with advanced features
 */
export interface EnhancedVoiceProfile extends VoiceDNAProfile {
    styleAdvanced: {
        rhetoricalDevices: Record<string, number>;
        argumentationStyle: 'analytical' | 'narrative' | 'persuasive' | 'descriptive';
        pacePreference: 'fast' | 'moderate' | 'slow';
        transitionStyle: 'smooth' | 'abrupt' | 'logical' | 'creative';
    };
    syntaxPatterns: {
        avgSentenceLength: number;
        lengthVariation: number;
        complexSentenceRatio: number;
        questionRatio: number;
        exclamationRatio: number;
        fragmentUsage: number;
    };
    structuralPreferences: {
        introductionStyle: 'direct' | 'anecdotal' | 'question' | 'statement';
        conclusionStyle: 'summary' | 'call-to-action' | 'reflection' | 'question';
        paragraphLength: 'short' | 'medium' | 'long' | 'varied';
        listUsage: number;
        exampleFrequency: number;
    };
    readerInteraction: {
        directAddressing: number;
        rhetoricalQuestions: number;
        personalStories: number;
        humorUsage: number;
        empathyIndicators: number;
    };
    contextualAdaptation: {
        professionalContext: VoiceContextProfile;
        casualContext: VoiceContextProfile;
        academicContext: VoiceContextProfile;
        creativeContext: VoiceContextProfile;
    };
    evolutionHistory: {
        versions: VoiceEvolutionPoint[];
        stabilityScore: number;
        consistencyTrend: 'improving' | 'stable' | 'declining';
    };
}
/**
 * Voice context profile for different scenarios
 */
export interface VoiceContextProfile {
    vocabularyShift: Record<string, string>;
    toneAdjustment: number;
    formalityLevel: number;
    technicalityLevel: number;
    exampleTypes: string[];
}
/**
 * Voice evolution tracking point
 */
export interface VoiceEvolutionPoint {
    timestamp: Date;
    sampleCount: number;
    majorChanges: string[];
    consistencyScore: number;
    adaptationSuggestions: string[];
}
/**
 * Voice matching result with detailed feedback
 */
export interface VoiceMatchResult {
    overallScore: number;
    breakdown: {
        style: number;
        vocabulary: number;
        syntax: number;
        tone: number;
        structure: number;
        engagement: number;
    };
    strengths: string[];
    improvements: string[];
    suggestions: string[];
}
/**
 * Advanced Voice DNA Analyzer with enhanced capabilities
 */
export declare class AdvancedVoiceDNAAnalyzer {
    private rhetoricPatterns;
    /**
     * Create enhanced Voice DNA profile
     */
    createEnhancedProfile(samples: string[], existingProfile?: VoiceDNAProfile): Promise<EnhancedVoiceProfile>;
    /**
     * Match content against Voice DNA profile with detailed analysis
     */
    matchVoice(content: string, profile: EnhancedVoiceProfile): Promise<VoiceMatchResult>;
    /**
     * Adapt content to match Voice DNA profile
     */
    adaptContent(content: string, profile: EnhancedVoiceProfile, context?: keyof EnhancedVoiceProfile['contextualAdaptation']): Promise<string>;
    /**
     * Update Voice DNA profile with new sample (evolutionary learning)
     */
    updateProfile(profile: EnhancedVoiceProfile, newSample: string): Promise<EnhancedVoiceProfile>;
    private analyzeAdvancedStyle;
    private analyzeSyntaxPatterns;
    private analyzeStructuralPreferences;
    private analyzeReaderInteraction;
    private analyzeContextualAdaptation;
    private initializeEvolutionHistory;
    private createBaseProfile;
    private analyzeContentAdvanced;
    private detectArgumentationStyle;
    private analyzePacePreference;
    private analyzeTransitionStyle;
    private calculateComplexSentenceRatio;
    private calculateQuestionRatio;
    private calculateExclamationRatio;
    private calculateFragmentUsage;
    private detectIntroductionStyle;
    private detectConclusionStyle;
    private analyzeParagraphLength;
    private calculateListUsage;
    private calculateExampleFrequency;
    private detectPersonalStories;
    private detectHumorUsage;
    private detectEmpathyIndicators;
    private createContextProfile;
    private compareStyles;
    private compareVocabulary;
    private compareSyntax;
    private compareTone;
    private compareStructure;
    private compareEngagement;
    private identifyStrengths;
    private identifyImprovements;
    private generateSuggestions;
    private applyVocabularyShift;
    private adjustSentenceStructure;
    private applyStructuralPreferences;
    private enhanceReaderInteraction;
    private applyRhetoricalDevices;
    private detectMajorChanges;
    private calculateConsistencyScore;
    private generateAdaptationSuggestions;
    private blendAdvancedStyles;
    private blendSyntaxPatterns;
    private blendStructuralPreferences;
    private blendReaderInteraction;
    private calculateStabilityScore;
    private determineConsistencyTrend;
}
export declare const advancedVoiceDNA: AdvancedVoiceDNAAnalyzer;
