/**
 * Satisfaction Collector
 * Tracks user satisfaction and feedback for both versions
 */

import { MetricCollector, SatisfactionMetrics } from '../types';
import { Logger } from '../../shared/utils/logger';

interface Feedback {
  userId: string;
  version: '1.0' | '2.0';
  rating?: number;
  text?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
}

export class SatisfactionCollector implements MetricCollector {
  name: string = 'satisfaction';
  private feedback: Map<string, Feedback[]>;
  private npsScores: Map<string, number[]>;
  private ratings: Map<string, number[]>;
  private logger: Logger;
  
  constructor() {
    this.feedback = new Map();
    this.npsScores = new Map();
    this.ratings = new Map();
    this.logger = new Logger('SatisfactionCollector');
    this.initializeVersions();
  }
  
  /**
   * Initialize satisfaction tracking for both versions
   */
  private initializeVersions(): void {
    this.feedback.set('1.0', []);
    this.feedback.set('2.0', []);
    this.npsScores.set('1.0', []);
    this.npsScores.set('2.0', []);
    this.ratings.set('1.0', []);
    this.ratings.set('2.0', []);
  }
  
  /**
   * Collect user feedback
   */
  collectFeedback(
    version: '1.0' | '2.0',
    userId: string,
    feedback: {
      rating?: number;
      nps?: number;
      text?: string;
    }
  ): void {
    const feedbackEntry: Feedback = {
      userId,
      version,
      rating: feedback.rating,
      text: feedback.text,
      sentiment: this.analyzeSentiment(feedback.text),
      timestamp: new Date()
    };
    
    // Store feedback
    const versionFeedback = this.feedback.get(version);
    if (versionFeedback) {
      versionFeedback.push(feedbackEntry);
    }
    
    // Store NPS score
    if (feedback.nps !== undefined) {
      const nps = this.npsScores.get(version);
      if (nps) {
        nps.push(feedback.nps);
      }
    }
    
    // Store rating
    if (feedback.rating !== undefined) {
      const ratings = this.ratings.get(version);
      if (ratings) {
        ratings.push(feedback.rating);
      }
    }
    
    this.logger.debug(`Feedback collected for ${version}`, {
      userId,
      rating: feedback.rating,
      nps: feedback.nps,
      sentiment: feedbackEntry.sentiment
    });
  }
  
  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text?: string): 'positive' | 'neutral' | 'negative' {
    if (!text) return 'neutral';
    
    const textLower = text.toLowerCase();
    
    // Positive keywords
    const positiveWords = [
      'good', 'great', 'excellent', 'love', 'amazing', 'fantastic',
      'helpful', 'useful', 'fast', 'easy', 'intuitive', 'better'
    ];
    
    // Negative keywords
    const negativeWords = [
      'bad', 'poor', 'terrible', 'hate', 'slow', 'difficult',
      'confusing', 'broken', 'worse', 'frustrated', 'annoying', 'bug'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of positiveWords) {
      if (textLower.includes(word)) positiveCount++;
    }
    
    for (const word of negativeWords) {
      if (textLower.includes(word)) negativeCount++;
    }
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  /**
   * Calculate Net Promoter Score
   */
  private calculateNPS(scores: number[]): number {
    if (scores.length === 0) return 0;
    
    const promoters = scores.filter(s => s >= 9).length;
    const detractors = scores.filter(s => s <= 6).length;
    const total = scores.length;
    
    return ((promoters - detractors) / total) * 100;
  }
  
  /**
   * Calculate average rating
   */
  private calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
  }
  
  /**
   * Get sentiment distribution
   */
  private getSentimentDistribution(feedback: Feedback[]): any {
    const total = feedback.length;
    if (total === 0) {
      return { positive: 0, neutral: 0, negative: 0 };
    }
    
    const sentiments = feedback.map(f => f.sentiment || 'neutral');
    
    return {
      positive: sentiments.filter(s => s === 'positive').length / total,
      neutral: sentiments.filter(s => s === 'neutral').length / total,
      negative: sentiments.filter(s => s === 'negative').length / total
    };
  }
  
  /**
   * Collect satisfaction metrics
   */
  async collect(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};
    
    // Collect v1 metrics
    const v1Feedback = this.feedback.get('1.0') || [];
    const v1NPS = this.npsScores.get('1.0') || [];
    const v1Ratings = this.ratings.get('1.0') || [];
    
    metrics.v1_nps = this.calculateNPS(v1NPS);
    metrics.v1_satisfaction_rating = this.calculateAverageRating(v1Ratings);
    metrics.v1_sentiment = this.getSentimentDistribution(v1Feedback);
    metrics.v1_feedback_count = v1Feedback.length;
    metrics.v1_response_rate = this.calculateResponseRate('1.0');
    
    // Collect v2 metrics
    const v2Feedback = this.feedback.get('2.0') || [];
    const v2NPS = this.npsScores.get('2.0') || [];
    const v2Ratings = this.ratings.get('2.0') || [];
    
    metrics.v2_nps = this.calculateNPS(v2NPS);
    metrics.v2_satisfaction_rating = this.calculateAverageRating(v2Ratings);
    metrics.v2_sentiment = this.getSentimentDistribution(v2Feedback);
    metrics.v2_feedback_count = v2Feedback.length;
    metrics.v2_response_rate = this.calculateResponseRate('2.0');
    
    // Comparison metrics
    metrics.nps_difference = metrics.v2_nps - metrics.v1_nps;
    metrics.rating_difference = metrics.v2_satisfaction_rating - metrics.v1_satisfaction_rating;
    metrics.total_feedback = v1Feedback.length + v2Feedback.length;
    
    // Identify common themes
    metrics.v1_themes = this.extractThemes(v1Feedback);
    metrics.v2_themes = this.extractThemes(v2Feedback);
    
    // Recent trend (last 100 feedback items)
    metrics.v1_recent_trend = this.getRecentTrend('1.0');
    metrics.v2_recent_trend = this.getRecentTrend('2.0');
    
    this.logger.debug('Satisfaction metrics collected', {
      v1_nps: metrics.v1_nps,
      v2_nps: metrics.v2_nps,
      nps_diff: metrics.nps_difference
    });
    
    return metrics;
  }
  
  /**
   * Calculate response rate (placeholder - would need user count)
   */
  private calculateResponseRate(version: string): number {
    // This would typically compare against total active users
    // For now, return a placeholder
    const feedback = this.feedback.get(version) || [];
    const uniqueUsers = new Set(feedback.map(f => f.userId));
    return uniqueUsers.size > 0 ? Math.min(uniqueUsers.size / 100, 1) : 0;
  }
  
  /**
   * Extract common themes from feedback
   */
  private extractThemes(feedback: Feedback[]): string[] {
    const themes = new Map<string, number>();
    
    // Simple keyword extraction
    const keywords = [
      'performance', 'speed', 'interface', 'ui', 'feature',
      'bug', 'error', 'crash', 'documentation', 'learning curve',
      'workflow', 'integration', 'compatibility'
    ];
    
    for (const item of feedback) {
      if (!item.text) continue;
      
      const textLower = item.text.toLowerCase();
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          themes.set(keyword, (themes.get(keyword) || 0) + 1);
        }
      }
    }
    
    // Return top 5 themes
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);
  }
  
  /**
   * Get recent satisfaction trend
   */
  private getRecentTrend(version: string): string {
    const ratings = this.ratings.get(version) || [];
    if (ratings.length < 20) return 'insufficient_data';
    
    const recent = ratings.slice(-10);
    const previous = ratings.slice(-20, -10);
    
    const recentAvg = this.calculateAverageRating(recent);
    const previousAvg = this.calculateAverageRating(previous);
    
    if (recentAvg > previousAvg + 0.5) return 'improving';
    if (recentAvg < previousAvg - 0.5) return 'declining';
    return 'stable';
  }
  
  /**
   * Get feedback summary
   */
  getFeedbackSummary(version: '1.0' | '2.0', limit: number = 5): any[] {
    const feedback = this.feedback.get(version) || [];
    
    return feedback
      .filter(f => f.text)
      .slice(-limit)
      .map(f => ({
        userId: f.userId,
        rating: f.rating,
        sentiment: f.sentiment,
        text: f.text,
        timestamp: f.timestamp
      }));
  }
  
  /**
   * Reset collector
   */
  reset(): void {
    this.initializeVersions();
    this.logger.info('Satisfaction collector reset');
  }
  
  /**
   * Get summary
   */
  getSummary(): any {
    const v1NPS = this.npsScores.get('1.0') || [];
    const v2NPS = this.npsScores.get('2.0') || [];
    const v1Ratings = this.ratings.get('1.0') || [];
    const v2Ratings = this.ratings.get('2.0') || [];
    
    return {
      v1: {
        nps: this.calculateNPS(v1NPS),
        rating: this.calculateAverageRating(v1Ratings),
        feedback_count: (this.feedback.get('1.0') || []).length
      },
      v2: {
        nps: this.calculateNPS(v2NPS),
        rating: this.calculateAverageRating(v2Ratings),
        feedback_count: (this.feedback.get('2.0') || []).length
      }
    };
  }
}