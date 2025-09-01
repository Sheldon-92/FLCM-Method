/**
 * API Gateway and Service Mesh Types
 * Type definitions for API gateway, service mesh, and microservice communication
 */
export interface APIGateway {
    id: string;
    name: string;
    version: string;
    configuration: GatewayConfiguration;
    routes: Route[];
    middleware: Middleware[];
    policies: Policy[];
    plugins: Plugin[];
    health: GatewayHealth;
    metrics: GatewayMetrics;
    status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
    uptime: number;
    lastHealthCheck: Date;
}
export interface GatewayConfiguration {
    host: string;
    port: number;
    protocol: 'http' | 'https' | 'http2';
    ssl: SSLConfiguration;
    cors: CORSConfiguration;
    rateLimit: RateLimitConfiguration;
    authentication: AuthenticationConfiguration;
    authorization: AuthorizationConfiguration;
    logging: LoggingConfiguration;
    monitoring: MonitoringConfiguration;
    clustering: ClusteringConfiguration;
    caching: CachingConfiguration;
    compression: CompressionConfiguration;
    security: SecurityConfiguration;
}
export interface SSLConfiguration {
    enabled: boolean;
    certificate: string;
    privateKey: string;
    certificateChain?: string;
    protocols: string[];
    ciphers: string[];
    dhParams?: string;
    redirect: boolean;
}
export interface CORSConfiguration {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    allowCredentials: boolean;
    maxAge: number;
    preflightContinue: boolean;
}
export interface RateLimitConfiguration {
    enabled: boolean;
    strategy: 'fixed_window' | 'sliding_window' | 'token_bucket' | 'leaky_bucket';
    global: RateLimitRule;
    perRoute: Map<string, RateLimitRule>;
    perClient: RateLimitRule;
    perIP: RateLimitRule;
    headers: RateLimitHeaders;
    storage: RateLimitStorage;
}
export interface RateLimitRule {
    requests: number;
    window: number;
    burst?: number;
    delay?: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: string;
}
export interface RateLimitHeaders {
    total: string;
    remaining: string;
    reset: string;
    retryAfter: string;
}
export interface RateLimitStorage {
    type: 'memory' | 'redis' | 'database';
    settings: Record<string, any>;
    keyPrefix: string;
    cleanupInterval: number;
}
export interface AuthenticationConfiguration {
    strategies: AuthStrategy[];
    default: string;
    bypass: BypassRule[];
    session: SessionConfiguration;
    jwt: JWTConfiguration;
    oauth2: OAuth2Configuration;
    saml: SAMLConfiguration;
}
export interface AuthStrategy {
    name: string;
    type: 'local' | 'jwt' | 'oauth2' | 'saml' | 'api_key' | 'basic' | 'custom';
    enabled: boolean;
    settings: Record<string, any>;
    priority: number;
    fallback?: string;
}
export interface BypassRule {
    path: string;
    method?: string;
    headers?: Record<string, string>;
    reason: string;
}
export interface SessionConfiguration {
    secret: string;
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    store: SessionStore;
}
export interface SessionStore {
    type: 'memory' | 'redis' | 'database';
    settings: Record<string, any>;
    prefix: string;
}
export interface JWTConfiguration {
    secret: string;
    algorithm: string;
    expiresIn: string;
    issuer: string;
    audience: string;
    clockTolerance: number;
    ignoreExpiration: boolean;
    ignoreNotBefore: boolean;
    publicKey?: string;
    privateKey?: string;
}
export interface OAuth2Configuration {
    providers: OAuth2Provider[];
    scopes: string[];
    state: boolean;
    session: boolean;
}
export interface OAuth2Provider {
    name: string;
    clientId: string;
    clientSecret: string;
    authorizationURL: string;
    tokenURL: string;
    userInfoURL: string;
    scope: string[];
    callbackURL: string;
}
export interface SAMLConfiguration {
    entryPoint: string;
    issuer: string;
    callbackUrl: string;
    cert: string;
    privateCert?: string;
    decryptionPvk?: string;
    signatureAlgorithm: string;
    digestAlgorithm: string;
}
export interface AuthorizationConfiguration {
    enabled: boolean;
    model: 'rbac' | 'abac' | 'pbac' | 'custom';
    policies: AuthorizationPolicy[];
    cache: AuthorizationCache;
    enforcement: EnforcementConfiguration;
}
export interface AuthorizationPolicy {
    id: string;
    name: string;
    description: string;
    rules: PolicyRule[];
    effect: 'allow' | 'deny';
    priority: number;
    conditions: PolicyCondition[];
    resources: string[];
}
export interface PolicyRule {
    subject: string;
    resource: string;
    action: string;
    effect: 'allow' | 'deny';
    conditions?: PolicyCondition[];
}
export interface PolicyCondition {
    type: 'time' | 'ip' | 'user_attribute' | 'resource_attribute' | 'custom';
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'regex' | 'custom';
    value: any;
    negate?: boolean;
}
export interface AuthorizationCache {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'lfu' | 'ttl';
}
export interface EnforcementConfiguration {
    mode: 'enforce' | 'monitor' | 'off';
    failureAction: 'deny' | 'allow' | 'log';
    auditEnabled: boolean;
    metricsEnabled: boolean;
}
export interface LoggingConfiguration {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text' | 'combined' | 'common';
    output: LogOutput[];
    sampling: LogSampling;
    correlation: LogCorrelation;
    sensitive: SensitiveDataHandling;
}
export interface LogOutput {
    type: 'console' | 'file' | 'syslog' | 'elasticsearch' | 'custom';
    settings: Record<string, any>;
    filters: LogFilter[];
}
export interface LogFilter {
    field: string;
    condition: string;
    action: 'include' | 'exclude' | 'mask' | 'hash';
}
export interface LogSampling {
    enabled: boolean;
    rate: number;
    maxPerSecond: number;
    strategy: 'random' | 'deterministic' | 'adaptive';
}
export interface LogCorrelation {
    requestId: boolean;
    traceId: boolean;
    spanId: boolean;
    userId: boolean;
    sessionId: boolean;
    customHeaders: string[];
}
export interface SensitiveDataHandling {
    maskPasswords: boolean;
    maskTokens: boolean;
    maskHeaders: string[];
    maskQueryParams: string[];
    maskBodyFields: string[];
    hashSensitive: boolean;
}
export interface MonitoringConfiguration {
    enabled: boolean;
    metrics: MetricConfiguration[];
    healthChecks: HealthCheckConfiguration[];
    alerts: AlertConfiguration[];
    dashboards: DashboardReference[];
}
export interface MetricConfiguration {
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    description: string;
    labels: string[];
    buckets?: number[];
    objectives?: Record<number, number>;
}
export interface HealthCheckConfiguration {
    path: string;
    interval: number;
    timeout: number;
    retries: number;
    threshold: HealthThreshold;
}
export interface HealthThreshold {
    healthy: number;
    unhealthy: number;
}
export interface AlertConfiguration {
    name: string;
    condition: string;
    severity: 'info' | 'warning' | 'critical';
    threshold: number;
    duration: number;
    cooldown: number;
    channels: string[];
}
export interface DashboardReference {
    name: string;
    url: string;
    description: string;
}
export interface ClusteringConfiguration {
    enabled: boolean;
    mode: 'active_passive' | 'active_active' | 'load_balanced';
    nodes: ClusterNode[];
    discovery: ServiceDiscovery;
    consensus: ConsensusConfiguration;
    replication: ReplicationConfiguration;
}
export interface ClusterNode {
    id: string;
    host: string;
    port: number;
    role: 'leader' | 'follower' | 'candidate';
    status: 'active' | 'inactive' | 'suspect' | 'failed';
    lastHeartbeat: Date;
    metadata: Record<string, any>;
}
export interface ServiceDiscovery {
    method: 'static' | 'dns' | 'consul' | 'etcd' | 'kubernetes';
    settings: Record<string, any>;
    healthCheck: boolean;
    refreshInterval: number;
}
export interface ConsensusConfiguration {
    algorithm: 'raft' | 'pbft' | 'custom';
    electionTimeout: number;
    heartbeatInterval: number;
    minClusterSize: number;
}
export interface ReplicationConfiguration {
    factor: number;
    strategy: 'sync' | 'async' | 'quorum';
    timeout: number;
    consistency: 'strong' | 'eventual' | 'weak';
}
export interface CachingConfiguration {
    enabled: boolean;
    provider: CacheProvider;
    policies: CachePolicy[];
    invalidation: CacheInvalidation;
    compression: boolean;
    encryption: boolean;
}
export interface CacheProvider {
    type: 'memory' | 'redis' | 'memcached' | 'custom';
    settings: Record<string, any>;
    clustering: boolean;
    persistence: boolean;
}
export interface CachePolicy {
    pattern: string;
    ttl: number;
    conditions: CacheCondition[];
    vary: string[];
    staleWhileRevalidate: number;
    staleIfError: number;
}
export interface CacheCondition {
    type: 'method' | 'header' | 'query' | 'body' | 'status';
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'regex';
    value: any;
}
export interface CacheInvalidation {
    strategies: string[];
    tags: boolean;
    purgeEndpoint: string;
    events: CacheInvalidationEvent[];
}
export interface CacheInvalidationEvent {
    event: string;
    pattern: string;
    delay: number;
}
export interface CompressionConfiguration {
    enabled: boolean;
    algorithms: string[];
    minSize: number;
    mimeTypes: string[];
    level: number;
}
export interface SecurityConfiguration {
    headers: SecurityHeaders;
    firewall: FirewallConfiguration;
    ddos: DDoSProtection;
    scanner: VulnerabilityScanner;
}
export interface SecurityHeaders {
    hsts: HSTSConfiguration;
    csp: CSPConfiguration;
    frameOptions: string;
    contentTypeOptions: boolean;
    xssProtection: boolean;
    referrerPolicy: string;
    featurePolicy: string;
    permissionsPolicy: string;
}
export interface HSTSConfiguration {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
}
export interface CSPConfiguration {
    enabled: boolean;
    directives: Record<string, string>;
    reportOnly: boolean;
    reportUri: string;
}
export interface FirewallConfiguration {
    enabled: boolean;
    rules: FirewallRule[];
    defaultAction: 'allow' | 'deny';
    logging: boolean;
}
export interface FirewallRule {
    id: string;
    name: string;
    priority: number;
    condition: FirewallCondition;
    action: 'allow' | 'deny' | 'log' | 'challenge';
    comment: string;
}
export interface FirewallCondition {
    ip?: string[];
    country?: string[];
    asn?: number[];
    userAgent?: string;
    headers?: Record<string, string>;
    method?: string[];
    path?: string;
    queryParams?: Record<string, string>;
}
export interface DDoSProtection {
    enabled: boolean;
    thresholds: DDoSThreshold[];
    actions: DDoSAction[];
    whitelist: string[];
    blacklist: string[];
}
export interface DDoSThreshold {
    name: string;
    metric: 'requests_per_second' | 'connections' | 'bandwidth';
    value: number;
    window: number;
    scope: 'global' | 'per_ip' | 'per_path';
}
export interface DDoSAction {
    trigger: string;
    action: 'rate_limit' | 'block' | 'challenge' | 'alert';
    duration: number;
    parameters: Record<string, any>;
}
export interface VulnerabilityScanner {
    enabled: boolean;
    scanners: Scanner[];
    schedule: string;
    alerts: boolean;
    reports: boolean;
}
export interface Scanner {
    name: string;
    type: 'owasp' | 'custom';
    settings: Record<string, any>;
    enabled: boolean;
}
export interface Route {
    id: string;
    name: string;
    pattern: string;
    method: string[];
    upstream: Upstream;
    plugins: string[];
    middleware: string[];
    policies: string[];
    timeout: number;
    retries: number;
    circuitBreaker: CircuitBreakerConfig;
    loadBalancer: LoadBalancerConfig;
    healthCheck: RouteHealthCheck;
    transformations: Transformation[];
    rateLimit: RateLimitRule;
    cache: CachePolicy;
    authentication: RouteAuth;
    authorization: RouteAuthz;
    metadata: RouteMetadata;
}
export interface Upstream {
    id: string;
    name: string;
    protocol: 'http' | 'https' | 'grpc' | 'websocket';
    targets: UpstreamTarget[];
    algorithm: 'round_robin' | 'least_connections' | 'ip_hash' | 'random' | 'weighted';
    healthCheck: UpstreamHealthCheck;
    ssl: UpstreamSSL;
    timeout: UpstreamTimeout;
    keepAlive: KeepAliveConfig;
}
export interface UpstreamTarget {
    id: string;
    host: string;
    port: number;
    weight: number;
    backup: boolean;
    down: boolean;
    metadata: Record<string, any>;
    health: TargetHealth;
}
export interface TargetHealth {
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    failures: number;
    successes: number;
    responseTime: number;
}
export interface UpstreamHealthCheck {
    enabled: boolean;
    path: string;
    method: string;
    interval: number;
    timeout: number;
    retries: number;
    expected: HealthExpectation;
}
export interface HealthExpectation {
    status: number[];
    body?: string;
    headers?: Record<string, string>;
}
export interface UpstreamSSL {
    verify: boolean;
    certificate: string;
    key: string;
    ca: string;
    serverName: string;
}
export interface UpstreamTimeout {
    connect: number;
    send: number;
    receive: number;
}
export interface KeepAliveConfig {
    enabled: boolean;
    idle: number;
    interval: number;
    count: number;
}
export interface CircuitBreakerConfig {
    enabled: boolean;
    threshold: number;
    minRequests: number;
    window: number;
    halfOpenMax: number;
    recovery: number;
}
export interface LoadBalancerConfig {
    algorithm: string;
    healthCheck: boolean;
    stickySessions: boolean;
    sessionCookie: string;
    weights: Record<string, number>;
}
export interface RouteHealthCheck {
    enabled: boolean;
    path: string;
    interval: number;
    timeout: number;
    expectedStatus: number;
}
export interface Transformation {
    id: string;
    type: 'request' | 'response';
    phase: 'pre' | 'post';
    transform: Transform;
}
export interface Transform {
    headers: HeaderTransform;
    body: BodyTransform;
    query: QueryTransform;
    path: PathTransform;
}
export interface HeaderTransform {
    add: Record<string, string>;
    remove: string[];
    rename: Record<string, string>;
    replace: Record<string, string>;
}
export interface BodyTransform {
    type: 'json' | 'xml' | 'text' | 'binary';
    template: string;
    script: string;
    encode: string;
}
export interface QueryTransform {
    add: Record<string, string>;
    remove: string[];
    rename: Record<string, string>;
    replace: Record<string, string>;
}
export interface PathTransform {
    rewrite: PathRewrite[];
    strip: string;
    prepend: string;
}
export interface PathRewrite {
    pattern: string;
    replacement: string;
    flags: string;
}
export interface RouteAuth {
    required: boolean;
    strategies: string[];
    bypass: BypassRule[];
    fallback: string;
}
export interface RouteAuthz {
    required: boolean;
    policies: string[];
    mode: 'all' | 'any';
    fallback: 'allow' | 'deny';
}
export interface RouteMetadata {
    tags: string[];
    description: string;
    documentation: string;
    owner: string;
    version: string;
    deprecated: boolean;
    deprecationDate?: Date;
    replacement?: string;
}
export interface Middleware {
    id: string;
    name: string;
    type: 'request' | 'response' | 'error' | 'authentication' | 'authorization' | 'transformation' | 'custom';
    priority: number;
    enabled: boolean;
    configuration: Record<string, any>;
    conditions: MiddlewareCondition[];
    script?: string;
    version: string;
}
export interface MiddlewareCondition {
    type: 'path' | 'method' | 'header' | 'query' | 'body' | 'ip' | 'user' | 'custom';
    operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'regex' | 'custom';
    value: any;
    negate?: boolean;
}
export interface Policy {
    id: string;
    name: string;
    type: 'rate_limit' | 'quota' | 'security' | 'transformation' | 'custom';
    scope: 'global' | 'route' | 'user' | 'api_key';
    configuration: Record<string, any>;
    conditions: PolicyCondition[];
    enforcement: PolicyEnforcement;
    metrics: PolicyMetrics;
}
export interface PolicyEnforcement {
    mode: 'enforce' | 'monitor' | 'log';
    action: 'allow' | 'deny' | 'throttle' | 'transform';
    response: PolicyResponse;
}
export interface PolicyResponse {
    status: number;
    headers: Record<string, string>;
    body: string;
    contentType: string;
}
export interface PolicyMetrics {
    enabled: boolean;
    counters: string[];
    gauges: string[];
    histograms: string[];
}
export interface Plugin {
    id: string;
    name: string;
    type: 'builtin' | 'custom' | 'lua' | 'wasm' | 'javascript';
    version: string;
    enabled: boolean;
    configuration: Record<string, any>;
    dependencies: PluginDependency[];
    hooks: PluginHook[];
    resources: PluginResource[];
    metadata: PluginMetadata;
}
export interface PluginDependency {
    name: string;
    version: string;
    required: boolean;
    type: 'plugin' | 'library' | 'service';
}
export interface PluginHook {
    phase: 'request' | 'response' | 'error' | 'auth' | 'log';
    priority: number;
    handler: string;
    conditions: PluginCondition[];
}
export interface PluginCondition {
    type: string;
    operator: string;
    value: any;
}
export interface PluginResource {
    type: 'memory' | 'cpu' | 'network' | 'storage';
    limit: number;
    unit: string;
}
export interface PluginMetadata {
    author: string;
    description: string;
    documentation: string;
    license: string;
    tags: string[];
    category: string;
}
export interface GatewayHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    checks: HealthCheckResult[];
    upstreams: UpstreamHealth[];
    resources: ResourceHealth;
    lastCheck: Date;
}
export interface HealthCheckResult {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface UpstreamHealth {
    upstreamId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    targets: TargetHealthSummary[];
    lastCheck: Date;
}
export interface TargetHealthSummary {
    targetId: string;
    status: 'healthy' | 'unhealthy';
    responseTime: number;
    lastCheck: Date;
}
export interface ResourceHealth {
    cpu: number;
    memory: number;
    connections: number;
    goroutines: number;
    threads: number;
}
export interface GatewayMetrics {
    requests: RequestMetrics;
    responses: ResponseMetrics;
    latency: LatencyMetrics;
    throughput: ThroughputMetrics;
    errors: ErrorMetrics;
    upstreams: UpstreamMetrics[];
    resources: ResourceMetrics;
    cache: CacheMetrics;
    security: SecurityMetrics;
}
export interface RequestMetrics {
    total: number;
    rate: number;
    methods: Record<string, number>;
    paths: Record<string, number>;
    userAgents: Record<string, number>;
    countries: Record<string, number>;
}
export interface ResponseMetrics {
    total: number;
    statusCodes: Record<number, number>;
    averageSize: number;
    contentTypes: Record<string, number>;
}
export interface LatencyMetrics {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
    average: number;
    max: number;
    distribution: LatencyBucket[];
}
export interface LatencyBucket {
    le: number;
    count: number;
}
export interface ThroughputMetrics {
    requestsPerSecond: number;
    bytesPerSecond: number;
    connectionsPerSecond: number;
    peak: ThroughputPeak;
}
export interface ThroughputPeak {
    requests: number;
    bytes: number;
    connections: number;
    timestamp: Date;
}
export interface ErrorMetrics {
    total: number;
    rate: number;
    types: Record<string, number>;
    upstreams: Record<string, number>;
    timeouts: number;
    circuitBreaker: number;
}
export interface UpstreamMetrics {
    upstreamId: string;
    requests: number;
    errors: number;
    latency: LatencyMetrics;
    connections: number;
    targets: TargetMetrics[];
}
export interface TargetMetrics {
    targetId: string;
    requests: number;
    errors: number;
    latency: number;
    connections: number;
    weight: number;
}
export interface ResourceMetrics {
    cpu: ResourceMetric;
    memory: ResourceMetric;
    network: NetworkMetric;
    storage: StorageMetric;
    connections: ConnectionMetric;
}
export interface ResourceMetric {
    current: number;
    average: number;
    peak: number;
    unit: string;
}
export interface NetworkMetric {
    bytesIn: ResourceMetric;
    bytesOut: ResourceMetric;
    packetsIn: ResourceMetric;
    packetsOut: ResourceMetric;
}
export interface StorageMetric {
    reads: ResourceMetric;
    writes: ResourceMetric;
    space: ResourceMetric;
    inodes: ResourceMetric;
}
export interface ConnectionMetric {
    active: number;
    idle: number;
    total: number;
    rate: number;
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    hitRatio: number;
    size: number;
    entries: number;
    evictions: number;
    operations: CacheOperationMetrics;
}
export interface CacheOperationMetrics {
    get: number;
    set: number;
    delete: number;
    clear: number;
}
export interface SecurityMetrics {
    attacks: AttackMetrics;
    blocked: BlockedMetrics;
    authenticated: AuthenticationMetrics;
    authorized: AuthorizationMetrics;
}
export interface AttackMetrics {
    total: number;
    types: Record<string, number>;
    sources: Record<string, number>;
    targets: Record<string, number>;
}
export interface BlockedMetrics {
    requests: number;
    ips: number;
    userAgents: number;
    countries: number;
}
export interface AuthenticationMetrics {
    attempts: number;
    successes: number;
    failures: number;
    strategies: Record<string, number>;
}
export interface AuthorizationMetrics {
    checks: number;
    allowed: number;
    denied: number;
    policies: Record<string, number>;
}
export interface ServiceMesh {
    id: string;
    name: string;
    version: string;
    configuration: MeshConfiguration;
    services: MeshService[];
    sidecars: Sidecar[];
    policies: MeshPolicy[];
    observability: MeshObservability;
    security: MeshSecurity;
    traffic: TrafficManagement;
    health: MeshHealth;
    metrics: MeshMetrics;
}
export interface MeshConfiguration {
    mode: 'sidecar' | 'ambient' | 'hybrid';
    dataPlane: DataPlaneConfiguration;
    controlPlane: ControlPlaneConfiguration;
    ingress: IngressConfiguration;
    egress: EgressConfiguration;
    multiCluster: MultiClusterConfiguration;
}
export interface DataPlaneConfiguration {
    proxy: ProxyConfiguration;
    networking: NetworkingConfiguration;
    security: DataPlaneSecurity;
    telemetry: TelemetryConfiguration;
}
export interface ProxyConfiguration {
    type: 'envoy' | 'linkerd' | 'consul_connect' | 'istio';
    version: string;
    resources: ProxyResources;
    settings: Record<string, any>;
}
export interface ProxyResources {
    cpu: string;
    memory: string;
    concurrency: number;
}
export interface NetworkingConfiguration {
    dns: MeshDNSConfiguration;
    loadBalancing: MeshLoadBalancing;
    circuitBreaker: MeshCircuitBreaker;
    retries: MeshRetries;
    timeouts: MeshTimeouts;
}
export interface MeshDNSConfiguration {
    searchDomains: string[];
    nameservers: string[];
    options: string[];
}
export interface MeshLoadBalancing {
    algorithm: 'round_robin' | 'least_request' | 'ring_hash' | 'random' | 'maglev';
    localityPreference: boolean;
    healthyPanicThreshold: number;
}
export interface MeshCircuitBreaker {
    maxConnections: number;
    maxPendingRequests: number;
    maxRequests: number;
    maxRetries: number;
    trackRemaining: boolean;
}
export interface MeshRetries {
    attempts: number;
    perTryTimeout: string;
    retryOn: string[];
    retryRemoteLocalities: boolean;
}
export interface MeshTimeouts {
    request: string;
    connect: string;
    idle: string;
    stream: string;
}
export interface DataPlaneSecurity {
    mtls: MutualTLS;
    authorization: MeshAuthz;
    certificates: CertificateManagement;
}
export interface MutualTLS {
    mode: 'strict' | 'permissive' | 'disabled';
    minProtocolVersion: string;
    maxProtocolVersion: string;
    cipherSuites: string[];
}
export interface MeshAuthz {
    defaultAction: 'allow' | 'deny';
    policies: MeshAuthzPolicy[];
}
export interface MeshAuthzPolicy {
    name: string;
    selector: ServiceSelector;
    rules: AuthzRule[];
}
export interface ServiceSelector {
    matchLabels: Record<string, string>;
    matchExpressions: SelectorExpression[];
}
export interface SelectorExpression {
    key: string;
    operator: 'in' | 'not_in' | 'exists' | 'not_exists';
    values: string[];
}
export interface AuthzRule {
    from: AuthzSource[];
    to: AuthzDestination[];
    when: AuthzCondition[];
}
export interface AuthzSource {
    principals: string[];
    requestPrincipals: string[];
    namespaces: string[];
    ipBlocks: string[];
}
export interface AuthzDestination {
    hosts: string[];
    ports: number[];
    methods: string[];
    paths: string[];
}
export interface AuthzCondition {
    key: string;
    values: string[];
    notValues: string[];
}
export interface CertificateManagement {
    provider: 'builtin' | 'cert_manager' | 'vault' | 'custom';
    rootCA: string;
    intermediateCA: string;
    rotation: CertRotation;
}
export interface CertRotation {
    enabled: boolean;
    gracePeriod: string;
    workloadCertTTL: string;
    caCertTTL: string;
}
export interface TelemetryConfiguration {
    metrics: MeshMetricsConfig;
    tracing: MeshTracingConfig;
    logging: MeshLoggingConfig;
    access: AccessLogging;
}
export interface MeshMetricsConfig {
    providers: MetricsProvider[];
    defaultProviders: string[];
    extensionProviders: ExtensionProvider[];
}
export interface MetricsProvider {
    name: string;
    prometheus: PrometheusConfig;
    datadog: DatadogConfig;
    stackdriver: StackdriverConfig;
}
export interface PrometheusConfig {
    configOverride: Record<string, any>;
    service: string;
    port: number;
}
export interface DatadogConfig {
    address: string;
    port: number;
    tags: Record<string, string>;
}
export interface StackdriverConfig {
    projectId: string;
    configOverride: Record<string, any>;
}
export interface ExtensionProvider {
    name: string;
    prometheusService: PrometheusServiceConfig;
    envoyFileAccessLog: EnvoyFileAccessLogConfig;
    envoyHttpAls: EnvoyHttpAlsConfig;
}
export interface PrometheusServiceConfig {
    service: string;
    port: number;
    path: string;
}
export interface EnvoyFileAccessLogConfig {
    path: string;
    format: string;
    encoding: string;
}
export interface EnvoyHttpAlsConfig {
    service: string;
    port: number;
    logName: string;
}
export interface MeshTracingConfig {
    providers: TracingProvider[];
    defaultProviders: string[];
    sampling: number;
}
export interface TracingProvider {
    name: string;
    jaeger: JaegerConfig;
    zipkin: ZipkinConfig;
    datadog: TracingDatadogConfig;
}
export interface JaegerConfig {
    address: string;
    port: number;
    service: string;
}
export interface ZipkinConfig {
    address: string;
    port: number;
    service: string;
}
export interface TracingDatadogConfig {
    address: string;
    port: number;
    service: string;
}
export interface MeshLoggingConfig {
    providers: LoggingProvider[];
    defaultProviders: string[];
    level: string;
}
export interface LoggingProvider {
    name: string;
    elasticsearch: ElasticsearchConfig;
    fluentd: FluentdConfig;
    cloudLogging: CloudLoggingConfig;
}
export interface ElasticsearchConfig {
    host: string;
    port: number;
    index: string;
    type: string;
}
export interface FluentdConfig {
    host: string;
    port: number;
    tag: string;
}
export interface CloudLoggingConfig {
    projectId: string;
    logId: string;
    labels: Record<string, string>;
}
export interface AccessLogging {
    providers: string[];
    format: string;
    disabled: boolean;
    filter: AccessLogFilter;
}
export interface AccessLogFilter {
    expression: string;
}
export interface ControlPlaneConfiguration {
    components: ControlPlaneComponent[];
    ha: HighAvailabilityConfig;
    persistence: PersistenceConfig;
    scaling: ScalingConfig;
}
export interface ControlPlaneComponent {
    name: string;
    image: string;
    replicas: number;
    resources: ComponentResources;
    affinity: AffinityConfig;
    tolerations: Toleration[];
}
export interface ComponentResources {
    requests: ResourceRequirements;
    limits: ResourceRequirements;
}
export interface ResourceRequirements {
    cpu: string;
    memory: string;
}
export interface AffinityConfig {
    nodeAffinity: NodeAffinity;
    podAffinity: PodAffinity;
    podAntiAffinity: PodAntiAffinity;
}
export interface NodeAffinity {
    requiredDuringSchedulingIgnoredDuringExecution: NodeSelector;
    preferredDuringSchedulingIgnoredDuringExecution: PreferredSchedulingTerm[];
}
export interface NodeSelector {
    nodeSelectorTerms: NodeSelectorTerm[];
}
export interface NodeSelectorTerm {
    matchExpressions: SelectorExpression[];
    matchFields: SelectorExpression[];
}
export interface PreferredSchedulingTerm {
    weight: number;
    preference: NodeSelectorTerm;
}
export interface PodAffinity {
    requiredDuringSchedulingIgnoredDuringExecution: PodAffinityTerm[];
    preferredDuringSchedulingIgnoredDuringExecution: WeightedPodAffinityTerm[];
}
export interface PodAntiAffinity {
    requiredDuringSchedulingIgnoredDuringExecution: PodAffinityTerm[];
    preferredDuringSchedulingIgnoredDuringExecution: WeightedPodAffinityTerm[];
}
export interface PodAffinityTerm {
    labelSelector: LabelSelector;
    namespaces: string[];
    topologyKey: string;
}
export interface WeightedPodAffinityTerm {
    weight: number;
    podAffinityTerm: PodAffinityTerm;
}
export interface LabelSelector {
    matchLabels: Record<string, string>;
    matchExpressions: SelectorExpression[];
}
export interface Toleration {
    key: string;
    operator: 'Equal' | 'Exists';
    value: string;
    effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
    tolerationSeconds: number;
}
export interface HighAvailabilityConfig {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    leaderElection: boolean;
}
export interface PersistenceConfig {
    enabled: boolean;
    storageClass: string;
    size: string;
    backup: BackupConfig;
}
export interface BackupConfig {
    enabled: boolean;
    schedule: string;
    retention: string;
    storage: BackupStorage;
}
export interface BackupStorage {
    type: 's3' | 'gcs' | 'azure' | 'local';
    settings: Record<string, any>;
}
export interface ScalingConfig {
    horizontal: HorizontalScaling;
    vertical: VerticalScaling;
}
export interface HorizontalScaling {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
    metrics: ScalingMetric[];
}
export interface ScalingMetric {
    type: 'Resource' | 'Pods' | 'Object' | 'External';
    resource: ResourceMetricSource;
    pods: PodsMetricSource;
    object: ObjectMetricSource;
    external: ExternalMetricSource;
}
export interface ResourceMetricSource {
    name: string;
    target: MetricTarget;
}
export interface PodsMetricSource {
    metric: MetricIdentifier;
    target: MetricTarget;
}
export interface ObjectMetricSource {
    describedObject: CrossVersionObjectReference;
    metric: MetricIdentifier;
    target: MetricTarget;
}
export interface ExternalMetricSource {
    metric: MetricIdentifier;
    target: MetricTarget;
}
export interface MetricIdentifier {
    name: string;
    selector: LabelSelector;
}
export interface MetricTarget {
    type: 'Utilization' | 'Value' | 'AverageValue';
    value: string;
    averageValue: string;
    averageUtilization: number;
}
export interface CrossVersionObjectReference {
    kind: string;
    name: string;
    apiVersion: string;
}
export interface VerticalScaling {
    enabled: boolean;
    updatePolicy: VPAUpdatePolicy;
    resourcePolicy: VPAResourcePolicy;
}
export interface VPAUpdatePolicy {
    updateMode: 'Off' | 'Initial' | 'Recreation' | 'Auto';
}
export interface VPAResourcePolicy {
    containerPolicies: ContainerResourcePolicy[];
}
export interface ContainerResourcePolicy {
    containerName: string;
    mode: 'Auto' | 'Off';
    minAllowed: ResourceRequirements;
    maxAllowed: ResourceRequirements;
    controlledResources: string[];
}
export interface IngressConfiguration {
    enabled: boolean;
    gateways: IngressGateway[];
    virtualServices: VirtualService[];
    destinationRules: DestinationRule[];
}
export interface IngressGateway {
    name: string;
    selector: Record<string, string>;
    servers: GatewayServer[];
}
export interface GatewayServer {
    port: ServerPort;
    hosts: string[];
    tls: GatewayTLS;
}
export interface ServerPort {
    number: number;
    name: string;
    protocol: string;
}
export interface GatewayTLS {
    mode: 'PASSTHROUGH' | 'SIMPLE' | 'MUTUAL' | 'AUTO_PASSTHROUGH';
    credentialName: string;
    serverCertificate: string;
    privateKey: string;
    caCertificates: string;
}
export interface VirtualService {
    name: string;
    hosts: string[];
    gateways: string[];
    http: HTTPRoute[];
    tls: TLSRoute[];
    tcp: TCPRoute[];
}
export interface HTTPRoute {
    match: HTTPMatchRequest[];
    route: HTTPRouteDestination[];
    redirect: HTTPRedirect;
    rewrite: HTTPRewrite;
    timeout: string;
    retries: HTTPRetry;
    fault: HTTPFaultInjection;
    mirror: Destination;
    corsPolicy: CorsPolicy;
    headers: Headers;
}
export interface HTTPMatchRequest {
    uri: StringMatch;
    scheme: StringMatch;
    method: StringMatch;
    authority: StringMatch;
    headers: Record<string, StringMatch>;
    port: number;
    sourceLabels: Record<string, string>;
    gateways: string[];
    queryParams: Record<string, StringMatch>;
    ignoreUriCase: boolean;
}
export interface StringMatch {
    exact: string;
    prefix: string;
    regex: string;
}
export interface HTTPRouteDestination {
    destination: Destination;
    weight: number;
    headers: Headers;
}
export interface Destination {
    host: string;
    subset: string;
    port: PortSelector;
}
export interface PortSelector {
    number: number;
}
export interface HTTPRedirect {
    uri: string;
    authority: string;
    port: number;
    derivePort: 'FROM_PROTOCOL_DEFAULT' | 'FROM_REQUEST_PORT';
    scheme: string;
    redirectCode: number;
}
export interface HTTPRewrite {
    uri: string;
    authority: string;
}
export interface HTTPRetry {
    attempts: number;
    perTryTimeout: string;
    retryOn: string;
    retryRemoteLocalities: boolean;
    useOriginalRequestHeaders: boolean;
}
export interface HTTPFaultInjection {
    delay: Delay;
    abort: Abort;
}
export interface Delay {
    fixedDelay: string;
    percentage: Percent;
}
export interface Abort {
    httpStatus: number;
    grpcStatus: string;
    http2Error: string;
    percentage: Percent;
}
export interface Percent {
    value: number;
}
export interface CorsPolicy {
    allowOrigins: StringMatch[];
    allowMethods: string[];
    allowHeaders: string[];
    exposeHeaders: string[];
    maxAge: string;
    allowCredentials: boolean;
}
export interface Headers {
    request: HeaderOperations;
    response: HeaderOperations;
}
export interface HeaderOperations {
    set: Record<string, string>;
    add: Record<string, string>;
    remove: string[];
}
export interface TLSRoute {
    match: TLSMatchAttributes[];
    route: RouteDestination[];
}
export interface TLSMatchAttributes {
    sniHosts: string[];
    destinationSubnets: string[];
    port: number;
    sourceLabels: Record<string, string>;
    gateways: string[];
}
export interface RouteDestination {
    destination: Destination;
    weight: number;
}
export interface TCPRoute {
    match: L4MatchAttributes[];
    route: RouteDestination[];
}
export interface L4MatchAttributes {
    destinationSubnets: string[];
    port: number;
    sourceSubnet: string;
    sourceLabels: Record<string, string>;
    gateways: string[];
}
export interface DestinationRule {
    name: string;
    host: string;
    trafficPolicy: TrafficPolicy;
    portLevelSettings: PortTrafficPolicy[];
    subsets: Subset[];
    workloadSelector: WorkloadSelector;
}
export interface TrafficPolicy {
    loadBalancer: LoadBalancerSettings;
    connectionPool: ConnectionPoolSettings;
    outlierDetection: OutlierDetection;
    tls: ClientTLSSettings;
    tunnel: TunnelSettings;
}
export interface LoadBalancerSettings {
    simple: 'ROUND_ROBIN' | 'LEAST_CONN' | 'RANDOM' | 'PASSTHROUGH';
    consistentHash: ConsistentHashLB;
    localityLbSetting: LocalityLoadBalancerSetting;
}
export interface ConsistentHashLB {
    httpHeaderName: string;
    httpCookie: HTTPCookie;
    useSourceIp: boolean;
    httpQueryParameterName: string;
    minimumRingSize: number;
}
export interface HTTPCookie {
    name: string;
    path: string;
    ttl: string;
}
export interface LocalityLoadBalancerSetting {
    distribute: LocalityLoadBalancerDistribute[];
    failover: LocalityLoadBalancerFailover[];
    enabled: boolean;
}
export interface LocalityLoadBalancerDistribute {
    from: string;
    to: Record<string, number>;
}
export interface LocalityLoadBalancerFailover {
    from: string;
    to: string;
}
export interface ConnectionPoolSettings {
    tcp: TCPSettings;
    http: HTTPSettings;
}
export interface TCPSettings {
    maxConnections: number;
    connectTimeout: string;
    tcpNoDelay: boolean;
    tcpKeepalive: TCPKeepalive;
}
export interface TCPKeepalive {
    time: string;
    interval: string;
    probes: number;
}
export interface HTTPSettings {
    http1MaxPendingRequests: number;
    http2MaxRequests: number;
    maxRequestsPerConnection: number;
    maxRetries: number;
    idleTimeout: string;
    h2UpgradePolicy: 'UPGRADE' | 'DO_NOT_UPGRADE';
    useClientProtocol: boolean;
}
export interface OutlierDetection {
    consecutiveGatewayErrors: number;
    consecutive5xxErrors: number;
    interval: string;
    baseEjectionTime: string;
    maxEjectionPercent: number;
    minHealthPercent: number;
    splitExternalLocalOriginErrors: boolean;
}
export interface ClientTLSSettings {
    mode: 'DISABLE' | 'SIMPLE' | 'MUTUAL' | 'ISTIO_MUTUAL';
    clientCertificate: string;
    privateKey: string;
    caCertificates: string;
    credentialName: string;
    subjectAltNames: string[];
    sni: string;
    insecureSkipVerify: boolean;
}
export interface TunnelSettings {
    protocol: string;
    targetHost: string;
    targetPort: number;
}
export interface PortTrafficPolicy {
    port: PortSelector;
    loadBalancer: LoadBalancerSettings;
    connectionPool: ConnectionPoolSettings;
    outlierDetection: OutlierDetection;
    tls: ClientTLSSettings;
}
export interface Subset {
    name: string;
    labels: Record<string, string>;
    trafficPolicy: TrafficPolicy;
}
export interface WorkloadSelector {
    matchLabels: Record<string, string>;
}
export interface EgressConfiguration {
    enabled: boolean;
    outboundTrafficPolicy: OutboundTrafficPolicy;
    serviceEntries: ServiceEntry[];
    sidecars: SidecarConfiguration[];
}
export interface OutboundTrafficPolicy {
    mode: 'REGISTRY_ONLY' | 'ALLOW_ANY';
}
export interface ServiceEntry {
    name: string;
    hosts: string[];
    ports: ServicePort[];
    location: 'MESH_EXTERNAL' | 'MESH_INTERNAL';
    resolution: 'NONE' | 'STATIC' | 'DNS' | 'DNS_ROUND_ROBIN';
    addresses: string[];
    endpoints: WorkloadEntry[];
    workloadSelector: WorkloadSelector;
    subjectAltNames: string[];
}
export interface ServicePort {
    number: number;
    name: string;
    protocol: string;
    targetPort: number;
}
export interface WorkloadEntry {
    address: string;
    ports: Record<string, number>;
    labels: Record<string, string>;
    network: string;
    locality: string;
    weight: number;
    serviceAccount: string;
}
export interface SidecarConfiguration {
    name: string;
    workloadSelector: WorkloadSelector;
    ingress: IstioIngressListener[];
    egress: IstioEgressListener[];
    outboundTrafficPolicy: OutboundTrafficPolicy;
}
export interface IstioIngressListener {
    port: Port;
    bind: string;
    captureMode: 'DEFAULT' | 'IPTABLES' | 'NONE';
    defaultEndpoint: string;
}
export interface Port {
    number: number;
    protocol: string;
    name: string;
}
export interface IstioEgressListener {
    port: Port;
    bind: string;
    captureMode: 'DEFAULT' | 'IPTABLES' | 'NONE';
    hosts: string[];
}
export interface MultiClusterConfiguration {
    enabled: boolean;
    networks: Network[];
    meshNetworks: MeshNetworks;
    crossClusterService: boolean;
}
export interface Network {
    id: string;
    endpoints: NetworkEndpoint[];
    gateways: NetworkGateway[];
}
export interface NetworkEndpoint {
    fromCidr: string;
    fromRegistry: string;
}
export interface NetworkGateway {
    address: string;
    port: number;
    locality: string;
}
export interface MeshNetworks {
    networks: Record<string, MeshNetwork>;
}
export interface MeshNetwork {
    endpoints: MeshNetworkEndpoint[];
    gateways: MeshNetworkGateway[];
}
export interface MeshNetworkEndpoint {
    fromCidr: string;
    fromRegistry: string;
}
export interface MeshNetworkGateway {
    address: string;
    port: number;
    locality: string;
}
export interface MeshService {
    id: string;
    name: string;
    namespace: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
    ports: ServicePort[];
    endpoints: ServiceEndpoint[];
    sidecar: SidecarInfo;
    policies: string[];
    mesh: string;
    health: ServiceHealthInfo;
    metrics: ServiceMetricsInfo;
}
export interface ServiceEndpoint {
    address: string;
    port: number;
    labels: Record<string, string>;
    health: EndpointHealth;
    locality: EndpointLocality;
}
export interface EndpointHealth {
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    checksDuration: number;
}
export interface EndpointLocality {
    region: string;
    zone: string;
    subzone: string;
}
export interface SidecarInfo {
    version: string;
    image: string;
    status: 'running' | 'starting' | 'stopped' | 'error';
    resources: SidecarResources;
    config: SidecarConfig;
}
export interface SidecarResources {
    cpu: string;
    memory: string;
    requests: ResourceRequirements;
    limits: ResourceRequirements;
}
export interface SidecarConfig {
    logLevel: string;
    concurrency: number;
    adminPort: number;
    proxyPort: number;
    statsPort: number;
    discoveryAddress: string;
}
export interface ServiceHealthInfo {
    status: 'healthy' | 'degraded' | 'unhealthy';
    endpoints: EndpointHealthSummary[];
    lastCheck: Date;
}
export interface EndpointHealthSummary {
    address: string;
    status: 'healthy' | 'unhealthy';
    lastCheck: Date;
}
export interface ServiceMetricsInfo {
    requests: ServiceRequestMetrics;
    latency: ServiceLatencyMetrics;
    errors: ServiceErrorMetrics;
    connections: ServiceConnectionMetrics;
}
export interface ServiceRequestMetrics {
    total: number;
    rate: number;
    success: number;
    error: number;
}
export interface ServiceLatencyMetrics {
    p50: number;
    p90: number;
    p99: number;
    average: number;
}
export interface ServiceErrorMetrics {
    rate: number;
    types: Record<string, number>;
}
export interface ServiceConnectionMetrics {
    active: number;
    total: number;
    rate: number;
}
export interface Sidecar {
    id: string;
    podId: string;
    serviceId: string;
    namespace: string;
    version: string;
    config: SidecarConfig;
    status: SidecarStatus;
    health: SidecarHealth;
    metrics: SidecarMetrics;
    certificates: SidecarCertificates;
}
export interface SidecarStatus {
    phase: 'pending' | 'running' | 'succeeded' | 'failed' | 'unknown';
    conditions: SidecarCondition[];
    restartCount: number;
    startTime: Date;
}
export interface SidecarCondition {
    type: 'Initialized' | 'Ready' | 'ContainersReady' | 'PodScheduled';
    status: 'True' | 'False' | 'Unknown';
    lastProbeTime: Date;
    lastTransitionTime: Date;
    reason: string;
    message: string;
}
export interface SidecarHealth {
    ready: boolean;
    live: boolean;
    startup: boolean;
    checks: SidecarHealthCheck[];
}
export interface SidecarHealthCheck {
    type: 'readiness' | 'liveness' | 'startup';
    status: 'pass' | 'fail';
    lastCheck: Date;
    failureCount: number;
}
export interface SidecarMetrics {
    resources: SidecarResourceMetrics;
    network: SidecarNetworkMetrics;
    proxy: SidecarProxyMetrics;
}
export interface SidecarResourceMetrics {
    cpu: number;
    memory: number;
    network: number;
}
export interface SidecarNetworkMetrics {
    connections: number;
    requests: number;
    responses: number;
    bytes: SidecarNetworkBytes;
}
export interface SidecarNetworkBytes {
    in: number;
    out: number;
    total: number;
}
export interface SidecarProxyMetrics {
    clusters: number;
    listeners: number;
    routes: number;
    version: string;
}
export interface SidecarCertificates {
    identity: Certificate;
    root: Certificate;
    intermediate: Certificate[];
}
export interface Certificate {
    serialNumber: string;
    notBefore: Date;
    notAfter: Date;
    subject: string;
    issuer: string;
    dnsNames: string[];
    ipAddresses: string[];
}
export interface MeshPolicy {
    id: string;
    name: string;
    namespace: string;
    type: 'authentication' | 'authorization' | 'security' | 'traffic' | 'telemetry';
    spec: PolicySpec;
    status: PolicyStatus;
    targets: PolicyTarget[];
}
export interface PolicySpec {
    selector: PolicySelector;
    rules: PolicyRule[];
    configuration: Record<string, any>;
}
export interface PolicySelector {
    matchLabels: Record<string, string>;
    matchExpressions: SelectorExpression[];
}
export interface PolicyRule {
    from: PolicyRuleFrom[];
    to: PolicyRuleTo[];
    when: PolicyRuleWhen[];
}
export interface PolicyRuleFrom {
    source: PolicySource;
}
export interface PolicyRuleTo {
    operation: PolicyOperation;
}
export interface PolicyRuleWhen {
    condition: PolicyCondition;
}
export interface PolicySource {
    principals: string[];
    requestPrincipals: string[];
    namespaces: string[];
    ipBlocks: string[];
    remoteIpBlocks: string[];
}
export interface PolicyOperation {
    methods: string[];
    paths: string[];
    hosts: string[];
    ports: string[];
}
export interface PolicyCondition {
    key: string;
    values: string[];
    notValues: string[];
}
export interface PolicyStatus {
    phase: 'pending' | 'applied' | 'failed' | 'unknown';
    message: string;
    lastUpdated: Date;
    observedGeneration: number;
}
export interface PolicyTarget {
    kind: string;
    name: string;
    namespace: string;
}
export interface MeshObservability {
    metrics: MeshMetricsObservability;
    tracing: MeshTracingObservability;
    logging: MeshLoggingObservability;
    topology: MeshTopology;
}
export interface MeshMetricsObservability {
    collectors: MetricsCollector[];
    exporters: MetricsExporter[];
    dashboards: ObservabilityDashboard[];
}
export interface MetricsCollector {
    name: string;
    type: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
    endpoint: string;
    interval: string;
    labels: Record<string, string>;
}
export interface MetricsExporter {
    name: string;
    type: 'prometheus' | 'datadog' | 'stackdriver' | 'custom';
    endpoint: string;
    credentials: ExporterCredentials;
    labels: Record<string, string>;
}
export interface ExporterCredentials {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'service_account';
    config: Record<string, any>;
}
export interface ObservabilityDashboard {
    name: string;
    type: 'grafana' | 'datadog' | 'newrelic' | 'custom';
    url: string;
    panels: DashboardPanel[];
}
export interface DashboardPanel {
    title: string;
    type: 'graph' | 'singlestat' | 'table' | 'heatmap';
    queries: string[];
    refresh: string;
}
export interface MeshTracingObservability {
    collectors: TracingCollector[];
    exporters: TracingExporter[];
    sampling: TracingSampling;
}
export interface TracingCollector {
    name: string;
    type: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
    endpoint: string;
    protocol: string;
}
export interface TracingExporter {
    name: string;
    type: 'jaeger' | 'zipkin' | 'datadog' | 'custom';
    endpoint: string;
    credentials: ExporterCredentials;
}
export interface TracingSampling {
    strategy: 'probabilistic' | 'rate_limiting' | 'adaptive';
    rate: number;
    rules: SamplingRule[];
}
export interface SamplingRule {
    service: string;
    operation: string;
    rate: number;
    maxTracesPerSecond: number;
}
export interface MeshLoggingObservability {
    collectors: LoggingCollector[];
    exporters: LoggingExporter[];
    filters: LoggingFilterRule[];
}
export interface LoggingCollector {
    name: string;
    type: 'fluentd' | 'fluentbit' | 'logstash' | 'custom';
    endpoint: string;
    format: string;
}
export interface LoggingExporter {
    name: string;
    type: 'elasticsearch' | 'splunk' | 'cloudlogging' | 'custom';
    endpoint: string;
    credentials: ExporterCredentials;
    index: string;
}
export interface LoggingFilterRule {
    name: string;
    condition: string;
    action: 'include' | 'exclude' | 'transform';
    transformation: string;
}
export interface MeshTopology {
    services: TopologyService[];
    relationships: ServiceRelationship[];
    clusters: TopologyCluster[];
    namespaces: TopologyNamespace[];
}
export interface TopologyService {
    id: string;
    name: string;
    namespace: string;
    type: 'internal' | 'external' | 'gateway';
    endpoints: number;
    health: 'healthy' | 'degraded' | 'unhealthy';
    traffic: ServiceTrafficInfo;
}
export interface ServiceTrafficInfo {
    inbound: TrafficFlow;
    outbound: TrafficFlow;
}
export interface TrafficFlow {
    requests: number;
    bytes: number;
    errors: number;
    latency: number;
}
export interface ServiceRelationship {
    source: string;
    destination: string;
    protocol: string;
    traffic: TrafficFlow;
    security: SecurityInfo;
}
export interface SecurityInfo {
    mtls: boolean;
    authorized: boolean;
    policies: string[];
}
export interface TopologyCluster {
    id: string;
    name: string;
    services: number;
    health: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
}
export interface TopologyNamespace {
    name: string;
    services: number;
    policies: number;
    health: 'healthy' | 'degraded' | 'unhealthy';
}
export interface MeshSecurity {
    authentication: MeshAuthentication;
    authorization: MeshAuthzSecurity;
    certificates: MeshCertificates;
    policies: SecurityPolicy[];
    threats: ThreatDetection;
}
export interface MeshAuthentication {
    mtls: MutualTLSStatus;
    jwt: JWTValidation;
    external: ExternalAuthentication[];
}
export interface MutualTLSStatus {
    enabled: boolean;
    coverage: number;
    issues: MTLSIssue[];
}
export interface MTLSIssue {
    service: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
}
export interface JWTValidation {
    enabled: boolean;
    providers: JWTProvider[];
    coverage: number;
}
export interface JWTProvider {
    name: string;
    issuer: string;
    audiences: string[];
    jwksUri: string;
}
export interface ExternalAuthentication {
    name: string;
    provider: string;
    services: string[];
    status: 'active' | 'inactive' | 'error';
}
export interface MeshAuthzSecurity {
    enabled: boolean;
    policies: number;
    coverage: number;
    denials: AuthzDenial[];
}
export interface AuthzDenial {
    timestamp: Date;
    source: string;
    destination: string;
    reason: string;
    policy: string;
}
export interface MeshCertificates {
    ca: CertificateAuthority;
    workload: WorkloadCertificates;
    rotation: CertificateRotation;
}
export interface CertificateAuthority {
    type: 'builtin' | 'external';
    rootCert: CertificateInfo;
    intermediateCerts: CertificateInfo[];
    status: 'healthy' | 'expiring' | 'expired' | 'error';
}
export interface CertificateInfo {
    serialNumber: string;
    subject: string;
    issuer: string;
    notBefore: Date;
    notAfter: Date;
    dnsNames: string[];
    status: 'valid' | 'expiring' | 'expired' | 'revoked';
}
export interface WorkloadCertificates {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
    issues: CertificateIssue[];
}
export interface CertificateIssue {
    workload: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    expiry: Date;
}
export interface CertificateRotation {
    enabled: boolean;
    interval: string;
    gracePeriod: string;
    lastRotation: Date;
    nextRotation: Date;
}
export interface SecurityPolicy {
    id: string;
    name: string;
    type: 'network' | 'authentication' | 'authorization' | 'encryption';
    scope: 'mesh' | 'namespace' | 'service';
    status: 'active' | 'inactive' | 'error';
    violations: PolicyViolation[];
}
export interface PolicyViolation {
    timestamp: Date;
    source: string;
    destination: string;
    violation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    action: 'logged' | 'blocked' | 'alerted';
}
export interface ThreatDetection {
    enabled: boolean;
    rules: ThreatRule[];
    alerts: ThreatAlert[];
    statistics: ThreatStatistics;
}
export interface ThreatRule {
    id: string;
    name: string;
    type: 'anomaly' | 'signature' | 'behavioral';
    severity: 'low' | 'medium' | 'high' | 'critical';
    condition: string;
    action: 'log' | 'block' | 'alert';
}
export interface ThreatAlert {
    id: string;
    timestamp: Date;
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    destination: string;
    details: string;
    status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}
export interface ThreatStatistics {
    totalAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    topThreats: TopThreat[];
    falsePositives: number;
}
export interface TopThreat {
    type: string;
    count: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}
export interface TrafficManagement {
    policies: TrafficPolicy[];
    rules: TrafficRule[];
    shaping: TrafficShaping;
    splitting: TrafficSplitting;
    mirroring: TrafficMirroring;
}
export interface TrafficRule {
    id: string;
    name: string;
    type: 'routing' | 'load_balancing' | 'circuit_breaker' | 'timeout' | 'retry';
    selector: RuleSelector;
    configuration: Record<string, any>;
    status: 'active' | 'inactive' | 'error';
}
export interface RuleSelector {
    services: string[];
    namespaces: string[];
    labels: Record<string, string>;
}
export interface TrafficShaping {
    enabled: boolean;
    policies: ShapingPolicy[];
    global: GlobalShaping;
}
export interface ShapingPolicy {
    name: string;
    services: string[];
    limits: TrafficLimits;
    priority: number;
}
export interface TrafficLimits {
    requestsPerSecond: number;
    burstSize: number;
    concurrentRequests: number;
    queueSize: number;
}
export interface GlobalShaping {
    enabled: boolean;
    limits: TrafficLimits;
    enforcement: 'soft' | 'hard';
}
export interface TrafficSplitting {
    enabled: boolean;
    configurations: SplitConfiguration[];
    strategies: SplittingStrategy[];
}
export interface SplitConfiguration {
    service: string;
    destinations: SplitDestination[];
    criteria: SplitCriteria;
}
export interface SplitDestination {
    version: string;
    weight: number;
    subset: string;
}
export interface SplitCriteria {
    type: 'weight' | 'header' | 'cookie' | 'user' | 'custom';
    configuration: Record<string, any>;
}
export interface SplittingStrategy {
    name: string;
    type: 'canary' | 'blue_green' | 'a_b_testing';
    configuration: StrategyConfiguration;
}
export interface StrategyConfiguration {
    stages: SplitStage[];
    success: SuccessCriteria;
    rollback: RollbackCriteria;
}
export interface SplitStage {
    name: string;
    weight: number;
    duration: string;
    metrics: string[];
}
export interface SuccessCriteria {
    metrics: SuccessMetric[];
    duration: string;
    threshold: number;
}
export interface SuccessMetric {
    name: string;
    threshold: number;
    operator: 'less_than' | 'greater_than' | 'equals';
}
export interface RollbackCriteria {
    metrics: RollbackMetric[];
    automatic: boolean;
    threshold: number;
}
export interface RollbackMetric {
    name: string;
    threshold: number;
    operator: 'less_than' | 'greater_than' | 'equals';
}
export interface TrafficMirroring {
    enabled: boolean;
    configurations: MirrorConfiguration[];
    destinations: MirrorDestination[];
}
export interface MirrorConfiguration {
    source: string;
    mirror: string;
    percentage: number;
    filters: MirrorFilter[];
}
export interface MirrorFilter {
    type: 'header' | 'path' | 'method' | 'body';
    condition: string;
    value: string;
}
export interface MirrorDestination {
    service: string;
    version: string;
    subset: string;
    weight: number;
}
export interface MeshHealth {
    overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    controlPlane: ControlPlaneHealth;
    dataPlane: DataPlaneHealth;
    services: ServiceHealthSummary[];
    certificates: CertificateHealth;
    connectivity: ConnectivityHealth;
}
export interface ControlPlaneHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    components: ComponentHealthStatus[];
    leader: string;
    version: string;
}
export interface ComponentHealthStatus {
    name: string;
    status: 'healthy' | 'unhealthy';
    replicas: ReplicaStatus;
    lastCheck: Date;
}
export interface ReplicaStatus {
    desired: number;
    current: number;
    ready: number;
    available: number;
}
export interface DataPlaneHealth {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    sidecars: SidecarHealthSummary;
    proxies: ProxyHealthSummary;
    connectivity: number;
}
export interface SidecarHealthSummary {
    total: number;
    healthy: number;
    unhealthy: number;
    version: VersionDistribution[];
}
export interface VersionDistribution {
    version: string;
    count: number;
    percentage: number;
}
export interface ProxyHealthSummary {
    total: number;
    connected: number;
    disconnected: number;
    errors: number;
}
export interface ServiceHealthSummary {
    service: string;
    namespace: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    endpoints: EndpointHealthSummary[];
}
export interface CertificateHealth {
    status: 'healthy' | 'warning' | 'critical';
    root: CertificateStatus;
    intermediate: CertificateStatus[];
    workload: WorkloadCertificateHealth;
}
export interface CertificateStatus {
    valid: boolean;
    expiry: Date;
    daysUntilExpiry: number;
    status: 'valid' | 'expiring' | 'expired';
}
export interface WorkloadCertificateHealth {
    total: number;
    valid: number;
    expiring: number;
    expired: number;
}
export interface ConnectivityHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    crossCluster: boolean;
    mtlsEnabled: number;
    issues: ConnectivityIssue[];
}
export interface ConnectivityIssue {
    source: string;
    destination: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
}
export interface MeshMetrics {
    overview: MeshOverviewMetrics;
    traffic: MeshTrafficMetrics;
    performance: MeshPerformanceMetrics;
    security: MeshSecurityMetrics;
    resources: MeshResourceMetrics;
}
export interface MeshOverviewMetrics {
    services: number;
    namespaces: number;
    workloads: number;
    sidecars: number;
    policies: number;
    certificates: number;
}
export interface MeshTrafficMetrics {
    total: TrafficMetric;
    internal: TrafficMetric;
    external: TrafficMetric;
    protocols: Record<string, TrafficMetric>;
}
export interface TrafficMetric {
    requests: number;
    bytes: number;
    connections: number;
    rate: number;
}
export interface MeshPerformanceMetrics {
    latency: MeshLatencyMetrics;
    throughput: MeshThroughputMetrics;
    errors: MeshErrorMetrics;
    availability: MeshAvailabilityMetrics;
}
export interface MeshLatencyMetrics {
    p50: number;
    p90: number;
    p99: number;
    average: number;
    byService: Record<string, number>;
}
export interface MeshThroughputMetrics {
    requestsPerSecond: number;
    bytesPerSecond: number;
    peak: number;
    byService: Record<string, number>;
}
export interface MeshErrorMetrics {
    total: number;
    rate: number;
    byStatus: Record<number, number>;
    byService: Record<string, number>;
}
export interface MeshAvailabilityMetrics {
    overall: number;
    byService: Record<string, number>;
    uptime: number;
    incidents: number;
}
export interface MeshSecurityMetrics {
    mtlsAdoption: number;
    authenticationFailures: number;
    authorizationDenials: number;
    certificateIssues: number;
    threats: ThreatMetrics;
}
export interface ThreatMetrics {
    detected: number;
    blocked: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
}
export interface MeshResourceMetrics {
    controlPlane: ResourceUsageMetrics;
    dataPlane: ResourceUsageMetrics;
    total: ResourceUsageMetrics;
}
export interface ResourceUsageMetrics {
    cpu: ResourceMetric;
    memory: ResourceMetric;
    network: NetworkResourceMetric;
    storage: ResourceMetric;
}
export interface NetworkResourceMetric {
    bandwidth: ResourceMetric;
    connections: ResourceMetric;
    packets: ResourceMetric;
}
export interface APIGatewayManager {
    createGateway(config: GatewayConfiguration): Promise<APIGateway>;
    updateGateway(gatewayId: string, config: Partial<GatewayConfiguration>): Promise<APIGateway>;
    deleteGateway(gatewayId: string): Promise<void>;
    getGateway(gatewayId: string): Promise<APIGateway>;
    listGateways(): Promise<APIGateway[]>;
    getGatewayHealth(gatewayId: string): Promise<GatewayHealth>;
    getGatewayMetrics(gatewayId: string): Promise<GatewayMetrics>;
    addRoute(gatewayId: string, route: Route): Promise<void>;
    updateRoute(gatewayId: string, routeId: string, route: Partial<Route>): Promise<void>;
    deleteRoute(gatewayId: string, routeId: string): Promise<void>;
    addMiddleware(gatewayId: string, middleware: Middleware): Promise<void>;
    updateMiddleware(gatewayId: string, middlewareId: string, middleware: Partial<Middleware>): Promise<void>;
    deleteMiddleware(gatewayId: string, middlewareId: string): Promise<void>;
    addPlugin(gatewayId: string, plugin: Plugin): Promise<void>;
    updatePlugin(gatewayId: string, pluginId: string, plugin: Partial<Plugin>): Promise<void>;
    deletePlugin(gatewayId: string, pluginId: string): Promise<void>;
}
export interface ServiceMeshManager {
    deployMesh(config: MeshConfiguration): Promise<ServiceMesh>;
    updateMesh(meshId: string, config: Partial<MeshConfiguration>): Promise<ServiceMesh>;
    deleteMesh(meshId: string): Promise<void>;
    getMesh(meshId: string): Promise<ServiceMesh>;
    getMeshHealth(meshId: string): Promise<MeshHealth>;
    getMeshMetrics(meshId: string): Promise<MeshMetrics>;
    onboardService(meshId: string, service: MeshService): Promise<void>;
    offboardService(meshId: string, serviceId: string): Promise<void>;
    addPolicy(meshId: string, policy: MeshPolicy): Promise<void>;
    updatePolicy(meshId: string, policyId: string, policy: Partial<MeshPolicy>): Promise<void>;
    deletePolicy(meshId: string, policyId: string): Promise<void>;
    getServiceTopology(meshId: string): Promise<MeshTopology>;
    getServiceMetrics(meshId: string, serviceId: string): Promise<ServiceMetricsInfo>;
    updateTrafficPolicy(meshId: string, serviceId: string, policy: TrafficPolicy): Promise<void>;
    createVirtualService(meshId: string, virtualService: VirtualService): Promise<void>;
    updateVirtualService(meshId: string, serviceId: string, virtualService: Partial<VirtualService>): Promise<void>;
    deleteVirtualService(meshId: string, serviceId: string): Promise<void>;
    createDestinationRule(meshId: string, rule: DestinationRule): Promise<void>;
    updateDestinationRule(meshId: string, ruleId: string, rule: Partial<DestinationRule>): Promise<void>;
    deleteDestinationRule(meshId: string, ruleId: string): Promise<void>;
}
