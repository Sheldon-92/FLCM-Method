"use strict";
/**
 * Health Check System
 * Monitors health of both FLCM versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthChecker = void 0;
const logger_1 = require("../utils/logger");
class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.logger = new logger_1.Logger('HealthChecker');
        this.startTime = new Date();
    }
    /**
     * Register a health check
     */
    registerCheck(name, check) {
        this.checks.set(name, check);
        this.logger.info(`Health check registered: ${name}`);
    }
    /**
     * Perform all health checks
     */
    async checkHealth() {
        const results = {
            overall: 'healthy',
            timestamp: new Date(),
            uptime: Date.now() - this.startTime.getTime(),
            versions: {},
            dependencies: []
        };
        // Run all checks in parallel
        const checkPromises = Array.from(this.checks.entries()).map(async ([name, check]) => {
            const startTime = Date.now();
            try {
                const result = await this.withTimeout(check(), 5000);
                result.responseTime = Date.now() - startTime;
                // Categorize results
                if (name.includes('v1') || name.includes('1.0')) {
                    results.versions['1.0'] = result;
                }
                else if (name.includes('v2') || name.includes('2.0')) {
                    results.versions['2.0'] = result;
                }
                else {
                    results.dependencies.push(result);
                }
                return result;
            }
            catch (error) {
                const errorResult = {
                    service: name,
                    status: 'unhealthy',
                    responseTime: Date.now() - startTime,
                    error: error.message
                };
                if (name.includes('v1') || name.includes('1.0')) {
                    results.versions['1.0'] = errorResult;
                }
                else if (name.includes('v2') || name.includes('2.0')) {
                    results.versions['2.0'] = errorResult;
                }
                else {
                    results.dependencies.push(errorResult);
                }
                return errorResult;
            }
        });
        const allResults = await Promise.all(checkPromises);
        // Determine overall status
        results.overall = this.calculateOverallStatus(allResults);
        return results;
    }
    /**
     * Check specific version health
     */
    async checkVersionHealth(version) {
        const checkName = `v${version}`;
        const check = this.checks.get(checkName);
        if (!check) {
            return {
                version,
                status: 'unhealthy',
                uptime: 0,
                lastCheck: new Date(),
                details: { error: 'Version check not registered' }
            };
        }
        try {
            const result = await this.withTimeout(check(), 5000);
            return {
                version,
                status: result.status,
                uptime: Date.now() - this.startTime.getTime(),
                lastCheck: new Date(),
                details: result.details
            };
        }
        catch (error) {
            return {
                version,
                status: 'unhealthy',
                uptime: Date.now() - this.startTime.getTime(),
                lastCheck: new Date(),
                details: { error: error.message }
            };
        }
    }
    /**
     * Create HTTP endpoint handler
     */
    async handleHealthEndpoint(path) {
        switch (path) {
            case '/health':
                return this.checkHealth();
            case '/health/v1':
                return this.checkVersionHealth('1.0');
            case '/health/v2':
                return this.checkVersionHealth('2.0');
            case '/health/ready':
                return this.checkReadiness();
            case '/health/live':
                return this.checkLiveness();
            default:
                throw new Error(`Unknown health endpoint: ${path}`);
        }
    }
    /**
     * Check if service is ready to accept requests
     */
    async checkReadiness() {
        const health = await this.checkHealth();
        return {
            ready: health.overall !== 'unhealthy',
            checks: {
                versions: health.versions,
                dependencies: health.dependencies
            }
        };
    }
    /**
     * Check if service is alive (basic health)
     */
    checkLiveness() {
        return {
            alive: true,
            uptime: Date.now() - this.startTime.getTime()
        };
    }
    /**
     * Calculate overall health status
     */
    calculateOverallStatus(results) {
        const statuses = results.map(r => r.status);
        if (statuses.every(s => s === 'healthy')) {
            return 'healthy';
        }
        if (statuses.some(s => s === 'healthy')) {
            return 'degraded';
        }
        return 'unhealthy';
    }
    /**
     * Add timeout to promise
     */
    withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), ms))
        ]);
    }
    /**
     * Start automated health monitoring
     */
    startMonitoring(intervalMs = 60000) {
        setInterval(async () => {
            const health = await this.checkHealth();
            if (health.overall !== 'healthy') {
                this.logger.warn('System health degraded', {
                    overall: health.overall,
                    versions: health.versions
                });
            }
        }, intervalMs);
        this.logger.info(`Health monitoring started (interval: ${intervalMs}ms)`);
    }
}
exports.HealthChecker = HealthChecker;
//# sourceMappingURL=health-checker.js.map