/**
 * Publisher Agent
 * Multi-platform content adaptation and publishing
 */

import { EventEmitter } from 'events';
import { BaseAgent } from '../base-agent';
import { AgentState, AgentCapability, AgentRequest, AgentResponse } from '../types';
import { 
  ContentDocument,
  PlatformDocument,
  PlatformMetadata,
  DocumentStage,
  createPlatformDocument 
} from '../../shared/pipeline/document-schema';
import { Platform } from '../../shared/config/config-schema';
import { createLogger } from '../../shared/utils/logger';

// Import platform adapters
import { XiaohongshuAdapter } from './adapters/xiaohongshu-adapter';
import { ZhihuAdapter } from './adapters/zhihu-adapter';
import { WechatAdapter } from './adapters/wechat-adapter';
import { LinkedInAdapter } from './adapters/linkedin-adapter';

const logger = createLogger('PublisherAgent');

/**
 * Publishing options
 */
export interface PublishOptions {
  platforms: Platform[];
  schedule?: PublishSchedule;
  optimize?: boolean;
  generateVisuals?: boolean;
}

/**
 * Publishing schedule
 */
export interface PublishSchedule {
  immediate?: boolean;
  scheduledTime?: Date;
  optimalTime?: boolean;
  timezone?: string;
}

/**
 * Platform content
 */
export interface PlatformContent {
  platform: Platform;
  title: string;
  body: string;
  hashtags: string[];
  keywords: string[];
  visualSuggestions: VisualRecommendation[];
  metadata: {
    length: number;
    readingTime: number;
    optimizationScore: number;
  };
}

/**
 * Visual recommendation
 */
export interface VisualRecommendation {
  type: 'cover' | 'inline' | 'infographic' | 'thumbnail';
  description: string;
  style: string;
  elements: string[];
}

/**
 * Publishing result
 */
export interface PublishResult {
  platform: Platform;
  success: boolean;
  content: PlatformContent;
  publishedUrl?: string;
  error?: string;
  metrics?: {
    optimizationScore: number;
    expectedReach: number;
    bestTime?: string;
  };
}

/**
 * Scheduled post
 */
export interface ScheduledPost {
  id: string;
  content: ContentDocument;
  platforms: Platform[];
  scheduledTime: Date;
  status: 'pending' | 'publishing' | 'published' | 'failed';
}

/**
 * Platform adapter interface
 */
export interface PlatformAdapter {
  platform: Platform;
  adapt(content: ContentDocument): Promise<PlatformContent>;
  optimize(content: PlatformContent): Promise<PlatformContent>;
  generateHashtags(content: string): string[];
  suggestVisuals(content: string): VisualRecommendation[];
  getOptimalTime(): string;
}

/**
 * Publisher Agent Implementation
 */
export class PublisherAgent extends BaseAgent {
  public readonly id = 'publisher';
  public readonly name = 'Publisher Agent';
  public readonly version = '2.0.0';
  
  private adapters: Map<Platform, PlatformAdapter> = new Map();
  private publishQueue: ScheduledPost[] = [];
  private publishingStats = {
    totalPublished: 0,
    platformDistribution: {} as Record<Platform, number>,
    averageOptimizationScore: 0,
    failureRate: 0,
  };

  constructor() {
    super();
    this.initializeAdapters();
    this.startQueueProcessor();
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): AgentCapability[] {
    return [
      {
        id: 'multi-platform-publishing',
        name: 'Multi-Platform Publishing',
        description: 'Adapt and publish to multiple platforms',
        inputTypes: ['content'],
        outputTypes: ['platform-content'],
      },
      {
        id: 'content-optimization',
        name: 'Content Optimization',
        description: 'Optimize content for each platform',
        inputTypes: ['content'],
        outputTypes: ['optimized-content'],
      },
      {
        id: 'schedule-management',
        name: 'Schedule Management',
        description: 'Schedule posts for optimal times',
        inputTypes: ['schedule'],
        outputTypes: ['scheduled-posts'],
      },
    ];
  }

  /**
   * Initialize platform adapters
   */
  private initializeAdapters(): void {
    this.adapters.set('xiaohongshu', new XiaohongshuAdapter());
    this.adapters.set('zhihu', new ZhihuAdapter());
    this.adapters.set('wechat', new WechatAdapter());
    this.adapters.set('linkedin', new LinkedInAdapter());
  }

