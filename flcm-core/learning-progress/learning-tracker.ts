/**
 * Learning Progress Tracker
 * Main orchestrator for tracking learning progress and generating insights
 */

import {
  LearningSession,
  LearningMetrics,
  Dashboard,
  Report,
  DateRange,
  Milestone,
  Achievement
} from './types';
import { MetricsCollector } from './metrics-collector';
import { ProgressAnalyzer } from './progress-analyzer';
import { ReportGenerator } from './report-generator';
import { MilestoneManager } from './milestone-manager';
import { Logger } from '../shared/utils/logger';
import { EventEmitter } from 'events';

export class LearningProgressTracker extends EventEmitter {
  private metricsCollector: MetricsCollector;
  private progressAnalyzer: ProgressAnalyzer;
  private reportGenerator: ReportGenerator;
  private milestoneManager: MilestoneManager;
  private logger: Logger;
  
  constructor() {
    super();
    this.metricsCollector = new MetricsCollector();
    this.progressAnalyzer = new ProgressAnalyzer();
    this.reportGenerator = new ReportGenerator();
    this.milestoneManager = new MilestoneManager();
    this.logger = new Logger('LearningProgressTracker');
  }
  
  /**
   * Track a learning session
   */
  async trackSession(session: LearningSession): Promise<void> {
    try {
      this.logger.info(`Tracking session: ${session.id} (${session.framework})`);
      
      // Collect metrics from session
      await this.metricsCollector.collectFromSession(session);
      
      // Analyze progress
      const progress = await this.progressAnalyzer.analyzeSession(session);
      
      // Check for milestones
      const newMilestones = await this.milestoneManager.checkMilestones(
        session.userId,
        session
      );
      
      // Emit events for new achievements
      for (const milestone of newMilestones) {
        this.emit('milestone-achieved', milestone);
      }
      
      // Check for achievements
      const newAchievements = await this.checkAchievements(session.userId, progress);
      for (const achievement of newAchievements) {
        this.emit('achievement-unlocked', achievement);
      }
      
      this.logger.debug(`Session tracked successfully: ${progress.improvement}% improvement`);
      
    } catch (error) {
      this.logger.error('Failed to track session:', error);
      throw error;
    }
  }
  
  /**
   * Generate learning dashboard
   */
  async generateDashboard(userId: string, timeRange?: DateRange): Promise<Dashboard> {
    try {
      const range = timeRange || this.getDefaultTimeRange();
      this.logger.info(`Generating dashboard for user ${userId}`);
      
      // Get metrics for time range
      const metrics = await this.metricsCollector.getMetrics(userId, range);
      
      // Analyze current progress
      const analysis = await this.progressAnalyzer.analyzePeriod(userId, range);
      
      // Get achievements and milestones
      const achievements = await this.getRecentAchievements(userId, range);
      const activeMilestones = await this.milestoneManager.getActiveMilestones(userId);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(userId, analysis);
      
      const dashboard: Dashboard = {
        summary: {
          totalSessions: metrics.sessions.length,
          totalTime: metrics.totalTime,
          averageSessionLength: metrics.totalTime / metrics.sessions.length,
          insightsCreated: metrics.totalInsights,
          frameworksUsed: metrics.uniqueFrameworks.size,
          currentStreak: analysis.currentStreak,
          overallProgress: analysis.overallProgress
        },
        frameworkStats: analysis.frameworkStats,
        progressionChart: this.buildProgressionChart(analysis.insightProgression),
        velocityGauge: this.buildVelocityGauge(analysis.velocity),
        qualityTrend: this.buildQualityTrendChart(analysis.contentQuality),
        achievements,
        recommendations
      };
      
      return dashboard;
      
    } catch (error) {
      this.logger.error('Failed to generate dashboard:', error);
      throw error;
    }
  }
  
  /**
   * Generate progress report
   */
  async generateReport(
    userId: string,
    type: 'weekly' | 'monthly' | 'custom',
    timeRange?: DateRange
  ): Promise<Report> {
    try {
      const range = timeRange || this.getReportTimeRange(type);
      this.logger.info(`Generating ${type} report for user ${userId}`);
      
      return await this.reportGenerator.generateReport(userId, type, range);
      
    } catch (error) {
      this.logger.error('Failed to generate report:', error);
      throw error;
    }
  }
  
  /**
   * Get learning metrics for period
   */
  async getMetrics(userId: string, timeRange: DateRange): Promise<LearningMetrics> {
    try {
      const metrics = await this.metricsCollector.getMetrics(userId, timeRange);
      const analysis = await this.progressAnalyzer.analyzePeriod(userId, timeRange);
      const milestones = await this.milestoneManager.getMilestonesForPeriod(userId, timeRange);
      
      return {
        userId,
        timeRange,
        frameworks: analysis.frameworkStats,
        insights: analysis.insightProgression,
        content: analysis.contentQuality,
        velocity: analysis.velocity,
        milestones
      };
      
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      throw error;
    }
  }
  
