/**
 * Migration Monitor
 * Central monitoring system for 1.0 to 2.0 migration
 */

import {
  MetricCollector,
  MigrationMetrics,
  AlertEvent,
  Alert
} from './types';
import { UsageCollector } from './collectors/usage-collector';
import { ErrorCollector } from './collectors/error-collector';
import { PerformanceCollector } from './collectors/performance-collector';
import { SatisfactionCollector } from './collectors/satisfaction-collector';
import { MetricsStore } from './metrics-store';
import { DashboardService } from './dashboard-service';
import { AlertingEngine } from './alerting-engine';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';

export class MigrationMonitor extends EventEmitter {
  private collectors: Map<string, MetricCollector>;
  private metricsStore: MetricsStore;
  private dashboard: DashboardService;
  private alerting: AlertingEngine;
  private logger: Logger;
  private collectionInterval: number = 60000; // 1 minute
  private collectionTimer?: NodeJS.Timeout;
  private isRunning: boolean = false;
  
  constructor() {
    super();
    this.logger = new Logger('MigrationMonitor');
    this.collectors = new Map();
    this.metricsStore = new MetricsStore();
    this.dashboard = new DashboardService(this.metricsStore);
    this.alerting = new AlertingEngine();
    
    this.initializeCollectors();
    this.setupAlertHandlers();
  }
  
  /**
   * Initialize metric collectors
   */
  private initializeCollectors(): void {
    this.collectors.set('usage', new UsageCollector());
    this.collectors.set('errors', new ErrorCollector());
    this.collectors.set('performance', new PerformanceCollector());
    this.collectors.set('satisfaction', new SatisfactionCollector());
    
    this.logger.info('Collectors initialized');
  }
  
  /**
   * Setup alert event handlers
   */
  private setupAlertHandlers(): void {
    this.alerting.on('alert-triggered', (event: AlertEvent) => {
      this.handleAlertTriggered(event);
    });
    
    this.alerting.on('alert-resolved', (event: AlertEvent) => {
      this.handleAlertResolved(event);
    });
  }
  
