/**
 * Connection Analyzer
 * Calculates relationships and connection strengths between nodes
 */
import { GraphNode } from './types';
export declare class ConnectionAnalyzer {
    private logger;
    private stopWords;
    constructor();
    /**
     * Initialize stop words for text analysis
     */
    private initializeStopWords;
    /**
     * Calculate connection weight between two nodes
     */
    calculateConnectionWeight(node1: GraphNode, node2: GraphNode): Promise<number>;
    /**
     * Calculate explicit link weight (e.g., [[wikilinks]])
     */
    private calculateExplicitLinkWeight;
    /**
     * Calculate semantic similarity
     */
    private calculateSemanticSimilarity;
    /**
     * Extract keywords from node
     */
    private extractKeywords;
    /**
     * Calculate TF-IDF similarity
     */
    private calculateTFIDFSimilarity;
    /**
     * Calculate term frequency
     */
    private calculateTF;
    /**
     * Calculate cosine similarity between vectors
     */
    private cosineSimilarity;
    /**
     * Calculate temporal proximity
     */
    private calculateTemporalProximity;
    /**
     * Calculate framework alignment
     */
    private calculateFrameworkAlignment;
    /**
     * Get similarity between frameworks
     */
    private getFrameworkSimilarity;
    /**
     * Calculate tag similarity
     */
    private calculateTagSimilarity;
    /**
     * Calculate co-occurrence weight
     */
    calculateCoOccurrence(node1: GraphNode, node2: GraphNode): number;
    /**
     * Calculate importance-based weight
     */
    calculateImportanceWeight(node1: GraphNode, node2: GraphNode): number;
    /**
     * Analyze connection types
     */
    analyzeConnectionTypes(node1: GraphNode, node2: GraphNode): string[];
    /**
     * Get connection metadata
     */
    getConnectionMetadata(node1: GraphNode, node2: GraphNode): any;
}
