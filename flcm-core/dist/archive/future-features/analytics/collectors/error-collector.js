"use strict";
/**
 * Error Collector
 * Tracks and analyzes errors for both versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCollector = void 0;
const logger_1 = require("../../shared/utils/logger");
class ErrorCollector {
    constructor() {
        this.name = 'errors';
        this.errors = new Map();
        this.errorPatterns = new Map();
        this.logger = new logger_1.Logger('ErrorCollector');
        this.initializeCategories();
        this.initializeVersions();
    }
    /**
     * Initialize error categories
     */
    initializeCategories() {
        this.errorCategories = new Map([
            ['syntax', /Syntax|Parse|Invalid|Unexpected token/i],
            ['runtime', /Runtime|Exception|Error|Failed/i],
            ['timeout', /Timeout|Deadline|Timed out/i],
            ['resource', /Memory|Disk|Resource|Out of/i],
            ['network', /Network|Connection|Socket|ECONNREFUSED/i],
            ['permission', /Permission|Access denied|Forbidden/i],
            ['validation', /Validation|Invalid input|Required/i]
        ]);
    }
    /**
     * Initialize error tracking for both versions
     */
    initializeVersions() {
        this.errors.set('1.0', {
            version: '1.0',
            total_errors: 0,
            error_rate: 0,
            errors_by_category: new Map(),
            error_patterns: [],
            timestamp: new Date()
        });
        this.errors.set('2.0', {
            version: '2.0',
            total_errors: 0,
            error_rate: 0,
            errors_by_category: new Map(),
            error_patterns: [],
            timestamp: new Date()
        });
    }
    /**
     * Track an error occurrence
     */
    trackError(version, error, userId, context) {
        const data = this.errors.get(version);
        if (!data)
            return;
        data.total_errors++;
        data.timestamp = new Date();
        // Categorize error
        const category = this.categorizeError(error);
        const categoryCount = data.errors_by_category.get(category) || 0;
        data.errors_by_category.set(category, categoryCount + 1);
        // Track error pattern
        this.trackErrorPattern(version, error, userId);
        // Log for debugging
        this.logger.debug(`Error tracked for ${version}`, {
            category,
            message: error.message,
            userId
        });
    }
    /**
     * Categorize an error
     */
    categorizeError(error) {
        const errorStr = `${error.name} ${error.message}`;
        for (const [category, pattern] of this.errorCategories.entries()) {
            if (pattern.test(errorStr)) {
                return category;
            }
        }
        return 'unknown';
    }
    /**
     * Track error patterns
     */
    trackErrorPattern(version, error, userId) {
        const patternKey = `${version}:${error.name}:${this.normalizeErrorMessage(error.message)}`;
        let pattern = this.errorPatterns.get(patternKey);
        if (!pattern) {
            pattern = {
                pattern: error.message,
                count: 0,
                first_seen: new Date(),
                last_seen: new Date(),
                affected_users: new Set()
            };
            this.errorPatterns.set(patternKey, pattern);
        }
        pattern.count++;
        pattern.last_seen = new Date();
        pattern.affected_users.add(userId);
        // Update patterns in version data
        const data = this.errors.get(version);
        if (data) {
            // Keep only top 10 patterns
            data.error_patterns = this.getTopPatterns(version, 10);
        }
    }
    /**
     * Normalize error message for pattern matching
     */
    normalizeErrorMessage(message) {
        return message
            .replace(/\d+/g, 'N') // Replace numbers with N
            .replace(/["'].*?["']/g, 'STR') // Replace strings with STR
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .substring(0, 100); // Limit length
    }
    /**
     * Get top error patterns for a version
     */
    getTopPatterns(version, limit) {
        const versionPatterns = [];
        for (const [key, pattern] of this.errorPatterns.entries()) {
            if (key.startsWith(`${version}:`)) {
                versionPatterns.push(pattern);
            }
        }
        return versionPatterns
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    /**
     * Calculate error rate
     */
    updateErrorRate(version, totalRequests) {
        const data = this.errors.get(version);
        if (!data || totalRequests === 0)
            return;
        data.error_rate = data.total_errors / totalRequests;
    }
    /**
     * Collect error metrics
     */
    async collect() {
        const metrics = {};
        // Collect v1 metrics
        const v1Data = this.errors.get('1.0');
        if (v1Data) {
            metrics.v1_total_errors = v1Data.total_errors;
            metrics.v1_error_rate = v1Data.error_rate;
            metrics.v1_errors_by_category = Object.fromEntries(v1Data.errors_by_category);
            metrics.v1_top_patterns = v1Data.error_patterns.slice(0, 5).map(p => ({
                pattern: p.pattern,
                count: p.count,
                affected_users: p.affected_users.size
            }));
        }
        // Collect v2 metrics
        const v2Data = this.errors.get('2.0');
        if (v2Data) {
            metrics.v2_total_errors = v2Data.total_errors;
            metrics.v2_error_rate = v2Data.error_rate;
            metrics.v2_errors_by_category = Object.fromEntries(v2Data.errors_by_category);
            metrics.v2_top_patterns = v2Data.error_patterns.slice(0, 5).map(p => ({
                pattern: p.pattern,
                count: p.count,
                affected_users: p.affected_users.size
            }));
        }
        // Calculate comparison metrics
        metrics.error_rate_diff = (v2Data?.error_rate || 0) - (v1Data?.error_rate || 0);
        metrics.total_errors = (v1Data?.total_errors || 0) + (v2Data?.total_errors || 0);
        // Identify new error patterns in v2
        metrics.new_v2_patterns = this.identifyNewPatterns();
        this.logger.debug('Error metrics collected', {
            v1_errors: v1Data?.total_errors,
            v2_errors: v2Data?.total_errors,
            rate_diff: metrics.error_rate_diff
        });
        return metrics;
    }
    /**
     * Identify error patterns unique to v2
     */
    identifyNewPatterns() {
        const v1Patterns = new Set();
        const v2Patterns = new Set();
        for (const [key, pattern] of this.errorPatterns.entries()) {
            const normalizedPattern = this.normalizeErrorMessage(pattern.pattern);
            if (key.startsWith('1.0:')) {
                v1Patterns.add(normalizedPattern);
            }
            else if (key.startsWith('2.0:')) {
                v2Patterns.add(normalizedPattern);
            }
        }
        const newPatterns = [];
        for (const pattern of v2Patterns) {
            if (!v1Patterns.has(pattern)) {
                newPatterns.push(pattern);
            }
        }
        return newPatterns.slice(0, 5); // Return top 5 new patterns
    }
    /**
     * Reset collector
     */
    reset() {
        this.initializeVersions();
        this.errorPatterns.clear();
        this.logger.info('Error collector reset');
    }
    /**
     * Get error summary
     */
    getSummary() {
        const v1Data = this.errors.get('1.0');
        const v2Data = this.errors.get('2.0');
        return {
            v1: {
                total: v1Data?.total_errors || 0,
                rate: v1Data?.error_rate || 0,
                categories: v1Data?.errors_by_category.size || 0
            },
            v2: {
                total: v2Data?.total_errors || 0,
                rate: v2Data?.error_rate || 0,
                categories: v2Data?.errors_by_category.size || 0
            },
            patterns: this.errorPatterns.size
        };
    }
    /**
     * Check if error rate exceeds threshold
     */
    isErrorRateHigh(version, threshold = 0.05) {
        const data = this.errors.get(version);
        return data ? data.error_rate > threshold : false;
    }
}
exports.ErrorCollector = ErrorCollector;
//# sourceMappingURL=error-collector.js.map