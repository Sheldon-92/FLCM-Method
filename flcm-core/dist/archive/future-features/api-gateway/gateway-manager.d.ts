/**
 * API Gateway Manager
 * Manages API gateway instances, routes, and policies
 */
/// <reference types="node" />
import { APIGateway, APIGatewayConfiguration, Route, Policy, GatewayMetrics, GatewayHealth, APIGatewayManager as IAPIGatewayManager, PluginConfiguration, ConfigurationSource, ServiceRegistry } from './types';
import { EventEmitter } from 'events';
interface GatewayManagerConfig {
    clusterId: string;
    nodeId: string;
    configurationSources: ConfigurationSource[];
    serviceRegistry: ServiceRegistry;
    defaultPolicies: Policy[];
    plugins: PluginConfiguration[];
    monitoring: {
        enabled: boolean;
        interval: number;
        alertThresholds: Map<string, number>;
    };
    security: {
        enableMTLS: boolean;
        certificatePath?: string;
        keyPath?: string;
        caPath?: string;
        enableOIDC: boolean;
        oidcConfig?: any;
    };
    performance: {
        workerCount: number;
        connectionPoolSize: number;
        requestTimeout: number;
        keepAliveTimeout: number;
    };
}
export declare class APIGatewayManager extends EventEmitter implements IAPIGatewayManager {
    private logger;
    private config;
    private gateways;
    private clusters;
    private nodes;
    private pluginManager;
    private routeManager;
    private policyManager;
    private configManager;
    private securityManager;
    private trafficManager;
    private certificateManager;
    private metricsCollector;
    private healthMonitor;
    private serviceRegistry;
    private serviceDiscovery;
    private loadBalancer;
    private policyEngine;
    private configWatchers;
    private state;
    private status;
    constructor(config: GatewayManagerConfig);
    initialize(): Promise<void>;
    createGateway(config: APIGatewayConfiguration): Promise<APIGateway>;
    updateGateway(gatewayId: string, config: Partial<APIGatewayConfiguration>): Promise<APIGateway>;
    deleteGateway(gatewayId: string): Promise<void>;
    getGateway(gatewayId: string): Promise<APIGateway | undefined>;
    listGateways(): Promise<APIGateway[]>;
    getGatewayHealth(gatewayId: string): Promise<GatewayHealth>;
    getGatewayMetrics(gatewayId: string): Promise<GatewayMetrics>;
    addRoute(gatewayId: string, route: Route): Promise<void>;
    removeRoute(gatewayId: string, routeId: string): Promise<void>;
    addPolicy(gatewayId: string, policy: Policy): Promise<void>;
    removePolicy(gatewayId: string, policyId: string): Promise<void>;
    startGateway(gatewayId: string): Promise<void>;
    stopGateway(gatewayId: string): Promise<void>;
    reloadGateway(gatewayId: string): Promise<void>;
    private validateGatewayConfiguration;
    private calculateConfigChecksum;
    private createMiddleware;
    private createUpstream;
    private checkRouteConflicts;
    private routesConflict;
    private pathsOverlap;
    private reloadGatewayConfig;
    private cleanupGatewayResources;
    private startListener;
    private stopListener;
    private startUpstreamHealthChecks;
    private stopUpstreamHealthChecks;
    private setupConfigurationWatchers;
    private setupEventHandlers;
    private handleConfigurationChange;
    private configAffectsGateway;
    private handleHealthChange;
    private handleMetricsUpdate;
    private handleServiceRegistration;
    private handleServiceUnregistration;
    shutdown(): Promise<void>;
}
export {};
