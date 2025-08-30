/**
 * SPARK Framework for Content Creation
 * Structure, Purpose, Audience, Relevance, Key Message
 */

export interface SPARKElements {
  structure: ContentStructure;
  purpose: ContentPurpose;
  audience: AudienceProfile;
  relevance: RelevanceFactors;
  keyMessage: KeyMessage;
}

export interface ContentStructure {
  type: 'linear' | 'hierarchical' | 'narrative' | 'problem-solution' | 'comparison';
  sections: Section[];
  flow: 'logical' | 'chronological' | 'priority' | 'emotional';
  length: 'micro' | 'short' | 'medium' | 'long';
}

export interface Section {
  name: string;
  purpose: string;
  content: string;
  weight: number; // 0-1, importance in overall structure
  elements: ('text' | 'list' | 'quote' | 'data' | 'example' | 'image')[];
}

export interface ContentPurpose {
  primary: 'inform' | 'persuade' | 'entertain' | 'inspire' | 'educate';
  secondary?: string[];
  outcome: string; // What should happen after reading
  action?: string; // Specific call-to-action
}

export interface AudienceProfile {
  demographic: {
    profession?: string;
    expertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    age?: string;
    interests: string[];
  };
  psychographic: {
    values: string[];
    painPoints: string[];
    goals: string[];
    preferences: string[];
  };
  reading: {
    style: 'scanner' | 'reader' | 'studier';
    time: 'limited' | 'moderate' | 'extensive';
    device: 'mobile' | 'desktop' | 'both';
  };
}

export interface RelevanceFactors {
  timeliness: 'evergreen' | 'current' | 'trending' | 'breaking';
  uniqueness: number; // 0-1
  practicalValue: number; // 0-1
  emotionalResonance: number; // 0-1
  socialCurrency: number; // 0-1 (shareability)
}

export interface KeyMessage {
  core: string;
  supporting: string[];
  proof: ProofPoint[];
  memorable: string; // One-liner to remember
}

export interface ProofPoint {
  type: 'data' | 'example' | 'authority' | 'logic' | 'emotion';
  content: string;
  strength: number; // 0-1
}

export interface SPARKAnalysis {
  elements: SPARKElements;
  score: {
    structure: number;
    purpose: number;
    audience: number;
    relevance: number;
    keyMessage: number;
    overall: number;
  };
  recommendations: string[];
}

/**
 * SPARK Framework Class
 */
export class SPARKFramework {
  private readonly hooks = {
    question: [
      'Have you ever wondered {topic}?',
      'What if I told you {revelation}?',
      'Why do {audience} struggle with {problem}?'
    ],
    statistic: [
      '{percentage}% of {audience} don\'t know {fact}',
      'Research shows {finding}',
      'In {timeframe}, {change} happened'
    ],
    story: [
      'Last {time}, I {experience}',
      'Picture this: {scenario}',
      'It was {time} when {event}'
    ],
    statement: [
      '{topic} is {adjective}',
      'The truth about {topic} is {revelation}',
      'Here\'s what {audience} need to know about {topic}'
    ],
    challenge: [
      'Most people think {misconception}, but {truth}',
      'The biggest mistake {audience} make is {error}',
      'Forget everything you know about {topic}'
    ]
  };

  /**
   * Generate SPARK elements for content
   */
  generate(
    topic: string,
    synthesis: any, // Knowledge synthesis from Scholar
    targetAudience?: string
  ): SPARKElements {
    const audience = this.profileAudience(targetAudience || 'general readers', synthesis);
    const purpose = this.determinePurpose(topic, synthesis, audience);
    const structure = this.designStructure(topic, synthesis, purpose, audience);
    const relevance = this.assessRelevance(topic, synthesis);
    const keyMessage = this.extractKeyMessage(topic, synthesis);

    return {
      structure,
      purpose,
      audience,
      relevance,
      keyMessage
    };
  }

