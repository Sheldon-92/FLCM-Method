"use strict";
/**
 * Enhanced Error Handling System for FLCM 2.0
 * Provides comprehensive error management, logging, and recovery mechanisms
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
exports.handleAgentError = exports.getErrorHandler = exports.EnhancedErrorHandler = exports.RecoveryStrategy = exports.ErrorCategory = exports.ErrorSeverity = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Error severity levels
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity = exports.ErrorSeverity || (exports.ErrorSeverity = {}));
// Error categories
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["PROCESSING"] = "processing";
    ErrorCategory["CONFIGURATION"] = "configuration";
    ErrorCategory["RESOURCE"] = "resource";
    ErrorCategory["INTEGRATION"] = "integration";
    ErrorCategory["USER_INPUT"] = "user_input";
    ErrorCategory["SYSTEM"] = "system";
})(ErrorCategory = exports.ErrorCategory || (exports.ErrorCategory = {}));
// Recovery strategies
var RecoveryStrategy;
(function (RecoveryStrategy) {
    RecoveryStrategy["RETRY"] = "retry";
    RecoveryStrategy["FALLBACK"] = "fallback";
    RecoveryStrategy["SKIP"] = "skip";
    RecoveryStrategy["MANUAL_INTERVENTION"] = "manual_intervention";
    RecoveryStrategy["GRACEFUL_DEGRADATION"] = "graceful_degradation";
})(RecoveryStrategy = exports.RecoveryStrategy || (exports.RecoveryStrategy = {}));
/**
 * Enhanced Error Handler Class
 */
