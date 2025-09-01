/**
 * Feature Flag Manager
 * Core feature flag evaluation and management
 */
import { FeatureFlag, UserContext, EvaluationResult } from './types';
export declare class FeatureFlagManager {
    private flags;
    private cohortManager;
    private metricsCollector;
    private circuitBreaker;
    private remoteConfig;
    private logger;
    private evaluationCache;
    private cacheTimeout;
    constructor(configPath?: string, remoteUrl?: string);
    /**
     * Initialize default feature flags
     */
    private initializeDefaultFlags;
    /**
     * Check if a feature is enabled for a user
     */
    isEnabled(flagName: string, context: UserContext): Promise<boolean>;
    /**
     * Evaluate a feature flag
     */
    evaluate(flagName: string, context: UserContext): Promise<EvaluationResult>;
    /**
     * Evaluate conditions
     */
    private evaluateConditions;
    /**
     * Check if user is in rollout percentage
     */
    private isInRolloutPercentage;
    /**
     * Select variant based on weights
     */
    private selectVariant;
    /**
     * Create evaluation result
     */
    private createResult;
    /**
     * Cache evaluation result
     */
    private cacheResult;
    /**
     * Clean old cache entries
     */
    private cleanCache;
    /**
     * Get cache key
     */
    private getCacheKey;
    /**
     * Track successful evaluation
     */
    private trackSuccess;
    /**
     * Update flags from remote config
     */
    updateFlags(config: any): void;
    /**
     * Load configuration from local file
     */
    private loadLocalConfig;
    /**
     * Get all flags
     */
    getAllFlags(): Map<string, FeatureFlag>;
    /**
     * Get flag by name
     */
    getFlag(name: string): FeatureFlag | undefined;
    /**
     * Update flag configuration
     */
    updateFlag(name: string, config: Partial<FeatureFlag>): void;
    /**
     * Get metrics for a flag
     */
    getMetrics(flagName: string): any;
    /**
     * Force rollback of a feature
     */
    rollback(flagName: string): void;
    /**
     * Shutdown manager
     */
    shutdown(): Promise<void>;
}
