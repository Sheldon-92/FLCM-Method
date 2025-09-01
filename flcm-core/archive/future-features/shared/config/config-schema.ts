/**
 * FLCM Configuration Schema
 * TypeScript interfaces and validation schemas for configuration
 */

import { z } from 'zod';

// Environment types
export type Environment = 'development' | 'production' | 'test';

// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

// Platform types
export type Platform = 'xiaohongshu' | 'zhihu' | 'wechat' | 'linkedin';

// Framework types
export type Framework = 'SWOT-USED' | 'SCAMPER' | 'Socratic' | '5W2H' | 'Pyramid';

// Input types
export type InputType = 'text' | 'markdown' | 'pdf' | 'video' | 'audio' | 'image' | 'webpage' | 'code' | 'spreadsheet';

// Creation modes
export type CreationMode = 'quick' | 'standard' | 'custom';

/**
 * Main agent configuration
 */
export interface MainAgentConfig {
  timeout: number;
  retryAttempts: number;
  logLevel: LogLevel;
  circuitBreaker?: {
    failureThreshold: number;
    cooldownMs: number;
    testRequestTimeout: number;
  };
}

/**
 * Scholar agent configuration
 */
export interface ScholarAgentConfig {
  enabled: boolean;
  frameworks: Framework[];
  inputTypes: InputType[];
  maxInputSize: number;
  timeout?: number;
  processingOptions?: {
    parallelFrameworks: boolean;
    cacheResults: boolean;
    maxConcurrency: number;
  };
}

/**
 * Creator agent configuration
 */
export interface CreatorAgentConfig {
  enabled: boolean;
  modes: {
    quick: {
      enabled: boolean;
      timeout: number;
      maxWords?: number;
    };
    standard: {
      enabled: boolean;
      timeout: number;
      maxWords?: number;
    };
    custom: {
      enabled: boolean;
      interactive: boolean;
      maxIterations?: number;
    };
  };
  voiceDNA: {
    minSamples: number;
    analysisDepth: 'basic' | 'standard' | 'deep';
    cacheProfiles: boolean;
    updateFrequency?: number;
  };
}

/**
 * Publisher agent configuration
 */
export interface PublisherAgentConfig {
  enabled: boolean;
  platforms: {
    xiaohongshu?: {
      enabled: boolean;
      maxLength: number;
      hashtags: boolean;
      hashtagCount?: number;
      emojiLevel?: 'none' | 'minimal' | 'moderate' | 'heavy';
    };
    zhihu?: {
      enabled: boolean;
      maxLength: number;
      includeReferences?: boolean;
      tocGeneration?: boolean;
    };
    wechat?: {
      enabled: boolean;
      maxLength: number;
      formatting?: 'simple' | 'rich';
    };
    linkedin?: {
      enabled: boolean;
      maxLength: number;
      hashtags?: boolean;
      professionalTone?: boolean;
    };
  };
  scheduling?: {
    enabled: boolean;
    defaultDelay?: number;
    optimalTimes?: { [key in Platform]?: string[] };
  };
}

/**
 * Document flow configuration
 */
export interface DocumentFlowConfig {
  inputPath: string;
  insightsPath: string;
  contentPath: string;
  publishedPath: string;
  archivePath?: string;
  watchEnabled?: boolean;
  autoProcess?: boolean;
  preserveMetadata?: boolean;
  versionControl?: {
    enabled: boolean;
    maxVersions: number;
    diffTracking: boolean;
  };
}

/**
 * Feature flags configuration
 */
export interface FeatureFlags {
  experimentalVoiceDNA?: boolean;
  advancedAnalytics?: boolean;
  autoPublish?: boolean;
  multiLanguageSupport?: boolean;
  collaborativeMode?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Complete FLCM configuration
 */
export interface FLCMConfig {
  version: string;
  environment: Environment;
  main: MainAgentConfig;
  scholar: ScholarAgentConfig;
  creator: CreatorAgentConfig;
  publisher: PublisherAgentConfig;
  documents: DocumentFlowConfig;
  features?: FeatureFlags;
  custom?: Record<string, any>;
}

/**
 * Zod validation schema for configuration
 */
export const MainAgentConfigSchema = z.object({
  timeout: z.number().min(1000).max(300000).default(30000),
  retryAttempts: z.number().min(0).max(10).default(3),
  logLevel: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  circuitBreaker: z.object({
    failureThreshold: z.number().min(1).max(100).default(5),
    cooldownMs: z.number().min(1000).max(600000).default(30000),
    testRequestTimeout: z.number().min(100).max(30000).default(5000),
  }).optional(),
});

export const ScholarAgentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  frameworks: z.array(z.enum(['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'])).min(1),
  inputTypes: z.array(z.enum(['text', 'markdown', 'pdf', 'video', 'audio', 'image', 'webpage', 'code', 'spreadsheet'])).min(1),
  maxInputSize: z.number().min(1024).max(104857600).default(10485760), // 1KB to 100MB, default 10MB
  timeout: z.number().min(1000).max(300000).optional(),
  processingOptions: z.object({
    parallelFrameworks: z.boolean().default(true),
    cacheResults: z.boolean().default(true),
    maxConcurrency: z.number().min(1).max(10).default(3),
  }).optional(),
});

