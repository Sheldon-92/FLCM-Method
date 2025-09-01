/**
 * Socratic Framework
 * Deep questioning and critical thinking framework
 */
export interface SocraticResult {
    clarification: string[];
    assumptions: string[];
    evidence: string[];
    perspectives: string[];
    implications: string[];
    questions: string[];
}
export declare class SocraticFramework {
    /**
     * Analyze content using Socratic questioning
     */
    analyze(content: string): Promise<SocraticResult>;
    private generateClarificationQuestions;
    private identifyAssumptions;
    private questionEvidence;
    private explorePerspectives;
    private examineImplications;
    private questionTheQuestion;
    private extractTopics;
    /**
     * Extract insights from Socratic results
     */
    extractInsights(results: SocraticResult): string[];
}
