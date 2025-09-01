/**
 * Metadata Manager for FLCM Pipeline
 * Manages document metadata and frontmatter
 */
import { BaseDocument, DocumentType, DocumentStatus } from './document-schemas';
/**
 * Frontmatter structure
 */
export interface Frontmatter {
    flcm_type: string;
    flcm_id: string;
    agent: string;
    status: string;
    created: string;
    modified: string;
    version: number;
    [key: string]: any;
}
/**
 * Metadata index entry
 */
export interface MetadataIndex {
    id: string;
    type: DocumentType;
    path: string;
    created: Date;
    modified: Date;
    agent: string;
    status: DocumentStatus;
    tags: string[];
    references: string[];
}
/**
 * Metadata Manager Class
 */
export declare class MetadataManager {
    private index;
    constructor();
    /**
     * Extract frontmatter from markdown content
     */
    extractFrontmatter(content: string): {
        frontmatter: Frontmatter | null;
        body: string;
    };
    /**
     * Generate frontmatter from document
     */
    generateFrontmatter(document: BaseDocument): Frontmatter;
    /**
     * Add type-specific fields to frontmatter
     */
    private addTypeSpecificFields;
    /**
     * Serialize document with frontmatter
     */
    serializeDocument(document: BaseDocument, content: string): string;
    /**
     * Parse document from markdown with frontmatter
     */
    parseDocument(markdown: string): {
        document: Partial<BaseDocument>;
        content: string;
    };
    /**
     * Merge metadata from multiple sources
     */
    mergeMetadata(base: Partial<BaseDocument>, ...updates: Partial<BaseDocument>[]): BaseDocument;
    /**
     * Add document to index
     */
    addToIndex(document: BaseDocument, path: string): void;
    /**
     * Get document from index
     */
    getFromIndex(id: string): MetadataIndex | undefined;
    /**
     * Search index
     */
    searchIndex(criteria: Partial<MetadataIndex>): MetadataIndex[];
    /**
     * Extract references from document
     */
    private extractReferences;
    /**
     * Generate Obsidian-compatible wiki links
     */
    generateWikiLinks(document: BaseDocument): string[];
    /**
     * Export index to JSON
     */
    exportIndex(): string;
    /**
     * Import index from JSON
     */
    importIndex(json: string): void;
    /**
     * Get index statistics
     */
    getStatistics(): Record<string, any>;
}
