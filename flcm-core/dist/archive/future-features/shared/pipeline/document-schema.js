"use strict";
/**
 * FLCM Document Schema Definitions
 * Defines the structure and types for documents at each pipeline stage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSchemas = exports.canTransition = exports.validatePlatformDocument = exports.validateContentDocument = exports.validateInsightsDocument = exports.generateHash = exports.generateDocumentId = exports.createPlatformDocument = exports.createContentDocument = exports.createInsightsDocument = exports.PlatformMetadataSchema = exports.ContentMetadataSchema = exports.InsightsMetadataSchema = exports.SourceInfoSchema = exports.BaseMetadataSchema = exports.SourceType = exports.DocumentStage = void 0;
const zod_1 = require("zod");
/**
 * Document stages in the pipeline
 */
var DocumentStage;
(function (DocumentStage) {
    DocumentStage["INPUT"] = "input";
    DocumentStage["INSIGHTS"] = "insights";
    DocumentStage["CONTENT"] = "content";
    DocumentStage["PUBLISHED"] = "published";
    DocumentStage["ARCHIVED"] = "archived";
})(DocumentStage = exports.DocumentStage || (exports.DocumentStage = {}));
/**
 * Input source types
 */
var SourceType;
(function (SourceType) {
    SourceType["TEXT"] = "text";
    SourceType["MARKDOWN"] = "markdown";
    SourceType["PDF"] = "pdf";
    SourceType["VIDEO"] = "video";
    SourceType["AUDIO"] = "audio";
    SourceType["IMAGE"] = "image";
    SourceType["WEBPAGE"] = "webpage";
    SourceType["CODE"] = "code";
    SourceType["SPREADSHEET"] = "spreadsheet";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
/**
 * Zod schemas for validation
 */
// Base metadata schema
exports.BaseMetadataSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    timestamp: zod_1.z.date(),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    stage: zod_1.z.nativeEnum(DocumentStage),
    author: zod_1.z.string(),
    hash: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
// Source info schema
exports.SourceInfoSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(SourceType),
    path: zod_1.z.string(),
    hash: zod_1.z.string(),
    size: zod_1.z.number().optional(),
    originalName: zod_1.z.string().optional(),
});
// Insights metadata schema
exports.InsightsMetadataSchema = exports.BaseMetadataSchema.extend({
    stage: zod_1.z.literal(DocumentStage.INSIGHTS),
    source: exports.SourceInfoSchema,
    frameworks: zod_1.z.array(zod_1.z.enum(['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'])),
    processingTime: zod_1.z.number().optional(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    keyTopics: zod_1.z.array(zod_1.z.string()).optional(),
});
// Content metadata schema
exports.ContentMetadataSchema = exports.BaseMetadataSchema.extend({
    stage: zod_1.z.literal(DocumentStage.CONTENT),
    source: zod_1.z.object({
        insights: zod_1.z.string(),
    }),
    voiceDNA: zod_1.z.object({
        profile: zod_1.z.string(),
        confidence: zod_1.z.number().min(0).max(1),
        sampleCount: zod_1.z.number().optional(),
    }),
    mode: zod_1.z.enum(['quick', 'standard', 'custom']),
    wordCount: zod_1.z.number().optional(),
    readingTime: zod_1.z.number().optional(),
    sentiment: zod_1.z.enum(['positive', 'neutral', 'negative']).optional(),
});
// Platform metadata schema
exports.PlatformMetadataSchema = exports.BaseMetadataSchema.extend({
    stage: zod_1.z.literal(DocumentStage.PUBLISHED),
    source: zod_1.z.object({
        content: zod_1.z.string(),
    }),
    platform: zod_1.z.enum(['xiaohongshu', 'zhihu', 'wechat', 'linkedin']),
    optimizations: zod_1.z.array(zod_1.z.string()),
    publishedUrl: zod_1.z.string().url().optional(),
    engagement: zod_1.z.object({
        views: zod_1.z.number().optional(),
        likes: zod_1.z.number().optional(),
        shares: zod_1.z.number().optional(),
        comments: zod_1.z.number().optional(),
    }).optional(),
    hashtags: zod_1.z.array(zod_1.z.string()).optional(),
    scheduledTime: zod_1.z.date().optional(),
});
/**
 * Document factory functions
 */
function createInsightsDocument(source, frameworks, content, author = 'Scholar Agent') {
    return {
        metadata: {
            id: generateDocumentId(),
            timestamp: new Date(),
            version: '1.0.0',
            stage: DocumentStage.INSIGHTS,
            author,
            source,
            frameworks,
            hash: generateHash(content),
        },
        content,
        analysisResults: [],
        summary: '',
        keyFindings: [],
    };
}
exports.createInsightsDocument = createInsightsDocument;
function createContentDocument(insightsPath, voiceProfile, mode, content, author = 'Creator Agent') {
    return {
        metadata: {
            id: generateDocumentId(),
            timestamp: new Date(),
            version: '1.0.0',
            stage: DocumentStage.CONTENT,
            author,
            source: {
                insights: insightsPath,
            },
            voiceDNA: {
                profile: voiceProfile,
                confidence: 0,
            },
            mode,
            hash: generateHash(content),
        },
        content,
        title: '',
        sections: [],
    };
}
exports.createContentDocument = createContentDocument;
function createPlatformDocument(contentPath, platform, optimizations, content, author = 'Publisher Agent') {
    return {
        metadata: {
            id: generateDocumentId(),
            timestamp: new Date(),
            version: '1.0.0',
            stage: DocumentStage.PUBLISHED,
            author,
            source: {
                content: contentPath,
            },
            platform,
            optimizations,
            hash: generateHash(content),
        },
        content,
        title: '',
        body: '',
    };
}
exports.createPlatformDocument = createPlatformDocument;
/**
 * Utility functions
 */
function generateDocumentId() {
    // Simple UUID v4 generation (simplified for example)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.generateDocumentId = generateDocumentId;
function generateHash(content) {
    // Simple hash function (in production, use crypto)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}
exports.generateHash = generateHash;
/**
 * Document validation functions
 */
function validateInsightsDocument(doc) {
    const metadata = exports.InsightsMetadataSchema.parse(doc.metadata);
    return {
        ...doc,
        metadata,
    };
}
exports.validateInsightsDocument = validateInsightsDocument;
function validateContentDocument(doc) {
    const metadata = exports.ContentMetadataSchema.parse(doc.metadata);
    return {
        ...doc,
        metadata,
    };
}
exports.validateContentDocument = validateContentDocument;
function validatePlatformDocument(doc) {
    const metadata = exports.PlatformMetadataSchema.parse(doc.metadata);
    return {
        ...doc,
        metadata,
    };
}
exports.validatePlatformDocument = validatePlatformDocument;
/**
 * Document stage transition validation
 */
function canTransition(fromStage, toStage) {
    const validTransitions = {
        [DocumentStage.INPUT]: [DocumentStage.INSIGHTS],
        [DocumentStage.INSIGHTS]: [DocumentStage.CONTENT, DocumentStage.ARCHIVED],
        [DocumentStage.CONTENT]: [DocumentStage.PUBLISHED, DocumentStage.ARCHIVED],
        [DocumentStage.PUBLISHED]: [DocumentStage.ARCHIVED],
        [DocumentStage.ARCHIVED]: [], // No transitions from archived
    };
    return validTransitions[fromStage]?.includes(toStage) || false;
}
exports.canTransition = canTransition;
/**
 * Export all schemas for external use
 */
exports.DocumentSchemas = {
    BaseMetadata: exports.BaseMetadataSchema,
    InsightsMetadata: exports.InsightsMetadataSchema,
    ContentMetadata: exports.ContentMetadataSchema,
    PlatformMetadata: exports.PlatformMetadataSchema,
    SourceInfo: exports.SourceInfoSchema,
};
//# sourceMappingURL=document-schema.js.map