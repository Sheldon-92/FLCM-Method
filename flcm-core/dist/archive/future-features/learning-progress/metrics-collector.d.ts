/**
 * Metrics Collector
 * Collects and aggregates learning metrics from various sources
 */
import { LearningSession, DateRange, AnalyticsExport } from './types';
export declare class MetricsCollector {
    private insightAnalyzer;
    private contentAnalyzer;
    private logger;
    private sessionStore;
    private metricsCache;
    constructor();
    /**
     * Collect metrics from a learning session
     */
    collectFromSession(session: LearningSession): Promise<void>;
    /**
     * Get aggregated metrics for user and time range
     */
    getMetrics(userId: string, timeRange: DateRange): Promise<any>;
    /**
     * Process an insight
     */
    private processInsight;
    /**
     * Process content
     */
    private processContent;
    /**
     * Get sessions in time range
     */
    private getSessionsInRange;
    /**
     * Calculate total time spent
     */
    private calculateTotalTime;
    /**
     * Count total insights
     */
    private countTotalInsights;
    /**
     * Get unique frameworks used
     */
    private getUniqueFrameworks;
    /**
     * Calculate framework usage statistics
     */
    private calculateFrameworkUsage;
    /**
     * Calculate insight metrics
     */
    private calculateInsightMetrics;
    /**
     * Calculate content metrics
     */
    private calculateContentMetrics;
    /**
     * Calculate time distribution
     */
    private calculateTimeDistribution;
    /**
     * Calculate streak data
     */
    private calculateStreakData;
    /**
     * Update running average
     */
    private updateRunningAverage;
    /**
     * Get time slot from hour
     */
    private getTimeSlot;
    /**
     * Calculate framework effectiveness
     */
    private calculateEffectiveness;
    /**
     * Calculate success rate
     */
    private calculateSuccessRate;
    /**
     * Count words in text
     */
    private countWords;
    /**
     * Analyze content structure
     */
    private analyzeContentStructure;
    /**
     * Check if dates are consecutive
     */
    private isConsecutiveDay;
    /**
     * Update aggregated metrics
     */
    private updateAggregatedMetrics;
    /**
     * Clear user cache
     */
    private clearUserCache;
    /**
     * Export data
     */
    exportData(userId: string, format: 'csv' | 'json' | 'xlsx', timeRange: DateRange): Promise<AnalyticsExport>;
    /**
     * Get collector statistics
     */
    getStats(): any;
}
