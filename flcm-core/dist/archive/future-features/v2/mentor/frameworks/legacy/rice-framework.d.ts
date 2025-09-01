/**
 * RICE Framework
 * Ported from FLCM 1.0 Collector Agent
 * Prioritization framework for content ideas
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class RICEFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    getTemplate(): string;
    private getPriorityLevel;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
