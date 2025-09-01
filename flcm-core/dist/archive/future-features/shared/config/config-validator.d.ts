/**
 * FLCM Configuration Validator
 * Advanced validation and rule checking for configuration
 */
import { FLCMConfig } from './config-schema';
/**
 * Validation rule types
 */
export declare enum ValidationSeverity {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info"
}
/**
 * Validation issue
 */
export interface ValidationIssue {
    path: string;
    message: string;
    severity: ValidationSeverity;
    rule?: string;
}
/**
 * Validation result with detailed issues
 */
export interface DetailedValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    stats: {
        errors: number;
        warnings: number;
        info: number;
    };
}
/**
 * Configuration Validator
 * Provides detailed validation beyond schema checking
 */
export declare class ConfigValidator {
    private issues;
    /**
     * Perform comprehensive validation
     */
    validateComprehensive(config: FLCMConfig): DetailedValidationResult;
    /**
     * Validate basic structure
     */
    private validateStructure;
    /**
     * Validate business logic
     */
    private validateBusinessLogic;
    /**
     * Validate file paths
     */
    private validatePaths;
    /**
     * Validate performance settings
     */
    private validatePerformance;
    /**
     * Validate security settings
     */
    private validateSecurity;
    /**
     * Validate feature compatibility
     */
    private validateFeatureCompatibility;
    /**
     * Validate platform-specific rules
     */
    private validatePlatformRules;
    /**
     * Add validation issue
     */
    private addIssue;
    /**
     * Format validation report
     */
    static formatReport(result: DetailedValidationResult): string;
}
export declare function validateConfig(config: FLCMConfig): DetailedValidationResult;
