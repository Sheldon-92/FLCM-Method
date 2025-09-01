"use strict";
/**
 * SWOT-USED Framework
 * Comprehensive analysis framework combining SWOT with USED methodology
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWOTUSEDFramework = void 0;
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('SWOTUSEDFramework');
class SWOTUSEDFramework {
    /**
     * Analyze content using SWOT-USED framework
     */
    async analyze(content) {
        try {
            logger.debug('Applying SWOT-USED framework analysis');
            // Extract key concepts and entities
            const concepts = this.extractConcepts(content);
            // Perform SWOT analysis
            const swotAnalysis = this.performSWOTAnalysis(content, concepts);
            // Perform USED analysis
            const usedAnalysis = this.performUSEDAnalysis(content, concepts);
            return {
                ...swotAnalysis,
                ...usedAnalysis,
            };
        }
        catch (error) {
            logger.error('SWOT-USED analysis failed:', error);
            throw error;
        }
    }
    /**
     * Extract key concepts from content
     */
    extractConcepts(content) {
        // Simple keyword extraction - in production, use NLP
        const words = content.toLowerCase().split(/\s+/);
        const wordFreq = new Map();
        // Count word frequency
        for (const word of words) {
            if (word.length > 4 && !this.isStopWord(word)) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        }
        // Get top concepts
        return Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);
    }
    /**
     * Check if word is a stop word
     */
    isStopWord(word) {
        const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those', 'which', 'where', 'when', 'what'];
        return stopWords.includes(word);
    }
    /**
     * Perform SWOT analysis
     */
    performSWOTAnalysis(content, concepts) {
        const contentLower = content.toLowerCase();
        // Strength indicators
        const strengthPatterns = [
            /advantage|strength|benefit|positive|excellent|superior|robust|powerful/gi,
            /innovative|efficient|effective|successful|proven|reliable/gi,
        ];
        // Weakness indicators  
        const weaknessPatterns = [
            /disadvantage|weakness|limitation|negative|poor|inferior|fragile/gi,
            /inefficient|ineffective|unsuccessful|unreliable|complex|difficult/gi,
        ];
        // Opportunity indicators
        const opportunityPatterns = [
            /opportunity|potential|growth|expand|future|emerging|trend/gi,
            /market|demand|innovation|development|improvement/gi,
        ];
        // Threat indicators
        const threatPatterns = [
            /threat|risk|challenge|competition|obstacle|barrier|concern/gi,
            /decline|loss|danger|vulnerability|instability/gi,
        ];
        return {
            strengths: this.extractPatternMatches(content, strengthPatterns, concepts),
            weaknesses: this.extractPatternMatches(content, weaknessPatterns, concepts),
            opportunities: this.extractPatternMatches(content, opportunityPatterns, concepts),
            threats: this.extractPatternMatches(content, threatPatterns, concepts),
        };
    }
    /**
     * Perform USED analysis
     */
    performUSEDAnalysis(content, concepts) {
        // Unique indicators
        const uniquePatterns = [
            /unique|distinctive|exclusive|original|novel|unprecedented/gi,
            /first|only|singular|special|uncommon/gi,
        ];
        // Similar indicators
        const similarPatterns = [
            /similar|like|comparable|equivalent|parallel|analogous/gi,
            /common|standard|typical|conventional|traditional/gi,
        ];
        // Extension indicators
        const extendPatterns = [
            /extend|expand|enhance|augment|amplify|broaden/gi,
            /scale|grow|develop|evolve|advance/gi,
        ];
        // Different indicators
        const differentPatterns = [
            /different|alternative|contrast|divergent|distinct/gi,
            /change|modify|transform|reimagine|reinvent/gi,
        ];
        return {
            unique: this.extractPatternMatches(content, uniquePatterns, concepts),
            similar: this.extractPatternMatches(content, similarPatterns, concepts),
            extend: this.extractPatternMatches(content, extendPatterns, concepts),
            different: this.extractPatternMatches(content, differentPatterns, concepts),
        };
    }
    /**
     * Extract matches based on patterns
     */
    extractPatternMatches(content, patterns, concepts) {
        const matches = new Set();
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of patterns) {
                if (pattern.test(sentence)) {
                    // Extract the most relevant part of the sentence
                    const relevantPart = this.extractRelevantPart(sentence, concepts);
                    if (relevantPart) {
                        matches.add(relevantPart);
                    }
                    break; // One match per sentence is enough
                }
            }
        }
        return Array.from(matches).slice(0, 5); // Limit to 5 items per category
    }
    /**
     * Extract the most relevant part of a sentence
     */
    extractRelevantPart(sentence, concepts) {
        sentence = sentence.trim();
        // If sentence is short enough, return as is
        if (sentence.length < 100) {
            return sentence;
        }
        // Try to find the part with the most concepts
        const words = sentence.split(/\s+/);
        let bestStart = 0;
        let bestEnd = Math.min(20, words.length);
        let maxConcepts = 0;
        for (let i = 0; i < words.length - 10; i++) {
            const segment = words.slice(i, i + 20).join(' ').toLowerCase();
            const conceptCount = concepts.filter(c => segment.includes(c)).length;
            if (conceptCount > maxConcepts) {
                maxConcepts = conceptCount;
                bestStart = i;
                bestEnd = Math.min(i + 20, words.length);
            }
        }
        return words.slice(bestStart, bestEnd).join(' ');
    }
    /**
     * Extract insights from SWOT-USED results
     */
    extractInsights(results) {
        const insights = [];
        // Generate insights based on analysis
        if (results.strengths.length > 0) {
            insights.push(`Key strengths identified: ${results.strengths[0]}`);
        }
        if (results.weaknesses.length > 0) {
            insights.push(`Primary weakness to address: ${results.weaknesses[0]}`);
        }
        if (results.opportunities.length > 0) {
            insights.push(`Major opportunity: ${results.opportunities[0]}`);
        }
        if (results.threats.length > 0) {
            insights.push(`Critical threat to monitor: ${results.threats[0]}`);
        }
        if (results.unique.length > 0) {
            insights.push(`Unique differentiator: ${results.unique[0]}`);
        }
        if (results.extend.length > 0) {
            insights.push(`Extension potential: ${results.extend[0]}`);
        }
        return insights;
    }
}
exports.SWOTUSEDFramework = SWOTUSEDFramework;
//# sourceMappingURL=swot-used.js.map