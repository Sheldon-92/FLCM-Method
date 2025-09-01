"use strict";
/**
 * Scholar Agent Performance Benchmarks Tests
 * Test performance targets and optimization requirements
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const document_schema_1 = require("../../../shared/pipeline/document-schema");
// Mock dependencies for performance testing
jest.mock('../../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));
// Mock processors with realistic timing
const mockProcessorTiming = (baseTime) => ({
    process: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, baseTime));
        return {
            text: 'Processed content',
            metadata: { wordCount: 100 },
        };
    }),
});
jest.mock('../processors/text-processor', () => ({
    TextProcessor: jest.fn(() => mockProcessorTiming(50)),
}));
jest.mock('../processors/pdf-processor', () => ({
    PDFProcessor: jest.fn(() => mockProcessorTiming(200)),
}));
jest.mock('../processors/web-processor', () => ({
    WebProcessor: jest.fn(() => mockProcessorTiming(500)),
}));
jest.mock('../processors/media-processor', () => ({
    MediaProcessor: jest.fn(() => mockProcessorTiming(1000)),
}));
jest.mock('../processors/code-processor', () => ({
    CodeProcessor: jest.fn(() => mockProcessorTiming(100)),
}));
// Mock frameworks with realistic timing
const mockFrameworkTiming = (baseTime, insights) => ({
    analyze: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, baseTime));
        return { result: 'analysis completed' };
    }),
    extractInsights: jest.fn().mockReturnValue(insights),
});
jest.mock('../frameworks/swot-used', () => ({
    SWOTUSEDFramework: jest.fn(() => mockFrameworkTiming(100, [
        'Strong foundation identified',
        'Market opportunities exist',
    ])),
}));
jest.mock('../frameworks/scamper', () => ({
    SCAMPERFramework: jest.fn(() => mockFrameworkTiming(120, [
        'Creative alternatives found',
        'Innovation potential high',
    ])),
}));
jest.mock('../frameworks/socratic', () => ({
    SocraticFramework: jest.fn(() => mockFrameworkTiming(150, [
        'Critical questions raised',
        'Assumptions challenged',
    ])),
}));
jest.mock('../frameworks/five-w-two-h', () => ({
    FiveW2HFramework: jest.fn(() => mockFrameworkTiming(80, [
        'Comprehensive overview achieved',
        'All dimensions covered',
    ])),
}));
jest.mock('../frameworks/pyramid', () => ({
    PyramidFramework: jest.fn(() => mockFrameworkTiming(90, [
        'Logical structure identified',
        'Clear hierarchy established',
    ])),
}));
describe('Scholar Agent Performance Benchmarks', () => {
    let agent;
    beforeEach(() => {
        agent = new index_1.ScholarAgent();
        jest.clearAllMocks();
    });
    describe('Core Performance Requirements', () => {
        it('should complete simple text analysis under 5 seconds', async () => {
            const input = {
                source: 'Simple text for quick analysis testing.',
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED'],
            };
            const startTime = Date.now();
            const result = await agent.analyze(input);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000);
            expect(result).toBeDefined();
            expect(result.metadata.sourceType).toBe(document_schema_1.SourceType.TEXT);
        });
        it('should handle multiple frameworks within performance target', async () => {
            const input = {
                source: 'Content for multi-framework analysis performance testing.',
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic'],
                options: { parallelFrameworks: true },
            };
            const startTime = Date.now();
            const result = await agent.analyze(input);
            const duration = Date.now() - startTime;
            // With parallel processing, should still be under 5 seconds
            expect(duration).toBeLessThan(5000);
            expect(result.frameworks).toHaveLength(3);
        });
        it('should maintain performance with all 5 frameworks', async () => {
            const input = {
                source: 'Comprehensive content for all framework analysis testing.',
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'],
                options: { parallelFrameworks: true },
            };
            const startTime = Date.now();
            const result = await agent.analyze(input);
            const duration = Date.now() - startTime;
            // Even with all frameworks, should complete under 5 seconds with parallel processing
            expect(duration).toBeLessThan(5000);
            expect(result.frameworks).toHaveLength(5);
        });
        it('should process different input types within acceptable time limits', async () => {
            const testCases = [
                { type: document_schema_1.SourceType.TEXT, maxTime: 1000 },
                { type: document_schema_1.SourceType.PDF, maxTime: 3000 },
                { type: document_schema_1.SourceType.WEBPAGE, maxTime: 4000 },
                { type: document_schema_1.SourceType.CODE, maxTime: 2000 },
            ];
            for (const testCase of testCases) {
                const input = {
                    source: `content.${testCase.type}`,
                    type: testCase.type,
                    frameworks: ['SWOT-USED'],
                };
                const startTime = Date.now();
                await agent.analyze(input);
                const duration = Date.now() - startTime;
                expect(duration).toBeLessThan(testCase.maxTime);
            }
        });
    });
    describe('Scalability Performance', () => {
        it('should handle large content efficiently', async () => {
            const largeContent = 'Large content block. '.repeat(1000); // ~20KB
            const input = {
                source: largeContent,
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED', 'Socratic'],
                options: { parallelFrameworks: true },
            };
            const startTime = Date.now();
            const result = await agent.analyze(input);
            const duration = Date.now() - startTime;
            // Large content should still complete within reasonable time
            expect(duration).toBeLessThan(10000);
            expect(result).toBeDefined();
        });
        it('should maintain performance under concurrent load', async () => {
            const promises = [];
            const concurrentRequests = 5;
            for (let i = 0; i < concurrentRequests; i++) {
                const input = {
                    source: `Concurrent analysis content ${i}`,
                    type: document_schema_1.SourceType.TEXT,
                    frameworks: ['SWOT-USED'],
                };
                promises.push(agent.analyze(input));
            }
            const startTime = Date.now();
            const results = await Promise.all(promises);
            const duration = Date.now() - startTime;
            // All concurrent requests should complete within reasonable time
            expect(duration).toBeLessThan(8000);
            expect(results).toHaveLength(concurrentRequests);
            expect(results.every(r => r !== undefined)).toBe(true);
        });
        it('should optimize memory usage for repeated analyses', async () => {
            const input = {
                source: 'Repeated analysis content for memory testing',
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED'],
                options: { cacheResults: true },
            };
            // Perform multiple analyses
            const iterations = 10;
            const durations = [];
            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now();
                await agent.analyze(input);
                const duration = Date.now() - startTime;
                durations.push(duration);
            }
            // After first analysis, cached results should be much faster
            const firstDuration = durations[0];
            const cachedDurations = durations.slice(1);
            const averageCachedDuration = cachedDurations.reduce((a, b) => a + b, 0) / cachedDurations.length;
            expect(averageCachedDuration).toBeLessThan(firstDuration * 0.5);
        });
    });
    describe('Framework Performance Optimization', () => {
        it('should benefit from parallel framework execution', async () => {
            const content = 'Content for parallel vs sequential framework testing';
            const frameworks = ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H'];
            // Test parallel execution
            const parallelInput = {
                source: content,
                frameworks,
                options: { parallelFrameworks: true },
            };
            const parallelStart = Date.now();
            await agent.analyze(parallelInput);
            const parallelDuration = Date.now() - parallelStart;
            // Test sequential execution
            const sequentialInput = {
                source: content,
                frameworks,
                options: { parallelFrameworks: false },
            };
            const sequentialStart = Date.now();
            await agent.analyze(sequentialInput);
            const sequentialDuration = Date.now() - sequentialStart;
            // Parallel should be faster than sequential
            expect(parallelDuration).toBeLessThan(sequentialDuration);
            expect(parallelDuration).toBeLessThan(sequentialDuration * 0.8);
        });
        it('should show performance improvement with framework selection', async () => {
            const content = 'Content for framework selection performance testing';
            // Test with all frameworks
            const allFrameworksInput = {
                source: content,
                frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'],
            };
            const allStart = Date.now();
            await agent.analyze(allFrameworksInput);
            const allDuration = Date.now() - allStart;
            // Test with selective frameworks
            const selectiveInput = {
                source: content,
                frameworks: ['SWOT-USED', 'Socratic'],
            };
            const selectiveStart = Date.now();
            await agent.analyze(selectiveInput);
            const selectiveDuration = Date.now() - selectiveStart;
            // Selective analysis should be faster
            expect(selectiveDuration).toBeLessThan(allDuration);
        });
    });
    describe('Resource Usage Optimization', () => {
        it('should track processing time metrics accurately', async () => {
            const inputs = [
                { source: 'First analysis', frameworks: ['SWOT-USED'] },
                { source: 'Second analysis', frameworks: ['SCAMPER'] },
                { source: 'Third analysis', frameworks: ['Socratic'] },
            ];
            for (const input of inputs) {
                await agent.analyze(input);
            }
            const metrics = agent.getMetrics();
            expect(metrics.totalAnalyses).toBe(3);
            expect(metrics.averageProcessingTime).toBeGreaterThan(0);
            expect(metrics.averageProcessingTime).toBeLessThan(5000);
        });
        it('should maintain consistent performance across input types', async () => {
            const inputTypes = [
                document_schema_1.SourceType.TEXT,
                document_schema_1.SourceType.MARKDOWN,
                document_schema_1.SourceType.CODE,
            ];
            const durations = {};
            for (const type of inputTypes) {
                const input = {
                    source: `content.${type}`,
                    type,
                    frameworks: ['SWOT-USED'],
                };
                const startTime = Date.now();
                await agent.analyze(input);
                const duration = Date.now() - startTime;
                durations[type] = duration;
            }
            // All input types should have reasonable processing times
            Object.values(durations).forEach(duration => {
                expect(duration).toBeLessThan(3000);
            });
            // Performance should be relatively consistent
            const times = Object.values(durations);
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);
            expect(maxTime / minTime).toBeLessThan(3); // Max 3x difference
        });
        it('should optimize cache hit rates', async () => {
            const input = {
                source: 'Cache optimization test content',
                frameworks: ['SWOT-USED'],
                options: { cacheResults: true },
            };
            // First analysis (cache miss)
            const firstStart = Date.now();
            await agent.analyze(input);
            const firstDuration = Date.now() - firstStart;
            // Second analysis (cache hit)
            const secondStart = Date.now();
            await agent.analyze(input);
            const secondDuration = Date.now() - secondStart;
            // Cache hit should be significantly faster
            expect(secondDuration).toBeLessThan(firstDuration * 0.3);
            expect(secondDuration).toBeLessThan(100); // Should be very fast
        });
    });
    describe('Error Handling Performance', () => {
        it('should fail fast for invalid inputs', async () => {
            const invalidInputs = [
                { source: '' },
                { source: 'test', options: { maxProcessingTime: 500 } }, // Invalid time limit
            ];
            for (const input of invalidInputs) {
                const startTime = Date.now();
                try {
                    await agent.analyze(input);
                }
                catch (error) {
                    const duration = Date.now() - startTime;
                    // Should fail quickly, not wait for full processing
                    expect(duration).toBeLessThan(100);
                }
            }
        });
        it('should maintain performance during error recovery', async () => {
            const agent = new index_1.ScholarAgent();
            // Force an error
            try {
                await agent.applyFramework('test', 'InvalidFramework');
            }
            catch (error) {
                // Expected error
            }
            // Subsequent valid analysis should still perform well
            const validInput = {
                source: 'Valid content after error',
                frameworks: ['SWOT-USED'],
            };
            const startTime = Date.now();
            await agent.analyze(validInput);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000);
        });
    });
    describe('Stress Testing', () => {
        it('should handle burst requests efficiently', async () => {
            const burstSize = 10;
            const requests = [];
            // Create burst of requests
            for (let i = 0; i < burstSize; i++) {
                const input = {
                    source: `Burst request ${i}`,
                    frameworks: ['SWOT-USED'],
                };
                requests.push(agent.analyze(input));
            }
            const startTime = Date.now();
            const results = await Promise.all(requests);
            const totalDuration = Date.now() - startTime;
            // All requests should complete
            expect(results).toHaveLength(burstSize);
            expect(results.every(r => r !== undefined)).toBe(true);
            // Average per request should be reasonable
            const avgDuration = totalDuration / burstSize;
            expect(avgDuration).toBeLessThan(2000);
        });
        it('should maintain performance under sustained load', async () => {
            const iterations = 20;
            const durations = [];
            for (let i = 0; i < iterations; i++) {
                const input = {
                    source: `Sustained load test ${i}`,
                    frameworks: ['SWOT-USED'],
                };
                const startTime = Date.now();
                await agent.analyze(input);
                const duration = Date.now() - startTime;
                durations.push(duration);
            }
            // Performance should not degrade significantly over time
            const firstHalf = durations.slice(0, iterations / 2);
            const secondHalf = durations.slice(iterations / 2);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            // Second half should not be more than 50% slower
            expect(secondAvg).toBeLessThan(firstAvg * 1.5);
        });
    });
    describe('Performance Regression Detection', () => {
        it('should meet baseline performance expectations', async () => {
            const baselineTests = [
                {
                    name: 'Simple text analysis',
                    input: { source: 'Simple text', frameworks: ['SWOT-USED'] },
                    maxTime: 2000,
                },
                {
                    name: 'Multi-framework analysis',
                    input: { source: 'Complex content', frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic'] },
                    maxTime: 4000,
                },
                {
                    name: 'Comprehensive analysis',
                    input: { source: 'Very detailed content', frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'] },
                    maxTime: 5000,
                },
            ];
            for (const test of baselineTests) {
                const startTime = Date.now();
                const result = await agent.analyze(test.input);
                const duration = Date.now() - startTime;
                expect(duration).toBeLessThan(test.maxTime);
                expect(result).toBeDefined();
            }
        });
        it('should track performance metrics consistently', async () => {
            const testRuns = 5;
            const results = [];
            for (let i = 0; i < testRuns; i++) {
                const input = {
                    source: `Performance tracking test ${i}`,
                    frameworks: ['SWOT-USED'],
                };
                await agent.analyze(input);
                results.push(agent.getMetrics());
            }
            // Metrics should be incrementing correctly
            for (let i = 1; i < results.length; i++) {
                expect(results[i].totalAnalyses).toBe(results[i - 1].totalAnalyses + 1);
                expect(results[i].averageProcessingTime).toBeGreaterThan(0);
            }
        });
    });
});
//# sourceMappingURL=performance-benchmarks.test.js.map