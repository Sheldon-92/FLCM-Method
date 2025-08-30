/**
 * Document Pipeline Coordinator for FLCM
 * Orchestrates document flow through the system
 */

import { EventEmitter } from 'events';
import {
  BaseDocument,
  DocumentType,
  ContentBrief,
  KnowledgeSynthesis,
  ContentDraft,
  PlatformAdaptation,
  ValidationResult
} from './document-schemas';
import { DocumentValidator } from './document-validator';
import { DocumentTransformer, TransformOptions } from './document-transformer';
import { MetadataManager } from './metadata-manager';
import { FileSystemStorage, IDocumentStorage } from './document-storage';

/**
 * Pipeline stage
 */
export enum PipelineStage {
  COLLECTION = 'collection',
  SYNTHESIS = 'synthesis',
  CREATION = 'creation',
  ADAPTATION = 'adaptation',
  COMPLETE = 'complete'
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
export class DocumentPipeline extends EventEmitter {
  private config: PipelineConfig;
  private validator: DocumentValidator;
  private transformer: DocumentTransformer;
  private metadataManager: MetadataManager;
  private storage: IDocumentStorage;
  private activeContexts: Map<string, PipelineContext>;

  constructor(config?: Partial<PipelineConfig>) {
    super();
    
    this.config = {
      validateOnTransition: true,
      saveIntermediateResults: true,
      enableVersioning: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
    
    this.validator = new DocumentValidator();
    this.transformer = new DocumentTransformer();
    this.metadataManager = new MetadataManager();
    this.storage = new FileSystemStorage();
    this.activeContexts = new Map();
  }

  /**
   * Start a new pipeline execution
   */
  async startPipeline(brief: ContentBrief): Promise<string> {
    const contextId = this.generateContextId();
    
    const context: PipelineContext = {
      id: contextId,
      startTime: new Date(),
      currentStage: PipelineStage.COLLECTION,
      documents: new Map([[DocumentType.CONTENT_BRIEF, brief]]),
      errors: [],
      metadata: {}
    };
    
    this.activeContexts.set(contextId, context);
    
    // Validate initial document
    if (this.config.validateOnTransition) {
      const validation = await this.validateDocument(brief);
      if (!validation.valid) {
        context.errors.push(new Error(`Brief validation failed: ${validation.errors[0]?.message}`));
        this.emit('validationError', { contextId, validation });
      }
    }
    
    // Save initial document
    if (this.config.saveIntermediateResults) {
      await this.saveDocument(brief, 'Initial content brief');
    }
    
    this.emit('pipelineStarted', { contextId, brief });
    
    return contextId;
  }

  /**
   * Transition to synthesis stage
   */
  async transitionToSynthesis(
    contextId: string,
    synthesis: KnowledgeSynthesis
  ): Promise<boolean> {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      throw new Error(`Pipeline context not found: ${contextId}`);
    }
    
    try {
      // Validate synthesis
      if (this.config.validateOnTransition) {
        const validation = await this.validateDocument(synthesis);
        if (!validation.valid) {
          throw new Error(`Synthesis validation failed: ${validation.errors[0]?.message}`);
        }
      }
      
      // Store document
      context.documents.set(DocumentType.KNOWLEDGE_SYNTHESIS, synthesis);
      context.currentStage = PipelineStage.SYNTHESIS;
      
      // Save if configured
      if (this.config.saveIntermediateResults) {
        await this.saveDocument(synthesis, 'Knowledge synthesis complete');
      }
      
      this.emit('stageTransition', {
        contextId,
        from: PipelineStage.COLLECTION,
        to: PipelineStage.SYNTHESIS,
        document: synthesis
      });
      
      return true;
      
    } catch (error: any) {
      context.errors.push(error);
      this.emit('stageError', { contextId, stage: PipelineStage.SYNTHESIS, error });
      return false;
    }
  }

  /**
   * Transition to creation stage
   */
  async transitionToCreation(
    contextId: string,
    draft: ContentDraft
  ): Promise<boolean> {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      throw new Error(`Pipeline context not found: ${contextId}`);
    }
    
