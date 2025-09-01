/**
 * Voice DNA Framework
 * Ported from FLCM 1.0 Creator Agent
 * Discover and maintain authentic content voice
 */

import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';

export class VoiceDNAFramework extends BaseFramework {
  constructor() {
    super();
    this.name = 'Voice DNA Framework';
    this.description = 'Discover and codify your unique content voice and style';
    this.version = '1.0';
    this.category = 'content-creation';
    this.tags = ['voice', 'style', 'branding', 'authenticity', 'legacy'];
  }
  
  getIntroduction(context?: FrameworkContext): string {
    return `The Voice DNA Framework helps you discover and maintain your authentic content voice.

Your Voice DNA consists of:
• **Tone**: How you sound (professional, casual, authoritative, friendly)
• **Personality**: Your unique character traits
• **Values**: What you stand for
• **Vocabulary**: Your word choices and phrases
• **Rhythm**: Your pacing and structure

Let's uncover your unique voice for ${context?.topic || 'your content'}.`;
  }
  
  getQuestions(context?: FrameworkContext): FrameworkQuestion[] {
    return [
      {
        id: 'natural_voice',
        question: 'Write 2-3 sentences about your topic as if explaining it to a friend over coffee. Be completely natural.',
        type: 'open',
        required: true
      },
      {
        id: 'admired_voices',
        question: 'Name 2-3 content creators whose style you admire. What specifically do you like about their voice?',
        type: 'open',
        required: true
      },
      {
        id: 'tone_preference',
        question: 'Which tone best describes how you want to come across?',
        type: 'multiple-choice',
        required: true,
        options: [
          'Professional Expert - Authoritative and knowledgeable',
          'Friendly Guide - Approachable and helpful',
          'Inspiring Mentor - Motivational and empowering',
          'Analytical Teacher - Logical and educational',
          'Creative Storyteller - Engaging and imaginative',
          'Pragmatic Advisor - Practical and direct'
        ]
      },
      {
        id: 'personality_traits',
        question: 'Select 3-5 personality traits that you want to convey in your content',
        type: 'open',
        required: true,
        followUp: 'Examples: curious, empathetic, bold, witty, thoughtful, energetic, calm, innovative'
      },
      {
        id: 'core_values',
        question: 'What are 3 core values or beliefs that should shine through your content?',
        type: 'open',
        required: true
      },
      {
        id: 'signature_phrases',
        question: 'Do you have any signature phrases, expressions, or ways of explaining things that feel uniquely "you"?',
        type: 'open',
        required: false
      },
      {
        id: 'audience_relationship',
        question: 'How do you want your audience to feel after consuming your content?',
        type: 'open',
        required: true
      },
      {
        id: 'avoid_characteristics',
        question: 'What voice characteristics do you definitely want to AVOID? (e.g., preachy, salesy, academic)',
        type: 'open',
        required: true
      },
      {
        id: 'humor_level',
        question: 'How much humor do you want in your content?',
        type: 'multiple-choice',
        required: true,
        options: [
          'None - Keep it serious',
          'Occasional - Light touches',
          'Regular - Consistent wit',
          'Frequent - Humor is central'
        ]
      },
      {
        id: 'formality_level',
        question: 'What level of formality suits your content?',
        type: 'multiple-choice',
        required: true,
        options: [
          'Very Formal - Academic/Corporate',
          'Professional - Business appropriate',
          'Conversational - Like talking to a colleague',
          'Casual - Like talking to a friend',
          'Very Casual - Completely relaxed'
        ]
      }
    ];
  }
  
  async process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    
    // Analyze natural voice
    const naturalVoice = answers.natural_voice || '';
    const voiceAnalysis = this.analyzeNaturalVoice(naturalVoice);
    
    insights.push(`Your natural voice tends to be ${voiceAnalysis.style}`);
    
    if (voiceAnalysis.sentenceLength === 'short') {
      insights.push('You prefer concise, punchy sentences - great for clarity and impact');
    } else if (voiceAnalysis.sentenceLength === 'long') {
      insights.push('You use longer, flowing sentences - good for storytelling and detail');
    }
    
