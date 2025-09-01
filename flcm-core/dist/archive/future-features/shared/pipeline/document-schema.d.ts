/**
 * FLCM Document Schema Definitions
 * Defines the structure and types for documents at each pipeline stage
 */
import { Framework, Platform, CreationMode } from '../config/config-schema';
/**
 * Document stages in the pipeline
 */
export declare enum DocumentStage {
    INPUT = "input",
    INSIGHTS = "insights",
    CONTENT = "content",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
/**
 * Input source types
 */
export declare enum SourceType {
    TEXT = "text",
    MARKDOWN = "markdown",
    PDF = "pdf",
    VIDEO = "video",
    AUDIO = "audio",
    IMAGE = "image",
    WEBPAGE = "webpage",
    CODE = "code",
    SPREADSHEET = "spreadsheet"
}
/**
 * Base metadata common to all documents
 */
export interface BaseMetadata {
    id: string;
    timestamp: Date;
    version: string;
    stage: DocumentStage;
    author: string;
    hash?: string;
    tags?: string[];
}
/**
 * Source information
 */
export interface SourceInfo {
    type: SourceType;
    path: string;
    hash: string;
    size?: number;
    originalName?: string;
}
/**
 * Insights document metadata
 */
export interface InsightsMetadata extends BaseMetadata {
    stage: DocumentStage.INSIGHTS;
    source: SourceInfo;
    frameworks: Framework[];
    processingTime?: number;
    confidence?: number;
    keyTopics?: string[];
}
/**
 * Content document metadata
 */
export interface ContentMetadata extends BaseMetadata {
    stage: DocumentStage.CONTENT;
    source: {
        insights: string;
    };
    voiceDNA: {
        profile: string;
        confidence: number;
        sampleCount?: number;
    };
    mode: CreationMode;
    wordCount?: number;
    readingTime?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
}
/**
 * Platform document metadata
 */
export interface PlatformMetadata extends BaseMetadata {
    stage: DocumentStage.PUBLISHED;
    source: {
        content: string;
    };
    platform: Platform;
    optimizations: string[];
    publishedUrl?: string;
    engagement?: {
        views?: number;
        likes?: number;
        shares?: number;
        comments?: number;
    };
    hashtags?: string[];
    scheduledTime?: Date;
}
/**
 * Complete document structure
 */
export interface Document<T extends BaseMetadata = BaseMetadata> {
    metadata: T;
    content: string;
    attachments?: DocumentAttachment[];
    history?: DocumentHistory[];
}
/**
 * Document attachment
 */
export interface DocumentAttachment {
    name: string;
    type: string;
    path: string;
    size: number;
}
/**
 * Document history entry
 */
export interface DocumentHistory {
    version: string;
    timestamp: Date;
    author: string;
    changes: string;
    diff?: string;
}
/**
 * Insights document
 */
export interface InsightsDocument extends Document<InsightsMetadata> {
    analysisResults: {
        framework: Framework;
        results: any;
        confidence: number;
        processingTime: number;
    }[];
    summary: string;
    keyFindings: string[];
    recommendations?: string[];
}
/**
 * Content document
 */
export interface ContentDocument extends Document<ContentMetadata> {
    title: string;
    sections: ContentSection[];
    references?: string[];
    voiceAnalysis?: {
        styleMarkers: string[];
        toneProfile: Record<string, number>;
        vocabularyPattern: Record<string, number>;
    };
}
/**
 * Content section
 */
export interface ContentSection {
    heading: string;
    content: string;
    level: number;
    wordCount: number;
}
/**
 * Platform document
 */
export interface PlatformDocument extends Document<PlatformMetadata> {
    title: string;
    body: string;
    hashtags?: string[];
    mentions?: string[];
    media?: {
        images?: string[];
        videos?: string[];
    };
    platformSpecific?: Record<string, any>;
}
/**
 * Zod schemas for validation
 */
export declare const BaseMetadataSchema: any;
export declare const SourceInfoSchema: any;
export declare const InsightsMetadataSchema: any;
export declare const ContentMetadataSchema: any;
export declare const PlatformMetadataSchema: any;
/**
 * Document factory functions
 */
export declare function createInsightsDocument(source: SourceInfo, frameworks: Framework[], content: string, author?: string): InsightsDocument;
export declare function createContentDocument(insightsPath: string, voiceProfile: string, mode: CreationMode, content: string, author?: string): ContentDocument;
export declare function createPlatformDocument(contentPath: string, platform: Platform, optimizations: string[], content: string, author?: string): PlatformDocument;
/**
 * Utility functions
 */
export declare function generateDocumentId(): string;
export declare function generateHash(content: string): string;
/**
 * Document validation functions
 */
export declare function validateInsightsDocument(doc: any): InsightsDocument;
export declare function validateContentDocument(doc: any): ContentDocument;
export declare function validatePlatformDocument(doc: any): PlatformDocument;
/**
 * Document stage transition validation
 */
export declare function canTransition(fromStage: DocumentStage, toStage: DocumentStage): boolean;
/**
 * Export all schemas for external use
 */
export declare const DocumentSchemas: {
    BaseMetadata: any;
    InsightsMetadata: any;
    ContentMetadata: any;
    PlatformMetadata: any;
    SourceInfo: any;
};
