/**
 * Enhanced Error Handling System for FLCM 2.0
 * Provides comprehensive error management, logging, and recovery mechanisms
 */
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum ErrorCategory {
    VALIDATION = "validation",
    NETWORK = "network",
    PROCESSING = "processing",
    CONFIGURATION = "configuration",
    RESOURCE = "resource",
    INTEGRATION = "integration",
    USER_INPUT = "user_input",
    SYSTEM = "system"
}
export declare enum RecoveryStrategy {
    RETRY = "retry",
    FALLBACK = "fallback",
    SKIP = "skip",
    MANUAL_INTERVENTION = "manual_intervention",
    GRACEFUL_DEGRADATION = "graceful_degradation"
}
/**
 * Enhanced error interface with context and recovery information
 */
export interface EnhancedError {
    id: string;
    timestamp: Date;
    agentId: string;
    taskId?: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;
    originalError?: Error;
    context: Record<string, any>;
    stackTrace: string;
    recoveryStrategy: RecoveryStrategy;
    retryCount: number;
    maxRetries: number;
    resolved: boolean;
    resolutionTime?: Date;
    userImpact: string;
    technicalDetails: Record<string, any>;
}
/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
    logLevel: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    maxRetries: number;
    retryDelay: number;
    enableDetailedLogging: boolean;
    errorReportingEndpoint?: string;
    alertThresholds: {
        errorRate: number;
        criticalErrorCount: number;
        timeWindow: number;
    };
    recoveryStrategies: Record<ErrorCategory, RecoveryStrategy>;
}
/**
 * Error statistics for monitoring
 */
export interface ErrorStatistics {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByAgent: Record<string, number>;
    recoverySuccessRate: number;
    averageResolutionTime: number;
    criticalErrorsLast24h: number;
    errorTrends: {
        hourly: number[];
        daily: number[];
        weekly: number[];
    };
}
/**
 * Enhanced Error Handler Class
 */
export declare class EnhancedErrorHandler {
    private config;
    private errorLog;
    private logFilePath;
    private maxLogSize;
    private alertCallbacks;
    constructor(config?: Partial<ErrorHandlingConfig>);
    /**
     * Handle an error with enhanced context and recovery
     */
    handleError(agentId: string, error: Error, context?: Record<string, any>, category?: ErrorCategory, severity?: ErrorSeverity, taskId?: string): EnhancedError;
    /**
     * Attempt to recover from an error
     */
    attemptRecovery(enhancedError: EnhancedError, recoveryAction: () => Promise<any>): Promise<{
        success: boolean;
        result?: any;
        error?: Error;
    }>;
    /**
     * Retry operation with exponential backoff
     */
    private retryOperation;
    /**
     * Execute fallback operation
     */
    private fallbackOperation;
    /**
     * Execute graceful degradation
     */
    private gracefulDegradation;
    /**
     * Execute category-specific fallback
     */
    private executeFallback;
    /**
     * Network-specific fallback
     */
    private networkFallback;
    /**
     * Processing-specific fallback
     */
    private processingFallback;
    /**
     * Resource-specific fallback
     */
    private resourceFallback;
    /**
     * Get error statistics for monitoring
     */
    getErrorStatistics(): ErrorStatistics;
    /**
     * Register alert callback
     */
    onAlert(callback: (error: EnhancedError) => void): void;
    /**
     * Clear resolved errors older than specified time
     */
    cleanupOldErrors(olderThanHours?: number): number;
    private generateErrorId;
    private assessUserImpact;
    private logError;
    private triggerAlerts;
    private checkAlertThresholds;
    private getRecentErrors;
    private logRecovery;
    private updateErrorLog;
    private markAsResolved;
    private calculateRecoverySuccessRate;
    private calculateAverageResolutionTime;
    private calculateHourlyTrends;
    private calculateDailyTrends;
    private calculateWeeklyTrends;
    private getGracefulDegradationLimitations;
    private getCachedData;
    private getSimplifiedProcessingResult;
    private getResourceOptimizedResult;
    private ensureLogDirectory;
    private loadExistingLogs;
    private saveLogsToFile;
}
/**
 * Get or create global error handler instance
 */
export declare function getErrorHandler(config?: Partial<ErrorHandlingConfig>): EnhancedErrorHandler;
/**
 * Convenience function to handle errors with minimal setup
 */
export declare function handleAgentError(agentId: string, error: Error, context?: Record<string, any>, category?: ErrorCategory, severity?: ErrorSeverity): EnhancedError;