    // Analyze tone alignment
    const selectedTone = answers.tone_preference;
    if (selectedTone.includes('Expert') && voiceAnalysis.style === 'casual') {
      recommendations.push('Consider adding more technical depth to support your expert positioning');
    } else if (selectedTone.includes('Friendly') && voiceAnalysis.style === 'formal') {
      recommendations.push('Try using more conversational language to match your friendly tone');
    }
    
    // Build Voice DNA profile
    const voiceDNA = {
      tone: this.extractTone(answers.tone_preference),
      personality: this.parseTraits(answers.personality_traits),
      values: this.parseValues(answers.core_values),
      formality: this.extractFormality(answers.formality_level),
      humor: this.extractHumor(answers.humor_level),
      avoidList: this.parseAvoidList(answers.avoid_characteristics)
    };
    
    // Generate voice guidelines
    const voiceGuidelines = this.generateVoiceGuidelines(voiceDNA, answers);
    
    // Analyze admired voices for patterns
    if (answers.admired_voices) {
      insights.push('Study your admired creators for techniques, not imitation');
      recommendations.push('Identify specific techniques from admired voices that align with your values');
    }
    
    // Check for voice consistency
    if (voiceDNA.personality.includes('empathetic') && voiceDNA.formality === 'very formal') {
      recommendations.push('Consider softening formal language to better express empathy');
    }
    
    if (voiceDNA.humor === 'frequent' && voiceDNA.tone === 'authoritative') {
      insights.push('Balancing humor with authority requires careful timing - use humor to make points memorable');
    }
    
    // Generate implementation steps
    nextSteps.push('Create a voice guide document with your DNA profile and examples');
    nextSteps.push('Write 3 sample paragraphs in your defined voice for practice');
    nextSteps.push('Review existing content and identify pieces that best match your voice DNA');
    
    if (answers.signature_phrases) {
      nextSteps.push('Compile a list of your signature phrases and expressions for consistent use');
    }
    
    nextSteps.push('Set up a quarterly voice audit to ensure consistency');
    
    // Calculate voice clarity score
    const voiceClarity = this.calculateVoiceClarity(answers);
    
