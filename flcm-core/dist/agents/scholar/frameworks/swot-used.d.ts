/**
 * SWOT-USED Framework
 * Comprehensive analysis framework combining SWOT with USED methodology
 */
export interface SWOTUSEDResult {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    unique: string[];
    similar: string[];
    extend: string[];
    different: string[];
}
export declare class SWOTUSEDFramework {
    /**
     * Analyze content using SWOT-USED framework
     */
    analyze(content: string): Promise<SWOTUSEDResult>;
    /**
     * Extract key concepts from content
     */
    private extractConcepts;
    /**
     * Check if word is a stop word
     */
    private isStopWord;
    /**
     * Perform SWOT analysis
     */
    private performSWOTAnalysis;
    /**
     * Perform USED analysis
     */
    private performUSEDAnalysis;
    /**
     * Extract matches based on patterns
     */
    private extractPatternMatches;
    /**
     * Extract the most relevant part of a sentence
     */
    private extractRelevantPart;
    /**
     * Extract insights from SWOT-USED results
     */
    extractInsights(results: SWOTUSEDResult): string[];
}
