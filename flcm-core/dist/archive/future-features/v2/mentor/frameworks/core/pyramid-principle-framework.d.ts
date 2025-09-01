/**
 * Pyramid Principle Framework
 * Structure thinking and communication for maximum clarity and impact
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class PyramidPrincipleFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    private parseKeyArguments;
    private organizeSupportingData;
    private extractLogicalFlow;
    private analyzeStructure;
    private checkMECE;
    private assessEvidenceStrength;
    private checkLogicalConsistency;
    private checkAudienceAlignment;
    private generateInsights;
    private generateRecommendations;
    private generateNextSteps;
    private createCommunicationTemplates;
    private createExecutiveSummary;
    private createEmailTemplate;
    private createPresentationOutline;
    private createElevatorPitch;
    private calculateClarityScore;
    private parseObjections;
    getTemplate(): string;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
