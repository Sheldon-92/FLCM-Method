/**
 * FLCM 2.0 Monitoring System
 * Real-time monitoring, metrics collection, and alerting
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';

interface MetricData {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  metric?: string;
  threshold?: number;
  value?: number;
}

interface MonitoringConfig {
  interval: number; // seconds
  retention: number; // hours
  thresholds: {
    memory: number; // percentage
    disk: number; // percentage
    cpu: number; // percentage
    errorRate: number; // percentage
  };
  alerts: {
    enabled: boolean;
    webhookUrl?: string;
    email?: string;
  };
}

export class MonitoringSystem extends EventEmitter {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Alert[] = [];
  private config: MonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly dataDir: string;
  private readonly logFile: string;

  constructor(config?: Partial<MonitoringConfig>) {
    super();
    
    this.config = {
      interval: 30, // 30 seconds
      retention: 24, // 24 hours
      thresholds: {
        memory: 80,
        disk: 85,
        cpu: 90,
        errorRate: 5
      },
      alerts: {
        enabled: true
      },
      ...config
    };

    this.dataDir = path.join(__dirname, '..', 'data', 'monitoring');
    this.logFile = path.join(this.dataDir, 'monitoring.log');
    
    this.initializeDataDirectory();
    this.loadHistoricalData();
  }

  /**
   * Start monitoring system
   */
  start(): void {
    if (this.monitoringInterval) {
      this.log('Monitoring system already running');
      return;
    }

    this.log('Starting FLCM 2.0 monitoring system...');
    
    // Collect initial metrics
    this.collectMetrics();
    
    // Start periodic collection
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval * 1000);

    // Clean up old data periodically (every hour)
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);

    this.log('Monitoring system started successfully');
    this.emit('started');
  }

  /**
   * Stop monitoring system
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.log('Monitoring system stopped');
      this.emit('stopped');
    }
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();

    try {
      // System metrics
      await this.collectSystemMetrics(timestamp);
      
      // FLCM-specific metrics
      await this.collectFlcmMetrics(timestamp);
      
      // Check thresholds and generate alerts
      this.checkThresholds();
      
      // Persist metrics
      this.persistMetrics();
      
    } catch (error) {
      this.log(`Error collecting metrics: ${error}`, 'error');
      this.recordMetric('system.errors', 1, timestamp);
    }
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics(timestamp: number): Promise<void> {
    // Memory metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercentage = (usedMem / totalMem) * 100;

    this.recordMetric('system.memory.total', totalMem, timestamp);
    this.recordMetric('system.memory.used', usedMem, timestamp);
    this.recordMetric('system.memory.free', freeMem, timestamp);
    this.recordMetric('system.memory.percentage', memoryPercentage, timestamp);

    // CPU metrics
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    this.recordMetric('system.cpu.cores', cpus.length, timestamp);
    this.recordMetric('system.cpu.load1', loadAvg[0], timestamp);
    this.recordMetric('system.cpu.load5', loadAvg[1], timestamp);
    this.recordMetric('system.cpu.load15', loadAvg[2], timestamp);

    // Process metrics
    const processMemory = process.memoryUsage();
    this.recordMetric('process.memory.rss', processMemory.rss, timestamp);
    this.recordMetric('process.memory.heapTotal', processMemory.heapTotal, timestamp);
    this.recordMetric('process.memory.heapUsed', processMemory.heapUsed, timestamp);
    this.recordMetric('process.memory.external', processMemory.external, timestamp);
    this.recordMetric('process.uptime', process.uptime(), timestamp);

    // Disk space (try to get disk info)
    try {
      const stats = await this.getDiskUsage();
      if (stats) {
        this.recordMetric('system.disk.total', stats.total, timestamp);
        this.recordMetric('system.disk.used', stats.used, timestamp);
        this.recordMetric('system.disk.available', stats.available, timestamp);
        this.recordMetric('system.disk.percentage', stats.percentage, timestamp);
      }
    } catch (error) {
      this.log(`Could not collect disk metrics: ${error}`, 'warn');
    }
  }

  /**
   * Collect FLCM-specific metrics
   */
  private async collectFlcmMetrics(timestamp: number): Promise<void> {
    try {
      // Agent status
      const agentsDir = path.join(__dirname, '..', 'agents');
      if (fs.existsSync(agentsDir)) {
        const agents = fs.readdirSync(agentsDir).filter(f => 
          fs.statSync(path.join(agentsDir, f)).isDirectory()
        );
        this.recordMetric('flcm.agents.count', agents.length, timestamp);
      }

      // Pipeline status
      const pipelineDir = path.join(__dirname, '..', 'pipeline');
      if (fs.existsSync(pipelineDir)) {
        const components = fs.readdirSync(pipelineDir).filter(f => 
          f.endsWith('.ts') || f.endsWith('.js')
        );
        this.recordMetric('flcm.pipeline.components', components.length, timestamp);
      }

      // Configuration status
      const configPath = path.join(__dirname, '..', 'core-config.yaml');
      if (fs.existsSync(configPath)) {
        const stats = fs.statSync(configPath);
        this.recordMetric('flcm.config.lastModified', stats.mtime.getTime(), timestamp);
        this.recordMetric('flcm.config.size', stats.size, timestamp);
      }

      // Build status
      const distDir = path.join(__dirname, '..', 'dist');
      if (fs.existsSync(distDir)) {
        const builtFiles = this.countFiles(distDir, ['.js', '.d.ts']);
        this.recordMetric('flcm.build.files', builtFiles, timestamp);
        
        const stats = fs.statSync(distDir);
        this.recordMetric('flcm.build.lastModified', stats.mtime.getTime(), timestamp);
      }

    } catch (error) {
      this.log(`Error collecting FLCM metrics: ${error}`, 'warn');
    }
  }

  /**
   * Record a metric data point
   */
  private recordMetric(name: string, value: number, timestamp?: number, labels?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({
      timestamp: timestamp || Date.now(),
      value,
      labels
    });

    // Keep only recent data
    const cutoff = Date.now() - (this.config.retention * 60 * 60 * 1000);
    const filtered = metrics.filter(m => m.timestamp >= cutoff);
    this.metrics.set(name, filtered);

    this.emit('metric', { name, value, timestamp, labels });
  }

  /**
   * Get metric data
   */
  getMetrics(name: string, since?: number): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    if (since) {
      return metrics.filter(m => m.timestamp >= since);
    }
    return [...metrics];
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get current system snapshot
   */
  getCurrentSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        const latest = metrics[metrics.length - 1];
        snapshot[name] = {
          value: latest.value,
          timestamp: latest.timestamp,
          labels: latest.labels
        };
      }
    }

    return snapshot;
  }

  /**
   * Check thresholds and generate alerts
   */
  private checkThresholds(): void {
    const now = Date.now();
    
    // Memory threshold
    const memoryMetrics = this.metrics.get('system.memory.percentage');
    if (memoryMetrics && memoryMetrics.length > 0) {
      const latest = memoryMetrics[memoryMetrics.length - 1];
      if (latest.value > this.config.thresholds.memory) {
        this.createAlert(
          'memory-high',
          'warning',
          `Memory usage is ${latest.value.toFixed(1)}% (threshold: ${this.config.thresholds.memory}%)`,
          'system.memory.percentage',
          this.config.thresholds.memory,
          latest.value
        );
      }
    }

    // Disk threshold
    const diskMetrics = this.metrics.get('system.disk.percentage');
    if (diskMetrics && diskMetrics.length > 0) {
      const latest = diskMetrics[diskMetrics.length - 1];
      if (latest.value > this.config.thresholds.disk) {
        this.createAlert(
          'disk-high',
          latest.value > 95 ? 'critical' : 'warning',
          `Disk usage is ${latest.value.toFixed(1)}% (threshold: ${this.config.thresholds.disk}%)`,
          'system.disk.percentage',
          this.config.thresholds.disk,
          latest.value
        );
      }
    }

    // CPU load threshold (based on 1-minute load average)
    const cpuMetrics = this.metrics.get('system.cpu.load1');
    if (cpuMetrics && cpuMetrics.length > 0) {
      const latest = cpuMetrics[cpuMetrics.length - 1];
      const cpuCores = os.cpus().length;
      const cpuPercentage = (latest.value / cpuCores) * 100;
      
      if (cpuPercentage > this.config.thresholds.cpu) {
        this.createAlert(
          'cpu-high',
          cpuPercentage > 150 ? 'critical' : 'warning',
          `CPU load is ${cpuPercentage.toFixed(1)}% (threshold: ${this.config.thresholds.cpu}%)`,
          'system.cpu.load1',
          this.config.thresholds.cpu,
          cpuPercentage
        );
      }
    }
  }

  /**
   * Create an alert
   */
  private createAlert(id: string, level: Alert['level'], message: string, metric?: string, threshold?: number, value?: number): void {
    // Check if this alert already exists and is unresolved
    const existingAlert = this.alerts.find(a => a.id === id && !a.resolved);
    if (existingAlert) {
      // Update existing alert
      existingAlert.timestamp = Date.now();
      existingAlert.message = message;
      existingAlert.value = value;
    } else {
      // Create new alert
      const alert: Alert = {
        id,
        level,
        message,
        timestamp: Date.now(),
        resolved: false,
        metric,
        threshold,
        value
      };
      
      this.alerts.push(alert);
      this.log(`Alert created: [${level.toUpperCase()}] ${message}`, level);
      this.emit('alert', alert);
      
      // Send notification if configured
      if (this.config.alerts.enabled) {
        this.sendNotification(alert);
      }
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id && !a.resolved);
    if (alert) {
      alert.resolved = true;
      this.log(`Alert resolved: ${alert.message}`, 'info');
      this.emit('alert-resolved', alert);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(since?: number): Alert[] {
    let alerts = this.alerts;
    if (since) {
      alerts = alerts.filter(a => a.timestamp >= since);
    }
    return [...alerts];
  }

  /**
   * Send notification for alert
   */
  private async sendNotification(alert: Alert): Promise<void> {
    try {
      // Webhook notification
      if (this.config.alerts.webhookUrl) {
        // Implementation would depend on webhook format
        this.log(`Would send webhook notification for alert: ${alert.id}`, 'info');
      }

      // Email notification
      if (this.config.alerts.email) {
        // Implementation would depend on email service
        this.log(`Would send email notification to ${this.config.alerts.email} for alert: ${alert.id}`, 'info');
      }
    } catch (error) {
      this.log(`Failed to send notification for alert ${alert.id}: ${error}`, 'error');
    }
  }

  /**
   * Generate monitoring dashboard data
   */
  getDashboardData(): Record<string, any> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return {
      timestamp: now,
      system: {
        memory: this.getLatestMetric('system.memory.percentage'),
        disk: this.getLatestMetric('system.disk.percentage'),
        cpu: this.getLatestMetric('system.cpu.load1'),
        uptime: this.getLatestMetric('process.uptime')
      },
      flcm: {
        agents: this.getLatestMetric('flcm.agents.count'),
        components: this.getLatestMetric('flcm.pipeline.components'),
        buildFiles: this.getLatestMetric('flcm.build.files')
      },
      alerts: {
        active: this.getActiveAlerts().length,
        recent: this.getAllAlerts(oneHourAgo).length
      },
      metrics: {
        total: this.metrics.size,
        dataPoints: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0)
      }
    };
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    const data = {
      timestamp: Date.now(),
      config: this.config,
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.metrics) {
        this.metrics = new Map(Object.entries(data.metrics));
      }
      
      if (data.alerts) {
        this.alerts = data.alerts;
      }
      
      this.log('Metrics imported successfully');
    } catch (error) {
      this.log(`Failed to import metrics: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private getLatestMetric(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (metrics && metrics.length > 0) {
      return metrics[metrics.length - 1].value;
    }
    return null;
  }

  private async getDiskUsage(): Promise<{ total: number; used: number; available: number; percentage: number } | null> {
    try {
      const { execSync } = require('child_process');
      const output = execSync(`df -k ${__dirname}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const data = lines[1].split(/\s+/);
      
      const total = parseInt(data[1]) * 1024; // Convert from KB to bytes
      const available = parseInt(data[3]) * 1024;
      const used = total - available;
      const percentage = (used / total) * 100;
      
      return { total, used, available, percentage };
    } catch (error) {
      return null;
    }
  }

  private countFiles(dir: string, extensions: string[]): number {
    let count = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          count += this.countFiles(fullPath, extensions);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          count++;
        }
      }
    } catch (error) {
      // Ignore errors (permission denied, etc.)
    }
    
    return count;
  }

  private initializeDataDirectory(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to initialize monitoring data directory:', error);
    }
  }

  private loadHistoricalData(): void {
    try {
      const dataFile = path.join(this.dataDir, 'metrics.json');
      if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8');
        this.importMetrics(data);
        this.log('Historical monitoring data loaded');
      }
    } catch (error) {
      this.log(`Could not load historical data: ${error}`, 'warn');
    }
  }

  private persistMetrics(): void {
    try {
      const dataFile = path.join(this.dataDir, 'metrics.json');
      const data = this.exportMetrics();
      fs.writeFileSync(dataFile, data);
    } catch (error) {
      this.log(`Could not persist metrics: ${error}`, 'error');
    }
  }

  private cleanupOldData(): void {
    const cutoff = Date.now() - (this.config.retention * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [name, metrics] of this.metrics.entries()) {
      const originalLength = metrics.length;
      const filtered = metrics.filter(m => m.timestamp >= cutoff);
      this.metrics.set(name, filtered);
      cleaned += originalLength - filtered.length;
    }
    
    // Clean up old alerts
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoff);
    
    if (cleaned > 0) {
      this.log(`Cleaned up ${cleaned} old metric data points`);
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Console output
    console.log(logMessage.trim());
    
    // File output
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      // Ignore file write errors
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitoring = new MonitoringSystem();
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down monitoring system...');
    monitoring.stop();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down monitoring system...');
    monitoring.stop();
    process.exit(0);
  });
  
  // Start monitoring
  monitoring.start();
  
  // Log dashboard data every 5 minutes
  setInterval(() => {
    const dashboard = monitoring.getDashboardData();
    console.log('\n📊 Dashboard Update:', JSON.stringify(dashboard, null, 2));
  }, 5 * 60 * 1000);
  
  console.log('Monitoring system running. Press Ctrl+C to stop.');
}

export default MonitoringSystem;