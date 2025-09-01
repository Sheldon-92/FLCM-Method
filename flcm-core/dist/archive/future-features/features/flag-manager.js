"use strict";
/**
 * Feature Flag Manager
 * Core feature flag evaluation and management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureFlagManager = void 0;
const cohort_manager_1 = require("./cohort-manager");
const metrics_collector_1 = require("./metrics-collector");
const circuit_breaker_1 = require("./circuit-breaker");
const remote_config_1 = require("./remote-config");
const logger_1 = require("../shared/utils/logger");
const crypto = __importStar(require("crypto"));
class FeatureFlagManager {
    constructor(configPath, remoteUrl) {
        this.cacheTimeout = 60000; // 1 minute
        this.logger = new logger_1.Logger('FeatureFlagManager');
        this.flags = new Map();
        this.cohortManager = new cohort_manager_1.CohortManager();
        this.metricsCollector = new metrics_collector_1.MetricsCollector();
        this.circuitBreaker = new circuit_breaker_1.CircuitBreaker();
        this.evaluationCache = new Map();
        // Initialize remote config if URL provided
        if (remoteUrl) {
            this.remoteConfig = new remote_config_1.RemoteConfigClient(remoteUrl);
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
    initializeDefaultFlags() {
        const defaultFlags = [
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
    async isEnabled(flagName, context) {
        const result = await this.evaluate(flagName, context);
        return result.enabled;
    }
    /**
     * Evaluate a feature flag
     */
    async evaluate(flagName, context) {
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
                let variant;
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
        }
        catch (error) {
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
    evaluateConditions(conditions, context) {
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
            if (condition.negate)
                met = !met;
            if (!met)
                return false;
        }
        return true;
    }
    /**
     * Check if user is in rollout percentage
     */
    isInRolloutPercentage(userId, percentage) {
        // Use consistent hashing for stable assignment
        const hash = crypto.createHash('md5').update(userId).digest('hex');
        const bucket = parseInt(hash.substring(0, 8), 16) % 100;
        return bucket < percentage;
    }
    /**
     * Select variant based on weights
     */
    selectVariant(variants, userId) {
        if (variants.length === 0)
            return undefined;
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
    createResult(flagName, userId, enabled, reason, variant) {
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
    cacheResult(key, result) {
        this.evaluationCache.set(key, result);
        // Clean old cache entries periodically
        if (this.evaluationCache.size > 1000) {
            this.cleanCache();
        }
    }
    /**
     * Clean old cache entries
     */
    cleanCache() {
        const now = Date.now();
        const expired = [];
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
    getCacheKey(flagName, userId) {
        return `${flagName}:${userId}`;
    }
    /**
     * Track successful evaluation
     */
    trackSuccess(flagName, userId, startTime) {
        const duration = Date.now() - startTime;
        this.circuitBreaker.recordSuccess(flagName);
        this.metricsCollector.trackPerformance(flagName, duration);
        this.metricsCollector.trackUsage(flagName, userId, true);
    }
    /**
     * Update flags from remote config
     */
    updateFlags(config) {
        try {
            const newFlags = config.flags || {};
            Object.entries(newFlags).forEach(([name, flag]) => {
                this.flags.set(name, flag);
            });
            this.logger.info(`Updated ${Object.keys(newFlags).length} flags from remote config`);
            // Clear cache after update
            this.evaluationCache.clear();
        }
        catch (error) {
            this.logger.error('Failed to update flags', { error });
        }
    }
    /**
     * Load configuration from local file
     */
    loadLocalConfig(configPath) {
        try {
            const fs = require('fs');
            const yaml = require('js-yaml');
            const content = fs.readFileSync(configPath, 'utf8');
            const config = yaml.load(content);
            if (config.flags) {
                Object.entries(config.flags).forEach(([name, flag]) => {
                    this.flags.set(name, flag);
                });
            }
            this.logger.info(`Loaded ${this.flags.size} flags from local config`);
        }
        catch (error) {
            this.logger.error('Failed to load local config', { error });
        }
    }
    /**
     * Get all flags
     */
    getAllFlags() {
        return new Map(this.flags);
    }
    /**
     * Get flag by name
     */
    getFlag(name) {
        return this.flags.get(name);
    }
    /**
     * Update flag configuration
     */
    updateFlag(name, config) {
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
    getMetrics(flagName) {
        return {
            usage: this.metricsCollector.getUsageMetrics(flagName),
            performance: this.metricsCollector.getPerformanceMetrics(flagName),
            circuit_state: this.circuitBreaker.getState(flagName)
        };
    }
    /**
     * Force rollback of a feature
     */
    rollback(flagName) {
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
    async shutdown() {
        if (this.remoteConfig) {
            await this.remoteConfig.stopPolling();
        }
        this.logger.info('Feature flag manager shutdown');
    }
}
exports.FeatureFlagManager = FeatureFlagManager;
//# sourceMappingURL=flag-manager.js.map