/**
 * Metrics Store
 * Stores and retrieves time-series metrics data
 */
import { MetricPoint } from './types';
export declare class MetricsStore {
    private store;
    private storePath;
    private logger;
    private maxPoints;
    private flushTimer?;
    private flushInterval;
    private pendingWrites;
    constructor(storagePath?: string);
    /**
     * Initialize storage directory
     */
    private initializeStore;
    /**
     * Load existing metrics from disk
     */
    private loadExistingMetrics;
    /**
     * Write metrics for a specific collector
     */
    writeMetrics(collectorName: string, metrics: Record<string, any>): Promise<void>;
    /**
     * Write nested metrics (objects)
     */
    private writeNestedMetrics;
    /**
     * Write a single metric point
     */
    writeMetricPoint(metricName: string, value: number, timestamp: Date, labels?: Record<string, string>): Promise<void>;
    /**
     * Get latest metrics for a collector
     */
    getLatestMetrics(collectorName: string): Record<string, number> | null;
    /**
     * Get metrics at specific timestamp
     */
    getMetricsAt(collectorName: string, timestamp: Date): Record<string, number>;
    /**
     * Get time series data
     */
    getTimeSeries(metricName: string, duration?: string): MetricPoint[];
    /**
     * Get metrics in date range
     */
    getMetricsRange(collectorName: string, startDate: Date, endDate: Date): Record<string, MetricPoint[]>;
    /**
     * Get previous value for comparison
     */
    getPreviousValue(metricName: string): number | null;
    /**
     * Calculate average over time period
     */
    getAverage(metricName: string, startDate: Date, endDate: Date): number;
    /**
     * Calculate trend (increasing/decreasing)
     */
    getTrend(metricName: string, startDate: Date, endDate: Date): number;
    /**
     * Parse duration string to milliseconds
     */
    private parseDuration;
    /**
     * Start periodic flush to disk
     */
    private startPeriodicFlush;
    /**
     * Flush pending writes to disk
     */
    private flushToDisk;
    /**
     * Get store statistics
     */
    getStats(): any;
    /**
     * Cleanup old metrics
     */
    cleanup(retentionDays?: number): Promise<void>;
    /**
     * Stop store and flush pending writes
     */
    stop(): Promise<void>;
}
