/**
 * Xiaohongshu (小红书) Platform Adapter
 * Visual-heavy, emoji-rich, lifestyle-focused content
 */
import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent, VisualRecommendation } from '../index';
export declare class XiaohongshuAdapter implements PlatformAdapter {
    readonly platform: "xiaohongshu";
    private readonly maxLength;
    private readonly optimalHashtagCount;
    private readonly emojiLibrary;
    /**
     * Adapt content for Xiaohongshu
     */
    adapt(content: ContentDocument): Promise<PlatformContent>;
    /**
     * Optimize content for better engagement
     */
    optimize(content: PlatformContent): Promise<PlatformContent>;
    /**
     * Generate hashtags for Xiaohongshu
     */
    generateHashtags(content: string): string[];
    /**
     * Suggest visuals for content
     */
    suggestVisuals(content: string): VisualRecommendation[];
    /**
     * Get optimal posting time
     */
    getOptimalTime(): string;
    /**
     * Create catchy title
     */
    private createCatchyTitle;
    /**
     * Transform content for platform style
     */
    private transformContent;
    /**
     * Add emojis to content
     */
    private addEmojis;
    /**
     * Add more emojis for optimization
     */
    private addMoreEmojis;
    /**
     * Optimize content length
     */
    private optimizeLength;
    /**
     * Extract topics from content
     */
    private extractTopics;
    /**
     * Generate trending hashtags
     */
    private generateTrendingHashtags;
    /**
     * Get lifestyle-related hashtags
     */
    private getLifestyleHashtags;
    /**
     * Extract keywords from content
     */
    private extractKeywords;
    /**
     * Calculate optimization score
     */
    private calculateOptimizationScore;
}
