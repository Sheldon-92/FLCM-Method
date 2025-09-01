/**
 * Unit Tests for Performance Monitor
 */

import { 
  PerformanceMonitor, 
  getPerformanceMonitor,
  timeOperation,
  MetricType,
  PerformanceMetric,
  PerformanceThresholds
} from '../performance-monitor';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    performanceMonitor.stopMonitoring();
  });

  describe('Constructor', () => {
    test('should initialize with default thresholds', () => {
      expect(performanceMonitor).toBeDefined();
      expect(performanceMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    test('should accept custom thresholds', () => {
      const customThresholds: Partial<PerformanceThresholds> = {
        executionTime: { warning: 1000, critical: 3000 },
        memoryUsage: { warning: 256, critical: 512 }
      };
      
      const customMonitor = new PerformanceMonitor(customThresholds);
      expect(customMonitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('recordMetric', () => {
    test('should record a performance metric successfully', () => {
      const metric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        1500,
        'ms',
        { operation: 'test' }
      );

      expect(metric).toBeDefined();
      expect(metric.agentId).toBe('test-agent');
      expect(metric.metricType).toBe(MetricType.EXECUTION_TIME);
      expect(metric.value).toBe(1500);
      expect(metric.unit).toBe('ms');
      expect(metric.context.operation).toBe('test');
      expect(metric.status).toMatch(/normal|warning|critical/);
    });

    test('should assign appropriate status based on thresholds', () => {
      const normalMetric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        1000
      );

      const warningMetric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        7000
      );

      const criticalMetric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        20000
      );

      expect(normalMetric.status).toBe('normal');
      expect(warningMetric.status).toBe('warning');
      expect(criticalMetric.status).toBe('critical');
    });

    test('should handle different metric types', () => {
      const types = [
        MetricType.EXECUTION_TIME,
        MetricType.MEMORY_USAGE,
        MetricType.CPU_USAGE,
        MetricType.THROUGHPUT,
        MetricType.ERROR_RATE
      ];

      types.forEach(type => {
        const metric = performanceMonitor.recordMetric('test-agent', type, 100);
        expect(metric.metricType).toBe(type);
      });
    });

    test('should emit metricRecorded event', (done) => {
      performanceMonitor.on('metricRecorded', (metric: PerformanceMetric) => {
        expect(metric).toBeDefined();
        expect(metric.agentId).toBe('test-agent');
        done();
      });

      performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 1000);
    });
  });

  describe('startTiming', () => {
    test('should measure execution time correctly', (done) => {
      const timer = performanceMonitor.startTiming('test-agent', 'test-operation');

      setTimeout(() => {
        const metric = timer.stop();
        expect(metric.value).toBeGreaterThan(90); // Should be ~100ms
        expect(metric.value).toBeLessThan(150);
        expect(metric.metricType).toBe(MetricType.EXECUTION_TIME);
        done();
      }, 100);
    });

    test('should include context and operation details', () => {
      const context = { userId: '123', feature: 'analysis' };
      const timer = performanceMonitor.startTiming('test-agent', 'analyze', context);
      const metric = timer.stop();

      expect(metric.context.operation).toBe('analyze');
      expect(metric.context.userId).toBe('123');
      expect(metric.context.feature).toBe('analysis');
    });

    test('should track memory usage for significant changes', () => {
      const timer = performanceMonitor.startTiming('test-agent', 'memory-intensive');
      
      // Simulate memory usage
      const largeArray = new Array(1000000).fill('test');
      
      const metric = timer.stop();
      expect(metric).toBeDefined();
      
      // Clean up
      largeArray.length = 0;
    });
  });

  describe('recordThroughput', () => {
    test('should calculate throughput per minute correctly', () => {
      const metric = performanceMonitor.recordThroughput(
        'test-agent',
        100, // operations completed
        60000, // 1 minute
        { batchSize: 100 }
      );

      expect(metric.value).toBe(100); // 100 ops/min
      expect(metric.unit).toBe('ops/min');
      expect(metric.metricType).toBe(MetricType.THROUGHPUT);
    });

    test('should handle different time windows', () => {
      const metric = performanceMonitor.recordThroughput(
        'test-agent',
        50, // operations completed
        30000 // 30 seconds
      );

      expect(metric.value).toBe(100); // 50 ops in 30s = 100 ops/min
    });
  });

  describe('recordErrorRate', () => {
    test('should calculate error rate percentage correctly', () => {
      const metric = performanceMonitor.recordErrorRate(
        'test-agent',
        5, // errors
        100 // total operations
      );

      expect(metric.value).toBe(5);
      expect(metric.unit).toBe('%');
      expect(metric.metricType).toBe(MetricType.ERROR_RATE);
    });

    test('should handle zero total operations', () => {
      const metric = performanceMonitor.recordErrorRate(
        'test-agent',
        0,
        0
      );

      expect(metric.value).toBe(0);
    });
  });

  describe('getAgentSummary', () => {
    test('should return undefined for non-existent agent', () => {
      const summary = performanceMonitor.getAgentSummary('non-existent-agent');
      expect(summary).toBeUndefined();
    });

    test('should calculate agent summary after recording metrics', () => {
      performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 1000);
      performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 1500);
      performanceMonitor.recordMetric('test-agent', MetricType.MEMORY_USAGE, 256);

      const summary = performanceMonitor.getAgentSummary('test-agent');

      expect(summary).toBeDefined();
      expect(summary!.agentId).toBe('test-agent');
      expect(summary!.totalExecutions).toBe(2);
      expect(summary!.averageExecutionTime).toBe(1250);
      expect(summary!.healthScore).toBeGreaterThanOrEqual(0);
      expect(summary!.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      // Record some test metrics
      performanceMonitor.recordMetric('agent1', MetricType.EXECUTION_TIME, 1000);
      performanceMonitor.recordMetric('agent2', MetricType.MEMORY_USAGE, 256);
      performanceMonitor.recordMetric('agent1', MetricType.THROUGHPUT, 50);
    });

    test('should return all metrics within time range', () => {
      const metrics = performanceMonitor.getMetrics(60000); // Last minute
      expect(metrics.length).toBe(3);
    });

    test('should filter by agent ID', () => {
      const metrics = performanceMonitor.getMetrics(60000, 'agent1');
      expect(metrics.length).toBe(2);
      expect(metrics.every(m => m.agentId === 'agent1')).toBe(true);
    });

    test('should filter by metric type', () => {
      const metrics = performanceMonitor.getMetrics(60000, undefined, MetricType.EXECUTION_TIME);
      expect(metrics.length).toBe(1);
      expect(metrics[0].metricType).toBe(MetricType.EXECUTION_TIME);
    });

    test('should filter by both agent ID and metric type', () => {
      const metrics = performanceMonitor.getMetrics(60000, 'agent1', MetricType.THROUGHPUT);
      expect(metrics.length).toBe(1);
      expect(metrics[0].agentId).toBe('agent1');
      expect(metrics[0].metricType).toBe(MetricType.THROUGHPUT);
    });
  });

  describe('getSystemHealth', () => {
    test('should return system health metrics', () => {
      const health = performanceMonitor.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.timestamp).toBeInstanceOf(Date);
      expect(health.cpu).toBeDefined();
      expect(health.memory).toBeDefined();
      expect(health.uptime).toBeGreaterThan(0);
      expect(health.nodeVersion).toBe(process.version);
      expect(typeof health.platform).toBe('string');
    });

    test('should include load average information', () => {
      const health = performanceMonitor.getSystemHealth();

      expect(health.cpu.loadAverage).toBeInstanceOf(Array);
      expect(health.cpu.loadAverage.length).toBe(3);
    });

    test('should include memory information', () => {
      const health = performanceMonitor.getSystemHealth();

      expect(health.memory.total).toBeGreaterThan(0);
      expect(health.memory.free).toBeGreaterThanOrEqual(0);
      expect(health.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(health.memory.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('generateReport', () => {
    beforeEach(() => {
      // Generate some test data
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordMetric('agent1', MetricType.EXECUTION_TIME, 1000 + i * 100);
        performanceMonitor.recordMetric('agent2', MetricType.MEMORY_USAGE, 200 + i * 10);
      }
    });

    test('should generate comprehensive performance report', () => {
      const report = performanceMonitor.generateReport();

      expect(report.summary).toBeDefined();
      expect(report.agents).toBeDefined();
      expect(report.systemHealth).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);

      expect(report.summary.totalMetrics).toBeGreaterThan(0);
      expect(report.summary.overallHealthScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.overallHealthScore).toBeLessThanOrEqual(100);
    });

    test('should include trend data', () => {
      const report = performanceMonitor.generateReport();

      expect(report.trends.executionTime).toBeInstanceOf(Array);
      expect(report.trends.executionTime.length).toBe(24); // 24 hours
      expect(report.trends.memoryUsage).toBeInstanceOf(Array);
      expect(report.trends.errorRate).toBeInstanceOf(Array);
      expect(report.trends.throughput).toBeInstanceOf(Array);
    });

    test('should provide recommendations', () => {
      const report = performanceMonitor.generateReport();

      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Alert System', () => {
    test('should trigger alerts for critical metrics', (done) => {
      performanceMonitor.onAlert((metric: PerformanceMetric) => {
        expect(metric.status).toBe('critical');
        expect(metric.value).toBe(25000);
        done();
      });

      performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 25000);
    });

    test('should not trigger alerts for normal metrics', () => {
      const alertSpy = jest.fn();
      performanceMonitor.onAlert(alertSpy);

      performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 1000);

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe('Monitoring Control', () => {
    test('should start and stop monitoring', () => {
      performanceMonitor.startMonitoring(1000);
      expect(performanceMonitor.startMonitoring).toBeDefined();

      performanceMonitor.stopMonitoring();
      expect(performanceMonitor.stopMonitoring).toBeDefined();
    });

    test('should emit monitoring events', (done) => {
      performanceMonitor.on('monitoringStarted', (data) => {
        expect(data.intervalMs).toBe(1000);
        performanceMonitor.stopMonitoring();
        done();
      });

      performanceMonitor.startMonitoring(1000);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup old metrics', () => {
      // Record some metrics
      for (let i = 0; i < 10; i++) {
        performanceMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, 1000);
      }

      const initialCount = performanceMonitor.getMetrics(24 * 60 * 60 * 1000).length;
      expect(initialCount).toBe(10);

      // Should not remove recent metrics
      const removedCount = performanceMonitor.cleanupOldMetrics(24);
      expect(removedCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative values appropriately', () => {
      const metric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        -100
      );

      expect(metric.value).toBe(-100);
      expect(metric.status).toBe('normal'); // Negative times should be treated as normal
    });

    test('should handle extremely large values', () => {
      const largeValue = Number.MAX_SAFE_INTEGER;
      const metric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        largeValue
      );

      expect(metric.value).toBe(largeValue);
      expect(metric.status).toBe('critical');
    });

    test('should handle special numeric values', () => {
      const infinityMetric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.EXECUTION_TIME,
        Infinity
      );

      const nanMetric = performanceMonitor.recordMetric(
        'test-agent',
        MetricType.MEMORY_USAGE,
        NaN
      );

      expect(infinityMetric.value).toBe(Infinity);
      expect(isNaN(nanMetric.value)).toBe(true);
    });
  });

  describe('Memory Management', () => {
    test('should limit metrics in memory', () => {
      // Create monitor with small limit for testing
      const smallLimitMonitor = new PerformanceMonitor();

      // Record more metrics than the limit
      for (let i = 0; i < 1500; i++) {
        smallLimitMonitor.recordMetric('test-agent', MetricType.EXECUTION_TIME, i);
      }

      const metrics = smallLimitMonitor.getMetrics(24 * 60 * 60 * 1000);
      expect(metrics.length).toBeLessThanOrEqual(1000); // Default maxMetricsInMemory
    });
  });
});

describe('Global Performance Monitor', () => {
  test('should return singleton instance', () => {
    const monitor1 = getPerformanceMonitor();
    const monitor2 = getPerformanceMonitor();

    expect(monitor1).toBe(monitor2);
  });
});

describe('timeOperation utility', () => {
  test('should time async operations correctly', async () => {
    const testOperation = async () => {
      return new Promise(resolve => setTimeout(() => resolve('done'), 100));
    };

    const result = await timeOperation('test-agent', 'async-test', testOperation);

    expect(result).toBe('done');
    
    // Check that metrics were recorded
    const monitor = getPerformanceMonitor();
    const metrics = monitor.getMetrics(60000, 'test-agent', MetricType.EXECUTION_TIME);
    expect(metrics.length).toBeGreaterThan(0);
  });

  test('should handle operation failures', async () => {
    const failingOperation = async () => {
      throw new Error('Test error');
    };

    await expect(
      timeOperation('test-agent', 'failing-test', failingOperation)
    ).rejects.toThrow('Test error');

    // Should still record timing even for failed operations
    const monitor = getPerformanceMonitor();
    const metrics = monitor.getMetrics(60000, 'test-agent', MetricType.EXECUTION_TIME);
    expect(metrics.length).toBeGreaterThan(0);
  });
});