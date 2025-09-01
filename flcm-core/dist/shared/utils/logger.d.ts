/**
 * Unified Logger for FLCM 2.0
 * Provides consistent logging across all agents and modules
 */
import * as winston from 'winston';
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export interface Logger {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
    setLevel(level: LogLevel): void;
    end(): void;
}
interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    logDir: string;
    maxFiles: number;
    maxSize: string;
}
/**
 * Create or get a logger instance
 */
export declare function createLogger(name: string, config?: Partial<LoggerConfig>): Logger;
/**
 * Get the default FLCM logger
 */
export declare function getLogger(): Logger;
/**
 * Cleanup all loggers
 */
export declare function cleanupLoggers(): void;
export type { winston };
