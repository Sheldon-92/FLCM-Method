"use strict";
/**
 * Framework Library
 * Central registry and selector for all frameworks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkLibrary = void 0;
// Import legacy frameworks
const rice_framework_1 = require("./legacy/rice-framework");
const teaching_prep_framework_1 = require("./legacy/teaching-prep-framework");
const voice_dna_framework_1 = require("./legacy/voice-dna-framework");
// Import core frameworks
const swot_used_framework_1 = require("./core/swot-used-framework");
const scamper_framework_1 = require("./core/scamper-framework");
const socratic_questioning_framework_1 = require("./core/socratic-questioning-framework");
const five_w2h_framework_1 = require("./core/five-w2h-framework");
const pyramid_principle_framework_1 = require("./core/pyramid-principle-framework");
class FrameworkLibrary {
    constructor() {
        this.frameworks = new Map();
        this.legacyMappings = new Map();
        this.initializeFrameworks();
        this.setupLegacyMappings();
    }
    /**
     * Initialize all available frameworks
     */
    initializeFrameworks() {
        // Legacy frameworks (1.0)
        this.registerFramework('rice', new rice_framework_1.RICEFramework());
        this.registerFramework('teaching_prep', new teaching_prep_framework_1.TeachingPreparationFramework());
        this.registerFramework('voice_dna', new voice_dna_framework_1.VoiceDNAFramework());
        // New core frameworks (2.0)
        this.registerFramework('swot_used', new swot_used_framework_1.SWOTUSEDFramework());
        this.registerFramework('scamper', new scamper_framework_1.SCAMPERFramework());
        this.registerFramework('socratic', new socratic_questioning_framework_1.SocraticQuestioningFramework());
        this.registerFramework('five_w2h', new five_w2h_framework_1.FiveW2HFramework());
        this.registerFramework('pyramid', new pyramid_principle_framework_1.PyramidPrincipleFramework());
    }
    /**
     * Setup legacy command mappings for backward compatibility
     */
    setupLegacyMappings() {
        // Map old commands to framework names
        this.legacyMappings.set('collect with rice', 'rice');
        this.legacyMappings.set('teach mode', 'teaching_prep');
        this.legacyMappings.set('analyze voice', 'voice_dna');
        this.legacyMappings.set('deep dive', 'socratic');
        this.legacyMappings.set('prioritize ideas', 'rice');
        this.legacyMappings.set('structure thoughts', 'pyramid');
        this.legacyMappings.set('innovate', 'scamper');
        this.legacyMappings.set('analyze strategy', 'swot_used');
        this.legacyMappings.set('comprehensive analysis', 'five_w2h');
    }
    /**
     * Register a framework in the library
     */
    registerFramework(id, framework) {
        this.frameworks.set(id, framework);
    }
    /**
     * Get a specific framework by ID
     */
    getFramework(id) {
        return this.frameworks.get(id);
    }
    /**
     * Get all available frameworks
     */
    getAllFrameworks() {
        return Array.from(this.frameworks.values());
    }
    /**
     * Get frameworks by category
     */
    getFrameworksByCategory(category) {
        return this.getAllFrameworks().filter(f => f.category === category);
    }
    /**
     * Get frameworks by tag
     */
    getFrameworksByTag(tag) {
        return this.getAllFrameworks().filter(f => f.tags.includes(tag));
    }
    /**
     * Select best framework based on context
     */
    selectFramework(context) {
        const recommendations = [];
        // Analyze context for keywords and intent
        const intent = this.analyzeIntent(context);
        // Score each framework
        this.frameworks.forEach((framework, id) => {
            const score = this.scoreFramework(framework, context, intent);
            if (score > 0) {
                recommendations.push({
                    framework,
                    score,
                    reason: this.generateReason(framework, context, intent)
                });
            }
        });
        // Sort by score
        recommendations.sort((a, b) => b.score - a.score);
        // Return top 3 recommendations
        return recommendations.slice(0, 3);
    }
    /**
     * Handle legacy command
     */
    handleLegacyCommand(command) {
        const normalizedCommand = command.toLowerCase().trim();
        // Check direct mappings
        if (this.legacyMappings.has(normalizedCommand)) {
            const frameworkId = this.legacyMappings.get(normalizedCommand);
            console.log(`[Legacy Command] Mapping "${command}" to framework: ${frameworkId}`);
            return this.frameworks.get(frameworkId);
        }
        // Check partial matches
        for (const [legacyCmd, frameworkId] of this.legacyMappings.entries()) {
            if (normalizedCommand.includes(legacyCmd) || legacyCmd.includes(normalizedCommand)) {
                console.log(`[Legacy Command] Partial match "${command}" to framework: ${frameworkId}`);
                return this.frameworks.get(frameworkId);
            }
        }
        return undefined;
    }
    /**
     * Analyze user intent from context
     */
    analyzeIntent(context) {
        if (!context.topic && !context.goal)
            return 'general';
        const text = `${context.topic || ''} ${context.goal || ''}`.toLowerCase();
        // Identify primary intent
        if (text.includes('prioritize') || text.includes('decide') || text.includes('choose')) {
            return 'prioritization';
        }
        else if (text.includes('understand') || text.includes('learn') || text.includes('teach')) {
            return 'learning';
        }
        else if (text.includes('innovate') || text.includes('create') || text.includes('new')) {
            return 'innovation';
        }
        else if (text.includes('analyze') || text.includes('evaluate') || text.includes('assess')) {
            return 'analysis';
        }
        else if (text.includes('structure') || text.includes('organize') || text.includes('communicate')) {
            return 'communication';
        }
        else if (text.includes('strategy') || text.includes('plan') || text.includes('approach')) {
            return 'strategy';
        }
        else if (text.includes('voice') || text.includes('style') || text.includes('brand')) {
            return 'branding';
        }
        else if (text.includes('question') || text.includes('deep') || text.includes('critical')) {
            return 'critical-thinking';
        }
        return 'general';
    }
    /**
     * Score a framework for given context
     */
    scoreFramework(framework, context, intent) {
        let score = 0;
        // Check if framework is applicable
        if (!framework.isApplicable(context)) {
            return 0;
        }
        // Category match
        if (framework.category === intent) {
            score += 0.5;
        }
        // Tag matches
        const contextKeywords = this.extractKeywords(context);
        const tagMatches = framework.tags.filter(tag => contextKeywords.some(keyword => tag.includes(keyword) || keyword.includes(tag)));
        score += tagMatches.length * 0.1;
        // Intent-specific scoring
        score += this.getIntentScore(framework, intent);
        // Complexity matching
        if (context.audience) {
            const audienceLevel = this.assessAudienceLevel(context.audience);
            const frameworkDifficulty = framework.getDifficulty();
            if (audienceLevel === frameworkDifficulty) {
                score += 0.2;
            }
            else if ((audienceLevel === 'beginner' && frameworkDifficulty === 'intermediate') ||
                (audienceLevel === 'intermediate' && frameworkDifficulty === 'advanced')) {
                score -= 0.1; // Slight penalty for mismatch
            }
        }
        // Time constraints
        const estimatedTime = framework.getEstimatedTime();
        if (context.sessionData?.timeAvailable) {
            const available = parseInt(context.sessionData.timeAvailable);
            if (available >= estimatedTime) {
                score += 0.1;
            }
            else {
                score -= 0.2; // Penalty if not enough time
            }
        }
        return Math.min(score, 1);
    }
    /**
     * Get intent-specific score
     */
    getIntentScore(framework, intent) {
        const intentScores = {
            'prioritization': {
                'RICE Framework': 0.5,
                '5W2H Analysis Framework': 0.2,
                'SWOT-USED Analysis': 0.3
            },
            'learning': {
                'Teaching Preparation Framework': 0.5,
                'Socratic Questioning Framework': 0.4,
                '5W2H Analysis Framework': 0.2
            },
            'innovation': {
                'SCAMPER Innovation Framework': 0.5,
                'SWOT-USED Analysis': 0.2
            },
            'analysis': {
                'SWOT-USED Analysis': 0.4,
                '5W2H Analysis Framework': 0.5,
                'Socratic Questioning Framework': 0.3
            },
            'communication': {
                'Pyramid Principle Framework': 0.5,
                'Voice DNA Framework': 0.3,
                '5W2H Analysis Framework': 0.2
            },
            'strategy': {
                'SWOT-USED Analysis': 0.5,
                'Pyramid Principle Framework': 0.3,
                '5W2H Analysis Framework': 0.3
            },
            'branding': {
                'Voice DNA Framework': 0.5,
                'Pyramid Principle Framework': 0.2
            },
            'critical-thinking': {
                'Socratic Questioning Framework': 0.5,
                '5W2H Analysis Framework': 0.3,
                'SWOT-USED Analysis': 0.2
            }
        };
        return intentScores[intent]?.[framework.name] || 0;
    }
    /**
     * Generate reason for recommendation
     */
    generateReason(framework, context, intent) {
        const reasons = [];
        // Intent-based reason
        if (framework.category === intent) {
            reasons.push(`Perfect for ${intent}`);
        }
        // Specific framework strengths
        const frameworkStrengths = {
            'RICE Framework': 'Excellent for data-driven prioritization',
            'Teaching Preparation Framework': 'Deepens understanding through teaching preparation',
            'Voice DNA Framework': 'Defines authentic content voice',
            'SWOT-USED Analysis': 'Comprehensive strategic analysis with actionable outcomes',
            'SCAMPER Innovation Framework': 'Systematic creative thinking for innovation',
            'Socratic Questioning Framework': 'Deep understanding through progressive questioning',
            '5W2H Analysis Framework': 'Ensures comprehensive coverage of all aspects',
            'Pyramid Principle Framework': 'Creates clear, logical communication structure'
        };
        if (frameworkStrengths[framework.name]) {
            reasons.push(frameworkStrengths[framework.name]);
        }
        // Time consideration
        const time = framework.getEstimatedTime();
        if (time <= 10) {
            reasons.push('Quick to complete');
        }
        // Difficulty consideration
        const difficulty = framework.getDifficulty();
        if (difficulty === 'beginner') {
            reasons.push('Easy to use');
        }
        return reasons.join('. ');
    }
    /**
     * Extract keywords from context
     */
    extractKeywords(context) {
        const text = `${context.topic || ''} ${context.goal || ''} ${context.audience || ''}`.toLowerCase();
        // Simple keyword extraction
        const words = text.split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'with', 'from', 'have'].includes(word));
        return words;
    }
    /**
     * Assess audience level
     */
    assessAudienceLevel(audience) {
        const lower = audience.toLowerCase();
        if (lower.includes('beginner') || lower.includes('new') || lower.includes('basic')) {
            return 'beginner';
        }
        else if (lower.includes('advanced') || lower.includes('expert') || lower.includes('senior')) {
            return 'advanced';
        }
        return 'intermediate';
    }
    /**
     * Get framework statistics
     */
    getStatistics() {
        const stats = {
            totalFrameworks: this.frameworks.size,
            byCategory: {},
            byDifficulty: {},
            byVersion: {
                legacy: 0,
                core: 0
            }
        };
        this.frameworks.forEach(framework => {
            // Category stats
            stats.byCategory[framework.category] = (stats.byCategory[framework.category] || 0) + 1;
            // Difficulty stats
            const difficulty = framework.getDifficulty();
            stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
            // Version stats
            if (framework.version === '1.0') {
                stats.byVersion.legacy++;
            }
            else {
                stats.byVersion.core++;
            }
        });
        return stats;
    }
}
exports.FrameworkLibrary = FrameworkLibrary;
//# sourceMappingURL=framework-library.js.map