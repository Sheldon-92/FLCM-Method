/**
 * Performance Monitoring System for FLCM 2.0
 * Tracks agent performance, resource usage, and system health metrics
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum MetricType {
    EXECUTION_TIME = "execution_time",
    MEMORY_USAGE = "memory_usage",
    CPU_USAGE = "cpu_usage",
    THROUGHPUT = "throughput",
    ERROR_RATE = "error_rate",
    QUEUE_SIZE = "queue_size",
    RESPONSE_TIME = "response_time",
    RESOURCE_UTILIZATION = "resource_utilization"
}
export interface PerformanceThresholds {
    executionTime: {
        warning: number;
        critical: number;
    };
    memoryUsage: {
        warning: number;
        critical: number;
    };
    errorRate: {
        warning: number;
        critical: number;
    };
    responseTime: {
        warning: number;
        critical: number;
    };
}
export interface PerformanceMetric {
    id: string;
    timestamp: Date;
    agentId: string;
    taskId?: string;
    metricType: MetricType;
    value: number;
    unit: string;
    context: Record<string, any>;
    threshold?: {
        warning: number;
        critical: number;
    };
    status: 'normal' | 'warning' | 'critical';
    tags: string[];
}
export interface AgentPerformanceSummary {
    agentId: string;
    totalExecutions: number;
    averageExecutionTime: number;
    medianExecutionTime: number;
    p95ExecutionTime: number;
    p99ExecutionTime: number;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    errorRate: number;
    throughput: number;
    availability: number;
    lastActivity: Date;
    healthScore: number;
    trends: {
        executionTime: 'improving' | 'stable' | 'degrading';
        memoryUsage: 'improving' | 'stable' | 'degrading';
        errorRate: 'improving' | 'stable' | 'degrading';
    };
}
export interface SystemHealthMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        total: number;
        used: number;
        free: number;
        percentage: number;
    };
    disk: {
        total: number;
        used: number;
        free: number;
        percentage: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
    };
    processes: {
        total: number;
        running: number;
    };
    uptime: number;
    nodeVersion: string;
    platform: string;
}
/**
 * Enhanced Performance Monitor Class
 */
export declare class PerformanceMonitor extends EventEmitter {
    private metrics;
    private agentSummaries;
    private thresholds;
    private metricsFilePath;
    private maxMetricsInMemory;
    private monitoringInterval?;
    private systemHealthInterval?;
    private alertCallbacks;
    constructor(thresholds?: Partial<PerformanceThresholds>);
    /**
     * Record a performance metric
     */
    recordMetric(agentId: string, metricType: MetricType, value: number, unit?: string, context?: Record<string, any>, taskId?: string, tags?: string[]): PerformanceMetric;
    /**
     * Start timing an operation
     */
    startTiming(agentId: string, operation: string, context?: Record<string, any>): {
        stop: (taskId?: string, tags?: string[]) => PerformanceMetric;
    };
    /**
     * Record throughput metric
     */
    recordThroughput(agentId: string, operationsCompleted: number, timeWindowMs: number, context?: Record<string, any>): PerformanceMetric;
    /**
     * Record error rate
     */
    recordErrorRate(agentId: string, errorCount: number, totalOperations: number, context?: Record<string, any>): PerformanceMetric;
    /**
     * Get agent performance summary
     */
    getAgentSummary(agentId: string): AgentPerformanceSummary | undefined;
    /**
     * Get all agent summaries
     */
    getAllAgentSummaries(): Record<string, AgentPerformanceSummary>;
    /**
     * Get metrics for a specific time range
     */
    getMetrics(timeRangeMs: number, agentId?: string, metricType?: MetricType): PerformanceMetric[];
    /**
     * Get system health metrics
     */
    getSystemHealth(): SystemHealthMetrics;
    /**
     * Generate performance report
     */
    generateReport(timeRangeMs?: number): {
        summary: {
            totalMetrics: number;
            timeRange: string;
            overallHealthScore: number;
            alertsTriggered: number;
        };
        agents: Record<string, AgentPerformanceSummary>;
        systemHealth: SystemHealthMetrics;
        trends: {
            executionTime: number[];
            memoryUsage: number[];
            errorRate: number[];
            throughput: number[];
        };
        recommendations: string[];
    };
    /**
     * Register alert callback
     */
    onAlert(callback: (metric: PerformanceMetric) => void): void;
    /**
     * Start system monitoring
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Clean up old metrics
     */
    cleanupOldMetrics(olderThanHours?: number): number;
    private generateMetricId;
    private getThreshold;
    private evaluateStatus;
    private updateAgentSummary;
    private calculatePercentile;
    private calculateHealthScore;
    private calculateTrends;
    private getAverageValue;
    private compareTrend;
    private calculateOverallHealthScore;
    private calculateTrend;
    private generateRecommendations;
    private checkAlerts;
    private collectSystemMetrics;
    private startSystemMonitoring;
    private ensureLogDirectory;
    private loadExistingMetrics;
    private saveMetricsToFile;
}
/**
 * Get or create global performance monitor instance
 */
export declare function getPerformanceMonitor(thresholds?: Partial<PerformanceThresholds>): PerformanceMonitor;
/**
 * Convenience function to time an operation
 */
export declare function timeOperation<T>(agentId: string, operation: string, fn: () => Promise<T>, context?: Record<string, any>): Promise<T>;
