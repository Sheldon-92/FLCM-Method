"use strict";
/**
 * Collector Agent Implementation
 * Responsible for gathering and processing input sources
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorAgent = void 0;
const base_agent_1 = require("../base-agent");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const rice_1 = require("../../methodologies/collection/rice");
const signal_to_noise_1 = require("../../methodologies/collection/signal-to-noise");
/**
 * Collector Agent Class
 */
class CollectorAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('collector.yaml');
        // Initialize methodologies
        this.riceFramework = new rice_1.RICEFramework({
            keywords: ['AI', 'content', 'creation', 'methodology', 'framework'],
            audience: 'content creators and digital marketers'
        });
        this.signalFilter = new signal_to_noise_1.SignalToNoiseFilter();
    }
    /**
     * Initialize Collector-specific resources
     */
    async onInit() {
        console.log(`🎯 Initializing ${this.config.name} (${this.config.icon})`);
        // Initialize collector-specific resources
        this.state.sessionData.set('sourcesProcessed', 0);
        this.state.sessionData.set('totalWords', 0);
        // Load collector methodologies
        if (this.config.methodologies?.includes('rice-framework')) {
            console.log('  ✓ RICE Framework loaded');
        }
        if (this.config.methodologies?.includes('signal-extraction')) {
            console.log('  ✓ Signal Extraction loaded');
        }
    }
    /**
     * Execute collection and signal extraction
     */
    async onExecute(input) {
        const collectorInput = input;
        console.log(`📥 Processing ${collectorInput.type}: ${collectorInput.source}`);
        // Extract content based on source type
        let content;
        let sourceMetadata = {};
        switch (collectorInput.type) {
            case 'url':
                const urlResult = await this.extractFromUrl(collectorInput.source);
                content = urlResult.content;
                sourceMetadata = urlResult.metadata;
                break;
            case 'text':
                content = collectorInput.source;
                sourceMetadata = { type: 'direct_input' };
                break;
            case 'file':
                content = await this.extractFromFile(collectorInput.source);
                sourceMetadata = { type: 'file', path: collectorInput.source };
                break;
            default:
                throw new base_agent_1.AgentError(this.config.id, 'INVALID_INPUT_TYPE', `Unsupported input type: ${collectorInput.type}`, false);
        }
        // Apply Signal-to-Noise filter
        const signalAnalysis = this.signalFilter.analyze(content);
        const cleanContent = this.signalFilter.getCleanContent(content, signalAnalysis);
        // Calculate RICE score
        const riceScore = this.riceFramework.calculate(cleanContent, sourceMetadata);
        const recommendations = this.riceFramework.getRecommendations(riceScore);
        // Extract key insights from signals
        const insights = this.signalFilter.extractKeyInsights(signalAnalysis.signals);
        // Determine content quality
        const quality = this.determineQuality(riceScore, signalAnalysis);
        // Create content brief
        const brief = {
            id: this.generateDocumentId(),
            type: 'content-brief',
            content: cleanContent,
            signals: {
                keyInsights: insights.length > 0 ? insights : this.extractKeyPoints(cleanContent),
                relevanceScores: {
                    relevance: riceScore.relevance,
                    impact: riceScore.impact,
                    confidence: riceScore.confidence,
                    effort: riceScore.effort
                },
                extractedPatterns: this.extractPatterns(cleanContent),
                signalAnalysis
            },
            summary: {
                mainTopic: this.identifyMainTopic(cleanContent),
                keyPoints: this.extractKeyPoints(cleanContent),
                targetAudience: this.identifyAudience(cleanContent)
            },
            riceScore,
            metadata: {
                sourceUrl: collectorInput.type === 'url' ? collectorInput.source : undefined,
                extractionDate: new Date(),
                wordCount: cleanContent.split(/\s+/).length,
                readingTime: Math.ceil(cleanContent.split(/\s+/).length / 200),
                quality
            },
            timestamp: new Date()
        };
        // Update session statistics
        const processed = this.state.sessionData.get('sourcesProcessed') || 0;
        this.state.sessionData.set('sourcesProcessed', processed + 1);
        const totalWords = this.state.sessionData.get('totalWords') || 0;
        this.state.sessionData.set('totalWords', totalWords + brief.metadata.wordCount);
        console.log(`✅ Content brief created:`);
        console.log(`   📊 RICE Score: ${riceScore.total}/100 (R:${riceScore.relevance} I:${riceScore.impact} C:${riceScore.confidence} E:${riceScore.effort})`);
        console.log(`   📡 Signal Quality: ${quality} (${signalAnalysis.signals.length} signals, S/N ratio: ${signalAnalysis.signalToNoiseRatio.toFixed(2)})`);
        console.log(`   📝 Content: ${brief.metadata.wordCount} words, ${brief.metadata.readingTime} min read`);
        if (recommendations.length > 0) {
            console.log(`   💡 Recommendations:`);
            recommendations.forEach(rec => console.log(`      - ${rec}`));
        }
        return brief;
    }
    /**
     * Cleanup Collector resources
     */
    async onCleanup() {
        console.log(`🧹 Cleaning up ${this.config.name}`);
        // Log session statistics
        const processed = this.state.sessionData.get('sourcesProcessed') || 0;
        const totalWords = this.state.sessionData.get('totalWords') || 0;
        console.log(`  📊 Session stats: ${processed} sources, ${totalWords} words`);
    }
    /**
     * Validate Collector input
     */
    validateInput(input) {
        const collectorInput = input;
        if (!collectorInput.type) {
            throw new base_agent_1.AgentError(this.config.id, 'MISSING_INPUT_TYPE', 'Input type is required', false);
        }
        if (!collectorInput.source) {
            throw new base_agent_1.AgentError(this.config.id, 'MISSING_SOURCE', 'Input source is required', false);
        }
        // Validate URL format if type is URL
        if (collectorInput.type === 'url') {
            try {
                new URL(collectorInput.source);
            }
            catch {
                throw new base_agent_1.AgentError(this.config.id, 'INVALID_URL', `Invalid URL format: ${collectorInput.source}`, false);
            }
        }
    }
    // Private helper methods
    async extractFromUrl(url) {
        console.log(`  🌐 Fetching content from ${url}`);
        // In a real implementation, this would use a web scraper or API
        // For now, return placeholder with metadata
        const domain = new URL(url).hostname;
        const isAcademic = domain.includes('.edu') || domain.includes('scholar') || domain.includes('research');
        const isIndustry = domain.includes('medium') || domain.includes('substack') || domain.includes('linkedin');
        return {
            content: `Content extracted from ${url}. This is placeholder text that would normally be the actual content from the URL.\n\n` +
                `# Sample Article Title\n\n` +
                `This article discusses innovative approaches to content creation using AI and methodology-driven frameworks.\n\n` +
                `## Key Points\n\n` +
                `- AI can significantly enhance content creation efficiency\n` +
                `- Methodology-driven approaches ensure consistent quality\n` +
                `- Signal extraction helps identify valuable insights\n\n` +
                `According to recent studies, content creators who use structured frameworks see a 40% improvement in engagement.\n\n` +
                `The RICE framework provides a systematic way to evaluate content value...`,
            metadata: {
                source: isAcademic ? 'academic' : isIndustry ? 'industry' : 'general',
                domain,
                verified: isAcademic,
                hasImages: false,
                hasVideos: false
            }
        };
    }
    async extractFromFile(filePath) {
        console.log(`  📄 Reading file ${filePath}`);
        try {
            // Check if file exists
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                return content;
            }
            else {
                // Return placeholder if file doesn't exist
                return `File ${filePath} not found. Using placeholder content for demonstration.\n\n` +
                    `# Document Title\n\n` +
                    `This is sample content that would be extracted from the file.`;
            }
        }
        catch (error) {
            console.warn(`  ⚠️ Error reading file: ${error}`);
            return `Error reading file ${filePath}. Using placeholder content.`;
        }
    }
    determineQuality(riceScore, signalAnalysis) {
        const totalScore = riceScore.total;
        const signalQuality = signalAnalysis.signalToNoiseRatio;
        if (totalScore > 70 && signalQuality > 2)
            return 'high';
        if (totalScore > 40 || signalQuality > 1)
            return 'medium';
        return 'low';
    }
    extractPatterns(content) {
        const patterns = [];
        // Check for structural patterns
        if (/^#{1,6}\s+.+/gm.test(content))
            patterns.push('Hierarchical structure with headers');
        if (/^[\*\-\+]\s+.+/gm.test(content))
            patterns.push('List-based organization');
        if (/^\d+\.\s+.+/gm.test(content))
            patterns.push('Numbered sequence or steps');
        // Check for content patterns
        if (/problem.*solution|challenge.*approach/gi.test(content))
            patterns.push('Problem-solution format');
        if (/first.*then.*finally|step\s+\d+/gi.test(content))
            patterns.push('Sequential/procedural format');
        if (/however|but|although|despite/gi.test(content))
            patterns.push('Contrasting viewpoints');
        if (/example|case study|instance/gi.test(content))
            patterns.push('Example-driven explanation');
        // Check for rhetorical patterns
        if (/\?.*(\.|!)/g.test(content))
            patterns.push('Question-answer format');
        if (/"[^"]{20,}"/g.test(content))
            patterns.push('Quote-based authority');
        if (/\d+%|\d+x|\$\d+/g.test(content))
            patterns.push('Data-driven argument');
        return patterns.length > 0 ? patterns : ['No clear structural pattern identified'];
    }
    identifyMainTopic(content) {
        // Extract potential topic from headers
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match)
            return h1Match[1].trim();
        // Extract from title-like patterns
        const titleMatch = content.match(/^(.{10,100})\n=+$/m);
        if (titleMatch)
            return titleMatch[1].trim();
        // Look for repeated key phrases (simple topic extraction)
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 4);
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        // Get top words
        const topWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);
        return topWords.length > 0
            ? topWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' and ')
            : 'General Content';
    }
    extractKeyPoints(content) {
        const keyPoints = [];
        // Extract from bullet points
        const bullets = content.match(/^[\*\-\+]\s+(.+)$/gm);
        if (bullets) {
            keyPoints.push(...bullets.slice(0, 3).map(b => b.replace(/^[\*\-\+]\s+/, '').trim()));
        }
        // Extract from numbered lists
        const numbered = content.match(/^\d+\.\s+(.+)$/gm);
        if (numbered && keyPoints.length < 3) {
            keyPoints.push(...numbered.slice(0, 3 - keyPoints.length).map(n => n.replace(/^\d+\.\s+/, '').trim()));
        }
        // Extract sentences with strong signal words
        if (keyPoints.length < 3) {
            const signalSentences = content.match(/[^.!?]*\b(important|crucial|key|essential|significant|main)[^.!?]*[.!?]/gi);
            if (signalSentences) {
                keyPoints.push(...signalSentences.slice(0, 3 - keyPoints.length).map(s => s.trim()));
            }
        }
        // Fallback: get first sentences
        if (keyPoints.length === 0) {
            const sentences = content.match(/[^.!?]+[.!?]/g);
            if (sentences) {
                keyPoints.push(...sentences.slice(0, 3).map(s => s.trim()));
            }
        }
        return keyPoints.slice(0, 5); // Return max 5 points
    }
    identifyAudience(content) {
        const contentLower = content.toLowerCase();
        const audiences = [
            {
                keywords: ['developer', 'programmer', 'code', 'api', 'function', 'algorithm'],
                audience: 'Software developers and engineers'
            },
            {
                keywords: ['marketer', 'marketing', 'campaign', 'brand', 'engagement', 'conversion'],
                audience: 'Digital marketers and brand managers'
            },
            {
                keywords: ['designer', 'design', 'ux', 'ui', 'visual', 'creative'],
                audience: 'Designers and creative professionals'
            },
            {
                keywords: ['business', 'executive', 'strategy', 'revenue', 'growth', 'roi'],
                audience: 'Business leaders and executives'
            },
            {
                keywords: ['student', 'learn', 'tutorial', 'beginner', 'guide', 'how to'],
                audience: 'Students and learners'
            },
            {
                keywords: ['research', 'study', 'analysis', 'data', 'findings', 'methodology'],
                audience: 'Researchers and academics'
            },
            {
                keywords: ['content', 'writer', 'blog', 'article', 'publish', 'audience'],
                audience: 'Content creators and writers'
            }
        ];
        // Count keyword matches for each audience
        const scores = audiences.map(({ keywords, audience }) => {
            const score = keywords.reduce((sum, keyword) => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = contentLower.match(regex);
                return sum + (matches ? matches.length : 0);
            }, 0);
            return { audience, score };
        });
        // Sort by score and get the best match
        scores.sort((a, b) => b.score - a.score);
        return scores[0].score > 0
            ? scores[0].audience
            : 'General audience';
    }
    generateDocumentId() {
        return `brief-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
}
exports.CollectorAgent = CollectorAgent;
//# sourceMappingURL=collector-agent.js.map