/**
 * Knowledge Graph Data Model
 */

import { GraphNode, GraphEdge, ClusterInfo, GraphMetrics } from './types';
import { ConnectionAnalyzer } from './connection-analyzer';
import { GraphClusterer } from './graph-clustering';
import { Logger } from '../shared/utils/logger';

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private clusters: Map<string, ClusterInfo> = new Map();
  private connectionAnalyzer: ConnectionAnalyzer;
  private clusterer: GraphClusterer;
  private logger: Logger;
  
  // Adjacency lists for efficient graph operations
  private adjacencyList: Map<string, Set<string>> = new Map();
  private edgeIndex: Map<string, Set<string>> = new Map(); // node -> edges
  
  constructor() {
    this.connectionAnalyzer = new ConnectionAnalyzer();
    this.clusterer = new GraphClusterer();
    this.logger = new Logger('KnowledgeGraph');
  }
  
  /**
   * Add node to graph
   */
  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
    this.edgeIndex.set(node.id, new Set());
    
    this.logger.debug(`Added node: ${node.id} (${node.type})`);
  }
  
  /**
   * Add edge to graph
   */
  addEdge(edge: GraphEdge): void {
    // Validate nodes exist
    if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
      this.logger.warn(`Cannot add edge ${edge.id}: missing nodes`);
      return;
    }
    
    this.edges.set(edge.id, edge);
    
    // Update adjacency lists
    this.adjacencyList.get(edge.source)!.add(edge.target);
    this.adjacencyList.get(edge.target)!.add(edge.source);
    
    // Update edge index
    this.edgeIndex.get(edge.source)!.add(edge.id);
    this.edgeIndex.get(edge.target)!.add(edge.id);
    
    this.logger.debug(`Added edge: ${edge.source} -> ${edge.target} (${edge.weight})`);
  }
  
  /**
   * Remove node from graph
   */
  removeNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      return;
    }
    
    // Remove all connected edges
    const connectedEdges = this.edgeIndex.get(nodeId) || new Set();
    for (const edgeId of connectedEdges) {
      this.removeEdge(edgeId);
    }
    
    // Remove node
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.edgeIndex.delete(nodeId);
    
    this.logger.debug(`Removed node: ${nodeId}`);
  }
  
  /**
   * Remove edge from graph
   */
  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) {
      return;
    }
    
    // Update adjacency lists
    this.adjacencyList.get(edge.source)?.delete(edge.target);
    this.adjacencyList.get(edge.target)?.delete(edge.source);
    
    // Update edge index
    this.edgeIndex.get(edge.source)?.delete(edgeId);
    this.edgeIndex.get(edge.target)?.delete(edgeId);
    
    // Remove edge
    this.edges.delete(edgeId);
    
    this.logger.debug(`Removed edge: ${edgeId}`);
  }
  
  /**
   * Get node by ID
   */
  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }
  
  /**
   * Get edge by ID
   */
  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }
  
  /**
   * Get all nodes
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Get all edges
   */
  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }
  
  /**
   * Get neighbors of a node
   */
  getNeighbors(nodeId: string): string[] {
    const neighbors = this.adjacencyList.get(nodeId);
    return neighbors ? Array.from(neighbors) : [];
  }
  
  /**
   * Get edges connected to a node
   */
  getConnectedEdges(nodeId: string): GraphEdge[] {
    const edgeIds = this.edgeIndex.get(nodeId);
    if (!edgeIds) return [];
    
    return Array.from(edgeIds)
      .map(id => this.edges.get(id))
      .filter(edge => edge !== undefined) as GraphEdge[];
  }
  
  /**
   * Find shortest path between two nodes
   */
  findShortestPath(sourceId: string, targetId: string): string[] | null {
    if (sourceId === targetId) return [sourceId];
    
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: sourceId, path: [sourceId] }];
    
    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      
      if (nodeId === targetId) {
        return path;
      }
      
      const neighbors = this.getNeighbors(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor]
          });
        }
      }
    }
    
    return null; // No path found
  }
  
  /**
   * Calculate node degree
   */
  getNodeDegree(nodeId: string): number {
    const neighbors = this.adjacencyList.get(nodeId);
    return neighbors ? neighbors.size : 0;
  }
  
  /**
   * Calculate graph metrics
   */
  calculateMetrics(): GraphMetrics {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.size;
    
    // Graph density
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    
    // Average degree
    const totalDegree = Array.from(this.adjacencyList.values())
      .reduce((sum, neighbors) => sum + neighbors.size, 0);
    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;
    
    return {
      nodeCount,
      edgeCount,
      density,
      averageDegree,
      clusterCount: this.clusters.size
    };
  }
  
  /**
   * Build graph from documents
   */
  async buildFromDocuments(documents: any[]): Promise<void> {
    this.logger.info(`Building graph from ${documents.length} documents`);
    
    // Clear existing graph
    this.clear();
    
    // Create nodes from documents
    for (const doc of documents) {
      const node = this.createNodeFromDocument(doc);
      this.addNode(node);
    }
    
    // Analyze connections
    await this.analyzeConnections();
    
    // Detect clusters
    await this.detectClusters();
    
    this.logger.info(`Graph built: ${this.nodes.size} nodes, ${this.edges.size} edges`);
  }
  
  /**
   * Create node from document
   */
  private createNodeFromDocument(document: any): GraphNode {
    const nodeType = this.determineNodeType(document);
    
    return {
      id: document.path || document.id,
      type: nodeType,
      title: this.extractTitle(document),
      path: document.path || '',
      metadata: {
        created: new Date(document.created || Date.now()),
        modified: new Date(document.modified || Date.now()),
        framework: document.metadata?.framework,
        layer: document.metadata?.layer,
        tags: document.metadata?.tags || [],
        wordCount: this.countWords(document.content),
        importance: this.calculateImportance(document)
      }
    };
  }
  
  /**
   * Determine node type from document
   */
  private determineNodeType(document: any): GraphNode['type'] {
    const content = document.content || '';
    const metadata = document.metadata || {};
    
    // Check for framework indicators
    if (metadata.framework || content.includes('framework')) {
      return 'framework';
    }
    
    // Check for insight indicators
    if (content.includes('insight') || content.includes('reflection') || 
        metadata.tags?.includes('#insight')) {
      return 'insight';
    }
    
    // Check for concept indicators
    if (metadata.tags?.some(tag => tag.startsWith('#concept')) ||
        content.match(/definition|concept|principle/i)) {
      return 'concept';
    }
    
    // Default to content
    return 'content';
  }
  
  /**
   * Extract title from document
   */
  private extractTitle(document: any): string {
    if (document.title) return document.title;
    if (document.name) return document.name;
    
    // Extract from content
    const content = document.content || '';
    const firstLine = content.split('\n')[0];
    
    // Check for markdown heading
    const headingMatch = firstLine.match(/^#+\s*(.+)$/);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    // Use filename or first non-empty line
    return document.path?.split('/').pop()?.replace('.md', '') || 
           firstLine.trim() || 
           'Untitled';
  }
  
  /**
   * Count words in document
   */
  private countWords(content: string): number {
    if (!content) return 0;
    return content.trim().split(/\s+/).length;
  }
  
  /**
   * Calculate document importance
   */
  private calculateImportance(document: any): number {
    let importance = 1;
    
    const content = document.content || '';
    const metadata = document.metadata || {};
    
    // Word count factor
    importance += Math.log(this.countWords(content) + 1) * 0.1;
    
    // Tag count factor
    importance += (metadata.tags?.length || 0) * 0.2;
    
    // Framework factor
    if (metadata.framework) {
      importance += 0.5;
    }
    
    return Math.min(importance, 5); // Cap at 5
  }
  
  /**
   * Analyze connections between nodes
   */
  private async analyzeConnections(): Promise<void> {
    const nodes = this.getAllNodes();
    const connections: GraphEdge[] = [];
    
    // Analyze all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const weight = await this.connectionAnalyzer.calculateConnectionWeight(node1, node2);
        
        // Only create edge if weight is significant
        if (weight > 0.1) {
          const edge: GraphEdge = {
            id: `${node1.id}-${node2.id}`,
            source: node1.id,
            target: node2.id,
            weight,
            type: 'semantic',
            metadata: {
              similarity: weight
            }
          };
          
          connections.push(edge);
        }
      }
    }
    
    // Add edges to graph
    for (const edge of connections) {
      this.addEdge(edge);
    }
    
    this.logger.info(`Analyzed connections: ${connections.length} edges created`);
  }
  
  /**
   * Detect clusters in graph
   */
  private async detectClusters(): Promise<void> {
    this.clusters = await this.clusterer.detectCommunities(this);
    
    // Update nodes with cluster information
    for (const [clusterId, clusterInfo] of this.clusters.entries()) {
      for (const nodeId of clusterInfo.nodes) {
        const node = this.nodes.get(nodeId);
        if (node) {
          node.cluster = clusterId;
        }
      }
    }
    
    this.logger.info(`Detected ${this.clusters.size} clusters`);
  }
  
  /**
   * Get clusters
   */
  getClusters(): Map<string, ClusterInfo> {
    return new Map(this.clusters);
  }
  
  /**
   * Clear graph
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.clusters.clear();
    this.adjacencyList.clear();
    this.edgeIndex.clear();
  }
  
  /**
   * Export graph data
   */
  exportData(): any {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      clusters: Array.from(this.clusters.entries()).map(([id, info]) => ({
        id,
        ...info,
        nodes: Array.from(info.nodes)
      }))
    };
  }
  
  /**
   * Import graph data
   */
  importData(data: any): void {
    this.clear();
    
    // Import nodes
    for (const nodeData of data.nodes || []) {
      this.addNode(nodeData);
    }
    
    // Import edges
    for (const edgeData of data.edges || []) {
      this.addEdge(edgeData);
    }
    
    // Import clusters
    for (const clusterData of data.clusters || []) {
      this.clusters.set(clusterData.id, {
        ...clusterData,
        nodes: new Set(clusterData.nodes)
      });
    }
  }
}