    return {
      insights,
      recommendations,
      nextSteps,
      data: {
        voiceDNA,
        voiceGuidelines,
        naturalStyle: voiceAnalysis,
        audienceFeeling: answers.audience_relationship,
        signaturePhrases: answers.signature_phrases,
        voiceClarity
      },
      confidence: voiceClarity,
      metadata: {
        framework: 'Voice DNA',
        version: this.version,
        profileCreated: new Date().toISOString()
      }
    };
  }
  
  getTemplate(): string {
    return `# Voice DNA Profile

## Core Voice Elements

### Tone
[Your primary tone]

### Personality Traits
- [Trait 1]
- [Trait 2]
- [Trait 3]

### Core Values
1. [Value 1]
2. [Value 2]
3. [Value 3]

## Voice Characteristics

### Formality Level
[Very Formal → Formal → Professional → Conversational → Casual]

### Humor Usage
[None → Occasional → Regular → Frequent]

### Signature Elements
- **Phrases**: [Your unique expressions]
- **Structures**: [How you organize ideas]
- **Examples**: [How you illustrate points]

## Voice Guidelines

### Do's
- [Guideline 1]
- [Guideline 2]
- [Guideline 3]

### Don'ts
- [Avoid 1]
- [Avoid 2]
- [Avoid 3]

## Audience Impact
After consuming your content, readers should feel:
[Desired emotional impact]

## Voice Examples

### Example 1: Introduction
[Sample paragraph in your voice]

### Example 2: Explaining Complex Ideas
[Sample paragraph in your voice]

### Example 3: Call to Action
[Sample paragraph in your voice]

## Voice Consistency Checklist
- [ ] Matches defined tone
- [ ] Reflects personality traits
- [ ] Aligns with core values
- [ ] Appropriate formality
- [ ] Consistent humor level
- [ ] Avoids unwanted characteristics`;
  }
  
  private analyzeNaturalVoice(text: string): any {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
    
    let style = 'balanced';
    let sentenceLength = 'medium';
    
    // Analyze formality
    const casualIndicators = /('ve|'re|'ll|gonna|wanna|kinda|you know|like,)/gi;
    const formalIndicators = /(therefore|furthermore|moreover|consequently|respectively)/gi;
    
    const casualMatches = text.match(casualIndicators)?.length || 0;
    const formalMatches = text.match(formalIndicators)?.length || 0;
    
    if (casualMatches > formalMatches * 2) {
      style = 'casual';
    } else if (formalMatches > casualMatches * 2) {
      style = 'formal';
    }
    
    // Analyze sentence length
    if (avgLength < 10) {
      sentenceLength = 'short';
    } else if (avgLength > 20) {
      sentenceLength = 'long';
    }
    
    return { style, sentenceLength, avgWordsPerSentence: Math.round(avgLength) };
  }
  
  private extractTone(selection: string): string {
    const match = selection.match(/^([^-]+)/);
    return match ? match[1].trim().toLowerCase() : 'professional';
  }
  
  private extractFormality(selection: string): string {
    if (selection.includes('Very Formal')) return 'very formal';
    if (selection.includes('Professional')) return 'professional';
    if (selection.includes('Conversational')) return 'conversational';
    if (selection.includes('Very Casual')) return 'very casual';
    if (selection.includes('Casual')) return 'casual';
    return 'professional';
  }
  
  private extractHumor(selection: string): string {
    if (selection.includes('None')) return 'none';
    if (selection.includes('Occasional')) return 'occasional';
    if (selection.includes('Regular')) return 'regular';
    if (selection.includes('Frequent')) return 'frequent';
    return 'occasional';
  }
  
  private parseTraits(input: string): string[] {
    return input.split(/[,;]/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .slice(0, 5);
  }
  
  private parseValues(input: string): string[] {
    return input.split(/[,;.\n]/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .slice(0, 3);
  }
  
  private parseAvoidList(input: string): string[] {
    return input.split(/[,;]/)
      .map(a => a.trim().toLowerCase())
      .filter(a => a.length > 0);
  }
  
  private generateVoiceGuidelines(voiceDNA: any, answers: any): string[] {
    const guidelines = [];
    
    // Tone guidelines
    if (voiceDNA.tone === 'professional expert') {
      guidelines.push('Use industry terminology accurately but explain complex concepts');
      guidelines.push('Back statements with data, research, or experience');
    } else if (voiceDNA.tone === 'friendly guide') {
      guidelines.push('Use "we" and "you" to create connection');
      guidelines.push('Share personal experiences and lessons learned');
    }
    
    // Formality guidelines
    if (voiceDNA.formality === 'conversational' || voiceDNA.formality === 'casual') {
      guidelines.push('Use contractions naturally');
      guidelines.push('Start sentences with "And" or "But" when it flows');
    }
    
    // Personality guidelines
    if (voiceDNA.personality.includes('empathetic')) {
      guidelines.push('Acknowledge reader challenges and emotions');
    }
    if (voiceDNA.personality.includes('witty')) {
      guidelines.push('Include clever observations and wordplay');
    }
    
    return guidelines;
  }
  
  private calculateVoiceClarity(answers: any): number {
    let clarity = 0;
    const totalFactors = 7;
    
    if (answers.natural_voice?.length > 50) clarity += 1/totalFactors;
    if (answers.tone_preference) clarity += 1/totalFactors;
    if (answers.personality_traits?.length > 20) clarity += 1/totalFactors;
    if (answers.core_values?.length > 20) clarity += 1/totalFactors;
    if (answers.audience_relationship?.length > 20) clarity += 1/totalFactors;
    if (answers.avoid_characteristics?.length > 10) clarity += 1/totalFactors;
    if (answers.formality_level) clarity += 1/totalFactors;
    
    return Math.min(clarity, 1);
  }
  
  getEstimatedTime(): number {
    return 10; // 10 minutes for voice discovery
  }
  
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'beginner';
  }
}