    try {
      // Validate draft
      if (this.config.validateOnTransition) {
        const validation = await this.validateDocument(draft);
        if (!validation.valid) {
          throw new Error(`Draft validation failed: ${validation.errors[0]?.message}`);
        }
      }
      
      // Store document
      context.documents.set(DocumentType.CONTENT_DRAFT, draft);
      context.currentStage = PipelineStage.CREATION;
      
      // Save if configured
      if (this.config.saveIntermediateResults) {
        await this.saveDocument(draft, draft.content);
      }
      
      this.emit('stageTransition', {
        contextId,
        from: PipelineStage.SYNTHESIS,
        to: PipelineStage.CREATION,
        document: draft
      });
      
      return true;
      
    } catch (error: any) {
      context.errors.push(error);
      this.emit('stageError', { contextId, stage: PipelineStage.CREATION, error });
      return false;
    }
  }

  /**
   * Transition to adaptation stage
   */
  async transitionToAdaptation(
    contextId: string,
    adaptations: PlatformAdaptation[]
  ): Promise<boolean> {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      throw new Error(`Pipeline context not found: ${contextId}`);
    }
    
    try {
      // Validate all adaptations
      for (const adaptation of adaptations) {
        if (this.config.validateOnTransition) {
          const validation = await this.validateDocument(adaptation);
          if (!validation.valid) {
            throw new Error(`Adaptation validation failed for ${adaptation.platform}: ${validation.errors[0]?.message}`);
          }
        }
        
        // Store each adaptation
        context.documents.set(
          `${DocumentType.PLATFORM_ADAPTATION}-${adaptation.platform}` as DocumentType,
          adaptation
        );
        
        // Save if configured
        if (this.config.saveIntermediateResults) {
          await this.saveDocument(adaptation, adaptation.adaptedContent);
        }
      }
      
      context.currentStage = PipelineStage.ADAPTATION;
      
      this.emit('stageTransition', {
        contextId,
        from: PipelineStage.CREATION,
        to: PipelineStage.ADAPTATION,
        documents: adaptations
      });
      
      return true;
      
    } catch (error: any) {
      context.errors.push(error);
      this.emit('stageError', { contextId, stage: PipelineStage.ADAPTATION, error });
      return false;
    }
  }

  /**
   * Complete pipeline execution
   */
  async completePipeline(contextId: string): Promise<PipelineResult> {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      throw new Error(`Pipeline context not found: ${contextId}`);
    }
    
    context.currentStage = PipelineStage.COMPLETE;
    const duration = Date.now() - context.startTime.getTime();
    
    // Get final document (last created)
    const documents = Array.from(context.documents.values());
    const finalDocument = documents[documents.length - 1];
    
    const result: PipelineResult = {
      success: context.errors.length === 0,
      context,
      finalDocument,
      errors: context.errors.length > 0 ? context.errors : undefined,
      duration
    };
    
    // Clean up
    this.activeContexts.delete(contextId);
    
    this.emit('pipelineComplete', result);
    
    return result;
  }

  /**
   * Transform document through pipeline stages
   */
  async transformDocument(
    source: BaseDocument,
    targetType: DocumentType,
    options?: TransformOptions
  ): Promise<BaseDocument | null> {
    try {
      let transformed: Partial<BaseDocument> | null = null;
      
      // Determine transformation based on source and target types
      if (source.type === DocumentType.CONTENT_BRIEF && 
          targetType === DocumentType.KNOWLEDGE_SYNTHESIS) {
        transformed = this.transformer.briefToSynthesis(source as ContentBrief, options);
      } else if (source.type === DocumentType.KNOWLEDGE_SYNTHESIS && 
                 targetType === DocumentType.CONTENT_DRAFT) {
        transformed = this.transformer.synthesisToDraft(source as KnowledgeSynthesis, options);
      } else if (source.type === DocumentType.CONTENT_DRAFT && 
                 targetType === DocumentType.PLATFORM_ADAPTATION) {
        // Need platform specification
        if (options?.targetPlatform) {
          transformed = this.transformer.draftToAdaptation(
            source as ContentDraft,
            options.targetPlatform as any,
            options
          );
        }
      }
      
      if (!transformed) {
        throw new Error(`Cannot transform from ${source.type} to ${targetType}`);
      }
      
      // Fill in missing required fields
      const complete = this.completeDocument(transformed, targetType);
      
      return complete;
      
    } catch (error: any) {
      this.emit('transformError', { source, targetType, error });
      return null;
    }
  }

  /**
   * Validate document
   */
  async validateDocument(document: BaseDocument): Promise<ValidationResult> {
    const result = this.validator.validate(document);
    
    if (!result.valid) {
      this.emit('validationFailed', { document, result });
    }
    
    return result;
  }

  /**
   * Save document to storage
   */
  private async saveDocument(document: BaseDocument, content: string): Promise<void> {
    try {
      const result = await this.storage.save(document, content);
      
      if (result.success) {
        this.emit('documentSaved', { document, path: result.path });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      this.emit('saveError', { document, error });
      // Don't fail pipeline for save errors if intermediate saves
      if (!this.config.saveIntermediateResults) {
        throw error;
      }
    }
  }

  /**
   * Load document from storage
   */
  async loadDocument(id: string): Promise<{ document: BaseDocument; content: string }> {
    return this.storage.load(id);
  }

  /**
   * Query documents
   */
  async queryDocuments(filter: any): Promise<BaseDocument[]> {
    return this.storage.query(filter);
  }

  /**
   * Get pipeline status
   */
  getPipelineStatus(contextId: string): PipelineContext | undefined {
    return this.activeContexts.get(contextId);
  }

  /**
   * Get all active pipelines
   */
  getActivePipelines(): PipelineContext[] {
    return Array.from(this.activeContexts.values());
  }

  /**
   * Cancel pipeline execution
   */
  cancelPipeline(contextId: string): boolean {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      return false;
    }
    
    context.errors.push(new Error('Pipeline cancelled by user'));
    this.activeContexts.delete(contextId);
    
    this.emit('pipelineCancelled', { contextId });
    
    return true;
  }

  /**
   * Retry failed stage
   */
  async retryStage(contextId: string, retryCount: number = 0): Promise<boolean> {
    const context = this.activeContexts.get(contextId);
    if (!context) {
      return false;
    }
    
    if (retryCount >= this.config.maxRetries) {
      this.emit('retryExhausted', { contextId, stage: context.currentStage });
      return false;
    }
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
    
    this.emit('retryAttempt', {
      contextId,
      stage: context.currentStage,
      attempt: retryCount + 1
    });
    
    // Clear last error for retry
    context.errors.pop();
    
    return true;
  }

  /**
   * Generate context ID
   */
  private generateContextId(): string {
    return `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Complete partial document with required fields
   */
  private completeDocument(
    partial: Partial<BaseDocument>,
    type: DocumentType
  ): BaseDocument {
    const now = new Date();
    
    return {
      id: partial.id || `${type}-${Date.now()}`,
      type,
      created: partial.created || now,
      modified: partial.modified || now,
      version: partial.version || 1,
      metadata: partial.metadata || {
        agent: this.getAgentForType(type),
        status: 'pending' as any,
        methodologies: []
      },
      ...partial
    } as BaseDocument;
  }

  /**
   * Get agent for document type
   */
  private getAgentForType(type: DocumentType): any {
    switch (type) {
      case DocumentType.CONTENT_BRIEF:
        return 'collector';
      case DocumentType.KNOWLEDGE_SYNTHESIS:
        return 'scholar';
      case DocumentType.CONTENT_DRAFT:
        return 'creator';
      case DocumentType.PLATFORM_ADAPTATION:
        return 'adapter';
      default:
        return 'unknown';
    }
  }

  /**
   * Get pipeline statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    const storageStats = await (this.storage as FileSystemStorage).getStatistics();
    
    return {
      activePipelines: this.activeContexts.size,
      ...storageStats
    };
  }
}