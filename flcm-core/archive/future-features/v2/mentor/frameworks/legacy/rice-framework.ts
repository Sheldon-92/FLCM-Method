/**
 * RICE Framework
 * Ported from FLCM 1.0 Collector Agent
 * Prioritization framework for content ideas
 */

import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';

export class RICEFramework extends BaseFramework {
  constructor() {
    super();
    this.name = 'RICE Framework';
    this.description = 'Prioritize content ideas using Reach, Impact, Confidence, and Effort metrics';
    this.version = '1.0';
    this.category = 'prioritization';
    this.tags = ['prioritization', 'content-strategy', 'decision-making', 'legacy'];
  }
  
  getIntroduction(context?: FrameworkContext): string {
    return `The RICE framework helps you prioritize content ideas by evaluating:
    
• **Reach**: How many people will this content affect?
• **Impact**: How much will it impact each person? (0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive)
• **Confidence**: How confident are you about your estimates? (0-100%)
• **Effort**: How much effort will it take? (person-months)

Let's evaluate your ${context?.topic || 'content idea'} using these criteria.`;
  }
  
  getQuestions(context?: FrameworkContext): FrameworkQuestion[] {
    return [
      {
        id: 'reach',
        question: 'How many people will this content reach in the first quarter? (estimated number)',
        type: 'open',
        required: true,
        validation: (answer: any) => {
          const num = parseInt(answer);
          return !isNaN(num) && num > 0;
        }
      },
      {
        id: 'impact',
        question: 'What level of impact will this have on each person?',
        type: 'multiple-choice',
        required: true,
        options: [
          '0.25 - Minimal impact',
          '0.5 - Low impact',
          '1 - Medium impact',
          '2 - High impact',
          '3 - Massive impact'
        ]
      },
      {
        id: 'confidence',
        question: 'How confident are you in these estimates? (0-100%)',
        type: 'scale',
        required: true,
        validation: (answer: any) => {
          const num = parseInt(answer);
          return !isNaN(num) && num >= 0 && num <= 100;
        }
      },
      {
        id: 'effort',
        question: 'How many person-months will this take to complete?',
        type: 'open',
        required: true,
        validation: (answer: any) => {
          const num = parseFloat(answer);
          return !isNaN(num) && num > 0;
        }
      },
      {
        id: 'justification',
        question: 'Briefly explain your reasoning for these estimates',
        type: 'open',
        required: false
      }
    ];
  }
  
  async process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput> {
    const reach = parseInt(answers.reach);
    const impactValue = parseFloat(answers.impact.split(' ')[0]);
    const confidence = parseInt(answers.confidence) / 100;
    const effort = parseFloat(answers.effort);
    
    // Calculate RICE score
    const riceScore = (reach * impactValue * confidence) / effort;
    
    // Generate insights
    const insights: string[] = [];
    
    if (reach > 10000) {
      insights.push('This content has potential for significant reach, indicating broad appeal');
    } else if (reach < 1000) {
      insights.push('Limited reach suggests this content targets a niche audience');
    }
    
    if (impactValue >= 2) {
      insights.push('High impact per person indicates this content addresses a critical need');
    } else if (impactValue <= 0.5) {
      insights.push('Low impact suggests this content may be nice-to-have rather than essential');
    }
    
    if (confidence < 0.5) {
      insights.push('Low confidence indicates more research may be needed before proceeding');
    } else if (confidence >= 0.8) {
      insights.push('High confidence suggests well-understood requirements and audience');
    }
    
    if (effort > 3) {
      insights.push('Significant effort required - consider breaking into smaller pieces');
    } else if (effort <= 1) {
      insights.push('Low effort makes this a good candidate for quick wins');
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (riceScore > 1000) {
      recommendations.push('High priority - This content should be created as soon as possible');
    } else if (riceScore > 500) {
      recommendations.push('Medium-high priority - Schedule this content for the near future');
    } else if (riceScore > 100) {
      recommendations.push('Medium priority - Consider this content for your backlog');
    } else {
      recommendations.push('Low priority - Revisit this idea when resources are more available');
    }
    
    // Optimization suggestions
    if (reach < 5000 && effort > 2) {
      recommendations.push('Consider ways to expand reach or reduce effort to improve ROI');
    }
    
    if (impactValue < 1 && effort > 1) {
      recommendations.push('Look for ways to increase impact or reduce scope');
    }
    
    if (confidence < 0.7) {
      recommendations.push('Conduct user research or create a prototype to increase confidence');
    }
    
    // Generate next steps
    const nextSteps: string[] = [];
    
    if (riceScore > 500) {
      nextSteps.push('Define specific content deliverables and milestones');
      nextSteps.push('Identify required resources and team members');
      nextSteps.push('Create a detailed content outline or structure');
    } else {
      nextSteps.push('Document this idea for future consideration');
      nextSteps.push('Set a reminder to re-evaluate in 3 months');
      nextSteps.push('Look for ways to reduce effort or increase impact');
    }
    
    if (confidence < 0.7) {
      nextSteps.push('Gather more data through surveys or user interviews');
    }
    
    return {
      insights,
      recommendations,
      nextSteps,
      data: {
        reach,
        impact: impactValue,
        confidence,
        effort,
        riceScore: Math.round(riceScore),
        priority: this.getPriorityLevel(riceScore),
        justification: answers.justification || ''
      },
      confidence: confidence,
      metadata: {
        framework: 'RICE',
        version: this.version,
        calculatedAt: new Date().toISOString()
      }
    };
  }
  
  getTemplate(): string {
    return `# RICE Framework Analysis

## Metrics
- **Reach**: [Number of people affected in first quarter]
- **Impact**: [0.25/0.5/1/2/3 - Level of impact per person]
- **Confidence**: [0-100% - Confidence in estimates]
- **Effort**: [Person-months required]

## RICE Score
**Score**: (Reach × Impact × Confidence) / Effort = [Score]

## Priority Level
[High/Medium/Low based on score]

## Insights
- [Key insight about reach]
- [Key insight about impact]
- [Key insight about confidence]
- [Key insight about effort]

## Recommendations
- [Primary recommendation based on score]
- [Optimization suggestions]

## Next Steps
1. [Immediate action]
2. [Follow-up action]
3. [Long-term consideration]`;
  }
  
  private getPriorityLevel(score: number): string {
    if (score > 1000) return 'Critical';
    if (score > 500) return 'High';
    if (score > 100) return 'Medium';
    if (score > 50) return 'Low';
    return 'Very Low';
  }
  
  getEstimatedTime(): number {
    return 5; // 5 minutes for RICE evaluation
  }
  
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'beginner';
  }
}