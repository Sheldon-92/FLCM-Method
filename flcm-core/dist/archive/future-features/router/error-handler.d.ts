/**
 * Error Handler for Version Router
 * Handles various error scenarios in version routing
 */
import { VersionRequest, VersionResponse, FLCMVersion } from './types';
import { Logger } from '../shared/utils/logger';
export declare class VersionError extends Error {
    statusCode: number;
    version?: FLCMVersion;
    constructor(message: string, statusCode?: number, version?: FLCMVersion);
}
export declare class VersionRouterErrorHandler {
    private logger;
    constructor(logger: Logger);
    handleError(error: Error, request: VersionRequest): VersionResponse;
    private handleVersionError;
    private handleValidationError;
    private handleTimeoutError;
    /**
     * Validate version compatibility
     */
    validateVersionCompatibility(requestedVersion: FLCMVersion, availableVersions: FLCMVersion[]): void;
    /**
     * Handle version migration errors
     */
    handleMigrationError(fromVersion: FLCMVersion, toVersion: FLCMVersion, error: Error): VersionResponse;
}
