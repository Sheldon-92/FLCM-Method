/**
 * Logger Utility
 * Version-aware logging system for FLCM
 */

import * as winston from 'winston';
import { FLCMVersion } from '../../router/types';

export interface LogContext {
  version?: FLCMVersion;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  private winston: winston.Logger;
  private context: string;
  private version?: FLCMVersion;
  
  constructor(context: string, version?: FLCMVersion) {
    this.context = context;
    this.version = version;
    
    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const versionPrefix = this.version ? `[FLCM-${this.version}]` : '[FLCM]';
        const contextPrefix = `[${this.context}]`;
        
        if (process.env.NODE_ENV === 'development') {
          return `${versionPrefix} ${timestamp} ${contextPrefix} ${level.toUpperCase()}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        }
        
        return JSON.stringify({
          timestamp,
          version: this.version,
          context: this.context,
          level,
          message,
          ...meta
        });
      })
    );
    
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            format
          )
        })
      ]
    });
    
    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.winston.add(new winston.transports.File({
        filename: `logs/flcm-${this.version || 'general'}.log`,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }));
    }
  }
  
  setVersion(version: FLCMVersion): void {
    this.version = version;
  }
  
  debug(message: string, context?: LogContext): void {
    this.winston.debug(message, this.enrichContext(context));
  }
  
  info(message: string, context?: LogContext): void {
    this.winston.info(message, this.enrichContext(context));
  }
  
  warn(message: string, context?: LogContext): void {
    this.winston.warn(message, this.enrichContext(context));
  }
  
  error(message: string, context?: LogContext): void {
    this.winston.error(message, this.enrichContext(context));
  }
  
  private enrichContext(context?: LogContext): LogContext {
    return {
      ...context,
      version: context?.version || this.version,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Create child logger with additional context
   */
  child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`, this.version);
  }
  
  /**
   * Performance logging
   */
  startTimer(): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`Operation completed in ${duration}ms`, { duration });
    };
  }
}