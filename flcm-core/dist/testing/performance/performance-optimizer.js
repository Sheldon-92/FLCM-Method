"use strict";
/**
 * FLCM 2.0 Performance Optimization System
 * Advanced performance monitoring, optimization, and caching
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPerformanceTracking = exports.performanceOptimizer = exports.PerformanceOptimizer = void 0;
const events_1 = require("events");
const logger_1 = require("../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('PerformanceOptimizer');
/**
 * Advanced caching system with LRU and compression
 */
class AdvancedCache {
    constructor(config) {
        this.cache = new Map();
        this.config = config;
        this.startCleanupTimer();
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            logger.debug(`Cache miss for key: ${key}`);
            return null;
        }
        // Check TTL
        const now = new Date();
        if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
            this.cache.delete(key);
            logger.debug(`Cache expired for key: ${key}`);
            return null;
        }
        // Update access statistics
        entry.accessCount++;
        entry.lastAccess = now;
        logger.debug(`Cache hit for key: ${key}, access count: ${entry.accessCount}`);
        return entry.value;
    }
    async set(key, value, ttl) {
        const now = new Date();
        const effectiveTTL = ttl || this.config.defaultTTL;
        // Calculate approximate size
        const size = this.calculateSize(value);
        // Check if we need to evict entries
        if (this.cache.size >= this.config.maxSize) {
            this.evictLRU();
        }
        const entry = {
            key,
            value,
            timestamp: now,
            ttl: effectiveTTL,
            accessCount: 0,
            lastAccess: now,
            size
        };
        this.cache.set(key, entry);
        logger.debug(`Cache set for key: ${key}, size: ${size} bytes`);
    }
    async invalidate(pattern) {
        if (!pattern) {
            const size = this.cache.size;
            this.cache.clear();
            logger.info(`Cache cleared, ${size} entries removed`);
            return size;
        }
        const regex = new RegExp(pattern);
        let removedCount = 0;
        for (const [key] of this.cache) {
            if (regex.test(key)) {
                this.cache.delete(key);
                removedCount++;
            }
        }
        logger.info(`Cache invalidated ${removedCount} entries matching pattern: ${pattern}`);
        return removedCount;
    }
    getStats() {
        let totalAccess = 0;
        let totalHits = 0;
        let totalSize = 0;
        let oldestEntry = null;
        let newestEntry = null;
        for (const entry of this.cache.values()) {
            totalAccess += entry.accessCount + 1; // +1 for initial set
            totalHits += entry.accessCount;
            totalSize += entry.size;
            if (!oldestEntry || entry.timestamp < oldestEntry) {
                oldestEntry = entry.timestamp;
            }
            if (!newestEntry || entry.timestamp > newestEntry) {
                newestEntry = entry.timestamp;
            }
        }
        return {
            size: this.cache.size,
            hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
            totalSize,
            oldestEntry,
            newestEntry
        };
    }
    evictLRU() {
        let lruKey = null;
        let lruTime = null;
        for (const [key, entry] of this.cache) {
            if (!lruTime || entry.lastAccess < lruTime) {
                lruTime = entry.lastAccess;
                lruKey = key;
            }
        }
        if (lruKey) {
            this.cache.delete(lruKey);
            logger.debug(`Evicted LRU entry: ${lruKey}`);
        }
    }
    calculateSize(value) {
        // Rough size calculation
        return JSON.stringify(value).length * 2; // Assume 2 bytes per character
    }
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    cleanup() {
        const now = new Date();
        let removedCount = 0;
        for (const [key, entry] of this.cache) {
            if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
                this.cache.delete(key);
                removedCount++;
            }
        }
        if (removedCount > 0) {
            logger.debug(`Cleanup removed ${removedCount} expired cache entries`);
        }
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.cache.clear();
    }
}
/**
 * Performance monitoring and optimization system
 */
