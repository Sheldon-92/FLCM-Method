/**
 * FLCM Client
 * Interface for communicating with FLCM system
 */
import { FLCMSettings, FLCMDocument } from './types';
export declare class FLCMClient {
    private flcmPath;
    private settings;
    private documentsPath;
    constructor(flcmPath: string, settings: FLCMSettings);
    /**
     * Test connection to FLCM
     */
    testConnection(): Promise<boolean>;
    /**
     * Check if document exists in FLCM
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Read document from FLCM
     */
    read(filePath: string): Promise<FLCMDocument>;
    /**
     * Write document to FLCM
     */
    write(filePath: string, content: string, modifiedTime?: number): Promise<void>;
    /**
     * Delete document from FLCM
     */
    delete(filePath: string): Promise<void>;
    /**
     * Rename document in FLCM
     */
    rename(oldPath: string, newPath: string): Promise<void>;
    /**
     * List all documents in FLCM
     */
    listDocuments(): Promise<string[]>;
    /**
     * Get document metadata without reading full content
     */
    getMetadata(filePath: string): Promise<any>;
    /**
     * Search documents by content or metadata
     */
    search(query: {
        text?: string;
        tags?: string[];
        framework?: string;
        layer?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<string[]>;
    /**
     * Get FLCM file system path
     */
    private getFlcmPath;
    /**
     * Walk directory recursively
     */
    private walkDirectory;
    /**
     * Extract metadata from document content
     */
    private extractMetadata;
    /**
     * Calculate content checksum
     */
    private calculateChecksum;
    /**
     * Get client status
     */
    getStatus(): any;
}
