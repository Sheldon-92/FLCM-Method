"use strict";
/**
 * Analytics Service
 * Tracks and analyzes system performance and usage metrics
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsService = exports.AnalyticsService = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AnalyticsService extends events_1.EventEmitter {
    constructor(dataDir) {
        super();
        this.metrics = [];
        this.agentMetrics = [];
        this.workflowMetrics = [];
        this.dataDir = dataDir || path.join(process.cwd(), '.flcm-analytics');
        // Ensure data directory exists
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        // Load existing metrics
        this.loadMetrics();
        // Start flush interval (every minute)
        this.flushInterval = setInterval(() => {
            this.flushToDisk();
        }, 60000);
        // Start aggregation interval (every hour)
        this.aggregationInterval = setInterval(() => {
            this.aggregateMetrics();
        }, 3600000);
    }
    /**
     * Track a generic metric
     */
    track(name, value, tags) {
        const metric = {
            name,
            value,
            timestamp: new Date(),
            tags
        };
        this.metrics.push(metric);
        this.emit('metric', metric);
    }
    /**
     * Track agent performance
     */
    trackAgent(metrics) {
        const agentMetric = {
            ...metrics,
            timestamp: new Date()
        };
        this.agentMetrics.push(agentMetric);
        this.emit('agent:metrics', agentMetric);
        // Track individual metrics
        this.track(`agent.${metrics.agentName}.execution_time`, metrics.executionTime);
        this.track(`agent.${metrics.agentName}.quality_score`, metrics.qualityScore);
        this.track(`agent.${metrics.agentName}.error_rate`, metrics.errorRate);
    }
    /**
     * Track workflow completion
     */
    trackWorkflow(metrics) {
        const workflowMetric = {
            ...metrics,
            timestamp: new Date()
        };
        this.workflowMetrics.push(workflowMetric);
        this.emit('workflow:metrics', workflowMetric);
        // Track individual metrics
        this.track(`workflow.${metrics.mode}.duration`, metrics.totalDuration);
        this.track(`workflow.${metrics.mode}.success`, metrics.success ? 1 : 0);
        // Track quality scores
        for (const [agent, score] of Object.entries(metrics.qualityScores)) {
            this.track(`workflow.quality.${agent}`, score);
        }
    }
    /**
     * Get agent performance statistics
     */
    getAgentStats(agentName) {
        const relevantMetrics = agentName
            ? this.agentMetrics.filter(m => m.agentName === agentName)
            : this.agentMetrics;
        if (relevantMetrics.length === 0) {
            return null;
        }
        const stats = {
            count: relevantMetrics.length,
            avgExecutionTime: this.average(relevantMetrics.map(m => m.executionTime)),
            avgQualityScore: this.average(relevantMetrics.map(m => m.qualityScore)),
            avgErrorRate: this.average(relevantMetrics.map(m => m.errorRate)),
            p95ExecutionTime: this.percentile(relevantMetrics.map(m => m.executionTime), 95),
            totalErrors: relevantMetrics.filter(m => m.errorRate > 0).length
        };
        return stats;
    }
    /**
     * Get workflow performance statistics
     */
    getWorkflowStats(mode) {
        const relevantMetrics = mode
            ? this.workflowMetrics.filter(m => m.mode === mode)
            : this.workflowMetrics;
        if (relevantMetrics.length === 0) {
            return null;
        }
        const stats = {
            count: relevantMetrics.length,
            successRate: (relevantMetrics.filter(m => m.success).length / relevantMetrics.length) * 100,
            avgDuration: this.average(relevantMetrics.map(m => m.totalDuration)),
            p95Duration: this.percentile(relevantMetrics.map(m => m.totalDuration), 95),
            avgQuality: this.calculateAvgQuality(relevantMetrics),
            topPlatforms: this.getTopPlatforms(relevantMetrics)
        };
        return stats;
    }
    /**
     * Get usage metrics
     */
    getUsageMetrics() {
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dailyWorkflows = this.workflowMetrics.filter(m => m.timestamp > dayAgo);
        const weeklyWorkflows = this.workflowMetrics.filter(m => m.timestamp > weekAgo);
        const monthlyWorkflows = this.workflowMetrics.filter(m => m.timestamp > monthAgo);
        return {
            daily: {
                workflows: dailyWorkflows.length,
                successRate: this.calculateSuccessRate(dailyWorkflows),
                avgDuration: this.average(dailyWorkflows.map(m => m.totalDuration)),
                topTopics: [],
                topPlatforms: this.getTopPlatforms(dailyWorkflows).slice(0, 3)
            },
            weekly: {
                workflows: weeklyWorkflows.length,
                successRate: this.calculateSuccessRate(weeklyWorkflows),
                avgQuality: this.calculateAvgQuality(weeklyWorkflows),
                peakHours: this.calculatePeakHours(weeklyWorkflows)
            },
            monthly: {
                workflows: monthlyWorkflows.length,
                totalContent: this.calculateTotalContent(monthlyWorkflows),
                avgEngagement: this.calculateAvgEngagement(monthlyWorkflows),
                improvements: this.calculateImprovements(monthlyWorkflows)
            }
        };
    }
    /**
     * Get performance trends
     */
    getTrends(period = 'week') {
        const periods = this.groupByPeriod(this.workflowMetrics, period);
        const trends = [];
        for (const [periodKey, metrics] of Object.entries(periods)) {
            trends.push({
                period: periodKey,
                workflows: metrics.length,
                successRate: this.calculateSuccessRate(metrics),
                avgDuration: this.average(metrics.map((m) => m.totalDuration)),
                avgQuality: this.calculateAvgQuality(metrics)
            });
        }
        return trends;
    }
    /**
     * Generate analytics report
     */
    generateReport() {
        const usage = this.getUsageMetrics();
        const agentStats = this.getAgentStats();
        const workflowStats = this.getWorkflowStats();
        let report = '# FLCM Analytics Report\n\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;
        report += '## Executive Summary\n';
        report += `- Total Workflows: ${this.workflowMetrics.length}\n`;
        report += `- Success Rate: ${workflowStats?.successRate?.toFixed(1)}%\n`;
        report += `- Avg Duration: ${(workflowStats?.avgDuration / 1000 / 60).toFixed(1)} minutes\n`;
        report += `- Avg Quality: ${workflowStats?.avgQuality?.toFixed(1)}%\n\n`;
        report += '## Daily Metrics\n';
        report += `- Workflows: ${usage.daily.workflows}\n`;
        report += `- Success Rate: ${usage.daily.successRate.toFixed(1)}%\n`;
        report += `- Avg Duration: ${(usage.daily.avgDuration / 1000 / 60).toFixed(1)} minutes\n`;
        report += `- Top Platforms: ${usage.daily.topPlatforms.join(', ')}\n\n`;
        report += '## Weekly Metrics\n';
        report += `- Workflows: ${usage.weekly.workflows}\n`;
        report += `- Success Rate: ${usage.weekly.successRate.toFixed(1)}%\n`;
        report += `- Avg Quality: ${usage.weekly.avgQuality.toFixed(1)}%\n`;
        report += `- Peak Hours: ${usage.weekly.peakHours.join(', ')}\n\n`;
        report += '## Agent Performance\n';
        if (agentStats) {
            report += `- Executions: ${agentStats.count}\n`;
            report += `- Avg Execution Time: ${(agentStats.avgExecutionTime / 1000).toFixed(1)}s\n`;
            report += `- Avg Quality Score: ${agentStats.avgQualityScore.toFixed(1)}%\n`;
            report += `- P95 Execution Time: ${(agentStats.p95ExecutionTime / 1000).toFixed(1)}s\n\n`;
        }
        report += '## Recommendations\n';
        report += this.generateRecommendations();
        return report;
    }
    /**
     * Export metrics to file
     */
    exportMetrics(format = 'json') {
        const filename = `analytics-export-${Date.now()}.${format}`;
        const filepath = path.join(this.dataDir, filename);
        if (format === 'json') {
            const data = {
                metrics: this.metrics,
                agentMetrics: this.agentMetrics,
                workflowMetrics: this.workflowMetrics,
                exported: new Date()
            };
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        }
        else {
            // CSV export
            let csv = 'timestamp,metric,value,tags\n';
            for (const metric of this.metrics) {
                csv += `${metric.timestamp.toISOString()},${metric.name},${metric.value},"${JSON.stringify(metric.tags || {})}"\n`;
            }
            fs.writeFileSync(filepath, csv);
        }
        return filepath;
    }
    // Private helper methods
    average(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    percentile(values, p) {
        if (values.length === 0)
            return 0;
        const sorted = values.sort((a, b) => a - b);
        const index = Math.ceil((p / 100) * sorted.length) - 1;
        return sorted[index];
    }
    calculateSuccessRate(workflows) {
        if (workflows.length === 0)
            return 0;
        return (workflows.filter(w => w.success).length / workflows.length) * 100;
    }
    calculateAvgQuality(workflows) {
        if (workflows.length === 0)
            return 0;
        const allScores = [];
        workflows.forEach(w => {
            Object.values(w.qualityScores).forEach(score => {
                allScores.push(score);
            });
        });
        return this.average(allScores);
    }
    getTopPlatforms(workflows) {
        const platformCounts = {};
        workflows.forEach(w => {
            w.platforms.forEach(p => {
                platformCounts[p] = (platformCounts[p] || 0) + 1;
            });
        });
        return Object.entries(platformCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([platform]) => platform);
    }
    calculatePeakHours(workflows) {
        const hourCounts = {};
        workflows.forEach(w => {
            const hour = new Date(w.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        return Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));
    }
    calculateTotalContent(workflows) {
        return workflows.reduce((total, w) => {
            return total + (w.platforms.length * (w.success ? 1 : 0));
        }, 0);
    }
    calculateAvgEngagement(workflows) {
        // Simulated engagement calculation based on quality scores
        return this.calculateAvgQuality(workflows) * 1.2; // Simplified
    }
    calculateImprovements(workflows) {
        // Calculate quality improvement over time
        if (workflows.length < 2)
            return 0;
        const firstHalf = workflows.slice(0, Math.floor(workflows.length / 2));
        const secondHalf = workflows.slice(Math.floor(workflows.length / 2));
        const firstAvg = this.calculateAvgQuality(firstHalf);
        const secondAvg = this.calculateAvgQuality(secondHalf);
        return ((secondAvg - firstAvg) / firstAvg) * 100;
    }
    groupByPeriod(metrics, period) {
        const groups = {};
        metrics.forEach(m => {
            const date = new Date(m.timestamp);
            let key;
            switch (period) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
                default:
                    key = date.toISOString().split('T')[0];
            }
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(m);
        });
        return groups;
    }
    generateRecommendations() {
        const usage = this.getUsageMetrics();
        const recommendations = [];
        if (usage.daily.successRate < 80) {
            recommendations.push('- Consider using Standard Mode for better quality');
        }
        if (usage.daily.avgDuration > 3600000) {
            recommendations.push('- Optimize workflow performance to reduce duration');
        }
        if (usage.weekly.avgQuality < 75) {
            recommendations.push('- Review content quality settings and refinement iterations');
        }
        if (usage.monthly.improvements < 0) {
            recommendations.push('- Quality scores are declining; review recent changes');
        }
        return recommendations.length > 0 ? recommendations.join('\n') : '- System performing optimally';
    }
    loadMetrics() {
        const metricsFile = path.join(this.dataDir, 'metrics.json');
        if (fs.existsSync(metricsFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
                this.metrics = data.metrics || [];
                this.agentMetrics = data.agentMetrics || [];
                this.workflowMetrics = data.workflowMetrics || [];
            }
            catch (error) {
                console.error('Failed to load metrics:', error);
            }
        }
    }
    flushToDisk() {
        const metricsFile = path.join(this.dataDir, 'metrics.json');
        const data = {
            metrics: this.metrics.slice(-10000),
            agentMetrics: this.agentMetrics.slice(-5000),
            workflowMetrics: this.workflowMetrics.slice(-1000),
            lastFlush: new Date()
        };
        fs.writeFileSync(metricsFile, JSON.stringify(data));
    }
    aggregateMetrics() {
        // Aggregate hourly metrics
        const hourAgo = new Date(Date.now() - 3600000);
        const recentMetrics = this.metrics.filter(m => m.timestamp > hourAgo);
        if (recentMetrics.length > 0) {
            const aggregated = {
                hour: new Date().getHours(),
                count: recentMetrics.length,
                timestamp: new Date()
            };
            this.emit('metrics:aggregated', aggregated);
        }
    }
    /**
     * Cleanup
     */
    destroy() {
        clearInterval(this.flushInterval);
        clearInterval(this.aggregationInterval);
        this.flushToDisk();
    }
}
exports.AnalyticsService = AnalyticsService;
// Singleton instance
let analyticsInstance = null;
function getAnalyticsService(dataDir) {
    if (!analyticsInstance) {
        analyticsInstance = new AnalyticsService(dataDir);
    }
    return analyticsInstance;
}
exports.getAnalyticsService = getAnalyticsService;
exports.default = AnalyticsService;
//# sourceMappingURL=analytics-service.js.map