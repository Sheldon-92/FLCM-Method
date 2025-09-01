"use strict";
/**
 * Document Converter Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const document_converter_1 = require("../converters/document-converter");
describe('DocumentConverter', () => {
    let converter;
    beforeEach(() => {
        converter = new document_converter_1.DocumentConverter();
    });
    describe('V1 to V2 Conversion', () => {
        it('should convert collector output to insights document', async () => {
            const v1Doc = {
                id: 'test-1',
                session_id: 'session-1',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                pipeline_stage: 'collector',
                data: {
                    version: '1.0',
                    agent: 'collector',
                    timestamp: '2025-01-31T10:00:00Z',
                    source: {
                        type: 'text',
                        content: 'Test content'
                    },
                    insights: [
                        {
                            id: '1',
                            text: 'Test insight',
                            relevance: 0.8,
                            evidence: 'Test evidence'
                        }
                    ],
                    rice_scores: {
                        reach: 80,
                        impact: 70,
                        confidence: 90,
                        effort: 40,
                        total: 70
                    },
                    metadata: {
                        processing_time: 1000,
                        word_count: 100,
                        extraction_method: 'auto'
                    }
                }
            };
            const result = await converter.convert(v1Doc, '2.0');
            expect(result.success).toBe(true);
            expect(result.document).toBeDefined();
            expect(result.document.version).toBe('2.0');
            expect(result.document.type).toBe('insights');
            expect(result.document.core_insights).toHaveLength(1);
            expect(result.document.core_insights[0].insight).toBe('Test insight');
        });
        it('should preserve metadata during conversion', async () => {
            const v1Doc = {
                id: 'test-2',
                session_id: 'session-2',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                pipeline_stage: 'scholar',
                data: {
                    version: '1.0',
                    agent: 'scholar',
                    timestamp: '2025-01-31T10:00:00Z',
                    level: 3,
                    understanding: {
                        summary: 'Test summary',
                        key_concepts: ['concept1', 'concept2'],
                        complexity_score: 0.7
                    },
                    analogies: [],
                    questions: [],
                    learning_path: {
                        current_stage: 'intermediate',
                        next_steps: [],
                        prerequisites: []
                    },
                    metadata: {
                        processing_time: 2000,
                        iterations: 3
                    }
                }
            };
            const result = await converter.convert(v1Doc, '2.0');
            expect(result.success).toBe(true);
            expect(result.document.metadata.session_id).toBe('session-2');
            expect(result.document.concepts).toHaveLength(2);
        });
        it('should report data loss for unmapped fields', async () => {
            const v1Doc = {
                id: 'test-3',
                session_id: 'session-3',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                pipeline_stage: 'collector',
                data: {
                    version: '1.0',
                    agent: 'collector',
                    timestamp: '2025-01-31T10:00:00Z',
                    source: { type: 'url', content: 'test' },
                    insights: [],
                    rice_scores: { reach: 50, impact: 50, confidence: 50, effort: 50, total: 50 },
                    metadata: { processing_time: 1000, word_count: 100, extraction_method: 'auto' },
                    custom_field: 'This will be lost'
                }
            };
            const result = await converter.convert(v1Doc, '2.0');
            expect(result.success).toBe(true);
            expect(result.dataLoss).toBeDefined();
            expect(result.dataLoss).toContain('custom_field');
        });
    });
    describe('V2 to V1 Conversion', () => {
        it('should convert insights document to collector output', async () => {
            const v2Doc = {
                id: 'test-4',
                session_id: 'session-4',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                layer: 'mentor',
                data: {
                    version: '2.0',
                    type: 'insights',
                    timestamp: '2025-01-31T10:00:00Z',
                    core_insights: [
                        {
                            id: 'insight-1',
                            insight: 'Test V2 insight',
                            confidence: 0.9,
                            depth: 4,
                            tags: ['test']
                        }
                    ],
                    evidence: [],
                    connections: [],
                    metadata: {
                        framework_used: 'SWOT',
                        depth_level: 4,
                        total_insights: 1,
                        processing_time: 1500,
                        session_id: 'session-4'
                    },
                    frontmatter: {
                        title: 'Test',
                        created: '2025-01-31T10:00:00Z',
                        modified: '2025-01-31T10:00:00Z',
                        tags: ['test'],
                        framework: 'SWOT'
                    }
                }
            };
            const result = await converter.convert(v2Doc, '1.0');
            expect(result.success).toBe(true);
            expect(result.document).toBeDefined();
            expect(result.document.version).toBe('1.0');
            expect(result.document.agent).toBe('collector');
            expect(result.document.insights).toHaveLength(1);
        });
        it('should handle v2 features not available in v1', async () => {
            const v2Doc = {
                id: 'test-5',
                session_id: 'session-5',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                layer: 'mentor',
                data: {
                    version: '2.0',
                    type: 'knowledge',
                    timestamp: '2025-01-31T10:00:00Z',
                    concepts: [],
                    relationships: [],
                    graph_data: {
                        nodes: [],
                        edges: []
                    },
                    learning_progression: {
                        current_understanding: 60,
                        growth_rate: 1.2,
                        next_concepts: [],
                        mastered_concepts: []
                    },
                    metadata: {
                        total_concepts: 0,
                        complexity_score: 0.5,
                        framework_used: 'Socratic',
                        session_id: 'session-5'
                    },
                    frontmatter: {
                        title: 'Test',
                        created: '2025-01-31T10:00:00Z',
                        modified: '2025-01-31T10:00:00Z',
                        tags: [],
                        type: 'knowledge-base'
                    }
                }
            };
            const result = await converter.convert(v2Doc, '1.0');
            expect(result.success).toBe(true);
            expect(result.warnings).toBeDefined();
            expect(result.warnings?.length).toBeGreaterThan(0);
        });
    });
    describe('Validation', () => {
        it('should validate conversion results', () => {
            const source = {
                content: 'Test content with 100 characters...'
            };
            const target = {
                version: '2.0',
                type: 'content',
                body: 'Test content with 100 characters...',
                timestamp: '2025-01-31T10:00:00Z',
                metadata: {}
            };
            const validation = converter.validateConversion(source, target, '2.0');
            expect(validation.valid).toBe(true);
            expect(validation.issues).toHaveLength(0);
        });
        it('should detect missing critical fields', () => {
            const source = {};
            const target = {
                type: 'insights'
                // Missing version and timestamp
            };
            const validation = converter.validateConversion(source, target, '2.0');
            expect(validation.valid).toBe(false);
            expect(validation.issues).toContain('Missing critical field: version');
            expect(validation.issues).toContain('Missing critical field: timestamp');
        });
        it('should detect significant content changes', () => {
            const source = {
                content: 'Original content that is quite long and detailed'
            };
            const target = {
                version: '2.0',
                type: 'content',
                body: 'Short',
                timestamp: '2025-01-31T10:00:00Z',
                metadata: {}
            };
            const validation = converter.validateConversion(source, target, '2.0');
            expect(validation.valid).toBe(false);
            expect(validation.issues.some(i => i.includes('Content length difference'))).toBe(true);
        });
    });
    describe('Performance', () => {
        it('should convert documents within 100ms', async () => {
            const v1Doc = {
                id: 'perf-test',
                session_id: 'perf-session',
                created_at: '2025-01-31T10:00:00Z',
                updated_at: '2025-01-31T10:00:00Z',
                pipeline_stage: 'collector',
                data: {
                    version: '1.0',
                    agent: 'collector',
                    timestamp: '2025-01-31T10:00:00Z',
                    source: { type: 'text', content: 'Performance test' },
                    insights: Array(10).fill(null).map((_, i) => ({
                        id: `${i}`,
                        text: `Insight ${i}`,
                        relevance: Math.random(),
                        evidence: `Evidence ${i}`
                    })),
                    rice_scores: { reach: 50, impact: 50, confidence: 50, effort: 50, total: 50 },
                    metadata: { processing_time: 1000, word_count: 100, extraction_method: 'auto' }
                }
            };
            const startTime = Date.now();
            const result = await converter.convert(v1Doc, '2.0');
            const duration = Date.now() - startTime;
            expect(result.success).toBe(true);
            expect(duration).toBeLessThan(100);
        });
    });
});
//# sourceMappingURL=document-converter.test.js.map