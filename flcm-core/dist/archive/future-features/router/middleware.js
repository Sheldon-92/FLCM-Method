"use strict";
/**
 * Version Router Middleware
 * Handles request routing to appropriate version
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = exports.versionValidationMiddleware = exports.rateLimitMiddleware = exports.VersionMiddleware = void 0;
class VersionMiddleware {
    constructor(detector, logger) {
        this.middlewares = [];
        this.detector = detector;
        this.logger = logger;
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    async process(request, v1Handler, v2Handler) {
        const startTime = Date.now();
        try {
            // Detect version
            const version = this.detector.detectVersion(request);
            // Add version to request context
            request.headers['x-routed-version'] = version;
            // Log routing decision
            this.logger.info(`Routing request to FLCM ${version}`, {
                path: request.path,
                method: request.method,
                version
            });
            // Apply middleware chain
            const handler = version === '2.0' ? v2Handler : v1Handler;
            const response = await this.applyMiddlewares(request, handler);
            // Add version and timing to response
            response.version = version;
            response.processingTime = Date.now() - startTime;
            return response;
        }
        catch (error) {
            this.logger.error('Version routing failed', {
                error: error.message,
                path: request.path,
                method: request.method
            });
            throw error;
        }
    }
    async applyMiddlewares(request, finalHandler) {
        let index = 0;
        const next = async () => {
            if (index >= this.middlewares.length) {
                return finalHandler(request);
            }
            const middleware = this.middlewares[index++];
            return middleware(request, next);
        };
        return next();
    }
}
exports.VersionMiddleware = VersionMiddleware;
/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = async (req, next) => {
    // Simple in-memory rate limiting (production would use Redis)
    const key = `${req.user?.id || req.headers['x-forwarded-for'] || 'anonymous'}`;
    const limit = 100; // requests per minute
    // Check rate limit (simplified)
    // In production, implement proper rate limiting
    return next();
};
exports.rateLimitMiddleware = rateLimitMiddleware;
/**
 * Version validation middleware
 */
const versionValidationMiddleware = async (req, next) => {
    const version = req.headers['x-flcm-version'];
    if (version && !['1.0', '2.0'].includes(version)) {
        return {
            status: 400,
            body: { error: `Invalid version: ${version}` },
            version: '1.0' // default
        };
    }
    return next();
};
exports.versionValidationMiddleware = versionValidationMiddleware;
/**
 * Metrics collection middleware
 */
const metricsMiddleware = async (req, next) => {
    const startTime = Date.now();
    const response = await next();
    // Collect metrics (simplified)
    const duration = Date.now() - startTime;
    const version = response.version;
    // In production, send to metrics service
    console.log(`[METRICS] ${req.method} ${req.path} - ${version} - ${duration}ms`);
    return response;
};
exports.metricsMiddleware = metricsMiddleware;
//# sourceMappingURL=middleware.js.map