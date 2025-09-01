/**
 * Conflict Resolver
 * Handles merge conflicts between Obsidian and FLCM documents
 */
import { FLCMSettings, Resolution, ConflictMarker } from './types';
export declare class ConflictResolver {
    private settings;
    constructor(settings: FLCMSettings);
    /**
     * Resolve conflict between base, local, and remote content
     */
    resolve(base: string, local: string, remote: string): Promise<Resolution>;
    /**
     * Three-way merge algorithm
     */
    private threeWayMerge;
    /**
     * Apply automatic resolution rules
     */
    private applyResolutionRules;
    /**
     * Resolve conflicts with preference
     */
    private resolveWithPreference;
    /**
     * Generate suggestions for manual resolution
     */
    private generateSuggestions;
    /**
     * Check for metadata conflicts
     */
    private hasMetadataConflicts;
    /**
     * Extract Obsidian links from content
     */
    private extractLinks;
    /**
     * Extract basic metadata from content
     */
    private extractMetadata;
    /**
     * Create conflict markers for content sections
     */
    createConflictMarkers(localContent: string, remoteContent: string, conflictType: string): string;
    /**
     * Validate resolved content
     */
    validateResolution(content: string): boolean;
    /**
     * Get conflict statistics
     */
    getConflictStats(conflicts: ConflictMarker[]): any;
}