  /**
   * Start monitoring
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Monitor already running');
      return;
    }
    
    this.isRunning = true;
    
    // Initial collection
    this.collectMetrics();
    
    // Start periodic collection
    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.collectionInterval);
    
    // Start dashboard
    this.dashboard.start();
    
    // Start alerting
    this.alerting.start();
    
    this.logger.info('Migration monitor started');
    this.emit('monitor-started');
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = undefined;
    }
    
    this.dashboard.stop();
    this.alerting.stop();
    
    this.logger.info('Migration monitor stopped');
    this.emit('monitor-stopped');
  }
  
  /**
   * Collect metrics from all collectors
   */
  private async collectMetrics(): Promise<void> {
    const startTime = Date.now();
    const allMetrics: Record<string, any> = {};
    
    try {
      // Collect from each collector
      for (const [name, collector] of this.collectors.entries()) {
        try {
          const metrics = await collector.collect();
          allMetrics[name] = metrics;
          
          // Store metrics
          await this.metricsStore.writeMetrics(name, metrics);
          
        } catch (error) {
          this.logger.error(`Failed to collect ${name} metrics`, { error });
        }
      }
      
      // Calculate migration-specific metrics
      const migrationMetrics = this.calculateMigrationMetrics(allMetrics);
      await this.metricsStore.writeMetrics('migration', migrationMetrics);
      
      // Evaluate alerts
      await this.evaluateAlerts(allMetrics);
      
      // Update dashboard
      this.dashboard.update(allMetrics);
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Metrics collected in ${duration}ms`);
      
      this.emit('metrics-collected', allMetrics);
      
    } catch (error) {
      this.logger.error('Metrics collection failed', { error });
      this.emit('collection-error', error);
    }
  }
  
  /**
   * Calculate migration-specific metrics
   */
  private calculateMigrationMetrics(metrics: Record<string, any>): MigrationMetrics {
    const usage = metrics.usage || {};
    
    const v1Users = usage.v1_unique_users || 0;
    const v2Users = usage.v2_unique_users || 0;
    const totalUsers = v1Users + v2Users;
    
    // Calculate adoption rate
    const adoptionRate = totalUsers > 0 ? v2Users / totalUsers : 0;
    
    // Calculate migration velocity (users per day)
    const previousAdoption = this.metricsStore.getPreviousValue('migration.adoption_rate');
    const velocity = previousAdoption !== null 
      ? (adoptionRate - previousAdoption) * totalUsers / (this.collectionInterval / 86400000)
      : 0;
    
    // Estimate completion
    let estimatedCompletion: Date | null = null;
    if (velocity > 0 && v1Users > 0) {
      const daysRemaining = v1Users / velocity;
      estimatedCompletion = new Date(Date.now() + daysRemaining * 86400000);
    }
    
    return {
      total_users: totalUsers,
      v1_users: v1Users,
      v2_users: v2Users,
      adoption_rate: adoptionRate,
      migration_velocity: velocity,
      estimated_completion: estimatedCompletion,
      timestamp: new Date()
    };
  }
  
  /**
   * Evaluate alerts based on metrics
   */
  private async evaluateAlerts(metrics: Record<string, any>): Promise<void> {
    try {
      await this.alerting.evaluate(metrics);
    } catch (error) {
      this.logger.error('Alert evaluation failed', { error });
    }
  }
  
  /**
   * Handle alert triggered event
   */
  private handleAlertTriggered(event: AlertEvent): void {
    this.logger.warn(`Alert triggered: ${event.alert.name}`, {
      severity: event.alert.severity,
      value: event.value,
      message: event.message
    });
    
    // Emit for external handlers
    this.emit('alert-triggered', event);
    
    // Take action based on alert
    this.handleAlertAction(event);
  }
  
  /**
   * Handle alert resolved event
   */
  private handleAlertResolved(event: AlertEvent): void {
    this.logger.info(`Alert resolved: ${event.alert.name}`, {
      duration: event.resolved_at ? 
        event.resolved_at.getTime() - event.triggered_at.getTime() : 0
    });
    
    this.emit('alert-resolved', event);
  }
  
  /**
   * Handle alert-specific actions
   */
  private handleAlertAction(event: AlertEvent): void {
    switch (event.alert.name) {
      case 'high_error_rate':
        // Consider automatic rollback
        if (event.alert.severity === 'critical') {
          this.considerRollback('high_error_rate', event.value);
        }
        break;
        
      case 'performance_regression':
        // Log detailed performance comparison
        this.logPerformanceRegression(event);
        break;
        
      case 'user_satisfaction_drop':
        // Collect additional feedback
        this.requestAdditionalFeedback();
        break;
        
      case 'migration_rollback_triggered':
        // Notify all systems
        this.notifyRollback(event);
        break;
    }
  }
  
  /**
   * Consider automatic rollback
   */
  private considerRollback(reason: string, value: number): void {
    this.logger.warn(`Considering rollback due to ${reason}`, { value });
    
    // Emit for feature flag manager to handle
    this.emit('rollback-consideration', { reason, value });
  }
  
  /**
   * Log performance regression details
   */
  private logPerformanceRegression(event: AlertEvent): void {
    const performance = this.metricsStore.getLatestMetrics('performance');
    
    this.logger.warn('Performance regression detected', {
      alert: event.alert.name,
      metrics: performance,
      threshold: event.value
    });
  }
  
  /**
   * Request additional user feedback
   */
  private requestAdditionalFeedback(): void {
    this.emit('request-feedback', {
      reason: 'satisfaction_drop',
      timestamp: new Date()
    });
  }
  
  /**
   * Notify systems about rollback
   */
  private notifyRollback(event: AlertEvent): void {
    this.emit('rollback-notification', {
      alert: event.alert,
      timestamp: event.triggered_at
    });
  }
  
  /**
   * Get current migration status
   */
  getMigrationStatus(): any {
    const latest = this.metricsStore.getLatestMetrics('migration');
    const usage = this.metricsStore.getLatestMetrics('usage');
    const errors = this.metricsStore.getLatestMetrics('errors');
    const performance = this.metricsStore.getLatestMetrics('performance');
    const satisfaction = this.metricsStore.getLatestMetrics('satisfaction');
    
    return {
      migration: latest,
      usage,
      errors,
      performance,
      satisfaction,
      alerts: this.alerting.getActiveAlerts(),
      dashboard_url: this.dashboard.getUrl()
    };
  }
  
  /**
   * Get migration trends
   */
  getMigrationTrends(duration: string = '7d'): any {
    const trends = {
      adoption: this.metricsStore.getTimeSeries('migration.adoption_rate', duration),
      errors: this.metricsStore.getTimeSeries('errors.rate', duration),
      performance: this.metricsStore.getTimeSeries('performance.avg', duration),
      satisfaction: this.metricsStore.getTimeSeries('satisfaction.nps', duration)
    };
    
    return trends;
  }
  
  /**
   * Generate migration report
   */
  generateReport(startDate: Date, endDate: Date): any {
    const report = {
      period: { start: startDate, end: endDate },
      summary: this.generateSummary(startDate, endDate),
      details: {
        usage: this.metricsStore.getMetricsRange('usage', startDate, endDate),
        errors: this.metricsStore.getMetricsRange('errors', startDate, endDate),
        performance: this.metricsStore.getMetricsRange('performance', startDate, endDate),
        satisfaction: this.metricsStore.getMetricsRange('satisfaction', startDate, endDate)
      },
      alerts: this.alerting.getAlertHistory(startDate, endDate),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  /**
   * Generate summary statistics
   */
  private generateSummary(startDate: Date, endDate: Date): any {
    const migrationStart = this.metricsStore.getMetricsAt('migration', startDate);
    const migrationEnd = this.metricsStore.getMetricsAt('migration', endDate);
    
    return {
      adoption_change: migrationEnd.adoption_rate - migrationStart.adoption_rate,
      users_migrated: migrationEnd.v2_users - migrationStart.v2_users,
      avg_velocity: this.metricsStore.getAverage('migration.migration_velocity', startDate, endDate),
      error_trend: this.metricsStore.getTrend('errors.rate', startDate, endDate),
      performance_trend: this.metricsStore.getTrend('performance.avg', startDate, endDate),
      satisfaction_trend: this.metricsStore.getTrend('satisfaction.nps', startDate, endDate)
    };
  }
  
  /**
   * Generate recommendations based on metrics
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const latest = this.getMigrationStatus();
    
    // Adoption recommendations
    if (latest.migration?.adoption_rate < 0.5) {
      recommendations.push('Consider increasing feature flag rollout percentage');
    }
    
    if (latest.migration?.migration_velocity < 10) {
      recommendations.push('Migration velocity is slow - consider user education campaign');
    }
    
    // Error recommendations
    if (latest.errors?.v2_error_rate > latest.errors?.v1_error_rate) {
      recommendations.push('v2 has higher error rate - investigate and fix issues');
    }
    
    // Performance recommendations
    if (latest.performance?.v2_avg > latest.performance?.v1_avg * 1.1) {
      recommendations.push('v2 performance is slower - optimize critical paths');
    }
    
    // Satisfaction recommendations
    if (latest.satisfaction?.v2_nps < latest.satisfaction?.v1_nps) {
      recommendations.push('User satisfaction lower on v2 - collect feedback and iterate');
    }
    
    return recommendations;
  }
  
  /**
   * Set collection interval
   */
  setCollectionInterval(intervalMs: number): void {
    this.collectionInterval = intervalMs;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  
  /**
   * Add custom collector
   */
  addCollector(name: string, collector: MetricCollector): void {
    this.collectors.set(name, collector);
    this.logger.info(`Added collector: ${name}`);
  }
  
  /**
   * Remove collector
   */
  removeCollector(name: string): void {
    this.collectors.delete(name);
    this.logger.info(`Removed collector: ${name}`);
  }
  
  /**
   * Get collector
   */
  getCollector(name: string): MetricCollector | undefined {
    return this.collectors.get(name);
  }
}