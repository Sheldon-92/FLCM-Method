/**
 * Learning Profile Builder
 * Builds and maintains user learning profiles for personalized recommendations
 */
/// <reference types="node" />
import { LearningProfile, LearningGoal, PersonalizationSettings } from './types';
import { EventEmitter } from 'events';
interface ProfileData {
    sessions: any[];
    interactions: any[];
    assessments: any[];
    preferences: any;
    goals: LearningGoal[];
}
export declare class LearningProfileBuilder extends EventEmitter {
    private logger;
    private profiles;
    private profileSettings;
    private learningHistory;
    private learningStyleDetector;
    private cognitiveLoadAnalyzer;
    private attentionSpanCalculator;
    constructor();
    /**
     * Build or update learning profile for user
     */
    buildProfile(userId: string, data: ProfileData): Promise<LearningProfile>;
    /**
     * Get user profile
     */
    getProfile(userId: string): Promise<LearningProfile | null>;
    /**
     * Update profile settings
     */
    updateSettings(userId: string, settings: Partial<PersonalizationSettings>): Promise<void>;
    /**
     * Get profile settings
     */
    getSettings(userId: string): Promise<PersonalizationSettings>;
    /**
     * Add or update learning goal
     */
    updateGoal(userId: string, goal: Partial<LearningGoal>): Promise<void>;
    /**
     * Get learning recommendations context
     */
    getRecommendationContext(userId: string): Promise<any>;
    /**
     * Calculate optimal complexity based on performance
     */
    private calculateOptimalComplexity;
    /**
     * Analyze optimal learning times
     */
    private analyzeOptimalTimes;
    /**
     * Analyze performance patterns to identify strengths and challenges
     */
    private analyzePerformancePatterns;
    /**
     * Process and validate learning goals
     */
    private processGoals;
    /**
     * Process goal milestones
     */
    private processMilestones;
    /**
     * Update learning history with new data
     */
    private updateLearningHistory;
    /**
     * Calculate changes between profiles
     */
    private calculateProfileChanges;
    /**
     * Get default personalization settings
     */
    private getDefaultSettings;
    /**
     * Generate session embedding for ML analysis
     */
    private generateSessionEmbedding;
    /**
     * Simple string hashing function
     */
    private hashString;
    /**
     * Get time slot from hour
     */
    private getTimeSlotFromHour;
    /**
     * Analyze framework performance
     */
    private analyzeFrameworkPerformance;
    /**
     * Analyze topic performance
     */
    private analyzeTopicPerformance;
    /**
     * Analyze session length performance
     */
    private analyzeSessionLengthPerformance;
    /**
     * Estimate available time for user
     */
    private estimateAvailableTime;
    /**
     * Detect current environment
     */
    private detectCurrentEnvironment;
}
export {};
