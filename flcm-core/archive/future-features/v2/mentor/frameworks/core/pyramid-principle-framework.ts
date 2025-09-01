/**
 * Pyramid Principle Framework
 * Structure thinking and communication for maximum clarity and impact
 */

import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';

interface PyramidStructure {
  mainPoint: string;
  keyArguments: string[];
  supportingData: Record<string, string[]>;
  logicalFlow: 'deductive' | 'inductive';
  situation: string;
  complication: string;
  question: string;
  answer: string;
}

export class PyramidPrincipleFramework extends BaseFramework {
  constructor() {
    super();
    this.name = 'Pyramid Principle Framework';
    this.description = 'Structure ideas top-down for clear, impactful communication';
    this.version = '2.0';
    this.category = 'communication';
    this.tags = ['structure', 'communication', 'logic', 'clarity', 'persuasion'];
  }
  
  getIntroduction(context?: FrameworkContext): string {
    return `The Pyramid Principle helps you structure ${context?.topic || 'your ideas'} for maximum clarity and impact.

Core principles:
• **Start with the answer** - Lead with your main point
• **Group and summarize** - Organize supporting ideas logically  
• **Support with logic** - Use deductive or inductive reasoning
• **Order by importance** - Most important information first

We'll also use the SCQ framework:
• **Situation** - Context everyone agrees on
• **Complication** - The problem or change
• **Question** - What should be done?
• **Answer** - Your main recommendation

Let's build your pyramid structure.`;
  }
  
  getQuestions(context?: FrameworkContext): FrameworkQuestion[] {
    const topic = context?.topic || 'your message';
    
    return [
      // SCQ Framework
      {
        id: 'situation',
        question: `What's the SITUATION? Describe the context that everyone can agree on regarding ${topic}.`,
        type: 'open',
        required: true,
        followUp: 'This should be non-controversial background information'
      },
      {
        id: 'complication',
        question: 'What's the COMPLICATION? What has changed, gone wrong, or needs attention?',
        type: 'open',
        required: true,
        followUp: 'This creates the tension that requires action'
      },
      {
        id: 'implied_question',
        question: 'What QUESTION does this complication raise in the reader\'s mind?',
        type: 'open',
        required: true,
        followUp: 'Examples: What should we do? How can we fix this? Which option is best?'
      },
      
      // Main Point (Answer)
      {
        id: 'main_point',
        question: 'What's your MAIN POINT or key message? (This answers the question above)',
        type: 'open',
        required: true,
        followUp: 'Be specific and action-oriented. This goes at the top of your pyramid.'
      },
      {
        id: 'one_liner',
        question: 'Summarize your main point in ONE sentence that a busy executive would remember.',
        type: 'open',
        required: true
      },
      
      // Key Arguments
      {
        id: 'key_arguments',
        question: 'What are 3-5 KEY ARGUMENTS that support your main point? List them in order of importance.',
        type: 'open',
        required: true,
        followUp: 'Each should be MECE (Mutually Exclusive, Collectively Exhaustive)'
      },
      
      // Logical Structure
      {
        id: 'logic_type',
        question: 'Which logical approach fits your arguments better?',
        type: 'multiple-choice',
        required: true,
        options: [
          'Deductive - General principle → Specific case → Conclusion',
          'Inductive - Similar examples → Pattern → Conclusion'
        ]
      },
      
      // Supporting Evidence
      {
        id: 'evidence_arg1',
        question: 'What evidence/data supports your FIRST key argument?',
        type: 'open',
        required: true
      },
      {
        id: 'evidence_arg2',
        question: 'What evidence/data supports your SECOND key argument?',
        type: 'open',
        required: true
      },
      {
        id: 'evidence_arg3',
        question: 'What evidence/data supports your THIRD key argument?',
        type: 'open',
        required: false
      },
      
      // Grouping and Flow
      {
        id: 'grouping_logic',
        question: 'How are your arguments grouped? By what logic?',
        type: 'multiple-choice',
        required: true,
        options: [
          'Time - Chronological sequence',
          'Structure - Components or parts',
          'Importance - Ranked by priority',
          'Process - Steps in a sequence'
        ]
      },
      
      // Anticipated Objections
      {
        id: 'objections',
        question: 'What objections or counterarguments might arise? How would you address them?',
        type: 'open',
        required: false
      },
      
      // Call to Action
      {
        id: 'next_steps',
        question: 'What specific next steps or actions do you want the audience to take?',
        type: 'open',
        required: true
      },
      
      // Audience
      {
        id: 'audience',
        question: 'Who is your primary audience and what do they care about most?',
        type: 'open',
        required: true
      }
    ];
  }
  
