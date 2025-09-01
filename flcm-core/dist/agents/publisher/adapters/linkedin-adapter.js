"use strict";
/**
 * LinkedIn Platform Adapter
 * Professional networking and business-focused content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInAdapter = void 0;
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('LinkedInAdapter');
class LinkedInAdapter {
    constructor() {
        this.platform = 'linkedin';
        this.maxLength = 2000;
    }
    async adapt(content) {
        logger.debug('Adapting content for LinkedIn');
        const title = this.createProfessionalTitle(content.title);
        let body = this.transformToProfessional(content.content);
        body = this.addBusinessContext(body);
        body = this.optimizeLength(body);
        const hashtags = this.generateHashtags(body);
        const keywords = this.extractKeywords(body);
        const visualSuggestions = this.suggestVisuals(body);
        return {
            platform: this.platform,
            title,
            body,
            hashtags,
            keywords,
            visualSuggestions,
            metadata: {
                length: body.length,
                readingTime: Math.ceil(body.length / 250),
                optimizationScore: this.calculateOptimizationScore(body),
            },
        };
    }
    async optimize(content) {
        // Add professional call-to-action
        if (!content.body.includes('thoughts')) {
            content.body += '\n\nWhat are your thoughts on this? I\'d love to hear your perspectives in the comments.';
        }
        // Ensure professional hashtags
        const professionalTags = ['Leadership', 'Innovation', 'ProfessionalDevelopment'];
        for (const tag of professionalTags) {
            if (!content.hashtags.includes(tag) && content.hashtags.length < 5) {
                content.hashtags.push(tag);
            }
        }
        content.metadata.optimizationScore = this.calculateOptimizationScore(content.body);
        return content;
    }
    generateHashtags(content) {
        const hashtags = [];
        // Industry-specific hashtags
        if (content.includes('AI') || content.includes('technology')) {
            hashtags.push('TechTrends', 'DigitalTransformation');
        }
        if (content.includes('business') || content.includes('strategy')) {
            hashtags.push('BusinessStrategy', 'Leadership');
        }
        if (content.includes('career') || content.includes('growth')) {
            hashtags.push('CareerDevelopment', 'ProfessionalGrowth');
        }
        // General professional hashtags
        hashtags.push('ThoughtLeadership', 'Innovation');
        return hashtags.slice(0, 5);
    }
    suggestVisuals(content) {
        return [
            {
                type: 'cover',
                description: 'Professional header image with corporate aesthetic',
                style: 'corporate-modern',
                elements: ['professional graphics', 'data visualization', 'brand colors'],
            },
            {
                type: 'infographic',
                description: 'Business insights visualization',
                style: 'data-driven',
                elements: ['statistics', 'growth charts', 'key metrics'],
            },
        ];
    }
    getOptimalTime() {
        return '09:00'; // Business hours
    }
    createProfessionalTitle(original) {
        const prefixes = [
            'Key Insights:',
            'Strategic Perspective:',
            'Industry Analysis:',
            ''
        ];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix ? `${prefix} ${original}` : original;
    }
    transformToProfessional(content) {
        // Add professional tone
        let professional = content
            .replace(/�/g, 'significantly')
            .replace(/^8/g, 'extremely')
            .replace(/F/ / g, 'however');
        // Structure with bullet points for key insights
        const paragraphs = professional.split('\n\n');
        return paragraphs.map((p, i) => {
            if (i > 0 && i % 2 === 0 && p.length > 100) {
                // Convert some paragraphs to bullet points
                const sentences = p.split(/[.]/);
                if (sentences.length > 2) {
                    return 'Key takeaways:\n' + sentences
                        .filter(s => s.trim())
                        .slice(0, 3)
                        .map(s => `" ${s.trim()}`)
                        .join('\n');
                }
            }
            return p;
        }).join('\n\n');
    }
    addBusinessContext(content) {
        // Add professional opening if not present
        if (!content.startsWith('In today') && !content.startsWith('As')) {
            content = 'In today\'s dynamic business environment, ' +
                content.charAt(0).toLowerCase() + content.slice(1);
        }
        return content;
    }
    optimizeLength(content) {
        if (content.length > this.maxLength) {
            // Professional truncation
            const truncated = content.substring(0, this.maxLength - 100);
            const lastPeriod = truncated.lastIndexOf('.');
            return truncated.substring(0, lastPeriod + 1) +
                '\n\n[Continue reading for more insights...]';
        }
        return content;
    }
    extractKeywords(content) {
        // Extract business and professional terms
        const businessTerms = [
            'strategy', 'innovation', 'leadership', 'growth', 'digital',
            'transformation', 'analytics', 'optimization', 'efficiency',
            'collaboration', 'development', 'management', 'performance'
        ];
        const found = [];
        const contentLower = content.toLowerCase();
        for (const term of businessTerms) {
            if (contentLower.includes(term)) {
                found.push(term);
            }
        }
        return found.slice(0, 10);
    }
    calculateOptimizationScore(content) {
        let score = 70;
        // Professional language bonus
        if (content.includes('strategic') || content.includes('innovative'))
            score += 5;
        if (content.includes('Key takeaways'))
            score += 5;
        // Engagement elements
        if (content.includes('thoughts') || content.includes('perspectives'))
            score += 10;
        // Hashtag quality
        if (content.includes('#'))
            score += 5;
        // Length optimization
        if (content.length > 500 && content.length < 1500)
            score += 5;
        return Math.min(100, score);
    }
}
exports.LinkedInAdapter = LinkedInAdapter;
//# sourceMappingURL=linkedin-adapter.js.map