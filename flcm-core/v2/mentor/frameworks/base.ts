/**
 * Base Framework Interface
 * Standard interface for all FLCM frameworks
 */

export interface FrameworkQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple-choice' | 'scale' | 'boolean';
  required?: boolean;
  options?: string[];
  validation?: (answer: any) => boolean;
  followUp?: string;
}

export interface FrameworkContext {
  topic?: string;
  goal?: string;
  audience?: string;
  previousAnswers?: Record<string, any>;
  userProfile?: any;
  sessionData?: any;
}

export interface FrameworkOutput {
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  data: Record<string, any>;
  confidence: number;
  metadata?: Record<string, any>;
}

export abstract class BaseFramework {
  public name: string;
  public description: string;
  public version: string;
  public category: string;
  public tags: string[];
  
  constructor() {
    this.name = '';
    this.description = '';
    this.version = '1.0';
    this.category = 'general';
    this.tags = [];
  }
  
  /**
   * Get framework introduction for user
   */
  abstract getIntroduction(context?: FrameworkContext): string;
  
  /**
   * Get framework questions based on context
   */
  abstract getQuestions(context?: FrameworkContext): FrameworkQuestion[];
  
  /**
   * Process user input through framework
   */
  abstract process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
  
  /**
   * Get framework template for documentation
   */
  abstract getTemplate(): string;
  
  /**
   * Validate if framework is suitable for context
   */
  isApplicable(context: FrameworkContext): boolean {
    return true; // Default: applicable to all contexts
  }
  
  /**
   * Get framework metadata
   */
  getMetadata(): Record<string, any> {
    return {
      name: this.name,
      description: this.description,
      version: this.version,
      category: this.category,
      tags: this.tags
    };
  }
  
  /**
   * Export framework results to markdown
   */
  exportToMarkdown(output: FrameworkOutput, context?: FrameworkContext): string {
    let markdown = `# ${this.name} Analysis\n\n`;
    
    if (context?.topic) {
      markdown += `**Topic:** ${context.topic}\n\n`;
    }
    
    markdown += `## Insights\n\n`;
    output.insights.forEach(insight => {
      markdown += `- ${insight}\n`;
    });
    
    markdown += `\n## Recommendations\n\n`;
    output.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });
    
    markdown += `\n## Next Steps\n\n`;
    output.nextSteps.forEach((step, index) => {
      markdown += `${index + 1}. ${step}\n`;
    });
    
    markdown += `\n---\n`;
    markdown += `*Generated using ${this.name} Framework v${this.version}*\n`;
    markdown += `*Confidence: ${Math.round(output.confidence * 100)}%*\n`;
    
    return markdown;
  }
  
  /**
   * Get estimated completion time in minutes
   */
  getEstimatedTime(): number {
    return 10; // Default: 10 minutes
  }
  
  /**
   * Get framework difficulty level
   */
  getDifficulty(): 'beginner' | 'intermediate' | 'advanced' {
    return 'intermediate';
  }
}

/**
 * Framework with progressive depth
 */
export abstract class ProgressiveFramework extends BaseFramework {
  protected maxDepth: number = 5;
  protected currentDepth: number = 1;
  
  /**
   * Get questions for current depth level
   */
  abstract getQuestionsForDepth(depth: number, context?: FrameworkContext): FrameworkQuestion[];
  
  /**
   * Determine if should go deeper based on answers
   */
  abstract shouldGoDeeper(answers: Record<string, any>, depth: number): boolean;
  
  /**
   * Progressive question flow
   */
  async getProgressiveQuestions(
    context?: FrameworkContext,
    previousAnswers?: Record<string, any>
  ): Promise<FrameworkQuestion[]> {
    const questions: FrameworkQuestion[] = [];
    
    // Get questions for current depth
    const depthQuestions = this.getQuestionsForDepth(this.currentDepth, context);
    questions.push(...depthQuestions);
    
    // Check if we should provide deeper questions
    if (previousAnswers && this.shouldGoDeeper(previousAnswers, this.currentDepth)) {
      this.currentDepth = Math.min(this.currentDepth + 1, this.maxDepth);
      const nextQuestions = this.getQuestionsForDepth(this.currentDepth, context);
      questions.push(...nextQuestions);
    }
    
    return questions;
  }
  
  resetDepth(): void {
    this.currentDepth = 1;
  }
}