/**
 * Knowledge Graph Data Model
 */
import { GraphNode, GraphEdge, ClusterInfo, GraphMetrics } from './types';
export declare class KnowledgeGraph {
    private nodes;
    private edges;
    private clusters;
    private connectionAnalyzer;
    private clusterer;
    private logger;
    private adjacencyList;
    private edgeIndex;
    constructor();
    /**
     * Add node to graph
     */
    addNode(node: GraphNode): void;
    /**
     * Add edge to graph
     */
    addEdge(edge: GraphEdge): void;
    /**
     * Remove node from graph
     */
    removeNode(nodeId: string): void;
    /**
     * Remove edge from graph
     */
    removeEdge(edgeId: string): void;
    /**
     * Get node by ID
     */
    getNode(nodeId: string): GraphNode | undefined;
    /**
     * Get edge by ID
     */
    getEdge(edgeId: string): GraphEdge | undefined;
    /**
     * Get all nodes
     */
    getAllNodes(): GraphNode[];
    /**
     * Get all edges
     */
    getAllEdges(): GraphEdge[];
    /**
     * Get neighbors of a node
     */
    getNeighbors(nodeId: string): string[];
    /**
     * Get edges connected to a node
     */
    getConnectedEdges(nodeId: string): GraphEdge[];
    /**
     * Find shortest path between two nodes
     */
    findShortestPath(sourceId: string, targetId: string): string[] | null;
    /**
     * Calculate node degree
     */
    getNodeDegree(nodeId: string): number;
    /**
     * Calculate graph metrics
     */
    calculateMetrics(): GraphMetrics;
    /**
     * Build graph from documents
     */
    buildFromDocuments(documents: any[]): Promise<void>;
    /**
     * Create node from document
     */
    private createNodeFromDocument;
    /**
     * Determine node type from document
     */
    private determineNodeType;
    /**
     * Extract title from document
     */
    private extractTitle;
    /**
     * Count words in document
     */
    private countWords;
    /**
     * Calculate document importance
     */
    private calculateImportance;
    /**
     * Analyze connections between nodes
     */
    private analyzeConnections;
    /**
     * Detect clusters in graph
     */
    private detectClusters;
    /**
     * Get clusters
     */
    getClusters(): Map<string, ClusterInfo>;
    /**
     * Clear graph
     */
    clear(): void;
    /**
     * Export graph data
     */
    exportData(): any;
    /**
     * Import graph data
     */
    importData(data: any): void;
}
