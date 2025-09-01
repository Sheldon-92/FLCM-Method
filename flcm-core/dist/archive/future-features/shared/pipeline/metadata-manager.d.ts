/**
 * FLCM Metadata Manager
 * Handles document metadata extraction, enrichment, and persistence
 */
import { BaseMetadata, DocumentStage, Document } from './document-schema';
/**
 * Frontmatter extraction result
 */
interface FrontmatterResult {
    metadata: any;
    content: string;
    raw: string;
}
/**
 * Metadata enrichment options
 */
export interface EnrichmentOptions {
    calculateHash?: boolean;
    extractKeywords?: boolean;
    analyzeContent?: boolean;
    preserveExisting?: boolean;
}
/**
 * Metadata Manager
 * Manages document metadata throughout the pipeline
 */
export declare class MetadataManager {
    private metadataCache;
    private metadataIndex;
    /**
     * Extract frontmatter from markdown document
     */
    extractFrontmatter(content: string): FrontmatterResult;
    /**
     * Create frontmatter from metadata
     */
    createFrontmatter(metadata: BaseMetadata): string;
    /**
     * Prepare metadata for YAML serialization
     */
    private prepareMetadataForSerialization;
    /**
     * Read document with metadata
     */
    readDocument<T extends BaseMetadata = BaseMetadata>(filePath: string): Promise<Document<T> | null>;
    /**
     * Write document with metadata
     */
    writeDocument<T extends BaseMetadata = BaseMetadata>(filePath: string, document: Document<T>): Promise<void>;
    /**
     * Enrich metadata with additional information
     */
    enrichMetadata<T extends BaseMetadata>(metadata: T, content: string, options?: EnrichmentOptions): Promise<T>;
    /**
     * Extract keywords from content
     */
    private extractKeywords;
    /**
     * Analyze content for metadata enrichment
     */
    private analyzeContent;
    /**
     * Inherit metadata from parent document
     */
    inheritMetadata<T extends BaseMetadata, P extends BaseMetadata>(childMetadata: Partial<T>, parentMetadata: P, stage: DocumentStage): T;
    /**
     * Validate metadata against stage requirements
     */
    validateMetadata(metadata: BaseMetadata, stage: DocumentStage): boolean;
    /**
     * Cache metadata for quick access
     */
    private cacheMetadata;
    /**
     * Get cached metadata
     */
    getCachedMetadata(filePath: string): BaseMetadata | undefined;
    /**
     * Get metadata by document ID
     */
    getMetadataById(id: string): BaseMetadata | undefined;
    /**
     * Update metadata for existing document
     */
    updateMetadata<T extends BaseMetadata>(filePath: string, updates: Partial<T>): Promise<void>;
    /**
     * Search documents by metadata criteria
     */
    searchDocuments(directory: string, criteria: Partial<BaseMetadata>): Promise<string[]>;
    /**
     * Get metadata statistics for a directory
     */
    getMetadataStatistics(directory: string): Promise<{
        totalDocuments: number;
        stages: Record<DocumentStage, number>;
        averageSize: number;
        oldestDocument: Date | null;
        newestDocument: Date | null;
    }>;
    /**
     * Clear metadata cache
     */
    clearCache(): void;
    /**
     * Export metadata index
     */
    exportIndex(): Array<{
        id: string;
        path: string;
        metadata: BaseMetadata;
    }>;
}
export declare const metadataManager: MetadataManager;
export {};
