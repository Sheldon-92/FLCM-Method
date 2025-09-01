/**
 * Real-time Converter
 * Handles document conversion for active sessions
 */

import { DocumentConverter, ConversionResult } from '../converters/document-converter';
import { Cache } from '../../shared/utils/cache';
import { Logger } from '../../shared/utils/logger';
import { EventEmitter } from 'events';

export interface RealTimeConversionOptions {
  cacheEnabled?: boolean;
  cacheTTL?: number;
  maxQueueSize?: number;
  maxConcurrent?: number;
  timeout?: number;
}

export interface ConversionRequest {
  id: string;
  document: any;
  targetVersion: '1.0' | '2.0';
  priority?: number;
  callback?: (result: ConversionResult) => void;
}

export class RealTimeConverter extends EventEmitter {
  private converter: DocumentConverter;
  private cache: Cache<ConversionResult>;
  private queue: ConversionRequest[] = [];
  private processing: Map<string, Promise<ConversionResult>> = new Map();
  private logger: Logger;
  private options: Required<RealTimeConversionOptions>;
  
  constructor(options: RealTimeConversionOptions = {}) {
    super();
    
    this.converter = new DocumentConverter();
    this.logger = new Logger('RealTimeConverter');
    
    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      cacheTTL: options.cacheTTL ?? 300000, // 5 minutes
      maxQueueSize: options.maxQueueSize ?? 100,
      maxConcurrent: options.maxConcurrent ?? 10,
      timeout: options.timeout ?? 5000 // 5 seconds
    };
    
    this.cache = new Cache<ConversionResult>({ 
      ttl: this.options.cacheTTL,
      maxSize: 100
    });
    
    // Start queue processor
    this.startQueueProcessor();
  }
  
  /**
   * Convert document in real-time
   */
  async convert(
    document: any,
    targetVersion: '1.0' | '2.0',
    priority: number = 5
  ): Promise<ConversionResult> {
    // Check cache first
    if (this.options.cacheEnabled) {
      const cacheKey = this.getCacheKey(document, targetVersion);
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        this.logger.debug('Returning cached conversion');
        return cached;
      }
    }
    
    // Check if already processing
    const processingKey = this.getProcessingKey(document, targetVersion);
    if (this.processing.has(processingKey)) {
      this.logger.debug('Waiting for existing conversion');
      return this.processing.get(processingKey)!;
    }
    
    // Create conversion promise
    const conversionPromise = this.performConversion(document, targetVersion);
    this.processing.set(processingKey, conversionPromise);
    
    try {
      const result = await Promise.race([
        conversionPromise,
        this.createTimeout(this.options.timeout)
      ]);
      
      // Cache result
      if (this.options.cacheEnabled && result.success) {
        const cacheKey = this.getCacheKey(document, targetVersion);
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } finally {
      this.processing.delete(processingKey);
    }
  }
  
  /**
   * Queue conversion for batch processing
   */
  queueConversion(request: ConversionRequest): void {
    if (this.queue.length >= this.options.maxQueueSize) {
      const error = new Error('Conversion queue is full');
      if (request.callback) {
        request.callback({ success: false, errors: [error.message] });
      }
      this.emit('queue-full', error);
      return;
    }
    
    // Add to queue with priority sorting
    this.queue.push(request);
    this.queue.sort((a, b) => (b.priority || 5) - (a.priority || 5));
    
    this.emit('queued', request.id);
  }
  
  /**
   * Get queue status
   */
  getQueueStatus(): {
    queueLength: number;
    processing: number;
    cacheSize: number;
  } {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      cacheSize: this.cache.size()
    };
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.info('Conversion cache cleared');
  }
  
  /**
   * Process queue
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      while (
        this.queue.length > 0 && 
        this.processing.size < this.options.maxConcurrent
      ) {
        const request = this.queue.shift();
        if (request) {
          this.processQueuedRequest(request);
        }
      }
    }, 100); // Check every 100ms
  }
  
  /**
   * Process a queued request
   */
  private async processQueuedRequest(request: ConversionRequest): Promise<void> {
    this.emit('processing', request.id);
    
    try {
      const result = await this.convert(
        request.document,
        request.targetVersion,
        request.priority
      );
      
      if (request.callback) {
        request.callback(result);
      }
      
      this.emit('completed', request.id, result);
    } catch (error) {
      const errorResult: ConversionResult = {
        success: false,
        errors: [error.message]
      };
      
      if (request.callback) {
        request.callback(errorResult);
      }
      
      this.emit('failed', request.id, error);
    }
  }
  
  /**
   * Perform conversion with performance tracking
   */
  private async performConversion(
    document: any,
    targetVersion: '1.0' | '2.0'
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.converter.convert(document, targetVersion);
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Conversion completed in ${duration}ms`);
      
      // Emit performance metrics
      this.emit('performance', {
        duration,
        targetVersion,
        success: result.success
      });
      
      // Optimize if conversion is slow
      if (duration > 100) {
        this.logger.warn(`Slow conversion detected: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Real-time conversion failed', {
        error: error.message,
        duration
      });
      
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Create timeout promise
   */
  private createTimeout(ms: number): Promise<ConversionResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Conversion timeout after ${ms}ms`));
      }, ms);
    });
  }
  
  /**
   * Generate cache key
   */
  private getCacheKey(document: any, targetVersion: string): string {
    // Create a hash of the document content and target version
    const docString = JSON.stringify(document);
    const hash = this.simpleHash(docString);
    return `${hash}_${targetVersion}`;
  }
  
  /**
   * Generate processing key
   */
  private getProcessingKey(document: any, targetVersion: string): string {
    return this.getCacheKey(document, targetVersion);
  }
  
  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

/**
 * Conversion middleware for Express
 */
export function conversionMiddleware(converter: RealTimeConverter) {
  return async (req: any, res: any, next: any) => {
    // Check if conversion is needed
    const requestVersion = req.headers['x-flcm-version'];
    const documentVersion = req.body?.version;
    
    if (requestVersion && documentVersion && requestVersion !== documentVersion) {
      try {
        const result = await converter.convert(
          req.body,
          requestVersion as '1.0' | '2.0'
        );
        
        if (result.success) {
          req.body = result.document;
          req.conversionResult = result;
        } else {
          return res.status(400).json({
            error: 'Document conversion failed',
            details: result.errors
          });
        }
      } catch (error) {
        return res.status(500).json({
          error: 'Conversion error',
          message: error.message
        });
      }
    }
    
    next();
  };
}