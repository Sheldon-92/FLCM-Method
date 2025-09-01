/**
 * Error Recovery Manager
 * Handles error recovery, retries, and fallback strategies
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Error severity levels
 */
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Recovery strategy types
 */
export declare enum RecoveryStrategy {
    RETRY = "retry",
    FALLBACK = "fallback",
    SKIP = "skip",
    ALERT = "alert",
    SHUTDOWN = "shutdown"
}
/**
 * Error context
 */
export interface ErrorContext {
    agent: string;
    operation: string;
    error: Error;
    timestamp: Date;
    severity: ErrorSeverity;
    attempts: number;
    metadata?: Record<string, any>;
}
/**
 * Recovery action
 */
export interface RecoveryAction {
    strategy: RecoveryStrategy;
    execute: () => Promise<any>;
    fallbackValue?: any;
    maxAttempts?: number;
    backoffMs?: number;
}
/**
 * Recovery result
 */
export interface RecoveryResult {
    success: boolean;
    strategy: RecoveryStrategy;
    attempts: number;
    result?: any;
    error?: Error;
}
/**
 * Recovery policy
 */
export interface RecoveryPolicy {
    severity: ErrorSeverity;
    strategies: RecoveryStrategy[];
    maxAttempts: number;
    backoffMultiplier: number;
    alertThreshold: number;
}
/**
 * Error Recovery Manager
 */
export declare class RecoveryManager extends EventEmitter {
    private policies;
    private errorHistory;
    private recoveryStats;
    constructor();
    /**
     * Initialize default recovery policies
     */
    private initializePolicies;
    /**
     * Handle error with recovery
     */
    handleError(context: ErrorContext): Promise<RecoveryResult>;
    /**
     * Execute recovery strategy
     */
    private executeStrategy;
    /**
     * Execute retry strategy with exponential backoff
     */
    private executeRetry;
    /**
     * Execute fallback strategy
     */
    private executeFallback;
    /**
     * Execute skip strategy
     */
    private executeSkip;
    /**
     * Execute shutdown strategy
     */
    private executeShutdown;
    /**
     * Calculate exponential backoff
     */
    private calculateBackoff;
    /**
     * Check if alert should be sent
     */
    private shouldAlert;
    /**
     * Send alert
     */
    private sendAlert;
    /**
     * Emit retry event
     */
    private emitRetryEvent;
    /**
     * Emit fallback event
     */
    private emitFallbackEvent;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Record error statistics
     */
    private recordError;
    /**
     * Record successful recovery
     */
    private recordRecovery;
    /**
     * Record recovery failure
     */
    private recordFailure;
    /**
     * Get error count for agent
     */
    private getErrorCount;
    /**
     * Get recovery statistics
     */
    getStatistics(): typeof this.recoveryStats;
    /**
     * Get error history
     */
    getErrorHistory(agent?: string): ErrorContext[];
    /**
     * Clear error history
     */
    clearHistory(): void;
    /**
     * Update recovery policy
     */
    updatePolicy(severity: ErrorSeverity, policy: RecoveryPolicy): void;
}
export declare const recoveryManager: RecoveryManager;
