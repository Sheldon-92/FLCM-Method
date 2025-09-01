/**
 * Daily Learning Summary Generator
 * Creates personalized daily learning summaries and insights
 */

import { Logger } from '../shared/utils/logger';

export interface DailySummary {
  id: string;
  userId: string;
  date: Date;
  summary: SummaryContent;
  insights: DailySummaryInsight[];
  metrics: DailySummaryMetrics;
  recommendations: SummaryRecommendation[];
  mood: SummaryMood;
  generated: Date;
}

export interface SummaryContent {
  overview: string;
  keyActivities: string[];
  topInsights: string[];
  frameworksUsed: string[];
  timeSpent: number;
  focusAreas: string[];
}

export interface DailySummaryInsight {
  type: 'pattern' | 'breakthrough' | 'struggle' | 'connection';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  actionable: boolean;
}

export interface DailySummaryMetrics {
  sessionsCompleted: number;
  totalTimeMinutes: number;
  insightsCreated: number;
  averageDepth: number;
  completionRate: number;
  frameworksUsed: number;
  conceptsExplored: number;
  connectionsIdentified: number;
}

export interface SummaryRecommendation {
  type: 'continue' | 'adjust' | 'explore' | 'review';
  category: 'framework' | 'timing' | 'depth' | 'breadth' | 'consistency';
  title: string;
  description: string;
  specific_action: string;
  priority: 'low' | 'medium' | 'high';
  estimated_benefit: string;
}

export interface SummaryMood {
  overall: 'energized' | 'satisfied' | 'neutral' | 'frustrated' | 'overwhelmed';
  confidence: number; // 1-10
  engagement: number; // 1-10
  challenge_level: 'too_easy' | 'just_right' | 'too_hard';
  indicators: string[];
}

export class DailySummaryGenerator {
  private logger: Logger;
  private summaries: Map<string, DailySummary> = new Map();
  
  constructor() {
    this.logger = new Logger('DailySummaryGenerator');
  }
  
  /**
   * Generate daily summary for user
   */
  async generateDailySummary(
    userId: string,
    date: Date,
    dayData: any
  ): Promise<DailySummary> {
    try {
      this.logger.info(`Generating daily summary for ${userId} on ${date.toDateString()}`);
      
      // Extract and analyze day's activities
      const summary = await this.createSummaryContent(dayData);
      const insights = await this.extractDailyInsights(dayData);
      const metrics = this.calculateDailyMetrics(dayData);
      const recommendations = await this.generateRecommendations(dayData, metrics);
      const mood = this.assessDailyMood(dayData, metrics);
      
      const dailySummary: DailySummary = {
        id: `summary-${userId}-${date.toISOString().split('T')[0]}`,
        userId,
        date,
        summary,
        insights,
        metrics,
        recommendations,
        mood,
        generated: new Date()
      };
      
      // Store summary
      this.summaries.set(dailySummary.id, dailySummary);
      
      this.logger.debug(`Generated summary with ${insights.length} insights and ${recommendations.length} recommendations`);
      
      return dailySummary;
      
    } catch (error) {
      this.logger.error('Failed to generate daily summary:', error);
      throw error;
    }
  }
  
  /**
   * Create summary content
   */
  private async createSummaryContent(dayData: any): Promise<SummaryContent> {
    const sessions = dayData.sessions || [];
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const frameworks = new Set(sessions.map(s => s.framework));
    const insights = dayData.insights || [];
    
    // Generate overview
    const overview = this.generateOverview(sessions, totalTime, frameworks.size);
    
    // Extract key activities
    const keyActivities = this.extractKeyActivities(sessions);
    
    // Get top insights
    const topInsights = insights
      .sort((a, b) => (b.depth || 0) - (a.depth || 0))
      .slice(0, 3)
      .map(i => i.content || 'Insight content');
    
    // Identify focus areas
    const focusAreas = this.identifyFocusAreas(sessions, insights);
    
    return {
      overview,
      keyActivities,
      topInsights,
      frameworksUsed: Array.from(frameworks),
      timeSpent: Math.round(totalTime / 60000), // Convert to minutes
      focusAreas
    };
  }
  
  /**
   * Generate overview text
   */
  private generateOverview(sessions: any[], totalTime: number, frameworkCount: number): string {
    const sessionCount = sessions.length;
    const timeMinutes = Math.round(totalTime / 60000);
    
    let overview = `Today you completed ${sessionCount} learning session${sessionCount !== 1 ? 's' : ''}`;
    
    if (timeMinutes > 0) {
      overview += ` over ${timeMinutes} minutes`;
    }
    
    if (frameworkCount > 0) {
      overview += `, using ${frameworkCount} different framework${frameworkCount !== 1 ? 's' : ''}`;
    }
    
    // Add qualitative assessment
    if (sessionCount >= 3) {
      overview += '. You had a highly productive learning day!';
    } else if (sessionCount === 2) {
      overview += '. A solid day of focused learning.';
    } else if (sessionCount === 1) {
      overview += '. You maintained your learning momentum today.';
    } else {
      overview += '. Consider dedicating some time to learning tomorrow.';
    }
    
    return overview;
  }
  
