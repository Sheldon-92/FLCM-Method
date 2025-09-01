/**
 * Framework Selector
 * Intelligent framework recommendation engine
 */
import { BaseFramework, FrameworkContext } from './base';
import { FrameworkRecommendation } from './framework-library';
export interface SelectionCriteria {
    intent?: string;
    timeAvailable?: number;
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredCategory?: string;
    excludeFrameworks?: string[];
    requireTags?: string[];
}
export interface SelectionResult {
    recommended: FrameworkRecommendation[];
    alternates: FrameworkRecommendation[];
    rationale: string;
    context: FrameworkContext;
}
export declare class FrameworkSelector {
    private library;
    private selectionHistory;
    constructor();
    /**
     * Select the best framework for user's needs
     */
    select(context: FrameworkContext, criteria?: SelectionCriteria): Promise<SelectionResult>;
    /**
     * Interactive selection with user input
     */
    interactiveSelect(initialContext?: FrameworkContext): Promise<SelectionResult>;
    /**
     * Multi-framework recommendation for complex tasks
     */
    selectMultiple(context: FrameworkContext, count?: number): Promise<FrameworkRecommendation[]>;
    /**
     * Get framework by legacy command
     */
    getByLegacyCommand(command: string): BaseFramework | undefined;
    /**
     * Get framework by ID
     */
    getById(id: string): BaseFramework | undefined;
    /**
     * Apply selection criteria to filter/reorder recommendations
     */
    private applyCriteria;
    /**
     * Apply history-based scoring boost
     */
    private applyHistoryBoost;
    /**
     * Generate rationale for recommendation
     */
    private generateRationale;
    /**
     * Track framework selection for learning
     */
    private trackSelection;
    /**
     * Get user key for history tracking
     */
    private getUserKey;
    /**
     * Get context questions for interactive selection
     */
    private getContextQuestions;
    /**
     * Get framework compatibility matrix
     */
    getCompatibilityMatrix(): any;
    /**
     * Calculate compatibility between two frameworks
     */
    private calculateCompatibility;
    /**
     * Get framework journey recommendations
     */
    getFrameworkJourney(startingPoint: string, goal: string): BaseFramework[];
}
