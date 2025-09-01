/**
 * FLCM Deployment Pipeline Manager
 * Comprehensive deployment pipeline management for FLCM 2.0
 */
/// <reference types="node" />
import { DeploymentPipeline, DeploymentPipelineManager, DeploymentEnvironment, BuildArtifact, DeploymentHistory, CloudProvider } from './types';
import { EventEmitter } from 'events';
interface PipelineManagerConfig {
    id: string;
    name: string;
    configuration: {
        maxConcurrentPipelines: number;
        maxConcurrentStages: number;
        defaultTimeout: number;
        retentionPeriod: number;
        workspaceDir: string;
        artifactStorage: string;
        secretProvider: string;
        notificationProvider: string;
        monitoring: {
            enabled: boolean;
            metricsEndpoint: string;
            alertingEndpoint: string;
        };
        security: {
            enableSecurityScanning: boolean;
            enableImageSigning: boolean;
            enableSBOM: boolean;
            vulnerabilityThreshold: 'critical' | 'high' | 'medium' | 'low';
        };
        compliance: {
            enableAuditLog: boolean;
            retentionPeriod: number;
            frameworks: string[];
        };
    };
    providers: {
        cloud: CloudProvider[];
        container: string[];
        orchestrator: string[];
        cicd: string[];
    };
}
export declare class FLCMDeploymentPipelineManager extends EventEmitter implements DeploymentPipelineManager {
    private logger;
    private config;
    private pipelines;
    private environments;
    private artifacts;
    private executions;
    private activeExecutions;
    private pipelineExecutor;
    private stageManager;
    private stepManager;
    private environmentManager;
    private artifactManager;
    private securityManager;
    private approvalManager;
    private notificationManager;
    private rollbackManager;
    private infrastructureManager;
    private containerManager;
    private orchestratorManager;
    private networkManager;
    private storageManager;
    private backupManager;
    private monitoringManager;
    private state;
    constructor(config: PipelineManagerConfig);
    initialize(): Promise<void>;
    createPipeline(pipeline: DeploymentPipeline): Promise<void>;
    updatePipeline(pipelineId: string, pipeline: Partial<DeploymentPipeline>): Promise<void>;
    deletePipeline(pipelineId: string): Promise<void>;
    getPipeline(pipelineId: string): Promise<DeploymentPipeline | undefined>;
    listPipelines(): Promise<DeploymentPipeline[]>;
    triggerPipeline(pipelineId: string, trigger: string, parameters?: Map<string, any>): Promise<string>;
    cancelPipeline(executionId: string): Promise<void>;
    pausePipeline(executionId: string): Promise<void>;
    resumePipeline(executionId: string): Promise<void>;
    approvePipeline(approvalId: string, approved: boolean, comment?: string): Promise<void>;
    rollbackDeployment(executionId: string, targetVersion?: string): Promise<string>;
    getExecution(executionId: string): Promise<DeploymentHistory | undefined>;
    listExecutions(pipelineId?: string): Promise<DeploymentHistory[]>;
    createEnvironment(environment: DeploymentEnvironment): Promise<void>;
    updateEnvironment(envId: string, environment: Partial<DeploymentEnvironment>): Promise<void>;
    deleteEnvironment(envId: string): Promise<void>;
    getEnvironment(envId: string): Promise<DeploymentEnvironment | undefined>;
    listEnvironments(): Promise<DeploymentEnvironment[]>;
    createArtifact(artifact: BuildArtifact): Promise<void>;
    publishArtifact(artifactId: string): Promise<void>;
    promoteArtifact(artifactId: string, environment: string): Promise<void>;
    getArtifact(artifactId: string): Promise<BuildArtifact | undefined>;
    listArtifacts(): Promise<BuildArtifact[]>;
    getHealth(): Promise<any>;
    getMetrics(): Promise<any>;
    shutdown(): Promise<void>;
    private validatePipelineConfiguration;
    private initializePipelineStages;
    private cleanupPipelineResources;
    private createExecution;
    private executeAsync;
    private setupEventHandlers;
    private startHealthMonitoring;
    private calculateAverageExecutionTime;
    private calculateDeploymentFrequency;
}
export { FLCMDeploymentPipelineManager };