  /**
   * Extract key activities
   */
  private extractKeyActivities(sessions: any[]): string[] {
    const activities: string[] = [];
    
    for (const session of sessions) {
      const framework = session.framework || 'general';
      const duration = Math.round(session.duration / 60000);
      const insights = session.insights?.length || 0;
      
      let activity = `Used ${framework} framework`;
      if (duration > 0) {
        activity += ` for ${duration} minutes`;
      }
      if (insights > 0) {
        activity += `, creating ${insights} insight${insights !== 1 ? 's' : ''}`;
      }
      
      activities.push(activity);
    }
    
    return activities;
  }
  
  /**
   * Identify focus areas from sessions and insights
   */
  private identifyFocusAreas(sessions: any[], insights: any[]): string[] {
    const areas = new Set<string>();
    
    // Extract from session metadata
    for (const session of sessions) {
      if (session.metadata?.topic) {
        areas.add(session.metadata.topic);
      }
      if (session.metadata?.goals) {
        session.metadata.goals.forEach(goal => areas.add(goal));
      }
    }
    
    // Extract from insight tags
    for (const insight of insights) {
      if (insight.tags) {
        insight.tags.forEach(tag => {
          if (tag.startsWith('#')) {
            areas.add(tag.substring(1));
          }
        });
      }
    }
    
    return Array.from(areas).slice(0, 5);
  }
  
