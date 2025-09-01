/**
 * Adaptive Content Difficulty Engine
 * Core engine for dynamically adjusting content difficulty based on user performance and context
 */
/// <reference types="node" />
import { DifficultyProfile, ContentDifficulty, DifficultyEngine as IDifficultyEngine } from './types';
import { EventEmitter } from 'events';
export declare class AdaptiveDifficultyEngine extends EventEmitter implements IDifficultyEngine {
    private logger;
    private userProfiles;
    private userStates;
    private contentDifficulties;
    private adaptationModels;
    private activeSessions;
    private performanceAnalyzer;
    private engagementAnalyzer;
    private contextAnalyzer;
    private difficultyPredictor;
    private adaptationEngine;
    private explanationEngine;
    private neuralDifficultyModel;
    private reinforcementLearner;
    private bayesianUpdater;
    constructor();
    /**
     * Assess user's current level in a domain
     */
    assessUserLevel(userId: string, domain: string, content?: any[]): Promise<DifficultyProfile>;
    /**
     * Adapt content difficulty for specific user and context
     */
    adaptContent(contentId: string, userId: string, context?: any): Promise<ContentDifficulty>;
}
