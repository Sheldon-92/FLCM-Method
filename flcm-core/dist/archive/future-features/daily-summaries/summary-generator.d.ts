/**
 * Daily Learning Summary Generator
 * Creates personalized daily learning summaries and insights
 */
export interface DailySummary {
    id: string;
    userId: string;
    date: Date;
    summary: SummaryContent;
    insights: DailySummaryInsight[];
    metrics: DailySummaryMetrics;
    recommendations: SummaryRecommendation[];
    mood: SummaryMood;
    generated: Date;
}
export interface SummaryContent {
    overview: string;
    keyActivities: string[];
    topInsights: string[];
    frameworksUsed: string[];
    timeSpent: number;
    focusAreas: string[];
}
export interface DailySummaryInsight {
    type: 'pattern' | 'breakthrough' | 'struggle' | 'connection';
    title: string;
    description: string;
    evidence: string[];
    confidence: number;
    actionable: boolean;
}
export interface DailySummaryMetrics {
    sessionsCompleted: number;
    totalTimeMinutes: number;
    insightsCreated: number;
    averageDepth: number;
    completionRate: number;
    frameworksUsed: number;
    conceptsExplored: number;
    connectionsIdentified: number;
}
export interface SummaryRecommendation {
    type: 'continue' | 'adjust' | 'explore' | 'review';
    category: 'framework' | 'timing' | 'depth' | 'breadth' | 'consistency';
    title: string;
    description: string;
    specific_action: string;
    priority: 'low' | 'medium' | 'high';
    estimated_benefit: string;
}
export interface SummaryMood {
    overall: 'energized' | 'satisfied' | 'neutral' | 'frustrated' | 'overwhelmed';
    confidence: number;
    engagement: number;
    challenge_level: 'too_easy' | 'just_right' | 'too_hard';
    indicators: string[];
}
export declare class DailySummaryGenerator {
    private logger;
    private summaries;
    constructor();
    /**
     * Generate daily summary for user
     */
    generateDailySummary(userId: string, date: Date, dayData: any): Promise<DailySummary>;
    /**
     * Create summary content
     */
    private createSummaryContent;
    /**
     * Generate overview text
     */
    private generateOverview;
    /**
     * Extract key activities
     */
    private extractKeyActivities;
    /**
     * Identify focus areas from sessions and insights
     */
    private identifyFocusAreas;
    /**
     * Extract daily insights
     */
    private extractDailyInsights;
    /**
     * Identify daily patterns
     */
    private identifyDailyPatterns;
    /**
     * Detect breakthroughs
     */
    private detectBreakthroughs;
    /**
     * Identify struggles
     */
    private identifyStruggles;
    /**
     * Find connections between insights
     */
    private findConnections;
    /**
     * Calculate daily metrics
     */
    private calculateDailyMetrics;
    /**
     * Count connections in insights
     */
    private countConnections;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Assess daily mood
     */
    private assessDailyMood;
    /**
     * Format hour for display
     */
    private formatHour;
    /**
     * Get summary by ID
     */
    getSummary(summaryId: string): DailySummary | undefined;
    /**
     * Get summaries for user
     */
    getUserSummaries(userId: string, limit?: number): DailySummary[];
    /**
     * Export summaries
     */
    exportSummaries(userId: string, format: 'json' | 'csv'): Promise<any>;
}
