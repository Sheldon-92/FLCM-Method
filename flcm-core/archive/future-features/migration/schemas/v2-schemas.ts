/**
 * FLCM 2.0 Document Schemas
 * Layer-based document format definitions
 */

export interface V2InsightsDocument {
  version: '2.0';
  type: 'insights';
  timestamp: string;
  core_insights: Array<{
    id: string;
    insight: string;
    confidence: number;
    depth: number;
    tags: string[];
  }>;
  evidence: Array<{
    insight_id: string;
    source: string;
    quote: string;
    relevance: number;
  }>;
  connections: Array<{
    from_id: string;
    to_id: string;
    relationship: string;
    strength: number;
  }>;
  metadata: {
    framework_used: string;
    depth_level: number;
    total_insights: number;
    processing_time: number;
    session_id: string;
  };
  frontmatter: {
    title: string;
    created: string;
    modified: string;
    tags: string[];
    framework: string;
  };
}

export interface V2KnowledgeDocument {
  version: '2.0';
  type: 'knowledge';
  timestamp: string;
  concepts: Array<{
    id: string;
    name: string;
    definition: string;
    importance: number;
    complexity: number;
    prerequisites: string[];
  }>;
  relationships: Array<{
    concept_a: string;
    concept_b: string;
    type: 'depends_on' | 'relates_to' | 'contrasts_with' | 'exemplifies';
    description: string;
  }>;
  graph_data: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      weight: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      weight: number;
      type: string;
    }>;
  };
  learning_progression: {
    current_understanding: number; // 0-100
    growth_rate: number;
    next_concepts: string[];
    mastered_concepts: string[];
  };
  metadata: {
    total_concepts: number;
    complexity_score: number;
    framework_used: string;
    session_id: string;
  };
  frontmatter: {
    title: string;
    created: string;
    modified: string;
    tags: string[];
    type: 'knowledge-base';
  };
}

export interface V2ContentDocument {
  version: '2.0';
  type: 'content';
  timestamp: string;
  title: string;
  body: string;
  structure: {
    sections: Array<{
      id: string;
      heading: string;
      content: string;
      order: number;
    }>;
    outline: string[];
  };
  metadata: {
    voice: {
      tone: string[];
      style: string[];
      personality: string[];
    };
    audience: string;
    core_message: string;
    call_to_action: string;
    word_count: number;
    reading_time: number;
    originality_score: number;
  };
  enhancements: {
    quotes: Array<{
      text: string;
      attribution?: string;
      relevance: string;
    }>;
    examples: Array<{
      description: string;
      application: string;
    }>;
    visuals_suggested: string[];
  };
  frontmatter: {
    title: string;
    created: string;
    modified: string;
    tags: string[];
    audience: string;
    format: string;
  };
}

export interface V2PublisherDocument {
  version: '2.0';
  type: 'publisher';
  timestamp: string;
  source_content_id: string;
  targets: Array<{
    platform: 'linkedin' | 'twitter' | 'medium' | 'substack' | 'obsidian';
    adapted_content: string;
    format_specifics: any; // Platform-specific data
    optimization_notes: string[];
    estimated_reach: number;
  }>;
  publishing_schedule: {
    immediate: string[];
    scheduled: Array<{
      platform: string;
      datetime: string;
    }>;
  };
  cross_platform_strategy: {
    main_platform: string;
    supporting_platforms: string[];
    content_variations: Record<string, string>;
  };
  metadata: {
    total_platforms: number;
    adaptation_time: number;
    session_id: string;
  };
  frontmatter: {
    title: string;
    created: string;
    modified: string;
    tags: string[];
    platforms: string[];
  };
}

export interface V2LayerDocument {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  layer: 'mentor' | 'creator' | 'publisher';
  data: V2InsightsDocument | V2KnowledgeDocument | V2ContentDocument | V2PublisherDocument;
  framework_context?: {
    framework_id: string;
    framework_name: string;
    parameters: Record<string, any>;
  };
  user_metadata?: {
    user_id?: string;
    vault_path?: string;
    tags?: string[];
    notes?: string;
  };
}

export type V2DocumentType = 
  | V2InsightsDocument 
  | V2KnowledgeDocument 
  | V2ContentDocument 
  | V2PublisherDocument;