"use strict";
/**
 * Hashtag Generator Methodology
 * Generates relevant, trending, and platform-optimized hashtags
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagGenerator = void 0;
class HashtagGenerator {
    constructor() {
        // Simulated trending hashtags by category
        this.trendingHashtags = new Map([
            ['tech', ['#AI', '#Innovation', '#TechTrends', '#DigitalTransformation', '#FutureOfWork']],
            ['marketing', ['#ContentMarketing', '#DigitalMarketing', '#MarketingStrategy', '#GrowthHacking', '#BrandBuilding']],
            ['business', ['#Leadership', '#Entrepreneurship', '#BusinessGrowth', '#StartupLife', '#Success']],
            ['lifestyle', ['#LifeHacks', '#Wellness', '#Productivity', '#SelfImprovement', '#MondayMotivation']],
            ['creative', ['#CreativeLife', '#Design', '#Storytelling', '#ContentCreator', '#Inspiration']]
        ]);
        this.platformStyles = new Map([
            ['linkedin', {
                    platform: 'linkedin',
                    limit: 5,
                    style: 'camelCase',
                    includeNumbers: false,
                    includeTrending: true
                }],
            ['twitter', {
                    platform: 'twitter',
                    limit: 2,
                    style: 'lowercase',
                    includeNumbers: true,
                    includeTrending: true
                }],
            ['xiaohongshu', {
                    platform: 'xiaohongshu',
                    limit: 10,
                    style: 'mixed',
                    includeNumbers: true,
                    includeTrending: true
                }],
            ['wechat', {
                    platform: 'wechat',
                    limit: 0,
                    style: 'mixed',
                    includeNumbers: false,
                    includeTrending: false
                }]
        ]);
    }
    generate(content, keywords, platform, brandTags) {
        const config = this.platformStyles.get(platform.toLowerCase()) || {
            platform: platform,
            limit: 5,
            style: 'mixed',
            includeNumbers: false,
            includeTrending: true
        };
        // Extract primary hashtags from keywords and content
        const primary = this.extractPrimaryHashtags(content, keywords, config);
        // Generate secondary supporting hashtags
        const secondary = this.generateSecondaryHashtags(primary, content, config);
        // Get trending hashtags if applicable
        const trending = config.includeTrending ?
            this.getTrendingHashtags(content, keywords) : [];
        // Process brand hashtags
        const branded = brandTags ?
            this.processBrandHashtags(brandTags, config) : [];
        // Combine and limit hashtags
        const combined = this.combineAndLimit(primary, secondary, trending, branded, config.limit);
        // Calculate relevance score
        const relevanceScore = this.calculateRelevance(combined, content, keywords);
        return {
            primary: combined.primary,
            secondary: combined.secondary,
            trending: combined.trending,
            branded: combined.branded,
            platform: config.platform,
            totalCount: combined.primary.length + combined.secondary.length +
                combined.trending.length + combined.branded.length,
            relevanceScore
        };
    }
    extractPrimaryHashtags(content, keywords, config) {
        const hashtags = [];
        // Convert keywords to hashtags
        for (const keyword of keywords) {
            const hashtag = this.formatHashtag(keyword, config.style);
            if (hashtag && hashtag.length > 2 && hashtag.length < 30) {
                hashtags.push(hashtag);
            }
        }
        // Extract important phrases from content
        const importantPhrases = this.extractImportantPhrases(content);
        for (const phrase of importantPhrases) {
            const hashtag = this.formatHashtag(phrase, config.style);
            if (hashtag && !hashtags.includes(hashtag)) {
                hashtags.push(hashtag);
            }
        }
        return hashtags.slice(0, Math.ceil(config.limit * 0.4)); // 40% of limit for primary
    }
    generateSecondaryHashtags(primary, content, config) {
        const secondary = [];
        // Analyze content for themes
        const themes = this.identifyThemes(content);
        // Generate related hashtags for each theme
        for (const theme of themes) {
            const related = this.getRelatedHashtags(theme);
            for (const tag of related) {
                if (!primary.includes(tag) && !secondary.includes(tag)) {
                    secondary.push(this.formatHashtag(tag.replace('#', ''), config.style));
                }
            }
        }
        return secondary.slice(0, Math.ceil(config.limit * 0.3)); // 30% for secondary
    }
    getTrendingHashtags(content, keywords) {
        const trending = [];
        const categories = this.identifyCategories(content, keywords);
        for (const category of categories) {
            const categoryTrending = this.trendingHashtags.get(category) || [];
            trending.push(...categoryTrending);
        }
        return [...new Set(trending)].slice(0, 3); // Max 3 trending
    }
    processBrandHashtags(brandTags, config) {
        return brandTags.map(tag => this.formatHashtag(tag, config.style));
    }
    formatHashtag(text, style) {
        // Clean the text
        let cleaned = text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
        if (!cleaned)
            return '';
        switch (style) {
            case 'lowercase':
                cleaned = cleaned.toLowerCase();
                break;
            case 'camelCase':
                cleaned = this.toCamelCase(cleaned);
                break;
            case 'mixed':
                // Keep original casing
                break;
        }
        return '#' + cleaned;
    }
    toCamelCase(text) {
        const words = text.split(/(?=[A-Z])|[\s_-]/);
        return words.map((word, index) => {
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join('');
    }
    extractImportantPhrases(content) {
        const phrases = [];
        // Extract capitalized phrases (likely important)
        const capitalizedMatches = content.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
        phrases.push(...capitalizedMatches);
        // Extract phrases in quotes
        const quotedMatches = content.match(/"([^"]+)"/g) || [];
        phrases.push(...quotedMatches.map(q => q.replace(/"/g, '')));
        // Extract bold text (markdown)
        const boldMatches = content.match(/\*\*([^*]+)\*\*/g) || [];
        phrases.push(...boldMatches.map(b => b.replace(/\*/g, '')));
        return phrases;
    }
    identifyThemes(content) {
        const themes = [];
        const contentLower = content.toLowerCase();
        const themeKeywords = {
            'innovation': ['innovation', 'innovate', 'disrupt', 'transform'],
            'growth': ['growth', 'scale', 'expand', 'increase'],
            'strategy': ['strategy', 'plan', 'approach', 'framework'],
            'success': ['success', 'achieve', 'accomplish', 'win'],
            'learning': ['learn', 'educate', 'teach', 'knowledge']
        };
        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            if (keywords.some(keyword => contentLower.includes(keyword))) {
                themes.push(theme);
            }
        }
        return themes;
    }
    identifyCategories(content, keywords) {
        const categories = [];
        const combinedText = (content + ' ' + keywords.join(' ')).toLowerCase();
        const categoryKeywords = {
            'tech': ['technology', 'ai', 'software', 'digital', 'data', 'algorithm'],
            'marketing': ['marketing', 'brand', 'content', 'campaign', 'audience'],
            'business': ['business', 'company', 'revenue', 'profit', 'enterprise'],
            'lifestyle': ['life', 'wellness', 'health', 'balance', 'mindful'],
            'creative': ['creative', 'design', 'art', 'story', 'create']
        };
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => combinedText.includes(keyword))) {
                categories.push(category);
            }
        }
        return categories.length > 0 ? categories : ['business']; // Default to business
    }
    getRelatedHashtags(theme) {
        const relatedMap = {
            'innovation': ['#Innovation', '#FutureThinking', '#Disruption'],
            'growth': ['#GrowthMindset', '#ScaleUp', '#BusinessGrowth'],
            'strategy': ['#StrategicThinking', '#Planning', '#Execution'],
            'success': ['#SuccessMindset', '#Achievement', '#Goals'],
            'learning': ['#ContinuousLearning', '#Knowledge', '#Education']
        };
        return relatedMap[theme] || [];
    }
    combineAndLimit(primary, secondary, trending, branded, limit) {
        const total = primary.length + secondary.length + trending.length + branded.length;
        if (total <= limit) {
            return { primary, secondary, trending, branded };
        }
        // Prioritize: branded > primary > trending > secondary
        const result = {
            branded: branded.slice(0, Math.min(2, limit)),
            primary: [],
            trending: [],
            secondary: []
        };
        let remaining = limit - result.branded.length;
        result.primary = primary.slice(0, Math.min(primary.length, Math.ceil(remaining * 0.5)));
        remaining -= result.primary.length;
        result.trending = trending.slice(0, Math.min(trending.length, Math.ceil(remaining * 0.6)));
        remaining -= result.trending.length;
        result.secondary = secondary.slice(0, remaining);
        return result;
    }
    calculateRelevance(combined, content, keywords) {
        let score = 0;
        const contentLower = content.toLowerCase();
        const allHashtags = [
            ...combined.primary,
            ...combined.secondary,
            ...combined.trending,
            ...combined.branded
        ];
        for (const hashtag of allHashtags) {
            const tag = hashtag.replace('#', '').toLowerCase();
            // Check if tag appears in content
            if (contentLower.includes(tag)) {
                score += 20;
            }
            // Check if tag relates to keywords
            if (keywords.some(k => k.toLowerCase().includes(tag) || tag.includes(k.toLowerCase()))) {
                score += 15;
            }
        }
        // Normalize to 0-100
        return Math.min(100, Math.round(score / allHashtags.length));
    }
    // Platform-specific generation methods
    generateForLinkedIn(content, keywords) {
        const hashtagSet = this.generate(content, keywords, 'linkedin');
        return [
            ...hashtagSet.primary,
            ...hashtagSet.trending,
            ...hashtagSet.secondary
        ].slice(0, 5);
    }
    generateForTwitter(content, keywords) {
        const hashtagSet = this.generate(content, keywords, 'twitter');
        return [
            ...hashtagSet.primary,
            ...hashtagSet.trending
        ].slice(0, 2);
    }
    generateForXiaohongshu(content, keywords) {
        const hashtagSet = this.generate(content, keywords, 'xiaohongshu');
        // Add Chinese trending tags
        const chineseTrending = ['#生活分享', '#日常', '#分享', '#推荐', '#干货'];
        return [
            ...hashtagSet.primary,
            ...hashtagSet.trending,
            ...chineseTrending,
            ...hashtagSet.secondary
        ].slice(0, 10);
    }
}
exports.HashtagGenerator = HashtagGenerator;
exports.default = HashtagGenerator;
//# sourceMappingURL=hashtag-generator.js.map