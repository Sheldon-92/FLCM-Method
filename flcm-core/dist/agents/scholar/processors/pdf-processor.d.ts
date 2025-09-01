/**
 * PDF Processor
 * Handles PDF document processing and text extraction
 */
/// <reference types="node" />
/// <reference types="node" />
import { ProcessorResult } from './text-processor';
export declare class PDFProcessor {
    /**
     * Process PDF content
     * Note: In production, use pdf-parse or similar library
     */
    process(source: string | Buffer): Promise<ProcessorResult>;
}
