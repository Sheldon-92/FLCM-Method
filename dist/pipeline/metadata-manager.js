"use strict";
/**
 * Metadata Manager for FLCM Pipeline
 * Manages document metadata and frontmatter
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
exports.MetadataManager = void 0;
const yaml = __importStar(require("js-yaml"));
const document_schemas_1 = require("./document-schemas");
/**
 * Metadata Manager Class
 */
class MetadataManager {
    constructor() {
        this.index = new Map();
    }
    /**
     * Extract frontmatter from markdown content
     */
    extractFrontmatter(content) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        if (!match) {
            return { frontmatter: null, body: content };
        }
        try {
            const frontmatter = yaml.load(match[1]);
            const body = match[2];
            return { frontmatter, body };
        }
        catch (error) {
            console.error('Failed to parse frontmatter:', error);
            return { frontmatter: null, body: content };
        }
    }
    /**
     * Generate frontmatter from document
     */
    generateFrontmatter(document) {
        const frontmatter = {
            flcm_type: document.type,
            flcm_id: document.id,
            agent: document.metadata.agent,
            status: document.metadata.status,
            created: document.created.toISOString(),
            modified: document.modified.toISOString(),
            version: document.version
        };
        // Add type-specific fields
        this.addTypeSpecificFields(document, frontmatter);
        // Add metadata fields
        if (document.metadata.methodologies?.length > 0) {
            frontmatter.methodologies_used = document.metadata.methodologies;
        }
        if (document.metadata.tags?.length > 0) {
            frontmatter.tags = document.metadata.tags;
        }
        if (document.metadata.wordCount) {
            frontmatter.word_count = document.metadata.wordCount;
        }
        if (document.metadata.confidence !== undefined) {
            frontmatter.confidence = document.metadata.confidence;
        }
        return frontmatter;
    }
    /**
     * Add type-specific fields to frontmatter
     */
    addTypeSpecificFields(document, frontmatter) {
        switch (document.type) {
            case document_schemas_1.DocumentType.CONTENT_BRIEF:
                const brief = document;
                frontmatter.sources = brief.sources?.map((s) => s.location);
                frontmatter.signal_score = brief.signalScore;
                frontmatter.concepts = brief.concepts;
                break;
            case document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS:
                const synthesis = document;
                frontmatter.brief_id = synthesis.briefId;
                frontmatter.concept = synthesis.concept;
                frontmatter.depth_level = synthesis.depthLevel;
                frontmatter.teaching_ready = synthesis.teachingReady;
                break;
            case document_schemas_1.DocumentType.CONTENT_DRAFT:
                const draft = document;
                frontmatter.synthesis_id = synthesis.synthesisId;
                frontmatter.title = draft.title;
                frontmatter.reading_time = draft.readingTime;
                frontmatter.revisions = draft.revisions?.length || 0;
                break;
            case document_schemas_1.DocumentType.PLATFORM_ADAPTATION:
                const adaptation = document;
                frontmatter.draft_id = adaptation.draftId;
                frontmatter.platform = adaptation.platform;
                frontmatter.character_count = adaptation.characterCount;
                frontmatter.hashtags = adaptation.hashtags;
                break;
        }
    }
    /**
     * Serialize document with frontmatter
     */
    serializeDocument(document, content) {
        const frontmatter = this.generateFrontmatter(document);
        const yamlStr = yaml.dump(frontmatter, {
            sortKeys: false,
            lineWidth: -1
        });
        return `---\n${yamlStr}---\n\n${content}`;
    }
    /**
     * Parse document from markdown with frontmatter
     */
    parseDocument(markdown) {
        const { frontmatter, body } = this.extractFrontmatter(markdown);
        if (!frontmatter) {
            throw new Error('No frontmatter found in document');
        }
        const document = {
            id: frontmatter.flcm_id,
            type: frontmatter.flcm_type,
            created: new Date(frontmatter.created),
            modified: new Date(frontmatter.modified),
            version: frontmatter.version,
            metadata: {
                agent: frontmatter.agent,
                status: frontmatter.status,
                methodologies: frontmatter.methodologies_used || [],
                tags: frontmatter.tags || [],
                wordCount: frontmatter.word_count,
                confidence: frontmatter.confidence
            }
        };
        return { document, content: body };
    }
    /**
     * Merge metadata from multiple sources
     */
    mergeMetadata(base, ...updates) {
        let merged = { ...base };
        for (const update of updates) {
            // Merge top-level fields
            merged = { ...merged, ...update };
            // Merge metadata
            if (update.metadata) {
                merged.metadata = {
                    ...merged.metadata,
                    ...update.metadata
                };
                // Merge arrays
                if (update.metadata.methodologies) {
                    merged.metadata.methodologies = [
                        ...(merged.metadata?.methodologies || []),
                        ...update.metadata.methodologies
                    ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
                }
                if (update.metadata.tags) {
                    merged.metadata.tags = [
                        ...(merged.metadata?.tags || []),
                        ...update.metadata.tags
                    ].filter((v, i, a) => a.indexOf(v) === i);
                }
            }
        }
        // Update modified timestamp
        merged.modified = new Date();
        return merged;
    }
    /**
     * Add document to index
     */
    addToIndex(document, path) {
        const entry = {
            id: document.id,
            type: document.type,
            path,
            created: document.created,
            modified: document.modified,
            agent: document.metadata.agent,
            status: document.metadata.status,
            tags: document.metadata.tags || [],
            references: this.extractReferences(document)
        };
        this.index.set(document.id, entry);
    }
    /**
     * Get document from index
     */
    getFromIndex(id) {
        return this.index.get(id);
    }
    /**
     * Search index
     */
    searchIndex(criteria) {
        const results = [];
        this.index.forEach(entry => {
            let matches = true;
            if (criteria.type && entry.type !== criteria.type) {
                matches = false;
            }
            if (criteria.agent && entry.agent !== criteria.agent) {
                matches = false;
            }
            if (criteria.status && entry.status !== criteria.status) {
                matches = false;
            }
            if (criteria.tags && criteria.tags.length > 0) {
                const hasAllTags = criteria.tags.every(tag => entry.tags.includes(tag));
                if (!hasAllTags) {
                    matches = false;
                }
            }
            if (matches) {
                results.push(entry);
            }
        });
        return results;
    }
    /**
     * Extract references from document
     */
    extractReferences(document) {
        const references = [];
        // Extract based on document type
        switch (document.type) {
            case document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS:
                const synthesis = document;
                if (synthesis.briefId)
                    references.push(synthesis.briefId);
                break;
            case document_schemas_1.DocumentType.CONTENT_DRAFT:
                const draft = document;
                if (draft.synthesisId)
                    references.push(draft.synthesisId);
                break;
            case document_schemas_1.DocumentType.PLATFORM_ADAPTATION:
                const adaptation = document;
                if (adaptation.draftId)
                    references.push(adaptation.draftId);
                break;
        }
        return references;
    }
    /**
     * Generate Obsidian-compatible wiki links
     */
    generateWikiLinks(document) {
        const links = [];
        // Link to referenced documents
        const references = this.extractReferences(document);
        for (const ref of references) {
            const refDoc = this.index.get(ref);
            if (refDoc) {
                links.push(`[[${refDoc.path}|${ref}]]`);
            }
        }
        // Link to related concepts
        if (document.metadata.tags) {
            for (const tag of document.metadata.tags) {
                links.push(`[[${tag}]]`);
            }
        }
        return links;
    }
    /**
     * Export index to JSON
     */
    exportIndex() {
        const entries = Array.from(this.index.values());
        return JSON.stringify(entries, null, 2);
    }
    /**
     * Import index from JSON
     */
    importIndex(json) {
        try {
            const entries = JSON.parse(json);
            this.index.clear();
            for (const entry of entries) {
                // Convert date strings back to Date objects
                entry.created = new Date(entry.created);
                entry.modified = new Date(entry.modified);
                this.index.set(entry.id, entry);
            }
        }
        catch (error) {
            throw new Error(`Failed to import index: ${error}`);
        }
    }
    /**
     * Get index statistics
     */
    getStatistics() {
        const stats = {
            totalDocuments: this.index.size,
            byType: {},
            byAgent: {},
            byStatus: {},
            oldestDocument: null,
            newestDocument: null,
            mostUsedTags: []
        };
        const tagCounts = new Map();
        this.index.forEach(entry => {
            // Count by type
            stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
            // Count by agent
            stats.byAgent[entry.agent] = (stats.byAgent[entry.agent] || 0) + 1;
            // Count by status
            stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
            // Track oldest/newest
            if (!stats.oldestDocument || entry.created < stats.oldestDocument) {
                stats.oldestDocument = entry.created;
            }
            if (!stats.newestDocument || entry.created > stats.newestDocument) {
                stats.newestDocument = entry.created;
            }
            // Count tags
            for (const tag of entry.tags) {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
        });
        // Sort tags by count
        stats.mostUsedTags = Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return stats;
    }
}
exports.MetadataManager = MetadataManager;
//# sourceMappingURL=metadata-manager.js.map