/**
 * WeChat (��l�) Platform Adapter
 * Story-driven, engaging narrative content
 */
import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
export declare class WechatAdapter implements PlatformAdapter {
    readonly platform: "wechat";
    private readonly maxLength;
    adapt(content: ContentDocument): Promise<PlatformContent>;
    optimize(content: PlatformContent): Promise<PlatformContent>;
    generateHashtags(content: string): string[];
    suggestVisuals(content: string): VisualRecommendation[];
    getOptimalTime(): string;
    private createEngagingTitle;
    private transformToNarrative;
    private addStoryElements;
    private optimizeLength;
    private extractKeywords;
    private calculateOptimizationScore;
}
