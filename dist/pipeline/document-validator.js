"use strict";
/**
 * Document Validator for FLCM Pipeline
 * Validates documents against their schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentValidator = void 0;
const document_schemas_1 = require("./document-schemas");
/**
 * Document Validator Class
 */
class DocumentValidator {
    constructor() {
        this.rules = new Map();
        this.initializeRules();
    }
    /**
     * Initialize validation rules for each document type
     */
    initializeRules() {
        // Content Brief rules
        this.rules.set(document_schemas_1.DocumentType.CONTENT_BRIEF, {
            requiredFields: ['id', 'type', 'sources', 'insights', 'signalScore', 'concepts'],
            fieldTypes: {
                id: 'string',
                type: 'string',
                sources: 'array',
                insights: 'array',
                signalScore: 'number',
                concepts: 'array',
                created: 'date',
                modified: 'date'
            },
            fieldConstraints: {
                signalScore: { min: 0, max: 1 },
                sources: { minLength: 1 },
                insights: { minLength: 1 },
                concepts: { minLength: 1 }
            }
        });
        // Knowledge Synthesis rules
        this.rules.set(document_schemas_1.DocumentType.KNOWLEDGE_SYNTHESIS, {
            requiredFields: ['id', 'type', 'briefId', 'concept', 'depthLevel', 'confidence'],
            fieldTypes: {
                id: 'string',
                type: 'string',
                briefId: 'string',
                concept: 'string',
                depthLevel: 'number',
                confidence: 'number',
                teachingReady: 'boolean'
            },
            fieldConstraints: {
                depthLevel: { min: 1, max: 5 },
                confidence: { min: 0, max: 1 }
            }
        });
        // Content Draft rules
        this.rules.set(document_schemas_1.DocumentType.CONTENT_DRAFT, {
            requiredFields: ['id', 'type', 'synthesisId', 'title', 'content', 'wordCount'],
            fieldTypes: {
                id: 'string',
                type: 'string',
                synthesisId: 'string',
                title: 'string',
                content: 'string',
                wordCount: 'number',
                readingTime: 'number'
            },
            fieldConstraints: {
                wordCount: { min: 50 },
                title: { maxLength: 200 },
                readingTime: { min: 1 }
            }
        });
        // Platform Adaptation rules
        this.rules.set(document_schemas_1.DocumentType.PLATFORM_ADAPTATION, {
            requiredFields: ['id', 'type', 'draftId', 'platform', 'adaptedContent'],
            fieldTypes: {
                id: 'string',
                type: 'string',
                draftId: 'string',
                platform: 'string',
                adaptedContent: 'string',
                characterCount: 'number'
            },
            fieldConstraints: {
                platform: {
                    enum: ['wechat', 'xiaohongshu', 'linkedin', 'twitter', 'medium', 'substack']
                },
                characterCount: { min: 1 }
            }
        });
    }
    /**
     * Validate a document
     */
    validate(document) {
        const errors = [];
        const warnings = [];
        // Get rules for document type
        const rules = this.rules.get(document.type);
        if (!rules) {
            errors.push({
                field: 'type',
                message: `Unknown document type: ${document.type}`,
                severity: 'critical',
                code: 'UNKNOWN_TYPE'
            });
            return { valid: false, errors, warnings, score: 0 };
        }
        // Validate required fields
        this.validateRequiredFields(document, rules, errors);
        // Validate field types
        this.validateFieldTypes(document, rules, errors);
        // Validate field constraints
        this.validateFieldConstraints(document, rules, errors, warnings);
        // Type-specific validation
        this.performTypeSpecificValidation(document, errors, warnings);
        // Validate metadata
        this.validateMetadata(document, errors, warnings);
        // Calculate validation score
        const score = this.calculateValidationScore(errors, warnings);
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            score
        };
    }
    /**
     * Validate required fields
     */
    validateRequiredFields(document, rules, errors) {
        for (const field of rules.requiredFields) {
            if (document[field] === undefined || document[field] === null) {
                errors.push({
                    field,
                    message: `Required field '${field}' is missing`,
                    severity: 'error',
                    code: 'MISSING_FIELD'
                });
            }
        }
    }
    /**
     * Validate field types
     */
    validateFieldTypes(document, rules, errors) {
        for (const [field, expectedType] of Object.entries(rules.fieldTypes)) {
            const value = document[field];
            if (value === undefined || value === null)
                continue;
            const actualType = this.getFieldType(value);
            if (actualType !== expectedType) {
                errors.push({
                    field,
                    message: `Field '${field}' must be of type '${expectedType}', got '${actualType}'`,
                    severity: 'error',
                    code: 'INVALID_TYPE'
                });
            }
        }
    }
    /**
     * Validate field constraints
     */
    validateFieldConstraints(document, rules, errors, warnings) {
        for (const [field, constraints] of Object.entries(rules.fieldConstraints || {})) {
            const value = document[field];
            if (value === undefined || value === null)
                continue;
            // Min/Max constraints
            if (constraints.min !== undefined && value < constraints.min) {
                errors.push({
                    field,
                    message: `Field '${field}' must be at least ${constraints.min}`,
                    severity: 'error',
                    code: 'CONSTRAINT_VIOLATION'
                });
            }
            if (constraints.max !== undefined && value > constraints.max) {
                errors.push({
                    field,
                    message: `Field '${field}' must be at most ${constraints.max}`,
                    severity: 'error',
                    code: 'CONSTRAINT_VIOLATION'
                });
            }
            // Length constraints
            if (constraints.minLength !== undefined && value.length < constraints.minLength) {
                errors.push({
                    field,
                    message: `Field '${field}' must have at least ${constraints.minLength} items`,
                    severity: 'error',
                    code: 'LENGTH_VIOLATION'
                });
            }
            if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
                warnings.push({
                    field,
                    message: `Field '${field}' exceeds recommended length of ${constraints.maxLength}`,
                    suggestion: `Consider shortening to ${constraints.maxLength} characters or less`
                });
            }
            // Enum constraints
            if (constraints.enum && !constraints.enum.includes(value)) {
                errors.push({
                    field,
                    message: `Field '${field}' must be one of: ${constraints.enum.join(', ')}`,
                    severity: 'error',
                    code: 'ENUM_VIOLATION'
                });
            }
        }
    }
    /**
     * Perform type-specific validation
     */
    performTypeSpecificValidation(document, errors, warnings) {
        if ((0, document_schemas_1.isContentBrief)(document)) {
            this.validateContentBrief(document, errors, warnings);
        }
        else if ((0, document_schemas_1.isKnowledgeSynthesis)(document)) {
            this.validateKnowledgeSynthesis(document, errors, warnings);
        }
        else if ((0, document_schemas_1.isContentDraft)(document)) {
            this.validateContentDraft(document, errors, warnings);
        }
        else if ((0, document_schemas_1.isPlatformAdaptation)(document)) {
            this.validatePlatformAdaptation(document, errors, warnings);
        }
    }
    /**
     * Validate Content Brief specific rules
     */
    validateContentBrief(document, errors, warnings) {
        // Validate signal scores
        const signals = document.signals;
        if (signals) {
            const scoreSum = signals.relevance + signals.impact + signals.confidence + signals.effort;
            if (Math.abs(scoreSum - document.signalScore * 4) > 0.1) {
                warnings.push({
                    field: 'signalScore',
                    message: 'Signal score does not match individual signal values',
                    suggestion: 'Recalculate signal score from individual components'
                });
            }
        }
        // Validate insights
        for (const insight of document.insights) {
            if (insight.relevance < 0.5) {
                warnings.push({
                    field: 'insights',
                    message: `Insight '${insight.id}' has low relevance (${insight.relevance})`,
                    suggestion: 'Consider removing or improving low-relevance insights'
                });
            }
        }
    }
    /**
     * Validate Knowledge Synthesis specific rules
     */
    validateKnowledgeSynthesis(document, errors, warnings) {
        // Validate depth progression
        if (document.layers) {
            const levels = document.layers.map(l => l.level).sort();
            for (let i = 1; i < levels.length; i++) {
                if (levels[i] - levels[i - 1] > 1) {
                    warnings.push({
                        field: 'layers',
                        message: 'Knowledge layers have gaps in progression',
                        suggestion: 'Consider adding intermediate layers for smoother learning'
                    });
                }
            }
        }
        // Validate teaching readiness
        if (document.teachingReady && document.confidence < 0.7) {
            warnings.push({
                field: 'teachingReady',
                message: 'Document marked as teaching ready but confidence is low',
                suggestion: 'Consider improving confidence before marking as teaching ready'
            });
        }
    }
    /**
     * Validate Content Draft specific rules
     */
    validateContentDraft(document, errors, warnings) {
        // Validate word count vs content
        const actualWordCount = document.content.split(/\s+/).length;
        if (Math.abs(actualWordCount - document.wordCount) > 50) {
            warnings.push({
                field: 'wordCount',
                message: `Declared word count (${document.wordCount}) differs from actual (${actualWordCount})`,
                suggestion: 'Update word count to match actual content'
            });
        }
        // Validate reading time
        const expectedReadingTime = Math.ceil(actualWordCount / 200);
        if (document.readingTime && Math.abs(document.readingTime - expectedReadingTime) > 2) {
            warnings.push({
                field: 'readingTime',
                message: `Reading time seems incorrect for word count`,
                suggestion: `Consider updating to ${expectedReadingTime} minutes`
            });
        }
        // Validate hooks
        if (document.hooks && document.hooks.length === 0) {
            warnings.push({
                field: 'hooks',
                message: 'No hooks defined for engaging readers',
                suggestion: 'Add at least one opening hook for better engagement'
            });
        }
    }
    /**
     * Validate Platform Adaptation specific rules
     */
    validatePlatformAdaptation(document, errors, warnings) {
        // Platform-specific character limits
        const platformLimits = {
            twitter: 280,
            linkedin: 3000,
            wechat: 20000,
            xiaohongshu: 1000,
            medium: 100000,
            substack: 100000
        };
        const limit = platformLimits[document.platform];
        if (limit && document.characterCount > limit) {
            errors.push({
                field: 'characterCount',
                message: `Content exceeds ${document.platform} limit of ${limit} characters`,
                severity: 'error',
                code: 'PLATFORM_LIMIT_EXCEEDED'
            });
        }
        // Validate hashtags
        if (document.platform === 'twitter' && document.hashtags.length > 3) {
            warnings.push({
                field: 'hashtags',
                message: 'Too many hashtags for Twitter',
                suggestion: 'Use 1-3 hashtags for optimal engagement'
            });
        }
        if (document.platform === 'linkedin' && document.hashtags.length > 5) {
            warnings.push({
                field: 'hashtags',
                message: 'Too many hashtags for LinkedIn',
                suggestion: 'Use 3-5 hashtags for professional content'
            });
        }
    }
    /**
     * Validate metadata
     */
    validateMetadata(document, errors, warnings) {
        if (!document.metadata) {
            errors.push({
                field: 'metadata',
                message: 'Metadata is required',
                severity: 'error',
                code: 'MISSING_METADATA'
            });
            return;
        }
        // Validate agent
        const validAgents = ['collector', 'scholar', 'creator', 'adapter'];
        if (!validAgents.includes(document.metadata.agent)) {
            errors.push({
                field: 'metadata.agent',
                message: `Invalid agent: ${document.metadata.agent}`,
                severity: 'error',
                code: 'INVALID_AGENT'
            });
        }
        // Validate dates
        if (document.created > document.modified) {
            errors.push({
                field: 'modified',
                message: 'Modified date cannot be before created date',
                severity: 'error',
                code: 'INVALID_DATE'
            });
        }
    }
    /**
     * Calculate validation score
     */
    calculateValidationScore(errors, warnings) {
        const criticalErrors = errors.filter(e => e.severity === 'critical').length;
        const regularErrors = errors.filter(e => e.severity === 'error').length;
        let score = 100;
        score -= criticalErrors * 50;
        score -= regularErrors * 10;
        score -= warnings.length * 2;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Get field type
     */
    getFieldType(value) {
        if (Array.isArray(value))
            return 'array';
        if (value instanceof Date)
            return 'date';
        if (value === null)
            return 'null';
        return typeof value;
    }
    /**
     * Validate frontmatter YAML
     */
    validateFrontmatter(frontmatter) {
        const errors = [];
        const warnings = [];
        try {
            const yaml = require('js-yaml');
            const parsed = yaml.load(frontmatter);
            // Check required frontmatter fields
            const requiredFields = ['flcm_type', 'flcm_id', 'agent', 'status', 'created'];
            for (const field of requiredFields) {
                if (!parsed[field]) {
                    errors.push({
                        field,
                        message: `Required frontmatter field '${field}' is missing`,
                        severity: 'error',
                        code: 'MISSING_FRONTMATTER_FIELD'
                    });
                }
            }
            // Validate date format
            if (parsed.created && !this.isValidISO8601(parsed.created)) {
                errors.push({
                    field: 'created',
                    message: 'Created date must be in ISO 8601 format',
                    severity: 'error',
                    code: 'INVALID_DATE_FORMAT'
                });
            }
        }
        catch (error) {
            errors.push({
                field: 'frontmatter',
                message: `Invalid YAML: ${error.message}`,
                severity: 'critical',
                code: 'INVALID_YAML'
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            score: this.calculateValidationScore(errors, warnings)
        };
    }
    /**
     * Check if string is valid ISO 8601 date
     */
    isValidISO8601(dateString) {
        const date = new Date(dateString);
        return date.toISOString() === dateString;
    }
}
exports.DocumentValidator = DocumentValidator;
//# sourceMappingURL=document-validator.js.map