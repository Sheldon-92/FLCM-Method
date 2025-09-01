/**
 * Connection Analyzer
 * Calculates relationships and connection strengths between nodes
 */

import { GraphNode, GraphEdge } from './types';
import { Logger } from '../shared/utils/logger';

export class ConnectionAnalyzer {
  private logger: Logger;
  private stopWords: Set<string>;
  
  constructor() {
    this.logger = new Logger('ConnectionAnalyzer');
    this.initializeStopWords();
  }
  
  /**
   * Initialize stop words for text analysis
   */
  private initializeStopWords(): void {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
      'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
    ]);
  }
  
  /**
   * Calculate connection weight between two nodes
   */
  async calculateConnectionWeight(node1: GraphNode, node2: GraphNode): Promise<number> {
    const weights = {
      explicit: this.calculateExplicitLinkWeight(node1, node2),
      semantic: await this.calculateSemanticSimilarity(node1, node2),
      temporal: this.calculateTemporalProximity(node1, node2),
      framework: this.calculateFrameworkAlignment(node1, node2),
      tag: this.calculateTagSimilarity(node1, node2)
    };
    
    // Weighted combination
    const totalWeight = (
      weights.explicit * 0.35 +      // Direct links are strong indicators
      weights.semantic * 0.30 +      // Content similarity
      weights.framework * 0.20 +     // Framework alignment
      weights.tag * 0.10 +           // Tag overlap
      weights.temporal * 0.05        // Temporal proximity
    );
    
    this.logger.debug(`Connection weight for ${node1.id} -> ${node2.id}:`, weights, totalWeight);
    
    return Math.min(totalWeight, 1.0); // Cap at 1.0
  }
  
  /**
   * Calculate explicit link weight (e.g., [[wikilinks]])
   */
  private calculateExplicitLinkWeight(node1: GraphNode, node2: GraphNode): number {
    // This would check for explicit links in document content
    // For now, return 0 as we don't have content access in this context
    // In a full implementation, this would:
    // 1. Load document content
    // 2. Extract [[links]] and other references
    // 3. Calculate bidirectional link strength
    return 0;
  }
  
  /**
   * Calculate semantic similarity
   */
  private async calculateSemanticSimilarity(node1: GraphNode, node2: GraphNode): Promise<number> {
    // Extract keywords from titles and metadata
    const keywords1 = this.extractKeywords(node1);
    const keywords2 = this.extractKeywords(node2);
    
    if (keywords1.length === 0 || keywords2.length === 0) {
      return 0;
    }
    
    // Calculate Jaccard similarity
    const intersection = keywords1.filter(word => keywords2.includes(word));
    const union = [...new Set([...keywords1, ...keywords2])];
    
    const jaccardSimilarity = intersection.length / union.length;
    
    // Calculate TF-IDF similarity (simplified)
    const tfidfSimilarity = this.calculateTFIDFSimilarity(keywords1, keywords2);
    
    // Combine similarities
    return (jaccardSimilarity * 0.6 + tfidfSimilarity * 0.4);
  }
  
  /**
   * Extract keywords from node
   */
  private extractKeywords(node: GraphNode): string[] {
    const text = `${node.title} ${node.metadata.tags.join(' ')}`;
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
  }
  
  /**
   * Calculate TF-IDF similarity
   */
  private calculateTFIDFSimilarity(keywords1: string[], keywords2: string[]): number {
    const allKeywords = [...new Set([...keywords1, ...keywords2])];
    
    if (allKeywords.length === 0) return 0;
    
    // Simple TF calculation (term frequency in document)
    const tf1 = this.calculateTF(keywords1, allKeywords);
    const tf2 = this.calculateTF(keywords2, allKeywords);
    
    // Calculate cosine similarity
    return this.cosineSimilarity(tf1, tf2);
  }
  
  /**
   * Calculate term frequency
   */
  private calculateTF(keywords: string[], vocabulary: string[]): number[] {
    const termCounts = new Map<string, number>();
    
    for (const word of keywords) {
      termCounts.set(word, (termCounts.get(word) || 0) + 1);
    }
    
    return vocabulary.map(word => termCounts.get(word) || 0);
  }
  
  /**
   * Calculate cosine similarity between vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  /**
   * Calculate temporal proximity
   */
  private calculateTemporalProximity(node1: GraphNode, node2: GraphNode): number {
    const timeDiff = Math.abs(
      node1.metadata.created.getTime() - node2.metadata.created.getTime()
    );
    
    // Convert to hours
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Exponential decay: documents created closer in time have higher similarity
    // Half-life of 7 days (168 hours)
    return Math.exp(-hoursDiff / 168);
  }
  
  /**
   * Calculate framework alignment
   */
  private calculateFrameworkAlignment(node1: GraphNode, node2: GraphNode): number {
    const framework1 = node1.metadata.framework;
    const framework2 = node2.metadata.framework;
    
    // No framework information
    if (!framework1 || !framework2) {
      return 0;
    }
    
    // Exact match
    if (framework1 === framework2) {
      return 1.0;
    }
    
    // Check for related frameworks
    const frameworkSimilarity = this.getFrameworkSimilarity(framework1, framework2);
    return frameworkSimilarity;
  }
  
  /**
   * Get similarity between frameworks
   */
  private getFrameworkSimilarity(framework1: string, framework2: string): number {
    // Framework relationship map
    const frameworkRelations: Record<string, Record<string, number>> = {
      'socratic': {
        'inquiry': 0.8,
        'dialogue': 0.7,
        'questioning': 0.9
      },
      'feynman': {
        'teaching': 0.6,
        'explanation': 0.7,
        'simplification': 0.8
      },
      'cornell': {
        'note-taking': 0.9,
        'summary': 0.6,
        'review': 0.7
      },
      'mind-mapping': {
        'visual': 0.8,
        'brainstorming': 0.7,
        'connection': 0.9
      },
      'spaced-repetition': {
        'memory': 0.9,
        'review': 0.8,
        'retention': 0.9
      }
    };
    
    const relations1 = frameworkRelations[framework1.toLowerCase()];
    if (relations1 && relations1[framework2.toLowerCase()]) {
      return relations1[framework2.toLowerCase()];
    }
    
    const relations2 = frameworkRelations[framework2.toLowerCase()];
    if (relations2 && relations2[framework1.toLowerCase()]) {
      return relations2[framework1.toLowerCase()];
    }
    
    return 0;
  }
  
  /**
   * Calculate tag similarity
   */
  private calculateTagSimilarity(node1: GraphNode, node2: GraphNode): number {
    const tags1 = new Set(node1.metadata.tags);
    const tags2 = new Set(node2.metadata.tags);
    
    if (tags1.size === 0 && tags2.size === 0) {
      return 0;
    }
    
    // Calculate Jaccard similarity for tags
    const intersection = new Set([...tags1].filter(tag => tags2.has(tag)));
    const union = new Set([...tags1, ...tags2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Calculate co-occurrence weight
   */
  calculateCoOccurrence(node1: GraphNode, node2: GraphNode): number {
    // This would analyze how often these nodes appear together
    // in the same context (documents, sessions, etc.)
    // For now, return a placeholder based on tag overlap
    return this.calculateTagSimilarity(node1, node2);
  }
  
  /**
   * Calculate importance-based weight
   */
  calculateImportanceWeight(node1: GraphNode, node2: GraphNode): number {
    const importance1 = node1.metadata.importance || 1;
    const importance2 = node2.metadata.importance || 1;
    
    // Geometric mean of importances
    return Math.sqrt(importance1 * importance2) / 5; // Normalize by max importance
  }
  
  /**
   * Analyze connection types
   */
  analyzeConnectionTypes(node1: GraphNode, node2: GraphNode): string[] {
    const types: string[] = [];
    
    // Framework connection
    if (node1.metadata.framework === node2.metadata.framework) {
      types.push('framework');
    }
    
    // Layer connection
    if (node1.metadata.layer === node2.metadata.layer) {
      types.push('layer');
    }
    
    // Tag connection
    if (this.calculateTagSimilarity(node1, node2) > 0) {
      types.push('topic');
    }
    
    // Temporal connection
    if (this.calculateTemporalProximity(node1, node2) > 0.5) {
      types.push('temporal');
    }
    
    return types;
  }
  
  /**
   * Get connection metadata
   */
  getConnectionMetadata(node1: GraphNode, node2: GraphNode): any {
    return {
      semanticSimilarity: this.calculateSemanticSimilarity(node1, node2),
      temporalProximity: this.calculateTemporalProximity(node1, node2),
      frameworkAlignment: this.calculateFrameworkAlignment(node1, node2),
      tagSimilarity: this.calculateTagSimilarity(node1, node2),
      connectionTypes: this.analyzeConnectionTypes(node1, node2)
    };
  }
}