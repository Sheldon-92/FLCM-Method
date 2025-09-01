/**
 * Enhanced Error Handling System for FLCM 2.0
 * Comprehensive error management with intelligent recovery and user experience focus
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { RecoveryManager, ErrorContext, ErrorSeverity } from './recovery-manager';
/**
 * Enhanced error types for better categorization
 */
export declare enum ErrorType {
    INPUT_VALIDATION = "input_validation",
    OUTPUT_GENERATION = "output_generation",
    FILE_SYSTEM = "file_system",
    NETWORK_TIMEOUT = "network_timeout",
    SERVICE_UNAVAILABLE = "service_unavailable",
    API_RATE_LIMIT = "api_rate_limit",
    AUTHENTICATION = "authentication",
    CONTENT_PROCESSING = "content_processing",
    VOICE_DNA_ANALYSIS = "voice_dna_analysis",
    PLATFORM_ADAPTATION = "platform_adaptation",
    MEMORY_EXHAUSTED = "memory_exhausted",
    CPU_OVERLOAD = "cpu_overload",
    STORAGE_FULL = "storage_full",
    USER_CANCELLATION = "user_cancellation",
    INVALID_INPUT = "invalid_input",
    PERMISSION_DENIED = "permission_denied",
    INSUFFICIENT_DATA = "insufficient_data",
    QUALITY_THRESHOLD = "quality_threshold",
    COMPLIANCE_VIOLATION = "compliance_violation",
    UNKNOWN = "unknown"
}
/**
 * Enhanced error context with more detailed information
 */
export interface EnhancedErrorContext extends ErrorContext {
    errorType: ErrorType;
    userImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
    recoveryOptions: RecoveryOption[];
    userMessage: string;
    technicalDetails: string;
    correlationId?: string;
    userId?: string;
    sessionId?: string;
    stackTrace?: string;
    breadcrumbs: ErrorBreadcrumb[];
}
/**
 * Error breadcrumb for tracking error context
 */
export interface ErrorBreadcrumb {
    timestamp: Date;
    category: 'navigation' | 'user_action' | 'api_call' | 'system_event';
    message: string;
    level: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
}
/**
 * Recovery option for user-facing error handling
 */
export interface RecoveryOption {
    id: string;
    label: string;
    description: string;
    action: () => Promise<void>;
    estimatedTime?: string;
    requiresUserInput?: boolean;
    successProbability: number;
}
/**
 * Error handling strategy
 */
export interface ErrorHandlingStrategy {
    errorType: ErrorType;
    autoRetry: boolean;
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    userNotification: 'none' | 'toast' | 'modal' | 'redirect';
    fallbackAction?: () => Promise<any>;
    customMessage?: string;
}
/**
 * Error analysis result
 */
export interface ErrorAnalysisResult {
    rootCause: string;
    impactAssessment: {
        userExperience: 'minimal' | 'moderate' | 'severe';
        dataLoss: boolean;
        systemStability: 'stable' | 'degraded' | 'critical';
    };
    recommendedActions: string[];
    preventionMeasures: string[];
}
/**
 * Enhanced Error Handler with intelligent recovery and UX focus
 */
export declare class EnhancedErrorHandler extends EventEmitter {
    private recoveryManager;
    private breadcrumbs;
    private errorStrategies;
    private errorHistory;
    private userSessions;
    constructor(recoveryManager: RecoveryManager);
    /**
     * Handle error with enhanced context and user experience
     */
    handleError(error: Error, context: Partial<EnhancedErrorContext>): Promise<{
        handled: boolean;
        recovery: RecoveryOption[];
        userMessage: string;
        shouldRetry: boolean;
    }>;
    /**
     * Add breadcrumb for error context tracking
     */
    addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, 'timestamp'>): void;
    /**
     * Get error patterns and insights
     */
    getErrorInsights(): {
        topErrors: Array<{
            type: ErrorType;
            count: number;
            severity: ErrorSeverity;
        }>;
        errorTrends: Array<{
            date: string;
            count: number;
        }>;
        recoverySuccess: {
            [key in ErrorType]: number;
        };
        userImpactAnalysis: {
            highImpactErrors: number;
            userAffectedSessions: number;
            avgResolutionTime: number;
        };
    };
    /**
     * Create user-friendly error report
     */
    generateUserErrorReport(sessionId?: string): string;
    private enrichErrorContext;
    private classifyError;
    private assessUserImpact;
    private determineSeverity;
    private generateUserMessage;
    private generateTechnicalDetails;
    private generateCorrelationId;
    private initializeErrorStrategies;
    private getErrorStrategy;
    private analyzeError;
    private generateRecoveryOptions;
    private getUserMessage;
    private shouldAutoRetry;
    private attemptAutoRecovery;
    private calculateBackoffDelay;
    private setupEventListeners;
    private getRecentErrors;
    private updateUserSession;
    private generateUserRecommendations;
}
export declare const enhancedErrorHandler: EnhancedErrorHandler;