  /**
   * Create content structure
   */
  createStructure(
    topic: string,
    knowledge: any,
    purpose: ContentPurpose
  ): ContentStructure {
    const depth = knowledge.depthAnalysis?.currentDepth || 1;
    const hasAnalogies = knowledge.analogies?.analogies?.length > 0;
    
    // Determine structure type based on content
    let type: ContentStructure['type'] = 'linear';
    if (purpose.primary === 'educate') {
      type = depth >= 3 ? 'hierarchical' : 'linear';
    } else if (purpose.primary === 'persuade') {
      type = 'problem-solution';
    } else if (hasAnalogies) {
      type = 'comparison';
    }

    // Create sections
    const sections = this.generateSections(topic, knowledge, purpose, type);
    
    // Determine flow
    const flow = purpose.primary === 'inspire' ? 'emotional' : 
                 purpose.primary === 'educate' ? 'logical' : 'priority';
    
    // Determine length
    const wordCount = this.estimateWordCount(sections);
    const length = wordCount < 300 ? 'micro' : 
                   wordCount < 800 ? 'short' : 
                   wordCount < 1500 ? 'medium' : 'long';

    return { type, sections, flow, length };
  }

  /**
   * Generate content sections
   */
  private generateSections(
    topic: string,
    knowledge: any,
    purpose: ContentPurpose,
    structureType: string
  ): Section[] {
    const sections: Section[] = [];

    // Hook section (always first)
    sections.push({
      name: 'hook',
      purpose: 'Capture attention and establish relevance',
      content: this.generateHook(topic, purpose, knowledge),
      weight: 0.15,
      elements: ['text']
    });

    // Structure-specific sections
    switch (structureType) {
      case 'problem-solution':
        sections.push(
          {
            name: 'problem',
            purpose: 'Define the challenge',
            content: this.extractProblem(knowledge),
            weight: 0.25,
            elements: ['text', 'data']
          },
          {
            name: 'solution',
            purpose: 'Present the solution',
            content: this.extractSolution(knowledge),
            weight: 0.35,
            elements: ['text', 'example', 'list']
          }
        );
        break;
      
      case 'hierarchical':
        const levels = knowledge.depthAnalysis?.levels || [];
        levels.forEach((level: any, i: number) => {
          if (level.complete) {
            sections.push({
              name: `level${i + 1}`,
              purpose: level.name,
              content: level.understanding.join(' '),
              weight: 0.15,
              elements: ['text', 'example']
            });
          }
        });
        break;
      
      case 'comparison':
        sections.push({
          name: 'analogy',
          purpose: 'Make concept relatable',
          content: knowledge.analogies?.explanation || '',
          weight: 0.2,
          elements: ['text', 'example']
        });
        break;
      
      default: // linear
        sections.push(
          {
            name: 'main',
            purpose: 'Deliver core content',
            content: this.extractMainContent(knowledge),
            weight: 0.4,
            elements: ['text', 'list', 'data']
          },
          {
            name: 'examples',
            purpose: 'Illustrate with examples',
            content: this.extractExamples(knowledge),
            weight: 0.2,
            elements: ['example', 'quote']
          }
        );
    }

    // Conclusion section (always last)
    sections.push({
      name: 'conclusion',
      purpose: 'Reinforce message and inspire action',
      content: this.generateConclusion(topic, purpose, knowledge),
      weight: 0.15,
      elements: ['text']
    });

    return sections;
  }

  /**
   * Profile the target audience
   */
  private profileAudience(targetDescription: string, synthesis: any): AudienceProfile {
    const description = targetDescription.toLowerCase();
    
    // Determine expertise level
    let expertise: AudienceProfile['demographic']['expertise'] = 'intermediate';
    if (description.includes('beginner') || description.includes('new')) {
      expertise = 'beginner';
    } else if (description.includes('expert') || description.includes('senior')) {
      expertise = 'expert';
    } else if (description.includes('advanced')) {
      expertise = 'advanced';
    }

    // Extract interests from synthesis
    const interests = synthesis.concept?.context ? 
      this.extractKeywords(synthesis.concept.context).slice(0, 5) : 
      ['technology', 'innovation'];

    // Determine reading style based on content depth
    const depth = synthesis.depthAnalysis?.currentDepth || 1;
    const readingStyle = depth >= 4 ? 'studier' : depth >= 2 ? 'reader' : 'scanner';

    return {
      demographic: {
        profession: this.extractProfession(targetDescription),
        expertise,
        interests
      },
      psychographic: {
        values: ['efficiency', 'innovation', 'growth'],
        painPoints: this.extractPainPoints(synthesis),
        goals: this.extractGoals(synthesis),
        preferences: ['practical examples', 'clear explanations', 'actionable insights']
      },
      reading: {
        style: readingStyle,
        time: expertise === 'expert' ? 'extensive' : 'moderate',
        device: 'both'
      }
    };
  }

