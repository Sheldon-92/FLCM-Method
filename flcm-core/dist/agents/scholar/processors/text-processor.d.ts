/**
 * Text Processor
 * Handles text and markdown content processing
 */
/// <reference types="node" />
/// <reference types="node" />
export interface ProcessorResult {
    text: string;
    metadata: {
        wordCount: number;
        lineCount: number;
        paragraphCount: number;
        language?: string;
        encoding?: string;
        [key: string]: any;
    };
}
export declare class TextProcessor {
    /**
     * Process text or markdown content
     */
    process(source: string | Buffer): Promise<ProcessorResult>;
    /**
     * Check if string is a file path
     */
    private isFilePath;
    /**
     * Read file content
     */
    private readFile;
    /**
     * Normalize text content
     */
    private normalizeText;
    /**
     * Extract metadata from text
     */
    private extractMetadata;
    /**
     * Simple language detection
     */
    private detectLanguage;
    /**
     * Detect if text contains markdown
     */
    private detectMarkdown;
}
