/**
 * LinkedIn Platform Adapter
 * Professional networking and business-focused content
 */

import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('LinkedInAdapter');

export class LinkedInAdapter implements PlatformAdapter {
  public readonly platform = 'linkedin' as const;
  private readonly maxLength = 2000;

  async adapt(content: ContentDocument): Promise<PlatformContent> {
    logger.debug('Adapting content for LinkedIn');

    const title = this.createProfessionalTitle(content.title);
    let body = this.transformToProfessional(content.content);
    body = this.addBusinessContext(body);
    body = this.optimizeLength(body);
    
    const hashtags = this.generateHashtags(body);
    const keywords = this.extractKeywords(body);
    const visualSuggestions = this.suggestVisuals(body);

    return {
      platform: this.platform,
      title,
      body,
      hashtags,
      keywords,
      visualSuggestions,
      metadata: {
        length: body.length,
        readingTime: Math.ceil(body.length / 250),
        optimizationScore: this.calculateOptimizationScore(body),
      },
    };
  }

  async optimize(content: PlatformContent): Promise<PlatformContent> {
    // Add professional call-to-action
    if (!content.body.includes('thoughts')) {
      content.body += '\n\nWhat are your thoughts on this? I\'d love to hear your perspectives in the comments.';
    }
    
    // Ensure professional hashtags
    const professionalTags = ['Leadership', 'Innovation', 'ProfessionalDevelopment'];
    for (const tag of professionalTags) {
      if (!content.hashtags.includes(tag) && content.hashtags.length < 5) {
        content.hashtags.push(tag);
      }
    }
    
    content.metadata.optimizationScore = this.calculateOptimizationScore(content.body);
    return content;
  }

  generateHashtags(content: string): string[] {
    const hashtags: string[] = [];
    
    // Industry-specific hashtags
    if (content.includes('AI') || content.includes('technology')) {
      hashtags.push('TechTrends', 'DigitalTransformation');
    }
    
    if (content.includes('business') || content.includes('strategy')) {
      hashtags.push('BusinessStrategy', 'Leadership');
    }
    
    if (content.includes('career') || content.includes('growth')) {
      hashtags.push('CareerDevelopment', 'ProfessionalGrowth');
    }
    
    // General professional hashtags
    hashtags.push('ThoughtLeadership', 'Innovation');
    
    return hashtags.slice(0, 5);
  }

  suggestVisuals(content: string): VisualRecommendation[] {
    return [
      {
        type: 'cover',
        description: 'Professional header image with corporate aesthetic',
        style: 'corporate-modern',
        elements: ['professional graphics', 'data visualization', 'brand colors'],
      },
      {
        type: 'infographic',
        description: 'Business insights visualization',
        style: 'data-driven',
        elements: ['statistics', 'growth charts', 'key metrics'],
      },
    ];
  }

  getOptimalTime(): string {
    return '09:00'; // Business hours
  }

  private createProfessionalTitle(original: string): string {
    const prefixes = [
      'Key Insights:', 
      'Strategic Perspective:', 
      'Industry Analysis:',
      ''
    ];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix ? `${prefix} ${original}` : original;
  }

  private transformToProfessional(content: string): string {
    // Add professional tone
    let professional = content
      .replace(/ˆ/g, 'significantly')
      .replace(/^8/g, 'extremely')
      .replace(/F//g, 'however');

    // Structure with bullet points for key insights
    const paragraphs = professional.split('\n\n');
    return paragraphs.map((p, i) => {
      if (i > 0 && i % 2 === 0 && p.length > 100) {
        // Convert some paragraphs to bullet points
        const sentences = p.split(/[.]/);
        if (sentences.length > 2) {
          return 'Key takeaways:\n' + sentences
            .filter(s => s.trim())
            .slice(0, 3)
            .map(s => `" ${s.trim()}`)
            .join('\n');
        }
      }
      return p;
    }).join('\n\n');
  }

  private addBusinessContext(content: string): string {
    // Add professional opening if not present
    if (!content.startsWith('In today') && !content.startsWith('As')) {
      content = 'In today\'s dynamic business environment, ' + 
                content.charAt(0).toLowerCase() + content.slice(1);
    }
    
    return content;
  }

  private optimizeLength(content: string): string {
    if (content.length > this.maxLength) {
      // Professional truncation
      const truncated = content.substring(0, this.maxLength - 100);
      const lastPeriod = truncated.lastIndexOf('.');
      return truncated.substring(0, lastPeriod + 1) + 
             '\n\n[Continue reading for more insights...]';
    }
    return content;
  }

  private extractKeywords(content: string): string[] {
    // Extract business and professional terms
    const businessTerms = [
      'strategy', 'innovation', 'leadership', 'growth', 'digital',
      'transformation', 'analytics', 'optimization', 'efficiency',
      'collaboration', 'development', 'management', 'performance'
    ];
    
    const found: string[] = [];
    const contentLower = content.toLowerCase();
    
    for (const term of businessTerms) {
      if (contentLower.includes(term)) {
        found.push(term);
      }
    }
    
    return found.slice(0, 10);
  }

  private calculateOptimizationScore(content: string): number {
    let score = 70;
    
    // Professional language bonus
    if (content.includes('strategic') || content.includes('innovative')) score += 5;
    if (content.includes('Key takeaways')) score += 5;
    
    // Engagement elements
    if (content.includes('thoughts') || content.includes('perspectives')) score += 10;
    
    // Hashtag quality
    if (content.includes('#')) score += 5;
    
    // Length optimization
    if (content.length > 500 && content.length < 1500) score += 5;
    
    return Math.min(100, score);
  }
}