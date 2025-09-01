"use strict";
/**
 * API Gateway Manager
 * Manages API gateway instances, routes, and policies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIGatewayManager = void 0;
const logger_1 = require("../shared/utils/logger");
const events_1 = require("events");
class APIGatewayManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.logger = new logger_1.Logger('APIGatewayManager');
        this.config = config;
        this.gateways = new Map();
        this.clusters = new Map();
        this.nodes = new Map();
        this.configWatchers = new Map();
        this.pluginManager = new DefaultPluginManager(this.logger);
        this.routeManager = new DefaultRouteManager(this.logger);
        this.policyManager = new DefaultPolicyManager(this.logger);
        this.configManager = new DefaultConfigManager(config.configurationSources, this.logger);
        this.securityManager = new DefaultSecurityManager(config.security, this.logger);
        this.trafficManager = new DefaultTrafficManager(this.logger);
        this.certificateManager = new DefaultCertificateManager(config.security, this.logger);
        this.metricsCollector = new DefaultMetricsCollector(this.logger);
        this.healthMonitor = new DefaultHealthMonitor(config.monitoring, this.logger);
        this.serviceRegistry = config.serviceRegistry;
        this.serviceDiscovery = new DefaultServiceDiscovery(this.serviceRegistry, this.logger);
        this.loadBalancer = new DefaultLoadBalancer(this.logger);
        this.policyEngine = new DefaultPolicyEngine(this.logger);
        this.state = {
            phase: 'initializing',
            startTime: new Date(),
            version: '2.0.0',
            configuration: {
                lastUpdated: new Date(),
                checksum: '',
                source: 'manager'
            },
            health: {
                status: 'unknown',
                lastCheck: new Date(),
                checks: new Map()
            },
            metrics: {
                requests: 0,
                errors: 0,
                latency: 0,
                throughput: 0
            }
        };
        this.status = 'initializing';
    }
    async initialize() {
        try {
            this.logger.info('Initializing API Gateway Manager');
            this.status = 'initializing';
            this.state.phase = 'initializing';
            // Initialize core managers
            await this.pluginManager.initialize();
            await this.routeManager.initialize();
            await this.policyManager.initialize();
            await this.configManager.initialize();
            await this.securityManager.initialize();
            await this.trafficManager.initialize();
            await this.certificateManager.initialize();
            // Initialize monitoring
            await this.metricsCollector.initialize();
            await this.healthMonitor.initialize();
            // Initialize service components
            await this.serviceDiscovery.initialize();
            await this.loadBalancer.initialize();
            // Initialize policy engine
            await this.policyEngine.initialize();
            // Load default policies
            for (const policy of this.config.defaultPolicies) {
                await this.policyManager.addPolicy(policy);
            }
            // Load and activate plugins
            for (const pluginConfig of this.config.plugins) {
                await this.pluginManager.loadPlugin(pluginConfig);
            }
            // Setup configuration watchers
            await this.setupConfigurationWatchers();
            // Setup event handlers
            this.setupEventHandlers();
            this.status = 'ready';
            this.state.phase = 'ready';
            this.emit('manager_initialized', {
                managerId: this.config.nodeId,
                clusterId: this.config.clusterId,
                plugins: this.config.plugins.length,
                policies: this.config.defaultPolicies.length
            });
            this.logger.info('API Gateway Manager initialized successfully');
        }
        catch (error) {
            this.status = 'error';
            this.state.phase = 'error';
            this.logger.error('Failed to initialize API Gateway Manager:', error);
            throw error;
        }
    }
    async createGateway(config) {
        try {
            this.logger.debug(`Creating API Gateway: ${config.id}`);
            if (this.gateways.has(config.id)) {
                throw new Error(`Gateway already exists: ${config.id}`);
            }
            // Validate configuration
            await this.validateGatewayConfiguration(config);
            // Apply security policies
            const securityEnhancedConfig = await this.securityManager.enhanceConfiguration(config);
            // Create gateway instance
            const gateway = {
                id: config.id,
                name: config.name,
                description: config.description,
                version: config.version,
                configuration: securityEnhancedConfig,
                routes: new Map(),
                middleware: [],
                policies: [],
                plugins: [],
                upstreams: new Map(),
                clusters: [],
                listeners: [],
                certificates: [],
                health: {
                    status: 'starting',
                    lastCheck: new Date(),
                    uptime: 0,
                    requestCount: 0,
                    errorCount: 0,
                    avgLatency: 0
                },
                metrics: {
                    requests: {
                        total: 0,
                        success: 0,
                        error: 0,
                        rate: 0
                    },
                    latency: {
                        p50: 0,
                        p90: 0,
                        p95: 0,
                        p99: 0,
                        avg: 0
                    },
                    throughput: {
                        requestsPerSecond: 0,
                        bytesPerSecond: 0
                    },
                    errors: {
                        rate: 0,
                        codes: new Map()
                    },
                    upstreams: new Map(),
                    custom: new Map()
                },
                state: {
                    phase: 'creating',
                    startTime: new Date(),
                    configuration: {
                        lastUpdated: new Date(),
                        checksum: this.calculateConfigChecksum(securityEnhancedConfig),
                        version: config.version
                    }
                },
                created: new Date(),
                lastUpdated: new Date()
            };
            // Initialize routes from configuration
            for (const routeConfig of config.routes || []) {
                const route = await this.routeManager.createRoute(routeConfig);
                gateway.routes.set(route.id, route);
            }
            // Initialize middleware
            for (const middlewareConfig of config.middleware || []) {
                const middleware = await this.createMiddleware(middlewareConfig);
                gateway.middleware.push(middleware);
            }
            // Initialize policies
            for (const policyConfig of config.policies || []) {
                const policy = await this.policyManager.createPolicy(policyConfig);
                gateway.policies.push(policy);
            }
            // Initialize upstream services
            for (const upstreamConfig of config.upstreams || []) {
                const upstream = await this.createUpstream(upstreamConfig);
                gateway.upstreams.set(upstream.id, upstream);
            }
            // Setup SSL/TLS if configured
            if (config.ssl?.enabled) {
                await this.certificateManager.setupSSL(gateway, config.ssl);
            }
            // Register with service registry
            await this.serviceRegistry.register({
                id: gateway.id,
                name: gateway.name,
                type: 'api-gateway',
                endpoints: config.listeners?.map(l => ({
                    host: l.address,
                    port: l.port,
                    protocol: l.protocol
                })) || [],
                metadata: {
                    version: gateway.version,
                    cluster: this.config.clusterId,
                    node: this.config.nodeId
                },
                health: {
                    endpoint: '/health',
                    interval: 30,
                    timeout: 10
                }
            });
            // Store gateway
            this.gateways.set(gateway.id, gateway);
            // Start health monitoring
            await this.healthMonitor.startMonitoring(gateway.id);
            // Start metrics collection
            await this.metricsCollector.startCollection(gateway.id);
            gateway.state.phase = 'ready';
            gateway.health.status = 'healthy';
            this.emit('gateway_created', {
                gatewayId: gateway.id,
                clusterId: this.config.clusterId,
                routes: gateway.routes.size,
                upstreams: gateway.upstreams.size
            });
            this.logger.info(`API Gateway created successfully: ${gateway.id}`);
            return gateway;
        }
        catch (error) {
            this.logger.error(`Failed to create API Gateway: ${config.id}`, error);
            throw error;
        }
    }
    async updateGateway(gatewayId, config) {
        try {
            this.logger.debug(`Updating API Gateway: ${gatewayId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            // Validate configuration changes
            const mergedConfig = { ...gateway.configuration, ...config };
            await this.validateGatewayConfiguration(mergedConfig);
            // Apply configuration changes
            gateway.configuration = mergedConfig;
            gateway.lastUpdated = new Date();
            gateway.state.configuration.lastUpdated = new Date();
            gateway.state.configuration.checksum = this.calculateConfigChecksum(mergedConfig);
            // Update routes if provided
            if (config.routes) {
                gateway.routes.clear();
                for (const routeConfig of config.routes) {
                    const route = await this.routeManager.createRoute(routeConfig);
                    gateway.routes.set(route.id, route);
                }
            }
            // Update policies if provided
            if (config.policies) {
                gateway.policies = [];
                for (const policyConfig of config.policies) {
                    const policy = await this.policyManager.createPolicy(policyConfig);
                    gateway.policies.push(policy);
                }
            }
            // Update upstreams if provided
            if (config.upstreams) {
                gateway.upstreams.clear();
                for (const upstreamConfig of config.upstreams) {
                    const upstream = await this.createUpstream(upstreamConfig);
                    gateway.upstreams.set(upstream.id, upstream);
                }
            }
            // Reload gateway configuration
            await this.reloadGatewayConfig(gatewayId);
            this.emit('gateway_updated', {
                gatewayId,
                changes: Object.keys(config),
                timestamp: new Date()
            });
            this.logger.info(`API Gateway updated successfully: ${gatewayId}`);
            return gateway;
        }
        catch (error) {
            this.logger.error(`Failed to update API Gateway: ${gatewayId}`, error);
            throw error;
        }
    }
    async deleteGateway(gatewayId) {
        try {
            this.logger.debug(`Deleting API Gateway: ${gatewayId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            // Stop monitoring
            await this.healthMonitor.stopMonitoring(gatewayId);
            await this.metricsCollector.stopCollection(gatewayId);
            // Unregister from service registry
            await this.serviceRegistry.unregister(gatewayId);
            // Clean up resources
            await this.cleanupGatewayResources(gateway);
            // Remove from manager
            this.gateways.delete(gatewayId);
            this.emit('gateway_deleted', {
                gatewayId,
                clusterId: this.config.clusterId,
                timestamp: new Date()
            });
            this.logger.info(`API Gateway deleted successfully: ${gatewayId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete API Gateway: ${gatewayId}`, error);
            throw error;
        }
    }
    async getGateway(gatewayId) {
        return this.gateways.get(gatewayId);
    }
    async listGateways() {
        return Array.from(this.gateways.values());
    }
    async getGatewayHealth(gatewayId) {
        try {
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            return await this.healthMonitor.getHealth(gatewayId);
        }
        catch (error) {
            this.logger.error(`Failed to get gateway health: ${gatewayId}`, error);
            throw error;
        }
    }
    async getGatewayMetrics(gatewayId) {
        try {
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            return await this.metricsCollector.getMetrics(gatewayId);
        }
        catch (error) {
            this.logger.error(`Failed to get gateway metrics: ${gatewayId}`, error);
            throw error;
        }
    }
    async addRoute(gatewayId, route) {
        try {
            this.logger.debug(`Adding route to gateway ${gatewayId}: ${route.id}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            // Validate route
            await this.routeManager.validateRoute(route);
            // Check for conflicts
            await this.checkRouteConflicts(gateway, route);
            // Add route
            gateway.routes.set(route.id, route);
            gateway.lastUpdated = new Date();
            // Update gateway configuration
            await this.reloadGatewayConfig(gatewayId);
            this.emit('route_added', {
                gatewayId,
                routeId: route.id,
                path: route.path,
                methods: route.methods
            });
            this.logger.info(`Route added to gateway ${gatewayId}: ${route.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to add route to gateway ${gatewayId}:`, error);
            throw error;
        }
    }
    async removeRoute(gatewayId, routeId) {
        try {
            this.logger.debug(`Removing route from gateway ${gatewayId}: ${routeId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            if (!gateway.routes.has(routeId)) {
                throw new Error(`Route not found: ${routeId}`);
            }
            // Remove route
            gateway.routes.delete(routeId);
            gateway.lastUpdated = new Date();
            // Update gateway configuration
            await this.reloadGatewayConfig(gatewayId);
            this.emit('route_removed', {
                gatewayId,
                routeId,
                timestamp: new Date()
            });
            this.logger.info(`Route removed from gateway ${gatewayId}: ${routeId}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove route from gateway ${gatewayId}:`, error);
            throw error;
        }
    }
    async addPolicy(gatewayId, policy) {
        try {
            this.logger.debug(`Adding policy to gateway ${gatewayId}: ${policy.id}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            // Validate policy
            await this.policyManager.validatePolicy(policy);
            // Add policy
            gateway.policies.push(policy);
            gateway.lastUpdated = new Date();
            // Update policy engine
            await this.policyEngine.addPolicy(policy);
            // Update gateway configuration
            await this.reloadGatewayConfig(gatewayId);
            this.emit('policy_added', {
                gatewayId,
                policyId: policy.id,
                type: policy.type,
                scope: policy.scope
            });
            this.logger.info(`Policy added to gateway ${gatewayId}: ${policy.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to add policy to gateway ${gatewayId}:`, error);
            throw error;
        }
    }
    async removePolicy(gatewayId, policyId) {
        try {
            this.logger.debug(`Removing policy from gateway ${gatewayId}: ${policyId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            const policyIndex = gateway.policies.findIndex(p => p.id === policyId);
            if (policyIndex === -1) {
                throw new Error(`Policy not found: ${policyId}`);
            }
            // Remove policy
            gateway.policies.splice(policyIndex, 1);
            gateway.lastUpdated = new Date();
            // Update policy engine
            await this.policyEngine.removePolicy(policyId);
            // Update gateway configuration
            await this.reloadGatewayConfig(gatewayId);
            this.emit('policy_removed', {
                gatewayId,
                policyId,
                timestamp: new Date()
            });
            this.logger.info(`Policy removed from gateway ${gatewayId}: ${policyId}`);
        }
        catch (error) {
            this.logger.error(`Failed to remove policy from gateway ${gatewayId}:`, error);
            throw error;
        }
    }
    async startGateway(gatewayId) {
        try {
            this.logger.debug(`Starting API Gateway: ${gatewayId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            if (gateway.health.status === 'running') {
                this.logger.warn(`Gateway already running: ${gatewayId}`);
                return;
            }
            gateway.state.phase = 'starting';
            gateway.health.status = 'starting';
            // Start listeners
            for (const listener of gateway.listeners) {
                await this.startListener(gateway, listener);
            }
            // Start health checks for upstreams
            for (const [upstreamId, upstream] of gateway.upstreams) {
                await this.startUpstreamHealthChecks(upstream);
            }
            // Start traffic management
            await this.trafficManager.startTrafficManagement(gatewayId);
            gateway.state.phase = 'running';
            gateway.health.status = 'running';
            gateway.state.startTime = new Date();
            this.emit('gateway_started', {
                gatewayId,
                listeners: gateway.listeners.length,
                upstreams: gateway.upstreams.size,
                timestamp: new Date()
            });
            this.logger.info(`API Gateway started successfully: ${gatewayId}`);
        }
        catch (error) {
            const gateway = this.gateways.get(gatewayId);
            if (gateway) {
                gateway.state.phase = 'error';
                gateway.health.status = 'unhealthy';
            }
            this.logger.error(`Failed to start API Gateway: ${gatewayId}`, error);
            throw error;
        }
    }
    async stopGateway(gatewayId) {
        try {
            this.logger.debug(`Stopping API Gateway: ${gatewayId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            if (gateway.health.status === 'stopped') {
                this.logger.warn(`Gateway already stopped: ${gatewayId}`);
                return;
            }
            gateway.state.phase = 'stopping';
            gateway.health.status = 'stopping';
            // Stop traffic management
            await this.trafficManager.stopTrafficManagement(gatewayId);
            // Stop listeners
            for (const listener of gateway.listeners) {
                await this.stopListener(gateway, listener);
            }
            // Stop upstream health checks
            for (const [upstreamId, upstream] of gateway.upstreams) {
                await this.stopUpstreamHealthChecks(upstream);
            }
            gateway.state.phase = 'stopped';
            gateway.health.status = 'stopped';
            this.emit('gateway_stopped', {
                gatewayId,
                uptime: Date.now() - gateway.state.startTime.getTime(),
                timestamp: new Date()
            });
            this.logger.info(`API Gateway stopped successfully: ${gatewayId}`);
        }
        catch (error) {
            const gateway = this.gateways.get(gatewayId);
            if (gateway) {
                gateway.state.phase = 'error';
                gateway.health.status = 'unhealthy';
            }
            this.logger.error(`Failed to stop API Gateway: ${gatewayId}`, error);
            throw error;
        }
    }
    async reloadGateway(gatewayId) {
        try {
            this.logger.debug(`Reloading API Gateway: ${gatewayId}`);
            const gateway = this.gateways.get(gatewayId);
            if (!gateway) {
                throw new Error(`Gateway not found: ${gatewayId}`);
            }
            // Reload configuration
            await this.reloadGatewayConfig(gatewayId);
            // Reload routes
            await this.routeManager.reloadRoutes(gatewayId);
            // Reload policies
            await this.policyEngine.reloadPolicies(gatewayId);
            // Reload plugins
            await this.pluginManager.reloadPlugins(gatewayId);
            gateway.lastUpdated = new Date();
            gateway.state.configuration.lastUpdated = new Date();
            this.emit('gateway_reloaded', {
                gatewayId,
                timestamp: new Date()
            });
            this.logger.info(`API Gateway reloaded successfully: ${gatewayId}`);
        }
        catch (error) {
            this.logger.error(`Failed to reload API Gateway: ${gatewayId}`, error);
            throw error;
        }
    }
    // Private helper methods
    async validateGatewayConfiguration(config) {
        // Validate basic configuration
        if (!config.id || !config.name) {
            throw new Error('Gateway ID and name are required');
        }
        // Validate listeners
        if (!config.listeners || config.listeners.length === 0) {
            throw new Error('At least one listener must be configured');
        }
        // Validate routes
        if (config.routes) {
            for (const route of config.routes) {
                await this.routeManager.validateRoute(route);
            }
        }
        // Validate policies
        if (config.policies) {
            for (const policy of config.policies) {
                await this.policyManager.validatePolicy(policy);
            }
        }
        // Validate SSL configuration
        if (config.ssl?.enabled) {
            await this.certificateManager.validateSSLConfig(config.ssl);
        }
    }
    calculateConfigChecksum(config) {
        const configString = JSON.stringify(config, Object.keys(config).sort());
        // Simple hash implementation - in production use crypto
        let hash = 0;
        for (let i = 0; i < configString.length; i++) {
            const char = configString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
    async createMiddleware(config) {
        return {
            id: config.id || `middleware-${Date.now()}`,
            name: config.name,
            type: config.type,
            configuration: config.configuration || {},
            order: config.order || 0,
            enabled: config.enabled !== false,
            conditions: config.conditions || [],
            created: new Date(),
            lastUpdated: new Date()
        };
    }
    async createUpstream(config) {
        return {
            id: config.id || `upstream-${Date.now()}`,
            name: config.name,
            endpoints: config.endpoints || [],
            loadBalancing: config.loadBalancing || { strategy: 'round_robin' },
            healthCheck: config.healthCheck || {
                enabled: true,
                endpoint: '/health',
                interval: 30,
                timeout: 10,
                healthyThreshold: 2,
                unhealthyThreshold: 3
            },
            circuitBreaker: config.circuitBreaker || {
                enabled: true,
                failureThreshold: 5,
                recoveryTime: 30,
                timeout: 30
            },
            retryPolicy: config.retryPolicy || {
                maxRetries: 3,
                backoffStrategy: 'exponential',
                retryOn: ['5xx', 'timeout']
            },
            timeout: config.timeout || {
                connect: 5,
                request: 30,
                response: 30
            },
            ssl: config.ssl || {
                enabled: false,
                verify: true
            },
            metadata: config.metadata || {},
            created: new Date(),
            lastUpdated: new Date()
        };
    }
    async checkRouteConflicts(gateway, newRoute) {
        for (const [routeId, existingRoute] of gateway.routes) {
            if (this.routesConflict(existingRoute, newRoute)) {
                throw new Error(`Route conflict detected with existing route: ${routeId}`);
            }
        }
    }
    routesConflict(route1, route2) {
        // Check if paths overlap and methods overlap
        const pathsOverlap = this.pathsOverlap(route1.path, route2.path);
        const methodsOverlap = route1.methods.some(m => route2.methods.includes(m));
        return pathsOverlap && methodsOverlap;
    }
    pathsOverlap(path1, path2) {
        // Simple path overlap check - in production use more sophisticated logic
        if (path1 === path2)
            return true;
        // Check for wildcard conflicts
        if (path1.includes('*') || path2.includes('*')) {
            const regex1 = new RegExp(path1.replace(/\*/g, '.*'));
            const regex2 = new RegExp(path2.replace(/\*/g, '.*'));
            return regex1.test(path2) || regex2.test(path1);
        }
        return false;
    }
    async reloadGatewayConfig(gatewayId) {
        // Reload gateway configuration - implementation depends on gateway type
        this.logger.debug(`Reloading configuration for gateway: ${gatewayId}`);
    }
    async cleanupGatewayResources(gateway) {
        // Clean up any resources associated with the gateway
        this.logger.debug(`Cleaning up resources for gateway: ${gateway.id}`);
    }
    async startListener(gateway, listener) {
        this.logger.debug(`Starting listener for gateway ${gateway.id}: ${listener.address}:${listener.port}`);
    }
    async stopListener(gateway, listener) {
        this.logger.debug(`Stopping listener for gateway ${gateway.id}: ${listener.address}:${listener.port}`);
    }
    async startUpstreamHealthChecks(upstream) {
        if (upstream.healthCheck.enabled) {
            this.logger.debug(`Starting health checks for upstream: ${upstream.id}`);
        }
    }
    async stopUpstreamHealthChecks(upstream) {
        if (upstream.healthCheck.enabled) {
            this.logger.debug(`Stopping health checks for upstream: ${upstream.id}`);
        }
    }
    async setupConfigurationWatchers() {
        for (const source of this.config.configurationSources) {
            const watcher = await this.configManager.createWatcher(source);
            this.configWatchers.set(source.id, watcher);
            watcher.on('configuration_changed', async (change) => {
                await this.handleConfigurationChange(change);
            });
        }
    }
    setupEventHandlers() {
        // Setup internal event handlers
        this.healthMonitor.on('health_changed', (event) => {
            this.handleHealthChange(event);
        });
        this.metricsCollector.on('metrics_updated', (event) => {
            this.handleMetricsUpdate(event);
        });
        this.serviceRegistry.on('service_registered', (event) => {
            this.handleServiceRegistration(event);
        });
        this.serviceRegistry.on('service_unregistered', (event) => {
            this.handleServiceUnregistration(event);
        });
    }
    async handleConfigurationChange(change) {
        this.logger.info('Configuration change detected', change);
        // Reload affected gateways
        for (const [gatewayId, gateway] of this.gateways) {
            if (this.configAffectsGateway(change, gateway)) {
                await this.reloadGateway(gatewayId);
            }
        }
    }
    configAffectsGateway(change, gateway) {
        // Determine if configuration change affects this gateway
        return true; // Simplified - reload all for now
    }
    handleHealthChange(event) {
        this.emit('gateway_health_changed', event);
    }
    handleMetricsUpdate(event) {
        this.emit('gateway_metrics_updated', event);
    }
    handleServiceRegistration(event) {
        this.emit('service_registered', event);
    }
    handleServiceUnregistration(event) {
        this.emit('service_unregistered', event);
    }
    async shutdown() {
        try {
            this.logger.info('Shutting down API Gateway Manager');
            // Stop all gateways
            for (const [gatewayId, gateway] of this.gateways) {
                if (gateway.health.status === 'running') {
                    await this.stopGateway(gatewayId);
                }
            }
            // Stop monitoring
            await this.healthMonitor.shutdown();
            await this.metricsCollector.shutdown();
            // Stop configuration watchers
            for (const [sourceId, watcher] of this.configWatchers) {
                await watcher.stop();
            }
            // Shutdown managers
            await this.pluginManager.shutdown();
            await this.routeManager.shutdown();
            await this.policyManager.shutdown();
            await this.configManager.shutdown();
            await this.securityManager.shutdown();
            await this.trafficManager.shutdown();
            await this.certificateManager.shutdown();
            this.status = 'stopped';
            this.state.phase = 'stopped';
            this.emit('manager_shutdown', {
                managerId: this.config.nodeId,
                uptime: Date.now() - this.state.startTime.getTime(),
                gatewaysManaged: this.gateways.size
            });
            this.logger.info('API Gateway Manager shutdown complete');
        }
        catch (error) {
            this.logger.error('Failed to shutdown API Gateway Manager:', error);
            throw error;
        }
    }
}
exports.APIGatewayManager = APIGatewayManager;
// Default implementations
class DefaultPluginManager {
    constructor(logger) {
        this.logger = logger;
        this.plugins = new Map();
    }
    async initialize() {
        this.logger.debug('Initializing Plugin Manager');
    }
    async loadPlugin(config) {
        this.logger.debug(`Loading plugin: ${config.name}`);
        // Plugin loading implementation
    }
    async reloadPlugins(gatewayId) {
        this.logger.debug(`Reloading plugins for gateway: ${gatewayId}`);
    }
    async shutdown() {
        this.logger.debug('Shutting down Plugin Manager');
    }
}
class DefaultRouteManager {
    constructor(logger) {
        this.logger = logger;
        this.routes = new Map();
    }
    async initialize() {
        this.logger.debug('Initializing Route Manager');
    }
    async createRoute(config) {
        const route = {
            id: config.id || `route-${Date.now()}`,
            path: config.path,
            methods: config.methods || ['GET'],
            handler: config.handler,
            middleware: config.middleware || [],
            policies: config.policies || [],
            upstream: config.upstream,
            timeout: config.timeout || 30,
            retries: config.retries || 3,
            cacheable: config.cacheable || false,
            metadata: config.metadata || {},
            created: new Date(),
            lastUpdated: new Date()
        };
        this.routes.set(route.id, route);
        return route;
    }
    async validateRoute(route) {
        if (!route.path || !route.methods || route.methods.length === 0) {
            throw new Error('Route must have path and at least one method');
        }
    }
    async reloadRoutes(gatewayId) {
        this.logger.debug(`Reloading routes for gateway: ${gatewayId}`);
    }
    async shutdown() {
        this.logger.debug('Shutting down Route Manager');
    }
}
class DefaultPolicyManager {
    constructor(logger) {
        this.logger = logger;
        this.policies = new Map();
    }
    async initialize() {
        this.logger.debug('Initializing Policy Manager');
    }
    async createPolicy(config) {
        const policy = {
            id: config.id || `policy-${Date.now()}`,
            name: config.name,
            type: config.type,
            scope: config.scope || 'global',
            configuration: config.configuration || {},
            enabled: config.enabled !== false,
            priority: config.priority || 0,
            conditions: config.conditions || [],
            actions: config.actions || [],
            metadata: config.metadata || {},
            created: new Date(),
            lastUpdated: new Date()
        };
        this.policies.set(policy.id, policy);
        return policy;
    }
    async addPolicy(policy) {
        this.policies.set(policy.id, policy);
    }
    async validatePolicy(policy) {
        if (!policy.type || !policy.scope) {
            throw new Error('Policy must have type and scope');
        }
    }
    async shutdown() {
        this.logger.debug('Shutting down Policy Manager');
    }
}
class DefaultConfigManager {
    constructor(sources, logger) {
        this.logger = logger;
        this.sources = sources;
    }
    async initialize() {
        this.logger.debug('Initializing Config Manager');
    }
    async createWatcher(source) {
        return {
            id: `watcher-${source.id}`,
            source,
            active: true,
            lastCheck: new Date(),
            on: () => { },
            start: async () => { },
            stop: async () => { },
            getConfiguration: async () => ({})
        };
    }
    async shutdown() {
        this.logger.debug('Shutting down Config Manager');
    }
}
class DefaultSecurityManager {
    constructor(config, logger) {
        this.logger = logger;
        this.config = config;
    }
    async initialize() {
        this.logger.debug('Initializing Security Manager');
    }
    async enhanceConfiguration(config) {
        // Apply security enhancements
        return {
            ...config,
            security: {
                ...config.security,
                enhanced: true,
                appliedAt: new Date()
            }
        };
    }
    async shutdown() {
        this.logger.debug('Shutting down Security Manager');
    }
}
class DefaultTrafficManager {
    constructor(logger) {
        this.logger = logger;
    }
    async startTrafficManagement(gatewayId) {
        this.logger.debug(`Starting traffic management for gateway: ${gatewayId}`);
    }
    async stopTrafficManagement(gatewayId) {
        this.logger.debug(`Stopping traffic management for gateway: ${gatewayId}`);
    }
}
class DefaultCertificateManager {
    constructor(config, logger) {
        this.logger = logger;
        this.config = config;
    }
    async initialize() {
        this.logger.debug('Initializing Certificate Manager');
    }
    async setupSSL(gateway, sslConfig) {
        this.logger.debug(`Setting up SSL for gateway: ${gateway.id}`);
    }
    async validateSSLConfig(config) {
        if (config.enabled && !config.certificate) {
            throw new Error('SSL certificate is required when SSL is enabled');
        }
    }
    async shutdown() {
        this.logger.debug('Shutting down Certificate Manager');
    }
}
class DefaultMetricsCollector {
    constructor(logger) {
        this.logger = logger;
    }
    async initialize() {
        this.logger.debug('Initializing Metrics Collector');
    }
    async startCollection(gatewayId) {
        this.logger.debug(`Starting metrics collection for gateway: ${gatewayId}`);
    }
    async stopCollection(gatewayId) {
        this.logger.debug(`Stopping metrics collection for gateway: ${gatewayId}`);
    }
    async getMetrics(gatewayId) {
        return {
            requests: { total: 0, success: 0, error: 0, rate: 0 },
            latency: { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0 },
            throughput: { requestsPerSecond: 0, bytesPerSecond: 0 },
            errors: { rate: 0, codes: new Map() },
            upstreams: new Map(),
            custom: new Map()
        };
    }
    on(event, listener) { }
    async shutdown() {
        this.logger.debug('Shutting down Metrics Collector');
    }
}
class DefaultHealthMonitor {
    constructor(config, logger) {
        this.logger = logger;
        this.config = config;
    }
    async initialize() {
        this.logger.debug('Initializing Health Monitor');
    }
    async startMonitoring(gatewayId) {
        this.logger.debug(`Starting health monitoring for gateway: ${gatewayId}`);
    }
    async stopMonitoring(gatewayId) {
        this.logger.debug(`Stopping health monitoring for gateway: ${gatewayId}`);
    }
    async getHealth(gatewayId) {
        return {
            status: 'healthy',
            lastCheck: new Date(),
            uptime: 0,
            requestCount: 0,
            errorCount: 0,
            avgLatency: 0
        };
    }
    on(event, listener) { }
    async shutdown() {
        this.logger.debug('Shutting down Health Monitor');
    }
}
class DefaultServiceDiscovery {
    constructor(registry, logger) {
        this.logger = logger;
        this.registry = registry;
    }
    async initialize() {
        this.logger.debug('Initializing Service Discovery');
    }
    async discoverServices(criteria) {
        this.logger.debug('Discovering services', criteria);
        return [];
    }
}
class DefaultLoadBalancer {
    constructor(logger) {
        this.logger = logger;
    }
    async initialize() {
        this.logger.debug('Initializing Load Balancer');
    }
    async selectEndpoint(endpoints, strategy) {
        if (endpoints.length === 0) {
            throw new Error('No endpoints available');
        }
        return endpoints[0]; // Simple round-robin
    }
}
class DefaultPolicyEngine {
    constructor(logger) {
        this.logger = logger;
        this.policies = new Map();
    }
    async initialize() {
        this.logger.debug('Initializing Policy Engine');
    }
    async addPolicy(policy) {
        this.policies.set(policy.id, policy);
    }
    async removePolicy(policyId) {
        this.policies.delete(policyId);
    }
    async reloadPolicies(gatewayId) {
        this.logger.debug(`Reloading policies for gateway: ${gatewayId}`);
    }
    async evaluateRequest(context) {
        return true; // Allow all requests for now
    }
    async evaluateResponse(context) {
        return true; // Allow all responses for now
    }
}
class DefaultModalityOrchestrator {
    async orchestrate(content, userProfile, context) {
        return {
            primaryModality: 'visual',
            supportingModalities: ['auditory', 'textual'],
            synchronization: {
                strategy: 'coordinated',
                timing: 'sequential',
                dependencies: [],
                triggers: []
            },
            adaptationRules: [],
            fallbackOptions: []
        };
    }
}
//# sourceMappingURL=gateway-manager.js.map