/**
 * Batch Converter Tool
 * Converts multiple documents between v1 and v2 formats
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocumentConverter, ConversionResult } from '../converters/document-converter';
import { Logger } from '../../shared/utils/logger';

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

export class BatchConverter {
  private converter: DocumentConverter;
  private logger: Logger;
  private abortController?: AbortController;
  
  constructor() {
    this.converter = new DocumentConverter();
    this.logger = new Logger('BatchConverter');
  }
  
  /**
   * Convert all documents in a directory
   */
  async convertBatch(options: BatchConversionOptions): Promise<BatchConversionReport> {
    const startTime = Date.now();
    const report: BatchConversionReport = {
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
      const results = await this.processFilesWithConcurrency(
        files,
        options,
        maxConcurrent,
        report
      );
      
      // Update report
      for (const result of results) {
        if (result.success) {
          report.successful++;
        } else {
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
    } catch (error) {
      this.logger.error('Batch conversion failed', { error: error.message });
      report.duration = Date.now() - startTime;
      return report;
    }
  }
  
  /**
   * Cancel ongoing batch conversion
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.logger.info('Batch conversion cancelled');
    }
  }
  
  /**
   * Scan vault for documents
   */
  private async scanVault(vaultPath: string): Promise<string[]> {
    const documents: string[] = [];
    
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip hidden directories
          if (!entry.name.startsWith('.')) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
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
  private async processFilesWithConcurrency(
    files: string[],
    options: BatchConversionOptions,
    maxConcurrent: number,
    report: BatchConversionReport
  ): Promise<ConversionDetail[]> {
    const results: ConversionDetail[] = [];
    const queue = [...files];
    const processing = new Set<Promise<ConversionDetail>>();
    
    while (queue.length > 0 || processing.size > 0) {
      // Check for cancellation
      if (this.abortController?.signal.aborted) {
        break;
      }
      
      // Start new conversions up to max concurrent
      while (processing.size < maxConcurrent && queue.length > 0) {
        const file = queue.shift()!;
        const promise = this.convertFile(file, options).then(result => {
          processing.delete(promise);
          
          // Update progress
          if (options.progressCallback) {
            const progress: BatchProgress = {
              total: files.length,
              processed: results.length + 1,
              succeeded: results.filter(r => r.success).length + (result.success ? 1 : 0),
              failed: results.filter(r => !r.success).length + (!result.success ? 1 : 0),
              currentFile: file,
              percentage: ((results.length + 1) / files.length) * 100,
              estimatedTimeRemaining: this.estimateTimeRemaining(
                results.length + 1,
                files.length,
                report.duration
              )
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
  private async convertFile(
    filePath: string,
    options: BatchConversionOptions
  ): Promise<ConversionDetail> {
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
    } catch (error) {
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
  private isDocumentFile(fileName: string): boolean {
    const extensions = ['.json', '.yaml', '.yml', '.md'];
    return extensions.some(ext => fileName.endsWith(ext));
  }
  
  /**
   * Parse document from string
   */
  private parseDocument(content: string): any {
    // Try JSON first
    try {
      return JSON.parse(content);
    } catch {
      // Try YAML
      try {
        const yaml = require('js-yaml');
        return yaml.load(content);
      } catch {
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
  private stringifyDocument(document: any): string {
    return JSON.stringify(document, null, 2);
  }
  
  /**
   * Get target file name
   */
  private getTargetFileName(originalName: string, targetVersion: string): string {
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext);
    return `${base}_v${targetVersion}${ext}`;
  }
  
  /**
   * Estimate time remaining
   */
  private estimateTimeRemaining(
    processed: number,
    total: number,
    elapsedTime: number
  ): number {
    if (processed === 0) return 0;
    
    const averageTime = elapsedTime / processed;
    const remaining = total - processed;
    return Math.round(averageTime * remaining);
  }
  
  /**
   * Save conversion report
   */
  private async saveReport(report: BatchConversionReport, targetDir: string): Promise<void> {
    const reportPath = path.join(targetDir, `conversion_report_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.logger.info(`Conversion report saved to ${reportPath}`);
  }
  
  /**
   * Rollback conversion
   */
  async rollback(reportPath: string): Promise<void> {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as BatchConversionReport;
      
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
    } catch (error) {
      this.logger.error('Rollback failed', { error: error.message });
      throw error;
    }
  }
}