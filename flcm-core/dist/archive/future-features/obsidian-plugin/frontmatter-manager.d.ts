/**
 * Frontmatter Manager
 * Handles FLCM metadata in document frontmatter
 */
import { FLCMMetadata } from './types';
export declare class FrontmatterManager {
    /**
     * Extract FLCM metadata from document content
     */
    extractMetadata(content: string): FLCMMetadata | null;
    /**
     * Parse FLCM YAML data
     */
    private parseFlcmYaml;
    /**
     * Extract string value from YAML section
     */
    private extractString;
    /**
     * Extract number value from YAML section
     */
    private extractNumber;
    /**
     * Update content with FLCM metadata
     */
    updateMetadata(content: string, metadata: FLCMMetadata): string;
    /**
     * Update existing frontmatter with FLCM metadata
     */
    private updateExistingFrontmatter;
    /**
     * Create new frontmatter with FLCM metadata
     */
    private createFrontmatter;
    /**
     * Serialize FLCM metadata to YAML
     */
    private serializeFlcmMetadata;
    /**
     * Create template for new FLCM document
     */
    createTemplate(options?: {
        layer?: string;
        framework?: string;
        audience?: string;
    }): Promise<string>;
    /**
     * Update content for sync
     */
    updateForSync(content: string, syncSource: 'obsidian' | 'flcm', modifiedTime?: number): Promise<string>;
    /**
     * Validate FLCM metadata
     */
    validateMetadata(metadata: FLCMMetadata): boolean;
    /**
     * Get metadata summary
     */
    getMetadataSummary(content: string): any;
}
