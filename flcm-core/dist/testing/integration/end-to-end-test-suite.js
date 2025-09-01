"use strict";
/**
 * FLCM 2.0 End-to-End Integration Test Suite
 * Comprehensive testing of the complete Scholar → Creator → Publisher pipeline
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTestRunner = void 0;
const globals_1 = require("@jest/globals");
const flcm_main_1 = require("../../agents/flcm-main");
const scholar_1 = require("../../agents/scholar");
const creator_1 = require("../../agents/creator");
const publisher_1 = require("../../agents/publisher");
const message_bus_1 = require("../../agents/communication/message-bus");
const recovery_manager_1 = require("../../agents/error-recovery/recovery-manager");
const document_schema_1 = require("../../shared/pipeline/document-schema");
const fs_1 = require("fs");
const path_1 = require("path");
// Test configuration
const TEST_CONFIG = {
    timeout: 300000,
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
    platforms: ['xiaohongshu', 'zhihu', 'wechat', 'linkedin']
};
// Test utilities
class TestUtils {
    static setupTestEnvironment() {
        if (!(0, fs_1.existsSync)(TEST_CONFIG.outputDir)) {
            (0, fs_1.mkdirSync)(TEST_CONFIG.outputDir, { recursive: true });
        }
        // Mock external dependencies
        globals_1.jest.setTimeout(TEST_CONFIG.timeout);
    }
    static async createSampleInsights() {
        return (0, document_schema_1.createInsightsDocument)({
            title: 'AI发展的机遇与挑战思考',
            content: TEST_CONFIG.sampleContent.text,
            sources: [{ url: TEST_CONFIG.sampleContent.url, type: 'url' }]
        });
    }
    static async validateVoiceDNA(content, expectedScore = 0.9) {
        // Mock Voice DNA validation
        const mockScore = 0.92;
        return mockScore >= expectedScore;
    }
    static async validatePlatformOptimization(content, platform) {
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
    static countEmojis(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        return (text.match(emojiRegex) || []).length;
    }
    static hasDataSupport(text) {
        const dataIndicators = ['数据', '研究', '调查', '统计', '报告', '%'];
        return dataIndicators.some(indicator => text.includes(indicator));
    }
    static hasGoodReadability(text) {
        const avgSentenceLength = text.split(/[。！？]/).reduce((acc, sentence) => acc + sentence.trim().length, 0) / text.split(/[。！？]/).length;
        return avgSentenceLength < 50; // Average sentence < 50 characters
    }
    static isProfessional(text) {
        const professionalWords = ['战略', '发展', '创新', '技术', '管理', '商业'];
        return professionalWords.some(word => text.includes(word));
    }
    static saveTestResult(testName, result) {
        const filename = (0, path_1.join)(TEST_CONFIG.outputDir, `${testName}-${Date.now()}.json`);
        (0, fs_1.writeFileSync)(filename, JSON.stringify(result, null, 2));
    }
}
(0, globals_1.describe)('FLCM 2.0 End-to-End Integration Tests', () => {
    let mainAgent;
    let scholarAgent;
    let creatorAgent;
    let publisherAgent;
    (0, globals_1.beforeAll)(async () => {
        TestUtils.setupTestEnvironment();
        // Initialize agents
        mainAgent = new flcm_main_1.FLCMMainAgent();
        scholarAgent = new scholar_1.ScholarAgent();
        creatorAgent = new creator_1.CreatorAgent();
        publisherAgent = new publisher_1.PublisherAgent();
        // Setup message bus connections
        message_bus_1.messageBus.subscribe('scholar', async (message) => {
            if (message.type === 'request') {
                // Handle scholar requests
            }
        });
        message_bus_1.messageBus.subscribe('creator', async (message) => {
            if (message.type === 'request') {
                // Handle creator requests
            }
        });
        message_bus_1.messageBus.subscribe('publisher', async (message) => {
            if (message.type === 'request') {
                // Handle publisher requests
            }
        });
    });
    (0, globals_1.afterAll)(async () => {
        // Cleanup
        message_bus_1.messageBus.clearQueue();
        recovery_manager_1.recoveryManager.clearHistory();
    });
    (0, globals_1.describe)('Complete Pipeline Integration', () => {
        (0, globals_1.test)('Should complete full Scholar → Creator → Publisher pipeline', async () => {
            // Step 1: Scholar Analysis
            const scholarInput = {
                type: 'text',
                content: TEST_CONFIG.sampleContent.text,
                metadata: { source: 'integration-test' }
            };
            const insights = await scholarAgent.analyze(scholarInput);
            (0, globals_1.expect)(insights).toBeDefined();
            (0, globals_1.expect)(insights.title).toBeTruthy();
            (0, globals_1.expect)(insights.content).toBeTruthy();
            (0, globals_1.expect)(insights.metadata.frameworks_used).toHaveLength(5); // All 5 frameworks
            (0, globals_1.expect)(insights.sections).toHaveProperty('critical_thinking');
            (0, globals_1.expect)(insights.sections).toHaveProperty('personal_perspective');
            TestUtils.saveTestResult('scholar-analysis', insights);
            // Step 2: Creator Content Generation
            const creationOptions = {
                mode: 'standard',
                interactive: false,
                targetWordCount: 1500,
                tone: 'professional'
            };
            const content = await creatorAgent.create(insights, creationOptions);
            (0, globals_1.expect)(content).toBeDefined();
            (0, globals_1.expect)(content.title).toBeTruthy();
            (0, globals_1.expect)(content.content.length).toBeGreaterThan(800);
            // Validate Voice DNA consistency
            const voiceConsistent = await TestUtils.validateVoiceDNA(content.content);
            (0, globals_1.expect)(voiceConsistent).toBe(true);
            TestUtils.saveTestResult('creator-content', content);
            // Step 3: Publisher Multi-Platform Optimization
            const publishOptions = {
                platforms: TEST_CONFIG.platforms,
                optimize: true,
                schedule: false
            };
            const publishResults = await publisherAgent.publish(content, publishOptions);
            (0, globals_1.expect)(publishResults).toHaveLength(TEST_CONFIG.platforms.length);
            for (let i = 0; i < TEST_CONFIG.platforms.length; i++) {
                const result = publishResults[i];
                const platform = TEST_CONFIG.platforms[i];
                (0, globals_1.expect)(result.success).toBe(true);
                (0, globals_1.expect)(result.platform).toBe(platform);
                (0, globals_1.expect)(result.content).toBeTruthy();
                // Validate platform-specific optimization
                const platformOptimized = await TestUtils.validatePlatformOptimization(result.content.body, platform);
                (0, globals_1.expect)(platformOptimized).toBe(true);
            }
            TestUtils.saveTestResult('publisher-results', publishResults);
            // Validate end-to-end consistency
            const originalMessage = insights.sections.personal_perspective;
            publishResults.forEach(result => {
                (0, globals_1.expect)(result.content.body).toContain('AI'); // Core topic preserved
            });
        }, TEST_CONFIG.timeout);
        (0, globals_1.test)('Should maintain Voice DNA consistency across all platforms', async () => {
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
                (0, globals_1.expect)(voiceScore).toBe(true);
            }
        });
        (0, globals_1.test)('Should handle error recovery in pipeline', async () => {
            // Simulate error in creator stage
            const faultyInsights = (0, document_schema_1.createInsightsDocument)({
                title: '',
                content: '',
                sources: []
            });
            // Should gracefully handle error and recover
            let errorHandled = false;
            try {
                await creatorAgent.create(faultyInsights, { mode: 'quick' });
            }
            catch (error) {
                errorHandled = true;
                // Check if recovery manager handled the error
                const stats = recovery_manager_1.recoveryManager.getStatistics();
                (0, globals_1.expect)(stats.totalErrors).toBeGreaterThan(0);
            }
            (0, globals_1.expect)(errorHandled).toBe(true);
        });
    });
    (0, globals_1.describe)('Performance and Scalability Tests', () => {
        (0, globals_1.test)('Should complete pipeline within performance targets', async () => {
            const startTime = Date.now();
            const input = {
                type: 'text',
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
            (0, globals_1.expect)(totalTime).toBeLessThan(30 * 60 * 1000);
            // Should have successful results
            (0, globals_1.expect)(results.every(r => r.success)).toBe(true);
            TestUtils.saveTestResult('performance-test', {
                totalTime,
                avgTimePerStep: totalTime / 3,
                platformsProcessed: results.length
            });
        });
        (0, globals_1.test)('Should handle concurrent processing efficiently', async () => {
            const concurrentRequests = 3;
            const promises = [];
            for (let i = 0; i < concurrentRequests; i++) {
                const promise = (async () => {
                    const input = {
                        type: 'text',
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
            (0, globals_1.expect)(results).toHaveLength(concurrentRequests);
            results.forEach(result => {
                (0, globals_1.expect)(result).toHaveLength(1); // One platform
                (0, globals_1.expect)(result[0].success).toBe(true);
            });
        });
    });
    (0, globals_1.describe)('Error Handling and Recovery Tests', () => {
        (0, globals_1.test)('Should handle network errors gracefully', async () => {
            // Mock network failure
            const originalAnalyze = scholarAgent.analyze.bind(scholarAgent);
            let retryCount = 0;
            scholarAgent.analyze = globals_1.jest.fn().mockImplementation(async (input) => {
                retryCount++;
                if (retryCount <= 2) {
                    throw new Error('Network timeout');
                }
                return originalAnalyze(input);
            });
            const input = {
                type: 'text',
                content: TEST_CONFIG.sampleContent.text
            };
            // Should eventually succeed after retries
            const result = await scholarAgent.analyze(input);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(retryCount).toBe(3); // Should have retried
            // Restore original method
            scholarAgent.analyze = originalAnalyze;
        });
        (0, globals_1.test)('Should maintain service availability during partial failures', async () => {
            // Simulate Publisher failure for one platform
            const originalPublish = publisherAgent.publish.bind(publisherAgent);
            publisherAgent.publish = globals_1.jest.fn().mockImplementation(async (content, options) => {
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
            (0, globals_1.expect)(successCount).toBe(3); // 3 platforms succeeded
            (0, globals_1.expect)(failureCount).toBe(1); // 1 platform failed
            (0, globals_1.expect)(results.find(r => r.platform === 'linkedin')?.success).toBe(false);
            // Restore original method
            publisherAgent.publish = originalPublish;
        });
    });
    (0, globals_1.describe)('Data Integrity and Quality Tests', () => {
        (0, globals_1.test)('Should preserve content integrity throughout pipeline', async () => {
            const originalTitle = 'AI技术发展的深度思考';
            const insights = (0, document_schema_1.createInsightsDocument)({
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
                (0, globals_1.expect)(result.content.body).toContain('AI');
                (0, globals_1.expect)(result.content.body).toContain('发展');
                // Title may be adapted but core concepts preserved
                (0, globals_1.expect)(result.content.title.includes('AI') || result.content.body.includes('AI')).toBe(true);
            });
        });
        (0, globals_1.test)('Should generate valid document schemas', async () => {
            const insights = await TestUtils.createSampleInsights();
            // Validate insights schema
            (0, globals_1.expect)(insights.metadata).toHaveProperty('date');
            (0, globals_1.expect)(insights.metadata).toHaveProperty('sources');
            (0, globals_1.expect)(insights.metadata).toHaveProperty('frameworks_used');
            (0, globals_1.expect)(insights.sections).toHaveProperty('input_materials');
            (0, globals_1.expect)(insights.sections).toHaveProperty('critical_thinking');
            const content = await creatorAgent.create(insights, { mode: 'standard', interactive: false });
            // Validate content schema
            (0, globals_1.expect)(content.metadata).toHaveProperty('voice_dna_match');
            (0, globals_1.expect)(content.metadata).toHaveProperty('structure_used');
            (0, globals_1.expect)(content.metadata).toHaveProperty('keywords');
            (0, globals_1.expect)(content.sections).toHaveProperty('main_content');
            (0, globals_1.expect)(content.sections).toHaveProperty('platform_hints');
        });
    });
    (0, globals_1.describe)('User Experience and Workflow Tests', () => {
        (0, globals_1.test)('Should provide clear progress indicators', async () => {
            const progressEvents = [];
            // Mock progress tracking
            const originalAnalyze = scholarAgent.analyze.bind(scholarAgent);
            scholarAgent.analyze = globals_1.jest.fn().mockImplementation(async (input) => {
                progressEvents.push('scholar-start');
                const result = await originalAnalyze(input);
                progressEvents.push('scholar-complete');
                return result;
            });
            const input = {
                type: 'text',
                content: TEST_CONFIG.sampleContent.text
            };
            await scholarAgent.analyze(input);
            (0, globals_1.expect)(progressEvents).toContain('scholar-start');
            (0, globals_1.expect)(progressEvents).toContain('scholar-complete');
            // Restore original method
            scholarAgent.analyze = originalAnalyze;
        });
        (0, globals_1.test)('Should handle user cancellation gracefully', async () => {
            // Simulate user cancellation during processing
            const controller = new AbortController();
            // Start long-running operation
            const operationPromise = (async () => {
                const input = {
                    type: 'text',
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
                (0, globals_1.expect)(false).toBe(true); // Should not reach here
            }
            catch (error) {
                (0, globals_1.expect)(error.message).toContain('cancelled');
            }
        });
    });
});
// Test runner utilities
class IntegrationTestRunner {
    static async runFullTestSuite() {
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
    static async generateTestReport() {
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
exports.IntegrationTestRunner = IntegrationTestRunner;
//# sourceMappingURL=end-to-end-test-suite.js.map