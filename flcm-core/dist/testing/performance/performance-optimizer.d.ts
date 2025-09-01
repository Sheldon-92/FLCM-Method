/**
 * FLCM 2.0 Performance Optimization System
 * Advanced performance monitoring, optimization, and caching
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
    timestamp: Date;
    operation: string;
    duration: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    cpuUsage: {
        user: number;
        system: number;
    };
    status: 'success' | 'error' | 'timeout';
    metadata?: Record<string, any>;
}
/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
    key: string;
    value: T;
    timestamp: Date;
    ttl: number;
    accessCount: number;
    lastAccess: Date;
    size: number;
}
/**
 * Performance configuration
 */
export interface PerformanceConfig {
    cache: {
        maxSize: number;
        defaultTTL: number;
        cleanupInterval: number;
        compressionEnabled: boolean;
    };
    monitoring: {
        sampleRate: number;
        alertThreshold: {
            memory: number;
            cpu: number;
            duration: number;
        };
        retentionDays: number;
    };
    optimization: {
        batchSize: number;
        concurrencyLimit: number;
        timeoutMs: number;
        retryAttempts: number;
    };
}
/**
 * Performance optimization recommendations
 */
export interface OptimizationRecommendation {
    type: 'cache' | 'batch' | 'concurrent' | 'algorithm' | 'memory';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedImprovement: number;
    implementation: string;
    effort: 'low' | 'medium' | 'high';
}
/**
 * Performance monitoring and optimization system
 */
export declare class PerformanceOptimizer extends EventEmitter {
    private config;
    private metrics;
    private cache;
    private activeOperations;
    constructor(config?: Partial<PerformanceConfig>);
    /**
     * Start performance monitoring for an operation
     */
    startOperation(operationId: string, operation: string): void;
    /**
     * End performance monitoring for an operation
     */
    endOperation(operationId: string, status: 'success' | 'error' | 'timeout', metadata?: Record<string, any>): PerformanceMetrics | null;
    /**
     * Execute function with performance tracking
     */
    withTracking<T>(operation: string, fn: () => Promise<T>, options?: {
        timeout?: number;
        cache?: boolean;
        cacheKey?: string;
        cacheTTL?: number;
    }): Promise<T>;
    /**
     * Batch processing with performance optimization
     */
    processBatch<T, R>(items: T[], processor: (item: T) => Promise<R>, options?: {
        batchSize?: number;
        concurrency?: number;
        onProgress?: (completed: number, total: number) => void;
    }): Promise<R[]>;
    /**
     * Get performance recommendations
     */
    getOptimizationRecommendations(): OptimizationRecommendation[];
    /**
     * Get comprehensive performance statistics
     */
    getPerformanceStats(): {
        operations: {
            total: number;
            success: number;
            error: number;
            timeout: number;
        };
        timing: {
            avgDuration: number;
            p50Duration: number;
            p95Duration: number;
            p99Duration: number;
        };
        resources: {
            avgMemory: number;
            peakMemory: number;
            avgCPU: number;
            peakCPU: number;
        };
        cache: {
            hitRate: number;
            size: number;
            totalSize: number;
        };
    };
    /**
     * Clear performance data and reset
     */
    reset(): void;
    /**
     * Destroy optimizer and cleanup resources
     */
    destroy(): void;
    private withTimeout;
    private chunkArray;
    private startPerformanceMonitoring;
    private checkPerformanceAlerts;
    private getRecentMetrics;
    private getOperationCounts;
    private cleanupOldMetrics;
}
export declare const performanceOptimizer: PerformanceOptimizer;
export declare function withPerformanceTracking(operation: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
