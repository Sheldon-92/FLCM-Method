/**
 * Voice DNA Analyzer
 * Extracts writing style patterns from content samples
 */
import { VoiceDNAProfile } from './index';
export declare class VoiceDNAAnalyzer {
    /**
     * Analyze samples to extract Voice DNA
     */
    analyze(samples: string[]): Promise<VoiceDNAProfile>;
    /**
     * Analyze a single content piece
     */
    analyzeContent(content: string): Promise<any>;
    private analyzeStyle;
    private analyzePatterns;
    private analyzeVocabulary;
    private analyzeTone;
    private measureFormality;
    private measureComplexity;
    private measureEmotionality;
    private measureTechnicality;
    private calculateVocabularyRichness;
    private analyzePunctuation;
    private average;
    private standardDeviation;
    private generateId;
}
