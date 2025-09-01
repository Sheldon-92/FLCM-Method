/**
 * Schema Versioning System
 * Manages document schema versions and migrations
 */
export interface SchemaVersion {
    version: string;
    releaseDate: string;
    changes: string[];
    breaking: boolean;
    migrationRequired: boolean;
}
export interface DocumentVersion {
    schemaVersion: string;
    documentVersion: string;
    lastMigration?: string;
    migrationHistory?: string[];
}
export declare class SchemaVersionManager {
    private versions;
    constructor();
    private registerVersions;
    /**
     * Detect document version from content
     */
    detectVersion(document: any): string;
    /**
     * Add version metadata to document
     */
    addVersionMetadata(document: any, version: string): any;
    /**
     * Check if migration is needed
     */
    needsMigration(fromVersion: string, toVersion: string): boolean;
    /**
     * Get migration path between versions
     */
    getMigrationPath(fromVersion: string, toVersion: string): string[];
    /**
     * Validate document against schema version
     */
    validateDocument(document: any, version: string): {
        valid: boolean;
        errors: string[];
    };
    private parseVersion;
    private getIntermediateVersions;
    /**
     * Get latest version for major version
     */
    getLatestVersion(majorVersion: number): string;
}
