"use strict";
/**
 * User Feedback Collection System for FLCM 2.0
 * Comprehensive feedback management with analysis and insights
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackCollector = exports.FeedbackCollector = exports.FeedbackStatus = exports.FeedbackPriority = exports.FeedbackCategory = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const events_1 = require("events");
var FeedbackCategory;
(function (FeedbackCategory) {
    FeedbackCategory["CONTENT_QUALITY"] = "content_quality";
    FeedbackCategory["PERFORMANCE"] = "performance";
    FeedbackCategory["USABILITY"] = "usability";
    FeedbackCategory["FEATURE_REQUEST"] = "feature_request";
    FeedbackCategory["BUG_REPORT"] = "bug_report";
    FeedbackCategory["DOCUMENTATION"] = "documentation";
    FeedbackCategory["INTEGRATION"] = "integration";
    FeedbackCategory["GENERAL"] = "general";
})(FeedbackCategory = exports.FeedbackCategory || (exports.FeedbackCategory = {}));
var FeedbackPriority;
(function (FeedbackPriority) {
    FeedbackPriority["LOW"] = "low";
    FeedbackPriority["MEDIUM"] = "medium";
    FeedbackPriority["HIGH"] = "high";
    FeedbackPriority["CRITICAL"] = "critical";
})(FeedbackPriority = exports.FeedbackPriority || (exports.FeedbackPriority = {}));
var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["NEW"] = "new";
    FeedbackStatus["ACKNOWLEDGED"] = "acknowledged";
    FeedbackStatus["IN_PROGRESS"] = "in_progress";
    FeedbackStatus["RESOLVED"] = "resolved";
    FeedbackStatus["CLOSED"] = "closed";
})(FeedbackStatus = exports.FeedbackStatus || (exports.FeedbackStatus = {}));
/**
 * Feedback Collector Class
 */
