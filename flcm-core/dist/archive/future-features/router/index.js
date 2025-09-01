"use strict";
/**
 * Version Router Main Module
 * Central routing system for FLCM dual architecture
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionError = exports.VersionRouterErrorHandler = exports.VersionMiddleware = exports.VersionDetector = exports.VersionRouter = void 0;
const version_detector_1 = require("./version-detector");
const middleware_1 = require("./middleware");
const error_handler_1 = require("./error-handler");
const logger_1 = require("../shared/utils/logger");
const config_manager_1 = require("../shared/config/config-manager");
class VersionRouter {
    constructor(configPath) {
        // Initialize logger
        this.logger = new logger_1.Logger('VersionRouter');
        // Load configuration
        this.configManager = new config_manager_1.ConfigManager(configPath);
        this.config = this.configManager.getRouterConfig();
        // Initialize components
        this.detector = new version_detector_1.VersionDetector(this.config);
        this.middleware = new middleware_1.VersionMiddleware(this.detector, this.logger);
        this.errorHandler = new error_handler_1.VersionRouterErrorHandler(this.logger);
        // Setup default middleware
        this.setupDefaultMiddleware();
        this.logger.info('Version router initialized', {
            defaultVersion: this.config.defaultVersion,
            userOverrides: this.config.userOverridesEnabled,
            v2Enabled: this.detector.isV2Enabled()
        });
    }
    setupDefaultMiddleware() {
        this.middleware.use(middleware_1.versionValidationMiddleware);
        this.middleware.use(middleware_1.metricsMiddleware);
    }
    /**
     * Register version handlers
     */
    registerV1Handler(handler) {
        this.v1Handler = handler;
        this.logger.info('V1 handler registered');
    }
    registerV2Handler(handler) {
        this.v2Handler = handler;
        this.logger.info('V2 handler registered');
    }
    /**
     * Main routing method
     */
    async route(request) {
        try {
            // Validate handlers are registered
            if (!this.v1Handler || !this.v2Handler) {
                throw new Error('Version handlers not properly initialized');
            }
            // Process through middleware chain
            return await this.middleware.process(request, (req) => this.v1Handler.handle(req), (req) => this.v2Handler.handle(req));
        }
        catch (error) {
            return this.errorHandler.handleError(error, request);
        }
    }
    /**
     * Health check for both versions
     */
    async healthCheck() {
        const results = {
            overall: 'healthy',
            versions: {}
        };
        // Check V1
        if (this.v1Handler) {
            try {
                results.versions['1.0'] = await this.v1Handler.healthCheck();
            }
            catch (error) {
                results.versions['1.0'] = {
                    status: 'unhealthy',
                    error: error.message
                };
                results.overall = 'degraded';
            }
        }
        // Check V2
        if (this.v2Handler) {
            try {
                results.versions['2.0'] = await this.v2Handler.healthCheck();
            }
            catch (error) {
                results.versions['2.0'] = {
                    status: 'unhealthy',
                    error: error.message
                };
                results.overall = 'degraded';
            }
        }
        // Set overall status
        const statuses = Object.values(results.versions).map(v => v.status);
        if (statuses.every(s => s === 'unhealthy')) {
            results.overall = 'unhealthy';
        }
        else if (statuses.some(s => s === 'unhealthy')) {
            results.overall = 'degraded';
        }
        return results;
    }
    /**
     * Update configuration dynamically
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.detector = new version_detector_1.VersionDetector(this.config);
        this.logger.info('Router configuration updated', newConfig);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return this.config;
    }
}
exports.VersionRouter = VersionRouter;
// Export all types and classes
__exportStar(require("./types"), exports);
var version_detector_2 = require("./version-detector");
Object.defineProperty(exports, "VersionDetector", { enumerable: true, get: function () { return version_detector_2.VersionDetector; } });
var middleware_2 = require("./middleware");
Object.defineProperty(exports, "VersionMiddleware", { enumerable: true, get: function () { return middleware_2.VersionMiddleware; } });
var error_handler_2 = require("./error-handler");
Object.defineProperty(exports, "VersionRouterErrorHandler", { enumerable: true, get: function () { return error_handler_2.VersionRouterErrorHandler; } });
Object.defineProperty(exports, "VersionError", { enumerable: true, get: function () { return error_handler_2.VersionError; } });
//# sourceMappingURL=index.js.map