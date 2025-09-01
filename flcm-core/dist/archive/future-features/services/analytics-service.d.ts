/**
 * Analytics Service
 * Tracks and analyzes system performance and usage metrics
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface Metric {
    name: string;
    value: number;
    timestamp: Date;
    tags?: Record<string, string>;
}
export interface AgentMetrics {
    agentName: string;
    executionTime: number;
    inputSize: number;
    outputSize: number;
    qualityScore: number;
    errorRate: number;
    timestamp: Date;
}
export interface WorkflowMetrics {
    workflowId: string;
    mode: string;
    totalDuration: number;
    agentDurations: Record<string, number>;
    qualityScores: Record<string, number>;
    platforms: string[];
    success: boolean;
    timestamp: Date;
}
export interface UsageMetrics {
    daily: {
        workflows: number;
        successRate: number;
        avgDuration: number;
        topTopics: string[];
        topPlatforms: string[];
    };
    weekly: {
        workflows: number;
        successRate: number;
        avgQuality: number;
        peakHours: number[];
    };
    monthly: {
        workflows: number;
        totalContent: number;
        avgEngagement: number;
        improvements: number;
    };
}
export declare class AnalyticsService extends EventEmitter {
    private metrics;
    private agentMetrics;
    private workflowMetrics;
    private dataDir;
    private flushInterval;
    private aggregationInterval;
    constructor(dataDir?: string);
    /**
     * Track a generic metric
     */
    track(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Track agent performance
     */
    trackAgent(metrics: Omit<AgentMetrics, 'timestamp'>): void;
    /**
     * Track workflow completion
     */
    trackWorkflow(metrics: Omit<WorkflowMetrics, 'timestamp'>): void;
    /**
     * Get agent performance statistics
     */
    getAgentStats(agentName?: string): any;
    /**
     * Get workflow performance statistics
     */
    getWorkflowStats(mode?: string): any;
    /**
     * Get usage metrics
     */
    getUsageMetrics(): UsageMetrics;
    /**
     * Get performance trends
     */
    getTrends(period?: 'day' | 'week' | 'month'): any;
    /**
     * Generate analytics report
     */
    generateReport(): string;
    /**
     * Export metrics to file
     */
    exportMetrics(format?: 'json' | 'csv'): string;
    private average;
    private percentile;
    private calculateSuccessRate;
    private calculateAvgQuality;
    private getTopPlatforms;
    private calculatePeakHours;
    private calculateTotalContent;
    private calculateAvgEngagement;
    private calculateImprovements;
    private groupByPeriod;
    private generateRecommendations;
    private loadMetrics;
    private flushToDisk;
    private aggregateMetrics;
    /**
     * Cleanup
     */
    destroy(): void;
}
export declare function getAnalyticsService(dataDir?: string): AnalyticsService;
export default AnalyticsService;
