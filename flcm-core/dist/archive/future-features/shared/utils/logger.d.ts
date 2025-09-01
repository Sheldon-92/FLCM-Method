/**
 * Logger Utility
 * Version-aware logging system for FLCM
 */
import { FLCMVersion } from '../../router/types';
export interface LogContext {
    version?: FLCMVersion;
    userId?: string;
    requestId?: string;
    [key: string]: any;
}
export declare class Logger {
    private winston;
    private context;
    private version?;
    constructor(context: string, version?: FLCMVersion);
    setVersion(version: FLCMVersion): void;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    private enrichContext;
    /**
     * Create child logger with additional context
     */
    child(additionalContext: string): Logger;
    /**
     * Performance logging
     */
    startTimer(): () => void;
}
