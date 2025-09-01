"use strict";
/**
 * Learning Progress Tracker
 * Main orchestrator for tracking learning progress and generating insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningProgressTracker = void 0;
const metrics_collector_1 = require("./metrics-collector");
const progress_analyzer_1 = require("./progress-analyzer");
const report_generator_1 = require("./report-generator");
const milestone_manager_1 = require("./milestone-manager");
const logger_1 = require("../shared/utils/logger");
const events_1 = require("events");
class LearningProgressTracker extends events_1.EventEmitter {
    constructor() {
        super();
        this.metricsCollector = new metrics_collector_1.MetricsCollector();
        this.progressAnalyzer = new progress_analyzer_1.ProgressAnalyzer();
        this.reportGenerator = new report_generator_1.ReportGenerator();
        this.milestoneManager = new milestone_manager_1.MilestoneManager();
        this.logger = new logger_1.Logger('LearningProgressTracker');
    }
    /**
     * Track a learning session
     */
    async trackSession(session) {
        try {
            this.logger.info(`Tracking session: ${session.id} (${session.framework})`);
            // Collect metrics from session
            await this.metricsCollector.collectFromSession(session);
            // Analyze progress
            const progress = await this.progressAnalyzer.analyzeSession(session);
            // Check for milestones
            const newMilestones = await this.milestoneManager.checkMilestones(session.userId, session);
            // Emit events for new achievements
            for (const milestone of newMilestones) {
                this.emit('milestone-achieved', milestone);
            }
            // Check for achievements
            const newAchievements = await this.checkAchievements(session.userId, progress);
            for (const achievement of newAchievements) {
                this.emit('achievement-unlocked', achievement);
            }
            this.logger.debug(`Session tracked successfully: ${progress.improvement}% improvement`);
        }
        catch (error) {
            this.logger.error('Failed to track session:', error);
            throw error;
        }
    }
    /**
     * Generate learning dashboard
     */
    async generateDashboard(userId, timeRange) {
        try {
            const range = timeRange || this.getDefaultTimeRange();
            this.logger.info(`Generating dashboard for user ${userId}`);
            // Get metrics for time range
            const metrics = await this.metricsCollector.getMetrics(userId, range);
            // Analyze current progress
            const analysis = await this.progressAnalyzer.analyzePeriod(userId, range);
            // Get achievements and milestones
            const achievements = await this.getRecentAchievements(userId, range);
            const activeMilestones = await this.milestoneManager.getActiveMilestones(userId);
            // Generate recommendations
            const recommendations = await this.generateRecommendations(userId, analysis);
            const dashboard = {
                summary: {
                    totalSessions: metrics.sessions.length,
                    totalTime: metrics.totalTime,
                    averageSessionLength: metrics.totalTime / metrics.sessions.length,
                    insightsCreated: metrics.totalInsights,
                    frameworksUsed: metrics.uniqueFrameworks.size,
                    currentStreak: analysis.currentStreak,
                    overallProgress: analysis.overallProgress
                },
                frameworkStats: analysis.frameworkStats,
                progressionChart: this.buildProgressionChart(analysis.insightProgression),
                velocityGauge: this.buildVelocityGauge(analysis.velocity),
                qualityTrend: this.buildQualityTrendChart(analysis.contentQuality),
                achievements,
                recommendations
            };
            return dashboard;
        }
        catch (error) {
            this.logger.error('Failed to generate dashboard:', error);
            throw error;
        }
    }
    /**
     * Generate progress report
     */
    async generateReport(userId, type, timeRange) {
        try {
            const range = timeRange || this.getReportTimeRange(type);
            this.logger.info(`Generating ${type} report for user ${userId}`);
            return await this.reportGenerator.generateReport(userId, type, range);
        }
        catch (error) {
            this.logger.error('Failed to generate report:', error);
            throw error;
        }
    }
    /**
     * Get learning metrics for period
     */
    async getMetrics(userId, timeRange) {
        try {
            const metrics = await this.metricsCollector.getMetrics(userId, timeRange);
            const analysis = await this.progressAnalyzer.analyzePeriod(userId, timeRange);
            const milestones = await this.milestoneManager.getMilestonesForPeriod(userId, timeRange);
            return {
                userId,
                timeRange,
                frameworks: analysis.frameworkStats,
                insights: analysis.insightProgression,
                content: analysis.contentQuality,
                velocity: analysis.velocity,
                milestones
            };
        }
        catch (error) {
            this.logger.error('Failed to get metrics:', error);
            throw error;
        }
    }
    /**
     * Set learning goals
     */
    async setGoals(userId, goals) {
        try {
            await this.milestoneManager.setGoals(userId, goals);
            this.logger.info(`Set ${goals.length} goals for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to set goals:', error);
            throw error;
        }
    }
    /**
     * Get learning insights and patterns
     */
    async getInsights(userId) {
        try {
            return await this.progressAnalyzer.generateInsights(userId);
        }
        catch (error) {
            this.logger.error('Failed to get insights:', error);
            throw error;
        }
    }
    /**
     * Export learning data
     */
    async exportData(userId, format, timeRange) {
        try {
            const range = timeRange || this.getAllTimeRange();
            return await this.metricsCollector.exportData(userId, format, range);
        }
        catch (error) {
            this.logger.error('Failed to export data:', error);
            throw error;
        }
    }
    /**
     * Build progression chart data
     */
    buildProgressionChart(progression) {
        return {
            type: 'line',
            data: progression.timeline.map(point => ({
                x: point.timestamp,
                y: point.depth,
                label: `Level ${point.level.level}: ${point.level.name}`
            })),
            labels: [],
            title: 'Insight Depth Progression',
            xAxis: 'Time',
            yAxis: 'Depth Score'
        };
    }
    /**
     * Build velocity gauge data
     */
    buildVelocityGauge(velocity) {
        return {
            current: velocity.current.insightsPerHour,
            min: 0,
            max: 5,
            target: 2,
            unit: 'insights/hour',
            label: 'Learning Velocity'
        };
    }
    /**
     * Build quality trend chart
     */
    buildQualityTrendChart(contentQuality) {
        return {
            type: 'area',
            data: contentQuality.trend.data || [],
            labels: [],
            title: 'Content Quality Trend',
            xAxis: 'Time',
            yAxis: 'Quality Score'
        };
    }
    /**
     * Check for new achievements
     */
    async checkAchievements(userId, progress) {
        const achievements = [];
        // Check various achievement conditions
        if (progress.streakDays >= 7) {
            achievements.push({
                id: 'week-streak',
                name: 'Week Warrior',
                description: 'Maintained learning streak for 7 days',
                icon: '🔥',
                date: new Date(),
                category: 'consistency',
                rarity: 'uncommon'
            });
        }
        if (progress.totalInsights >= 100) {
            achievements.push({
                id: 'century',
                name: 'Century Club',
                description: 'Created 100 insights',
                icon: '💯',
                date: new Date(),
                category: 'quantity',
                rarity: 'rare'
            });
        }
        return achievements;
    }
    /**
     * Generate personalized recommendations
     */
    async generateRecommendations(userId, analysis) {
        const recommendations = [];
        // Framework diversity recommendation
        if (analysis.frameworkStats.length < 3) {
            recommendations.push({
                type: 'framework',
                title: 'Explore New Frameworks',
                description: 'Try using different learning frameworks to gain diverse perspectives',
                priority: 'medium',
                actionable: true,
                estimatedImpact: 7
            });
        }
        // Consistency recommendation
        if (analysis.sessionGaps > 3) {
            recommendations.push({
                type: 'timing',
                title: 'Improve Consistency',
                description: 'Consider shorter, more frequent sessions for better retention',
                priority: 'high',
                actionable: true,
                estimatedImpact: 8
            });
        }
        // Depth improvement
        if (analysis.averageInsightDepth < 50) {
            recommendations.push({
                type: 'focus',
                title: 'Deepen Your Analysis',
                description: 'Use Socratic questioning to explore insights more thoroughly',
                priority: 'medium',
                actionable: true,
                estimatedImpact: 9
            });
        }
        return recommendations;
    }
    /**
     * Get recent achievements
     */
    async getRecentAchievements(userId, timeRange) {
        // This would query a database for achievements in the time range
        return [];
    }
    /**
     * Get default time range (last 30 days)
     */
    getDefaultTimeRange() {
        const end = new Date();
        const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start, end };
    }
    /**
     * Get report time range based on type
     */
    getReportTimeRange(type) {
        const end = new Date();
        let start;
        if (type === 'weekly') {
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        else {
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        return { start, end };
    }
    /**
     * Get all-time range
     */
    getAllTimeRange() {
        return {
            start: new Date('2020-01-01'),
            end: new Date()
        };
    }
    /**
     * Get tracker status
     */
    getStatus() {
        return {
            active: true,
            componentsLoaded: {
                metricsCollector: !!this.metricsCollector,
                progressAnalyzer: !!this.progressAnalyzer,
                reportGenerator: !!this.reportGenerator,
                milestoneManager: !!this.milestoneManager
            }
        };
    }
}
exports.LearningProgressTracker = LearningProgressTracker;
//# sourceMappingURL=learning-tracker.js.map