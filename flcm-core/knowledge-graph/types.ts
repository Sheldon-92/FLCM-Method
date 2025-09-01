/**
 * Knowledge Graph Types
 */

export interface GraphNode {
  id: string;
  type: 'insight' | 'content' | 'framework' | 'concept';
  title: string;
  path: string;
  metadata: {
    created: Date;
    modified: Date;
    framework?: string;
    layer?: 'mentor' | 'creator' | 'publisher';
    tags: string[];
    wordCount: number;
    importance?: number;
  };
  position?: { x: number; y: number };
  cluster?: string;
  color?: string;
  size?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'explicit' | 'semantic' | 'temporal' | 'framework';
  metadata: {
    similarity?: number;
    coOccurrence?: number;
    temporalDistance?: number;
    explicitLinks?: string[];
  };
}

export interface ClusterInfo {
  id: string;
  label: string;
  nodes: Set<string>;
  size: number;
  density: number;
  color?: string;
  centroid?: { x: number; y: number };
  keywords?: string[];
}

export interface FilterCriteria {
  type: 'date' | 'framework' | 'topic' | 'connection_strength' | 'node_type';
  value: any;
  enabled: boolean;
}

export interface DateFilter extends FilterCriteria {
  type: 'date';
  value: {
    start: Date;
    end: Date;
  };
}

export interface FrameworkFilter extends FilterCriteria {
  type: 'framework';
  value: string[];
}

export interface TopicFilter extends FilterCriteria {
  type: 'topic';
  value: {
    tags: string[];
    keywords: string[];
  };
}

export interface ConnectionStrengthFilter extends FilterCriteria {
  type: 'connection_strength';
  value: {
    min: number;
    max: number;
  };
}

export interface NodeTypeFilter extends FilterCriteria {
  type: 'node_type';
  value: GraphNode['type'][];
}

export interface FilteredGraph {
  nodes: Set<string>;
  edges: Set<string>;
}

export interface GraphLayout {
  type: 'force' | 'circular' | 'hierarchical' | 'grid';
  parameters?: Record<string, any>;
}

export interface GraphViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: Set<string>;
  hoveredNode?: string;
  highlightedPath?: string[];
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'html' | 'json' | 'graphml';
  includeFilters?: boolean;
  includeMetadata?: boolean;
  dimensions?: { width: number; height: number };
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  clusterCount: number;
  diameter?: number;
  averagePathLength?: number;
}

export interface SearchResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: ClusterInfo[];
}

export interface GraphAnalytics {
  centralityMeasures: {
    betweenness: Map<string, number>;
    closeness: Map<string, number>;
    degree: Map<string, number>;
    pagerank: Map<string, number>;
  };
  structuralMetrics: GraphMetrics;
  temporalPatterns: {
    creationTrends: Map<string, number>;
    connectionEvolution: Array<{ date: Date; edgeCount: number }>;
  };
}

export interface GraphEvent {
  type: 'node_click' | 'node_hover' | 'edge_click' | 'background_click' | 'zoom' | 'pan';
  target?: GraphNode | GraphEdge;
  position?: { x: number; y: number };
  data?: any;
}