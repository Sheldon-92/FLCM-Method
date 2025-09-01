/**
 * Circuit Breaker
 * Automatic rollback on error threshold
 */

import { CircuitState, CircuitBreakerConfig, ErrorThreshold } from './types';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';

interface CircuitMetrics {
  successCount: number;
  errorCount: number;
  lastErrorTime?: Date;
  lastSuccessTime?: Date;
  consecutiveErrors: number;
  consecutiveSuccesses: number;
}

export class CircuitBreaker extends EventEmitter {
  private states: Map<string, CircuitState>;
  private metrics: Map<string, CircuitMetrics>;
  private configs: Map<string, CircuitBreakerConfig>;
  private timers: Map<string, NodeJS.Timeout>;
  private errorWindows: Map<string, Array<{timestamp: Date, isError: boolean}>>;
  private logger: Logger;
  
  private defaultConfig: CircuitBreakerConfig = {
    error_threshold: 0.5,
    success_threshold: 5,
    timeout: 60000, // 1 minute
    half_open_requests: 3
  };
  
  constructor() {
    super();
    this.logger = new Logger('CircuitBreaker');
    this.states = new Map();
    this.metrics = new Map();
    this.configs = new Map();
    this.timers = new Map();
    this.errorWindows = new Map();
  }
  
  /**
   * Check if circuit is open
   */
  isOpen(name: string): boolean {
    const state = this.states.get(name) || 'CLOSED';
    return state === 'OPEN';
  }
  
  /**
   * Check if circuit is half-open
   */
  isHalfOpen(name: string): boolean {
    const state = this.states.get(name) || 'CLOSED';
    return state === 'HALF_OPEN';
  }
  
  /**
   * Get circuit state
   */
  getState(name: string): CircuitState {
    return this.states.get(name) || 'CLOSED';
  }
  
  /**
   * Record successful execution
   */
  recordSuccess(name: string): void {
    const metrics = this.getMetrics(name);
    const state = this.getState(name);
    
    metrics.successCount++;
    metrics.lastSuccessTime = new Date();
    metrics.consecutiveSuccesses++;
    metrics.consecutiveErrors = 0;
    
    // Record in window
    this.recordInWindow(name, false);
    
    // Handle state transitions
    if (state === 'HALF_OPEN') {
      const config = this.getConfig(name);
      
      if (metrics.consecutiveSuccesses >= config.success_threshold) {
        this.close(name);
      }
    }
    
    this.logger.debug(`Success recorded for ${name}`, { state, metrics });
  }
  
  /**
   * Record error
   */
  recordError(name: string): void {
    const metrics = this.getMetrics(name);
    const state = this.getState(name);
    
    metrics.errorCount++;
    metrics.lastErrorTime = new Date();
    metrics.consecutiveErrors++;
    metrics.consecutiveSuccesses = 0;
    
    // Record in window
    this.recordInWindow(name, true);
    
    // Check if we should open the circuit
    if (state === 'CLOSED' || state === 'HALF_OPEN') {
      const errorRate = this.calculateErrorRate(name);
      const config = this.getConfig(name);
      
      if (errorRate > config.error_threshold) {
        this.open(name);
      } else if (state === 'HALF_OPEN') {
        // Immediate open on error in half-open state
        this.open(name);
      }
    }
    
    this.logger.debug(`Error recorded for ${name}`, { state, metrics });
  }
  
  /**
   * Open circuit
   */
  private open(name: string): void {
    const previousState = this.getState(name);
    this.states.set(name, 'OPEN');
    
    // Clear any existing timer
    const existingTimer = this.timers.get(name);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set timer to transition to half-open
    const config = this.getConfig(name);
    const timer = setTimeout(() => {
      this.halfOpen(name);
    }, config.timeout);
    
    this.timers.set(name, timer);
    
    this.logger.warn(`Circuit opened for ${name}`, {
      previousState,
      errorRate: this.calculateErrorRate(name)
    });
    
    // Emit event for monitoring/alerting
    this.emit('circuit-opened', { name, previousState });
  }
  
  /**
   * Transition to half-open state
   */
  private halfOpen(name: string): void {
    const previousState = this.getState(name);
    this.states.set(name, 'HALF_OPEN');
    
    // Reset consecutive counters
    const metrics = this.getMetrics(name);
    metrics.consecutiveErrors = 0;
    metrics.consecutiveSuccesses = 0;
    
    this.logger.info(`Circuit half-opened for ${name}`, { previousState });
    
    this.emit('circuit-half-opened', { name, previousState });
  }
  
  /**
   * Close circuit
   */
  private close(name: string): void {
    const previousState = this.getState(name);
    this.states.set(name, 'CLOSED');
    
    // Clear timer if exists
    const timer = this.timers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(name);
    }
    
