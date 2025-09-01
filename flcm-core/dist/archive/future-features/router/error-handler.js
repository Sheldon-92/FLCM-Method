"use strict";
/**
 * Error Handler for Version Router
 * Handles various error scenarios in version routing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionRouterErrorHandler = exports.VersionError = void 0;
class VersionError extends Error {
    constructor(message, statusCode = 500, version) {
        super(message);
        this.name = 'VersionError';
        this.statusCode = statusCode;
        this.version = version;
    }
}
exports.VersionError = VersionError;
class VersionRouterErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }
    handleError(error, request) {
        // Log the error
        this.logger.error('Version router error', {
            error: error.message,
            stack: error.stack,
            path: request.path,
            method: request.method,
            user: request.user?.id
        });
        // Handle specific error types
        if (error instanceof VersionError) {
            return this.handleVersionError(error);
        }
        if (error.name === 'ValidationError') {
            return this.handleValidationError(error);
        }
        if (error.name === 'TimeoutError') {
            return this.handleTimeoutError(error);
        }
        // Default error response
        return {
            status: 500,
            body: {
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            },
            version: '1.0' // fallback to stable version
        };
    }
    handleVersionError(error) {
        return {
            status: error.statusCode,
            body: {
                error: error.message,
                type: 'version_error',
                timestamp: new Date().toISOString()
            },
            version: error.version || '1.0'
        };
    }
    handleValidationError(error) {
        return {
            status: 400,
            body: {
                error: 'Validation error',
                message: error.message,
                type: 'validation_error',
                timestamp: new Date().toISOString()
            },
            version: '1.0'
        };
    }
    handleTimeoutError(error) {
        return {
            status: 504,
            body: {
                error: 'Request timeout',
                message: 'The request took too long to process',
                type: 'timeout_error',
                timestamp: new Date().toISOString()
            },
            version: '1.0'
        };
    }
    /**
     * Validate version compatibility
     */
    validateVersionCompatibility(requestedVersion, availableVersions) {
        if (!availableVersions.includes(requestedVersion)) {
            throw new VersionError(`Version ${requestedVersion} is not available`, 404, requestedVersion);
        }
    }
    /**
     * Handle version migration errors
     */
    handleMigrationError(fromVersion, toVersion, error) {
        this.logger.error('Version migration failed', {
            fromVersion,
            toVersion,
            error: error.message
        });
        return {
            status: 500,
            body: {
                error: 'Version migration failed',
                message: `Failed to migrate from ${fromVersion} to ${toVersion}`,
                type: 'migration_error',
                timestamp: new Date().toISOString()
            },
            version: fromVersion // stay on current version
        };
    }
}
exports.VersionRouterErrorHandler = VersionRouterErrorHandler;
//# sourceMappingURL=error-handler.js.map