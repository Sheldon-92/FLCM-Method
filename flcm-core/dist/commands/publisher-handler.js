"use strict";
/**
 * Publisher Command Handler
 * Bridges Claude commands to Publisher/Adapter Agent functionality
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
exports.PublisherHandler = void 0;
const types_1 = require("./types");
const adapter_agent_1 = require("../agents/implementations/adapter-agent");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class PublisherHandler {
    constructor() {
        this.supportedPlatforms = ['linkedin', 'wechat', 'twitter', 'xiaohongshu'];
        this.adapterAgent = new adapter_agent_1.AdapterAgent();
    }
    async execute(context) {
        try {
            // Show help if requested
            if (context.options.help) {
                return this.showHelp();
            }
            // Parse input and options
            const { contentDraft, platforms, schedule } = await this.parseInput(context);
            // Initialize adapter agent if needed
            if (!this.adapterAgent.isInitialized()) {
                await this.adapterAgent.init();
            }
            console.log(`📱 Publisher Agent Starting...`);
            console.log(`   📄 Content: ${contentDraft.title}`);
            console.log(`   🌐 Platforms: ${platforms.join(', ')}`);
            const adaptedContents = [];
            // Optimize for each platform
            for (const platform of platforms) {
                console.log(`   🔧 Optimizing for ${platform}...`);
                // Set platform context for adapter
                const contextualDraft = {
                    ...contentDraft,
                    metadata: {
                        ...contentDraft.metadata,
                        targetPlatform: platform
                    }
                };
                const adapted = await this.adapterAgent.execute(contextualDraft);
                adapted.platform = platform;
                adaptedContents.push(adapted);
                const fitScore = Math.round(adapted.metadata.platformFitScore * 100);
                const preservation = Math.round(adapted.metadata.messagePreservation * 100);
                console.log(`      ✅ ${platform}: ${fitScore}% fit, ${preservation}% preservation`);
                console.log(`      📊 Characters: ${adapted.characterCount}`);
                console.log(`      🏷️  Hashtags: ${adapted.hashtags.length}`);
            }
            // Save results
            const outputPaths = await this.saveResults(adaptedContents, context.options);
            // Calculate summary metrics
            const avgFitScore = Math.round(adaptedContents.reduce((sum, content) => sum + content.metadata.platformFitScore, 0) / adaptedContents.length * 100);
            const avgPreservation = Math.round(adaptedContents.reduce((sum, content) => sum + content.metadata.messagePreservation, 0) / adaptedContents.length * 100);
            const totalOptimizationTime = adaptedContents.reduce((sum, content) => sum + content.metadata.optimizationTime, 0);
            console.log(`✅ Multi-Platform Optimization Complete!`);
            console.log(`   🎯 Average Platform Fit: ${avgFitScore}%`);
            console.log(`   💬 Average Message Preservation: ${avgPreservation}%`);
            console.log(`   ⏱️  Total Processing: ${totalOptimizationTime}ms`);
            console.log(`   📁 Outputs saved to: ${path.dirname(outputPaths[0])}`);
            // Handle scheduling if requested
            let schedulingInfo = {};
            if (schedule && schedule !== 'now') {
                schedulingInfo = this.handleScheduling(adaptedContents, schedule);
                console.log(`   📅 Scheduled for: ${schedule}`);
            }
            return {
                success: true,
                message: `Content optimized for ${platforms.length} platform(s) with ${avgFitScore}% average fit`,
                data: {
                    platforms: adaptedContents.map(content => ({
                        platform: content.platform,
                        characterCount: content.characterCount,
                        hashtagCount: content.hashtags.length,
                        fitScore: content.metadata.platformFitScore,
                        messagePreservation: content.metadata.messagePreservation,
                        estimatedReach: content.metadata.estimatedReach
                    })),
                    outputPaths,
                    avgFitScore: avgFitScore / 100,
                    avgPreservation: avgPreservation / 100,
                    totalProcessingTime: totalOptimizationTime,
                    scheduling: schedulingInfo
                }
            };
        }
        catch (error) {
            console.error(`❌ Content publishing failed: ${error.message}`);
            if (error.code) {
                throw new types_1.FLCMCommandError(error.code, error.message, this.getSuggestions(error.code), this.getExamples());
            }
            throw new types_1.FLCMCommandError('PUBLISHER_EXECUTION_ERROR', `Content publishing failed: ${error.message}`, ['Check your input and try again'], this.getExamples());
        }
    }
    /**
     * Parse command input and options
     */
    async parseInput(context) {
        const options = context.options;
        // Parse platforms
        let platforms;
        if (options.platform) {
            platforms = options.platform.split(',').map((p) => p.trim().toLowerCase());
        }
        else if (options.platforms) {
            platforms = options.platforms.split(',').map((p) => p.trim().toLowerCase());
        }
        else if (options.all) {
            platforms = [...this.supportedPlatforms];
        }
        else {
            throw new types_1.FLCMCommandError('MISSING_PLATFORMS', 'Publisher requires platform specification', [
                'Use --platform "linkedin,wechat" to specify platforms',
                'Use --all to optimize for all platforms',
                'Supported platforms: ' + this.supportedPlatforms.join(', ')
            ], this.getExamples());
        }
        // Validate platforms
        const invalidPlatforms = platforms.filter(p => !this.supportedPlatforms.includes(p));
        if (invalidPlatforms.length > 0) {
            throw new types_1.FLCMCommandError('INVALID_PLATFORMS', `Unsupported platforms: ${invalidPlatforms.join(', ')}`, [`Supported platforms: ${this.supportedPlatforms.join(', ')}`], this.getExamples());
        }
        // Parse content input
        let contentDraft;
        if (options.content || options.input) {
            // File input
            const filePath = options.content || options.input;
            if (!fs.existsSync(filePath)) {
                throw new types_1.FLCMCommandError('CONTENT_FILE_NOT_FOUND', `Content file not found: ${filePath}`, ['Check the file path and try again'], this.getExamples());
            }
            contentDraft = await this.parseContentFile(filePath);
        }
        else if (options.draft) {
            // Direct draft JSON
            contentDraft = JSON.parse(options.draft);
        }
        else {
            throw new types_1.FLCMCommandError('MISSING_CONTENT', 'Publisher requires content to optimize', [
                'Use --content "draft.md" to specify content file',
                'Use --input "creator-output.json" to use Creator output'
            ], this.getExamples());
        }
        // Parse scheduling
        const schedule = options.schedule || options.when;
        return { contentDraft, platforms, schedule };
    }
    /**
     * Parse content file to ContentDraft
     */
    async parseContentFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Check if it's a JSON file from Creator
        if (filePath.endsWith('.json')) {
            try {
                const parsed = JSON.parse(content);
                if (parsed.type === 'content-draft') {
                    return parsed;
                }
            }
            catch (e) {
                // Fall through to Markdown parsing
            }
        }
        // Parse Markdown content (simplified)
        const lines = content.split('\n');
        const titleLine = lines.find(line => line.startsWith('# '));
        const title = titleLine ? titleLine.replace('# ', '').trim() : 'Untitled Content';
        // Extract hook (usually after "## 🎣 Hook" or similar)
        const hookIndex = lines.findIndex(line => line.toLowerCase().includes('hook'));
        let hook = 'Engaging content hook';
        if (hookIndex >= 0 && hookIndex + 1 < lines.length) {
            hook = lines[hookIndex + 1] || hook;
        }
        // Create simplified ContentDraft
        return {
            id: `parsed-${Date.now()}`,
            type: 'content-draft',
            title,
            hook,
            content,
            structure: {
                sections: [{ title: 'Main Content', content, purpose: 'Primary content' }],
                flow: 'linear'
            },
            voiceProfile: {
                tone: { formality: 0.6, emotion: 0.5, authority: 0.7 },
                style: { conversational: true, dataOriented: false, storytelling: true }
            },
            sparkElements: {
                keyMessage: title,
                purpose: 'Inform and engage',
                audience: 'General audience'
            },
            revisions: [],
            engagementScore: 0.75,
            wordCount: content.split(' ').length,
            readingTime: Math.ceil(content.split(' ').length / 200),
            timestamp: new Date(),
            metadata: {
                iterations: 1,
                voiceConsistency: 0.8,
                hookEffectiveness: 0.75,
                processingTime: 0,
                readyToPublish: true,
                source: filePath
            }
        };
    }
    /**
     * Handle content scheduling
     */
    handleScheduling(contents, schedule) {
        // In a real implementation, this would integrate with scheduling services
        // For now, we'll just provide recommendations
        const schedulingData = {
            requestedTime: schedule,
            recommendations: contents.map(content => ({
                platform: content.platform,
                bestTime: content.postingStrategy.bestTime,
                frequency: content.postingStrategy.frequency,
                crossPosting: content.postingStrategy.crossPosting
            })),
            status: 'recommendations_generated'
        };
        console.log(`   📋 Scheduling recommendations generated`);
        contents.forEach(content => {
            console.log(`      ${content.platform}: Best time ${content.postingStrategy.bestTime}`);
        });
        return schedulingData;
    }
    /**
     * Save publishing results
     */
    async saveResults(adaptedContents, options) {
        const outputDir = options.output || 'flcm-outputs/publishing';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPaths = [];
        // Save each platform adaptation
        for (const adapted of adaptedContents) {
            const filename = `${adapted.platform}-content-${timestamp}.md`;
            const outputPath = path.join(outputDir, filename);
            // Format as Markdown
            const markdown = this.formatAsMarkdown(adapted);
            fs.writeFileSync(outputPath, markdown, 'utf-8');
            // Also save as JSON
            const jsonPath = outputPath.replace('.md', '.json');
            fs.writeFileSync(jsonPath, JSON.stringify(adapted, null, 2), 'utf-8');
            outputPaths.push(outputPath);
        }
        // Save summary report
        const summaryPath = path.join(outputDir, `publishing-summary-${timestamp}.md`);
        const summary = this.createSummaryReport(adaptedContents);
        fs.writeFileSync(summaryPath, summary, 'utf-8');
        outputPaths.push(summaryPath);
        return outputPaths;
    }
    /**
     * Format adapted content as Markdown
     */
    formatAsMarkdown(adapted) {
        const fitScore = Math.round(adapted.metadata.platformFitScore * 100);
        const preservation = Math.round(adapted.metadata.messagePreservation * 100);
        let markdown = `# ${adapted.optimizedTitle}
*Optimized for ${adapted.platform.toUpperCase()}*

## 📊 Optimization Metrics
- **Platform Fit Score**: ${fitScore}%
- **Message Preservation**: ${preservation}%
- **Character Count**: ${adapted.characterCount}
- **Estimated Reach**: ${adapted.metadata.estimatedReach}
- **Processing Time**: ${adapted.metadata.optimizationTime}ms

## 📝 Optimized Content

${adapted.optimizedContent}

## 🏷️ Hashtags
${adapted.hashtags.map(tag => `#${tag}`).join(' ')}

## 🎨 Formatting
**Type**: ${adapted.formatting.type}
**Elements**: ${adapted.formatting.elements.join(', ')}

## 🎯 Engagement Elements
${adapted.engagementElements.map((element, index) => `${index + 1}. ${element}`).join('\n')}

## 🖼️ Visual Suggestions
${adapted.visualSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

## 📅 Posting Strategy
- **Best Time**: ${adapted.postingStrategy.bestTime}
- **Frequency**: ${adapted.postingStrategy.frequency}
- **Cross-Posting**: ${adapted.postingStrategy.crossPosting.join(', ') || 'None'}

---
*Generated by FLCM Publisher Agent on ${new Date().toLocaleString()}*
`;
        return markdown;
    }
    /**
     * Create summary report for all platforms
     */
    createSummaryReport(adaptedContents) {
        const avgFit = adaptedContents.reduce((sum, c) => sum + c.metadata.platformFitScore, 0) / adaptedContents.length;
        const avgPreservation = adaptedContents.reduce((sum, c) => sum + c.metadata.messagePreservation, 0) / adaptedContents.length;
        const totalTime = adaptedContents.reduce((sum, c) => sum + c.metadata.optimizationTime, 0);
        let summary = `# Publishing Summary Report

## 📊 Overall Performance
- **Platforms Optimized**: ${adaptedContents.length}
- **Average Platform Fit**: ${Math.round(avgFit * 100)}%
- **Average Message Preservation**: ${Math.round(avgPreservation * 100)}%
- **Total Processing Time**: ${totalTime}ms

## 🌐 Platform Details

| Platform | Characters | Hashtags | Fit Score | Preservation | Reach |
|----------|------------|----------|-----------|--------------|-------|
`;
        adaptedContents.forEach(content => {
            const fit = Math.round(content.metadata.platformFitScore * 100);
            const preservation = Math.round(content.metadata.messagePreservation * 100);
            summary += `| ${content.platform} | ${content.characterCount} | ${content.hashtags.length} | ${fit}% | ${preservation}% | ${content.metadata.estimatedReach} |\n`;
        });
        summary += `\n## 📋 Recommended Posting Schedule

`;
        adaptedContents.forEach(content => {
            summary += `**${content.platform.toUpperCase()}**:
- Best Time: ${content.postingStrategy.bestTime}
- Frequency: ${content.postingStrategy.frequency}
- Cross-posting: ${content.postingStrategy.crossPosting.join(', ') || 'None'}

`;
        });
        summary += `---
*Generated on ${new Date().toLocaleString()}*
`;
        return summary;
    }
    /**
     * Get suggestions based on error code
     */
    getSuggestions(errorCode) {
        switch (errorCode) {
            case 'MISSING_PLATFORMS':
                return [
                    'Specify platforms with --platform "linkedin,wechat"',
                    'Use --all for all supported platforms',
                    `Supported: ${this.supportedPlatforms.join(', ')}`
                ];
            case 'INVALID_PLATFORMS':
                return [
                    `Use supported platforms: ${this.supportedPlatforms.join(', ')}`,
                    'Check platform spelling',
                    'Use comma-separated list for multiple platforms'
                ];
            case 'MISSING_CONTENT':
                return [
                    'Provide content with --content "file.md"',
                    'Use Creator output with --input "draft.json"',
                    'Ensure the content file exists'
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
            '/flcm:publish --content "draft.md" --platform "linkedin,wechat"',
            '/flcm:publish --input "creator-output.json" --all',
            '/flcm:publish --content "article.md" --platform "twitter" --schedule "2024-09-15 10:00"',
            '/flcm:publish --input "content.json" --platform "xiaohongshu" --output "publishing/"'
        ];
    }
    /**
     * Show help information
     */
    showHelp() {
        const helpText = `
📱 FLCM Publisher Agent - Multi-Platform Content Optimization

USAGE:
  /flcm:publish [options]

OPTIONS:
  --content FILE        Content file to optimize (.md or .json)
  --input FILE          Alias for --content
  --platform PLATFORMS  Comma-separated platforms (linkedin,wechat,twitter,xiaohongshu)
  --all                 Optimize for all supported platforms
  --schedule TIME       Schedule publishing (e.g., "2024-09-15 10:00")
  --output DIR          Output directory (default: flcm-outputs/publishing)
  --help                Show this help message

SUPPORTED PLATFORMS:
  linkedin              Professional network content
  wechat                WeChat article format
  twitter               Twitter/X thread optimization  
  xiaohongshu           Lifestyle and visual content

EXAMPLES:
  /flcm:publish --content "draft.md" --platform "linkedin,wechat"
  /flcm:publish --input "creator-output.json" --all
  /flcm:publish --content "article.md" --platform "twitter" --schedule "tomorrow 9am"
  /flcm:publish --input "content.json" --platform "xiaohongshu"

INPUT TYPES:
  - Markdown files: Content with structure
  - JSON files: Creator Agent output format
  - Text files: Raw content to optimize

OUTPUT:
  For each platform:
  - Optimized content with platform-specific formatting
  - Hashtag recommendations and engagement elements
  - Visual suggestions and posting strategy
  - Performance metrics and optimization scores
  - Both Markdown and JSON formats
  
  Plus summary report with cross-platform analysis
    `.trim();
        return {
            success: true,
            message: helpText,
            data: {
                usage: 'flcm:publish [options]',
                options: [
                    'content', 'input', 'platform', 'all', 'schedule', 'output', 'help'
                ],
                platforms: this.supportedPlatforms
            }
        };
    }
}
exports.PublisherHandler = PublisherHandler;
//# sourceMappingURL=publisher-handler.js.map