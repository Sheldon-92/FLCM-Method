/**
 * SCAMPER Innovation Framework
 * Creative thinking and innovation through systematic questioning
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class SCAMPERFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    private parseIdeas;
    private scoreIdeas;
    private generateInsights;
    private generateRecommendations;
    private generateNextSteps;
    private calculateInnovationScore;
    private calculateConfidence;
    private countTotalIdeas;
    private getCategoryCounts;
    private getMaxCategory;
    private getMinCategory;
    private formatCategoryName;
    private alignsWithGoal;
    private identifyAdaptationSources;
    private getAverageIdeaLength;
    getTemplate(): string;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
