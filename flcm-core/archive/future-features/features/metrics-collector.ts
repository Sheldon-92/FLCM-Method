/**
 * Metrics Collector
 * Collects and aggregates feature flag usage metrics
 */

import { FeatureMetrics, PerformanceSample } from './types';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';

export class MetricsCollector extends EventEmitter {
  private metrics: Map<string, FeatureMetrics>;
  private logger: Logger;
  private flushInterval: number = 60000; // 1 minute
  private flushTimer?: NodeJS.Timeout;
  private maxSamplesPerFlag: number = 1000;
  
  constructor() {
    super();
    this.logger = new Logger('MetricsCollector');
    this.metrics = new Map();
    
    // Start periodic flush
    this.startPeriodicFlush();
  }
  
  /**
   * Track feature flag usage
   */
  trackUsage(flagName: string, userId: string, enabled: boolean): void {
    const metric = this.getOrCreateMetric(flagName);
    
    metric.usage_count++;
    if (enabled) {
      metric.enabled_count++;
    } else {
      metric.disabled_count++;
    }
    
    metric.unique_users.add(userId);
    metric.last_updated = new Date();
    
    this.logger.debug(`Usage tracked for ${flagName}`, {
      userId,
      enabled,
      total: metric.usage_count
    });
  }
  
  /**
   * Track performance impact
   */
  trackPerformance(flagName: string, duration: number, userId?: string): void {
    const metric = this.getOrCreateMetric(flagName);
    
    const sample: PerformanceSample = {
      timestamp: new Date(),
      duration,
      user_id: userId || 'anonymous',
      success: true
    };
    
    metric.performance_samples.push(sample);
    
    // Maintain sample size limit
    if (metric.performance_samples.length > this.maxSamplesPerFlag) {
      metric.performance_samples = metric.performance_samples.slice(-this.maxSamplesPerFlag);
    }
    
    metric.last_updated = new Date();
  }
  
  /**
   * Track error
   */
  trackError(flagName: string, userId?: string): void {
    const metric = this.getOrCreateMetric(flagName);
    
    metric.error_count++;
    
    // Add failed performance sample
    const sample: PerformanceSample = {
      timestamp: new Date(),
      duration: 0,
      user_id: userId || 'anonymous',
      success: false
    };
    
    metric.performance_samples.push(sample);
    
    // Update error rate
    this.updateErrorRate(metric);
    
    metric.last_updated = new Date();
    
    this.logger.debug(`Error tracked for ${flagName}`, {
      errorCount: metric.error_count,
      errorRate: metric.error_rate
    });
  }
  
  /**
   * Get or create metric
   */
  private getOrCreateMetric(flagName: string): FeatureMetrics {
    let metric = this.metrics.get(flagName);
    
    if (!metric) {
      metric = {
        flag_name: flagName,
        usage_count: 0,
        enabled_count: 0,
        disabled_count: 0,
        error_count: 0,
        unique_users: new Set(),
        performance_samples: [],
        error_rate: 0,
        last_updated: new Date()
      };
      
      this.metrics.set(flagName, metric);
    }
    
    return metric;
  }
  
  /**
   * Update error rate
   */
  private updateErrorRate(metric: FeatureMetrics): void {
    if (metric.usage_count === 0) {
      metric.error_rate = 0;
    } else {
      metric.error_rate = metric.error_count / metric.usage_count;
    }
  }
  
  /**
   * Get usage metrics for a flag
   */
  getUsageMetrics(flagName: string): any {
    const metric = this.metrics.get(flagName);
    if (!metric) {
      return null;
    }
    
    return {
      total_usage: metric.usage_count,
      enabled_count: metric.enabled_count,
      disabled_count: metric.disabled_count,
      unique_users: metric.unique_users.size,
      adoption_rate: metric.usage_count > 0 
        ? metric.enabled_count / metric.usage_count 
        : 0,
      last_updated: metric.last_updated
    };
  }
  
