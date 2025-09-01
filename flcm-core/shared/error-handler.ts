/**
 * Enhanced Error Handling System for FLCM 2.0
 * Provides comprehensive error management, logging, and recovery mechanisms
 */

import * as fs from 'fs';
import * as path from 'path';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  PROCESSING = 'processing',
  CONFIGURATION = 'configuration',
  RESOURCE = 'resource',
  INTEGRATION = 'integration',
  USER_INPUT = 'user_input',
  SYSTEM = 'system'
}

// Recovery strategies
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  SKIP = 'skip',
  MANUAL_INTERVENTION = 'manual_intervention',
  GRACEFUL_DEGRADATION = 'graceful_degradation'
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
export class EnhancedErrorHandler {
  private config: ErrorHandlingConfig;
  private errorLog: EnhancedError[] = [];
  private logFilePath: string;
  private maxLogSize: number = 100; // Keep last 100 errors in memory
  private alertCallbacks: ((error: EnhancedError) => void)[] = [];

  constructor(config?: Partial<ErrorHandlingConfig>) {
    this.config = {
      logLevel: 'error',
      maxRetries: 3,
      retryDelay: 1000,
      enableDetailedLogging: true,
      alertThresholds: {
        errorRate: 0.05, // 5% error rate threshold
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
  public handleError(
    agentId: string,
    error: Error,
    context: Record<string, any> = {},
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    taskId?: string
  ): EnhancedError {
    const enhancedError: EnhancedError = {
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
        errorCode: (error as any).code,
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
  public async attemptRecovery(
    enhancedError: EnhancedError,
    recoveryAction: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
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
    } catch (recoveryError) {
      this.logRecovery(enhancedError.id, `Recovery failed: ${recoveryError.message}`);
      return { success: false, error: recoveryError as Error };
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation(
    enhancedError: EnhancedError,
    operation: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    let lastError: Error = enhancedError.originalError!;

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
      } catch (error) {
        lastError = error as Error;
        this.logRecovery(enhancedError.id, `Retry attempt ${attempt} failed: ${error.message}`);
      }
    }

    return { success: false, error: lastError };
  }

  /**
   * Execute fallback operation
   */
  private async fallbackOperation(
    enhancedError: EnhancedError,
    primaryOperation: () => Promise<any>
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    try {
      // Try primary operation first
      const result = await primaryOperation();
      this.markAsResolved(enhancedError.id);
      return { success: true, result };
    } catch (error) {
      // Execute fallback based on error category
      const fallbackResult = await this.executeFallback(enhancedError);
      return fallbackResult;
    }
  }

  /**
   * Execute graceful degradation
   */
  private async gracefulDegradation(
    enhancedError: EnhancedError
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
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
  private async executeFallback(
    enhancedError: EnhancedError
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
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
  private async networkFallback(
    enhancedError: EnhancedError
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
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
  private async processingFallback(
    enhancedError: EnhancedError
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    // Use simplified processing or default values
    const simplifiedResult = await this.getSimplifiedProcessingResult(enhancedError.context);
    this.logRecovery(enhancedError.id, 'Using simplified processing as fallback');
    return { success: true, result: simplifiedResult };
  }

  /**
   * Resource-specific fallback
   */
  private async resourceFallback(
    enhancedError: EnhancedError
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    // Reduce resource usage or use alternative resources
    const resourceOptimizedResult = await this.getResourceOptimizedResult(enhancedError.context);
    this.logRecovery(enhancedError.id, 'Using resource-optimized approach as fallback');
    return { success: true, result: resourceOptimizedResult };
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStatistics(): ErrorStatistics {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);

    const stats: ErrorStatistics = {
      totalErrors: this.errorLog.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByAgent: {},
      recoverySuccessRate: this.calculateRecoverySuccessRate(),
      averageResolutionTime: this.calculateAverageResolutionTime(),
      criticalErrorsLast24h: this.errorLog.filter(e => 
        e.severity === ErrorSeverity.CRITICAL && e.timestamp.getTime() > last24h
      ).length,
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
  public onAlert(callback: (error: EnhancedError) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Clear resolved errors older than specified time
   */
  public cleanupOldErrors(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialCount = this.errorLog.length;
    
    this.errorLog = this.errorLog.filter(error => 
      !error.resolved || error.timestamp.getTime() > cutoffTime
    );

    const removedCount = initialCount - this.errorLog.length;
    this.saveLogsToFile();
    return removedCount;
  }

  // Private helper methods
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private assessUserImpact(severity: ErrorSeverity, category: ErrorCategory): string {
    if (severity === ErrorSeverity.CRITICAL) {
      return 'High - Service disruption likely';
    } else if (severity === ErrorSeverity.HIGH) {
      return 'Medium - Feature degradation possible';
    } else {
      return 'Low - Minimal impact expected';
    }
  }

  private logError(error: EnhancedError): void {
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

  private triggerAlerts(error: EnhancedError): void {
    // Trigger alerts for high severity errors
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(error);
        } catch (callbackError) {
          console.error('Alert callback failed:', callbackError);
        }
      });
    }

    // Check alert thresholds
    this.checkAlertThresholds();
  }

  private checkAlertThresholds(): void {
    const recentErrors = this.getRecentErrors(this.config.alertThresholds.timeWindow);
    const criticalErrors = recentErrors.filter(e => e.severity === ErrorSeverity.CRITICAL);

    if (criticalErrors.length >= this.config.alertThresholds.criticalErrorCount) {
      const alertError: EnhancedError = {
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

  private getRecentErrors(timeWindowMs: number): EnhancedError[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.errorLog.filter(error => error.timestamp.getTime() > cutoff);
  }

  private logRecovery(errorId: string, message: string): void {
    if (this.config.enableDetailedLogging) {
      console.log(`[FLCM Recovery] ${errorId}: ${message}`);
    }
  }

  private updateErrorLog(error: EnhancedError): void {
    const index = this.errorLog.findIndex(e => e.id === error.id);
    if (index !== -1) {
      this.errorLog[index] = error;
      this.saveLogsToFile();
    }
  }

  private markAsResolved(errorId: string): void {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolutionTime = new Date();
      this.saveLogsToFile();
    }
  }

  private calculateRecoverySuccessRate(): number {
    const resolvedErrors = this.errorLog.filter(e => e.resolved).length;
    return this.errorLog.length > 0 ? (resolvedErrors / this.errorLog.length) * 100 : 0;
  }

  private calculateAverageResolutionTime(): number {
    const resolvedErrors = this.errorLog.filter(e => e.resolved && e.resolutionTime);
    if (resolvedErrors.length === 0) return 0;

    const totalTime = resolvedErrors.reduce((sum, error) => {
      const resolutionTime = error.resolutionTime!.getTime() - error.timestamp.getTime();
      return sum + resolutionTime;
    }, 0);

    return totalTime / resolvedErrors.length / 1000; // Return in seconds
  }

  private calculateHourlyTrends(): number[] {
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

  private calculateDailyTrends(): number[] {
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

  private calculateWeeklyTrends(): number[] {
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

  private getGracefulDegradationLimitations(category: ErrorCategory): string[] {
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

  private async getCachedData(context: Record<string, any>): Promise<any> {
    // Implementation would fetch cached data based on context
    return null;
  }

  private async getSimplifiedProcessingResult(context: Record<string, any>): Promise<any> {
    // Implementation would provide simplified processing results
    return { status: 'simplified', message: 'Basic processing completed' };
  }

  private async getResourceOptimizedResult(context: Record<string, any>): Promise<any> {
    // Implementation would provide resource-optimized results
    return { status: 'optimized', message: 'Resource-optimized processing completed' };
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private loadExistingLogs(): void {
    try {
      if (fs.existsSync(this.logFilePath)) {
        const logData = fs.readFileSync(this.logFilePath, 'utf-8');
        const logs = JSON.parse(logData);
        this.errorLog = logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          resolutionTime: log.resolutionTime ? new Date(log.resolutionTime) : undefined
        })).slice(-this.maxLogSize);
      }
    } catch (error) {
      console.warn('Failed to load existing error logs:', error.message);
    }
  }

  private saveLogsToFile(): void {
    try {
      fs.writeFileSync(this.logFilePath, JSON.stringify(this.errorLog, null, 2));
    } catch (error) {
      console.warn('Failed to save error logs:', error.message);
    }
  }
}

// Global error handler instance
let globalErrorHandler: EnhancedErrorHandler | null = null;

/**
 * Get or create global error handler instance
 */
export function getErrorHandler(config?: Partial<ErrorHandlingConfig>): EnhancedErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new EnhancedErrorHandler(config);
  }
  return globalErrorHandler;
}

/**
 * Convenience function to handle errors with minimal setup
 */
export function handleAgentError(
  agentId: string,
  error: Error,
  context: Record<string, any> = {},
  category: ErrorCategory = ErrorCategory.SYSTEM,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
): EnhancedError {
  return getErrorHandler().handleError(agentId, error, context, category, severity);
}