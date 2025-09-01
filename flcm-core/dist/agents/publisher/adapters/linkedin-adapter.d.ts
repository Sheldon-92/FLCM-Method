/**
 * LinkedIn Platform Adapter
 * Professional networking and business-focused content
 */
import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
export declare class LinkedInAdapter implements PlatformAdapter {
    readonly platform: "linkedin";
    private readonly maxLength;
    adapt(content: ContentDocument): Promise<PlatformContent>;
    optimize(content: PlatformContent): Promise<PlatformContent>;
    generateHashtags(content: string): string[];
    suggestVisuals(content: string): VisualRecommendation[];
    getOptimalTime(): string;
    private createProfessionalTitle;
    private transformToProfessional;
    private addBusinessContext;
    private optimizeLength;
    private extractKeywords;
    private calculateOptimizationScore;
}
