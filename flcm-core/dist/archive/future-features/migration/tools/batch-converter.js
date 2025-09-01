"use strict";
/**
 * Batch Converter Tool
 * Converts multiple documents between v1 and v2 formats
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
exports.BatchConverter = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const document_converter_1 = require("../converters/document-converter");
const logger_1 = require("../../shared/utils/logger");
class BatchConverter {
    constructor() {
        this.converter = new document_converter_1.DocumentConverter();
        this.logger = new logger_1.Logger('BatchConverter');
    }
    /**
     * Convert all documents in a directory
     */
    async convertBatch(options) {
        const startTime = Date.now();
        const report = {
            totalFiles: 0,
            successful: 0,
            failed: 0,
            warnings: 0,
            dataLoss: 0,
            duration: 0,
            details: []
        };
        try {
            // Scan for documents
            const files = await this.scanVault(options.sourceDir);
            report.totalFiles = files.length;
            if (files.length === 0) {
                this.logger.warn('No documents found to convert');
                return report;
            }
            this.logger.info(`Found ${files.length} documents to convert`);
            // Create target directory if it doesn't exist
            if (!options.dryRun && !fs.existsSync(options.targetDir)) {
                fs.mkdirSync(options.targetDir, { recursive: true });
            }
            // Setup abort controller for cancellation
            this.abortController = new AbortController();
            // Process files with concurrency control
            const maxConcurrent = options.maxConcurrent || 5;
            const results = await this.processFilesWithConcurrency(files, options, maxConcurrent, report);
            // Update report
            for (const result of results) {
                if (result.success) {
                    report.successful++;
                }
                else {
                    report.failed++;
                }
                if (result.warnings && result.warnings.length > 0) {
                    report.warnings++;
                }
                if (result.dataLoss && result.dataLoss.length > 0) {
                    report.dataLoss++;
                }
                report.details.push(result);
            }
            report.duration = Date.now() - startTime;
            // Generate summary
            this.logger.info('Batch conversion completed', {
                successful: report.successful,
                failed: report.failed,
                duration: `${report.duration}ms`
            });
            // Save report
            if (!options.dryRun) {
                await this.saveReport(report, options.targetDir);
            }
            return report;
        }
        catch (error) {
            this.logger.error('Batch conversion failed', { error: error.message });
            report.duration = Date.now() - startTime;
            return report;
        }
    }
    /**
     * Cancel ongoing batch conversion
     */
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
            this.logger.info('Batch conversion cancelled');
        }
    }
    /**
     * Scan vault for documents
     */
    async scanVault(vaultPath) {
        const documents = [];
        const scanDir = (dir) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    // Skip hidden directories
                    if (!entry.name.startsWith('.')) {
                        scanDir(fullPath);
                    }
                }
                else if (entry.isFile()) {
                    // Check if it's a document file
                    if (this.isDocumentFile(entry.name)) {
                        documents.push(fullPath);
                    }
                }
            }
        };
        scanDir(vaultPath);
        return documents;
    }
    /**
     * Process files with concurrency control
     */
    async processFilesWithConcurrency(files, options, maxConcurrent, report) {
        const results = [];
        const queue = [...files];
        const processing = new Set();
        while (queue.length > 0 || processing.size > 0) {
            // Check for cancellation
            if (this.abortController?.signal.aborted) {
                break;
            }
            // Start new conversions up to max concurrent
            while (processing.size < maxConcurrent && queue.length > 0) {
                const file = queue.shift();
                const promise = this.convertFile(file, options).then(result => {
                    processing.delete(promise);
                    // Update progress
                    if (options.progressCallback) {
                        const progress = {
                            total: files.length,
                            processed: results.length + 1,
                            succeeded: results.filter(r => r.success).length + (result.success ? 1 : 0),
                            failed: results.filter(r => !r.success).length + (!result.success ? 1 : 0),
                            currentFile: file,
                            percentage: ((results.length + 1) / files.length) * 100,
                            estimatedTimeRemaining: this.estimateTimeRemaining(results.length + 1, files.length, report.duration)
                        };
                        options.progressCallback(progress);
                    }
                    return result;
                });
                processing.add(promise);
            }
            // Wait for at least one to complete
            if (processing.size > 0) {
                const result = await Promise.race(processing);
                results.push(result);
            }
        }
        return results;
    }
    /**
     * Convert a single file
     */
    async convertFile(filePath, options) {
        const fileName = path.basename(filePath);
        try {
            // Read document
            const content = fs.readFileSync(filePath, 'utf8');
            const document = this.parseDocument(content);
            // Convert document
            const result = await this.converter.convert(document, options.targetVersion);
            if (result.success && !options.dryRun) {
                // Save converted document
                const targetPath = path.join(options.targetDir, this.getTargetFileName(fileName, options.targetVersion));
                fs.writeFileSync(targetPath, this.stringifyDocument(result.document));
                // Backup original if requested
                if (options.preserveOriginals) {
                    const backupPath = path.join(options.targetDir, 'originals', fileName);
                    const backupDir = path.dirname(backupPath);
                    if (!fs.existsSync(backupDir)) {
                        fs.mkdirSync(backupDir, { recursive: true });
                    }
                    fs.copyFileSync(filePath, backupPath);
                }
            }
            return {
                file: fileName,
                success: result.success,
                warnings: result.warnings,
                errors: result.errors,
                dataLoss: result.dataLoss
            };
        }
        catch (error) {
            this.logger.error(`Failed to convert ${fileName}`, { error: error.message });
            return {
                file: fileName,
                success: false,
                errors: [error.message]
            };
        }
    }
    /**
     * Check if file is a document
     */
    isDocumentFile(fileName) {
        const extensions = ['.json', '.yaml', '.yml', '.md'];
        return extensions.some(ext => fileName.endsWith(ext));
    }
    /**
     * Parse document from string
     */
    parseDocument(content) {
        // Try JSON first
        try {
            return JSON.parse(content);
        }
        catch {
            // Try YAML
            try {
                const yaml = require('js-yaml');
                return yaml.load(content);
            }
            catch {
                // Try to extract JSON from markdown
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }
                throw new Error('Unable to parse document');
            }
        }
    }
    /**
     * Stringify document for saving
     */
    stringifyDocument(document) {
        return JSON.stringify(document, null, 2);
    }
    /**
     * Get target file name
     */
    getTargetFileName(originalName, targetVersion) {
        const ext = path.extname(originalName);
        const base = path.basename(originalName, ext);
        return `${base}_v${targetVersion}${ext}`;
    }
    /**
     * Estimate time remaining
     */
    estimateTimeRemaining(processed, total, elapsedTime) {
        if (processed === 0)
            return 0;
        const averageTime = elapsedTime / processed;
        const remaining = total - processed;
        return Math.round(averageTime * remaining);
    }
    /**
     * Save conversion report
     */
    async saveReport(report, targetDir) {
        const reportPath = path.join(targetDir, `conversion_report_${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        this.logger.info(`Conversion report saved to ${reportPath}`);
    }
    /**
     * Rollback conversion
     */
    async rollback(reportPath) {
        try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            for (const detail of report.details) {
                if (detail.success) {
                    // Remove converted file
                    const convertedPath = path.join(path.dirname(reportPath), detail.file);
                    if (fs.existsSync(convertedPath)) {
                        fs.unlinkSync(convertedPath);
                    }
                    // Restore original if backed up
                    const backupPath = path.join(path.dirname(reportPath), 'originals', detail.file);
                    if (fs.existsSync(backupPath)) {
                        fs.copyFileSync(backupPath, convertedPath);
                    }
                }
            }
            this.logger.info('Rollback completed');
        }
        catch (error) {
            this.logger.error('Rollback failed', { error: error.message });
            throw error;
        }
    }
}
exports.BatchConverter = BatchConverter;
//# sourceMappingURL=batch-converter.js.map