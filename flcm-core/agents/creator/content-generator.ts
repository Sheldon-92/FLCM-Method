/**
 * Content Generator
 * Framework-based content generation engine
 */

import { InsightsDocument } from '../../shared/pipeline/document-schema';
import { VoiceDNAProfile, ContentFramework } from './index';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('ContentGenerator');

export interface GenerationOptions {
  insights: InsightsDocument;
  framework: ContentFramework;
  targetWords: number;
  tone: 'professional' | 'casual' | 'academic' | 'creative';
  profile: VoiceDNAProfile;
}

export interface Feedback {
  satisfied: boolean;
  suggestions: string[];
  focusAreas: string[];
}

export class ContentGenerator {
  /**
   * Generate content using framework
   */
  async generate(options: GenerationOptions): Promise<string> {
    logger.debug(`Generating content with ${options.framework} framework`);

    let content: string;

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
  async generateDraft(insights: InsightsDocument): Promise<string> {
    const sections: string[] = [];

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
  async refine(content: string, feedback: Feedback): Promise<string> {
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
  private async generateNarrative(options: GenerationOptions): Promise<string> {
    const { insights } = options;
    const sections: string[] = [];

    sections.push('# A Story of Discovery\n');
    sections.push('Once upon analysis, we discovered...\n');
    
    // Build narrative from insights
    const story = this.buildNarrative(insights.keyFindings);
    sections.push(story);

    return sections.join('\n');
  }

  private async generateAnalytical(options: GenerationOptions): Promise<string> {
    const { insights } = options;
    const sections: string[] = [];

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

  private async generateInstructional(options: GenerationOptions): Promise<string> {
    const { insights } = options;
    const sections: string[] = [];

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

  private async generatePersuasive(options: GenerationOptions): Promise<string> {
    const { insights } = options;
    const sections: string[] = [];

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

  private async generateDescriptive(options: GenerationOptions): Promise<string> {
    const { insights } = options;
    const sections: string[] = [];

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
  private generateTitle(insights: InsightsDocument): string {
    if (insights.keyFindings.length > 0) {
      return this.transformToTitle(insights.keyFindings[0]);
    }
    return 'Insights Analysis Report';
  }

  private generateIntroduction(insights: InsightsDocument): string {
    return `This analysis explores ${insights.keyFindings.length} key insights derived from comprehensive examination. ${insights.summary || 'The findings reveal important patterns and opportunities for strategic action.'}`;
  }

  private generateConclusion(insights: InsightsDocument): string {
    return `In conclusion, our analysis has uncovered ${insights.keyFindings.length} significant insights that provide a roadmap for future action. ${insights.recommendations ? `Key recommendations include: ${insights.recommendations[0]}` : 'These findings suggest important strategic directions.'}`;
  }

  private expandFinding(finding: string, insights: InsightsDocument): string {
    return `${finding}. This insight emerges from our comprehensive analysis and suggests important implications for strategic planning and execution. Further investigation reveals connections to broader patterns and opportunities.`;
  }

  private formatAnalysisResult(result: any): string {
    return `The ${result.framework} analysis reveals important patterns with ${(result.confidence * 100).toFixed(1)}% confidence. Key findings from this framework provide structured insights into the underlying dynamics.`;
  }

  private applySuggestion(content: string, suggestion: string): string {
    // Simplified suggestion application
    return content + `\n\n[Applied suggestion: ${suggestion}]`;
  }

  private enhanceArea(content: string, area: string): string {
    // Simplified area enhancement
    return content.replace(area, `**${area}**`);
  }

  private buildNarrative(findings: string[]): string {
    return findings.map(f => `In our journey of discovery, we found that ${f.toLowerCase()}.`).join(' ');
  }

  private extractProblem(insights: InsightsDocument): string {
    return `The core challenge centers on ${insights.keyFindings[0] || 'understanding complex patterns'}. This problem requires systematic analysis and strategic response.`;
  }

  private analyzePoint(point: string): string {
    return `Analysis reveals that ${point.toLowerCase()}. This finding has significant implications for strategy and implementation.`;
  }

  private generateSolutions(insights: InsightsDocument): string {
    if (insights.recommendations && insights.recommendations.length > 0) {
      return insights.recommendations.map(r => `- ${r}`).join('\n');
    }
    return 'Based on our analysis, we recommend a phased approach to implementation.';
  }

  private extractTopic(insights: InsightsDocument): string {
    if (insights.keyFindings.length > 0) {
      return insights.keyFindings[0].toLowerCase().replace(/^(the |a |an )/, '');
    }
    return 'Apply These Insights';
  }

  private generatePrerequisites(insights: InsightsDocument): string {
    return '- Understanding of core concepts\n- Access to necessary resources\n- Commitment to implementation';
  }

  private generateSteps(insights: InsightsDocument): Array<{title: string; description: string}> {
    return insights.keyFindings.slice(0, 5).map((finding, i) => ({
      title: this.transformToStepTitle(finding),
      description: `Implement this step by focusing on ${finding.toLowerCase()}. Ensure thorough execution before proceeding.`,
    }));
  }

  private generateTips(insights: InsightsDocument): string {
    return '- Start with quick wins\n- Monitor progress regularly\n- Adjust approach based on results';
  }

  private generateHook(insights: InsightsDocument): string {
    return `What if I told you that ${insights.keyFindings[0]?.toLowerCase() || 'transformation is within reach'}? The evidence is compelling.`;
  }

  private buildArgument(finding: string): string {
    return `Evidence strongly supports that ${finding.toLowerCase()}. This isn't just theoryit's backed by comprehensive analysis and real-world patterns.`;
  }

  private generateCallToAction(insights: InsightsDocument): string {
    return 'The time for action is now. Armed with these insights, you have the knowledge needed to drive meaningful change.';
  }

  private generateOverview(insights: InsightsDocument): string {
    return `This comprehensive overview examines ${insights.keyFindings.length} critical aspects, each contributing to a complete understanding of the subject.`;
  }

  private describeInDetail(finding: string): string {
    return `${finding} represents a crucial element in our analysis. The detailed examination reveals multiple dimensions and interconnected factors that shape its significance.`;
  }

  private transformToTitle(text: string): string {
    return text.split(' ').slice(0, 8).join(' ');
  }

  private transformToStepTitle(text: string): string {
    const words = text.split(' ').slice(0, 5);
    return words[0].charAt(0).toUpperCase() + words.slice(1).join(' ').toLowerCase();
  }

  private applyTone(content: string, tone: string): string {
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

  private adjustLength(content: string, targetWords: number): string {
    const currentWords = content.split(/\s+/).length;
    
    if (currentWords < targetWords * 0.9) {
      // Add padding content
      content += '\n\nAdditional considerations and implications extend the analysis further, providing comprehensive coverage of all relevant aspects.';
    } else if (currentWords > targetWords * 1.1) {
      // Trim content
      const words = content.split(/\s+/);
      content = words.slice(0, targetWords).join(' ') + '...';
    }
    
    return content;
  }
}