/**
 * Unified Logger for FLCM 2.0
 * Provides consistent logging across all agents and modules
 */

import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

// Logger interface
export interface Logger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  setLevel(level: LogLevel): void;
  end(): void;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir: string;
  maxFiles: number;
  maxSize: string;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  logDir: path.join(process.cwd(), 'logs'),
  maxFiles: 5,
  maxSize: '20m'
};

// Logger cache
const loggerCache = new Map<string, winston.Logger>();

/**
 * Create or get a logger instance
 */
function createNewLogger(name: string, config?: Partial<LoggerConfig>): Logger {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure log directory exists
  if (finalConfig.enableFile && !fs.existsSync(finalConfig.logDir)) {
    fs.mkdirSync(finalConfig.logDir, { recursive: true });
  }

  // Create transports
  const transports: winston.transport[] = [];

  if (finalConfig.enableConsole) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${name}] ${level}: ${message}${metaString}`;
          })
        )
      })
    );
  }

  if (finalConfig.enableFile) {
    transports.push(
      new winston.transports.File({
        filename: path.join(finalConfig.logDir, `${name}.log`),
        maxFiles: finalConfig.maxFiles,
        maxsize: Number(finalConfig.maxSize),
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      })
    );
  }

  // Create winston logger
  const winstonLogger = winston.createLogger({
    level: finalConfig.level,
    transports,
    handleExceptions: true,
    exitOnError: false
  });

  // Wrap winston logger to match our interface
  const logger: Logger = {
    error: (message: string, meta?: any) => winstonLogger.error(message, meta),
    warn: (message: string, meta?: any) => winstonLogger.warn(message, meta),
    info: (message: string, meta?: any) => winstonLogger.info(message, meta),
    debug: (message: string, meta?: any) => winstonLogger.debug(message, meta),
    setLevel: (level: LogLevel) => {
      winstonLogger.level = level;
    },
    end: () => {
      winstonLogger.end();
      loggerCache.delete(name);
    }
  };

  loggerCache.set(name, logger);
  return logger;
}

export function createLogger(name: string, config?: Partial<LoggerConfig>): Logger {
  if (loggerCache.has(name)) {
    const cachedLogger = loggerCache.get(name);
    return cachedLogger || createNewLogger(name, config);
  }
  
  return createNewLogger(name, config);
}

/**
 * Get the default FLCM logger
 */
export function getLogger(): Logger {
  return createLogger('FLCM');
}

/**
 * Cleanup all loggers
 */
export function cleanupLoggers(): void {
  loggerCache.forEach((logger) => {
    logger.end();
  });
  loggerCache.clear();
}

// Export winston types for compatibility
export type { winston };