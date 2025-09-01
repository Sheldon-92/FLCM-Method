/**
 * Socratic Questioning Framework
 * Deep understanding through systematic questioning (6 levels)
 */
import { ProgressiveFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class SocraticQuestioningFramework extends ProgressiveFramework {
    private levels;
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    getQuestionsForDepth(depth: number, context?: FrameworkContext): FrameworkQuestion[];
    shouldGoDeeper(answers: Record<string, any>, depth: number): boolean;
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    private analyzeLevels;
    private getAnsweredQuestions;
    private generateLevelInsights;
    private generateInsights;
    private generateRecommendations;
    private generateNextSteps;
    private calculateUnderstandingDepth;
    private extractKeyRealizations;
    private extractAssumptions;
    private extractPerspectives;
    private extractCriticalQuestions;
    private calculateAverageAnswerLength;
    private getSocraticLevel;
    getTemplate(): string;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
