"use strict";
/**
 * Framework Template Engine
 * Automates framework template generation and customization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const logger_1 = require("../shared/utils/logger");
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.customizations = new Map();
        this.logger = new logger_1.Logger('TemplateEngine');
        this.initializeDefaultTemplates();
    }
    /**
     * Initialize default framework templates
     */
    initializeDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'socratic-inquiry',
                name: 'Socratic Inquiry',
                description: 'Deep questioning framework for exploring ideas',
                category: 'thinking',
                difficulty: 'intermediate',
                estimatedTime: 30,
                structure: [
                    {
                        id: 'initial-question',
                        title: 'Initial Question',
                        description: 'The main question or topic you want to explore',
                        order: 1,
                        required: true,
                        type: 'text',
                        content: '## What is your core question?\n\n{question}\n\n**Why is this question important to you?**\n{importance}',
                        prompts: [
                            'What exactly do you want to understand?',
                            'Why does this matter to you?',
                            'What assumptions might you have about this topic?'
                        ]
                    },
                    {
                        id: 'assumptions',
                        title: 'Examine Assumptions',
                        description: 'Identify and question underlying assumptions',
                        order: 2,
                        required: true,
                        type: 'list',
                        content: '## What assumptions am I making?\n\n{assumptions_list}\n\n**Which assumptions might be wrong?**\n{questionable_assumptions}',
                        prompts: [
                            'What do I take for granted about this topic?',
                            'What evidence supports these assumptions?',
                            'What would happen if these assumptions were wrong?'
                        ]
                    },
                    {
                        id: 'evidence',
                        title: 'Gather Evidence',
                        description: 'Collect and evaluate evidence',
                        order: 3,
                        required: true,
                        type: 'table',
                        content: '## Evidence and Sources\n\n| Evidence | Source | Reliability | Relevance |\n|----------|---------|------------|----------|\n{evidence_table}',
                        prompts: [
                            'What evidence supports different perspectives?',
                            'How reliable are my sources?',
                            'What evidence contradicts my initial thinking?'
                        ]
                    },
                    {
                        id: 'implications',
                        title: 'Explore Implications',
                        description: 'Consider consequences and broader implications',
                        order: 4,
                        required: true,
                        type: 'text',
                        content: '## Implications and Consequences\n\n**If this is true, then...**\n{positive_implications}\n\n**If this is false, then...**\n{negative_implications}\n\n**Broader implications:**\n{broader_implications}',
                        prompts: [
                            'What follows if this is true?',
                            'What are the broader consequences?',
                            'How does this connect to other areas?'
                        ]
                    },
                    {
                        id: 'synthesis',
                        title: 'Synthesis & Insights',
                        description: 'Synthesize findings into new understanding',
                        order: 5,
                        required: true,
                        type: 'reflection',
                        content: '## Key Insights\n\n{key_insights}\n\n**How has your understanding changed?**\n{understanding_change}\n\n**What questions remain?**\n{remaining_questions}',
                        prompts: [
                            'What have I learned that I didn\'t know before?',
                            'How has my perspective changed?',
                            'What new questions have emerged?'
                        ]
                    }
                ],
                prompts: [],
                variables: [
                    { name: 'question', type: 'string', description: 'Main question to explore', required: true },
                    { name: 'topic_area', type: 'string', description: 'Subject area or domain', required: false },
                    { name: 'depth_level', type: 'number', description: 'Desired depth (1-5)', defaultValue: 3, required: false }
                ],
                metadata: {
                    author: 'FLCM Framework',
                    version: '2.0.0',
                    created: new Date('2025-01-01'),
                    updated: new Date(),
                    usage_count: 0,
                    effectiveness_score: 4.8,
                    tags: ['questioning', 'critical-thinking', 'analysis'],
                    learning_outcomes: [
                        'Develop critical questioning skills',
                        'Challenge assumptions systematically',
                        'Synthesize evidence into insights'
                    ]
                }
            },
            {
                id: 'feynman-technique',
                name: 'Feynman Technique',
                description: 'Learn by teaching and simplifying complex concepts',
                category: 'creation',
                difficulty: 'beginner',
                estimatedTime: 20,
                structure: [
                    {
                        id: 'concept-selection',
                        title: 'Choose Your Concept',
                        description: 'Select and define the concept you want to understand',
                        order: 1,
                        required: true,
                        type: 'text',
                        content: '## Concept to Learn\n\n**Concept:** {concept}\n\n**Current Understanding:**\n{current_understanding}\n\n**Why is this important?**\n{importance}',
                        prompts: [
                            'What concept do you want to master?',
                            'What do you already know about it?',
                            'Why do you need to understand this?'
                        ]
                    },
                    {
                        id: 'simple-explanation',
                        title: 'Explain Simply',
                        description: 'Explain the concept in simple terms',
                        order: 2,
                        required: true,
                        type: 'text',
                        content: '## Simple Explanation\n\n**Imagine explaining this to a {audience}:**\n\n{simple_explanation}\n\n**Key analogies:**\n{analogies}',
                        prompts: [
                            'How would you explain this to a child?',
                            'What analogies help make this clear?',
                            'What are the essential points?'
                        ]
                    },
                    {
                        id: 'identify-gaps',
                        title: 'Identify Knowledge Gaps',
                        description: 'Find areas where understanding breaks down',
                        order: 3,
                        required: true,
                        type: 'list',
                        content: '## Knowledge Gaps\n\n**Areas I struggle to explain:**\n{gaps_list}\n\n**Questions I can\'t answer:**\n{unanswered_questions}',
                        prompts: [
                            'Where does your explanation break down?',
                            'What questions can\'t you answer?',
                            'Which parts feel unclear or confusing?'
                        ]
                    },
                    {
                        id: 'research-gaps',
                        title: 'Fill the Gaps',
                        description: 'Research and learn the missing pieces',
                        order: 4,
                        required: true,
                        type: 'text',
                        content: '## Learning & Research\n\n**Sources consulted:**\n{sources}\n\n**New insights:**\n{new_insights}\n\n**Clarifications:**\n{clarifications}',
                        prompts: [
                            'What resources will help fill these gaps?',
                            'What did you learn from additional research?',
                            'How do these new insights change your understanding?'
                        ]
                    },
                    {
                        id: 'refined-explanation',
                        title: 'Refine & Simplify',
                        description: 'Create a clearer, more complete explanation',
                        order: 5,
                        required: true,
                        type: 'text',
                        content: '## Refined Explanation\n\n{refined_explanation}\n\n**Key improvements:**\n{improvements}\n\n**Confidence level (1-10):** {confidence}',
                        prompts: [
                            'How can you explain this more clearly now?',
                            'What improvements did you make?',
                            'How confident are you in your understanding?'
                        ]
                    }
                ],
                prompts: [],
                variables: [
                    { name: 'concept', type: 'string', description: 'Concept to learn', required: true },
                    { name: 'audience', type: 'string', description: 'Target audience for explanation', defaultValue: '10-year-old', required: false },
                    { name: 'confidence', type: 'number', description: 'Confidence level (1-10)', required: false }
                ],
                metadata: {
                    author: 'FLCM Framework',
                    version: '2.0.0',
                    created: new Date('2025-01-01'),
                    updated: new Date(),
                    usage_count: 0,
                    effectiveness_score: 4.9,
                    tags: ['learning', 'teaching', 'simplification'],
                    learning_outcomes: [
                        'Master complex concepts through teaching',
                        'Identify and fill knowledge gaps',
                        'Develop clear communication skills'
                    ]
                }
            }
            // More templates would be added here
        ];
        for (const template of defaultTemplates) {
            this.templates.set(template.id, template);
            // Generate prompts from sections
            template.prompts = this.generatePromptsFromSections(template.structure);
        }
        this.logger.info(`Initialized ${defaultTemplates.length} default templates`);
    }
    /**
     * Generate a personalized template
     */
    async generateTemplate(userId, baseTemplateId, customizations) {
        try {
            const baseTemplate = this.templates.get(baseTemplateId);
            if (!baseTemplate) {
                throw new Error(`Template ${baseTemplateId} not found`);
            }
            // Apply customizations
            let template = JSON.parse(JSON.stringify(baseTemplate)); // Deep clone
            if (customizations) {
                template = this.applyCustomizations(template, customizations);
            }
            // Generate markdown content
            const content = this.templateToMarkdown(template, customizations?.personalizations || {});
            this.logger.info(`Generated template for user ${userId}: ${baseTemplateId}`);
            return content;
        }
        catch (error) {
            this.logger.error('Failed to generate template:', error);
            throw error;
        }
    }
    /**
     * Convert template to markdown
     */
    templateToMarkdown(template, personalizations) {
        let markdown = `# ${template.name}\n\n`;
        markdown += `> ${template.description}\n\n`;
        markdown += `**Estimated time:** ${template.estimatedTime} minutes\n`;
        markdown += `**Difficulty:** ${template.difficulty}\n\n`;
        // Add metadata section
        markdown += `---\n`;
        markdown += `flcm:\n`;
        markdown += `  version: "2.0"\n`;
        markdown += `  framework: "${template.id}"\n`;
        markdown += `  layer: "mentor"\n`;
        markdown += `  timestamp: "${new Date().toISOString()}"\n`;
        markdown += `  metadata:\n`;
        markdown += `    difficulty: "${template.difficulty}"\n`;
        markdown += `    estimated_time: ${template.estimatedTime}\n`;
        markdown += `    category: "${template.category}"\n`;
        markdown += `  tags:\n`;
        for (const tag of template.metadata.tags) {
            markdown += `    - "#${tag}"\n`;
        }
        markdown += `---\n\n`;
        // Add sections
        const sortedSections = template.structure.sort((a, b) => a.order - b.order);
        for (const section of sortedSections) {
            let sectionContent = section.content;
            // Replace variables
            for (const variable of template.variables) {
                const value = personalizations[variable.name] || variable.defaultValue || `{${variable.name}}`;
                sectionContent = sectionContent.replace(new RegExp(`{${variable.name}}`, 'g'), value);
            }
            markdown += sectionContent + '\n\n';
            // Add prompts as comments
            if (section.prompts.length > 0) {
                markdown += '<!-- Reflection prompts:\n';
                for (const prompt of section.prompts) {
                    markdown += `- ${prompt}\n`;
                }
                markdown += '-->\n\n';
            }
            // Add examples if available
            if (section.examples && section.examples.length > 0) {
                markdown += '**Examples:**\n';
                for (const example of section.examples) {
                    markdown += `- ${example}\n`;
                }
                markdown += '\n';
            }
        }
        // Add learning outcomes
        markdown += '## Learning Outcomes\n\n';
        for (const outcome of template.metadata.learning_outcomes) {
            markdown += `- ${outcome}\n`;
        }
        markdown += '\n';
        return markdown;
    }
    /**
     * Apply customizations to template
     */
    applyCustomizations(template, customizations) {
        if (!customizations.modifications)
            return template;
        for (const mod of customizations.modifications) {
            switch (mod.type) {
                case 'add_section':
                    template.structure.push(mod.content);
                    break;
                case 'remove_section':
                    template.structure = template.structure.filter(s => s.id !== mod.target);
                    break;
                case 'modify_prompt':
                    const section = template.structure.find(s => s.id === mod.target);
                    if (section) {
                        section.prompts = mod.content;
                    }
                    break;
                case 'reorder':
                    // Reorder sections based on mod.content order
                    if (Array.isArray(mod.content)) {
                        template.structure.forEach((section, index) => {
                            const newOrder = mod.content.indexOf(section.id);
                            if (newOrder !== -1) {
                                section.order = newOrder + 1;
                            }
                        });
                    }
                    break;
            }
        }
        return template;
    }
    /**
     * Generate prompts from sections
     */
    generatePromptsFromSections(sections) {
        const prompts = [];
        for (const section of sections) {
            for (let i = 0; i < section.prompts.length; i++) {
                prompts.push({
                    id: `${section.id}-prompt-${i}`,
                    text: section.prompts[i],
                    type: 'open',
                    sectionId: section.id,
                    required: section.required
                });
            }
        }
        return prompts;
    }
    /**
     * Get all available templates
     */
    getTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Get template by ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values()).filter(t => t.category === category);
    }
    /**
     * Save customization
     */
    saveCustomization(customization) {
        const key = `${customization.userId}-${customization.templateId}`;
        this.customizations.set(key, customization);
        this.logger.info(`Saved customization for ${key}`);
    }
    /**
     * Get user's customizations
     */
    getUserCustomizations(userId) {
        const userCustomizations = [];
        for (const [key, customization] of this.customizations.entries()) {
            if (key.startsWith(userId + '-')) {
                userCustomizations.push(customization);
            }
        }
        return userCustomizations;
    }
    /**
     * Create template variant
     */
    createVariant(userId, templateId, variantName, modifications) {
        const key = `${userId}-${templateId}`;
        let customization = this.customizations.get(key);
        if (!customization) {
            customization = {
                userId,
                templateId,
                modifications: [],
                personalizations: {},
                savedVariants: []
            };
        }
        const variant = {
            id: `${variantName}-${Date.now()}`,
            name: variantName,
            description: `Custom variant of ${templateId}`,
            modifications,
            usage_count: 0
        };
        customization.savedVariants.push(variant);
        this.customizations.set(key, customization);
        this.logger.info(`Created variant ${variantName} for template ${templateId}`);
    }
    /**
     * Get engine statistics
     */
    getStats() {
        return {
            totalTemplates: this.templates.size,
            totalCustomizations: this.customizations.size,
            templatesByCategory: this.getTemplateDistribution(),
            avgEffectivenessScore: this.calculateAvgEffectiveness()
        };
    }
    getTemplateDistribution() {
        const distribution = {};
        for (const template of this.templates.values()) {
            distribution[template.category] = (distribution[template.category] || 0) + 1;
        }
        return distribution;
    }
    calculateAvgEffectiveness() {
        const scores = Array.from(this.templates.values()).map(t => t.metadata.effectiveness_score);
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=template-engine.js.map