"use strict";
/**
 * FLCM Configuration Schema
 * TypeScript interfaces and validation schemas for configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultConfig = exports.FLCMConfigSchema = exports.FeatureFlagsSchema = exports.DocumentFlowConfigSchema = exports.PublisherAgentConfigSchema = exports.CreatorAgentConfigSchema = exports.ScholarAgentConfigSchema = exports.MainAgentConfigSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod validation schema for configuration
 */
exports.MainAgentConfigSchema = zod_1.z.object({
    timeout: zod_1.z.number().min(1000).max(300000).default(30000),
    retryAttempts: zod_1.z.number().min(0).max(10).default(3),
    logLevel: zod_1.z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
    circuitBreaker: zod_1.z.object({
        failureThreshold: zod_1.z.number().min(1).max(100).default(5),
        cooldownMs: zod_1.z.number().min(1000).max(600000).default(30000),
        testRequestTimeout: zod_1.z.number().min(100).max(30000).default(5000),
    }).optional(),
});
exports.ScholarAgentConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    frameworks: zod_1.z.array(zod_1.z.enum(['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'])).min(1),
    inputTypes: zod_1.z.array(zod_1.z.enum(['text', 'markdown', 'pdf', 'video', 'audio', 'image', 'webpage', 'code', 'spreadsheet'])).min(1),
    maxInputSize: zod_1.z.number().min(1024).max(104857600).default(10485760),
    timeout: zod_1.z.number().min(1000).max(300000).optional(),
    processingOptions: zod_1.z.object({
        parallelFrameworks: zod_1.z.boolean().default(true),
        cacheResults: zod_1.z.boolean().default(true),
        maxConcurrency: zod_1.z.number().min(1).max(10).default(3),
    }).optional(),
});
exports.CreatorAgentConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    modes: zod_1.z.object({
        quick: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            timeout: zod_1.z.number().min(1000).max(60000).default(5000),
            maxWords: zod_1.z.number().min(100).max(2000).optional(),
        }),
        standard: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            timeout: zod_1.z.number().min(1000).max(120000).default(10000),
            maxWords: zod_1.z.number().min(500).max(5000).optional(),
        }),
        custom: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            interactive: zod_1.z.boolean().default(true),
            maxIterations: zod_1.z.number().min(1).max(10).optional(),
        }),
    }),
    voiceDNA: zod_1.z.object({
        minSamples: zod_1.z.number().min(1).max(100).default(5),
        analysisDepth: zod_1.z.enum(['basic', 'standard', 'deep']).default('standard'),
        cacheProfiles: zod_1.z.boolean().default(true),
        updateFrequency: zod_1.z.number().min(1).max(365).optional(),
    }),
});
exports.PublisherAgentConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
    platforms: zod_1.z.object({
        xiaohongshu: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            maxLength: zod_1.z.number().min(100).max(5000).default(1000),
            hashtags: zod_1.z.boolean().default(true),
            hashtagCount: zod_1.z.number().min(1).max(30).optional(),
            emojiLevel: zod_1.z.enum(['none', 'minimal', 'moderate', 'heavy']).optional(),
        }).optional(),
        zhihu: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            maxLength: zod_1.z.number().min(500).max(50000).default(5000),
            includeReferences: zod_1.z.boolean().optional(),
            tocGeneration: zod_1.z.boolean().optional(),
        }).optional(),
        wechat: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            maxLength: zod_1.z.number().min(300).max(20000).default(3000),
            formatting: zod_1.z.enum(['simple', 'rich']).optional(),
        }).optional(),
        linkedin: zod_1.z.object({
            enabled: zod_1.z.boolean().default(true),
            maxLength: zod_1.z.number().min(100).max(3000).default(2000),
            hashtags: zod_1.z.boolean().optional(),
            professionalTone: zod_1.z.boolean().optional(),
        }).optional(),
    }),
    scheduling: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        defaultDelay: zod_1.z.number().min(0).max(86400000).optional(),
        optimalTimes: zod_1.z.record(zod_1.z.array(zod_1.z.string())).optional(),
    }).optional(),
});
exports.DocumentFlowConfigSchema = zod_1.z.object({
    inputPath: zod_1.z.string().default('./data/input'),
    insightsPath: zod_1.z.string().default('./data/insights'),
    contentPath: zod_1.z.string().default('./data/content'),
    publishedPath: zod_1.z.string().default('./data/published'),
    archivePath: zod_1.z.string().optional(),
    watchEnabled: zod_1.z.boolean().default(false),
    autoProcess: zod_1.z.boolean().default(false),
    preserveMetadata: zod_1.z.boolean().default(true),
    versionControl: zod_1.z.object({
        enabled: zod_1.z.boolean().default(false),
        maxVersions: zod_1.z.number().min(1).max(100).default(10),
        diffTracking: zod_1.z.boolean().default(false),
    }).optional(),
});
exports.FeatureFlagsSchema = zod_1.z.record(zod_1.z.boolean()).optional();
exports.FLCMConfigSchema = zod_1.z.object({
    version: zod_1.z.string().regex(/^\d+\.\d+(\.\d+)?$/),
    environment: zod_1.z.enum(['development', 'production', 'test']).default('production'),
    main: exports.MainAgentConfigSchema,
    scholar: exports.ScholarAgentConfigSchema,
    creator: exports.CreatorAgentConfigSchema,
    publisher: exports.PublisherAgentConfigSchema,
    documents: exports.DocumentFlowConfigSchema,
    features: exports.FeatureFlagsSchema,
    custom: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Default configuration factory
 */
function getDefaultConfig() {
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
exports.getDefaultConfig = getDefaultConfig;
//# sourceMappingURL=config-schema.js.map