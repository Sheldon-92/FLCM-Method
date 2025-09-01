/**
 * Configuration Schema for FLCM 2.0
 * Defines all configuration interfaces and types
 */

// Base configuration interface
export interface BaseConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Creation modes
export enum CreationMode {
  QUICK = 'quick',
  STANDARD = 'standard',
  CUSTOM = 'custom',
  DRAFT = 'draft',
  POLISH = 'polish',
  INTERACTIVE = 'interactive',
  BATCH = 'batch'
}

// Platform types  
export enum Platform {
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  XIAOHONGSHU = 'xiaohongshu',
  ZHIHU = 'zhihu',
  WECHAT = 'wechat',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram'
}

// Agent-specific configuration
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

// Scholar agent configuration
export interface ScholarConfig extends AgentConfig {
  analysisFrameworks: string[];
  maxInputLength: number;
  outputFormat: 'structured' | 'narrative' | 'bullet';
}

// Creator agent configuration  
export interface CreatorConfig extends AgentConfig {
  voiceAnalysisEnabled: boolean;
  contentModes: string[];
  maxOutputLength: number;
}

// Publisher agent configuration
export interface PublisherConfig extends AgentConfig {
  platforms: string[];
  autoOptimize: boolean;
  scheduleEnabled: boolean;
}

// Main FLCM configuration
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

// Performance configuration
export interface PerformanceConfig {
  maxConcurrentTasks: number;
  memoryLimit: number;
  timeoutMs: number;
  enableProfiling: boolean;
}

// Security configuration
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

// Database configuration
export interface DatabaseConfig {
  type: 'memory' | 'file' | 'redis';
  connectionString?: string;
  options?: Record<string, any>;
}

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  type: 'memory' | 'redis';
  ttl: number;
  maxSize: number;
}

// Monitoring configuration
export interface MonitoringConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  healthCheckInterval: number;
  alerting: {
    enabled: boolean;
    channels: string[];
  };
}

// Complete system configuration
export interface SystemConfig extends FLCMConfig {
  performance: PerformanceConfig;
  security: SecurityConfig;
  database: DatabaseConfig;
  cache: CacheConfig;
  monitoring: MonitoringConfig;
}

// Configuration validation result
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Default configurations
export const DEFAULT_AGENT_CONFIG: Partial<AgentConfig> = {
  enabled: true,
  priority: 1,
  timeout: 30000,
  retryAttempts: 3
};

export const DEFAULT_FLCM_CONFIG: Partial<FLCMConfig> = {
  version: '2.0.0',
  environment: 'development',
  logLevel: 'info',
  timeout: 30000,
  retryAttempts: 3,
  paths: {
    data: './data',
    logs: './logs',
    cache: './cache', 
    temp: './tmp'
  },
  features: {
    monitoring: true,
    analytics: false,
    caching: true,
    errorRecovery: true
  }
};

// Configuration utility functions
export class ConfigValidator {
  static validate(config: Partial<SystemConfig>): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!config.version) {
      errors.push('Version is required');
    }

    if (config.timeout && config.timeout < 1000) {
      warnings.push('Timeout less than 1000ms may cause issues');
    }

    // Agent validation
    if (config.agents) {
      Object.entries(config.agents).forEach(([key, agentConfig]) => {
        if (!agentConfig.id) {
          errors.push(`Agent ${key} is missing id`);
        }
        if (agentConfig.timeout && agentConfig.timeout < 500) {
          warnings.push(`Agent ${key} has very short timeout`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  static merge(base: Partial<SystemConfig>, override: Partial<SystemConfig>): SystemConfig {
    return {
      ...DEFAULT_FLCM_CONFIG,
      ...base,
      ...override,
      agents: {
        ...base.agents,
        ...override.agents
      },
      paths: {
        ...DEFAULT_FLCM_CONFIG.paths,
        ...base.paths,
        ...override.paths
      },
      features: {
        ...DEFAULT_FLCM_CONFIG.features,
        ...base.features,
        ...override.features
      }
    } as SystemConfig;
  }
}

// Export types for external use
export type {
  BaseConfig,
  AgentConfig,
  ScholarConfig,
  CreatorConfig,
  PublisherConfig,
  FLCMConfig,
  SystemConfig,
  CreationMode,
  Platform
};