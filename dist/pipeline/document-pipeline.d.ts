/**
 * Document Pipeline Coordinator for FLCM
 * Orchestrates document flow through the system
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
import { BaseDocument, DocumentType, ContentBrief, KnowledgeSynthesis, ContentDraft, PlatformAdaptation, ValidationResult } from './document-schemas';
import { TransformOptions } from './document-transformer';
/**
 * Pipeline stage
 */
export declare enum PipelineStage {
    COLLECTION = "collection",
    SYNTHESIS = "synthesis",
    CREATION = "creation",
    ADAPTATION = "adaptation",
    COMPLETE = "complete"
}
/**
 * Pipeline configuration
 */
export interface PipelineConfig {
    validateOnTransition: boolean;
    saveIntermediateResults: boolean;
    enableVersioning: boolean;
    maxRetries: number;
    retryDelay: number;
}
/**
 * Pipeline execution context
 */
export interface PipelineContext {
    id: string;
    startTime: Date;
    currentStage: PipelineStage;
    documents: Map<DocumentType, BaseDocument>;
    errors: Error[];
    metadata: Record<string, any>;
}
/**
 * Pipeline result
 */
export interface PipelineResult {
    success: boolean;
    context: PipelineContext;
    finalDocument?: BaseDocument;
    errors?: Error[];
    duration: number;
}
/**
 * Document Pipeline Class
 */
export declare class DocumentPipeline extends EventEmitter {
    private config;
    private validator;
    private transformer;
    private metadataManager;
    private storage;
    private activeContexts;
    constructor(config?: Partial<PipelineConfig>);
    /**
     * Start a new pipeline execution
     */
    startPipeline(brief: ContentBrief): Promise<string>;
    /**
     * Transition to synthesis stage
     */
    transitionToSynthesis(contextId: string, synthesis: KnowledgeSynthesis): Promise<boolean>;
    /**
     * Transition to creation stage
     */
    transitionToCreation(contextId: string, draft: ContentDraft): Promise<boolean>;
    /**
     * Transition to adaptation stage
     */
    transitionToAdaptation(contextId: string, adaptations: PlatformAdaptation[]): Promise<boolean>;
    /**
     * Complete pipeline execution
     */
    completePipeline(contextId: string): Promise<PipelineResult>;
    /**
     * Transform document through pipeline stages
     */
    transformDocument(source: BaseDocument, targetType: DocumentType, options?: TransformOptions): Promise<BaseDocument | null>;
    /**
     * Validate document
     */
    validateDocument(document: BaseDocument): Promise<ValidationResult>;
    /**
     * Save document to storage
     */
    private saveDocument;
    /**
     * Load document from storage
     */
    loadDocument(id: string): Promise<{
        document: BaseDocument;
        content: string;
    }>;
    /**
     * Query documents
     */
    queryDocuments(filter: any): Promise<BaseDocument[]>;
    /**
     * Get pipeline status
     */
    getPipelineStatus(contextId: string): PipelineContext | undefined;
    /**
     * Get all active pipelines
     */
    getActivePipelines(): PipelineContext[];
    /**
     * Cancel pipeline execution
     */
    cancelPipeline(contextId: string): boolean;
    /**
     * Retry failed stage
     */
    retryStage(contextId: string, retryCount?: number): Promise<boolean>;
    /**
     * Generate context ID
     */
    private generateContextId;
    /**
     * Complete partial document with required fields
     */
    private completeDocument;
    /**
     * Get agent for document type
     */
    private getAgentForType;
    /**
     * Get pipeline statistics
     */
    getStatistics(): Promise<Record<string, any>>;
}
//# sourceMappingURL=document-pipeline.d.ts.map