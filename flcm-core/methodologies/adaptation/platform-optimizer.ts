/**
 * Platform Optimizer Methodology
 * Optimizes content for specific platform requirements and best practices
 */

export interface PlatformConfig {
  name: string;
  maxChars: number;
  idealLength: number;
  hashtagLimit: number;
  emojiUsage: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
  formatting: string[];
  engagementElements: string[];
}

export interface OptimizationResult {
  platform: string;
  optimizedContent: string;
  characterCount: number;
  trimmed: boolean;
  restructured: boolean;
  formattingApplied: string[];
  engagementScore: number;
  suggestions: string[];
}

export class PlatformOptimizer {
  private platforms: Map<string, PlatformConfig>;

  constructor() {
    this.platforms = new Map([
      ['linkedin', {
        name: 'LinkedIn',
        maxChars: 3000,
        idealLength: 1200,
        hashtagLimit: 5,
        emojiUsage: 'moderate',
        formatting: ['bold_headers', 'bullet_points', 'numbered_lists'],
        engagementElements: ['professional_hook', 'industry_statistics', 'thought_leadership', 'call_to_action']
      }],
      ['wechat', {
        name: 'WeChat',
        maxChars: 2000,
        idealLength: 800,
        hashtagLimit: 0,
        emojiUsage: 'high',
        formatting: ['short_paragraphs', 'visual_breaks', 'mini_program_links'],
        engagementElements: ['emotional_hook', 'social_proof', 'shareable_quotes']
      }],
      ['twitter', {
        name: 'Twitter/X',
        maxChars: 280,
        idealLength: 250,
        hashtagLimit: 2,
        emojiUsage: 'moderate',
        formatting: ['thread_structure', 'hook_tweet', 'visual_tweet'],
        engagementElements: ['viral_hook', 'retweet_worthy', 'reply_invitation']
      }],
      ['xiaohongshu', {
        name: 'Xiaohongshu',
        maxChars: 1000,
        idealLength: 600,
        hashtagLimit: 10,
        emojiUsage: 'very_high',
        formatting: ['eye_catching_title', 'emoji_sections', 'lifestyle_focus'],
        engagementElements: ['lifestyle_hook', 'visual_description', 'personal_story', 'trending_topics']
      }]
    ]);
  }

  optimize(content: string, platform: string, keyMessage: string): OptimizationResult {
    const config = this.platforms.get(platform.toLowerCase());
    if (!config) {
      throw new Error(`Platform ${platform} not supported`);
    }

    let optimizedContent = content;
    const formattingApplied: string[] = [];
    const suggestions: string[] = [];
    let trimmed = false;
    let restructured = false;

    // Step 1: Length optimization
    if (content.length > config.maxChars) {
      optimizedContent = this.trimContent(content, config.maxChars, keyMessage);
      trimmed = true;
    }

    // Step 2: Platform-specific formatting
    if (platform === 'linkedin') {
      optimizedContent = this.formatForLinkedIn(optimizedContent);
      formattingApplied.push('professional_formatting');
    } else if (platform === 'wechat') {
      optimizedContent = this.formatForWeChat(optimizedContent);
      formattingApplied.push('wechat_formatting');
    } else if (platform === 'twitter') {
      optimizedContent = this.formatForTwitter(optimizedContent, keyMessage);
      formattingApplied.push('thread_formatting');
      restructured = true;
    } else if (platform === 'xiaohongshu') {
      optimizedContent = this.formatForXiaohongshu(optimizedContent);
      formattingApplied.push('lifestyle_formatting');
    }

    // Step 3: Add engagement elements
    const engagementElements = this.addEngagementElements(optimizedContent, config);
    if (engagementElements.modified) {
      optimizedContent = engagementElements.content;
      formattingApplied.push(...engagementElements.elements);
    }

    // Step 4: Add emojis based on platform preference
    if (config.emojiUsage !== 'none') {
      optimizedContent = this.addEmojis(optimizedContent, config.emojiUsage);
      formattingApplied.push('emoji_enhancement');
    }

    // Step 5: Generate suggestions
    suggestions.push(...this.generateSuggestions(platform, optimizedContent));

    // Calculate engagement score
    const engagementScore = this.calculateEngagementScore(
      optimizedContent,
      config,
      formattingApplied
    );

    return {
      platform: config.name,
      optimizedContent,
      characterCount: optimizedContent.length,
      trimmed,
      restructured,
      formattingApplied,
      engagementScore,
      suggestions
    };
  }

