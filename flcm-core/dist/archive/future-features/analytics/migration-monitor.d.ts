/**
 * Migration Monitor
 * Central monitoring system for 1.0 to 2.0 migration
 */
/// <reference types="node" />
import { MetricCollector } from './types';
import { EventEmitter } from 'events';
export declare class MigrationMonitor extends EventEmitter {
    private collectors;
    private metricsStore;
    private dashboard;
    private alerting;
    private logger;
    private collectionInterval;
    private collectionTimer?;
    private isRunning;
    constructor();
    /**
     * Initialize metric collectors
     */
    private initializeCollectors;
    /**
     * Setup alert event handlers
     */
    private setupAlertHandlers;
    /**
     * Start monitoring
     */
    start(): void;
    /**
     * Stop monitoring
     */
    stop(): void;
    /**
     * Collect metrics from all collectors
     */
    private collectMetrics;
    /**
     * Calculate migration-specific metrics
     */
    private calculateMigrationMetrics;
    /**
     * Evaluate alerts based on metrics
     */
    private evaluateAlerts;
    /**
     * Handle alert triggered event
     */
    private handleAlertTriggered;
    /**
     * Handle alert resolved event
     */
    private handleAlertResolved;
    /**
     * Handle alert-specific actions
     */
    private handleAlertAction;
    /**
     * Consider automatic rollback
     */
    private considerRollback;
    /**
     * Log performance regression details
     */
    private logPerformanceRegression;
    /**
     * Request additional user feedback
     */
    private requestAdditionalFeedback;
    /**
     * Notify systems about rollback
     */
    private notifyRollback;
    /**
     * Get current migration status
     */
    getMigrationStatus(): any;
    /**
     * Get migration trends
     */
    getMigrationTrends(duration?: string): any;
    /**
     * Generate migration report
     */
    generateReport(startDate: Date, endDate: Date): any;
    /**
     * Generate summary statistics
     */
    private generateSummary;
    /**
     * Generate recommendations based on metrics
     */
    private generateRecommendations;
    /**
     * Set collection interval
     */
    setCollectionInterval(intervalMs: number): void;
    /**
     * Add custom collector
     */
    addCollector(name: string, collector: MetricCollector): void;
    /**
     * Remove collector
     */
    removeCollector(name: string): void;
    /**
     * Get collector
     */
    getCollector(name: string): MetricCollector | undefined;
}
