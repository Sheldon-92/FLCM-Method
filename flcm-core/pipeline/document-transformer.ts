/**
 * Document Transformer for FLCM Pipeline
 * Transforms documents between different formats in the pipeline
 */

import {
  BaseDocument,
  DocumentType,
  ContentBrief,
  KnowledgeSynthesis,
  ContentDraft,
  PlatformAdaptation,
  DocumentMetadata,
  DocumentStatus,
  VoiceProfile,
  ContentStructure,
  Hook,
  Revision
} from './document-schemas';
import * as crypto from 'crypto';

/**
 * Transformation options
 */
export interface TransformOptions {
  preserveMetadata?: boolean;
  generateId?: boolean;
  includeTimestamp?: boolean;
  voiceProfile?: VoiceProfile;
  targetPlatform?: string;
}

/**
 * Document Transformer Class
 */
export class DocumentTransformer {
  
  /**
   * Transform Content Brief to Knowledge Synthesis
   */
  briefToSynthesis(
    brief: ContentBrief,
    options: TransformOptions = {}
  ): Partial<KnowledgeSynthesis> {
    const synthesis: Partial<KnowledgeSynthesis> = {
      id: options.generateId ? this.generateDocumentId('synthesis') : undefined,
      type: DocumentType.KNOWLEDGE_SYNTHESIS,
      briefId: brief.id,
      created: options.includeTimestamp ? new Date() : undefined,
      modified: options.includeTimestamp ? new Date() : undefined,
      version: 1,
      
      // Extract main concept from brief
      concept: brief.summary.mainTopic,
      depthLevel: 1,
      
      // Initialize knowledge layers
      layers: [],
      
      // Transform insights to explanations
      explanations: brief.insights.map(insight => insight.text),
      
      // Initialize empty arrays for scholar to fill
      analogies: [],
      questions: [],
      connections: brief.concepts,
      contradictions: brief.contradictions,
      
      // Calculate initial confidence from signal score
      confidence: brief.signalScore,
      teachingReady: false,
      
      // Transform metadata
      metadata: this.transformMetadata(brief.metadata, 'scholar', options)
    };
    
    return synthesis;
  }

  /**
   * Transform Knowledge Synthesis to Content Draft
   */
  synthesisToDraft(
    synthesis: KnowledgeSynthesis,
    options: TransformOptions = {}
  ): Partial<ContentDraft> {
    // Generate initial title from concept
    const title = this.generateTitle(synthesis.concept);
    
    // Build initial content structure
    const content = this.buildInitialContent(synthesis);
    
    const draft: Partial<ContentDraft> = {
      id: options.generateId ? this.generateDocumentId('draft') : undefined,
      type: DocumentType.CONTENT_DRAFT,
      synthesisId: synthesis.id,
      created: options.includeTimestamp ? new Date() : undefined,
      modified: options.includeTimestamp ? new Date() : undefined,
      version: 1,
      
      title,
      subtitle: synthesis.layers[0]?.title,
      content,
      
      // Use provided voice profile or create default
      voiceDNA: options.voiceProfile || this.createDefaultVoiceProfile(),
      
      // Analyze content structure
      structure: this.analyzeContentStructure(content),
      
      // Generate initial hooks from questions
      hooks: this.generateHooks(synthesis),
      
      // Initialize revision tracking
      revisions: [],
      
      // Calculate metrics
      wordCount: content.split(/\s+/).length,
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
      
      // Transform metadata
      metadata: this.transformMetadata(synthesis.metadata, 'creator', options)
    };
    
    return draft;
  }

