/**
 * Document Schema Definitions for FLCM Pipeline
 * Defines the structure of documents flowing between agents
 */
/**
 * Base document interface
 */
export interface BaseDocument {
    id: string;
    type: DocumentType;
    created: Date;
    modified: Date;
    version: number;
    metadata: DocumentMetadata;
}
/**
 * Document types in the pipeline
 */
export declare enum DocumentType {
    CONTENT_BRIEF = "content-brief",
    KNOWLEDGE_SYNTHESIS = "knowledge-synthesis",
    CONTENT_DRAFT = "content-draft",
    PLATFORM_ADAPTATION = "platform-adaptation"
}
/**
 * Document metadata
 */
export interface DocumentMetadata {
    agent: 'collector' | 'scholar' | 'creator' | 'adapter';
    status: DocumentStatus;
    methodologies: string[];
    processingTime?: number;
    wordCount?: number;
    confidence?: number;
    tags?: string[];
}
/**
 * Document status
 */
export declare enum DocumentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PROCESSED = "processed",
    ERROR = "error",
    ARCHIVED = "archived"
}
/**
 * Source information
 */
export interface Source {
    type: 'url' | 'file' | 'text' | 'api';
    location: string;
    title?: string;
    author?: string;
    date?: Date;
    credibility?: number;
}
/**
 * Insight extracted from content
 */
export interface Insight {
    id: string;
    text: string;
    relevance: number;
    impact: number;
    confidence: number;
    evidence: string[];
    category?: string;
}
/**
 * Contradiction found in sources
 */
export interface Contradiction {
    point: string;
    source1: string;
    source2: string;
    severity: 'minor' | 'major' | 'critical';
    resolution?: string;
}
/**
 * Content Brief Document (Collector Output)
 */
export interface ContentBrief extends BaseDocument {
    type: DocumentType.CONTENT_BRIEF;
    sources: Source[];
    insights: Insight[];
    signalScore: number;
    concepts: string[];
    contradictions: Contradiction[];
    summary: {
        mainTopic: string;
        keyPoints: string[];
        targetAudience: string;
    };
    signals: {
        relevance: number;
        impact: number;
        confidence: number;
        effort: number;
    };
}
/**
 * Analogy for explaining concepts
 */
export interface Analogy {
    concept: string;
    comparison: string;
    explanation: string;
    effectiveness: number;
}
/**
 * Question for deeper understanding
 */
export interface Question {
    text: string;
    type: 'clarification' | 'exploration' | 'challenge' | 'application';
    depth: number;
    answer?: string;
}
/**
 * Knowledge layer in progressive learning
 */
export interface KnowledgeLayer {
    level: 1 | 2 | 3 | 4 | 5;
    title: string;
    content: string;
    prerequisites: string[];
    outcomes: string[];
}
/**
 * Knowledge Synthesis Document (Scholar Output)
 */
export interface KnowledgeSynthesis extends BaseDocument {
    type: DocumentType.KNOWLEDGE_SYNTHESIS;
    briefId: string;
    concept: string;
    depthLevel: 1 | 2 | 3 | 4 | 5;
    layers: KnowledgeLayer[];
    explanations: string[];
    analogies: Analogy[];
    questions: Question[];
    connections: string[];
    contradictions: Contradiction[];
    confidence: number;
    teachingReady: boolean;
    learningPath?: string[];
}
/**
 * Voice profile for maintaining writing style
 */
export interface VoiceProfile {
    tone: string[];
    style: string[];
    vocabulary: {
        preferred: string[];
        avoided: string[];
    };
    sentenceStructure: {
        averageLength: number;
        variety: string;
    };
    personality: string[];
    examples: string[];
}
/**
 * Content structure analysis
 */
export interface ContentStructure {
    format: 'article' | 'listicle' | 'tutorial' | 'story' | 'analysis';
    sections: Section[];
    flow: 'linear' | 'modular' | 'hierarchical';
    readingTime: number;
}
/**
 * Document section
 */
export interface Section {
    id: string;
    title: string;
    content: string;
    wordCount: number;
    order: number;
    level: number;
}
/**
 * Hook for engaging readers
 */
export interface Hook {
    type: 'question' | 'statistic' | 'story' | 'quote' | 'controversy';
    content: string;
    position: 'opening' | 'section' | 'closing';
    effectiveness: number;
}
/**
 * Revision tracking
 */
export interface Revision {
    id: string;
    timestamp: Date;
    changes: string[];
    reason: string;
    agent: string;
    version: number;
}
/**
 * Content Draft Document (Creator Output)
 */
export interface ContentDraft extends BaseDocument {
    type: DocumentType.CONTENT_DRAFT;
    synthesisId: string;
    title: string;
    subtitle?: string;
    content: string;
    voiceDNA: VoiceProfile;
    structure: ContentStructure;
    hooks: Hook[];
    revisions: Revision[];
    wordCount: number;
    readingTime: number;
    seoScore?: number;
    emotionalArc?: string[];
}
/**
 * Platform optimization details
 */
export interface Optimization {
    type: 'length' | 'format' | 'style' | 'hashtag' | 'media' | 'timing';
    original: string;
    optimized: string;
    reason: string;
    impact: number;
}
/**
 * Platform-specific rules
 */
export interface PlatformRules {
    maxLength?: number;
    minLength?: number;
    hashtagLimit?: number;
    mediaRequired?: boolean;
    formatRestrictions?: string[];
    bestPractices: string[];
}
/**
 * Platform Adaptation Document (Adapter Output)
 */
export interface PlatformAdaptation extends BaseDocument {
    type: DocumentType.PLATFORM_ADAPTATION;
    draftId: string;
    platform: 'wechat' | 'xiaohongshu' | 'linkedin' | 'twitter' | 'medium' | 'substack';
    originalContent: string;
    adaptedContent: string;
    optimizations: Optimization[];
    hashtags: string[];
    mediaPrompts: string[];
    callToAction?: string;
    characterCount: number;
    estimatedReach?: number;
    engagementPrediction?: number;
    platformRules: PlatformRules;
    publishSchedule?: {
        bestTime: Date;
        timezone: string;
        reason: string;
    };
}
/**
 * Document validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
}
/**
 * Validation error
 */
export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'critical';
    code: string;
}
/**
 * Validation warning
 */
export interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
/**
 * Query filter for document search
 */
export interface QueryFilter {
    type?: DocumentType;
    agent?: string;
    status?: DocumentStatus;
    dateRange?: {
        start: Date;
        end: Date;
    };
    tags?: string[];
    metadata?: Record<string, any>;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * Document reference for linking
 */
export interface DocumentReference {
    id: string;
    type: DocumentType;
    title?: string;
    path?: string;
}
/**
 * Type guards for document types
 */
export declare function isContentBrief(doc: BaseDocument): doc is ContentBrief;
export declare function isKnowledgeSynthesis(doc: BaseDocument): doc is KnowledgeSynthesis;
export declare function isContentDraft(doc: BaseDocument): doc is ContentDraft;
export declare function isPlatformAdaptation(doc: BaseDocument): doc is PlatformAdaptation;
