/**
 * Zhihu (知乎) Platform Adapter
 * Knowledge-focused, professional, in-depth content
 */
import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
export declare class ZhihuAdapter implements PlatformAdapter {
    readonly platform: "zhihu";
    private readonly maxLength;
    adapt(content: ContentDocument): Promise<PlatformContent>;
    optimize(content: PlatformContent): Promise<PlatformContent>;
    generateHashtags(content: string): string[];
    suggestVisuals(content: string): VisualRecommendation[];
    getOptimalTime(): string;
    private createProfessionalTitle;
    private enhanceWithDepth;
    private addReferences;
    private addTableOfContents;
    private optimizeLength;
    private extractKeywords;
    private calculateOptimizationScore;
}