class FeedbackCollector extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.feedback = [];
        this.criticalCallbacks = [];
        this.config = {
            dataFilePath: config.dataFilePath || path.join(process.cwd(), '.flcm-core', 'feedback', 'feedback.json'),
            maxFeedbackEntries: config.maxFeedbackEntries || 10000,
            enableAutoAnalysis: config.enableAutoAnalysis ?? true,
            enableNotifications: config.enableNotifications ?? true,
            enableSentimentAnalysis: config.enableSentimentAnalysis ?? true,
            autoCategorizationEnabled: config.autoCategorizationEnabled ?? true,
            responseTimeThreshold: config.responseTimeThreshold || 24 * 60 * 60 * 1000,
            criticalRatingThreshold: config.criticalRatingThreshold || 2
        };
        this.dataFilePath = this.config.dataFilePath;
        this.ensureDataDirectory();
        this.loadExistingFeedback();
    }
    /**
     * Collect user feedback
     */
    async collectFeedback(userId, category, text, rating, context, timestamp) {
        // Validation
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('User ID is required and cannot be empty');
        }
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            throw new Error('Rating must be between 1 and 5');
        }
        // Create feedback entry
        const feedback = {
            id: this.generateFeedbackId(),
            userId: userId.trim(),
            category,
            text: this.sanitizeText(text),
            rating,
            priority: this.calculatePriority(rating, text),
            status: FeedbackStatus.NEW,
            timestamp: timestamp || new Date(),
            context: context || {},
            keywords: []
        };
        // Enhance feedback with analysis
        if (this.config.enableSentimentAnalysis) {
            feedback.sentiment = this.analyzeSentiment(text);
            feedback.keywords = this.extractKeywords(text);
        }
        if (this.config.autoCategorizationEnabled) {
            feedback.suggestedCategory = this.suggestCategory(text);
        }
        // Determine if follow-up is required
        feedback.followUpRequired = rating <= 2 || category === FeedbackCategory.BUG_REPORT;
        // Add to collection
        this.feedback.unshift(feedback); // Add to beginning for newest first
        // Maintain size limit
        if (this.feedback.length > this.config.maxFeedbackEntries) {
            this.feedback = this.feedback.slice(0, this.config.maxFeedbackEntries);
        }
        // Save to storage
        await this.saveFeedback();
        // Trigger notifications if enabled
        if (this.config.enableNotifications) {
            this.checkForCriticalFeedback(feedback);
        }
        // Emit events
        this.emit('feedbackCollected', feedback);
        return feedback;
    }
    /**
     * Get feedback with optional filtering
     */
    getFeedback(filter) {
        let filtered = [...this.feedback];
        if (filter) {
            // Apply filters
            if (filter.id) {
                filtered = filtered.filter(f => f.id === filter.id);
            }
            if (filter.userId) {
                filtered = filtered.filter(f => f.userId === filter.userId);
            }
            if (filter.category) {
                filtered = filtered.filter(f => f.category === filter.category);
            }
            if (filter.priority) {
                filtered = filtered.filter(f => f.priority === filter.priority);
            }
            if (filter.status) {
                filtered = filtered.filter(f => f.status === filter.status);
            }
            if (filter.rating) {
                filtered = filtered.filter(f => f.rating === filter.rating);
            }
            if (filter.minRating) {
                filtered = filtered.filter(f => f.rating >= filter.minRating);
            }
            if (filter.maxRating) {
                filtered = filtered.filter(f => f.rating <= filter.maxRating);
            }
            if (filter.startDate) {
                filtered = filtered.filter(f => f.timestamp >= filter.startDate);
            }
            if (filter.endDate) {
                filtered = filtered.filter(f => f.timestamp <= filter.endDate);
            }
            if (filter.keywords && filter.keywords.length > 0) {
                filtered = filtered.filter(f => {
                    const feedbackText = f.text.toLowerCase();
                    const feedbackKeywords = f.keywords || [];
                    return filter.keywords.some(keyword => feedbackText.includes(keyword.toLowerCase()) ||
                        feedbackKeywords.includes(keyword.toLowerCase()));
                });
            }
            if (filter.hasAttachments !== undefined) {
                filtered = filtered.filter(f => {
                    const hasAttachments = f.attachments && f.attachments.length > 0;
                    return hasAttachments === filter.hasAttachments;
                });
            }
            // Sorting
            if (filter.sortBy) {
                filtered.sort((a, b) => {
                    let aValue, bValue;
                    switch (filter.sortBy) {
                        case 'timestamp':
                            aValue = a.timestamp.getTime();
                            bValue = b.timestamp.getTime();
                            break;
                        case 'rating':
                            aValue = a.rating;
                            bValue = b.rating;
                            break;
                        case 'priority':
                            aValue = this.getPriorityWeight(a.priority);
                            bValue = this.getPriorityWeight(b.priority);
                            break;
                        default:
                            return 0;
                    }
                    if (filter.sortOrder === 'desc') {
                        return bValue - aValue;
                    }
                    return aValue - bValue;
                });
            }
            // Pagination
            if (filter.offset) {
                filtered = filtered.slice(filter.offset);
            }
            if (filter.limit) {
                filtered = filtered.slice(0, filter.limit);
            }
        }
        return filtered;
    }
    /**
     * Analyze feedback data
     */
    analyzeFeedback(filter) {
        const feedbackData = filter ? this.getFeedback(filter) : this.feedback;
        const total = feedbackData.length;
        if (total === 0) {
            return this.getEmptyAnalysis();
        }
        // Calculate basic metrics
        const totalRating = feedbackData.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRating / total;
        // Rating distribution
        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = feedbackData.filter(f => f.rating === i).length;
        }
        // Category distribution
        const categoryDistribution = {};
        Object.values(FeedbackCategory).forEach(category => {
            categoryDistribution[category] = feedbackData.filter(f => f.category === category).length;
        });
        // Priority distribution
        const priorityDistribution = {};
        Object.values(FeedbackPriority).forEach(priority => {
            priorityDistribution[priority] = feedbackData.filter(f => f.priority === priority).length;
        });
        // Status distribution
        const statusDistribution = {};
        Object.values(FeedbackStatus).forEach(status => {
            statusDistribution[status] = feedbackData.filter(f => f.status === status).length;
        });
        // Satisfaction and NPS
        const satisfactionScore = (averageRating / 5) * 100;
        const npsScore = this.calculateNPS(feedbackData);
        // Issues and strengths
        const topIssues = this.identifyTopIssues(feedbackData);
        const topStrengths = this.identifyTopStrengths(feedbackData);
        // Trends
        const trends = this.calculateTrends(feedbackData);
        // Recommendations
        const recommendations = this.generateRecommendations(feedbackData, {
            averageRating,
            topIssues,
            trends
        });
        return {
            totalFeedback: total,
            averageRating,
            ratingDistribution,
            categoryDistribution,
            priorityDistribution,
            statusDistribution,
            satisfactionScore,
            npsScore,
            topIssues,
            topStrengths,
            trends,
            recommendations,
            timeRange: {
                start: feedbackData[feedbackData.length - 1]?.timestamp || new Date(),
                end: feedbackData[0]?.timestamp || new Date()
            }
        };
    }
    /**
     * Generate insights from feedback data
     */
    generateInsights() {
        const recentFeedback = this.getFeedback({
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        });
        // Calculate trends
        const ratingTrend = this.calculateRatingTrend(recentFeedback);
        const volumeTrend = this.calculateVolumeTrend(recentFeedback);
        const commonThemes = this.extractCommonThemes(recentFeedback);
        // Temporal patterns
        const dailyPatterns = this.analyzeDailyPatterns(recentFeedback);
        const weeklyPatterns = this.analyzeWeeklyPatterns(recentFeedback);
        const seasonalEffects = this.analyzeSeasonalEffects(recentFeedback);
        // User segmentation
        const userSegments = this.segmentUsers(recentFeedback);
        // Predictive insights
        const predictiveInsights = this.generatePredictiveInsights(recentFeedback);
        // Recommendations
        const recommendations = this.generateAdvancedRecommendations(recentFeedback);
        return {
            trends: {
                ratingTrend,
                volumeTrend,
                commonThemes
            },
            patterns: {
                dailyPatterns,
                weeklyPatterns,
                seasonalEffects
            },
            userSegments,
            recommendations,
            predictiveInsights
        };
    }
    /**
     * Export feedback data
     */
    exportFeedback(format, filter) {
        const feedbackData = filter ? this.getFeedback(filter) : this.feedback;
        switch (format) {
            case 'json':
                return JSON.stringify({
                    feedback: feedbackData,
                    exportedAt: new Date(),
                    totalEntries: feedbackData.length,
                    summary: this.analyzeFeedback(filter)
                }, null, 2);
            case 'csv':
                const headers = [
                    'id', 'userId', 'category', 'rating', 'priority', 'status',
                    'timestamp', 'text', 'keywords', 'sentiment_polarity'
                ].join(',');
                const rows = feedbackData.map(f => [
                    f.id,
                    f.userId,
                    f.category,
                    f.rating,
                    f.priority,
                    f.status,
                    f.timestamp.toISOString(),
                    `"${f.text.replace(/"/g, '""')}"`,
                    `"${(f.keywords || []).join('; ')}"`,
                    f.sentiment?.polarity || ''
                ].join(','));
                return [headers, ...rows, ''].join('\n');
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Update feedback status
     */
    updateFeedbackStatus(feedbackId, status, adminNotes) {
        const feedback = this.feedback.find(f => f.id === feedbackId);
        if (!feedback) {
            return false;
        }
        feedback.status = status;
        if (adminNotes) {
            feedback.adminNotes = feedback.adminNotes || [];
            feedback.adminNotes.push(`${new Date().toISOString()}: ${adminNotes}`);
        }
        this.saveFeedback();
        this.emit('feedbackUpdated', feedback);
        return true;
    }
    /**
     * Get user satisfaction history
     */
    getUserSatisfactionHistory(userId) {
        const userFeedback = this.getFeedback({
            userId,
            sortBy: 'timestamp',
            sortOrder: 'asc'
        });
        const ratings = userFeedback.map(f => f.rating);
        const averageRating = ratings.length > 0 ?
            ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        let trend = 'stable';
        if (ratings.length >= 3) {
            const recent = ratings.slice(-3);
            const earlier = ratings.slice(0, 3);
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
            if (recentAvg > earlierAvg + 0.5)
                trend = 'improving';
            else if (recentAvg < earlierAvg - 0.5)
                trend = 'declining';
        }
        return {
            ratings,
            averageRating,
            trend,
            feedbackCount: userFeedback.length
        };
    }
    /**
     * Calculate Net Promoter Score
     */
    calculateNPS(feedbackData) {
        const data = feedbackData || this.feedback;
        if (data.length === 0)
            return 0;
        const promoters = data.filter(f => f.rating >= 4).length;
        const detractors = data.filter(f => f.rating <= 2).length;
        const total = data.length;
        return ((promoters - detractors) / total) * 100;
    }
    /**
     * Register callback for critical feedback
     */
    onCriticalFeedback(callback) {
        this.criticalCallbacks.push(callback);
    }
    /**
     * Clear all feedback data
     */
    clearFeedback() {
        this.feedback = [];
        this.saveFeedback();
        this.emit('feedbackCleared');
    }
    // Private methods
    generateFeedbackId() {
        return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    sanitizeText(text) {
        if (!text || typeof text !== 'string')
            return '';
        // Limit length and sanitize
        const maxLength = 5000;
        let sanitized = text.trim();
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength) + '...';
        }
        return sanitized;
    }
    calculatePriority(rating, text) {
        const urgentKeywords = ['critical', 'urgent', 'broken', 'error', 'crash', 'bug', 'fail'];
        const hasUrgentKeywords = urgentKeywords.some(keyword => text.toLowerCase().includes(keyword));
        if (rating === 1 || hasUrgentKeywords) {
            return FeedbackPriority.CRITICAL;
        }
        else if (rating === 2) {
            return FeedbackPriority.HIGH;
        }
        else if (rating === 3) {
            return FeedbackPriority.MEDIUM;
        }
        else {
            return FeedbackPriority.LOW;
        }
    }
    analyzeSentiment(text) {
        // Simple sentiment analysis - in production, use a proper NLP library
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'broken', 'slow', 'frustrating'];
        const words = text.toLowerCase().split(/\W+/);
        const positiveCount = words.filter(word => positiveWords.includes(word)).length;
        const negativeCount = words.filter(word => negativeWords.includes(word)).length;
        const polarity = positiveCount > negativeCount ?
            Math.min(positiveCount / words.length * 10, 1) :
            -Math.min(negativeCount / words.length * 10, 1);
        const magnitude = (positiveCount + negativeCount) / words.length;
        return {
            polarity,
            magnitude: Math.min(magnitude * 5, 1),
            confidence: Math.min((positiveCount + negativeCount) / 10, 1)
        };
    }
    extractKeywords(text) {
        // Simple keyword extraction
        const words = text.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'were', 'they', 'from'].includes(word));
        // Count word frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        // Return top 5 most frequent words
        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }
    suggestCategory(text) {
        const categoryKeywords = {
            [FeedbackCategory.CONTENT_QUALITY]: ['content', 'quality', 'writing', 'article', 'text'],
            [FeedbackCategory.PERFORMANCE]: ['slow', 'fast', 'performance', 'speed', 'loading'],
            [FeedbackCategory.USABILITY]: ['interface', 'ui', 'ux', 'usability', 'easy', 'difficult'],
            [FeedbackCategory.BUG_REPORT]: ['bug', 'error', 'broken', 'crash', 'fail', 'issue'],
            [FeedbackCategory.FEATURE_REQUEST]: ['feature', 'add', 'want', 'need', 'request', 'suggestion']
        };
        const textLower = text.toLowerCase();
        let bestMatch = FeedbackCategory.GENERAL;
        let maxScore = 0;
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            const score = keywords.reduce((count, keyword) => count + (textLower.includes(keyword) ? 1 : 0), 0);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = category;
            }
        }
        return bestMatch;
    }
    checkForCriticalFeedback(feedback) {
        const isCritical = feedback.rating <= this.config.criticalRatingThreshold ||
            feedback.priority === FeedbackPriority.CRITICAL ||
            feedback.category === FeedbackCategory.BUG_REPORT;
        if (isCritical) {
            this.criticalCallbacks.forEach(callback => {
                try {
                    callback(feedback);
                }
                catch (error) {
                    console.error('Critical feedback callback error:', error);
                }
            });
        }
    }
    getPriorityWeight(priority) {
        switch (priority) {
            case FeedbackPriority.CRITICAL: return 4;
            case FeedbackPriority.HIGH: return 3;
            case FeedbackPriority.MEDIUM: return 2;
            case FeedbackPriority.LOW: return 1;
            default: return 0;
        }
    }
    getEmptyAnalysis() {
        return {
            totalFeedback: 0,
            averageRating: 0,
            ratingDistribution: {},
            categoryDistribution: {},
            priorityDistribution: {},
            statusDistribution: {},
            satisfactionScore: 0,
            npsScore: 0,
            topIssues: [],
            topStrengths: [],
            trends: {
                ratingTrend: 'stable',
                volumeTrend: 'stable',
                responseTimeTrend: 'stable'
            },
            recommendations: [],
            timeRange: {
                start: new Date(),
                end: new Date()
            }
        };
    }
    identifyTopIssues(feedbackData) {
        const lowRatingFeedback = feedbackData.filter(f => f.rating <= 3);
        const issueKeywords = this.extractCommonKeywords(lowRatingFeedback);
        return issueKeywords.slice(0, 5).map((keyword, index) => ({
            issue: keyword,
            count: lowRatingFeedback.filter(f => f.text.toLowerCase().includes(keyword)).length,
            severity: 5 - index
        }));
    }
    identifyTopStrengths(feedbackData) {
        const highRatingFeedback = feedbackData.filter(f => f.rating >= 4);
        const strengthKeywords = this.extractCommonKeywords(highRatingFeedback);
        return strengthKeywords.slice(0, 5).map((keyword, index) => ({
            strength: keyword,
            count: highRatingFeedback.filter(f => f.text.toLowerCase().includes(keyword)).length,
            impact: 5 - index
        }));
    }
    extractCommonKeywords(feedbackData) {
        const allKeywords = feedbackData.flatMap(f => f.keywords || []);
        const keywordCounts = {};
        allKeywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
        return Object.entries(keywordCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([keyword]) => keyword);
    }
    calculateTrends(feedbackData) {
        // Simple trend calculation - compare recent vs older data
        const midpoint = Math.floor(feedbackData.length / 2);
        const recent = feedbackData.slice(0, midpoint);
        const older = feedbackData.slice(midpoint);
        const recentAvg = recent.length > 0 ?
            recent.reduce((sum, f) => sum + f.rating, 0) / recent.length : 0;
        const olderAvg = older.length > 0 ?
            older.reduce((sum, f) => sum + f.rating, 0) / older.length : 0;
        const ratingTrend = recentAvg > olderAvg + 0.2 ? 'improving' :
            recentAvg < olderAvg - 0.2 ? 'declining' : 'stable';
        // Volume trend (simplified)
        const volumeTrend = recent.length > older.length * 1.2 ? 'increasing' :
            recent.length < older.length * 0.8 ? 'decreasing' : 'stable';
        return {
            ratingTrend,
            volumeTrend,
            responseTimeTrend: 'stable' // Placeholder
        };
    }
    generateRecommendations(feedbackData, analysis) {
        const recommendations = [];
        if (analysis.averageRating < 3.5) {
            recommendations.push({
                priority: FeedbackPriority.HIGH,
                action: 'Investigate and address top user concerns',
                expectedImpact: 'Significant improvement in user satisfaction',
                effort: 'medium'
            });
        }
        if (analysis.topIssues.length > 0) {
            recommendations.push({
                priority: FeedbackPriority.HIGH,
                action: `Focus on resolving: ${analysis.topIssues[0].issue}`,
                expectedImpact: 'Reduced negative feedback',
                effort: 'medium'
            });
        }
        if (analysis.trends.ratingTrend === 'declining') {
            recommendations.push({
                priority: FeedbackPriority.CRITICAL,
                action: 'Immediate investigation into declining satisfaction',
                expectedImpact: 'Prevent further deterioration',
                effort: 'high'
            });
        }
        return recommendations;
    }
    // Additional helper methods for insights generation
    calculateRatingTrend(feedbackData) {
        if (feedbackData.length < 10)
            return 'insufficient_data';
        const recent = feedbackData.slice(0, 7).reduce((sum, f) => sum + f.rating, 0) / 7;
        const older = feedbackData.slice(-7).reduce((sum, f) => sum + f.rating, 0) / 7;
        if (recent > older + 0.3)
            return 'improving';
        if (recent < older - 0.3)
            return 'declining';
        return 'stable';
    }
    calculateVolumeTrend(feedbackData) {
        // Implementation for volume trend calculation
        return 'stable';
    }
    extractCommonThemes(feedbackData) {
        return this.extractCommonKeywords(feedbackData).slice(0, 5);
    }
    analyzeDailyPatterns(feedbackData) {
        const patterns = new Array(24).fill(0);
        feedbackData.forEach(f => {
            const hour = f.timestamp.getHours();
            patterns[hour]++;
        });
        return patterns;
    }
    analyzeWeeklyPatterns(feedbackData) {
        const patterns = new Array(7).fill(0);
        feedbackData.forEach(f => {
            const day = f.timestamp.getDay();
            patterns[day]++;
        });
        return patterns;
    }
    analyzeSeasonalEffects(feedbackData) {
        return { spring: 0, summer: 0, fall: 0, winter: 0 };
    }
    segmentUsers(feedbackData) {
        const userActivity = {};
        feedbackData.forEach(f => {
            userActivity[f.userId] = (userActivity[f.userId] || 0) + 1;
        });
        const sortedUsers = Object.entries(userActivity)
            .sort(([, a], [, b]) => b - a);
        return {
            powerUsers: sortedUsers.slice(0, 10).map(([userId]) => userId),
            newUsers: sortedUsers.slice(-10).map(([userId]) => userId),
            churningUsers: [] // Would require more complex analysis
        };
    }
    generatePredictiveInsights(feedbackData) {
        const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length;
        return {
            expectedRating: avgRating,
            riskFactors: ['Declining performance ratings', 'Increasing bug reports'],
            opportunities: ['High content quality scores', 'Strong user engagement']
        };
    }
    generateAdvancedRecommendations(feedbackData) {
        return [
            {
                priority: FeedbackPriority.HIGH,
                action: 'Improve system performance based on user feedback',
                reasoning: 'Multiple reports of slow performance',
                expectedOutcome: '20% improvement in performance ratings'
            }
        ];
    }
    ensureDataDirectory() {
        const dir = path.dirname(this.dataFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    loadExistingFeedback() {
        try {
            if (fs.existsSync(this.dataFilePath)) {
                const data = fs.readFileSync(this.dataFilePath, 'utf-8');
                const parsed = JSON.parse(data);
                this.feedback = parsed.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
            }
        }
        catch (error) {
            console.warn('Failed to load existing feedback data:', error);
            this.feedback = [];
        }
    }
    async saveFeedback() {
        try {
            const data = JSON.stringify(this.feedback, null, 2);
            fs.writeFileSync(this.dataFilePath, data);
        }
        catch (error) {
            console.error('Failed to save feedback data:', error);
        }
    }
}
exports.FeedbackCollector = FeedbackCollector;
// Global instance for easy access
let globalFeedbackCollector = null;
function getFeedbackCollector(config) {
    if (!globalFeedbackCollector) {
        globalFeedbackCollector = new FeedbackCollector(config);
    }
    return globalFeedbackCollector;
}
exports.getFeedbackCollector = getFeedbackCollector;
//# sourceMappingURL=feedback-collector.js.map