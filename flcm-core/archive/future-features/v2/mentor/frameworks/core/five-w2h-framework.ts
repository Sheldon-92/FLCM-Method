/**
 * 5W2H Analysis Framework
 * Comprehensive analysis through fundamental questions
 */

import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';

interface W2HAnalysis {
  what: string[];
  why: string[];
  who: string[];
  when: string[];
  where: string[];
  how: string[];
  howMuch: string[];
}

export class FiveW2HFramework extends BaseFramework {
  constructor() {
    super();
    this.name = '5W2H Analysis Framework';
    this.description = 'Comprehensive understanding through fundamental journalistic questions';
    this.version = '2.0';
    this.category = 'analysis';
    this.tags = ['analysis', 'comprehensive', 'fundamental', 'journalistic', 'systematic'];
  }
  
  getIntroduction(context?: FrameworkContext): string {
    return `The 5W2H framework provides comprehensive analysis of ${context?.topic || 'your subject'} through seven fundamental questions:

• **What** - The essence and components
• **Why** - The reasons and motivations  
• **Who** - The people and stakeholders
• **When** - The timing and sequences
• **Where** - The locations and contexts
• **How** - The methods and processes
• **How Much** - The quantities and costs

This systematic approach ensures no critical aspect is overlooked.`;
  }
  
  getQuestions(context?: FrameworkContext): FrameworkQuestion[] {
    const topic = context?.topic || 'this';
    
    return [
      // Context setting
      {
        id: 'overview',
        question: `Give a brief overview of ${topic} to set the context.`,
        type: 'open',
        required: true
      },
      
      // WHAT
      {
        id: 'what_definition',
        question: `WHAT exactly is ${topic}? Define its core essence and main components.`,
        type: 'open',
        required: true,
        followUp: 'Include: Definition, components, characteristics, boundaries'
      },
      {
        id: 'what_goals',
        question: 'WHAT are the objectives, goals, or desired outcomes?',
        type: 'open',
        required: true
      },
      {
        id: 'what_problems',
        question: 'WHAT problems does this solve or create?',
        type: 'open',
        required: true
      },
      
      // WHY
      {
        id: 'why_exists',
        question: `WHY does ${topic} exist? What's the fundamental reason or need?`,
        type: 'open',
        required: true
      },
      {
        id: 'why_important',
        question: 'WHY is this important? What makes it matter?',
        type: 'open',
        required: true
      },
      {
        id: 'why_now',
        question: 'WHY is this relevant now specifically? What makes the timing significant?',
        type: 'open',
        required: true
      },
      
      // WHO
      {
        id: 'who_involved',
        question: 'WHO are the key stakeholders? List all people/groups involved or affected.',
        type: 'open',
        required: true,
        followUp: 'Include: Users, creators, decision-makers, influencers, beneficiaries'
      },
      {
        id: 'who_responsible',
        question: 'WHO is responsible for making this happen? Who are the key drivers?',
        type: 'open',
        required: true
      },
      {
        id: 'who_benefits',
        question: 'WHO benefits most and WHO might be disadvantaged?',
        type: 'open',
        required: true
      },
      
      // WHEN
      {
        id: 'when_timeline',
        question: 'WHEN does this occur? Provide timeline, phases, or key milestones.',
        type: 'open',
        required: true
      },
      {
        id: 'when_critical',
        question: 'WHEN are the critical moments or deadlines?',
        type: 'open',
        required: true
      },
      {
        id: 'when_duration',
        question: 'WHEN does it start and end? What's the expected duration?',
        type: 'open',
        required: false
      },
      
      // WHERE
      {
        id: 'where_location',
        question: 'WHERE does this take place? (Physical locations, markets, digital spaces)',
        type: 'open',
        required: true
      },
      {
        id: 'where_impact',
        question: 'WHERE will the impact be felt most strongly?',
        type: 'open',
        required: true
      },
      {
        id: 'where_resources',
        question: 'WHERE do necessary resources come from?',
        type: 'open',
        required: false
      },
      
      // HOW
      {
        id: 'how_works',
        question: `HOW does ${topic} work? Describe the process or mechanism.`,
        type: 'open',
        required: true
      },
      {
        id: 'how_implement',
        question: 'HOW will this be implemented or executed?',
        type: 'open',
        required: true
      },
      {
        id: 'how_measure',
        question: 'HOW will success be measured?',
        type: 'open',
        required: true
      },
      
      // HOW MUCH
      {
        id: 'howmuch_cost',
        question: 'HOW MUCH will this cost? (Money, time, resources)',
        type: 'open',
        required: true
      },
      {
        id: 'howmuch_scale',
        question: 'HOW MUCH scale or scope is involved? (Size, quantity, reach)',
        type: 'open',
        required: true
      },
      {
        id: 'howmuch_value',
        question: 'HOW MUCH value or benefit is expected?',
        type: 'open',
        required: true
      }
    ];
  }
  
