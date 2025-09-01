/**
 * Pyramid Framework
 * Hierarchical information structuring framework
 */
export interface PyramidResult {
    mainPoint: string;
    supportingIdeas: string[];
    details: string[][];
    evidence: string[][];
    structure: PyramidStructure;
}
export interface PyramidStructure {
    level1: string;
    level2: PyramidNode[];
    level3: PyramidNode[];
    level4: PyramidNode[];
}
export interface PyramidNode {
    content: string;
    parent: number;
    index: number;
}
export declare class PyramidFramework {
    /**
     * Analyze content using Pyramid Principle
     */
    analyze(content: string): Promise<PyramidResult>;
    private extractMainPoint;
    private extractSupportingIdeas;
    private extractDetails;
    private extractEvidence;
    private buildStructure;
    private extractKeywords;
    private isStopWord;
    /**
     * Extract insights from Pyramid results
     */
    extractInsights(results: PyramidResult): string[];
}