  /**
   * Set learning goals
   */
  async setGoals(userId: string, goals: any[]): Promise<void> {
    try {
      await this.milestoneManager.setGoals(userId, goals);
      this.logger.info(`Set ${goals.length} goals for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to set goals:', error);
      throw error;
    }
  }
  
  /**
   * Get learning insights and patterns
   */
  async getInsights(userId: string): Promise<any[]> {
    try {
      return await this.progressAnalyzer.generateInsights(userId);
    } catch (error) {
      this.logger.error('Failed to get insights:', error);
      throw error;
    }
  }
  
  /**
   * Export learning data
   */
  async exportData(
    userId: string,
    format: 'csv' | 'json' | 'xlsx',
    timeRange?: DateRange
  ): Promise<any> {
    try {
      const range = timeRange || this.getAllTimeRange();
      return await this.metricsCollector.exportData(userId, format, range);
    } catch (error) {
      this.logger.error('Failed to export data:', error);
      throw error;
    }
  }
  
  /**
   * Build progression chart data
   */
  private buildProgressionChart(progression: any): any {
    return {
      type: 'line',
      data: progression.timeline.map(point => ({
        x: point.timestamp,
        y: point.depth,
        label: `Level ${point.level.level}: ${point.level.name}`
      })),
      labels: [],
      title: 'Insight Depth Progression',
      xAxis: 'Time',
      yAxis: 'Depth Score'
    };
  }
  
  /**
   * Build velocity gauge data
   */
  private buildVelocityGauge(velocity: any): any {
    return {
      current: velocity.current.insightsPerHour,
      min: 0,
      max: 5,
      target: 2,
      unit: 'insights/hour',
      label: 'Learning Velocity'
    };
  }
  
  /**
   * Build quality trend chart
   */
  private buildQualityTrendChart(contentQuality: any): any {
    return {
      type: 'area',
      data: contentQuality.trend.data || [],
      labels: [],
      title: 'Content Quality Trend',
      xAxis: 'Time',
      yAxis: 'Quality Score'
    };
  }
  
  /**
   * Check for new achievements
   */
  private async checkAchievements(userId: string, progress: any): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    
    // Check various achievement conditions
    if (progress.streakDays >= 7) {
      achievements.push({
        id: 'week-streak',
        name: 'Week Warrior',
        description: 'Maintained learning streak for 7 days',
        icon: '🔥',
        date: new Date(),
        category: 'consistency',
        rarity: 'uncommon'
      });
    }
    
    if (progress.totalInsights >= 100) {
      achievements.push({
        id: 'century',
        name: 'Century Club',
        description: 'Created 100 insights',
        icon: '💯',
        date: new Date(),
        category: 'quantity',
        rarity: 'rare'
      });
    }
    
    return achievements;
  }
  
  /**
   * Generate personalized recommendations
   */
  private async generateRecommendations(userId: string, analysis: any): Promise<any[]> {
    const recommendations = [];
    
    // Framework diversity recommendation
    if (analysis.frameworkStats.length < 3) {
      recommendations.push({
        type: 'framework',
        title: 'Explore New Frameworks',
        description: 'Try using different learning frameworks to gain diverse perspectives',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 7
      });
    }
    
    // Consistency recommendation
    if (analysis.sessionGaps > 3) {
      recommendations.push({
        type: 'timing',
        title: 'Improve Consistency',
        description: 'Consider shorter, more frequent sessions for better retention',
        priority: 'high',
        actionable: true,
        estimatedImpact: 8
      });
    }
    
    // Depth improvement
    if (analysis.averageInsightDepth < 50) {
      recommendations.push({
        type: 'focus',
        title: 'Deepen Your Analysis',
        description: 'Use Socratic questioning to explore insights more thoroughly',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 9
      });
    }
    
    return recommendations;
  }
  
  /**
   * Get recent achievements
   */
  private async getRecentAchievements(userId: string, timeRange: DateRange): Promise<Achievement[]> {
    // This would query a database for achievements in the time range
    return [];
  }
  
  /**
   * Get default time range (last 30 days)
   */
  private getDefaultTimeRange(): DateRange {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }
  
  /**
   * Get report time range based on type
   */
  private getReportTimeRange(type: 'weekly' | 'monthly'): DateRange {
    const end = new Date();
    let start: Date;
    
    if (type === 'weekly') {
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { start, end };
  }
  
  /**
   * Get all-time range
   */
  private getAllTimeRange(): DateRange {
    return {
      start: new Date('2020-01-01'),
      end: new Date()
    };
  }
  
  /**
   * Get tracker status
   */
  getStatus(): any {
    return {
      active: true,
      componentsLoaded: {
        metricsCollector: !!this.metricsCollector,
        progressAnalyzer: !!this.progressAnalyzer,
        reportGenerator: !!this.reportGenerator,
        milestoneManager: !!this.milestoneManager
      }
    };
  }
}