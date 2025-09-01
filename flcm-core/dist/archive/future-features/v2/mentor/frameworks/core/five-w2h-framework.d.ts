/**
 * 5W2H Analysis Framework
 * Comprehensive analysis through fundamental questions
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class FiveW2HFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    private extractAnswers;
    private generateInsights;
    private generateRecommendations;
    private generateNextSteps;
    private calculateCompleteness;
    private identifyGaps;
    private identifyRisks;
    private generateExecutiveSummary;
    private extractStakeholders;
    private extractTimeline;
    private extractDate;
    private extractMetrics;
    getTemplate(): string;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
