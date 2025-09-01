/**
 * Real-time Converter
 * Handles document conversion for active sessions
 */
/// <reference types="node" />
import { ConversionResult } from '../converters/document-converter';
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
export declare class RealTimeConverter extends EventEmitter {
    private converter;
    private cache;
    private queue;
    private processing;
    private logger;
    private options;
    constructor(options?: RealTimeConversionOptions);
    /**
     * Convert document in real-time
     */
    convert(document: any, targetVersion: '1.0' | '2.0', priority?: number): Promise<ConversionResult>;
    /**
     * Queue conversion for batch processing
     */
    queueConversion(request: ConversionRequest): void;
    /**
     * Get queue status
     */
    getQueueStatus(): {
        queueLength: number;
        processing: number;
        cacheSize: number;
    };
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Process queue
     */
    private startQueueProcessor;
    /**
     * Process a queued request
     */
    private processQueuedRequest;
    /**
     * Perform conversion with performance tracking
     */
    private performConversion;
    /**
     * Create timeout promise
     */
    private createTimeout;
    /**
     * Generate cache key
     */
    private getCacheKey;
    /**
     * Generate processing key
     */
    private getProcessingKey;
    /**
     * Simple hash function
     */
    private simpleHash;
}
/**
 * Conversion middleware for Express
 */
export declare function conversionMiddleware(converter: RealTimeConverter): (req: any, res: any, next: any) => Promise<any>;
