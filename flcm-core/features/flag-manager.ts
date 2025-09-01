/**
 * Feature Flag Manager
 * Core feature flag evaluation and management
 */

import {
  FeatureFlag,
  UserContext,
  EvaluationResult,
  FlagVariant,
  CircuitState
} from './types';
import { CohortManager } from './cohort-manager';
import { MetricsCollector } from './metrics-collector';
import { CircuitBreaker } from './circuit-breaker';
import { RemoteConfigClient } from './remote-config';
import { Logger } from '../shared/utils/logger';
import * as crypto from 'crypto';

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag>;
  private cohortManager: CohortManager;
  private metricsCollector: MetricsCollector;
  private circuitBreaker: CircuitBreaker;
  private remoteConfig: RemoteConfigClient | null;
  private logger: Logger;
  private evaluationCache: Map<string, EvaluationResult>;
  private cacheTimeout: number = 60000; // 1 minute
  
  constructor(configPath?: string, remoteUrl?: string) {
    this.logger = new Logger('FeatureFlagManager');
    this.flags = new Map();
    this.cohortManager = new CohortManager();
    this.metricsCollector = new MetricsCollector();
    this.circuitBreaker = new CircuitBreaker();
    this.evaluationCache = new Map();
    
    // Initialize remote config if URL provided
    if (remoteUrl) {
      this.remoteConfig = new RemoteConfigClient(remoteUrl);
      this.remoteConfig.on('config-updated', (config) => this.updateFlags(config));
      this.remoteConfig.startPolling();
    }
    
    // Load local config if path provided
    if (configPath) {
      this.loadLocalConfig(configPath);
    }
    
    // Initialize default flags
    this.initializeDefaultFlags();
    
    this.logger.info('Feature flag manager initialized');
  }
  
  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        name: 'v2_mentor_layer',
        description: 'Enable 2.0 Mentor layer',
        default: false,
        rollout: {
          percentage: 10,
          cohorts: {
            'beta_testers': true,
            'internal_users': true
          }
        },
        error_threshold: {
          rate: 0.05,
          window: 300,
          min_samples: 10
        }
      },
      {
        name: 'v2_framework_library',
        description: 'Enable new framework library',
        default: false,
        dependencies: ['v2_mentor_layer'],
        rollout: {
          percentage: 25
        },
        variants: [
          { name: 'full_library', weight: 50 },
          { name: 'core_only', weight: 50 }
        ]
      },
      {
        name: 'v2_collaborative_mode',
        description: 'Enable collaborative interaction mode',
        default: true,
        rollout: {
          percentage: 50
        }
      },
      {
        name: 'v2_document_migration',
        description: 'Enable automatic document migration',
        default: false,
        rollout: {
          percentage: 5,
          cohorts: {
            'beta_testers': true
          }
        }
      },
      {
        name: 'v2_performance_monitoring',
        description: 'Enable detailed performance monitoring',
        default: true,
        rollout: {
          percentage: 100
        }
      }
    ];
    
    defaultFlags.forEach(flag => {
      this.flags.set(flag.name, flag);
    });
  }
  
  /**
   * Check if a feature is enabled for a user
   */
  async isEnabled(flagName: string, context: UserContext): Promise<boolean> {
    const result = await this.evaluate(flagName, context);
    return result.enabled;
  }
  
  /**
   * Evaluate a feature flag
   */
  async evaluate(flagName: string, context: UserContext): Promise<EvaluationResult> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(flagName, context.user_id);
      const cached = this.evaluationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
        return cached;
      }
      
      // Get flag configuration
      const flag = this.flags.get(flagName);
      if (!flag) {
        return this.createResult(flagName, context.user_id, false, 'Flag not found');
      }
      
      // Check circuit breaker
      if (this.circuitBreaker.isOpen(flagName)) {
        const result = this.createResult(flagName, context.user_id, false, 'Circuit breaker open');
        this.metricsCollector.trackUsage(flagName, context.user_id, false);
        return result;
      }
      
      // Check dependencies
      if (flag.dependencies) {
        for (const dep of flag.dependencies) {
          const depResult = await this.evaluate(dep, context);
          if (!depResult.enabled) {
            const result = this.createResult(flagName, context.user_id, false, `Dependency ${dep} not enabled`);
            this.cacheResult(cacheKey, result);
            return result;
          }
        }
      }
      
      // Evaluate conditions
      if (flag.conditions) {
        const conditionsMet = this.evaluateConditions(flag.conditions, context);
        if (!conditionsMet) {
          const result = this.createResult(flagName, context.user_id, false, 'Conditions not met');
          this.cacheResult(cacheKey, result);
          return result;
        }
      }
      
      // Check cohort assignment
      if (flag.rollout?.cohorts) {
        const userCohorts = await this.cohortManager.getUserCohorts(context.user_id);
        for (const [cohort, enabled] of Object.entries(flag.rollout.cohorts)) {
          if (userCohorts.includes(cohort) && enabled) {
            const result = this.createResult(flagName, context.user_id, true, `In cohort: ${cohort}`);
            this.cacheResult(cacheKey, result);
            this.trackSuccess(flagName, context.user_id, startTime);
            return result;
          }
        }
      }
      
      // Check percentage rollout
      if (flag.rollout?.percentage !== undefined) {
        const inRollout = this.isInRolloutPercentage(context.user_id, flag.rollout.percentage);
        const enabled = inRollout || flag.default;
        const reason = inRollout ? `In ${flag.rollout.percentage}% rollout` : 'Default value';
        
        // Select variant if enabled and variants exist
        let variant: string | undefined;
        if (enabled && flag.variants) {
          variant = this.selectVariant(flag.variants, context.user_id);
        }
        
        const result = this.createResult(flagName, context.user_id, enabled, reason, variant);
        this.cacheResult(cacheKey, result);
        this.trackSuccess(flagName, context.user_id, startTime);
        return result;
      }
      
      // Return default value
      const result = this.createResult(flagName, context.user_id, flag.default, 'Default value');
      this.cacheResult(cacheKey, result);
      this.trackSuccess(flagName, context.user_id, startTime);
      return result;
      
    } catch (error) {
      this.logger.error(`Error evaluating flag ${flagName}`, { error });
      this.circuitBreaker.recordError(flagName);
      this.metricsCollector.trackError(flagName);
      
      // Return safe default
      const flag = this.flags.get(flagName);
      return this.createResult(flagName, context.user_id, flag?.default || false, 'Error during evaluation');
    }
  }
  
  /**
   * Evaluate conditions
   */
  private evaluateConditions(conditions: any[], context: UserContext): boolean {
    for (const condition of conditions) {
      const value = context.attributes?.[condition.attribute];
      
      let met = false;
      switch (condition.operator) {
        case 'equals':
          met = value === condition.value;
          break;
        case 'not_equals':
          met = value !== condition.value;
          break;
        case 'greater_than':
          met = value > condition.value;
          break;
        case 'less_than':
          met = value < condition.value;
          break;
        case 'contains':
          met = value?.includes?.(condition.value);
          break;
        case 'in':
          met = condition.value?.includes?.(value);
          break;
      }
      
      if (condition.negate) met = !met;
      if (!met) return false;
    }
    
    return true;
  }
  
  /**
   * Check if user is in rollout percentage
   */
  private isInRolloutPercentage(userId: string, percentage: number): boolean {
    // Use consistent hashing for stable assignment
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const bucket = parseInt(hash.substring(0, 8), 16) % 100;
    return bucket < percentage;
  }
  
  /**
   * Select variant based on weights
   */
  private selectVariant(variants: FlagVariant[], userId: string): string | undefined {
    if (variants.length === 0) return undefined;
    
    // Calculate total weight
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    // Use consistent hashing for stable variant assignment
    const hash = crypto.createHash('md5').update(userId + '_variant').digest('hex');
    const random = (parseInt(hash.substring(0, 8), 16) % totalWeight);
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.weight;
      if (random < cumulative) {
        return variant.name;
      }
    }
    
    return variants[0].name;
  }
  
  /**
   * Create evaluation result
   */
  private createResult(
    flagName: string,
    userId: string,
    enabled: boolean,
    reason: string,
    variant?: string
  ): EvaluationResult {
    return {
      flag_name: flagName,
      user_id: userId,
      enabled,
      reason,
      variant,
      timestamp: new Date()
    };
  }
  
  /**
   * Cache evaluation result
   */
  private cacheResult(key: string, result: EvaluationResult): void {
    this.evaluationCache.set(key, result);
    
    // Clean old cache entries periodically
    if (this.evaluationCache.size > 1000) {
      this.cleanCache();
    }
  }
  
  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const expired: string[] = [];
    
    this.evaluationCache.forEach((result, key) => {
      if (now - result.timestamp.getTime() > this.cacheTimeout) {
        expired.push(key);
      }
    });
    
    expired.forEach(key => this.evaluationCache.delete(key));
  }
  
  /**
   * Get cache key
   */
  private getCacheKey(flagName: string, userId: string): string {
    return `${flagName}:${userId}`;
  }
  
  /**
   * Track successful evaluation
   */
  private trackSuccess(flagName: string, userId: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.circuitBreaker.recordSuccess(flagName);
    this.metricsCollector.trackPerformance(flagName, duration);
    this.metricsCollector.trackUsage(flagName, userId, true);
  }
  
  /**
   * Update flags from remote config
   */
  updateFlags(config: any): void {
    try {
      const newFlags = config.flags || {};
      
      Object.entries(newFlags).forEach(([name, flag]) => {
        this.flags.set(name, flag as FeatureFlag);
      });
      
      this.logger.info(`Updated ${Object.keys(newFlags).length} flags from remote config`);
      
      // Clear cache after update
      this.evaluationCache.clear();
    } catch (error) {
      this.logger.error('Failed to update flags', { error });
    }
  }
  
  /**
   * Load configuration from local file
   */
  private loadLocalConfig(configPath: string): void {
    try {
      const fs = require('fs');
      const yaml = require('js-yaml');
      
      const content = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(content);
      
      if (config.flags) {
        Object.entries(config.flags).forEach(([name, flag]) => {
          this.flags.set(name, flag as FeatureFlag);
        });
      }
      
      this.logger.info(`Loaded ${this.flags.size} flags from local config`);
    } catch (error) {
      this.logger.error('Failed to load local config', { error });
    }
  }
  
  /**
   * Get all flags
   */
  getAllFlags(): Map<string, FeatureFlag> {
    return new Map(this.flags);
  }
  
  /**
   * Get flag by name
   */
  getFlag(name: string): FeatureFlag | undefined {
    return this.flags.get(name);
  }
  
  /**
   * Update flag configuration
   */
  updateFlag(name: string, config: Partial<FeatureFlag>): void {
    const existing = this.flags.get(name);
    if (existing) {
      this.flags.set(name, { ...existing, ...config });
      this.evaluationCache.clear(); // Clear cache after update
      this.logger.info(`Updated flag: ${name}`);
    }
  }
  
  /**
   * Get metrics for a flag
   */
  getMetrics(flagName: string): any {
    return {
      usage: this.metricsCollector.getUsageMetrics(flagName),
      performance: this.metricsCollector.getPerformanceMetrics(flagName),
      circuit_state: this.circuitBreaker.getState(flagName)
    };
  }
  
  /**
   * Force rollback of a feature
   */
  rollback(flagName: string): void {
    this.updateFlag(flagName, { 
      enabled: false,
      rollout: { percentage: 0 }
    });
    
    this.circuitBreaker.reset(flagName);
    this.logger.warn(`Rolled back feature: ${flagName}`);
  }
  
  /**
   * Shutdown manager
   */
  async shutdown(): Promise<void> {
    if (this.remoteConfig) {
      await this.remoteConfig.stopPolling();
    }
    
    this.logger.info('Feature flag manager shutdown');
  }
}