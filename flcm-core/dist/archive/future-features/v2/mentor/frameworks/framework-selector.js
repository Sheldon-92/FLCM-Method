"use strict";
/**
 * Framework Selector
 * Intelligent framework recommendation engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameworkSelector = void 0;
const framework_library_1 = require("./framework-library");
class FrameworkSelector {
    constructor() {
        this.library = new framework_library_1.FrameworkLibrary();
        this.selectionHistory = new Map();
    }
    /**
     * Select the best framework for user's needs
     */
    async select(context, criteria) {
        // Get recommendations from library
        let recommendations = this.library.selectFramework(context);
        // Apply additional criteria
        if (criteria) {
            recommendations = this.applyCriteria(recommendations, criteria);
        }
        // Consider user history
        recommendations = this.applyHistoryBoost(recommendations, context);
        // Split into recommended and alternates
        const recommended = recommendations.slice(0, 1);
        const alternates = recommendations.slice(1, 3);
        // Generate rationale
        const rationale = this.generateRationale(recommended[0], context, criteria);
        // Track selection for history
        if (recommended.length > 0) {
            this.trackSelection(context, recommended[0].framework.name);
        }
        return {
            recommended,
            alternates,
            rationale,
            context
        };
    }
    /**
     * Interactive selection with user input
     */
    async interactiveSelect(initialContext) {
        const questions = this.getContextQuestions();
        const context = initialContext || {};
        // This would normally involve user interaction
        // For now, we'll use the initial context
        return this.select(context);
    }
    /**
     * Multi-framework recommendation for complex tasks
     */
    async selectMultiple(context, count = 3) {
        const recommendations = this.library.selectFramework(context);
        // Select diverse frameworks
        const selected = [];
        const usedCategories = new Set();
        for (const rec of recommendations) {
            if (selected.length >= count)
                break;
            // Prefer diverse categories
            if (!usedCategories.has(rec.framework.category)) {
                selected.push(rec);
                usedCategories.add(rec.framework.category);
            }
        }
        // Fill remaining slots if needed
        if (selected.length < count) {
            for (const rec of recommendations) {
                if (selected.length >= count)
                    break;
                if (!selected.includes(rec)) {
                    selected.push(rec);
                }
            }
        }
        return selected;
    }
    /**
     * Get framework by legacy command
     */
    getByLegacyCommand(command) {
        return this.library.handleLegacyCommand(command);
    }
    /**
     * Get framework by ID
     */
    getById(id) {
        return this.library.getFramework(id);
    }
    /**
     * Apply selection criteria to filter/reorder recommendations
     */
    applyCriteria(recommendations, criteria) {
        let filtered = [...recommendations];
        // Filter by time available
        if (criteria.timeAvailable) {
            filtered = filtered.filter(rec => rec.framework.getEstimatedTime() <= criteria.timeAvailable);
        }
        // Filter by audience level
        if (criteria.audienceLevel) {
            filtered = filtered.filter(rec => {
                const difficulty = rec.framework.getDifficulty();
                // Allow exact match or one level up
                return difficulty === criteria.audienceLevel ||
                    (criteria.audienceLevel === 'beginner' && difficulty === 'intermediate') ||
                    (criteria.audienceLevel === 'intermediate' && difficulty === 'advanced');
            });
        }
        // Filter by preferred category
        if (criteria.preferredCategory) {
            // Boost matching category
            filtered = filtered.map(rec => ({
                ...rec,
                score: rec.framework.category === criteria.preferredCategory
                    ? rec.score + 0.3
                    : rec.score
            }));
        }
        // Exclude specific frameworks
        if (criteria.excludeFrameworks) {
            filtered = filtered.filter(rec => !criteria.excludeFrameworks.includes(rec.framework.name));
        }
        // Require specific tags
        if (criteria.requireTags) {
            filtered = filtered.filter(rec => criteria.requireTags.some(tag => rec.framework.tags.includes(tag)));
        }
        // Re-sort by score
        filtered.sort((a, b) => b.score - a.score);
        return filtered;
    }
    /**
     * Apply history-based scoring boost
     */
    applyHistoryBoost(recommendations, context) {
        const userKey = this.getUserKey(context);
        const history = this.selectionHistory.get(userKey) || [];
        // Boost frameworks that worked well before for similar contexts
        return recommendations.map(rec => {
            const usedCount = history.filter(name => name === rec.framework.name).length;
            // Small boost for familiarity, but not too much to prevent variety
            const historyBoost = Math.min(usedCount * 0.05, 0.15);
            return {
                ...rec,
                score: rec.score + historyBoost
            };
        });
    }
    /**
     * Generate rationale for recommendation
     */
    generateRationale(recommendation, context, criteria) {
        if (!recommendation) {
            return 'No suitable framework found for the given context.';
        }
        const parts = [];
        // Main recommendation
        parts.push(`${recommendation.framework.name} is recommended because ${recommendation.reason}.`);
        // Context-specific rationale
        if (context.topic) {
            parts.push(`It's well-suited for analyzing "${context.topic}".`);
        }
        if (context.goal) {
            parts.push(`It aligns with your goal: ${context.goal}.`);
        }
        // Criteria-specific rationale
        if (criteria?.timeAvailable) {
            const time = recommendation.framework.getEstimatedTime();
            parts.push(`It can be completed in ${time} minutes, within your ${criteria.timeAvailable} minute timeframe.`);
        }
        if (criteria?.audienceLevel) {
            const difficulty = recommendation.framework.getDifficulty();
            parts.push(`Its ${difficulty} difficulty level matches your ${criteria.audienceLevel} audience.`);
        }
        return parts.join(' ');
    }
    /**
     * Track framework selection for learning
     */
    trackSelection(context, frameworkName) {
        const userKey = this.getUserKey(context);
        if (!this.selectionHistory.has(userKey)) {
            this.selectionHistory.set(userKey, []);
        }
        const history = this.selectionHistory.get(userKey);
        history.push(frameworkName);
        // Keep only last 10 selections per user
        if (history.length > 10) {
            history.shift();
        }
    }
    /**
     * Get user key for history tracking
     */
    getUserKey(context) {
        // Simple key based on session data or default
        return context.sessionData?.userId || 'default';
    }
    /**
     * Get context questions for interactive selection
     */
    getContextQuestions() {
        return [
            {
                id: 'topic',
                question: 'What topic or challenge are you working on?',
                type: 'open'
            },
            {
                id: 'goal',
                question: 'What do you want to achieve?',
                type: 'open'
            },
            {
                id: 'intent',
                question: 'What is your primary intent?',
                type: 'choice',
                options: [
                    'Prioritize and decide',
                    'Understand and learn',
                    'Innovate and create',
                    'Analyze and evaluate',
                    'Structure and communicate',
                    'Develop strategy',
                    'Define voice/brand',
                    'Think critically'
                ]
            },
            {
                id: 'time',
                question: 'How much time do you have? (minutes)',
                type: 'number'
            },
            {
                id: 'audience',
                question: 'Who is your audience?',
                type: 'open'
            }
        ];
    }
    /**
     * Get framework compatibility matrix
     */
    getCompatibilityMatrix() {
        const frameworks = this.library.getAllFrameworks();
        const matrix = {};
        frameworks.forEach(f1 => {
            matrix[f1.name] = {};
            frameworks.forEach(f2 => {
                if (f1.name !== f2.name) {
                    // Calculate compatibility score
                    const compatibility = this.calculateCompatibility(f1, f2);
                    matrix[f1.name][f2.name] = compatibility;
                }
            });
        });
        return matrix;
    }
    /**
     * Calculate compatibility between two frameworks
     */
    calculateCompatibility(f1, f2) {
        let score = 0;
        // Different categories can be complementary
        if (f1.category !== f2.category) {
            score += 0.3;
        }
        // Check for complementary tags
        const commonTags = f1.tags.filter(tag => f2.tags.includes(tag));
        if (commonTags.length > 0) {
            score += 0.2;
        }
        // Time compatibility
        const totalTime = f1.getEstimatedTime() + f2.getEstimatedTime();
        if (totalTime <= 30) {
            score += 0.2; // Can be done in single session
        }
        // Difficulty progression
        const d1 = f1.getDifficulty();
        const d2 = f2.getDifficulty();
        if ((d1 === 'beginner' && d2 === 'intermediate') ||
            (d1 === 'intermediate' && d2 === 'advanced')) {
            score += 0.3; // Good progression
        }
        return Math.min(score, 1);
    }
    /**
     * Get framework journey recommendations
     */
    getFrameworkJourney(startingPoint, goal) {
        const journey = [];
        // Define learning paths
        const journeys = {
            'beginner_analyst': ['five_w2h', 'rice', 'swot_used'],
            'content_creator': ['voice_dna', 'pyramid', 'scamper'],
            'strategic_thinker': ['swot_used', 'socratic', 'pyramid'],
            'innovator': ['scamper', 'socratic', 'swot_used'],
            'educator': ['teaching_prep', 'socratic', 'pyramid'],
            'decision_maker': ['rice', 'swot_used', 'five_w2h']
        };
        // Find matching journey
        const pathKey = `${startingPoint}_${goal}`.toLowerCase().replace(/\s+/g, '_');
        const matchingPath = Object.keys(journeys).find(key => pathKey.includes(key.split('_')[0]) || pathKey.includes(key.split('_')[1]));
        if (matchingPath && journeys[matchingPath]) {
            journeys[matchingPath].forEach(frameworkId => {
                const framework = this.library.getFramework(frameworkId);
                if (framework) {
                    journey.push(framework);
                }
            });
        }
        // Default journey if no match
        if (journey.length === 0) {
            ['five_w2h', 'swot_used', 'pyramid'].forEach(id => {
                const framework = this.library.getFramework(id);
                if (framework)
                    journey.push(framework);
            });
        }
        return journey;
    }
}
exports.FrameworkSelector = FrameworkSelector;
//# sourceMappingURL=framework-selector.js.map