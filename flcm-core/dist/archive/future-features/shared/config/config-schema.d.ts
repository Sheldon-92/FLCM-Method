/**
 * FLCM Configuration Schema
 * TypeScript interfaces and validation schemas for configuration
 */
export type Environment = 'development' | 'production' | 'test';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';
export type Platform = 'xiaohongshu' | 'zhihu' | 'wechat' | 'linkedin';
export type Framework = 'SWOT-USED' | 'SCAMPER' | 'Socratic' | '5W2H' | 'Pyramid';
export type InputType = 'text' | 'markdown' | 'pdf' | 'video' | 'audio' | 'image' | 'webpage' | 'code' | 'spreadsheet';
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
        optimalTimes?: {
            [key in Platform]?: string[];
        };
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
export declare const MainAgentConfigSchema: any;
export declare const ScholarAgentConfigSchema: any;
export declare const CreatorAgentConfigSchema: any;
export declare const PublisherAgentConfigSchema: any;
export declare const DocumentFlowConfigSchema: any;
export declare const FeatureFlagsSchema: any;
export declare const FLCMConfigSchema: any;
/**
 * Default configuration factory
 */
export declare function getDefaultConfig(): FLCMConfig;
