/**
 * Alerting Engine
 * Monitors metrics and triggers alerts based on thresholds
 */

import { Alert, AlertEvent } from './types';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'info' | 'warning' | 'critical';
  cooldown: number; // minutes
  enabled: boolean;
  lastTriggered?: Date;
}

interface ActiveAlert {
  rule: AlertRule;
  triggeredAt: Date;
  value: number;
  message: string;
}

export class AlertingEngine extends EventEmitter {
  private rules: Map<string, AlertRule>;
  private activeAlerts: Map<string, ActiveAlert>;
  private logger: Logger;
  private evaluationTimer?: NodeJS.Timeout;
  private evaluationInterval: number = 60000; // 1 minute
  
  constructor() {
    super();
    this.rules = new Map();
    this.activeAlerts = new Map();
    this.logger = new Logger('AlertingEngine');
    
    this.initializeDefaultRules();
  }
  
  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high_v2_error_rate',
        name: 'High V2 Error Rate',
        condition: 'errors.v2_error_rate',
        threshold: 0.05, // 5%
        operator: 'gt',
        severity: 'critical',
        cooldown: 15,
        enabled: true
      },
      {
        id: 'migration_stalled',
        name: 'Migration Progress Stalled',
        condition: 'migration.migration_velocity',
        threshold: 1, // 1 user per day
        operator: 'lt',
        severity: 'warning',
        cooldown: 60,
        enabled: true
      },
      {
        id: 'performance_regression',
        name: 'Performance Regression in V2',
        condition: 'performance.v2_avg',
        threshold: 1000, // 1 second
        operator: 'gt',
        severity: 'warning',
        cooldown: 30,
        enabled: true
      },
      {
        id: 'satisfaction_drop',
        name: 'User Satisfaction Drop',
        condition: 'satisfaction.nps_difference',
        threshold: -10, // 10 point drop
        operator: 'lt',
        severity: 'critical',
        cooldown: 120,
        enabled: true
      },
      {
        id: 'low_adoption_rate',
        name: 'Low Adoption Rate',
        condition: 'migration.adoption_rate',
        threshold: 0.1, // 10%
        operator: 'lt',
        severity: 'info',
        cooldown: 360,
        enabled: true
      }
    ];
    
    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    
    this.logger.info(`Initialized ${defaultRules.length} default alert rules`);
  }
  
  /**
   * Start alerting engine
   */
  start(): void {
    if (this.evaluationTimer) {
      return;
    }
    
    this.evaluationTimer = setInterval(() => {
      // Evaluation happens when metrics are provided via evaluate()
    }, this.evaluationInterval);
    
    this.logger.info('Alerting engine started');
  }
  
  /**
   * Stop alerting engine
   */
  stop(): void {
    if (this.evaluationTimer) {
      clearInterval(this.evaluationTimer);
      this.evaluationTimer = undefined;
    }
    
    this.logger.info('Alerting engine stopped');
  }
  
  /**
   * Evaluate alerts based on current metrics
   */
  async evaluate(metrics: Record<string, any>): Promise<void> {
    const flatMetrics = this.flattenMetrics(metrics);
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      await this.evaluateRule(rule, flatMetrics);
    }
  }
  
  /**
   * Flatten nested metrics object
   */
  private flattenMetrics(obj: any, prefix = ''): Record<string, number> {
    const flat: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'number') {
        flat[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(flat, this.flattenMetrics(value, fullKey));
      }
    }
    
    return flat;
  }
  
  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: AlertRule, metrics: Record<string, number>): Promise<void> {
    const metricValue = metrics[rule.condition];
    
    if (metricValue === undefined) {
      return; // Metric not available
    }
    
    const isTriggered = this.checkCondition(metricValue, rule);
    const isCurrentlyActive = this.activeAlerts.has(rule.id);
    
    if (isTriggered && !isCurrentlyActive) {
      // New alert
      if (this.isInCooldown(rule)) {
        return;
      }
      
      await this.triggerAlert(rule, metricValue);
      
    } else if (!isTriggered && isCurrentlyActive) {
      // Alert resolved
      await this.resolveAlert(rule.id);
    }
  }
  
  /**
   * Check if condition is met
   */
  private checkCondition(value: number, rule: AlertRule): boolean {
    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'gte': return value >= rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'lte': return value <= rule.threshold;
      case 'eq': return value === rule.threshold;
      default: return false;
    }
  }
  
  /**
   * Check if rule is in cooldown period
   */
  private isInCooldown(rule: AlertRule): boolean {
    if (!rule.lastTriggered) return false;
    
    const cooldownMs = rule.cooldown * 60000; // Convert to milliseconds
    const elapsed = Date.now() - rule.lastTriggered.getTime();
    
    return elapsed < cooldownMs;
  }
  
  /**
   * Trigger a new alert
   */
  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const now = new Date();
    const message = this.generateAlertMessage(rule, value);
    
    const activeAlert: ActiveAlert = {
      rule,
      triggeredAt: now,
      value,
      message
    };
    
    this.activeAlerts.set(rule.id, activeAlert);
    rule.lastTriggered = now;
    
    const alertEvent: AlertEvent = {\n      alert: {\n        id: rule.id,\n        name: rule.name,\n        condition: rule.condition,\n        severity: rule.severity,\n        channels: this.getChannelsForSeverity(rule.severity),\n        enabled: rule.enabled\n      },\n      triggered_at: now,\n      value,\n      message\n    };\n    \n    this.logger.warn(`Alert triggered: ${rule.name}`, {\n      value,\n      threshold: rule.threshold,\n      severity: rule.severity\n    });\n    \n    this.emit('alert-triggered', alertEvent);\n  }\n  \n  /**\n   * Resolve an active alert\n   */\n  private async resolveAlert(ruleId: string): Promise<void> {\n    const activeAlert = this.activeAlerts.get(ruleId);\n    if (!activeAlert) return;\n    \n    const now = new Date();\n    const duration = now.getTime() - activeAlert.triggeredAt.getTime();\n    \n    this.activeAlerts.delete(ruleId);\n    \n    const alertEvent: AlertEvent = {\n      alert: {\n        id: activeAlert.rule.id,\n        name: activeAlert.rule.name,\n        condition: activeAlert.rule.condition,\n        severity: activeAlert.rule.severity,\n        channels: this.getChannelsForSeverity(activeAlert.rule.severity),\n        enabled: activeAlert.rule.enabled\n      },\n      triggered_at: activeAlert.triggeredAt,\n      resolved_at: now,\n      value: activeAlert.value,\n      message: activeAlert.message\n    };\n    \n    this.logger.info(`Alert resolved: ${activeAlert.rule.name}`, {\n      duration: Math.round(duration / 1000) + 's'\n    });\n    \n    this.emit('alert-resolved', alertEvent);\n  }\n  \n  /**\n   * Generate alert message\n   */\n  private generateAlertMessage(rule: AlertRule, value: number): string {\n    const formattedValue = this.formatMetricValue(rule.condition, value);\n    const threshold = this.formatMetricValue(rule.condition, rule.threshold);\n    \n    switch (rule.id) {\n      case 'high_v2_error_rate':\n        return `V2 error rate is ${formattedValue}, exceeding threshold of ${threshold}`;\n      \n      case 'migration_stalled':\n        return `Migration velocity is only ${formattedValue}, below threshold of ${threshold}`;\n      \n      case 'performance_regression':\n        return `V2 average response time is ${formattedValue}, exceeding threshold of ${threshold}`;\n      \n      case 'satisfaction_drop':\n        return `NPS score has dropped by ${Math.abs(value)} points, below threshold of ${Math.abs(rule.threshold)}`;\n      \n      case 'low_adoption_rate':\n        return `Adoption rate is only ${formattedValue}, below target of ${threshold}`;\n      \n      default:\n        return `${rule.condition} is ${formattedValue}, ${rule.operator} ${threshold}`;\n    }\n  }\n  \n  /**\n   * Format metric value for display\n   */\n  private formatMetricValue(metric: string, value: number): string {\n    if (metric.includes('rate') || metric.includes('adoption')) {\n      return (value * 100).toFixed(2) + '%';\n    } else if (metric.includes('avg') || metric.includes('p95')) {\n      return value.toFixed(0) + 'ms';\n    } else if (metric.includes('velocity')) {\n      return value.toFixed(1) + ' users/day';\n    } else {\n      return value.toString();\n    }\n  }\n  \n  /**\n   * Get notification channels for severity level\n   */\n  private getChannelsForSeverity(severity: 'info' | 'warning' | 'critical'): string[] {\n    switch (severity) {\n      case 'critical':\n        return ['slack', 'email', 'pagerduty'];\n      case 'warning':\n        return ['slack', 'email'];\n      case 'info':\n        return ['slack'];\n    }\n  }\n  \n  /**\n   * Add custom alert rule\n   */\n  addRule(rule: AlertRule): void {\n    this.rules.set(rule.id, rule);\n    this.logger.info(`Added alert rule: ${rule.name}`);\n  }\n  \n  /**\n   * Remove alert rule\n   */\n  removeRule(ruleId: string): void {\n    this.rules.delete(ruleId);\n    \n    // Resolve active alert if exists\n    if (this.activeAlerts.has(ruleId)) {\n      this.resolveAlert(ruleId);\n    }\n    \n    this.logger.info(`Removed alert rule: ${ruleId}`);\n  }\n  \n  /**\n   * Enable/disable rule\n   */\n  setRuleEnabled(ruleId: string, enabled: boolean): void {\n    const rule = this.rules.get(ruleId);\n    if (!rule) return;\n    \n    rule.enabled = enabled;\n    \n    // Resolve active alert if disabling\n    if (!enabled && this.activeAlerts.has(ruleId)) {\n      this.resolveAlert(ruleId);\n    }\n    \n    this.logger.info(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);\n  }\n  \n  /**\n   * Update rule threshold\n   */\n  updateThreshold(ruleId: string, threshold: number): void {\n    const rule = this.rules.get(ruleId);\n    if (!rule) return;\n    \n    rule.threshold = threshold;\n    this.logger.info(`Updated threshold for ${ruleId} to ${threshold}`);\n  }\n  \n  /**\n   * Get all active alerts\n   */\n  getActiveAlerts(): ActiveAlert[] {\n    return Array.from(this.activeAlerts.values());\n  }\n  \n  /**\n   * Get alert history (placeholder - would need persistent storage)\n   */\n  getAlertHistory(startDate: Date, endDate: Date): any[] {\n    // This would typically query a database\n    // For now, return empty array\n    return [];\n  }\n  \n  /**\n   * Get all rules\n   */\n  getRules(): AlertRule[] {\n    return Array.from(this.rules.values());\n  }\n  \n  /**\n   * Get rule by ID\n   */\n  getRule(ruleId: string): AlertRule | undefined {\n    return this.rules.get(ruleId);\n  }\n  \n  /**\n   * Get engine status\n   */\n  getStatus(): any {\n    return {\n      running: !!this.evaluationTimer,\n      totalRules: this.rules.size,\n      enabledRules: Array.from(this.rules.values()).filter(r => r.enabled).length,\n      activeAlerts: this.activeAlerts.size,\n      evaluationInterval: this.evaluationInterval\n    };\n  }\n  \n  /**\n   * Test alert rule\n   */\n  async testRule(ruleId: string, testValue: number): Promise<boolean> {\n    const rule = this.rules.get(ruleId);\n    if (!rule) return false;\n    \n    const isTriggered = this.checkCondition(testValue, rule);\n    \n    this.logger.info(`Test rule ${ruleId}`, {\n      testValue,\n      threshold: rule.threshold,\n      operator: rule.operator,\n      triggered: isTriggered\n    });\n    \n    return isTriggered;\n  }\n}