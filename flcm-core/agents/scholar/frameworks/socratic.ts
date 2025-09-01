/**
 * Socratic Framework
 * Deep questioning and critical thinking framework
 */

import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('SocraticFramework');

export interface SocraticResult {
  clarification: string[];      // Questions for clarification
  assumptions: string[];         // Questions about assumptions
  evidence: string[];           // Questions about evidence
  perspectives: string[];       // Questions about viewpoints
  implications: string[];       // Questions about implications
  questions: string[];          // Questions about the question itself
}

export class SocraticFramework {
  /**
   * Analyze content using Socratic questioning
   */
  async analyze(content: string): Promise<SocraticResult> {
    try {
      logger.debug('Applying Socratic framework analysis');

      return {
        clarification: this.generateClarificationQuestions(content),
        assumptions: this.identifyAssumptions(content),
        evidence: this.questionEvidence(content),
        perspectives: this.explorePerspectives(content),
        implications: this.examineImplications(content),
        questions: this.questionTheQuestion(content),
      };
    } catch (error) {
      logger.error('Socratic analysis failed:', error);
      throw error;
    }
  }

  private generateClarificationQuestions(content: string): string[] {
    const topics = this.extractTopics(content);
    const questions: string[] = [];

    if (topics.length > 0) {
      questions.push(`What exactly is meant by "${topics[0]}"?`);
      questions.push(`Can you provide a specific example of this concept?`);
      questions.push(`How does this relate to the main objective?`);
    }

    return questions.slice(0, 3);
  }

  private identifyAssumptions(content: string): string[] {
    const assumptions: string[] = [];
    
    // Look for assumption indicators
    if (content.includes('assume') || content.includes('assuming')) {
      assumptions.push('What assumptions are being made here?');
    }
    
    if (content.includes('believe') || content.includes('think')) {
      assumptions.push('What beliefs underlie this statement?');
    }

    assumptions.push('What must be true for this to work?');
    
    return assumptions.slice(0, 3);
  }

  private questionEvidence(content: string): string[] {
    const questions: string[] = [];

    if (content.includes('data') || content.includes('research')) {
      questions.push('What data supports this conclusion?');
    }

    if (content.includes('study') || content.includes('analysis')) {
      questions.push('How was this analysis conducted?');
    }

    questions.push('What evidence might contradict this?');
    questions.push('How reliable is the source of this information?');

    return questions.slice(0, 3);
  }

  private explorePerspectives(content: string): string[] {
    return [
      'How might someone with opposing views see this?',
      'What are the alternative interpretations?',
      'Who benefits from this perspective?',
    ];
  }

  private examineImplications(content: string): string[] {
    const implications: string[] = [];

    if (content.includes('result') || content.includes('outcome')) {
      implications.push('What are the long-term consequences?');
    }

    if (content.includes('impact') || content.includes('effect')) {
      implications.push('Who will be most affected by this?');
    }

    implications.push('What follows from this conclusion?');
    implications.push('What are the unintended consequences?');

    return implications.slice(0, 3);
  }

  private questionTheQuestion(content: string): string[] {
    return [
      'Why is this question important?',
      'What does this question assume?',
      'Is there a better way to frame this issue?',
    ];
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction
    const words = content.split(/\s+/);
    const topics: string[] = [];

    for (let i = 0; i < words.length - 2; i++) {
      const word = words[i];
      if (word.length > 5 && word[0] === word[0].toUpperCase()) {
        topics.push(word);
      }
    }

    return topics.slice(0, 5);
  }

  /**
   * Extract insights from Socratic results
   */
  extractInsights(results: SocraticResult): string[] {
    const insights: string[] = [];

    // Select most important questions from each category
    if (results.clarification.length > 0) {
      insights.push(`Key clarification needed: ${results.clarification[0]}`);
    }

    if (results.assumptions.length > 0) {
      insights.push(`Critical assumption to verify: ${results.assumptions[0]}`);
    }

    if (results.evidence.length > 0) {
      insights.push(`Evidence question: ${results.evidence[0]}`);
    }

    if (results.implications.length > 0) {
      insights.push(`Important implication: ${results.implications[0]}`);
    }

    return insights;
  }
}