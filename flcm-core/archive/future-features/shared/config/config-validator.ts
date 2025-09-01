/**
 * FLCM Configuration Validator
 * Advanced validation and rule checking for configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { FLCMConfig, Platform, Framework, InputType, CreationMode, LogLevel } from './config-schema';

/**
 * Validation rule types
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  path: string;
  message: string;
  severity: ValidationSeverity;
  rule?: string;
}

/**
 * Validation result with detailed issues
 */
export interface DetailedValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Configuration Validator
 * Provides detailed validation beyond schema checking
 */
export class ConfigValidator {
  private issues: ValidationIssue[] = [];

  /**
   * Perform comprehensive validation
   */
  validateComprehensive(config: FLCMConfig): DetailedValidationResult {
    this.issues = [];

    // Basic structure validation
    this.validateStructure(config);

    // Business logic validation
    this.validateBusinessLogic(config);

    // Path validation
    this.validatePaths(config);

    // Performance validation
    this.validatePerformance(config);

    // Security validation
    this.validateSecurity(config);

    // Feature compatibility
    this.validateFeatureCompatibility(config);

    // Platform-specific rules
    this.validatePlatformRules(config);

    // Calculate stats
    const stats = {
      errors: this.issues.filter(i => i.severity === ValidationSeverity.ERROR).length,
      warnings: this.issues.filter(i => i.severity === ValidationSeverity.WARNING).length,
      info: this.issues.filter(i => i.severity === ValidationSeverity.INFO).length,
    };

    return {
      valid: stats.errors === 0,
      issues: this.issues,
      stats,
    };
  }

  /**
   * Validate basic structure
   */
  private validateStructure(config: FLCMConfig): void {
    // Check version format
    if (!config.version.match(/^\d+\.\d+\.\d+$/)) {
      this.addIssue('version', 'Version should follow semantic versioning (X.Y.Z)', ValidationSeverity.WARNING);
    }

    // Check required agents
    if (!config.scholar.enabled && !config.creator.enabled && !config.publisher.enabled) {
      this.addIssue('agents', 'At least one agent must be enabled', ValidationSeverity.ERROR);
    }
  }

  /**
   * Validate business logic
   */
  private validateBusinessLogic(config: FLCMConfig): void {
    // Scholar agent logic
    if (config.scholar.enabled) {
      if (config.scholar.frameworks.length === 0) {
        this.addIssue('scholar.frameworks', 'Scholar agent requires at least one framework', ValidationSeverity.ERROR);
      }

      if (config.scholar.inputTypes.length === 0) {
        this.addIssue('scholar.inputTypes', 'Scholar agent requires at least one input type', ValidationSeverity.ERROR);
      }

      if (config.scholar.maxInputSize < 1024) {
        this.addIssue('scholar.maxInputSize', 'Input size too small, minimum 1KB recommended', ValidationSeverity.WARNING);
      }

      if (config.scholar.processingOptions?.maxConcurrency && config.scholar.processingOptions.maxConcurrency > 10) {
        this.addIssue('scholar.processingOptions.maxConcurrency', 'High concurrency may cause performance issues', ValidationSeverity.WARNING);
      }
    }

    // Creator agent logic
    if (config.creator.enabled) {
      const modes = config.creator.modes;
      if (!modes.quick.enabled && !modes.standard.enabled && !modes.custom.enabled) {
        this.addIssue('creator.modes', 'At least one creation mode must be enabled', ValidationSeverity.ERROR);
      }

      if (modes.quick.maxWords && modes.standard.maxWords && modes.quick.maxWords > modes.standard.maxWords) {
        this.addIssue('creator.modes', 'Quick mode word limit should be less than standard mode', ValidationSeverity.WARNING);
      }

      if (config.creator.voiceDNA.minSamples < 3) {
        this.addIssue('creator.voiceDNA.minSamples', 'Voice DNA requires at least 3 samples for accuracy', ValidationSeverity.WARNING);
      }
    }

    // Publisher agent logic
    if (config.publisher.enabled) {
      const platforms = config.publisher.platforms;
      const enabledPlatforms = Object.entries(platforms)
        .filter(([_, settings]) => settings?.enabled)
        .map(([name]) => name);

      if (enabledPlatforms.length === 0) {
        this.addIssue('publisher.platforms', 'At least one platform must be enabled', ValidationSeverity.ERROR);
      }

      // Check platform-specific limits
      if (platforms.xiaohongshu?.enabled && platforms.xiaohongshu.maxLength > 5000) {
        this.addIssue('publisher.platforms.xiaohongshu.maxLength', 'XiaoHongShu has a 5000 character limit', ValidationSeverity.ERROR);
      }

      if (platforms.linkedin?.enabled && platforms.linkedin.maxLength > 3000) {
        this.addIssue('publisher.platforms.linkedin.maxLength', 'LinkedIn has a 3000 character limit', ValidationSeverity.WARNING);
      }
    }

    // Workflow dependencies
    if (config.documents.autoProcess && !config.documents.watchEnabled) {
      this.addIssue('documents', 'Auto-process requires watch mode to be enabled', ValidationSeverity.ERROR);
    }
  }

