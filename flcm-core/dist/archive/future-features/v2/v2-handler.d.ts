/**
 * FLCM 2.0 Handler
 * Handles requests for the new 3-layer system
 */
import { VersionHandler, VersionRequest, VersionResponse, HealthStatus } from '../router/types';
export declare class V2Handler implements VersionHandler {
    private logger;
    private startTime;
    constructor();
    handle(request: VersionRequest): Promise<VersionResponse>;
    healthCheck(): Promise<HealthStatus>;
    private handleMentor;
    private handleCreator;
    private handlePublisher;
    private handleFramework;
}
