/**
 * Signal-to-Noise Filter
 * Identifies high-value signals and filters out noise from content
 */
export interface Signal {
    type: 'insight' | 'fact' | 'trend' | 'pattern' | 'anomaly';
    content: string;
    strength: number;
    context?: string;
}
export interface NoisePattern {
    pattern: RegExp | string;
    type: 'filler' | 'redundant' | 'promotional' | 'generic';
    impact: number;
}
export interface SignalAnalysis {
    signals: Signal[];
    noiseLevel: number;
    signalToNoiseRatio: number;
    summary: string;
}
/**
 * Signal-to-Noise Filter Class
 */
export declare class SignalToNoiseFilter {
    private noisePatterns;
    private signalIndicators;
    /**
     * Analyze content for signals and noise
     */
    analyze(content: string): SignalAnalysis;
    /**
     * Extract high-value signals from content
     */
    private extractSignals;
    /**
     * Calculate noise level in content
     */
    private calculateNoiseLevel;
    /**
     * Calculate overall signal strength
     */
    private calculateSignalStrength;
    /**
     * Split content into sentences
     */
    private splitIntoSentences;
    /**
     * Clean sentence for signal extraction
     */
    private cleanSentence;
    /**
     * Extract context around a signal
     */
    private extractContext;
    /**
     * Deduplicate similar signals
     */
    private deduplicateSignals;
    /**
     * Generate summary of signal analysis
     */
    private generateSummary;
    /**
     * Get clean content with noise removed
     */
    getCleanContent(content: string, analysis: SignalAnalysis): string;
    /**
     * Extract key insights from signals
     */
    extractKeyInsights(signals: Signal[]): string[];
}
export default SignalToNoiseFilter;
//# sourceMappingURL=signal-to-noise.d.ts.map