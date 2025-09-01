/**
 * Voice DNA Analyzer
 * Analyzes and preserves unique writing voice characteristics
 */
export interface VoiceProfile {
    linguistic: {
        avgSentenceLength: number;
        sentenceLengthVariation: number;
        vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'expert';
        uniqueWordRatio: number;
        punctuationStyle: {
            exclamations: number;
            questions: number;
            ellipses: number;
            dashes: number;
            semicolons: number;
        };
    };
    tone: {
        formality: number;
        emotion: number;
        authority: number;
        humor: number;
        energy: number;
    };
    style: {
        metaphorUsage: 'rare' | 'occasional' | 'frequent';
        storytelling: boolean;
        personalAnecdotes: boolean;
        dataOriented: boolean;
        conversational: boolean;
        academicCitations: boolean;
    };
    structure: {
        avgParagraphLength: number;
        openingStyle: 'question' | 'statement' | 'story' | 'statistic' | 'quote';
        closingStyle: 'summary' | 'call-to-action' | 'question' | 'inspiration';
        listUsage: 'minimal' | 'moderate' | 'heavy';
        headerFrequency: number;
    };
    signatures: {
        phrases: string[];
        transitions: string[];
        openings: string[];
        closings: string[];
    };
}
export interface VoiceAnalysis {
    profile: VoiceProfile;
    confidence: number;
    samples: number;
    recommendations: string[];
}
/**
 * Voice DNA Analyzer Class
 */
export declare class VoiceDNAAnalyzer {
    private readonly DEFAULT_PROFILE;
    /**
     * Analyze voice from content samples
     */
    analyze(samples: string[]): VoiceAnalysis;
    /**
     * Analyze linguistic patterns
     */
    private analyzeLinguistic;
    /**
     * Analyze tone attributes
     */
    private analyzeTone;
    /**
     * Analyze stylistic elements
     */
    private analyzeStyle;
    /**
     * Analyze structural patterns
     */
    private analyzeStructure;
    /**
     * Extract signature phrases and patterns
     */
    private extractSignatures;
    private extractSentences;
    private calculateVariance;
    private assessVocabularyLevel;
    private detectOpeningStyle;
    private detectClosingStyle;
    private isCommonPhrase;
    private extractPattern;
    private generateRecommendations;
    /**
     * Apply voice profile to new content
     */
    applyVoice(content: string, profile: VoiceProfile): string;
    private shortenSentences;
    private combineSentences;
    private makeConversational;
    private makeFormal;
    private addTransitions;
}
export default VoiceDNAAnalyzer;
