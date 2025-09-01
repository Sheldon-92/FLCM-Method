/**
 * Circuit Breaker
 * Automatic rollback on error threshold
 */
/// <reference types="node" />
import { CircuitState, CircuitBreakerConfig, ErrorThreshold } from './types';
import { EventEmitter } from 'events';
export declare class CircuitBreaker extends EventEmitter {
    private states;
    private metrics;
    private configs;
    private timers;
    private errorWindows;
    private logger;
    private defaultConfig;
    constructor();
    /**
     * Check if circuit is open
     */
    isOpen(name: string): boolean;
    /**
     * Check if circuit is half-open
     */
    isHalfOpen(name: string): boolean;
    /**
     * Get circuit state
     */
    getState(name: string): CircuitState;
    /**
     * Record successful execution
     */
    recordSuccess(name: string): void;
    /**
     * Record error
     */
    recordError(name: string): void;
    /**
     * Open circuit
     */
    private open;
    /**
     * Transition to half-open state
     */
    private halfOpen;
    /**
     * Close circuit
     */
    private close;
    /**
     * Force reset circuit
     */
    reset(name: string): void;
    /**
     * Configure circuit breaker for specific feature
     */
    configure(name: string, config: Partial<CircuitBreakerConfig>): void;
    /**
     * Configure from error threshold
     */
    configureFromThreshold(name: string, threshold: ErrorThreshold): void;
    /**
     * Get configuration
     */
    private getConfig;
    /**
     * Get metrics
     */
    private getMetrics;
    /**
     * Record in sliding window
     */
    private recordInWindow;
    /**
     * Calculate error rate
     */
    private calculateErrorRate;
    /**
     * Get all circuit states
     */
    getAllStates(): Map<string, CircuitState>;
    /**
     * Get statistics
     */
    getStatistics(name?: string): any;
    /**
     * Monitor circuit health
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Cleanup timers
     */
    shutdown(): void;
}