  /**
   * Determine content purpose
   */
  private determinePurpose(
    topic: string,
    synthesis: any,
    audience: AudienceProfile
  ): ContentPurpose {
    // Analyze synthesis to determine purpose
    const hasQuestions = synthesis.questions?.size > 0;
    const hasAnalogies = synthesis.analogies?.analogies?.length > 0;
    const teachingReady = synthesis.metadata?.teachingReady;
    
    let primary: ContentPurpose['primary'] = 'inform';
    
    if (teachingReady && hasQuestions) {
      primary = 'educate';
    } else if (synthesis.depthAnalysis?.nextSteps?.length > 0) {
      primary = 'inspire';
    } else if (hasAnalogies) {
      primary = 'persuade';
    }

    const outcome = this.determineOutcome(primary, audience);
    const action = this.generateCallToAction(primary, topic);

    return {
      primary,
      secondary: this.getSecondaryPurposes(primary),
      outcome,
      action
    };
  }

  /**
   * Design content structure
   */
  private designStructure(
    topic: string,
    synthesis: any,
    purpose: ContentPurpose,
    audience: AudienceProfile
  ): ContentStructure {
    return this.createStructure(topic, synthesis, purpose);
  }

  /**
   * Assess content relevance
   */
  private assessRelevance(topic: string, synthesis: any): RelevanceFactors {
    const topicLower = topic.toLowerCase();
    
    // Determine timeliness
    let timeliness: RelevanceFactors['timeliness'] = 'evergreen';
    if (topicLower.includes('trend') || topicLower.includes('latest')) {
      timeliness = 'trending';
    } else if (topicLower.includes('new') || topicLower.includes('emerging')) {
      timeliness = 'current';
    }

    // Calculate uniqueness based on depth and insights
    const depth = synthesis.depthAnalysis?.currentDepth || 1;
    const uniqueness = Math.min(1, depth / 5 + (synthesis.analogies?.analogies?.length || 0) * 0.1);

    // Calculate practical value
    const hasExamples = synthesis.teachingNotes?.some((n: any) => n.type === 'example');
    const hasExercises = synthesis.teachingNotes?.some((n: any) => n.type === 'exercise');
    const practicalValue = (hasExamples ? 0.4 : 0) + (hasExercises ? 0.4 : 0) + 0.2;

    // Calculate emotional resonance
    const hasStory = synthesis.analogies?.bestAnalogy?.domain === 'everyday';
    const emotionalResonance = hasStory ? 0.6 : 0.3;

    // Calculate social currency
    const isShareable = uniqueness > 0.7 && emotionalResonance > 0.5;
    const socialCurrency = isShareable ? 0.8 : 0.4;

    return {
      timeliness,
      uniqueness,
      practicalValue,
      emotionalResonance,
      socialCurrency
    };
  }

  /**
   * Extract key message
   */
  private extractKeyMessage(topic: string, synthesis: any): KeyMessage {
    const concept = synthesis.concept || { name: topic };
    const insights = synthesis.depthAnalysis?.levels?.[0]?.understanding || [];
    
    // Core message
    const core = concept.definition || `Understanding ${topic} transforms how we approach challenges`;
    
    // Supporting points
    const supporting = insights.slice(0, 3).map((i: string) => 
      i.replace(/^[^:]+:\s*/, '') // Remove prefixes like "Definition:"
    );
    
    // Proof points
    const proof: ProofPoint[] = [];
    
    if (synthesis.confidence > 0.7) {
      proof.push({
        type: 'authority',
        content: 'Based on comprehensive analysis and synthesis',
        strength: synthesis.confidence
      });
    }
    
    if (synthesis.analogies?.bestAnalogy) {
      proof.push({
        type: 'example',
        content: synthesis.analogies.bestAnalogy.mapping,
        strength: synthesis.analogies.bestAnalogy.strength
      });
    }
    
    // Memorable one-liner
    const memorable = this.createMemorableLine(topic, concept, synthesis);
    
    return {
      core,
      supporting,
      proof,
      memorable
    };
  }

