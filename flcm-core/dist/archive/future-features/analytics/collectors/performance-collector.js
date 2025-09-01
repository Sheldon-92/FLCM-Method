"use strict";
/**
 * Performance Collector
 * Tracks performance metrics for operations in both versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceCollector = void 0;
const logger_1 = require("../../shared/utils/logger");
class PerformanceCollector {
    constructor() {
        this.name = 'performance';
        this.maxSamples = 1000; // Keep last 1000 samples per operation
        this.metrics = new Map();
        this.timings = new Map();
        this.logger = new logger_1.Logger('PerformanceCollector');
    }
    /**
     * Track operation performance
     */
    trackOperation(version, operation, duration, metadata) {
        const key = `${version}:${operation}`;
        // Store raw timing
        if (!this.timings.has(key)) {
            this.timings.set(key, []);
        }
        const timingArray = this.timings.get(key);
        timingArray.push(duration);
        // Keep only last N samples
        if (timingArray.length > this.maxSamples) {
            timingArray.shift();
        }
        // Update metrics
        this.updateMetrics(version, operation);
        this.logger.debug(`Performance tracked: ${key}`, {
            duration,
            samples: timingArray.length
        });
    }
    /**
     * Update performance metrics for an operation
     */
    updateMetrics(version, operation) {
        const key = `${version}:${operation}`;
        const timings = this.timings.get(key);
        if (!timings || timings.length === 0)
            return;
        // Sort for percentile calculation
        const sorted = [...timings].sort((a, b) => a - b);
        const metrics = {
            version,
            operation,
            p50: this.calculatePercentile(sorted, 50),
            p95: this.calculatePercentile(sorted, 95),
            p99: this.calculatePercentile(sorted, 99),
            avg: this.calculateAverage(timings),
            min: sorted[0],
            max: sorted[sorted.length - 1],
            sample_count: timings.length,
            timestamp: new Date()
        };
        // Store metrics
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        this.metrics.get(key).push(metrics);
    }
    /**
     * Calculate percentile
     */
    calculatePercentile(sorted, percentile) {
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }
    /**
     * Calculate average
     */
    calculateAverage(values) {
        if (values.length === 0)
            return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }
    /**
     * Collect performance metrics
     */
    async collect() {
        const metrics = {};
        const operationMetrics = new Map();
        // Process all operations
        for (const [key, timings] of this.timings.entries()) {
            const [version, operation] = key.split(':');
            if (timings.length === 0)
                continue;
            const sorted = [...timings].sort((a, b) => a - b);
            const opMetrics = {
                p50: this.calculatePercentile(sorted, 50),
                p95: this.calculatePercentile(sorted, 95),
                p99: this.calculatePercentile(sorted, 99),
                avg: this.calculateAverage(timings),
                min: sorted[0],
                max: sorted[sorted.length - 1],
                samples: timings.length
            };
            // Store by version and operation
            const versionKey = version === '1.0' ? 'v1' : 'v2';
            metrics[`${versionKey}_${operation}_p50`] = opMetrics.p50;
            metrics[`${versionKey}_${operation}_p95`] = opMetrics.p95;
            metrics[`${versionKey}_${operation}_p99`] = opMetrics.p99;
            metrics[`${versionKey}_${operation}_avg`] = opMetrics.avg;
            // Store for comparison
            if (!operationMetrics.has(operation)) {
                operationMetrics.set(operation, {});
            }
            operationMetrics.get(operation)[version] = opMetrics;
        }
        // Calculate comparisons
        for (const [operation, versions] of operationMetrics.entries()) {
            if (versions['1.0'] && versions['2.0']) {
                const v1Avg = versions['1.0'].avg;
                const v2Avg = versions['2.0'].avg;
                // Performance improvement (negative means v2 is slower)
                const improvement = ((v1Avg - v2Avg) / v1Avg) * 100;
                metrics[`comparison_${operation}_improvement`] = improvement;
                // Ratio
                metrics[`comparison_${operation}_ratio`] = v2Avg / v1Avg;
                // Is v2 slower?
                metrics[`${operation}_regression`] = v2Avg > v1Avg * 1.1; // 10% threshold
            }
        }
        // Overall metrics
        metrics.v1_operations = this.getOperationsList('1.0');
        metrics.v2_operations = this.getOperationsList('2.0');
        metrics.v1_avg = this.getOverallAverage('1.0');
        metrics.v2_avg = this.getOverallAverage('2.0');
        this.logger.debug('Performance metrics collected', {
            operations: operationMetrics.size,
            v1_avg: metrics.v1_avg,
            v2_avg: metrics.v2_avg
        });
        return metrics;
    }
    /**
     * Get list of operations for a version
     */
    getOperationsList(version) {
        const operations = new Set();
        for (const key of this.timings.keys()) {
            if (key.startsWith(`${version}:`)) {
                const [, operation] = key.split(':');
                operations.add(operation);
            }
        }
        return Array.from(operations);
    }
    /**
     * Get overall average for a version
     */
    getOverallAverage(version) {
        const allTimings = [];
        for (const [key, timings] of this.timings.entries()) {
            if (key.startsWith(`${version}:`)) {
                allTimings.push(...timings);
            }
        }
        return this.calculateAverage(allTimings);
    }
    /**
     * Get performance comparison
     */
    getComparison(operation) {
        const v1Key = `1.0:${operation}`;
        const v2Key = `2.0:${operation}`;
        const v1Timings = this.timings.get(v1Key) || [];
        const v2Timings = this.timings.get(v2Key) || [];
        if (v1Timings.length === 0 || v2Timings.length === 0) {
            return null;
        }
        const v1Avg = this.calculateAverage(v1Timings);
        const v2Avg = this.calculateAverage(v2Timings);
        return {
            operation,
            v1: {
                avg: v1Avg,
                samples: v1Timings.length
            },
            v2: {
                avg: v2Avg,
                samples: v2Timings.length
            },
            improvement: ((v1Avg - v2Avg) / v1Avg) * 100,
            ratio: v2Avg / v1Avg
        };
    }
    /**
     * Identify slow operations
     */
    getSlowOperations(threshold = 1000) {
        const slowOps = [];
        for (const [key, timings] of this.timings.entries()) {
            const avg = this.calculateAverage(timings);
            if (avg > threshold) {
                const [version, operation] = key.split(':');
                slowOps.push({
                    version,
                    operation,
                    avg,
                    p95: this.calculatePercentile([...timings].sort((a, b) => a - b), 95)
                });
            }
        }
        return slowOps.sort((a, b) => b.avg - a.avg);
    }
    /**
     * Reset collector
     */
    reset() {
        this.metrics.clear();
        this.timings.clear();
        this.logger.info('Performance collector reset');
    }
    /**
     * Get summary
     */
    getSummary() {
        const v1Ops = this.getOperationsList('1.0');
        const v2Ops = this.getOperationsList('2.0');
        return {
            v1: {
                operations: v1Ops.length,
                avg: this.getOverallAverage('1.0'),
                total_samples: this.getTotalSamples('1.0')
            },
            v2: {
                operations: v2Ops.length,
                avg: this.getOverallAverage('2.0'),
                total_samples: this.getTotalSamples('2.0')
            }
        };
    }
    /**
     * Get total samples for a version
     */
    getTotalSamples(version) {
        let total = 0;
        for (const [key, timings] of this.timings.entries()) {
            if (key.startsWith(`${version}:`)) {
                total += timings.length;
            }
        }
        return total;
    }
}
exports.PerformanceCollector = PerformanceCollector;
//# sourceMappingURL=performance-collector.js.map