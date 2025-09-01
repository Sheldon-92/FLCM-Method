/**
 * Teaching Preparation Framework
 * Ported from FLCM 1.0 Scholar Agent
 * Feynman-inspired framework for deep understanding
 */
import { ProgressiveFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class TeachingPreparationFramework extends ProgressiveFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    getQuestionsForDepth(depth: number, context?: FrameworkContext): FrameworkQuestion[];
    shouldGoDeeper(answers: Record<string, any>, depth: number): boolean;
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    getTemplate(): string;
    private calculateUnderstandingLevel;
    private getFeynmanLevel;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
