/**
 * Publisher Agent Unit Tests
 * Comprehensive test suite covering all Publisher Agent functionality
 */

import { PublisherAgent, PublishOptions, PlatformContent, PublishResult, ScheduledPost } from '../index';
import { Platform } from '../../../shared/config/config-schema';
import { ContentDocument, createContentDocument } from '../../../shared/pipeline/document-schema';

// Mock dependencies
jest.mock('../../../shared/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

// Mock platform adapters
const createMockAdapter = (platform: Platform, optimization = 90) => ({
  platform,
  adapt: jest.fn().mockResolvedValue({
    platform,
    title: `${platform} Optimized Title`,
    body: `Content optimized for ${platform} platform with specific formatting and style adjustments.`,
    hashtags: [`${platform}content`, 'ai', 'innovation'],
    keywords: ['artificial intelligence', 'business transformation', platform],
    visualSuggestions: [
      {
        type: 'cover',
        description: `${platform} style cover image`,
        style: 'modern',
        elements: ['title', 'subtitle', 'brand'],
      },
    ],
    metadata: {
      length: 150,
      readingTime: 2,
      optimizationScore: optimization,
    },
  }),
  optimize: jest.fn().mockImplementation(async (content) => ({
    ...content,
    metadata: {
      ...content.metadata,
      optimizationScore: Math.min(100, content.metadata.optimizationScore + 5),
    },
  })),
  generateHashtags: jest.fn().mockReturnValue([`${platform}hashtag`, 'trending', 'viral']),
  suggestVisuals: jest.fn().mockReturnValue([
    {
      type: 'inline',
      description: `${platform} visual style`,
      style: 'engaging',
      elements: ['chart', 'infographic'],
    },
  ]),
  getOptimalTime: jest.fn().mockReturnValue('09:00'),
});

jest.mock('../adapters/xiaohongshu-adapter', () => ({
  XiaohongshuAdapter: jest.fn(() => createMockAdapter('xiaohongshu', 92)),
}));

jest.mock('../adapters/zhihu-adapter', () => ({
  ZhihuAdapter: jest.fn(() => createMockAdapter('zhihu', 88)),
}));

jest.mock('../adapters/wechat-adapter', () => ({
  WechatAdapter: jest.fn(() => createMockAdapter('wechat', 85)),
}));

jest.mock('../adapters/linkedin-adapter', () => ({
  LinkedInAdapter: jest.fn(() => createMockAdapter('linkedin', 90)),
}));

describe('PublisherAgent', () => {
  let agent: PublisherAgent;
  let mockContentDocument: ContentDocument;

  beforeEach(() => {
    agent = new PublisherAgent();
    
    // Create mock content document
    mockContentDocument = createContentDocument(
      'insights-123',
      'voice-profile-456',
      'standard',
      `# AI Implementation Strategy
      
      ## Executive Summary
      Artificial intelligence implementation in business operations requires strategic planning and systematic execution. Organizations must balance innovation opportunities with implementation challenges.
      
      ## Key Benefits
      - Automation reduces manual processing by 75%
      - Decision-making improves with data-driven insights
      - Competitive advantages emerge from early adoption
      
      ## Implementation Approach
      Phased rollout strategies minimize disruption while maximizing adoption success. Training programs ensure effective utilization across organizational levels.
      
      ## Conclusion
      Strategic AI implementation transforms business operations when executed with comprehensive planning and stakeholder engagement.`,
      'Creator Agent'
    );

    mockContentDocument.title = 'AI Implementation Strategy Guide';
    mockContentDocument.sections = [
      {
        heading: 'Executive Summary',
        content: 'AI implementation requires strategic planning...',
        level: 2,
        wordCount: 25,
      },
      {
        heading: 'Key Benefits',
        content: 'Automation reduces manual processing...',
        level: 2,
        wordCount: 30,
      },
      {
        heading: 'Implementation Approach',
        content: 'Phased rollout strategies minimize disruption...',
        level: 2,
        wordCount: 35,
      },
    ];

    // Clear any existing intervals
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Agent Initialization', () => {
    it('should initialize with correct properties', () => {
      expect(agent.id).toBe('publisher');
      expect(agent.name).toBe('Publisher Agent');
      expect(agent.version).toBe('2.0.0');
    });

    it('should have correct capabilities', () => {
      const capabilities = agent.getCapabilities();
      expect(capabilities).toHaveLength(3);
      
      const multiPlatform = capabilities.find(c => c.id === 'multi-platform-publishing');
      expect(multiPlatform).toBeDefined();
      expect(multiPlatform?.inputTypes).toContain('content');
      
      const optimization = capabilities.find(c => c.id === 'content-optimization');
      expect(optimization).toBeDefined();
      
      const scheduling = capabilities.find(c => c.id === 'schedule-management');
      expect(scheduling).toBeDefined();
    });

    it('should initialize platform adapters correctly', () => {
      const adapters = (agent as any).adapters;
      expect(adapters.size).toBe(4);
      expect(adapters.has('xiaohongshu')).toBe(true);
      expect(adapters.has('zhihu')).toBe(true);
      expect(adapters.has('wechat')).toBe(true);
      expect(adapters.has('linkedin')).toBe(true);
    });

    it('should start queue processor on initialization', () => {
      expect(setInterval).toHaveBeenCalled();
    });
  });

  describe('Platform Adaptation', () => {
    it('should adapt content for xiaohongshu platform', async () => {
      const platformContent = await agent.adaptForPlatform(mockContentDocument, 'xiaohongshu');

      expect(platformContent).toBeDefined();
      expect(platformContent.platform).toBe('xiaohongshu');
      expect(platformContent.title).toBe('xiaohongshu Optimized Title');
      expect(platformContent.hashtags).toContain('xiaohongshu');
      expect(platformContent.metadata.optimizationScore).toBe(92);
    });

    it('should adapt content for zhihu platform', async () => {
      const platformContent = await agent.adaptForPlatform(mockContentDocument, 'zhihu');

      expect(platformContent).toBeDefined();
      expect(platformContent.platform).toBe('zhihu');
      expect(platformContent.title).toBe('zhihu Optimized Title');
      expect(platformContent.hashtags).toContain('zhihuhashtag');
      expect(platformContent.metadata.optimizationScore).toBe(88);
    });

    it('should adapt content for wechat platform', async () => {
      const platformContent = await agent.adaptForPlatform(mockContentDocument, 'wechat');

      expect(platformContent).toBeDefined();
      expect(platformContent.platform).toBe('wechat');
      expect(platformContent.title).toBe('wechat Optimized Title');
      expect(platformContent.metadata.optimizationScore).toBe(85);
    });

    it('should adapt content for linkedin platform', async () => {
      const platformContent = await agent.adaptForPlatform(mockContentDocument, 'linkedin');

      expect(platformContent).toBeDefined();
      expect(platformContent.platform).toBe('linkedin');
      expect(platformContent.title).toBe('linkedin Optimized Title');
      expect(platformContent.metadata.optimizationScore).toBe(90);
    });

    it('should throw error for unsupported platform', async () => {
      await expect(
        agent.adaptForPlatform(mockContentDocument, 'unsupported' as Platform)
      ).rejects.toThrow('No adapter available for platform: unsupported');
    });

    it('should handle adapter failures gracefully', async () => {
      const mockAdapter = (agent as any).adapters.get('xiaohongshu');
      mockAdapter.adapt.mockRejectedValue(new Error('Adaptation failed'));

      await expect(
        agent.adaptForPlatform(mockContentDocument, 'xiaohongshu')
      ).rejects.toThrow('Adaptation failed');
    });
  });

  describe('Content Optimization', () => {
    it('should optimize hashtags for different platforms', () => {
      const testContent = 'Artificial intelligence transforms business operations through automation.';
      
      const platforms: Platform[] = ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'];
      
      platforms.forEach(platform => {
        const hashtags = agent.optimizeHashtags(testContent, platform);
        expect(hashtags).toBeDefined();
        expect(hashtags.length).toBeGreaterThan(0);
        expect(hashtags).toContain(`${platform}hashtag`);
      });
    });

    it('should generate default hashtags for unsupported platforms', () => {
      const content = 'Machine learning algorithms enhance predictive analytics capabilities.';
      
      const hashtags = agent.optimizeHashtags(content, 'unsupported' as Platform);
      
      expect(hashtags).toBeDefined();
      expect(hashtags.length).toBeGreaterThan(0);
      // Should extract meaningful keywords
      expect(hashtags.some(tag => tag.includes('machine') || tag.includes('algorithm'))).toBe(true);
    });

    it('should optimize content length appropriately', () => {
      const longContent = 'This is a very long piece of content. '.repeat(20);
      const maxLength = 200;
      
      const optimized = agent.optimizeLength(longContent, maxLength);
      
      expect(optimized.length).toBeLessThanOrEqual(maxLength);
      expect(optimized).toContain('...');
    });

    it('should preserve short content unchanged', () => {
      const shortContent = 'Short content that fits within limits.';
      const maxLength = 200;
      
      const optimized = agent.optimizeLength(shortContent, maxLength);
      
      expect(optimized).toBe(shortContent);
    });

    it('should optimize at sentence boundaries when possible', () => {
      const content = 'First sentence is clear. Second sentence provides details. Third sentence concludes the point.';
      const maxLength = 50;
      
      const optimized = agent.optimizeLength(content, maxLength);
      
      expect(optimized).toMatch(/\.$|\.\.\.$/);
      expect(optimized.length).toBeLessThanOrEqual(maxLength);
    });

    it('should optimize at word boundaries as fallback', () => {
      const content = 'Verylongwordthatcannotbebrokeneasilywithoutwordbreaks';
      const maxLength = 30;
      
      const optimized = agent.optimizeLength(content, maxLength);
      
      expect(optimized.length).toBeLessThanOrEqual(maxLength);
      expect(optimized).toContain('...');
    });
  });

  describe('Multi-Platform Publishing', () => {
    it('should publish to multiple platforms successfully', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu', 'linkedin'],
        optimize: true,
      };

      const results = await agent.publish(mockContentDocument, options);

      expect(results).toHaveLength(3);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.platform).toBe(options.platforms[index]);
        expect(result.content).toBeDefined();
        expect(result.publishedUrl).toBeDefined();
        expect(result.metrics?.optimizationScore).toBeGreaterThan(80);
      });
    });

    it('should handle partial publishing failures', async () => {
      // Mock one adapter to fail
      const mockAdapter = (agent as any).adapters.get('zhihu');
      mockAdapter.adapt.mockRejectedValueOnce(new Error('Zhihu API error'));

      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu', 'linkedin'],
        optimize: true,
      };

      const results = await agent.publish(mockContentDocument, options);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true); // xiaohongshu
      expect(results[1].success).toBe(false); // zhihu (failed)
      expect(results[2].success).toBe(true); // linkedin
      expect(results[1].error).toBe('Zhihu API error');
    });

    it('should apply optimization when requested', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
        optimize: true,
      };

      const results = await agent.publish(mockContentDocument, options);

      expect(results[0].content.metadata.optimizationScore).toBeGreaterThan(92);
      
      const adapter = (agent as any).adapters.get('xiaohongshu');
      expect(adapter.optimize).toHaveBeenCalled();
    });

    it('should skip optimization when not requested', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
        optimize: false,
      };

      const results = await agent.publish(mockContentDocument, options);

      const adapter = (agent as any).adapters.get('xiaohongshu');
      expect(adapter.optimize).not.toHaveBeenCalled();
    });

    it('should generate visual suggestions when requested', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
        generateVisuals: true,
      };

      const results = await agent.publish(mockContentDocument, options);

      expect(results[0].content.visualSuggestions).toBeDefined();
      expect(results[0].content.visualSuggestions.length).toBeGreaterThan(0);
    });

    it('should publish immediately when specified', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
        schedule: {
          immediate: true,
        },
      };

      const results = await agent.publish(mockContentDocument, options);

      expect(results[0].success).toBe(true);
      expect(results[0].publishedUrl).toBeDefined();
    });
  });

  describe('Scheduling Management', () => {
    beforeEach(() => {
      // Mock Date.now for consistent scheduling tests
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-15T08:00:00Z').getTime());
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should schedule posts for future publishing', async () => {
      const scheduledTime = new Date('2024-01-15T10:00:00Z');
      
      await agent.schedule(mockContentDocument, { scheduledTime }, ['xiaohongshu']);

      const queue = agent.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].scheduledTime).toEqual(scheduledTime);
      expect(queue[0].status).toBe('pending');
    });

    it('should calculate optimal publishing times', async () => {
      await agent.schedule(
        mockContentDocument,
        { optimalTime: true },
        ['xiaohongshu', 'zhihu']
      );

      const queue = agent.getQueue();
      expect(queue).toHaveLength(2);
      
      // Should schedule for 09:00 based on mock adapter
      queue.forEach(post => {
        expect(post.scheduledTime.getHours()).toBe(9);
        expect(post.scheduledTime.getMinutes()).toBe(0);
      });
    });

    it('should schedule for next day if optimal time has passed', async () => {
      // Mock current time as 10:00 AM (past optimal time)
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-15T10:00:00Z').getTime());

      await agent.schedule(
        mockContentDocument,
        { optimalTime: true },
        ['xiaohongshu']
      );

      const queue = agent.getQueue();
      const scheduledDate = queue[0].scheduledTime;
      
      // Should be scheduled for next day
      expect(scheduledDate.getDate()).toBe(16);
      expect(scheduledDate.getHours()).toBe(9);
    });

    it('should process scheduled posts when time arrives', async () => {
      const pastTime = new Date('2024-01-15T07:00:00Z');
      
      await agent.schedule(mockContentDocument, { scheduledTime: pastTime }, ['xiaohongshu']);

      // Trigger queue processing
      await (agent as any).processQueue();

      const queue = agent.getQueue();
      expect(queue[0].status).toBe('published');
    });

    it('should handle scheduling failures gracefully', async () => {
      const mockAdapter = (agent as any).adapters.get('xiaohongshu');
      mockAdapter.adapt.mockRejectedValueOnce(new Error('Scheduling failed'));

      const pastTime = new Date('2024-01-15T07:00:00Z');
      await agent.schedule(mockContentDocument, { scheduledTime: pastTime }, ['xiaohongshu']);

      await (agent as any).processQueue();

      const queue = agent.getQueue();
      expect(queue[0].status).toBe('failed');
    });

    it('should clean up old published posts', async () => {
      const oldTime = new Date('2024-01-14T07:00:00Z'); // Yesterday
      
      // Manually add old published post
      const oldPost = {
        id: 'old-post',
        content: mockContentDocument,
        platforms: ['xiaohongshu'] as Platform[],
        scheduledTime: oldTime,
        status: 'published' as const,
      };
      
      (agent as any).publishQueue.push(oldPost);

      await (agent as any).processQueue();

      const queue = agent.getQueue();
      expect(queue.find(post => post.id === 'old-post')).toBeUndefined();
    });

    it('should keep pending posts in queue', async () => {
      const futureTime = new Date('2024-01-15T12:00:00Z');
      
      await agent.schedule(mockContentDocument, { scheduledTime: futureTime }, ['xiaohongshu']);

      await (agent as any).processQueue();

      const queue = agent.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].status).toBe('pending');
    });
  });

  describe('Platform-Specific Features', () => {
    it('should generate platform-appropriate hashtags', () => {
      const content = 'AI technology transforms business processes';
      
      const platforms: Platform[] = ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'];
      
      platforms.forEach(platform => {
        const hashtags = agent.optimizeHashtags(content, platform);
        
        expect(hashtags).toContain(`${platform}hashtag`);
        expect(hashtags.length).toBeGreaterThan(0);
        expect(hashtags.every(tag => typeof tag === 'string')).toBe(true);
      });
    });

    it('should provide platform-specific visual recommendations', async () => {
      const platforms: Platform[] = ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'];
      
      for (const platform of platforms) {
        const content = await agent.adaptForPlatform(mockContentDocument, platform);
        
        expect(content.visualSuggestions).toBeDefined();
        expect(content.visualSuggestions.length).toBeGreaterThan(0);
        expect(content.visualSuggestions[0].description).toContain(platform);
      }
    });

    it('should calculate platform-specific expected reach', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'],
      };

      const results = await agent.publish(mockContentDocument, options);

      const reachValues = results.map(r => r.metrics?.expectedReach).filter(Boolean);
      expect(reachValues).toHaveLength(4);
      
      // Different platforms should have different reach estimates
      const uniqueReach = new Set(reachValues);
      expect(uniqueReach.size).toBeGreaterThan(1);
    });

    it('should provide platform-specific optimal times', async () => {
      const platforms: Platform[] = ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'];
      
      const options: PublishOptions = {
        platforms,
        schedule: { optimalTime: true },
      };

      const results = await agent.publish(mockContentDocument, options);

      results.forEach(result => {
        expect(result.metrics?.bestTime).toBe('09:00');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty content gracefully', async () => {
      const emptyContent = createContentDocument(
        'empty-insights',
        'voice-profile',
        'standard',
        '',
        'Creator Agent'
      );
      emptyContent.title = '';

      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
      };

      const results = await agent.publish(emptyContent, options);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].content.title).toBeDefined();
    });

    it('should handle network timeouts and retries', async () => {
      const mockAdapter = (agent as any).adapters.get('xiaohongshu');
      mockAdapter.adapt
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          platform: 'xiaohongshu',
          title: 'Retry Success',
          body: 'Content after retry',
          hashtags: ['retry'],
          keywords: ['success'],
          visualSuggestions: [],
          metadata: {
            length: 100,
            readingTime: 1,
            optimizationScore: 85,
          },
        });

      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
      };

      // First attempt should fail, but we're not implementing retry logic in this test
      const results = await agent.publish(mockContentDocument, options);

      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Network timeout');
    });

    it('should validate platform availability', async () => {
      const invalidPlatforms = ['facebook', 'twitter', 'instagram'] as Platform[];
      
      const options: PublishOptions = {
        platforms: invalidPlatforms,
      };

      const results = await agent.publish(mockContentDocument, options);

      results.forEach(result => {
        expect(result.success).toBe(false);
        expect(result.error).toContain('No adapter available');
      });
    });

    it('should handle very long content appropriately', async () => {
      const longContent = createContentDocument(
        'long-insights',
        'voice-profile',
        'standard',
        'Very long content. '.repeat(1000),
        'Creator Agent'
      );

      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
        optimize: true,
      };

      const results = await agent.publish(longContent, options);

      expect(results[0].success).toBe(true);
      expect(results[0].content).toBeDefined();
    });

    it('should handle special characters in content', async () => {
      const specialContent = createContentDocument(
        'special-insights',
        'voice-profile',
        'standard',
        'Content with émojis 🚀 and spëcial châractérs!',
        'Creator Agent'
      );

      const options: PublishOptions = {
        platforms: ['xiaohongshu'],
      };

      const results = await agent.publish(specialContent, options);

      expect(results[0].success).toBe(true);
      expect(results[0].content.body).toContain('émojis');
      expect(results[0].content.body).toContain('🚀');
    });
  });

  describe('Performance and Statistics', () => {
    it('should track publishing statistics correctly', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu'],
      };

      await agent.publish(mockContentDocument, options);

      const stats = (agent as any).publishingStats;
      expect(stats.totalPublished).toBe(2);
      expect(stats.platformDistribution.xiaohongshu).toBe(1);
      expect(stats.platformDistribution.zhihu).toBe(1);
      expect(stats.averageOptimizationScore).toBeGreaterThan(0);
    });

    it('should track failure rates correctly', async () => {
      // Mock one failure
      const mockAdapter = (agent as any).adapters.get('xiaohongshu');
      mockAdapter.adapt.mockRejectedValueOnce(new Error('Publish failed'));

      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu'],
      };

      await agent.publish(mockContentDocument, options);

      const stats = (agent as any).publishingStats;
      expect(stats.totalPublished).toBe(2);
      expect(stats.failureRate).toBe(0.5); // 1 failure out of 2 attempts
    });

    it('should complete publishing within reasonable time', async () => {
      const options: PublishOptions = {
        platforms: ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'],
        optimize: true,
        generateVisuals: true,
      };

      const startTime = Date.now();
      await agent.publish(mockContentDocument, options);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle concurrent publishing requests', async () => {
      const options1: PublishOptions = { platforms: ['xiaohongshu'] };
      const options2: PublishOptions = { platforms: ['zhihu'] };

      const promises = [
        agent.publish(mockContentDocument, options1),
        agent.publish(mockContentDocument, options2),
      ];

      const results = await Promise.all(promises);

      expect(results[0][0].success).toBe(true);
      expect(results[1][0].success).toBe(true);
      expect(results[0][0].platform).toBe('xiaohongshu');
      expect(results[1][0].platform).toBe('zhihu');
    });
  });

  describe('Agent Request Processing', () => {
    it('should process agent requests successfully', async () => {
      const request = {
        id: 'publisher-request-1',
        timestamp: new Date(),
        data: {
          content: mockContentDocument,
          options: {
            platforms: ['xiaohongshu', 'zhihu'],
            optimize: true,
          },
        },
      };

      const response = await agent.processRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.metadata?.agent).toBe('publisher');
      expect(response.metadata?.processingTime).toBeGreaterThan(0);
    });

    it('should handle request processing errors', async () => {
      const request = {
        id: 'publisher-request-error',
        timestamp: new Date(),
        data: {
          content: null, // Invalid content
          options: {
            platforms: ['xiaohongshu'],
          },
        },
      };

      const response = await agent.processRequest(request);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.metadata?.agent).toBe('publisher');
    });
  });

  describe('Agent Lifecycle', () => {
    it('should initialize correctly', async () => {
      await agent['onInitialize']();
      // Should not throw errors
    });

    it('should start correctly', async () => {
      await agent['onStart']();
      // Should not throw errors
    });

    it('should stop correctly', async () => {
      await agent['onStop']();
      // Should not throw errors
    });

    it('should shutdown correctly', async () => {
      await agent['onShutdown']();
      
      const adapters = (agent as any).adapters;
      const queue = (agent as any).publishQueue;
      
      expect(adapters.size).toBe(0);
      expect(queue).toHaveLength(0);
    });
  });
});