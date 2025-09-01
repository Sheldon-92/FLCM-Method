"use strict";
/**
 * Document Schema for FLCM 2.0 Pipeline
 * Defines all document types and interfaces for the content processing pipeline
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentValidator = exports.ProcessingState = void 0;
// Document processing state
var ProcessingState;
(function (ProcessingState) {
    ProcessingState["PENDING"] = "pending";
    ProcessingState["PROCESSING"] = "processing";
    ProcessingState["COMPLETED"] = "completed";
    ProcessingState["ERROR"] = "error";
    ProcessingState["CANCELLED"] = "cancelled";
})(ProcessingState = exports.ProcessingState || (exports.ProcessingState = {}));
// Utility functions
class DocumentValidator {
    static validateContentDocument(doc) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        if (!doc.id)
            errors.push('Document ID is required');
        if (!doc.title)
            errors.push('Title is required');
        if (!doc.content)
            errors.push('Content is required');
        if (!doc.source)
            errors.push('Source information is required');
        if (doc.content && doc.content.length < 50) {
            warnings.push('Content is very short');
        }
        if (doc.content && doc.content.length > 10000) {
            warnings.push('Content is very long, consider breaking it down');
        }
        return { valid: errors.length === 0, errors, warnings, suggestions };
    }
    static validateInsightsDocument(doc) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        if (!doc.analysis || doc.analysis.length === 0) {
            errors.push('Analysis results are required');
        }
        if (!doc.keyPoints || doc.keyPoints.length === 0) {
            warnings.push('No key points identified');
        }
        return { valid: errors.length === 0, errors, warnings, suggestions };
    }
}
exports.DocumentValidator = DocumentValidator;
//# sourceMappingURL=document-schema.js.map