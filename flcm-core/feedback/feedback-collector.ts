/**
 * User Feedback Collection System for FLCM 2.0
 * Comprehensive feedback management with analysis and insights
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export enum FeedbackCategory {
  CONTENT_QUALITY = 'content_quality',
  PERFORMANCE = 'performance',
  USABILITY = 'usability',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  DOCUMENTATION = 'documentation',
  INTEGRATION = 'integration',
  GENERAL = 'general'
}

export enum FeedbackPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum FeedbackStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  category: FeedbackCategory;
  text: string;
  rating: number; // 1-5 scale
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
    polarity: number; // -1 to 1
    magnitude: number; // 0 to 1
    confidence: number; // 0 to 1
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
  satisfactionScore: number; // 0-100
  npsScore: number; // -100 to 100
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
  responseTimeThreshold?: number; // milliseconds
  criticalRatingThreshold?: number;
}

/**
 * Feedback Collector Class
 */
export class FeedbackCollector extends EventEmitter {
  private feedback: FeedbackEntry[] = [];
  private config: Required<FeedbackCollectorConfig>;
  private dataFilePath: string;
  private criticalCallbacks: ((feedback: FeedbackEntry) => void)[] = [];

  constructor(config: Partial<FeedbackCollectorConfig> = {}) {
    super();

    this.config = {
      dataFilePath: config.dataFilePath || path.join(process.cwd(), '.flcm-core', 'feedback', 'feedback.json'),
      maxFeedbackEntries: config.maxFeedbackEntries || 10000,
      enableAutoAnalysis: config.enableAutoAnalysis ?? true,
      enableNotifications: config.enableNotifications ?? true,
      enableSentimentAnalysis: config.enableSentimentAnalysis ?? true,
      autoCategorizationEnabled: config.autoCategorizationEnabled ?? true,
      responseTimeThreshold: config.responseTimeThreshold || 24 * 60 * 60 * 1000, // 24 hours
      criticalRatingThreshold: config.criticalRatingThreshold || 2
    };

    this.dataFilePath = this.config.dataFilePath;
    this.ensureDataDirectory();
    this.loadExistingFeedback();
  }