  async process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput> {
    // Organize answers by W2H categories
    const analysis: W2HAnalysis = {
      what: this.extractAnswers(answers, 'what'),
      why: this.extractAnswers(answers, 'why'),
      who: this.extractAnswers(answers, 'who'),
      when: this.extractAnswers(answers, 'when'),
      where: this.extractAnswers(answers, 'where'),
      how: this.extractAnswers(answers, 'how_'),
      howMuch: this.extractAnswers(answers, 'howmuch')
    };
    
    // Generate comprehensive insights
    const insights = this.generateInsights(analysis, answers);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis, answers);
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(analysis, answers);
    
    // Calculate completeness score
    const completeness = this.calculateCompleteness(analysis);
    
    // Identify gaps and risks
    const gaps = this.identifyGaps(analysis);
    const risks = this.identifyRisks(analysis, answers);
    
    return {
      insights,
      recommendations,
      nextSteps,
      data: {
        w2hAnalysis: analysis,
        completeness,
        gaps,
        risks,
        summary: this.generateExecutiveSummary(analysis, answers),
        keyStakeholders: this.extractStakeholders(answers),
        timeline: this.extractTimeline(answers),
        successMetrics: this.extractMetrics(answers)
      },
      confidence: completeness,
      metadata: {
        framework: '5W2H',
        version: this.version,
        analysisDate: new Date().toISOString()
      }
    };
  }
  
  private extractAnswers(answers: Record<string, any>, prefix: string): string[] {
    const extracted: string[] = [];
    
    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith(prefix) && typeof value === 'string' && value.trim()) {
        // Split multi-part answers
        const parts = value.split(/[\n;]/).map(p => p.trim()).filter(p => p);
        extracted.push(...parts);
      }
    });
    
    return extracted;
  }
  
  private generateInsights(analysis: W2HAnalysis, answers: Record<string, any>): string[] {
    const insights: string[] = [];
    
    // Completeness insight
    const totalAnswers = Object.values(analysis).reduce((sum, arr) => sum + arr.length, 0);
    if (totalAnswers > 20) {
      insights.push('Comprehensive 5W2H analysis provides thorough understanding');
    } else if (totalAnswers < 10) {
      insights.push('Limited detail in 5W2H analysis suggests need for deeper investigation');
    }
    
    // What insights
    if (analysis.what.length > 0) {
      if (answers.what_problems?.includes('solve')) {
        insights.push('Clear problem-solution fit identified');
      }
    }
    
    // Why insights
    if (analysis.why.length > 2) {
      insights.push('Multiple compelling reasons support this initiative');
    }
    if (answers.why_now?.toLowerCase().includes('urgent') || 
        answers.why_now?.toLowerCase().includes('critical')) {
      insights.push('Time-sensitive opportunity requires swift action');
    }
    
    // Who insights
    const stakeholders = this.extractStakeholders(answers);
    if (stakeholders.length > 5) {
      insights.push('Complex stakeholder landscape requires careful coordination');
    }
    if (answers.who_benefits && answers.who_benefits !== answers.who_responsible) {
      insights.push('Separation between beneficiaries and implementers may affect motivation');
    }
    
    // When insights
    if (answers.when_critical?.toLowerCase().includes('immediate') || 
        answers.when_critical?.toLowerCase().includes('asap')) {
      insights.push('Critical timing constraints demand accelerated planning');
    }
    
    // How insights
    if (answers.how_measure) {
      insights.push('Clear success metrics enable objective evaluation');
    }
    
    // How Much insights
    if (answers.howmuch_value && answers.howmuch_cost) {
      const hasROI = answers.howmuch_value.length > 20 && answers.howmuch_cost.length > 20;
      if (hasROI) {
        insights.push('Cost-benefit analysis possible with provided information');
      }
    }
    
    return insights;
  }
  
  private generateRecommendations(analysis: W2HAnalysis, answers: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    // Based on gaps
    const gaps = this.identifyGaps(analysis);
    if (gaps.length > 0) {
      recommendations.push(`Address information gaps in: ${gaps.join(', ')}`);
    }
    
    // Stakeholder recommendations
    if (answers.who_involved && !answers.who_responsible) {
      recommendations.push('Clearly define roles and responsibilities for all stakeholders');
    }
    
    // Timeline recommendations
    if (answers.when_timeline) {
      if (!answers.when_critical) {
        recommendations.push('Identify critical milestones and deadlines within timeline');
      }
      recommendations.push('Create detailed project plan with phased approach');
    }
    
    // Process recommendations
    if (answers.how_works && answers.how_implement) {
      recommendations.push('Document standard operating procedures based on process description');
    }
    
    // Measurement recommendations
    if (answers.how_measure) {
      recommendations.push('Establish baseline measurements before implementation');
      recommendations.push('Set up regular review cycles to track against success metrics');
    }
    
    // Resource recommendations
    if (answers.howmuch_cost && answers.where_resources) {
      recommendations.push('Secure resource commitments before proceeding');
    }
    
    // Risk mitigation
    const risks = this.identifyRisks(analysis, answers);
    if (risks.length > 0) {
      recommendations.push(`Develop risk mitigation plans for: ${risks[0]}`);
    }
    
    return recommendations;
  }
  
  private generateNextSteps(analysis: W2HAnalysis, answers: Record<string, any>): string[] {
    const steps: string[] = [];
    
    // Immediate actions based on 5W2H
    steps.push('Create one-page 5W2H summary for stakeholder alignment');
    
    // What-based actions
    if (answers.what_goals) {
      steps.push('Translate goals into SMART objectives with specific targets');
    }
    
    // Who-based actions
    if (answers.who_involved) {
      steps.push('Schedule stakeholder kick-off meeting to align on 5W2H');
      steps.push('Create RACI matrix for clear role definition');
    }
    
    // When-based actions
    if (answers.when_timeline) {
      steps.push('Develop detailed Gantt chart or project timeline');
    }
    
    // How-based actions
    if (answers.how_implement) {
      steps.push('Create implementation checklist and process documentation');
    }
    
    // Measurement actions
    if (answers.how_measure) {
      steps.push('Set up measurement dashboard and reporting cadence');
    }
    
    // Budget actions
    if (answers.howmuch_cost) {
      steps.push('Prepare detailed budget proposal with cost breakdown');
    }
    
    return steps;
  }
  
  private calculateCompleteness(analysis: W2HAnalysis): number {
    let score = 0;
    const categories = Object.keys(analysis) as (keyof W2HAnalysis)[];
    
    categories.forEach(category => {
      const items = analysis[category];
      if (items.length > 0) {
        // Base points for having any answer
        score += 0.1;
        
        // Additional points for detail
        if (items.length >= 3) score += 0.05;
        
        // Points for answer quality (length as proxy)
        const totalLength = items.join(' ').length;
        if (totalLength > 100) score += 0.02;
      }
    });
    
    return Math.min(score, 1);
  }
  
  private identifyGaps(analysis: W2HAnalysis): string[] {
    const gaps: string[] = [];
    const categories: Array<{key: keyof W2HAnalysis, label: string}> = [
      {key: 'what', label: 'What (definition/goals)'},
      {key: 'why', label: 'Why (reasons/motivation)'},
      {key: 'who', label: 'Who (stakeholders)'},
      {key: 'when', label: 'When (timeline)'},
      {key: 'where', label: 'Where (location/context)'},
      {key: 'how', label: 'How (process/method)'},
      {key: 'howMuch', label: 'How Much (cost/scale)'}
    ];
    
    categories.forEach(({key, label}) => {
      if (analysis[key].length === 0) {
        gaps.push(label);
      }
    });
    
    return gaps;
  }
  
  private identifyRisks(analysis: W2HAnalysis, answers: Record<string, any>): string[] {
    const risks: string[] = [];
    
    // Timeline risks
    if (answers.when_critical?.toLowerCase().includes('urgent') && 
        (!answers.how_implement || answers.how_implement.length < 50)) {
      risks.push('Urgent timeline with unclear implementation plan');
    }
    
    // Stakeholder risks
    if (analysis.who.length > 5) {
      risks.push('Multiple stakeholders may lead to coordination challenges');
    }
    
    // Resource risks
    if (answers.howmuch_cost?.toLowerCase().includes('high') || 
        answers.howmuch_cost?.toLowerCase().includes('expensive')) {
      risks.push('High cost requires careful budget management');
    }
    
    // Scale risks
    if (answers.howmuch_scale?.toLowerCase().includes('large') || 
        answers.howmuch_scale?.toLowerCase().includes('global')) {
      risks.push('Large scale increases complexity and failure impact');
    }
    
    // Measurement risks
    if (!answers.how_measure || answers.how_measure.length < 30) {
      risks.push('Unclear success metrics make evaluation difficult');
    }
    
    return risks;
  }
  
  private generateExecutiveSummary(analysis: W2HAnalysis, answers: Record<string, any>): string {
    const what = analysis.what[0] || 'the initiative';
    const why = analysis.why[0] || 'strategic reasons';
    const who = analysis.who[0] || 'key stakeholders';
    const when = analysis.when[0] || 'according to timeline';
    const where = analysis.where[0] || 'target locations';
    const how = analysis.how[0] || 'structured approach';
    const howMuch = analysis.howMuch[0] || 'required resources';
    
    return `This 5W2H analysis examines ${what}, driven by ${why}. ` +
           `It involves ${who} and will occur ${when} in ${where}. ` +
           `Implementation follows ${how} requiring ${howMuch}.`;
  }
  
  private extractStakeholders(answers: Record<string, any>): string[] {
    const stakeholders: string[] = [];
    
    ['who_involved', 'who_responsible', 'who_benefits'].forEach(key => {
      if (answers[key]) {
        const people = answers[key]
          .split(/[,;\n]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        stakeholders.push(...people);
      }
    });
    
    return [...new Set(stakeholders)]; // Remove duplicates
  }
  
  private extractTimeline(answers: Record<string, any>): any {
    return {
      overall: answers.when_timeline || 'Not specified',
      critical: answers.when_critical || 'Not specified',
      duration: answers.when_duration || 'Not specified',
      start: this.extractDate(answers.when_timeline, 'start'),
      end: this.extractDate(answers.when_timeline, 'end')
    };
  }
  
  private extractDate(text: string, type: 'start' | 'end'): string | null {
    if (!text) return null;
    
    // Simple date extraction (could be enhanced)
    const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
    const dates = text.match(datePattern);
    
    if (dates && dates.length > 0) {
      return type === 'start' ? dates[0] : dates[dates.length - 1];
    }
    
    return null;
  }
  
  private extractMetrics(answers: Record<string, any>): string[] {
    if (!answers.how_measure) return [];
    
    return answers.how_measure
      .split(/[,;\n]/)
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 0);
  }
  
  getTemplate(): string {
    return `# 5W2H Analysis

## WHAT
### Definition
[What exactly is this?]

### Goals & Objectives
[What are we trying to achieve?]

### Problems Addressed
[What problems does this solve?]

## WHY
### Fundamental Reason
[Why does this exist?]

### Importance
[Why does this matter?]

### Timing Significance
[Why now?]

## WHO
### Stakeholders
- [Key stakeholder 1]
- [Key stakeholder 2]
- [Key stakeholder 3]

### Responsible Parties
[Who drives this?]

### Beneficiaries
[Who benefits?]

## WHEN
### Timeline
[Overall schedule]

### Critical Moments
[Key deadlines]

### Duration
[Start to end]

## WHERE
### Location/Context
[Physical/digital spaces]

### Impact Zones
[Where effects are felt]

### Resource Sources
[Where resources originate]

## HOW
### Process/Mechanism
[How it works]

### Implementation
[How to execute]

### Success Measurement
[How to measure]

## HOW MUCH
### Cost
[Financial/resource investment]

### Scale/Scope
[Size and reach]

### Expected Value
[Benefits and returns]

## Summary
[Executive summary combining all elements]

## Gaps & Risks
### Information Gaps
- [Missing element 1]
- [Missing element 2]

### Identified Risks
- [Risk 1]
- [Risk 2]

## Next Steps
1. [Immediate action]
2. [Short-term action]
3. [Long-term action]`;
  }
  
  getEstimatedTime(): number {
    return 15; // 15 minutes for comprehensive 5W2H analysis
  }
  
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'beginner'; // 5W2H is accessible to everyone
  }
}