"use strict";
/**
 * Scholar Agent Unit Tests
 * Comprehensive test suite covering all Scholar Agent functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const document_schema_1 = require("../../../shared/pipeline/document-schema");
// Mock dependencies
jest.mock('../../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));
// Mock processors
jest.mock('../processors/text-processor', () => ({
    TextProcessor: jest.fn().mockImplementation(() => ({
        process: jest.fn().mockResolvedValue({
            text: 'Processed text content',
            metadata: { wordCount: 10 },
        }),
    })),
}));
jest.mock('../processors/pdf-processor', () => ({
    PDFProcessor: jest.fn().mockImplementation(() => ({
        process: jest.fn().mockResolvedValue({
            text: 'Processed PDF content',
            metadata: { pages: 5 },
        }),
    })),
}));
jest.mock('../processors/web-processor', () => ({
    WebProcessor: jest.fn().mockImplementation(() => ({
        process: jest.fn().mockResolvedValue({
            text: 'Processed web content',
            metadata: { url: 'https://example.com' },
        }),
    })),
}));
jest.mock('../processors/media-processor', () => ({
    MediaProcessor: jest.fn().mockImplementation(() => ({
        process: jest.fn().mockResolvedValue({
            text: 'Processed media content',
            metadata: { duration: 120 },
        }),
    })),
}));
jest.mock('../processors/code-processor', () => ({
    CodeProcessor: jest.fn().mockImplementation(() => ({
        process: jest.fn().mockResolvedValue({
            text: 'Processed code content',
            metadata: { language: 'javascript' },
        }),
    })),
}));
// Mock frameworks
jest.mock('../frameworks/swot-used', () => ({
    SWOTUSEDFramework: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            strengths: ['Strong foundation'],
            weaknesses: ['Needs improvement'],
            opportunities: ['Market expansion'],
            threats: ['Competition'],
            urgency: 'Medium',
            satisfaction: 'High',
            ease: 'Medium',
            delight: 'High',
        }),
        extractInsights: jest.fn().mockReturnValue([
            'Strong foundation provides competitive advantage',
            'Market expansion opportunities identified',
        ]),
    })),
}));
jest.mock('../frameworks/scamper', () => ({
    SCAMPERFramework: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            substitute: ['Alternative solutions'],
            combine: ['Integration opportunities'],
            adapt: ['Adaptation strategies'],
            modify: ['Modification suggestions'],
            purpose: ['Purpose alternatives'],
            eliminate: ['Elimination candidates'],
            reverse: ['Reverse approaches'],
        }),
        extractInsights: jest.fn().mockReturnValue([
            'Alternative solutions show promise',
            'Integration opportunities exist',
        ]),
    })),
}));
jest.mock('../frameworks/socratic', () => ({
    SocraticFramework: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            questions: ['What is the core problem?', 'Why does this matter?'],
            assumptions: ['Assumption 1', 'Assumption 2'],
            evidence: ['Evidence 1', 'Evidence 2'],
            implications: ['Implication 1', 'Implication 2'],
        }),
        extractInsights: jest.fn().mockReturnValue([
            'Core problem clearly identified',
            'Assumptions need validation',
        ]),
    })),
}));
jest.mock('../frameworks/five-w-two-h', () => ({
    FiveW2HFramework: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            who: 'Target audience',
            what: 'Main topic',
            when: 'Timeline',
            where: 'Context',
            why: 'Purpose',
            how: 'Method',
            howMuch: 'Resources',
        }),
        extractInsights: jest.fn().mockReturnValue([
            'Target audience clearly defined',
            'Timeline well established',
        ]),
    })),
}));
jest.mock('../frameworks/pyramid', () => ({
    PyramidFramework: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            conclusion: 'Main conclusion',
            keyArguments: ['Argument 1', 'Argument 2'],
            supportingData: ['Data 1', 'Data 2'],
        }),
        extractInsights: jest.fn().mockReturnValue([
            'Main conclusion well supported',
            'Strong argumentation structure',
        ]),
    })),
}));
describe('ScholarAgent', () => {
    let agent;
    beforeEach(() => {
        agent = new index_1.ScholarAgent();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Agent Initialization', () => {
        it('should initialize with correct properties', () => {
            expect(agent.id).toBe('scholar');
            expect(agent.name).toBe('Scholar Agent');
            expect(agent.version).toBe('2.0.0');
        });
        it('should have correct capabilities', () => {
            const capabilities = agent.getCapabilities();
            expect(capabilities).toHaveLength(2);
            const multiSource = capabilities.find(c => c.id === 'multi-source-analysis');
            expect(multiSource).toBeDefined();
            expect(multiSource?.inputTypes).toEqual(Object.values(document_schema_1.SourceType));
            const framework = capabilities.find(c => c.id === 'framework-analysis');
            expect(framework).toBeDefined();
        });
        it('should initialize metrics correctly', () => {
            const metrics = agent.getMetrics();
            expect(metrics.totalAnalyses).toBe(0);
            expect(metrics.averageProcessingTime).toBe(0);
            expect(metrics.errorRate).toBe(0);
        });
    });
    describe('Input Type Detection', () => {
        it('should detect webpage URLs correctly', () => {
            expect(agent.detectInputType('https://example.com')).toBe(document_schema_1.SourceType.WEBPAGE);
            expect(agent.detectInputType('http://example.com')).toBe(document_schema_1.SourceType.WEBPAGE);
        });
        it('should detect PDF files correctly', () => {
            expect(agent.detectInputType('document.pdf')).toBe(document_schema_1.SourceType.PDF);
        });
        it('should detect markdown files correctly', () => {
            expect(agent.detectInputType('readme.md')).toBe(document_schema_1.SourceType.MARKDOWN);
        });
        it('should detect video files correctly', () => {
            expect(agent.detectInputType('video.mp4')).toBe(document_schema_1.SourceType.VIDEO);
            expect(agent.detectInputType('video.avi')).toBe(document_schema_1.SourceType.VIDEO);
        });
        it('should detect audio files correctly', () => {
            expect(agent.detectInputType('audio.mp3')).toBe(document_schema_1.SourceType.AUDIO);
            expect(agent.detectInputType('audio.wav')).toBe(document_schema_1.SourceType.AUDIO);
        });
        it('should detect image files correctly', () => {
            expect(agent.detectInputType('image.jpg')).toBe(document_schema_1.SourceType.IMAGE);
            expect(agent.detectInputType('image.png')).toBe(document_schema_1.SourceType.IMAGE);
        });
        it('should detect code files correctly', () => {
            expect(agent.detectInputType('script.js')).toBe(document_schema_1.SourceType.CODE);
            expect(agent.detectInputType('app.py')).toBe(document_schema_1.SourceType.CODE);
            expect(agent.detectInputType('component.ts')).toBe(document_schema_1.SourceType.CODE);
        });
        it('should detect spreadsheet files correctly', () => {
            expect(agent.detectInputType('data.xlsx')).toBe(document_schema_1.SourceType.SPREADSHEET);
            expect(agent.detectInputType('data.csv')).toBe(document_schema_1.SourceType.SPREADSHEET);
        });
        it('should default to text for unknown types', () => {
            expect(agent.detectInputType('unknown.xyz')).toBe(document_schema_1.SourceType.TEXT);
            expect(agent.detectInputType('plain text')).toBe(document_schema_1.SourceType.TEXT);
        });
        it('should handle buffer inputs', () => {
            const buffer = Buffer.from('test data');
            expect(agent.detectInputType(buffer)).toBe(document_schema_1.SourceType.TEXT);
        });
    });
    describe('Framework Analysis', () => {
        const testContent = 'This is test content for analysis';
        it('should apply SWOT-USED framework successfully', async () => {
            const result = await agent.applyFramework(testContent, 'SWOT-USED');
            expect(result.framework).toBe('SWOT-USED');
            expect(result.results).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.insights).toHaveLength(2);
            expect(result.processingTime).toBeGreaterThan(0);
        });
        it('should apply SCAMPER framework successfully', async () => {
            const result = await agent.applyFramework(testContent, 'SCAMPER');
            expect(result.framework).toBe('SCAMPER');
            expect(result.results).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.insights).toHaveLength(2);
        });
        it('should apply Socratic framework successfully', async () => {
            const result = await agent.applyFramework(testContent, 'Socratic');
            expect(result.framework).toBe('Socratic');
            expect(result.results).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.insights).toHaveLength(2);
        });
        it('should apply 5W2H framework successfully', async () => {
            const result = await agent.applyFramework(testContent, '5W2H');
            expect(result.framework).toBe('5W2H');
            expect(result.results).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.insights).toHaveLength(2);
        });
        it('should apply Pyramid framework successfully', async () => {
            const result = await agent.applyFramework(testContent, 'Pyramid');
            expect(result.framework).toBe('Pyramid');
            expect(result.results).toBeDefined();
            expect(result.confidence).toBeGreaterThan(0);
            expect(result.insights).toHaveLength(2);
        });
        it('should throw error for unknown framework', async () => {
            await expect(agent.applyFramework(testContent, 'UnknownFramework')).rejects.toThrow('Framework not implemented: UnknownFramework');
        });
        it('should apply multiple frameworks in parallel', async () => {
            const startTime = Date.now();
            const results = await agent['applyFrameworks'](testContent, ['SWOT-USED', 'SCAMPER', 'Socratic'], true);
            const endTime = Date.now();
            expect(results).toHaveLength(3);
            expect(endTime - startTime).toBeLessThan(100); // Should be very fast for mocked
        });
        it('should apply multiple frameworks sequentially', async () => {
            const results = await agent['applyFrameworks'](testContent, ['SWOT-USED', 'SCAMPER'], false);
            expect(results).toHaveLength(2);
            expect(results[0].framework).toBe('SWOT-USED');
            expect(results[1].framework).toBe('SCAMPER');
        });
    });
    describe('Main Analysis Method', () => {
        it('should perform complete text analysis successfully', async () => {
            const input = {
                source: 'This is sample text content for analysis',
                type: document_schema_1.SourceType.TEXT,
                frameworks: ['SWOT-USED', 'Socratic'],
            };
            const result = await agent.analyze(input);
            expect(result).toBeDefined();
            expect(result.metadata.sourceType).toBe(document_schema_1.SourceType.TEXT);
            expect(result.frameworks).toContain('SWOT-USED');
            expect(result.frameworks).toContain('Socratic');
            expect(result.keyFindings).toBeDefined();
            expect(result.recommendations).toBeDefined();
        });
        it('should handle web URL analysis', async () => {
            const input = {
                source: 'https://example.com/article',
                frameworks: ['5W2H'],
            };
            const result = await agent.analyze(input);
            expect(result).toBeDefined();
            expect(result.metadata.sourceType).toBe(document_schema_1.SourceType.WEBPAGE);
        });
        it('should handle PDF file analysis', async () => {
            const input = {
                source: '/path/to/document.pdf',
                frameworks: ['Pyramid'],
            };
            const result = await agent.analyze(input);
            expect(result).toBeDefined();
            expect(result.metadata.sourceType).toBe(document_schema_1.SourceType.PDF);
        });
        it('should use default frameworks when none specified', async () => {
            const input = {
                source: 'Test content without frameworks',
            };
            const result = await agent.analyze(input);
            expect(result.frameworks).toContain('SWOT-USED');
            expect(result.frameworks).toContain('Socratic');
            expect(result.frameworks).toContain('5W2H');
        });
        it('should handle caching when enabled', async () => {
            const input = {
                source: 'Cacheable content',
                options: { cacheResults: true },
            };
            // First analysis
            const result1 = await agent.analyze(input);
            // Second analysis (should use cache)
            const result2 = await agent.analyze(input);
            expect(result1).toEqual(result2);
        });
        it('should extract citations when requested', async () => {
            const input = {
                source: 'Text with citations [1] and (Author, 2023) and https://example.com',
                options: { extractCitations: true },
            };
            const result = await agent.analyze(input);
            expect(result.references).toBeDefined();
            expect(result.references?.length).toBeGreaterThan(0);
        });
        it('should generate summary when requested', async () => {
            const input = {
                source: 'Content for summary generation',
                options: { generateSummary: true },
            };
            const result = await agent.analyze(input);
            expect(result.summary).toBeDefined();
            expect(result.summary).toContain('Analysis Summary');
        });
        it('should validate input requirements', async () => {
            const invalidInput = {
                source: '', // Empty source
            };
            await expect(agent.analyze(invalidInput)).rejects.toThrow('Input source is required');
        });
        it('should validate processing time limits', async () => {
            const invalidInput = {
                source: 'Test content',
                options: { maxProcessingTime: 500 }, // Too short
            };
            await expect(agent.analyze(invalidInput)).rejects.toThrow('Max processing time must be at least 1000ms');
        });
    });
    describe('Performance Metrics', () => {
        it('should track analysis metrics correctly', async () => {
            const input = {
                source: 'Performance test content',
                frameworks: ['SWOT-USED'],
            };
            await agent.analyze(input);
            const metrics = agent.getMetrics();
            expect(metrics.totalAnalyses).toBe(1);
            expect(metrics.averageProcessingTime).toBeGreaterThan(0);
            expect(metrics.frameworkUsage['SWOT-USED']).toBe(1);
            expect(metrics.inputTypeDistribution[document_schema_1.SourceType.TEXT]).toBe(1);
        });
        it('should track error rates correctly', async () => {
            // Force an error by providing invalid framework
            try {
                await agent.applyFramework('test', 'InvalidFramework');
            }
            catch (error) {
                // Expected error
            }
            const metrics = agent.getMetrics();
            expect(metrics.errorRate).toBeGreaterThan(0);
        });
        it('should calculate average processing time correctly', async () => {
            const input = {
                source: 'Performance test content',
                frameworks: ['SWOT-USED'],
            };
            await agent.analyze(input);
            await agent.analyze(input);
            const metrics = agent.getMetrics();
            expect(metrics.totalAnalyses).toBe(2);
            expect(metrics.averageProcessingTime).toBeGreaterThan(0);
        });
    });
    describe('Performance Benchmarks', () => {
        it('should complete simple analysis under 5 seconds', async () => {
            const input = {
                source: 'Quick analysis test content',
                frameworks: ['SWOT-USED'],
            };
            const startTime = Date.now();
            await agent.analyze(input);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000);
        });
        it('should handle multiple frameworks efficiently', async () => {
            const input = {
                source: 'Multi-framework analysis test',
                frameworks: ['SWOT-USED', 'SCAMPER', 'Socratic', '5W2H', 'Pyramid'],
                options: { parallelFrameworks: true },
            };
            const startTime = Date.now();
            await agent.analyze(input);
            const duration = Date.now() - startTime;
            // With parallel processing, should still be under 5 seconds
            expect(duration).toBeLessThan(5000);
        });
        it('should maintain performance with caching', async () => {
            const input = {
                source: 'Cached performance test',
                options: { cacheResults: true },
            };
            // First run
            const start1 = Date.now();
            await agent.analyze(input);
            const duration1 = Date.now() - start1;
            // Second run (cached)
            const start2 = Date.now();
            await agent.analyze(input);
            const duration2 = Date.now() - start2;
            // Cached run should be significantly faster
            expect(duration2).toBeLessThan(duration1 / 2);
        });
    });
    describe('Agent Request Processing', () => {
        it('should process agent requests successfully', async () => {
            const request = {
                id: 'test-request',
                timestamp: new Date(),
                data: {
                    source: 'Test content for request',
                    frameworks: ['SWOT-USED'],
                },
            };
            const response = await agent.processRequest(request);
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.metadata?.agent).toBe('scholar');
            expect(response.metadata?.processingTime).toBeGreaterThan(0);
        });
        it('should handle request processing errors', async () => {
            const request = {
                id: 'test-request',
                timestamp: new Date(),
                data: {
                    source: '', // Invalid source
                },
            };
            const response = await agent.processRequest(request);
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(response.metadata?.agent).toBe('scholar');
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
            // Should not throw errors
        });
    });
});
//# sourceMappingURL=scholar-agent.test.js.map