  /**
   * Generate a compelling hook
   */
  generateHook(topic: string, purpose: ContentPurpose, knowledge: any): string {
    const hookType = this.selectHookType(purpose, knowledge);
    const templates = this.hooks[hookType];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return this.fillTemplate(template, {
      topic,
      audience: knowledge.audience || 'professionals',
      revelation: knowledge.concept?.definition || 'something surprising',
      problem: knowledge.gaps?.[0] || 'common challenges',
      percentage: Math.floor(Math.random() * 30 + 60),
      fact: knowledge.depthAnalysis?.levels?.[0]?.understanding?.[0] || 'this key insight',
      finding: knowledge.analogies?.explanation || 'significant patterns',
      timeframe: 'the last year',
      change: 'dramatic shifts',
      time: 'recently',
      experience: 'discovered something fascinating',
      scenario: `You're working on ${topic}`,
      event: 'everything changed',
      adjective: 'more complex than it seems',
      misconception: 'it\'s just a tool',
      truth: 'it\'s a complete paradigm shift',
      error: 'underestimating its impact'
    });
  }

  /**
   * Generate conclusion
   */
  private generateConclusion(topic: string, purpose: ContentPurpose, knowledge: any): string {
    const nextSteps = knowledge.depthAnalysis?.nextSteps || [];
    const action = purpose.action || 'Apply these insights to your work';
    
    let conclusion = `Understanding ${topic} `;
    
    switch (purpose.primary) {
      case 'educate':
        conclusion += `opens new possibilities for learning and growth. `;
        break;
      case 'inspire':
        conclusion += `is just the beginning of your journey. `;
        break;
      case 'persuade':
        conclusion += `will transform how you approach challenges. `;
        break;
      default:
        conclusion += `provides valuable insights for your work. `;
    }
    
    if (nextSteps.length > 0) {
      conclusion += `Your next step: ${nextSteps[0]} `;
    }
    
    conclusion += action;
    
    return conclusion;
  }

  // Helper methods

  private selectHookType(purpose: ContentPurpose, knowledge: any): string {
    if (purpose.primary === 'educate') return 'question';
    if (purpose.primary === 'persuade') return 'challenge';
    if (knowledge.depthAnalysis?.currentDepth >= 3) return 'statistic';
    if (knowledge.analogies?.analogies?.length > 0) return 'story';
    return 'statement';
  }

  private fillTemplate(template: string, values: Record<string, any>): string {
    return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);
    
    const frequency: Record<string, number> = {};
    words.forEach(w => frequency[w] = (frequency[w] || 0) + 1);
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractProfession(description: string): string {
    const professions = [
      'developer', 'designer', 'marketer', 'manager', 'analyst',
      'engineer', 'scientist', 'researcher', 'educator', 'consultant'
    ];
    
    const found = professions.find(p => description.toLowerCase().includes(p));
    return found || 'professional';
  }

  private extractPainPoints(synthesis: any): string[] {
    const gaps = synthesis.depthAnalysis?.gaps || [];
    const painPoints = gaps.map((gap: string) => 
      gap.replace(/^[^:]+:\s*/, '').toLowerCase()
    );
    
    if (painPoints.length === 0) {
      painPoints.push('understanding complexity', 'finding practical applications');
    }
    
    return painPoints.slice(0, 3);
  }

