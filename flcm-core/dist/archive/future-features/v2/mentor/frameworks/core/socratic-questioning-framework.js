"use strict";
/**
 * Socratic Questioning Framework
 * Deep understanding through systematic questioning (6 levels)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocraticQuestioningFramework = void 0;
const base_1 = require("../base");
class SocraticQuestioningFramework extends base_1.ProgressiveFramework {
    constructor() {
        super();
        this.levels = [
            'Clarification',
            'Assumptions',
            'Evidence & Reasoning',
            'Viewpoints & Perspectives',
            'Implications & Consequences',
            'Questions About Questions'
        ];
        this.name = 'Socratic Questioning Framework';
        this.description = 'Achieve deep understanding through systematic questioning across 6 levels';
        this.version = '2.0';
        this.category = 'critical-thinking';
        this.tags = ['critical-thinking', 'analysis', 'understanding', 'philosophy', 'depth'];
        this.maxDepth = 6;
    }
    getIntroduction(context) {
        return `The Socratic Method uses systematic questioning to achieve deep understanding of ${context?.topic || 'your topic'}.

We'll explore 6 levels of inquiry:
1. **Clarification** - What do you really mean?
2. **Assumptions** - What are you assuming?
3. **Evidence** - How do you know?
4. **Perspectives** - What's another way to look at it?
5. **Implications** - What follows from this?
6. **Meta-Questions** - Why is this question important?

Each level deepens understanding and challenges thinking. Let's begin.`;
    }
    getQuestions(context) {
        return this.getQuestionsForDepth(1, context);
    }
    getQuestionsForDepth(depth, context) {
        const questions = [];
        const topic = context?.topic || 'this';
        switch (depth) {
            case 1: // Clarification
                questions.push({
                    id: 'clarify_meaning',
                    question: `What exactly do you mean when you say "${topic}"? Define it in your own words.`,
                    type: 'open',
                    required: true
                }, {
                    id: 'clarify_example',
                    question: `Can you give me a specific example of ${topic} in action?`,
                    type: 'open',
                    required: true
                }, {
                    id: 'clarify_distinction',
                    question: `How is ${topic} different from similar concepts? What makes it unique?`,
                    type: 'open',
                    required: true
                }, {
                    id: 'clarify_importance',
                    question: `Why is understanding ${topic} important to you specifically?`,
                    type: 'open',
                    required: true
                });
                break;
            case 2: // Assumptions
                questions.push({
                    id: 'identify_assumptions',
                    question: `What assumptions are you making about ${topic}? List at least 3.`,
                    type: 'open',
                    required: true,
                    followUp: 'Consider: What are you taking for granted? What "must be true" for your view to hold?'
                }, {
                    id: 'challenge_assumption',
                    question: 'Pick your strongest assumption. What if the opposite were true?',
                    type: 'open',
                    required: true
                }, {
                    id: 'assumption_origin',
                    question: 'Where did these assumptions come from? Personal experience, education, culture?',
                    type: 'open',
                    required: true
                }, {
                    id: 'necessary_assumptions',
                    question: 'Which assumptions are absolutely necessary vs. which could be changed?',
                    type: 'open',
                    required: true
                });
                break;
            case 3: // Evidence & Reasoning
                questions.push({
                    id: 'evidence_basis',
                    question: `What evidence supports your understanding of ${topic}?`,
                    type: 'open',
                    required: true,
                    followUp: 'Include: Data, experiences, observations, research'
                }, {
                    id: 'evidence_quality',
                    question: 'How reliable is this evidence? What makes you trust it?',
                    type: 'open',
                    required: true
                }, {
                    id: 'counter_evidence',
                    question: 'What evidence might contradict your view? How do you explain it?',
                    type: 'open',
                    required: true
                }, {
                    id: 'reasoning_process',
                    question: 'Walk me through your reasoning. How did you get from evidence to conclusion?',
                    type: 'open',
                    required: true
                }, {
                    id: 'logical_fallacies',
                    question: 'Are there any logical gaps or potential fallacies in your reasoning?',
                    type: 'open',
                    required: false
                });
                break;
            case 4: // Viewpoints & Perspectives
                questions.push({
                    id: 'alternative_views',
                    question: `What are 3 completely different ways to think about ${topic}?`,
                    type: 'open',
                    required: true,
                    followUp: 'Consider: How would different professions, cultures, or philosophies view this?'
                }, {
                    id: 'opposing_view',
                    question: 'What would someone who completely disagrees with you say? Steel-man their argument.',
                    type: 'open',
                    required: true
                }, {
                    id: 'perspective_validity',
                    question: 'Which alternative perspective has the most merit? Why?',
                    type: 'open',
                    required: true
                }, {
                    id: 'perspective_synthesis',
                    question: 'Can multiple perspectives be true simultaneously? How might they combine?',
                    type: 'open',
                    required: true
                }, {
                    id: 'blind_spots',
                    question: 'What might you be missing due to your particular perspective or background?',
                    type: 'open',
                    required: true
                });
                break;
            case 5: // Implications & Consequences
                questions.push({
                    id: 'logical_implications',
                    question: `If your understanding of ${topic} is correct, what must also be true?`,
                    type: 'open',
                    required: true
                }, {
                    id: 'practical_consequences',
                    question: 'What are the real-world consequences of this view? How does it change actions?',
                    type: 'open',
                    required: true
                }, {
                    id: 'future_implications',
                    question: 'Project forward: What happens in 1 year, 5 years, 10 years if this holds true?',
                    type: 'open',
                    required: true
                }, {
                    id: 'ethical_implications',
                    question: 'What ethical or moral implications follow from this understanding?',
                    type: 'open',
                    required: true
                }, {
                    id: 'systemic_effects',
                    question: 'How does this affect related systems, fields, or domains?',
                    type: 'open',
                    required: false
                });
                break;
            case 6: // Questions About Questions
                questions.push({
                    id: 'meta_purpose',
                    question: 'Why are these questions about ' + topic + ' important to ask?',
                    type: 'open',
                    required: true
                }, {
                    id: 'meta_framing',
                    question: 'How does the way we frame these questions influence the answers?',
                    type: 'open',
                    required: true
                }, {
                    id: 'better_questions',
                    question: 'What better questions should we be asking about ' + topic + '?',
                    type: 'open',
                    required: true
                }, {
                    id: 'question_assumptions',
                    question: 'What assumptions are built into the questions themselves?',
                    type: 'open',
                    required: true
                }, {
                    id: 'ultimate_question',
                    question: 'What is the ONE most important question about ' + topic + ' that remains unanswered?',
                    type: 'open',
                    required: true
                });
                break;
        }
        return questions;
    }
    shouldGoDeeper(answers, depth) {
        // Continue if answers show engagement and we haven't reached max depth
        const totalAnswerLength = Object.values(answers)
            .filter(a => typeof a === 'string')
            .reduce((sum, a) => sum + a.length, 0);
        const avgAnswerLength = totalAnswerLength / Object.keys(answers).length;
        // Go deeper if answers are substantial (avg > 100 chars) and depth < max
        return avgAnswerLength > 100 && depth < this.maxDepth;
    }
    async process(answers, context) {
        // Organize answers by level
        const levelAnalysis = this.analyzeLevels(answers);
        // Generate insights
        const insights = this.generateInsights(levelAnalysis, answers);
        // Generate recommendations
        const recommendations = this.generateRecommendations(levelAnalysis, answers);
        // Generate next steps
        const nextSteps = this.generateNextSteps(levelAnalysis, answers);
        // Calculate understanding depth
        const understandingDepth = this.calculateUnderstandingDepth(levelAnalysis, answers);
        return {
            insights,
            recommendations,
            nextSteps,
            data: {
                depthReached: this.currentDepth,
                levelAnalysis,
                understandingDepth,
                keyRealizations: this.extractKeyRealizations(answers),
                assumptionsIdentified: this.extractAssumptions(answers),
                perspectivesExplored: this.extractPerspectives(answers),
                criticalQuestions: this.extractCriticalQuestions(answers)
            },
            confidence: understandingDepth,
            metadata: {
                framework: 'Socratic Questioning',
                version: this.version,
                levelsCompleted: this.currentDepth,
                socraticLevel: this.getSocraticLevel(understandingDepth)
            }
        };
    }
    analyzeLevels(answers) {
        const levels = [];
        // Level 1: Clarification
        if (answers.clarify_meaning) {
            levels.push({
                level: 1,
                name: 'Clarification',
                focus: 'Defining and understanding',
                questions: this.getAnsweredQuestions(answers, 'clarify'),
                insights: this.generateLevelInsights(answers, 'clarify')
            });
        }
        // Level 2: Assumptions
        if (answers.identify_assumptions) {
            levels.push({
                level: 2,
                name: 'Assumptions',
                focus: 'Uncovering hidden beliefs',
                questions: this.getAnsweredQuestions(answers, 'assumption'),
                insights: this.generateLevelInsights(answers, 'assumption')
            });
        }
        // Level 3: Evidence
        if (answers.evidence_basis) {
            levels.push({
                level: 3,
                name: 'Evidence & Reasoning',
                focus: 'Validating understanding',
                questions: this.getAnsweredQuestions(answers, 'evidence'),
                insights: this.generateLevelInsights(answers, 'evidence', 'reasoning')
            });
        }
        // Level 4: Perspectives
        if (answers.alternative_views) {
            levels.push({
                level: 4,
                name: 'Viewpoints & Perspectives',
                focus: 'Expanding viewpoint',
                questions: this.getAnsweredQuestions(answers, 'perspective', 'view'),
                insights: this.generateLevelInsights(answers, 'perspective', 'view')
            });
        }
        // Level 5: Implications
        if (answers.logical_implications) {
            levels.push({
                level: 5,
                name: 'Implications & Consequences',
                focus: 'Understanding impact',
                questions: this.getAnsweredQuestions(answers, 'implications', 'consequences'),
                insights: this.generateLevelInsights(answers, 'implications', 'consequences')
            });
        }
        // Level 6: Meta-questions
        if (answers.meta_purpose) {
            levels.push({
                level: 6,
                name: 'Questions About Questions',
                focus: 'Meta-cognitive awareness',
                questions: this.getAnsweredQuestions(answers, 'meta', 'question'),
                insights: this.generateLevelInsights(answers, 'meta', 'question')
            });
        }
        return levels;
    }
    getAnsweredQuestions(answers, ...keywords) {
        return Object.keys(answers).filter(key => keywords.some(keyword => key.includes(keyword)));
    }
    generateLevelInsights(answers, ...keywords) {
        const insights = [];
        const relevantAnswers = Object.entries(answers).filter(([key]) => keywords.some(keyword => key.includes(keyword)));
        relevantAnswers.forEach(([key, value]) => {
            if (typeof value === 'string' && value.length > 50) {
                // Extract key phrases or realizations
                if (value.includes('realize') || value.includes('understand')) {
                    insights.push('New realization identified in response');
                }
                if (value.includes('assume') || value.includes('belief')) {
                    insights.push('Hidden assumption uncovered');
                }
                if (value.includes('different') || value.includes('alternative')) {
                    insights.push('Alternative perspective recognized');
                }
            }
        });
        return insights;
    }
    generateInsights(levels, answers) {
        const insights = [];
        // Depth insights
        if (levels.length >= 5) {
            insights.push('Exceptional depth of inquiry achieved across multiple Socratic levels');
        }
        else if (levels.length >= 3) {
            insights.push('Good analytical depth reached through systematic questioning');
        }
        else {
            insights.push('Initial exploration completed - deeper inquiry recommended');
        }
        // Clarification insights
        if (answers.clarify_distinction) {
            insights.push('Clear differentiation established from related concepts');
        }
        // Assumption insights
        if (answers.identify_assumptions && answers.challenge_assumption) {
            const assumptions = this.extractAssumptions(answers);
            if (assumptions.length > 3) {
                insights.push('Multiple hidden assumptions identified - critical for valid reasoning');
            }
        }
        // Evidence insights
        if (answers.counter_evidence) {
            insights.push('Considering counter-evidence demonstrates intellectual honesty');
        }
        // Perspective insights
        if (answers.alternative_views && answers.perspective_synthesis) {
            insights.push('Synthesis of multiple perspectives creates richer understanding');
        }
        // Meta insights
        if (answers.meta_purpose && answers.better_questions) {
            insights.push('Meta-cognitive awareness achieved - thinking about thinking');
        }
        return insights;
    }
    generateRecommendations(levels, answers) {
        const recommendations = [];
        // Based on depth reached
        if (levels.length < 3) {
            recommendations.push('Continue Socratic inquiry to reach Evidence and Perspectives levels');
        }
        else if (levels.length < 5) {
            recommendations.push('Explore implications and consequences for practical application');
        }
        else {
            recommendations.push('Apply meta-cognitive insights to refine understanding further');
        }
        // Assumption-based recommendations
        if (answers.identify_assumptions) {
            const assumptions = this.extractAssumptions(answers);
            if (assumptions.some(a => a.includes('must') || a.includes('always'))) {
                recommendations.push('Challenge absolute assumptions - few things are universally true');
            }
        }
        // Evidence-based recommendations
        if (answers.evidence_quality && answers.evidence_quality.toLowerCase().includes('weak')) {
            recommendations.push('Strengthen position with higher quality evidence and data');
        }
        // Perspective-based recommendations
        if (answers.blind_spots) {
            recommendations.push('Actively seek input from identified blind spot areas');
        }
        // Question-based recommendations
        if (answers.ultimate_question) {
            recommendations.push(`Priority: Investigate the ultimate question: "${answers.ultimate_question}"`);
        }
        return recommendations;
    }
    generateNextSteps(levels, answers) {
        const steps = [];
        // Based on current depth
        if (levels.length < 6) {
            steps.push(`Continue to Socratic Level ${levels.length + 1}: ${this.levels[levels.length]}`);
        }
        // Research steps
        if (answers.evidence_basis && answers.counter_evidence) {
            steps.push('Compile comprehensive evidence portfolio supporting and challenging view');
        }
        // Assumption testing
        if (answers.identify_assumptions) {
            steps.push('Design experiments or research to test key assumptions');
        }
        // Perspective gathering
        if (answers.alternative_views) {
            steps.push('Interview stakeholders representing different perspectives');
        }
        // Application steps
        if (answers.practical_consequences) {
            steps.push('Create action plan based on implications identified');
        }
        // Meta-learning
        if (answers.better_questions) {
            steps.push('Document new questions for future exploration sessions');
        }
        steps.push('Schedule follow-up Socratic session in 2 weeks to test evolved understanding');
        return steps;
    }
    calculateUnderstandingDepth(levels, answers) {
        let depth = 0;
        // Level completion (0-0.6)
        depth += (levels.length / 6) * 0.6;
        // Answer quality (0-0.2)
        const avgAnswerLength = this.calculateAverageAnswerLength(answers);
        if (avgAnswerLength > 200)
            depth += 0.2;
        else if (avgAnswerLength > 100)
            depth += 0.15;
        else if (avgAnswerLength > 50)
            depth += 0.1;
        // Critical thinking indicators (0-0.2)
        if (answers.challenge_assumption)
            depth += 0.05;
        if (answers.counter_evidence)
            depth += 0.05;
        if (answers.opposing_view)
            depth += 0.05;
        if (answers.better_questions)
            depth += 0.05;
        return Math.min(depth, 1);
    }
    extractKeyRealizations(answers) {
        const realizations = [];
        Object.values(answers).forEach(answer => {
            if (typeof answer === 'string') {
                // Look for realization patterns
                const patterns = [
                    /I realize(?:d)? that (.+)/i,
                    /I now understand (.+)/i,
                    /This shows me that (.+)/i,
                    /I hadn't considered (.+)/i
                ];
                patterns.forEach(pattern => {
                    const match = answer.match(pattern);
                    if (match) {
                        realizations.push(match[1].trim());
                    }
                });
            }
        });
        return realizations;
    }
    extractAssumptions(answers) {
        if (!answers.identify_assumptions)
            return [];
        return answers.identify_assumptions
            .split(/[\n;]/)
            .map((a) => a.trim())
            .filter((a) => a.length > 0);
    }
    extractPerspectives(answers) {
        const perspectives = [];
        if (answers.alternative_views) {
            const views = answers.alternative_views.split(/[\n;]/).map((v) => v.trim());
            perspectives.push(...views);
        }
        if (answers.opposing_view) {
            perspectives.push('Opposition: ' + answers.opposing_view.substring(0, 100));
        }
        return perspectives;
    }
    extractCriticalQuestions(answers) {
        const questions = [];
        if (answers.better_questions) {
            const betterQs = answers.better_questions.split(/[\n;?]/).map((q) => q.trim());
            questions.push(...betterQs.filter(q => q.length > 10));
        }
        if (answers.ultimate_question) {
            questions.push(answers.ultimate_question);
        }
        return questions;
    }
    calculateAverageAnswerLength(answers) {
        const lengths = Object.values(answers)
            .filter(a => typeof a === 'string')
            .map(a => a.length);
        if (lengths.length === 0)
            return 0;
        return lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    }
    getSocraticLevel(depth) {
        if (depth < 0.2)
            return 'Surface - Basic questioning';
        if (depth < 0.4)
            return 'Shallow - Some critical thinking';
        if (depth < 0.6)
            return 'Developing - Good inquiry skills';
        if (depth < 0.8)
            return 'Deep - Strong analytical thinking';
        return 'Master - Exceptional critical inquiry';
    }
    getTemplate() {
        return `# Socratic Questioning Analysis

## Topic Under Examination
[Your topic]

## Level 1: CLARIFICATION
**Core Definition**: [What it means]
**Key Example**: [Concrete instance]
**Unique Aspects**: [What makes it distinct]
**Importance**: [Why it matters]

## Level 2: ASSUMPTIONS
**Identified Assumptions**:
1. [Assumption 1]
2. [Assumption 2]
3. [Assumption 3]

**Challenged Assumption**: [What if opposite were true?]
**Origin**: [Where assumptions come from]

## Level 3: EVIDENCE & REASONING
**Supporting Evidence**: [Data/observations]
**Evidence Quality**: [Reliability assessment]
**Counter-Evidence**: [Contradicting data]
**Reasoning Chain**: [How conclusions drawn]

## Level 4: PERSPECTIVES
**Alternative Views**:
- [Perspective 1]
- [Perspective 2]
- [Perspective 3]

**Opposing Argument**: [Steel-man opposition]
**Synthesis**: [How views combine]

## Level 5: IMPLICATIONS
**Logical Consequences**: [What must follow]
**Practical Impact**: [Real-world effects]
**Future Projection**: [Long-term outcomes]
**Ethical Considerations**: [Moral implications]

## Level 6: META-QUESTIONS
**Why These Questions Matter**: [Purpose of inquiry]
**Question Framing Effects**: [How questions shape answers]
**Better Questions**: [Improved inquiries]
**Ultimate Unanswered Question**: [Core mystery]

## Key Realizations
1. [Major insight 1]
2. [Major insight 2]
3. [Major insight 3]

## Understanding Depth
[Surface → Shallow → Developing → Deep → Master]

## Next Steps
1. [Continue inquiry]
2. [Test assumptions]
3. [Gather perspectives]`;
    }
    getEstimatedTime() {
        return 30; // 30 minutes for full 6-level Socratic inquiry
    }
    getDifficulty() {
        return 'advanced'; // Requires strong critical thinking skills
    }
}
exports.SocraticQuestioningFramework = SocraticQuestioningFramework;
//# sourceMappingURL=socratic-questioning-framework.js.map