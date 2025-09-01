"use strict";
/**
 * Configuration Schema for FLCM 2.0
 * Defines all configuration interfaces and types
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidator = exports.DEFAULT_FLCM_CONFIG = exports.DEFAULT_AGENT_CONFIG = void 0;
// Default configurations
exports.DEFAULT_AGENT_CONFIG = {
    enabled: true,
    priority: 1,
    timeout: 30000,
    retryAttempts: 3
};
exports.DEFAULT_FLCM_CONFIG = {
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
class ConfigValidator {
    static validate(config) {
        const errors = [];
        const warnings = [];
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
    static merge(base, override) {
        return {
            ...exports.DEFAULT_FLCM_CONFIG,
            ...base,
            ...override,
            agents: {
                ...base.agents,
                ...override.agents
            },
            paths: {
                ...exports.DEFAULT_FLCM_CONFIG.paths,
                ...base.paths,
                ...override.paths
            },
            features: {
                ...exports.DEFAULT_FLCM_CONFIG.features,
                ...base.features,
                ...override.features
            }
        };
    }
}
exports.ConfigValidator = ConfigValidator;
//# sourceMappingURL=config-schema.js.map