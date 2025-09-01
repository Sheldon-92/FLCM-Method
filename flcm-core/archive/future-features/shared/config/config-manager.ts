/**
 * FLCM Configuration Manager
 * Handles loading, validation, merging, and hot-reload of configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { EventEmitter } from 'events';
import { FLCMConfig, FLCMConfigSchema, getDefaultConfig } from './config-schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('ConfigManager');

/**
 * Configuration file priority order (highest to lowest)
 */
const CONFIG_PRIORITY = [
  './.flcm-config.yaml',           // Project root override
  './.flcm-config.yml',            // Alternative extension
  '~/.flcm/config.yaml',           // User home directory
  '~/.flcm/config.yml',            // Alternative extension
  './.flcm-core/core-config.yaml', // Default configuration
  './.flcm-core/core-config.yml',  // Alternative extension
];

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
export class ConfigManager extends EventEmitter {
  private config: FLCMConfig;
  private configPath?: string;
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private options: ConfigManagerOptions;
  private reloadTimer?: NodeJS.Timeout;

  constructor(options: ConfigManagerOptions = {}) {
    super();
    this.options = {
      watchEnabled: false,
      envPrefix: 'FLCM_',
      strictValidation: true,
      ...options,
    };
    this.config = getDefaultConfig();
  }

