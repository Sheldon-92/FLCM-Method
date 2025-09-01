"use strict";
/**
 * SCAMPER Framework
 * Creative thinking and innovation framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCAMPERFramework = void 0;
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('SCAMPERFramework');
class SCAMPERFramework {
    /**
     * Analyze content using SCAMPER framework
     */
    async analyze(content) {
        try {
            logger.debug('Applying SCAMPER framework analysis');
            return {
                substitute: this.findSubstitutions(content),
                combine: this.findCombinations(content),
                adapt: this.findAdaptations(content),
                modify: this.findModifications(content),
                putToOtherUses: this.findOtherUses(content),
                eliminate: this.findEliminations(content),
                reverse: this.findReversals(content),
            };
        }
        catch (error) {
            logger.error('SCAMPER analysis failed:', error);
            throw error;
        }
    }
    findSubstitutions(content) {
        const patterns = [
            /replace|substitute|switch|swap|exchange|alternative/gi,
            /instead of|rather than|in place of/gi,
        ];
        return this.extractMatches(content, patterns, 'Consider substituting');
    }
    findCombinations(content) {
        const patterns = [
            /combine|merge|integrate|unify|consolidate|blend/gi,
            /together|joint|unified|combined/gi,
        ];
        return this.extractMatches(content, patterns, 'Potential combination');
    }
    findAdaptations(content) {
        const patterns = [
            /adapt|adjust|modify|customize|tailor|fit/gi,
            /flexible|adaptable|versatile/gi,
        ];
        return this.extractMatches(content, patterns, 'Could be adapted');
    }
    findModifications(content) {
        const patterns = [
            /modify|enhance|improve|amplify|magnify|strengthen/gi,
            /increase|expand|extend|enlarge/gi,
        ];
        return this.extractMatches(content, patterns, 'Modification opportunity');
    }
    findOtherUses(content) {
        const patterns = [
            /other use|repurpose|reuse|recycle|multipurpose/gi,
            /additional|secondary|alternative use/gi,
        ];
        return this.extractMatches(content, patterns, 'Alternative use');
    }
    findEliminations(content) {
        const patterns = [
            /eliminate|remove|delete|reduce|simplify|streamline/gi,
            /unnecessary|redundant|excess|surplus/gi,
        ];
        return this.extractMatches(content, patterns, 'Could eliminate');
    }
    findReversals(content) {
        const patterns = [
            /reverse|invert|flip|opposite|contrary|backwards/gi,
            /rearrange|reorder|reorganize|restructure/gi,
        ];
        return this.extractMatches(content, patterns, 'Consider reversing');
    }
    extractMatches(content, patterns, prefix) {
        const matches = new Set();
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of patterns) {
                if (pattern.test(sentence)) {
                    const cleaned = sentence.trim().substring(0, 100);
                    matches.add(`${prefix}: ${cleaned}`);
                    break;
                }
            }
        }
        return Array.from(matches).slice(0, 3);
    }
    /**
     * Extract insights from SCAMPER results
     */
    extractInsights(results) {
        const insights = [];
        const categories = [
            { key: 'substitute', label: 'Substitution opportunity' },
            { key: 'combine', label: 'Combination potential' },
            { key: 'adapt', label: 'Adaptation possibility' },
            { key: 'modify', label: 'Modification suggestion' },
            { key: 'putToOtherUses', label: 'Alternative application' },
            { key: 'eliminate', label: 'Simplification opportunity' },
            { key: 'reverse', label: 'Reversal concept' },
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
exports.SCAMPERFramework = SCAMPERFramework;
//# sourceMappingURL=scamper.js.map