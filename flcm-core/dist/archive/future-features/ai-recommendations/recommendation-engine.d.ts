/**
 * AI Recommendation Engine
 * Main engine for generating personalized learning recommendations
 */
/// <reference types="node" />
import { LearningProfile, RecommendationContext, Recommendation, RecommendationFeedback, AIModel, RecommendationEngine as IRecommendationEngine } from './types';
import { EventEmitter } from 'events';
export declare class AIRecommendationEngine extends EventEmitter implements IRecommendationEngine {
    readonly modelId: string;
    private logger;
    private models;
    private learningVectors;
    private feedbackHistory;
    private modelWeights;
    private frameworkSimilarity;
    private topicClusters;
    private userClusters;
    constructor(modelId?: string);
    /**
     * Generate personalized recommendations
     */
    generateRecommendations(context: RecommendationContext, profile: LearningProfile, limit?: number): Promise<Recommendation[]>;
    /**
     * Update model with feedback
     */
    updateModel(feedback: RecommendationFeedback[]): Promise<void>;
    /**
     * Get model metrics
     */
    getModelMetrics(): Promise<AIModel>;
    /**
     * Extract features from context and profile
     */
    private extractFeatures;
    /**
     * Collaborative filtering recommendations
     */
    private getCollaborativeRecommendations;
    /**
     * Content-based recommendations
     */
    private getContentBasedRecommendations;
    /**
     * Contextual recommendations
     */
    private getContextualRecommendations;
    /**
     * Deep learning recommendations
     */
    private getDeepLearningRecommendations;
    /**
     * Ensemble ranking of recommendations
     */
    private ensembleRanking;
    /**
     * Diversify recommendations
     */
    private diversifyRecommendations;
    /**
     * Generate session structure for recommendation
     */
    private generateSessionStructure;
    private initializeModels;
    private startPeriodicModelUpdate;
    private performModelMaintenance;
    private encodeCognitiveLoad;
    private encodeEnvironment;
    private encodeMood;
    private calculateRecentPerformance;
    private calculateFrameworkExperience;
    private calculateTopicMastery;
    private calculateConsistencyScore;
    private calculateVariance;
    private calculateGoalUrgency;
    private calculateGoalAlignment;
    private findSimilarUsers;
    private calculateOptimalDifficulty;
    private analyzeTopicPreferences;
    private findSimilarTopics;
    private findBestFrameworkForTopic;
    private generateUserEmbedding;
    private getContentEmbeddings;
    private calculateCosineSimilarity;
    private predictOptimalDifficulty;
    private calculateContextualFit;
    private generateCheckpoints;
    private selectReviewFormat;
    private updateModelWeights;
    private updateUserPreferences;
}
