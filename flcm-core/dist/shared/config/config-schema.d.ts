/**
 * Configuration Schema for FLCM 2.0
 * Defines all configuration interfaces and types
 */
export interface BaseConfig {
    version: string;
    environment: 'development' | 'production' | 'test';
    logLevel: 'error' | 'warn' | 'info' | 'debug';
}
export interface AgentConfig {
    id: string;
    name: string;
    title: string;
    icon: string;
    whenToUse: string;
    enabled: boolean;
    priority: number;
    timeout: number;
    retryAttempts: number;
    [key: string]: any;
}
export interface ScholarConfig extends AgentConfig {
    analysisFrameworks: string[];
    maxInputLength: number;
    outputFormat: 'structured' | 'narrative' | 'bullet';
}
export interface CreatorConfig extends AgentConfig {
    voiceAnalysisEnabled: boolean;
    contentModes: string[];
    maxOutputLength: number;
}
export interface PublisherConfig extends AgentConfig {
    platforms: string[];
    autoOptimize: boolean;
    scheduleEnabled: boolean;
}
export interface FLCMConfig extends BaseConfig {
    timeout: number;
    retryAttempts: number;
    agents: {
        scholar: ScholarConfig;
        creator: CreatorConfig;
        publisher: PublisherConfig;
    };
    paths: {
        data: string;
        logs: string;
        cache: string;
        temp: string;
    };
    features: {
        monitoring: boolean;
        analytics: boolean;
        caching: boolean;
        errorRecovery: boolean;
    };
}
export interface PerformanceConfig {
    maxConcurrentTasks: number;
    memoryLimit: number;
    timeoutMs: number;
    enableProfiling: boolean;
}
export interface SecurityConfig {
    enableAuth: boolean;
    apiKeyRequired: boolean;
    rateLimiting: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
    };
    cors: {
        enabled: boolean;
        origins: string[];
    };
}
export interface DatabaseConfig {
    type: 'memory' | 'file' | 'redis';
    connectionString?: string;
    options?: Record<string, any>;
}
export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis';
    ttl: number;
    maxSize: number;
}
export interface MonitoringConfig {
    enabled: boolean;
    metricsEnabled: boolean;
    healthCheckInterval: number;
    alerting: {
        enabled: boolean;
        channels: string[];
    };
}
export interface SystemConfig extends FLCMConfig {
    performance: PerformanceConfig;
    security: SecurityConfig;
    database: DatabaseConfig;
    cache: CacheConfig;
    monitoring: MonitoringConfig;
}
export interface ConfigValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare const DEFAULT_AGENT_CONFIG: Partial<AgentConfig>;
export declare const DEFAULT_FLCM_CONFIG: Partial<FLCMConfig>;
export declare class ConfigValidator {
    static validate(config: Partial<SystemConfig>): ConfigValidationResult;
    static merge(base: Partial<SystemConfig>, override: Partial<SystemConfig>): SystemConfig;
}
export type { BaseConfig, AgentConfig, ScholarConfig, CreatorConfig, PublisherConfig, FLCMConfig, SystemConfig };
