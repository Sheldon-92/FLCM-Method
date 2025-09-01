"use strict";
/**
 * Pyramid Framework
 * Hierarchical information structuring framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PyramidFramework = void 0;
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('PyramidFramework');
class PyramidFramework {
    /**
     * Analyze content using Pyramid Principle
     */
    async analyze(content) {
        try {
            logger.debug('Applying Pyramid framework analysis');
            // Extract main point
            const mainPoint = this.extractMainPoint(content);
            // Extract supporting ideas
            const supportingIdeas = this.extractSupportingIdeas(content);
            // Extract details for each supporting idea
            const details = this.extractDetails(content, supportingIdeas);
            // Extract evidence
            const evidence = this.extractEvidence(content, details);
            // Build structure
            const structure = this.buildStructure(mainPoint, supportingIdeas, details, evidence);
            return {
                mainPoint,
                supportingIdeas,
                details,
                evidence,
                structure,
            };
        }
        catch (error) {
            logger.error('Pyramid analysis failed:', error);
            throw error;
        }
    }
    extractMainPoint(content) {
        // Look for thesis statement patterns
        const sentences = content.split(/[.!?]+/);
        // Check first paragraph for main point
        const firstPara = sentences.slice(0, 3).join('. ');
        // Look for conclusion indicators
        const conclusionPatterns = [
            /therefore|thus|in conclusion|in summary|overall/i,
            /main point|key message|central idea|thesis/i,
            /most important|critical|essential|fundamental/i,
        ];
        for (const sentence of sentences) {
            for (const pattern of conclusionPatterns) {
                if (pattern.test(sentence)) {
                    return sentence.trim().substring(0, 200);
                }
            }
        }
        // Default to first substantial sentence
        return sentences.find(s => s.trim().length > 50)?.trim().substring(0, 200) ||
            'Main point to be determined from content analysis';
    }
    extractSupportingIdeas(content) {
        const ideas = [];
        const paragraphs = content.split(/\n\n+/);
        // Look for topic sentences (usually first sentence of paragraph)
        for (const para of paragraphs) {
            if (para.trim().length > 50) {
                const firstSentence = para.split(/[.!?]/)[0];
                if (firstSentence && firstSentence.trim().length > 20) {
                    ideas.push(firstSentence.trim().substring(0, 150));
                }
            }
        }
        // Also look for enumeration patterns
        const enumerationPatterns = [
            /first(?:ly)?|second(?:ly)?|third(?:ly)?|finally/gi,
            /\d+\./g,
            /[a-z]\)/gi,
        ];
        const sentences = content.split(/[.!?]+/);
        for (const sentence of sentences) {
            for (const pattern of enumerationPatterns) {
                if (pattern.test(sentence) && !ideas.includes(sentence.trim())) {
                    ideas.push(sentence.trim().substring(0, 150));
                    break;
                }
            }
        }
        return ideas.slice(0, 4); // Maximum 4 supporting ideas
    }
    extractDetails(content, supportingIdeas) {
        const details = [];
        for (const idea of supportingIdeas) {
            const ideaDetails = [];
            // Find sentences that relate to this idea
            const ideaKeywords = this.extractKeywords(idea);
            const sentences = content.split(/[.!?]+/);
            for (const sentence of sentences) {
                const sentenceLower = sentence.toLowerCase();
                const matchCount = ideaKeywords.filter(kw => sentenceLower.includes(kw)).length;
                if (matchCount >= 2 && sentence !== idea) {
                    ideaDetails.push(sentence.trim().substring(0, 100));
                }
            }
            details.push(ideaDetails.slice(0, 3)); // Max 3 details per idea
        }
        return details;
    }
    extractEvidence(content, details) {
        const evidence = [];
        // Evidence patterns
        const evidencePatterns = [
            /for example|for instance|such as|including/gi,
            /study|research|data|statistics|survey/gi,
            /\d+%|\$\d+|\d+ million|\d+ billion/gi,
            /according to|source|reference|citation/gi,
        ];
        for (const detailGroup of details) {
            const groupEvidence = [];
            for (const detail of detailGroup) {
                const detailKeywords = this.extractKeywords(detail);
                const sentences = content.split(/[.!?]+/);
                for (const sentence of sentences) {
                    // Check if sentence contains evidence patterns
                    let hasEvidence = false;
                    for (const pattern of evidencePatterns) {
                        if (pattern.test(sentence)) {
                            hasEvidence = true;
                            break;
                        }
                    }
                    // Check if it relates to the detail
                    if (hasEvidence) {
                        const sentenceLower = sentence.toLowerCase();
                        const matchCount = detailKeywords.filter(kw => sentenceLower.includes(kw)).length;
                        if (matchCount >= 1) {
                            groupEvidence.push(sentence.trim().substring(0, 80));
                        }
                    }
                }
            }
            evidence.push(groupEvidence.slice(0, 2)); // Max 2 evidence per detail group
        }
        return evidence;
    }
    buildStructure(mainPoint, supportingIdeas, details, evidence) {
        const structure = {
            level1: mainPoint,
            level2: [],
            level3: [],
            level4: [],
        };
        // Build level 2 (supporting ideas)
        supportingIdeas.forEach((idea, index) => {
            structure.level2.push({
                content: idea,
                parent: 0,
                index,
            });
        });
        // Build level 3 (details)
        let level3Index = 0;
        details.forEach((detailGroup, parentIndex) => {
            detailGroup.forEach(detail => {
                structure.level3.push({
                    content: detail,
                    parent: parentIndex,
                    index: level3Index++,
                });
            });
        });
        // Build level 4 (evidence)
        let level4Index = 0;
        evidence.forEach((evidenceGroup, parentIndex) => {
            evidenceGroup.forEach(ev => {
                structure.level4.push({
                    content: ev,
                    parent: parentIndex,
                    index: level4Index++,
                });
            });
        });
        return structure;
    }
    extractKeywords(text) {
        return text
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 4 && !this.isStopWord(word))
            .slice(0, 5);
    }
    isStopWord(word) {
        const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those'];
        return stopWords.includes(word);
    }
    /**
     * Extract insights from Pyramid results
     */
    extractInsights(results) {
        const insights = [];
        // Main insight
        insights.push(`Core message: ${results.mainPoint}`);
        // Key supporting points
        if (results.supportingIdeas.length > 0) {
            insights.push(`Primary support: ${results.supportingIdeas[0]}`);
        }
        // Structure insight
        const totalNodes = 1 + results.supportingIdeas.length +
            results.details.flat().length +
            results.evidence.flat().length;
        insights.push(`Information hierarchy: ${totalNodes} connected points across 4 levels`);
        // Evidence strength
        const evidenceCount = results.evidence.flat().length;
        if (evidenceCount > 0) {
            insights.push(`Evidence strength: ${evidenceCount} supporting examples identified`);
        }
        // Completeness
        const avgDetailsPerIdea = results.details.map(d => d.length).reduce((a, b) => a + b, 0) /
            (results.supportingIdeas.length || 1);
        insights.push(`Structure depth: Average ${avgDetailsPerIdea.toFixed(1)} details per main idea`);
        return insights;
    }
}
exports.PyramidFramework = PyramidFramework;
//# sourceMappingURL=pyramid.js.map