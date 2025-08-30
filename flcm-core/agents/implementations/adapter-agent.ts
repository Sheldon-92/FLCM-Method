/**
 * Adapter Agent Implementation
 * Optimizes content for specific platforms while maintaining message integrity
 */

import { BaseAgent, Document } from '../base-agent';
import { PlatformOptimizer, OptimizationResult } from '../../methodologies/adaptation/platform-optimizer';
import { HashtagGenerator, HashtagSet } from '../../methodologies/adaptation/hashtag-generator';

// Input document type (from Creator Agent)
export interface ContentDraft extends Document {
  type: 'content-draft';
  title: string;
  hook: string;
  content: string;
  structure: {
    sections: string[];
    flow: string;
  };
  voiceProfile: {
    tone: {
      formality: number;
      emotion: number;
      authority: number;
    };
    style: {
      conversational: boolean;
      dataOriented: boolean;
      storytelling: boolean;
    };
  };
  sparkElements: {
    keyMessage: string;
    purpose: string;
    audience: string;
  };
  engagementScore: number;
}

// Output document type
export interface AdaptedContent extends Document {
  type: 'adapted-content';
  platform: string;
  optimizedTitle: string;
  optimizedContent: string;
  hashtags: string[];
  formatting: {
    type: string;
    elements: string[];
  };
  characterCount: number;
  engagementElements: string[];
  visualSuggestions: string[];
  postingStrategy: {
    bestTime: string;
    frequency: string;
    crossPosting: string[];
  };
  metadata: {
    platformFitScore: number;
    messagePreservation: number;
    estimatedReach: string;
    optimizationTime: number;
  };
}

export class AdapterAgent extends BaseAgent {
  name = 'Adapter Agent';
  description = 'Optimizes content for specific platforms';
  
  private platformOptimizer: PlatformOptimizer;
  private hashtagGenerator: HashtagGenerator;
  private supportedPlatforms = ['linkedin', 'wechat', 'twitter', 'xiaohongshu'];

  constructor() {
    super();
    this.platformOptimizer = new PlatformOptimizer();
    this.hashtagGenerator = new HashtagGenerator();
  }

  async process(input: ContentDraft, platform?: string): Promise<AdaptedContent | AdaptedContent[]> {
    const startTime = Date.now();
    
    // If no platform specified, adapt for all supported platforms
    if (!platform) {
      const results: AdaptedContent[] = [];
      for (const p of this.supportedPlatforms) {
        results.push(await this.adaptForPlatform(input, p, startTime));
      }
      return results;
    }
    
    // Adapt for specific platform
    return this.adaptForPlatform(input, platform, startTime);
  }

  private async adaptForPlatform(
    input: ContentDraft,
    platform: string,
    startTime: number
  ): Promise<AdaptedContent> {
    // Step 1: Optimize content for platform
    const optimizationResult = this.platformOptimizer.optimize(
      input.content,
      platform,
      input.sparkElements.keyMessage
    );

    // Step 2: Generate hashtags
    const keywords = this.extractKeywords(input);
    const hashtagSet = this.hashtagGenerator.generate(
      optimizationResult.optimizedContent,
      keywords,
      platform
    );

    // Step 3: Optimize title
    const optimizedTitle = this.optimizeTitle(input.title, platform);

    // Step 4: Add visual suggestions
    const visualSuggestions = this.generateVisualSuggestions(
      platform,
      input.content,
      input.voiceProfile
    );

    // Step 5: Generate posting strategy
    const postingStrategy = this.generatePostingStrategy(platform, input.sparkElements.audience);

    // Step 6: Extract engagement elements
    const engagementElements = this.extractEngagementElements(
      optimizationResult.optimizedContent,
      platform
    );

    // Step 7: Calculate metrics
    const platformFitScore = this.calculatePlatformFit(
      optimizationResult,
      hashtagSet,
      platform
    );
    
    const messagePreservation = this.calculateMessagePreservation(
      input.content,
      optimizationResult.optimizedContent,
      input.sparkElements.keyMessage
    );

    // Combine hashtags from all categories
    const allHashtags = [
      ...hashtagSet.primary,
      ...hashtagSet.trending,
      ...hashtagSet.secondary,
      ...hashtagSet.branded
    ];

    return {
      id: this.generateId(),
      type: 'adapted-content',
      platform: optimizationResult.platform,
      optimizedTitle,
      optimizedContent: this.finalizeContent(
        optimizationResult.optimizedContent,
        allHashtags,
        platform
      ),
      hashtags: allHashtags,
      formatting: {
        type: platform,
        elements: optimizationResult.formattingApplied
      },
      characterCount: optimizationResult.characterCount,
      engagementElements,
      visualSuggestions,
      postingStrategy,
      metadata: {
        platformFitScore,
        messagePreservation,
        estimatedReach: this.estimateReach(platform, platformFitScore),
        optimizationTime: Date.now() - startTime
      },
      timestamp: new Date()
    };
  }

