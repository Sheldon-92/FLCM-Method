"use strict";
/**
 * Scholar Command Handler
 * Bridges Claude commands to ScholarAgent functionality
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
exports.ScholarHandler = void 0;
const types_1 = require("./types");
const scholar_agent_1 = require("../agents/implementations/scholar-agent");
const collector_agent_1 = require("../agents/implementations/collector-agent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ScholarHandler {
    constructor() {
        this.scholarAgent = new scholar_agent_1.ScholarAgent();
        this.collectorAgent = new collector_agent_1.CollectorAgent();
    }
    async execute(context) {
        try {
            // Show help if requested
            if (context.options.help) {
                return this.showHelp();
            }
            // Parse and validate input
            const input = await this.parseInput(context);
            // Initialize agents if not already done
            if (!this.scholarAgent.isInitialized()) {
                await this.scholarAgent.init();
            }
            if (!this.collectorAgent.isInitialized()) {
                await this.collectorAgent.init();
            }
            console.log(`📚 Scholar Analysis Starting...`);
            console.log(`   📄 Input: ${this.getInputDescription(input)}`);
            // Convert input to ContentBrief if it's raw content
            let brief;
            if (input.type === 'content-brief') {
                brief = input;
            }
            else {
                console.log(`   🔍 Creating content brief...`);
                brief = await this.collectorAgent.execute(input);
            }
            // Execute Scholar analysis
            console.log(`   🎓 Executing Scholar Agent...`);
            const synthesis = await this.scholarAgent.execute(brief);
            // Save results
            const outputPath = await this.saveResults(synthesis, context.options);
            // Format success response
            const duration = synthesis.metadata.processingTime;
            const confidence = Math.round(synthesis.confidence * 100);
            console.log(`✅ Scholar Analysis Complete!`);
            console.log(`   💪 Confidence: ${confidence}%`);
            console.log(`   📊 Depth Level: ${synthesis.metadata.depthAchieved}/5`);
            console.log(`   ❓ Questions: ${synthesis.metadata.questionsCreated}`);
            console.log(`   🔗 Analogies: ${synthesis.metadata.analogiesGenerated}`);
            console.log(`   💾 Saved to: ${outputPath}`);
            return {
                success: true,
                message: `Scholar analysis complete with ${confidence}% confidence`,
                data: {
                    synthesis: {
                        concept: synthesis.concept.name,
                        confidence: synthesis.confidence,
                        depthAchieved: synthesis.metadata.depthAchieved,
                        questionsCreated: synthesis.metadata.questionsCreated,
                        analogiesGenerated: synthesis.metadata.analogiesGenerated,
                        teachingReady: synthesis.metadata.teachingReady
                    },
                    outputPath,
                    processingTime: duration
                }
            };
        }
        catch (error) {
            console.error(`❌ Scholar analysis failed: ${error.message}`);
            if (error.code) {
                throw new types_1.FLCMCommandError(error.code, error.message, this.getSuggestions(error.code), this.getExamples());
            }
            throw new types_1.FLCMCommandError('SCHOLAR_EXECUTION_ERROR', `Scholar analysis failed: ${error.message}`, ['Check your input format and try again'], this.getExamples());
        }
    }
    /**
     * Parse command input and convert to Document
     */
    async parseInput(context) {
        const options = context.options;
        // Check for input parameter
        if (!options.input && !options.file && !options.url && !options.text) {
            throw new types_1.FLCMCommandError('MISSING_INPUT', 'Scholar requires input content to analyze', [
                'Use --input "file.txt" to analyze a file',
                'Use --text "content" to analyze text directly',
                'Use --url "https://..." to analyze web content'
            ], this.getExamples());
        }
        let content;
        let inputType;
        let source;
        // Handle different input types
        if (options.input || options.file) {
            const filePath = options.input || options.file;
            source = filePath;
            if (!fs.existsSync(filePath)) {
                throw new types_1.FLCMCommandError('FILE_NOT_FOUND', `File not found: ${filePath}`, ['Check the file path and try again'], this.getExamples());
            }
            content = fs.readFileSync(filePath, 'utf-8');
            inputType = this.getFileType(filePath);
        }
        else if (options.text) {
            content = options.text;
            inputType = 'text';
            source = 'direct input';
        }
        else if (options.url) {
            // For now, we'll treat URL as text input
            // In production, you'd want to fetch the URL content
            source = options.url;
            inputType = 'url';
            content = `URL content from: ${options.url}`;
            throw new types_1.FLCMCommandError('URL_NOT_IMPLEMENTED', 'URL fetching is not yet implemented', ['Use --input "file.txt" or --text "content" instead'], this.getExamples());
        }
        // Validate content length
        if (content.length < 50) {
            throw new types_1.FLCMCommandError('CONTENT_TOO_SHORT', 'Content is too short for meaningful analysis (minimum 50 characters)', ['Provide longer content for better analysis'], this.getExamples());
        }
        // Create document
        return {
            id: `input-${Date.now()}`,
            type: 'raw-content',
            content: content,
            timestamp: new Date(),
            metadata: {
                inputType,
                source,
                length: content.length
            }
        };
    }
    /**
     * Save analysis results
     */
    async saveResults(synthesis, options) {
        const outputDir = options.output || 'flcm-outputs';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `scholar-analysis-${timestamp}.md`;
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, filename);
        // Format analysis as Markdown
        const markdown = this.formatAsMarkdown(synthesis);
        // Write to file
        fs.writeFileSync(outputPath, markdown, 'utf-8');
        return outputPath;
    }
    /**
     * Format synthesis results as Markdown
     */
    formatAsMarkdown(synthesis) {
        const concept = synthesis.concept;
        const depth = synthesis.depthAnalysis;
        const analogies = synthesis.analogies;
        let markdown = `# Scholar Analysis: ${concept.name}

## 📊 Analysis Summary
- **Concept**: ${concept.name}
- **Confidence**: ${Math.round(synthesis.confidence * 100)}%
- **Depth Achieved**: Level ${synthesis.metadata.depthAchieved}/5
- **Teaching Ready**: ${synthesis.metadata.teachingReady ? 'Yes' : 'No'}
- **Processing Time**: ${synthesis.metadata.processingTime}ms

## 🎯 Concept Definition
${concept.definition}

**Context**: ${concept.context}
**Importance Score**: ${Math.round(concept.importance * 100)}/100

## 📈 Progressive Depth Analysis

`;
        // Add depth levels
        depth.levels.forEach(level => {
            if (level.complete) {
                markdown += `### Level ${level.level}: ${level.name}
**Confidence**: ${Math.round(level.confidence * 100)}%
**Content**: ${level.content}

`;
            }
        });
        // Add analogies
        if (analogies.analogies.length > 0) {
            markdown += `## 🔗 Analogies

`;
            if (analogies.bestAnalogy) {
                markdown += `**Best Analogy**: ${concept.name} is like ${analogies.bestAnalogy.target}
*Explanation*: ${analogies.bestAnalogy.explanation}

`;
            }
            markdown += `**All Analogies**:
`;
            analogies.analogies.forEach((analogy, index) => {
                markdown += `${index + 1}. **${analogy.target}** (Score: ${analogy.score.toFixed(2)})
   - *${analogy.explanation}*

`;
            });
        }
        // Add teaching questions
        const questions = synthesis.questions;
        if (questions.size > 0) {
            markdown += `## ❓ Teaching Questions

`;
            questions.forEach((questionList, level) => {
                if (questionList.length > 0) {
                    markdown += `### Level ${level} Questions:
`;
                    questionList.forEach((question, index) => {
                        markdown += `${index + 1}. ${question}
`;
                    });
                    markdown += `
`;
                }
            });
        }
        // Add teaching notes
        if (synthesis.teachingNotes.length > 0) {
            markdown += `## 📝 Teaching Notes

`;
            synthesis.teachingNotes.forEach((note, index) => {
                const importance = note.importance.toUpperCase();
                const type = note.type.charAt(0).toUpperCase() + note.type.slice(1);
                markdown += `${index + 1}. **${type}** (${importance} - Level ${note.level})
   ${note.content}

`;
            });
        }
        // Add concept connections
        if (synthesis.connections.length > 0) {
            markdown += `## 🌐 Concept Connections

`;
            synthesis.connections.forEach((connection, index) => {
                markdown += `${index + 1}. **${connection.relatedConcept}** (${connection.relationshipType})
   *Strength*: ${Math.round(connection.strength * 100)}/100
   *${connection.explanation}*

`;
            });
        }
        // Add knowledge gaps if any
        if (depth.gaps.length > 0) {
            markdown += `## ⚠️ Identified Knowledge Gaps

`;
            depth.gaps.forEach((gap, index) => {
                markdown += `${index + 1}. ${gap}
`;
            });
        }
        markdown += `
---
*Generated by FLCM Scholar Agent on ${synthesis.timestamp.toLocaleString()}*
`;
        return markdown;
    }
    /**
     * Get input description for logging
     */
    getInputDescription(input) {
        if (input.metadata?.source) {
            return `${input.metadata.source} (${input.metadata.length} chars)`;
        }
        return `${input.type} (${input.content.length} chars)`;
    }
    /**
     * Determine file type from extension
     */
    getFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.md': return 'markdown';
            case '.txt': return 'text';
            case '.pdf': return 'pdf';
            case '.docx': return 'word';
            case '.html': return 'html';
            default: return 'unknown';
        }
    }
    /**
     * Get suggestions based on error code
     */
    getSuggestions(errorCode) {
        switch (errorCode) {
            case 'MISSING_INPUT':
                return [
                    'Provide input using --input "file.txt"',
                    'Use --text "your content" for direct text',
                    'Add --help to see all options'
                ];
            case 'FILE_NOT_FOUND':
                return [
                    'Check the file path is correct',
                    'Use absolute paths if needed',
                    'Make sure the file exists'
                ];
            case 'CONTENT_TOO_SHORT':
                return [
                    'Provide at least 50 characters of content',
                    'Use more comprehensive source material',
                    'Combine multiple short texts'
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
            '/flcm:scholar --input "research.pdf"',
            '/flcm:scholar --text "Your content here" --output "results/"',
            '/flcm:scholar --input "data.txt" --framework "SWOT-USED"'
        ];
    }
    /**
     * Show help information
     */
    showHelp() {
        const helpText = `
🎓 FLCM Scholar Agent - Deep Content Analysis

USAGE:
  /flcm:scholar [options]

OPTIONS:
  --input FILE          Analyze content from file
  --file FILE           Alias for --input
  --text CONTENT        Analyze text directly
  --url URL             Analyze web content (coming soon)
  --output DIR          Output directory (default: flcm-outputs)
  --framework NAME      Analysis framework (default: progressive-depth)
  --help                Show this help message

EXAMPLES:
  /flcm:scholar --input "research.pdf"
  /flcm:scholar --text "Content to analyze" --output "analysis/"
  /flcm:scholar --input "data.txt" --framework "SWOT-USED"

SUPPORTED FILE TYPES:
  .txt, .md, .pdf, .docx, .html

OUTPUT:
  Creates detailed Markdown analysis with:
  - Concept definitions and context
  - Progressive depth learning (5 levels)
  - Generated analogies and examples
  - Teaching questions for each level
  - Concept connections and relationships
  - Identified knowledge gaps
    `.trim();
        return {
            success: true,
            message: helpText,
            data: {
                usage: 'flcm:scholar [options]',
                options: [
                    'input', 'file', 'text', 'url', 'output', 'framework', 'help'
                ]
            }
        };
    }
}
exports.ScholarHandler = ScholarHandler;
//# sourceMappingURL=scholar-handler.js.map