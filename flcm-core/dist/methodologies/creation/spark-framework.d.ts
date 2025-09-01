/**
 * SPARK Framework for Content Creation
 * Structure, Purpose, Audience, Relevance, Key Message
 */
export interface SPARKElements {
    structure: ContentStructure;
    purpose: ContentPurpose;
    audience: AudienceProfile;
    relevance: RelevanceFactors;
    keyMessage: KeyMessage;
}
export interface ContentStructure {
    type: 'linear' | 'hierarchical' | 'narrative' | 'problem-solution' | 'comparison';
    sections: Section[];
    flow: 'logical' | 'chronological' | 'priority' | 'emotional';
    length: 'micro' | 'short' | 'medium' | 'long';
}
export interface Section {
    name: string;
    purpose: string;
    content: string;
    weight: number;
    elements: ('text' | 'list' | 'quote' | 'data' | 'example' | 'image')[];
}
export interface ContentPurpose {
    primary: 'inform' | 'persuade' | 'entertain' | 'inspire' | 'educate';
    secondary?: string[];
    outcome: string;
    action?: string;
}
export interface AudienceProfile {
    demographic: {
        profession?: string;
        expertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        age?: string;
        interests: string[];
    };
    psychographic: {
        values: string[];
        painPoints: string[];
        goals: string[];
        preferences: string[];
    };
    reading: {
        style: 'scanner' | 'reader' | 'studier';
        time: 'limited' | 'moderate' | 'extensive';
        device: 'mobile' | 'desktop' | 'both';
    };
}
export interface RelevanceFactors {
    timeliness: 'evergreen' | 'current' | 'trending' | 'breaking';
    uniqueness: number;
    practicalValue: number;
    emotionalResonance: number;
    socialCurrency: number;
}
export interface KeyMessage {
    core: string;
    supporting: string[];
    proof: ProofPoint[];
    memorable: string;
}
export interface ProofPoint {
    type: 'data' | 'example' | 'authority' | 'logic' | 'emotion';
    content: string;
    strength: number;
}
export interface SPARKAnalysis {
    elements: SPARKElements;
    score: {
        structure: number;
        purpose: number;
        audience: number;
        relevance: number;
        keyMessage: number;
        overall: number;
    };
    recommendations: string[];
}
/**
 * SPARK Framework Class
 */
export declare class SPARKFramework {
    private readonly hooks;
    /**
     * Generate SPARK elements for content
     */
    generate(topic: string, synthesis: any, // Knowledge synthesis from Scholar
    targetAudience?: string): SPARKElements;
    /**
     * Create content structure
     */
    createStructure(topic: string, knowledge: any, purpose: ContentPurpose): ContentStructure;
    /**
     * Generate content sections
     */
    private generateSections;
    /**
     * Profile the target audience
     */
    private profileAudience;
    /**
     * Determine content purpose
     */
    private determinePurpose;
    /**
     * Design content structure
     */
    private designStructure;
    /**
     * Assess content relevance
     */
    private assessRelevance;
    /**
     * Extract key message
     */
    private extractKeyMessage;
    /**
     * Generate a compelling hook
     */
    generateHook(topic: string, purpose: ContentPurpose, knowledge: any): string;
    /**
     * Generate conclusion
     */
    private generateConclusion;
    private selectHookType;
    private fillTemplate;
    private extractKeywords;
    private extractProfession;
    private extractPainPoints;
    private extractGoals;
    private extractProblem;
    private extractSolution;
    private extractMainContent;
    private extractExamples;
    private estimateWordCount;
    private getSecondaryPurposes;
    private determineOutcome;
    private generateCallToAction;
    private createMemorableLine;
    /**
     * Analyze existing content with SPARK
     */
    analyze(content: string): SPARKAnalysis;
}
export default SPARKFramework;
