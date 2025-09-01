/**
 * Learning Path Optimizer
 * Advanced AI-powered optimizer for cross-framework learning paths
 */
/// <reference types="node" />
import { LearningObjective, LearningPath, OptimizationContext, OptimizationResult, PathProgress, PathOptimizer as IPathOptimizer } from './types';
import { EventEmitter } from 'events';
export declare class LearningPathOptimizer extends EventEmitter implements IPathOptimizer {
    private logger;
    private algorithms;
    private frameworkTransitions;
    private historicalPaths;
    private pathAnalytics;
    private sequenceOptimizer;
    private frameworkSelector;
    private difficultyAdjuster;
    private personalizationEngine;
    constructor();
    /**
     * Optimize learning path for given objectives and context
     */
    optimizePath(objectives: LearningObjective[], context: OptimizationContext): Promise<OptimizationResult>;
    /**
     * Adapt existing path based on progress and context
     */
    adaptPath(path: LearningPath, progress: PathProgress, context: OptimizationContext): Promise<LearningPath>;
    /**
     * Evaluate path effectiveness based on outcomes
     */
    evaluatePathEffectiveness(path: LearningPath, outcomes: PathProgress[]): Promise<number>;
    /**
     * Initialize optimization algorithms
     */
    private initializeAlgorithms;
    /**
     * Initialize framework transition mappings
     */
    private initializeFrameworkTransitions;
    /**
     * Validate that prerequisites are satisfied
     */
    private validatePrerequisites;
    /**
     * Generate multiple candidate paths using different algorithms
     */
    private generateCandidatePaths;
    /**
     * Evaluate and rank candidate paths
     */
    private evaluateCandidatePaths;
    /**
     * Genetic Algorithm Optimization
     */
    private geneticAlgorithmOptimization;
    /**
     * Constraint Satisfaction Optimization
     */
    private constraintSatisfactionOptimization;
    /**
     * Collaborative Filtering Optimization
     */
    private collaborativeFilteringOptimization;
    /**
     * Greedy Best-First Optimization
     */
    private greedyOptimization;
    /**
     * Score a path based on multiple criteria
     */
    private scorePath;
    /**
     * Detailed path evaluation
     */
    private detailedPathEvaluation;
    /**
     * Apply personalizations to path
     */
    private applyPersonalizations;
    /**
     * Generate checkpoints for path
     */
    private generateCheckpoints;
    /**
     * Generate alternatives for path
     */
    private generateAlternatives;
    private calculateTimeEfficiency;
    private calculateAdaptationRate;
    private scorePrerequisiteOrder;
    private scoreFrameworkTransitions;
    private scoreDifficultyProgression;
    private scoreTimeDistribution;
    private scorePersonalization;
    private scoreAdaptability;
    private evaluateContextFit;
    private evaluateLearningStyleAlignment;
    private evaluateCognitiveLoadBalance;
    private evaluateFrameworkDiversity;
    private getFrameworkForObjective;
    private generateCheckpointActivities;
    private generateAdaptiveRules;
    private createAcceleratedPath;
    private createOriginalPath;
    private calculateImprovements;
    private calculateTradeoffs;
    private calculateExpectedOutcomes;
    private generateOptimizationReasoning;
    private initializePopulation;
    private tournamentSelection;
    private crossover;
    private mutate;
    private buildVariables;
    private buildDomains;
    private buildConstraints;
    private backtrackSearch;
    private buildPathFromSolution;
    private findSimilarUsers;
    private getSuccessfulPaths;
    private extractPathPatterns;
    private buildCollaborativePath;
    private calculateObjectiveScore;
    private buildPathFromObjectives;
    private analyzeProgress;
    private identifyNeededAdaptations;
    private applyAdaptations;
    private calculateAdaptationConfidence;
    private applyPersonalization;
}
