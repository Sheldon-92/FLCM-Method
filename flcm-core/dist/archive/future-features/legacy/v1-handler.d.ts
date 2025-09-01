/**
 * FLCM 1.0 Handler
 * Handles requests for the legacy 4-agent system
 */
import { VersionHandler, VersionRequest, VersionResponse, HealthStatus } from '../router/types';
export declare class V1Handler implements VersionHandler {
    private logger;
    private startTime;
    constructor();
    handle(request: VersionRequest): Promise<VersionResponse>;
    healthCheck(): Promise<HealthStatus>;
    private handleCollector;
    private handleScholar;
    private handleCreator;
    private handleAdapter;
}
