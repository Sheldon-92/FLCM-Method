"use strict";
/**
 * Text Processor
 * Handles text and markdown content processing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextProcessor = void 0;
const fs = __importStar(require("fs"));
const logger_1 = require("../../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('TextProcessor');
class TextProcessor {
    /**
     * Process text or markdown content
     */
    async process(source) {
        try {
            let text;
            if (typeof source === 'string') {
                // Check if it's a file path
                if (this.isFilePath(source)) {
                    text = await this.readFile(source);
                }
                else {
                    text = source;
                }
            }
            else if (Buffer.isBuffer(source)) {
                text = source.toString('utf8');
            }
            else {
                throw new Error('Invalid source type for text processor');
            }
            // Clean and normalize text
            text = this.normalizeText(text);
            // Extract metadata
            const metadata = this.extractMetadata(text);
            return {
                text,
                metadata,
            };
        }
        catch (error) {
            logger.error('Text processing failed:', error);
            throw error;
        }
    }
    /**
     * Check if string is a file path
     */
    isFilePath(str) {
        // Simple check - in production, use more robust validation
        return str.includes('/') || str.includes('\\') || str.endsWith('.txt') || str.endsWith('.md');
    }
    /**
     * Read file content
     */
    async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, 'utf8');
        }
        catch (error) {
            logger.error(`Failed to read file ${filePath}:`, error);
            throw new Error(`Cannot read file: ${filePath}`);
        }
    }
    /**
     * Normalize text content
     */
    normalizeText(text) {
        return text
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\t/g, '  ') // Convert tabs to spaces
            .trim(); // Remove leading/trailing whitespace
    }
    /**
     * Extract metadata from text
     */
    extractMetadata(text) {
        const lines = text.split('\n');
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        return {
            wordCount: words.length,
            lineCount: lines.length,
            paragraphCount: paragraphs.length,
            language: this.detectLanguage(text),
            encoding: 'utf8',
            averageWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
            hasMarkdown: this.detectMarkdown(text),
        };
    }
    /**
     * Simple language detection
     */
    detectLanguage(text) {
        // Check for Chinese characters
        if (/[\u4e00-\u9fa5]/.test(text)) {
            return 'zh';
        }
        // Check for Japanese characters
        if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
            return 'ja';
        }
        // Check for Korean characters
        if (/[\uac00-\ud7af]/.test(text)) {
            return 'ko';
        }
        // Default to English
        return 'en';
    }
    /**
     * Detect if text contains markdown
     */
    detectMarkdown(text) {
        const markdownPatterns = [
            /^#{1,6}\s/m,
            /\*\*[^*]+\*\*/,
            /\*[^*]+\*/,
            /\[([^\]]+)\]\([^)]+\)/,
            /^[-*+]\s/m,
            /^>\s/m,
            /```[^`]+```/s, // Code blocks
        ];
        return markdownPatterns.some(pattern => pattern.test(text));
    }
}
exports.TextProcessor = TextProcessor;
//# sourceMappingURL=text-processor.js.map