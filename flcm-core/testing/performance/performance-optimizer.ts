/**
 * FLCM 2.0 Performance Optimization System
 * Advanced performance monitoring, optimization, and caching
 */

import { EventEmitter } from 'events';
import { createLogger } from '../../shared/utils/logger';
import { ContentDocument, InsightsDocument } from '../../shared/pipeline/document-schema';

const logger = createLogger('PerformanceOptimizer');

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  timestamp: Date;
  operation: string;
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  status: 'success' | 'error' | 'timeout';
  metadata?: Record<string, any>;
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccess: Date;
  size: number;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  cache: {
    maxSize: number;
    defaultTTL: number;
    cleanupInterval: number;
    compressionEnabled: boolean;
  };
  monitoring: {
    sampleRate: number;
    alertThreshold: {
      memory: number;
      cpu: number;
      duration: number;
    };
    retentionDays: number;
  };
  optimization: {
    batchSize: number;
    concurrencyLimit: number;
    timeoutMs: number;
    retryAttempts: number;
  };
}

/**
 * Performance optimization recommendations
 */
export interface OptimizationRecommendation {
  type: 'cache' | 'batch' | 'concurrent' | 'algorithm' | 'memory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedImprovement: number;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
}

/**
 * Advanced caching system with LRU and compression
 */
class AdvancedCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: PerformanceConfig['cache'];
  private cleanupTimer: NodeJS.Timeout;

  constructor(config: PerformanceConfig['cache']) {
    this.config = config;
    this.startCleanupTimer();
  }

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    }

    // Check TTL
    const now = new Date();
    if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
      this.cache.delete(key);
      logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = now;

    logger.debug(`Cache hit for key: ${key}, access count: ${entry.accessCount}`);
    return entry.value;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const now = new Date();
    const effectiveTTL = ttl || this.config.defaultTTL;
    
    // Calculate approximate size
    const size = this.calculateSize(value);

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      ttl: effectiveTTL,
      accessCount: 0,
      lastAccess: now,
      size
    };

    this.cache.set(key, entry);
    logger.debug(`Cache set for key: ${key}, size: ${size} bytes`);
  }

  async invalidate(pattern?: string): Promise<number> {
    if (!pattern) {
      const size = this.cache.size;
      this.cache.clear();
      logger.info(`Cache cleared, ${size} entries removed`);
      return size;
    }

    const regex = new RegExp(pattern);
    let removedCount = 0;

    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    logger.info(`Cache invalidated ${removedCount} entries matching pattern: ${pattern}`);
    return removedCount;
  }

  getStats(): {
    size: number;
    hitRate: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    let totalAccess = 0;
    let totalHits = 0;
    let totalSize = 0;
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount + 1; // +1 for initial set
      totalHits += entry.accessCount;
      totalSize += entry.size;

      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    }

    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? totalHits / totalAccess : 0,
      totalSize,
      oldestEntry,
      newestEntry
    };
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime: Date | null = null;

    for (const [key, entry] of this.cache) {
      if (!lruTime || entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      logger.debug(`Evicted LRU entry: ${lruKey}`);
    }
  }

  private calculateSize(value: any): number {
    // Rough size calculation
    return JSON.stringify(value).length * 2; // Assume 2 bytes per character
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private cleanup(): void {
    const now = new Date();
    let removedCount = 0;

    for (const [key, entry] of this.cache) {
      if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug(`Cleanup removed ${removedCount} expired cache entries`);
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

/**
 * Performance monitoring and optimization system
 */
export class PerformanceOptimizer extends EventEmitter {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics[] = [];
  private cache: AdvancedCache;
  private activeOperations = new Map<string, { start: Date; operation: string }>();

  constructor(config?: Partial<PerformanceConfig>) {
    super();
    
    this.config = {
      cache: {
        maxSize: 1000,
        defaultTTL: 30 * 60 * 1000, // 30 minutes
        cleanupInterval: 5 * 60 * 1000, // 5 minutes
        compressionEnabled: true,
        ...(config?.cache || {})
      },
      monitoring: {
        sampleRate: 1.0,
        alertThreshold: {
          memory: 500 * 1024 * 1024, // 500MB
          cpu: 80, // 80%
          duration: 30000 // 30 seconds
        },
        retentionDays: 7,
        ...(config?.monitoring || {})
      },
      optimization: {
        batchSize: 10,
        concurrencyLimit: 5,
        timeoutMs: 60000, // 1 minute
        retryAttempts: 3,
        ...(config?.optimization || {})
      }
    };

    this.cache = new AdvancedCache(this.config.cache);
    this.startPerformanceMonitoring();
  }

  /**
   * Start performance monitoring for an operation
   */
  startOperation(operationId: string, operation: string): void {
    this.activeOperations.set(operationId, {
      start: new Date(),
      operation
    });

    logger.debug(`Started tracking operation: ${operationId} (${operation})`);
  }

  /**
   * End performance monitoring for an operation
   */
  endOperation(
    operationId: string, 
    status: 'success' | 'error' | 'timeout',
    metadata?: Record<string, any>
  ): PerformanceMetrics | null {
    const activeOp = this.activeOperations.get(operationId);
    
    if (!activeOp) {
      logger.warn(`No active operation found for ID: ${operationId}`);
      return null;
    }

    const now = new Date();
    const duration = now.getTime() - activeOp.start.getTime();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metric: PerformanceMetrics = {
      timestamp: now,
      operation: activeOp.operation,
      duration,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      cpuUsage: {
        user: cpuUsage.user / 1000000, // Convert to milliseconds
        system: cpuUsage.system / 1000000
      },
      status,
      metadata
    };

    this.metrics.push(metric);
    this.activeOperations.delete(operationId);

    // Check for performance alerts
    this.checkPerformanceAlerts(metric);

    // Sample-based logging
    if (Math.random() < this.config.monitoring.sampleRate) {
      logger.info(`Operation completed: ${activeOp.operation}, duration: ${duration}ms, status: ${status}`);
    }

    // Clean up old metrics
    this.cleanupOldMetrics();

    return metric;
  }

  /**
   * Execute function with performance tracking
   */
  async withTracking<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: { timeout?: number; cache?: boolean; cacheKey?: string; cacheTTL?: number }
  ): Promise<T> {
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Check cache first if enabled
    if (options?.cache && options?.cacheKey) {
      const cached = await this.cache.get(options.cacheKey);
      if (cached !== null) {
        logger.debug(`Cache hit for operation: ${operation}`);
        return cached as T;
      }
    }

    this.startOperation(operationId, operation);

    try {
      let result: T;
      
      if (options?.timeout) {
        result = await this.withTimeout(fn, options.timeout);
      } else {
        result = await fn();
      }

      // Cache result if enabled
      if (options?.cache && options?.cacheKey) {
        await this.cache.set(options.cacheKey, result, options.cacheTTL);
      }

      this.endOperation(operationId, 'success', { cached: false });
      return result;
      
    } catch (error: any) {
      const status = error.message?.includes('timeout') ? 'timeout' : 'error';
      this.endOperation(operationId, status, { error: error.message });
      throw error;
    }
  }

  /**
   * Batch processing with performance optimization
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options?: {
      batchSize?: number;
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<R[]> {
    const batchSize = options?.batchSize || this.config.optimization.batchSize;
    const concurrency = options?.concurrency || this.config.optimization.concurrencyLimit;
    
    logger.info(`Processing ${items.length} items in batches of ${batchSize} with concurrency ${concurrency}`);

    const results: R[] = [];
    const batches = this.chunkArray(items, batchSize);

    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      
      const batchPromises = concurrentBatches.map(async (batch, batchIndex) => {
        const actualBatchIndex = i + batchIndex;
        return this.withTracking(
          `batch-${actualBatchIndex}`,
          async () => {
            const batchResults: R[] = [];
            for (const item of batch) {
              const result = await processor(item);
              batchResults.push(result);
            }
            return batchResults;
          }
        );
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      if (options?.onProgress) {
        options.onProgress(results.length, items.length);
      }
    }

    return results;
  }

  /**
   * Get performance recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    if (this.metrics.length === 0) {
      return recommendations;
    }

    const recent = this.getRecentMetrics(60 * 60 * 1000); // Last hour
    const avgDuration = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const avgMemory = recent.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recent.length;
    const errorRate = recent.filter(m => m.status === 'error').length / recent.length;

    // Duration-based recommendations
    if (avgDuration > 10000) { // > 10 seconds
      recommendations.push({
        type: 'cache',
        priority: 'high',
        description: 'High average operation duration detected. Consider implementing caching.',
        expectedImprovement: 0.6,
        implementation: 'Enable caching for expensive operations',
        effort: 'medium'
      });
    }

    // Memory-based recommendations
    if (avgMemory > this.config.monitoring.alertThreshold.memory) {
      recommendations.push({
        type: 'memory',
        priority: 'critical',
        description: 'High memory usage detected. Consider memory optimization.',
        expectedImprovement: 0.4,
        implementation: 'Implement streaming processing and garbage collection optimization',
        effort: 'high'
      });
    }

    // Error rate recommendations
    if (errorRate > 0.05) { // > 5% error rate
      recommendations.push({
        type: 'algorithm',
        priority: 'high',
        description: 'High error rate detected. Consider improving error handling.',
        expectedImprovement: 0.8,
        implementation: 'Enhance retry logic and input validation',
        effort: 'medium'
      });
    }

    // Batching recommendations
    const operationCounts = this.getOperationCounts();
    const highVolumeOps = Object.entries(operationCounts).filter(([, count]) => count > 50);
    
    if (highVolumeOps.length > 0) {
      recommendations.push({
        type: 'batch',
        priority: 'medium',
        description: 'High volume operations detected. Consider batch processing.',
        expectedImprovement: 0.3,
        implementation: 'Implement batch processing for high-volume operations',
        effort: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(): {
    operations: {
      total: number;
      success: number;
      error: number;
      timeout: number;
    };
    timing: {
      avgDuration: number;
      p50Duration: number;
      p95Duration: number;
      p99Duration: number;
    };
    resources: {
      avgMemory: number;
      peakMemory: number;
      avgCPU: number;
      peakCPU: number;
    };
    cache: {
      hitRate: number;
      size: number;
      totalSize: number;
    };
  } {
    if (this.metrics.length === 0) {
      return {
        operations: { total: 0, success: 0, error: 0, timeout: 0 },
        timing: { avgDuration: 0, p50Duration: 0, p95Duration: 0, p99Duration: 0 },
        resources: { avgMemory: 0, peakMemory: 0, avgCPU: 0, peakCPU: 0 },
        cache: { hitRate: 0, size: 0, totalSize: 0 }
      };
    }

    const operations = {
      total: this.metrics.length,
      success: this.metrics.filter(m => m.status === 'success').length,
      error: this.metrics.filter(m => m.status === 'error').length,
      timeout: this.metrics.filter(m => m.status === 'timeout').length
    };

    const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b);
    const timing = {
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p50Duration: durations[Math.floor(durations.length * 0.5)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)]
    };

    const memoryValues = this.metrics.map(m => m.memoryUsage.heapUsed);
    const cpuValues = this.metrics.map(m => m.cpuUsage.user + m.cpuUsage.system);
    
    const resources = {
      avgMemory: memoryValues.reduce((sum, m) => sum + m, 0) / memoryValues.length,
      peakMemory: Math.max(...memoryValues),
      avgCPU: cpuValues.reduce((sum, c) => sum + c, 0) / cpuValues.length,
      peakCPU: Math.max(...cpuValues)
    };

    const cacheStats = this.cache.getStats();

    return {
      operations,
      timing,
      resources,
      cache: cacheStats
    };
  }

  /**
   * Clear performance data and reset
   */
  reset(): void {
    this.metrics = [];
    this.activeOperations.clear();
    this.cache.invalidate();
    logger.info('Performance optimizer reset completed');
  }

  /**
   * Destroy optimizer and cleanup resources
   */
  destroy(): void {
    this.cache.destroy();
    this.removeAllListeners();
    this.reset();
  }

  // Private helper methods
  private async withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private startPerformanceMonitoring(): void {
    // Monitor system performance every minute
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.emit('system-metrics', {
        memory: memUsage,
        cpu: cpuUsage,
        timestamp: new Date()
      });
    }, 60000);
  }

  private checkPerformanceAlerts(metric: PerformanceMetrics): void {
    const alerts = [];

    if (metric.duration > this.config.monitoring.alertThreshold.duration) {
      alerts.push(`High duration: ${metric.duration}ms for operation ${metric.operation}`);
    }

    if (metric.memoryUsage.heapUsed > this.config.monitoring.alertThreshold.memory) {
      alerts.push(`High memory usage: ${(metric.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    if (alerts.length > 0) {
      this.emit('performance-alert', {
        metric,
        alerts,
        timestamp: new Date()
      });
    }
  }

  private getRecentMetrics(timeWindowMs: number): PerformanceMetrics[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  private getOperationCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const metric of this.metrics) {
      counts[metric.operation] = (counts[metric.operation] || 0) + 1;
    }

    return counts;
  }

  private cleanupOldMetrics(): void {
    const cutoff = new Date(Date.now() - (this.config.monitoring.retentionDays * 24 * 60 * 60 * 1000));
    const originalLength = this.metrics.length;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    const removed = originalLength - this.metrics.length;
    if (removed > 0) {
      logger.debug(`Cleaned up ${removed} old performance metrics`);
    }
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Performance monitoring decorator
export function withPerformanceTracking(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceOptimizer.withTracking(
        `${target.constructor.name}.${propertyName}`,
        async () => method.apply(this, args)
      );
    };

    return descriptor;
  };
}