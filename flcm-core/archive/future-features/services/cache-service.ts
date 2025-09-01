/**
 * Cache Service
 * Provides caching capabilities for improved performance
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Max cache size in MB
  directory?: string; // Cache directory
}

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: Date;
  ttl: number;
  size: number;
  hits: number;
}

export class CacheService {
  private memoryCache: Map<string, CacheEntry>;
  private cacheDir: string;
  private maxMemorySize: number;
  private currentMemorySize: number;
  private defaultTTL: number;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    writes: number;
  };

  constructor(options: CacheOptions = {}) {
    this.memoryCache = new Map();
    this.cacheDir = options.directory || path.join(process.cwd(), '.flcm-cache');
    this.maxMemorySize = (options.maxSize || 100) * 1024 * 1024; // Convert MB to bytes
    this.currentMemorySize = 0;
    this.defaultTTL = options.ttl || 3600000; // 1 hour default
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      writes: 0
    };

    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      if (this.isExpired(memoryEntry)) {
        this.memoryCache.delete(key);
        this.currentMemorySize -= memoryEntry.size;
        this.stats.misses++;
        return null;
      }
      
      memoryEntry.hits++;
      this.stats.hits++;
      return memoryEntry.value as T;
    }

    // Check disk cache
    const diskEntry = await this.getFromDisk(key);
    if (diskEntry) {
      if (this.isExpired(diskEntry)) {
        await this.removeFromDisk(key);
        this.stats.misses++;
        return null;
      }

      // Promote to memory cache
      this.setMemoryCache(key, diskEntry.value, diskEntry.ttl);
      this.stats.hits++;
      return diskEntry.value as T;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const actualTTL = ttl || this.defaultTTL;
    const size = this.calculateSize(value);

    // Store in memory if space available
    if (size < this.maxMemorySize) {
      this.setMemoryCache(key, value, actualTTL);
    }

    // Always store to disk for persistence
    await this.setToDisk(key, value, actualTTL);
    this.stats.writes++;
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    // Remove from memory
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      this.currentMemorySize -= memoryEntry.size;
      this.memoryCache.delete(key);
    }

    // Remove from disk
    await this.removeFromDisk(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear memory
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    // Clear disk
    const files = fs.readdirSync(this.cacheDir);
    for (const file of files) {
      if (file.endsWith('.cache')) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    }

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      writes: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryUsage: this.currentMemorySize,
      memoryLimit: this.maxMemorySize,
      entriesInMemory: this.memoryCache.size,
      entriesOnDisk: this.countDiskEntries()
    };
  }

  /**
   * Cache decorator for methods
   */
  static memoize<T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new CacheService();

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}_${JSON.stringify(args)}`;
      
      // Check cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute and cache
      const result = await originalMethod.apply(this, args);
      await cache.set(key, result);
      return result;
    };

    return descriptor;
  }

  /**
   * Cache specific agent results
   */
  async cacheAgentResult(
    agentName: string,
    input: any,
    output: any,
    ttl?: number
  ): Promise<void> {
    const key = this.generateAgentKey(agentName, input);
    await this.set(key, output, ttl || 1800000); // 30 minutes default for agents
  }

  /**
   * Get cached agent result
   */
  async getCachedAgentResult(
    agentName: string,
    input: any
  ): Promise<any | null> {
    const key = this.generateAgentKey(agentName, input);
    return await this.get(key);
  }

  /**
   * Cache workflow state
   */
  async cacheWorkflowState(
    workflowId: string,
    state: any
  ): Promise<void> {
    const key = `workflow_${workflowId}`;
    await this.set(key, state, 7200000); // 2 hours for workflow state
  }

  /**
   * Get cached workflow state
   */
  async getCachedWorkflowState(workflowId: string): Promise<any | null> {
    const key = `workflow_${workflowId}`;
    return await this.get(key);
  }

  // Private methods

  private setMemoryCache(key: string, value: any, ttl: number): void {
    const size = this.calculateSize(value);

    // Evict if necessary
    while (this.currentMemorySize + size > this.maxMemorySize && this.memoryCache.size > 0) {
      this.evictLRU();
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date(),
      ttl,
      size,
      hits: 0
    };

    this.memoryCache.set(key, entry);
    this.currentMemorySize += size;
  }

  private async getFromDisk(key: string): Promise<CacheEntry | null> {
    const filename = this.getFilename(key);
    const filepath = path.join(this.cacheDir, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Corrupted cache file, remove it
      fs.unlinkSync(filepath);
      return null;
    }
  }

  private async setToDisk(key: string, value: any, ttl: number): Promise<void> {
    const filename = this.getFilename(key);
    const filepath = path.join(this.cacheDir, filename);

    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date(),
      ttl,
      size: this.calculateSize(value),
      hits: 0
    };

    fs.writeFileSync(filepath, JSON.stringify(entry));
  }

  private async removeFromDisk(key: string): Promise<void> {
    const filename = this.getFilename(key);
    const filepath = path.join(this.cacheDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    const age = Date.now() - new Date(entry.timestamp).getTime();
    return age > entry.ttl;
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;
    let lruTimestamp = new Date();

    // Find least recently used entry
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.hits < lruHits || 
          (entry.hits === lruHits && entry.timestamp < lruTimestamp)) {
        lruKey = key;
        lruHits = entry.hits;
        lruTimestamp = entry.timestamp;
      }
    }

    if (lruKey) {
      const entry = this.memoryCache.get(lruKey)!;
      this.currentMemorySize -= entry.size;
      this.memoryCache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  private calculateSize(value: any): number {
    const str = JSON.stringify(value);
    return Buffer.byteLength(str, 'utf8');
  }

  private getFilename(key: string): string {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return `${hash}.cache`;
  }

  private generateAgentKey(agentName: string, input: any): string {
    const inputHash = crypto.createHash('md5')
      .update(JSON.stringify(input))
      .digest('hex');
    return `agent_${agentName}_${inputHash}`;
  }

  private countDiskEntries(): number {
    const files = fs.readdirSync(this.cacheDir);
    return files.filter(f => f.endsWith('.cache')).length;
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanupExpired();
    }, 300000);
  }

  private async cleanupExpired(): Promise<void> {
    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.currentMemorySize -= entry.size;
        this.memoryCache.delete(key);
      }
    }

    // Clean disk cache
    const files = fs.readdirSync(this.cacheDir);
    for (const file of files) {
      if (file.endsWith('.cache')) {
        const filepath = path.join(this.cacheDir, file);
        try {
          const data = fs.readFileSync(filepath, 'utf-8');
          const entry = JSON.parse(data);
          if (this.isExpired(entry)) {
            fs.unlinkSync(filepath);
          }
        } catch (error) {
          // Remove corrupted file
          fs.unlinkSync(filepath);
        }
      }
    }
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

export function getCacheService(options?: CacheOptions): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService(options);
  }
  return cacheInstance;
}

export default CacheService;