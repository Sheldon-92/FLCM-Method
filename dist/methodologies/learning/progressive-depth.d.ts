/**
 * Progressive Depth Learning Methodology
 * Implements 5-level depth understanding framework
 */
export interface DepthLevel {
    level: 1 | 2 | 3 | 4 | 5;
    name: string;
    focus: string;
    understanding: string[];
    confidence: number;
    complete: boolean;
}
export interface Concept {
    name: string;
    definition: string;
    context: string;
    importance: number;
}
export interface ProgressiveDepthAnalysis {
    concept: Concept;
    currentDepth: number;
    levels: DepthLevel[];
    teachingReady: boolean;
    gaps: string[];
    nextSteps: string[];
}
/**
 * Progressive Depth Learning Class
 */
export declare class ProgressiveDepthLearning {
    private readonly depthDefinitions;
    /**
     * Analyze concept at progressive depths
     */
    analyze(concept: Concept, content: string, existingKnowledge?: string[]): ProgressiveDepthAnalysis;
    /**
     * Analyze a specific depth level
     */
    private analyzeDepthLevel;
    /**
     * Extract surface-level understanding (What)
     */
    private extractSurfaceUnderstanding;
    /**
     * Extract mechanical understanding (How)
     */
    private extractMechanicalUnderstanding;
    /**
     * Extract principle understanding (Why)
     */
    private extractPrincipleUnderstanding;
    /**
     * Extract system understanding (Connections)
     */
    private extractSystemUnderstanding;
    /**
     * Extract innovation understanding (Implications)
     */
    private extractInnovationUnderstanding;
    private extractFeatures;
    private identifyCategories;
    private extractPurpose;
    private extractProcesses;
    private extractSteps;
    private extractMechanisms;
    private extractImplementation;
    private extractReasons;
    private extractPrinciples;
    private extractProblems;
    private extractBenefits;
    private extractConnections;
    private extractDependencies;
    private extractSystemContext;
    private extractInteractions;
    private extractPossibilities;
    private extractImprovements;
    private extractApplications;
    private extractImplications;
    private checkKnowledgeOverlap;
    private getCommonWords;
    /**
     * Identify knowledge gaps
     */
    private identifyGaps;
    /**
     * Suggest next learning steps
     */
    private suggestNextSteps;
    /**
     * Generate teaching questions for each depth level
     */
    generateQuestions(analysis: ProgressiveDepthAnalysis): Map<number, string[]>;
}
export default ProgressiveDepthLearning;
//# sourceMappingURL=progressive-depth.d.ts.map