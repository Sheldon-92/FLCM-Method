/**
 * Cache Service
 * Provides caching capabilities for improved performance
 */
export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
    directory?: string;
}
export interface CacheEntry {
    key: string;
    value: any;
    timestamp: Date;
    ttl: number;
    size: number;
    hits: number;
}
export declare class CacheService {
    private memoryCache;
    private cacheDir;
    private maxMemorySize;
    private currentMemorySize;
    private defaultTTL;
    private stats;
    constructor(options?: CacheOptions);
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Invalidate cache entry
     */
    invalidate(key: string): Promise<void>;
    /**
     * Clear all cache
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): any;
    /**
     * Cache decorator for methods
     */
    static memoize<T extends (...args: any[]) => Promise<any>>(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
    /**
     * Cache specific agent results
     */
    cacheAgentResult(agentName: string, input: any, output: any, ttl?: number): Promise<void>;
    /**
     * Get cached agent result
     */
    getCachedAgentResult(agentName: string, input: any): Promise<any | null>;
    /**
     * Cache workflow state
     */
    cacheWorkflowState(workflowId: string, state: any): Promise<void>;
    /**
     * Get cached workflow state
     */
    getCachedWorkflowState(workflowId: string): Promise<any | null>;
    private setMemoryCache;
    private getFromDisk;
    private setToDisk;
    private removeFromDisk;
    private isExpired;
    private evictLRU;
    private calculateSize;
    private getFilename;
    private generateAgentKey;
    private countDiskEntries;
    private startCleanupInterval;
    private cleanupExpired;
}
export declare function getCacheService(options?: CacheOptions): CacheService;
export default CacheService;