  private trimContent(content: string, maxChars: number, keyMessage: string): string {
    // Preserve key message while trimming
    const sections = content.split('\n\n');
    let result = '';
    let hasKeyMessage = false;

    for (const section of sections) {
      if (section.includes(keyMessage) || section.toLowerCase().includes(keyMessage.toLowerCase())) {
        hasKeyMessage = true;
      }
      
      if (result.length + section.length + 2 <= maxChars) {
        result += (result ? '\n\n' : '') + section;
      } else if (!hasKeyMessage && section.includes(keyMessage)) {
        // Make room for key message
        const trimmedResult = result.substring(0, maxChars - section.length - 10);
        result = trimmedResult + '...\n\n' + section;
        break;
      } else {
        break;
      }
    }

    return result;
  }

  private formatForLinkedIn(content: string): string {
    // Add professional formatting
    let formatted = content;
    
    // Convert headers to bold
    formatted = formatted.replace(/^#+ (.+)$/gm, '**$1**');
    
    // Add emoji indicators for sections
    formatted = formatted.replace(/^(\*\*.+\*\*)$/gm, '📍 $1');
    
    // Format lists properly
    formatted = formatted.replace(/^- (.+)$/gm, '• $1');
    
    // Add spacing for readability
    formatted = formatted.replace(/\n(?=[A-Z])/g, '\n\n');
    
    return formatted;
  }

  private formatForWeChat(content: string): string {
    // Optimize for WeChat's reading experience
    let formatted = content;
    
    // Shorten paragraphs
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs.map(p => {
      if (p.length > 200) {
        // Break long paragraphs
        const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
        let result = '';
        let current = '';
        
        for (const sentence of sentences) {
          if (current.length + sentence.length > 200) {
            result += current + '\n\n';
            current = sentence;
          } else {
            current += sentence;
          }
        }
        return result + current;
      }
      return p;
    }).join('\n\n');
    
    // Add visual separators
    formatted = formatted.replace(/\n\n/g, '\n\n━━━━━━━━━\n\n');
    
    return formatted;
  }

  private formatForTwitter(content: string, keyMessage: string): string {
    // Create thread structure
    const tweets: string[] = [];
    const maxTweetLength = 275; // Leave room for numbering
    
    // Create hook tweet
    const hook = content.split('\n')[0].substring(0, maxTweetLength);
    tweets.push(hook);
    
    // Break content into tweets
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    let currentTweet = '';
    
    for (const sentence of sentences) {
      if (currentTweet.length + sentence.length > maxTweetLength) {
        if (currentTweet) tweets.push(currentTweet.trim());
        currentTweet = sentence;
      } else {
        currentTweet += ' ' + sentence;
      }
    }
    
    if (currentTweet) tweets.push(currentTweet.trim());
    
    // Ensure key message is included
    if (!tweets.some(t => t.includes(keyMessage))) {
      tweets.push(keyMessage);
    }
    
    // Add thread numbering
    return tweets.map((tweet, i) => `${i + 1}/${tweets.length} ${tweet}`).join('\n\n');
  }

  private formatForXiaohongshu(content: string): string {
    // Optimize for Xiaohongshu's visual style
    let formatted = content;
    
    // Create eye-catching title
    const firstLine = formatted.split('\n')[0];
    formatted = `【${firstLine}】\n\n` + formatted.substring(firstLine.length).trim();
    
    // Add emoji sections
    const sections = formatted.split('\n\n');
    const sectionEmojis = ['✨', '💡', '🌟', '💝', '🎯', '🔥', '💫', '🌈'];
    
    formatted = sections.map((section, i) => {
      if (i === 0) return section; // Keep title as is
      const emoji = sectionEmojis[i % sectionEmojis.length];
      return `${emoji} ${section}`;
    }).join('\n\n');
    
    // Add lifestyle elements
    formatted += '\n\n#生活分享 #成长记录';
    
    return formatted;
  }

  private addEngagementElements(
    content: string,
    config: PlatformConfig
  ): { modified: boolean; content: string; elements: string[] } {
    let modified = false;
    let result = content;
    const elements: string[] = [];

    // Add platform-specific engagement elements
    if (config.engagementElements.includes('professional_hook')) {
      if (!result.startsWith('💡') && !result.startsWith('🎯')) {
        result = '💡 ' + result;
        modified = true;
        elements.push('professional_hook');
      }
    }

    if (config.engagementElements.includes('call_to_action')) {
      if (!result.includes('What') && !result.includes('How') && !result.includes('Share')) {
        result += '\n\n💬 What\'s your experience with this? Share your thoughts below!';
        modified = true;
        elements.push('call_to_action');
      }
    }

    if (config.engagementElements.includes('viral_hook')) {
      const hooks = ['🔥 Hot take:', '⚡ Unpopular opinion:', '🚨 Breaking:'];
      if (!hooks.some(h => result.includes(h))) {
        result = hooks[0] + ' ' + result;
        modified = true;
        elements.push('viral_hook');
      }
    }

    return { modified, content: result, elements };
  }

  private addEmojis(content: string, level: string): string {
    const emojiMap: Record<string, string[]> = {
      low: ['✓', '•', '→'],
      moderate: ['✨', '🎯', '💡', '📈', '🔍'],
      high: ['🌟', '💪', '🚀', '💯', '🎉', '👏', '❤️'],
      very_high: ['✨', '💕', '🌈', '🦄', '🌸', '🎀', '💫', '🌺', '💖', '🌟']
    };

    const emojis = emojiMap[level] || [];
    if (emojis.length === 0) return content;

    // Add emojis strategically
    let result = content;
    
    // Add to bullet points
    result = result.replace(/^([•\-*]) /gm, `$1 ${emojis[0]} `);
    
    // Add to emphasis
    if (level === 'high' || level === 'very_high') {
      result = result.replace(/\*\*([^*]+)\*\*/g, (match, p1) => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        return `${emoji} **${p1}** ${emoji}`;
      });
    }

    return result;
  }

