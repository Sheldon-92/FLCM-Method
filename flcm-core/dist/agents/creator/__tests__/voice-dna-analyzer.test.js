"use strict";
/**
 * Voice DNA Analyzer Unit Tests
 * Test comprehensive voice analysis and style extraction
 */
Object.defineProperty(exports, "__esModule", { value: true });
const voice_dna_analyzer_1 = require("../voice-dna-analyzer");
// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));
describe('VoiceDNAAnalyzer', () => {
    let analyzer;
    beforeEach(() => {
        analyzer = new voice_dna_analyzer_1.VoiceDNAAnalyzer();
    });
    describe('Basic Analysis', () => {
        it('should analyze writing samples and extract Voice DNA profile', async () => {
            const samples = [
                'This is a professional piece of writing that demonstrates formal style and technical complexity.',
                'Furthermore, the analysis reveals sophisticated vocabulary usage and structured argumentation patterns.',
                'Additionally, the author maintains consistent tone throughout various document sections.',
                'Moreover, the writing exhibits high levels of technical precision and academic rigor.',
                'In conclusion, these samples provide sufficient data for comprehensive voice analysis.',
            ];
            const profile = await analyzer.analyze(samples);
            expect(profile).toBeDefined();
            expect(profile.id).toBeDefined();
            expect(profile.sampleCount).toBe(5);
            expect(profile.style).toBeDefined();
            expect(profile.patterns).toBeDefined();
            expect(profile.vocabulary).toBeDefined();
            expect(profile.tone).toBeDefined();
        });
        it('should extract style characteristics accurately', async () => {
            const formalSamples = [
                'The methodology employed in this research demonstrates rigorous academic standards.',
                'Consequently, the findings indicate statistically significant correlations between variables.',
                'Furthermore, the implications of these results warrant careful consideration.',
                'Therefore, we recommend implementing comprehensive quality assurance protocols.',
                'In conclusion, this analysis provides substantial evidence for our hypothesis.',
            ];
            const profile = await analyzer.analyze(formalSamples);
            expect(profile.style.formality).toBeGreaterThan(0.7);
            expect(profile.style.complexity).toBeGreaterThan(0.6);
            expect(profile.style.technicality).toBeGreaterThan(0.5);
            expect(profile.vocabulary.preferredTransitions).toContain('Furthermore');
        });
        it('should detect informal writing style', async () => {
            const informalSamples = [
                "Hey there! I'm really excited to share this awesome idea with you.",
                "It's super cool how this thing works, and I think you'll love it too!",
                "So basically, what we're doing is pretty straightforward and fun.",
                "Plus, it's gonna save you tons of time - isn't that great?",
                "Anyway, let me know what you think about this whole thing!",
            ];
            const profile = await analyzer.analyze(informalSamples);
            expect(profile.style.formality).toBeLessThan(0.4);
            expect(profile.style.emotionality).toBeGreaterThan(0.6);
            expect(profile.tone.energy).toBe('high');
            expect(profile.tone.sentiment).toBe('positive');
        });
        it('should analyze sentence and paragraph patterns', async () => {
            const structuredSamples = [
                'Short sentence. Another brief statement. Quick point here.',
                'This is a longer sentence that demonstrates more complex structure with multiple clauses and detailed explanations.',
                'Medium sentence with some complexity. Brief follow-up.',
                'Very detailed and comprehensive sentence that includes multiple concepts, various connecting phrases, and extensive elaboration on the topic.',
                'Final sentence with moderate length and complexity.',
            ];
            const profile = await analyzer.analyze(structuredSamples);
            expect(profile.patterns.sentenceLength.avg).toBeGreaterThan(0);
            expect(profile.patterns.sentenceLength.std).toBeGreaterThan(0);
            expect(profile.patterns.vocabularyRichness).toBeGreaterThan(0);
            expect(profile.patterns.vocabularyRichness).toBeLessThanOrEqual(1);
        });
        it('should identify vocabulary patterns and preferences', async () => {
            const vocabularyRichSamples = [
                'The comprehensive analysis demonstrates sophisticated methodological approaches.',
                'Furthermore, innovative techniques enhance the reliability of empirical observations.',
                'Additionally, meticulous attention to detail ensures unprecedented accuracy.',
                'Moreover, cutting-edge technologies facilitate revolutionary breakthroughs.',
                'Consequently, transformative insights emerge from rigorous investigation.',
            ];
            const profile = await analyzer.analyze(vocabularyRichSamples);
            expect(profile.vocabulary.commonWords).toContain('the');
            expect(profile.vocabulary.uniquePhrases.length).toBeGreaterThan(0);
            expect(profile.vocabulary.preferredTransitions).toContain('Furthermore');
            expect(profile.patterns.vocabularyRichness).toBeGreaterThan(0.6);
        });
    });
    describe('Content Analysis', () => {
        it('should analyze single content piece for style matching', async () => {
            const content = `
        The implementation of artificial intelligence in modern business environments 
        represents a paradigm shift. Organizations must carefully evaluate the strategic 
        implications of these technologies. Furthermore, stakeholder buy-in remains 
        critical for successful adoption.
      `;
            const analysis = await analyzer.analyzeContent(content);
            expect(analysis).toBeDefined();
            expect(analysis.style).toBeDefined();
            expect(analysis.patterns).toBeDefined();
            expect(analysis.vocabulary).toBeDefined();
            expect(analysis.tone).toBeDefined();
        });
        it('should detect technical content characteristics', async () => {
            const technicalContent = `
        The neural network architecture utilizes convolutional layers with batch 
        normalization. The gradient descent algorithm optimizes the loss function 
        through backpropagation. Regularization techniques prevent overfitting 
        in high-dimensional feature spaces.
      `;
            const analysis = await analyzer.analyzeContent(technicalContent);
            expect(analysis.style.technicality).toBeGreaterThan(0.7);
            expect(analysis.style.complexity).toBeGreaterThan(0.6);
            expect(analysis.vocabulary.uniquePhrases.some(phrase => phrase.toLowerCase().includes('neural') ||
                phrase.toLowerCase().includes('algorithm'))).toBe(true);
        });
        it('should identify emotional tone in content', async () => {
            const emotionalContent = `
        I'm absolutely thrilled to announce this incredible breakthrough! 
        This amazing discovery will revolutionize everything we thought we knew. 
        The excitement is overwhelming, and I can't wait to share more fantastic 
        details with everyone!
      `;
            const analysis = await analyzer.analyzeContent(emotionalContent);
            expect(analysis.style.emotionality).toBeGreaterThan(0.7);
            expect(analysis.tone.sentiment).toBe('positive');
            expect(analysis.tone.energy).toBe('high');
        });
        it('should analyze punctuation style patterns', async () => {
            const punctuationVariedContent = `
        What an interesting development! Are we ready for this change? 
        The implications are significant. How should we proceed? 
        Implementation requires careful planning! Success depends on execution.
      `;
            const analysis = await analyzer.analyzeContent(punctuationVariedContent);
            expect(analysis.patterns.punctuationStyle['.']).toBeDefined();
            expect(analysis.patterns.punctuationStyle['!']).toBeDefined();
            expect(analysis.patterns.punctuationStyle['?']).toBeDefined();
            const totalPunctuation = Object.values(analysis.patterns.punctuationStyle)
                .reduce((sum, count) => sum + count, 0);
            expect(totalPunctuation).toBeGreaterThan(0);
        });
    });
    describe('Advanced Pattern Recognition', () => {
        it('should detect consistent author voice across genres', async () => {
            const mixedGenreSamples = [
                // Technical writing
                'The algorithm processes data through multiple computational layers.',
                // Narrative style  
                'Once upon a time, there was a programmer who dreamed of perfect code.',
                // Instructional content
                'To implement this feature, first configure the environment variables.',
                // Persuasive writing
                'You should definitely consider adopting this innovative approach.',
                // Descriptive content
                'The interface displays clean, intuitive navigation elements.',
            ];
            const profile = await analyzer.analyze(mixedGenreSamples);
            // Should still detect underlying consistency
            expect(profile.style.formality).toBeGreaterThan(0.3);
            expect(profile.style.formality).toBeLessThan(0.9);
            expect(profile.patterns.sentenceLength.std).toBeGreaterThan(0);
            expect(profile.vocabulary.commonWords.length).toBeGreaterThan(0);
        });
        it('should handle varying sentence lengths and complexity', async () => {
            const varyingComplexitySamples = [
                'Simple.',
                'This is a moderately complex sentence with some detail.',
                'Here we have an extensively detailed and comprehensive sentence that includes multiple clauses, various descriptive elements, and demonstrates sophisticated grammatical structures.',
                'Brief follow-up.',
                'Another sentence of medium length that provides additional context and maintains the established pattern of varied complexity.',
            ];
            const profile = await analyzer.analyze(varyingComplexitySamples);
            expect(profile.patterns.sentenceLength.avg).toBeGreaterThan(5);
            expect(profile.patterns.sentenceLength.std).toBeGreaterThan(5);
            expect(profile.style.complexity).toBeGreaterThan(0.4);
        });
        it('should identify unique phrase patterns', async () => {
            const phrasePatterSamples = [
                'The cutting-edge technology represents a game-changing innovation.',
                'This state-of-the-art solution provides unprecedented opportunities.',
                'Our next-generation platform delivers best-in-class performance.',
                'The world-class implementation ensures mission-critical reliability.',
                'This industry-leading approach offers customer-centric benefits.',
            ];
            const profile = await analyzer.analyze(phrasePatterSamples);
            // Should identify hyphenated compound phrases
            expect(profile.vocabulary.uniquePhrases.some(phrase => phrase.includes('cutting-edge') || phrase.includes('state-of-the-art'))).toBe(true);
            expect(profile.patterns.vocabularyRichness).toBeGreaterThan(0.7);
        });
        it('should detect transition word preferences', async () => {
            const transitionRichSamples = [
                'The process begins with data collection. Furthermore, analysis follows.',
                'Initial results are promising. Additionally, further testing confirms trends.',
                'The hypothesis is supported. Moreover, implications are significant.',
                'Evidence accumulates steadily. Consequently, conclusions become clear.',
                'Research continues actively. Nevertheless, initial findings guide direction.',
            ];
            const profile = await analyzer.analyze(transitionRichSamples);
            expect(profile.vocabulary.preferredTransitions.length).toBeGreaterThan(0);
            expect(profile.vocabulary.preferredTransitions).toContain('Furthermore');
            expect(profile.vocabulary.preferredTransitions).toContain('Additionally');
        });
    });
    describe('Quality and Reliability', () => {
        it('should maintain consistency across multiple analyses', async () => {
            const consistentSamples = [
                'Professional analysis requires methodical approach and systematic evaluation.',
                'Comprehensive research demonstrates thorough investigation and detailed examination.',
                'Strategic planning involves careful consideration and deliberate decision-making.',
                'Effective implementation needs structured processes and coordinated execution.',
                'Successful outcomes depend on consistent effort and persistent commitment.',
            ];
            // Run analysis multiple times
            const profiles = await Promise.all([
                analyzer.analyze(consistentSamples),
                analyzer.analyze(consistentSamples),
                analyzer.analyze(consistentSamples),
            ]);
            // Results should be identical
            expect(profiles[0].style.formality).toEqual(profiles[1].style.formality);
            expect(profiles[0].patterns.sentenceLength.avg).toEqual(profiles[1].patterns.sentenceLength.avg);
            expect(profiles[0].vocabulary.commonWords).toEqual(profiles[1].vocabulary.commonWords);
        });
        it('should handle edge cases gracefully', async () => {
            const edgeCaseSamples = [
                '',
                '!@#$%^&*()',
                '   ',
                'A',
                'Word word word word word word word word.', // Repetitive
            ];
            const profile = await analyzer.analyze(edgeCaseSamples);
            expect(profile).toBeDefined();
            expect(profile.style.formality).toBeGreaterThanOrEqual(0);
            expect(profile.style.formality).toBeLessThanOrEqual(1);
        });
        it('should provide meaningful confidence scores', async () => {
            const highQualitySamples = [
                'The comprehensive analysis demonstrates sophisticated methodological rigor.',
                'Furthermore, empirical evidence supports theoretical frameworks consistently.',
                'Additionally, statistical validation confirms hypothesis reliability.',
                'Moreover, peer review processes ensure academic integrity.',
                'Consequently, research conclusions warrant professional consideration.',
            ];
            const profile = await analyzer.analyze(highQualitySamples);
            expect(profile.tone.confidence).toBeGreaterThan(0.7);
            expect(profile.patterns.vocabularyRichness).toBeGreaterThan(0.6);
        });
        it('should scale efficiently with sample size', async () => {
            const largeSampleSet = Array.from({ length: 50 }, (_, i) => `This is sample number ${i + 1} demonstrating consistent voice patterns and style characteristics.`);
            const startTime = Date.now();
            const profile = await analyzer.analyze(largeSampleSet);
            const duration = Date.now() - startTime;
            expect(profile).toBeDefined();
            expect(profile.sampleCount).toBe(50);
            expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
        });
    });
    describe('Specialized Analysis Features', () => {
        it('should identify avoided words patterns', async () => {
            const samples = [
                'The implementation utilizes advanced methodologies rather than basic approaches.',
                'Sophisticated techniques enhance rather than complicate the process.',
                'Professional standards improve rather than hinder workflow efficiency.',
                'Strategic thinking facilitates rather than obstructs goal achievement.',
                'Comprehensive planning supports rather than undermines project success.',
            ];
            // Mock analyzer to simulate avoided words detection
            const mockAnalyzer = new voice_dna_analyzer_1.VoiceDNAAnalyzer();
            jest.spyOn(mockAnalyzer, 'analyze').mockResolvedValue({
                id: 'test-profile',
                userId: 'user-123',
                created: new Date(),
                updated: new Date(),
                sampleCount: 5,
                style: {
                    formality: 0.8,
                    complexity: 0.7,
                    emotionality: 0.3,
                    technicality: 0.6,
                },
                patterns: {
                    sentenceLength: { avg: 18, std: 4 },
                    paragraphLength: { avg: 1, std: 0 },
                    vocabularyRichness: 0.8,
                    punctuationStyle: { '.': 1.0 },
                },
                vocabulary: {
                    commonWords: ['the', 'rather', 'than'],
                    uniquePhrases: ['rather than', 'advanced methodologies'],
                    preferredTransitions: ['Furthermore', 'Additionally'],
                    avoidedWords: ['basic', 'simple', 'easy'],
                },
                tone: {
                    sentiment: 'positive',
                    energy: 'medium',
                    confidence: 0.85,
                },
            });
            const profile = await mockAnalyzer.analyze(samples);
            expect(profile.vocabulary.avoidedWords).toContain('basic');
            expect(profile.vocabulary.uniquePhrases).toContain('rather than');
        });
        it('should calculate vocabulary richness accurately', async () => {
            const repetitiveSamples = [
                'The system works well. The system is good. The system functions properly.',
                'The system operates efficiently. The system delivers results. The system performs adequately.',
                'The system maintains stability. The system ensures reliability. The system provides consistency.',
                'The system supports operations. The system enables functionality. The system facilitates processes.',
                'The system meets requirements. The system satisfies needs. The system fulfills expectations.',
            ];
            const profile = await analyzer.analyze(repetitiveSamples);
            // Should detect low vocabulary richness due to repetition
            expect(profile.patterns.vocabularyRichness).toBeLessThan(0.5);
            expect(profile.vocabulary.commonWords).toContain('system');
            expect(profile.vocabulary.commonWords).toContain('the');
        });
        it('should detect emotional intensity variations', async () => {
            const emotionalVariationSamples = [
                'I am pleased to present these findings.',
                'The results are absolutely fantastic and incredible!',
                'Data analysis proceeds systematically and methodically.',
                'This breakthrough is revolutionary and game-changing!',
                'Conclusions follow logically from empirical evidence.',
            ];
            const profile = await analyzer.analyze(emotionalVariationSamples);
            // Should show mixed emotionality due to variation
            expect(profile.style.emotionality).toBeGreaterThan(0.3);
            expect(profile.style.emotionality).toBeLessThan(0.8);
            expect(profile.tone.energy).toBe('medium');
        });
    });
    describe('Performance and Efficiency', () => {
        it('should complete analysis within reasonable time', async () => {
            const standardSamples = Array.from({ length: 10 }, (_, i) => `Standard sample ${i + 1} with consistent style and voice characteristics.`);
            const startTime = Date.now();
            await analyzer.analyze(standardSamples);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
        });
        it('should handle concurrent analysis requests', async () => {
            const samples1 = ['Sample set 1 text', 'More sample text', 'Additional content', 'Extra material', 'Final sample'];
            const samples2 = ['Sample set 2 text', 'Different sample text', 'Alternative content', 'Other material', 'Last sample'];
            const promises = [
                analyzer.analyze(samples1),
                analyzer.analyze(samples2),
            ];
            const results = await Promise.all(promises);
            expect(results).toHaveLength(2);
            expect(results[0]).toBeDefined();
            expect(results[1]).toBeDefined();
            expect(results[0].id).not.toBe(results[1].id);
        });
    });
});
//# sourceMappingURL=voice-dna-analyzer.test.js.map