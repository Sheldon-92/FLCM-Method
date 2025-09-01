/**
 * Metrics Collector
 * Collects and aggregates feature flag usage metrics
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class MetricsCollector extends EventEmitter {
    private metrics;
    private logger;
    private flushInterval;
    private flushTimer?;
    private maxSamplesPerFlag;
    constructor();
    /**
     * Track feature flag usage
     */
    trackUsage(flagName: string, userId: string, enabled: boolean): void;
    /**
     * Track performance impact
     */
    trackPerformance(flagName: string, duration: number, userId?: string): void;
    /**
     * Track error
     */
    trackError(flagName: string, userId?: string): void;
    /**
     * Get or create metric
     */
    private getOrCreateMetric;
    /**
     * Update error rate
     */
    private updateErrorRate;
    /**
     * Get usage metrics for a flag
     */
    getUsageMetrics(flagName: string): any;
    /**
     * Get performance metrics for a flag
     */
    getPerformanceMetrics(flagName: string): any;
    /**
     * Get all metrics
     */
    getAllMetrics(): Map<string, any>;
    /**
     * Get aggregated statistics
     */
    getAggregatedStats(): any;
    /**
     * Get metrics summary for reporting
     */
    getMetricsSummary(): any;
    /**
     * Get average performance for a metric
     */
    private getAveragePerformance;
    /**
     * Calculate average
     */
    private average;
    /**
     * Calculate percentile
     */
    private percentile;
    /**
     * Start periodic flush of metrics
     */
    private startPeriodicFlush;
    /**
     * Flush metrics (emit for external processing)
     */
    flush(): void;
    /**
     * Reset metrics for a flag
     */
    resetMetrics(flagName: string): void;
    /**
     * Reset all metrics
     */
    resetAll(): void;
    /**
     * Export metrics for persistence
     */
    exportMetrics(): any;
    /**
     * Import metrics from persistence
     */
    importMetrics(data: any): void;
    /**
     * Shutdown collector
     */
    shutdown(): void;
}
