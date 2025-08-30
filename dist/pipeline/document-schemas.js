"use strict";
/**
 * Document Schema Definitions for FLCM Pipeline
 * Defines the structure of documents flowing between agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlatformAdaptation = exports.isContentDraft = exports.isKnowledgeSynthesis = exports.isContentBrief = exports.DocumentStatus = exports.DocumentType = void 0;
/**
 * Document types in the pipeline
 */
var DocumentType;
(function (DocumentType) {
    DocumentType["CONTENT_BRIEF"] = "content-brief";
    DocumentType["KNOWLEDGE_SYNTHESIS"] = "knowledge-synthesis";
    DocumentType["CONTENT_DRAFT"] = "content-draft";
    DocumentType["PLATFORM_ADAPTATION"] = "platform-adaptation";
})(DocumentType = exports.DocumentType || (exports.DocumentType = {}));
/**
 * Document status
 */
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "pending";
    DocumentStatus["PROCESSING"] = "processing";
    DocumentStatus["PROCESSED"] = "processed";
    DocumentStatus["ERROR"] = "error";
    DocumentStatus["ARCHIVED"] = "archived";
})(DocumentStatus = exports.DocumentStatus || (exports.DocumentStatus = {}));
/**
 * Type guards for document types
 */
function isContentBrief(doc) {
    return doc.type === DocumentType.CONTENT_BRIEF;
}
exports.isContentBrief = isContentBrief;
function isKnowledgeSynthesis(doc) {
    return doc.type === DocumentType.KNOWLEDGE_SYNTHESIS;
}
exports.isKnowledgeSynthesis = isKnowledgeSynthesis;
function isContentDraft(doc) {
    return doc.type === DocumentType.CONTENT_DRAFT;
}
exports.isContentDraft = isContentDraft;
function isPlatformAdaptation(doc) {
    return doc.type === DocumentType.PLATFORM_ADAPTATION;
}
exports.isPlatformAdaptation = isPlatformAdaptation;
//# sourceMappingURL=document-schemas.js.map