/**
 * Document Validator for FLCM Pipeline
 * Validates documents against their schemas
 */
import { BaseDocument, ValidationResult } from './document-schemas';
/**
 * Document Validator Class
 */
export declare class DocumentValidator {
    private rules;
    constructor();
    /**
     * Initialize validation rules for each document type
     */
    private initializeRules;
    /**
     * Validate a document
     */
    validate(document: BaseDocument): ValidationResult;
    /**
     * Validate required fields
     */
    private validateRequiredFields;
    /**
     * Validate field types
     */
    private validateFieldTypes;
    /**
     * Validate field constraints
     */
    private validateFieldConstraints;
    /**
     * Perform type-specific validation
     */
    private performTypeSpecificValidation;
    /**
     * Validate Content Brief specific rules
     */
    private validateContentBrief;
    /**
     * Validate Knowledge Synthesis specific rules
     */
    private validateKnowledgeSynthesis;
    /**
     * Validate Content Draft specific rules
     */
    private validateContentDraft;
    /**
     * Validate Platform Adaptation specific rules
     */
    private validatePlatformAdaptation;
    /**
     * Validate metadata
     */
    private validateMetadata;
    /**
     * Calculate validation score
     */
    private calculateValidationScore;
    /**
     * Get field type
     */
    private getFieldType;
    /**
     * Validate frontmatter YAML
     */
    validateFrontmatter(frontmatter: string): ValidationResult;
    /**
     * Check if string is valid ISO 8601 date
     */
    private isValidISO8601;
}
