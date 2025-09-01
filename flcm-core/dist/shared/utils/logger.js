"use strict";
/**
 * Unified Logger for FLCM 2.0
 * Provides consistent logging across all agents and modules
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
exports.cleanupLoggers = exports.getLogger = exports.createLogger = exports.LogLevel = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Log levels
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
// Default configuration
const DEFAULT_CONFIG = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    logDir: path.join(process.cwd(), 'logs'),
    maxFiles: 5,
    maxSize: '20m'
};
// Logger cache
const loggerCache = new Map();
/**
 * Create or get a logger instance
 */
function createLogger(name, config) {
    if (loggerCache.has(name)) {
        return loggerCache.get(name);
    }
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    // Ensure log directory exists
    if (finalConfig.enableFile && !fs.existsSync(finalConfig.logDir)) {
        fs.mkdirSync(finalConfig.logDir, { recursive: true });
    }
    // Create transports
    const transports = [];
    if (finalConfig.enableConsole) {
        transports.push(new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} [${name}] ${level}: ${message}${metaString}`;
            }))
        }));
    }
    if (finalConfig.enableFile) {
        transports.push(new winston.transports.File({
            filename: path.join(finalConfig.logDir, `${name}.log`),
            maxFiles: finalConfig.maxFiles,
            maxsize: finalConfig.maxSize,
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.json())
        }));
    }
    // Create winston logger
    const winstonLogger = winston.createLogger({
        level: finalConfig.level,
        transports,
        handleExceptions: true,
        exitOnError: false
    });
    // Wrap winston logger to match our interface
    const logger = {
        error: (message, meta) => winstonLogger.error(message, meta),
        warn: (message, meta) => winstonLogger.warn(message, meta),
        info: (message, meta) => winstonLogger.info(message, meta),
        debug: (message, meta) => winstonLogger.debug(message, meta),
        setLevel: (level) => {
            winstonLogger.level = level;
        },
        end: () => {
            winstonLogger.end();
            loggerCache.delete(name);
        }
    };
    loggerCache.set(name, winstonLogger);
    return logger;
}
exports.createLogger = createLogger;
/**
 * Get the default FLCM logger
 */
function getLogger() {
    return createLogger('FLCM');
}
exports.getLogger = getLogger;
/**
 * Cleanup all loggers
 */
function cleanupLoggers() {
    loggerCache.forEach((logger) => {
        logger.end();
    });
    loggerCache.clear();
}
exports.cleanupLoggers = cleanupLoggers;
//# sourceMappingURL=logger.js.map