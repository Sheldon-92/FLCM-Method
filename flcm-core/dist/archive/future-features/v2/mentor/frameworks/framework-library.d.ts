/**
 * Framework Library
 * Central registry and selector for all frameworks
 */
import { BaseFramework, FrameworkContext } from './base';
export interface FrameworkRecommendation {
    framework: BaseFramework;
    score: number;
    reason: string;
}
export declare class FrameworkLibrary {
    private frameworks;
    private legacyMappings;
    constructor();
    /**
     * Initialize all available frameworks
     */
    private initializeFrameworks;
    /**
     * Setup legacy command mappings for backward compatibility
     */
    private setupLegacyMappings;
    /**
     * Register a framework in the library
     */
    private registerFramework;
    /**
     * Get a specific framework by ID
     */
    getFramework(id: string): BaseFramework | undefined;
    /**
     * Get all available frameworks
     */
    getAllFrameworks(): BaseFramework[];
    /**
     * Get frameworks by category
     */
    getFrameworksByCategory(category: string): BaseFramework[];
    /**
     * Get frameworks by tag
     */
    getFrameworksByTag(tag: string): BaseFramework[];
    /**
     * Select best framework based on context
     */
    selectFramework(context: FrameworkContext): FrameworkRecommendation[];
    /**
     * Handle legacy command
     */
    handleLegacyCommand(command: string): BaseFramework | undefined;
    /**
     * Analyze user intent from context
     */
    private analyzeIntent;
    /**
     * Score a framework for given context
     */
    private scoreFramework;
    /**
     * Get intent-specific score
     */
    private getIntentScore;
    /**
     * Generate reason for recommendation
     */
    private generateReason;
    /**
     * Extract keywords from context
     */
    private extractKeywords;
    /**
     * Assess audience level
     */
    private assessAudienceLevel;
    /**
     * Get framework statistics
     */
    getStatistics(): any;
}
