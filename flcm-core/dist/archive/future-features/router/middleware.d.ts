/**
 * Version Router Middleware
 * Handles request routing to appropriate version
 */
import { VersionRequest, VersionResponse, RouterMiddleware } from './types';
import { VersionDetector } from './version-detector';
import { Logger } from '../shared/utils/logger';
export declare class VersionMiddleware {
    private detector;
    private logger;
    private middlewares;
    constructor(detector: VersionDetector, logger: Logger);
    use(middleware: RouterMiddleware): void;
    process(request: VersionRequest, v1Handler: (req: VersionRequest) => Promise<VersionResponse>, v2Handler: (req: VersionRequest) => Promise<VersionResponse>): Promise<VersionResponse>;
    private applyMiddlewares;
}
/**
 * Rate limiting middleware
 */
export declare const rateLimitMiddleware: RouterMiddleware;
/**
 * Version validation middleware
 */
export declare const versionValidationMiddleware: RouterMiddleware;
/**
 * Metrics collection middleware
 */
export declare const metricsMiddleware: RouterMiddleware;
