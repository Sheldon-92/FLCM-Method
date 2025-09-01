/**
 * System Integrator
 * Core orchestrator for integrating all FLCM 2.0 components into a unified system
 */
/// <reference types="node" />
import { FLCMSystem, SystemConfiguration, SystemHealth, SystemMetrics, SystemIntegrator as ISystemIntegrator } from './types';
import { EventEmitter } from 'events';
export declare class FLCMSystemIntegrator extends EventEmitter implements ISystemIntegrator {
    private logger;
    private systems;
    private components;
    private serviceRegistry;
    private serviceConnections;
    private healthMonitor;
    private metricsCollector;
    private configurationManager;
    private dependencyResolver;
    constructor();
    /**
     * Initialize FLCM system with configuration
     */
    initialize(config: SystemConfiguration): Promise<FLCMSystem>;
    /**
     * Start FLCM system
     */
    start(systemId: string): Promise<void>;
    /**
     * Stop FLCM system
     */
    stop(systemId: string): Promise<void>;
    /**
     * Restart FLCM system
     */
    restart(systemId: string): Promise<void>;
    /**
     * Get system health
     */
    getHealth(systemId: string): Promise<SystemHealth>;
    /**
     * Get system metrics
     */
    getMetrics(systemId: string): Promise<SystemMetrics>;
    /**
     * Update system configuration
     */
    updateConfiguration(systemId: string, config: Partial<SystemConfiguration>): Promise<void>;
    /**
     * Scale component instances
     */
    scaleComponent(systemId: string, componentId: string, instances: number): Promise<void>;
    /**
     * Deploy component update
     */
    deployUpdate(systemId: string, componentId: string, version: string): Promise<void>;
    /**
     * Rollback component to previous version
     */
    rollback(systemId: string, componentId: string): Promise<void>;
    private initializeServiceRegistry;
    private startSystemMonitoring;
    private validateConfiguration;
    private calculateInitializationOrder;
    private initializeComponent;
    private startComponent;
    private stopComponent;
    private calculateStartOrder;
    private calculateStopOrder;
    private waitForComponentHealth;
    private getComponentHealth;
    private getInitialMetrics;
    private performHealthChecks;
    private collectMetrics;
    private monitorDependencies;
    private getComponentName;
    private getComponentDependencies;
    private getComponentDependents;
    private getInitialResourceUsage;
    private getInitialComponentMetrics;
    private getComponentEndpoints;
    private getComponentCapabilities;
}
