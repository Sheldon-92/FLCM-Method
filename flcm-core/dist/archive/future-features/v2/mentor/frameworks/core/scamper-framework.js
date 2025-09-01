"use strict";
/**
 * SCAMPER Innovation Framework
 * Creative thinking and innovation through systematic questioning
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCAMPERFramework = void 0;
const base_1 = require("../base");
class SCAMPERFramework extends base_1.BaseFramework {
    constructor() {
        super();
        this.name = 'SCAMPER Innovation Framework';
        this.description = 'Generate innovative ideas through systematic creative questioning';
        this.version = '2.0';
        this.category = 'innovation';
        this.tags = ['creativity', 'innovation', 'ideation', 'problem-solving', 'brainstorming'];
    }
    getIntroduction(context) {
        return `SCAMPER is a powerful creative thinking technique that generates innovative ideas through seven lenses:

• **S**ubstitute - What can be substituted?
• **C**ombine - What can be combined?
• **A**dapt - What can be adapted?
• **M**odify/Magnify - What can be modified or magnified?
• **P**ut to other uses - How can this be used differently?
• **E**liminate - What can be eliminated?
• **R**everse/Rearrange - What can be reversed or rearranged?

Let's innovate on ${context?.topic || 'your idea'} by exploring each dimension.`;
    }
    getQuestions(context) {
        const topic = context?.topic || 'your product/service/idea';
        return [
            // Context setting
            {
                id: 'current_state',
                question: `Describe the current state of ${topic}. What exists today?`,
                type: 'open',
                required: true
            },
            {
                id: 'innovation_goal',
                question: 'What is your innovation goal? What problem are you trying to solve or improvement are you seeking?',
                type: 'open',
                required: true
            },
            // SUBSTITUTE
            {
                id: 'substitute',
                question: `SUBSTITUTE: What elements of ${topic} could be replaced with something else? Consider materials, processes, people, places, approaches, or technologies.`,
                type: 'open',
                required: true,
                followUp: 'Examples: Replace physical with digital, human with AI, expensive with affordable, complex with simple'
            },
            // COMBINE
            {
                id: 'combine',
                question: `COMBINE: What could be combined or integrated with ${topic}? What other products, services, or features could merge with this?`,
                type: 'open',
                required: true,
                followUp: 'Examples: Combine two features, merge with competitor offering, integrate complementary services'
            },
            // ADAPT
            {
                id: 'adapt',
                question: `ADAPT: What else is like ${topic}? What ideas from other industries or contexts could be adapted here?`,
                type: 'open',
                required: true,
                followUp: 'Examples: Adapt from nature, borrow from other industries, copy successful models'
            },
            // MODIFY/MAGNIFY
            {
                id: 'modify',
                question: `MODIFY/MAGNIFY: What could be emphasized, exaggerated, or made larger? What could be made smaller or minimized?`,
                type: 'open',
                required: true,
                followUp: 'Consider: Scale, frequency, intensity, duration, significance, features'
            },
            // PUT TO OTHER USES
            {
                id: 'other_uses',
                question: `PUT TO OTHER USES: How could ${topic} be used differently? Who else could use it? What other problems could it solve?`,
                type: 'open',
                required: true,
                followUp: 'Consider: New markets, different applications, alternative users, unexpected contexts'
            },
            // ELIMINATE
            {
                id: 'eliminate',
                question: `ELIMINATE: What could be removed, simplified, or streamlined? What's unnecessary or adds no value?`,
                type: 'open',
                required: true,
                followUp: 'Consider: Features, steps, costs, complexity, assumptions, traditions'
            },
            // REVERSE/REARRANGE
            {
                id: 'reverse',
                question: `REVERSE/REARRANGE: What could be reversed, flipped, or reordered? What if the sequence changed or roles swapped?`,
                type: 'open',
                required: true,
                followUp: 'Examples: Reverse the process, flip the business model, rearrange priorities, invert assumptions'
            },
            // Feasibility assessment
            {
                id: 'constraints',
                question: 'What constraints or limitations should be considered? (budget, technology, regulations, timeline)',
                type: 'open',
                required: false
            },
            {
                id: 'wild_ideas',
                question: 'Share any wild or seemingly impossible ideas that came to mind during this exercise',
                type: 'open',
                required: false
            }
        ];
    }
    async process(answers, context) {
        // Parse SCAMPER ideas
        const ideas = {
            substitute: this.parseIdeas(answers.substitute),
            combine: this.parseIdeas(answers.combine),
            adapt: this.parseIdeas(answers.adapt),
            modify: this.parseIdeas(answers.modify),
            putToOtherUses: this.parseIdeas(answers.other_uses),
            eliminate: this.parseIdeas(answers.eliminate),
            reverse: this.parseIdeas(answers.reverse)
        };
        // Analyze and score ideas
        const scoredIdeas = this.scoreIdeas(ideas, answers);
        // Generate insights
        const insights = this.generateInsights(ideas, answers);
        // Generate recommendations
        const recommendations = this.generateRecommendations(scoredIdeas, answers);
        // Generate next steps
        const nextSteps = this.generateNextSteps(scoredIdeas, answers);
        // Calculate innovation potential
        const innovationScore = this.calculateInnovationScore(ideas, answers);
        return {
            insights,
            recommendations,
            nextSteps,
            data: {
                scamperIdeas: ideas,
                topIdeas: scoredIdeas.slice(0, 5),
                innovationScore,
                currentState: answers.current_state,
                innovationGoal: answers.innovation_goal,
                wildIdeas: this.parseIdeas(answers.wild_ideas || ''),
                totalIdeasGenerated: this.countTotalIdeas(ideas)
            },
            confidence: this.calculateConfidence(ideas),
            metadata: {
                framework: 'SCAMPER',
                version: this.version,
                sessionDate: new Date().toISOString()
            }
        };
    }
    parseIdeas(input) {
        if (!input)
            return [];
        return input
            .split(/[\n;]/)
            .map(idea => idea.trim())
            .filter(idea => idea.length > 0);
    }
    scoreIdeas(ideas, answers) {
        const scoredIdeas = [];
        // Score each idea based on multiple factors
        Object.entries(ideas).forEach(([category, categoryIdeas]) => {
            categoryIdeas.forEach(idea => {
                let score = 0;
                // Novelty score (longer, more detailed ideas score higher)
                score += Math.min(idea.length / 50, 1) * 0.3;
                // Alignment with goal
                if (answers.innovation_goal && this.alignsWithGoal(idea, answers.innovation_goal)) {
                    score += 0.3;
                }
                // Feasibility (ideas without "impossible" or "never" score higher)
                if (!idea.toLowerCase().includes('impossible') && !idea.toLowerCase().includes('never')) {
                    score += 0.2;
                }
                // Category weighting (some SCAMPER categories often yield better results)
                const categoryWeights = {
                    combine: 0.2,
                    eliminate: 0.2,
                    substitute: 0.15,
                    adapt: 0.15,
                    modify: 0.1,
                    putToOtherUses: 0.1,
                    reverse: 0.1
                };
                score += categoryWeights[category] || 0;
                scoredIdeas.push({
                    idea,
                    category: this.formatCategoryName(category),
                    score
                });
            });
        });
        // Sort by score
        return scoredIdeas.sort((a, b) => b.score - a.score);
    }
    generateInsights(ideas, answers) {
        const insights = [];
        const totalIdeas = this.countTotalIdeas(ideas);
        // Quantity insights
        if (totalIdeas > 20) {
            insights.push('Excellent ideation session with abundant creative output');
        }
        else if (totalIdeas > 10) {
            insights.push('Good variety of innovative ideas generated across categories');
        }
        else if (totalIdeas < 5) {
            insights.push('Limited ideas suggest need for deeper exploration or different perspectives');
        }
        // Category insights
        const categoryCounts = this.getCategoryCounts(ideas);
        const maxCategory = this.getMaxCategory(categoryCounts);
        const minCategory = this.getMinCategory(categoryCounts);
        if (maxCategory) {
            insights.push(`Strongest ideation in "${maxCategory}" suggests natural innovation path`);
        }
        if (minCategory && categoryCounts[minCategory] === 0) {
            insights.push(`No ideas in "${minCategory}" - consider revisiting with fresh perspective`);
        }
        // Pattern insights
        if (ideas.eliminate.length > ideas.modify.length * 2) {
            insights.push('Strong focus on simplification and removal indicates minimalist innovation approach');
        }
        if (ideas.combine.length > 3) {
            insights.push('Multiple combination ideas suggest opportunity for integrated solutions');
        }
        if (ideas.adapt.length > 0) {
            const adaptSources = this.identifyAdaptationSources(ideas.adapt);
            if (adaptSources.length > 0) {
                insights.push(`Cross-industry inspiration from ${adaptSources.join(', ')} enriches innovation`);
            }
        }
        // Wild ideas insight
        if (answers.wild_ideas) {
            insights.push('Wild ideas often contain seeds of breakthrough innovation - explore further');
        }
        return insights;
    }
    generateRecommendations(scoredIdeas, answers) {
        const recommendations = [];
        // Top ideas recommendations
        if (scoredIdeas.length > 0) {
            recommendations.push(`Priority Innovation: ${scoredIdeas[0].idea}`);
            if (scoredIdeas.length > 1) {
                recommendations.push(`Quick Win Opportunity: ${scoredIdeas[1].idea}`);
            }
        }
        // Category-specific recommendations
        const topCategories = new Set(scoredIdeas.slice(0, 5).map(i => i.category));
        if (topCategories.has('Eliminate')) {
            recommendations.push('Focus on simplification strategy - less can be more');
        }
        if (topCategories.has('Combine')) {
            recommendations.push('Pursue integration opportunities for comprehensive solution');
        }
        if (topCategories.has('Substitute')) {
            recommendations.push('Test substitution ideas with small experiments before full implementation');
        }
        // Constraints-based recommendations
        if (answers.constraints) {
            if (answers.constraints.toLowerCase().includes('budget') ||
                answers.constraints.toLowerCase().includes('cost')) {
                recommendations.push('Prioritize low-cost innovations from Eliminate and Adapt categories');
            }
            if (answers.constraints.toLowerCase().includes('time') ||
                answers.constraints.toLowerCase().includes('quick')) {
                recommendations.push('Focus on Modify and Eliminate ideas for faster implementation');
            }
        }
        // Innovation approach
        if (scoredIdeas.length > 10) {
            recommendations.push('Create innovation portfolio: 70% incremental, 20% adjacent, 10% transformational');
        }
        return recommendations;
    }
    generateNextSteps(scoredIdeas, answers) {
        const steps = [];
        // Immediate actions
        steps.push('Select top 3 ideas for detailed feasibility analysis');
        steps.push('Create simple prototypes or mockups for visualization');
        // Validation steps
        if (scoredIdeas.length > 0) {
            const topCategory = scoredIdeas[0].category;
            if (topCategory === 'Combine' || topCategory === 'Adapt') {
                steps.push('Research similar innovations in other industries for validation');
            }
            else if (topCategory === 'Eliminate') {
                steps.push('Survey users to validate what can be removed without losing value');
            }
            else if (topCategory === 'Substitute') {
                steps.push('Test substitution with small user group before full rollout');
            }
        }
        // Development steps
        steps.push('Develop business case for most promising innovation');
        steps.push('Identify required resources and potential partners');
        // Wild ideas consideration
        if (answers.wild_ideas) {
            steps.push('Schedule "wild idea" workshop to explore seemingly impossible concepts');
        }
        // Iteration
        steps.push('Run SCAMPER exercise with diverse team for additional perspectives');
        return steps;
    }
    calculateInnovationScore(ideas, answers) {
        let score = 0;
        const totalIdeas = this.countTotalIdeas(ideas);
        // Quantity factor (0-0.3)
        score += Math.min(totalIdeas / 30, 0.3);
        // Diversity factor (0-0.3)
        const categoriesUsed = Object.values(ideas).filter(arr => arr.length > 0).length;
        score += (categoriesUsed / 7) * 0.3;
        // Quality factor (0-0.2)
        const avgIdeaLength = this.getAverageIdeaLength(ideas);
        score += Math.min(avgIdeaLength / 100, 0.2);
        // Wild ideas bonus (0-0.2)
        if (answers.wild_ideas && answers.wild_ideas.length > 50) {
            score += 0.2;
        }
        return Math.min(score, 1);
    }
    calculateConfidence(ideas) {
        const totalIdeas = this.countTotalIdeas(ideas);
        const categoriesUsed = Object.values(ideas).filter(arr => arr.length > 0).length;
        let confidence = 0.3; // Base confidence
        // More ideas increase confidence
        if (totalIdeas >= 15)
            confidence += 0.3;
        else if (totalIdeas >= 8)
            confidence += 0.2;
        else if (totalIdeas >= 4)
            confidence += 0.1;
        // More categories increase confidence  
        confidence += (categoriesUsed / 7) * 0.4;
        return Math.min(confidence, 1);
    }
    countTotalIdeas(ideas) {
        return Object.values(ideas).reduce((sum, arr) => sum + arr.length, 0);
    }
    getCategoryCounts(ideas) {
        return {
            substitute: ideas.substitute.length,
            combine: ideas.combine.length,
            adapt: ideas.adapt.length,
            modify: ideas.modify.length,
            putToOtherUses: ideas.putToOtherUses.length,
            eliminate: ideas.eliminate.length,
            reverse: ideas.reverse.length
        };
    }
    getMaxCategory(counts) {
        let max = 0;
        let maxCategory = null;
        for (const [category, count] of Object.entries(counts)) {
            if (count > max) {
                max = count;
                maxCategory = category;
            }
        }
        return maxCategory;
    }
    getMinCategory(counts) {
        let min = Infinity;
        let minCategory = null;
        for (const [category, count] of Object.entries(counts)) {
            if (count < min) {
                min = count;
                minCategory = category;
            }
        }
        return minCategory;
    }
    formatCategoryName(category) {
        const names = {
            substitute: 'Substitute',
            combine: 'Combine',
            adapt: 'Adapt',
            modify: 'Modify',
            putToOtherUses: 'Other Uses',
            eliminate: 'Eliminate',
            reverse: 'Reverse'
        };
        return names[category] || category;
    }
    alignsWithGoal(idea, goal) {
        const ideaWords = idea.toLowerCase().split(/\s+/);
        const goalWords = goal.toLowerCase().split(/\s+/);
        const commonWords = ideaWords.filter(w => goalWords.includes(w) && w.length > 3);
        return commonWords.length >= 2;
    }
    identifyAdaptationSources(adaptIdeas) {
        const sources = [];
        const industries = ['tech', 'retail', 'healthcare', 'education', 'finance', 'entertainment', 'food', 'travel'];
        adaptIdeas.forEach(idea => {
            industries.forEach(industry => {
                if (idea.toLowerCase().includes(industry)) {
                    sources.push(industry);
                }
            });
        });
        return [...new Set(sources)];
    }
    getAverageIdeaLength(ideas) {
        const allIdeas = Object.values(ideas).flat();
        if (allIdeas.length === 0)
            return 0;
        const totalLength = allIdeas.reduce((sum, idea) => sum + idea.length, 0);
        return totalLength / allIdeas.length;
    }
    getTemplate() {
        return `# SCAMPER Innovation Analysis

## Current State
[Description of what exists today]

## Innovation Goal  
[What you're trying to achieve]

## SCAMPER Ideas

### SUBSTITUTE
- [What can be replaced]
- [Alternative materials/methods]

### COMBINE
- [What can be merged]
- [Integration opportunities]

### ADAPT
- [Ideas from other contexts]
- [Borrowed concepts]

### MODIFY/MAGNIFY
- [What to emphasize]
- [What to minimize]

### PUT TO OTHER USES
- [Alternative applications]
- [New user groups]

### ELIMINATE
- [What to remove]
- [Simplification opportunities]

### REVERSE/REARRANGE
- [What to flip]
- [New sequences]

## Top 5 Innovations
1. [Highest scoring idea]
2. [Second idea]
3. [Third idea]
4. [Fourth idea]
5. [Fifth idea]

## Wild Ideas
[Crazy concepts worth exploring]

## Implementation Plan
1. [Immediate next step]
2. [Validation approach]
3. [Resource requirements]

## Innovation Score
[0-100% based on quantity, diversity, and quality]`;
    }
    getEstimatedTime() {
        return 25; // 25 minutes for comprehensive SCAMPER session
    }
    getDifficulty() {
        return 'beginner'; // SCAMPER is accessible to all levels
    }
}
exports.SCAMPERFramework = SCAMPERFramework;
//# sourceMappingURL=scamper-framework.js.map