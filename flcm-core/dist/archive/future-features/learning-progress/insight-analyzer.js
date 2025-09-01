"use strict";
/**
 * Insight Depth Analyzer
 * Analyzes the depth and quality of insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightDepthAnalyzer = void 0;
const logger_1 = require("../shared/utils/logger");
class InsightDepthAnalyzer {
    constructor() {
        this.levels = [
            { level: 1, name: 'Surface', minScore: 0 },
            { level: 2, name: 'Shallow', minScore: 20 },
            { level: 3, name: 'Moderate', minScore: 40 },
            { level: 4, name: 'Deep', minScore: 60 },
            { level: 5, name: 'Profound', minScore: 80 }
        ];
        this.logger = new logger_1.Logger('InsightDepthAnalyzer');
    }
    /**
     * Calculate insight depth score
     */
    calculateDepth(insight) {
        let score = 0;
        // Content complexity analysis (0-20 points)
        score += this.analyzeComplexity(insight.content) * 20;
        // Connection analysis (0-15 points)
        score += this.analyzeConnections(insight.connections) * 15;
        // Originality assessment (0-25 points)
        score += this.assessOriginality(insight.content) * 25;
        // Evidence evaluation (0-20 points)
        score += this.evaluateEvidence(insight.evidence || []) * 20;
        // Synthesis measurement (0-20 points)
        score += this.measureSynthesis(insight.synthesis) * 20;
        const finalScore = Math.min(Math.max(score, 0), 100);
        this.logger.debug(`Calculated depth for insight ${insight.id}:`, {
            complexity: this.analyzeComplexity(insight.content) * 20,
            connections: this.analyzeConnections(insight.connections) * 15,
            originality: this.assessOriginality(insight.content) * 25,
            evidence: this.evaluateEvidence(insight.evidence || []) * 20,
            synthesis: this.measureSynthesis(insight.synthesis) * 20,
            total: finalScore
        });
        return finalScore;
    }
    /**
     * Get insight level from score
     */
    getLevel(score) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (score >= this.levels[i].minScore) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }
    /**
     * Track progression over time
     */
    trackProgression(insights) {
        const timeline = insights
            .sort((a, b) => a.created.getTime() - b.created.getTime())
            .map(insight => ({
            timestamp: insight.created,
            depth: insight.depth || this.calculateDepth(insight),
            level: this.getLevel(insight.depth || this.calculateDepth(insight)),
            framework: insight.framework,
            topic: insight.tags
        }));
        // Calculate trend
        const trend = this.calculateTrend(timeline);
        // Identify breakthroughs
        const breakthroughs = this.identifyBreakthroughs(timeline);
        // Calculate current statistics
        const currentLevel = timeline.length > 0 ? timeline[timeline.length - 1].level.level : 1;
        const averageDepth = timeline.reduce((sum, point) => sum + point.depth, 0) / Math.max(timeline.length, 1);
        // Depth distribution
        const depthDistribution = {};
        for (const point of timeline) {
            const levelName = point.level.name;
            depthDistribution[levelName] = (depthDistribution[levelName] || 0) + 1;
        }
        return {
            timeline,
            trend,
            breakthroughs,
            currentLevel,
            averageDepth,
            depthDistribution
        };
    }
    /**
     * Analyze content complexity
     */
    analyzeComplexity(content) {
        if (!content || content.trim().length === 0)
            return 0;
        let complexityScore = 0;
        // Length factor (longer content may indicate deeper thinking)
        const wordCount = content.split(/\s+/).length;
        complexityScore += Math.min(wordCount / 100, 0.3); // 30% max from length
        // Vocabulary sophistication
        const sophisticatedWords = this.countSophisticatedWords(content);
        complexityScore += sophisticatedWords * 0.1; // Up to 30% from vocabulary
        // Sentence structure complexity
        const avgSentenceLength = this.calculateAvgSentenceLength(content);
        complexityScore += Math.min(avgSentenceLength / 20, 0.2); // 20% max from sentence length
        // Conceptual indicators
        const conceptualWords = this.countConceptualWords(content);
        complexityScore += conceptualWords * 0.05; // Up to 20% from conceptual language
        return Math.min(complexityScore, 1);
    }
    /**
     * Analyze connections to other insights
     */
    analyzeConnections(connections) {
        if (!connections || connections.length === 0)
            return 0;
        // More connections indicate broader thinking
        const connectionScore = Math.min(connections.length / 5, 1);
        return connectionScore;
    }
    /**
     * Assess originality of content
     */
    assessOriginality(content) {
        if (!content || content.trim().length === 0)
            return 0;
        let originalityScore = 0;
        // Check for personal pronouns and first-person perspective
        const personalPerspective = /\b(I\s+(think|believe|feel|noticed|realized|discovered))/gi.test(content);
        if (personalPerspective)
            originalityScore += 0.3;
        // Check for questioning and exploration
        const questioningWords = /\b(why|how|what if|perhaps|maybe|could it be)\b/gi;
        const questionCount = (content.match(questioningWords) || []).length;
        originalityScore += Math.min(questionCount * 0.1, 0.3);
        // Check for novel connections or insights
        const insightWords = /\b(connection|pattern|realize|insight|breakthrough|discover)\b/gi;
        const insightCount = (content.match(insightWords) || []).length;
        originalityScore += Math.min(insightCount * 0.1, 0.2);
        // Check for critical thinking indicators
        const criticalWords = /\b(however|although|despite|contrary|paradox|tension)\b/gi;
        const criticalCount = (content.match(criticalWords) || []).length;
        originalityScore += Math.min(criticalCount * 0.1, 0.2);
        return Math.min(originalityScore, 1);
    }
    /**
     * Evaluate evidence quality
     */
    evaluateEvidence(evidence) {
        if (!evidence || evidence.length === 0)
            return 0;
        let evidenceScore = 0;
        for (const item of evidence) {
            // Evidence type scoring
            switch (item.type) {
                case 'data':
                    evidenceScore += 0.3;
                    break;
                case 'source':
                    evidenceScore += 0.2;
                    break;
                case 'example':
                    evidenceScore += 0.15;
                    break;
                case 'observation':
                    evidenceScore += 0.1;
                    break;
            }
            // Reliability factor
            if (item.reliability) {
                evidenceScore += (item.reliability / 10) * 0.1;
            }
        }
        return Math.min(evidenceScore, 1);
    }
    /**
     * Measure synthesis quality
     */
    measureSynthesis(synthesis) {
        if (!synthesis)
            return 0;
        let synthesisScore = 0;
        // Originality component
        if (synthesis.originalityScore) {
            synthesisScore += (synthesis.originalityScore / 10) * 0.4;
        }
        // Integration component
        if (synthesis.integrationScore) {
            synthesisScore += (synthesis.integrationScore / 10) * 0.4;
        }
        // Creativity component
        if (synthesis.creativityScore) {
            synthesisScore += (synthesis.creativityScore / 10) * 0.2;
        }
        return Math.min(synthesisScore, 1);
    }
    /**
     * Calculate trend in progression
     */
    calculateTrend(timeline) {
        if (timeline.length < 2) {
            return { direction: 'stable', strength: 0, rate: 0, r2: 0 };
        }
        // Simple linear regression
        const n = timeline.length;
        const xValues = timeline.map((_, i) => i);
        const yValues = timeline.map(point => point.depth);
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // Calculate R²
        const yMean = sumY / n;
        const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
        const residualSumSquares = yValues.reduce((sum, y, i) => {
            const predicted = slope * i + intercept;
            return sum + Math.pow(y - predicted, 2);
        }, 0);
        const r2 = 1 - (residualSumSquares / totalSumSquares);
        let direction = 'stable';
        if (slope > 1)
            direction = 'improving';
        else if (slope < -1)
            direction = 'declining';
        return {
            direction,
            strength: Math.abs(slope),
            rate: slope,
            r2: Math.max(0, r2)
        };
    }
    /**
     * Identify breakthrough moments
     */
    identifyBreakthroughs(timeline) {
        const breakthroughs = [];
        for (let i = 1; i < timeline.length; i++) {
            const current = timeline[i];
            const previous = timeline[i - 1];
            // Level breakthrough
            if (current.level.level > previous.level.level) {
                breakthroughs.push({
                    timestamp: current.timestamp,
                    level: current.level.level,
                    previousLevel: previous.level.level,
                    trigger: current.framework,
                    impact: (current.level.level - previous.level.level) * 2
                });
            }
            // Significant depth increase
            const depthIncrease = current.depth - previous.depth;
            if (depthIncrease > 20) {
                breakthroughs.push({
                    timestamp: current.timestamp,
                    level: current.level.level,
                    previousLevel: previous.level.level,
                    trigger: `depth_jump_${current.framework}`,
                    impact: Math.min(depthIncrease / 10, 10)
                });
            }
        }
        return breakthroughs;
    }
    /**
     * Count sophisticated words
     */
    countSophisticatedWords(content) {
        const sophisticatedWords = [
            'analysis', 'synthesis', 'paradigm', 'methodology', 'theoretical',
            'empirical', 'conceptual', 'fundamental', 'comprehensive', 'systematic',
            'intricate', 'multifaceted', 'nuanced', 'sophisticated', 'elaborate'
        ];
        const words = content.toLowerCase().split(/\s+/);
        return sophisticatedWords.filter(word => words.includes(word)).length;
    }
    /**
     * Calculate average sentence length
     */
    calculateAvgSentenceLength(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0)
            return 0;
        const totalWords = sentences.reduce((sum, sentence) => {
            return sum + sentence.trim().split(/\s+/).length;
        }, 0);
        return totalWords / sentences.length;
    }
    /**
     * Count conceptual words
     */
    countConceptualWords(content) {
        const conceptualWords = [
            'concept', 'principle', 'theory', 'framework', 'model', 'system',
            'relationship', 'pattern', 'structure', 'process', 'mechanism',
            'phenomenon', 'implication', 'consequence', 'causation'
        ];
        const words = content.toLowerCase().split(/\s+/);
        return conceptualWords.filter(word => words.includes(word)).length;
    }
}
exports.InsightDepthAnalyzer = InsightDepthAnalyzer;
//# sourceMappingURL=insight-analyzer.js.map