  /**
   * Main publishing method
   */
  async publish(
    content: ContentDocument,
    options: PublishOptions
  ): Promise<PublishResult[]> {
    const startTime = Date.now();
    
    try {
      logger.info(`Publishing to ${options.platforms.length} platforms`);

      const results: PublishResult[] = [];

      for (const platform of options.platforms) {
        try {
          // Adapt content for platform
          const platformContent = await this.adaptForPlatform(content, platform);

          // Optimize if requested
          if (options.optimize) {
            await this.optimizeContent(platformContent);
          }

          // Generate visuals if requested
          if (options.generateVisuals) {
            platformContent.visualSuggestions = await this.generateVisualSuggestions(
              platformContent.body,
              platform
            );
          }

          // Schedule or publish immediately
          if (options.schedule && !options.schedule.immediate) {
            await this.schedulePost(content, platform, options.schedule);
            results.push({
              platform,
              success: true,
              content: platformContent,
              metrics: {
                optimizationScore: platformContent.metadata.optimizationScore,
                expectedReach: this.calculateExpectedReach(platform),
                bestTime: this.getOptimalTime(platform),
              },
            });
          } else {
            // Publish immediately
            const publishedDoc = await this.publishToPlatform(platformContent, platform);
            results.push({
              platform,
              success: true,
              content: platformContent,
              publishedUrl: publishedDoc.metadata.publishedUrl,
              metrics: {
                optimizationScore: platformContent.metadata.optimizationScore,
                expectedReach: this.calculateExpectedReach(platform),
              },
            });
          }

          // Update statistics
          this.updateStats(platform, true, platformContent.metadata.optimizationScore);
        } catch (error: any) {
          logger.error(`Failed to publish to ${platform}:`, error);
          results.push({
            platform,
            success: false,
            content: {} as PlatformContent,
            error: error.message,
          });
          this.updateStats(platform, false, 0);
        }
      }

      logger.info(`Publishing completed in ${Date.now() - startTime}ms`);
      return results;
    } catch (error) {
      logger.error('Publishing failed:', error);
      throw error;
    }
  }

  /**
   * Adapt content for specific platform
   */
  async adaptForPlatform(
    content: ContentDocument,
    platform: Platform
  ): Promise<PlatformContent> {
    const adapter = this.adapters.get(platform);
    
    if (!adapter) {
      throw new Error(`No adapter available for platform: ${platform}`);
    }

    logger.debug(`Adapting content for ${platform}`);
    return adapter.adapt(content);
  }

  /**
   * Optimize content for platform
   */
  private async optimizeContent(content: PlatformContent): Promise<void> {
    const adapter = this.adapters.get(content.platform);
    
    if (adapter) {
      const optimized = await adapter.optimize(content);
      Object.assign(content, optimized);
    }
  }

  /**
   * Generate hashtags for content
   */
  optimizeHashtags(content: string, platform: Platform): string[] {
    const adapter = this.adapters.get(platform);
    
    if (!adapter) {
      return this.generateDefaultHashtags(content);
    }

    return adapter.generateHashtags(content);
  }

  /**
   * Optimize content length
   */
  optimizeLength(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }

    // Smart truncation - try to end at sentence boundary
    const truncated = content.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('') || truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    // Fallback to word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate visual suggestions
   */
  private async generateVisualSuggestions(
    content: string,
    platform: Platform
  ): Promise<VisualRecommendation[]> {
    const adapter = this.adapters.get(platform);
    
    if (!adapter) {
      return this.generateDefaultVisuals(content);
    }

    return adapter.suggestVisuals(content);
  }

  /**
   * Schedule a post
   */
  async schedule(
    content: ContentDocument,
    schedule: PublishSchedule,
    platforms: Platform[]
  ): Promise<void> {
    for (const platform of platforms) {
      await this.schedulePost(content, platform, schedule);
    }
  }

  /**
   * Schedule post for single platform
   */
  private async schedulePost(
    content: ContentDocument,
    platform: Platform,
    schedule: PublishSchedule
  ): Promise<void> {
    const scheduledTime = schedule.optimalTime
      ? this.calculateOptimalTime(platform)
      : schedule.scheduledTime || new Date();

    const post: ScheduledPost = {
      id: this.generatePostId(),
      content,
      platforms: [platform],
      scheduledTime,
      status: 'pending',
    };

    this.publishQueue.push(post);
    logger.info(`Post scheduled for ${platform} at ${scheduledTime}`);
  }

  /**
   * Get publishing queue
   */
  getQueue(): ScheduledPost[] {
    return [...this.publishQueue];
  }

  /**
   * Publish to platform (simulated)
   */
  private async publishToPlatform(
    content: PlatformContent,
    platform: Platform
  ): Promise<PlatformDocument> {
    // In production, this would call actual platform APIs
    logger.info(`Publishing to ${platform}...`);

    const doc = createPlatformDocument(
      'content-id',
      platform,
      ['optimized', 'scheduled'],
      this.formatPlatformContent(content),
      'Publisher Agent'
    );

    doc.title = content.title;
    doc.body = content.body;
    doc.hashtags = content.hashtags;
    doc.metadata.publishedUrl = `https://${platform}.com/post/${Date.now()}`;

    return doc;
  }

