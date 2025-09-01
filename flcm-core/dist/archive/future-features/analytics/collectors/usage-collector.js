"use strict";
/**
 * Usage Collector
 * Tracks usage metrics for both 1.0 and 2.0 versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageCollector = void 0;
const logger_1 = require("../../shared/utils/logger");
class UsageCollector {
    constructor() {
        this.name = 'usage';
        this.usageData = new Map();
        this.logger = new logger_1.Logger('UsageCollector');
        this.initializeVersions();
    }
    /**
     * Initialize usage tracking for both versions
     */
    initializeVersions() {
        this.usageData.set('1.0', {
            version: '1.0',
            requests: 0,
            unique_users: new Set(),
            operations: new Map(),
            timestamp: new Date()
        });
        this.usageData.set('2.0', {
            version: '2.0',
            requests: 0,
            unique_users: new Set(),
            operations: new Map(),
            timestamp: new Date()
        });
    }
    /**
     * Track a user request
     */
    trackRequest(version, userId, operation) {
        const data = this.usageData.get(version);
        if (!data)
            return;
        data.requests++;
        data.unique_users.add(userId);
        const opCount = data.operations.get(operation) || 0;
        data.operations.set(operation, opCount + 1);
        data.timestamp = new Date();
    }
    /**
     * Collect usage metrics
     */
    async collect() {
        const metrics = {};
        // Collect v1 metrics
        const v1Data = this.usageData.get('1.0');
        if (v1Data) {
            metrics.v1_requests = v1Data.requests;
            metrics.v1_unique_users = v1Data.unique_users.size;
            metrics.v1_operations = Object.fromEntries(v1Data.operations);
            // Top operations for v1
            const v1TopOps = this.getTopOperations(v1Data.operations);
            metrics.v1_top_operations = v1TopOps;
        }
        // Collect v2 metrics
        const v2Data = this.usageData.get('2.0');
        if (v2Data) {
            metrics.v2_requests = v2Data.requests;
            metrics.v2_unique_users = v2Data.unique_users.size;
            metrics.v2_operations = Object.fromEntries(v2Data.operations);
            // Top operations for v2
            const v2TopOps = this.getTopOperations(v2Data.operations);
            metrics.v2_top_operations = v2TopOps;
        }
        // Calculate adoption metrics
        const totalUsers = (v1Data?.unique_users.size || 0) + (v2Data?.unique_users.size || 0);
        const v2Users = v2Data?.unique_users.size || 0;
        metrics.adoption_rate = totalUsers > 0 ? v2Users / totalUsers : 0;
        metrics.total_unique_users = totalUsers;
        // Calculate overlap (users using both versions)
        const overlap = this.calculateUserOverlap();
        metrics.users_on_both = overlap;
        // Request distribution
        const totalRequests = (v1Data?.requests || 0) + (v2Data?.requests || 0);
        metrics.v1_request_ratio = totalRequests > 0 ? (v1Data?.requests || 0) / totalRequests : 0;
        metrics.v2_request_ratio = totalRequests > 0 ? (v2Data?.requests || 0) / totalRequests : 0;
        this.logger.debug('Usage metrics collected', {
            v1_users: v1Data?.unique_users.size,
            v2_users: v2Data?.unique_users.size,
            adoption_rate: metrics.adoption_rate
        });
        return metrics;
    }
    /**
     * Get top N operations by usage
     */
    getTopOperations(operations, limit = 5) {
        const sorted = Array.from(operations.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([op, count]) => ({ op, count }));
        return sorted;
    }
    /**
     * Calculate how many users are using both versions
     */
    calculateUserOverlap() {
        const v1Users = this.usageData.get('1.0')?.unique_users || new Set();
        const v2Users = this.usageData.get('2.0')?.unique_users || new Set();
        let overlap = 0;
        for (const user of v1Users) {
            if (v2Users.has(user)) {
                overlap++;
            }
        }
        return overlap;
    }
    /**
     * Reset collector
     */
    reset() {
        this.initializeVersions();
        this.logger.info('Usage collector reset');
    }
    /**
     * Get usage summary
     */
    getSummary() {
        const v1Data = this.usageData.get('1.0');
        const v2Data = this.usageData.get('2.0');
        return {
            v1: {
                requests: v1Data?.requests || 0,
                users: v1Data?.unique_users.size || 0,
                operations: v1Data?.operations.size || 0
            },
            v2: {
                requests: v2Data?.requests || 0,
                users: v2Data?.unique_users.size || 0,
                operations: v2Data?.operations.size || 0
            },
            overlap: this.calculateUserOverlap()
        };
    }
    /**
     * Export metrics for analysis
     */
    exportMetrics() {
        return Array.from(this.usageData.values());
    }
}
exports.UsageCollector = UsageCollector;
//# sourceMappingURL=usage-collector.js.map