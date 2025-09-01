/**
 * Zhihu (知乎) Platform Adapter
 * Knowledge-focused, professional, in-depth content
 */

import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('ZhihuAdapter');

export class ZhihuAdapter implements PlatformAdapter {
  public readonly platform = 'zhihu' as const;
  private readonly maxLength = 5000;

  async adapt(content: ContentDocument): Promise<PlatformContent> {
    logger.debug('Adapting content for Zhihu');

    const title = this.createProfessionalTitle(content.title);
    let body = this.enhanceWithDepth(content.content);
    body = this.addReferences(body);
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
        readingTime: Math.ceil(body.length / 300),
        optimizationScore: this.calculateOptimizationScore(body),
      },
    };
  }

  async optimize(content: PlatformContent): Promise<PlatformContent> {
    if (content.body.length > 2000) {
      content.body = this.addTableOfContents(content.body) + '\n\n' + content.body;
    }
    
    content.metadata.optimizationScore = this.calculateOptimizationScore(content.body);
    return content;
  }

  generateHashtags(content: string): string[] {
    const topics = ['知识分享', '干货', '学习', '深度思考', '专业分析'];
    return topics.slice(0, 3);
  }

  suggestVisuals(content: string): VisualRecommendation[] {
    return [
      {
        type: 'infographic',
        description: 'Data visualization or concept diagram',
        style: 'professional-clean',
        elements: ['charts', 'diagrams', 'statistics'],
      },
    ];
  }

  getOptimalTime(): string {
    return '09:00';
  }

  private createProfessionalTitle(original: string): string {
    const prefixes = ['深度解析：', '深度思考：', '专业分析：', ''];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + original;
  }

  private enhanceWithDepth(content: string): string {
    const sections = content.split('\n\n');
    return sections.map((section, i) => {
      if (i > 0 && i % 3 === 0 && !section.startsWith('#')) {
        return `### 第 ${Math.floor(i/3) + 1} 部分\n\n${section}`;
      }
      return section;
    }).join('\n\n');
  }

  private addReferences(content: string): string {
    return content + '\n\n---\n参考资料：\n- 基于深度分析整理\n- 结合专业知识总结';
  }

  private addTableOfContents(content: string): string {
    const headers = content.match(/^###?\s+.+$/gm) || [];
    if (headers.length < 3) return '';
    
    let toc = '**目录**\n\n';
    headers.forEach(header => {
      const title = header.replace(/^#+\s+/, '');
      toc += `- ${title}\n`;
    });
    
    return toc;
  }

  private optimizeLength(content: string): string {
    if (content.length > this.maxLength) {
      return content.substring(0, this.maxLength - 100) + '\n\n...[继续阅读全文]';
    }
    return content;
  }

  private extractKeywords(content: string): string[] {
    const techTerms = content.match(/[A-Z][a-z]+|[A-Z]{2,}|[\u4e00-\u9fa5]{2,4}/g) || [];
    return [...new Set(techTerms)].slice(0, 10);
  }

  private calculateOptimizationScore(content: string): number {
    let score = 70;
    
    if (content.length > 2000) score += 10;
    if (content.includes('###')) score += 10;
    if (content.includes('参考')) score += 10;
    
    return Math.min(100, score);
  }
}