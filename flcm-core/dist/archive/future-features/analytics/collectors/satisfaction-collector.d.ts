/**
 * Satisfaction Collector
 * Tracks user satisfaction and feedback for both versions
 */
import { MetricCollector } from '../types';
export declare class SatisfactionCollector implements MetricCollector {
    name: string;
    private feedback;
    private npsScores;
    private ratings;
    private logger;
    constructor();
    /**
     * Initialize satisfaction tracking for both versions
     */
    private initializeVersions;
    /**
     * Collect user feedback
     */
    collectFeedback(version: '1.0' | '2.0', userId: string, feedback: {
        rating?: number;
        nps?: number;
        text?: string;
    }): void;
    /**
     * Simple sentiment analysis
     */
    private analyzeSentiment;
    /**
     * Calculate Net Promoter Score
     */
    private calculateNPS;
    /**
     * Calculate average rating
     */
    private calculateAverageRating;
    /**
     * Get sentiment distribution
     */
    private getSentimentDistribution;
    /**
     * Collect satisfaction metrics
     */
    collect(): Promise<Record<string, any>>;
    /**
     * Calculate response rate (placeholder - would need user count)
     */
    private calculateResponseRate;
    /**
     * Extract common themes from feedback
     */
    private extractThemes;
    /**
     * Get recent satisfaction trend
     */
    private getRecentTrend;
    /**
     * Get feedback summary
     */
    getFeedbackSummary(version: '1.0' | '2.0', limit?: number): any[];
    /**
     * Reset collector
     */
    reset(): void;
    /**
     * Get summary
     */
    getSummary(): any;
}
