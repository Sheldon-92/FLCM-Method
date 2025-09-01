/**
 * Semantic Linking Pattern Recognizer
 * Identifies and suggests semantic connections between content
 */
export interface SemanticPattern {
    id: string;
    type: 'conceptual' | 'causal' | 'temporal' | 'structural' | 'thematic';
    confidence: number;
    source: string;
    target: string;
    relationship: string;
    evidence: PatternEvidence[];
    metadata: PatternMetadata;
}
export interface PatternEvidence {
    type: 'textual' | 'contextual' | 'structural' | 'temporal';
    content: string;
    strength: number;
    location?: string;
}
export interface PatternMetadata {
    discovered: Date;
    algorithm: string;
    verified: boolean;
    user_feedback?: 'positive' | 'negative' | 'neutral';
    usage_count: number;
}
export interface LinkingSuggestion {
    id: string;
    sourceDocument: string;
    targetDocument: string;
    suggestionType: 'direct_link' | 'conceptual_bridge' | 'thematic_cluster' | 'causal_chain';
    confidence: number;
    explanation: string;
    suggestedText: string;
    location: SuggestionLocation;
}
export interface SuggestionLocation {
    section?: string;
    paragraph?: number;
    sentence?: number;
    context: string;
}
export declare class SemanticPatternRecognizer {
    private patterns;
    private logger;
    private conceptMap;
    private contextWindow;
    constructor();
    /**
     * Initialize concept mapping
     */
    private initializeConceptMap;
    /**
     * Analyze document for semantic patterns
     */
    analyzeDocument(documentId: string, content: string, metadata?: any): Promise<SemanticPattern[]>;
    /**
     * Generate linking suggestions between documents
     */
    generateLinkingSuggestions(sourceDoc: string, targetDoc: string, sourceContent: string, targetContent: string): Promise<LinkingSuggestion[]>;
    /**
     * Extract concepts from text
     */
    private extractConcepts;
    /**
     * Extract named entities (simplified)
     */
    private extractNamedEntities;
    /**
     * Find conceptual patterns
     */
    private findConceptualPatterns;
    /**
     * Find causal patterns
     */
    private findCausalPatterns;
    /**
     * Find temporal patterns
     */
    private findTemporalPatterns;
    /**
     * Find structural patterns
     */
    private findStructuralPatterns;
    /**
     * Find shared concepts between documents
     */
    private findSharedConcepts;
    /**
     * Find conceptual bridges between different concepts
     */
    private findConceptualBridges;
    /**
     * Create direct link suggestion
     */
    private createDirectLinkSuggestion;
    /**
     * Find concept location in text
     */
    private findConceptLocation;
    private findSentenceNumber;
    private findParagraphNumber;
    private createBridgeSuggestion;
    private findCausalRelationships;
    private createCausalSuggestion;
    private isRelevantConcept;
    private findRelatedConcepts;
    /**
     * Get all patterns
     */
    getPatterns(): SemanticPattern[];
    /**
     * Get patterns by type
     */
    getPatternsByType(type: SemanticPattern['type']): SemanticPattern[];
    /**
     * Update pattern feedback
     */
    updatePatternFeedback(patternId: string, feedback: 'positive' | 'negative' | 'neutral'): void;
}
