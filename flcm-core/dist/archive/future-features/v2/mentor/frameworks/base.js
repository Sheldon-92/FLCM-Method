"use strict";
/**
 * Base Framework Interface
 * Standard interface for all FLCM frameworks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveFramework = exports.BaseFramework = void 0;
class BaseFramework {
    constructor() {
        this.name = '';
        this.description = '';
        this.version = '1.0';
        this.category = 'general';
        this.tags = [];
    }
    /**
     * Validate if framework is suitable for context
     */
    isApplicable(context) {
        return true; // Default: applicable to all contexts
    }
    /**
     * Get framework metadata
     */
    getMetadata() {
        return {
            name: this.name,
            description: this.description,
            version: this.version,
            category: this.category,
            tags: this.tags
        };
    }
    /**
     * Export framework results to markdown
     */
    exportToMarkdown(output, context) {
        let markdown = `# ${this.name} Analysis\n\n`;
        if (context?.topic) {
            markdown += `**Topic:** ${context.topic}\n\n`;
        }
        markdown += `## Insights\n\n`;
        output.insights.forEach(insight => {
            markdown += `- ${insight}\n`;
        });
        markdown += `\n## Recommendations\n\n`;
        output.recommendations.forEach(rec => {
            markdown += `- ${rec}\n`;
        });
        markdown += `\n## Next Steps\n\n`;
        output.nextSteps.forEach((step, index) => {
            markdown += `${index + 1}. ${step}\n`;
        });
        markdown += `\n---\n`;
        markdown += `*Generated using ${this.name} Framework v${this.version}*\n`;
        markdown += `*Confidence: ${Math.round(output.confidence * 100)}%*\n`;
        return markdown;
    }
    /**
     * Get estimated completion time in minutes
     */
    getEstimatedTime() {
        return 10; // Default: 10 minutes
    }
    /**
     * Get framework difficulty level
     */
    getDifficulty() {
        return 'intermediate';
    }
}
exports.BaseFramework = BaseFramework;
/**
 * Framework with progressive depth
 */
class ProgressiveFramework extends BaseFramework {
    constructor() {
        super(...arguments);
        this.maxDepth = 5;
        this.currentDepth = 1;
    }
    /**
     * Progressive question flow
     */
    async getProgressiveQuestions(context, previousAnswers) {
        const questions = [];
        // Get questions for current depth
        const depthQuestions = this.getQuestionsForDepth(this.currentDepth, context);
        questions.push(...depthQuestions);
        // Check if we should provide deeper questions
        if (previousAnswers && this.shouldGoDeeper(previousAnswers, this.currentDepth)) {
            this.currentDepth = Math.min(this.currentDepth + 1, this.maxDepth);
            const nextQuestions = this.getQuestionsForDepth(this.currentDepth, context);
            questions.push(...nextQuestions);
        }
        return questions;
    }
    resetDepth() {
        this.currentDepth = 1;
    }
}
exports.ProgressiveFramework = ProgressiveFramework;
//# sourceMappingURL=base.js.map