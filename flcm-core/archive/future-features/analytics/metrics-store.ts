/**
 * Metrics Store
 * Stores and retrieves time-series metrics data
 */

import { TimeSeries, MetricPoint } from './types';
import { Logger } from '../shared/utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export class MetricsStore {
  private store: Map<string, TimeSeries>;
  private storePath: string;
  private logger: Logger;
  private maxPoints: number = 10000; // Keep last 10k points per metric
  private flushTimer?: NodeJS.Timeout;
  private flushInterval: number = 300000; // 5 minutes
  private pendingWrites: Map<string, any> = new Map();
  
  constructor(storagePath?: string) {
    this.store = new Map();
    this.storePath = storagePath || path.join(process.cwd(), '.flcm-data', 'metrics');
    this.logger = new Logger('MetricsStore');
    
    this.initializeStore();
    this.startPeriodicFlush();
  }
  
  /**
   * Initialize storage directory
   */
  private async initializeStore(): Promise<void> {
    try {
      await fs.mkdir(this.storePath, { recursive: true });
      await this.loadExistingMetrics();
      this.logger.info(`Metrics store initialized at ${this.storePath}`);
    } catch (error) {
      this.logger.error('Failed to initialize metrics store', { error });
    }
  }
  
  /**
   * Load existing metrics from disk
   */
  private async loadExistingMetrics(): Promise<void> {
    try {
      const files = await fs.readdir(this.storePath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const metricName = file.replace('.json', '');
          const filePath = path.join(this.storePath, file);
          
          try {
            const data = await fs.readFile(filePath, 'utf-8');
            const timeSeries: TimeSeries = JSON.parse(data);
            
            // Convert timestamp strings back to Date objects
            timeSeries.points = timeSeries.points.map(p => ({
              ...p,
              timestamp: new Date(p.timestamp)
            }));
            
            this.store.set(metricName, timeSeries);
            this.logger.debug(`Loaded metrics: ${metricName}`, {
              points: timeSeries.points.length
            });
          } catch (error) {
            this.logger.warn(`Failed to load metric file: ${file}`, { error });
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or is empty - that's fine
      this.logger.debug('No existing metrics found');
    }
  }
  
  /**
   * Write metrics for a specific collector
   */
  async writeMetrics(collectorName: string, metrics: Record<string, any>): Promise<void> {
    const timestamp = new Date();
    
    for (const [metricName, value] of Object.entries(metrics)) {
      if (typeof value === 'number') {
        const fullMetricName = `${collectorName}.${metricName}`;
        await this.writeMetricPoint(fullMetricName, value, timestamp);
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        await this.writeNestedMetrics(collectorName, metricName, value, timestamp);
      }
    }
  }
  
  /**
   * Write nested metrics (objects)
   */
  private async writeNestedMetrics(
    collectorName: string,
    baseName: string,
    obj: any,
    timestamp: Date
  ): Promise<void> {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        const fullMetricName = `${collectorName}.${baseName}.${key}`;
        await this.writeMetricPoint(fullMetricName, value, timestamp);
      }
    }
  }
  
  /**
   * Write a single metric point
   */
  async writeMetricPoint(
    metricName: string,
    value: number,
    timestamp: Date,
    labels?: Record<string, string>
  ): Promise<void> {
    let timeSeries = this.store.get(metricName);
    
    if (!timeSeries) {
      timeSeries = {
        name: metricName,
        points: [],
        tags: {}
      };
      this.store.set(metricName, timeSeries);
    }
    
    const point: MetricPoint = {
      timestamp,
      value,
      labels
    };
    
    timeSeries.points.push(point);
    
    // Keep only recent points
    if (timeSeries.points.length > this.maxPoints) {
      timeSeries.points = timeSeries.points.slice(-this.maxPoints);
    }
    
    // Mark for async persistence
    this.pendingWrites.set(metricName, true);
  }
  
  /**
   * Get latest metrics for a collector
   */
  getLatestMetrics(collectorName: string): Record<string, number> | null {
    const metrics: Record<string, number> = {};
    let found = false;
    
    for (const [metricName, timeSeries] of this.store.entries()) {
      if (metricName.startsWith(`${collectorName}.`)) {
        const points = timeSeries.points;
        if (points.length > 0) {
          const latestPoint = points[points.length - 1];
          const shortName = metricName.replace(`${collectorName}.`, '');
          metrics[shortName] = latestPoint.value;
          found = true;
        }
      }
    }
    
    return found ? metrics : null;
  }
  
  /**
   * Get metrics at specific timestamp
   */
  getMetricsAt(collectorName: string, timestamp: Date): Record<string, number> {
    const metrics: Record<string, number> = {};
    const targetTime = timestamp.getTime();
    
    for (const [metricName, timeSeries] of this.store.entries()) {
      if (metricName.startsWith(`${collectorName}.`)) {
        // Find closest point to target timestamp
        let closest: MetricPoint | null = null;
        let minDiff = Infinity;
        
        for (const point of timeSeries.points) {
          const diff = Math.abs(point.timestamp.getTime() - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closest = point;
          }
        }
        
        if (closest) {
          const shortName = metricName.replace(`${collectorName}.`, '');
          metrics[shortName] = closest.value;
        }
      }
    }
    
    return metrics;
  }
  
  /**
   * Get time series data
   */
  getTimeSeries(metricName: string, duration: string = '24h'): MetricPoint[] {
    const timeSeries = this.store.get(metricName);
    if (!timeSeries) return [];
    
    const now = new Date();
    const durationMs = this.parseDuration(duration);
    const cutoff = new Date(now.getTime() - durationMs);
    
    return timeSeries.points.filter(p => p.timestamp >= cutoff);
  }
  
  /**
   * Get metrics in date range
   */
  getMetricsRange(
    collectorName: string,
    startDate: Date,
    endDate: Date
  ): Record<string, MetricPoint[]> {
    const result: Record<string, MetricPoint[]> = {};
    
    for (const [metricName, timeSeries] of this.store.entries()) {
      if (metricName.startsWith(`${collectorName}.`)) {
        const filteredPoints = timeSeries.points.filter(p => 
          p.timestamp >= startDate && p.timestamp <= endDate
        );
        
        if (filteredPoints.length > 0) {
          const shortName = metricName.replace(`${collectorName}.`, '');
          result[shortName] = filteredPoints;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Get previous value for comparison
   */
  getPreviousValue(metricName: string): number | null {
    const timeSeries = this.store.get(metricName);
    if (!timeSeries || timeSeries.points.length < 2) return null;
    
    const secondLast = timeSeries.points[timeSeries.points.length - 2];
    return secondLast.value;
  }
  
  /**
   * Calculate average over time period
   */
  getAverage(metricName: string, startDate: Date, endDate: Date): number {
    const timeSeries = this.store.get(metricName);
    if (!timeSeries) return 0;
    
    const points = timeSeries.points.filter(p => 
      p.timestamp >= startDate && p.timestamp <= endDate
    );
    
    if (points.length === 0) return 0;
    
    const sum = points.reduce((acc, p) => acc + p.value, 0);
    return sum / points.length;
  }
  
  /**
   * Calculate trend (increasing/decreasing)
   */
  getTrend(metricName: string, startDate: Date, endDate: Date): number {
    const timeSeries = this.store.get(metricName);
    if (!timeSeries) return 0;
    
    const points = timeSeries.points.filter(p => 
      p.timestamp >= startDate && p.timestamp <= endDate
    );
    
    if (points.length < 2) return 0;
    
    // Simple linear trend calculation
    const first = points[0].value;
    const last = points[points.length - 1].value;
    
    return ((last - first) / first) * 100;
  }
  
  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([hmd])$/);
    if (!match) return 86400000; // Default 1 day
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'm': return value * 60000;
      case 'h': return value * 3600000;
      case 'd': return value * 86400000;
      default: return 86400000;
    }
  }
  
  /**
   * Start periodic flush to disk
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushToDisk();
    }, this.flushInterval);
  }
  
  /**
   * Flush pending writes to disk
   */
  private async flushToDisk(): Promise<void> {
    if (this.pendingWrites.size === 0) return;
    
    const toFlush = Array.from(this.pendingWrites.keys());
    this.pendingWrites.clear();
    
    const flushPromises = toFlush.map(async (metricName) => {
      const timeSeries = this.store.get(metricName);
      if (!timeSeries) return;
      
      try {
        const filePath = path.join(this.storePath, `${metricName}.json`);
        const data = JSON.stringify(timeSeries, null, 2);
        await fs.writeFile(filePath, data, 'utf-8');
      } catch (error) {
        this.logger.error(`Failed to flush metric: ${metricName}`, { error });
      }
    });
    
    await Promise.all(flushPromises);
    this.logger.debug(`Flushed ${toFlush.length} metrics to disk`);
  }
  
  /**
   * Get store statistics
   */
  getStats(): any {
    let totalPoints = 0;
    const metricCounts: Record<string, number> = {};
    
    for (const [name, timeSeries] of this.store.entries()) {
      totalPoints += timeSeries.points.length;
      const collector = name.split('.')[0];
      metricCounts[collector] = (metricCounts[collector] || 0) + 1;
    }
    
    return {
      totalMetrics: this.store.size,
      totalPoints,
      metricsByCollector: metricCounts,
      storePath: this.storePath,
      pendingWrites: this.pendingWrites.size
    };
  }
  
  /**
   * Cleanup old metrics
   */
  async cleanup(retentionDays: number = 90): Promise<void> {
    const cutoff = new Date(Date.now() - retentionDays * 86400000);
    let cleaned = 0;
    
    for (const timeSeries of this.store.values()) {
      const originalLength = timeSeries.points.length;
      timeSeries.points = timeSeries.points.filter(p => p.timestamp >= cutoff);
      cleaned += originalLength - timeSeries.points.length;
    }
    
    this.logger.info(`Cleaned up ${cleaned} old metric points`);
    await this.flushToDisk();
  }
  
  /**
   * Stop store and flush pending writes
   */
  async stop(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flushToDisk();
    this.logger.info('Metrics store stopped');
  }
}