"use strict";
/**
 * SPARK Framework for Content Creation
 * Structure, Purpose, Audience, Relevance, Key Message
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPARKFramework = void 0;
/**
 * SPARK Framework Class
 */
class SPARKFramework {
    constructor() {
        this.hooks = {
            question: [
                'Have you ever wondered {topic}?',
                'What if I told you {revelation}?',
                'Why do {audience} struggle with {problem}?'
            ],
            statistic: [
                '{percentage}% of {audience} don\'t know {fact}',
                'Research shows {finding}',
                'In {timeframe}, {change} happened'
            ],
            story: [
                'Last {time}, I {experience}',
                'Picture this: {scenario}',
                'It was {time} when {event}'
            ],
            statement: [
                '{topic} is {adjective}',
                'The truth about {topic} is {revelation}',
                'Here\'s what {audience} need to know about {topic}'
            ],
            challenge: [
                'Most people think {misconception}, but {truth}',
                'The biggest mistake {audience} make is {error}',
                'Forget everything you know about {topic}'
            ]
        };
    }
    /**
     * Generate SPARK elements for content
     */
    generate(topic, synthesis, // Knowledge synthesis from Scholar
    targetAudience) {
        const audience = this.profileAudience(targetAudience || 'general readers', synthesis);
        const purpose = this.determinePurpose(topic, synthesis, audience);
        const structure = this.designStructure(topic, synthesis, purpose, audience);
        const relevance = this.assessRelevance(topic, synthesis);
        const keyMessage = this.extractKeyMessage(topic, synthesis);
        return {
            structure,
            purpose,
            audience,
            relevance,
            keyMessage
        };
    }
    /**
     * Create content structure
     */
    createStructure(topic, knowledge, purpose) {
        const depth = knowledge.depthAnalysis?.currentDepth || 1;
        const hasAnalogies = knowledge.analogies?.analogies?.length > 0;
        // Determine structure type based on content
        let type = 'linear';
        if (purpose.primary === 'educate') {
            type = depth >= 3 ? 'hierarchical' : 'linear';
        }
        else if (purpose.primary === 'persuade') {
            type = 'problem-solution';
        }
        else if (hasAnalogies) {
            type = 'comparison';
        }
        // Create sections
        const sections = this.generateSections(topic, knowledge, purpose, type);
        // Determine flow
        const flow = purpose.primary === 'inspire' ? 'emotional' :
            purpose.primary === 'educate' ? 'logical' : 'priority';
        // Determine length
        const wordCount = this.estimateWordCount(sections);
        const length = wordCount < 300 ? 'micro' :
            wordCount < 800 ? 'short' :
                wordCount < 1500 ? 'medium' : 'long';
        return { type, sections, flow, length };
    }
    /**
     * Generate content sections
     */
    generateSections(topic, knowledge, purpose, structureType) {
        const sections = [];
        // Hook section (always first)
        sections.push({
            name: 'hook',
            purpose: 'Capture attention and establish relevance',
            content: this.generateHook(topic, purpose, knowledge),
            weight: 0.15,
            elements: ['text']
        });
        // Structure-specific sections
        switch (structureType) {
            case 'problem-solution':
                sections.push({
                    name: 'problem',
                    purpose: 'Define the challenge',
                    content: this.extractProblem(knowledge),
                    weight: 0.25,
                    elements: ['text', 'data']
                }, {
                    name: 'solution',
                    purpose: 'Present the solution',
                    content: this.extractSolution(knowledge),
                    weight: 0.35,
                    elements: ['text', 'example', 'list']
                });
                break;
            case 'hierarchical':
                const levels = knowledge.depthAnalysis?.levels || [];
                levels.forEach((level, i) => {
                    if (level.complete) {
                        sections.push({
                            name: `level${i + 1}`,
                            purpose: level.name,
                            content: level.understanding.join(' '),
                            weight: 0.15,
                            elements: ['text', 'example']
                        });
                    }
                });
                break;
            case 'comparison':
                sections.push({
                    name: 'analogy',
                    purpose: 'Make concept relatable',
                    content: knowledge.analogies?.explanation || '',
                    weight: 0.2,
                    elements: ['text', 'example']
                });
                break;
            default: // linear
                sections.push({
                    name: 'main',
                    purpose: 'Deliver core content',
                    content: this.extractMainContent(knowledge),
                    weight: 0.4,
                    elements: ['text', 'list', 'data']
                }, {
                    name: 'examples',
                    purpose: 'Illustrate with examples',
                    content: this.extractExamples(knowledge),
                    weight: 0.2,
                    elements: ['example', 'quote']
                });
        }
        // Conclusion section (always last)
        sections.push({
            name: 'conclusion',
            purpose: 'Reinforce message and inspire action',
            content: this.generateConclusion(topic, purpose, knowledge),
            weight: 0.15,
            elements: ['text']
        });
        return sections;
    }
    /**
     * Profile the target audience
     */
    profileAudience(targetDescription, synthesis) {
        const description = targetDescription.toLowerCase();
        // Determine expertise level
        let expertise = 'intermediate';
        if (description.includes('beginner') || description.includes('new')) {
            expertise = 'beginner';
        }
        else if (description.includes('expert') || description.includes('senior')) {
            expertise = 'expert';
        }
        else if (description.includes('advanced')) {
            expertise = 'advanced';
        }
        // Extract interests from synthesis
        const interests = synthesis.concept?.context ?
            this.extractKeywords(synthesis.concept.context).slice(0, 5) :
            ['technology', 'innovation'];
        // Determine reading style based on content depth
        const depth = synthesis.depthAnalysis?.currentDepth || 1;
        const readingStyle = depth >= 4 ? 'studier' : depth >= 2 ? 'reader' : 'scanner';
        return {
            demographic: {
                profession: this.extractProfession(targetDescription),
                expertise,
                interests
            },
            psychographic: {
                values: ['efficiency', 'innovation', 'growth'],
                painPoints: this.extractPainPoints(synthesis),
                goals: this.extractGoals(synthesis),
                preferences: ['practical examples', 'clear explanations', 'actionable insights']
            },
            reading: {
                style: readingStyle,
                time: expertise === 'expert' ? 'extensive' : 'moderate',
                device: 'both'
            }
        };
    }
    /**
     * Determine content purpose
     */
    determinePurpose(topic, synthesis, audience) {
        // Analyze synthesis to determine purpose
        const hasQuestions = synthesis.questions?.size > 0;
        const hasAnalogies = synthesis.analogies?.analogies?.length > 0;
        const teachingReady = synthesis.metadata?.teachingReady;
        let primary = 'inform';
        if (teachingReady && hasQuestions) {
            primary = 'educate';
        }
        else if (synthesis.depthAnalysis?.nextSteps?.length > 0) {
            primary = 'inspire';
        }
        else if (hasAnalogies) {
            primary = 'persuade';
        }
        const outcome = this.determineOutcome(primary, audience);
        const action = this.generateCallToAction(primary, topic);
        return {
            primary,
            secondary: this.getSecondaryPurposes(primary),
            outcome,
            action
        };
    }
    /**
     * Design content structure
     */
    designStructure(topic, synthesis, purpose, audience) {
        return this.createStructure(topic, synthesis, purpose);
    }
    /**
     * Assess content relevance
     */
    assessRelevance(topic, synthesis) {
        const topicLower = topic.toLowerCase();
        // Determine timeliness
        let timeliness = 'evergreen';
        if (topicLower.includes('trend') || topicLower.includes('latest')) {
            timeliness = 'trending';
        }
        else if (topicLower.includes('new') || topicLower.includes('emerging')) {
            timeliness = 'current';
        }
        // Calculate uniqueness based on depth and insights
        const depth = synthesis.depthAnalysis?.currentDepth || 1;
        const uniqueness = Math.min(1, depth / 5 + (synthesis.analogies?.analogies?.length || 0) * 0.1);
        // Calculate practical value
        const hasExamples = synthesis.teachingNotes?.some((n) => n.type === 'example');
        const hasExercises = synthesis.teachingNotes?.some((n) => n.type === 'exercise');
        const practicalValue = (hasExamples ? 0.4 : 0) + (hasExercises ? 0.4 : 0) + 0.2;
        // Calculate emotional resonance
        const hasStory = synthesis.analogies?.bestAnalogy?.domain === 'everyday';
        const emotionalResonance = hasStory ? 0.6 : 0.3;
        // Calculate social currency
        const isShareable = uniqueness > 0.7 && emotionalResonance > 0.5;
        const socialCurrency = isShareable ? 0.8 : 0.4;
        return {
            timeliness,
            uniqueness,
            practicalValue,
            emotionalResonance,
            socialCurrency
        };
    }
    /**
     * Extract key message
     */
    extractKeyMessage(topic, synthesis) {
        const concept = synthesis.concept || { name: topic };
        const insights = synthesis.depthAnalysis?.levels?.[0]?.understanding || [];
        // Core message
        const core = concept.definition || `Understanding ${topic} transforms how we approach challenges`;
        // Supporting points
        const supporting = insights.slice(0, 3).map((i) => i.replace(/^[^:]+:\s*/, '') // Remove prefixes like "Definition:"
        );
        // Proof points
        const proof = [];
        if (synthesis.confidence > 0.7) {
            proof.push({
                type: 'authority',
                content: 'Based on comprehensive analysis and synthesis',
                strength: synthesis.confidence
            });
        }
        if (synthesis.analogies?.bestAnalogy) {
            proof.push({
                type: 'example',
                content: synthesis.analogies.bestAnalogy.mapping,
                strength: synthesis.analogies.bestAnalogy.strength
            });
        }
        // Memorable one-liner
        const memorable = this.createMemorableLine(topic, concept, synthesis);
        return {
            core,
            supporting,
            proof,
            memorable
        };
    }
    /**
     * Generate a compelling hook
     */
    generateHook(topic, purpose, knowledge) {
        const hookType = this.selectHookType(purpose, knowledge);
        const templates = this.hooks[hookType];
        const template = templates[Math.floor(Math.random() * templates.length)];
        return this.fillTemplate(template, {
            topic,
            audience: knowledge.audience || 'professionals',
            revelation: knowledge.concept?.definition || 'something surprising',
            problem: knowledge.gaps?.[0] || 'common challenges',
            percentage: Math.floor(Math.random() * 30 + 60),
            fact: knowledge.depthAnalysis?.levels?.[0]?.understanding?.[0] || 'this key insight',
            finding: knowledge.analogies?.explanation || 'significant patterns',
            timeframe: 'the last year',
            change: 'dramatic shifts',
            time: 'recently',
            experience: 'discovered something fascinating',
            scenario: `You're working on ${topic}`,
            event: 'everything changed',
            adjective: 'more complex than it seems',
            misconception: 'it\'s just a tool',
            truth: 'it\'s a complete paradigm shift',
            error: 'underestimating its impact'
        });
    }
    /**
     * Generate conclusion
     */
    generateConclusion(topic, purpose, knowledge) {
        const nextSteps = knowledge.depthAnalysis?.nextSteps || [];
        const action = purpose.action || 'Apply these insights to your work';
        let conclusion = `Understanding ${topic} `;
        switch (purpose.primary) {
            case 'educate':
                conclusion += `opens new possibilities for learning and growth. `;
                break;
            case 'inspire':
                conclusion += `is just the beginning of your journey. `;
                break;
            case 'persuade':
                conclusion += `will transform how you approach challenges. `;
                break;
            default:
                conclusion += `provides valuable insights for your work. `;
        }
        if (nextSteps.length > 0) {
            conclusion += `Your next step: ${nextSteps[0]} `;
        }
        conclusion += action;
        return conclusion;
    }
    // Helper methods
    selectHookType(purpose, knowledge) {
        if (purpose.primary === 'educate')
            return 'question';
        if (purpose.primary === 'persuade')
            return 'challenge';
        if (knowledge.depthAnalysis?.currentDepth >= 3)
            return 'statistic';
        if (knowledge.analogies?.analogies?.length > 0)
            return 'story';
        return 'statement';
    }
    fillTemplate(template, values) {
        return template.replace(/{(\w+)}/g, (match, key) => values[key] || match);
    }
    extractKeywords(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 4);
        const frequency = {};
        words.forEach(w => frequency[w] = (frequency[w] || 0) + 1);
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);
    }
    extractProfession(description) {
        const professions = [
            'developer', 'designer', 'marketer', 'manager', 'analyst',
            'engineer', 'scientist', 'researcher', 'educator', 'consultant'
        ];
        const found = professions.find(p => description.toLowerCase().includes(p));
        return found || 'professional';
    }
    extractPainPoints(synthesis) {
        const gaps = synthesis.depthAnalysis?.gaps || [];
        const painPoints = gaps.map((gap) => gap.replace(/^[^:]+:\s*/, '').toLowerCase());
        if (painPoints.length === 0) {
            painPoints.push('understanding complexity', 'finding practical applications');
        }
        return painPoints.slice(0, 3);
    }
    extractGoals(synthesis) {
        const nextSteps = synthesis.depthAnalysis?.nextSteps || [];
        const goals = nextSteps.map((step) => step.replace(/^[^:]+:\s*/, '').toLowerCase());
        if (goals.length === 0) {
            goals.push('master the concept', 'apply knowledge effectively');
        }
        return goals.slice(0, 3);
    }
    extractProblem(knowledge) {
        const gaps = knowledge.depthAnalysis?.gaps || [];
        const problems = knowledge.connections?.filter((c) => c.relationshipType === 'contrast');
        if (gaps.length > 0) {
            return `The challenge: ${gaps[0]}`;
        }
        if (problems?.length > 0) {
            return `The problem with traditional approaches: ${problems[0].explanation}`;
        }
        return 'Most approaches fail to address the core complexity';
    }
    extractSolution(knowledge) {
        const concept = knowledge.concept?.name || 'This approach';
        const benefits = knowledge.depthAnalysis?.levels?.[2]?.understanding || [];
        if (benefits.length > 0) {
            return `${concept} solves this by ${benefits[0]}`;
        }
        return `${concept} provides a systematic solution`;
    }
    extractMainContent(knowledge) {
        const understanding = knowledge.depthAnalysis?.levels
            ?.flatMap((l) => l.understanding || [])
            .join(' ') || '';
        return understanding || 'Core insights and principles';
    }
    extractExamples(knowledge) {
        const analogies = knowledge.analogies?.analogies || [];
        const examples = analogies.map((a) => a.mapping).join(' ');
        return examples || 'Practical applications and examples';
    }
    estimateWordCount(sections) {
        return sections.reduce((total, section) => {
            const words = section.content.split(/\s+/).length;
            return total + words;
        }, 0);
    }
    getSecondaryPurposes(primary) {
        const purposeMap = {
            'inform': ['educate'],
            'educate': ['inform', 'inspire'],
            'persuade': ['inform', 'inspire'],
            'inspire': ['educate', 'persuade'],
            'entertain': ['inform', 'inspire']
        };
        return purposeMap[primary] || [];
    }
    determineOutcome(purpose, audience) {
        const outcomes = {
            'inform': 'Reader gains new knowledge',
            'educate': 'Reader can apply concepts',
            'persuade': 'Reader changes perspective',
            'inspire': 'Reader takes action',
            'entertain': 'Reader enjoys and shares'
        };
        return outcomes[purpose] || 'Reader benefits from content';
    }
    generateCallToAction(purpose, topic) {
        const actions = {
            'inform': `Learn more about ${topic}`,
            'educate': `Practice these ${topic} techniques`,
            'persuade': `Try this ${topic} approach`,
            'inspire': `Start your ${topic} journey today`,
            'entertain': `Share this ${topic} insight`
        };
        return actions[purpose] || `Explore ${topic} further`;
    }
    createMemorableLine(topic, concept, synthesis) {
        if (synthesis.analogies?.bestAnalogy) {
            return `${topic} is the ${synthesis.analogies.bestAnalogy.target} of modern solutions`;
        }
        if (concept.definition) {
            const words = concept.definition.split(' ').slice(0, 8).join(' ');
            return `${topic}: ${words}`;
        }
        return `Master ${topic}, transform your approach`;
    }
    /**
     * Analyze existing content with SPARK
     */
    analyze(content) {
        // This would analyze existing content
        // For now, return a basic analysis
        const elements = this.generate('Content Analysis', {}, 'general');
        const score = {
            structure: 0.7,
            purpose: 0.8,
            audience: 0.6,
            relevance: 0.7,
            keyMessage: 0.8,
            overall: 0.72
        };
        const recommendations = [
            'Add more specific examples',
            'Strengthen the opening hook',
            'Clarify the call-to-action'
        ];
        return { elements, score, recommendations };
    }
}
exports.SPARKFramework = SPARKFramework;
exports.default = SPARKFramework;
//# sourceMappingURL=spark-framework.js.map