/**
 * FLCM Document Schema Definitions
 * Defines the structure and types for documents at each pipeline stage
 */

import { z } from 'zod';
import { Framework, Platform, CreationMode } from '../config/config-schema';

/**
 * Document stages in the pipeline
 */
export enum DocumentStage {
  INPUT = 'input',
  INSIGHTS = 'insights',
  CONTENT = 'content',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Input source types
 */
export enum SourceType {
  TEXT = 'text',
  MARKDOWN = 'markdown',
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  WEBPAGE = 'webpage',
  CODE = 'code',
  SPREADSHEET = 'spreadsheet',
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
    insights: string; // Path to insights document
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
    content: string; // Path to content document
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

// Base metadata schema
export const BaseMetadataSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  stage: z.nativeEnum(DocumentStage),
  author: z.string(),
  hash: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Source info schema
export const SourceInfoSchema = z.object({
  type: z.nativeEnum(SourceType),
  path: z.string(),
  hash: z.string(),
  size: z.number().optional(),
  originalName: z.string().optional(),
});

// Insights metadata schema
export const InsightsMetadataSchema = BaseMetadataSchema.extend({
  stage: z.literal(DocumentStage.INSIGHTS),
  source: SourceInfoSchema,
  frameworks: z.array(z.enum(['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'])),
  processingTime: z.number().optional(),
  confidence: z.number().min(0).max(1).optional(),
  keyTopics: z.array(z.string()).optional(),
});

// Content metadata schema
export const ContentMetadataSchema = BaseMetadataSchema.extend({
  stage: z.literal(DocumentStage.CONTENT),
  source: z.object({
    insights: z.string(),
  }),
  voiceDNA: z.object({
    profile: z.string(),
    confidence: z.number().min(0).max(1),
    sampleCount: z.number().optional(),
  }),
  mode: z.enum(['quick', 'standard', 'custom']),
  wordCount: z.number().optional(),
  readingTime: z.number().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
});

// Platform metadata schema
export const PlatformMetadataSchema = BaseMetadataSchema.extend({
  stage: z.literal(DocumentStage.PUBLISHED),
  source: z.object({
    content: z.string(),
  }),
  platform: z.enum(['xiaohongshu', 'zhihu', 'wechat', 'linkedin']),
  optimizations: z.array(z.string()),
  publishedUrl: z.string().url().optional(),
  engagement: z.object({
    views: z.number().optional(),
    likes: z.number().optional(),
    shares: z.number().optional(),
    comments: z.number().optional(),
  }).optional(),
  hashtags: z.array(z.string()).optional(),
  scheduledTime: z.date().optional(),
});

/**
 * Document factory functions
 */

export function createInsightsDocument(
  source: SourceInfo,
  frameworks: Framework[],
  content: string,
  author: string = 'Scholar Agent'
): InsightsDocument {
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

export function createContentDocument(
  insightsPath: string,
  voiceProfile: string,
  mode: CreationMode,
  content: string,
  author: string = 'Creator Agent'
): ContentDocument {
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

export function createPlatformDocument(
  contentPath: string,
  platform: Platform,
  optimizations: string[],
  content: string,
  author: string = 'Publisher Agent'
): PlatformDocument {
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

/**
 * Utility functions
 */

export function generateDocumentId(): string {
  // Simple UUID v4 generation (simplified for example)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateHash(content: string): string {
  // Simple hash function (in production, use crypto)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Document validation functions
 */

export function validateInsightsDocument(doc: any): InsightsDocument {
  const metadata = InsightsMetadataSchema.parse(doc.metadata);
  return {
    ...doc,
    metadata,
  } as InsightsDocument;
}

export function validateContentDocument(doc: any): ContentDocument {
  const metadata = ContentMetadataSchema.parse(doc.metadata);
  return {
    ...doc,
    metadata,
  } as ContentDocument;
}

export function validatePlatformDocument(doc: any): PlatformDocument {
  const metadata = PlatformMetadataSchema.parse(doc.metadata);
  return {
    ...doc,
    metadata,
  } as PlatformDocument;
}

/**
 * Document stage transition validation
 */

export function canTransition(fromStage: DocumentStage, toStage: DocumentStage): boolean {
  const validTransitions: Record<DocumentStage, DocumentStage[]> = {
    [DocumentStage.INPUT]: [DocumentStage.INSIGHTS],
    [DocumentStage.INSIGHTS]: [DocumentStage.CONTENT, DocumentStage.ARCHIVED],
    [DocumentStage.CONTENT]: [DocumentStage.PUBLISHED, DocumentStage.ARCHIVED],
    [DocumentStage.PUBLISHED]: [DocumentStage.ARCHIVED],
    [DocumentStage.ARCHIVED]: [], // No transitions from archived
  };

  return validTransitions[fromStage]?.includes(toStage) || false;
}

/**
 * Export all schemas for external use
 */
export const DocumentSchemas = {
  BaseMetadata: BaseMetadataSchema,
  InsightsMetadata: InsightsMetadataSchema,
  ContentMetadata: ContentMetadataSchema,
  PlatformMetadata: PlatformMetadataSchema,
  SourceInfo: SourceInfoSchema,
};