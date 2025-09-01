/**
 * Code Processor
 * Handles code files and spreadsheet processing
 */
/// <reference types="node" />
/// <reference types="node" />
import { ProcessorResult } from './text-processor';
export declare class CodeProcessor {
    /**
     * Process code or spreadsheet content
     */
    process(source: string | Buffer): Promise<ProcessorResult>;
    /**
     * Detect file type
     */
    private detectFileType;
    /**
     * Detect programming language
     */
    private detectLanguage;
    /**
     * Process code files
     */
    private processCode;
    /**
     * Process spreadsheet files
     * In production: Use xlsx or csv-parse libraries
     */
    private processSpreadsheet;
}
