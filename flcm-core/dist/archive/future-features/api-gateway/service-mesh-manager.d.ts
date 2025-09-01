/**
 * Service Mesh Manager
 * Manages service mesh infrastructure and configurations
 */
/// <reference types="node" />
import { ServiceMesh, ServiceMeshConfiguration, ServiceMeshManager as IServiceMeshManager, MeshService, MeshPolicy, MeshMetrics, MeshHealth, MeshTopology, TrafficManagement, mTLS, VirtualService, DestinationRule, ControlPlane, DataPlane, PrometheusConfiguration, JaegerConfiguration, FluentdConfiguration } from './types';
import { EventEmitter } from 'events';
interface ServiceMeshManagerConfig {
    meshId: string;
    clusterId: string;
    namespace: string;
    controlPlane: {
        type: 'istio' | 'linkerd' | 'consul-connect' | 'envoy';
        version: string;
        configuration: ControlPlane;
    };
    dataPlane: {
        proxyType: 'envoy' | 'linkerd-proxy';
        injectionPolicy: 'automatic' | 'manual';
        configuration: DataPlane;
    };
    security: {
        enableMTLS: boolean;
        certificateAuthority: 'istio-ca' | 'cert-manager' | 'external';
        rootCA?: string;
        certChain?: string;
        privateKey?: string;
        trustDomain: string;
    };
    observability: {
        metrics: {
            enabled: boolean;
            backend: 'prometheus' | 'statsd' | 'jaeger';
            configuration: PrometheusConfiguration;
        };
        tracing: {
            enabled: boolean;
            backend: 'jaeger' | 'zipkin' | 'datadog';
            samplingRate: number;
            configuration: JaegerConfiguration;
        };
        logging: {
            enabled: boolean;
            backend: 'fluentd' | 'elasticsearch' | 'splunk';
            configuration: FluentdConfiguration;
        };
    };
    networking: {
        clusterDomain: string;
        serviceSubnet: string;
        podSubnet: string;
        dnsPolicy: string;
    };
    policies: {
        defaultDeny: boolean;
        enablePolicyChecks: boolean;
        telemetryV2: boolean;
    };
}
export declare class ServiceMeshManager extends EventEmitter implements IServiceMeshManager {
    private logger;
    private config;
    private meshes;
    private services;
    private policies;
    private proxies;
    private nodes;
    private clusters;
    private controlPlaneManager;
    private dataPlaneManager;
    private securityManager;
    private observabilityManager;
    private policyManager;
    private certificateManager;
    private trafficManager;
    private configurationManager;
    private metricsCollector;
    private healthMonitor;
    private topologyManager;
    private state;
    private topology;
    constructor(config: ServiceMeshManagerConfig);
    initialize(): Promise<void>;
    createMesh(config: ServiceMeshConfiguration): Promise<ServiceMesh>;
    deleteMesh(meshId: string): Promise<void>;
    getMesh(meshId: string): Promise<ServiceMesh | undefined>;
    listMeshes(): Promise<ServiceMesh[]>;
    addService(meshId: string, service: MeshService): Promise<void>;
    removeService(meshId: string, serviceId: string): Promise<void>;
    addPolicy(meshId: string, policy: MeshPolicy): Promise<void>;
    removePolicy(meshId: string, policyId: string): Promise<void>;
    getMeshHealth(meshId: string): Promise<MeshHealth>;
    getMeshMetrics(meshId: string): Promise<MeshMetrics>;
    getMeshTopology(meshId: string): Promise<MeshTopology>;
    enableMTLS(meshId: string, policy: mTLS): Promise<void>;
    disableMTLS(meshId: string): Promise<void>;
    configureTrafficManagement(meshId: string, config: TrafficManagement): Promise<void>;
    createVirtualService(meshId: string, virtualService: VirtualService): Promise<void>;
    createDestinationRule(meshId: string, destinationRule: DestinationRule): Promise<void>;
    rotateCertificates(meshId: string): Promise<void>;
    private validateMeshConfiguration;
    private validateMeshService;
    private validateMeshPolicy;
    private validateVirtualService;
    private validateDestinationRule;
    private calculateConfigChecksum;
    private createProxyConfiguration;
    private injectSidecar;
    private createServicePolicies;
    private setupEventHandlers;
    shutdown(): Promise<void>;
}
export {};
