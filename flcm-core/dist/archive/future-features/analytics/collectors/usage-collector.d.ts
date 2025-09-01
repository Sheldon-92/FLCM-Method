/**
 * Usage Collector
 * Tracks usage metrics for both 1.0 and 2.0 versions
 */
import { MetricCollector, UsageMetrics } from '../types';
export declare class UsageCollector implements MetricCollector {
    name: string;
    private usageData;
    private logger;
    constructor();
    /**
     * Initialize usage tracking for both versions
     */
    private initializeVersions;
    /**
     * Track a user request
     */
    trackRequest(version: '1.0' | '2.0', userId: string, operation: string): void;
    /**
     * Collect usage metrics
     */
    collect(): Promise<Record<string, any>>;
    /**
     * Get top N operations by usage
     */
    private getTopOperations;
    /**
     * Calculate how many users are using both versions
     */
    private calculateUserOverlap;
    /**
     * Reset collector
     */
    reset(): void;
    /**
     * Get usage summary
     */
    getSummary(): any;
    /**
     * Export metrics for analysis
     */
    exportMetrics(): UsageMetrics[];
}
