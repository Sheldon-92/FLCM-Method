/**
 * Platform Adapters Unit Tests
 * Test all 4 platform adapters (XiaoHongShu, Zhihu, WeChat, LinkedIn)
 */

import { XiaohongshuAdapter } from '../adapters/xiaohongshu-adapter';
import { ZhihuAdapter } from '../adapters/zhihu-adapter';
import { WechatAdapter } from '../adapters/wechat-adapter';
import { LinkedInAdapter } from '../adapters/linkedin-adapter';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
import { ContentDocument, createContentDocument } from '../../../shared/pipeline/document-schema';

// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('Platform Adapters', () => {
  let mockContentDocument: ContentDocument;

  beforeEach(() => {
    mockContentDocument = createContentDocument(
      'insights-123',
      'voice-profile-456',
      'standard',
      `# Comprehensive Guide to AI in Business

## Introduction
Artificial intelligence (AI) has become a transformative force in modern business operations. Organizations worldwide are leveraging AI technologies to automate processes, enhance decision-making, and gain competitive advantages in their respective markets.

## Key Benefits of AI Implementation

### Automation and Efficiency
AI-powered automation reduces manual processing time by up to 75%, allowing employees to focus on higher-value strategic activities. Machine learning algorithms can handle routine tasks with greater accuracy and consistency than human operators.

### Data-Driven Insights
Advanced analytics and AI models process vast amounts of data to generate actionable insights. Business intelligence platforms powered by AI help organizations identify trends, predict outcomes, and make informed strategic decisions.

### Competitive Advantage
Early adopters of AI technology gain significant competitive advantages through improved efficiency, better customer experiences, and innovative product offerings. Market leaders consistently invest in AI capabilities to maintain their position.

## Implementation Strategy

### Phased Approach
Successful AI implementation requires a systematic phased approach:
1. Assessment and planning phase
2. Pilot program development
3. Gradual rollout and scaling
4. Continuous optimization and improvement

### Investment Requirements
Enterprise AI implementations typically require significant initial investments averaging $2.5 million for comprehensive deployments. However, ROI studies show average returns of 300% within three years.

### Training and Development
Employee training programs are crucial for successful AI adoption. Organizations investing in comprehensive training see 60% higher adoption rates and significantly better outcomes.

## Risk Management

### Data Quality Assurance
AI system effectiveness directly correlates with data quality. Organizations must implement robust data governance frameworks to ensure accuracy, completeness, and reliability of training datasets.

### Ethical Considerations
Responsible AI implementation requires careful attention to bias prevention, transparency, and ethical decision-making processes. Regular audits and monitoring help maintain ethical standards.

## Conclusion
Strategic AI implementation transforms business operations when executed with comprehensive planning, adequate investment, and proper change management. Organizations that approach AI adoption systematically achieve better outcomes and sustainable competitive advantages.`,
      'Creator Agent'
    );

    mockContentDocument.title = 'Comprehensive Guide to AI in Business';
    mockContentDocument.sections = [
      {
        heading: 'Introduction',
        content: 'AI has become a transformative force...',
        level: 2,
        wordCount: 45,
      },
      {
        heading: 'Key Benefits',
        content: 'Automation reduces processing time...',
        level: 2,
        wordCount: 85,
      },
      {
        heading: 'Implementation Strategy',
        content: 'Successful implementation requires systematic approach...',
        level: 2,
        wordCount: 120,
      },
    ];
  });

  describe('XiaoHongShu Adapter', () => {
    let adapter: XiaohongshuAdapter;

    beforeEach(() => {
      adapter = new XiaohongshuAdapter();
    });

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('xiaohongshu');
    });

    it('should adapt content for XiaoHongShu platform', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      expect(platformContent.platform).toBe('xiaohongshu');
      expect(platformContent.title).toBeDefined();
      expect(platformContent.body).toBeDefined();
      expect(platformContent.hashtags).toBeDefined();
      expect(platformContent.keywords).toBeDefined();
      expect(platformContent.metadata).toBeDefined();
    });

    it('should optimize content for XiaoHongShu characteristics', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      // XiaoHongShu prefers shorter, more engaging content
      expect(platformContent.body.length).toBeLessThan(mockContentDocument.content.length);
      
      // Should include visual elements emphasis
      expect(platformContent.body.toLowerCase()).toMatch(/visual|image|photo|美图/i);
      
      // Should have lifestyle-oriented hashtags
      expect(platformContent.hashtags.some(tag => 
        tag.includes('生活') || tag.includes('分享') || tag.includes('AI') || tag.includes('科技')
      )).toBe(true);
    });

    it('should generate appropriate hashtags for XiaoHongShu', () => {
      const content = '人工智能改变商业运营模式，提升效率创造价值';
      const hashtags = adapter.generateHashtags(content);

      expect(hashtags).toContain('AI');
      expect(hashtags).toContain('商业');
      expect(hashtags).toContain('科技');
      expect(hashtags.length).toBeGreaterThan(5);
      expect(hashtags.length).toBeLessThanOrEqual(20);
    });

    it('should suggest visual content for XiaoHongShu', () => {
      const content = 'AI implementation guide with business insights';
      const visuals = adapter.suggestVisuals(content);

      expect(visuals).toBeDefined();
      expect(visuals.length).toBeGreaterThan(0);
      
      const coverImage = visuals.find(v => v.type === 'cover');
      expect(coverImage).toBeDefined();
      expect(coverImage?.style).toMatch(/colorful|vibrant|lifestyle/i);
      
      // XiaoHongShu loves infographics
      const infographic = visuals.find(v => v.description.toLowerCase().includes('infographic'));
      expect(infographic).toBeDefined();
    });

    it('should provide optimal posting time for XiaoHongShu', () => {
      const optimalTime = adapter.getOptimalTime();
      
      expect(optimalTime).toBeDefined();
      // XiaoHongShu users are most active during lunch and evening
      expect(['12:00', '19:00', '20:00', '21:00']).toContain(optimalTime);
    });

    it('should optimize content for XiaoHongShu engagement', async () => {
      const originalContent = await adapter.adapt(mockContentDocument);
      const optimizedContent = await adapter.optimize(originalContent);

      expect(optimizedContent.metadata.optimizationScore).toBeGreaterThan(originalContent.metadata.optimizationScore);
      
      // Should add engaging elements
      expect(optimizedContent.body).toMatch(/💡|🚀|✨|📈/);
      
      // Should have lifestyle angle
      expect(optimizedContent.body.toLowerCase()).toMatch(/生活|体验|分享|推荐/);
    });

    it('should handle Chinese content appropriately', async () => {
      const chineseContent = createContentDocument(
        'insights-cn',
        'voice-profile',
        'standard',
        '人工智能在商业中的应用正在改变我们的工作方式。企业通过AI技术提高效率，降低成本，创造更多价值。',
        'Creator Agent'
      );
      chineseContent.title = 'AI商业应用指南';

      const platformContent = await adapter.adapt(chineseContent);

      expect(platformContent.title).toContain('AI');
      expect(platformContent.hashtags.some(tag => /[\u4e00-\u9fff]/.test(tag))).toBe(true);
    });
  });

  describe('Zhihu Adapter', () => {
    let adapter: ZhihuAdapter;

    beforeEach(() => {
      adapter = new ZhihuAdapter();
    });

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('zhihu');
    });

    it('should adapt content for Zhihu platform', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      expect(platformContent.platform).toBe('zhihu');
      expect(platformContent.title).toBeDefined();
      expect(platformContent.body).toBeDefined();
      expect(platformContent.hashtags).toBeDefined();
      expect(platformContent.keywords).toBeDefined();
    });

    it('should optimize content for Zhihu characteristics', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      // Zhihu prefers longer, more detailed content
      expect(platformContent.body.length).toBeGreaterThan(500);
      
      // Should maintain academic/professional tone
      expect(platformContent.body).toMatch(/分析|研究|数据|结论/);
      
      // Should include professional hashtags
      expect(platformContent.hashtags.some(tag => 
        tag.includes('人工智能') || tag.includes('商业') || tag.includes('技术')
      )).toBe(true);
    });

    it('should generate knowledge-focused hashtags for Zhihu', () => {
      const content = '深度学习算法在金融风控中的应用与实践分析';
      const hashtags = adapter.generateHashtags(content);

      expect(hashtags).toContain('深度学习');
      expect(hashtags).toContain('金融');
      expect(hashtags).toContain('算法');
      expect(hashtags).toContain('人工智能');
      expect(hashtags.length).toBeGreaterThan(8);
    });

    it('should suggest professional visuals for Zhihu', () => {
      const content = 'Machine learning algorithms and their business applications';
      const visuals = adapter.suggestVisuals(content);

      expect(visuals).toBeDefined();
      
      const chartVisual = visuals.find(v => v.description.toLowerCase().includes('chart'));
      expect(chartVisual).toBeDefined();
      
      const diagramVisual = visuals.find(v => v.description.toLowerCase().includes('diagram'));
      expect(diagramVisual).toBeDefined();
      
      // Professional style for Zhihu
      visuals.forEach(visual => {
        expect(visual.style).toMatch(/professional|academic|clean/i);
      });
    });

    it('should provide optimal posting time for Zhihu', () => {
      const optimalTime = adapter.getOptimalTime();
      
      expect(optimalTime).toBeDefined();
      // Zhihu users are most active during morning and evening commute
      expect(['08:00', '09:00', '18:00', '21:00']).toContain(optimalTime);
    });

    it('should optimize content for Zhihu engagement', async () => {
      const originalContent = await adapter.adapt(mockContentDocument);
      const optimizedContent = await adapter.optimize(originalContent);

      expect(optimizedContent.metadata.optimizationScore).toBeGreaterThan(originalContent.metadata.optimizationScore);
      
      // Should add authoritative elements
      expect(optimizedContent.body).toMatch(/根据研究|数据显示|专家认为|实践证明/);
      
      // Should have structured format
      expect(optimizedContent.body).toMatch(/1\.|2\.|3\.|一、|二、|三、/);
    });

    it('should maintain technical depth for Zhihu audience', async () => {
      const technicalContent = createContentDocument(
        'technical-insights',
        'voice-profile',
        'standard',
        'Neural networks utilize backpropagation algorithms for gradient descent optimization.',
        'Creator Agent'
      );

      const platformContent = await adapter.adapt(technicalContent);

      // Should preserve technical terminology
      expect(platformContent.body).toMatch(/neural|algorithm|optimization|gradient/i);
      expect(platformContent.body.length).toBeGreaterThan(100);
    });
  });

  describe('WeChat Adapter', () => {
    let adapter: WechatAdapter;

    beforeEach(() => {
      adapter = new WechatAdapter();
    });

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('wechat');
    });

    it('should adapt content for WeChat platform', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      expect(platformContent.platform).toBe('wechat');
      expect(platformContent.title).toBeDefined();
      expect(platformContent.body).toBeDefined();
      expect(platformContent.hashtags).toBeDefined();
      expect(platformContent.keywords).toBeDefined();
    });

    it('should optimize content for WeChat characteristics', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      // WeChat prefers scannable, mobile-friendly format
      expect(platformContent.body).toMatch(/\n\n/g); // Multiple paragraphs
      
      // Should include social elements
      expect(platformContent.body).toMatch(/分享|朋友圈|微信/);
      
      // Should have moderate length (not too long for mobile)
      expect(platformContent.body.length).toBeLessThan(2000);
      expect(platformContent.body.length).toBeGreaterThan(300);
    });

    it('should generate social-focused hashtags for WeChat', () => {
      const content = 'AI技术助力企业数字化转型升级';
      const hashtags = adapter.generateHashtags(content);

      expect(hashtags).toContain('AI');
      expect(hashtags).toContain('数字化');
      expect(hashtags).toContain('企业');
      expect(hashtags.some(tag => tag.includes('转型') || tag.includes('升级'))).toBe(true);
      expect(hashtags.length).toBeLessThanOrEqual(15); // WeChat hashtag limit
    });

    it('should suggest mobile-optimized visuals for WeChat', () => {
      const content = 'Business transformation through artificial intelligence';
      const visuals = adapter.suggestVisuals(content);

      expect(visuals).toBeDefined();
      
      // WeChat emphasizes mobile viewing
      visuals.forEach(visual => {
        expect(visual.style).toMatch(/mobile|responsive|clean/i);
        expect(visual.elements).toContain('title');
      });
      
      const thumbnailVisual = visuals.find(v => v.type === 'thumbnail');
      expect(thumbnailVisual).toBeDefined();
    });

    it('should provide optimal posting time for WeChat', () => {
      const optimalTime = adapter.getOptimalTime();
      
      expect(optimalTime).toBeDefined();
      // WeChat users check frequently throughout the day
      expect(['07:00', '12:00', '18:00', '22:00']).toContain(optimalTime);
    });

    it('should optimize content for WeChat sharing', async () => {
      const originalContent = await adapter.adapt(mockContentDocument);
      const optimizedContent = await adapter.optimize(originalContent);

      expect(optimizedContent.metadata.optimizationScore).toBeGreaterThan(originalContent.metadata.optimizationScore);
      
      // Should add sharing incentives
      expect(optimizedContent.body).toMatch(/转发|分享|收藏|点赞/);
      
      // Should have call-to-action
      expect(optimizedContent.body).toMatch(/关注|订阅|了解更多/);
    });

    it('should format content for mobile reading', async () => {
      const longContent = createContentDocument(
        'long-content',
        'voice-profile',
        'standard',
        'Very long paragraph without breaks. '.repeat(50),
        'Creator Agent'
      );

      const platformContent = await adapter.adapt(longContent);

      // Should break long content into digestible chunks
      const paragraphs = platformContent.body.split('\n\n');
      expect(paragraphs.length).toBeGreaterThan(3);
      
      // Each paragraph should be reasonably short for mobile
      paragraphs.forEach(paragraph => {
        expect(paragraph.length).toBeLessThan(200);
      });
    });
  });

  describe('LinkedIn Adapter', () => {
    let adapter: LinkedInAdapter;

    beforeEach(() => {
      adapter = new LinkedInAdapter();
    });

    it('should have correct platform identifier', () => {
      expect(adapter.platform).toBe('linkedin');
    });

    it('should adapt content for LinkedIn platform', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      expect(platformContent.platform).toBe('linkedin');
      expect(platformContent.title).toBeDefined();
      expect(platformContent.body).toBeDefined();
      expect(platformContent.hashtags).toBeDefined();
      expect(platformContent.keywords).toBeDefined();
    });

    it('should optimize content for LinkedIn characteristics', async () => {
      const platformContent = await adapter.adapt(mockContentDocument);

      // LinkedIn prefers professional, business-focused content
      expect(platformContent.body).toMatch(/business|professional|industry|leadership/i);
      
      // Should include professional hashtags
      expect(platformContent.hashtags.some(tag => 
        tag.toLowerCase().includes('business') || 
        tag.toLowerCase().includes('ai') || 
        tag.toLowerCase().includes('technology')
      )).toBe(true);
      
      // Should have professional tone
      expect(platformContent.body).toMatch(/organizations|enterprises|strategic|implementation/i);
    });

    it('should generate business-focused hashtags for LinkedIn', () => {
      const content = 'Digital transformation strategies for enterprise growth';
      const hashtags = adapter.generateHashtags(content);

      expect(hashtags).toContain('DigitalTransformation');
      expect(hashtags).toContain('Enterprise');
      expect(hashtags).toContain('Business');
      expect(hashtags).toContain('Growth');
      expect(hashtags.every(tag => /^[A-Za-z][A-Za-z0-9]*$/.test(tag))).toBe(true); // CamelCase
    });

    it('should suggest professional visuals for LinkedIn', () => {
      const content = 'Leadership insights on AI implementation strategy';
      const visuals = adapter.suggestVisuals(content);

      expect(visuals).toBeDefined();
      
      // LinkedIn prefers professional imagery
      const professionalVisual = visuals.find(v => 
        v.style.toLowerCase().includes('professional')
      );
      expect(professionalVisual).toBeDefined();
      
      const infographicVisual = visuals.find(v => 
        v.type === 'infographic'
      );
      expect(infographicVisual).toBeDefined();
      
      // Should include business elements
      visuals.forEach(visual => {
        expect(visual.elements).toContain('title');
        expect(visual.elements.some(e => 
          e.includes('logo') || e.includes('brand') || e.includes('data')
        )).toBe(true);
      });
    });

    it('should provide optimal posting time for LinkedIn', () => {
      const optimalTime = adapter.getOptimalTime();
      
      expect(optimalTime).toBeDefined();
      // LinkedIn users are most active during business hours
      expect(['08:00', '09:00', '12:00', '17:00']).toContain(optimalTime);
    });

    it('should optimize content for LinkedIn engagement', async () => {
      const originalContent = await adapter.adapt(mockContentDocument);
      const optimizedContent = await adapter.optimize(originalContent);

      expect(optimizedContent.metadata.optimizationScore).toBeGreaterThan(originalContent.metadata.optimizationScore);
      
      // Should add thought leadership elements
      expect(optimizedContent.body).toMatch(/insights|perspective|experience|leadership/i);
      
      // Should have professional call-to-action
      expect(optimizedContent.body).toMatch(/connect|network|discuss|thoughts/i);
    });

    it('should maintain professional tone', async () => {
      const casualContent = createContentDocument(
        'casual-content',
        'voice-profile',
        'standard',
        'Hey everyone! This AI stuff is really cool and awesome!',
        'Creator Agent'
      );

      const platformContent = await adapter.adapt(casualContent);

      // Should transform to professional tone
      expect(platformContent.body).not.toMatch(/hey|stuff|really cool|awesome/i);
      expect(platformContent.body).toMatch(/artificial intelligence|technology|innovation/i);
      expect(platformContent.title).toMatch(/^[A-Z]/); // Proper capitalization
    });

    it('should format content for business context', async () => {
      const technicalContent = createContentDocument(
        'technical-content',
        'voice-profile',
        'standard',
        'Neural networks use backpropagation for training with gradient descent optimization.',
        'Creator Agent'
      );

      const platformContent = await adapter.adapt(technicalContent);

      // Should add business context
      expect(platformContent.body).toMatch(/business|organizations|enterprises|strategic/i);
      expect(platformContent.body.length).toBeGreaterThan(100);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    let adapters: PlatformAdapter[];

    beforeEach(() => {
      adapters = [
        new XiaohongshuAdapter(),
        new ZhihuAdapter(),
        new WechatAdapter(),
        new LinkedInAdapter(),
      ];
    });

    it('should maintain consistent interface across all adapters', async () => {
      for (const adapter of adapters) {
        expect(adapter.platform).toBeDefined();
        expect(typeof adapter.adapt).toBe('function');
        expect(typeof adapter.optimize).toBe('function');
        expect(typeof adapter.generateHashtags).toBe('function');
        expect(typeof adapter.suggestVisuals).toBe('function');
        expect(typeof adapter.getOptimalTime).toBe('function');
      }
    });

    it('should produce platform-specific content from same source', async () => {
      const adaptedContents: PlatformContent[] = [];

      for (const adapter of adapters) {
        const content = await adapter.adapt(mockContentDocument);
        adaptedContents.push(content);
      }

      // Each platform should produce different optimized content
      const titles = adaptedContents.map(c => c.title);
      const bodies = adaptedContents.map(c => c.body);
      const hashtags = adaptedContents.map(c => c.hashtags.join(','));

      expect(new Set(titles).size).toBeGreaterThan(1);
      expect(new Set(bodies).size).toBeGreaterThan(1);
      expect(new Set(hashtags).size).toBeGreaterThan(1);
    });

    it('should handle optimization consistently', async () => {
      for (const adapter of adapters) {
        const originalContent = await adapter.adapt(mockContentDocument);
        const optimizedContent = await adapter.optimize(originalContent);

        expect(optimizedContent.metadata.optimizationScore).toBeGreaterThanOrEqual(
          originalContent.metadata.optimizationScore
        );
        expect(optimizedContent.platform).toBe(adapter.platform);
      }
    });

    it('should generate appropriate hashtag counts per platform', () => {
      const testContent = 'Artificial intelligence revolutionizes business operations';

      adapters.forEach(adapter => {
        const hashtags = adapter.generateHashtags(testContent);
        
        expect(hashtags.length).toBeGreaterThan(0);
        expect(hashtags.length).toBeLessThanOrEqual(20);
        
        // Platform-specific limits
        if (adapter.platform === 'wechat') {
          expect(hashtags.length).toBeLessThanOrEqual(15);
        }
        if (adapter.platform === 'linkedin') {
          expect(hashtags.length).toBeLessThanOrEqual(10);
        }
      });
    });

    it('should provide realistic optimal posting times', () => {
      adapters.forEach(adapter => {
        const optimalTime = adapter.getOptimalTime();
        
        expect(optimalTime).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
        
        const [hours] = optimalTime.split(':').map(Number);
        expect(hours).toBeGreaterThanOrEqual(0);
        expect(hours).toBeLessThanOrEqual(23);
      });
    });

    it('should suggest relevant visuals for each platform', () => {
      const testContent = 'Data visualization and analytics in business intelligence';

      adapters.forEach(adapter => {
        const visuals = adapter.suggestVisuals(testContent);
        
        expect(visuals).toBeDefined();
        expect(visuals.length).toBeGreaterThan(0);
        
        visuals.forEach(visual => {
          expect(visual.type).toBeDefined();
          expect(visual.description).toBeDefined();
          expect(visual.style).toBeDefined();
          expect(visual.elements).toBeDefined();
          expect(Array.isArray(visual.elements)).toBe(true);
        });
      });
    });
  });

  describe('Performance and Error Handling', () => {
    let adapters: PlatformAdapter[];

    beforeEach(() => {
      adapters = [
        new XiaohongshuAdapter(),
        new ZhihuAdapter(),
        new WechatAdapter(),
        new LinkedInAdapter(),
      ];
    });

    it('should complete adaptation within reasonable time', async () => {
      const adaptationPromises = adapters.map(async adapter => {
        const startTime = Date.now();
        await adapter.adapt(mockContentDocument);
        return Date.now() - startTime;
      });

      const durations = await Promise.all(adaptationPromises);
      
      durations.forEach(duration => {
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    it('should handle empty content gracefully', async () => {
      const emptyContent = createContentDocument(
        'empty-insights',
        'voice-profile',
        'standard',
        '',
        'Creator Agent'
      );
      emptyContent.title = '';

      for (const adapter of adapters) {
        const platformContent = await adapter.adapt(emptyContent);
        
        expect(platformContent).toBeDefined();
        expect(platformContent.platform).toBe(adapter.platform);
        expect(platformContent.title).toBeDefined();
        expect(platformContent.body).toBeDefined();
      }
    });

    it('should handle very long content appropriately', async () => {
      const longContent = createContentDocument(
        'long-insights',
        'voice-profile',
        'standard',
        'Very long content section. '.repeat(200),
        'Creator Agent'
      );

      for (const adapter of adapters) {
        const platformContent = await adapter.adapt(longContent);
        
        expect(platformContent).toBeDefined();
        expect(platformContent.body.length).toBeGreaterThan(0);
        
        // Different platforms may have different length optimizations
        if (adapter.platform === 'xiaohongshu') {
          expect(platformContent.body.length).toBeLessThan(1500);
        }
        if (adapter.platform === 'zhihu') {
          expect(platformContent.body.length).toBeGreaterThan(300);
        }
      }
    });

    it('should handle special characters and unicode', async () => {
      const specialContent = createContentDocument(
        'special-insights',
        'voice-profile',
        'standard',
        'Content with émojis 🚀 and special châractérs! 中文内容测试 #hashtag',
        'Creator Agent'
      );

      for (const adapter of adapters) {
        const platformContent = await adapter.adapt(specialContent);
        
        expect(platformContent).toBeDefined();
        expect(platformContent.body).toContain('émojis');
        expect(platformContent.body).toContain('🚀');
        expect(platformContent.body).toContain('châractérs');
        
        // Chinese content handling
        if (adapter.platform === 'xiaohongshu' || adapter.platform === 'zhihu' || adapter.platform === 'wechat') {
          expect(platformContent.body).toContain('中文');
        }
      }
    });

    it('should maintain content integrity during optimization', async () => {
      for (const adapter of adapters) {
        const originalContent = await adapter.adapt(mockContentDocument);
        const optimizedContent = await adapter.optimize(originalContent);

        // Core content elements should be preserved
        expect(optimizedContent.platform).toBe(originalContent.platform);
        expect(optimizedContent.title).toBeDefined();
        expect(optimizedContent.body).toBeDefined();
        expect(optimizedContent.hashtags).toBeDefined();
        expect(optimizedContent.keywords).toBeDefined();
        expect(optimizedContent.metadata).toBeDefined();
      }
    });
  });
});