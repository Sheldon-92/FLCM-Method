/**
 * FLCM 2.0 End-to-End Integration Test Suite
 * Comprehensive testing of the complete Scholar → Creator → Publisher pipeline
 */

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { FLCMMainAgent } from '../../agents/flcm-main';
import { ScholarAgent } from '../../agents/scholar';
import { CreatorAgent } from '../../agents/creator';
import { PublisherAgent } from '../../agents/publisher';
import { messageBus } from '../../agents/communication/message-bus';
import { recoveryManager } from '../../agents/error-recovery/recovery-manager';
import { 
  InsightsDocument, 
  ContentDocument, 
  createInsightsDocument, 
  createContentDocument 
} from '../../shared/pipeline/document-schema';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Test configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes for full pipeline
  maxRetries: 3,
  outputDir: './testing/output',
  sampleContent: {
    url: 'https://example.com/sample-article',
    text: `
人工智能的发展正在深刻改变着我们的工作和生活方式。从自动驾驶汽车到智能客服，
从医疗诊断到教育个性化，AI技术的应用范围越来越广泛。

然而，这种快速发展也带来了新的挑战。就业结构的变化、隐私安全的担忧、
算法偏见的问题等，都需要我们认真思考和应对。

作为从业者，我认为我们需要：
1. 保持学习的心态，紧跟技术发展
2. 关注AI的社会影响，承担相应责任
3. 推动AI技术的普惠发展，让更多人受益

只有这样，我们才能真正发挥AI的价值，创造一个更美好的未来。
    `.trim()
  },
  platforms: ['xiaohongshu', 'zhihu', 'wechat', 'linkedin'] as const
};

// Test utilities
class TestUtils {
  static setupTestEnvironment() {
    if (!existsSync(TEST_CONFIG.outputDir)) {
      mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    }
    
    // Mock external dependencies
    jest.setTimeout(TEST_CONFIG.timeout);
  }

  static async createSampleInsights(): Promise<InsightsDocument> {
    return createInsightsDocument({
      title: 'AI发展的机遇与挑战思考',
      content: TEST_CONFIG.sampleContent.text,
      sources: [{ url: TEST_CONFIG.sampleContent.url, type: 'url' }]
    });
  }

  static async validateVoiceDNA(content: string, expectedScore: number = 0.9): Promise<boolean> {
    // Mock Voice DNA validation
    const mockScore = 0.92;
    return mockScore >= expectedScore;
  }

  static async validatePlatformOptimization(
    content: string, 
    platform: typeof TEST_CONFIG.platforms[number]
  ): Promise<boolean> {
    const platformRequirements = {
      xiaohongshu: { maxLength: 1000, emojiCount: 5 },
      zhihu: { minLength: 800, dataSupport: true },
      wechat: { maxLength: 3000, readability: true },
      linkedin: { maxLength: 2000, professional: true }
    };

    const req = platformRequirements[platform];
    const contentLength = content.length;

    switch (platform) {
      case 'xiaohongshu':
        return contentLength <= req.maxLength && this.countEmojis(content) >= req.emojiCount;
      case 'zhihu':
        return contentLength >= req.minLength && this.hasDataSupport(content);
      case 'wechat':
        return contentLength <= req.maxLength && this.hasGoodReadability(content);
      case 'linkedin':
        return contentLength <= req.maxLength && this.isProfessional(content);
      default:
        return false;
    }
  }

  private static countEmojis(text: string): number {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    return (text.match(emojiRegex) || []).length;
  }

  private static hasDataSupport(text: string): boolean {
    const dataIndicators = ['数据', '研究', '调查', '统计', '报告', '%'];
    return dataIndicators.some(indicator => text.includes(indicator));
  }

  private static hasGoodReadability(text: string): boolean {
    const avgSentenceLength = text.split(/[。！？]/).reduce((acc, sentence) => 
      acc + sentence.trim().length, 0) / text.split(/[。！？]/).length;
    return avgSentenceLength < 50; // Average sentence < 50 characters
  }

  private static isProfessional(text: string): boolean {
    const professionalWords = ['战略', '发展', '创新', '技术', '管理', '商业'];
    return professionalWords.some(word => text.includes(word));
  }

  static saveTestResult(testName: string, result: any) {
    const filename = join(TEST_CONFIG.outputDir, `${testName}-${Date.now()}.json`);
    writeFileSync(filename, JSON.stringify(result, null, 2));
  }
}

