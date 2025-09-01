/**
 * Document Schema for FLCM 2.0 Pipeline
 * Defines all document types and interfaces for the content processing pipeline
 */

// Base document interface
export interface BaseDocument {
  id: string;
  timestamp: Date;
  version: string;
  metadata: DocumentMetadata;
}

// Document metadata
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

// Quality metrics
export interface QualityMetrics {
  score: number;
  readability: number;
  coherence: number;
  completeness: number;
  accuracy: number;
}

// Content document (input to the system)
export interface ContentDocument extends BaseDocument {
  type: 'content';
  title: string;
  content: string;
  sections?: ContentSection[];
  source: DocumentSource;
  format: 'text' | 'markdown' | 'html' | 'json';
  wordCount: number;
  language: string;
}

// Document source information
export interface DocumentSource {
  type: 'url' | 'file' | 'text' | 'api';
  location?: string;
  filename?: string;
  encoding?: string;
  lastModified?: Date;
}

// Insights document (output from Scholar agent)
export interface InsightsDocument extends BaseDocument {
  type: 'insights';
  originalContent: string;
  analysis: AnalysisResult[];
  keyPoints: string[];
  keyFindings: string[];
  recommendations: string[];
  topics: string[];
  frameworks: FrameworkAnalysis[];
  summary: string;
  confidence: number;
}

// Analysis result
export interface AnalysisResult {
  framework: string;
  findings: string[];
  confidence: number;
  evidence: string[];
  recommendations: string[];
}

// Framework analysis
export interface FrameworkAnalysis {
  name: string;
  description: string;
  application: string;
  relevance: number;
  insights: string[];
}

// Draft document (output from Creator agent)
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

// Voice profile
export interface VoiceProfile {
  tone: string;
  style: string;
  vocabulary: string;
  personality: string[];
  expertise: string[];
  targetAudience: string;
}

// Writing style
export interface WritingStyle {
  format: 'article' | 'blog' | 'social' | 'academic' | 'casual';
  length: 'short' | 'medium' | 'long';
  structure: 'linear' | 'hierarchical' | 'narrative';
  complexity: 'simple' | 'intermediate' | 'advanced';
}

// Content structure
export interface ContentStructure {
  sections: ContentSection[];
  headings: string[];
  outline: string[];
  wordCount: number;
  readingTime: number;
}

// Content section
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'body' | 'conclusion' | 'aside';
  order: number;
}

// Published content (output from Publisher agent)
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

// Platform types
export type Platform = 'xiaohongshu' | 'zhihu' | 'wechat' | 'linkedin' | 'twitter' | 'facebook' | 'instagram';

// Visual recommendation
export interface VisualRecommendation {
  type: 'image' | 'video' | 'infographic' | 'chart' | 'diagram' | 'cover' | 'inline';
  description: string;
  style: string;
  elements: string[];
  priority?: number;
}

// Content metrics
export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement: number;
  reach: number;
  impressions: number;
}

// Document processing state
export enum ProcessingState {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

// Document pipeline stage
export interface PipelineStage {
  stage: 'input' | 'analysis' | 'creation' | 'publishing';
  agent: 'scholar' | 'creator' | 'publisher';
  status: ProcessingState;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: Error;
}

// Document processing context
export interface ProcessingContext {
  sessionId: string;
  userId?: string;
  requestId: string;
  pipeline: PipelineStage[];
  options: ProcessingOptions;
  metrics: ProcessingMetrics;
}

// Processing options
export interface ProcessingOptions {
  mode: 'quick' | 'standard' | 'deep';
  platforms?: Platform[];
  style?: WritingStyle;
  voice?: Partial<VoiceProfile>;
  autoPublish?: boolean;
  generateVisuals?: boolean;
}

// Processing metrics
export interface ProcessingMetrics {
  totalTime: number;
  stageMetrics: Record<string, number>;
  memoryUsage: number;
  apiCalls: number;
  cacheHits: number;
  errors: number;
}

// Scholar agent specific types
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

// Creator agent specific types
export interface CreatorInput {
  insights: InsightsDocument;
  requirements: ContentRequirements;
  voice?: Partial<VoiceProfile>;
}

// Content requirements
export interface ContentRequirements {
  platform?: Platform;
  format: WritingStyle['format'];
  length: WritingStyle['length'];
  audience: string;
  purpose: 'inform' | 'persuade' | 'entertain' | 'educate';
  tone: string;
}

// Publisher agent specific types
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

// Publisher result
export interface PublishResult {
  platform: Platform;
  success: boolean;
  content: PublishedContent;
  error?: Error;
  metrics?: ContentMetrics;
}

// Document validation
export interface DocumentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Document transformer interface
export interface DocumentTransformer<T extends BaseDocument, U extends BaseDocument> {
  transform(input: T, options?: any): Promise<U>;
  validate(input: T): DocumentValidationResult;
}

// Utility functions
export class DocumentValidator {
  static validateContentDocument(doc: Partial<ContentDocument>): DocumentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!doc.id) errors.push('Document ID is required');
    if (!doc.title) errors.push('Title is required');
    if (!doc.content) errors.push('Content is required');
    if (!doc.source) errors.push('Source information is required');

    if (doc.content && doc.content.length < 50) {
      warnings.push('Content is very short');
    }

    if (doc.content && doc.content.length > 10000) {
      warnings.push('Content is very long, consider breaking it down');
    }

    return { valid: errors.length === 0, errors, warnings, suggestions };
  }

  static validateInsightsDocument(doc: Partial<InsightsDocument>): DocumentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!doc.analysis || doc.analysis.length === 0) {
      errors.push('Analysis results are required');
    }

    if (!doc.keyPoints || doc.keyPoints.length === 0) {
      warnings.push('No key points identified');
    }

    return { valid: errors.length === 0, errors, warnings, suggestions };
  }
}

// Source type enumeration
export enum SourceType {
  URL = 'url',
  FILE = 'file',  
  TEXT = 'text',
  MARKDOWN = 'markdown',
  API = 'api'
}

// Helper functions
export function createInsightsDocument(
  id: string,
  originalContent: string,
  analysis: AnalysisResult[]
): InsightsDocument {
  return {
    id,
    type: 'insights',
    timestamp: new Date(),
    version: '2.0.0',
    originalContent,
    analysis,
    keyPoints: analysis.flatMap(a => a.findings),
    keyFindings: analysis.flatMap(a => a.findings),
    recommendations: analysis.flatMap(a => a.recommendations),
    topics: [],
    frameworks: [],
    summary: '',
    confidence: 0.8,
    metadata: {
      processed: true,
      processingSteps: ['analysis']
    }
  };
}

// Dialogue session interface
export interface DialogueSession {
  id: string;
  title: string;
  interactive?: boolean;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: DialogueMessage[];
  status: 'active' | 'completed' | 'cancelled';
}

// Dialogue message interface
export interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Feedback interface
export interface Feedback {
  satisfied: boolean;
  suggestions: string[];
  score?: number;
  rating?: number;
  comments?: string;
}

// Export all types
export type {
  BaseDocument,
  DocumentMetadata,
  ContentDocument,
  InsightsDocument,
  DraftDocument,
  PublishedContent,
  ProcessingContext,
  ScholarInput,
  CreatorInput,
  PublishOptions,
  PublishResult,
  DialogueSession,
  DialogueMessage,
  Feedback,
  SourceType
};