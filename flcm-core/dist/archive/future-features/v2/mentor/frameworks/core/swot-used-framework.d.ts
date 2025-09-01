/**
 * SWOT-USED Framework
 * Enhanced SWOT analysis with actionable strategies
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class SWOTUSEDFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    private parseListInput;
    private generateUseStrategies;
    private generateStopStrategies;
    private generateExploitStrategies;
    private generateDefendStrategies;
    private generateInsights;
    private generateRecommendations;
    private generateNextSteps;
    private calculateStrategicPosition;
    private calculateConfidence;
    private areRelated;
    private summarize;
    private extractMissing;
    private extractProblem;
    private extractRiskProfile;
    getTemplate(): string;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
