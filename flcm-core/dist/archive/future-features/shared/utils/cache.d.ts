/**
 * Cache Utility
 * Simple in-memory cache for version-agnostic data
 */
export interface CacheOptions {
    ttl?: number;
    maxSize?: number;
}
export declare class Cache<T> {
    private cache;
    private options;
    constructor(options?: CacheOptions);
    set(key: string, value: T, ttl?: number): void;
    get(key: string): T | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    clear(): void;
    size(): number;
    /**
     * Clean up expired entries
     */
    cleanup(): void;
    /**
     * Get all valid entries
     */
    entries(): Array<[string, T]>;
}
