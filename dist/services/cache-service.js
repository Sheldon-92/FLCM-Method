"use strict";
/**
 * Cache Service
 * Provides caching capabilities for improved performance
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
exports.getCacheService = exports.CacheService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class CacheService {
    constructor(options = {}) {
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
    async get(key) {
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
            return memoryEntry.value;
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
            return diskEntry.value;
        }
        this.stats.misses++;
        return null;
    }
    /**
     * Set value in cache
     */
    async set(key, value, ttl) {
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
    async invalidate(key) {
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
    async clear() {
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
    getStats() {
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
    static memoize(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const cache = new CacheService();
        descriptor.value = async function (...args) {
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
    async cacheAgentResult(agentName, input, output, ttl) {
        const key = this.generateAgentKey(agentName, input);
        await this.set(key, output, ttl || 1800000); // 30 minutes default for agents
    }
    /**
     * Get cached agent result
     */
    async getCachedAgentResult(agentName, input) {
        const key = this.generateAgentKey(agentName, input);
        return await this.get(key);
    }
    /**
     * Cache workflow state
     */
    async cacheWorkflowState(workflowId, state) {
        const key = `workflow_${workflowId}`;
        await this.set(key, state, 7200000); // 2 hours for workflow state
    }
    /**
     * Get cached workflow state
     */
    async getCachedWorkflowState(workflowId) {
        const key = `workflow_${workflowId}`;
        return await this.get(key);
    }
    // Private methods
    setMemoryCache(key, value, ttl) {
        const size = this.calculateSize(value);
        // Evict if necessary
        while (this.currentMemorySize + size > this.maxMemorySize && this.memoryCache.size > 0) {
            this.evictLRU();
        }
        const entry = {
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
    async getFromDisk(key) {
        const filename = this.getFilename(key);
        const filepath = path.join(this.cacheDir, filename);
        if (!fs.existsSync(filepath)) {
            return null;
        }
        try {
            const data = fs.readFileSync(filepath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            // Corrupted cache file, remove it
            fs.unlinkSync(filepath);
            return null;
        }
    }
    async setToDisk(key, value, ttl) {
        const filename = this.getFilename(key);
        const filepath = path.join(this.cacheDir, filename);
        const entry = {
            key,
            value,
            timestamp: new Date(),
            ttl,
            size: this.calculateSize(value),
            hits: 0
        };
        fs.writeFileSync(filepath, JSON.stringify(entry));
    }
    async removeFromDisk(key) {
        const filename = this.getFilename(key);
        const filepath = path.join(this.cacheDir, filename);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
    }
    isExpired(entry) {
        const age = Date.now() - new Date(entry.timestamp).getTime();
        return age > entry.ttl;
    }
    evictLRU() {
        let lruKey = null;
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
            const entry = this.memoryCache.get(lruKey);
            this.currentMemorySize -= entry.size;
            this.memoryCache.delete(lruKey);
            this.stats.evictions++;
        }
    }
    calculateSize(value) {
        const str = JSON.stringify(value);
        return Buffer.byteLength(str, 'utf8');
    }
    getFilename(key) {
        const hash = crypto.createHash('md5').update(key).digest('hex');
        return `${hash}.cache`;
    }
    generateAgentKey(agentName, input) {
        const inputHash = crypto.createHash('md5')
            .update(JSON.stringify(input))
            .digest('hex');
        return `agent_${agentName}_${inputHash}`;
    }
    countDiskEntries() {
        const files = fs.readdirSync(this.cacheDir);
        return files.filter(f => f.endsWith('.cache')).length;
    }
    startCleanupInterval() {
        // Clean up expired entries every 5 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 300000);
    }
    async cleanupExpired() {
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
                }
                catch (error) {
                    // Remove corrupted file
                    fs.unlinkSync(filepath);
                }
            }
        }
    }
}
exports.CacheService = CacheService;
// Singleton instance
let cacheInstance = null;
function getCacheService(options) {
    if (!cacheInstance) {
        cacheInstance = new CacheService(options);
    }
    return cacheInstance;
}
exports.getCacheService = getCacheService;
exports.default = CacheService;
//# sourceMappingURL=cache-service.js.map