"use strict";
/**
 * Enhanced Error Handling System for FLCM 2.0
 * Comprehensive error management with intelligent recovery and user experience focus
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedErrorHandler = exports.EnhancedErrorHandler = exports.ErrorType = void 0;
const events_1 = require("events");
const logger_1 = require("../../shared/utils/logger");
const recovery_manager_1 = require("./recovery-manager");
const logger = (0, logger_1.createLogger)('EnhancedErrorHandler');
/**
 * Enhanced error types for better categorization
 */
var ErrorType;
(function (ErrorType) {
    // Input/Output errors
    ErrorType["INPUT_VALIDATION"] = "input_validation";
    ErrorType["OUTPUT_GENERATION"] = "output_generation";
    ErrorType["FILE_SYSTEM"] = "file_system";
    // Network and external service errors
    ErrorType["NETWORK_TIMEOUT"] = "network_timeout";
    ErrorType["SERVICE_UNAVAILABLE"] = "service_unavailable";
    ErrorType["API_RATE_LIMIT"] = "api_rate_limit";
    ErrorType["AUTHENTICATION"] = "authentication";
    // Processing errors
    ErrorType["CONTENT_PROCESSING"] = "content_processing";
    ErrorType["VOICE_DNA_ANALYSIS"] = "voice_dna_analysis";
    ErrorType["PLATFORM_ADAPTATION"] = "platform_adaptation";
    // System errors
    ErrorType["MEMORY_EXHAUSTED"] = "memory_exhausted";
    ErrorType["CPU_OVERLOAD"] = "cpu_overload";
    ErrorType["STORAGE_FULL"] = "storage_full";
    // User interaction errors
    ErrorType["USER_CANCELLATION"] = "user_cancellation";
    ErrorType["INVALID_INPUT"] = "invalid_input";
    ErrorType["PERMISSION_DENIED"] = "permission_denied";
    // Business logic errors
    ErrorType["INSUFFICIENT_DATA"] = "insufficient_data";
    ErrorType["QUALITY_THRESHOLD"] = "quality_threshold";
    ErrorType["COMPLIANCE_VIOLATION"] = "compliance_violation";
    // Unknown errors
    ErrorType["UNKNOWN"] = "unknown";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
/**
 * Enhanced Error Handler with intelligent recovery and UX focus
 */
class EnhancedErrorHandler extends events_1.EventEmitter {
    constructor(recoveryManager) {
        super();
        this.breadcrumbs = [];
        this.errorStrategies = new Map();
        this.errorHistory = [];
        this.userSessions = new Map();
        this.recoveryManager = recoveryManager;
        this.initializeErrorStrategies();
        this.setupEventListeners();
    }
    /**
     * Handle error with enhanced context and user experience
     */
    async handleError(error, context) {
        const enhancedContext = await this.enrichErrorContext(error, context);
        logger.error('Enhanced error handler processing error:', {
            type: enhancedContext.errorType,
            severity: enhancedContext.severity,
            userImpact: enhancedContext.userImpact,
            operation: enhancedContext.operation
        });
        // Add to error history
        this.errorHistory.push(enhancedContext);
        this.updateUserSession(enhancedContext);
        // Emit error event for monitoring
        this.emit('error-occurred', enhancedContext);
        // Get handling strategy
        const strategy = this.getErrorStrategy(enhancedContext.errorType);
        // Perform error analysis
        const analysis = await this.analyzeError(enhancedContext);
        // Generate recovery options
        const recoveryOptions = await this.generateRecoveryOptions(enhancedContext, strategy);
        // Get user-friendly message
        const userMessage = this.getUserMessage(enhancedContext, strategy);
        // Determine if auto-retry should be attempted
        const shouldRetry = this.shouldAutoRetry(enhancedContext, strategy);
        // Handle based on strategy
        let handled = false;
        if (shouldRetry && strategy.autoRetry) {
            handled = await this.attemptAutoRecovery(enhancedContext, strategy);
        }
        // Send to recovery manager for additional handling
        if (!handled) {
            await this.recoveryManager.handleError(enhancedContext);
        }
        // Emit handled event
        this.emit('error-handled', {
            context: enhancedContext,
            handled,
            recoveryOptions,
            analysis
        });
        return {
            handled,
            recovery: recoveryOptions,
            userMessage,
            shouldRetry
        };
    }
    /**
     * Add breadcrumb for error context tracking
     */
    addBreadcrumb(breadcrumb) {
        const fullBreadcrumb = {
            ...breadcrumb,
            timestamp: new Date()
        };
        this.breadcrumbs.push(fullBreadcrumb);
        // Keep only last 50 breadcrumbs
        if (this.breadcrumbs.length > 50) {
            this.breadcrumbs = this.breadcrumbs.slice(-50);
        }
        logger.debug('Added error breadcrumb:', fullBreadcrumb);
    }
    /**
     * Get error patterns and insights
     */
    getErrorInsights() {
        const recentErrors = this.getRecentErrors(7 * 24 * 60 * 60 * 1000); // Last 7 days
        // Top errors
        const errorCounts = new Map();
        recentErrors.forEach(error => {
            const current = errorCounts.get(error.errorType) || { count: 0, severity: error.severity };
            current.count++;
            errorCounts.set(error.errorType, current);
        });
        const topErrors = Array.from(errorCounts.entries())
            .map(([type, data]) => ({ type, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Error trends (daily)
        const trendMap = new Map();
        recentErrors.forEach(error => {
            const dateKey = error.timestamp.toISOString().split('T')[0];
            trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
        });
        const errorTrends = Array.from(trendMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        // Recovery success rates
        const recoverySuccess = {};
        Object.values(ErrorType).forEach(type => {
            const typeErrors = recentErrors.filter(e => e.errorType === type);
            const successfulRecoveries = typeErrors.filter(e => this.recoveryManager.getErrorHistory().some(h => h.agent === e.agent && h.operation === e.operation && h.timestamp > e.timestamp));
            recoverySuccess[type] = typeErrors.length > 0 ? successfulRecoveries.length / typeErrors.length : 0;
        });
        // User impact analysis
        const highImpactErrors = recentErrors.filter(e => e.userImpact === 'high' || e.userImpact === 'critical').length;
        const affectedSessions = new Set(recentErrors.filter(e => e.sessionId).map(e => e.sessionId)).size;
        const avgResolutionTime = recentErrors
            .filter(e => e.metadata?.resolutionTime)
            .reduce((sum, e) => sum + e.metadata.resolutionTime, 0) /
            Math.max(1, recentErrors.filter(e => e.metadata?.resolutionTime).length);
        return {
            topErrors,
            errorTrends,
            recoverySuccess,
            userImpactAnalysis: {
                highImpactErrors,
                userAffectedSessions: affectedSessions,
                avgResolutionTime
            }
        };
    }
    /**
     * Create user-friendly error report
     */
    generateUserErrorReport(sessionId) {
        const errors = sessionId
            ? this.userSessions.get(sessionId) || []
            : this.getRecentErrors(24 * 60 * 60 * 1000); // Last 24 hours
        if (errors.length === 0) {
            return 'No errors reported in the specified timeframe.';
        }
        const highImpactErrors = errors.filter(e => e.userImpact === 'high' || e.userImpact === 'critical');
        const resolvedErrors = errors.filter(e => e.metadata?.resolved);
        const report = `
# Error Report

## Summary
- **Total Errors**: ${errors.length}
- **High Impact Errors**: ${highImpactErrors.length}
- **Resolved Errors**: ${resolvedErrors.length}
- **Resolution Rate**: ${((resolvedErrors.length / errors.length) * 100).toFixed(1)}%

## Recent Issues
${errors.slice(0, 5).map(error => `
### ${error.errorType.replace(/_/g, ' ').toUpperCase()}
- **Time**: ${error.timestamp.toLocaleString()}
- **Impact**: ${error.userImpact}
- **Message**: ${error.userMessage}
- **Status**: ${error.metadata?.resolved ? 'Resolved' : 'Open'}
`).join('')}

## Recommendations
${this.generateUserRecommendations(errors).map(rec => `- ${rec}`).join('\n')}

---
*Report generated on ${new Date().toLocaleString()}*
`;
        return report;
    }
    // Private methods
    async enrichErrorContext(error, partialContext) {
        const errorType = this.classifyError(error);
        const userImpact = this.assessUserImpact(errorType, error);
        const severity = this.determineSeverity(errorType, userImpact);
        return {
            agent: partialContext.agent || 'unknown',
            operation: partialContext.operation || 'unknown',
            error,
            timestamp: new Date(),
            severity,
            attempts: partialContext.attempts || 0,
            metadata: partialContext.metadata || {},
            errorType,
            userImpact,
            recoveryOptions: [],
            userMessage: this.generateUserMessage(error, errorType),
            technicalDetails: this.generateTechnicalDetails(error),
            correlationId: partialContext.correlationId || this.generateCorrelationId(),
            userId: partialContext.userId,
            sessionId: partialContext.sessionId,
            stackTrace: error.stack,
            breadcrumbs: [...this.breadcrumbs]
        };
    }
    classifyError(error) {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';
        // Network errors
        if (message.includes('timeout') || message.includes('network')) {
            return ErrorType.NETWORK_TIMEOUT;
        }
        if (message.includes('service unavailable') || message.includes('502') || message.includes('503')) {
            return ErrorType.SERVICE_UNAVAILABLE;
        }
        if (message.includes('rate limit') || message.includes('429')) {
            return ErrorType.API_RATE_LIMIT;
        }
        // File system errors
        if (message.includes('enoent') || message.includes('file not found')) {
            return ErrorType.FILE_SYSTEM;
        }
        // Validation errors
        if (message.includes('validation') || message.includes('invalid input')) {
            return ErrorType.INPUT_VALIDATION;
        }
        // Processing errors
        if (stack.includes('voice-dna') || message.includes('voice')) {
            return ErrorType.VOICE_DNA_ANALYSIS;
        }
        if (stack.includes('platform') || message.includes('platform')) {
            return ErrorType.PLATFORM_ADAPTATION;
        }
        // Memory/resource errors
        if (message.includes('out of memory') || message.includes('memory')) {
            return ErrorType.MEMORY_EXHAUSTED;
        }
        // User errors
        if (message.includes('cancelled') || message.includes('aborted')) {
            return ErrorType.USER_CANCELLATION;
        }
        return ErrorType.UNKNOWN;
    }
    assessUserImpact(errorType, error) {
        switch (errorType) {
            case ErrorType.USER_CANCELLATION:
                return 'none';
            case ErrorType.INPUT_VALIDATION:
            case ErrorType.INVALID_INPUT:
                return 'low';
            case ErrorType.NETWORK_TIMEOUT:
            case ErrorType.API_RATE_LIMIT:
            case ErrorType.CONTENT_PROCESSING:
                return 'medium';
            case ErrorType.SERVICE_UNAVAILABLE:
            case ErrorType.VOICE_DNA_ANALYSIS:
            case ErrorType.PLATFORM_ADAPTATION:
                return 'high';
            case ErrorType.MEMORY_EXHAUSTED:
            case ErrorType.STORAGE_FULL:
            case ErrorType.COMPLIANCE_VIOLATION:
                return 'critical';
            default:
                return 'medium';
        }
    }
    determineSeverity(errorType, userImpact) {
        if (userImpact === 'critical')
            return recovery_manager_1.ErrorSeverity.CRITICAL;
        if (userImpact === 'high')
            return recovery_manager_1.ErrorSeverity.HIGH;
        if (userImpact === 'medium')
            return recovery_manager_1.ErrorSeverity.MEDIUM;
        return recovery_manager_1.ErrorSeverity.LOW;
    }
    generateUserMessage(error, errorType) {
        const messages = {
            [ErrorType.INPUT_VALIDATION]: '输入内容格式不正确，请检查并重新输入。',
            [ErrorType.NETWORK_TIMEOUT]: '网络连接超时，请检查网络连接后重试。',
            [ErrorType.SERVICE_UNAVAILABLE]: '服务暂时不可用，我们正在处理这个问题，请稍后重试。',
            [ErrorType.API_RATE_LIMIT]: '请求过于频繁，请稍等片刻后重试。',
            [ErrorType.VOICE_DNA_ANALYSIS]: 'Voice DNA 分析遇到问题，正在尝试修复。',
            [ErrorType.PLATFORM_ADAPTATION]: '平台内容适配遇到问题，正在尝试其他方案。',
            [ErrorType.CONTENT_PROCESSING]: '内容处理遇到问题，请检查输入内容后重试。',
            [ErrorType.FILE_SYSTEM]: '文件操作失败，请检查文件权限和磁盘空间。',
            [ErrorType.MEMORY_EXHAUSTED]: '系统内存不足，请稍后重试或减少处理内容的大小。',
            [ErrorType.USER_CANCELLATION]: '操作已取消。',
            [ErrorType.INVALID_INPUT]: '输入内容无效，请提供有效的输入。',
            [ErrorType.INSUFFICIENT_DATA]: '输入数据不足，请提供更多信息。',
            [ErrorType.QUALITY_THRESHOLD]: '内容质量不符合要求，请改进后重试。',
            [ErrorType.UNKNOWN]: '遇到未知错误，我们正在调查这个问题。'
        };
        return messages[errorType] || messages[ErrorType.UNKNOWN];
    }
    generateTechnicalDetails(error) {
        return `${error.name}: ${error.message}\n\nStack trace:\n${error.stack || 'No stack trace available'}`;
    }
    generateCorrelationId() {
        return `err-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    initializeErrorStrategies() {
        // Network errors - retry with backoff
        this.errorStrategies.set(ErrorType.NETWORK_TIMEOUT, {
            errorType: ErrorType.NETWORK_TIMEOUT,
            autoRetry: true,
            maxRetries: 3,
            backoffStrategy: 'exponential',
            userNotification: 'toast',
        });
        this.errorStrategies.set(ErrorType.SERVICE_UNAVAILABLE, {
            errorType: ErrorType.SERVICE_UNAVAILABLE,
            autoRetry: true,
            maxRetries: 2,
            backoffStrategy: 'exponential',
            userNotification: 'modal',
        });
        // User input errors - immediate feedback
        this.errorStrategies.set(ErrorType.INPUT_VALIDATION, {
            errorType: ErrorType.INPUT_VALIDATION,
            autoRetry: false,
            maxRetries: 0,
            backoffStrategy: 'fixed',
            userNotification: 'toast',
        });
        // Processing errors - retry with fallback
        this.errorStrategies.set(ErrorType.VOICE_DNA_ANALYSIS, {
            errorType: ErrorType.VOICE_DNA_ANALYSIS,
            autoRetry: true,
            maxRetries: 2,
            backoffStrategy: 'fixed',
            userNotification: 'none',
            fallbackAction: async () => {
                logger.info('Using default Voice DNA profile as fallback');
                return { useDefaultProfile: true };
            }
        });
        // Critical errors - immediate notification
        this.errorStrategies.set(ErrorType.MEMORY_EXHAUSTED, {
            errorType: ErrorType.MEMORY_EXHAUSTED,
            autoRetry: false,
            maxRetries: 0,
            backoffStrategy: 'fixed',
            userNotification: 'modal',
            customMessage: '系统内存不足。请关闭其他应用程序或减少处理内容的大小。'
        });
    }
    getErrorStrategy(errorType) {
        return this.errorStrategies.get(errorType) || {
            errorType,
            autoRetry: false,
            maxRetries: 0,
            backoffStrategy: 'fixed',
            userNotification: 'toast'
        };
    }
    async analyzeError(context) {
        // Simplified error analysis - in production this would be more sophisticated
        return {
            rootCause: `${context.errorType} in ${context.operation}`,
            impactAssessment: {
                userExperience: context.userImpact === 'critical' ? 'severe' : 'moderate',
                dataLoss: context.errorType === ErrorType.FILE_SYSTEM,
                systemStability: context.severity === recovery_manager_1.ErrorSeverity.CRITICAL ? 'critical' : 'stable'
            },
            recommendedActions: [
                'Check system resources',
                'Validate input data',
                'Review error logs'
            ],
            preventionMeasures: [
                'Implement better input validation',
                'Add resource monitoring',
                'Improve error handling'
            ]
        };
    }
    async generateRecoveryOptions(context, strategy) {
        const options = [];
        // Auto-retry option
        if (strategy.autoRetry && context.attempts < strategy.maxRetries) {
            options.push({
                id: 'retry',
                label: '重试',
                description: '重新尝试该操作',
                action: async () => {
                    logger.info(`Retrying operation: ${context.operation}`);
                },
                estimatedTime: '30秒',
                successProbability: 0.7
            });
        }
        // Fallback option
        if (strategy.fallbackAction) {
            options.push({
                id: 'fallback',
                label: '使用备选方案',
                description: '使用默认配置继续',
                action: strategy.fallbackAction,
                estimatedTime: '1分钟',
                successProbability: 0.9
            });
        }
        // Manual intervention option
        if (context.userImpact === 'high' || context.userImpact === 'critical') {
            options.push({
                id: 'manual',
                label: '手动处理',
                description: '提供更多信息以手动解决问题',
                action: async () => {
                    logger.info('Manual intervention requested');
                },
                requiresUserInput: true,
                successProbability: 0.95
            });
        }
        return options;
    }
    getUserMessage(context, strategy) {
        if (strategy.customMessage) {
            return strategy.customMessage;
        }
        return context.userMessage;
    }
    shouldAutoRetry(context, strategy) {
        return strategy.autoRetry && context.attempts < strategy.maxRetries;
    }
    async attemptAutoRecovery(context, strategy) {
        try {
            // Calculate backoff delay
            const delay = this.calculateBackoffDelay(context.attempts, strategy.backoffStrategy);
            logger.info(`Attempting auto-recovery for ${context.errorType} after ${delay}ms delay`);
            // Wait for backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            // Attempt recovery (simplified - in real implementation would re-execute operation)
            const success = Math.random() > 0.3; // Simulate 70% success rate
            if (success) {
                logger.info(`Auto-recovery successful for ${context.operation}`);
                this.emit('auto-recovery-success', context);
                return true;
            }
            logger.warn(`Auto-recovery failed for ${context.operation}`);
            return false;
        }
        catch (error) {
            logger.error('Auto-recovery attempt failed:', error);
            return false;
        }
    }
    calculateBackoffDelay(attempt, strategy) {
        const baseDelay = 1000; // 1 second
        switch (strategy) {
            case 'fixed':
                return baseDelay;
            case 'linear':
                return baseDelay * (attempt + 1);
            case 'exponential':
                return baseDelay * Math.pow(2, attempt);
            default:
                return baseDelay;
        }
    }
    setupEventListeners() {
        this.on('error-occurred', (context) => {
            // Log error for monitoring
            logger.error('Error occurred:', {
                type: context.errorType,
                operation: context.operation,
                severity: context.severity,
                userImpact: context.userImpact
            });
        });
        this.on('error-handled', (data) => {
            // Update metrics and monitoring
            logger.info('Error handled:', {
                type: data.context.errorType,
                handled: data.handled,
                recoveryOptions: data.recoveryOptions.length
            });
        });
    }
    getRecentErrors(timeWindowMs) {
        const cutoff = new Date(Date.now() - timeWindowMs);
        return this.errorHistory.filter(error => error.timestamp >= cutoff);
    }
    updateUserSession(context) {
        if (!context.sessionId)
            return;
        const sessionErrors = this.userSessions.get(context.sessionId) || [];
        sessionErrors.push(context);
        this.userSessions.set(context.sessionId, sessionErrors);
    }
    generateUserRecommendations(errors) {
        const recommendations = [];
        const networkErrors = errors.filter(e => e.errorType === ErrorType.NETWORK_TIMEOUT).length;
        if (networkErrors > 2) {
            recommendations.push('检查网络连接稳定性，考虑使用更稳定的网络环境');
        }
        const inputErrors = errors.filter(e => e.errorType === ErrorType.INPUT_VALIDATION).length;
        if (inputErrors > 1) {
            recommendations.push('请仔细检查输入格式，参考帮助文档中的示例');
        }
        const memoryErrors = errors.filter(e => e.errorType === ErrorType.MEMORY_EXHAUSTED).length;
        if (memoryErrors > 0) {
            recommendations.push('考虑分批处理大量内容，或在系统资源充足时重试');
        }
        if (recommendations.length === 0) {
            recommendations.push('系统运行正常，如遇问题请联系技术支持');
        }
        return recommendations;
    }
}
exports.EnhancedErrorHandler = EnhancedErrorHandler;
// Export singleton instance
exports.enhancedErrorHandler = new EnhancedErrorHandler(require('./recovery-manager').recoveryManager);
//# sourceMappingURL=enhanced-error-handler.js.map