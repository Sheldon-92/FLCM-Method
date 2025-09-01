"use strict";
/**
 * Creator Command Handler
 * Bridges Claude commands to CreatorAgent functionality
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
exports.CreatorHandler = void 0;
const types_1 = require("./types");
const creator_agent_1 = require("../agents/implementations/creator-agent");
const collector_agent_1 = require("../agents/implementations/collector-agent");
const scholar_agent_1 = require("../agents/implementations/scholar-agent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CreatorHandler {
    constructor() {
        this.creatorAgent = new creator_agent_1.CreatorAgent();
        this.scholarAgent = new scholar_agent_1.ScholarAgent();
        this.collectorAgent = new collector_agent_1.CollectorAgent();
    }
    async execute(context) {
        try {
            // Show help if requested
            if (context.options.help) {
                return this.showHelp();
            }
            // Parse input and options
            const { input, mode, topic } = await this.parseInput(context);
            // Initialize agents if needed
            if (!this.creatorAgent.isInitialized()) {
                await this.creatorAgent.init();
            }
            console.log(`✍️  Creator Agent Starting...`);
            console.log(`   📝 Mode: ${mode}`);
            console.log(`   🎯 Topic: ${topic || 'From input'}`);
            let synthesis;
            // If we have a knowledge synthesis input, use it directly
            if (input && input.type === 'knowledge-synthesis') {
                synthesis = input;
            }
            else {
                // Need to create synthesis first
                console.log(`   🎓 Creating knowledge synthesis...`);
                // Initialize scholar and collector if needed
                if (!this.scholarAgent.isInitialized()) {
                    await this.scholarAgent.init();
                }
                if (!this.collectorAgent.isInitialized()) {
                    await this.collectorAgent.init();
                }
                let brief;
                if (input) {
                    // Convert input to ContentBrief
                    brief = await this.collectorAgent.execute(input);
                }
                else {
                    // Create brief from topic
                    brief = this.createTopicBrief(topic);
                }
                // Get knowledge synthesis
                synthesis = await this.scholarAgent.execute(brief);
            }
            // Execute Creator agent
            console.log(`   ✍️  Executing Creator Agent...`);
            const draft = await this.creatorAgent.execute(synthesis);
            // Save results
            const outputPath = await this.saveResults(draft, context.options);
            // Format success response
            const wordCount = draft.wordCount;
            const readingTime = draft.readingTime;
            const voiceConsistency = Math.round(draft.metadata.voiceConsistency * 100);
            const hookEffectiveness = Math.round(draft.metadata.hookEffectiveness * 100);
            console.log(`✅ Content Creation Complete!`);
            console.log(`   📊 Word Count: ${wordCount}`);
            console.log(`   ⏱️  Reading Time: ${readingTime} min`);
            console.log(`   🎤 Voice Consistency: ${voiceConsistency}%`);
            console.log(`   🎣 Hook Effectiveness: ${hookEffectiveness}%`);
            console.log(`   🚀 Ready to Publish: ${draft.metadata.readyToPublish ? 'Yes' : 'No'}`);
            console.log(`   💾 Saved to: ${outputPath}`);
            return {
                success: true,
                message: `Content created successfully with ${voiceConsistency}% voice consistency`,
                data: {
                    draft: {
                        title: draft.title,
                        wordCount: draft.wordCount,
                        readingTime: draft.readingTime,
                        voiceConsistency: draft.metadata.voiceConsistency,
                        hookEffectiveness: draft.metadata.hookEffectiveness,
                        readyToPublish: draft.metadata.readyToPublish,
                        engagementScore: draft.engagementScore,
                        iterations: draft.metadata.iterations
                    },
                    outputPath,
                    processingTime: draft.metadata.processingTime
                }
            };
        }
        catch (error) {
            console.error(`❌ Content creation failed: ${error.message}`);
            if (error.code) {
                throw new types_1.FLCMCommandError(error.code, error.message, this.getSuggestions(error.code), this.getExamples());
            }
            throw new types_1.FLCMCommandError('CREATOR_EXECUTION_ERROR', `Content creation failed: ${error.message}`, ['Check your input and try again'], this.getExamples());
        }
    }
    /**
     * Parse command input and options
     */
    async parseInput(context) {
        const options = context.options;
        // Determine mode
        const mode = options.mode || 'standard';
        if (!['quick', 'standard', 'custom'].includes(mode)) {
            throw new types_1.FLCMCommandError('INVALID_MODE', `Invalid mode: ${mode}`, ['Use --mode quick, --mode standard, or --mode custom'], this.getExamples());
        }
        // Check for topic or input
        const topic = options.topic;
        let input;
        // Handle input sources
        if (options.input || options.file) {
            // File input
            const filePath = options.input || options.file;
            if (!fs.existsSync(filePath)) {
                throw new types_1.FLCMCommandError('FILE_NOT_FOUND', `File not found: ${filePath}`, ['Check the file path and try again'], this.getExamples());
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            // Check if it's a synthesis file
            if (filePath.includes('scholar-analysis') || content.includes('knowledge-synthesis')) {
                // Try to parse as synthesis
                input = this.parseSynthesisFile(content, filePath);
            }
            else {
                // Regular content file
                input = {
                    id: `creator-input-${Date.now()}`,
                    type: 'raw-content',
                    content,
                    timestamp: new Date(),
                    metadata: {
                        source: filePath,
                        inputType: this.getFileType(filePath)
                    }
                };
            }
        }
        else if (options.synthesis) {
            // Direct synthesis input
            if (!fs.existsSync(options.synthesis)) {
                throw new types_1.FLCMCommandError('SYNTHESIS_NOT_FOUND', `Synthesis file not found: ${options.synthesis}`, ['Provide a valid synthesis file from Scholar Agent'], this.getExamples());
            }
            const content = fs.readFileSync(options.synthesis, 'utf-8');
            input = this.parseSynthesisFile(content, options.synthesis);
        }
        // Must have either input or topic
        if (!input && !topic) {
            throw new types_1.FLCMCommandError('MISSING_INPUT_OR_TOPIC', 'Creator requires either input content or a topic', [
                'Use --topic "Your topic" to create from scratch',
                'Use --input "file.txt" to use existing content',
                'Use --synthesis "scholar-analysis.md" to use Scholar output'
            ], this.getExamples());
        }
        return { input, mode, topic };
    }
    /**
     * Create a content brief from topic
     */
    createTopicBrief(topic) {
        return {
            id: `topic-brief-${Date.now()}`,
            type: 'content-brief',
            content: `Content creation request for topic: ${topic}`,
            summary: {
                mainTopic: topic,
                keyPoints: [topic],
                targetAudience: 'General audience'
            },
            signals: {
                keyInsights: [topic],
                trendingTerms: [topic],
                sentimentAnalysis: 'neutral',
                complexityLevel: 'medium'
            },
            riceScore: {
                reach: 70,
                impact: 70,
                confidence: 70,
                effort: 30,
                total: 70
            },
            recommendations: [
                'Focus on engaging content',
                'Use clear structure',
                'Include practical examples'
            ],
            timestamp: new Date(),
            metadata: {
                quality: 'good',
                confidence: 0.7,
                processingTime: 0
            }
        };
    }
    /**
     * Parse synthesis file (simplified for demo)
     */
    parseSynthesisFile(content, filePath) {
        // In a full implementation, you'd parse the Markdown to extract structured data
        // For now, we'll create a simplified synthesis
        const lines = content.split('\n');
        const titleLine = lines.find(line => line.startsWith('# Scholar Analysis:'));
        const conceptName = titleLine ? titleLine.replace('# Scholar Analysis:', '').trim() : 'Unknown Concept';
        return {
            id: `synthesis-${Date.now()}`,
            type: 'knowledge-synthesis',
            content,
            timestamp: new Date(),
            metadata: {
                source: filePath,
                conceptName,
                inputType: 'synthesis'
            }
        };
    }
    /**
     * Save creation results
     */
    async saveResults(draft, options) {
        const outputDir = options.output || 'flcm-outputs';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `content-draft-${timestamp}.md`;
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, filename);
        // Format draft as Markdown
        const markdown = this.formatAsMarkdown(draft);
        // Write to file
        fs.writeFileSync(outputPath, markdown, 'utf-8');
        // Also save as JSON for machine processing
        const jsonPath = outputPath.replace('.md', '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(draft, null, 2), 'utf-8');
        return outputPath;
    }
    /**
     * Format draft results as Markdown
     */
    formatAsMarkdown(draft) {
        const voiceConsistency = Math.round(draft.metadata.voiceConsistency * 100);
        const hookEffectiveness = Math.round(draft.metadata.hookEffectiveness * 100);
        let markdown = `# ${draft.title}

## 📊 Content Metrics
- **Word Count**: ${draft.wordCount}
- **Reading Time**: ${draft.readingTime} minutes
- **Voice Consistency**: ${voiceConsistency}%
- **Hook Effectiveness**: ${hookEffectiveness}%
- **Engagement Score**: ${Math.round(draft.engagementScore * 100)}%
- **Ready to Publish**: ${draft.metadata.readyToPublish ? 'Yes ✅' : 'No ⚠️'}
- **Iterations**: ${draft.metadata.iterations}

## 🎣 Hook
${draft.hook}

## 📝 Content

${draft.content}

## 🎤 Voice Profile
- **Formality**: ${Math.round(draft.voiceProfile.tone.formality * 100)}/100
- **Emotion**: ${Math.round(draft.voiceProfile.tone.emotion * 100)}/100  
- **Authority**: ${Math.round(draft.voiceProfile.tone.authority * 100)}/100
- **Conversational**: ${draft.voiceProfile.style.conversational ? 'Yes' : 'No'}
- **Data-Oriented**: ${draft.voiceProfile.style.dataOriented ? 'Yes' : 'No'}
- **Storytelling**: ${draft.voiceProfile.style.storytelling ? 'Yes' : 'No'}

## ⚡ SPARK Elements
- **Key Message**: ${draft.sparkElements.keyMessage}
- **Purpose**: ${draft.sparkElements.purpose}
- **Target Audience**: ${draft.sparkElements.audience}

## 📋 Content Structure
**Flow**: ${draft.structure.flow}

**Sections**:
`;
        draft.structure.sections.forEach((section, index) => {
            markdown += `${index + 1}. ${section.title}
   *${section.purpose}*

`;
        });
        // Add revisions if any
        if (draft.revisions.length > 0) {
            markdown += `## 🔄 Revision History

`;
            draft.revisions.forEach((revision, index) => {
                markdown += `### Version ${revision.version} (${revision.timestamp.toLocaleString()})
**Improvement**: +${Math.round(revision.improvement * 100)}%
**Changes**: ${revision.changes.join(', ')}

`;
            });
        }
        markdown += `
---
*Generated by FLCM Creator Agent on ${draft.timestamp.toLocaleString()}*
*Processing Time: ${draft.metadata.processingTime}ms*
`;
        return markdown;
    }
    /**
     * Determine file type from extension
     */
    getFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.md': return 'markdown';
            case '.txt': return 'text';
            case '.json': return 'json';
            default: return 'unknown';
        }
    }
    /**
     * Get suggestions based on error code
     */
    getSuggestions(errorCode) {
        switch (errorCode) {
            case 'MISSING_INPUT_OR_TOPIC':
                return [
                    'Provide a topic with --topic "Your topic"',
                    'Use existing content with --input "file.txt"',
                    'Use Scholar output with --synthesis "analysis.md"'
                ];
            case 'INVALID_MODE':
                return [
                    'Use --mode quick for fast creation',
                    'Use --mode standard for comprehensive content',
                    'Use --mode custom for interactive creation'
                ];
            case 'FILE_NOT_FOUND':
                return [
                    'Check the file path is correct',
                    'Use absolute paths if needed',
                    'Make sure the file exists'
                ];
            default:
                return ['Use --help for usage information'];
        }
    }
    /**
     * Get usage examples
     */
    getExamples() {
        return [
            '/flcm:create --topic "AI in healthcare" --mode quick',
            '/flcm:create --input "research.txt" --mode standard',
            '/flcm:create --synthesis "scholar-analysis.md" --output "drafts/"',
            '/flcm:create --topic "Climate change" --mode custom --voice-sample "my-posts/"'
        ];
    }
    /**
     * Show help information
     */
    showHelp() {
        const helpText = `
✍️  FLCM Creator Agent - Content Creation with Voice Preservation

USAGE:
  /flcm:create [options]

OPTIONS:
  --topic TOPIC         Create content for specific topic
  --input FILE          Use existing content as input
  --synthesis FILE      Use Scholar analysis as input
  --mode MODE           Creation mode: quick|standard|custom (default: standard)
  --output DIR          Output directory (default: flcm-outputs)
  --voice-sample DIR    Directory with your writing samples
  --help                Show this help message

MODES:
  quick                 Fast content generation (20-30 min)
  standard              Comprehensive content creation (45-60 min)
  custom                Interactive content creation with dialogue

EXAMPLES:
  /flcm:create --topic "AI in healthcare" --mode quick
  /flcm:create --input "research.txt" --mode standard  
  /flcm:create --synthesis "scholar-analysis.md" --output "drafts/"
  /flcm:create --topic "Climate change" --voice-sample "my-posts/"

INPUT TYPES:
  - Topic: Direct topic specification
  - Content file: .txt, .md files with content to transform
  - Scholar synthesis: Output from Scholar Agent analysis

OUTPUT:
  Creates content draft with:
  - Engaging hook and structured content
  - Voice DNA analysis and consistency scoring
  - SPARK framework elements
  - Content metrics and optimization suggestions
  - Both Markdown (.md) and JSON (.json) formats
    `.trim();
        return {
            success: true,
            message: helpText,
            data: {
                usage: 'flcm:create [options]',
                options: [
                    'topic', 'input', 'synthesis', 'mode', 'output', 'voice-sample', 'help'
                ],
                modes: ['quick', 'standard', 'custom']
            }
        };
    }
}
exports.CreatorHandler = CreatorHandler;
//# sourceMappingURL=creator-handler.js.map