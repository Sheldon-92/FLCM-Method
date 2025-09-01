/**
 * Version Router Types and Interfaces
 * FLCM 2.0 - Dual Architecture Foundation
 */

export type FLCMVersion = '1.0' | '2.0';

export interface VersionRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
  user?: {
    id: string;
    preferredVersion?: FLCMVersion;
  };
}

export interface VersionResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
  version: FLCMVersion;
  processingTime?: number;
}

export interface RouterConfig {
  defaultVersion: FLCMVersion;
  userOverridesEnabled: boolean;
  featureFlags: Record<string, boolean>;
  configPath?: string;
}

export interface VersionHandler {
  handle(request: VersionRequest): Promise<VersionResponse>;
  healthCheck(): Promise<HealthStatus>;
}

export interface HealthStatus {
  version: FLCMVersion;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  details?: Record<string, any>;
}

export interface RouterMiddleware {
  (req: VersionRequest, next: () => Promise<VersionResponse>): Promise<VersionResponse>;
}