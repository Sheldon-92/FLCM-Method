"use strict";
/**
 * FLCM Metadata Manager
 * Handles document metadata extraction, enrichment, and persistence
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataManager = exports.MetadataManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const document_schema_1 = require("./document-schema");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('MetadataManager');
/**
 * Metadata Manager
 * Manages document metadata throughout the pipeline
 */
class MetadataManager {
    constructor() {
        this.metadataCache = new Map();
        this.metadataIndex = new Map(); // id -> filepath
    }
    /**
     * Extract frontmatter from markdown document
     */
    extractFrontmatter(content) {
        const lines = content.split('\n');
        if (lines[0] !== '---') {
            return {
                metadata: {},
                content,
                raw: '',
            };
        }
        let endIndex = -1;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '---') {
                endIndex = i;
                break;
            }
        }
        if (endIndex === -1) {
            return {
                metadata: {},
                content,
                raw: '',
            };
        }
        const frontmatterLines = lines.slice(1, endIndex);
        const contentLines = lines.slice(endIndex + 1);
        const frontmatterRaw = frontmatterLines.join('\n');
        try {
            const metadata = yaml.load(frontmatterRaw) || {};
            return {
                metadata,
                content: contentLines.join('\n').trim(),
                raw: frontmatterRaw,
            };
        }
        catch (error) {
            logger.error('Error parsing frontmatter:', error);
            return {
                metadata: {},
                content,
                raw: frontmatterRaw,
            };
        }
    }
    /**
     * Create frontmatter from metadata
     */
    createFrontmatter(metadata) {
        const cleanMetadata = this.prepareMetadataForSerialization(metadata);
        const yamlStr = yaml.dump(cleanMetadata, {
            indent: 2,
            lineWidth: 80,
            noRefs: true,
        });
        return `---\n${yamlStr}---\n`;
    }
    /**
     * Prepare metadata for YAML serialization
     */
    prepareMetadataForSerialization(metadata) {
        const clean = { ...metadata };
        // Convert dates to ISO strings
        if (clean.timestamp instanceof Date) {
            clean.timestamp = clean.timestamp.toISOString();
        }
        if (clean.scheduledTime instanceof Date) {
            clean.scheduledTime = clean.scheduledTime.toISOString();
        }
        // Remove undefined values
        Object.keys(clean).forEach(key => {
            if (clean[key] === undefined) {
                delete clean[key];
            }
        });
        return clean;
    }
    /**
     * Read document with metadata
     */
    async readDocument(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const { metadata, content: body } = this.extractFrontmatter(content);
            // Enhance metadata with file info
            const stats = await fs.promises.stat(filePath);
            const enrichedMetadata = {
                ...metadata,
                timestamp: metadata.timestamp ? new Date(metadata.timestamp) : stats.mtime,
                hash: metadata.hash || (0, document_schema_1.generateHash)(body),
            };
            // Cache metadata
            this.cacheMetadata(filePath, enrichedMetadata);
            return {
                metadata: enrichedMetadata,
                content: body,
            };
        }
        catch (error) {
            logger.error(`Error reading document ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Write document with metadata
     */
    async writeDocument(filePath, document) {
        try {
            // Ensure metadata has required fields
            if (!document.metadata.id) {
                document.metadata.id = (0, document_schema_1.generateDocumentId)();
            }
            if (!document.metadata.timestamp) {
                document.metadata.timestamp = new Date();
            }
            if (!document.metadata.hash) {
                document.metadata.hash = (0, document_schema_1.generateHash)(document.content);
            }
            // Create full document with frontmatter
            const frontmatter = this.createFrontmatter(document.metadata);
            const fullContent = frontmatter + '\n' + document.content;
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.promises.mkdir(dir, { recursive: true });
            // Write file
            await fs.promises.writeFile(filePath, fullContent, 'utf8');
            // Update cache
            this.cacheMetadata(filePath, document.metadata);
            logger.info(`Document written: ${filePath}`);
        }
        catch (error) {
            logger.error(`Error writing document ${filePath}:`, error);
            throw error;
        }
    }
    /**
     * Enrich metadata with additional information
     */
    async enrichMetadata(metadata, content, options = {}) {
        const enriched = { ...metadata };
        // Calculate hash if requested
        if (options.calculateHash && !options.preserveExisting) {
            enriched.hash = (0, document_schema_1.generateHash)(content);
        }
        // Extract keywords if requested
        if (options.extractKeywords) {
            enriched.tags = this.extractKeywords(content);
        }
        // Analyze content if requested
        if (options.analyzeContent) {
            const analysis = this.analyzeContent(content);
            Object.assign(enriched, analysis);
        }
        return enriched;
    }
    /**
     * Extract keywords from content
     */
    extractKeywords(content) {
        // Simple keyword extraction (in production, use NLP)
        const words = content
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 4);
        const wordFreq = new Map();
        for (const word of words) {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
        // Get top 10 most frequent words
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
    /**
     * Analyze content for metadata enrichment
     */
    analyzeContent(content) {
        const lines = content.split('\n');
        const words = content.split(/\s+/).filter(w => w.length > 0);
        return {
            wordCount: words.length,
            lineCount: lines.length,
            readingTime: Math.ceil(words.length / 200),
            contentLength: content.length,
        };
    }
    /**
     * Inherit metadata from parent document
     */
    inheritMetadata(childMetadata, parentMetadata, stage) {
        const inherited = {
            ...childMetadata,
            stage,
            version: childMetadata.version || '1.0.0',
            timestamp: childMetadata.timestamp || new Date(),
            id: childMetadata.id || (0, document_schema_1.generateDocumentId)(),
        };
        // Inherit tags if not present
        if (!inherited.tags && parentMetadata.tags) {
            inherited.tags = [...parentMetadata.tags];
        }
        // Add parent reference based on stage
        switch (stage) {
            case document_schema_1.DocumentStage.INSIGHTS:
                if (parentMetadata.stage === document_schema_1.DocumentStage.INPUT) {
                    inherited.source = {
                        type: 'input',
                        path: parentMetadata.id,
                        hash: parentMetadata.hash,
                    };
                }
                break;
            case document_schema_1.DocumentStage.CONTENT:
                if (parentMetadata.stage === document_schema_1.DocumentStage.INSIGHTS) {
                    inherited.source = {
                        insights: parentMetadata.id,
                    };
                }
                break;
            case document_schema_1.DocumentStage.PUBLISHED:
                if (parentMetadata.stage === document_schema_1.DocumentStage.CONTENT) {
                    inherited.source = {
                        content: parentMetadata.id,
                    };
                }
                break;
        }
        return inherited;
    }
    /**
     * Validate metadata against stage requirements
     */
    validateMetadata(metadata, stage) {
        // Check required base fields
        if (!metadata.id || !metadata.timestamp || !metadata.version || !metadata.stage) {
            logger.error('Missing required base metadata fields');
            return false;
        }
        // Check stage match
        if (metadata.stage !== stage) {
            logger.error(`Metadata stage ${metadata.stage} doesn't match expected ${stage}`);
            return false;
        }
        // Stage-specific validation
        switch (stage) {
            case document_schema_1.DocumentStage.INSIGHTS:
                const insights = metadata;
                if (!insights.source || !insights.frameworks || insights.frameworks.length === 0) {
                    logger.error('Invalid insights metadata');
                    return false;
                }
                break;
            case document_schema_1.DocumentStage.CONTENT:
                const content = metadata;
                if (!content.source?.insights || !content.voiceDNA || !content.mode) {
                    logger.error('Invalid content metadata');
                    return false;
                }
                break;
            case document_schema_1.DocumentStage.PUBLISHED:
                const platform = metadata;
                if (!platform.source?.content || !platform.platform || !platform.optimizations) {
                    logger.error('Invalid platform metadata');
                    return false;
                }
                break;
        }
        return true;
    }
    /**
     * Cache metadata for quick access
     */
    cacheMetadata(filePath, metadata) {
        this.metadataCache.set(filePath, metadata);
        this.metadataIndex.set(metadata.id, filePath);
    }
    /**
     * Get cached metadata
     */
    getCachedMetadata(filePath) {
        return this.metadataCache.get(filePath);
    }
    /**
     * Get metadata by document ID
     */
    getMetadataById(id) {
        const filePath = this.metadataIndex.get(id);
        if (!filePath)
            return undefined;
        return this.metadataCache.get(filePath);
    }
    /**
     * Update metadata for existing document
     */
    async updateMetadata(filePath, updates) {
        const document = await this.readDocument(filePath);
        if (!document) {
            throw new Error(`Document not found: ${filePath}`);
        }
        // Apply updates
        document.metadata = {
            ...document.metadata,
            ...updates,
            timestamp: new Date(), // Update timestamp
        };
        // Recalculate hash if content changed
        if (updates.hash === undefined) {
            document.metadata.hash = (0, document_schema_1.generateHash)(document.content);
        }
        // Write back
        await this.writeDocument(filePath, document);
    }
    /**
     * Search documents by metadata criteria
     */
    async searchDocuments(directory, criteria) {
        const results = [];
        try {
            const files = await fs.promises.readdir(directory);
            for (const file of files) {
                if (!file.endsWith('.md'))
                    continue;
                const filePath = path.join(directory, file);
                const metadata = this.getCachedMetadata(filePath) ||
                    (await this.readDocument(filePath))?.metadata;
                if (!metadata)
                    continue;
                // Check if metadata matches criteria
                let matches = true;
                for (const [key, value] of Object.entries(criteria)) {
                    if (metadata[key] !== value) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    results.push(filePath);
                }
            }
        }
        catch (error) {
            logger.error(`Error searching documents in ${directory}:`, error);
        }
        return results;
    }
    /**
     * Get metadata statistics for a directory
     */
    async getMetadataStatistics(directory) {
        const stats = {
            totalDocuments: 0,
            stages: {},
            averageSize: 0,
            oldestDocument: null,
            newestDocument: null,
        };
        try {
            const files = await fs.promises.readdir(directory);
            let totalSize = 0;
            for (const file of files) {
                if (!file.endsWith('.md'))
                    continue;
                const filePath = path.join(directory, file);
                const document = await this.readDocument(filePath);
                if (!document)
                    continue;
                stats.totalDocuments++;
                totalSize += document.content.length;
                // Count by stage
                const stage = document.metadata.stage;
                stats.stages[stage] = (stats.stages[stage] || 0) + 1;
                // Track dates
                const timestamp = document.metadata.timestamp;
                if (!stats.oldestDocument || timestamp < stats.oldestDocument) {
                    stats.oldestDocument = timestamp;
                }
                if (!stats.newestDocument || timestamp > stats.newestDocument) {
                    stats.newestDocument = timestamp;
                }
            }
            if (stats.totalDocuments > 0) {
                stats.averageSize = Math.round(totalSize / stats.totalDocuments);
            }
        }
        catch (error) {
            logger.error(`Error getting metadata statistics for ${directory}:`, error);
        }
        return stats;
    }
    /**
     * Clear metadata cache
     */
    clearCache() {
        this.metadataCache.clear();
        this.metadataIndex.clear();
        logger.debug('Metadata cache cleared');
    }
    /**
     * Export metadata index
     */
    exportIndex() {
        const index = [];
        for (const [id, filePath] of this.metadataIndex) {
            const metadata = this.metadataCache.get(filePath);
            if (metadata) {
                index.push({ id, path: filePath, metadata });
            }
        }
        return index;
    }
}
exports.MetadataManager = MetadataManager;
// Export singleton instance
exports.metadataManager = new MetadataManager();
//# sourceMappingURL=metadata-manager.js.map