  private extractGoals(synthesis: any): string[] {
    const nextSteps = synthesis.depthAnalysis?.nextSteps || [];
    const goals = nextSteps.map((step: string) => 
      step.replace(/^[^:]+:\s*/, '').toLowerCase()
    );
    
    if (goals.length === 0) {
      goals.push('master the concept', 'apply knowledge effectively');
    }
    
    return goals.slice(0, 3);
  }

  private extractProblem(knowledge: any): string {
    const gaps = knowledge.depthAnalysis?.gaps || [];
    const problems = knowledge.connections?.filter((c: any) => 
      c.relationshipType === 'contrast'
    );
    
    if (gaps.length > 0) {
      return `The challenge: ${gaps[0]}`;
    }
    
    if (problems?.length > 0) {
      return `The problem with traditional approaches: ${problems[0].explanation}`;
    }
    
    return 'Most approaches fail to address the core complexity';
  }

  private extractSolution(knowledge: any): string {
    const concept = knowledge.concept?.name || 'This approach';
    const benefits = knowledge.depthAnalysis?.levels?.[2]?.understanding || [];
    
    if (benefits.length > 0) {
      return `${concept} solves this by ${benefits[0]}`;
    }
    
    return `${concept} provides a systematic solution`;
  }

  private extractMainContent(knowledge: any): string {
    const understanding = knowledge.depthAnalysis?.levels
      ?.flatMap((l: any) => l.understanding || [])
      .join(' ') || '';
    
    return understanding || 'Core insights and principles';
  }

  private extractExamples(knowledge: any): string {
    const analogies = knowledge.analogies?.analogies || [];
    const examples = analogies.map((a: any) => a.mapping).join(' ');
    
    return examples || 'Practical applications and examples';
  }

  private estimateWordCount(sections: Section[]): number {
    return sections.reduce((total, section) => {
      const words = section.content.split(/\s+/).length;
      return total + words;
    }, 0);
  }

  private getSecondaryPurposes(primary: string): string[] {
    const purposeMap: Record<string, string[]> = {
      'inform': ['educate'],
      'educate': ['inform', 'inspire'],
      'persuade': ['inform', 'inspire'],
      'inspire': ['educate', 'persuade'],
      'entertain': ['inform', 'inspire']
    };
    
    return purposeMap[primary] || [];
  }

  private determineOutcome(purpose: string, audience: AudienceProfile): string {
    const outcomes: Record<string, string> = {
      'inform': 'Reader gains new knowledge',
      'educate': 'Reader can apply concepts',
      'persuade': 'Reader changes perspective',
      'inspire': 'Reader takes action',
      'entertain': 'Reader enjoys and shares'
    };
    
    return outcomes[purpose] || 'Reader benefits from content';
  }

  private generateCallToAction(purpose: string, topic: string): string {
    const actions: Record<string, string> = {
      'inform': `Learn more about ${topic}`,
      'educate': `Practice these ${topic} techniques`,
      'persuade': `Try this ${topic} approach`,
      'inspire': `Start your ${topic} journey today`,
      'entertain': `Share this ${topic} insight`
    };
    
    return actions[purpose] || `Explore ${topic} further`;
  }

  private createMemorableLine(topic: string, concept: any, synthesis: any): string {
    if (synthesis.analogies?.bestAnalogy) {
      return `${topic} is the ${synthesis.analogies.bestAnalogy.target} of modern solutions`;
    }
    
    if (concept.definition) {
      const words = concept.definition.split(' ').slice(0, 8).join(' ');
      return `${topic}: ${words}`;
    }
    
    return `Master ${topic}, transform your approach`;
  }

  /**
   * Analyze existing content with SPARK
   */
  analyze(content: string): SPARKAnalysis {
    // This would analyze existing content
    // For now, return a basic analysis
    const elements = this.generate('Content Analysis', {}, 'general');
    
    const score = {
      structure: 0.7,
      purpose: 0.8,
      audience: 0.6,
      relevance: 0.7,
      keyMessage: 0.8,
      overall: 0.72
    };
    
    const recommendations = [
      'Add more specific examples',
      'Strengthen the opening hook',
      'Clarify the call-to-action'
    ];
    
    return { elements, score, recommendations };
  }
}

export default SPARKFramework;