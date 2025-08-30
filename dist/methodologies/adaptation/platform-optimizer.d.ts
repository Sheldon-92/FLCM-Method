/**
 * Platform Optimizer Methodology
 * Optimizes content for specific platform requirements and best practices
 */
export interface PlatformConfig {
    name: string;
    maxChars: number;
    idealLength: number;
    hashtagLimit: number;
    emojiUsage: 'none' | 'low' | 'moderate' | 'high' | 'very_high';
    formatting: string[];
    engagementElements: string[];
}
export interface OptimizationResult {
    platform: string;
    optimizedContent: string;
    characterCount: number;
    trimmed: boolean;
    restructured: boolean;
    formattingApplied: string[];
    engagementScore: number;
    suggestions: string[];
}
export declare class PlatformOptimizer {
    private platforms;
    constructor();
    optimize(content: string, platform: string, keyMessage: string): OptimizationResult;
    private trimContent;
    private formatForLinkedIn;
    private formatForWeChat;
    private formatForTwitter;
    private formatForXiaohongshu;
    private addEngagementElements;
    private addEmojis;
    private generateSuggestions;
    private calculateEngagementScore;
}
export default PlatformOptimizer;
//# sourceMappingURL=platform-optimizer.d.ts.map