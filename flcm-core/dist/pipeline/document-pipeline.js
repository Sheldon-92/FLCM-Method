"use strict";
/**
 * Document Pipeline Coordinator for FLCM
 * Orchestrates document flow through the system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPipeline = exports.PipelineStage = void 0;
const events_1 = require("events");
const document_schemas_1 = require("./document-schemas");
const document_validator_1 = require("./document-validator");
const document_transformer_1 = require("./document-transformer");
const metadata_manager_1 = require("./metadata-manager");
const document_storage_1 = require("./document-storage");
/**
 * Pipeline stage
 */
var PipelineStage;
(function (PipelineStage) {
    PipelineStage["COLLECTION"] = "collection";
    PipelineStage["SYNTHESIS"] = "synthesis";
    PipelineStage["CREATION"] = "creation";
    PipelineStage["ADAPTATION"] = "adaptation";
    PipelineStage["COMPLETE"] = "complete";
})(PipelineStage = exports.PipelineStage || (exports.PipelineStage = {}));
/**
 * Document Pipeline Class
 */
class DocumentPipeline extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = {
            validateOnTransition: true,
            saveIntermediateResults: true,
            enableVersioning: true,
            maxRetries: 3,
            retryDelay: 1000,
            ...config
        };
        this.validator = new document_validator_1.DocumentValidator();
        this.transformer = new document_transformer_1.DocumentTransformer();
        this.metadataManager = new metadata_manager_1.MetadataManager();
        this.storage = new document_storage_1.FileSystemStorage();
        this.activeContexts = new Map();
    }
    /**
     * Start a new pipeline execution
     */
    async startPipeline(brief) {
        const contextId = this.generateContextId();
        const context = {
            id: contextId,
            startTime: new Date(),
            currentStage: PipelineStage.COLLECTION,
            documents: new Map([[document_schemas_1.DocumentType.CONTENT_BRIEF, brief]]),
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
    async transitionToSynthesis(contextId, synthesis) {
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
            context.documents.set(document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS, synthesis);
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
        }
        catch (error) {
            context.errors.push(error);
            this.emit('stageError', { contextId, stage: PipelineStage.SYNTHESIS, error });
            return false;
        }
    }
    /**
     * Transition to creation stage
     */
    async transitionToCreation(contextId, draft) {
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
            context.documents.set(document_schemas_1.DocumentType.CONTENT_DRAFT, draft);
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
        }
        catch (error) {
            context.errors.push(error);
            this.emit('stageError', { contextId, stage: PipelineStage.CREATION, error });
            return false;
        }
    }
    /**
     * Transition to adaptation stage
     */
    async transitionToAdaptation(contextId, adaptations) {
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
                context.documents.set(`${document_schemas_1.DocumentType.PLATFORM_ADAPTATION}-${adaptation.platform}`, adaptation);
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
        }
        catch (error) {
            context.errors.push(error);
            this.emit('stageError', { contextId, stage: PipelineStage.ADAPTATION, error });
            return false;
        }
    }
    /**
     * Complete pipeline execution
     */
    async completePipeline(contextId) {
        const context = this.activeContexts.get(contextId);
        if (!context) {
            throw new Error(`Pipeline context not found: ${contextId}`);
        }
        context.currentStage = PipelineStage.COMPLETE;
        const duration = Date.now() - context.startTime.getTime();
        // Get final document (last created)
        const documents = Array.from(context.documents.values());
        const finalDocument = documents[documents.length - 1];
        const result = {
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
    async transformDocument(source, targetType, options) {
        try {
            let transformed = null;
            // Determine transformation based on source and target types
            if (source.type === document_schemas_1.DocumentType.CONTENT_BRIEF &&
                targetType === document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS) {
                transformed = this.transformer.briefToSynthesis(source, options);
            }
            else if (source.type === document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS &&
                targetType === document_schemas_1.DocumentType.CONTENT_DRAFT) {
                transformed = this.transformer.synthesisToDraft(source, options);
            }
            else if (source.type === document_schemas_1.DocumentType.CONTENT_DRAFT &&
                targetType === document_schemas_1.DocumentType.PLATFORM_ADAPTATION) {
                // Need platform specification
                if (options?.targetPlatform) {
                    transformed = this.transformer.draftToAdaptation(source, options.targetPlatform, options);
                }
            }
            if (!transformed) {
                throw new Error(`Cannot transform from ${source.type} to ${targetType}`);
            }
            // Fill in missing required fields
            const complete = this.completeDocument(transformed, targetType);
            return complete;
        }
        catch (error) {
            this.emit('transformError', { source, targetType, error });
            return null;
        }
    }
    /**
     * Validate document
     */
    async validateDocument(document) {
        const result = this.validator.validate(document);
        if (!result.valid) {
            this.emit('validationFailed', { document, result });
        }
        return result;
    }
    /**
     * Save document to storage
     */
    async saveDocument(document, content) {
        try {
            const result = await this.storage.save(document, content);
            if (result.success) {
                this.emit('documentSaved', { document, path: result.path });
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
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
    async loadDocument(id) {
        return this.storage.load(id);
    }
    /**
     * Query documents
     */
    async queryDocuments(filter) {
        return this.storage.query(filter);
    }
    /**
     * Get pipeline status
     */
    getPipelineStatus(contextId) {
        return this.activeContexts.get(contextId);
    }
    /**
     * Get all active pipelines
     */
    getActivePipelines() {
        return Array.from(this.activeContexts.values());
    }
    /**
     * Cancel pipeline execution
     */
    cancelPipeline(contextId) {
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
    async retryStage(contextId, retryCount = 0) {
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
    generateContextId() {
        return `pipeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Complete partial document with required fields
     */
    completeDocument(partial, type) {
        const now = new Date();
        return {
            id: partial.id || `${type}-${Date.now()}`,
            type,
            created: partial.created || now,
            modified: partial.modified || now,
            version: partial.version || 1,
            metadata: partial.metadata || {
                agent: this.getAgentForType(type),
                status: 'pending',
                methodologies: []
            },
            ...partial
        };
    }
    /**
     * Get agent for document type
     */
    getAgentForType(type) {
        switch (type) {
            case document_schemas_1.DocumentType.CONTENT_BRIEF:
                return 'collector';
            case document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS:
                return 'scholar';
            case document_schemas_1.DocumentType.CONTENT_DRAFT:
                return 'creator';
            case document_schemas_1.DocumentType.PLATFORM_ADAPTATION:
                return 'adapter';
            default:
                return 'unknown';
        }
    }
    /**
     * Get pipeline statistics
     */
    async getStatistics() {
        const storageStats = await this.storage.getStatistics();
        return {
            activePipelines: this.activeContexts.size,
            ...storageStats
        };
    }
}
exports.DocumentPipeline = DocumentPipeline;
//# sourceMappingURL=document-pipeline.js.map