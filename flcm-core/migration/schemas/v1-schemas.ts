/**
 * FLCM 1.0 Document Schemas
 * Agent output format definitions
 */

export interface V1CollectorOutput {
  version: '1.0';
  agent: 'collector';
  timestamp: string;
  source: {
    type: string; // url, file, text
    location?: string;
    content: string;
  };
  insights: Array<{
    id: string;
    text: string;
    relevance: number;
    evidence: string;
  }>;
  rice_scores: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    total: number;
  };
  metadata: {
    processing_time: number;
    word_count: number;
    extraction_method: string;
  };
}

export interface V1ScholarOutput {
  version: '1.0';
  agent: 'scholar';
  timestamp: string;
  level: number; // 1-5 depth level
  understanding: {
    summary: string;
    key_concepts: string[];
    complexity_score: number;
  };
  analogies: Array<{
    source_domain: string;
    target_domain: string;
    mapping: string;
    strength: number;
  }>;
  questions: Array<{
    question: string;
    type: 'clarification' | 'exploration' | 'challenge';
    depth: number;
  }>;
  learning_path: {
    current_stage: string;
    next_steps: string[];
    prerequisites: string[];
  };
  metadata: {
    processing_time: number;
    iterations: number;
  };
}

export interface V1CreatorOutput {
  version: '1.0';
  agent: 'creator';
  timestamp: string;
  content: {
    title: string;
    body: string;
    format: 'article' | 'post' | 'thread' | 'essay';
    word_count: number;
  };
  voice_dna: {
    tone: string[];
    style: string[];
    vocabulary_level: string;
    sentence_complexity: number;
    personality_markers: string[];
  };
  iterations: Array<{
    version: number;
    changes: string[];
    improvement_score: number;
  }>;
  spark_elements: {
    hook: string;
    core_message: string;
    call_to_action: string;
  };
  metadata: {
    processing_time: number;
    revision_count: number;
    originality_score: number;
  };
}

export interface V1AdapterOutput {
  version: '1.0';
  agent: 'adapter';
  timestamp: string;
  platforms: {
    linkedin?: {
      format: string;
      content: string;
      hashtags: string[];
      mentions: string[];
    };
    twitter?: {
      thread: string[];
      hashtags: string[];
      estimated_engagement: number;
    };
    medium?: {
      title: string;
      subtitle: string;
      content: string;
      tags: string[];
      reading_time: number;
    };
    substack?: {
      subject: string;
      preview: string;
      content: string;
      cta: string;
    };
  };
  adaptations: {
    changes_made: string[];
    platform_optimizations: Record<string, string[]>;
  };
  metadata: {
    processing_time: number;
    platforms_count: number;
  };
}

export interface V1Document {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  pipeline_stage: 'collector' | 'scholar' | 'creator' | 'adapter';
  data: V1CollectorOutput | V1ScholarOutput | V1CreatorOutput | V1AdapterOutput;
  user_metadata?: {
    user_id?: string;
    tags?: string[];
    notes?: string;
  };
}

export type V1AgentOutput = 
  | V1CollectorOutput 
  | V1ScholarOutput 
  | V1CreatorOutput 
  | V1AdapterOutput;