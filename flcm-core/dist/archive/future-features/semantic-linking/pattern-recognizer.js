"use strict";
/**
 * Semantic Linking Pattern Recognizer
 * Identifies and suggests semantic connections between content
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticPatternRecognizer = void 0;
const logger_1 = require("../shared/utils/logger");
class SemanticPatternRecognizer {
    constructor() {
        this.patterns = new Map();
        this.conceptMap = new Map();
        this.contextWindow = 100; // words around each concept
        this.logger = new logger_1.Logger('SemanticPatternRecognizer');
        this.initializeConceptMap();
    }
    /**
     * Initialize concept mapping
     */
    initializeConceptMap() {
        // Predefined concept relationships
        const concepts = {
            'learning': new Set(['education', 'knowledge', 'skill', 'understanding', 'cognition']),
            'thinking': new Set(['analysis', 'reasoning', 'logic', 'critical', 'reflection']),
            'creativity': new Set(['innovation', 'imagination', 'design', 'artistic', 'original']),
            'memory': new Set(['retention', 'recall', 'encoding', 'storage', 'forgetting']),
            'problem-solving': new Set(['solution', 'strategy', 'approach', 'method', 'resolution']),
            'communication': new Set(['language', 'writing', 'speaking', 'expression', 'dialogue'])
        };
        this.conceptMap = new Map(Object.entries(concepts));
        this.logger.info(`Initialized concept map with ${this.conceptMap.size} concept families`);
    }
    /**
     * Analyze document for semantic patterns
     */
    async analyzeDocument(documentId, content, metadata) {
        try {
            const patterns = [];
            // Extract concepts and entities
            const concepts = this.extractConcepts(content);
            const entities = this.extractNamedEntities(content);
            // Find conceptual patterns
            patterns.push(...await this.findConceptualPatterns(documentId, concepts, content));
            // Find causal patterns
            patterns.push(...await this.findCausalPatterns(documentId, content));
            // Find temporal patterns
            patterns.push(...await this.findTemporalPatterns(documentId, content));
            // Find structural patterns
            patterns.push(...await this.findStructuralPatterns(documentId, content, metadata));
            // Store patterns
            for (const pattern of patterns) {
                this.patterns.set(pattern.id, pattern);
            }
            this.logger.debug(`Analyzed ${documentId}: found ${patterns.length} patterns`);
            return patterns;
        }
        catch (error) {
            this.logger.error('Failed to analyze document patterns:', error);
            throw error;
        }
    }
    /**
     * Generate linking suggestions between documents
     */
    async generateLinkingSuggestions(sourceDoc, targetDoc, sourceContent, targetContent) {
        try {
            const suggestions = [];
            // Find shared concepts
            const sourceConcepts = this.extractConcepts(sourceContent);
            const targetConcepts = this.extractConcepts(targetContent);
            const sharedConcepts = this.findSharedConcepts(sourceConcepts, targetConcepts);
            // Generate direct link suggestions
            for (const concept of sharedConcepts) {
                const suggestion = await this.createDirectLinkSuggestion(sourceDoc, targetDoc, concept, sourceContent, targetContent);
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
            // Find conceptual bridges
            const bridges = await this.findConceptualBridges(sourceConcepts, targetConcepts);
            for (const bridge of bridges) {
                const suggestion = await this.createBridgeSuggestion(sourceDoc, targetDoc, bridge, sourceContent, targetContent);
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
            // Find causal relationships
            const causalLinks = await this.findCausalRelationships(sourceContent, targetContent);
            for (const causal of causalLinks) {
                const suggestion = await this.createCausalSuggestion(sourceDoc, targetDoc, causal, sourceContent, targetContent);
                if (suggestion) {
                    suggestions.push(suggestion);
                }
            }
            // Sort by confidence
            suggestions.sort((a, b) => b.confidence - a.confidence);
            this.logger.debug(`Generated ${suggestions.length} linking suggestions`);
            return suggestions;
        }
        catch (error) {
            this.logger.error('Failed to generate linking suggestions:', error);
            throw error;
        }
    }
    /**
     * Extract concepts from text
     */
    extractConcepts(content) {
        const concepts = new Map();
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
        // Count concept occurrences
        for (const word of words) {
            concepts.set(word, (concepts.get(word) || 0) + 1);
        }
        // Filter for relevant concepts
        const relevantConcepts = new Map();
        for (const [concept, count] of concepts.entries()) {
            if (this.isRelevantConcept(concept) && count > 1) {
                relevantConcepts.set(concept, count);
            }
        }
        return relevantConcepts;
    }
    /**
     * Extract named entities (simplified)
     */
    extractNamedEntities(content) {
        const entities = [];
        // Simple pattern matching for common entities
        const patterns = [
            /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
            /\b(?:Dr|Prof|Mr|Ms|Mrs)\.?\s+[A-Z][a-z]+/g,
            /\b[A-Z][a-z]{3,}\s+(?:University|Institute|College|Corporation|Company)\b/g,
            /\b(?:19|20)\d{2}\b/g // Years
        ];
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                entities.push(...matches);
            }
        }
        return [...new Set(entities)]; // Remove duplicates
    }
    /**
     * Find conceptual patterns
     */
    async findConceptualPatterns(documentId, concepts, content) {
        const patterns = [];
        // Find concept clusters
        for (const [concept, count] of concepts.entries()) {
            const relatedConcepts = this.findRelatedConcepts(concept);
            for (const related of relatedConcepts) {
                if (concepts.has(related)) {
                    const pattern = {
                        id: `conceptual-${documentId}-${concept}-${related}`,
                        type: 'conceptual',
                        confidence: Math.min(count / 10 + concepts.get(related) / 10, 1),
                        source: concept,
                        target: related,
                        relationship: 'related_concept',
                        evidence: [{
                                type: 'textual',
                                content: `${concept} and ${related} appear together`,
                                strength: 0.7
                            }],
                        metadata: {
                            discovered: new Date(),
                            algorithm: 'concept_clustering',
                            verified: false,
                            usage_count: 0
                        }
                    };
                    patterns.push(pattern);
                }
            }
        }
        return patterns;
    }
    /**
     * Find causal patterns
     */
    async findCausalPatterns(documentId, content) {
        const patterns = [];
        const causalIndicators = [
            'because', 'since', 'therefore', 'thus', 'hence', 'consequently',
            'as a result', 'leads to', 'causes', 'results in', 'due to'
        ];
        const sentences = content.split(/[.!?]+/);
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim().toLowerCase();
            for (const indicator of causalIndicators) {
                if (sentence.includes(indicator)) {
                    const parts = sentence.split(indicator);
                    if (parts.length === 2) {
                        const pattern = {
                            id: `causal-${documentId}-${i}`,
                            type: 'causal',
                            confidence: 0.8,
                            source: parts[0].trim(),
                            target: parts[1].trim(),
                            relationship: `causal_${indicator.replace(' ', '_')}`,
                            evidence: [{
                                    type: 'textual',
                                    content: sentence,
                                    strength: 0.8,
                                    location: `sentence_${i}`
                                }],
                            metadata: {
                                discovered: new Date(),
                                algorithm: 'causal_pattern_matching',
                                verified: false,
                                usage_count: 0
                            }
                        };
                        patterns.push(pattern);
                    }
                }
            }
        }
        return patterns;
    }
    /**
     * Find temporal patterns
     */
    async findTemporalPatterns(documentId, content) {
        const patterns = [];
        const temporalIndicators = [
            'before', 'after', 'then', 'next', 'later', 'previously',
            'first', 'second', 'finally', 'meanwhile', 'simultaneously'
        ];
        const sentences = content.split(/[.!?]+/);
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i].trim().toLowerCase();
            for (const indicator of temporalIndicators) {
                if (sentence.includes(indicator)) {
                    const pattern = {
                        id: `temporal-${documentId}-${i}`,
                        type: 'temporal',
                        confidence: 0.6,
                        source: sentence.substring(0, sentence.indexOf(indicator)),
                        target: sentence.substring(sentence.indexOf(indicator) + indicator.length),
                        relationship: `temporal_${indicator}`,
                        evidence: [{
                                type: 'textual',
                                content: sentence,
                                strength: 0.6,
                                location: `sentence_${i}`
                            }],
                        metadata: {
                            discovered: new Date(),
                            algorithm: 'temporal_pattern_matching',
                            verified: false,
                            usage_count: 0
                        }
                    };
                    patterns.push(pattern);
                }
            }
        }
        return patterns;
    }
    /**
     * Find structural patterns
     */
    async findStructuralPatterns(documentId, content, metadata) {
        const patterns = [];
        // Analyze headings
        const headings = content.match(/^#+\s+(.+)$/gm) || [];
        for (let i = 0; i < headings.length - 1; i++) {
            const current = headings[i];
            const next = headings[i + 1];
            const pattern = {
                id: `structural-${documentId}-${i}`,
                type: 'structural',
                confidence: 0.5,
                source: current,
                target: next,
                relationship: 'follows_in_structure',
                evidence: [{
                        type: 'structural',
                        content: `${current} followed by ${next}`,
                        strength: 0.5
                    }],
                metadata: {
                    discovered: new Date(),
                    algorithm: 'structural_analysis',
                    verified: false,
                    usage_count: 0
                }
            };
            patterns.push(pattern);
        }
        return patterns;
    }
    /**
     * Find shared concepts between documents
     */
    findSharedConcepts(concepts1, concepts2) {
        const shared = [];
        for (const concept of concepts1.keys()) {
            if (concepts2.has(concept)) {
                shared.push(concept);
            }
        }
        return shared.sort((a, b) => (concepts1.get(b) + concepts2.get(b)) - (concepts1.get(a) + concepts2.get(a)));
    }
    /**
     * Find conceptual bridges between different concepts
     */
    async findConceptualBridges(concepts1, concepts2) {
        const bridges = [];
        for (const concept1 of concepts1.keys()) {
            const related1 = this.findRelatedConcepts(concept1);
            for (const concept2 of concepts2.keys()) {
                const related2 = this.findRelatedConcepts(concept2);
                // Find intersection
                const intersection = related1.filter(r => related2.includes(r));
                bridges.push(...intersection);
            }
        }
        return [...new Set(bridges)];
    }
    /**
     * Create direct link suggestion
     */
    async createDirectLinkSuggestion(sourceDoc, targetDoc, sharedConcept, sourceContent, targetContent) {
        const sourceLocation = this.findConceptLocation(sharedConcept, sourceContent);
        const targetLocation = this.findConceptLocation(sharedConcept, targetContent);
        if (!sourceLocation || !targetLocation)
            return null;
        return {
            id: `link-${sourceDoc}-${targetDoc}-${sharedConcept}`,
            sourceDocument: sourceDoc,
            targetDocument: targetDoc,
            suggestionType: 'direct_link',
            confidence: 0.8,
            explanation: `Both documents discuss "${sharedConcept}" - consider linking related sections`,
            suggestedText: `[[${targetDoc}]] explores ${sharedConcept} in depth`,
            location: sourceLocation
        };
    }
    /**
     * Find concept location in text
     */
    findConceptLocation(concept, content) {
        const index = content.toLowerCase().indexOf(concept.toLowerCase());
        if (index === -1)
            return null;
        // Find surrounding context
        const start = Math.max(0, index - this.contextWindow);
        const end = Math.min(content.length, index + concept.length + this.contextWindow);
        const context = content.substring(start, end);
        return {
            context,
            sentence: this.findSentenceNumber(content, index),
            paragraph: this.findParagraphNumber(content, index)
        };
    }
    findSentenceNumber(content, index) {
        return content.substring(0, index).split(/[.!?]+/).length;
    }
    findParagraphNumber(content, index) {
        return content.substring(0, index).split('\n\n').length;
    }
    createBridgeSuggestion(sourceDoc, targetDoc, bridge, sourceContent, targetContent) {
        return {
            id: `bridge-${sourceDoc}-${targetDoc}-${bridge}`,
            sourceDocument: sourceDoc,
            targetDocument: targetDoc,
            suggestionType: 'conceptual_bridge',
            confidence: 0.6,
            explanation: `"${bridge}" connects concepts in both documents`,
            suggestedText: `This relates to [[${targetDoc}]] through the concept of ${bridge}`,
            location: this.findConceptLocation(bridge, sourceContent) || { context: '' }
        };
    }
    findCausalRelationships(sourceContent, targetContent) {
        // Simplified implementation
        return Promise.resolve([]);
    }
    createCausalSuggestion(sourceDoc, targetDoc, causal, sourceContent, targetContent) {
        return null; // Placeholder
    }
    isRelevantConcept(concept) {
        if (concept.length < 4)
            return false;
        const stopWords = new Set([
            'this', 'that', 'with', 'from', 'they', 'them', 'there', 'where',
            'when', 'what', 'which', 'would', 'could', 'should', 'might'
        ]);
        return !stopWords.has(concept);
    }
    findRelatedConcepts(concept) {
        for (const [key, related] of this.conceptMap.entries()) {
            if (related.has(concept) || key === concept) {
                return Array.from(related);
            }
        }
        return [];
    }
    /**
     * Get all patterns
     */
    getPatterns() {
        return Array.from(this.patterns.values());
    }
    /**
     * Get patterns by type
     */
    getPatternsByType(type) {
        return Array.from(this.patterns.values()).filter(p => p.type === type);
    }
    /**
     * Update pattern feedback
     */
    updatePatternFeedback(patternId, feedback) {
        const pattern = this.patterns.get(patternId);
        if (pattern) {
            pattern.metadata.user_feedback = feedback;
            pattern.metadata.verified = feedback === 'positive';
            // Adjust confidence based on feedback
            if (feedback === 'positive') {
                pattern.confidence = Math.min(pattern.confidence * 1.1, 1);
            }
            else if (feedback === 'negative') {
                pattern.confidence = Math.max(pattern.confidence * 0.8, 0.1);
            }
            this.logger.debug(`Updated pattern ${patternId} with ${feedback} feedback`);
        }
    }
}
exports.SemanticPatternRecognizer = SemanticPatternRecognizer;
//# sourceMappingURL=pattern-recognizer.js.map