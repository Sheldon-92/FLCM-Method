/**
 * Document Storage Abstraction Layer for FLCM Pipeline
 * Provides file system storage for documents
 */
import { BaseDocument, DocumentType, QueryFilter, DocumentReference } from './document-schemas';
/**
 * Storage configuration
 */
export interface StorageConfig {
    basePath: string;
    structure: {
        briefs: string;
        syntheses: string;
        drafts: string;
        adaptations: string;
    };
    indexPath: string;
    autoBackup: boolean;
    maxVersions: number;
}
/**
 * Storage operation result
 */
export interface StorageResult {
    success: boolean;
    path?: string;
    error?: string;
}
/**
 * Document Storage Interface
 */
export interface IDocumentStorage {
    save(document: BaseDocument, content: string): Promise<StorageResult>;
    load(id: string): Promise<{
        document: BaseDocument;
        content: string;
    }>;
    query(filter: QueryFilter): Promise<BaseDocument[]>;
    delete(id: string): Promise<boolean>;
    exists(id: string): Promise<boolean>;
    list(type?: DocumentType): Promise<DocumentReference[]>;
}
/**
 * File System Storage Implementation
 */
export declare class FileSystemStorage implements IDocumentStorage {
    private config;
    private metadataManager;
    private validator;
    constructor(config?: Partial<StorageConfig>);
    /**
     * Initialize storage directories
     */
    private initializeDirectories;
    /**
     * Load document index
     */
    private loadIndex;
    /**
     * Save document index
     */
    private saveIndex;
    /**
     * Save document to storage
     */
    save(document: BaseDocument, content: string): Promise<StorageResult>;
    /**
     * Load document from storage
     */
    load(id: string): Promise<{
        document: BaseDocument;
        content: string;
    }>;
    /**
     * Query documents
     */
    query(filter: QueryFilter): Promise<BaseDocument[]>;
    /**
     * Delete document
     */
    delete(id: string): Promise<boolean>;
    /**
     * Check if document exists
     */
    exists(id: string): Promise<boolean>;
    /**
     * List documents
     */
    list(type?: DocumentType): Promise<DocumentReference[]>;
    /**
     * Get document path based on type and ID
     */
    private getDocumentPath;
    /**
     * Find document path by scanning directories
     */
    private findDocumentPath;
    /**
     * Backup document
     */
    private backupDocument;
    /**
     * Clean old backup files
     */
    private cleanOldBackups;
    /**
     * Reconstruct full document from parsed data
     */
    private reconstructDocument;
    /**
     * Get storage statistics
     */
    getStatistics(): Promise<Record<string, any>>;
}
//# sourceMappingURL=document-storage.d.ts.map