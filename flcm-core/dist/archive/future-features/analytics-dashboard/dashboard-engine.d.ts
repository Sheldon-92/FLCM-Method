/**
 * Advanced Analytics Dashboard Engine
 * Core engine for generating and managing comprehensive learning analytics dashboards
 */
/// <reference types="node" />
import { DashboardConfig, DashboardData, WidgetConfig, WidgetData, AnalyticsContext, AnalyticsDashboard, ExportFormat, ExportResult, ExportOptions, AnalyticsQuery, QueryResult } from './types';
import { EventEmitter } from 'events';
export declare class AnalyticsDashboardEngine extends EventEmitter implements AnalyticsDashboard {
    private logger;
    private dataProcessors;
    private widgetRenderers;
    private dashboardConfigs;
    private cachedData;
    private subscribers;
    private realTimeConnections;
    private metricsEngine;
    private trendsEngine;
    private insightsEngine;
    private predictionsEngine;
    private alertsEngine;
    private queryEngine;
    constructor();
    /**
     * Generate comprehensive dashboard
     */
    generateDashboard(config: DashboardConfig, context?: AnalyticsContext): Promise<DashboardData>;
    /**
     * Update specific widget
     */
    updateWidget(dashboardId: string, widgetId: string, config: Partial<WidgetConfig>): Promise<WidgetData>;
    /**
     * Export dashboard
     */
    exportDashboard(dashboardId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportResult>;
    /**
     * Subscribe to dashboard updates
     */
    subscribeToUpdates(dashboardId: string, callback: (data: DashboardData) => void): Promise<string>;
    /**
     * Execute analytics query
     */
    executeQuery(query: AnalyticsQuery, context?: AnalyticsContext): Promise<QueryResult>;
    /**
     * Initialize data processors
     */
    private initializeProcessors;
    /**
     * Initialize widget renderers
     */
    private initializeRenderers;
    /**
     * Generate data for a specific widget
     */
    private generateWidgetData;
    /**
     * Fetch raw data for widget (simplified implementation)
     */
    private fetchWidgetRawData;
    /**
     * Generate comparative analysis
     */
    private generateComparisons;
    /**
     * Start real-time update engine
     */
    private startRealtimeEngine;
    /**
     * Generate simulated real-time updates
     */
    private generateRealtimeUpdates;
    /**
     * Notify subscribers of dashboard updates
     */
    private notifySubscribers;
    /**
     * Cache data with TTL
     */
    private cacheData;
    /**
     * Get cached data if still valid
     */
    private getCachedData;
    /**
     * Invalidate cache entries
     */
    private invalidateCache;
    /**
     * Get exporter for format
     */
    private getExporter;
    private calculateTrend;
    private identifyMilestones;
    private projectCompletion;
}
