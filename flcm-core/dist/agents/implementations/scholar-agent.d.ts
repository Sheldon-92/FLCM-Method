/**
 * Scholar Agent Implementation
 * Responsible for deep learning and knowledge synthesis
 */
import { BaseAgent, Document } from '../base-agent';
import { ProgressiveDepthAnalysis, Concept } from '../../methodologies/learning/progressive-depth';
import { AnalogySet } from '../../methodologies/learning/analogy-generator';
/**
 * Knowledge synthesis output structure
 */
export interface KnowledgeSynthesis extends Document {
    type: 'knowledge-synthesis';
    concept: Concept;
    depthAnalysis: ProgressiveDepthAnalysis;
    analogies: AnalogySet;
    questions: Map<number, string[]>;
    teachingNotes: TeachingNote[];
    connections: ConceptConnection[];
    confidence: number;
    metadata: {
        depthAchieved: number;
        analogiesGenerated: number;
        questionsCreated: number;
        processingTime: number;
        teachingReady: boolean;
    };
}
export interface TeachingNote {
    level: number;
    type: 'explanation' | 'example' | 'exercise' | 'warning';
    content: string;
    importance: 'high' | 'medium' | 'low';
}
export interface ConceptConnection {
    relatedConcept: string;
    relationshipType: 'prerequisite' | 'related' | 'application' | 'contrast';
    strength: number;
    explanation: string;
}
/**
 * Scholar Agent Class
 */
export declare class ScholarAgent extends BaseAgent {
    private progressiveDepth;
    private analogyGenerator;
    constructor();
    /**
     * Initialize Scholar-specific resources
     */
    protected onInit(): Promise<void>;
    /**
     * Execute knowledge synthesis
     */
    protected onExecute(input: Document): Promise<Document>;
    /**
     * Cleanup Scholar resources
     */
    protected onCleanup(): Promise<void>;
    /**
     * Validate Scholar input
     */
    protected validateInput(input: Document): void;
    /**
     * Extract main concept from content brief
     */
    private extractConcept;
    /**
     * Generate synthesis content
     */
    private generateSynthesisContent;
    /**
     * Create teaching notes
     */
    private createTeachingNotes;
    /**
     * Identify concept connections
     */
    private identifyConnections;
    /**
     * Calculate overall confidence
     */
    private calculateConfidence;
    /**
     * Update session statistics
     */
    private updateStatistics;
    /**
     * Generate document ID
     */
    private generateDocumentId;
    /**
     * Get Bloom's taxonomy questions for a concept
     */
    generateBloomQuestions(concept: string, level: number): string[];
}
export default ScholarAgent;