  async process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput> {
    // Build pyramid structure
    const pyramid: PyramidStructure = {
      mainPoint: answers.main_point,
      keyArguments: this.parseKeyArguments(answers.key_arguments),
      supportingData: this.organizeSupportingData(answers),
      logicalFlow: this.extractLogicalFlow(answers.logic_type),
      situation: answers.situation,
      complication: answers.complication,
      question: answers.implied_question,
      answer: answers.main_point
    };
    
    // Analyze structure quality
    const structureAnalysis = this.analyzeStructure(pyramid, answers);
    
    // Generate insights
    const insights = this.generateInsights(pyramid, structureAnalysis, answers);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(pyramid, structureAnalysis, answers);
    
    // Generate next steps
    const nextSteps = this.generateNextSteps(pyramid, answers);
    
    // Create communication templates
    const templates = this.createCommunicationTemplates(pyramid, answers);
    
    // Calculate clarity score
    const clarityScore = this.calculateClarityScore(pyramid, structureAnalysis);
    
    return {
      insights,
      recommendations,
      nextSteps,
      data: {
        pyramidStructure: pyramid,
        structureAnalysis,
        clarityScore,
        oneLiner: answers.one_liner,
        audience: answers.audience,
        templates,
        groupingLogic: answers.grouping_logic,
        objections: this.parseObjections(answers.objections)
      },
      confidence: clarityScore,
      metadata: {
        framework: 'Pyramid Principle',
        version: this.version,
        structureType: pyramid.logicalFlow
      }
    };
  }
  
  private parseKeyArguments(input: string): string[] {
    return input
      .split(/\d+\.|\n|;/)
      .map(arg => arg.trim())
      .filter(arg => arg.length > 0)
      .slice(0, 5); // Maximum 5 arguments
  }
  
  private organizeSupportingData(answers: Record<string, any>): Record<string, string[]> {
    const data: Record<string, string[]> = {};
    
    for (let i = 1; i <= 5; i++) {
      const key = `evidence_arg${i}`;
      if (answers[key]) {
        data[`argument${i}`] = answers[key]
          .split(/[,;\n]/)
          .map((e: string) => e.trim())
          .filter((e: string) => e.length > 0);
      }
    }
    
    return data;
  }
  
  private extractLogicalFlow(selection: string): 'deductive' | 'inductive' {
    return selection.toLowerCase().includes('deductive') ? 'deductive' : 'inductive';
  }
  
  private analyzeStructure(pyramid: PyramidStructure, answers: Record<string, any>): any {
    const analysis = {
      hasClearMainPoint: pyramid.mainPoint.length > 20,
      argumentCount: pyramid.keyArguments.length,
      argumentsAreMECE: this.checkMECE(pyramid.keyArguments),
      hasStrongEvidence: this.assessEvidenceStrength(pyramid.supportingData),
      scqComplete: !!(pyramid.situation && pyramid.complication && pyramid.question && pyramid.answer),
      logicalConsistency: this.checkLogicalConsistency(pyramid, answers),
      audienceAlignment: this.checkAudienceAlignment(pyramid, answers)
    };
    
    return analysis;
  }
  
  private checkMECE(arguments: string[]): boolean {
    // Simple check for MECE (Mutually Exclusive, Collectively Exhaustive)
    // Look for overlapping concepts
    const concepts = arguments.map(arg => arg.toLowerCase().split(' '));
    let overlaps = 0;
    
    for (let i = 0; i < concepts.length - 1; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const common = concepts[i].filter(word => 
          concepts[j].includes(word) && word.length > 4
        );
        if (common.length > 2) overlaps++;
      }
    }
    