  /**
   * Extract daily insights
   */
  private async extractDailyInsights(dayData: any): Promise<DailySummaryInsight[]> {
    const insights: DailySummaryInsight[] = [];
    const sessions = dayData.sessions || [];
    const allInsights = dayData.insights || [];
    
    // Pattern recognition
    const patterns = this.identifyDailyPatterns(sessions);
    insights.push(...patterns);
    
    // Breakthrough detection
    const breakthroughs = this.detectBreakthroughs(allInsights, sessions);
    insights.push(...breakthroughs);
    
    // Struggle identification
    const struggles = this.identifyStruggles(sessions);
    insights.push(...struggles);
    
    // Connection discovery
    const connections = this.findConnections(allInsights);
    insights.push(...connections);
    
    return insights.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Identify daily patterns
   */
  private identifyDailyPatterns(sessions: any[]): DailySummaryInsight[] {
    const patterns: DailySummaryInsight[] = [];
    
    if (sessions.length === 0) return patterns;
    
    // Time pattern
    const hours = sessions.map(s => new Date(s.startTime).getHours());
    const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    
    if (hours.every(h => Math.abs(h - avgHour) < 2)) {
      patterns.push({
        type: 'pattern',
        title: 'Consistent Learning Time',
        description: `You consistently learn around ${this.formatHour(avgHour)}`,
        evidence: [`All ${sessions.length} sessions occurred within a 2-hour window`],
        confidence: 0.8,
        actionable: false
      });
    }
    
    // Framework pattern
    const frameworks = sessions.map(s => s.framework);
    const uniqueFrameworks = new Set(frameworks);
    
    if (uniqueFrameworks.size === 1 && sessions.length > 1) {
      patterns.push({
        type: 'pattern',
        title: 'Framework Focus',
        description: `Deep dive into ${frameworks[0]} framework today`,
        evidence: [`Used ${frameworks[0]} in all ${sessions.length} sessions`],
        confidence: 0.9,
        actionable: true
      });
    }
    
    return patterns;
  }
  
  /**
   * Detect breakthroughs
   */
  private detectBreakthroughs(insights: any[], sessions: any[]): DailySummaryInsight[] {
    const breakthroughs: DailySummaryInsight[] = [];
    
    // High-depth insights
    const deepInsights = insights.filter(i => (i.depth || 0) > 70);
    if (deepInsights.length > 0) {
      breakthroughs.push({
        type: 'breakthrough',
        title: 'Deep Insight Achievement',
        description: `Created ${deepInsights.length} profound insight${deepInsights.length !== 1 ? 's' : ''}`,
        evidence: deepInsights.map(i => `"${i.content?.substring(0, 100)}..."`),
        confidence: 0.9,
        actionable: true
      });
    }
    
    // High completion rates
    const highCompletionSessions = sessions.filter(s => (s.completedSteps / s.totalSteps) > 0.9);
    if (highCompletionSessions.length === sessions.length && sessions.length > 1) {
      breakthroughs.push({
        type: 'breakthrough',
        title: 'Perfect Completion',
        description: 'Completed all frameworks with high thoroughness',
        evidence: [`${sessions.length} sessions with >90% completion rate`],
        confidence: 0.8,
        actionable: false
      });
    }
    
    return breakthroughs;
  }
  
  /**
   * Identify struggles
   */
  private identifyStruggles(sessions: any[]): DailySummaryInsight[] {
    const struggles: DailySummaryInsight[] = [];
    
    // Low completion rates
    const lowCompletionSessions = sessions.filter(s => (s.completedSteps / s.totalSteps) < 0.5);
    if (lowCompletionSessions.length > 0) {
      struggles.push({
        type: 'struggle',
        title: 'Completion Challenges',
        description: `${lowCompletionSessions.length} session${lowCompletionSessions.length !== 1 ? 's' : ''} had low completion rates`,
        evidence: lowCompletionSessions.map(s => `${s.framework}: ${Math.round((s.completedSteps / s.totalSteps) * 100)}% complete`),
        confidence: 0.7,
        actionable: true
      });
    }
    
    // Short sessions
    const shortSessions = sessions.filter(s => s.duration < 600000); // Less than 10 minutes
    if (shortSessions.length > sessions.length / 2) {
      struggles.push({
        type: 'struggle',
        title: 'Brief Sessions',
        description: 'Many sessions were shorter than usual',
        evidence: [`${shortSessions.length} sessions under 10 minutes`],
        confidence: 0.6,
        actionable: true
      });
    }
    
    return struggles;
  }
  
  /**
   * Find connections between insights
   */
  private findConnections(insights: any[]): DailySummaryInsight[] {
    const connections: DailySummaryInsight[] = [];
    
    if (insights.length < 2) return connections;
    
    // Look for thematic connections
    const themes = new Map<string, any[]>();
    
    for (const insight of insights) {
      if (insight.tags) {
        for (const tag of insight.tags) {
          if (!themes.has(tag)) {
            themes.set(tag, []);
          }
          themes.get(tag)!.push(insight);
        }
      }
    }
    
    // Find themes with multiple insights
    for (const [theme, themeInsights] of themes) {
      if (themeInsights.length > 1) {
        connections.push({
          type: 'connection',
          title: `${theme} Theme`,
          description: `Multiple insights connected to ${theme}`,
          evidence: themeInsights.map(i => `"${i.content?.substring(0, 50)}..."`),
          confidence: 0.7,
          actionable: false
        });
      }
    }
    
    return connections;
  }
  
  /**
   * Calculate daily metrics
   */
  private calculateDailyMetrics(dayData: any): DailySummaryMetrics {
    const sessions = dayData.sessions || [];
    const insights = dayData.insights || [];
    
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSteps = sessions.reduce((sum, s) => sum + (s.totalSteps || 0), 0);
    const completedSteps = sessions.reduce((sum, s) => sum + (s.completedSteps || 0), 0);
    const frameworks = new Set(sessions.map(s => s.framework));
    
    // Calculate average depth
    const depths = insights.filter(i => i.depth > 0).map(i => i.depth);
    const averageDepth = depths.length > 0 ? depths.reduce((sum, d) => sum + d, 0) / depths.length : 0;
    
    // Count concepts (simplified)
    const concepts = new Set<string>();
    for (const insight of insights) {
      if (insight.tags) {
        insight.tags.forEach(tag => concepts.add(tag));
      }
    }
    
    return {
      sessionsCompleted: sessions.length,
      totalTimeMinutes: Math.round(totalTime / 60000),
      insightsCreated: insights.length,
      averageDepth: Math.round(averageDepth),
      completionRate: totalSteps > 0 ? completedSteps / totalSteps : 0,
      frameworksUsed: frameworks.size,
      conceptsExplored: concepts.size,
      connectionsIdentified: this.countConnections(insights)
    };
  }
  
  /**
   * Count connections in insights
   */
  private countConnections(insights: any[]): number {
    return insights.reduce((count, insight) => {
      return count + (insight.connections?.length || 0);
    }, 0);
  }
  
  /**
   * Generate recommendations
   */
  private async generateRecommendations(
    dayData: any,
    metrics: DailySummaryMetrics
  ): Promise<SummaryRecommendation[]> {
    const recommendations: SummaryRecommendation[] = [];
    
    // Time-based recommendations
    if (metrics.totalTimeMinutes < 15) {
      recommendations.push({
        type: 'adjust',
        category: 'timing',
        title: 'Extend Learning Time',
        description: 'Consider longer sessions for deeper exploration',
        specific_action: 'Try 20-30 minute focused sessions tomorrow',
        priority: 'medium',
        estimated_benefit: 'Better retention and deeper insights'
      });
    }
    
    // Framework diversity
    if (metrics.frameworksUsed < 2 && metrics.sessionsCompleted > 1) {
      recommendations.push({
        type: 'explore',
        category: 'framework',
        title: 'Try Different Frameworks',
        description: 'Explore variety for different perspectives',
        specific_action: 'Use a different framework in your next session',
        priority: 'low',
        estimated_benefit: 'Broader thinking and new insights'
      });
    }
    
    // Depth recommendations
    if (metrics.averageDepth < 40) {
      recommendations.push({
        type: 'adjust',
        category: 'depth',
        title: 'Deepen Analysis',
        description: 'Push for more thorough exploration',
        specific_action: 'Spend more time on each question and challenge assumptions',
        priority: 'high',
        estimated_benefit: 'More meaningful and lasting insights'
      });
    }
    
    // Consistency recommendations
    if (metrics.sessionsCompleted === 1) {
      recommendations.push({
        type: 'continue',
        category: 'consistency',
        title: 'Build Learning Rhythm',
        description: 'Regular practice builds momentum',
        specific_action: 'Schedule another session later today or tomorrow',
        priority: 'medium',
        estimated_benefit: 'Improved retention and skill development'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Assess daily mood
   */
  private assessDailyMood(dayData: any, metrics: DailySummaryMetrics): SummaryMood {
    const sessions = dayData.sessions || [];
    let mood: SummaryMood['overall'] = 'neutral';
    let confidence = 5;
    let engagement = 5;
    let challenge_level: SummaryMood['challenge_level'] = 'just_right';
    const indicators: string[] = [];
    
    // Assess based on completion rates
    if (metrics.completionRate > 0.8) {
      mood = 'satisfied';
      confidence += 2;
      indicators.push('High completion rate');
    } else if (metrics.completionRate < 0.4) {
      mood = 'frustrated';
      confidence -= 1;
      challenge_level = 'too_hard';
      indicators.push('Low completion rate');
    }
    
    // Assess based on insight depth
    if (metrics.averageDepth > 60) {
      mood = 'energized';
      engagement += 2;
      indicators.push('Deep insights created');
    } else if (metrics.averageDepth < 30) {
      engagement -= 1;
      challenge_level = 'too_easy';
      indicators.push('Shallow exploration');
    }
    
    // Assess based on time spent
    if (metrics.totalTimeMinutes > 60) {
      if (mood === 'neutral') mood = 'satisfied';
      engagement += 1;
      indicators.push('Extended learning time');
    } else if (metrics.totalTimeMinutes < 10) {
      confidence -= 1;
      indicators.push('Brief learning time');
    }
    
    // Normalize scores
    confidence = Math.max(1, Math.min(10, confidence));
    engagement = Math.max(1, Math.min(10, engagement));
    
    return {
      overall: mood,
      confidence,
      engagement,
      challenge_level,
      indicators
    };
  }
  
  /**
   * Format hour for display
   */
  private formatHour(hour: number): string {
    const roundedHour = Math.round(hour);
    if (roundedHour === 0) return 'midnight';
    if (roundedHour === 12) return 'noon';
    if (roundedHour < 12) return `${roundedHour}am`;
    return `${roundedHour - 12}pm`;
  }
  
  /**
   * Get summary by ID
   */
  getSummary(summaryId: string): DailySummary | undefined {
    return this.summaries.get(summaryId);
  }
  
  /**
   * Get summaries for user
   */
  getUserSummaries(userId: string, limit?: number): DailySummary[] {
    const userSummaries = Array.from(this.summaries.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return limit ? userSummaries.slice(0, limit) : userSummaries;
  }
  
  /**
   * Export summaries
   */
  async exportSummaries(userId: string, format: 'json' | 'csv'): Promise<any> {
    const summaries = this.getUserSummaries(userId);
    
    if (format === 'json') {
      return JSON.stringify(summaries, null, 2);
    }
    
    // CSV format (simplified)
    const headers = ['Date', 'Sessions', 'Time (min)', 'Insights', 'Avg Depth', 'Mood', 'Key Activity'];
    const rows = summaries.map(s => [
      s.date.toISOString().split('T')[0],
      s.metrics.sessionsCompleted,
      s.metrics.totalTimeMinutes,
      s.metrics.insightsCreated,
      s.metrics.averageDepth,
      s.mood.overall,
      s.summary.keyActivities[0] || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}