  private extractKeywords(input: ContentDraft): string[] {
    const keywords: string[] = [];
    
    // Extract from title
    const titleWords = input.title.split(' ')
      .filter(w => w.length > 4 && !this.isCommonWord(w));
    keywords.push(...titleWords);
    
    // Extract from key message
    const messageWords = input.sparkElements.keyMessage.split(' ')
      .filter(w => w.length > 4 && !this.isCommonWord(w));
    keywords.push(...messageWords);
    
    // Extract capitalized words from content (likely important)
    const capitalizedWords = input.content.match(/[A-Z][a-z]+/g) || [];
    keywords.push(...capitalizedWords.filter(w => w.length > 4));
    
    // Remove duplicates and limit
    return [...new Set(keywords)].slice(0, 10);
  }

  private isCommonWord(word: string): boolean {
    const common = ['that', 'this', 'with', 'from', 'have', 'will', 'your', 'what', 'when', 'where'];
    return common.includes(word.toLowerCase());
  }

  private optimizeTitle(title: string, platform: string): string {
    const limits: Record<string, number> = {
      linkedin: 150,
      wechat: 64,
      twitter: 100,
      xiaohongshu: 20
    };
    
    const limit = limits[platform] || 100;
    
    if (title.length <= limit) {
      return this.enhanceTitle(title, platform);
    }
    
    // Truncate and add ellipsis
    const truncated = title.substring(0, limit - 3) + '...';
    return this.enhanceTitle(truncated, platform);
  }

  private enhanceTitle(title: string, platform: string): string {
    switch (platform) {
      case 'linkedin':
        // Add professional hook if not present
        if (!title.includes('How') && !title.includes('Why') && !title.includes('What')) {
          return `How to ${title}`;
        }
        return title;
        
      case 'twitter':
        // Add urgency or curiosity
        if (!title.includes('🔥') && !title.includes('💡')) {
          return `🔥 ${title}`;
        }
        return title;
        
      case 'xiaohongshu':
        // Add brackets and emojis for visual appeal
        return `【${title}】✨`;
        
      case 'wechat':
        // Keep simple and clear
        return title;
        
      default:
        return title;
    }
  }

  private generateVisualSuggestions(
    platform: string,
    content: string,
    voiceProfile: any
  ): string[] {
    const suggestions: string[] = [];
    
    switch (platform) {
      case 'linkedin':
        suggestions.push('Professional headshot or team photo');
        suggestions.push('Infographic with key statistics');
        suggestions.push('Slide carousel (up to 10 slides)');
        if (content.includes('process') || content.includes('step')) {
          suggestions.push('Process diagram or flowchart');
        }
        break;
        
      case 'twitter':
        suggestions.push('Eye-catching header image for thread');
        suggestions.push('GIF for engagement');
        if (voiceProfile.style.dataOriented) {
          suggestions.push('Data visualization or chart');
        }
        break;
        
      case 'xiaohongshu':
        suggestions.push('3-9 lifestyle photos in grid');
        suggestions.push('Before/after comparison');
        suggestions.push('Aesthetic flat lay photography');
        suggestions.push('Step-by-step tutorial images');
        break;
        
      case 'wechat':
        suggestions.push('Header banner image (900x500px)');
        suggestions.push('Article divider graphics');
        suggestions.push('QR code for sharing');
        if (content.includes('example') || content.includes('case')) {
          suggestions.push('Screenshot examples');
        }
        break;
    }
    
    return suggestions;
  }