    // Reset metrics
    const metrics = this.getMetrics(name);
    metrics.consecutiveErrors = 0;
    metrics.consecutiveSuccesses = 0;
    
    this.logger.info(`Circuit closed for ${name}`, { previousState });
    
    this.emit('circuit-closed', { name, previousState });
  }
  
  /**
   * Force reset circuit
   */
  reset(name: string): void {
    this.states.delete(name);
    this.metrics.delete(name);
    this.errorWindows.delete(name);
    
    const timer = this.timers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(name);
    }
    
    this.logger.info(`Circuit reset for ${name}`);
    
    this.emit('circuit-reset', { name });
  }
  
  /**
   * Configure circuit breaker for specific feature
   */
  configure(name: string, config: Partial<CircuitBreakerConfig>): void {
    const existing = this.configs.get(name) || { ...this.defaultConfig };
    this.configs.set(name, { ...existing, ...config });
    
    this.logger.debug(`Circuit breaker configured for ${name}`, config);
  }
  
  /**
   * Configure from error threshold
   */
  configureFromThreshold(name: string, threshold: ErrorThreshold): void {
    this.configure(name, {
      error_threshold: threshold.rate,
      timeout: threshold.window * 1000 // Convert to milliseconds
    });
  }
  
  /**
   * Get configuration
   */
  private getConfig(name: string): CircuitBreakerConfig {
    return this.configs.get(name) || { ...this.defaultConfig };
  }
  
  /**
   * Get metrics
   */
  private getMetrics(name: string): CircuitMetrics {
    let metrics = this.metrics.get(name);
    
    if (!metrics) {
      metrics = {
        successCount: 0,
        errorCount: 0,
        consecutiveErrors: 0,
        consecutiveSuccesses: 0
      };
      this.metrics.set(name, metrics);
    }
    
    return metrics;
  }
  
  /**
   * Record in sliding window
   */
  private recordInWindow(name: string, isError: boolean): void {
    let window = this.errorWindows.get(name);
    
    if (!window) {
      window = [];
      this.errorWindows.set(name, window);
    }
    
    window.push({
      timestamp: new Date(),
      isError
    });
    
    // Clean old entries (keep last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    this.errorWindows.set(
      name,
      window.filter(entry => entry.timestamp > fiveMinutesAgo)
    );
  }
  
  /**
   * Calculate error rate
   */
  private calculateErrorRate(name: string): number {
    const window = this.errorWindows.get(name);
    if (!window || window.length === 0) {
      return 0;
    }
    
    // Get config for window size
    const config = this.getConfig(name);
    const windowMs = config.timeout || 60000;
    const cutoff = new Date(Date.now() - windowMs);
    
    // Filter to window
    const inWindow = window.filter(entry => entry.timestamp > cutoff);
    
    if (inWindow.length === 0) {
      return 0;
    }
    
    // Need minimum samples
    if (inWindow.length < 5) {
      return 0; // Not enough data
    }
    
    const errors = inWindow.filter(entry => entry.isError).length;
    return errors / inWindow.length;
  }
  
  /**
   * Get all circuit states
   */
  getAllStates(): Map<string, CircuitState> {
    return new Map(this.states);
  }
  
  /**
   * Get statistics
   */
  getStatistics(name?: string): any {
    if (name) {
      const state = this.getState(name);
      const metrics = this.metrics.get(name);
      const errorRate = this.calculateErrorRate(name);
      
      return {
        name,
        state,
        metrics,
        errorRate,
        isOpen: this.isOpen(name)
      };
    }
    
    // Return all statistics
    const stats: any = {
      circuits: {}
    };
    
    for (const [circuitName] of this.states.entries()) {
      stats.circuits[circuitName] = this.getStatistics(circuitName);
    }
    
    return stats;
  }
  
  /**
   * Monitor circuit health
   */
  startMonitoring(intervalMs: number = 10000): void {
    setInterval(() => {
      for (const [name, state] of this.states.entries()) {
        const errorRate = this.calculateErrorRate(name);
        const metrics = this.getMetrics(name);
        
        this.emit('circuit-health', {
          name,
          state,
          errorRate,
          metrics
        });
        
        // Log if unhealthy
        if (state === 'OPEN' || errorRate > 0.3) {
          this.logger.warn(`Circuit health warning for ${name}`, {
            state,
            errorRate,
            metrics
          });
        }
      }
    }, intervalMs);
  }
  
  /**
   * Cleanup timers
   */
  shutdown(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.removeAllListeners();
    
    this.logger.info('Circuit breaker shutdown');
  }
}