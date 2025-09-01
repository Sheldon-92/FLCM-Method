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
export declare abstract class BaseFramework {
    name: string;
    description: string;
    version: string;
    category: string;
    tags: string[];
    constructor();
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
    isApplicable(context: FrameworkContext): boolean;
    /**
     * Get framework metadata
     */
    getMetadata(): Record<string, any>;
    /**
     * Export framework results to markdown
     */
    exportToMarkdown(output: FrameworkOutput, context?: FrameworkContext): string;
    /**
     * Get estimated completion time in minutes
     */
    getEstimatedTime(): number;
    /**
     * Get framework difficulty level
     */
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
/**
 * Framework with progressive depth
 */
export declare abstract class ProgressiveFramework extends BaseFramework {
    protected maxDepth: number;
    protected currentDepth: number;
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
    getProgressiveQuestions(context?: FrameworkContext, previousAnswers?: Record<string, any>): Promise<FrameworkQuestion[]>;
    resetDepth(): void;
}
