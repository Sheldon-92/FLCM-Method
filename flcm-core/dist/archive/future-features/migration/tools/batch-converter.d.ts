/**
 * Batch Converter Tool
 * Converts multiple documents between v1 and v2 formats
 */
export interface BatchConversionOptions {
    sourceDir: string;
    targetDir: string;
    targetVersion: '1.0' | '2.0';
    preserveOriginals?: boolean;
    dryRun?: boolean;
    maxConcurrent?: number;
    progressCallback?: (progress: BatchProgress) => void;
}
export interface BatchProgress {
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    currentFile?: string;
    percentage: number;
    estimatedTimeRemaining?: number;
}
export interface BatchConversionReport {
    totalFiles: number;
    successful: number;
    failed: number;
    warnings: number;
    dataLoss: number;
    duration: number;
    details: ConversionDetail[];
}
export interface ConversionDetail {
    file: string;
    success: boolean;
    warnings?: string[];
    errors?: string[];
    dataLoss?: string[];
}
export declare class BatchConverter {
    private converter;
    private logger;
    private abortController?;
    constructor();
    /**
     * Convert all documents in a directory
     */
    convertBatch(options: BatchConversionOptions): Promise<BatchConversionReport>;
    /**
     * Cancel ongoing batch conversion
     */
    cancel(): void;
    /**
     * Scan vault for documents
     */
    private scanVault;
    /**
     * Process files with concurrency control
     */
    private processFilesWithConcurrency;
    /**
     * Convert a single file
     */
    private convertFile;
    /**
     * Check if file is a document
     */
    private isDocumentFile;
    /**
     * Parse document from string
     */
    private parseDocument;
    /**
     * Stringify document for saving
     */
    private stringifyDocument;
    /**
     * Get target file name
     */
    private getTargetFileName;
    /**
     * Estimate time remaining
     */
    private estimateTimeRemaining;
    /**
     * Save conversion report
     */
    private saveReport;
    /**
     * Rollback conversion
     */
    rollback(reportPath: string): Promise<void>;
}
