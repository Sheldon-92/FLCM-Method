"use strict";
/**
 * Knowledge Graph Data Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraph = void 0;
const connection_analyzer_1 = require("./connection-analyzer");
const graph_clustering_1 = require("./graph-clustering");
const logger_1 = require("../shared/utils/logger");
class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.clusters = new Map();
        // Adjacency lists for efficient graph operations
        this.adjacencyList = new Map();
        this.edgeIndex = new Map(); // node -> edges
        this.connectionAnalyzer = new connection_analyzer_1.ConnectionAnalyzer();
        this.clusterer = new graph_clustering_1.GraphClusterer();
        this.logger = new logger_1.Logger('KnowledgeGraph');
    }
    /**
     * Add node to graph
     */
    addNode(node) {
        this.nodes.set(node.id, node);
        this.adjacencyList.set(node.id, new Set());
        this.edgeIndex.set(node.id, new Set());
        this.logger.debug(`Added node: ${node.id} (${node.type})`);
    }
    /**
     * Add edge to graph
     */
    addEdge(edge) {
        // Validate nodes exist
        if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
            this.logger.warn(`Cannot add edge ${edge.id}: missing nodes`);
            return;
        }
        this.edges.set(edge.id, edge);
        // Update adjacency lists
        this.adjacencyList.get(edge.source).add(edge.target);
        this.adjacencyList.get(edge.target).add(edge.source);
        // Update edge index
        this.edgeIndex.get(edge.source).add(edge.id);
        this.edgeIndex.get(edge.target).add(edge.id);
        this.logger.debug(`Added edge: ${edge.source} -> ${edge.target} (${edge.weight})`);
    }
    /**
     * Remove node from graph
     */
    removeNode(nodeId) {
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
    removeEdge(edgeId) {
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
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }
    /**
     * Get edge by ID
     */
    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }
    /**
     * Get all nodes
     */
    getAllNodes() {
        return Array.from(this.nodes.values());
    }
    /**
     * Get all edges
     */
    getAllEdges() {
        return Array.from(this.edges.values());
    }
    /**
     * Get neighbors of a node
     */
    getNeighbors(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId);
        return neighbors ? Array.from(neighbors) : [];
    }
    /**
     * Get edges connected to a node
     */
    getConnectedEdges(nodeId) {
        const edgeIds = this.edgeIndex.get(nodeId);
        if (!edgeIds)
            return [];
        return Array.from(edgeIds)
            .map(id => this.edges.get(id))
            .filter(edge => edge !== undefined);
    }
    /**
     * Find shortest path between two nodes
     */
    findShortestPath(sourceId, targetId) {
        if (sourceId === targetId)
            return [sourceId];
        const visited = new Set();
        const queue = [{ nodeId: sourceId, path: [sourceId] }];
        while (queue.length > 0) {
            const { nodeId, path } = queue.shift();
            if (visited.has(nodeId))
                continue;
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
    getNodeDegree(nodeId) {
        const neighbors = this.adjacencyList.get(nodeId);
        return neighbors ? neighbors.size : 0;
    }
    /**
     * Calculate graph metrics
     */
    calculateMetrics() {
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
    async buildFromDocuments(documents) {
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
    createNodeFromDocument(document) {
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
    determineNodeType(document) {
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
    extractTitle(document) {
        if (document.title)
            return document.title;
        if (document.name)
            return document.name;
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
    countWords(content) {
        if (!content)
            return 0;
        return content.trim().split(/\s+/).length;
    }
    /**
     * Calculate document importance
     */
    calculateImportance(document) {
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
    async analyzeConnections() {
        const nodes = this.getAllNodes();
        const connections = [];
        // Analyze all node pairs
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const node1 = nodes[i];
                const node2 = nodes[j];
                const weight = await this.connectionAnalyzer.calculateConnectionWeight(node1, node2);
                // Only create edge if weight is significant
                if (weight > 0.1) {
                    const edge = {
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
    async detectClusters() {
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
    getClusters() {
        return new Map(this.clusters);
    }
    /**
     * Clear graph
     */
    clear() {
        this.nodes.clear();
        this.edges.clear();
        this.clusters.clear();
        this.adjacencyList.clear();
        this.edgeIndex.clear();
    }
    /**
     * Export graph data
     */
    exportData() {
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
    importData(data) {
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
exports.KnowledgeGraph = KnowledgeGraph;
//# sourceMappingURL=graph-model.js.map