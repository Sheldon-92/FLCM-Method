/**
 * Performance Monitoring System for FLCM 2.0
 * Tracks agent performance, resource usage, and system health metrics
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';

// Performance metric types
export enum MetricType {
  EXECUTION_TIME = 'execution_time',
  MEMORY_USAGE = 'memory_usage',
  CPU_USAGE = 'cpu_usage',
  THROUGHPUT = 'throughput',
  ERROR_RATE = 'error_rate',
  QUEUE_SIZE = 'queue_size',
  RESPONSE_TIME = 'response_time',
  RESOURCE_UTILIZATION = 'resource_utilization'
}

// Performance thresholds
export interface PerformanceThresholds {
  executionTime: {
    warning: number;
    critical: number;
  };
  memoryUsage: {
    warning: number; // MB
    critical: number; // MB
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
  responseTime: {
    warning: number; // ms
    critical: number; // ms
  };
}

// Performance metric data structure
export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  agentId: string;
  taskId?: string;
  metricType: MetricType;
  value: number;
  unit: string;
  context: Record<string, any>;
  threshold?: {
    warning: number;
    critical: number;
  };
  status: 'normal' | 'warning' | 'critical';
  tags: string[];
}

// Agent performance summary
export interface AgentPerformanceSummary {
  agentId: string;
  totalExecutions: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  errorRate: number;
  throughput: number; // operations per minute
  availability: number; // percentage
  lastActivity: Date;
  healthScore: number; // 0-100
  trends: {
    executionTime: 'improving' | 'stable' | 'degrading';
    memoryUsage: 'improving' | 'stable' | 'degrading';
    errorRate: 'improving' | 'stable' | 'degrading';
  };
}

// System health metrics
export interface SystemHealthMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  processes: {
    total: number;
    running: number;
  };
  uptime: number;
  nodeVersion: string;
  platform: string;
}

/**
 * Enhanced Performance Monitor Class
 */
