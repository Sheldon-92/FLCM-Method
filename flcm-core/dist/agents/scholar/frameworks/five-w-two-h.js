"use strict";
/**
 * 5W2H Framework
 * Comprehensive investigation framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiveW2HFramework = void 0;
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('FiveW2HFramework');
class FiveW2HFramework {
    /**
     * Analyze content using 5W2H framework
     */
    async analyze(content) {
        try {
            logger.debug('Applying 5W2H framework analysis');
            return {
                what: this.extractWhat(content),
                when: this.extractWhen(content),
                where: this.extractWhere(content),
                who: this.extractWho(content),
                why: this.extractWhy(content),
                how: this.extractHow(content),
                howMuch: this.extractHowMuch(content),
            };
        }
        catch (error) {
            logger.error('5W2H analysis failed:', error);
            throw error;
        }
    }
    extractWhat(content) {
        const results = [];
        const sentences = content.split(/[.!?]+/);
        // Look for definition patterns
        const patterns = [
            /is a|is an|refers to|means|defined as/i,
            /concept|idea|process|system|method/i,
        ];
        for (const sentence of sentences) {
            for (const pattern of patterns) {
                if (pattern.test(sentence)) {
                    results.push(sentence.trim().substring(0, 150));
                    break;
                }
            }
        }
        return results.slice(0, 3);
    }
    extractWhen(content) {
        const results = [];
        // Time-related patterns
        const timePatterns = [
            /\d{4}/g,
            /(january|february|march|april|may|june|july|august|september|october|november|december)/gi,
            /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
            /today|tomorrow|yesterday|now|later|soon|recently/gi,
            /morning|afternoon|evening|night/gi,
            /\d+\s*(hours?|minutes?|days?|weeks?|months?|years?)/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of timePatterns) {
                if (pattern.test(sentence)) {
                    results.push(`Timing: ${sentence.trim().substring(0, 100)}`);
                    break;
                }
            }
        }
        return results.slice(0, 3);
    }
    extractWhere(content) {
        const results = [];
        // Location patterns
        const locationPatterns = [
            /in\s+[A-Z][a-z]+/g,
            /at\s+[A-Z][a-z]+/g,
            /location|place|site|area|region|country|city/gi,
            /online|offline|remote|local|global/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of locationPatterns) {
                if (pattern.test(sentence)) {
                    results.push(`Location: ${sentence.trim().substring(0, 100)}`);
                    break;
                }
            }
        }
        return results.slice(0, 3);
    }
    extractWho(content) {
        const results = [];
        // People/entity patterns
        const whoPatterns = [
            /[A-Z][a-z]+\s+[A-Z][a-z]+/g,
            /team|group|organization|company|department/gi,
            /user|customer|client|stakeholder|employee/gi,
            /he|she|they|we|I/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of whoPatterns) {
                if (pattern.test(sentence)) {
                    const match = sentence.match(pattern);
                    if (match) {
                        results.push(`Involved: ${match[0]} - ${sentence.trim().substring(0, 80)}`);
                    }
                    break;
                }
            }
        }
        return [...new Set(results)].slice(0, 3);
    }
    extractWhy(content) {
        const results = [];
        // Reason patterns
        const whyPatterns = [
            /because|since|due to|owing to|as a result|therefore/gi,
            /reason|cause|purpose|goal|objective|aim/gi,
            /in order to|so that|to achieve|to ensure/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of whyPatterns) {
                if (pattern.test(sentence)) {
                    results.push(`Reason: ${sentence.trim().substring(0, 120)}`);
                    break;
                }
            }
        }
        return results.slice(0, 3);
    }
    extractHow(content) {
        const results = [];
        // Method patterns
        const howPatterns = [
            /by\s+\w+ing/gi,
            /through|via|using|with|method|process|procedure/gi,
            /step\s+\d|first|second|then|next|finally/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of howPatterns) {
                if (pattern.test(sentence)) {
                    results.push(`Method: ${sentence.trim().substring(0, 120)}`);
                    break;
                }
            }
        }
        return results.slice(0, 3);
    }
    extractHowMuch(content) {
        const results = [];
        // Quantity patterns
        const quantityPatterns = [
            /\d+%/g,
            /\$\d+/g,
            /\d+\s*(million|billion|thousand|hundred)/gi,
            /many|few|several|numerous|multiple|single/gi,
            /all|none|some|most|majority|minority/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of quantityPatterns) {
                if (pattern.test(sentence)) {
                    const match = sentence.match(pattern);
                    if (match) {
                        results.push(`Quantity: ${match[0]} - ${sentence.trim().substring(0, 80)}`);
                    }
                    break;
                }
            }
        }
        return [...new Set(results)].slice(0, 3);
    }
    /**
     * Extract insights from 5W2H results
     */
    extractInsights(results) {
        const insights = [];
        const categories = [
            { key: 'what', label: 'Core concept' },
            { key: 'who', label: 'Key stakeholder' },
            { key: 'why', label: 'Primary reason' },
            { key: 'how', label: 'Main method' },
            { key: 'when', label: 'Timeline' },
            { key: 'where', label: 'Location' },
            { key: 'howMuch', label: 'Scale' },
        ];
        for (const { key, label } of categories) {
            const items = results[key];
            if (items && items.length > 0) {
                insights.push(`${label}: ${items[0]}`);
            }
        }
        return insights.slice(0, 5);
    }
}
exports.FiveW2HFramework = FiveW2HFramework;
//# sourceMappingURL=five-w-two-h.js.map