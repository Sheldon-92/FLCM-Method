/**
 * 5W2H Framework
 * Comprehensive investigation framework
 */
export interface FiveW2HResult {
    what: string[];
    when: string[];
    where: string[];
    who: string[];
    why: string[];
    how: string[];
    howMuch: string[];
}
export declare class FiveW2HFramework {
    /**
     * Analyze content using 5W2H framework
     */
    analyze(content: string): Promise<FiveW2HResult>;
    private extractWhat;
    private extractWhen;
    private extractWhere;
    private extractWho;
    private extractWhy;
    private extractHow;
    private extractHowMuch;
    /**
     * Extract insights from 5W2H results
     */
    extractInsights(results: FiveW2HResult): string[];
}
