/**
 * Error Handler for Version Router
 * Handles various error scenarios in version routing
 */

import { VersionRequest, VersionResponse, FLCMVersion } from './types';
import { Logger } from '../shared/utils/logger';

export class VersionError extends Error {
  public statusCode: number;
  public version?: FLCMVersion;
  
  constructor(message: string, statusCode: number = 500, version?: FLCMVersion) {
    super(message);
    this.name = 'VersionError';
    this.statusCode = statusCode;
    this.version = version;
  }
}

export class VersionRouterErrorHandler {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  handleError(error: Error, request: VersionRequest): VersionResponse {
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
  
  private handleVersionError(error: VersionError): VersionResponse {
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
  
  private handleValidationError(error: Error): VersionResponse {
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
  
  private handleTimeoutError(error: Error): VersionResponse {
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
  validateVersionCompatibility(
    requestedVersion: FLCMVersion,
    availableVersions: FLCMVersion[]
  ): void {
    if (!availableVersions.includes(requestedVersion)) {
      throw new VersionError(
        `Version ${requestedVersion} is not available`,
        404,
        requestedVersion
      );
    }
  }
  
  /**
   * Handle version migration errors
   */
  handleMigrationError(
    fromVersion: FLCMVersion,
    toVersion: FLCMVersion,
    error: Error
  ): VersionResponse {
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