export const CreatorAgentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  modes: z.object({
    quick: z.object({
      enabled: z.boolean().default(true),
      timeout: z.number().min(1000).max(60000).default(5000),
      maxWords: z.number().min(100).max(2000).optional(),
    }),
    standard: z.object({
      enabled: z.boolean().default(true),
      timeout: z.number().min(1000).max(120000).default(10000),
      maxWords: z.number().min(500).max(5000).optional(),
    }),
    custom: z.object({
      enabled: z.boolean().default(true),
      interactive: z.boolean().default(true),
      maxIterations: z.number().min(1).max(10).optional(),
    }),
  }),
  voiceDNA: z.object({
    minSamples: z.number().min(1).max(100).default(5),
    analysisDepth: z.enum(['basic', 'standard', 'deep']).default('standard'),
    cacheProfiles: z.boolean().default(true),
    updateFrequency: z.number().min(1).max(365).optional(),
  }),
});

export const PublisherAgentConfigSchema = z.object({
  enabled: z.boolean().default(true),
  platforms: z.object({
    xiaohongshu: z.object({
      enabled: z.boolean().default(true),
      maxLength: z.number().min(100).max(5000).default(1000),
      hashtags: z.boolean().default(true),
      hashtagCount: z.number().min(1).max(30).optional(),
      emojiLevel: z.enum(['none', 'minimal', 'moderate', 'heavy']).optional(),
    }).optional(),
    zhihu: z.object({
      enabled: z.boolean().default(true),
      maxLength: z.number().min(500).max(50000).default(5000),
      includeReferences: z.boolean().optional(),
      tocGeneration: z.boolean().optional(),
    }).optional(),
    wechat: z.object({
      enabled: z.boolean().default(true),
      maxLength: z.number().min(300).max(20000).default(3000),
      formatting: z.enum(['simple', 'rich']).optional(),
    }).optional(),
    linkedin: z.object({
      enabled: z.boolean().default(true),
      maxLength: z.number().min(100).max(3000).default(2000),
      hashtags: z.boolean().optional(),
      professionalTone: z.boolean().optional(),
    }).optional(),
  }),
  scheduling: z.object({
    enabled: z.boolean().default(false),
    defaultDelay: z.number().min(0).max(86400000).optional(), // up to 24 hours
    optimalTimes: z.record(z.array(z.string())).optional(),
  }).optional(),
});

export const DocumentFlowConfigSchema = z.object({
  inputPath: z.string().default('./data/input'),
  insightsPath: z.string().default('./data/insights'),
  contentPath: z.string().default('./data/content'),
  publishedPath: z.string().default('./data/published'),
  archivePath: z.string().optional(),
  watchEnabled: z.boolean().default(false),
  autoProcess: z.boolean().default(false),
  preserveMetadata: z.boolean().default(true),
  versionControl: z.object({
    enabled: z.boolean().default(false),
    maxVersions: z.number().min(1).max(100).default(10),
    diffTracking: z.boolean().default(false),
  }).optional(),
});

export const FeatureFlagsSchema = z.record(z.boolean()).optional();

export const FLCMConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+(\.\d+)?$/),
  environment: z.enum(['development', 'production', 'test']).default('production'),
  main: MainAgentConfigSchema,
  scholar: ScholarAgentConfigSchema,
  creator: CreatorAgentConfigSchema,
  publisher: PublisherAgentConfigSchema,
  documents: DocumentFlowConfigSchema,
  features: FeatureFlagsSchema,
  custom: z.record(z.any()).optional(),
});

/**
 * Default configuration factory
 */
export function getDefaultConfig(): FLCMConfig {
  return {
    version: '2.0.0',
    environment: 'production',
    main: {
      timeout: 30000,
      retryAttempts: 3,
      logLevel: 'info',
      circuitBreaker: {
        failureThreshold: 5,
        cooldownMs: 30000,
        testRequestTimeout: 5000,
      },
    },
    scholar: {
      enabled: true,
      frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'],
      inputTypes: ['text', 'markdown', 'pdf', 'video', 'audio', 'image', 'webpage', 'code', 'spreadsheet'],
      maxInputSize: 10485760,
      processingOptions: {
        parallelFrameworks: true,
        cacheResults: true,
        maxConcurrency: 3,
      },
    },
    creator: {
      enabled: true,
      modes: {
        quick: {
          enabled: true,
          timeout: 5000,
          maxWords: 800,
        },
        standard: {
          enabled: true,
          timeout: 10000,
          maxWords: 1500,
        },
        custom: {
          enabled: true,
          interactive: true,
          maxIterations: 5,
        },
      },
      voiceDNA: {
        minSamples: 5,
        analysisDepth: 'standard',
        cacheProfiles: true,
        updateFrequency: 30,
      },
    },
    publisher: {
      enabled: true,
      platforms: {
        xiaohongshu: {
          enabled: true,
          maxLength: 1000,
          hashtags: true,
          hashtagCount: 5,
          emojiLevel: 'moderate',
        },
        zhihu: {
          enabled: true,
          maxLength: 5000,
          includeReferences: true,
          tocGeneration: true,
        },
        wechat: {
          enabled: true,
          maxLength: 3000,
          formatting: 'rich',
        },
        linkedin: {
          enabled: true,
          maxLength: 2000,
          hashtags: true,
          professionalTone: true,
        },
      },
      scheduling: {
        enabled: false,
        defaultDelay: 3600000, // 1 hour
      },
    },
    documents: {
      inputPath: './data/input',
      insightsPath: './data/insights',
      contentPath: './data/content',
      publishedPath: './data/published',
      archivePath: './data/archive',
      watchEnabled: false,
      autoProcess: false,
      preserveMetadata: true,
      versionControl: {
        enabled: false,
        maxVersions: 10,
        diffTracking: false,
      },
    },
    features: {
      experimentalVoiceDNA: false,
      advancedAnalytics: false,
      autoPublish: false,
      multiLanguageSupport: false,
      collaborativeMode: false,
    },
  };
}