  /**
   * Transform Content Draft to Platform Adaptation
   */
  draftToAdaptation(
    draft: ContentDraft,
    platform: PlatformAdaptation['platform'],
    options: TransformOptions = {}
  ): Partial<PlatformAdaptation> {
    // Apply platform-specific adaptations
    const adaptedContent = this.adaptContentForPlatform(draft.content, platform);
    
    const adaptation: Partial<PlatformAdaptation> = {
      id: options.generateId ? this.generateDocumentId(`${platform}-adapt`) : undefined,
      type: DocumentType.PLATFORM_ADAPTATION,
      draftId: draft.id,
      created: options.includeTimestamp ? new Date() : undefined,
      modified: options.includeTimestamp ? new Date() : undefined,
      version: 1,
      
      platform,
      originalContent: draft.content,
      adaptedContent,
      
      // Track optimizations made
      optimizations: this.trackOptimizations(draft.content, adaptedContent, platform),
      
      // Generate platform-specific hashtags
      hashtags: this.generateHashtags(draft, platform),
      
      // Create media prompts if needed
      mediaPrompts: this.generateMediaPrompts(draft, platform),
      
      // Add platform-specific CTA
      callToAction: this.generateCallToAction(platform),
      
      // Calculate character count
      characterCount: adaptedContent.length,
      
      // Define platform rules
      platformRules: this.getPlatformRules(platform),
      
      // Transform metadata
      metadata: this.transformMetadata(draft.metadata, 'adapter', options)
    };
    
    return adaptation;
  }

  /**
   * Transform metadata between agents
   */
  private transformMetadata(
    source: DocumentMetadata | undefined,
    targetAgent: DocumentMetadata['agent'],
    options: TransformOptions
  ): DocumentMetadata {
    const metadata: DocumentMetadata = {
      agent: targetAgent,
      status: DocumentStatus.PENDING,
      methodologies: [],
      tags: source?.tags || []
    };
    
    if (options.preserveMetadata && source) {
      metadata.processingTime = source.processingTime;
      metadata.confidence = source.confidence;
    }
    
    return metadata;
  }