class PerformanceOptimizer extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.metrics = [];
        this.activeOperations = new Map();
        this.config = {
            cache: {
                maxSize: 1000,
                defaultTTL: 30 * 60 * 1000,
                cleanupInterval: 5 * 60 * 1000,
                compressionEnabled: true,
                ...(config?.cache || {})
            },
            monitoring: {
                sampleRate: 1.0,
                alertThreshold: {
                    memory: 500 * 1024 * 1024,
                    cpu: 80,
                    duration: 30000 // 30 seconds
                },
                retentionDays: 7,
                ...(config?.monitoring || {})
            },
            optimization: {
                batchSize: 10,
                concurrencyLimit: 5,
                timeoutMs: 60000,
                retryAttempts: 3,
                ...(config?.optimization || {})
            }
        };
        this.cache = new AdvancedCache(this.config.cache);
        this.startPerformanceMonitoring();
    }
    /**
     * Start performance monitoring for an operation
     */
    startOperation(operationId, operation) {
        this.activeOperations.set(operationId, {
            start: new Date(),
            operation
        });
        logger.debug(`Started tracking operation: ${operationId} (${operation})`);
    }
    /**
     * End performance monitoring for an operation
     */
    endOperation(operationId, status, metadata) {
        const activeOp = this.activeOperations.get(operationId);
        if (!activeOp) {
            logger.warn(`No active operation found for ID: ${operationId}`);
            return null;
        }
        const now = new Date();
        const duration = now.getTime() - activeOp.start.getTime();
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const metric = {
            timestamp: now,
            operation: activeOp.operation,
            duration,
            memoryUsage: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external
            },
            cpuUsage: {
                user: cpuUsage.user / 1000000,
                system: cpuUsage.system / 1000000
            },
            status,
            metadata
        };
        this.metrics.push(metric);
        this.activeOperations.delete(operationId);
        // Check for performance alerts
        this.checkPerformanceAlerts(metric);
        // Sample-based logging
        if (Math.random() < this.config.monitoring.sampleRate) {
            logger.info(`Operation completed: ${activeOp.operation}, duration: ${duration}ms, status: ${status}`);
        }
        // Clean up old metrics
        this.cleanupOldMetrics();
        return metric;
    }
    /**
     * Execute function with performance tracking
     */
    async withTracking(operation, fn, options) {
        const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        // Check cache first if enabled
        if (options?.cache && options?.cacheKey) {
            const cached = await this.cache.get(options.cacheKey);
            if (cached !== null) {
                logger.debug(`Cache hit for operation: ${operation}`);
                return cached;
            }
        }
        this.startOperation(operationId, operation);
        try {
            let result;
            if (options?.timeout) {
                result = await this.withTimeout(fn, options.timeout);
            }
            else {
                result = await fn();
            }
            // Cache result if enabled
            if (options?.cache && options?.cacheKey) {
                await this.cache.set(options.cacheKey, result, options.cacheTTL);
            }
            this.endOperation(operationId, 'success', { cached: false });
            return result;
        }
        catch (error) {
            const status = error.message?.includes('timeout') ? 'timeout' : 'error';
            this.endOperation(operationId, status, { error: error.message });
            throw error;
        }
    }
    /**
     * Batch processing with performance optimization
     */
    async processBatch(items, processor, options) {
        const batchSize = options?.batchSize || this.config.optimization.batchSize;
        const concurrency = options?.concurrency || this.config.optimization.concurrencyLimit;
        logger.info(`Processing ${items.length} items in batches of ${batchSize} with concurrency ${concurrency}`);
        const results = [];
        const batches = this.chunkArray(items, batchSize);
        for (let i = 0; i < batches.length; i += concurrency) {
            const concurrentBatches = batches.slice(i, i + concurrency);
            const batchPromises = concurrentBatches.map(async (batch, batchIndex) => {
                const actualBatchIndex = i + batchIndex;
                return this.withTracking(`batch-${actualBatchIndex}`, async () => {
                    const batchResults = [];
                    for (const item of batch) {
                        const result = await processor(item);
                        batchResults.push(result);
                    }
                    return batchResults;
                });
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.flat());
            if (options?.onProgress) {
                options.onProgress(results.length, items.length);
            }
        }
        return results;
    }
    /**
     * Get performance recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        if (this.metrics.length === 0) {
            return recommendations;
        }
        const recent = this.getRecentMetrics(60 * 60 * 1000); // Last hour
        const avgDuration = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
        const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recent.length;
        const errorRate = recent.filter(m => m.status === 'error').length / recent.length;
        // Duration-based recommendations
        if (avgDuration > 10000) { // > 10 seconds
            recommendations.push({
                type: 'cache',
                priority: 'high',
                description: 'High average operation duration detected. Consider implementing caching.',
                expectedImprovement: 0.6,
                implementation: 'Enable caching for expensive operations',
                effort: 'medium'
            });
        }
        // Memory-based recommendations
        if (avgMemory > this.config.monitoring.alertThreshold.memory) {
            recommendations.push({
                type: 'memory',
                priority: 'critical',
                description: 'High memory usage detected. Consider memory optimization.',
                expectedImprovement: 0.4,
                implementation: 'Implement streaming processing and garbage collection optimization',
                effort: 'high'
            });
        }
        // Error rate recommendations
        if (errorRate > 0.05) { // > 5% error rate
            recommendations.push({
                type: 'algorithm',
                priority: 'high',
                description: 'High error rate detected. Consider improving error handling.',
                expectedImprovement: 0.8,
                implementation: 'Enhance retry logic and input validation',
                effort: 'medium'
            });
        }
        // Batching recommendations
        const operationCounts = this.getOperationCounts();
        const highVolumeOps = Object.entries(operationCounts).filter(([, count]) => count > 50);
        if (highVolumeOps.length > 0) {
            recommendations.push({
                type: 'batch',
                priority: 'medium',
                description: 'High volume operations detected. Consider batch processing.',
                expectedImprovement: 0.3,
                implementation: 'Implement batch processing for high-volume operations',
                effort: 'low'
            });
        }
        return recommendations;
    }
    /**
     * Get comprehensive performance statistics
     */
    getPerformanceStats() {
        if (this.metrics.length === 0) {
            return {
                operations: { total: 0, success: 0, error: 0, timeout: 0 },
                timing: { avgDuration: 0, p50Duration: 0, p95Duration: 0, p99Duration: 0 },
                resources: { avgMemory: 0, peakMemory: 0, avgCPU: 0, peakCPU: 0 },
                cache: { hitRate: 0, size: 0, totalSize: 0 }
            };
        }
        const operations = {
            total: this.metrics.length,
            success: this.metrics.filter(m => m.status === 'success').length,
            error: this.metrics.filter(m => m.status === 'error').length,
            timeout: this.metrics.filter(m => m.status === 'timeout').length
        };
        const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b);
        const timing = {
            avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            p50Duration: durations[Math.floor(durations.length * 0.5)],
            p95Duration: durations[Math.floor(durations.length * 0.95)],
            p99Duration: durations[Math.floor(durations.length * 0.99)]
        };
        const memoryValues = this.metrics.map(m => m.memoryUsage.heapUsed);
        const cpuValues = this.metrics.map(m => m.cpuUsage.user + m.cpuUsage.system);
        const resources = {
            avgMemory: memoryValues.reduce((sum, m) => sum + m, 0) / memoryValues.length,
            peakMemory: Math.max(...memoryValues),
            avgCPU: cpuValues.reduce((sum, c) => sum + c, 0) / cpuValues.length,
            peakCPU: Math.max(...cpuValues)
        };
        const cacheStats = this.cache.getStats();
        return {
            operations,
            timing,
            resources,
            cache: cacheStats
        };
    }
    /**
     * Clear performance data and reset
     */
    reset() {
        this.metrics = [];
        this.activeOperations.clear();
        this.cache.invalidate();
        logger.info('Performance optimizer reset completed');
    }
    /**
     * Destroy optimizer and cleanup resources
     */
    destroy() {
        this.cache.destroy();
        this.removeAllListeners();
        this.reset();
    }
    // Private helper methods
    async withTimeout(fn, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Operation timeout after ${timeoutMs}ms`));
            }, timeoutMs);
            fn()
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
    startPerformanceMonitoring() {
        // Monitor system performance every minute
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            this.emit('system-metrics', {
                memory: memUsage,
                cpu: cpuUsage,
                timestamp: new Date()
            });
        }, 60000);
    }
    checkPerformanceAlerts(metric) {
        const alerts = [];
        if (metric.duration > this.config.monitoring.alertThreshold.duration) {
            alerts.push(`High duration: ${metric.duration}ms for operation ${metric.operation}`);
        }
        if (metric.memoryUsage.heapUsed > this.config.monitoring.alertThreshold.memory) {
            alerts.push(`High memory usage: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }
        if (alerts.length > 0) {
            this.emit('performance-alert', {
                metric,
                alerts,
                timestamp: new Date()
            });
        }
    }
    getRecentMetrics(timeWindowMs) {
        const cutoff = new Date(Date.now() - timeWindowMs);
        return this.metrics.filter(m => m.timestamp >= cutoff);
    }
    getOperationCounts() {
        const counts = {};
        for (const metric of this.metrics) {
            counts[metric.operation] = (counts[metric.operation] || 0) + 1;
        }
        return counts;
    }
    cleanupOldMetrics() {
        const cutoff = new Date(Date.now() - (this.config.monitoring.retentionDays * 24 * 60 * 60 * 1000));
        const originalLength = this.metrics.length;
        this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
        const removed = originalLength - this.metrics.length;
        if (removed > 0) {
            logger.debug(`Cleaned up ${removed} old performance metrics`);
        }
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
// Export singleton instance
exports.performanceOptimizer = new PerformanceOptimizer();
// Performance monitoring decorator
function withPerformanceTracking(operation) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            return exports.performanceOptimizer.withTracking(`${target.constructor.name}.${propertyName}`, async () => method.apply(this, args));
        };
        return descriptor;
    };
}
exports.withPerformanceTracking = withPerformanceTracking;
//# sourceMappingURL=performance-optimizer.js.map