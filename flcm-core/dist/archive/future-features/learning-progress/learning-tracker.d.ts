/**
 * Learning Progress Tracker
 * Main orchestrator for tracking learning progress and generating insights
 */
/// <reference types="node" />
import { LearningSession, LearningMetrics, Dashboard, Report, DateRange } from './types';
import { EventEmitter } from 'events';
export declare class LearningProgressTracker extends EventEmitter {
    private metricsCollector;
    private progressAnalyzer;
    private reportGenerator;
    private milestoneManager;
    private logger;
    constructor();
    /**
     * Track a learning session
     */
    trackSession(session: LearningSession): Promise<void>;
    /**
     * Generate learning dashboard
     */
    generateDashboard(userId: string, timeRange?: DateRange): Promise<Dashboard>;
    /**
     * Generate progress report
     */
    generateReport(userId: string, type: 'weekly' | 'monthly' | 'custom', timeRange?: DateRange): Promise<Report>;
    /**
     * Get learning metrics for period
     */
    getMetrics(userId: string, timeRange: DateRange): Promise<LearningMetrics>;
    /**
     * Set learning goals
     */
    setGoals(userId: string, goals: any[]): Promise<void>;
    /**
     * Get learning insights and patterns
     */
    getInsights(userId: string): Promise<any[]>;
    /**
     * Export learning data
     */
    exportData(userId: string, format: 'csv' | 'json' | 'xlsx', timeRange?: DateRange): Promise<any>;
    /**
     * Build progression chart data
     */
    private buildProgressionChart;
    /**
     * Build velocity gauge data
     */
    private buildVelocityGauge;
    /**
     * Build quality trend chart
     */
    private buildQualityTrendChart;
    /**
     * Check for new achievements
     */
    private checkAchievements;
    /**
     * Generate personalized recommendations
     */
    private generateRecommendations;
    /**
     * Get recent achievements
     */
    private getRecentAchievements;
    /**
     * Get default time range (last 30 days)
     */
    private getDefaultTimeRange;
    /**
     * Get report time range based on type
     */
    private getReportTimeRange;
    /**
     * Get all-time range
     */
    private getAllTimeRange;
    /**
     * Get tracker status
     */
    getStatus(): any;
}
