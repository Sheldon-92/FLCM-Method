"use strict";
/**
 * Creator Agent Unit Tests
 * Comprehensive test suite covering all Creator Agent functionality
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
// Mock VoiceDNAAnalyzer
jest.mock('../voice-dna-analyzer', () => ({
    VoiceDNAAnalyzer: jest.fn().mockImplementation(() => ({
        analyze: jest.fn().mockResolvedValue({
            id: 'voice-profile-1',
            userId: 'user-123',
            created: new Date(),
            updated: new Date(),
            sampleCount: 5,
            style: {
                formality: 0.7,
                complexity: 0.6,
                emotionality: 0.4,
                technicality: 0.8,
            },
            patterns: {
                sentenceLength: { avg: 18, std: 6 },
                paragraphLength: { avg: 4, std: 2 },
                vocabularyRichness: 0.75,
                punctuationStyle: { '.': 0.8, '!': 0.1, '?': 0.1 },
            },
            vocabulary: {
                commonWords: ['the', 'and', 'that'],
                uniquePhrases: ['cutting-edge', 'state-of-the-art'],
                preferredTransitions: ['Furthermore', 'Additionally', 'Moreover'],
                avoidedWords: ['very', 'really'],
            },
            tone: {
                sentiment: 'positive',
                energy: 'high',
                confidence: 0.85,
            },
        }),
        analyzeContent: jest.fn().mockResolvedValue({
            style: {
                formality: 0.7,
                complexity: 0.6,
                emotionality: 0.4,
                technicality: 0.8,
            },
            patterns: {
                sentenceLength: { avg: 18, std: 6 },
                paragraphLength: { avg: 4, std: 2 },
                vocabularyRichness: 0.75,
                punctuationStyle: { '.': 0.8, '!': 0.1, '?': 0.1 },
            },
            vocabulary: {
                commonWords: ['the', 'and', 'that'],
                uniquePhrases: ['innovative', 'comprehensive'],
                preferredTransitions: ['Furthermore', 'Additionally'],
                avoidedWords: [],
            },
            tone: {
                sentiment: 'positive',
                energy: 'high',
                confidence: 0.85,
            },
        }),
    })),
}));
// Mock ContentGenerator
jest.mock('../content-generator', () => ({
    ContentGenerator: jest.fn().mockImplementation(() => ({
        generate: jest.fn().mockResolvedValue(`
      # Analysis Insights: AI in Business Operations
      
      ## Executive Summary
      The comprehensive analysis reveals significant opportunities for AI implementation in modern business environments.
      
      ## Key Findings
      Our research indicates that artificial intelligence technologies offer substantial benefits for operational efficiency.
      
      ## Strategic Recommendations
      Organizations should prioritize gradual integration with proper change management protocols.
      
      ## Implementation Roadmap
      A phased approach ensures successful adoption while minimizing disruption to existing workflows.
      
      ## Conclusion
      The strategic implementation of AI technologies presents unprecedented opportunities for competitive advantage.
    `),
        generateDraft: jest.fn().mockResolvedValue(`
      # Draft: AI Business Transformation
      
      Initial analysis shows promising results for AI integration in business operations.
      Further refinement needed based on stakeholder feedback.
    `),
        refine: jest.fn().mockImplementation(async (content, feedback) => {
            return content.replace('Initial analysis', 'Refined analysis').replace('Further refinement needed', 'Enhanced based on feedback');
        }),
    })),
}));
// Mock DialogueManager
jest.mock('../dialogue-manager', () => ({
    DialogueManager: jest.fn().mockImplementation(() => ({
        startSession: jest.fn().mockResolvedValue({
            id: 'session-123',
            title: 'AI Implementation Strategy',
            interactive: true,
        }),
        getFeedback: jest.fn().mockImplementation(async (session, content) => {
            // Simulate feedback iterations
            const iteration = content.includes('Refined') ? 3 : 1;
            return {
                satisfied: iteration >= 2,
                suggestions: iteration < 2 ? ['Add more specific examples', 'Include implementation timeline'] : [],
                score: iteration >= 2 ? 9 : 7,
            };
        }),
    })),
}));
describe('CreatorAgent', () => {
    let agent;
    let mockInsightsDocument;
    beforeEach(() => {
        agent = new index_1.CreatorAgent();
        // Create mock insights document
        mockInsightsDocument = (0, document_schema_1.createInsightsDocument)({
            type: 'text',
            path: 'test-source',
            hash: 'test-hash',
        }, ['SWOT-USED', 'Socratic'], 'Test insights content with key findings and recommendations.', 'Scholar Agent');
        mockInsightsDocument.keyFindings = [
            'AI technologies offer significant automation potential',
            'Implementation requires substantial investment in training',
            'Competitive advantages emerge from early adoption',
        ];
        mockInsightsDocument.recommendations = [
            'Develop comprehensive change management strategy',
            'Invest in employee training and development',
            'Implement phased rollout approach',
        ];
        mockInsightsDocument.summary = 'Analysis reveals opportunities and challenges in AI implementation';
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Agent Initialization', () => {
        it('should initialize with correct properties', () => {
            expect(agent.id).toBe('creator');
            expect(agent.name).toBe('Creator Agent');
            expect(agent.version).toBe('2.0.0');
        });
        it('should have correct capabilities', () => {
            const capabilities = agent.getCapabilities();
            expect(capabilities).toHaveLength(3);
            const voiceDNA = capabilities.find(c => c.id === 'voice-dna-generation');
            expect(voiceDNA).toBeDefined();
            expect(voiceDNA?.inputTypes).toContain('text');
            const contentCreation = capabilities.find(c => c.id === 'content-creation');
            expect(contentCreation).toBeDefined();
            expect(contentCreation?.inputTypes).toContain('insights');
            const dialogue = capabilities.find(c => c.id === 'collaborative-dialogue');
            expect(dialogue).toBeDefined();
        });
    });
    describe('Content Creation Modes', () => {
        describe('Quick Mode', () => {
            it('should create content in quick mode successfully', async () => {
                const options = {
                    mode: 'quick',
                };
                const result = await agent.create(mockInsightsDocument, options);
                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toContain('Analysis Insights');
                expect(result.metadata.mode).toBe('quick');
                expect(result.metadata.voiceDNA.confidence).toBeGreaterThan(0.8);
            });
            it('should complete quick mode within time target', async () => {
                const options = {
                    mode: 'quick',
                };
                const startTime = Date.now();
                await agent.create(mockInsightsDocument, options);
                const duration = Date.now() - startTime;
                // Quick mode should complete within 3 minutes (180 seconds)
                expect(duration).toBeLessThan(180000);
            });
            it('should extract key points for quick mode', async () => {
                const options = {
                    mode: 'quick',
                };
                const result = await agent.create(mockInsightsDocument, options);
                // Should include key findings in the content
                expect(result.content).toContain('automation');
                expect(result.content).toContain('implementation');
                expect(result.sections).toBeDefined();
                expect(result.sections.length).toBeGreaterThan(2);
            });
        });
        describe('Standard Mode', () => {
            it('should create content in standard mode successfully', async () => {
                const options = {
                    mode: 'standard',
                    framework: 'analytical',
                    targetWordCount: 1500,
                    tone: 'professional',
                };
                const result = await agent.create(mockInsightsDocument, options);
                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toContain('comprehensive analysis');
                expect(result.metadata.mode).toBe('standard');
                expect(result.metadata.wordCount).toBeGreaterThan(100);
            });
            it('should respect framework selection in standard mode', async () => {
                const frameworks = ['narrative', 'analytical', 'instructional', 'persuasive', 'descriptive'];
                for (const framework of frameworks) {
                    const options = {
                        mode: 'standard',
                        framework,
                    };
                    const result = await agent.create(mockInsightsDocument, options);
                    expect(result).toBeDefined();
                    expect(result.content.length).toBeGreaterThan(100);
                }
            });
            it('should handle different tone settings', async () => {
                const tones = ['professional', 'casual', 'academic', 'creative'];
                for (const tone of tones) {
                    const options = {
                        mode: 'standard',
                        tone,
                    };
                    const result = await agent.create(mockInsightsDocument, options);
                    expect(result).toBeDefined();
                    expect(result.content).toBeDefined();
                }
            });
            it('should approximate target word count', async () => {
                const targetCounts = [500, 1000, 1500, 2000];
                for (const targetWordCount of targetCounts) {
                    const options = {
                        mode: 'standard',
                        targetWordCount,
                    };
                    const result = await agent.create(mockInsightsDocument, options);
                    // Should be within reasonable range of target (±30%)
                    const actualWords = result.content.split(/\s+/).length;
                    expect(actualWords).toBeGreaterThan(targetWordCount * 0.7);
                    expect(actualWords).toBeLessThan(targetWordCount * 1.3);
                }
            });
        });
        describe('Custom Mode', () => {
            it('should create content in custom mode successfully', async () => {
                const options = {
                    mode: 'custom',
                    interactive: true,
                };
                const result = await agent.create(mockInsightsDocument, options);
                expect(result).toBeDefined();
                expect(result.title).toBeDefined();
                expect(result.content).toContain('Enhanced based on feedback');
                expect(result.metadata.mode).toBe('custom');
            });
            it('should handle iterative refinement in custom mode', async () => {
                const options = {
                    mode: 'custom',
                    interactive: true,
                };
                const result = await agent.create(mockInsightsDocument, options);
                // Content should show signs of refinement
                expect(result.content).toContain('Refined analysis');
                expect(result.content).not.toContain('Further refinement needed');
            });
            it('should support non-interactive custom mode', async () => {
                const options = {
                    mode: 'custom',
                    interactive: false,
                };
                const result = await agent.create(mockInsightsDocument, options);
                expect(result).toBeDefined();
                expect(result.metadata.mode).toBe('custom');
            });
        });
    });
    describe('Voice DNA System', () => {
        it('should extract Voice DNA from samples successfully', async () => {
            const samples = [
                'This is the first writing sample with professional tone.',
                'Here we have another example showcasing the author\'s style.',
                'The third sample demonstrates consistency in voice and approach.',
                'Fourth example continues the established writing pattern.',
                'Finally, this sample completes the Voice DNA analysis dataset.',
            ];
            const profile = await agent.extractVoiceDNA(samples);
            expect(profile).toBeDefined();
            expect(profile.id).toBeDefined();
            expect(profile.sampleCount).toBe(5);
            expect(profile.style.formality).toBeGreaterThan(0);
            expect(profile.style.formality).toBeLessThanOrEqual(1);
            expect(profile.patterns.sentenceLength.avg).toBeGreaterThan(0);
            expect(profile.vocabulary.commonWords.length).toBeGreaterThan(0);
        });
        it('should require minimum samples for Voice DNA extraction', async () => {
            const insufficientSamples = [
                'Sample one',
                'Sample two',
                'Sample three',
            ];
            await expect(agent.extractVoiceDNA(insufficientSamples)).rejects.toThrow('Minimum 5 samples required for Voice DNA extraction');
        });
        it('should apply Voice DNA to content correctly', async () => {
            const content = 'This is original content that will be transformed.';
            const profile = {
                id: 'test-profile',
                userId: 'user-123',
                created: new Date(),
                updated: new Date(),
                sampleCount: 5,
                style: {
                    formality: 0.3,
                    complexity: 0.5,
                    emotionality: 0.6,
                    technicality: 0.2,
                },
                patterns: {
                    sentenceLength: { avg: 12, std: 4 },
                    paragraphLength: { avg: 3, std: 1 },
                    vocabularyRichness: 0.6,
                    punctuationStyle: { '.': 0.6, '!': 0.3, '?': 0.1 },
                },
                vocabulary: {
                    commonWords: ['cool', 'awesome', 'great'],
                    uniquePhrases: ['that\'s amazing', 'super effective'],
                    preferredTransitions: ['Also', 'Plus', 'And then'],
                    avoidedWords: ['utilize', 'commence'],
                },
                tone: {
                    sentiment: 'positive',
                    energy: 'high',
                    confidence: 0.8,
                },
            };
            const styledContent = await agent.applyVoiceDNA(content, profile);
            expect(styledContent).toBeDefined();
            expect(styledContent.length).toBeGreaterThan(0);
            // Should show informal contractions due to low formality
            expect(styledContent).toMatch(/don't|can't|won't/i);
        });
        it('should validate consistency with high accuracy', async () => {
            const content = 'Professional content that matches the established voice profile patterns.';
            const profile = {
                id: 'consistent-profile',
                userId: 'user-123',
                created: new Date(),
                updated: new Date(),
                sampleCount: 10,
                style: {
                    formality: 0.8,
                    complexity: 0.7,
                    emotionality: 0.3,
                    technicality: 0.9,
                },
                patterns: {
                    sentenceLength: { avg: 20, std: 5 },
                    paragraphLength: { avg: 5, std: 2 },
                    vocabularyRichness: 0.8,
                    punctuationStyle: { '.': 0.9, '!': 0.05, '?': 0.05 },
                },
                vocabulary: {
                    commonWords: ['analysis', 'implementation', 'strategy'],
                    uniquePhrases: ['comprehensive approach', 'strategic implementation'],
                    preferredTransitions: ['Furthermore', 'Additionally', 'Moreover'],
                    avoidedWords: ['very', 'really', 'quite'],
                },
                tone: {
                    sentiment: 'neutral',
                    energy: 'medium',
                    confidence: 0.9,
                },
            };
            const consistency = await agent.validateConsistency(content, profile);
            expect(consistency).toBeDefined();
            expect(consistency.overall).toBeGreaterThan(90);
            expect(consistency.style).toBeGreaterThan(0);
            expect(consistency.vocabulary).toBeGreaterThan(0);
            expect(consistency.structure).toBeGreaterThan(0);
            expect(consistency.tone).toBeGreaterThan(0);
        });
        it('should detect low consistency scores', async () => {
            const inconsistentContent = 'yo this is like totally different from the expected style ya know';
            const formalProfile = {
                id: 'formal-profile',
                userId: 'user-123',
                created: new Date(),
                updated: new Date(),
                sampleCount: 8,
                style: {
                    formality: 0.95,
                    complexity: 0.9,
                    emotionality: 0.1,
                    technicality: 0.8,
                },
                patterns: {
                    sentenceLength: { avg: 25, std: 3 },
                    paragraphLength: { avg: 6, std: 1 },
                    vocabularyRichness: 0.9,
                    punctuationStyle: { '.': 0.95, '!': 0.02, '?': 0.03 },
                },
                vocabulary: {
                    commonWords: ['therefore', 'consequently', 'furthermore'],
                    uniquePhrases: ['in accordance with', 'with respect to'],
                    preferredTransitions: ['Consequently', 'Therefore', 'In conclusion'],
                    avoidedWords: ['yo', 'like', 'totally'],
                },
                tone: {
                    sentiment: 'neutral',
                    energy: 'low',
                    confidence: 0.95,
                },
            };
            const consistency = await agent.validateConsistency(inconsistentContent, formalProfile);
            expect(consistency.overall).toBeLessThan(90);
            expect(consistency.details.length).toBeGreaterThan(0);
        });
    });
    describe('Content Quality and Structure', () => {
        it('should generate well-structured content with sections', async () => {
            const options = {
                mode: 'standard',
                framework: 'analytical',
            };
            const result = await agent.create(mockInsightsDocument, options);
            expect(result.sections).toBeDefined();
            expect(result.sections.length).toBeGreaterThan(1);
            // Check section structure
            result.sections.forEach(section => {
                expect(section.heading).toBeDefined();
                expect(section.content).toBeDefined();
                expect(section.level).toBeGreaterThan(0);
                expect(section.wordCount).toBeGreaterThan(0);
            });
        });
        it('should maintain content coherence across sections', async () => {
            const options = {
                mode: 'standard',
                framework: 'narrative',
                targetWordCount: 1200,
            };
            const result = await agent.create(mockInsightsDocument, options);
            // Content should flow logically
            expect(result.content).toMatch(/#+\s+/); // Should have headings
            expect(result.content.split('\n\n').length).toBeGreaterThan(3); // Multiple paragraphs
            // Should reference insights
            const contentLower = result.content.toLowerCase();
            expect(contentLower).toMatch(/ai|artificial intelligence|automation|implementation/);
        });
        it('should integrate insights meaningfully', async () => {
            const options = {
                mode: 'standard',
                framework: 'persuasive',
            };
            const result = await agent.create(mockInsightsDocument, options);
            // Should incorporate key findings
            mockInsightsDocument.keyFindings.forEach(finding => {
                const findingWords = finding.toLowerCase().split(' ');
                const contentLower = result.content.toLowerCase();
                const matchedWords = findingWords.filter(word => word.length > 3 && contentLower.includes(word));
                expect(matchedWords.length).toBeGreaterThan(0);
            });
        });
    });
    describe('Performance and Optimization', () => {
        it('should complete content creation within reasonable time', async () => {
            const options = {
                mode: 'standard',
                targetWordCount: 1000,
            };
            const startTime = Date.now();
            const result = await agent.create(mockInsightsDocument, options);
            const duration = Date.now() - startTime;
            expect(result).toBeDefined();
            expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
        });
        it('should handle concurrent creation requests', async () => {
            const options = {
                mode: 'quick',
            };
            const requests = Array.from({ length: 3 }, () => agent.create(mockInsightsDocument, options));
            const results = await Promise.all(requests);
            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.content).toBeDefined();
            });
        });
        it('should optimize for different content lengths', async () => {
            const wordCounts = [300, 800, 1500, 2500];
            for (const targetWordCount of wordCounts) {
                const options = {
                    mode: 'standard',
                    targetWordCount,
                };
                const startTime = Date.now();
                const result = await agent.create(mockInsightsDocument, options);
                const duration = Date.now() - startTime;
                expect(result).toBeDefined();
                // Longer content should take proportionally more time, but not excessively
                expect(duration).toBeLessThan(targetWordCount * 50); // 50ms per word max
            }
        });
    });
    describe('Error Handling and Edge Cases', () => {
        it('should handle empty insights gracefully', async () => {
            const emptyInsights = (0, document_schema_1.createInsightsDocument)({ type: 'text', path: 'empty', hash: 'empty' }, ['SWOT-USED'], '', 'Scholar Agent');
            emptyInsights.keyFindings = [];
            emptyInsights.recommendations = [];
            const options = {
                mode: 'quick',
            };
            const result = await agent.create(emptyInsights, options);
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            expect(result.content.length).toBeGreaterThan(0);
        });
        it('should handle invalid creation modes gracefully', async () => {
            const options = {
                mode: 'invalid-mode',
            };
            await expect(agent.create(mockInsightsDocument, options)).rejects.toThrow();
        });
        it('should handle missing voice profile gracefully', async () => {
            const options = {
                mode: 'standard',
                // voiceProfile not provided - should use default
            };
            const result = await agent.create(mockInsightsDocument, options);
            expect(result).toBeDefined();
            expect(result.metadata.voiceDNA).toBeDefined();
            expect(result.metadata.voiceDNA.profileId).toBe('default');
        });
        it('should handle very short target word counts', async () => {
            const options = {
                mode: 'standard',
                targetWordCount: 50, // Very short
            };
            const result = await agent.create(mockInsightsDocument, options);
            expect(result).toBeDefined();
            expect(result.content).toBeDefined();
            // Should still produce meaningful content even if short
            expect(result.content.split(' ').length).toBeGreaterThan(10);
        });
    });
    describe('Agent Request Processing', () => {
        it('should process agent requests successfully', async () => {
            const request = {
                id: 'creator-request-1',
                timestamp: new Date(),
                data: {
                    insights: mockInsightsDocument,
                    options: {
                        mode: 'standard',
                        framework: 'analytical',
                    },
                },
            };
            const response = await agent.processRequest(request);
            expect(response.success).toBe(true);
            expect(response.data).toBeDefined();
            expect(response.metadata?.agent).toBe('creator');
            expect(response.metadata?.processingTime).toBeGreaterThan(0);
        });
        it('should handle request processing errors', async () => {
            const request = {
                id: 'creator-request-error',
                timestamp: new Date(),
                data: {
                    insights: null,
                    options: {
                        mode: 'standard',
                    },
                },
            };
            const response = await agent.processRequest(request);
            expect(response.success).toBe(false);
            expect(response.error).toBeDefined();
            expect(response.metadata?.agent).toBe('creator');
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
    describe('Statistics and Metrics', () => {
        it('should track creation statistics correctly', async () => {
            const options1 = { mode: 'quick' };
            const options2 = { mode: 'standard' };
            const options3 = { mode: 'custom' };
            await agent.create(mockInsightsDocument, options1);
            await agent.create(mockInsightsDocument, options2);
            await agent.create(mockInsightsDocument, options3);
            const stats = agent.creationStats;
            expect(stats.totalCreations).toBe(3);
            expect(stats.modeUsage.quick).toBe(1);
            expect(stats.modeUsage.standard).toBe(1);
            expect(stats.modeUsage.custom).toBe(1);
            expect(stats.averageConsistency).toBeGreaterThan(0);
            expect(stats.averageTime).toBeGreaterThan(0);
        });
        it('should update average metrics correctly', async () => {
            const options = { mode: 'quick' };
            // Create multiple times to test averaging
            await agent.create(mockInsightsDocument, options);
            await agent.create(mockInsightsDocument, options);
            await agent.create(mockInsightsDocument, options);
            const stats = agent.creationStats;
            expect(stats.totalCreations).toBe(3);
            expect(stats.averageConsistency).toBeGreaterThan(0);
            expect(stats.averageConsistency).toBeLessThanOrEqual(100);
            expect(stats.averageTime).toBeGreaterThan(0);
        });
    });
});
//# sourceMappingURL=creator-agent.test.js.map