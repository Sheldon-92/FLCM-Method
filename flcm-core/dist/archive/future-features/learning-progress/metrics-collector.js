"use strict";
/**
 * Metrics Collector
 * Collects and aggregates learning metrics from various sources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const insight_analyzer_1 = require("./insight-analyzer");
const content_analyzer_1 = require("./content-analyzer");
const logger_1 = require("../shared/utils/logger");
class MetricsCollector {
    constructor() {
        // In-memory storage - in production this would be a database
        this.sessionStore = new Map();
        this.metricsCache = new Map();
        this.insightAnalyzer = new insight_analyzer_1.InsightDepthAnalyzer();
        this.contentAnalyzer = new content_analyzer_1.ContentQualityAnalyzer();
        this.logger = new logger_1.Logger('MetricsCollector');
    }
    /**
     * Collect metrics from a learning session
     */
    async collectFromSession(session) {
        try {
            // Store session
            const userSessions = this.sessionStore.get(session.userId) || [];
            userSessions.push(session);
            this.sessionStore.set(session.userId, userSessions);
            // Process insights
            for (const insight of session.insights) {
                await this.processInsight(insight, session);
            }
            // Process content
            if (session.content) {
                await this.processContent(session.content, session);
            }
            // Update aggregated metrics
            await this.updateAggregatedMetrics(session.userId);
            // Clear cache for user
            this.clearUserCache(session.userId);
            this.logger.debug(`Collected metrics for session: ${session.id}`);
        }
        catch (error) {
            this.logger.error('Failed to collect session metrics:', error);
            throw error;
        }
    }
    /**
     * Get aggregated metrics for user and time range
     */
    async getMetrics(userId, timeRange) {
        const cacheKey = `${userId}-${timeRange.start.getTime()}-${timeRange.end.getTime()}`;
        // Check cache
        if (this.metricsCache.has(cacheKey)) {
            return this.metricsCache.get(cacheKey);
        }
        try {
            const sessions = this.getSessionsInRange(userId, timeRange);
            const metrics = {
                sessions,
                totalTime: this.calculateTotalTime(sessions),
                totalInsights: this.countTotalInsights(sessions),
                uniqueFrameworks: this.getUniqueFrameworks(sessions),
                frameworkUsage: await this.calculateFrameworkUsage(sessions),
                insightMetrics: await this.calculateInsightMetrics(sessions),
                contentMetrics: await this.calculateContentMetrics(sessions),
                timeDistribution: this.calculateTimeDistribution(sessions),
                streakData: this.calculateStreakData(sessions)
            };
            // Cache result
            this.metricsCache.set(cacheKey, metrics);
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to get metrics:', error);
            throw error;
        }
    }
    /**
     * Process an insight
     */
    async processInsight(insight, session) {
        // Calculate depth score
        insight.depth = this.insightAnalyzer.calculateDepth(insight);
        insight.level = this.insightAnalyzer.getLevel(insight.depth);
        // Update insight with session context
        insight.framework = session.framework;
        if (!insight.created) {
            insight.created = new Date();
        }
    }
    /**
     * Process content
     */
    async processContent(content, session) {
        // Calculate word count if not provided
        if (!content.wordCount) {
            content.wordCount = this.countWords(content.text);
        }
        // Analyze content structure
        if (!content.structure) {
            content.structure = this.analyzeContentStructure(content.text);
        }
        // Set creation date
        if (!content.created) {
            content.created = session.startTime;
        }
    }
    /**
     * Get sessions in time range
     */
    getSessionsInRange(userId, timeRange) {
        const allSessions = this.sessionStore.get(userId) || [];
        return allSessions.filter(session => session.startTime >= timeRange.start && session.startTime <= timeRange.end);
    }
    /**
     * Calculate total time spent
     */
    calculateTotalTime(sessions) {
        return sessions.reduce((total, session) => total + session.duration, 0);
    }
    /**
     * Count total insights
     */
    countTotalInsights(sessions) {
        return sessions.reduce((total, session) => total + session.insights.length, 0);
    }
    /**
     * Get unique frameworks used
     */
    getUniqueFrameworks(sessions) {
        return new Set(sessions.map(session => session.framework));
    }
    /**
     * Calculate framework usage statistics
     */
    async calculateFrameworkUsage(sessions) {
        const frameworkStats = new Map();
        for (const session of sessions) {
            const existing = frameworkStats.get(session.framework) || {
                name: session.framework,
                usageCount: 0,
                totalTime: 0,
                avgCompletionRate: 0,
                avgInsightDepth: 0,
                avgQualityScore: 0,
                effectiveness: 0,
                preferredTimes: [],
                successRate: 0,
                lastUsed: session.startTime
            };
            existing.usageCount++;
            existing.totalTime += session.duration;
            existing.lastUsed = new Date(Math.max(existing.lastUsed.getTime(), session.startTime.getTime()));
            // Update completion rate
            const completionRate = session.completedSteps / session.totalSteps;
            existing.avgCompletionRate = this.updateRunningAverage(existing.avgCompletionRate, completionRate, existing.usageCount);
            // Update insight depth
            const sessionAvgDepth = session.insights.reduce((sum, insight) => sum + insight.depth, 0) /
                Math.max(session.insights.length, 1);
            existing.avgInsightDepth = this.updateRunningAverage(existing.avgInsightDepth, sessionAvgDepth, existing.usageCount);
            // Update quality score
            if (session.content) {
                const qualityScore = await this.contentAnalyzer.assessQuality(session.content);
                existing.avgQualityScore = this.updateRunningAverage(existing.avgQualityScore, qualityScore.score, existing.usageCount);
            }
            // Track preferred times
            const hour = session.startTime.getHours();
            const timeSlot = this.getTimeSlot(hour);
            if (!existing.preferredTimes.includes(timeSlot)) {
                existing.preferredTimes.push(timeSlot);
            }
            frameworkStats.set(session.framework, existing);
        }
        // Calculate effectiveness and success rates
        for (const [framework, stats] of frameworkStats) {
            stats.effectiveness = this.calculateEffectiveness(stats);
            stats.successRate = this.calculateSuccessRate(stats);
        }
        return Array.from(frameworkStats.values());
    }
    /**
     * Calculate insight metrics
     */
    async calculateInsightMetrics(sessions) {
        const allInsights = sessions.flatMap(session => session.insights);
        if (allInsights.length === 0) {
            return {
                totalCount: 0,
                averageDepth: 0,
                depthDistribution: {},
                progression: []
            };
        }
        const averageDepth = allInsights.reduce((sum, insight) => sum + insight.depth, 0) / allInsights.length;
        // Depth distribution
        const depthDistribution = {};
        for (const insight of allInsights) {
            const level = insight.level.name;
            depthDistribution[level] = (depthDistribution[level] || 0) + 1;
        }
        // Progression over time
        const progression = allInsights
            .sort((a, b) => a.created.getTime() - b.created.getTime())
            .map(insight => ({
            timestamp: insight.created,
            depth: insight.depth,
            level: insight.level
        }));
        return {
            totalCount: allInsights.length,
            averageDepth,
            depthDistribution,
            progression
        };
    }
    /**
     * Calculate content metrics
     */
    async calculateContentMetrics(sessions) {
        const allContent = sessions
            .map(session => session.content)
            .filter(content => content !== undefined);
        if (allContent.length === 0) {
            return {
                totalCount: 0,
                averageLength: 0,
                averageQuality: 0,
                qualityTrend: []
            };
        }
        const totalWords = allContent.reduce((sum, content) => sum + content.wordCount, 0);
        const averageLength = totalWords / allContent.length;
        // Calculate quality scores
        const qualityScores = await Promise.all(allContent.map(content => this.contentAnalyzer.assessQuality(content)));
        const averageQuality = qualityScores.reduce((sum, score) => sum + score.score, 0) / qualityScores.length;
        // Quality trend over time
        const qualityTrend = allContent.map((content, index) => ({
            timestamp: content.created,
            quality: qualityScores[index].score
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return {
            totalCount: allContent.length,
            averageLength,
            averageQuality,
            qualityTrend
        };
    }
    /**
     * Calculate time distribution
     */
    calculateTimeDistribution(sessions) {
        const distribution = {
            byHour: new Array(24).fill(0),
            byDayOfWeek: new Array(7).fill(0),
            byFramework: new Map()
        };
        for (const session of sessions) {
            const hour = session.startTime.getHours();
            const dayOfWeek = session.startTime.getDay();
            distribution.byHour[hour] += session.duration;
            distribution.byDayOfWeek[dayOfWeek] += session.duration;
            const frameworkTime = distribution.byFramework.get(session.framework) || 0;
            distribution.byFramework.set(session.framework, frameworkTime + session.duration);
        }
        return {
            byHour: distribution.byHour,
            byDayOfWeek: distribution.byDayOfWeek,
            byFramework: Object.fromEntries(distribution.byFramework)
        };
    }
    /**
     * Calculate streak data
     */
    calculateStreakData(sessions) {
        if (sessions.length === 0) {
            return { current: 0, longest: 0, streaks: [] };
        }
        // Sort sessions by date
        const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        // Group by date
        const sessionsByDate = new Map();
        for (const session of sortedSessions) {
            const dateKey = session.startTime.toISOString().split('T')[0];
            const dailySessions = sessionsByDate.get(dateKey) || [];
            dailySessions.push(session);
            sessionsByDate.set(dateKey, dailySessions);
        }
        const dates = Array.from(sessionsByDate.keys()).sort();
        let currentStreak = 0;
        let longestStreak = 0;
        let currentStreakStart = dates[0];
        let streaks = [];
        for (let i = 0; i < dates.length; i++) {
            if (i === 0 || this.isConsecutiveDay(dates[i - 1], dates[i])) {
                currentStreak++;
            }
            else {
                if (currentStreak > 0) {
                    streaks.push({
                        start: currentStreakStart,
                        end: dates[i - 1],
                        length: currentStreak
                    });
                }
                currentStreak = 1;
                currentStreakStart = dates[i];
            }
            longestStreak = Math.max(longestStreak, currentStreak);
        }
        // Add final streak
        if (currentStreak > 0) {
            streaks.push({
                start: currentStreakStart,
                end: dates[dates.length - 1],
                length: currentStreak
            });
        }
        return {
            current: currentStreak,
            longest: longestStreak,
            streaks
        };
    }
    /**
     * Update running average
     */
    updateRunningAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    /**
     * Get time slot from hour
     */
    getTimeSlot(hour) {
        if (hour < 6)
            return 'night';
        if (hour < 12)
            return 'morning';
        if (hour < 18)
            return 'afternoon';
        return 'evening';
    }
    /**
     * Calculate framework effectiveness
     */
    calculateEffectiveness(stats) {
        return (stats.avgCompletionRate * 0.3 +
            (stats.avgInsightDepth / 100) * 0.4 +
            (stats.avgQualityScore / 100) * 0.3);
    }
    /**
     * Calculate success rate
     */
    calculateSuccessRate(stats) {
        // Success defined as completion rate > 70% and insight depth > 40
        return stats.avgCompletionRate > 0.7 && stats.avgInsightDepth > 40 ?
            Math.min(stats.avgCompletionRate + (stats.avgInsightDepth / 100), 1) :
            stats.avgCompletionRate * 0.5;
    }
    /**
     * Count words in text
     */
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    /**
     * Analyze content structure
     */
    analyzeContentStructure(text) {
        const lines = text.split('\n');
        return {
            hasIntroduction: lines.some(line => line.toLowerCase().includes('introduction') ||
                line.toLowerCase().includes('overview')),
            hasConclusion: lines.some(line => line.toLowerCase().includes('conclusion') ||
                line.toLowerCase().includes('summary')),
            paragraphCount: lines.filter(line => line.trim().length > 0).length,
            headerCount: lines.filter(line => line.trim().startsWith('#')).length,
            listCount: lines.filter(line => line.trim().match(/^[-*+]\s/)).length,
            logicalFlow: Math.random() * 10 // Placeholder - would need NLP analysis
        };
    }
    /**
     * Check if dates are consecutive
     */
    isConsecutiveDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
    }
    /**
     * Update aggregated metrics
     */
    async updateAggregatedMetrics(userId) {
        // This would update database tables with aggregated metrics
        // For now, we just clear the cache
        this.clearUserCache(userId);
    }
    /**
     * Clear user cache
     */
    clearUserCache(userId) {
        const keysToDelete = [];
        for (const key of this.metricsCache.keys()) {
            if (key.startsWith(userId + '-')) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.metricsCache.delete(key);
        }
    }
    /**
     * Export data
     */
    async exportData(userId, format, timeRange) {
        const sessions = this.getSessionsInRange(userId, timeRange);
        const metrics = await this.getMetrics(userId, timeRange);
        const exportData = {
            sessions,
            metrics,
            exportMeta: {
                userId,
                timeRange,
                exportedAt: new Date(),
                sessionCount: sessions.length
            }
        };
        return {
            format,
            data: exportData,
            filename: `learning-progress-${userId}-${Date.now()}.${format}`,
            generatedAt: new Date()
        };
    }
    /**
     * Get collector statistics
     */
    getStats() {
        return {
            totalUsers: this.sessionStore.size,
            totalSessions: Array.from(this.sessionStore.values()).reduce((sum, sessions) => sum + sessions.length, 0),
            cacheSize: this.metricsCache.size
        };
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metrics-collector.js.map