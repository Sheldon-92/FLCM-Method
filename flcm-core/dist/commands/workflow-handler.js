"use strict";
/**
 * Workflow Command Handler
 * Orchestrates end-to-end content creation workflows
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
exports.WorkflowHandler = void 0;
const types_1 = require("./types");
const collector_agent_1 = require("../agents/implementations/collector-agent");
const scholar_agent_1 = require("../agents/implementations/scholar-agent");
const creator_agent_1 = require("../agents/implementations/creator-agent");
const adapter_agent_1 = require("../agents/implementations/adapter-agent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class WorkflowHandler {
    constructor(mode) {
        this.supportedPlatforms = ['linkedin', 'wechat', 'twitter', 'xiaohongshu'];
        this.collectorAgent = new collector_agent_1.CollectorAgent();
        this.scholarAgent = new scholar_agent_1.ScholarAgent();
        this.creatorAgent = new creator_agent_1.CreatorAgent();
        this.adapterAgent = new adapter_agent_1.AdapterAgent();
        this.mode = mode || 'flow';
    }
    async execute(context) {
        try {
            // Show help if requested
            if (context.options.help) {
                return this.showHelp();
            }
            const workflowId = `workflow-${Date.now()}`;
            const startTime = Date.now();
            console.log(`🔄 Starting ${this.mode.toUpperCase()} Workflow (ID: ${workflowId})`);
            // Parse input and workflow configuration
            const config = await this.parseWorkflowConfig(context);
            console.log(`   📋 Configuration:`);
            console.log(`      Input: ${config.inputDescription}`);
            console.log(`      Mode: ${config.mode}`);
            console.log(`      Platforms: ${config.platforms.join(', ')}`);
            console.log(`      Output: ${config.outputAll ? 'All stages' : 'Final only'}`);
            // Initialize progress tracking
            const progress = this.initializeProgress(config.mode);
            // Initialize all agents
            await this.initializeAgents();
            // Execute workflow steps
            const result = {
                workflowId,
                totalDuration: 0,
                outputPaths: []
            };
            try {
                // Step 1: Collection (if needed)
                if (config.needsCollection) {
                    await this.executeStep('Collection', 'Collector', async () => {
                        console.log(`   🔍 Step 1/4: Content Collection...`);
                        result.brief = await this.collectorAgent.execute(config.input);
                        if (config.outputAll) {
                            const briefPath = await this.saveBrief(result.brief, config.outputDir);
                            result.outputPaths.push(briefPath);
                        }
                        console.log(`      ✅ Content brief created (RICE: ${result.brief.riceScore.total})`);
                    }, progress[0]);
                }
                // Step 2: Scholar Analysis
                await this.executeStep('Analysis', 'Scholar', async () => {
                    console.log(`   🎓 Step 2/4: Knowledge Synthesis...`);
                    const inputDoc = result.brief || config.input;
                    result.synthesis = await this.scholarAgent.execute(inputDoc);
                    if (config.outputAll) {
                        const synthesisPath = await this.saveSynthesis(result.synthesis, config.outputDir);
                        result.outputPaths.push(synthesisPath);
                    }
                    const confidence = Math.round(result.synthesis.confidence * 100);
                    console.log(`      ✅ Analysis complete (${confidence}% confidence, depth ${result.synthesis.metadata.depthAchieved}/5)`);
                }, progress[1]);
                // Step 3: Content Creation
                await this.executeStep('Creation', 'Creator', async () => {
                    console.log(`   ✍️  Step 3/4: Content Creation...`);
                    result.draft = await this.creatorAgent.execute(result.synthesis);
                    if (config.outputAll) {
                        const draftPath = await this.saveDraft(result.draft, config.outputDir);
                        result.outputPaths.push(draftPath);
                    }
                    const voiceConsistency = Math.round(result.draft.metadata.voiceConsistency * 100);
                    console.log(`      ✅ Content created (${result.draft.wordCount} words, ${voiceConsistency}% voice consistency)`);
                }, progress[2]);
                // Step 4: Platform Adaptation
                await this.executeStep('Publishing', 'Adapter', async () => {
                    console.log(`   📱 Step 4/4: Platform Optimization...`);
                    result.adaptedContents = [];
                    for (const platform of config.platforms) {
                        const contextualDraft = {
                            ...result.draft,
                            metadata: { ...result.draft.metadata, targetPlatform: platform }
                        };
                        const adapted = await this.adapterAgent.execute(contextualDraft);
                        adapted.platform = platform;
                        result.adaptedContents.push(adapted);
                    }
                    const adaptedPaths = await this.saveAdaptedContent(result.adaptedContents, config.outputDir);
                    result.outputPaths.push(...adaptedPaths);
                    const avgFitScore = Math.round(result.adaptedContents.reduce((sum, content) => sum + content.metadata.platformFitScore, 0) /
                        result.adaptedContents.length * 100);
                    console.log(`      ✅ Optimized for ${config.platforms.length} platforms (${avgFitScore}% avg fit)`);
                }, progress[3]);
                // Generate workflow summary
                const summaryPath = await this.generateWorkflowSummary(result, config, startTime);
                result.outputPaths.push(summaryPath);
                result.totalDuration = Date.now() - startTime;
                // Success message
                console.log(`✅ ${this.mode.toUpperCase()} Workflow Complete!`);
                console.log(`   ⏱️  Total Duration: ${Math.round(result.totalDuration / 1000)}s`);
                console.log(`   📁 ${result.outputPaths.length} files created`);
                console.log(`   🎯 Final Content: ${result.draft?.title}`);
                console.log(`   🌐 Platforms: ${config.platforms.join(', ')}`);
                return {
                    success: true,
                    message: `${this.mode} workflow completed successfully in ${Math.round(result.totalDuration / 1000)}s`,
                    data: {
                        workflowId: result.workflowId,
                        duration: result.totalDuration,
                        stages: {
                            brief: result.brief ? {
                                topic: result.brief.summary.mainTopic,
                                riceScore: result.brief.riceScore.total,
                                quality: result.brief.metadata.quality
                            } : null,
                            synthesis: result.synthesis ? {
                                concept: result.synthesis.concept.name,
                                confidence: result.synthesis.confidence,
                                depthAchieved: result.synthesis.metadata.depthAchieved,
                                teachingReady: result.synthesis.metadata.teachingReady
                            } : null,
                            draft: result.draft ? {
                                title: result.draft.title,
                                wordCount: result.draft.wordCount,
                                voiceConsistency: result.draft.metadata.voiceConsistency,
                                readyToPublish: result.draft.metadata.readyToPublish
                            } : null,
                            platforms: result.adaptedContents?.map(content => ({
                                platform: content.platform,
                                fitScore: content.metadata.platformFitScore,
                                characterCount: content.characterCount
                            })) || []
                        },
                        outputPaths: result.outputPaths,
                        outputDir: config.outputDir
                    }
                };
            }
            catch (stepError) {
                throw new types_1.FLCMCommandError('WORKFLOW_STEP_FAILED', `Workflow failed during ${stepError.step || 'unknown step'}: ${stepError.message}`, [
                    'Check the input quality and try again',
                    'Use --help to verify correct usage',
                    'Try running individual agents to isolate the issue'
                ], this.getExamples());
            }
        }
        catch (error) {
            console.error(`❌ ${this.mode} workflow failed: ${error.message}`);
            if (error.code) {
                throw error;
            }
            throw new types_1.FLCMCommandError('WORKFLOW_EXECUTION_ERROR', `Workflow execution failed: ${error.message}`, ['Check your input and configuration', 'Try running agents individually'], this.getExamples());
        }
    }
    /**
     * Parse workflow configuration from context
     */
    async parseWorkflowConfig(context) {
        const options = context.options;
        // Determine workflow mode
        const mode = options.mode || this.mode || 'standard';
        if (!['quick', 'standard', 'flow'].includes(mode)) {
            throw new types_1.FLCMCommandError('INVALID_WORKFLOW_MODE', `Invalid workflow mode: ${mode}`, ['Use --mode quick, --mode standard, or --mode flow'], this.getExamples());
        }
        // Parse input
        let input;
        let inputDescription;
        let needsCollection = false;
        if (options.input || options.file) {
            const filePath = options.input || options.file;
            if (!fs.existsSync(filePath)) {
                throw new types_1.FLCMCommandError('INPUT_FILE_NOT_FOUND', `Input file not found: ${filePath}`, ['Check the file path and try again'], this.getExamples());
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            input = {
                id: `workflow-input-${Date.now()}`,
                type: 'raw-content',
                content,
                timestamp: new Date(),
                metadata: { source: filePath, inputType: this.getFileType(filePath) }
            };
            inputDescription = `${path.basename(filePath)} (${content.length} chars)`;
            needsCollection = true;
        }
        else if (options.topic) {
            // Create basic document from topic
            input = {
                id: `topic-${Date.now()}`,
                type: 'raw-content',
                content: `Content creation for topic: ${options.topic}`,
                timestamp: new Date(),
                metadata: { topic: options.topic, inputType: 'topic' }
            };
            inputDescription = `Topic: ${options.topic}`;
            needsCollection = true;
        }
        else {
            throw new types_1.FLCMCommandError('MISSING_INPUT', 'Workflow requires input content or topic', [
                'Use --input "file.txt" to process existing content',
                'Use --topic "Your topic" to create from scratch'
            ], this.getExamples());
        }
        // Parse platforms
        let platforms;
        if (options.platform || options.platforms) {
            const platformString = options.platform || options.platforms;
            platforms = platformString.split(',').map((p) => p.trim().toLowerCase());
        }
        else if (options.outputAll || options.all) {
            platforms = [...this.supportedPlatforms];
        }
        else {
            // Default platforms based on mode
            platforms = mode === 'quick' ? ['linkedin'] : ['linkedin', 'wechat'];
        }
        // Validate platforms
        const invalidPlatforms = platforms.filter(p => !this.supportedPlatforms.includes(p));
        if (invalidPlatforms.length > 0) {
            throw new types_1.FLCMCommandError('INVALID_PLATFORMS', `Unsupported platforms: ${invalidPlatforms.join(', ')}`, [`Supported platforms: ${this.supportedPlatforms.join(', ')}`], this.getExamples());
        }
        // Output configuration
        const outputDir = options.output || `flcm-outputs/workflows`;
        const outputAll = options.outputAll || options.all || mode === 'standard';
        return {
            mode,
            input,
            inputDescription,
            needsCollection,
            platforms,
            outputDir,
            outputAll
        };
    }
    /**
     * Initialize workflow progress tracking
     */
    initializeProgress(mode) {
        const steps = [
            { step: 'Collection', agent: 'Collector' },
            { step: 'Analysis', agent: 'Scholar' },
            { step: 'Creation', agent: 'Creator' },
            { step: 'Publishing', agent: 'Adapter' }
        ];
        return steps.map(s => ({
            step: s.step,
            agent: s.agent,
            status: 'pending',
            progress: 0
        }));
    }
    /**
     * Initialize all agents
     */
    async initializeAgents() {
        console.log(`   ⚙️  Initializing agents...`);
        const agents = [
            { name: 'Collector', agent: this.collectorAgent },
            { name: 'Scholar', agent: this.scholarAgent },
            { name: 'Creator', agent: this.creatorAgent },
            { name: 'Adapter', agent: this.adapterAgent }
        ];
        for (const { name, agent } of agents) {
            if (!agent.isInitialized()) {
                await agent.init();
                console.log(`      ✓ ${name} Agent ready`);
            }
        }
    }
    /**
     * Execute a workflow step with progress tracking
     */
    async executeStep(stepName, agentName, operation, progress) {
        progress.status = 'running';
        progress.startTime = Date.now();
        progress.progress = 0;
        try {
            await operation();
            progress.status = 'completed';
            progress.progress = 100;
            progress.endTime = Date.now();
        }
        catch (error) {
            progress.status = 'failed';
            progress.message = error.message;
            progress.endTime = Date.now();
            // Add step context to error
            error.step = stepName;
            throw error;
        }
    }
    /**
     * Save content brief
     */
    async saveBrief(brief, outputDir) {
        return this.saveStageOutput('brief', brief, outputDir, (brief) => `
# Content Brief: ${brief.summary.mainTopic}

## 📊 RICE Analysis
- **Reach**: ${brief.riceScore.reach}/100
- **Impact**: ${brief.riceScore.impact}/100  
- **Confidence**: ${brief.riceScore.confidence}/100
- **Effort**: ${brief.riceScore.effort}/100
- **Total Score**: ${brief.riceScore.total}/100

## 🎯 Summary
- **Main Topic**: ${brief.summary.mainTopic}
- **Target Audience**: ${brief.summary.targetAudience}
- **Key Points**: ${brief.summary.keyPoints.join(', ')}

## 📈 Content Signals
- **Key Insights**: ${brief.signals.keyInsights.join(', ')}
- **Trending Terms**: ${brief.signals.trendingTerms.join(', ')}
- **Sentiment**: ${brief.signals.sentimentAnalysis}
- **Complexity**: ${brief.signals.complexityLevel}

## 💡 Recommendations
${brief.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*Generated on ${brief.timestamp.toLocaleString()}*
    `.trim());
    }
    /**
     * Save knowledge synthesis
     */
    async saveSynthesis(synthesis, outputDir) {
        return this.saveStageOutput('synthesis', synthesis, outputDir, (synthesis) => `
# Knowledge Synthesis: ${synthesis.concept.name}

## 📊 Analysis Metrics
- **Confidence**: ${Math.round(synthesis.confidence * 100)}%
- **Depth Achieved**: ${synthesis.metadata.depthAchieved}/5
- **Teaching Ready**: ${synthesis.metadata.teachingReady ? 'Yes' : 'No'}
- **Questions Generated**: ${synthesis.metadata.questionsCreated}
- **Analogies Created**: ${synthesis.metadata.analogiesGenerated}

## 🎯 Core Concept
**Name**: ${synthesis.concept.name}
**Definition**: ${synthesis.concept.definition}
**Context**: ${synthesis.concept.context}

## 🔗 Best Analogy
${synthesis.analogies.bestAnalogy ?
            `${synthesis.concept.name} is like ${synthesis.analogies.bestAnalogy.target}: ${synthesis.analogies.bestAnalogy.explanation}` :
            'No analogy generated'}

---
*Generated on ${synthesis.timestamp.toLocaleString()}*
    `.trim());
    }
    /**
     * Save content draft
     */
    async saveDraft(draft, outputDir) {
        return this.saveStageOutput('draft', draft, outputDir, (draft) => `
# ${draft.title}

## 📊 Content Metrics
- **Word Count**: ${draft.wordCount}
- **Reading Time**: ${draft.readingTime} minutes
- **Voice Consistency**: ${Math.round(draft.metadata.voiceConsistency * 100)}%
- **Engagement Score**: ${Math.round(draft.engagementScore * 100)}%
- **Ready to Publish**: ${draft.metadata.readyToPublish ? 'Yes' : 'No'}

## 🎣 Hook
${draft.hook}

## 📝 Content
${draft.content}

---
*Generated on ${draft.timestamp.toLocaleString()}*
    `.trim());
    }
    /**
     * Save adapted content for all platforms
     */
    async saveAdaptedContent(adaptedContents, outputDir) {
        const outputPaths = [];
        for (const content of adaptedContents) {
            const path = await this.saveStageOutput(`${content.platform}-optimized`, content, outputDir, (content) => `
# ${content.optimizedTitle}
*Optimized for ${content.platform.toUpperCase()}*

## 📊 Optimization Metrics
- **Platform Fit**: ${Math.round(content.metadata.platformFitScore * 100)}%
- **Message Preservation**: ${Math.round(content.metadata.messagePreservation * 100)}%
- **Character Count**: ${content.characterCount}
- **Estimated Reach**: ${content.metadata.estimatedReach}

## 📝 Optimized Content
${content.optimizedContent}

## 🏷️ Hashtags
${content.hashtags.map(tag => `#${tag}`).join(' ')}

---
*Generated on ${new Date().toLocaleString()}*
      `.trim());
            outputPaths.push(path);
        }
        return outputPaths;
    }
    /**
     * Generic stage output saver
     */
    async saveStageOutput(stageName, data, outputDir, formatter) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${stageName}-${timestamp}.md`;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, filename);
        const content = formatter(data);
        fs.writeFileSync(outputPath, content, 'utf-8');
        // Also save as JSON for machine processing
        const jsonPath = outputPath.replace('.md', '.json');
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
        return outputPath;
    }
    /**
     * Generate workflow summary
     */
    async generateWorkflowSummary(result, config, startTime) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `workflow-summary-${timestamp}.md`;
        const outputPath = path.join(config.outputDir, filename);
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
        }
        const duration = Date.now() - startTime;
        const durationSeconds = Math.round(duration / 1000);
        const summary = `
# Workflow Summary Report
**ID**: ${result.workflowId}
**Mode**: ${config.mode.toUpperCase()}
**Duration**: ${durationSeconds}s
**Generated**: ${new Date().toLocaleString()}

## 📋 Input Configuration
- **Source**: ${config.inputDescription}
- **Platforms**: ${config.platforms.join(', ')}
- **Output Mode**: ${config.outputAll ? 'All stages' : 'Final only'}

## 📊 Results Overview
${result.brief ? `
### 🔍 Content Brief
- **Topic**: ${result.brief.summary.mainTopic}
- **RICE Score**: ${result.brief.riceScore.total}/100
- **Quality**: ${result.brief.metadata.quality}
` : ''}

${result.synthesis ? `
### 🎓 Knowledge Synthesis  
- **Concept**: ${result.synthesis.concept.name}
- **Confidence**: ${Math.round(result.synthesis.confidence * 100)}%
- **Depth**: ${result.synthesis.metadata.depthAchieved}/5
- **Teaching Ready**: ${result.synthesis.metadata.teachingReady ? 'Yes' : 'No'}
` : ''}

${result.draft ? `
### ✍️ Content Draft
- **Title**: ${result.draft.title}
- **Word Count**: ${result.draft.wordCount}
- **Voice Consistency**: ${Math.round(result.draft.metadata.voiceConsistency * 100)}%
- **Ready to Publish**: ${result.draft.metadata.readyToPublish ? 'Yes' : 'No'}
` : ''}

${result.adaptedContents && result.adaptedContents.length > 0 ? `
### 📱 Platform Optimization
${result.adaptedContents.map(content => `
**${content.platform.toUpperCase()}**:
- Platform Fit: ${Math.round(content.metadata.platformFitScore * 100)}%
- Characters: ${content.characterCount}
- Hashtags: ${content.hashtags.length}
- Estimated Reach: ${content.metadata.estimatedReach}
`).join('')}
` : ''}

## 📁 Generated Files
${result.outputPaths.map((path, index) => `${index + 1}. ${path.split('/').pop()}`).join('\n')}

## ⚡ Performance Metrics
- **Total Duration**: ${durationSeconds}s
- **Files Created**: ${result.outputPaths.length}
- **Success Rate**: 100%
- **Quality Score**: ${result.synthesis ? Math.round(result.synthesis.confidence * 100) : 'N/A'}%

---
*FLCM ${config.mode.toUpperCase()} Workflow completed successfully*
    `.trim();
        fs.writeFileSync(outputPath, summary, 'utf-8');
        return outputPath;
    }
    /**
     * Get file type from extension
     */
    getFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.md': return 'markdown';
            case '.txt': return 'text';
            case '.pdf': return 'pdf';
            case '.docx': return 'word';
            default: return 'unknown';
        }
    }
    /**
     * Get usage examples
     */
    getExamples() {
        return [
            '/flcm:flow --input "research.pdf" --platform "linkedin,wechat"',
            '/flcm:quick --topic "AI trends" --output "results/"',
            '/flcm:standard --input "data.txt" --all --output-all',
            '/flcm:flow --topic "Climate change" --platform "twitter,xiaohongshu"'
        ];
    }
    /**
     * Show help information
     */
    showHelp() {
        const helpText = `
🔄 FLCM Workflow System - End-to-End Content Creation

USAGE:
  /flcm:flow [options]      Complete workflow with all stages
  /flcm:quick [options]     Quick workflow (20-30 min)
  /flcm:standard [options]  Standard workflow (45-60 min)

OPTIONS:
  --input FILE              Input content file to process
  --topic TOPIC             Topic for content creation
  --platform PLATFORMS      Target platforms (comma-separated)
  --all                     Use all supported platforms
  --output DIR              Output directory (default: flcm-outputs/workflows)
  --output-all              Save outputs from all stages
  --mode MODE               Workflow mode (quick|standard|flow)
  --help                    Show this help message

WORKFLOW MODES:
  flow                      Complete 4-stage pipeline (recommended)
  quick                     Fast content generation (single platform)
  standard                  Comprehensive multi-platform content

WORKFLOW STAGES:
  1. 🔍 Collection         Content brief and RICE analysis
  2. 🎓 Analysis           Knowledge synthesis and depth learning
  3. ✍️  Creation           Content drafting with voice preservation
  4. 📱 Publishing         Multi-platform optimization

SUPPORTED PLATFORMS:
  linkedin, wechat, twitter, xiaohongshu

EXAMPLES:
  /flcm:flow --input "research.pdf" --platform "linkedin,wechat"
  /flcm:quick --topic "AI in healthcare" --output "projects/ai-health/"
  /flcm:standard --input "data.txt" --all --output-all
  /flcm:flow --topic "Climate solutions" --platform "twitter,xiaohongshu"

OUTPUT:
  Creates comprehensive workflow with:
  - Stage-by-stage outputs (if --output-all)
  - Multi-platform optimized content
  - Workflow summary report with metrics
  - Both Markdown and JSON formats
  - Performance and quality analytics

TIME ESTIMATES:
  - Quick mode: 20-30 minutes
  - Standard mode: 45-60 minutes
  - Flow mode: 30-45 minutes (depends on platforms)
    `.trim();
        return {
            success: true,
            message: helpText,
            data: {
                usage: 'flcm:flow [options]',
                modes: ['flow', 'quick', 'standard'],
                platforms: this.supportedPlatforms,
                options: [
                    'input', 'topic', 'platform', 'all', 'output', 'output-all', 'mode', 'help'
                ]
            }
        };
    }
}
exports.WorkflowHandler = WorkflowHandler;
//# sourceMappingURL=workflow-handler.js.map