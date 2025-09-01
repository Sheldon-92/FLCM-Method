/**
 * Configuration Manager
 * Handles loading and validation of FLCM configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { RouterConfig, FLCMVersion } from '../../router/types';

export interface FLCMConfig {
  flcm: {
    defaultVersion: FLCMVersion;
    userOverrides: {
      enabled: boolean;
      configPath: string;
    };
    featureFlags: Record<string, boolean>;
  };
  logging: {
    level: string;
    format: string;
    destination: string;
  };
  performance: {
    maxRequestTime: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

export interface UserConfig {
  userId: string;
  preferredVersion?: FLCMVersion;
  featureOverrides?: Record<string, boolean>;
  settings?: Record<string, any>;
}

export class ConfigManager {
  private config: FLCMConfig;
  private userConfigs: Map<string, UserConfig> = new Map();
  private configPath: string;
  
  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), '.flcm-core', 'core-config.yaml');
    this.loadConfig();
    this.loadUserConfigs();
  }
  
  private loadConfig(): void {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const rawConfig = yaml.load(configContent) as any;
      
      // Set defaults and validate
      this.config = this.validateAndSetDefaults(rawConfig);
    } catch (error) {
      // Use default configuration if file doesn't exist
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  }
  
  private validateAndSetDefaults(rawConfig: any): FLCMConfig {
    return {
      flcm: {
        defaultVersion: rawConfig?.flcm?.defaultVersion || '1.0',
        userOverrides: {
          enabled: rawConfig?.flcm?.userOverrides?.enabled ?? true,
          configPath: rawConfig?.flcm?.userOverrides?.configPath || '.flcm/user-config.yaml'
        },
        featureFlags: {
          v2_mentor: rawConfig?.flcm?.featureFlags?.v2_mentor ?? false,
          v2_creator: rawConfig?.flcm?.featureFlags?.v2_creator ?? false,
          v2_publisher: rawConfig?.flcm?.featureFlags?.v2_publisher ?? false,
          v2_obsidian: rawConfig?.flcm?.featureFlags?.v2_obsidian ?? false,
          ...rawConfig?.flcm?.featureFlags
        }
      },
      logging: {
        level: rawConfig?.logging?.level || 'info',
        format: rawConfig?.logging?.format || 'json',
        destination: rawConfig?.logging?.destination || 'console'
      },
      performance: {
        maxRequestTime: rawConfig?.performance?.maxRequestTime || 30000,
        cacheEnabled: rawConfig?.performance?.cacheEnabled ?? true,
        cacheTTL: rawConfig?.performance?.cacheTTL || 3600
      }
    };
  }
  
  private getDefaultConfig(): FLCMConfig {
    return {
      flcm: {
        defaultVersion: '1.0',
        userOverrides: {
          enabled: true,
          configPath: '.flcm/user-config.yaml'
        },
        featureFlags: {
          v2_mentor: false,
          v2_creator: false,
          v2_publisher: false,
          v2_obsidian: false
        }
      },
      logging: {
        level: 'info',
        format: 'json',
        destination: 'console'
      },
      performance: {
        maxRequestTime: 30000,
        cacheEnabled: true,
        cacheTTL: 3600
      }
    };
  }
  
  private loadUserConfigs(): void {
    if (!this.config.flcm.userOverrides.enabled) {
      return;
    }
    
    const userConfigPath = this.config.flcm.userOverrides.configPath;
    const fullPath = path.isAbsolute(userConfigPath) 
      ? userConfigPath 
      : path.join(process.cwd(), userConfigPath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const userConfigs = yaml.load(content) as UserConfig[];
        
        if (Array.isArray(userConfigs)) {
          userConfigs.forEach(config => {
            this.userConfigs.set(config.userId, config);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user configs:', error);
    }
  }
  
  saveConfig(): void {
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const yamlContent = yaml.dump(this.config);
      fs.writeFileSync(this.configPath, yamlContent, 'utf8');
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }
  
  getRouterConfig(): RouterConfig {
    return {
      defaultVersion: this.config.flcm.defaultVersion,
      userOverridesEnabled: this.config.flcm.userOverrides.enabled,
      featureFlags: this.config.flcm.featureFlags,
      configPath: this.configPath
    };
  }
  
  getUserConfig(userId: string): UserConfig | undefined {
    return this.userConfigs.get(userId);
  }
  
  updateUserConfig(userId: string, config: Partial<UserConfig>): void {
    const existing = this.userConfigs.get(userId) || { userId };
    this.userConfigs.set(userId, { ...existing, ...config });
    this.saveUserConfigs();
  }
  
  private saveUserConfigs(): void {
    const userConfigPath = this.config.flcm.userOverrides.configPath;
    const fullPath = path.isAbsolute(userConfigPath)
      ? userConfigPath
      : path.join(process.cwd(), userConfigPath);
    
    try {
      const configDir = path.dirname(fullPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      const configs = Array.from(this.userConfigs.values());
      const yamlContent = yaml.dump(configs);
      fs.writeFileSync(fullPath, yamlContent, 'utf8');
    } catch (error) {
      console.error('Failed to save user configs:', error);
    }
  }
  
  updateFeatureFlag(flag: string, enabled: boolean): void {
    this.config.flcm.featureFlags[flag] = enabled;
    this.saveConfig();
  }
  
  getFeatureFlags(): Record<string, boolean> {
    return { ...this.config.flcm.featureFlags };
  }
  
  getFullConfig(): FLCMConfig {
    return JSON.parse(JSON.stringify(this.config));
  }
  
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate version
    if (!['1.0', '2.0'].includes(this.config.flcm.defaultVersion)) {
      errors.push(`Invalid default version: ${this.config.flcm.defaultVersion}`);
    }
    
    // Validate logging level
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logging.level)) {
      errors.push(`Invalid log level: ${this.config.logging.level}`);
    }
    
    // Validate performance settings
    if (this.config.performance.maxRequestTime < 1000) {
      errors.push('Max request time must be at least 1000ms');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}