  /**
   * Validate file paths
   */
  private validatePaths(config: FLCMConfig): void {
    const paths = [
      config.documents.inputPath,
      config.documents.insightsPath,
      config.documents.contentPath,
      config.documents.publishedPath,
    ];

    if (config.documents.archivePath) {
      paths.push(config.documents.archivePath);
    }

    // Check for path conflicts
    const uniquePaths = new Set(paths);
    if (uniquePaths.size < paths.length) {
      this.addIssue('documents', 'Document paths must be unique', ValidationSeverity.ERROR);
    }

    // Check path accessibility
    paths.forEach(p => {
      const resolvedPath = path.resolve(p);
      const parentDir = path.dirname(resolvedPath);
      
      if (!fs.existsSync(parentDir)) {
        this.addIssue(`documents.${p}`, `Parent directory does not exist: ${parentDir}`, ValidationSeverity.WARNING);
      }
    });

    // Check for dangerous paths
    paths.forEach(p => {
      if (p.includes('..')) {
        this.addIssue(`documents.${p}`, 'Path traversal detected, avoid using ".."', ValidationSeverity.WARNING);
      }
    });
  }

  /**
   * Validate performance settings
   */
  private validatePerformance(config: FLCMConfig): void {
    // Timeout validations
    if (config.main.timeout < 1000) {
      this.addIssue('main.timeout', 'Timeout too low, may cause premature failures', ValidationSeverity.WARNING);
    }

    if (config.main.timeout > 300000) {
      this.addIssue('main.timeout', 'Very high timeout, consider optimizing operations', ValidationSeverity.INFO);
    }

    // Circuit breaker settings
    if (config.main.circuitBreaker) {
      const cb = config.main.circuitBreaker;
      if (cb.failureThreshold < 3) {
        this.addIssue('main.circuitBreaker.failureThreshold', 'Low threshold may trigger circuit breaker too easily', ValidationSeverity.WARNING);
      }

      if (cb.cooldownMs < 5000) {
        this.addIssue('main.circuitBreaker.cooldownMs', 'Short cooldown may not allow services to recover', ValidationSeverity.WARNING);
      }
    }

    // Memory considerations
    if (config.scholar.maxInputSize > 52428800) { // 50MB
      this.addIssue('scholar.maxInputSize', 'Large input size may cause memory issues', ValidationSeverity.WARNING);
    }

    // Concurrency limits
    if (config.scholar.processingOptions?.parallelFrameworks && config.scholar.frameworks.length > 5) {
      this.addIssue('scholar', 'Parallel processing of many frameworks may impact performance', ValidationSeverity.INFO);
    }
  }

  /**
   * Validate security settings
   */
  private validateSecurity(config: FLCMConfig): void {
    // Log level in production
    if (config.environment === 'production' && config.main.logLevel === 'debug') {
      this.addIssue('main.logLevel', 'Debug logging in production may expose sensitive information', ValidationSeverity.WARNING);
    }

    // File size limits
    if (config.scholar.maxInputSize > 104857600) { // 100MB
      this.addIssue('scholar.maxInputSize', 'Very large file size limit may pose security risks', ValidationSeverity.WARNING);
    }

    // Version control in production
    if (config.environment === 'production' && config.documents.versionControl?.enabled) {
      if (config.documents.versionControl.maxVersions > 50) {
        this.addIssue('documents.versionControl.maxVersions', 'High version limit may consume excessive storage', ValidationSeverity.INFO);
      }
    }
  }

  /**
   * Validate feature compatibility
   */
  private validateFeatureCompatibility(config: FLCMConfig): void {
    const features = config.features || {};

    // Voice DNA compatibility
    if (features.experimentalVoiceDNA && !config.creator.enabled) {
      this.addIssue('features.experimentalVoiceDNA', 'Voice DNA requires Creator agent to be enabled', ValidationSeverity.ERROR);
    }

    // Analytics compatibility
    if (features.advancedAnalytics) {
      if (config.main.logLevel === 'error') {
        this.addIssue('features.advancedAnalytics', 'Advanced analytics works better with info or debug log level', ValidationSeverity.INFO);
      }
    }

    // Auto-publish compatibility
    if (features.autoPublish) {
      if (!config.publisher.enabled) {
        this.addIssue('features.autoPublish', 'Auto-publish requires Publisher agent to be enabled', ValidationSeverity.ERROR);
      }

      if (!config.documents.watchEnabled) {
        this.addIssue('features.autoPublish', 'Auto-publish works better with watch mode enabled', ValidationSeverity.WARNING);
      }
    }

    // Multi-language support
    if (features.multiLanguageSupport) {
      if (config.creator.voiceDNA.analysisDepth === 'basic') {
        this.addIssue('features.multiLanguageSupport', 'Multi-language support works better with deep voice analysis', ValidationSeverity.INFO);
      }
    }
  }

