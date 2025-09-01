"use strict";
/**
 * Scholar Agent
 * Deep learning and multi-source analysis agent
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scholarAgent = exports.ScholarAgent = void 0;
const base_agent_1 = require("../base-agent");
const document_schema_1 = require("../../shared/pipeline/document-schema");
const logger_1 = require("../../shared/utils/logger");
// Import processors
const text_processor_1 = require("./processors/text-processor");
const pdf_processor_1 = require("./processors/pdf-processor");
const web_processor_1 = require("./processors/web-processor");
const media_processor_1 = require("./processors/media-processor");
const code_processor_1 = require("./processors/code-processor");
// Import frameworks
const swot_used_1 = require("./frameworks/swot-used");
const scamper_1 = require("./frameworks/scamper");
const socratic_1 = require("./frameworks/socratic");
const five_w_two_h_1 = require("./frameworks/five-w-two-h");
const pyramid_1 = require("./frameworks/pyramid");
const logger = (0, logger_1.createLogger)('ScholarAgent');
/**
 * Scholar Agent Implementation
 */
class ScholarAgent extends base_agent_1.BaseAgent {
    constructor() {
        super();
        this.id = 'scholar';
        this.name = 'Scholar Agent';
        this.version = '2.0.0';
        this.processors = new Map();
        this.frameworks = new Map();
        this.processingCache = new Map();
        this.metrics = this.initializeMetrics();
        this.initializeProcessors();
        this.initializeFrameworks();
    }
    /**
     * Get agent capabilities
     */
    getCapabilities() {
        return [
            {
                id: 'multi-source-analysis',
                name: 'Multi-Source Analysis',
                description: 'Analyze various input types',
                inputTypes: Object.values(document_schema_1.SourceType),
                outputTypes: ['insights'],
            },
            {
                id: 'framework-analysis',
                name: 'Framework Analysis',
                description: 'Apply professional analysis frameworks',
                inputTypes: ['text'],
                outputTypes: ['analysis'],
            },
        ];
    }
    /**
     * Initialize input processors
     */
    initializeProcessors() {
        this.processors.set(document_schema_1.SourceType.TEXT, new text_processor_1.TextProcessor());
        this.processors.set(document_schema_1.SourceType.MARKDOWN, new text_processor_1.TextProcessor());
        this.processors.set(document_schema_1.SourceType.PDF, new pdf_processor_1.PDFProcessor());
        this.processors.set(document_schema_1.SourceType.WEBPAGE, new web_processor_1.WebProcessor());
        this.processors.set(document_schema_1.SourceType.VIDEO, new media_processor_1.MediaProcessor());
        this.processors.set(document_schema_1.SourceType.AUDIO, new media_processor_1.MediaProcessor());
        this.processors.set(document_schema_1.SourceType.IMAGE, new media_processor_1.MediaProcessor());
        this.processors.set(document_schema_1.SourceType.CODE, new code_processor_1.CodeProcessor());
        this.processors.set(document_schema_1.SourceType.SPREADSHEET, new code_processor_1.CodeProcessor());
    }
    /**
     * Initialize analysis frameworks
     */
    initializeFrameworks() {
        this.frameworks.set('SWOT-USED', new swot_used_1.SWOTUSEDFramework());
        this.frameworks.set('SCAMPER', new scamper_1.SCAMPERFramework());
        this.frameworks.set('Socratic', new socratic_1.SocraticFramework());
        this.frameworks.set('5W2H', new five_w_two_h_1.FiveW2HFramework());
        this.frameworks.set('Pyramid', new pyramid_1.PyramidFramework());
    }
    /**
     * Initialize performance metrics
     */
    initializeMetrics() {
        return {
            totalAnalyses: 0,
            averageProcessingTime: 0,
            frameworkUsage: {},
            inputTypeDistribution: {},
            errorRate: 0,
        };
    }
    /**
     * Main analysis method
     */
    async analyze(input) {
        const startTime = Date.now();
        try {
            // Validate input
            this.validateInput(input);
            // Detect input type if not provided
            const inputType = input.type || this.detectInputType(input.source);
            // Check cache if enabled
            const cacheKey = this.generateCacheKey(input);
            if (input.options?.cacheResults && this.processingCache.has(cacheKey)) {
                logger.info('Returning cached analysis result');
                return this.processingCache.get(cacheKey);
            }
            // Extract content from source
            const extractedContent = await this.extractContent(input.source, inputType);
            // Apply frameworks
            const frameworksToApply = input.frameworks || ['SWOT-USED', 'Socratic', '5W2H'];
            const frameworkResults = await this.applyFrameworks(extractedContent.text, frameworksToApply, input.options?.parallelFrameworks ?? true);
            // Generate insights document
            const insightsDoc = this.generateInsightsDocument(extractedContent, frameworkResults, inputType);
            // Extract citations if requested
            if (input.options?.extractCitations) {
                insightsDoc.references = this.extractCitations(extractedContent.text);
            }
            // Generate summary if requested
            if (input.options?.generateSummary) {
                insightsDoc.summary = this.generateSummary(frameworkResults);
            }
            // Update metrics
            this.updateMetrics(inputType, frameworksToApply, Date.now() - startTime);
            // Cache result if enabled
            if (input.options?.cacheResults) {
                this.processingCache.set(cacheKey, insightsDoc);
            }
            logger.info(`Analysis completed in ${Date.now() - startTime}ms`);
            return insightsDoc;
        }
        catch (error) {
            logger.error('Analysis failed:', error);
            this.metrics.errorRate++;
            throw error;
        }
    }
    /**
     * Validate input
     */
    validateInput(input) {
        if (!input.source) {
            throw new Error('Input source is required');
        }
        if (input.options?.maxProcessingTime && input.options.maxProcessingTime < 1000) {
            throw new Error('Max processing time must be at least 1000ms');
        }
    }
    /**
     * Detect input type from source
     */
    detectInputType(source) {
        if (typeof source === 'string') {
            // Check if it's a file path or URL
            if (source.startsWith('http://') || source.startsWith('https://')) {
                return document_schema_1.SourceType.WEBPAGE;
            }
            if (source.endsWith('.pdf')) {
                return document_schema_1.SourceType.PDF;
            }
            if (source.endsWith('.md')) {
                return document_schema_1.SourceType.MARKDOWN;
            }
            if (source.endsWith('.mp4') || source.endsWith('.avi')) {
                return document_schema_1.SourceType.VIDEO;
            }
            if (source.endsWith('.mp3') || source.endsWith('.wav')) {
                return document_schema_1.SourceType.AUDIO;
            }
            if (source.endsWith('.jpg') || source.endsWith('.png')) {
                return document_schema_1.SourceType.IMAGE;
            }
            if (source.endsWith('.js') || source.endsWith('.py') || source.endsWith('.ts')) {
                return document_schema_1.SourceType.CODE;
            }
            if (source.endsWith('.xlsx') || source.endsWith('.csv')) {
                return document_schema_1.SourceType.SPREADSHEET;
            }
            // Default to text
            return document_schema_1.SourceType.TEXT;
        }
        if (Buffer.isBuffer(source)) {
            // Try to detect from buffer content
            // This is simplified - in production, use file-type library
            return document_schema_1.SourceType.TEXT;
        }
        return document_schema_1.SourceType.TEXT;
    }
    /**
     * Extract content from source
     */
    async extractContent(source, type) {
        const processor = this.processors.get(type);
        if (!processor) {
            throw new Error(`No processor available for type: ${type}`);
        }
        try {
            const result = await processor.process(source);
            return {
                text: result.text,
                metadata: result.metadata || {},
            };
        }
        catch (error) {
            logger.error(`Content extraction failed for type ${type}:`, error);
            throw new Error(`Failed to extract content from ${type} source`);
        }
    }
    /**
     * Apply analysis frameworks
     */
    async applyFrameworks(content, frameworks, parallel = true) {
        if (parallel) {
            // Apply frameworks in parallel
            const promises = frameworks.map(fw => this.applyFramework(content, fw));
            return Promise.all(promises);
        }
        else {
            // Apply frameworks sequentially
            const results = [];
            for (const framework of frameworks) {
                const result = await this.applyFramework(content, framework);
                results.push(result);
            }
            return results;
        }
    }
    /**
     * Apply single framework
     */
    async applyFramework(content, framework) {
        const startTime = Date.now();
        const frameworkImpl = this.frameworks.get(framework);
        if (!frameworkImpl) {
            throw new Error(`Framework not implemented: ${framework}`);
        }
        try {
            const results = await frameworkImpl.analyze(content);
            const insights = frameworkImpl.extractInsights(results);
            return {
                framework,
                results,
                confidence: this.calculateConfidence(results),
                processingTime: Date.now() - startTime,
                insights,
            };
        }
        catch (error) {
            logger.error(`Framework ${framework} failed:`, error);
            throw error;
        }
    }
    /**
     * Calculate confidence score for framework results
     */
    calculateConfidence(results) {
        // Simple confidence calculation based on result completeness
        if (!results)
            return 0;
        let filledFields = 0;
        let totalFields = 0;
        const countFields = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    totalFields++;
                    if (obj[key] &&
                        ((Array.isArray(obj[key]) && obj[key].length > 0) ||
                            (typeof obj[key] === 'string' && obj[key].trim() !== ''))) {
                        filledFields++;
                    }
                }
            }
        };
        countFields(results);
        return totalFields > 0 ? filledFields / totalFields : 0;
    }
    /**
     * Generate insights document
     */
    generateInsightsDocument(extractedContent, frameworkResults, inputType) {
        const doc = (0, document_schema_1.createInsightsDocument)({
            type: inputType,
            path: 'input',
            hash: this.generateHash(extractedContent.text),
        }, frameworkResults.map(r => r.framework), this.formatInsightsContent(frameworkResults), 'Scholar Agent');
        // Add analysis results
        doc.analysisResults = frameworkResults.map(r => ({
            framework: r.framework,
            results: r.results,
            confidence: r.confidence,
            processingTime: r.processingTime,
        }));
        // Extract key findings
        doc.keyFindings = this.extractKeyFindings(frameworkResults);
        // Add recommendations
        doc.recommendations = this.generateRecommendations(frameworkResults);
        return doc;
    }
    /**
     * Format insights content as markdown
     */
    formatInsightsContent(results) {
        const sections = [];
        sections.push('# Insights Analysis\n');
        sections.push(`Generated: ${new Date().toISOString()}\n`);
        for (const result of results) {
            sections.push(`## ${result.framework} Analysis\n`);
            sections.push(`**Confidence**: ${(result.confidence * 100).toFixed(1)}%\n`);
            sections.push(`**Processing Time**: ${result.processingTime}ms\n`);
            sections.push('### Insights\n');
            for (const insight of result.insights) {
                sections.push(`- ${insight}`);
            }
            sections.push('');
        }
        return sections.join('\n');
    }
    /**
     * Extract key findings from framework results
     */
    extractKeyFindings(results) {
        const allInsights = results.flatMap(r => r.insights);
        // Simple extraction - take top insights with highest confidence
        const topResults = results
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
        return topResults.flatMap(r => r.insights.slice(0, 2));
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(results) {
        const recommendations = [];
        // Generate recommendations based on framework results
        for (const result of results) {
            if (result.framework === 'SWOT-USED' && result.results.weaknesses) {
                recommendations.push(`Address identified weaknesses: ${result.results.weaknesses.slice(0, 2).join(', ')}`);
            }
            if (result.framework === 'SCAMPER' && result.results.adapt) {
                recommendations.push(`Consider adaptations: ${result.results.adapt.slice(0, 2).join(', ')}`);
            }
        }
        return recommendations;
    }
    /**
     * Extract citations from content
     */
    extractCitations(content) {
        const citations = [];
        // Simple citation extraction patterns
        const patterns = [
            /\[(\d+)\]/g,
            /\(([^)]+, \d{4})\)/g,
            /https?:\/\/[^\s]+/g, // URLs
        ];
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                citations.push(...matches);
            }
        }
        return [...new Set(citations)]; // Remove duplicates
    }
    /**
     * Generate summary from framework results
     */
    generateSummary(results) {
        const summaryParts = [];
        summaryParts.push('Analysis Summary:');
        summaryParts.push(`Applied ${results.length} frameworks with average confidence of ${(results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100).toFixed(1)}%.`);
        const topInsights = results
            .flatMap(r => r.insights)
            .slice(0, 3);
        summaryParts.push('Key insights: ' + topInsights.join('; '));
        return summaryParts.join(' ');
    }
    /**
     * Generate cache key for input
     */
    generateCacheKey(input) {
        const source = typeof input.source === 'string' ? input.source : 'buffer';
        const frameworks = (input.frameworks || []).sort().join(',');
        return `${source}-${frameworks}`;
    }
    /**
     * Generate simple hash
     */
    generateHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
    /**
     * Update performance metrics
     */
    updateMetrics(inputType, frameworks, processingTime) {
        this.metrics.totalAnalyses++;
        // Update average processing time
        this.metrics.averageProcessingTime =
            (this.metrics.averageProcessingTime * (this.metrics.totalAnalyses - 1) + processingTime) /
                this.metrics.totalAnalyses;
        // Update input type distribution
        this.metrics.inputTypeDistribution[inputType] =
            (this.metrics.inputTypeDistribution[inputType] || 0) + 1;
        // Update framework usage
        for (const framework of frameworks) {
            this.metrics.frameworkUsage[framework] =
                (this.metrics.frameworkUsage[framework] || 0) + 1;
        }
    }
    /**
     * Get performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Process agent request
     */
    async processRequest(request) {
        try {
            const input = {
                source: request.data.source,
                type: request.data.type,
                frameworks: request.data.frameworks,
                options: request.data.options,
            };
            const result = await this.analyze(input);
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
     * Initialize agent
     */
    async onInitialize() {
        logger.info('Scholar Agent initializing...');
        // Additional initialization if needed
    }
    /**
     * Start agent
     */
    async onStart() {
        logger.info('Scholar Agent started');
    }
    /**
     * Stop agent
     */
    async onStop() {
        logger.info('Scholar Agent stopping...');
        // Clear cache
        this.processingCache.clear();
    }
    /**
     * Clean up resources
     */
    async onShutdown() {
        logger.info('Scholar Agent shutting down...');
        // Clean up processors and frameworks
        this.processors.clear();
        this.frameworks.clear();
    }
}
exports.ScholarAgent = ScholarAgent;
// Export singleton instance
exports.scholarAgent = new ScholarAgent();
//# sourceMappingURL=index.js.map