export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private agentSummaries: Map<string, AgentPerformanceSummary> = new Map();
  private thresholds: PerformanceThresholds;
  private metricsFilePath: string;
  private maxMetricsInMemory: number = 1000;
  private monitoringInterval?: NodeJS.Timeout;
  private systemHealthInterval?: NodeJS.Timeout;
  private alertCallbacks: ((metric: PerformanceMetric) => void)[] = [];

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    super();
    
    this.thresholds = {
      executionTime: {
        warning: 5000, // 5 seconds
        critical: 15000 // 15 seconds
      },
      memoryUsage: {
        warning: 512, // 512 MB
        critical: 1024 // 1 GB
      },
      errorRate: {
        warning: 5, // 5%
        critical: 15 // 15%
      },
      responseTime: {
        warning: 2000, // 2 seconds
        critical: 5000 // 5 seconds
      },
      ...thresholds
    };

    this.metricsFilePath = path.join(process.cwd(), '.flcm-core', 'logs', 'performance.json');
    this.ensureLogDirectory();
    this.loadExistingMetrics();
    this.startSystemMonitoring();
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    agentId: string,
    metricType: MetricType,
    value: number,
    unit: string = 'ms',
    context: Record<string, any> = {},
    taskId?: string,
    tags: string[] = []
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      timestamp: new Date(),
      agentId,
      taskId,
      metricType,
      value,
      unit,
      context,
      threshold: this.getThreshold(metricType),
      status: this.evaluateStatus(metricType, value),
      tags: [...tags, metricType, agentId]
    };

    this.metrics.push(metric);
    this.updateAgentSummary(agentId, metric);
    this.checkAlerts(metric);

    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetricsInMemory) {
      this.metrics = this.metrics.slice(-this.maxMetricsInMemory);
    }

    this.saveMetricsToFile();
    this.emit('metricRecorded', metric);

    return metric;
  }

  /**
   * Start timing an operation
   */
  public startTiming(agentId: string, operation: string, context: Record<string, any> = {}): {
    stop: (taskId?: string, tags?: string[]) => PerformanceMetric;
  } {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    return {
      stop: (taskId?: string, tags: string[] = []) => {
        const endTime = performance.now();
        const endMemory = process.memoryUsage();
        const executionTime = endTime - startTime;
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        // Record execution time
        const timeMetric = this.recordMetric(
          agentId,
          MetricType.EXECUTION_TIME,
          executionTime,
          'ms',
          { ...context, operation, memoryDelta },
          taskId,
          [...tags, operation]
        );

        // Record memory usage if significant
        if (Math.abs(memoryDelta) > 1024 * 1024) { // 1MB threshold
          this.recordMetric(
            agentId,
            MetricType.MEMORY_USAGE,
            endMemory.heapUsed / (1024 * 1024),
            'MB',
            { ...context, operation, memoryDelta },
            taskId,
            [...tags, operation]
          );
        }

        return timeMetric;
      }
    };
  }

  /**
   * Record throughput metric
   */
  public recordThroughput(
    agentId: string,
    operationsCompleted: number,
    timeWindowMs: number,
    context: Record<string, any> = {}
  ): PerformanceMetric {
    const throughputPerMinute = (operationsCompleted / timeWindowMs) * 60000;
    return this.recordMetric(
      agentId,
      MetricType.THROUGHPUT,
      throughputPerMinute,
      'ops/min',
      { ...context, operationsCompleted, timeWindowMs }
    );
  }

  /**
   * Record error rate
   */
  public recordErrorRate(
    agentId: string,
    errorCount: number,
    totalOperations: number,
    context: Record<string, any> = {}
  ): PerformanceMetric {
    const errorRate = totalOperations > 0 ? (errorCount / totalOperations) * 100 : 0;
    return this.recordMetric(
      agentId,
      MetricType.ERROR_RATE,
      errorRate,
      '%',
      { ...context, errorCount, totalOperations }
    );
  }

  /**
   * Get agent performance summary
   */
  public getAgentSummary(agentId: string): AgentPerformanceSummary | undefined {
    return this.agentSummaries.get(agentId);
  }

  /**
   * Get all agent summaries
   */
  public getAllAgentSummaries(): Record<string, AgentPerformanceSummary> {
    const summaries: Record<string, AgentPerformanceSummary> = {};
    this.agentSummaries.forEach((summary, agentId) => {
      summaries[agentId] = summary;
    });
    return summaries;
  }

  /**
   * Get metrics for a specific time range
   */
  public getMetrics(
    timeRangeMs: number,
    agentId?: string,
    metricType?: MetricType
  ): PerformanceMetric[] {
    const cutoff = new Date(Date.now() - timeRangeMs);
    
    return this.metrics.filter(metric => {
      if (metric.timestamp < cutoff) return false;
      if (agentId && metric.agentId !== agentId) return false;
      if (metricType && metric.metricType !== metricType) return false;
      return true;
    });
  }

  /**
   * Get system health metrics
   */
  public getSystemHealth(): SystemHealthMetrics {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: new Date(),
      cpu: {
        usage: 0, // Would need proper CPU usage calculation
        loadAverage: os.loadavg()
      },
      memory: {
        total: os.totalmem(),
        used: memUsage.heapUsed,
        free: os.freemem(),
        percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      disk: {
        total: 0, // Would need disk usage calculation
        used: 0,
        free: 0,
        percentage: 0
      },
      network: {
        bytesIn: 0, // Would need network monitoring
        bytesOut: 0
      },
      processes: {
        total: 0, // Would need process counting
        running: 0
      },
      uptime: os.uptime(),
      nodeVersion: process.version,
      platform: os.platform()
    };
  }

  /**
   * Generate performance report
   */
  public generateReport(timeRangeMs: number = 24 * 60 * 60 * 1000): {
    summary: {
      totalMetrics: number;
      timeRange: string;
      overallHealthScore: number;
      alertsTriggered: number;
    };
    agents: Record<string, AgentPerformanceSummary>;
    systemHealth: SystemHealthMetrics;
    trends: {
      executionTime: number[];
      memoryUsage: number[];
      errorRate: number[];
      throughput: number[];
    };
    recommendations: string[];
  } {
    const metrics = this.getMetrics(timeRangeMs);
    const systemHealth = this.getSystemHealth();
    const agents = this.getAllAgentSummaries();
    
    const overallHealthScore = this.calculateOverallHealthScore(agents);
    const alertsTriggered = metrics.filter(m => m.status !== 'normal').length;

    return {
      summary: {
        totalMetrics: metrics.length,
        timeRange: `${timeRangeMs / (60 * 60 * 1000)}h`,
        overallHealthScore,
        alertsTriggered
      },
      agents,
      systemHealth,
      trends: {
        executionTime: this.calculateTrend(metrics, MetricType.EXECUTION_TIME),
        memoryUsage: this.calculateTrend(metrics, MetricType.MEMORY_USAGE),
        errorRate: this.calculateTrend(metrics, MetricType.ERROR_RATE),
        throughput: this.calculateTrend(metrics, MetricType.THROUGHPUT)
      },
      recommendations: this.generateRecommendations(metrics, agents, systemHealth)
    };
  }

  /**
   * Register alert callback
   */
  public onAlert(callback: (metric: PerformanceMetric) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Start system monitoring
   */
  public startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);

    this.emit('monitoringStarted', { intervalMs });
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.systemHealthInterval) {
      clearInterval(this.systemHealthInterval);
      this.systemHealthInterval = undefined;
    }

    this.emit('monitoringStopped');
  }

  /**
   * Clean up old metrics
   */
  public cleanupOldMetrics(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    const initialCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
    
    const removedCount = initialCount - this.metrics.length;
    this.saveMetricsToFile();
    return removedCount;
  }

  // Private helper methods
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getThreshold(metricType: MetricType): { warning: number; critical: number } | undefined {
    switch (metricType) {
      case MetricType.EXECUTION_TIME:
        return this.thresholds.executionTime;
      case MetricType.MEMORY_USAGE:
        return this.thresholds.memoryUsage;
      case MetricType.ERROR_RATE:
        return this.thresholds.errorRate;
      case MetricType.RESPONSE_TIME:
        return this.thresholds.responseTime;
      default:
        return undefined;
    }
  }

  private evaluateStatus(metricType: MetricType, value: number): 'normal' | 'warning' | 'critical' {
    const threshold = this.getThreshold(metricType);
    if (!threshold) return 'normal';

    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'normal';
  }

  private updateAgentSummary(agentId: string, metric: PerformanceMetric): void {
    let summary = this.agentSummaries.get(agentId);
    
    if (!summary) {
      summary = {
        agentId,
        totalExecutions: 0,
        averageExecutionTime: 0,
        medianExecutionTime: 0,
        p95ExecutionTime: 0,
        p99ExecutionTime: 0,
        averageMemoryUsage: 0,
        peakMemoryUsage: 0,
        errorRate: 0,
        throughput: 0,
        availability: 100,
        lastActivity: new Date(),
        healthScore: 100,
        trends: {
          executionTime: 'stable',
          memoryUsage: 'stable',
          errorRate: 'stable'
        }
      };
    }

    // Update based on metric type
    if (metric.metricType === MetricType.EXECUTION_TIME) {
      summary.totalExecutions++;
      const recentExecutionTimes = this.getMetrics(60 * 60 * 1000, agentId, MetricType.EXECUTION_TIME)
        .map(m => m.value);
      
      if (recentExecutionTimes.length > 0) {
        summary.averageExecutionTime = recentExecutionTimes.reduce((a, b) => a + b, 0) / recentExecutionTimes.length;
        summary.medianExecutionTime = this.calculatePercentile(recentExecutionTimes, 50);
        summary.p95ExecutionTime = this.calculatePercentile(recentExecutionTimes, 95);
        summary.p99ExecutionTime = this.calculatePercentile(recentExecutionTimes, 99);
      }
    }

    if (metric.metricType === MetricType.MEMORY_USAGE) {
      summary.averageMemoryUsage = (summary.averageMemoryUsage + metric.value) / 2;
      summary.peakMemoryUsage = Math.max(summary.peakMemoryUsage, metric.value);
    }

    if (metric.metricType === MetricType.ERROR_RATE) {
      summary.errorRate = metric.value;
    }

    if (metric.metricType === MetricType.THROUGHPUT) {
      summary.throughput = metric.value;
    }

    summary.lastActivity = metric.timestamp;
    summary.healthScore = this.calculateHealthScore(summary);
    summary.trends = this.calculateTrends(agentId);

    this.agentSummaries.set(agentId, summary);
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private calculateHealthScore(summary: AgentPerformanceSummary): number {
    let score = 100;

    // Deduct points for high execution times
    if (summary.averageExecutionTime > this.thresholds.executionTime.warning) {
      score -= 20;
    }
    if (summary.averageExecutionTime > this.thresholds.executionTime.critical) {
      score -= 30;
    }

    // Deduct points for high error rates
    if (summary.errorRate > this.thresholds.errorRate.warning) {
      score -= 15;
    }
    if (summary.errorRate > this.thresholds.errorRate.critical) {
      score -= 25;
    }

    // Deduct points for high memory usage
    if (summary.averageMemoryUsage > this.thresholds.memoryUsage.warning) {
      score -= 10;
    }
    if (summary.averageMemoryUsage > this.thresholds.memoryUsage.critical) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  private calculateTrends(agentId: string): AgentPerformanceSummary['trends'] {
    const recentMetrics = this.getMetrics(60 * 60 * 1000, agentId); // Last hour
    const olderMetrics = this.getMetrics(2 * 60 * 60 * 1000, agentId).filter(m => 
      m.timestamp < new Date(Date.now() - 60 * 60 * 1000)
    ); // Hour before that

    return {
      executionTime: this.compareTrend(
        this.getAverageValue(recentMetrics, MetricType.EXECUTION_TIME),
        this.getAverageValue(olderMetrics, MetricType.EXECUTION_TIME)
      ),
      memoryUsage: this.compareTrend(
        this.getAverageValue(recentMetrics, MetricType.MEMORY_USAGE),
        this.getAverageValue(olderMetrics, MetricType.MEMORY_USAGE)
      ),
      errorRate: this.compareTrend(
        this.getAverageValue(recentMetrics, MetricType.ERROR_RATE),
        this.getAverageValue(olderMetrics, MetricType.ERROR_RATE)
      )
    };
  }

  private getAverageValue(metrics: PerformanceMetric[], type: MetricType): number {
    const filtered = metrics.filter(m => m.metricType === type);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  }

  private compareTrend(recent: number, older: number): 'improving' | 'stable' | 'degrading' {
    if (older === 0) return 'stable';
    const change = (recent - older) / older;
    if (change > 0.1) return 'degrading'; // 10% worse
    if (change < -0.1) return 'improving'; // 10% better
    return 'stable';
  }

  private calculateOverallHealthScore(agents: Record<string, AgentPerformanceSummary>): number {
    const scores = Object.values(agents).map(a => a.healthScore);
    if (scores.length === 0) return 100;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateTrend(metrics: PerformanceMetric[], type: MetricType): number[] {
    const filtered = metrics.filter(m => m.metricType === type);
    // Return hourly averages for the last 24 hours
    const trends = new Array(24).fill(0);
    const counts = new Array(24).fill(0);
    
    filtered.forEach(metric => {
      const hoursDiff = Math.floor((Date.now() - metric.timestamp.getTime()) / (60 * 60 * 1000));
      if (hoursDiff < 24) {
        trends[23 - hoursDiff] += metric.value;
        counts[23 - hoursDiff]++;
      }
    });

    return trends.map((sum, i) => counts[i] > 0 ? sum / counts[i] : 0);
  }

  private generateRecommendations(
    metrics: PerformanceMetric[],
    agents: Record<string, AgentPerformanceSummary>,
    systemHealth: SystemHealthMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Check for high execution times
    Object.values(agents).forEach(agent => {
      if (agent.averageExecutionTime > this.thresholds.executionTime.critical) {
        recommendations.push(`Critical: ${agent.agentId} has very high execution times (${agent.averageExecutionTime.toFixed(2)}ms avg). Consider optimization.`);
      }
      
      if (agent.errorRate > this.thresholds.errorRate.warning) {
        recommendations.push(`Warning: ${agent.agentId} has elevated error rate (${agent.errorRate.toFixed(1)}%). Investigate error patterns.`);
      }
    });

    // Check system health
    if (systemHealth.memory.percentage > 80) {
      recommendations.push('System memory usage is high (>80%). Consider monitoring for memory leaks.');
    }

    // Check for degrading trends
    Object.values(agents).forEach(agent => {
      if (agent.trends.executionTime === 'degrading') {
        recommendations.push(`${agent.agentId} execution time is trending worse. Monitor performance closely.`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('All systems operating within normal parameters.');
    }

    return recommendations;
  }

  private checkAlerts(metric: PerformanceMetric): void {
    if (metric.status !== 'normal') {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(metric);
        } catch (error) {
          console.error('Performance alert callback failed:', error);
        }
      });
    }
  }

  private collectSystemMetrics(): void {
    const systemHealth = this.getSystemHealth();
    
    // Record system-level metrics
    this.recordMetric(
      'system',
      MetricType.MEMORY_USAGE,
      systemHealth.memory.percentage,
      '%',
      { total: systemHealth.memory.total, used: systemHealth.memory.used }
    );

    this.recordMetric(
      'system',
      MetricType.CPU_USAGE,
      systemHealth.cpu.loadAverage[0],
      'load',
      { loadAverage: systemHealth.cpu.loadAverage }
    );
  }

  private startSystemMonitoring(): void {
    // Start system health monitoring
    this.systemHealthInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.metricsFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private loadExistingMetrics(): void {
    try {
      if (fs.existsSync(this.metricsFilePath)) {
        const data = fs.readFileSync(this.metricsFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        this.metrics = parsed.map((metric: any) => ({
          ...metric,
          timestamp: new Date(metric.timestamp)
        })).slice(-this.maxMetricsInMemory);
      }
    } catch (error) {
      const errorMessage = (error as any)?.message || 'Unknown error loading metrics';
      console.warn('Failed to load existing performance metrics:', errorMessage);
    }
  }

  private saveMetricsToFile(): void {
    try {
      fs.writeFileSync(this.metricsFilePath, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      const errorMessage = (error as any)?.message || 'Unknown error saving metrics';
      console.warn('Failed to save performance metrics:', errorMessage);
    }
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global performance monitor instance
 */
export function getPerformanceMonitor(thresholds?: Partial<PerformanceThresholds>): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor(thresholds);
  }
  return globalPerformanceMonitor;
}

/**
 * Convenience function to time an operation
 */
export function timeOperation<T>(
  agentId: string,
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const monitor = getPerformanceMonitor();
  const timer = monitor.startTiming(agentId, operation, context);
  
  return fn().finally(() => {
    timer.stop(undefined, [operation]);
  });
}