  /**
   * Validate platform-specific rules
   */
  private validatePlatformRules(config: FLCMConfig): void {
    const platforms = config.publisher.platforms;

    // XiaoHongShu specific
    if (platforms.xiaohongshu?.enabled) {
      const xhs = platforms.xiaohongshu;
      if (xhs.hashtags && !xhs.hashtagCount) {
        this.addIssue('publisher.platforms.xiaohongshu', 'Hashtag count should be specified when hashtags are enabled', ValidationSeverity.INFO);
      }

      if (xhs.hashtagCount && xhs.hashtagCount > 10) {
        this.addIssue('publisher.platforms.xiaohongshu.hashtagCount', 'Too many hashtags may reduce engagement', ValidationSeverity.WARNING);
      }

      if (xhs.emojiLevel === 'heavy' && xhs.maxLength < 500) {
        this.addIssue('publisher.platforms.xiaohongshu', 'Heavy emoji use with short content may appear unprofessional', ValidationSeverity.INFO);
      }
    }

    // Zhihu specific
    if (platforms.zhihu?.enabled) {
      const zhihu = platforms.zhihu;
      if (zhihu.maxLength < 1000 && zhihu.includeReferences) {
        this.addIssue('publisher.platforms.zhihu', 'Short content with references may lack substance', ValidationSeverity.WARNING);
      }

      if (zhihu.tocGeneration && zhihu.maxLength < 2000) {
        this.addIssue('publisher.platforms.zhihu', 'Table of contents unnecessary for short content', ValidationSeverity.INFO);
      }
    }

    // LinkedIn specific
    if (platforms.linkedin?.enabled) {
      const linkedin = platforms.linkedin;
      if (linkedin.professionalTone && platforms.xiaohongshu?.emojiLevel === 'heavy') {
        this.addIssue('publisher.platforms', 'Conflicting tone settings between LinkedIn and XiaoHongShu', ValidationSeverity.INFO);
      }
    }

    // Scheduling validation
    if (config.publisher.scheduling?.enabled) {
      const scheduling = config.publisher.scheduling;
      if (scheduling.defaultDelay && scheduling.defaultDelay < 60000) { // 1 minute
        this.addIssue('publisher.scheduling.defaultDelay', 'Very short delay may not be practical', ValidationSeverity.WARNING);
      }

      if (scheduling.optimalTimes) {
        Object.entries(scheduling.optimalTimes).forEach(([platform, times]) => {
          if (!platforms[platform as Platform]?.enabled) {
            this.addIssue(`publisher.scheduling.optimalTimes.${platform}`, 'Scheduling configured for disabled platform', ValidationSeverity.WARNING);
          }

          times.forEach(time => {
            if (!time.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
              this.addIssue(`publisher.scheduling.optimalTimes.${platform}`, `Invalid time format: ${time}`, ValidationSeverity.ERROR);
            }
          });
        });
      }
    }
  }

  /**
   * Add validation issue
   */
  private addIssue(path: string, message: string, severity: ValidationSeverity, rule?: string): void {
    this.issues.push({
      path,
      message,
      severity,
      rule,
    });
  }

  /**
   * Format validation report
   */
  static formatReport(result: DetailedValidationResult): string {
    const lines: string[] = [];
    
    lines.push('Configuration Validation Report');
    lines.push('================================');
    lines.push(`Status: ${result.valid ? ' VALID' : 'L INVALID'}`);
    lines.push(`Errors: ${result.stats.errors}, Warnings: ${result.stats.warnings}, Info: ${result.stats.info}`);
    lines.push('');

    if (result.issues.length > 0) {
      lines.push('Issues:');
      lines.push('-------');

      // Group by severity
      const errors = result.issues.filter(i => i.severity === ValidationSeverity.ERROR);
      const warnings = result.issues.filter(i => i.severity === ValidationSeverity.WARNING);
      const info = result.issues.filter(i => i.severity === ValidationSeverity.INFO);

      if (errors.length > 0) {
        lines.push('');
        lines.push('L ERRORS:');
        errors.forEach(issue => {
          lines.push(`  - ${issue.path}: ${issue.message}`);
        });
      }

      if (warnings.length > 0) {
        lines.push('');
        lines.push('   WARNINGS:');
        warnings.forEach(issue => {
          lines.push(`  - ${issue.path}: ${issue.message}`);
        });
      }

      if (info.length > 0) {
        lines.push('');
        lines.push('9  INFO:');
        info.forEach(issue => {
          lines.push(`  - ${issue.path}: ${issue.message}`);
        });
      }
    } else {
      lines.push('No issues found! Configuration is optimal.');
    }

    return lines.join('\n');
  }
}

// Export convenience function
export function validateConfig(config: FLCMConfig): DetailedValidationResult {
  const validator = new ConfigValidator();
  return validator.validateComprehensive(config);
}