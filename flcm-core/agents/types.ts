/**
 * FLCM Agent System Types
 * Core type definitions for the 3-layer agent system
 */

// Agent states
export enum AgentState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  PROCESSING = 'processing',
  ERROR = 'error',
  SHUTDOWN = 'shutdown'
}

// Agent configuration
export interface AgentConfig {
  enabled: boolean;
  priority: number;
  timeout: number;
  retryAttempts: number;
  [key: string]: any;
}

// Main FLCM configuration
export interface FLCMConfig {
  version: string;
  logLevel: string;
  timeout: number;
  retryAttempts: number;
  agents: {
    scholar: AgentConfig;
    creator: AgentConfig;
    publisher: AgentConfig;
  };
}

// Agent request/response interfaces
export interface AgentRequest {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  priority: 'high' | 'normal' | 'low';
}

export interface AgentResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: Error;
  timestamp: Date;
  processingTime: number;
}

// Error handling types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AGENT_ERROR = 'AGENT_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export interface RetryConfig {
  attempts: number;
  backoffMs: number[];
  retryableErrors: ErrorType[];
}

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
  testRequestTimeout: number;
}