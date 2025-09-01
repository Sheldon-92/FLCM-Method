"use strict";
/**
 * Logger Utility
 * Version-aware logging system for FLCM
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston = __importStar(require("winston"));
class Logger {
    constructor(context, version) {
        this.context = context;
        this.version = version;
        const format = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const versionPrefix = this.version ? `[FLCM-${this.version}]` : '[FLCM]';
            const contextPrefix = `[${this.context}]`;
            if (process.env.NODE_ENV === 'development') {
                return `${versionPrefix} ${timestamp} ${contextPrefix} ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            }
            return JSON.stringify({
                timestamp,
                version: this.version,
                context: this.context,
                level,
                message,
                ...meta
            });
        }));
        this.winston = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), format)
                })
            ]
        });
        // Add file transport in production
        if (process.env.NODE_ENV === 'production') {
            this.winston.add(new winston.transports.File({
                filename: `logs/flcm-${this.version || 'general'}.log`,
                maxsize: 5242880,
                maxFiles: 5
            }));
        }
    }
    setVersion(version) {
        this.version = version;
    }
    debug(message, context) {
        this.winston.debug(message, this.enrichContext(context));
    }
    info(message, context) {
        this.winston.info(message, this.enrichContext(context));
    }
    warn(message, context) {
        this.winston.warn(message, this.enrichContext(context));
    }
    error(message, context) {
        this.winston.error(message, this.enrichContext(context));
    }
    enrichContext(context) {
        return {
            ...context,
            version: context?.version || this.version,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Create child logger with additional context
     */
    child(additionalContext) {
        return new Logger(`${this.context}:${additionalContext}`, this.version);
    }
    /**
     * Performance logging
     */
    startTimer() {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.debug(`Operation completed in ${duration}ms`, { duration });
        };
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map