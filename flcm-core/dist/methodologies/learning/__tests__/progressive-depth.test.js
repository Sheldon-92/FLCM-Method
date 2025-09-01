"use strict";
/**
 * Unit Tests for Progressive Depth Learning Methodology
 */
Object.defineProperty(exports, "__esModule", { value: true });
const progressive_depth_1 = require("../progressive-depth");
describe('ProgressiveDepthLearning', () => {
    let progressiveDepth;
    let sampleConcept;
    beforeEach(() => {
        progressiveDepth = new progressive_depth_1.ProgressiveDepthLearning();
        sampleConcept = {
            name: 'Machine Learning',
            definition: 'A subset of artificial intelligence that enables systems to learn and improve from experience automatically',
            context: 'Computer Science and AI field',
            importance: 9
        };
    });
    describe('Constructor', () => {
        test('should initialize with proper depth definitions', () => {
            expect(progressiveDepth).toBeDefined();
            expect(progressiveDepth).toBeInstanceOf(progressive_depth_1.ProgressiveDepthLearning);
        });
    });
    describe('analyzeDepth', () => {
        test('should analyze concept and return progressive depth analysis', async () => {
            const analysis = await progressiveDepth.analyzeDepth(sampleConcept, 'sample content');
            expect(analysis).toBeDefined();
            expect(analysis.concept).toEqual(sampleConcept);
            expect(analysis.levels).toHaveLength(5);
            expect(analysis.currentDepth).toBeGreaterThanOrEqual(1);
            expect(analysis.currentDepth).toBeLessThanOrEqual(5);
        });
        test('should handle empty content gracefully', async () => {
            const analysis = await progressiveDepth.analyzeDepth(sampleConcept, '');
            expect(analysis).toBeDefined();
            expect(analysis.currentDepth).toBe(1);
            expect(analysis.levels[0].complete).toBe(false);
        });
        test('should detect teaching readiness correctly', async () => {
            const deepContent = `
        Machine Learning is a subset of AI that enables systems to learn automatically.
        It works through algorithms that analyze patterns in data.
        The main types include supervised, unsupervised, and reinforcement learning.
        Applications range from recommendation systems to autonomous vehicles.
        Common algorithms include neural networks, decision trees, and support vector machines.
      `;
            const analysis = await progressiveDepth.analyzeDepth(sampleConcept, deepContent);
            expect(analysis.teachingReady).toBeDefined();
            expect(typeof analysis.teachingReady).toBe('boolean');
        });
    });
    describe('identifyDepthLevel', () => {
        test('should correctly identify surface level understanding', () => {
            const surfaceContent = 'Machine learning is a type of AI technology.';
            const level = progressiveDepth.identifyDepthLevel(surfaceContent, sampleConcept);
            expect(level).toBe(1);
        });
        test('should correctly identify deeper understanding levels', () => {
            const deepContent = `
        Machine learning uses algorithms to find patterns in data.
        These patterns help make predictions about new data.
        The process involves training models on historical data.
      `;
            const level = progressiveDepth.identifyDepthLevel(deepContent, sampleConcept);
            expect(level).toBeGreaterThan(1);
        });
        test('should handle complex technical content', () => {
            const expertContent = `
        Machine learning algorithms optimize objective functions through gradient descent,
        utilizing backpropagation in neural networks to minimize loss functions.
        Regularization techniques like L1 and L2 prevent overfitting.
        Cross-validation ensures model generalizability across datasets.
      `;
            const level = progressiveDepth.identifyDepthLevel(expertContent, sampleConcept);
            expect(level).toBeGreaterThanOrEqual(3);
        });
    });
    describe('generateDepthLevels', () => {
        test('should generate 5 complete depth levels', () => {
            const levels = progressiveDepth.generateDepthLevels(sampleConcept, 3);
            expect(levels).toHaveLength(5);
            levels.forEach((level, index) => {
                expect(level.level).toBe((index + 1));
                expect(level.name).toBeDefined();
                expect(level.focus).toBeDefined();
                expect(level.understanding).toBeInstanceOf(Array);
                expect(level.confidence).toBeGreaterThanOrEqual(0);
                expect(level.confidence).toBeLessThanOrEqual(100);
            });
        });
        test('should mark appropriate levels as complete', () => {
            const levels = progressiveDepth.generateDepthLevels(sampleConcept, 3);
            // Levels 1-3 should be complete, 4-5 should not be
            expect(levels[0].complete).toBe(true); // Level 1
            expect(levels[1].complete).toBe(true); // Level 2
            expect(levels[2].complete).toBe(true); // Level 3
            expect(levels[3].complete).toBe(false); // Level 4
            expect(levels[4].complete).toBe(false); // Level 5
        });
    });
    describe('identifyGaps', () => {
        test('should identify knowledge gaps correctly', () => {
            const incompleteAnalysis = {
                concept: sampleConcept,
                currentDepth: 2,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 2),
                teachingReady: false,
                gaps: [],
                nextSteps: []
            };
            const gaps = progressiveDepth.identifyGaps(incompleteAnalysis);
            expect(gaps).toBeInstanceOf(Array);
            expect(gaps.length).toBeGreaterThan(0);
            expect(gaps).toContain(expect.stringMatching(/purpose|application|principle/i));
        });
        test('should return minimal gaps for complete understanding', () => {
            const completeAnalysis = {
                concept: sampleConcept,
                currentDepth: 5,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 5),
                teachingReady: true,
                gaps: [],
                nextSteps: []
            };
            const gaps = progressiveDepth.identifyGaps(completeAnalysis);
            expect(gaps).toBeInstanceOf(Array);
            expect(gaps.length).toBeLessThanOrEqual(2);
        });
    });
    describe('generateNextSteps', () => {
        test('should generate appropriate next steps', () => {
            const analysis = {
                concept: sampleConcept,
                currentDepth: 2,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 2),
                teachingReady: false,
                gaps: ['Understanding of practical applications', 'Knowledge of algorithms'],
                nextSteps: []
            };
            const nextSteps = progressiveDepth.generateNextSteps(analysis);
            expect(nextSteps).toBeInstanceOf(Array);
            expect(nextSteps.length).toBeGreaterThan(0);
            expect(nextSteps[0]).toMatch(/explore|research|study|learn|practice/i);
        });
        test('should provide different steps based on current depth', () => {
            const beginnerAnalysis = {
                concept: sampleConcept,
                currentDepth: 1,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 1),
                teachingReady: false,
                gaps: [],
                nextSteps: []
            };
            const advancedAnalysis = {
                concept: sampleConcept,
                currentDepth: 4,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 4),
                teachingReady: true,
                gaps: [],
                nextSteps: []
            };
            const beginnerSteps = progressiveDepth.generateNextSteps(beginnerAnalysis);
            const advancedSteps = progressiveDepth.generateNextSteps(advancedAnalysis);
            expect(beginnerSteps).not.toEqual(advancedSteps);
            expect(beginnerSteps[0]).toMatch(/basic|fundamental|introduction/i);
            expect(advancedSteps[0]).toMatch(/advanced|expert|mastery|contribute/i);
        });
    });
    describe('calculateConfidence', () => {
        test('should calculate confidence based on content quality', () => {
            const highQualityContent = `
        Machine learning is a method of data analysis that automates analytical model building.
        It is a branch of artificial intelligence based on the idea that systems can learn from data,
        identify patterns and make decisions with minimal human intervention.
        The three main types are supervised learning, unsupervised learning, and reinforcement learning.
      `;
            const lowQualityContent = 'ML is AI that learns from data.';
            const highConfidence = progressiveDepth.calculateConfidence(highQualityContent, sampleConcept, 2);
            const lowConfidence = progressiveDepth.calculateConfidence(lowQualityContent, sampleConcept, 2);
            expect(highConfidence).toBeGreaterThan(lowConfidence);
            expect(highConfidence).toBeGreaterThanOrEqual(0);
            expect(highConfidence).toBeLessThanOrEqual(100);
            expect(lowConfidence).toBeGreaterThanOrEqual(0);
            expect(lowConfidence).toBeLessThanOrEqual(100);
        });
        test('should return higher confidence for appropriate depth level', () => {
            const content = 'Machine learning uses algorithms to analyze data and make predictions.';
            const level1Confidence = progressiveDepth.calculateConfidence(content, sampleConcept, 1);
            const level4Confidence = progressiveDepth.calculateConfidence(content, sampleConcept, 4);
            expect(level1Confidence).toBeGreaterThan(level4Confidence);
        });
    });
    describe('Edge Cases', () => {
        test('should handle concept with very low importance', async () => {
            const lowImportanceConcept = {
                name: 'Test Concept',
                definition: 'A test definition',
                context: 'Testing',
                importance: 1
            };
            const analysis = await progressiveDepth.analyzeDepth(lowImportanceConcept, 'test content');
            expect(analysis).toBeDefined();
            expect(analysis.concept.importance).toBe(1);
        });
        test('should handle very long content', async () => {
            const longContent = 'Machine learning '.repeat(1000);
            const analysis = await progressiveDepth.analyzeDepth(sampleConcept, longContent);
            expect(analysis).toBeDefined();
            expect(analysis.levels).toHaveLength(5);
        });
        test('should handle special characters and unicode', async () => {
            const unicodeContent = 'Machine Learning 学习 🤖 with émotions and spëcial chars';
            const analysis = await progressiveDepth.analyzeDepth(sampleConcept, unicodeContent);
            expect(analysis).toBeDefined();
            expect(analysis.currentDepth).toBeGreaterThanOrEqual(1);
        });
    });
    describe('Teaching Readiness Assessment', () => {
        test('should correctly assess teaching readiness for sufficient depth', () => {
            const teachingReadyAnalysis = {
                concept: sampleConcept,
                currentDepth: 4,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 4),
                teachingReady: false,
                gaps: ['Minor gap'],
                nextSteps: []
            };
            const isReady = progressiveDepth.assessTeachingReadiness(teachingReadyAnalysis);
            expect(isReady).toBe(true);
        });
        test('should correctly assess not ready for insufficient depth', () => {
            const notReadyAnalysis = {
                concept: sampleConcept,
                currentDepth: 1,
                levels: progressiveDepth.generateDepthLevels(sampleConcept, 1),
                teachingReady: false,
                gaps: ['Major gap 1', 'Major gap 2', 'Major gap 3'],
                nextSteps: []
            };
            const isReady = progressiveDepth.assessTeachingReadiness(notReadyAnalysis);
            expect(isReady).toBe(false);
        });
    });
});
//# sourceMappingURL=progressive-depth.test.js.map