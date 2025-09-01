/**
 * FLCM Configuration Manager
 * Handles loading, validation, merging, and hot-reload of configuration
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { FLCMConfig } from './config-schema';
/**
 * Configuration validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
}
/**
 * Configuration manager options
 */
export interface ConfigManagerOptions {
    watchEnabled?: boolean;
    envPrefix?: string;
    strictValidation?: boolean;
}
/**
 * Configuration Manager
 * Manages all configuration loading, validation, and updates
 */
export declare class ConfigManager extends EventEmitter {
    private config;
    private configPath?;
    private watchers;
    private options;
    private reloadTimer?;
    constructor(options?: ConfigManagerOptions);
    /**
     * Load configuration from files and environment
     */
    load(customPath?: string): Promise<FLCMConfig>;
    /**
     * Find the highest priority configuration file that exists
     */
    private findConfigFile;
    /**
     * Apply environment variable overrides
     */
    private applyEnvironmentOverrides;
    /**
     * Parse environment variable value to appropriate type
     */
    private parseEnvValue;
    /**
     * Set a value deep in an object using dot notation
     */
    private setDeepValue;
    /**
     * Validate configuration against schema
     */
    validate(config: Partial<FLCMConfig>): ValidationResult;
    /**
     * Merge configurations with proper precedence
     */
    merge(base: FLCMConfig, override: Partial<FLCMConfig>): FLCMConfig;
    /**
     * Deep merge two objects
     */
    private deepMerge;
    /**
     * Check version compatibility
     */
    private isVersionCompatible;
    /**
     * Set up file watcher for hot-reload
     */
    private setupWatcher;
    /**
     * Reload configuration
     */
    reload(): Promise<void>;
    /**
     * Watch for configuration changes
     */
    watch(callback: (config: FLCMConfig) => void): void;
    /**
     * Get configuration value by path
     */
    get<T = any>(path: string): T;
    /**
     * Set configuration value by path (runtime only, not persisted)
     */
    set(path: string, value: any): void;
    /**
     * Get the current configuration
     */
    getConfig(): FLCMConfig;
    /**
     * Stop watching configuration files
     */
    stopWatching(): void;
    /**
     * Clean up resources
     */
    destroy(): void;
}
export declare const configManager: ConfigManager;
export declare function loadConfig(options?: ConfigManagerOptions): Promise<FLCMConfig>;
