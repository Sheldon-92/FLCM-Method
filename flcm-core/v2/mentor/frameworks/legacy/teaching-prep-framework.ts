/**
 * Teaching Preparation Framework
 * Ported from FLCM 1.0 Scholar Agent
 * Feynman-inspired framework for deep understanding
 */

import { ProgressiveFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';

export class TeachingPreparationFramework extends ProgressiveFramework {
  constructor() {
    super();
    this.name = 'Teaching Preparation Framework';
    this.description = 'Deepen understanding by preparing to teach - inspired by the Feynman Technique';
    this.version = '1.0';
    this.category = 'learning';
    this.tags = ['learning', 'understanding', 'education', 'feynman', 'legacy'];
    this.maxDepth = 5;
  }
  
  getIntroduction(context?: FrameworkContext): string {
    return `The Teaching Preparation Framework helps you truly understand ${context?.topic || 'a topic'} by preparing to teach it.

Based on the Feynman Technique, we'll work through:
1. **Explain Simply**: Can you explain it to a child?
2. **Identify Gaps**: Where does your explanation break down?
3. **Simplify Language**: Remove jargon and complexity
4. **Use Analogies**: Connect to familiar concepts
5. **Test Understanding**: Verify through examples

Let's deepen your understanding step by step.`;
  }
  
  getQuestions(context?: FrameworkContext): FrameworkQuestion[] {
    return this.getQuestionsForDepth(1, context);
  }
  
  getQuestionsForDepth(depth: number, context?: FrameworkContext): FrameworkQuestion[] {
    const questions: FrameworkQuestion[] = [];
    
    switch(depth) {
      case 1: // Basic explanation
        questions.push(
          {
            id: 'simple_explanation',
            question: `Explain ${context?.topic || 'your topic'} as if teaching a 10-year-old child. Use simple words and avoid technical terms.`,
            type: 'open',
            required: true
          },
          {
            id: 'core_concept',
            question: 'What is the ONE most important thing someone needs to understand about this?',
            type: 'open',
            required: true
          }
        );
        break;
        
      case 2: // Identify gaps
        questions.push(
          {
            id: 'difficult_parts',
            question: 'Which parts were hardest to explain simply? Where did you struggle?',
            type: 'open',
            required: true
          },
          {
            id: 'assumptions',
            question: 'What knowledge did you assume the "student" already had?',
            type: 'open',
            required: true
          },
          {
            id: 'questions_expected',
            question: 'What questions would a curious student likely ask?',
            type: 'open',
            required: true
          }
        );
        break;
        
      case 3: // Analogies and examples
        questions.push(
          {
            id: 'everyday_analogy',
            question: 'Create an analogy using everyday objects or experiences (like "The internet is like a library where...")',
            type: 'open',
            required: true
          },
          {
            id: 'concrete_example',
            question: 'Provide a specific, real-world example that demonstrates this concept in action',
            type: 'open',
            required: true
          },
          {
            id: 'common_misconception',
            question: 'What is a common misconception about this topic? How would you correct it?',
            type: 'open',
            required: false
          }
        );
        break;
        
      case 4: // Deeper connections
        questions.push(
          {
            id: 'why_matters',
            question: 'Why should someone care about understanding this? What problems does it solve?',
            type: 'open',
            required: true
          },
          {
            id: 'related_concepts',
            question: 'What other concepts or fields does this connect to?',
            type: 'open',
            required: true
          },
          {
            id: 'historical_context',
            question: 'What problem was this trying to solve when it was first developed/discovered?',
            type: 'open',
            required: false
          }
        );
        break;
        
      case 5: // Teaching plan
        questions.push(
          {
            id: 'learning_objectives',
            question: 'List 3-5 specific things a student should be able to do after learning this',
            type: 'open',
            required: true
          },
          {
            id: 'check_understanding',
            question: 'Create a simple test question that would verify someone truly understands this',
            type: 'open',
            required: true
          },
          {
            id: 'teaching_sequence',
            question: 'In what order would you teach the components? What comes first and why?',
            type: 'open',
            required: true
          }
        );
        break;
    }
    
    return questions;
  }
  
  shouldGoDeeper(answers: Record<string, any>, depth: number): boolean {
    // Go deeper if the user provides substantial answers
    const answerLength = Object.values(answers)
      .filter(a => typeof a === 'string')
      .reduce((sum, a) => sum + a.length, 0);
    
    // Continue if answers are substantial and we haven't reached max depth
    return answerLength > 200 && depth < this.maxDepth;
  }
  
  async process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput> {
    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextSteps: string[] = [];
    
    // Analyze explanation quality
    if (answers.simple_explanation) {
      const explanation = answers.simple_explanation;
      const wordCount = explanation.split(' ').length;
      const avgWordLength = explanation.replace(/\s/g, '').length / wordCount;
      
      if (avgWordLength > 6) {
        insights.push('Your explanation may still contain complex vocabulary - consider simplifying further');
      } else {
        insights.push('Good use of simple language makes your explanation accessible');
      }
      
      if (wordCount < 50) {
        insights.push('Very concise explanation - ensure you\'re not oversimplifying');
      } else if (wordCount > 200) {
        insights.push('Lengthy explanation - consider breaking into smaller chunks');
      }
    }
    
    // Analyze identified gaps
    if (answers.difficult_parts) {
      insights.push(`Key learning gap identified: ${answers.difficult_parts.substring(0, 100)}...`);
      recommendations.push('Focus additional study on the areas you found difficult to explain');
    }
    
    // Analyze analogies
    if (answers.everyday_analogy) {
      insights.push('Creating analogies demonstrates conceptual understanding');
      if (answers.everyday_analogy.includes('like') || answers.everyday_analogy.includes('similar')) {
        insights.push('Good use of comparative language in your analogy');
      }
    }
    
    // Analyze teaching approach
    if (answers.learning_objectives) {
      const objectives = answers.learning_objectives.split('\n').filter(o => o.trim());
      if (objectives.length >= 3) {
        insights.push('Well-structured learning objectives provide clear goals');
      }
      recommendations.push('Use these objectives to structure your content creation');
    }
    
    // Generate understanding level
    const understandingLevel = this.calculateUnderstandingLevel(answers);
    
    // Provide recommendations based on understanding level
    if (understandingLevel < 0.5) {
      recommendations.push('Spend more time with source materials before creating content');
      recommendations.push('Try explaining to a real person and note their questions');
      recommendations.push('Research the topics you struggled to explain simply');
    } else if (understandingLevel < 0.8) {
      recommendations.push('Your understanding is solid - focus on the gaps you identified');
      recommendations.push('Develop more analogies to strengthen conceptual connections');
      recommendations.push('Practice explaining to different audiences');
    } else {
      recommendations.push('Excellent understanding - ready to create authoritative content');
      recommendations.push('Consider creating multiple content pieces for different audience levels');
      recommendations.push('Share your unique perspective and insights');
    }
    
    // Generate next steps
    nextSteps.push('Research the specific areas where explanation was difficult');
    nextSteps.push('Create a glossary of simplified terms for complex concepts');
    nextSteps.push('Develop 2-3 additional analogies for core concepts');
    
    if (answers.questions_expected) {
      nextSteps.push('Prepare answers for the anticipated questions');
    }
    
    if (answers.teaching_sequence) {
      nextSteps.push('Create an outline following your teaching sequence');
    }
    
    return {
      insights,
      recommendations,
      nextSteps,
      data: {
        understandingLevel,
        depthReached: this.currentDepth,
        coreConc ept: answers.core_concept,
        identifiedGaps: answers.difficult_parts,
        analogy: answers.everyday_analogy,
        learningObjectives: answers.learning_objectives
      },
      confidence: understandingLevel,
      metadata: {
        framework: 'Teaching Preparation',
        version: this.version,
        feynmanLevel: this.getFeynmanLevel(understandingLevel)
      }
    };
  }
  
  getTemplate(): string {
    return `# Teaching Preparation Framework

## Simple Explanation
[Explain as if to a 10-year-old]

## Core Concept
[The ONE most important thing]

## Identified Knowledge Gaps
- [Gap 1]
- [Gap 2]
- [Gap 3]

## Analogies
### Everyday Analogy
[Your topic is like...]

### Concrete Example
[Real-world application]

## Why It Matters
[Problem it solves, importance]

## Learning Objectives
Students will be able to:
1. [Objective 1]
2. [Objective 2]
3. [Objective 3]

## Understanding Check
**Test Question**: [Your question]
**Expected Answer**: [Key points]

## Teaching Sequence
1. Start with: [Foundation concept]
2. Then explain: [Building concept]
3. Finally cover: [Advanced application]

## Understanding Level
[Beginner/Intermediate/Advanced/Expert]`;
  }
  
  private calculateUnderstandingLevel(answers: Record<string, any>): number {
    let score = 0;
    let factors = 0;
    
    // Simple explanation quality
    if (answers.simple_explanation) {
      factors++;
      const length = answers.simple_explanation.length;
      if (length > 100 && length < 500) score += 0.2;
    }
    
    // Core concept clarity
    if (answers.core_concept && answers.core_concept.length > 20) {
      factors++;
      score += 0.2;
    }
    
    // Gap awareness
    if (answers.difficult_parts && answers.difficult_parts.length > 30) {
      factors++;
      score += 0.15;
    }
    
    // Analogy quality
    if (answers.everyday_analogy && answers.everyday_analogy.includes('like')) {
      factors++;
      score += 0.15;
    }
    
    // Teaching structure
    if (answers.learning_objectives || answers.teaching_sequence) {
      factors++;
      score += 0.3;
    }
    
    return factors > 0 ? Math.min(score, 1) : 0.5;
  }
  
  private getFeynmanLevel(understanding: number): string {
    if (understanding < 0.3) return 'Surface - Can recite facts';
    if (understanding < 0.5) return 'Shallow - Understands basics';
    if (understanding < 0.7) return 'Developing - Can explain simply';
    if (understanding < 0.9) return 'Deep - Can teach effectively';
    return 'Expert - Can innovate and extend';
  }
  
  getEstimatedTime(): number {
    return 15; // 15 minutes for full teaching prep
  }
  
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'intermediate';
  }
}