  private generatePostingStrategy(platform: string, audience: string): any {
    const strategies: Record<string, any> = {
      linkedin: {
        bestTime: 'Tuesday-Thursday, 8-10 AM or 5-6 PM',
        frequency: '2-3 times per week',
        crossPosting: ['Twitter', 'Company blog']
      },
      twitter: {
        bestTime: 'Weekdays, 9 AM or 5 PM',
        frequency: 'Daily or multiple times daily',
        crossPosting: ['LinkedIn (expanded version)', 'Instagram Stories']
      },
      xiaohongshu: {
        bestTime: 'Evenings 7-10 PM, weekends',
        frequency: '3-4 times per week',
        crossPosting: ['Douyin', 'Weibo']
      },
      wechat: {
        bestTime: 'Mornings 8-9 AM or lunch 12-1 PM',
        frequency: '1-2 times per week',
        crossPosting: ['Weibo', 'Company website']
      }
    };
    
    return strategies[platform] || {
      bestTime: 'Business hours',
      frequency: '2-3 times per week',
      crossPosting: []
    };
  }

  private extractEngagementElements(content: string, platform: string): string[] {
    const elements: string[] = [];
    
    // Common engagement elements
    if (content.includes('?')) {
      elements.push('question_hook');
    }
    if (content.match(/^\d+\./m)) {
      elements.push('numbered_list');
    }
    if (content.includes('**')) {
      elements.push('emphasis');
    }
    
    // Platform-specific elements
    switch (platform) {
      case 'linkedin':
        if (content.match(/\d+%/)) {
          elements.push('statistics');
        }
        if (content.toLowerCase().includes('share')) {
          elements.push('call_to_action');
        }
        break;
        
      case 'twitter':
        if (content.includes('RT')) {
          elements.push('retweet_request');
        }
        if (content.includes('👇')) {
          elements.push('thread_indicator');
        }
        break;
        
      case 'xiaohongshu':
        if (content.match(/[💕🌟✨💝]/)) {
          elements.push('emotional_emojis');
        }
        if (content.includes('分享')) {
          elements.push('sharing_request');
        }
        break;
    }
    
    return elements;
  }

  private calculatePlatformFit(
    optimization: OptimizationResult,
    hashtags: HashtagSet,
    platform: string
  ): number {
    let score = optimization.engagementScore;
    
    // Adjust based on hashtag relevance
    score = (score * 0.7) + (hashtags.relevanceScore * 0.3);
    
    // Platform-specific adjustments
    if (platform === 'linkedin' && optimization.formattingApplied.includes('professional_formatting')) {
      score += 5;
    }
    if (platform === 'twitter' && optimization.characterCount <= 280) {
      score += 10;
    }
    
    return Math.min(100, Math.round(score));
  }

  private calculateMessagePreservation(
    original: string,
    optimized: string,
    keyMessage: string
  ): number {
    let score = 60; // Base score
    
    // Check if key message is preserved
    if (optimized.includes(keyMessage) || 
        optimized.toLowerCase().includes(keyMessage.toLowerCase())) {
      score += 20;
    }
    
    // Check main points preservation
    const originalPoints = original.match(/^\d+\..+$/gm) || [];
    const optimizedPoints = optimized.match(/^\d+\..+$/gm) || [];
    
    if (originalPoints.length > 0) {
      const preservationRatio = optimizedPoints.length / originalPoints.length;
      score += preservationRatio * 15;
    }
    
    // Check structure preservation
    const originalSections = original.split('\n\n').length;
    const optimizedSections = optimized.split('\n\n').length;
    
    if (optimizedSections >= originalSections * 0.7) {
      score += 5;
    }
    
    return Math.min(100, Math.round(score));
  }

  private estimateReach(platform: string, fitScore: number): string {
    const baseReach: Record<string, number> = {
      linkedin: 5000,
      twitter: 10000,
      xiaohongshu: 8000,
      wechat: 3000
    };
    
    const base = baseReach[platform] || 5000;
    const multiplier = 1 + (fitScore / 100);
    const estimated = Math.round(base * multiplier);
    
    if (estimated > 10000) {
      return `${Math.round(estimated / 1000)}K+ potential impressions`;
    }
    return `${estimated}+ potential impressions`;
  }

  private finalizeContent(content: string, hashtags: string[], platform: string): string {
    let finalized = content;
    
    // Add hashtags appropriately
    switch (platform) {
      case 'linkedin':
      case 'twitter':
        // Add hashtags at the end
        if (hashtags.length > 0) {
          finalized += '\n\n' + hashtags.join(' ');
        }
        break;
        
      case 'xiaohongshu':
        // Hashtags already integrated in content
        break;
        
      case 'wechat':
        // No hashtags for WeChat
        break;
    }
    
    return finalized;
  }

  private generateId(): string {
    return 'adapted-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export default AdapterAgent;