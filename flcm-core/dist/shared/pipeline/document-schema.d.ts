/**
 * Document Schema for FLCM 2.0 Pipeline
 * Defines all document types and interfaces for the content processing pipeline
 */
export interface BaseDocument {
    id: string;
    timestamp: Date;
    version: string;
    metadata: DocumentMetadata;
}
export interface DocumentMetadata {
    title?: string;
    author?: string;
    source?: string;
    tags?: string[];
    category?: string;
    language?: string;
    processed: boolean;
    processingSteps?: string[];
    quality?: QualityMetrics;
    [key: string]: any;
}
export interface QualityMetrics {
    score: number;
    readability: number;
    coherence: number;
    completeness: number;
    accuracy: number;
}
export interface ContentDocument extends BaseDocument {
    type: 'content';
    title: string;
    content: string;
    source: DocumentSource;
    format: 'text' | 'markdown' | 'html' | 'json';
    wordCount: number;
    language: string;
}
export interface DocumentSource {
    type: 'url' | 'file' | 'text' | 'api';
    location?: string;
    filename?: string;
    encoding?: string;
    lastModified?: Date;
}
export interface InsightsDocument extends BaseDocument {
    type: 'insights';
    originalContent: string;
    analysis: AnalysisResult[];
    keyPoints: string[];
    topics: string[];
    frameworks: FrameworkAnalysis[];
    summary: string;
    confidence: number;
}
export interface AnalysisResult {
    framework: string;
    findings: string[];
    confidence: number;
    evidence: string[];
    recommendations: string[];
}
export interface FrameworkAnalysis {
    name: string;
    description: string;
    application: string;
    relevance: number;
    insights: string[];
}
export interface DraftDocument extends BaseDocument {
    type: 'draft';
    title: string;
    content: string;
    voice: VoiceProfile;
    style: WritingStyle;
    structure: ContentStructure;
    alternatives: string[];
    quality: QualityMetrics;
}
export interface VoiceProfile {
    tone: string;
    style: string;
    vocabulary: string;
    personality: string[];
    expertise: string[];
    targetAudience: string;
}
export interface WritingStyle {
    format: 'article' | 'blog' | 'social' | 'academic' | 'casual';
    length: 'short' | 'medium' | 'long';
    structure: 'linear' | 'hierarchical' | 'narrative';
    complexity: 'simple' | 'intermediate' | 'advanced';
}
export interface ContentStructure {
    sections: ContentSection[];
    headings: string[];
    outline: string[];
    wordCount: number;
    readingTime: number;
}
export interface ContentSection {
    id: string;
    title: string;
    content: string;
    type: 'introduction' | 'body' | 'conclusion' | 'aside';
    order: number;
}
export interface PublishedContent extends BaseDocument {
    type: 'published';
    platform: Platform;
    title: string;
    body: string;
    hashtags: string[];
    keywords: string[];
    visualSuggestions: VisualRecommendation[];
    publishedAt?: Date;
    metrics?: ContentMetrics;
}
export type Platform = 'xiaohongshu' | 'zhihu' | 'wechat' | 'linkedin' | 'twitter' | 'facebook' | 'instagram';
export interface VisualRecommendation {
    type: 'image' | 'video' | 'infographic' | 'chart' | 'diagram' | 'cover' | 'inline';
    description: string;
    style: string;
    elements: string[];
    priority?: number;
}
export interface ContentMetrics {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagement: number;
    reach: number;
    impressions: number;
}
export declare enum ProcessingState {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    ERROR = "error",
    CANCELLED = "cancelled"
}
export interface PipelineStage {
    stage: 'input' | 'analysis' | 'creation' | 'publishing';
    agent: 'scholar' | 'creator' | 'publisher';
    status: ProcessingState;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    error?: Error;
}
export interface ProcessingContext {
    sessionId: string;
    userId?: string;
    requestId: string;
    pipeline: PipelineStage[];
    options: ProcessingOptions;
    metrics: ProcessingMetrics;
}
export interface ProcessingOptions {
    mode: 'quick' | 'standard' | 'deep';
    platforms?: Platform[];
    style?: WritingStyle;
    voice?: Partial<VoiceProfile>;
    autoPublish?: boolean;
    generateVisuals?: boolean;
}
export interface ProcessingMetrics {
    totalTime: number;
    stageMetrics: Record<string, number>;
    memoryUsage: number;
    apiCalls: number;
    cacheHits: number;
    errors: number;
}
export interface ScholarInput {
    type: 'url' | 'text' | 'file';
    content?: string;
    source: string;
    options?: {
        frameworks?: string[];
        depth?: 'basic' | 'intermediate' | 'deep';
        focus?: string[];
    };
}
export interface CreatorInput {
    insights: InsightsDocument;
    requirements: ContentRequirements;
    voice?: Partial<VoiceProfile>;
}
export interface ContentRequirements {
    platform?: Platform;
    format: WritingStyle['format'];
    length: WritingStyle['length'];
    audience: string;
    purpose: 'inform' | 'persuade' | 'entertain' | 'educate';
    tone: string;
}
export interface PublishOptions {
    platforms: Platform[];
    scheduling?: {
        publishAt?: Date;
        timezone?: string;
        autoOptimize?: boolean;
    };
    optimization?: {
        seo?: boolean;
        hashtags?: boolean;
        visuals?: boolean;
    };
}
export interface PublishResult {
    platform: Platform;
    success: boolean;
    content: PublishedContent;
    error?: Error;
    metrics?: ContentMetrics;
}
export interface DocumentValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}
export interface DocumentTransformer<T extends BaseDocument, U extends BaseDocument> {
    transform(input: T, options?: any): Promise<U>;
    validate(input: T): DocumentValidationResult;
}
export declare class DocumentValidator {
    static validateContentDocument(doc: Partial<ContentDocument>): DocumentValidationResult;
    static validateInsightsDocument(doc: Partial<InsightsDocument>): DocumentValidationResult;
}
export type { BaseDocument, DocumentMetadata, ContentDocument, InsightsDocument, DraftDocument, PublishedContent, ProcessingContext, ScholarInput, CreatorInput, PublishOptions, PublishResult };
