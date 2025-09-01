"use strict";
/**
 * Content Generator
 * Framework-based content generation engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentGenerator = void 0;
const logger_1 = require("../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('ContentGenerator');
class ContentGenerator {
    /**
     * Generate content using framework
     */
    async generate(options) {
        logger.debug(`Generating content with ${options.framework} framework`);
        let content;
        switch (options.framework) {
            case 'narrative':
                content = await this.generateNarrative(options);
                break;
            case 'analytical':
                content = await this.generateAnalytical(options);
                break;
            case 'instructional':
                content = await this.generateInstructional(options);
                break;
            case 'persuasive':
                content = await this.generatePersuasive(options);
                break;
            case 'descriptive':
                content = await this.generateDescriptive(options);
                break;
            default:
                content = await this.generateAnalytical(options);
        }
        // Apply tone adjustments
        content = this.applyTone(content, options.tone);
        // Ensure target word count
        content = this.adjustLength(content, options.targetWords);
        return content;
    }
    /**
     * Generate initial draft
     */
    async generateDraft(insights) {
        const sections = [];
        // Title
        sections.push(`# ${this.generateTitle(insights)}\n`);
        // Introduction
        sections.push('## Introduction\n');
        sections.push(this.generateIntroduction(insights));
        sections.push('');
        // Main insights
        sections.push('## Key Insights\n');
        for (const finding of insights.keyFindings.slice(0, 3)) {
            sections.push(`### ${finding}\n`);
            sections.push(this.expandFinding(finding, insights));
            sections.push('');
        }
        // Analysis
        if (insights.analysisResults && insights.analysisResults.length > 0) {
            sections.push('## Analysis Results\n');
            for (const result of insights.analysisResults.slice(0, 2)) {
                sections.push(`### ${result.framework} Analysis\n`);
                sections.push(this.formatAnalysisResult(result));
                sections.push('');
            }
        }
        // Recommendations
        if (insights.recommendations && insights.recommendations.length > 0) {
            sections.push('## Recommendations\n');
            for (const rec of insights.recommendations) {
                sections.push(`- ${rec}`);
            }
            sections.push('');
        }
        // Conclusion
        sections.push('## Conclusion\n');
        sections.push(this.generateConclusion(insights));
        return sections.join('\n');
    }
    /**
     * Refine content based on feedback
     */
    async refine(content, feedback) {
        let refined = content;
        // Apply suggestions
        for (const suggestion of feedback.suggestions) {
            refined = this.applySuggestion(refined, suggestion);
        }
        // Focus on specific areas
        for (const area of feedback.focusAreas) {
            refined = this.enhanceArea(refined, area);
        }
        return refined;
    }
    /**
     * Framework-specific generation methods
     */
    async generateNarrative(options) {
        const { insights } = options;
        const sections = [];
        sections.push('# A Story of Discovery\n');
        sections.push('Once upon analysis, we discovered...\n');
        // Build narrative from insights
        const story = this.buildNarrative(insights.keyFindings);
        sections.push(story);
        return sections.join('\n');
    }
    async generateAnalytical(options) {
        const { insights } = options;
        const sections = [];
        sections.push(`# ${this.generateTitle(insights)}\n`);
        // Problem statement
        sections.push('## Problem Statement\n');
        sections.push(this.extractProblem(insights));
        sections.push('');
        // Analysis
        sections.push('## Analysis\n');
        for (const finding of insights.keyFindings) {
            sections.push(`### ${finding}\n`);
            sections.push(this.analyzePoint(finding));
            sections.push('');
        }
        // Solution
        sections.push('## Proposed Solutions\n');
        sections.push(this.generateSolutions(insights));
        return sections.join('\n');
    }
    async generateInstructional(options) {
        const { insights } = options;
        const sections = [];
        sections.push(`# How to ${this.extractTopic(insights)}\n`);
        // Prerequisites
        sections.push('## What You\'ll Need\n');
        sections.push(this.generatePrerequisites(insights));
        sections.push('');
        // Steps
        sections.push('## Step-by-Step Guide\n');
        const steps = this.generateSteps(insights);
        for (let i = 0; i < steps.length; i++) {
            sections.push(`### Step ${i + 1}: ${steps[i].title}\n`);
            sections.push(steps[i].description);
            sections.push('');
        }
        // Tips
        sections.push('## Pro Tips\n');
        sections.push(this.generateTips(insights));
        return sections.join('\n');
    }
    async generatePersuasive(options) {
        const { insights } = options;
        const sections = [];
        sections.push(`# ${this.generateTitle(insights)}\n`);
        // Hook
        sections.push(this.generateHook(insights));
        sections.push('');
        // Arguments
        sections.push('## Key Arguments\n');
        for (const finding of insights.keyFindings.slice(0, 3)) {
            sections.push(`### ${finding}\n`);
            sections.push(this.buildArgument(finding));
            sections.push('');
        }
        // Call to action
        sections.push('## Take Action\n');
        sections.push(this.generateCallToAction(insights));
        return sections.join('\n');
    }
    async generateDescriptive(options) {
        const { insights } = options;
        const sections = [];
        sections.push(`# ${this.generateTitle(insights)}\n`);
        // Overview
        sections.push('## Overview\n');
        sections.push(this.generateOverview(insights));
        sections.push('');
        // Detailed descriptions
        for (const finding of insights.keyFindings) {
            sections.push(`## ${finding}\n`);
            sections.push(this.describeInDetail(finding));
            sections.push('');
        }
        return sections.join('\n');
    }
    /**
     * Helper methods
     */
    generateTitle(insights) {
        if (insights.keyFindings.length > 0) {
            return this.transformToTitle(insights.keyFindings[0]);
        }
        return 'Insights Analysis Report';
    }
    generateIntroduction(insights) {
        return `This analysis explores ${insights.keyFindings.length} key insights derived from comprehensive examination. ${insights.summary || 'The findings reveal important patterns and opportunities for strategic action.'}`;
    }
    generateConclusion(insights) {
        return `In conclusion, our analysis has uncovered ${insights.keyFindings.length} significant insights that provide a roadmap for future action. ${insights.recommendations ? `Key recommendations include: ${insights.recommendations[0]}` : 'These findings suggest important strategic directions.'}`;
    }
    expandFinding(finding, insights) {
        return `${finding}. This insight emerges from our comprehensive analysis and suggests important implications for strategic planning and execution. Further investigation reveals connections to broader patterns and opportunities.`;
    }
    formatAnalysisResult(result) {
        return `The ${result.framework} analysis reveals important patterns with ${(result.confidence * 100).toFixed(1)}% confidence. Key findings from this framework provide structured insights into the underlying dynamics.`;
    }
    applySuggestion(content, suggestion) {
        // Simplified suggestion application
        return content + `\n\n[Applied suggestion: ${suggestion}]`;
    }
    enhanceArea(content, area) {
        // Simplified area enhancement
        return content.replace(area, `**${area}**`);
    }
    buildNarrative(findings) {
        return findings.map(f => `In our journey of discovery, we found that ${f.toLowerCase()}.`).join(' ');
    }
    extractProblem(insights) {
        return `The core challenge centers on ${insights.keyFindings[0] || 'understanding complex patterns'}. This problem requires systematic analysis and strategic response.`;
    }
    analyzePoint(point) {
        return `Analysis reveals that ${point.toLowerCase()}. This finding has significant implications for strategy and implementation.`;
    }
    generateSolutions(insights) {
        if (insights.recommendations && insights.recommendations.length > 0) {
            return insights.recommendations.map(r => `- ${r}`).join('\n');
        }
        return 'Based on our analysis, we recommend a phased approach to implementation.';
    }
    extractTopic(insights) {
        if (insights.keyFindings.length > 0) {
            return insights.keyFindings[0].toLowerCase().replace(/^(the |a |an )/, '');
        }
        return 'Apply These Insights';
    }
    generatePrerequisites(insights) {
        return '- Understanding of core concepts\n- Access to necessary resources\n- Commitment to implementation';
    }
    generateSteps(insights) {
        return insights.keyFindings.slice(0, 5).map((finding, i) => ({
            title: this.transformToStepTitle(finding),
            description: `Implement this step by focusing on ${finding.toLowerCase()}. Ensure thorough execution before proceeding.`,
        }));
    }
    generateTips(insights) {
        return '- Start with quick wins\n- Monitor progress regularly\n- Adjust approach based on results';
    }
    generateHook(insights) {
        return `What if I told you that ${insights.keyFindings[0]?.toLowerCase() || 'transformation is within reach'}? The evidence is compelling.`;
    }
    buildArgument(finding) {
        return `Evidence strongly supports that ${finding.toLowerCase()}. This isn't just theoryit's backed by comprehensive analysis and real-world patterns.`;
    }
    generateCallToAction(insights) {
        return 'The time for action is now. Armed with these insights, you have the knowledge needed to drive meaningful change.';
    }
    generateOverview(insights) {
        return `This comprehensive overview examines ${insights.keyFindings.length} critical aspects, each contributing to a complete understanding of the subject.`;
    }
    describeInDetail(finding) {
        return `${finding} represents a crucial element in our analysis. The detailed examination reveals multiple dimensions and interconnected factors that shape its significance.`;
    }
    transformToTitle(text) {
        return text.split(' ').slice(0, 8).join(' ');
    }
    transformToStepTitle(text) {
        const words = text.split(' ').slice(0, 5);
        return words[0].charAt(0).toUpperCase() + words.slice(1).join(' ').toLowerCase();
    }
    applyTone(content, tone) {
        // Simplified tone application
        switch (tone) {
            case 'casual':
                return content.replace(/Therefore,/g, 'So,').replace(/However,/g, 'But,');
            case 'academic':
                return content.replace(/So,/g, 'Therefore,').replace(/But,/g, 'However,');
            default:
                return content;
        }
    }
    adjustLength(content, targetWords) {
        const currentWords = content.split(/\s+/).length;
        if (currentWords < targetWords * 0.9) {
            // Add padding content
            content += '\n\nAdditional considerations and implications extend the analysis further, providing comprehensive coverage of all relevant aspects.';
        }
        else if (currentWords > targetWords * 1.1) {
            // Trim content
            const words = content.split(/\s+/);
            content = words.slice(0, targetWords).join(' ') + '...';
        }
        return content;
    }
}
exports.ContentGenerator = ContentGenerator;
//# sourceMappingURL=content-generator.js.map