  /**
   * Load configuration from files and environment
   */
  async load(customPath?: string): Promise<FLCMConfig> {
    try {
      // Find configuration file
      const configPath = customPath || this.findConfigFile();
      
      if (!configPath) {
        logger.warn('No configuration file found, using defaults');
        this.config = getDefaultConfig();
        return this.config;
      }

      this.configPath = configPath;
      logger.info(`Loading configuration from: ${configPath}`);

      // Load and parse YAML
      const configContent = await fs.promises.readFile(configPath, 'utf8');
      const rawConfig = yaml.load(configContent) as any;

      // Apply environment variable overrides
      const configWithEnv = this.applyEnvironmentOverrides(rawConfig);

      // Validate configuration
      const validation = this.validate(configWithEnv);
      if (!validation.valid) {
        if (this.options.strictValidation) {
          throw new Error(`Configuration validation failed: ${validation.errors?.join(', ')}`);
        } else {
          logger.warn(`Configuration warnings: ${validation.warnings?.join(', ')}`);
        }
      }

      // Merge with defaults
      this.config = this.merge(getDefaultConfig(), configWithEnv);

      // Set up file watching if enabled
      if (this.options.watchEnabled) {
        this.setupWatcher(configPath);
      }

      logger.info('Configuration loaded successfully');
      this.emit('loaded', this.config);
      
      return this.config;
    } catch (error) {
      logger.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Find the highest priority configuration file that exists
   */
  private findConfigFile(): string | undefined {
    const expandHome = (filepath: string) => {
      if (filepath.startsWith('~/')) {
        return path.join(process.env.HOME || '', filepath.slice(2));
      }
      return filepath;
    };

    for (const configPath of CONFIG_PRIORITY) {
      const fullPath = path.resolve(expandHome(configPath));
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return undefined;
  }

  /**
   * Apply environment variable overrides
   */
  private applyEnvironmentOverrides(config: any): any {
    const result = { ...config };
    const prefix = this.options.envPrefix;

    // Process environment variables
    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(prefix)) continue;

      // Convert FLCM_MAIN_TIMEOUT to main.timeout
      const configPath = key
        .slice(prefix.length)
        .toLowerCase()
        .split('_')
        .join('.');

      this.setDeepValue(result, configPath, this.parseEnvValue(value));
    }

    return result;
  }

  /**
   * Parse environment variable value to appropriate type
   */
  private parseEnvValue(value?: string): any {
    if (!value) return undefined;
    
    // Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Number
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    
    // Array (comma-separated)
    if (value.includes(',')) {
      return value.split(',').map(v => v.trim());
    }
    
    // String
    return value;
  }

  /**
   * Set a value deep in an object using dot notation
   */
  private setDeepValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Validate configuration against schema
   */
  validate(config: Partial<FLCMConfig>): ValidationResult {
    try {
      const result = FLCMConfigSchema.safeParse(config);
      
      if (result.success) {
        return { valid: true };
      }

      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );

      return {
        valid: false,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error}`],
      };
    }
  }

  /**
   * Merge configurations with proper precedence
   */
  merge(base: FLCMConfig, override: Partial<FLCMConfig>): FLCMConfig {
    const merged = this.deepMerge(base, override);
    
    // Ensure version compatibility
    if (override.version && !this.isVersionCompatible(base.version, override.version)) {
      logger.warn(`Version mismatch: base=${base.version}, override=${override.version}`);
    }

    return merged as FLCMConfig;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(base: any, override: any): any {
    if (!override) return base;
    if (!base) return override;

    const result = { ...base };

    for (const key in override) {
      if (override.hasOwnProperty(key)) {
        if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
          result[key] = this.deepMerge(base[key], override[key]);
        } else {
          result[key] = override[key];
        }
      }
    }

    return result;
  }

  /**
   * Check version compatibility
   */
  private isVersionCompatible(baseVersion: string, overrideVersion: string): boolean {
    const [baseMajor] = baseVersion.split('.').map(Number);
    const [overrideMajor] = overrideVersion.split('.').map(Number);
    return baseMajor === overrideMajor;
  }

  /**
   * Set up file watcher for hot-reload
   */
  private setupWatcher(configPath: string): void {
    // Clear existing watcher
    if (this.watchers.has(configPath)) {
      this.watchers.get(configPath)?.close();
    }

    const watcher = fs.watch(configPath, (eventType) => {
      if (eventType === 'change') {
        // Debounce reload
        if (this.reloadTimer) {
          clearTimeout(this.reloadTimer);
        }

        this.reloadTimer = setTimeout(() => {
          logger.info('Configuration file changed, reloading...');
          this.reload();
        }, 500);
      }
    });

    this.watchers.set(configPath, watcher);
    logger.info(`Watching configuration file: ${configPath}`);
  }

  /**
   * Reload configuration
   */
  async reload(): Promise<void> {
    try {
      const oldConfig = { ...this.config };
      await this.load(this.configPath);
      
      // Emit change event with old and new configs
      this.emit('changed', {
        old: oldConfig,
        new: this.config,
      });

      logger.info('Configuration reloaded successfully');
    } catch (error) {
      logger.error('Failed to reload configuration:', error);
      this.emit('reload-error', error);
    }
  }

  /**
   * Watch for configuration changes
   */
  watch(callback: (config: FLCMConfig) => void): void {
    this.on('changed', ({ new: newConfig }) => {
      callback(newConfig);
    });

    // Enable watching if not already enabled
    if (!this.options.watchEnabled && this.configPath) {
      this.options.watchEnabled = true;
      this.setupWatcher(this.configPath);
    }
  }

  /**
   * Get configuration value by path
   */
  get<T = any>(path: string): T {
    const parts = path.split('.');
    let current: any = this.config;

    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined as any;
      }
      current = current[part];
    }

    return current as T;
  }

  /**
   * Set configuration value by path (runtime only, not persisted)
   */
  set(path: string, value: any): void {
    this.setDeepValue(this.config, path, value);
    this.emit('runtime-change', { path, value });
  }

  /**
   * Get the current configuration
   */
  getConfig(): FLCMConfig {
    return { ...this.config };
  }

  /**
   * Stop watching configuration files
   */
  stopWatching(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      logger.info(`Stopped watching: ${path}`);
    }
    this.watchers.clear();

    if (this.reloadTimer) {
      clearTimeout(this.reloadTimer);
      this.reloadTimer = undefined;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopWatching();
    this.removeAllListeners();
  }
}

// Export singleton instance for convenience
export const configManager = new ConfigManager();

// Export default function for quick loading
export async function loadConfig(options?: ConfigManagerOptions): Promise<FLCMConfig> {
  const manager = new ConfigManager(options);
  return manager.load();
}