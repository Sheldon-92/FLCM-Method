"use strict";
/**
 * Metrics Collector
 * Collects and aggregates feature flag usage metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
const logger_1 = require("../shared/utils/logger");
const events_1 = require("events");
class MetricsCollector extends events_1.EventEmitter {
    constructor() {
        super();
        this.flushInterval = 60000; // 1 minute
        this.maxSamplesPerFlag = 1000;
        this.logger = new logger_1.Logger('MetricsCollector');
        this.metrics = new Map();
        // Start periodic flush
        this.startPeriodicFlush();
    }
    /**
     * Track feature flag usage
     */
    trackUsage(flagName, userId, enabled) {
        const metric = this.getOrCreateMetric(flagName);
        metric.usage_count++;
        if (enabled) {
            metric.enabled_count++;
        }
        else {
            metric.disabled_count++;
        }
        metric.unique_users.add(userId);
        metric.last_updated = new Date();
        this.logger.debug(`Usage tracked for ${flagName}`, {
            userId,
            enabled,
            total: metric.usage_count
        });
    }
    /**
     * Track performance impact
     */
    trackPerformance(flagName, duration, userId) {
        const metric = this.getOrCreateMetric(flagName);
        const sample = {
            timestamp: new Date(),
            duration,
            user_id: userId || 'anonymous',
            success: true
        };
        metric.performance_samples.push(sample);
        // Maintain sample size limit
        if (metric.performance_samples.length > this.maxSamplesPerFlag) {
            metric.performance_samples = metric.performance_samples.slice(-this.maxSamplesPerFlag);
        }
        metric.last_updated = new Date();
    }
    /**
     * Track error
     */
    trackError(flagName, userId) {
        const metric = this.getOrCreateMetric(flagName);
        metric.error_count++;
        // Add failed performance sample
        const sample = {
            timestamp: new Date(),
            duration: 0,
            user_id: userId || 'anonymous',
            success: false
        };
        metric.performance_samples.push(sample);
        // Update error rate
        this.updateErrorRate(metric);
        metric.last_updated = new Date();
        this.logger.debug(`Error tracked for ${flagName}`, {
            errorCount: metric.error_count,
            errorRate: metric.error_rate
        });
    }
    /**
     * Get or create metric
     */
    getOrCreateMetric(flagName) {
        let metric = this.metrics.get(flagName);
        if (!metric) {
            metric = {
                flag_name: flagName,
                usage_count: 0,
                enabled_count: 0,
                disabled_count: 0,
                error_count: 0,
                unique_users: new Set(),
                performance_samples: [],
                error_rate: 0,
                last_updated: new Date()
            };
            this.metrics.set(flagName, metric);
        }
        return metric;
    }
    /**
     * Update error rate
     */
    updateErrorRate(metric) {
        if (metric.usage_count === 0) {
            metric.error_rate = 0;
        }
        else {
            metric.error_rate = metric.error_count / metric.usage_count;
        }
    }
    /**
     * Get usage metrics for a flag
     */
    getUsageMetrics(flagName) {
        const metric = this.metrics.get(flagName);
        if (!metric) {
            return null;
        }
        return {
            total_usage: metric.usage_count,
            enabled_count: metric.enabled_count,
            disabled_count: metric.disabled_count,
            unique_users: metric.unique_users.size,
            adoption_rate: metric.usage_count > 0
                ? metric.enabled_count / metric.usage_count
                : 0,
            last_updated: metric.last_updated
        };
    }
    /**
     * Get performance metrics for a flag
     */
    getPerformanceMetrics(flagName) {
        const metric = this.metrics.get(flagName);
        if (!metric || metric.performance_samples.length === 0) {
            return null;
        }
        const samples = metric.performance_samples;
        const durations = samples
            .filter(s => s.success)
            .map(s => s.duration);
        if (durations.length === 0) {
            return {
                sample_count: 0,
                error_rate: 1
            };
        }
        return {
            sample_count: samples.length,
            avg_duration: this.average(durations),
            min_duration: Math.min(...durations),
            max_duration: Math.max(...durations),
            p50_duration: this.percentile(durations, 50),
            p95_duration: this.percentile(durations, 95),
            p99_duration: this.percentile(durations, 99),
            error_rate: metric.error_rate,
            error_count: metric.error_count
        };
    }
    /**
     * Get all metrics
     */
    getAllMetrics() {
        const allMetrics = new Map();
        for (const [name, metric] of this.metrics.entries()) {
            allMetrics.set(name, {
                usage: this.getUsageMetrics(name),
                performance: this.getPerformanceMetrics(name)
            });
        }
        return allMetrics;
    }
    /**
     * Get aggregated statistics
     */
    getAggregatedStats() {
        const stats = {
            total_flags: this.metrics.size,
            total_usage: 0,
            total_unique_users: new Set(),
            total_errors: 0,
            avg_adoption_rate: 0,
            flags_with_errors: 0
        };
        const adoptionRates = [];
        for (const metric of this.metrics.values()) {
            stats.total_usage += metric.usage_count;
            stats.total_errors += metric.error_count;
            // Merge unique users
            metric.unique_users.forEach(userId => {
                stats.total_unique_users.add(userId);
            });
            // Calculate adoption rate
            if (metric.usage_count > 0) {
                adoptionRates.push(metric.enabled_count / metric.usage_count);
            }
            // Count flags with errors
            if (metric.error_count > 0) {
                stats.flags_with_errors++;
            }
        }
        // Calculate average adoption rate
        if (adoptionRates.length > 0) {
            stats.avg_adoption_rate = this.average(adoptionRates);
        }
        return {
            ...stats,
            total_unique_users: stats.total_unique_users.size
        };
    }
    /**
     * Get metrics summary for reporting
     */
    getMetricsSummary() {
        const summary = {
            timestamp: new Date(),
            flags: {}
        };
        for (const [name, metric] of this.metrics.entries()) {
            summary.flags[name] = {
                usage_count: metric.usage_count,
                enabled_count: metric.enabled_count,
                unique_users: metric.unique_users.size,
                error_rate: metric.error_rate,
                avg_performance: this.getAveragePerformance(metric)
            };
        }
        summary.aggregated = this.getAggregatedStats();
        return summary;
    }
    /**
     * Get average performance for a metric
     */
    getAveragePerformance(metric) {
        const durations = metric.performance_samples
            .filter(s => s.success)
            .map(s => s.duration);
        if (durations.length === 0) {
            return null;
        }
        return this.average(durations);
    }
    /**
     * Calculate average
     */
    average(values) {
        if (values.length === 0)
            return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    /**
     * Calculate percentile
     */
    percentile(values, percentile) {
        if (values.length === 0)
            return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.floor((percentile / 100) * sorted.length);
        return sorted[Math.min(index, sorted.length - 1)];
    }
    /**
     * Start periodic flush of metrics
     */
    startPeriodicFlush() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }
    /**
     * Flush metrics (emit for external processing)
     */
    flush() {
        const summary = this.getMetricsSummary();
        this.emit('metrics-flush', summary);
        this.logger.debug('Metrics flushed', {
            flagCount: this.metrics.size,
            totalUsage: summary.aggregated.total_usage
        });
    }
    /**
     * Reset metrics for a flag
     */
    resetMetrics(flagName) {
        this.metrics.delete(flagName);
        this.logger.info(`Metrics reset for ${flagName}`);
    }
    /**
     * Reset all metrics
     */
    resetAll() {
        this.metrics.clear();
        this.logger.info('All metrics reset');
    }
    /**
     * Export metrics for persistence
     */
    exportMetrics() {
        const exported = {};
        for (const [name, metric] of this.metrics.entries()) {
            exported[name] = {
                usage_count: metric.usage_count,
                enabled_count: metric.enabled_count,
                disabled_count: metric.disabled_count,
                error_count: metric.error_count,
                unique_users: Array.from(metric.unique_users),
                error_rate: metric.error_rate,
                performance_samples: metric.performance_samples.slice(-100),
                last_updated: metric.last_updated.toISOString()
            };
        }
        return exported;
    }
    /**
     * Import metrics from persistence
     */
    importMetrics(data) {
        try {
            Object.entries(data).forEach(([name, metricData]) => {
                const metric = {
                    flag_name: name,
                    usage_count: metricData.usage_count || 0,
                    enabled_count: metricData.enabled_count || 0,
                    disabled_count: metricData.disabled_count || 0,
                    error_count: metricData.error_count || 0,
                    unique_users: new Set(metricData.unique_users || []),
                    performance_samples: metricData.performance_samples || [],
                    error_rate: metricData.error_rate || 0,
                    last_updated: new Date(metricData.last_updated || Date.now())
                };
                this.metrics.set(name, metric);
            });
            this.logger.info(`Imported metrics for ${Object.keys(data).length} flags`);
        }
        catch (error) {
            this.logger.error('Failed to import metrics', { error });
        }
    }
    /**
     * Shutdown collector
     */
    shutdown() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        // Final flush
        this.flush();
        this.removeAllListeners();
        this.logger.info('Metrics collector shutdown');
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metrics-collector.js.map