  /**
   * Format platform content as string
   */
  private formatPlatformContent(content: PlatformContent): string {
    const sections: string[] = [];
    
    sections.push(content.title);
    sections.push('');
    sections.push(content.body);
    
    if (content.hashtags.length > 0) {
      sections.push('');
      sections.push(content.hashtags.map(h => `#${h}`).join(' '));
    }

    return sections.join('\n');
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue();
    }, 60000); // Check every minute
  }

  /**
   * Process publishing queue
   */
  private async processQueue(): Promise<void> {
    const now = new Date();
    const pending = this.publishQueue.filter(
      post => post.status === 'pending' && post.scheduledTime <= now
    );

    for (const post of pending) {
      post.status = 'publishing';
      
      try {
        for (const platform of post.platforms) {
          const platformContent = await this.adaptForPlatform(post.content, platform);
          await this.publishToPlatform(platformContent, platform);
        }
        
        post.status = 'published';
        logger.info(`Published scheduled post ${post.id}`);
      } catch (error) {
        post.status = 'failed';
        logger.error(`Failed to publish scheduled post ${post.id}:`, error);
      }
    }

    // Clean up old posts
    this.publishQueue = this.publishQueue.filter(
      post => post.status === 'pending' || 
              (post.status === 'published' && 
               post.scheduledTime > new Date(Date.now() - 86400000)) // Keep for 24h
    );
  }

  /**
   * Calculate optimal publishing time
   */
  private calculateOptimalTime(platform: Platform): Date {
    const adapter = this.adapters.get(platform);
    const optimalTime = adapter?.getOptimalTime() || '09:00';
    
    const [hours, minutes] = optimalTime.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime < new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime;
  }

  /**
   * Get optimal time for platform
   */
  private getOptimalTime(platform: Platform): string {
    const adapter = this.adapters.get(platform);
    return adapter?.getOptimalTime() || '09:00';
  }

  /**
   * Calculate expected reach
   */
  private calculateExpectedReach(platform: Platform): number {
    // Simplified calculation based on platform
    const baseReach: Record<Platform, number> = {
      xiaohongshu: 5000,
      zhihu: 10000,
      wechat: 3000,
      linkedin: 2000,
    };

    return baseReach[platform] || 1000;
  }

  /**
   * Generate default hashtags
   */
  private generateDefaultHashtags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const keywords = words
      .filter(w => w.length > 5)
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 0);

    // Get unique keywords
    const unique = [...new Set(keywords)];
    return unique.slice(0, 5);
  }

  /**
   * Generate default visual suggestions
   */
  private generateDefaultVisuals(content: string): VisualRecommendation[] {
    return [
      {
        type: 'cover',
        description: 'Eye-catching header image',
        style: 'modern',
        elements: ['title', 'subtitle', 'brand'],
      },
    ];
  }

  /**
   * Generate post ID
   */
  private generatePostId(): string {
    return `post-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Update statistics
   */
  private updateStats(platform: Platform, success: boolean, score: number): void {
    this.publishingStats.totalPublished++;
    this.publishingStats.platformDistribution[platform] = 
      (this.publishingStats.platformDistribution[platform] || 0) + 1;

    if (!success) {
      this.publishingStats.failureRate = 
        (this.publishingStats.failureRate * (this.publishingStats.totalPublished - 1) + 1) / 
        this.publishingStats.totalPublished;
    } else {
      this.publishingStats.failureRate = 
        (this.publishingStats.failureRate * (this.publishingStats.totalPublished - 1)) / 
        this.publishingStats.totalPublished;
    }

    if (score > 0) {
      const n = this.publishingStats.totalPublished;
      this.publishingStats.averageOptimizationScore = 
        (this.publishingStats.averageOptimizationScore * (n - 1) + score) / n;
    }
  }

  /**
   * Process agent request
   */
  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      const content = request.data.content as ContentDocument;
      const options = request.data.options as PublishOptions;

      const results = await this.publish(content, options);

      return {
        success: true,
        data: results,
        metadata: {
          processingTime: Date.now() - request.timestamp.getTime(),
          agent: this.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        metadata: {
          agent: this.id,
        },
      };
    }
  }

  /**
   * Agent lifecycle methods
   */
  protected async onInitialize(): Promise<void> {
    logger.info('Publisher Agent initializing...');
  }

  protected async onStart(): Promise<void> {
    logger.info('Publisher Agent started');
  }

  protected async onStop(): Promise<void> {
    logger.info('Publisher Agent stopping...');
    // Save queue state
  }

  protected async onShutdown(): Promise<void> {
    logger.info('Publisher Agent shutting down...');
    this.adapters.clear();
    this.publishQueue = [];
  }
}

// Export singleton instance
export const publisherAgent = new PublisherAgent();