class EnhancedErrorHandler {
    constructor(config) {
        this.errorLog = [];
        this.maxLogSize = 100; // Keep last 100 errors in memory
        this.alertCallbacks = [];
        this.config = {
            logLevel: 'error',
            maxRetries: 3,
            retryDelay: 1000,
            enableDetailedLogging: true,
            alertThresholds: {
                errorRate: 0.05,
                criticalErrorCount: 5,
                timeWindow: 3600000 // 1 hour
            },
            recoveryStrategies: {
                [ErrorCategory.VALIDATION]: RecoveryStrategy.RETRY,
                [ErrorCategory.NETWORK]: RecoveryStrategy.RETRY,
                [ErrorCategory.PROCESSING]: RecoveryStrategy.FALLBACK,
                [ErrorCategory.CONFIGURATION]: RecoveryStrategy.MANUAL_INTERVENTION,
                [ErrorCategory.RESOURCE]: RecoveryStrategy.GRACEFUL_DEGRADATION,
                [ErrorCategory.INTEGRATION]: RecoveryStrategy.RETRY,
                [ErrorCategory.USER_INPUT]: RecoveryStrategy.SKIP,
                [ErrorCategory.SYSTEM]: RecoveryStrategy.MANUAL_INTERVENTION
            },
            ...config
        };
        this.logFilePath = path.join(process.cwd(), '.flcm-core', 'logs', 'errors.json');
        this.ensureLogDirectory();
        this.loadExistingLogs();
    }
    /**
     * Handle an error with enhanced context and recovery
     */
    handleError(agentId, error, context = {}, category = ErrorCategory.SYSTEM, severity = ErrorSeverity.MEDIUM, taskId) {
        const enhancedError = {
            id: this.generateErrorId(),
            timestamp: new Date(),
            agentId,
            taskId,
            category,
            severity,
            message: error.message,
            originalError: error,
            context,
            stackTrace: error.stack || 'No stack trace available',
            recoveryStrategy: this.config.recoveryStrategies[category],
            retryCount: 0,
            maxRetries: this.config.maxRetries,
            resolved: false,
            userImpact: this.assessUserImpact(severity, category),
            technicalDetails: {
                errorName: error.name,
                errorCode: error.code,
                timestamp: Date.now(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };
        this.logError(enhancedError);
        this.triggerAlerts(enhancedError);
        return enhancedError;
    }
    /**
     * Attempt to recover from an error
     */
    async attemptRecovery(enhancedError, recoveryAction) {
        try {
            switch (enhancedError.recoveryStrategy) {
                case RecoveryStrategy.RETRY:
                    return await this.retryOperation(enhancedError, recoveryAction);
                case RecoveryStrategy.FALLBACK:
                    return await this.fallbackOperation(enhancedError, recoveryAction);
                case RecoveryStrategy.GRACEFUL_DEGRADATION:
                    return await this.gracefulDegradation(enhancedError);
                case RecoveryStrategy.SKIP:
                    this.logRecovery(enhancedError.id, 'Skipped operation due to error');
                    return { success: true, result: null };
                case RecoveryStrategy.MANUAL_INTERVENTION:
                    this.logRecovery(enhancedError.id, 'Manual intervention required');
                    return { success: false, error: new Error('Manual intervention required') };
                default:
                    return { success: false, error: enhancedError.originalError };
            }
        }
        catch (recoveryError) {
            this.logRecovery(enhancedError.id, `Recovery failed: ${recoveryError.message}`);
            return { success: false, error: recoveryError };
        }
    }
    /**
     * Retry operation with exponential backoff
     */
    async retryOperation(enhancedError, operation) {
        let lastError = enhancedError.originalError;
        for (let attempt = 1; attempt <= enhancedError.maxRetries; attempt++) {
            try {
                enhancedError.retryCount = attempt;
                this.updateErrorLog(enhancedError);
                if (attempt > 1) {
                    const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                const result = await operation();
                this.markAsResolved(enhancedError.id);
                return { success: true, result };
            }
            catch (error) {
                lastError = error;
                this.logRecovery(enhancedError.id, `Retry attempt ${attempt} failed: ${error.message}`);
            }
        }
        return { success: false, error: lastError };
    }
    /**
     * Execute fallback operation
     */
    async fallbackOperation(enhancedError, primaryOperation) {
        try {
            // Try primary operation first
            const result = await primaryOperation();
            this.markAsResolved(enhancedError.id);
            return { success: true, result };
        }
        catch (error) {
            // Execute fallback based on error category
            const fallbackResult = await this.executeFallback(enhancedError);
            return fallbackResult;
        }
    }
    /**
     * Execute graceful degradation
     */
    async gracefulDegradation(enhancedError) {
        const degradedResult = {
            status: 'degraded',
            message: 'Service running with reduced functionality',
            limitations: this.getGracefulDegradationLimitations(enhancedError.category),
            timestamp: new Date().toISOString()
        };
        this.logRecovery(enhancedError.id, 'Graceful degradation activated');
        return { success: true, result: degradedResult };
    }
    /**
     * Execute category-specific fallback
     */
    async executeFallback(enhancedError) {
        switch (enhancedError.category) {
            case ErrorCategory.NETWORK:
                return this.networkFallback(enhancedError);
            case ErrorCategory.PROCESSING:
                return this.processingFallback(enhancedError);
            case ErrorCategory.RESOURCE:
                return this.resourceFallback(enhancedError);
            default:
                return { success: false, error: enhancedError.originalError };
        }
    }
    /**
     * Network-specific fallback
     */
    async networkFallback(enhancedError) {
        // Try cached data or offline mode
        const cachedResult = await this.getCachedData(enhancedError.context);
        if (cachedResult) {
            this.logRecovery(enhancedError.id, 'Using cached data as fallback');
            return { success: true, result: cachedResult };
        }
        return { success: false, error: enhancedError.originalError };
    }
    /**
     * Processing-specific fallback
     */
    async processingFallback(enhancedError) {
        // Use simplified processing or default values
        const simplifiedResult = await this.getSimplifiedProcessingResult(enhancedError.context);
        this.logRecovery(enhancedError.id, 'Using simplified processing as fallback');
        return { success: true, result: simplifiedResult };
    }
    /**
     * Resource-specific fallback
     */
    async resourceFallback(enhancedError) {
        // Reduce resource usage or use alternative resources
        const resourceOptimizedResult = await this.getResourceOptimizedResult(enhancedError.context);
        this.logRecovery(enhancedError.id, 'Using resource-optimized approach as fallback');
        return { success: true, result: resourceOptimizedResult };
    }
    /**
     * Get error statistics for monitoring
     */
    getErrorStatistics() {
        const now = Date.now();
        const last24h = now - (24 * 60 * 60 * 1000);
        const stats = {
            totalErrors: this.errorLog.length,
            errorsByCategory: {},
            errorsBySeverity: {},
            errorsByAgent: {},
            recoverySuccessRate: this.calculateRecoverySuccessRate(),
            averageResolutionTime: this.calculateAverageResolutionTime(),
            criticalErrorsLast24h: this.errorLog.filter(e => e.severity === ErrorSeverity.CRITICAL && e.timestamp.getTime() > last24h).length,
            errorTrends: {
                hourly: this.calculateHourlyTrends(),
                daily: this.calculateDailyTrends(),
                weekly: this.calculateWeeklyTrends()
            }
        };
        // Calculate category distribution
        Object.values(ErrorCategory).forEach(category => {
            stats.errorsByCategory[category] = this.errorLog.filter(e => e.category === category).length;
        });
        // Calculate severity distribution
        Object.values(ErrorSeverity).forEach(severity => {
            stats.errorsBySeverity[severity] = this.errorLog.filter(e => e.severity === severity).length;
        });
        // Calculate agent distribution
        this.errorLog.forEach(error => {
            stats.errorsByAgent[error.agentId] = (stats.errorsByAgent[error.agentId] || 0) + 1;
        });
        return stats;
    }
    /**
     * Register alert callback
     */
    onAlert(callback) {
        this.alertCallbacks.push(callback);
    }
    /**
     * Clear resolved errors older than specified time
     */
    cleanupOldErrors(olderThanHours = 24) {
        const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
        const initialCount = this.errorLog.length;
        this.errorLog = this.errorLog.filter(error => !error.resolved || error.timestamp.getTime() > cutoffTime);
        const removedCount = initialCount - this.errorLog.length;
        this.saveLogsToFile();
        return removedCount;
    }
    // Private helper methods
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    assessUserImpact(severity, category) {
        if (severity === ErrorSeverity.CRITICAL) {
            return 'High - Service disruption likely';
        }
        else if (severity === ErrorSeverity.HIGH) {
            return 'Medium - Feature degradation possible';
        }
        else {
            return 'Low - Minimal impact expected';
        }
    }
    logError(error) {
        this.errorLog.push(error);
        // Keep only the most recent errors in memory
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }
        if (this.config.enableDetailedLogging) {
            console.error(`[FLCM Error] ${error.agentId}: ${error.message}`, {
                id: error.id,
                category: error.category,
                severity: error.severity,
                context: error.context
            });
        }
        this.saveLogsToFile();
    }
    triggerAlerts(error) {
        // Trigger alerts for high severity errors
        if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
            this.alertCallbacks.forEach(callback => {
                try {
                    callback(error);
                }
                catch (callbackError) {
                    console.error('Alert callback failed:', callbackError);
                }
            });
        }
        // Check alert thresholds
        this.checkAlertThresholds();
    }
    checkAlertThresholds() {
        const recentErrors = this.getRecentErrors(this.config.alertThresholds.timeWindow);
        const criticalErrors = recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);
        if (criticalErrors.length >= this.config.alertThresholds.criticalErrorCount) {
            const alertError = {
                id: this.generateErrorId(),
                timestamp: new Date(),
                agentId: 'system',
                category: ErrorCategory.SYSTEM,
                severity: ErrorSeverity.CRITICAL,
                message: `Critical error threshold exceeded: ${criticalErrors.length} errors in the last hour`,
                context: { recentCriticalErrors: criticalErrors.length },
                stackTrace: '',
                recoveryStrategy: RecoveryStrategy.MANUAL_INTERVENTION,
                retryCount: 0,
                maxRetries: 0,
                resolved: false,
                userImpact: 'High - System stability at risk',
                technicalDetails: { alertType: 'threshold_exceeded' }
            };
            this.alertCallbacks.forEach(callback => callback(alertError));
        }
    }
    getRecentErrors(timeWindowMs) {
        const cutoff = Date.now() - timeWindowMs;
        return this.errorLog.filter(error => error.timestamp.getTime() > cutoff);
    }
    logRecovery(errorId, message) {
        if (this.config.enableDetailedLogging) {
            console.log(`[FLCM Recovery] ${errorId}: ${message}`);
        }
    }
    updateErrorLog(error) {
        const index = this.errorLog.findIndex(e => e.id === error.id);
        if (index !== -1) {
            this.errorLog[index] = error;
            this.saveLogsToFile();
        }
    }
    markAsResolved(errorId) {
        const error = this.errorLog.find(e => e.id === errorId);
        if (error) {
            error.resolved = true;
            error.resolutionTime = new Date();
            this.saveLogsToFile();
        }
    }
    calculateRecoverySuccessRate() {
        const resolvedErrors = this.errorLog.filter(e => e.resolved).length;
        return this.errorLog.length > 0 ? (resolvedErrors / this.errorLog.length) * 100 : 0;
    }
    calculateAverageResolutionTime() {
        const resolvedErrors = this.errorLog.filter(e => e.resolved && e.resolutionTime);
        if (resolvedErrors.length === 0)
            return 0;
        const totalTime = resolvedErrors.reduce((sum, error) => {
            const resolutionTime = error.resolutionTime.getTime() - error.timestamp.getTime();
            return sum + resolutionTime;
        }, 0);
        return totalTime / resolvedErrors.length / 1000; // Return in seconds
    }
    calculateHourlyTrends() {
        // Return error counts for the last 24 hours
        const trends = new Array(24).fill(0);
        const now = new Date();
        this.errorLog.forEach(error => {
            const hoursDiff = Math.floor((now.getTime() - error.timestamp.getTime()) / (60 * 60 * 1000));
            if (hoursDiff < 24) {
                trends[23 - hoursDiff]++;
            }
        });
        return trends;
    }
    calculateDailyTrends() {
        // Return error counts for the last 7 days
        const trends = new Array(7).fill(0);
        const now = new Date();
        this.errorLog.forEach(error => {
            const daysDiff = Math.floor((now.getTime() - error.timestamp.getTime()) / (24 * 60 * 60 * 1000));
            if (daysDiff < 7) {
                trends[6 - daysDiff]++;
            }
        });
        return trends;
    }
    calculateWeeklyTrends() {
        // Return error counts for the last 4 weeks
        const trends = new Array(4).fill(0);
        const now = new Date();
        this.errorLog.forEach(error => {
            const weeksDiff = Math.floor((now.getTime() - error.timestamp.getTime()) / (7 * 24 * 60 * 60 * 1000));
            if (weeksDiff < 4) {
                trends[3 - weeksDiff]++;
            }
        });
        return trends;
    }
    getGracefulDegradationLimitations(category) {
        switch (category) {
            case ErrorCategory.NETWORK:
                return ['Offline mode active', 'Limited data synchronization', 'Cached results only'];
            case ErrorCategory.PROCESSING:
                return ['Simplified analysis', 'Reduced accuracy', 'Basic functionality only'];
            case ErrorCategory.RESOURCE:
                return ['Reduced throughput', 'Limited concurrent operations', 'Basic features only'];
            default:
                return ['Limited functionality', 'Reduced performance', 'Basic operation mode'];
        }
    }
    async getCachedData(context) {
        // Implementation would fetch cached data based on context
        return null;
    }
    async getSimplifiedProcessingResult(context) {
        // Implementation would provide simplified processing results
        return { status: 'simplified', message: 'Basic processing completed' };
    }
    async getResourceOptimizedResult(context) {
        // Implementation would provide resource-optimized results
        return { status: 'optimized', message: 'Resource-optimized processing completed' };
    }
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFilePath);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    loadExistingLogs() {
        try {
            if (fs.existsSync(this.logFilePath)) {
                const logData = fs.readFileSync(this.logFilePath, 'utf-8');
                const logs = JSON.parse(logData);
                this.errorLog = logs.map((log) => ({
                    ...log,
                    timestamp: new Date(log.timestamp),
                    resolutionTime: log.resolutionTime ? new Date(log.resolutionTime) : undefined
                })).slice(-this.maxLogSize);
            }
        }
        catch (error) {
            console.warn('Failed to load existing error logs:', error.message);
        }
    }
    saveLogsToFile() {
        try {
            fs.writeFileSync(this.logFilePath, JSON.stringify(this.errorLog, null, 2));
        }
        catch (error) {
            console.warn('Failed to save error logs:', error.message);
        }
    }
}
exports.EnhancedErrorHandler = EnhancedErrorHandler;
// Global error handler instance
let globalErrorHandler = null;
/**
 * Get or create global error handler instance
 */
function getErrorHandler(config) {
    if (!globalErrorHandler) {
        globalErrorHandler = new EnhancedErrorHandler(config);
    }
    return globalErrorHandler;
}
exports.getErrorHandler = getErrorHandler;
/**
 * Convenience function to handle errors with minimal setup
 */
function handleAgentError(agentId, error, context = {}, category = ErrorCategory.SYSTEM, severity = ErrorSeverity.MEDIUM) {
    return getErrorHandler().handleError(agentId, error, context, category, severity);
}
exports.handleAgentError = handleAgentError;
//# sourceMappingURL=error-handler.js.map