/**
 * Framework Template Engine
 * Automates framework template generation and customization
 */
export interface FrameworkTemplate {
    id: string;
    name: string;
    description: string;
    category: 'thinking' | 'note-taking' | 'analysis' | 'creation' | 'reflection';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    structure: TemplateSection[];
    prompts: TemplatePrompt[];
    variables: TemplateVariable[];
    metadata: TemplateMetadata;
}
export interface TemplateSection {
    id: string;
    title: string;
    description: string;
    order: number;
    required: boolean;
    type: 'text' | 'list' | 'table' | 'diagram' | 'reflection';
    content: string;
    prompts: string[];
    examples?: string[];
}
export interface TemplatePrompt {
    id: string;
    text: string;
    type: 'open' | 'guided' | 'multiple-choice' | 'scale';
    sectionId: string;
    required: boolean;
    hints?: string[];
    examples?: string[];
}
export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'date' | 'list' | 'topic';
    description: string;
    defaultValue?: any;
    required: boolean;
}
export interface TemplateMetadata {
    author: string;
    version: string;
    created: Date;
    updated: Date;
    usage_count: number;
    effectiveness_score: number;
    tags: string[];
    prerequisites?: string[];
    learning_outcomes: string[];
}
export interface TemplateCustomization {
    userId: string;
    templateId: string;
    modifications: TemplateModification[];
    personalizations: Record<string, any>;
    savedVariants: TemplateVariant[];
}
export interface TemplateModification {
    type: 'add_section' | 'remove_section' | 'modify_prompt' | 'reorder' | 'add_variable';
    target: string;
    content: any;
    timestamp: Date;
}
export interface TemplateVariant {
    id: string;
    name: string;
    description: string;
    modifications: TemplateModification[];
    usage_count: number;
}
export declare class TemplateEngine {
    private templates;
    private customizations;
    private logger;
    constructor();
    /**
     * Initialize default framework templates
     */
    private initializeDefaultTemplates;
    /**
     * Generate a personalized template
     */
    generateTemplate(userId: string, baseTemplateId: string, customizations?: Partial<TemplateCustomization>): Promise<string>;
    /**
     * Convert template to markdown
     */
    private templateToMarkdown;
    /**
     * Apply customizations to template
     */
    private applyCustomizations;
    /**
     * Generate prompts from sections
     */
    private generatePromptsFromSections;
    /**
     * Get all available templates
     */
    getTemplates(): FrameworkTemplate[];
    /**
     * Get template by ID
     */
    getTemplate(templateId: string): FrameworkTemplate | undefined;
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category: string): FrameworkTemplate[];
    /**
     * Save customization
     */
    saveCustomization(customization: TemplateCustomization): void;
    /**
     * Get user's customizations
     */
    getUserCustomizations(userId: string): TemplateCustomization[];
    /**
     * Create template variant
     */
    createVariant(userId: string, templateId: string, variantName: string, modifications: TemplateModification[]): void;
    /**
     * Get engine statistics
     */
    getStats(): any;
    private getTemplateDistribution;
    private calculateAvgEffectiveness;
}
