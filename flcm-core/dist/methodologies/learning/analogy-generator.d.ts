/**
 * Analogy Generator for Scholar Agent
 * Creates meaningful analogies to enhance understanding
 */
export interface Analogy {
    source: string;
    target: string;
    mapping: string;
    strength: number;
    domain: string;
}
export interface AnalogySet {
    concept: string;
    analogies: Analogy[];
    bestAnalogy: Analogy | null;
    explanation: string;
}
/**
 * Analogy Generator Class
 */
export declare class AnalogyGenerator {
    private readonly analogyTemplates;
    private readonly domainExamples;
    /**
     * Generate analogies for a concept
     */
    generate(concept: string, context: string, count?: number): AnalogySet;
    /**
     * Extract features from context
     */
    private extractFeatures;
    /**
     * Identify concept type
     */
    private identifyConceptType;
    /**
     * Generate analogies for a specific domain
     */
    private generateDomainAnalogies;
    /**
     * Calculate feature overlap
     */
    private calculateFeatureOverlap;
    /**
     * Check if two features are similar
     */
    private areSimilar;
    /**
     * Generate mapping between source and target
     */
    private generateMapping;
    /**
     * Calculate analogy strength
     */
    private calculateStrength;
    /**
     * Generate explanation for the analogies
     */
    private generateExplanation;
    /**
     * Refine analogy based on feedback
     */
    refineAnalogy(analogy: Analogy, feedback: 'too_simple' | 'too_complex' | 'wrong_focus'): Analogy;
    /**
     * Extract core similarity from complex mapping
     */
    private extractCoreSimiliarity;
    /**
     * Extract alternative focus
     */
    private extractAlternativeFocus;
}
export default AnalogyGenerator;
