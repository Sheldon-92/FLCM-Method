/**
 * Voice DNA Framework
 * Ported from FLCM 1.0 Creator Agent
 * Discover and maintain authentic content voice
 */
import { BaseFramework, FrameworkQuestion, FrameworkContext, FrameworkOutput } from '../base';
export declare class VoiceDNAFramework extends BaseFramework {
    constructor();
    getIntroduction(context?: FrameworkContext): string;
    getQuestions(context?: FrameworkContext): FrameworkQuestion[];
    process(answers: Record<string, any>, context?: FrameworkContext): Promise<FrameworkOutput>;
    getTemplate(): string;
    private analyzeNaturalVoice;
    private extractTone;
    private extractFormality;
    private extractHumor;
    private parseTraits;
    private parseValues;
    private parseAvoidList;
    private generateVoiceGuidelines;
    private calculateVoiceClarity;
    getEstimatedTime(): number;
    getDifficulty(): 'beginner' | 'intermediate' | 'advanced';
}