  /**
   * Generate document ID
   */
  private generateDocumentId(prefix: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate title from concept
   */
  private generateTitle(concept: string): string {
    // Simple title generation - would be enhanced with AI
    const words = concept.split(' ');
    const capitalizedWords = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(' ');
  }

  /**
   * Build initial content from synthesis
   */
  private buildInitialContent(synthesis: KnowledgeSynthesis): string {
    const sections: string[] = [];
    
    // Introduction
    sections.push(`# ${synthesis.concept}\n\n`);
    sections.push(`${synthesis.explanations[0]}\n\n`);
    
    // Add layers as sections
    for (const layer of synthesis.layers) {
      sections.push(`## ${layer.title}\n\n`);
      sections.push(`${layer.content}\n\n`);
      
      // Add analogies if present
      const relevantAnalogies = synthesis.analogies.filter(
        a => a.concept === layer.title
      );
      if (relevantAnalogies.length > 0) {
        sections.push(`**Think of it this way:** ${relevantAnalogies[0].comparison}\n\n`);
      }
    }
    
    // Add questions section
    if (synthesis.questions.length > 0) {
      sections.push(`## Questions to Consider\n\n`);
      for (const question of synthesis.questions.slice(0, 3)) {
        sections.push(`- ${question.text}\n`);
      }
      sections.push('\n');
    }
    
    // Add conclusion
    sections.push(`## Key Takeaways\n\n`);
    sections.push(synthesis.explanations.slice(-1)[0]);
    
    return sections.join('');
  }

  /**
   * Create default voice profile
   */
  private createDefaultVoiceProfile(): VoiceProfile {
    return {
      tone: ['professional', 'informative', 'engaging'],
      style: ['clear', 'concise', 'structured'],
      vocabulary: {
        preferred: [],
        avoided: ['jargon', 'clichés']
      },
      sentenceStructure: {
        averageLength: 15,
        variety: 'mixed'
      },
      personality: ['knowledgeable', 'approachable'],
      examples: []
    };
  }

  /**
   * Analyze content structure
   */
  private analyzeContentStructure(content: string): ContentStructure {
    const lines = content.split('\n');
    const sections: any[] = [];
    let currentSection: any = null;
    let order = 0;
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const level = line.match(/^#+/)?.[0].length || 1;
        currentSection = {
          id: `section-${order}`,
          title: line.replace(/^#+\s*/, ''),
          content: '',
          wordCount: 0,
          order: order++,
          level
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
        currentSection.wordCount = currentSection.content.split(/\s+/).length;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return {
      format: this.detectFormat(content),
      sections,
      flow: 'linear',
      readingTime: Math.ceil(content.split(/\s+/).length / 200)
    };
  }

  /**
   * Detect content format
   */
  private detectFormat(content: string): ContentStructure['format'] {
    if (content.includes('## Step') || content.includes('## How to')) {
      return 'tutorial';
    }
    if (content.match(/^\d+\./gm)?.length > 5) {
      return 'listicle';
    }
    if (content.includes('## Analysis') || content.includes('## Conclusion')) {
      return 'analysis';
    }
    if (content.includes('Once upon') || content.includes('## The Story')) {
      return 'story';
    }
    return 'article';
  }

  /**
   * Generate hooks from synthesis
   */
  private generateHooks(synthesis: KnowledgeSynthesis): Hook[] {
    const hooks: Hook[] = [];
    
    // Question hook from first question
    if (synthesis.questions.length > 0) {
      hooks.push({
        type: 'question',
        content: synthesis.questions[0].text,
        position: 'opening',
        effectiveness: 0.8
      });
    }
    
    // Analogy hook
    if (synthesis.analogies.length > 0) {
      hooks.push({
        type: 'story',
        content: synthesis.analogies[0].explanation,
        position: 'section',
        effectiveness: 0.7
      });
    }
    
    return hooks;
  }

  /**
   * Adapt content for specific platform
   */
  private adaptContentForPlatform(
    content: string,
    platform: PlatformAdaptation['platform']
  ): string {
    let adapted = content;
    
    switch (platform) {
      case 'twitter':
        // Create thread-friendly format
        adapted = this.createTwitterThread(content);
        break;
        
      case 'linkedin':
        // Professional formatting
        adapted = this.formatForLinkedIn(content);
        break;
        
      case 'wechat':
        // Add WeChat-specific formatting
        adapted = this.formatForWeChat(content);
        break;
        
      case 'xiaohongshu':
        // Optimize for Xiaohongshu style
        adapted = this.formatForXiaohongshu(content);
        break;
        
      case 'medium':
      case 'substack':
        // Long-form optimizations
        adapted = this.optimizeForLongForm(content);
        break;
    }
    
    return adapted;
  }

  /**
   * Create Twitter thread
   */
  private createTwitterThread(content: string): string {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const tweets: string[] = [];
    let currentTweet = '';
    
    for (const sentence of sentences) {
      if ((currentTweet + sentence).length <= 250) {
        currentTweet += sentence;
      } else {
        if (currentTweet) tweets.push(currentTweet.trim());
        currentTweet = sentence;
      }
    }
    
    if (currentTweet) tweets.push(currentTweet.trim());
    
    // Add thread numbering
    return tweets.map((tweet, i) => `${i + 1}/ ${tweet}`).join('\n\n');
  }

  /**
   * Format for LinkedIn
   */
  private formatForLinkedIn(content: string): string {
    // Add professional formatting
    let formatted = content;
    
    // Add emoji bullets for key points
    formatted = formatted.replace(/^- /gm, '→ ');
    
    // Add space between paragraphs
    formatted = formatted.replace(/\n\n/g, '\n\n\n');
    
    // Limit to LinkedIn's optimal length
    if (formatted.length > 3000) {
      formatted = formatted.substring(0, 2900) + '...\n\n[See more in comments]';
    }
    
    return formatted;
  }

  /**
   * Format for WeChat
   */
  private formatForWeChat(content: string): string {
    // Add WeChat-specific formatting
    let formatted = content;
    
    // Add dividers between sections
    formatted = formatted.replace(/## /g, '\n━━━━━━━━━━\n## ');
    
    // Add emphasis formatting
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '【$1】');
    
    return formatted;
  }

  /**
   * Format for Xiaohongshu
   */
  private formatForXiaohongshu(content: string): string {
    // Optimize for Xiaohongshu's visual style
    let formatted = content;
    
    // Add emoji and visual breaks
    formatted = formatted.replace(/## /g, '\n✨ ');
    formatted = formatted.replace(/^- /gm, '• ');
    
    // Limit length for mobile reading
    if (formatted.length > 1000) {
      formatted = formatted.substring(0, 950) + '...\n\n💫 完整内容见评论区';
    }
    
    return formatted;
  }

  /**
   * Optimize for long-form platforms
   */
  private optimizeForLongForm(content: string): string {
    // Already in good format for long-form
    return content;
  }

  /**
   * Track optimizations made
   */
  private trackOptimizations(
    original: string,
    adapted: string,
    platform: string
  ): PlatformAdaptation['optimizations'] {
    const optimizations: PlatformAdaptation['optimizations'] = [];
    
    // Track length optimization
    if (adapted.length !== original.length) {
      optimizations.push({
        type: 'length',
        original: `${original.length} characters`,
        optimized: `${adapted.length} characters`,
        reason: `Optimized for ${platform} length requirements`,
        impact: 0.8
      });
    }
    
    // Track format changes
    if (adapted.includes('→') && !original.includes('→')) {
      optimizations.push({
        type: 'format',
        original: 'Standard bullets',
        optimized: 'Visual bullets',
        reason: 'Enhanced visual appeal for platform',
        impact: 0.6
      });
    }
    
    return optimizations;
  }

  /**
   * Generate hashtags for platform
   */
  private generateHashtags(
    draft: ContentDraft,
    platform: string
  ): string[] {
    // Extract key concepts for hashtags
    const concepts = draft.title.split(' ')
      .filter(word => word.length > 4)
      .map(word => word.toLowerCase());
    
    const hashtags: string[] = [];
    
    // Platform-specific hashtag counts
    const hashtagCounts: Record<string, number> = {
      twitter: 3,
      linkedin: 5,
      xiaohongshu: 10,
      wechat: 3,
      medium: 5,
      substack: 5
    };
    
    const count = hashtagCounts[platform] || 5;
    
    for (let i = 0; i < Math.min(count, concepts.length); i++) {
      hashtags.push(`#${concepts[i]}`);
    }
    
    return hashtags;
  }

  /**
   * Generate media prompts
   */
  private generateMediaPrompts(
    draft: ContentDraft,
    platform: string
  ): string[] {
    const prompts: string[] = [];
    
    // Platform-specific media needs
    if (['xiaohongshu', 'linkedin'].includes(platform)) {
      prompts.push(`Hero image: ${draft.title} concept visualization`);
    }
    
    if (platform === 'xiaohongshu') {
      // Multiple images for carousel
      draft.structure.sections.forEach((section, i) => {
        if (i < 9) { // Xiaohongshu limit
          prompts.push(`Slide ${i + 1}: ${section.title}`);
        }
      });
    }
    
    return prompts;
  }

  /**
   * Generate call to action
   */
  private generateCallToAction(platform: string): string {
    const ctas: Record<string, string> = {
      twitter: 'Share your thoughts below 👇',
      linkedin: 'What\'s your experience with this? Let\'s discuss in the comments.',
      wechat: '欢迎在评论区分享您的想法',
      xiaohongshu: '姐妹们，你们怎么看？评论区见 💬',
      medium: 'If you found this helpful, please clap and share.',
      substack: 'Subscribe for more insights like this.'
    };
    
    return ctas[platform] || 'Share your thoughts!';
  }

  /**
   * Get platform rules
   */
  private getPlatformRules(platform: string): PlatformAdaptation['platformRules'] {
    const rules: Record<string, PlatformAdaptation['platformRules']> = {
      twitter: {
        maxLength: 280,
        hashtagLimit: 3,
        mediaRequired: false,
        bestPractices: ['Use threads for longer content', 'Include visuals when possible']
      },
      linkedin: {
        maxLength: 3000,
        hashtagLimit: 5,
        mediaRequired: false,
        bestPractices: ['Professional tone', 'Include actionable insights']
      },
      wechat: {
        maxLength: 20000,
        mediaRequired: false,
        bestPractices: ['Use mini-programs', 'Include QR codes']
      },
      xiaohongshu: {
        maxLength: 1000,
        hashtagLimit: 10,
        mediaRequired: true,
        bestPractices: ['Visual-first content', 'Lifestyle angle']
      },
      medium: {
        minLength: 400,
        bestPractices: ['Include images', 'Use subheadings']
      },
      substack: {
        minLength: 500,
        bestPractices: ['Email-friendly format', 'Personal voice']
      }
    };
    
    return rules[platform] || { bestPractices: [] };
  }
}