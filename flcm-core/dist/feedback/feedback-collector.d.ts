/**
 * User Feedback Collection System for FLCM 2.0
 * Comprehensive feedback management with analysis and insights
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare enum FeedbackCategory {
    CONTENT_QUALITY = "content_quality",
    PERFORMANCE = "performance",
    USABILITY = "usability",
    FEATURE_REQUEST = "feature_request",
    BUG_REPORT = "bug_report",
    DOCUMENTATION = "documentation",
    INTEGRATION = "integration",
    GENERAL = "general"
}
export declare enum FeedbackPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum FeedbackStatus {
    NEW = "new",
    ACKNOWLEDGED = "acknowledged",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export interface FeedbackEntry {
    id: string;
    userId: string;
    category: FeedbackCategory;
    text: string;
    rating: number;
    priority: FeedbackPriority;
    status: FeedbackStatus;
    timestamp: Date;
    context?: {
        agentId?: string;
        taskId?: string;
        workflow?: string;
        platform?: string;
        version?: string;
        sessionId?: string;
        [key: string]: any;
    };
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        location?: string;
        deviceType?: string;
    };
    sentiment?: {
        polarity: number;
        magnitude: number;
        confidence: number;
    };
    keywords?: string[];
    suggestedCategory?: FeedbackCategory;
    responseTime?: number;
    followUpRequired?: boolean;
    adminNotes?: string[];
    attachments?: string[];
}
export interface FeedbackFilter {
    id?: string;
    userId?: string;
    category?: FeedbackCategory;
    priority?: FeedbackPriority;
    status?: FeedbackStatus;
    rating?: number;
    minRating?: number;
    maxRating?: number;
    startDate?: Date;
    endDate?: Date;
    keywords?: string[];
    hasAttachments?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'rating' | 'priority';
    sortOrder?: 'asc' | 'desc';
}
export interface FeedbackAnalysis {
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    categoryDistribution: Record<FeedbackCategory, number>;
    priorityDistribution: Record<FeedbackPriority, number>;
    statusDistribution: Record<FeedbackStatus, number>;
    satisfactionScore: number;
    npsScore: number;
    topIssues: Array<{
        issue: string;
        count: number;
        severity: number;
    }>;
    topStrengths: Array<{
        strength: string;
        count: number;
        impact: number;
    }>;
    trends: {
        ratingTrend: 'improving' | 'declining' | 'stable';
        volumeTrend: 'increasing' | 'decreasing' | 'stable';
        responseTimeTrend: 'improving' | 'declining' | 'stable';
    };
    recommendations: Array<{
        priority: FeedbackPriority;
        action: string;
        expectedImpact: string;
        effort: 'low' | 'medium' | 'high';
    }>;
    timeRange: {
        start: Date;
        end: Date;
    };
}
export interface FeedbackInsights {
    trends: {
        ratingTrend: string;
        volumeTrend: string;
        commonThemes: string[];
    };
    patterns: {
        dailyPatterns: number[];
        weeklyPatterns: number[];
        seasonalEffects: Record<string, number>;
    };
    userSegments: {
        powerUsers: string[];
        newUsers: string[];
        churningUsers: string[];
    };
    recommendations: Array<{
        priority: FeedbackPriority;
        action: string;
        reasoning: string;
        expectedOutcome: string;
    }>;
    predictiveInsights: {
        expectedRating: number;
        riskFactors: string[];
        opportunities: string[];
    };
}
export interface FeedbackCollectorConfig {
    dataFilePath?: string;
    maxFeedbackEntries?: number;
    enableAutoAnalysis?: boolean;
    enableNotifications?: boolean;
    enableSentimentAnalysis?: boolean;
    autoCategorizationEnabled?: boolean;
    responseTimeThreshold?: number;
    criticalRatingThreshold?: number;
}
/**
 * Feedback Collector Class
 */
export declare class FeedbackCollector extends EventEmitter {
    private feedback;
    private config;
    private dataFilePath;
    private criticalCallbacks;
    constructor(config?: Partial<FeedbackCollectorConfig>);
    /**
     * Collect user feedback
     */
    collectFeedback(userId: string, category: FeedbackCategory, text: string, rating: number, context?: FeedbackEntry['context'], timestamp?: Date): Promise<FeedbackEntry>;
    /**
     * Get feedback with optional filtering
     */
    getFeedback(filter?: FeedbackFilter): FeedbackEntry[];
    /**
     * Analyze feedback data
     */
    analyzeFeedback(filter?: FeedbackFilter): FeedbackAnalysis;
    /**
     * Generate insights from feedback data
     */
    generateInsights(): FeedbackInsights;
    /**
     * Export feedback data
     */
    exportFeedback(format: 'json' | 'csv', filter?: FeedbackFilter): string;
    /**
     * Update feedback status
     */
    updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, adminNotes?: string): boolean;
    /**
     * Get user satisfaction history
     */
    getUserSatisfactionHistory(userId: string): {
        ratings: number[];
        averageRating: number;
        trend: 'improving' | 'declining' | 'stable';
        feedbackCount: number;
    };
    /**
     * Calculate Net Promoter Score
     */
    calculateNPS(feedbackData?: FeedbackEntry[]): number;
    /**
     * Register callback for critical feedback
     */
    onCriticalFeedback(callback: (feedback: FeedbackEntry) => void): void;
    /**
     * Clear all feedback data
     */
    clearFeedback(): void;
    private generateFeedbackId;
    private sanitizeText;
    private calculatePriority;
    private analyzeSentiment;
    private extractKeywords;
    private suggestCategory;
    private checkForCriticalFeedback;
    private getPriorityWeight;
    private getEmptyAnalysis;
    private identifyTopIssues;
    private identifyTopStrengths;
    private extractCommonKeywords;
    private calculateTrends;
    private generateRecommendations;
    private calculateRatingTrend;
    private calculateVolumeTrend;
    private extractCommonThemes;
    private analyzeDailyPatterns;
    private analyzeWeeklyPatterns;
    private analyzeSeasonalEffects;
    private segmentUsers;
    private generatePredictiveInsights;
    private generateAdvancedRecommendations;
    private ensureDataDirectory;
    private loadExistingFeedback;
    private saveFeedback;
}
export declare function getFeedbackCollector(config?: Partial<FeedbackCollectorConfig>): FeedbackCollector;