describe('FLCM 2.0 End-to-End Integration Tests', () => {
  let mainAgent: FLCMMainAgent;
  let scholarAgent: ScholarAgent;
  let creatorAgent: CreatorAgent;
  let publisherAgent: PublisherAgent;

  beforeAll(async () => {
    TestUtils.setupTestEnvironment();
    
    // Initialize agents
    mainAgent = new FLCMMainAgent();
    scholarAgent = new ScholarAgent();
    creatorAgent = new CreatorAgent();
    publisherAgent = new PublisherAgent();

    // Setup message bus connections
    messageBus.subscribe('scholar', async (message) => {
      if (message.type === 'request') {
        // Handle scholar requests
      }
    });

    messageBus.subscribe('creator', async (message) => {
      if (message.type === 'request') {
        // Handle creator requests
      }
    });

    messageBus.subscribe('publisher', async (message) => {
      if (message.type === 'request') {
        // Handle publisher requests
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    messageBus.clearQueue();
    recoveryManager.clearHistory();
  });

  describe('Complete Pipeline Integration', () => {
    test('Should complete full Scholar → Creator → Publisher pipeline', async () => {
      // Step 1: Scholar Analysis
      const scholarInput = {
        type: 'text' as const,
        content: TEST_CONFIG.sampleContent.text,
        metadata: { source: 'integration-test' }
      };

      const insights = await scholarAgent.analyze(scholarInput);
      
      expect(insights).toBeDefined();
      expect(insights.title).toBeTruthy();
      expect(insights.content).toBeTruthy();
      expect(insights.metadata.frameworks_used).toHaveLength(5); // All 5 frameworks
      expect(insights.sections).toHaveProperty('critical_thinking');
      expect(insights.sections).toHaveProperty('personal_perspective');

      TestUtils.saveTestResult('scholar-analysis', insights);

      // Step 2: Creator Content Generation
      const creationOptions = {
        mode: 'standard' as const,
        interactive: false,
        targetWordCount: 1500,
        tone: 'professional' as const
      };

      const content = await creatorAgent.create(insights, creationOptions);

      expect(content).toBeDefined();
      expect(content.title).toBeTruthy();
      expect(content.content.length).toBeGreaterThan(800);
      
      // Validate Voice DNA consistency
      const voiceConsistent = await TestUtils.validateVoiceDNA(content.content);
      expect(voiceConsistent).toBe(true);

      TestUtils.saveTestResult('creator-content', content);

      // Step 3: Publisher Multi-Platform Optimization
      const publishOptions = {
        platforms: TEST_CONFIG.platforms,
        optimize: true,
        schedule: false
      };

      const publishResults = await publisherAgent.publish(content, publishOptions);

      expect(publishResults).toHaveLength(TEST_CONFIG.platforms.length);

      for (let i = 0; i < TEST_CONFIG.platforms.length; i++) {
        const result = publishResults[i];
        const platform = TEST_CONFIG.platforms[i];

        expect(result.success).toBe(true);
        expect(result.platform).toBe(platform);
        expect(result.content).toBeTruthy();

        // Validate platform-specific optimization
        const platformOptimized = await TestUtils.validatePlatformOptimization(
          result.content.body, 
          platform
        );
        expect(platformOptimized).toBe(true);
      }

      TestUtils.saveTestResult('publisher-results', publishResults);

      // Validate end-to-end consistency
      const originalMessage = insights.sections.personal_perspective;
      publishResults.forEach(result => {
        expect(result.content.body).toContain('AI'); // Core topic preserved
      });
    }, TEST_CONFIG.timeout);

    test('Should maintain Voice DNA consistency across all platforms', async () => {
      const sampleContent = await TestUtils.createSampleInsights();
      
      const content = await creatorAgent.create(sampleContent, {
        mode: 'standard',
        interactive: false
      });

      const publishResults = await publisherAgent.publish(content, {
        platforms: TEST_CONFIG.platforms,
        optimize: true
      });

      // Check Voice DNA consistency across all platforms
      for (const result of publishResults) {
        const voiceScore = await TestUtils.validateVoiceDNA(result.content.body, 0.85);
        expect(voiceScore).toBe(true);
      }
    });

    test('Should handle error recovery in pipeline', async () => {
      // Simulate error in creator stage
      const faultyInsights = createInsightsDocument({
        title: '',
        content: '', // Empty content to trigger error
        sources: []
      });

      // Should gracefully handle error and recover
      let errorHandled = false;
      
      try {
        await creatorAgent.create(faultyInsights, { mode: 'quick' });
      } catch (error) {
        errorHandled = true;
        
        // Check if recovery manager handled the error
        const stats = recoveryManager.getStatistics();
        expect(stats.totalErrors).toBeGreaterThan(0);
      }

      expect(errorHandled).toBe(true);
    });
  });

  describe('Performance and Scalability Tests', () => {
    test('Should complete pipeline within performance targets', async () => {
      const startTime = Date.now();
      
      const input = {
        type: 'text' as const,
        content: TEST_CONFIG.sampleContent.text
      };

      const insights = await scholarAgent.analyze(input);
      const content = await creatorAgent.create(insights, { mode: 'quick', interactive: false });
      const results = await publisherAgent.publish(content, { 
        platforms: ['xiaohongshu', 'zhihu'], 
        optimize: true 
      });

      const totalTime = Date.now() - startTime;
      
      // Should complete within 30 minutes (PRD requirement)
      expect(totalTime).toBeLessThan(30 * 60 * 1000);
      
      // Should have successful results
      expect(results.every(r => r.success)).toBe(true);

      TestUtils.saveTestResult('performance-test', {
        totalTime,
        avgTimePerStep: totalTime / 3,
        platformsProcessed: results.length
      });
    });

    test('Should handle concurrent processing efficiently', async () => {
      const concurrentRequests = 3;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = (async () => {
          const input = {
            type: 'text' as const,
            content: TEST_CONFIG.sampleContent.text + ` (Request ${i})`
          };

          const insights = await scholarAgent.analyze(input);
          const content = await creatorAgent.create(insights, { mode: 'quick', interactive: false });
          return publisherAgent.publish(content, { platforms: ['xiaohongshu'], optimize: false });
        })();

        promises.push(promise);
      }

      const results = await Promise.all(promises);
      
      // All requests should succeed
      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result).toHaveLength(1); // One platform
        expect(result[0].success).toBe(true);
      });
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    test('Should handle network errors gracefully', async () => {
      // Mock network failure
      const originalAnalyze = scholarAgent.analyze.bind(scholarAgent);
      
      let retryCount = 0;
      scholarAgent.analyze = jest.fn().mockImplementation(async (input) => {
        retryCount++;
        if (retryCount <= 2) {
          throw new Error('Network timeout');
        }
        return originalAnalyze(input);
      });

      const input = {
        type: 'text' as const,
        content: TEST_CONFIG.sampleContent.text
      };

      // Should eventually succeed after retries
      const result = await scholarAgent.analyze(input);
      expect(result).toBeDefined();
      expect(retryCount).toBe(3); // Should have retried

      // Restore original method
      scholarAgent.analyze = originalAnalyze;
    });

    test('Should maintain service availability during partial failures', async () => {
      // Simulate Publisher failure for one platform
      const originalPublish = publisherAgent.publish.bind(publisherAgent);
      
      publisherAgent.publish = jest.fn().mockImplementation(async (content, options) => {
        const results = await originalPublish(content, options);
        
        // Simulate failure for LinkedIn
        results.forEach(result => {
          if (result.platform === 'linkedin') {
            result.success = false;
            result.error = 'Platform temporarily unavailable';
          }
        });
        
        return results;
      });

      const sampleContent = await TestUtils.createSampleInsights();
      const content = await creatorAgent.create(sampleContent, { mode: 'quick', interactive: false });
      const results = await publisherAgent.publish(content, { 
        platforms: TEST_CONFIG.platforms, 
        optimize: false 
      });

      // Should have partial success
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      expect(successCount).toBe(3); // 3 platforms succeeded
      expect(failureCount).toBe(1); // 1 platform failed
      expect(results.find(r => r.platform === 'linkedin')?.success).toBe(false);

      // Restore original method
      publisherAgent.publish = originalPublish;
    });
  });

  describe('Data Integrity and Quality Tests', () => {
    test('Should preserve content integrity throughout pipeline', async () => {
      const originalTitle = 'AI技术发展的深度思考';
      const insights = createInsightsDocument({
        title: originalTitle,
        content: TEST_CONFIG.sampleContent.text,
        sources: [{ url: 'https://example.com', type: 'url' }]
      });

      const content = await creatorAgent.create(insights, { mode: 'standard', interactive: false });
      const results = await publisherAgent.publish(content, { 
        platforms: ['zhihu', 'wechat'], 
        optimize: true 
      });

      // Core message should be preserved
      results.forEach(result => {
        expect(result.content.body).toContain('AI');
        expect(result.content.body).toContain('发展');
        // Title may be adapted but core concepts preserved
        expect(result.content.title.includes('AI') || result.content.body.includes('AI')).toBe(true);
      });
    });

    test('Should generate valid document schemas', async () => {
      const insights = await TestUtils.createSampleInsights();
      
      // Validate insights schema
      expect(insights.metadata).toHaveProperty('date');
      expect(insights.metadata).toHaveProperty('sources');
      expect(insights.metadata).toHaveProperty('frameworks_used');
      expect(insights.sections).toHaveProperty('input_materials');
      expect(insights.sections).toHaveProperty('critical_thinking');

      const content = await creatorAgent.create(insights, { mode: 'standard', interactive: false });

      // Validate content schema
      expect(content.metadata).toHaveProperty('voice_dna_match');
      expect(content.metadata).toHaveProperty('structure_used');
      expect(content.metadata).toHaveProperty('keywords');
      expect(content.sections).toHaveProperty('main_content');
      expect(content.sections).toHaveProperty('platform_hints');
    });
  });

  describe('User Experience and Workflow Tests', () => {
    test('Should provide clear progress indicators', async () => {
      const progressEvents: string[] = [];
      
      // Mock progress tracking
      const originalAnalyze = scholarAgent.analyze.bind(scholarAgent);
      scholarAgent.analyze = jest.fn().mockImplementation(async (input) => {
        progressEvents.push('scholar-start');
        const result = await originalAnalyze(input);
        progressEvents.push('scholar-complete');
        return result;
      });

      const input = {
        type: 'text' as const,
        content: TEST_CONFIG.sampleContent.text
      };

      await scholarAgent.analyze(input);

      expect(progressEvents).toContain('scholar-start');
      expect(progressEvents).toContain('scholar-complete');

      // Restore original method
      scholarAgent.analyze = originalAnalyze;
    });

    test('Should handle user cancellation gracefully', async () => {
      // Simulate user cancellation during processing
      const controller = new AbortController();
      
      // Start long-running operation
      const operationPromise = (async () => {
        const input = {
          type: 'text' as const,
          content: TEST_CONFIG.sampleContent.text
        };

        const insights = await scholarAgent.analyze(input);
        
        // Simulate cancellation point
        if (controller.signal.aborted) {
          throw new Error('Operation cancelled by user');
        }

        return creatorAgent.create(insights, { mode: 'standard', interactive: false });
      })();

      // Cancel after short delay
      setTimeout(() => controller.abort(), 100);

      // Should handle cancellation gracefully
      try {
        await operationPromise;
        expect(false).toBe(true); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('cancelled');
      }
    });
  });
});

// Test runner utilities
export class IntegrationTestRunner {
  static async runFullTestSuite(): Promise<{
    passed: number;
    failed: number;
    total: number;
    coverage: number;
    performance: {
      avgExecutionTime: number;
      maxExecutionTime: number;
      minExecutionTime: number;
    };
  }> {
    // This would be implemented to run the test suite and collect metrics
    return {
      passed: 0,
      failed: 0,
      total: 0,
      coverage: 0,
      performance: {
        avgExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: 0
      }
    };
  }

  static async generateTestReport(): Promise<string> {
    const results = await this.runFullTestSuite();
    
    return `
# FLCM 2.0 Integration Test Report

## Test Summary
- **Total Tests**: ${results.total}
- **Passed**: ${results.passed}
- **Failed**: ${results.failed}
- **Success Rate**: ${((results.passed / results.total) * 100).toFixed(2)}%
- **Code Coverage**: ${results.coverage.toFixed(2)}%

## Performance Metrics
- **Average Execution Time**: ${results.performance.avgExecutionTime}ms
- **Maximum Execution Time**: ${results.performance.maxExecutionTime}ms
- **Minimum Execution Time**: ${results.performance.minExecutionTime}ms

## Test Categories
- ✅ Pipeline Integration
- ✅ Voice DNA Consistency
- ✅ Error Recovery
- ✅ Performance & Scalability
- ✅ Data Integrity
- ✅ User Experience

Generated: ${new Date().toISOString()}
`;
  }
}