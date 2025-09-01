"use strict";
/**
 * Creator Agent
 * Content generation with Voice DNA system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorAgent = exports.CreatorAgent = void 0;
const base_agent_1 = require("../base-agent");
const document_schema_1 = require("../../shared/pipeline/document-schema");
const logger_1 = require("../../shared/utils/logger");
const voice_dna_analyzer_1 = require("./voice-dna-analyzer");
const content_generator_1 = require("./content-generator");
const dialogue_manager_1 = require("./dialogue-manager");
const logger = (0, logger_1.createLogger)('CreatorAgent');
/**
 * Creator Agent Implementation
 */
class CreatorAgent extends base_agent_1.BaseAgent {
    constructor() {
        super();
        this.id = 'creator';
        this.name = 'Creator Agent';
        this.version = '2.0.0';
        this.voiceProfiles = new Map();
        this.creationStats = {
            totalCreations: 0,
            modeUsage: { quick: 0, standard: 0, custom: 0 },
            averageConsistency: 0,
            averageTime: 0,
        };
        this.voiceDNAAnalyzer = new voice_dna_analyzer_1.VoiceDNAAnalyzer();
        this.contentGenerator = new content_generator_1.ContentGenerator();
        this.dialogueManager = new dialogue_manager_1.DialogueManager();
    }
    /**
     * Get agent capabilities
     */
    getCapabilities() {
        return [
            {
                id: 'voice-dna-generation',
                name: 'Voice DNA Generation',
                description: 'Extract and apply writing style',
                inputTypes: ['text'],
                outputTypes: ['profile'],
            },
            {
                id: 'content-creation',
                name: 'Content Creation',
                description: 'Generate content in user voice',
                inputTypes: ['insights'],
                outputTypes: ['content'],
            },
            {
                id: 'collaborative-dialogue',
                name: 'Collaborative Dialogue',
                description: 'Interactive content refinement',
                inputTypes: ['dialogue'],
                outputTypes: ['content'],
            },
        ];
    }
    /**
     * Main content creation method
     */
    async create(insights, options) {
        const startTime = Date.now();
        try {
            logger.info(`Creating content in ${options.mode} mode`);
            // Get or create voice profile
            const voiceProfile = options.voiceProfile || await this.getDefaultVoiceProfile();
            // Generate content based on mode
            let content;
            let title;
            switch (options.mode) {
                case 'quick':
                    ({ content, title } = await this.quickCreate(insights, voiceProfile));
                    break;
                case 'standard':
                    ({ content, title } = await this.standardCreate(insights, voiceProfile, options));
                    break;
                case 'custom':
                    ({ content, title } = await this.customCreate(insights, voiceProfile, options));
                    break;
                default:
                    throw new Error(`Unknown creation mode: ${options.mode}`);
            }
            // Apply Voice DNA
            const styledContent = await this.applyVoiceDNA(content, voiceProfile);
            // Validate consistency
            const consistency = await this.validateConsistency(styledContent, voiceProfile);
            if (consistency.overall < 90) {
                logger.warn(`Consistency score below target: ${consistency.overall}%`);
            }
            // Create content document
            const contentDoc = this.createContentDocument(insights, styledContent, title, voiceProfile, options.mode, consistency);
            // Update statistics
            this.updateStats(options.mode, consistency.overall, Date.now() - startTime);
            logger.info(`Content created successfully in ${Date.now() - startTime}ms`);
            return contentDoc;
        }
        catch (error) {
            logger.error('Content creation failed:', error);
            throw error;
        }
    }
    /**
     * Quick content creation (3-minute target)
     */
    async quickCreate(insights, profile) {
        logger.debug('Quick mode: Generating rapid content');
        // Extract key points from insights
        const keyPoints = insights.keyFindings.slice(0, 3);
        // Generate quick outline
        const outline = {
            introduction: `Based on recent analysis: ${insights.summary}`,
            mainPoints: keyPoints.map(point => ({
                point,
                expansion: this.expandPoint(point, 50), // 50 words per point
            })),
            conclusion: this.generateConclusion(keyPoints),
        };
        // Build content
        const sections = [];
        // Introduction
        sections.push(outline.introduction);
        sections.push('');
        // Main points
        for (const { point, expansion } of outline.mainPoints) {
            sections.push(`## ${point}`);
            sections.push(expansion);
            sections.push('');
        }
        // Conclusion
        sections.push('## Conclusion');
        sections.push(outline.conclusion);
        const content = sections.join('\n');
        const title = this.generateTitle(insights);
        return { content, title };
    }
    /**
     * Standard content creation (framework-based)
     */
    async standardCreate(insights, profile, options) {
        logger.debug('Standard mode: Framework-based generation');
        const framework = options.framework || 'analytical';
        const targetWords = options.targetWordCount || 1500;
        // Generate content using framework
        const content = await this.contentGenerator.generate({
            insights,
            framework,
            targetWords,
            tone: options.tone || 'professional',
            profile,
        });
        const title = this.generateTitle(insights);
        return { content, title };
    }
    /**
     * Custom content creation (interactive)
     */
    async customCreate(insights, profile, options) {
        logger.debug('Custom mode: Interactive generation');
        // Initialize dialogue session
        const session = await this.dialogueManager.startSession({
            insights,
            profile,
            interactive: options.interactive ?? true,
        });
        // Generate initial draft
        let content = await this.contentGenerator.generateDraft(insights);
        // Iterative refinement
        for (let i = 0; i < 5; i++) { // Max 5 iterations
            const feedback = await this.dialogueManager.getFeedback(session, content);
            if (feedback.satisfied) {
                break;
            }
            content = await this.contentGenerator.refine(content, feedback);
        }
        const title = session.title || this.generateTitle(insights);
        return { content, title };
    }
    /**
     * Extract Voice DNA from samples
     */
    async extractVoiceDNA(samples) {
        if (samples.length < 5) {
            throw new Error('Minimum 5 samples required for Voice DNA extraction');
        }
        logger.info(`Extracting Voice DNA from ${samples.length} samples`);
        const profile = await this.voiceDNAAnalyzer.analyze(samples);
        // Cache the profile
        this.voiceProfiles.set(profile.id, profile);
        return profile;
    }
    /**
     * Apply Voice DNA to content
     */
    async applyVoiceDNA(content, profile) {
        logger.debug('Applying Voice DNA to content');
        // Apply style transformations
        let styledContent = content;
        // Adjust formality
        if (profile.style.formality < 0.5) {
            styledContent = this.makeInformal(styledContent);
        }
        else if (profile.style.formality > 0.7) {
            styledContent = this.makeFormal(styledContent);
        }
        // Apply vocabulary preferences
        styledContent = this.applyVocabulary(styledContent, profile.vocabulary);
        // Adjust sentence structure
        styledContent = this.adjustStructure(styledContent, profile.patterns);
        // Apply tone
        styledContent = this.applyTone(styledContent, profile.tone);
        return styledContent;
    }
    /**
     * Validate content consistency with Voice DNA
     */
    async validateConsistency(content, profile) {
        logger.debug('Validating content consistency');
        const analysis = await this.voiceDNAAnalyzer.analyzeContent(content);
        // Compare with profile
        const styleScore = this.compareStyle(analysis.style, profile.style);
        const vocabularyScore = this.compareVocabulary(analysis.vocabulary, profile.vocabulary);
        const structureScore = this.compareStructure(analysis.patterns, profile.patterns);
        const toneScore = this.compareTone(analysis.tone, profile.tone);
        const overall = (styleScore + vocabularyScore + structureScore + toneScore) / 4;
        const details = [];
        if (styleScore < 90)
            details.push(`Style match: ${styleScore}%`);
        if (vocabularyScore < 90)
            details.push(`Vocabulary match: ${vocabularyScore}%`);
        if (structureScore < 90)
            details.push(`Structure match: ${structureScore}%`);
        if (toneScore < 90)
            details.push(`Tone match: ${toneScore}%`);
        return {
            overall,
            style: styleScore,
            vocabulary: vocabularyScore,
            structure: structureScore,
            tone: toneScore,
            details,
        };
    }
    /**
     * Helper methods for text transformation
     */
    makeInformal(text) {
        return text
            .replace(/\bdo not\b/g, "don't")
            .replace(/\bcannot\b/g, "can't")
            .replace(/\bwill not\b/g, "won't");
    }
    makeFormal(text) {
        return text
            .replace(/\bdon't\b/g, 'do not')
            .replace(/\bcan't\b/g, 'cannot')
            .replace(/\bwon't\b/g, 'will not');
    }
    applyVocabulary(text, vocabulary) {
        // Apply preferred transitions
        for (const transition of vocabulary.preferredTransitions) {
            // Simple implementation - in production, use NLP
            text = text.replace(/\bHowever\b/g, transition);
        }
        // Avoid certain words
        for (const word of vocabulary.avoidedWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            text = text.replace(regex, '');
        }
        return text;
    }
    adjustStructure(text, patterns) {
        // Simplified - in production, use advanced NLP
        return text;
    }
    applyTone(text, tone) {
        // Simplified tone application
        if (tone.energy === 'high') {
            text = text.replace(/\./g, '!');
        }
        return text;
    }
    /**
     * Comparison methods for consistency scoring
     */
    compareStyle(a, b) {
        const diff = Math.abs(a.formality - b.formality) +
            Math.abs(a.complexity - b.complexity);
        return Math.max(0, 100 - diff * 50);
    }
    compareVocabulary(a, b) {
        // Simplified comparison
        return 92; // Placeholder
    }
    compareStructure(a, b) {
        return 91; // Placeholder
    }
    compareTone(a, b) {
        return a.sentiment === b.sentiment ? 95 : 85;
    }
    /**
     * Generate title from insights
     */
    generateTitle(insights) {
        if (insights.keyFindings.length > 0) {
            return insights.keyFindings[0].substring(0, 60);
        }
        return 'Untitled Content';
    }
    /**
     * Expand a point with additional content
     */
    expandPoint(point, targetWords) {
        // Simplified expansion
        return `${point}. This insight reveals important patterns and implications for understanding the broader context. Further analysis shows significant opportunities for application and development.`;
    }
    /**
     * Generate conclusion from key points
     */
    generateConclusion(keyPoints) {
        return `In summary, our analysis reveals ${keyPoints.length} key insights that provide a comprehensive understanding of the topic. These findings suggest important directions for future exploration and application.`;
    }
    /**
     * Get default voice profile
     */
    async getDefaultVoiceProfile() {
        // Return a neutral profile if none exists
        return {
            id: 'default',
            userId: 'system',
            created: new Date(),
            updated: new Date(),
            sampleCount: 0,
            style: {
                formality: 0.6,
                complexity: 0.5,
                emotionality: 0.4,
                technicality: 0.5,
            },
            patterns: {
                sentenceLength: { avg: 15, std: 5 },
                paragraphLength: { avg: 4, std: 2 },
                vocabularyRichness: 0.6,
                punctuationStyle: { '.': 0.7, '!': 0.1, '?': 0.2 },
            },
            vocabulary: {
                commonWords: [],
                uniquePhrases: [],
                preferredTransitions: ['Furthermore', 'Moreover', 'Additionally'],
                avoidedWords: [],
            },
            tone: {
                sentiment: 'neutral',
                energy: 'medium',
                confidence: 0.7,
            },
        };
    }
    /**
     * Create content document
     */
    createContentDocument(insights, content, title, profile, mode, consistency) {
        const doc = (0, document_schema_1.createContentDocument)(insights.metadata.id, profile.id, mode, content, 'Creator Agent');
        doc.title = title;
        doc.sections = this.extractSections(content);
        doc.metadata.voiceDNA.confidence = consistency.overall / 100;
        doc.metadata.voiceDNA.sampleCount = profile.sampleCount;
        return doc;
    }
    /**
     * Extract sections from content
     */
    extractSections(content) {
        const lines = content.split('\n');
        const sections = [];
        let currentSection = null;
        for (const line of lines) {
            if (line.startsWith('#')) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                const level = line.match(/^#+/)?.[0].length || 1;
                currentSection = {
                    heading: line.replace(/^#+\s*/, ''),
                    content: '',
                    level,
                    wordCount: 0,
                };
            }
            else if (currentSection) {
                currentSection.content += line + '\n';
                currentSection.wordCount = currentSection.content.split(/\s+/).length;
            }
        }
        if (currentSection) {
            sections.push(currentSection);
        }
        return sections;
    }
    /**
     * Update statistics
     */
    updateStats(mode, consistency, time) {
        this.creationStats.totalCreations++;
        this.creationStats.modeUsage[mode]++;
        const n = this.creationStats.totalCreations;
        this.creationStats.averageConsistency =
            (this.creationStats.averageConsistency * (n - 1) + consistency) / n;
        this.creationStats.averageTime =
            (this.creationStats.averageTime * (n - 1) + time) / n;
    }
    /**
     * Process agent request
     */
    async processRequest(request) {
        try {
            const insights = request.data.insights;
            const options = request.data.options;
            const result = await this.create(insights, options);
            return {
                success: true,
                data: result,
                metadata: {
                    processingTime: Date.now() - request.timestamp.getTime(),
                    agent: this.id,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: {
                    agent: this.id,
                },
            };
        }
    }
    /**
     * Agent lifecycle methods
     */
    async onInitialize() {
        logger.info('Creator Agent initializing...');
    }
    async onStart() {
        logger.info('Creator Agent started');
    }
    async onStop() {
        logger.info('Creator Agent stopping...');
    }
    async onShutdown() {
        logger.info('Creator Agent shutting down...');
        this.voiceProfiles.clear();
    }
}
exports.CreatorAgent = CreatorAgent;
// Export singleton instance
exports.creatorAgent = new CreatorAgent();
//# sourceMappingURL=index.js.map