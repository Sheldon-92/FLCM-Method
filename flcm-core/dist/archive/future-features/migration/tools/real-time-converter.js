"use strict";
/**
 * Real-time Converter
 * Handles document conversion for active sessions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversionMiddleware = exports.RealTimeConverter = void 0;
const document_converter_1 = require("../converters/document-converter");
const cache_1 = require("../../shared/utils/cache");
const logger_1 = require("../../shared/utils/logger");
const events_1 = require("events");
class RealTimeConverter extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.queue = [];
        this.processing = new Map();
        this.converter = new document_converter_1.DocumentConverter();
        this.logger = new logger_1.Logger('RealTimeConverter');
        this.options = {
            cacheEnabled: options.cacheEnabled ?? true,
            cacheTTL: options.cacheTTL ?? 300000,
            maxQueueSize: options.maxQueueSize ?? 100,
            maxConcurrent: options.maxConcurrent ?? 10,
            timeout: options.timeout ?? 5000 // 5 seconds
        };
        this.cache = new cache_1.Cache({
            ttl: this.options.cacheTTL,
            maxSize: 100
        });
        // Start queue processor
        this.startQueueProcessor();
    }
    /**
     * Convert document in real-time
     */
    async convert(document, targetVersion, priority = 5) {
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
            return this.processing.get(processingKey);
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
        }
        finally {
            this.processing.delete(processingKey);
        }
    }
    /**
     * Queue conversion for batch processing
     */
    queueConversion(request) {
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
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing.size,
            cacheSize: this.cache.size()
        };
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.logger.info('Conversion cache cleared');
    }
    /**
     * Process queue
     */
    startQueueProcessor() {
        setInterval(() => {
            while (this.queue.length > 0 &&
                this.processing.size < this.options.maxConcurrent) {
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
    async processQueuedRequest(request) {
        this.emit('processing', request.id);
        try {
            const result = await this.convert(request.document, request.targetVersion, request.priority);
            if (request.callback) {
                request.callback(result);
            }
            this.emit('completed', request.id, result);
        }
        catch (error) {
            const errorResult = {
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
    async performConversion(document, targetVersion) {
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
        }
        catch (error) {
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
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Conversion timeout after ${ms}ms`));
            }, ms);
        });
    }
    /**
     * Generate cache key
     */
    getCacheKey(document, targetVersion) {
        // Create a hash of the document content and target version
        const docString = JSON.stringify(document);
        const hash = this.simpleHash(docString);
        return `${hash}_${targetVersion}`;
    }
    /**
     * Generate processing key
     */
    getProcessingKey(document, targetVersion) {
        return this.getCacheKey(document, targetVersion);
    }
    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
}
exports.RealTimeConverter = RealTimeConverter;
/**
 * Conversion middleware for Express
 */
function conversionMiddleware(converter) {
    return async (req, res, next) => {
        // Check if conversion is needed
        const requestVersion = req.headers['x-flcm-version'];
        const documentVersion = req.body?.version;
        if (requestVersion && documentVersion && requestVersion !== documentVersion) {
            try {
                const result = await converter.convert(req.body, requestVersion);
                if (result.success) {
                    req.body = result.document;
                    req.conversionResult = result;
                }
                else {
                    return res.status(400).json({
                        error: 'Document conversion failed',
                        details: result.errors
                    });
                }
            }
            catch (error) {
                return res.status(500).json({
                    error: 'Conversion error',
                    message: error.message
                });
            }
        }
        next();
    };
}
exports.conversionMiddleware = conversionMiddleware;
//# sourceMappingURL=real-time-converter.js.map