/**
 * AI Recommendations Types
 * Type definitions for AI-powered learning recommendations system
 */
export interface LearningProfile {
    userId: string;
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    cognitiveLoad: 'low' | 'medium' | 'high';
    preferredComplexity: number;
    attentionSpan: number;
    optimalLearningTime: string[];
    strengths: string[];
    challenges: string[];
    goals: LearningGoal[];
    created: Date;
    lastUpdated: Date;
}
export interface LearningGoal {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    progress: number;
    milestones: Milestone[];
    frameworks: string[];
    estimatedHours: number;
    actualHours?: number;
    status: 'active' | 'paused' | 'completed' | 'archived';
    created: Date;
}
export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    completed: boolean;
    completedDate?: Date;
    requiredSkills: string[];
    dependencies: string[];
}
export interface RecommendationContext {
    userId: string;
    currentSession?: {
        framework: string;
        duration: number;
        completionRate: number;
        difficultyLevel: number;
        mood: 'frustrated' | 'neutral' | 'engaged' | 'excited';
    };
    recentHistory: {
        frameworks: string[];
        topics: string[];
        performance: number[];
        timeSpent: number[];
    };
    currentGoals: string[];
    availableTime: number;
    environment: 'focused' | 'distracted' | 'mobile' | 'collaborative';
}
export interface Recommendation {
    id: string;
    type: 'framework' | 'topic' | 'session_length' | 'difficulty' | 'break' | 'review';
    title: string;
    description: string;
    reasoning: string;
    confidence: number;
    priority: number;
    estimatedTime: number;
    requiredResources: string[];
    framework?: string;
    topic?: string;
    difficulty?: number;
    sessionStructure?: SessionStructure;
    metadata: {
        algorithmUsed: string;
        basedOn: string[];
        expectedOutcome: string;
        fallbackOptions: string[];
    };
    created: Date;
    expiresAt?: Date;
}
export interface SessionStructure {
    warmup?: {
        duration: number;
        activities: string[];
    };
    mainContent: {
        duration: number;
        framework: string;
        topic: string;
        difficulty: number;
        checkpoints: string[];
    };
    breaks?: {
        frequency: number;
        duration: number;
        type: 'active' | 'passive';
    };
    review: {
        duration: number;
        format: 'summary' | 'quiz' | 'reflection' | 'discussion';
    };
    followUp?: {
        nextSession: Date;
        preparationTasks: string[];
    };
}
export interface AIModel {
    name: string;
    version: string;
    type: 'collaborative_filtering' | 'content_based' | 'hybrid' | 'deep_learning';
    accuracy: number;
    precision: number;
    recall: number;
    trainingDate: Date;
    features: string[];
    hyperparameters: Record<string, any>;
}
export interface RecommendationFeedback {
    recommendationId: string;
    userId: string;
    rating: number;
    followedThrough: boolean;
    outcome: 'better_than_expected' | 'as_expected' | 'worse_than_expected';
    actualTime?: number;
    actualDifficulty?: number;
    comments?: string;
    improvements: string[];
    timestamp: Date;
}
export interface LearningVector {
    userId: string;
    framework: string;
    topic: string;
    embedding: number[];
    context: {
        timeOfDay: string;
        dayOfWeek: string;
        sessionLength: number;
        previousTopics: string[];
    };
    performance: {
        completionRate: number;
        qualityScore: number;
        retentionScore: number;
        engagementScore: number;
    };
    timestamp: Date;
}
export interface RecommendationEngine {
    modelId: string;
    generateRecommendations(context: RecommendationContext, profile: LearningProfile, limit?: number): Promise<Recommendation[]>;
    updateModel(feedback: RecommendationFeedback[]): Promise<void>;
    getModelMetrics(): Promise<AIModel>;
}
export interface PersonalizationSettings {
    userId: string;
    adaptiveRecommendations: boolean;
    difficultyAdjustment: 'automatic' | 'manual' | 'hybrid';
    sessionLengthPreference: 'short' | 'medium' | 'long' | 'adaptive';
    notificationPreferences: {
        enabled: boolean;
        frequency: 'high' | 'medium' | 'low';
        channels: ('in_app' | 'email' | 'push')[];
        optimalTimes: string[];
    };
    privacySettings: {
        shareData: boolean;
        anonymizeData: boolean;
        retentionPeriod: number;
    };
    customization: {
        themes: string[];
        languages: string[];
        accessibilityNeeds: string[];
    };
}
export interface RecommendationAnalytics {
    totalRecommendations: number;
    acceptanceRate: number;
    averageRating: number;
    completionRate: number;
    improvementMeasures: {
        learningVelocity: number;
        retentionRate: number;
        goalAchievement: number;
        userSatisfaction: number;
    };
    modelPerformance: {
        precision: number;
        recall: number;
        f1Score: number;
        auc: number;
    };
    distributionMetrics: {
        byFramework: Record<string, number>;
        byDifficulty: Record<string, number>;
        byTimeOfDay: Record<string, number>;
    };
}
