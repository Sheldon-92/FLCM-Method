"use strict";
/**
 * Collaborative Mode
 * Natural language interaction with framework guidance (FLCM 2.0 style)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborativeMode = void 0;
const framework_selector_1 = require("../../v2/mentor/frameworks/framework-selector");
const logger_1 = require("../../shared/utils/logger");
class CollaborativeMode {
    constructor(context) {
        this.currentFramework = null;
        this.dialogueState = 'idle';
        this.context = context;
        this.logger = new logger_1.Logger('CollaborativeMode');
        this.frameworkSelector = new framework_selector_1.FrameworkSelector();
        this.patterns = [];
        this.initializePatterns();
    }
    /**
     * Initialize collaborative patterns
     */
    initializePatterns() {
        this.patterns = [
            // Exploration patterns
            {
                pattern: /^(explore|analyze|understand|investigate|research)/i,
                action: 'mentor.explore',
                suggest_frameworks: true
            },
            {
                pattern: /^(help me understand|explain|teach me|show me)/i,
                action: 'mentor.teach',
                suggest_frameworks: true
            },
            {
                pattern: /^(prioritize|decide|choose|evaluate)/i,
                action: 'mentor.prioritize',
                suggest_frameworks: true
            },
            // Creation patterns
            {
                pattern: /^(create|write|draft|compose|develop)/i,
                action: 'creator.cocreate',
                load_voice: true
            },
            {
                pattern: /^(brainstorm|ideate|innovate|generate ideas)/i,
                action: 'creator.ideate',
                suggest_frameworks: true
            },
            {
                pattern: /^(structure|organize|outline|plan)/i,
                action: 'creator.structure',
                suggest_frameworks: true
            },
            // Publishing patterns
            {
                pattern: /^(publish|post|share|distribute)/i,
                action: 'publisher.publish',
                check_platforms: true
            },
            {
                pattern: /^(adapt for|format for|convert to)/i,
                action: 'publisher.adapt',
                check_platforms: true
            },
            // Framework-specific patterns
            {
                pattern: /(with|using) (\w+) framework/i,
                action: 'mentor.use_framework',
                suggest_frameworks: false
            },
            {
                pattern: /^(rice|swot|scamper|socratic|pyramid|5w2h)/i,
                action: 'mentor.use_framework',
                suggest_frameworks: false
            }
        ];
    }
    /**
     * Process natural language input
     */
    async process(input) {
        try {
            // Check for direct framework request
            const frameworkRequest = this.extractFrameworkRequest(input);
            if (frameworkRequest) {
                return this.handleFrameworkRequest(frameworkRequest, input);
            }
            // Match against patterns
            const matched = this.matchPattern(input);
            if (matched) {
                return this.handlePatternMatch(matched, input);
            }
            // Handle based on current dialogue state
            return this.handleDialogueFlow(input);
        }
        catch (error) {
            this.logger.error('Failed to process collaborative input', { error });
            return `I encountered an error. Could you rephrase that? ${error.message}`;
        }
    }
    /**
     * Extract framework request from input
     */
    extractFrameworkRequest(input) {
        const frameworkPattern = /(?:with|using|apply|use)\s+(\w+)\s+framework/i;
        const match = input.match(frameworkPattern);
        if (match) {
            return match[1].toLowerCase();
        }
        // Check for direct framework names
        const frameworks = ['rice', 'swot-used', 'scamper', 'socratic', 'pyramid', '5w2h', 'teaching', 'voice'];
        const inputLower = input.toLowerCase();
        for (const fw of frameworks) {
            if (inputLower.startsWith(fw) || inputLower.includes(`use ${fw}`)) {
                return fw;
            }
        }
        return null;
    }
    /**
     * Handle framework request
     */
    async handleFrameworkRequest(framework, input) {
        // Map common names to framework IDs
        const frameworkMap = {
            'rice': 'rice',
            'swot': 'swot_used',
            'swot-used': 'swot_used',
            'scamper': 'scamper',
            'socratic': 'socratic',
            'pyramid': 'pyramid',
            '5w2h': 'five_w2h',
            'teaching': 'teaching_prep',
            'voice': 'voice_dna'
        };
        const frameworkId = frameworkMap[framework];
        if (!frameworkId) {
            return `I don't recognize the framework "${framework}". Available frameworks:
- RICE (prioritization)
- SWOT-USED (strategic analysis)
- SCAMPER (innovation)
- Socratic (deep understanding)
- Pyramid (communication structure)
- 5W2H (comprehensive analysis)
- Teaching Preparation (learning)
- Voice DNA (content voice)

Which would you like to use?`;
        }
        // Get framework
        const fw = this.frameworkSelector.getById(frameworkId);
        if (!fw) {
            return `Framework "${framework}" not found. Type 'list frameworks' to see available options.`;
        }
        // Set current framework
        this.currentFramework = frameworkId;
        this.context.setFrameworkState(frameworkId, { started: new Date() });
        // Extract topic from input
        const topic = this.extractTopic(input);
        // Get introduction
        const intro = fw.getIntroduction({ topic });
        const firstQuestions = fw.getQuestions({ topic }).slice(0, 2);
        let response = intro + '\n\n';
        response += 'Let\'s start with these questions:\n\n';
        firstQuestions.forEach((q, i) => {
            response += `${i + 1}. ${q.question}\n`;
            if (q.followUp) {
                response += `   (${q.followUp})\n`;
            }
        });
        this.dialogueState = 'exploring';
        return response;
    }
    /**
     * Match input against patterns
     */
    matchPattern(input) {
        for (const pattern of this.patterns) {
            if (pattern.pattern.test(input)) {
                return pattern;
            }
        }
        return null;
    }
    /**
     * Handle pattern match
     */
    async handlePatternMatch(pattern, input) {
        // Extract context
        const context = {
            topic: this.extractTopic(input),
            goal: this.extractGoal(input),
            audience: this.extractAudience(input)
        };
        // Suggest frameworks if needed
        if (pattern.suggest_frameworks) {
            const recommendations = await this.frameworkSelector.select(context);
            if (recommendations.recommended.length > 0) {
                const top = recommendations.recommended[0];
                let response = `For ${context.topic || 'this task'}, I recommend the ${top.framework.name}.\n`;
                response += `${top.reason}\n\n`;
                response += `Would you like to:\n`;
                response += `1. Use ${top.framework.name}\n`;
                if (recommendations.alternates.length > 0) {
                    recommendations.alternates.forEach((alt, i) => {
                        response += `${i + 2}. Try ${alt.framework.name} instead\n`;
                    });
                }
                response += `${recommendations.alternates.length + 2}. Let me choose a different approach\n\n`;
                response += `Just tell me which option you prefer, or describe what you want to do.`;
                return response;
            }
        }
        // Handle specific actions
        return this.handleAction(pattern.action, input, context);
    }
    /**
     * Handle dialogue flow based on state
     */
    async handleDialogueFlow(input) {
        switch (this.dialogueState) {
            case 'idle':
                return this.handleIdleState(input);
            case 'exploring':
                return this.handleExploringState(input);
            case 'creating':
                return this.handleCreatingState(input);
            case 'publishing':
                return this.handlePublishingState(input);
            default:
                return this.handleIdleState(input);
        }
    }
    /**
     * Handle idle state
     */
    handleIdleState(input) {
        return `I'm here to help you explore, create, and publish content using proven frameworks.

You can:
• **Explore** a topic with analytical frameworks (RICE, SWOT-USED, 5W2H)
• **Understand** deeply with learning frameworks (Socratic, Teaching Prep)
• **Create** content with your unique voice
• **Structure** ideas clearly (Pyramid Principle)
• **Innovate** with creative frameworks (SCAMPER)
• **Publish** to multiple platforms

What would you like to work on? Just describe your goal naturally, or say "use [framework name]" to start with a specific framework.`;
    }
    /**
     * Handle exploring state
     */
    async handleExploringState(input) {
        if (!this.currentFramework) {
            return this.handleIdleState(input);
        }
        // Get current framework
        const fw = this.frameworkSelector.getById(this.currentFramework);
        if (!fw) {
            this.currentFramework = null;
            return 'Framework session ended. What would you like to do next?';
        }
        // Store answer in framework state
        const state = this.context.getFrameworkState(this.currentFramework) || {};
        const answers = state.answers || {};
        const currentQuestionIndex = state.currentQuestion || 0;
        // Get questions
        const questions = fw.getQuestions({ topic: state.topic });
        // Store current answer
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            answers[question.id] = input;
        }
        // Update state
        state.answers = answers;
        state.currentQuestion = currentQuestionIndex + 1;
        this.context.setFrameworkState(this.currentFramework, state);
        // Check if we have more questions
        if (state.currentQuestion < questions.length) {
            const nextQuestion = questions[state.currentQuestion];
            let response = `Good! `;
            // Add encouragement based on progress
            const progress = Math.round((state.currentQuestion / questions.length) * 100);
            if (progress > 50) {
                response += `We're making great progress (${progress}% complete). `;
            }
            response += `\n\n${nextQuestion.question}`;
            if (nextQuestion.followUp) {
                response += `\n(${nextQuestion.followUp})`;
            }
            return response;
        }
        else {
            // Process completed framework
            const output = await fw.process(answers, { topic: state.topic });
            let response = '## Framework Analysis Complete!\n\n';
            // Add insights
            if (output.insights.length > 0) {
                response += '### Key Insights:\n';
                output.insights.forEach(insight => {
                    response += `• ${insight}\n`;
                });
                response += '\n';
            }
            // Add recommendations
            if (output.recommendations.length > 0) {
                response += '### Recommendations:\n';
                output.recommendations.forEach(rec => {
                    response += `• ${rec}\n`;
                });
                response += '\n';
            }
            // Add next steps
            if (output.nextSteps.length > 0) {
                response += '### Next Steps:\n';
                output.nextSteps.forEach((step, i) => {
                    response += `${i + 1}. ${step}\n`;
                });
                response += '\n';
            }
            response += `\nWould you like to:
1. Export this analysis as a document
2. Apply another framework
3. Move to content creation
4. Start something new

What's your next move?`;
            // Reset state
            this.currentFramework = null;
            this.dialogueState = 'idle';
            return response;
        }
    }
    /**
     * Handle creating state
     */
    handleCreatingState(input) {
        // Simplified for now
        return `Creating content based on: "${input}"

I'll help you develop this with your unique voice. Let me ask a few questions to understand your style...

[Content creation flow would continue here]`;
    }
    /**
     * Handle publishing state
     */
    handlePublishingState(input) {
        // Simplified for now
        return `Ready to publish: "${input}"

Which platforms would you like to publish to?
• LinkedIn (professional network)
• Twitter/X (microblogging)
• Medium (long-form articles)
• YouTube (video scripts)

Just name the platform(s) and I'll adapt your content accordingly.`;
    }
    /**
     * Handle specific action
     */
    async handleAction(action, input, context) {
        // This would integrate with actual mentor/creator/publisher modules
        // For now, return appropriate response based on action
        const [module, method] = action.split('.');
        switch (module) {
            case 'mentor':
                return `Exploring "${context.topic || input}" with analytical frameworks...`;
            case 'creator':
                this.dialogueState = 'creating';
                return `Let's create content about "${context.topic || input}". First, let me understand your goals...`;
            case 'publisher':
                this.dialogueState = 'publishing';
                return `Ready to publish content. Which platforms are you targeting?`;
            default:
                return `Processing request: ${action}`;
        }
    }
    /**
     * Extract topic from input
     */
    extractTopic(input) {
        // Remove action words
        const cleaned = input
            .replace(/^(explore|analyze|understand|create|write|publish|adapt)\s+/i, '')
            .replace(/\s+(with|using)\s+\w+\s+framework$/i, '')
            .trim();
        return cleaned || undefined;
    }
    /**
     * Extract goal from input
     */
    extractGoal(input) {
        if (input.includes('understand'))
            return 'Deep understanding';
        if (input.includes('prioritize'))
            return 'Make decisions';
        if (input.includes('create'))
            return 'Create content';
        if (input.includes('publish'))
            return 'Publish content';
        if (input.includes('analyze'))
            return 'Analyze thoroughly';
        return undefined;
    }
    /**
     * Extract audience from input
     */
    extractAudience(input) {
        const audiencePattern = /for ([\w\s]+?)(?:\.|,|$)/i;
        const match = input.match(audiencePattern);
        return match ? match[1].trim() : undefined;
    }
    /**
     * Get help text
     */
    getHelp() {
        return `
# Collaborative Mode Help

I'm here to guide you through content creation with intelligent frameworks.

## Natural Commands:
• "Explore [topic]" - Analyze with best-fit framework
• "Understand [concept] deeply" - Socratic questioning
• "Prioritize [ideas]" - RICE framework
• "Analyze strategy for [project]" - SWOT-USED
• "Generate ideas for [challenge]" - SCAMPER
• "Structure my thoughts on [topic]" - Pyramid Principle
• "Create content about [subject]" - Guided creation
• "Publish to [platform]" - Platform adaptation

## Framework Commands:
• "Use RICE framework" - Start specific framework
• "Apply SWOT analysis" - Strategic analysis
• "Let's do SCAMPER" - Innovation session

## Tips:
• Be natural - describe what you want to achieve
• I'll suggest the best framework for your needs
• You can switch frameworks anytime
• Say "/mode command" for legacy commands

What would you like to explore?`;
    }
    /**
     * Initialize mode
     */
    async initialize(context) {
        this.context = context;
        this.dialogueState = 'idle';
        this.currentFramework = null;
        this.logger.info('Collaborative mode initialized');
    }
    /**
     * Prepare for mode switch
     */
    async prepareForSwitch() {
        // Save any framework state
        if (this.currentFramework) {
            const state = this.context.getFrameworkState(this.currentFramework);
            if (state) {
                state.suspended = true;
                this.context.setFrameworkState(this.currentFramework, state);
            }
        }
        this.logger.info('Collaborative mode prepared for switch');
    }
}
exports.CollaborativeMode = CollaborativeMode;
//# sourceMappingURL=collaborative-mode.js.map