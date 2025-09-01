"use strict";
/**
 * Cache Utility
 * Simple in-memory cache for version-agnostic data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    constructor(options = {}) {
        this.cache = new Map();
        this.options = {
            ttl: options.ttl || 3600000,
            maxSize: options.maxSize || 1000
        };
    }
    set(key, value, ttl) {
        // Enforce max size
        if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        const expiry = Date.now() + (ttl || this.options.ttl);
        this.cache.set(key, { value, expiry });
    }
    get(key) {
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
    has(key) {
        return this.get(key) !== undefined;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    /**
     * Clean up expired entries
     */
    cleanup() {
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
    entries() {
        this.cleanup();
        return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map