  /**
   * Get performance metrics for a flag
   */
  getPerformanceMetrics(flagName: string): any {
    const metric = this.metrics.get(flagName);
    if (!metric || metric.performance_samples.length === 0) {
      return null;
    }
    
    const samples = metric.performance_samples;
    const durations = samples
      .filter(s => s.success)
      .map(s => s.duration);
    
    if (durations.length === 0) {
      return {
        sample_count: 0,
        error_rate: 1
      };
    }
    
    return {
      sample_count: samples.length,
      avg_duration: this.average(durations),
      min_duration: Math.min(...durations),
      max_duration: Math.max(...durations),
      p50_duration: this.percentile(durations, 50),
      p95_duration: this.percentile(durations, 95),
      p99_duration: this.percentile(durations, 99),
      error_rate: metric.error_rate,
      error_count: metric.error_count
    };
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, any> {
    const allMetrics = new Map();
    
    for (const [name, metric] of this.metrics.entries()) {
      allMetrics.set(name, {
        usage: this.getUsageMetrics(name),
        performance: this.getPerformanceMetrics(name)
      });
    }
    
    return allMetrics;
  }
  
  /**
   * Get aggregated statistics
   */
  getAggregatedStats(): any {
    const stats = {
      total_flags: this.metrics.size,
      total_usage: 0,
      total_unique_users: new Set<string>(),
      total_errors: 0,
      avg_adoption_rate: 0,
      flags_with_errors: 0
    };
    
    const adoptionRates: number[] = [];
    
    for (const metric of this.metrics.values()) {
      stats.total_usage += metric.usage_count;
      stats.total_errors += metric.error_count;
      
      // Merge unique users
      metric.unique_users.forEach(userId => {
        stats.total_unique_users.add(userId);
      });
      
      // Calculate adoption rate
      if (metric.usage_count > 0) {
        adoptionRates.push(metric.enabled_count / metric.usage_count);
      }
      
      // Count flags with errors
      if (metric.error_count > 0) {
        stats.flags_with_errors++;
      }
    }
    
    // Calculate average adoption rate
    if (adoptionRates.length > 0) {
      stats.avg_adoption_rate = this.average(adoptionRates);
    }
    
    return {
      ...stats,
      total_unique_users: stats.total_unique_users.size
    };
  }
  
  /**
   * Get metrics summary for reporting
   */
  getMetricsSummary(): any {
    const summary: any = {
      timestamp: new Date(),
      flags: {}
    };
    
    for (const [name, metric] of this.metrics.entries()) {
      summary.flags[name] = {
        usage_count: metric.usage_count,
        enabled_count: metric.enabled_count,
        unique_users: metric.unique_users.size,
        error_rate: metric.error_rate,
        avg_performance: this.getAveragePerformance(metric)
      };
    }
    
    summary.aggregated = this.getAggregatedStats();
    
    return summary;
  }
  
  /**
   * Get average performance for a metric
   */
  private getAveragePerformance(metric: FeatureMetrics): number | null {
    const durations = metric.performance_samples
      .filter(s => s.success)
      .map(s => s.duration);
    
    if (durations.length === 0) {
      return null;
    }
    
    return this.average(durations);
  }
  
  /**
   * Calculate average
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  /**
   * Calculate percentile
   */
  private percentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    
    return sorted[Math.min(index, sorted.length - 1)];
  }
  
  /**
   * Start periodic flush of metrics
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  /**
   * Flush metrics (emit for external processing)
   */
  flush(): void {
    const summary = this.getMetricsSummary();
    
    this.emit('metrics-flush', summary);
    
    this.logger.debug('Metrics flushed', {
      flagCount: this.metrics.size,
      totalUsage: summary.aggregated.total_usage
    });
  }
  
  /**
   * Reset metrics for a flag
   */
  resetMetrics(flagName: string): void {
    this.metrics.delete(flagName);
    this.logger.info(`Metrics reset for ${flagName}`);
  }
  
  /**
   * Reset all metrics
   */
  resetAll(): void {
    this.metrics.clear();
    this.logger.info('All metrics reset');
  }
  
  /**
   * Export metrics for persistence
   */
  exportMetrics(): any {
    const exported: any = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      exported[name] = {
        usage_count: metric.usage_count,
        enabled_count: metric.enabled_count,
        disabled_count: metric.disabled_count,
        error_count: metric.error_count,
        unique_users: Array.from(metric.unique_users),
        error_rate: metric.error_rate,
        performance_samples: metric.performance_samples.slice(-100), // Keep last 100
        last_updated: metric.last_updated.toISOString()
      };
    }
    
    return exported;
  }
  
  /**
   * Import metrics from persistence
   */
  importMetrics(data: any): void {
    try {
      Object.entries(data).forEach(([name, metricData]: [string, any]) => {
        const metric: FeatureMetrics = {
          flag_name: name,
          usage_count: metricData.usage_count || 0,
          enabled_count: metricData.enabled_count || 0,
          disabled_count: metricData.disabled_count || 0,
          error_count: metricData.error_count || 0,
          unique_users: new Set(metricData.unique_users || []),
          performance_samples: metricData.performance_samples || [],
          error_rate: metricData.error_rate || 0,
          last_updated: new Date(metricData.last_updated || Date.now())
        };
        
        this.metrics.set(name, metric);
      });
      
      this.logger.info(`Imported metrics for ${Object.keys(data).length} flags`);
    } catch (error) {
      this.logger.error('Failed to import metrics', { error });
    }
  }
  
  /**
   * Shutdown collector
   */
  shutdown(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Final flush
    this.flush();
    
    this.removeAllListeners();
    this.logger.info('Metrics collector shutdown');
  }
}