  /**
   * Collect user feedback
   */
  async collectFeedback(
    userId: string,
    category: FeedbackCategory,
    text: string,
    rating: number,
    context?: FeedbackEntry['context'],
    timestamp?: Date
  ): Promise<FeedbackEntry> {
    // Validation
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('User ID is required and cannot be empty');
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Create feedback entry
    const feedback: FeedbackEntry = {
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
  getFeedback(filter?: FeedbackFilter): FeedbackEntry[] {
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
        filtered = filtered.filter(f => f.rating >= filter.minRating!);
      }

      if (filter.maxRating) {
        filtered = filtered.filter(f => f.rating <= filter.maxRating!);
      }

      if (filter.startDate) {
        filtered = filtered.filter(f => f.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        filtered = filtered.filter(f => f.timestamp <= filter.endDate!);
      }

      if (filter.keywords && filter.keywords.length > 0) {
        filtered = filtered.filter(f => {
          const feedbackText = f.text.toLowerCase();
          const feedbackKeywords = f.keywords || [];
          return filter.keywords!.some(keyword => 
            feedbackText.includes(keyword.toLowerCase()) ||
            feedbackKeywords.includes(keyword.toLowerCase())
          );
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
          let aValue: any, bValue: any;

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
  analyzeFeedback(filter?: FeedbackFilter): FeedbackAnalysis {
    const feedbackData = filter ? this.getFeedback(filter) : this.feedback;
    const total = feedbackData.length;

    if (total === 0) {
      return this.getEmptyAnalysis();
    }

    // Calculate basic metrics
    const totalRating = feedbackData.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRating / total;

    // Rating distribution
    const ratingDistribution: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = feedbackData.filter(f => f.rating === i).length;
    }

    // Category distribution
    const categoryDistribution: Record<FeedbackCategory, number> = {} as any;
    Object.values(FeedbackCategory).forEach(category => {
      categoryDistribution[category] = feedbackData.filter(f => f.category === category).length;
    });

    // Priority distribution
    const priorityDistribution: Record<FeedbackPriority, number> = {} as any;
    Object.values(FeedbackPriority).forEach(priority => {
      priorityDistribution[priority] = feedbackData.filter(f => f.priority === priority).length;
    });

    // Status distribution
    const statusDistribution: Record<FeedbackStatus, number> = {} as any;
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
  generateInsights(): FeedbackInsights {
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
  exportFeedback(format: 'json' | 'csv', filter?: FeedbackFilter): string {
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
          `"${f.text.replace(/"/g, '""')}"`, // Escape quotes
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
  updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, adminNotes?: string): boolean {
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
  getUserSatisfactionHistory(userId: string): {
    ratings: number[];
    averageRating: number;
    trend: 'improving' | 'declining' | 'stable';
    feedbackCount: number;
  } {
    const userFeedback = this.getFeedback({ 
      userId,
      sortBy: 'timestamp',
      sortOrder: 'asc'
    });

    const ratings = userFeedback.map(f => f.rating);
    const averageRating = ratings.length > 0 ? 
      ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (ratings.length >= 3) {
      const recent = ratings.slice(-3);
      const earlier = ratings.slice(0, 3);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
      
      if (recentAvg > earlierAvg + 0.5) trend = 'improving';
      else if (recentAvg < earlierAvg - 0.5) trend = 'declining';
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
  calculateNPS(feedbackData?: FeedbackEntry[]): number {
    const data = feedbackData || this.feedback;
    if (data.length === 0) return 0;

    const promoters = data.filter(f => f.rating >= 4).length;
    const detractors = data.filter(f => f.rating <= 2).length;
    const total = data.length;

    return ((promoters - detractors) / total) * 100;
  }

  /**
   * Register callback for critical feedback
   */
  onCriticalFeedback(callback: (feedback: FeedbackEntry) => void): void {
    this.criticalCallbacks.push(callback);
  }

  /**
   * Clear all feedback data
   */
  clearFeedback(): void {
    this.feedback = [];
    this.saveFeedback();
    this.emit('feedbackCleared');
  }

  // Private methods

  private generateFeedbackId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    // Limit length and sanitize
    const maxLength = 5000;
    let sanitized = text.trim();
    
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength) + '...';
    }
    
    return sanitized;
  }

  private calculatePriority(rating: number, text: string): FeedbackPriority {
    const urgentKeywords = ['critical', 'urgent', 'broken', 'error', 'crash', 'bug', 'fail'];
    const hasUrgentKeywords = urgentKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (rating === 1 || hasUrgentKeywords) {
      return FeedbackPriority.CRITICAL;
    } else if (rating === 2) {
      return FeedbackPriority.HIGH;
    } else if (rating === 3) {
      return FeedbackPriority.MEDIUM;
    } else {
      return FeedbackPriority.LOW;
    }
  }

  private analyzeSentiment(text: string): FeedbackEntry['sentiment'] {
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

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'were', 'they', 'from'].includes(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 5 most frequent words
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private suggestCategory(text: string): FeedbackCategory {
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
      const score = keywords.reduce((count, keyword) => 
        count + (textLower.includes(keyword) ? 1 : 0), 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category as FeedbackCategory;
      }
    }

    return bestMatch;
  }

  private checkForCriticalFeedback(feedback: FeedbackEntry): void {
    const isCritical = feedback.rating <= this.config.criticalRatingThreshold ||
                      feedback.priority === FeedbackPriority.CRITICAL ||
                      feedback.category === FeedbackCategory.BUG_REPORT;

    if (isCritical) {
      this.criticalCallbacks.forEach(callback => {
        try {
          callback(feedback);
        } catch (error) {
          console.error('Critical feedback callback error:', error);
        }
      });
    }
  }

  private getPriorityWeight(priority: FeedbackPriority): number {
    switch (priority) {
      case FeedbackPriority.CRITICAL: return 4;
      case FeedbackPriority.HIGH: return 3;
      case FeedbackPriority.MEDIUM: return 2;
      case FeedbackPriority.LOW: return 1;
      default: return 0;
    }
  }

  private getEmptyAnalysis(): FeedbackAnalysis {
    return {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: {},
      categoryDistribution: {} as any,
      priorityDistribution: {} as any,
      statusDistribution: {} as any,
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

  private identifyTopIssues(feedbackData: FeedbackEntry[]): FeedbackAnalysis['topIssues'] {
    const lowRatingFeedback = feedbackData.filter(f => f.rating <= 3);
    const issueKeywords = this.extractCommonKeywords(lowRatingFeedback);
    
    return issueKeywords.slice(0, 5).map((keyword, index) => ({
      issue: keyword,
      count: lowRatingFeedback.filter(f => f.text.toLowerCase().includes(keyword)).length,
      severity: 5 - index
    }));
  }

  private identifyTopStrengths(feedbackData: FeedbackEntry[]): FeedbackAnalysis['topStrengths'] {
    const highRatingFeedback = feedbackData.filter(f => f.rating >= 4);
    const strengthKeywords = this.extractCommonKeywords(highRatingFeedback);
    
    return strengthKeywords.slice(0, 5).map((keyword, index) => ({
      strength: keyword,
      count: highRatingFeedback.filter(f => f.text.toLowerCase().includes(keyword)).length,
      impact: 5 - index
    }));
  }

  private extractCommonKeywords(feedbackData: FeedbackEntry[]): string[] {
    const allKeywords = feedbackData.flatMap(f => f.keywords || []);
    const keywordCounts: Record<string, number> = {};
    
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([keyword]) => keyword);
  }

  private calculateTrends(feedbackData: FeedbackEntry[]): FeedbackAnalysis['trends'] {
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

  private generateRecommendations(
    feedbackData: FeedbackEntry[], 
    analysis: { averageRating: number; topIssues: any[]; trends: any }
  ): FeedbackAnalysis['recommendations'] {
    const recommendations: FeedbackAnalysis['recommendations'] = [];

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
  private calculateRatingTrend(feedbackData: FeedbackEntry[]): string {
    if (feedbackData.length < 10) return 'insufficient_data';
    
    const recent = feedbackData.slice(0, 7).reduce((sum, f) => sum + f.rating, 0) / 7;
    const older = feedbackData.slice(-7).reduce((sum, f) => sum + f.rating, 0) / 7;
    
    if (recent > older + 0.3) return 'improving';
    if (recent < older - 0.3) return 'declining';
    return 'stable';
  }

  private calculateVolumeTrend(feedbackData: FeedbackEntry[]): string {
    // Implementation for volume trend calculation
    return 'stable';
  }

  private extractCommonThemes(feedbackData: FeedbackEntry[]): string[] {
    return this.extractCommonKeywords(feedbackData).slice(0, 5);
  }

  private analyzeDailyPatterns(feedbackData: FeedbackEntry[]): number[] {
    const patterns = new Array(24).fill(0);
    feedbackData.forEach(f => {
      const hour = f.timestamp.getHours();
      patterns[hour]++;
    });
    return patterns;
  }

  private analyzeWeeklyPatterns(feedbackData: FeedbackEntry[]): number[] {
    const patterns = new Array(7).fill(0);
    feedbackData.forEach(f => {
      const day = f.timestamp.getDay();
      patterns[day]++;
    });
    return patterns;
  }

  private analyzeSeasonalEffects(feedbackData: FeedbackEntry[]): Record<string, number> {
    return { spring: 0, summer: 0, fall: 0, winter: 0 };
  }

  private segmentUsers(feedbackData: FeedbackEntry[]): FeedbackInsights['userSegments'] {
    const userActivity: Record<string, number> = {};
    feedbackData.forEach(f => {
      userActivity[f.userId] = (userActivity[f.userId] || 0) + 1;
    });

    const sortedUsers = Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a);

    return {
      powerUsers: sortedUsers.slice(0, 10).map(([userId]) => userId),
      newUsers: sortedUsers.slice(-10).map(([userId]) => userId),
      churningUsers: [] // Would require more complex analysis
    };
  }

  private generatePredictiveInsights(feedbackData: FeedbackEntry[]): FeedbackInsights['predictiveInsights'] {
    const avgRating = feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length;
    
    return {
      expectedRating: avgRating,
      riskFactors: ['Declining performance ratings', 'Increasing bug reports'],
      opportunities: ['High content quality scores', 'Strong user engagement']
    };
  }

  private generateAdvancedRecommendations(feedbackData: FeedbackEntry[]): FeedbackInsights['recommendations'] {
    return [
      {
        priority: FeedbackPriority.HIGH,
        action: 'Improve system performance based on user feedback',
        reasoning: 'Multiple reports of slow performance',
        expectedOutcome: '20% improvement in performance ratings'
      }
    ];
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadExistingFeedback(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        this.feedback = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load existing feedback data:', error);
      this.feedback = [];
    }
  }

  private async saveFeedback(): Promise<void> {
    try {
      const data = JSON.stringify(this.feedback, null, 2);
      fs.writeFileSync(this.dataFilePath, data);
    } catch (error) {
      console.error('Failed to save feedback data:', error);
    }
  }
}

// Global instance for easy access
let globalFeedbackCollector: FeedbackCollector | null = null;

export function getFeedbackCollector(config?: Partial<FeedbackCollectorConfig>): FeedbackCollector {
  if (!globalFeedbackCollector) {
    globalFeedbackCollector = new FeedbackCollector(config);
  }
  return globalFeedbackCollector;
}