    return overlaps === 0;
  }
  
  private assessEvidenceStrength(supportingData: Record<string, string[]>): boolean {
    const totalEvidence = Object.values(supportingData)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    return totalEvidence >= 3; // At least 3 pieces of evidence
  }
  
  private checkLogicalConsistency(pyramid: PyramidStructure, answers: Record<string, any>): boolean {
    // Check if logical flow matches the structure
    if (pyramid.logicalFlow === 'deductive') {
      // Deductive should move from general to specific
      return pyramid.keyArguments.some(arg => 
        arg.toLowerCase().includes('therefore') || 
        arg.toLowerCase().includes('thus')
      );
    } else {
      // Inductive should show pattern from examples
      return pyramid.keyArguments.length >= 3; // Multiple examples needed
    }
  }
  
  private checkAudienceAlignment(pyramid: PyramidStructure, answers: Record<string, any>): boolean {
    if (!answers.audience) return false;
    
    const audienceConcerns = answers.audience.toLowerCase();
    const mainPoint = pyramid.mainPoint.toLowerCase();
    
    // Check if main point addresses audience concerns
    const keywords = ['cost', 'time', 'quality', 'risk', 'benefit', 'value', 'impact'];
    
    return keywords.some(keyword => 
      audienceConcerns.includes(keyword) && mainPoint.includes(keyword)
    );
  }
  
  private generateInsights(
    pyramid: PyramidStructure, 
    analysis: any, 
    answers: Record<string, any>
  ): string[] {
    const insights: string[] = [];
    
    // SCQ insights
    if (analysis.scqComplete) {
      insights.push('Complete SCQ framework provides strong narrative structure');
    } else {
      insights.push('Incomplete SCQ framework may weaken message impact');
    }
    
    // Main point insights
    if (answers.one_liner && answers.one_liner.split(' ').length <= 15) {
      insights.push('Concise one-liner ensures message memorability');
    }
    
    // Argument insights
    if (analysis.argumentCount >= 3 && analysis.argumentCount <= 5) {
      insights.push('Optimal number of arguments (3-5) for retention');
    } else if (analysis.argumentCount > 5) {
      insights.push('Too many arguments may dilute message focus');
    }
    
    // MECE insights
    if (analysis.argumentsAreMECE) {
      insights.push('MECE arguments provide comprehensive, non-overlapping coverage');
    } else {
      insights.push('Overlapping arguments may confuse or weaken the message');
    }
    
    // Logic insights
    if (pyramid.logicalFlow === 'deductive' && analysis.logicalConsistency) {
      insights.push('Deductive reasoning provides strong logical foundation');
    } else if (pyramid.logicalFlow === 'inductive' && pyramid.keyArguments.length >= 3) {
      insights.push('Inductive approach builds compelling pattern from examples');
    }
    
    // Audience insights
    if (analysis.audienceAlignment) {
      insights.push('Message directly addresses audience priorities');
    } else {
      insights.push('Consider aligning message more closely with audience concerns');
    }
    
    return insights;
  }
  
  private generateRecommendations(
    pyramid: PyramidStructure,
    analysis: any,
    answers: Record<string, any>
  ): string[] {
    const recommendations: string[] = [];
    
    // Structure recommendations
    if (!analysis.scqComplete) {
      if (!pyramid.situation) recommendations.push('Add clear situation context');
      if (!pyramid.complication) recommendations.push('Identify the complication driving action');
      if (!pyramid.question) recommendations.push('Clarify the implied question');
    }
    
    // Argument recommendations
    if (!analysis.argumentsAreMECE) {
      recommendations.push('Review arguments for overlap - ensure MECE structure');
    }
    
    if (analysis.argumentCount < 3) {
      recommendations.push('Add more supporting arguments for stronger case');
    } else if (analysis.argumentCount > 5) {
      recommendations.push('Consolidate arguments to 3-5 strongest points');
    }
    
    // Evidence recommendations
    if (!analysis.hasStrongEvidence) {
      recommendations.push('Strengthen with more concrete evidence and data');
    }
    
    // Grouping recommendations
    const grouping = answers.grouping_logic;
    if (grouping === 'Importance - Ranked by priority') {
      recommendations.push('Ensure first argument is truly the most impactful');
    } else if (grouping === 'Time - Chronological sequence') {
      recommendations.push('Consider if chronological order is most persuasive');
    }
    
    // Objection handling
    if (answers.objections) {
      recommendations.push('Proactively address objections within main arguments');
    }
    
    // Communication recommendations
    recommendations.push('Test one-liner with target audience for clarity');
    recommendations.push('Prepare 30-second elevator pitch using pyramid structure');
    
    return recommendations;
  }
  
  private generateNextSteps(pyramid: PyramidStructure, answers: Record<string, any>): string[] {
    const steps: string[] = [];
    
    // Document creation
    steps.push('Create executive summary using pyramid structure');
    steps.push('Develop slide deck with one slide per key argument');
    
    // Testing and refinement
    steps.push('Test message with sample audience member');
    steps.push('Refine based on feedback, maintaining pyramid structure');
    
    // Supporting materials
    if (pyramid.supportingData && Object.keys(pyramid.supportingData).length > 0) {
      steps.push('Compile evidence appendix for detailed support');
    }
    
    // Delivery preparation
    steps.push('Practice delivering main point in under 30 seconds');
    steps.push('Prepare responses to anticipated objections');
    
    // Action items
    if (answers.next_steps) {
      steps.push('Create detailed action plan from next steps');
    }
    
    return steps;
  }
  
  private createCommunicationTemplates(pyramid: PyramidStructure, answers: Record<string, any>): any {
    return {
      executiveSummary: this.createExecutiveSummary(pyramid, answers),
      emailTemplate: this.createEmailTemplate(pyramid, answers),
      presentationOutline: this.createPresentationOutline(pyramid),
      elevatorPitch: this.createElevatorPitch(pyramid, answers)
    };
  }
  
  private createExecutiveSummary(pyramid: PyramidStructure, answers: Record<string, any>): string {
    return `EXECUTIVE SUMMARY

Situation: ${pyramid.situation}

Complication: ${pyramid.complication}

Recommendation: ${pyramid.answer}

Key Points:
${pyramid.keyArguments.map((arg, i) => `${i + 1}. ${arg}`).join('\n')}

Next Steps: ${answers.next_steps || 'To be determined'}`;
  }
  
  private createEmailTemplate(pyramid: PyramidStructure, answers: Record<string, any>): string {
    return `Subject: ${answers.one_liner || pyramid.mainPoint.substring(0, 50)}

${pyramid.situation}

However, ${pyramid.complication.toLowerCase()}

${pyramid.mainPoint}

This recommendation is based on:
${pyramid.keyArguments.map((arg, i) => `• ${arg}`).join('\n')}

Next steps:
${answers.next_steps || '• Review and approve recommendation\n• Begin implementation'}

Please let me know if you need additional information.`;
  }
  
  private createPresentationOutline(pyramid: PyramidStructure): string {
    return `PRESENTATION OUTLINE

Slide 1: Title
- ${pyramid.mainPoint}

Slide 2: Situation & Complication
- Current state: ${pyramid.situation.substring(0, 100)}...
- Challenge: ${pyramid.complication.substring(0, 100)}...

Slide 3: Recommendation
- ${pyramid.answer}

${pyramid.keyArguments.map((arg, i) => 
  `Slide ${i + 4}: Key Point ${i + 1}\n- ${arg}\n- Supporting evidence`
).join('\n\n')}

Final Slide: Next Steps & Questions`;
  }
  
  private createElevatorPitch(pyramid: PyramidStructure, answers: Record<string, any>): string {
    const oneLiner = answers.one_liner || pyramid.mainPoint;
    const firstArg = pyramid.keyArguments[0] || '';
    
    return `"${oneLiner} 

Why? ${firstArg}

The impact will be significant, and we should ${answers.next_steps?.substring(0, 50) || 'act now'}."

(Delivered in 30 seconds)`;
  }
  
  private calculateClarityScore(pyramid: PyramidStructure, analysis: any): number {
    let score = 0;
    
    // SCQ completeness (0.3)
    if (analysis.scqComplete) score += 0.3;
    else score += 0.3 * (Object.values({
      s: pyramid.situation,
      c: pyramid.complication,
      q: pyramid.question,
      a: pyramid.answer
    }).filter(Boolean).length / 4);
    
    // Argument quality (0.3)
    if (analysis.argumentsAreMECE) score += 0.15;
    if (analysis.argumentCount >= 3 && analysis.argumentCount <= 5) score += 0.15;
    
    // Evidence strength (0.2)
    if (analysis.hasStrongEvidence) score += 0.2;
    
    // Logical consistency (0.1)
    if (analysis.logicalConsistency) score += 0.1;
    
    // Audience alignment (0.1)
    if (analysis.audienceAlignment) score += 0.1;
    
    return Math.min(score, 1);
  }
  
  private parseObjections(input: string): string[] {
    if (!input) return [];
    
    return input
      .split(/[;\n]/)
      .map(obj => obj.trim())
      .filter(obj => obj.length > 0);
  }
  
  getTemplate(): string {
    return `# Pyramid Principle Structure

## SCQ Framework

### Situation
[Context everyone agrees on]

### Complication  
[What has changed or gone wrong]

### Question
[What should we do?]

### Answer (Main Point)
[Your key message/recommendation]

## One-Liner
[Single memorable sentence]

## Pyramid Structure

### TOP: Main Point
[Your answer/recommendation]

### MIDDLE: Key Arguments (3-5)
1. [Most important argument]
   - Evidence: [Data/facts]
   - Evidence: [Examples]

2. [Second argument]
   - Evidence: [Data/facts]
   - Evidence: [Examples]

3. [Third argument]
   - Evidence: [Data/facts]
   - Evidence: [Examples]

### Logical Flow
[Deductive: General → Specific → Conclusion]
[Inductive: Examples → Pattern → Conclusion]

## Grouping Logic
[Time | Structure | Importance | Process]

## Anticipated Objections
- Objection: [Concern]
  Response: [Counter-argument]

## Audience Considerations
- Primary audience: [Who]
- Key concerns: [What they care about]
- How message addresses concerns: [Alignment]

## Communication Outputs

### Executive Summary
[1-page summary using structure]

### Elevator Pitch
[30-second version]

### Email Template
[Brief email using structure]

## Next Steps
1. [Immediate action]
2. [Follow-up action]
3. [Long-term action]`;
  }
  
  getEstimatedTime(): number {
    return 20; // 20 minutes to structure communication properly
  }
  
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'intermediate'; // Requires understanding of logical structure
  }
}