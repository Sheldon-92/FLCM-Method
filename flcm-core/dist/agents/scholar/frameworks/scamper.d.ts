/**
 * SCAMPER Framework
 * Creative thinking and innovation framework
 */
export interface SCAMPERResult {
    substitute: string[];
    combine: string[];
    adapt: string[];
    modify: string[];
    putToOtherUses: string[];
    eliminate: string[];
    reverse: string[];
}
export declare class SCAMPERFramework {
    /**
     * Analyze content using SCAMPER framework
     */
    analyze(content: string): Promise<SCAMPERResult>;
    private findSubstitutions;
    private findCombinations;
    private findAdaptations;
    private findModifications;
    private findOtherUses;
    private findEliminations;
    private findReversals;
    private extractMatches;
    /**
     * Extract insights from SCAMPER results
     */
    extractInsights(results: SCAMPERResult): string[];
}
