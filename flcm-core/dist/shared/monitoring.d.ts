/**
 * FLCM 2.0 Monitoring System
 * Real-time monitoring, metrics collection, and alerting
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
interface MetricData {
    timestamp: number;
    value: number;
    labels?: Record<string, string>;
}
interface Alert {
    id: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
    metric?: string;
    threshold?: number;
    value?: number;
}
interface MonitoringConfig {
    interval: number;
    retention: number;
    thresholds: {
        memory: number;
        disk: number;
        cpu: number;
        errorRate: number;
    };
    alerts: {
        enabled: boolean;
        webhookUrl?: string;
        email?: string;
    };
}
export declare class MonitoringSystem extends EventEmitter {
    private metrics;
    private alerts;
    private config;
    private monitoringInterval;
    private readonly dataDir;
    private readonly logFile;
    constructor(config?: Partial<MonitoringConfig>);
    /**
     * Start monitoring system
     */
    start(): void;
    /**
     * Stop monitoring system
     */
    stop(): void;
    /**
     * Collect system metrics
     */
    private collectMetrics;
    /**
     * Collect system-level metrics
     */
    private collectSystemMetrics;
    /**
     * Collect FLCM-specific metrics
     */
    private collectFlcmMetrics;
    /**
     * Record a metric data point
     */
    private recordMetric;
    /**
     * Get metric data
     */
    getMetrics(name: string, since?: number): MetricData[];
    /**
     * Get all metric names
     */
    getMetricNames(): string[];
    /**
     * Get current system snapshot
     */
    getCurrentSnapshot(): Record<string, any>;
    /**
     * Check thresholds and generate alerts
     */
    private checkThresholds;
    /**
     * Create an alert
     */
    private createAlert;
    /**
     * Resolve an alert
     */
    resolveAlert(id: string): void;
    /**
     * Get active alerts
     */
    getActiveAlerts(): Alert[];
    /**
     * Get all alerts
     */
    getAllAlerts(since?: number): Alert[];
    /**
     * Send notification for alert
     */
    private sendNotification;
    /**
     * Generate monitoring dashboard data
     */
    getDashboardData(): Record<string, any>;
    /**
     * Export metrics to JSON
     */
    exportMetrics(): string;
    /**
     * Import metrics from JSON
     */
    importMetrics(jsonData: string): void;
    /**
     * Helper methods
     */
    private getLatestMetric;
    private getDiskUsage;
    private countFiles;
    private initializeDataDirectory;
    private loadHistoricalData;
    private persistMetrics;
    private cleanupOldData;
    private log;
}
export default MonitoringSystem;
