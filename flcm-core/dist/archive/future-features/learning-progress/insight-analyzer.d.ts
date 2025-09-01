/**
 * Insight Depth Analyzer
 * Analyzes the depth and quality of insights
 */
import { Insight, InsightLevel } from './types';
export declare class InsightDepthAnalyzer {
    private logger;
    private readonly levels;
    constructor();
    /**
     * Calculate insight depth score
     */
    calculateDepth(insight: Insight): number;
    /**
     * Get insight level from score
     */
    getLevel(score: number): InsightLevel;
    /**
     * Track progression over time
     */
    trackProgression(insights: Insight[]): any;
    /**
     * Analyze content complexity
     */
    private analyzeComplexity;
    /**
     * Analyze connections to other insights
     */
    private analyzeConnections;
    /**
     * Assess originality of content
     */
    private assessOriginality;
    /**
     * Evaluate evidence quality
     */
    private evaluateEvidence;
    /**
     * Measure synthesis quality
     */
    private measureSynthesis;
    /**
     * Calculate trend in progression
     */
    private calculateTrend;
    /**
     * Identify breakthrough moments
     */
    private identifyBreakthroughs;
    /**
     * Count sophisticated words
     */
    private countSophisticatedWords;
    /**
     * Calculate average sentence length
     */
    private calculateAvgSentenceLength;
    /**
     * Count conceptual words
     */
    private countConceptualWords;
}
