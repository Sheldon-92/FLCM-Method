/**
 * Performance Collector
 * Tracks performance metrics for operations in both versions
 */
import { MetricCollector } from '../types';
export declare class PerformanceCollector implements MetricCollector {
    name: string;
    private metrics;
    private timings;
    private logger;
    private maxSamples;
    constructor();
    /**
     * Track operation performance
     */
    trackOperation(version: '1.0' | '2.0', operation: string, duration: number, metadata?: {
        memory?: number;
        cpu?: number;
        success?: boolean;
    }): void;
    /**
     * Update performance metrics for an operation
     */
    private updateMetrics;
    /**
     * Calculate percentile
     */
    private calculatePercentile;
    /**
     * Calculate average
     */
    private calculateAverage;
    /**
     * Collect performance metrics
     */
    collect(): Promise<Record<string, any>>;
    /**
     * Get list of operations for a version
     */
    private getOperationsList;
    /**
     * Get overall average for a version
     */
    private getOverallAverage;
    /**
     * Get performance comparison
     */
    getComparison(operation: string): any;
    /**
     * Identify slow operations
     */
    getSlowOperations(threshold?: number): any[];
    /**
     * Reset collector
     */
    reset(): void;
    /**
     * Get summary
     */
    getSummary(): any;
    /**
     * Get total samples for a version
     */
    private getTotalSamples;
}
