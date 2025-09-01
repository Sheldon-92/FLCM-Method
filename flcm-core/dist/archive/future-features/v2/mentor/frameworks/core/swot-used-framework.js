"use strict";
/**
 * SWOT-USED Framework
 * Enhanced SWOT analysis with actionable strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWOTUSEDFramework = void 0;
const base_1 = require("../base");
class SWOTUSEDFramework extends base_1.BaseFramework {
    constructor() {
        super();
        this.name = 'SWOT-USED Analysis';
        this.description = 'Strategic analysis combining traditional SWOT with actionable USED strategies';
        this.version = '2.0';
        this.category = 'strategic-analysis';
        this.tags = ['strategy', 'analysis', 'planning', 'decision-making'];
    }
    getIntroduction(context) {
        return `The SWOT-USED framework extends traditional SWOT analysis with actionable strategies.

**SWOT** (Analysis):
• Strengths - Internal advantages
• Weaknesses - Internal limitations
• Opportunities - External possibilities
• Threats - External challenges

**USED** (Action):
• Use - Leverage your strengths
• Stop - Address weaknesses
• Exploit - Capitalize on opportunities
• Defend - Protect against threats

Let's analyze ${context?.topic || 'your situation'} strategically and create an action plan.`;
    }
    getQuestions(context) {
        return [
            // Strengths
            {
                id: 'strengths',
                question: `What are the key STRENGTHS of ${context?.topic || 'your project/situation'}? List internal advantages, unique resources, or competitive edges.`,
                type: 'open',
                required: true,
                followUp: 'Consider: skills, resources, reputation, unique features, market position'
            },
            // Weaknesses
            {
                id: 'weaknesses',
                question: 'What are the main WEAKNESSES or limitations? What internal factors hold you back?',
                type: 'open',
                required: true,
                followUp: 'Consider: resource gaps, skill deficits, process inefficiencies, reputation issues'
            },
            // Opportunities
            {
                id: 'opportunities',
                question: 'What external OPPORTUNITIES exist? What trends or changes could you benefit from?',
                type: 'open',
                required: true,
                followUp: 'Consider: market trends, technology changes, regulatory shifts, competitor weaknesses'
            },
            // Threats
            {
                id: 'threats',
                question: 'What external THREATS or risks do you face? What could harm your success?',
                type: 'open',
                required: true,
                followUp: 'Consider: competition, market changes, economic factors, technological disruption'
            },
            // Context for better strategies
            {
                id: 'primary_goal',
                question: 'What is your primary goal or objective with this analysis?',
                type: 'open',
                required: true
            },
            {
                id: 'resources_available',
                question: 'What resources (time, budget, people) do you have available for implementation?',
                type: 'open',
                required: false
            },
            {
                id: 'timeline',
                question: 'What is your timeline for action? When do you need to see results?',
                type: 'open',
                required: false
            },
            {
                id: 'risk_tolerance',
                question: 'What is your risk tolerance?',
                type: 'multiple-choice',
                required: true,
                options: [
                    'Very Low - Minimize all risks',
                    'Low - Careful, measured approach',
                    'Medium - Balanced risk/reward',
                    'High - Willing to take calculated risks',
                    'Very High - Aggressive growth focus'
                ]
            }
        ];
    }
    async process(answers, context) {
        // Parse SWOT elements
        const analysis = {
            strengths: this.parseListInput(answers.strengths),
            weaknesses: this.parseListInput(answers.weaknesses),
            opportunities: this.parseListInput(answers.opportunities),
            threats: this.parseListInput(answers.threats),
            use: [],
            stop: [],
            exploit: [],
            defend: []
        };
        // Generate USED strategies
        analysis.use = this.generateUseStrategies(analysis.strengths, analysis.opportunities, answers);
        analysis.stop = this.generateStopStrategies(analysis.weaknesses, analysis.threats, answers);
        analysis.exploit = this.generateExploitStrategies(analysis.opportunities, analysis.strengths, answers);
        analysis.defend = this.generateDefendStrategies(analysis.threats, analysis.strengths, answers);
        // Generate insights
        const insights = this.generateInsights(analysis, answers);
        // Generate recommendations
        const recommendations = this.generateRecommendations(analysis, answers);
        // Generate next steps
        const nextSteps = this.generateNextSteps(analysis, answers);
        // Calculate strategic position
        const strategicPosition = this.calculateStrategicPosition(analysis);
        return {
            insights,
            recommendations,
            nextSteps,
            data: {
                swotAnalysis: analysis,
                strategicPosition,
                primaryGoal: answers.primary_goal,
                riskProfile: this.extractRiskProfile(answers.risk_tolerance),
                timeline: answers.timeline,
                resources: answers.resources_available
            },
            confidence: this.calculateConfidence(analysis),
            metadata: {
                framework: 'SWOT-USED',
                version: this.version,
                analysisDate: new Date().toISOString()
            }
        };
    }
    parseListInput(input) {
        return input
            .split(/[\n,;]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }
    generateUseStrategies(strengths, opportunities, answers) {
        const strategies = [];
        // Match strengths to opportunities
        strengths.forEach(strength => {
            opportunities.forEach(opportunity => {
                if (this.areRelated(strength, opportunity)) {
                    strategies.push(`Leverage ${this.summarize(strength)} to capture ${this.summarize(opportunity)}`);
                }
            });
        });
        // General strength utilization
        if (strengths.length > 0) {
            strategies.push(`Focus resources on your strongest area: ${strengths[0]}`);
            strategies.push(`Use competitive advantages to differentiate from alternatives`);
        }
        return strategies.slice(0, 5); // Limit to top 5 strategies
    }
    generateStopStrategies(weaknesses, threats, answers) {
        const strategies = [];
        // Critical weaknesses that amplify threats
        weaknesses.forEach(weakness => {
            threats.forEach(threat => {
                if (this.areRelated(weakness, threat)) {
                    strategies.push(`Priority: Address ${this.summarize(weakness)} to reduce vulnerability to ${this.summarize(threat)}`);
                }
            });
        });
        // General weakness mitigation
        weaknesses.forEach(weakness => {
            if (weakness.toLowerCase().includes('lack') || weakness.toLowerCase().includes('no ')) {
                strategies.push(`Stop operating without ${this.extractMissing(weakness)}`);
            }
            else if (weakness.toLowerCase().includes('poor') || weakness.toLowerCase().includes('weak')) {
                strategies.push(`Stop accepting substandard ${this.extractProblem(weakness)}`);
            }
        });
        return strategies.slice(0, 5);
    }
    generateExploitStrategies(opportunities, strengths, answers) {
        const strategies = [];
        const riskTolerance = this.extractRiskProfile(answers.risk_tolerance);
        opportunities.forEach((opportunity, index) => {
            if (index < 3) { // Focus on top 3 opportunities
                if (opportunity.toLowerCase().includes('market') || opportunity.toLowerCase().includes('demand')) {
                    strategies.push(`Fast-track market entry to capture ${this.summarize(opportunity)}`);
                }
                else if (opportunity.toLowerCase().includes('technology') || opportunity.toLowerCase().includes('digital')) {
                    strategies.push(`Invest in technology to exploit ${this.summarize(opportunity)}`);
                }
                else if (opportunity.toLowerCase().includes('partnership') || opportunity.toLowerCase().includes('collaboration')) {
                    strategies.push(`Actively pursue strategic partnerships for ${this.summarize(opportunity)}`);
                }
                else {
                    strategies.push(`Develop specific plan to capitalize on ${this.summarize(opportunity)}`);
                }
            }
        });
        // Risk-adjusted strategies
        if (riskTolerance >= 0.7) {
            strategies.push('Consider bold moves to capture opportunities before competitors');
        }
        else if (riskTolerance <= 0.3) {
            strategies.push('Test opportunities with small pilots before full commitment');
        }
        return strategies.slice(0, 5);
    }
    generateDefendStrategies(threats, strengths, answers) {
        const strategies = [];
        threats.forEach((threat, index) => {
            if (index < 3) { // Focus on top 3 threats
                if (threat.toLowerCase().includes('competition') || threat.toLowerCase().includes('competitor')) {
                    strategies.push(`Build defensive moat using ${strengths[0] || 'unique strengths'}`);
                }
                else if (threat.toLowerCase().includes('regulation') || threat.toLowerCase().includes('compliance')) {
                    strategies.push(`Proactively ensure compliance and build regulatory relationships`);
                }
                else if (threat.toLowerCase().includes('economic') || threat.toLowerCase().includes('recession')) {
                    strategies.push(`Diversify revenue streams and build financial reserves`);
                }
                else if (threat.toLowerCase().includes('technology')) {
                    strategies.push(`Invest in innovation to stay ahead of disruption`);
                }
                else {
                    strategies.push(`Develop contingency plan for ${this.summarize(threat)}`);
                }
            }
        });
        // Use strengths for defense
        if (strengths.length > 0) {
            strategies.push(`Fortify position by doubling down on ${strengths[0]}`);
        }
        return strategies.slice(0, 5);
    }
    generateInsights(analysis, answers) {
        const insights = [];
        // Balance analysis
        const balance = {
            internal: analysis.strengths.length - analysis.weaknesses.length,
            external: analysis.opportunities.length - analysis.threats.length
        };
        if (balance.internal > 2) {
            insights.push('Strong internal position provides solid foundation for growth');
        }
        else if (balance.internal < -2) {
            insights.push('Internal weaknesses require immediate attention before external expansion');
        }
        else {
            insights.push('Balanced internal position allows focus on external factors');
        }
        if (balance.external > 2) {
            insights.push('Favorable external environment creates window for aggressive action');
        }
        else if (balance.external < -2) {
            insights.push('Challenging external environment requires defensive positioning');
        }
        // Strategic matches
        let soMatches = 0;
        analysis.strengths.forEach(s => {
            analysis.opportunities.forEach(o => {
                if (this.areRelated(s, o))
                    soMatches++;
            });
        });
        if (soMatches > 3) {
            insights.push('Multiple strength-opportunity matches indicate high growth potential');
        }
        // Risk analysis
        let wtMatches = 0;
        analysis.weaknesses.forEach(w => {
            analysis.threats.forEach(t => {
                if (this.areRelated(w, t))
                    wtMatches++;
            });
        });
        if (wtMatches > 2) {
            insights.push('Critical weakness-threat combinations require immediate risk mitigation');
        }
        // Resource alignment
        if (answers.resources_available) {
            if (answers.resources_available.toLowerCase().includes('limited')) {
                insights.push('Limited resources require focused strategy on highest-impact actions');
            }
            else if (answers.resources_available.toLowerCase().includes('substantial') ||
                answers.resources_available.toLowerCase().includes('significant')) {
                insights.push('Available resources enable pursuing multiple strategic initiatives');
            }
        }
        return insights;
    }
    generateRecommendations(analysis, answers) {
        const recommendations = [];
        const position = this.calculateStrategicPosition(analysis);
        if (position === 'aggressive') {
            recommendations.push('Pursue aggressive growth strategy leveraging strengths and opportunities');
            recommendations.push('Invest heavily in market expansion and capability building');
        }
        else if (position === 'competitive') {
            recommendations.push('Focus on differentiation and selective opportunity pursuit');
            recommendations.push('Strengthen core capabilities while exploring new markets');
        }
        else if (position === 'conservative') {
            recommendations.push('Prioritize fixing weaknesses before pursuing opportunities');
            recommendations.push('Build stronger foundation through capability development');
        }
        else if (position === 'defensive') {
            recommendations.push('Focus on survival and risk mitigation strategies');
            recommendations.push('Consolidate resources and strengthen defensive positions');
        }
        // Timeline-based recommendations
        if (answers.timeline) {
            if (answers.timeline.toLowerCase().includes('immediate') ||
                answers.timeline.toLowerCase().includes('urgent')) {
                recommendations.push('Implement quick wins from USE strategies within 30 days');
            }
            else if (answers.timeline.toLowerCase().includes('quarter')) {
                recommendations.push('Create 90-day sprint plan focusing on top 3 USED actions');
            }
        }
        // Add specific USED recommendations
        if (analysis.use.length > 0) {
            recommendations.push(`Priority Action: ${analysis.use[0]}`);
        }
        if (analysis.stop.length > 0 && analysis.weaknesses.length > analysis.strengths.length) {
            recommendations.push(`Critical Fix: ${analysis.stop[0]}`);
        }
        return recommendations;
    }
    generateNextSteps(analysis, answers) {
        const steps = [];
        // Immediate actions (Week 1)
        steps.push('Document and share SWOT-USED analysis with stakeholders');
        steps.push('Prioritize USED strategies based on impact and feasibility');
        // Short-term actions (Month 1)
        if (analysis.stop.length > 0) {
            steps.push(`Begin addressing top weakness: ${this.summarize(analysis.weaknesses[0] || '')}`);
        }
        if (analysis.use.length > 0) {
            steps.push(`Activate strength leverage plan: ${this.summarize(analysis.use[0])}`);
        }
        // Medium-term actions (Quarter 1)
        if (analysis.exploit.length > 0) {
            steps.push(`Launch initiative to capture opportunity: ${this.summarize(analysis.opportunities[0] || '')}`);
        }
        if (analysis.defend.length > 0) {
            steps.push(`Implement defensive measures against primary threat`);
        }
        // Ongoing actions
        steps.push('Schedule monthly SWOT-USED review to track progress and adjust strategies');
        return steps;
    }
    calculateStrategicPosition(analysis) {
        const strengthScore = analysis.strengths.length;
        const weaknessScore = analysis.weaknesses.length;
        const opportunityScore = analysis.opportunities.length;
        const threatScore = analysis.threats.length;
        const internalScore = strengthScore - weaknessScore;
        const externalScore = opportunityScore - threatScore;
        if (internalScore > 0 && externalScore > 0) {
            return 'aggressive'; // SO - Strengths & Opportunities
        }
        else if (internalScore > 0 && externalScore <= 0) {
            return 'competitive'; // ST - Strengths & Threats
        }
        else if (internalScore <= 0 && externalScore > 0) {
            return 'conservative'; // WO - Weaknesses & Opportunities
        }
        else {
            return 'defensive'; // WT - Weaknesses & Threats
        }
    }
    calculateConfidence(analysis) {
        let confidence = 0.5; // Base confidence
        // More detailed analysis increases confidence
        const totalItems = analysis.strengths.length + analysis.weaknesses.length +
            analysis.opportunities.length + analysis.threats.length;
        if (totalItems >= 12)
            confidence += 0.3;
        else if (totalItems >= 8)
            confidence += 0.2;
        else if (totalItems >= 4)
            confidence += 0.1;
        // Balanced analysis increases confidence
        const hasAllQuadrants = analysis.strengths.length > 0 && analysis.weaknesses.length > 0 &&
            analysis.opportunities.length > 0 && analysis.threats.length > 0;
        if (hasAllQuadrants)
            confidence += 0.2;
        return Math.min(confidence, 1);
    }
    areRelated(item1, item2) {
        // Simple keyword matching - could be enhanced with NLP
        const words1 = item1.toLowerCase().split(/\s+/);
        const words2 = item2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(w => words2.includes(w) && w.length > 4);
        return commonWords.length > 0;
    }
    summarize(text) {
        // Take first 50 characters or until first comma/period
        const truncated = text.substring(0, 50);
        const endIndex = Math.min(truncated.indexOf(',') > 0 ? truncated.indexOf(',') : 50, truncated.indexOf('.') > 0 ? truncated.indexOf('.') : 50);
        return text.substring(0, endIndex).trim();
    }
    extractMissing(weakness) {
        const match = weakness.match(/lack(?:\s+of)?\s+(.+)/i) ||
            weakness.match(/no\s+(.+)/i);
        return match ? match[1] : 'critical capability';
    }
    extractProblem(weakness) {
        const match = weakness.match(/(?:poor|weak)\s+(.+)/i);
        return match ? match[1] : 'performance';
    }
    extractRiskProfile(riskTolerance) {
        if (riskTolerance.includes('Very Low'))
            return 0.1;
        if (riskTolerance.includes('Low'))
            return 0.3;
        if (riskTolerance.includes('Medium'))
            return 0.5;
        if (riskTolerance.includes('High') && !riskTolerance.includes('Very'))
            return 0.7;
        if (riskTolerance.includes('Very High'))
            return 0.9;
        return 0.5;
    }
    getTemplate() {
        return `# SWOT-USED Strategic Analysis

## SWOT Analysis

### Strengths (Internal +)
- [Strength 1]
- [Strength 2]
- [Strength 3]

### Weaknesses (Internal -)
- [Weakness 1]
- [Weakness 2]
- [Weakness 3]

### Opportunities (External +)
- [Opportunity 1]
- [Opportunity 2]
- [Opportunity 3]

### Threats (External -)
- [Threat 1]
- [Threat 2]
- [Threat 3]

## USED Strategy

### USE (Leverage Strengths)
1. [How to use strength 1]
2. [How to use strength 2]

### STOP (Address Weaknesses)
1. [What to stop doing]
2. [Weakness to fix immediately]

### EXPLOIT (Capture Opportunities)
1. [How to exploit opportunity 1]
2. [How to exploit opportunity 2]

### DEFEND (Mitigate Threats)
1. [Defense against threat 1]
2. [Defense against threat 2]

## Strategic Position
[Aggressive/Competitive/Conservative/Defensive]

## Priority Actions
1. **Immediate** (This week): [Action]
2. **Short-term** (This month): [Action]
3. **Medium-term** (This quarter): [Action]

## Success Metrics
- [Metric 1]
- [Metric 2]
- [Metric 3]`;
    }
    getEstimatedTime() {
        return 20; // 20 minutes for thorough SWOT-USED analysis
    }
    getDifficulty() {
        return 'intermediate';
    }
}
exports.SWOTUSEDFramework = SWOTUSEDFramework;
//# sourceMappingURL=swot-used-framework.js.map