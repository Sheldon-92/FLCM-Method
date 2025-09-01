/**
 * Cache Utility
 * Simple in-memory cache for version-agnostic data
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

export class Cache<T> {
  private cache: Map<string, { value: T; expiry: number }> = new Map();
  private options: Required<CacheOptions>;
  
  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 3600000, // 1 hour default
      maxSize: options.maxSize || 1000
    };
  }
  
  set(key: string, value: T, ttl?: number): void {
    // Enforce max size
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const expiry = Date.now() + (ttl || this.options.ttl);
    this.cache.set(key, { value, expiry });
  }
  
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get all valid entries
   */
  entries(): Array<[string, T]> {
    this.cleanup();
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }
}