  private generateSuggestions(platform: string, content: string): string[] {
    const suggestions: string[] = [];

    if (platform === 'linkedin') {
      suggestions.push('Consider adding a relevant industry statistic');
      suggestions.push('Tag relevant professionals or companies');
      if (!content.includes('#')) {
        suggestions.push('Add 3-5 relevant hashtags');
      }
    } else if (platform === 'twitter') {
      suggestions.push('Create a visual or infographic for the thread');
      suggestions.push('Consider a poll for engagement');
      suggestions.push('Schedule for peak engagement hours (9am or 5pm)');
    } else if (platform === 'xiaohongshu') {
      suggestions.push('Add 3-5 lifestyle photos');
      suggestions.push('Include trending hashtags');
      suggestions.push('Consider adding a personal story element');
    } else if (platform === 'wechat') {
      suggestions.push('Add a QR code for sharing');
      suggestions.push('Consider mini-program integration');
      suggestions.push('Include WeChat stickers for engagement');
    }

    return suggestions;
  }

  private calculateEngagementScore(
    content: string,
    config: PlatformConfig,
    formattingApplied: string[]
  ): number {
    let score = 60; // Base score

    // Length optimization
    const lengthRatio = content.length / config.idealLength;
    if (lengthRatio >= 0.8 && lengthRatio <= 1.2) {
      score += 10;
    }

    // Formatting bonus
    score += formattingApplied.length * 5;

    // Engagement elements
    if (content.includes('?')) score += 5; // Questions
    if (content.includes('!')) score += 3; // Excitement
    if (content.match(/[🎯💡✨🔥]/)) score += 5; // Emojis

    // Platform-specific bonuses
    if (config.name === 'LinkedIn' && content.includes('#')) score += 5;
    if (config.name === 'Twitter/X' && content.split('\n\n').length > 3) score += 10; // Thread
    
    return Math.min(100, score);
  }
}

export default PlatformOptimizer;