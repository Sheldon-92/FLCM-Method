"use strict";
/**
 * Error Recovery Manager
 * Handles error recovery, retries, and fallback strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoveryManager = exports.RecoveryManager = exports.RecoveryStrategy = exports.ErrorSeverity = void 0;
const events_1 = require("events");
const logger_1 = require("../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('RecoveryManager');
/**
 * Error severity levels
 */
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity = exports.ErrorSeverity || (exports.ErrorSeverity = {}));
/**
 * Recovery strategy types
 */
var RecoveryStrategy;
(function (RecoveryStrategy) {
    RecoveryStrategy["RETRY"] = "retry";
    RecoveryStrategy["FALLBACK"] = "fallback";
    RecoveryStrategy["SKIP"] = "skip";
    RecoveryStrategy["ALERT"] = "alert";
    RecoveryStrategy["SHUTDOWN"] = "shutdown";
})(RecoveryStrategy = exports.RecoveryStrategy || (exports.RecoveryStrategy = {}));
/**
 * Error Recovery Manager
 */
class RecoveryManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.policies = new Map();
        this.errorHistory = [];
        this.recoveryStats = {
            totalErrors: 0,
            recovered: 0,
            failed: 0,
            byStrategy: {},
        };
        this.initializePolicies();
    }
    /**
     * Initialize default recovery policies
     */
    initializePolicies() {
        // Low severity - simple retry
        this.policies.set(ErrorSeverity.LOW, {
            severity: ErrorSeverity.LOW,
            strategies: [RecoveryStrategy.RETRY, RecoveryStrategy.SKIP],
            maxAttempts: 3,
            backoffMultiplier: 1.5,
            alertThreshold: 10,
        });
        // Medium severity - retry with fallback
        this.policies.set(ErrorSeverity.MEDIUM, {
            severity: ErrorSeverity.MEDIUM,
            strategies: [RecoveryStrategy.RETRY, RecoveryStrategy.FALLBACK],
            maxAttempts: 5,
            backoffMultiplier: 2,
            alertThreshold: 5,
        });
        // High severity - alert and fallback
        this.policies.set(ErrorSeverity.HIGH, {
            severity: ErrorSeverity.HIGH,
            strategies: [RecoveryStrategy.ALERT, RecoveryStrategy.FALLBACK],
            maxAttempts: 3,
            backoffMultiplier: 2,
            alertThreshold: 2,
        });
        // Critical severity - immediate alert and possible shutdown
        this.policies.set(ErrorSeverity.CRITICAL, {
            severity: ErrorSeverity.CRITICAL,
            strategies: [RecoveryStrategy.ALERT, RecoveryStrategy.SHUTDOWN],
            maxAttempts: 1,
            backoffMultiplier: 1,
            alertThreshold: 1,
        });
    }
    /**
     * Handle error with recovery
     */
    async handleError(context) {
        logger.error(`Error in ${context.agent}:${context.operation}:`, context.error);
        // Add to history
        this.errorHistory.push(context);
        this.recordError(context);
        // Get recovery policy
        const policy = this.policies.get(context.severity) || this.policies.get(ErrorSeverity.LOW);
        // Check if alert threshold reached
        if (this.shouldAlert(context, policy)) {
            await this.sendAlert(context);
        }
        // Execute recovery strategies
        for (const strategy of policy.strategies) {
            const result = await this.executeStrategy(strategy, context, policy);
            if (result.success) {
                this.recordRecovery(strategy);
                return result;
            }
        }
        // All strategies failed
        this.recordFailure();
        return {
            success: false,
            strategy: RecoveryStrategy.SKIP,
            attempts: context.attempts,
            error: context.error,
        };
    }
    /**
     * Execute recovery strategy
     */
    async executeStrategy(strategy, context, policy) {
        logger.info(`Executing ${strategy} strategy for ${context.agent}:${context.operation}`);
        switch (strategy) {
            case RecoveryStrategy.RETRY:
                return this.executeRetry(context, policy);
            case RecoveryStrategy.FALLBACK:
                return this.executeFallback(context);
            case RecoveryStrategy.SKIP:
                return this.executeSkip(context);
            case RecoveryStrategy.ALERT:
                await this.sendAlert(context);
                return { success: false, strategy, attempts: 1 };
            case RecoveryStrategy.SHUTDOWN:
                return this.executeShutdown(context);
            default:
                return { success: false, strategy, attempts: 1 };
        }
    }
    /**
     * Execute retry strategy with exponential backoff
     */
    async executeRetry(context, policy) {
        let lastError = context.error;
        for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
            const backoffMs = this.calculateBackoff(attempt, policy.backoffMultiplier);
            logger.debug(`Retry attempt ${attempt}/${policy.maxAttempts} after ${backoffMs}ms`);
            // Wait for backoff
            await this.delay(backoffMs);
            try {
                // Emit retry event for agent to handle
                const result = await this.emitRetryEvent(context, attempt);
                if (result !== undefined) {
                    return {
                        success: true,
                        strategy: RecoveryStrategy.RETRY,
                        attempts: attempt,
                        result,
                    };
                }
            }
            catch (error) {
                lastError = error;
                logger.debug(`Retry attempt ${attempt} failed:`, error.message);
            }
        }
        return {
            success: false,
            strategy: RecoveryStrategy.RETRY,
            attempts: policy.maxAttempts,
            error: lastError,
        };
    }
    /**
     * Execute fallback strategy
     */
    async executeFallback(context) {
        try {
            // Emit fallback event for agent to provide alternative
            const fallbackResult = await this.emitFallbackEvent(context);
            if (fallbackResult !== undefined) {
                return {
                    success: true,
                    strategy: RecoveryStrategy.FALLBACK,
                    attempts: 1,
                    result: fallbackResult,
                };
            }
        }
        catch (error) {
            logger.error('Fallback strategy failed:', error);
        }
        return {
            success: false,
            strategy: RecoveryStrategy.FALLBACK,
            attempts: 1,
            error: context.error,
        };
    }
    /**
     * Execute skip strategy
     */
    async executeSkip(context) {
        logger.warn(`Skipping operation ${context.operation} for ${context.agent}`);
        return {
            success: true,
            strategy: RecoveryStrategy.SKIP,
            attempts: 0,
            result: null,
        };
    }
    /**
     * Execute shutdown strategy
     */
    async executeShutdown(context) {
        logger.error(`Critical error - initiating shutdown for ${context.agent}`);
        // Emit shutdown event
        this.emit('shutdown-required', context);
        return {
            success: false,
            strategy: RecoveryStrategy.SHUTDOWN,
            attempts: 0,
            error: context.error,
        };
    }
    /**
     * Calculate exponential backoff
     */
    calculateBackoff(attempt, multiplier) {
        const baseDelay = 1000; // 1 second
        return Math.min(baseDelay * Math.pow(multiplier, attempt - 1), 30000); // Max 30 seconds
    }
    /**
     * Check if alert should be sent
     */
    shouldAlert(context, policy) {
        const recentErrors = this.errorHistory.filter(e => e.agent === context.agent &&
            e.operation === context.operation &&
            e.timestamp > new Date(Date.now() - 3600000) // Last hour
        );
        return recentErrors.length >= policy.alertThreshold;
    }
    /**
     * Send alert
     */
    async sendAlert(context) {
        logger.error(`ALERT: ${context.agent}:${context.operation} - ${context.error.message}`);
        this.emit('alert', {
            ...context,
            message: `Critical error in ${context.agent}: ${context.error.message}`,
            errorCount: this.getErrorCount(context.agent),
        });
    }
    /**
     * Emit retry event
     */
    async emitRetryEvent(context, attempt) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Retry timeout'));
            }, 30000);
            this.emit('retry-operation', {
                ...context,
                attempt,
                callback: (error, result) => {
                    clearTimeout(timeout);
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                },
            });
        });
    }
    /**
     * Emit fallback event
     */
    async emitFallbackEvent(context) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Fallback timeout'));
            }, 10000);
            this.emit('fallback-operation', {
                ...context,
                callback: (error, result) => {
                    clearTimeout(timeout);
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result);
                    }
                },
            });
        });
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Record error statistics
     */
    recordError(context) {
        this.recoveryStats.totalErrors++;
        // Trim history if too large
        if (this.errorHistory.length > 1000) {
            this.errorHistory = this.errorHistory.slice(-500);
        }
    }
    /**
     * Record successful recovery
     */
    recordRecovery(strategy) {
        this.recoveryStats.recovered++;
        this.recoveryStats.byStrategy[strategy] =
            (this.recoveryStats.byStrategy[strategy] || 0) + 1;
    }
    /**
     * Record recovery failure
     */
    recordFailure() {
        this.recoveryStats.failed++;
    }
    /**
     * Get error count for agent
     */
    getErrorCount(agent) {
        return this.errorHistory.filter(e => e.agent === agent).length;
    }
    /**
     * Get recovery statistics
     */
    getStatistics() {
        return { ...this.recoveryStats };
    }
    /**
     * Get error history
     */
    getErrorHistory(agent) {
        if (agent) {
            return this.errorHistory.filter(e => e.agent === agent);
        }
        return [...this.errorHistory];
    }
    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
        logger.info('Error history cleared');
    }
    /**
     * Update recovery policy
     */
    updatePolicy(severity, policy) {
        this.policies.set(severity, policy);
        logger.info(`Updated recovery policy for ${severity} severity`);
    }
}
exports.RecoveryManager = RecoveryManager;
// Export singleton instance
exports.recoveryManager = new RecoveryManager();
//# sourceMappingURL=recovery-manager.js.map