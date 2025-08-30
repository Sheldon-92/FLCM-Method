/**
 * Hashtag Generator Methodology
 * Generates relevant, trending, and platform-optimized hashtags
 */
export interface HashtagSet {
    primary: string[];
    secondary: string[];
    trending: string[];
    branded: string[];
    platform: string;
    totalCount: number;
    relevanceScore: number;
}
export interface HashtagConfig {
    platform: string;
    limit: number;
    style: 'lowercase' | 'camelCase' | 'mixed';
    includeNumbers: boolean;
    includeTrending: boolean;
}
export declare class HashtagGenerator {
    private trendingHashtags;
    private platformStyles;
    constructor();
    generate(content: string, keywords: string[], platform: string, brandTags?: string[]): HashtagSet;
    private extractPrimaryHashtags;
    private generateSecondaryHashtags;
    private getTrendingHashtags;
    private processBrandHashtags;
    private formatHashtag;
    private toCamelCase;
    private extractImportantPhrases;
    private identifyThemes;
    private identifyCategories;
    private getRelatedHashtags;
    private combineAndLimit;
    private calculateRelevance;
    generateForLinkedIn(content: string, keywords: string[]): string[];
    generateForTwitter(content: string, keywords: string[]): string[];
    generateForXiaohongshu(content: string, keywords: string[]): string[];
}
export default HashtagGenerator;
//# sourceMappingURL=hashtag-generator.d.ts.map